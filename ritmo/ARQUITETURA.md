# Ritmo — arquitetura

App web (PWA) para adultos neurodivergentes. React 18 + TypeScript + Tailwind 3, sem outras dependências de execução.

- **Código-fonte:** `ritmo/fonte/` (`npm install` e `npm run dev`).
- **Publicação:** `cd ritmo/fonte && npm run build` grava `index.html` e `assets/` em `ritmo/` (como os demais apps, servidos como estáticos). Ao publicar, aumente `CACHE` em `fonte/public/sw.js`.
- **Dados:** `localStorage` (`ritmo:v1`). Baixar/restaurar cópia JSON e apagar tudo em Ajustes. Exemplos têm `example: true` e podem ser removidos.
- **Login/sync (igual aos outros apps):** `../auth/auth.js`, injetado no build por `vite.config.ts` (`data-app="ritmo"`, `data-storage-keys="ritmo:v1"`). "Continuar sem conta" mantém tudo só no aparelho. Exige a migração `supabase/ritmo.sql` (`app_dados` aceitar `'ritmo'`). Não há projeção nem painel: nada do Ritmo chega à profissional. Se o login não carregar (offline), o app abre mesmo assim, só com os dados locais (o plano de apoio precisa funcionar offline). `/auth/` e `/shared/` vão sempre da rede no `sw.js`.
- **Lembretes:** `src/reminders.ts`, notificações locais (modelo do Aurora). Opt-in em Ajustes; 1 lembrete diário (só se não houve registro no dia) e um horário opcional por rotina (`remindAt`). Chave `ritmo:lembrete`, só neste aparelho, nunca sincronizada. Limite técnico: só disparam com o navegador/PWA vivo.
- **Rotas:** hash (`#/tarefas`, `#/rotinas/:id`, `#/regulacao/:id`, `#/apoio-agora`…).
- **Regras sem IA:** `data/split.ts` (divisão de tarefas por palavras-chave), `data/suggest.ts` (sugestões por energia/sobrecarga/necessidade), `pages/Sensory.tsx` (`summarize`, padrões dos últimos 7 dias, só com 3+ registros).
- **Conteúdo editável:** `data/library.ts` (práticas), `data/templates.ts` (mensagens), `data/sample.ts` (exemplos e modelos de rotina).
- **Acessibilidade:** alvos ≥ 48 px, foco visível, tema claro/escuro/baixo estímulo, texto até 150%, fonte de leitura, espaçamento amplo, sem sons e sem animação automática; verificado com axe (WCAG 2.2 AA) nos temas claro e escuro.
- **Pendências:** aplicar `supabase/ritmo.sql`, testes com usuários reais e leitor de tela.
