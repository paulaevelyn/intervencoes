# Aurora — Arquitetura da Intervenção
## Estrutura superficial vs. estrutura profunda

**Para que serve este documento:** guiar adaptações do Aurora para outros públicos sem perder
eficácia. Mesma lógica do Farol, do Floresça e do Matiz (referência metodológica: adaptação
cultural de programas, Resnicow et al., 1999; GEPPSVida/Murta).

- **Estrutura superficial** = a "roupa": linguagem, exemplos, cores, ícones, nomes, o banco de atividades.
- **Estrutura profunda** = o mecanismo ativo de mudança: **não alterar sem reavaliar a evidência**.

**Regra prática:** se a mudança altera O QUE a pessoa pratica ou POR QUE funciona → profunda. Se altera COMO
se explica ou ilustra → superficial.

---

## Arquitetura técnica (igual à dos apps anteriores)

| Item | Aurora | Observação |
|---|---|---|
| Pilha | HTML + CSS + JS puros, **sem build** | Antes era React + Vite + Tailwind; foi refeito para seguir o padrão do Farol/Floresça (e para publicar direto no GitHub Pages) |
| Arquivos | `index.html`, `style.css`, `extra.css` (herdados), `aurora.css`, `data.js`, `app.js`, `sw.js`, `manifest.json`, `assets/` | `style.css` e `extra.css` são os mesmos do Floresça (design system da marca) |
| Estado | `localStorage`, **chaves separadas** `depressao_app_*` | Exceção ao padrão `D`/`SK` único: as chaves são as do Aurora anterior, para quem já usava o app não perder nada |
| Navegação | `SCREENS` + `goTo()` + uma `render*()` por tela | Telas: Hoje, Ativar, Registrar, Sentir, Aprender, Progresso, Autoavaliação, Dados |
| Offline | `sw.js` (HTML network-first, assets cache-first). **Incrementar `CACHE_VERSION` a cada deploy** | `/auth/` e `/shared/` sempre da rede |
| Login/sync | `../auth/auth.js` (conta por convite, "usar sem conta", sincronização), `data-storage-keys` lista as 6 chaves | Igual aos outros apps |
| Painel | `../shared/aurora-painel.js` (leitura do paciente e da profissional) + projeção `projecao_aurora` no banco | Texto livre só com permissão do paciente |
| Escala | `../shared/escala.js` + `../shared/escalas/phq9.js` | PHQ-9 oficial pt-BR |
| Dados do app | `data.js` (atividades, exercícios, artigos) | Portado sem alteração de texto do app anterior |

### Chaves de dados
`depressao_app_mood_history` · `depressao_app_activities_log` · `depressao_app_scheduled` · `depressao_app_gratitude` · `depressao_app_escalas` · `depressao_app_ob`

---

## Diferenças deliberadas em relação ao Farol/Floresça (depressão + ativação comportamental)

| Elemento | Farol/Floresça | Aurora | Por quê (profundo) |
|---|---|---|---|
| Gamificação | XP, níveis, medalhas | **Nenhuma** | Em depressão (anedonia, baixa energia, autocrítica), pontos e "sequências" podem virar mais um motivo de culpa quando falham. O progresso é descritivo ("dias com registro", "atividades feitas"). |
| Sequência (streak) | "dias seguidos" | **Removida**; só "dias com registro" | Uma sequência que se quebra pune justamente quem mais precisa. |
| Retorno após pausa | Nudge de retorno | Nudge **acolhedor** ("não é preciso recuperar nada") | Evitar o efeito "estraguei tudo". |
| Decisões | Módulos em ordem | **Um passo pequeno por dia** na tela inicial | Reduz a carga de decisão; pequenas tarefas de 5–10 min (tarefa graduada). |
| Estrutura | Módulos sequenciais | **Livre**: Ativar, Registrar, Sentir, Aprender | A ativação comportamental é prática diária, não um currículo. |
| Pesquisa | Envio opcional para planilha | **Nenhuma** | Dados de saúde mental sem coleta de pesquisa; consentimento mais simples. |
| Segurança | Aviso geral | **Apoio de crise sempre à mão** (botão na Hoje, aba Aprender, onboarding) e **item 9 do PHQ-9** com ação imediata | Triagem de depressão exige cuidado com ideação suicida. |
| Onboarding | 9 slides | **5 telas curtas** | Menos leitura para quem está sem energia. |

---

## Elementos transversais

| Elemento | Superficial (adaptável) | Profundo (preservar) |
|---|---|---|
| Atividades (35, 7 categorias) | Lista, nomes, durações, emojis | Atividade **pequena, concreta e agendável**, ligada a corpo, social, natureza, criatividade, conquista, prazer e autocuidado (Martell et al., 2001; Lewinsohn). A evidência de cada uma aparece em "Por que funciona?". |
| Programar e marcar como feito | Visual, textos dos botões | **Agendar** e depois **registrar o que foi feito** (monitoramento de atividade), incluindo marcar feito sem ter programado e feito pela metade. É o núcleo da ativação comportamental. |
| Humor diário (1–5) + nota | Rostos, rótulos | Registro **diário e rápido** do humor, para a pessoa ligar o que faz ao que sente. |
| 3 coisas boas | Perguntas-guia | Prática de atenção ao positivo (Seligman et al., 2005). |
| Sentir (8 exercícios) | Textos, ordem | Emoções positivas e regulação (Fredrickson; MBCT; metta; respiração). |
| Aprender | Textos, exemplos | Psicoeducação sobre depressão, o modelo da ativação comportamental e **recursos de crise**. |
| PHQ-9 (opcional) | Telas e cores | **Itens, respostas e pontuação oficiais** (Pfizer, 2005; validação brasileira de Santos et al., 2013): não parafrasear. Item 9 > 0 → apoio de crise imediato e aviso claro de que o app NÃO envia alertas. A pessoa vê só o total; a faixa de gravidade aparece apenas no painel da profissional. |
| Pré e pós | — | Reaplicação sugerida em 4 semanas; sempre opcional. |

---

## Para publicar uma atualização
1. Editar os arquivos.
2. Incrementar `CACHE_VERSION` em `sw.js`.
3. `git commit` e `git push` (o GitHub Pages atualiza em cerca de 1 minuto). Quem já usou o app precisa recarregar a página duas vezes para o service worker trocar de versão.

## Pendências conhecidas
- Lembretes diários (notificações), como no Farol e no Floresça: não implementados.
- Possíveis acréscimos de ativação comportamental: registro de **prazer e domínio** a cada atividade, **inventário de valores**, **análise TRAP/TRAC** (gatilho, resposta, evitação) e **tarefa graduada** em passos.
