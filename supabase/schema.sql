-- ═══════════════════════════════════════════════════════════════════════
-- Banco do projeto Supabase "Intervenções" (ref qhjdhlrmmopgucseprkb, sa-east-1)
-- Espelho do que foi aplicado por migração. Serve de documentação e para
-- recriar o banco do zero. A segurança vive aqui (RLS e funções), não no JS.
--
-- Modelo:
--   app_dados        estado de cada app, uma linha por pessoa e app (RLS: só o dono)
--   profissionais    quem pode ter pacientes (entra-se só por migração)
--   vinculos         paciente <-> profissional + as duas permissões do paciente
--   acessos_painel   registro de quando o profissional olhou (o paciente vê)
--   funções painel_* o ÚNICO caminho do profissional até os dados, já filtrados
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Dados de cada app ───────────────────────────────────────────────
create table if not exists public.app_dados (
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app            text not null check (app in ('farol','floresca','matiz','seguranca-interna')),
  valor          jsonb not null default '{}'::jsonb check (pg_column_size(valor) < 2000000),
  atualizado_em  timestamptz not null default now(),
  primary key (user_id, app)
);
alter table public.app_dados enable row level security;
create policy "cada pessoa lê os próprios dados" on public.app_dados
  for select to authenticated using (auth.uid() = user_id);
create policy "cada pessoa insere os próprios dados" on public.app_dados
  for insert to authenticated with check (auth.uid() = user_id);
create policy "cada pessoa edita os próprios dados" on public.app_dados
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cada pessoa apaga os próprios dados" on public.app_dados
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.apagar_minha_conta()
returns void language sql security definer set search_path = ''
as $$ delete from auth.users where id = auth.uid(); $$;
revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;

-- ── 2. Profissionais, vínculos e permissões do paciente ────────────────
create table public.profissionais (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  nome      text not null,
  criado_em timestamptz not null default now()
);
alter table public.profissionais enable row level security;
revoke all on public.profissionais from anon, authenticated;
grant select on public.profissionais to authenticated;

create table public.vinculos (
  id                  uuid primary key default gen_random_uuid(),
  profissional_id     uuid not null references public.profissionais(user_id) on delete cascade,
  paciente_id         uuid not null references auth.users(id) on delete cascade,
  compartilha_numeros boolean not null default false,
  compartilha_textos  boolean not null default false,
  criado_em           timestamptz not null default now(),
  alterado_em         timestamptz not null default now(),
  unique (profissional_id, paciente_id),
  check (profissional_id <> paciente_id),
  check (not compartilha_textos or compartilha_numeros)
);
alter table public.vinculos enable row level security;
revoke all on public.vinculos from anon, authenticated;
grant select, delete on public.vinculos to authenticated;
grant update (compartilha_numeros, compartilha_textos) on public.vinculos to authenticated; -- o paciente só mexe nisto

create policy "vê o próprio vínculo" on public.vinculos
  for select to authenticated using (paciente_id = auth.uid() or profissional_id = auth.uid());
create policy "paciente muda as próprias permissões" on public.vinculos
  for update to authenticated using (paciente_id = auth.uid()) with check (paciente_id = auth.uid());
create policy "qualquer lado encerra o vínculo" on public.vinculos
  for delete to authenticated using (paciente_id = auth.uid() or profissional_id = auth.uid());
create policy "profissional vê a si e o paciente vê o seu" on public.profissionais
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.vinculos v where v.profissional_id = profissionais.user_id and v.paciente_id = auth.uid()));

create function public.carimbar_alteracao() returns trigger
language plpgsql set search_path = '' as $$
begin new.alterado_em := now(); return new; end; $$;
create trigger vinculos_alterado before update on public.vinculos
  for each row execute function public.carimbar_alteracao();

create table public.acessos_painel (
  id              bigint generated always as identity primary key,
  profissional_id uuid not null,
  paciente_id     uuid not null references auth.users(id) on delete cascade,
  app             text not null,
  com_textos      boolean not null,
  quando          timestamptz not null default now()
);
alter table public.acessos_painel enable row level security;
revoke all on public.acessos_painel from anon, authenticated;
grant select on public.acessos_painel to authenticated;
create policy "paciente e profissional veem os acessos" on public.acessos_painel
  for select to authenticated using (paciente_id = auth.uid() or profissional_id = auth.uid());

-- ── 3. Projeção por app: lista BRANCA do que o painel pode ver ─────────
-- Campo novo no app NÃO vaza por engano: só passa o que está listado aqui.
-- Textos livres só saem quando o paciente liberou (com_textos).
create function public.projecao_farol(estado jsonb, com_textos boolean) returns jsonb
language sql immutable set search_path = '' as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'pretest', estado->'pretest', 'posttest', estado->'posttest', 'xp', estado->'xp',
    'userProfile', estado->'userProfile', 'analytics', estado->'analytics',
    'moduleProgress', (
      select coalesce(jsonb_object_agg(t.k, jsonb_build_object('steps', t.v->'steps', 'done', t.v->'done')), '{}'::jsonb)
      from jsonb_each(coalesce(estado->'moduleProgress', '{}'::jsonb)) as t(k, v)),
    'entries', (
      select coalesce(jsonb_agg(
        jsonb_build_object('ts', e->'ts', 'date', e->'date', 'type', e->'type',
                           'bodyReactions', e->'bodyReactions', 'strategies', e->'strategies', 'after', e->'after')
        || case when com_textos then jsonb_build_object('worry', e->'worry') else '{}'::jsonb end
      ), '[]'::jsonb)
      from jsonb_array_elements(coalesce(estado->'entries', '[]'::jsonb)) as e),
    'doseRecords', (
      select coalesce(jsonb_agg(
        jsonb_build_object('ts', d->'ts', 'date', d->'date', 'weekStart', d->'weekStart', 'tags', d->'tags')
        || case when com_textos then jsonb_build_object('text', d->'text') else '{}'::jsonb end
      ), '[]'::jsonb)
      from jsonb_array_elements(coalesce(estado->'doseRecords', '[]'::jsonb)) as d),
    'moduleFeedback', case when com_textos then estado->'moduleFeedback' else null end
  ));
$$;
revoke all on function public.projecao_farol(jsonb, boolean) from public, anon, authenticated;

-- ── 4. Funções do painel (só profissionais) ────────────────────────────
create function public.painel_vincular(p_email text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'nenhuma conta com esse e-mail' using errcode = 'P0002'; end if;
  insert into public.vinculos (profissional_id, paciente_id) values (auth.uid(), v_id)
    on conflict (profissional_id, paciente_id) do nothing;
  return v_id;
end; $$;

create function public.painel_pacientes()
returns table (paciente_id uuid, email text, compartilha_numeros boolean, compartilha_textos boolean,
               apps text[], ultima_atividade timestamptz, vinculado_em timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  return query
    select v.paciente_id, u.email::text, v.compartilha_numeros, v.compartilha_textos,
           case when v.compartilha_numeros then (select array_agg(a.app order by a.app) from public.app_dados a where a.user_id = v.paciente_id) end,
           case when v.compartilha_numeros then (select max(a.atualizado_em) from public.app_dados a where a.user_id = v.paciente_id) end,
           v.criado_em
    from public.vinculos v join auth.users u on u.id = v.paciente_id
    where v.profissional_id = auth.uid()
    order by u.email;
end; $$;

create function public.painel_dados(p_paciente uuid, p_app text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v public.vinculos; bruto jsonb; estado jsonb; chave text;
begin
  if not exists (select 1 from public.profissionais where user_id = auth.uid()) then
    raise exception 'sem permissão' using errcode = '42501';
  end if;
  select * into v from public.vinculos where profissional_id = auth.uid() and paciente_id = p_paciente;
  if not found or not v.compartilha_numeros then
    raise exception 'o paciente não compartilhou estes dados' using errcode = '42501';
  end if;
  chave := case p_app when 'farol' then 'np_v4' end;   -- novos apps: acrescentar aqui e criar projecao_<app>
  if chave is null then raise exception 'app ainda sem painel: %', p_app using errcode = '0A000'; end if;

  select valor into bruto from public.app_dados where user_id = p_paciente and app = p_app;
  if bruto is null then return null; end if;
  estado := (bruto->'chaves'->>chave)::jsonb;
  if estado is null then return null; end if;

  insert into public.acessos_painel (profissional_id, paciente_id, app, com_textos)
    values (auth.uid(), p_paciente, p_app, v.compartilha_textos);
  return public.projecao_farol(estado, v.compartilha_textos);
end; $$;

revoke all on function public.painel_vincular(text), public.painel_pacientes(), public.painel_dados(uuid, text) from public, anon;
grant execute on function public.painel_vincular(text), public.painel_pacientes(), public.painel_dados(uuid, text) to authenticated;

-- ── 5. Primeira profissional (ajuste o e-mail para recriar em outro projeto) ──
insert into public.profissionais (user_id, nome)
  select id, 'Paula' from auth.users where lower(email) = 'srta.paulaevelyn@gmail.com';

notify pgrst, 'reload schema';

-- ── 6. Painel do Floresça (migração painel_floresca) ───────────────────
-- projecao_floresca(estado, com_textos): mesma regra de lista branca do Farol,
-- com os campos do Floresça (momentos, emoções, saboreio, experimentos).
-- painel_dados passou a aceitar p_app = 'floresca' (chave floresca_v1) e a
-- despachar para a projeção do app. Definição completa: ver migração aplicada.

-- ── 7. Painel do Matiz e da Segurança Interna (migração painel_matiz_seguranca_interna) ──
-- projecao_matiz(chaves, com_textos): recebe TODAS as chaves do app (várias) e monta
--   {checkins, doseRecords, vocab}; contexto, plano e vocabulário só com permissão.
-- projecao_seguranca_interna(estado, com_textos): etapa, tela, conclusão e postura;
--   as respostas escritas só com permissão.
-- painel_dados despacha por app: farol | floresca | matiz | seguranca-interna.

-- ── 8. Escalas da Segurança Interna (migração painel_seguranca_interna_escalas) ──
-- projecao_seguranca_interna(chaves, com_textos) passou a receber TODAS as chaves do app
-- e inclui as escalas (EPLO: totais, data e respostas 1–5). Escalas são números e fazem
-- parte de "só números". painel_dados chama a projeção com `chaves`.
