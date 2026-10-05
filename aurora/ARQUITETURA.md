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
| Login/sync | `../auth/auth.js` (conta por convite, "usar sem conta", sincronização), `data-storage-keys` lista as 10 chaves sincronizadas | Igual aos outros apps |
| Painel | `../shared/aurora-painel.js` (leitura do paciente e da profissional) + projeção `projecao_aurora` no banco | Texto livre só com permissão do paciente |
| Escala | `../shared/escala.js` + `../shared/escalas/phq9.js` | PHQ-9 oficial pt-BR |
| Dados do app | `data.js` (atividades, exercícios, artigos) | Portado sem alteração de texto do app anterior |

### Chaves de dados
`depressao_app_mood_history` · `depressao_app_activities_log` · `depressao_app_scheduled` · `depressao_app_gratitude` · `depressao_app_escalas` · `depressao_app_ob` · `depressao_app_ratings` · `depressao_app_valores` · `depressao_app_trap` · `depressao_app_tarefas` (sincronizadas) e `depressao_app_lembrete` (só neste aparelho)

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

## Ferramentas clássicas da ativação comportamental (Martell, Addis & Jacobson)

| Ferramenta | Superficial (adaptável) | Profundo (preservar) |
|---|---|---|
| **Prazer e domínio** (modal "Como foi?" ao marcar uma atividade como feita) | Textos, cores, escala visual | Duas notas de 0 a 10 por atividade: **prazer** (o quanto gostou) e **domínio** (o quanto sentiu que realizou algo). Sempre **opcional** (o modal pode ser pulado; só grava depois de mexer nos dois controles). Serve para a pessoa ver o que vale repetir. Chave `depressao_app_ratings`. |
| **Tarefa em passos** (tarefa graduada) | Exemplo, rótulos | Dividir algo que parece grande em **passos de poucos minutos, o primeiro bem pequeno**, e marcar cada passo. O próximo passo aparece na tela inicial. Chave `depressao_app_tarefas`. |
| **Entender um padrão** (TRAP / TRAC) | Perguntas-guia, exemplos | **Gatilho → Resposta → Padrão de evitação** (TRAP), e depois uma **saída diferente** (TRAC, alternativa de enfrentamento), opcionalmente ligada a uma atividade. Tom sem culpa: evitar alivia na hora; o objetivo é notar o padrão. Chave `depressao_app_trap`. |
| **Meus valores** | As 9 áreas da vida, as frases, a ligação com as categorias de atividades (`DOMINIOS` em `data.js`) | Para cada área: **importância** e **quanto a pessoa tem vivido isso** (0 a 10); a **distância** entre as duas aponta onde agir, com atalho para atividades coerentes. Formulação própria, **não é escala validada**. Chave `depressao_app_valores`. |
| **Lembrete diário** | Horários, textos das mensagens | No máximo 1 por dia, **só se a pessoa ainda não registrou nada no dia**, tom gentil e sem cobrança; permissão pedida só depois de uma explicação; configuração **só neste aparelho** (`depressao_app_lembrete`, que não é sincronizada). Mesmo mecanismo do Floresça: notificação local, que funciona melhor com o app instalado. |

Painel (`../shared/aurora-painel.js` + `projecao_aurora`): prazer e domínio, valores, tarefas e TRAP/TRAC entram como **números** para a profissional; os textos (frases dos valores, análises, títulos e passos das tarefas) só com a permissão do paciente.

## Pendências conhecidas
- Os lembretes dependem de o navegador manter o app vivo: sem push de servidor, uma notificação local pode não disparar se o aparelho encerrar o aplicativo.
- Possíveis próximos passos: registrar **atividades de dias futuros** (programar para amanhã), **monitoramento por horário** (agenda horária) e **revisão semanal** com a pessoa.
