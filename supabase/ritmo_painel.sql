-- ═══════════════════════════════════════════════════════════════════════
-- Ritmo no painel da profissional
-- Migração "ritmo_painel" — NÃO APLICADA. Rodar no SQL Editor do projeto Intervenções (depois de ritmo.sql).
--
-- O que faz
--   1. projecao_ritmo(chaves, com_textos): lista branca do que a profissional vê. SÓ NÚMEROS E CATEGORIAS.
--   2. painel_dados passa a despachar 'ritmo' (definição vigente de supabase/trilha.sql + 1 app).
--
-- O que a profissional vê (e só se a pessoa ligar "compartilhar números" em "Minha conta")
--   • check-ins: data, humor, energia, sobrecarga e necessidade do momento (categorias fixas)
--   • registros sensoriais: data, ambiente, nível, estímulos e o que ajudou, só da lista fixa do app
--   • estados: data e qual estado a pessoa marcou (categoria fixa)
--   • tarefas: só contagens (criadas, concluídas, para depois); NUNCA os títulos nem os passos
--   • rotinas: só quantas existem
--
-- O que NUNCA sai, nem com permissão de textos (o parâmetro com_textos é aceito e ignorado de propósito)
--   plano de apoio, perfil de traços, notas e textos livres, caixa de entrada, agenda, tarefas e rotinas
--   pelo nome, ajustes, lembretes. Dados de exemplo (example = true) também não entram.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Projeção (lista branca; qualquer valor fora da lista é descartado) ──
create or replace function public.projecao_ritmo(chaves jsonb, com_textos boolean) returns jsonb
language plpgsql immutable set search_path = '' as $fn$
declare
  est jsonb := coalesce((chaves->>'ritmo:v1')::jsonb, '{}'::jsonb);
  chk jsonb := est->'checkins';
  sen jsonb := est->'sensory';
  sta jsonb := est->'stateLog';
  tar jsonb := est->'tasks';
  rot jsonb := est->'routines';
  r_chk jsonb; r_sen jsonb; r_sta jsonb; r_tar jsonb; r_rot int;
begin
  -- check-ins: ts (data em America/Sao_Paulo) + 4 categorias fixas
  r_chk := (select coalesce(jsonb_agg(q.o order by q.d), '[]'::jsonb) from (
    select to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as d,
      jsonb_strip_nulls(jsonb_build_object(
        'date', to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
        'mood',     case when e->>'mood'     in ('energia','limite','pausa') then e->>'mood' end,
        'energy',   case when e->>'energy'   in ('baixa','media','alta') then e->>'energy' end,
        'overload', case when e->>'overload' in ('nenhuma','leve','moderada','alta') then e->>'overload' end,
        'need',     case when e->>'need'     in ('foco','descanso','organizacao','regulacao','registrar') then e->>'need' end
      )) as o
    from jsonb_array_elements(case when jsonb_typeof(chk) = 'array' then chk else '[]'::jsonb end) e
    where jsonb_typeof(e->'at') = 'number' and coalesce(e->>'example', 'false') <> 'true'
    order by (e->>'at')::numeric desc limit 500) q);

  -- registros sensoriais: ambiente, nível, estímulos e o que ajudou, só da lista fixa do app (a nota e o item
  -- digitado à mão em "o que ajudou" são texto livre e nunca entram)
  r_sen := (select coalesce(jsonb_agg(q.o order by q.d), '[]'::jsonb) from (
    select to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as d,
      jsonb_strip_nulls(jsonb_build_object(
        'date', to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
        'env',   case when e->>'env'   in ('casa','trabalho','estudo','transporte','social','outro') then e->>'env' end,
        'level', case when e->>'level' in ('nenhuma','leve','moderada','alta') then e->>'level' end,
        'stimuli', (select coalesce(jsonb_agg(s), '[]'::jsonb)
                    from jsonb_array_elements_text(case when jsonb_typeof(e->'stimuli') = 'array' then e->'stimuli' else '[]'::jsonb end) s
                    where s in ('Ruído','Luz','Multidão','Cheiro','Textura','Movimento','Calor/frio')),
        'helped',  (select coalesce(jsonb_agg(s), '[]'::jsonb)
                    from jsonb_array_elements_text(case when jsonb_typeof(e->'helped') = 'array' then e->'helped' else '[]'::jsonb end) s
                    where s in ('Fones','Óculos escuros','Silêncio','Pausa','Movimento','Objeto preferido'))
      )) as o
    from jsonb_array_elements(case when jsonb_typeof(sen) = 'array' then sen else '[]'::jsonb end) e
    where jsonb_typeof(e->'at') = 'number' and coalesce(e->>'example', 'false') <> 'true'
    order by (e->>'at')::numeric desc limit 500) q);

  -- estados marcados: só a data e o id do estado (sensações, contexto, necessidade e nota não entram)
  r_sta := (select coalesce(jsonb_agg(q.o order by q.d), '[]'::jsonb) from (
    select to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as d,
      jsonb_build_object(
        'date', to_char(to_timestamp((e->>'at')::numeric / 1000.0) at time zone 'America/Sao_Paulo', 'YYYY-MM-DD'),
        'state', e->>'state') as o
    from jsonb_array_elements(case when jsonb_typeof(sta) = 'array' then sta else '[]'::jsonb end) e
    where jsonb_typeof(e->'at') = 'number' and (e->>'state') ~ '^[a-z0-9_-]{1,40}$'
    order by (e->>'at')::numeric desc limit 500) q);

  -- tarefas: só contagens
  r_tar := (select jsonb_build_object(
      'total',  count(*),
      'feitas', count(*) filter (where t->>'done' = 'true'),
      'depois', count(*) filter (where t->>'later' = 'true' and coalesce(t->>'done', 'false') <> 'true'))
    from jsonb_array_elements(case when jsonb_typeof(tar) = 'array' then tar else '[]'::jsonb end) t
    where coalesce(t->>'example', 'false') <> 'true');

  r_rot := (select count(*) from jsonb_array_elements(case when jsonb_typeof(rot) = 'array' then rot else '[]'::jsonb end) r
            where coalesce(r->>'example', 'false') <> 'true');

  return jsonb_build_object('checkins', r_chk, 'sensorial', r_sen, 'estados', r_sta, 'tarefas', r_tar, 'rotinas', r_rot);
end; $fn$;
revoke all on function public.projecao_ritmo(jsonb, boolean) from public, anon, authenticated;

-- ── 2. painel_dados passa a despachar 'ritmo' (definição vigente + 1 app) ──
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
  if p_app not in ('farol', 'floresca', 'matiz', 'seguranca-interna', 'aurora', 'sintonia', 'trilha', 'ritmo') then
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
    when 'ritmo'    then public.projecao_ritmo(chaves, v.compartilha_textos)
  end;
end; $$;

notify pgrst, 'reload schema';
