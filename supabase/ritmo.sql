-- ═══════════════════════════════════════════════════════════════════════
-- Ritmo (apoio para adultos neurodivergentes)
-- Migração "ritmo" — A APLICAR no projeto Intervenções (ref qhjdhlrmmopgucseprkb).
--
-- O que faz
--   app_dados passa a aceitar app = 'ritmo', para a sincronização opcional por conta (auth/auth.js,
--   chave de localStorage 'ritmo:v1'). Sem esta migração, quem entra numa conta vê "não salvou".
--
-- O que NÃO faz, de propósito
--   Não cria projeção nem painel para a profissional. painel_dados só despacha 'farol' (+ apps com
--   projecao_*), então 'ritmo' cai em "app ainda sem painel", e painel/index.html só lista apps
--   conhecidos. O plano de apoio, os registros sensoriais e as tarefas ficam visíveis só para a pessoa.
--   O lembrete (chave 'ritmo:lembrete') é local do aparelho e nunca é sincronizado.
-- ═══════════════════════════════════════════════════════════════════════
alter table public.app_dados drop constraint app_dados_app_check;
alter table public.app_dados add constraint app_dados_app_check
  check (app = any (array['farol','floresca','matiz','seguranca-interna','aurora','sintonia','trilha','ritmo']));
