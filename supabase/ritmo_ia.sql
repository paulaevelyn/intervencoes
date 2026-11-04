-- ═══════════════════════════════════════════════════════════════════════
-- Ritmo — ajuda de IA (função de borda "ritmo-ia")
-- Migração "ritmo_ia" — A APLICAR no projeto Intervenções (ref qhjdhlrmmopgucseprkb).
--
-- O que faz
--   Guarda SÓ um contador de usos por pessoa e por dia, para limitar custo e abuso.
--   Não guarda o texto da pessoa nem a resposta da IA.
--   A tabela não tem política de leitura/escrita: só a função de borda, com a chave de serviço,
--   mexe nela (RLS ligada e sem políticas = ninguém mais alcança).
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.ritmo_ia_uso (
  user_id uuid not null references auth.users(id) on delete cascade,
  dia     date not null default (now() at time zone 'America/Sao_Paulo')::date,
  n       int  not null default 0,
  primary key (user_id, dia)
);
alter table public.ritmo_ia_uso enable row level security;
revoke all on public.ritmo_ia_uso from anon, authenticated;

-- Soma 1 ao uso do dia e diz se ainda está dentro do limite. Atômico.
create or replace function public.ritmo_ia_usar(p_user uuid, p_limite int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v int;
begin
  insert into public.ritmo_ia_uso (user_id, dia, n)
    values (p_user, (now() at time zone 'America/Sao_Paulo')::date, 1)
  on conflict (user_id, dia) do update set n = public.ritmo_ia_uso.n + 1
  returning n into v;
  return v <= p_limite;
end; $$;
revoke all on function public.ritmo_ia_usar(uuid, int) from public, anon, authenticated;
grant execute on function public.ritmo_ia_usar(uuid, int) to service_role;
