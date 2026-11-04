# Ritmo — arquitetura

App web (PWA) para adultos neurodivergentes. React 18 + TypeScript + Tailwind 3, sem outras dependências de execução.

- **Código-fonte:** `ritmo/fonte/` (`npm install` e `npm run dev`).
- **Publicação:** `cd ritmo/fonte && npm run build` grava `index.html` e `assets/` em `ritmo/` (como os demais apps, servidos como estáticos). Ao publicar, aumente `CACHE` em `fonte/public/sw.js`.
- **Dados:** só `localStorage` (`ritmo:v1`), sem servidor, sem conta. Baixar/restaurar cópia JSON e apagar tudo em Ajustes. Exemplos têm `example: true` e podem ser removidos.
- **Rotas:** hash (`#/tarefas`, `#/rotinas/:id`, `#/regulacao/:id`, `#/apoio-agora`…).
- **Regras sem IA:** `data/split.ts` (divisão de tarefas por palavras-chave), `data/suggest.ts` (sugestões por energia/sobrecarga/necessidade), `pages/Sensory.tsx` (`summarize`, padrões dos últimos 7 dias, só com 3+ registros).
- **Conteúdo editável:** `data/library.ts` (práticas), `data/templates.ts` (mensagens), `data/sample.ts` (exemplos e modelos de rotina).
- **Acessibilidade:** alvos ≥ 48 px, foco visível, tema claro/escuro/baixo estímulo, texto até 150%, fonte de leitura, espaçamento amplo, sem sons e sem animação automática; verificado com axe (WCAG 2.2 AA) nos temas claro e escuro.
- **Pendências:** conta/sincronização (só texto explicativo em Ajustes), lembretes fora do app, testes com usuários reais e leitor de tela.
