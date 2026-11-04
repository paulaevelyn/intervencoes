-- ═══════════════════════════════════════════════════════════════════════
-- Trilha (saúde mental de adolescentes, terapia online)
-- Migração "trilha" — APLICADA em 2026-11-04 no projeto Intervenções (ref qhjdhlrmmopgucseprkb),
-- seguida da correção "trilha_sanear_regex_link" (limite de 255 repetições do regex de link, já refletida abaixo).
--
-- O que faz
--   1. app_dados passa a aceitar app = 'trilha'.
--   2. trilha_orientacoes: o que a PROFISSIONAL escreve para o adolescente
--      (módulo atual, próximas sessões com link, tarefas). O adolescente só lê.
--   3. trilha_sanear: lista branca do que a profissional pode gravar
--      (link só https, tamanhos limitados, ferramentas conhecidas).
--   4. projecao_trilha: lista branca do que o painel pode ver dos registros do
--      adolescente. Textos livres só saem com a permissão dele (com_textos).
--   5. painel_dados passa a despachar 'trilha'.
--   6. painel_trilha_ler / painel_trilha_salvar: único caminho da profissional
--      até as orientações, e só para quem tem vínculo.
--
-- Princípios mantidos: a segurança vive aqui (RLS e funções), não no JS; campo
-- novo no app NÃO vaza por engano; o adolescente decide o que compartilha.
-- Os responsáveis não têm acesso ao sistema (decisão de escopo da v1).
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. app_dados aceita 'trilha' ───────────────────────────────────────
alter table public.app_dados drop constraint app_dados_app_check;
alter table public.app_dados add constraint app_dados_app_check
  check (app = any (array['farol','floresca','matiz','seguranca-interna','aurora','sintonia','trilha']));

-- ── 2. Orientações da profissional para o adolescente ──────────────────
create table public.trilha_orientacoes (
  paciente_id     uuid primary key references auth.users(id) on delete cascade,
  profissional_id uuid not null references public.profissionais(user_id) on delete cascade,
  conteudo        jsonb not null default '{}'::jsonb check (pg_column_size(conteudo) < 200000),
  atualizado_em   timestamptz not null default now()
);
alter table public.trilha_orientacoes enable row level security;
revoke all on public.trilha_orientacoes from anon, authenticated;
grant select on public.trilha_orientacoes to authenticated;
-- O adolescente lê as próprias orientações. A profissional NÃO lê direto: usa painel_trilha_ler.
create policy "o adolescente lê as próprias orientações" on public.trilha_orientacoes
  for select to authenticated using (paciente_id = auth.uid());

-- ── 3. Lista branca do que a profissional pode gravar ──────────────────
-- Forma do conteúdo:
--   { "modulo": 1..13,
--     "sessoes": [ { "id", "inicio" (timestamptz), "link" (https), "combinados" } ],
--     "tarefas": [ { "id", "modulo", "ferramenta", "titulo", "instrucao", "ate" (date) } ] }
-- Nada fora disso é gravado. Links que não começam com https:// são descartados
-- (evita javascript: e afins).
create function public.trilha_sanear(c jsonb) returns jsonb
language plpgsql stable set search_path = '' as $fn$
declare
  ferramentas text[] := array['checkin','respirar','aterrar','detetive','experimento','escada','carta','agenda','sos','plano','semanal'];
  sessoes jsonb := '[]'::jsonb;
  tarefas jsonb := '[]'::jsonb;
  s jsonb; t jsonb; m int; ini timestamptz; ate date; link text; fer text; tit text;
begin
  if c is null or jsonb_typeof(c) <> 'object' then return '{}'::jsonb; end if;

  m := case when (c->>'modulo') ~ '^[0-9]{1,2}$' and (c->>'modulo')::int between 1 and 13
            then (c->>'modulo')::int end;

  for s in select e from jsonb_array_elements(
             case when jsonb_typeof(c->'sessoes') = 'array' then c->'sessoes' else '[]'::jsonb end) e limit 60 loop
    begin ini := (s->>'inicio')::timestamptz; exception when others then ini := null; end;
    continue when ini is null or coalesce(s->>'id', '') !~ '^[a-z0-9_-]{1,40}$';
    link := s->>'link';
    -- Postgres limita repetições de regex a 255; por isso o tamanho é checado à parte
    if link is null or length(link) > 300 or link !~ '^https://[A-Za-z0-9._~:/?#@!$&()*+,;=%-]+$' then link := null; end if;
    sessoes := sessoes || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id', s->>'id', 'inicio', ini, 'link', link,
      'combinados', left(coalesce(s->>'combinados', ''), 1000))));
  end loop;

  for t in select e from jsonb_array_elements(
             case when jsonb_typeof(c->'tarefas') = 'array' then c->'tarefas' else '[]'::jsonb end) e limit 100 loop
    tit := left(btrim(coalesce(t->>'titulo', '')), 120);
    continue when tit = '' or coalesce(t->>'id', '') !~ '^[a-z0-9_-]{1,40}$';
    begin ate := (t->>'ate')::date; exception when others then ate := null; end;
    fer := case when (t->>'ferramenta') = any (ferramentas) then t->>'ferramenta' end;
    tarefas := tarefas || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'id', t->>'id', 'titulo', tit, 'ferramenta', fer, 'ate', ate,
      'modulo', case when (t->>'modulo') ~ '^[0-9]{1,2}$' and (t->>'modulo')::int between 1 and 13 then (t->>'modulo')::int end,
      'instrucao', left(coalesce(t->>'instrucao', ''), 1000))));
  end loop;

  return jsonb_strip_nulls(jsonb_build_object('modulo', m, 'sessoes', sessoes, 'tarefas', tarefas));
end; $fn$;
revoke all on function public.trilha_sanear(jsonb) from public, anon, authenticated;

-- ── 4. Projeção dos registros do adolescente (lista branca) ────────────
-- Auxiliares: o que for número, lista de ids ou texto é separado desde o app
-- (registro = { id, ts, date, f, n:{números}, c:{listas de ids}, t:{textos} }).
create function public.trilha_so_numeros(o jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
  from jsonb_each(case when jsonb_typeof(o) = 'object' then o else '{}'::jsonb end) as t(k, v)
  where jsonb_typeof(v) = 'number' and k ~ '^[a-z0-9_]{1,30}$';
$$;
create function public.trilha_so_listas(o jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(k, (
           select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(v) e
           where jsonb_typeof(e) = 'string' and (e #>> '{}') ~ '^[a-z0-9_-]{1,30}$')), '{}'::jsonb)
  from jsonb_each(case when jsonb_typeof(o) = 'object' then o else '{}'::jsonb end) as t(k, v)
  where jsonb_typeof(v) = 'array' and k ~ '^[a-z0-9_]{1,30}$';
$$;
create function public.trilha_so_textos(o jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(k, left(v #>> '{}', 2000)), '{}'::jsonb)
  from jsonb_each(case when jsonb_typeof(o) = 'object' then o else '{}'::jsonb end) as t(k, v)
  where jsonb_typeof(v) = 'string' and k ~ '^[a-z0-9_]{1,30}$';
$$;
revoke all on function public.trilha_so_numeros(jsonb), public.trilha_so_listas(jsonb), public.trilha_so_textos(jsonb)
  from public, anon, authenticated;

-- Chaves do app: trilha_regs, trilha_semanal, trilha_escada, trilha_feitos, trilha_lidos, trilha_plano.
-- "Números" = tudo que não é texto livre (inclui o item de risco do balanço semanal, de propósito:
-- a profissional precisa ver). "Textos" só com com_textos.
create function public.projecao_trilha(chaves jsonb, com_textos boolean) returns jsonb
language plpgsql immutable set search_path = '' as $fn$
declare
  regs jsonb := coalesce((chaves->>'trilha_regs')::jsonb, '[]'::jsonb);
  sem  jsonb := coalesce((chaves->>'trilha_semanal')::jsonb, '[]'::jsonb);
  esc  jsonb := coalesce((chaves->>'trilha_escada')::jsonb, '[]'::jsonb);
  fei  jsonb := coalesce((chaves->>'trilha_feitos')::jsonb, '{}'::jsonb);
  lid  jsonb := coalesce((chaves->>'trilha_lidos')::jsonb, '{}'::jsonb);
  pln  jsonb := coalesce((chaves->>'trilha_plano')::jsonb, '{}'::jsonb);
  r_regs jsonb; r_sem jsonb; r_esc jsonb; r_fei jsonb; r_lid jsonb; r_pln jsonb;
begin
  r_regs := (select coalesce(jsonb_agg(x order by (x->>'ts')::numeric), '[]'::jsonb) from (
    select jsonb_build_object('ts', e->'ts', 'date', e->>'date', 'f', e->>'f',
             'n', public.trilha_so_numeros(e->'n'), 'c', public.trilha_so_listas(e->'c'))
           || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(e->'t')) else '{}'::jsonb end as x
    from jsonb_array_elements(case when jsonb_typeof(regs) = 'array' then regs else '[]'::jsonb end) e
    where (e->>'f') ~ '^[a-z0-9_]{1,20}$' and (e->>'date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' and jsonb_typeof(e->'ts') = 'number'
    order by (e->>'ts')::numeric desc limit 1000) q);

  r_sem := (select coalesce(jsonb_agg(x order by x->>'key'), '[]'::jsonb) from (
    select jsonb_build_object('key', e->>'key', 'ts', e->'ts', 'n', public.trilha_so_numeros(e->'n'))
           || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(e->'t')) else '{}'::jsonb end as x
    from jsonb_array_elements(case when jsonb_typeof(sem) = 'array' then sem else '[]'::jsonb end) e
    where (e->>'key') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    order by e->>'key' desc limit 104) q);

  r_esc := (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', e->>'id', 'n', public.trilha_so_numeros(e->'n'),
             'tentativas', (select coalesce(jsonb_agg(jsonb_build_object('ts', a->'ts', 'n', public.trilha_so_numeros(a->'n'))), '[]'::jsonb)
                            from jsonb_array_elements(case when jsonb_typeof(e->'tentativas') = 'array' then e->'tentativas' else '[]'::jsonb end) a))
           || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(e->'t')) else '{}'::jsonb end as x
    from jsonb_array_elements(case when jsonb_typeof(esc) = 'array' then esc else '[]'::jsonb end) e
    where (e->>'id') ~ '^[a-z0-9_-]{1,40}$' limit 50) q);

  r_fei := (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
            from jsonb_each(case when jsonb_typeof(fei) = 'object' then fei else '{}'::jsonb end) t(k, v)
            where jsonb_typeof(v) = 'number' and k ~ '^[a-z0-9_-]{1,40}$');
  r_lid := (select coalesce(jsonb_object_agg(k, v), '{}'::jsonb)
            from jsonb_each(case when jsonb_typeof(lid) = 'object' then lid else '{}'::jsonb end) t(k, v)
            where jsonb_typeof(v) = 'number' and k ~ '^[0-9]{1,2}$');

  -- Plano de segurança: sem permissão de textos, a profissional só sabe se existe e quando foi atualizado.
  r_pln := jsonb_build_object('preenchido', (jsonb_typeof(pln->'t') = 'object' and pln->'t' <> '{}'::jsonb),
                              'ts', case when jsonb_typeof(pln->'ts') = 'number' then pln->'ts' end)
           || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(pln->'t')) else '{}'::jsonb end;

  return jsonb_strip_nulls(jsonb_build_object(
    'registros', r_regs, 'semanal', r_sem, 'escada', r_esc, 'feitos', r_fei, 'lidos', r_lid, 'plano', r_pln));
end; $fn$;
revoke all on function public.projecao_trilha(jsonb, boolean) from public, anon, authenticated;

-- ── 5. painel_dados passa a despachar 'trilha' (definição vigente + 1 app) ──
create or replace function public.painel_dados(p_paciente uuid, p_app text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.vinculos; bruto jsonb; chaves jsonb;
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  select * into v from public.vinculos where profissional_id = auth.uid() and paciente_id = p_paciente;
  if not found or not v.compartilha_numeros then
    raise exception 'o paciente não compartilhou estes dados' using errcode = '42501';
  end if;
  if p_app not in ('farol', 'floresca', 'matiz', 'seguranca-interna', 'aurora', 'sintonia', 'trilha') then
    raise exception 'app ainda sem painel: %', p_app using errcode = '0A000';
  end if;

  select valor into bruto from public.app_dados where user_id = p_paciente and app = p_app;
  if bruto is null then return null; end if;
  chaves := bruto->'chaves';
  if chaves is null then return null; end if;

  insert into public.acessos_painel (profissional_id, paciente_id, app, com_textos)
    values (auth.uid(), p_paciente, p_app, v.compartilha_textos);

  return case p_app
    when 'farol'    then public.projecao_farol((chaves->>'np_v4')::jsonb, v.compartilha_textos)
    when 'floresca' then public.projecao_floresca((chaves->>'floresca_v1')::jsonb, v.compartilha_textos)
    when 'matiz'    then public.projecao_matiz(chaves, v.compartilha_textos)
    when 'seguranca-interna' then public.projecao_seguranca_interna(chaves, v.compartilha_textos)
    when 'aurora'   then public.projecao_aurora(chaves, v.compartilha_textos)
    when 'sintonia' then public.projecao_sintonia(chaves, v.compartilha_textos)
    when 'trilha'   then public.projecao_trilha(chaves, v.compartilha_textos)
  end;
end; $$;

-- ── 6. Orientações: leitura e gravação pela profissional ───────────────
create function public.painel_trilha_ler(p_paciente uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  if not exists (select 1 from public.vinculos where profissional_id = auth.uid() and paciente_id = p_paciente) then
    raise exception 'sem vínculo com esta pessoa' using errcode = '42501';
  end if;
  return coalesce((select conteudo from public.trilha_orientacoes where paciente_id = p_paciente), '{}'::jsonb);
end; $$;

create function public.painel_trilha_salvar(p_paciente uuid, p_conteudo jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare limpo jsonb;
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  if not exists (select 1 from public.vinculos where profissional_id = auth.uid() and paciente_id = p_paciente) then
    raise exception 'sem vínculo com esta pessoa' using errcode = '42501';
  end if;
  limpo := public.trilha_sanear(p_conteudo);
  insert into public.trilha_orientacoes (paciente_id, profissional_id, conteudo)
    values (p_paciente, auth.uid(), limpo)
  on conflict (paciente_id) do update
    set conteudo = excluded.conteudo, atualizado_em = now()
    where public.trilha_orientacoes.profissional_id = auth.uid();
  if not found then raise exception 'esta pessoa é acompanhada por outra profissional' using errcode = '42501'; end if;
  return limpo;
end; $$;

revoke all on function public.painel_trilha_ler(uuid), public.painel_trilha_salvar(uuid, jsonb) from public, anon;
grant execute on function public.painel_trilha_ler(uuid), public.painel_trilha_salvar(uuid, jsonb) to authenticated;

notify pgrst, 'reload schema';
