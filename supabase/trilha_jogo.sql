-- ═══════════════════════════════════════════════════════════════════════
-- Trilha: Expedição (jogo) e forças — migração "trilha_jogo"
-- NÃO aplicada ainda. Depende de supabase/trilha.sql (já aplicada).
--
-- O que faz
--   1. trilha_sanear passa a aceitar as ferramentas novas nas tarefas da profissional:
--      forcas, forca, recursos.
--   2. projecao_trilha passa a incluir:
--        jogo   { xp (soma das chaves de pontos), miss { módulo: nº de etapas 0–3 }, med [ids de medalhas] }
--        forcas { top [ids], dev [ids], t { ex_id, uso_id } só com com_textos }
--      Lista branca, como no resto: só números, ids no formato a-z0-9_- e textos com permissão.
--   Nunca projetados: trilha_rev (revisão espaçada), trilha_recursos (mochila pessoal), trilha_sos, trilha_agenda.
-- Obs.: os apps já gravam as novas chaves em app_dados (jsonb livre); sem esta migração elas são
-- simplesmente ignoradas pelo painel.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.trilha_sanear(c jsonb) returns jsonb
language plpgsql stable set search_path = '' as $fn$
declare
  ferramentas text[] := array['checkin','respirar','aterrar','detetive','experimento','escada','carta','agenda','sos','plano','semanal','forcas','forca','recursos'];
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

create or replace function public.projecao_trilha(chaves jsonb, com_textos boolean) returns jsonb
language plpgsql immutable set search_path = '' as $fn$
declare
  regs jsonb := coalesce((chaves->>'trilha_regs')::jsonb, '[]'::jsonb);
  sem  jsonb := coalesce((chaves->>'trilha_semanal')::jsonb, '[]'::jsonb);
  esc  jsonb := coalesce((chaves->>'trilha_escada')::jsonb, '[]'::jsonb);
  fei  jsonb := coalesce((chaves->>'trilha_feitos')::jsonb, '{}'::jsonb);
  lid  jsonb := coalesce((chaves->>'trilha_lidos')::jsonb, '{}'::jsonb);
  pln  jsonb := coalesce((chaves->>'trilha_plano')::jsonb, '{}'::jsonb);
  jg   jsonb := coalesce((chaves->>'trilha_jogo')::jsonb, '{}'::jsonb);
  fc   jsonb := coalesce((chaves->>'trilha_forcas')::jsonb, '{}'::jsonb);
  r_regs jsonb; r_sem jsonb; r_esc jsonb; r_fei jsonb; r_lid jsonb; r_pln jsonb; r_jg jsonb; r_fc jsonb;
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

  r_pln := jsonb_build_object('preenchido', (jsonb_typeof(pln->'t') = 'object' and pln->'t' <> '{}'::jsonb),
                              'ts', case when jsonb_typeof(pln->'ts') = 'number' then pln->'ts' end)
           || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(pln->'t')) else '{}'::jsonb end;

  -- Jogo: só agregados numéricos (energia total, etapas por módulo) e ids de medalhas.
  r_jg := jsonb_build_object(
    'xp', coalesce((select sum((v)::numeric)
                    from jsonb_each(case when jsonb_typeof(jg->'pts') = 'object' then jg->'pts' else '{}'::jsonb end) t(k, v)
                    where jsonb_typeof(v) = 'number'), 0),
    'miss', (select coalesce(jsonb_object_agg(k, n), '{}'::jsonb) from (
               select k, (select count(*) from jsonb_each(v) x(kk, vv) where kk in ('a', 't', 'p') and jsonb_typeof(vv) = 'number') as n
               from jsonb_each(case when jsonb_typeof(jg->'miss') = 'object' then jg->'miss' else '{}'::jsonb end) t(k, v)
               where k ~ '^[0-9]{1,2}$' and jsonb_typeof(v) = 'object') q),
    'med', (select coalesce(jsonb_agg(k), '[]'::jsonb)
            from jsonb_each(case when jsonb_typeof(jg->'med') = 'object' then jg->'med' else '{}'::jsonb end) t(k, v)
            where jsonb_typeof(v) = 'number' and k ~ '^[a-z0-9_]{1,30}$'));

  -- Forças: ids das escolhidas; exemplos e usos escritos só com permissão de textos.
  r_fc := jsonb_build_object(
    'top', (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(fc->'top') = 'array' then fc->'top' else '[]'::jsonb end) e
            where jsonb_typeof(e) = 'string' and (e #>> '{}') ~ '^[a-z0-9_]{1,30}$'),
    'dev', (select coalesce(jsonb_agg(e), '[]'::jsonb) from jsonb_array_elements(case when jsonb_typeof(fc->'dev') = 'array' then fc->'dev' else '[]'::jsonb end) e
            where jsonb_typeof(e) = 'string' and (e #>> '{}') ~ '^[a-z0-9_]{1,30}$'))
    || case when com_textos then jsonb_build_object('t', public.trilha_so_textos(fc->'t')) else '{}'::jsonb end;

  return jsonb_strip_nulls(jsonb_build_object(
    'registros', r_regs, 'semanal', r_sem, 'escada', r_esc, 'feitos', r_fei, 'lidos', r_lid, 'plano', r_pln,
    'jogo', r_jg, 'forcas', r_fc));
end; $fn$;
revoke all on function public.projecao_trilha(jsonb, boolean) from public, anon, authenticated;

notify pgrst, 'reload schema';
