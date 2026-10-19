# Sintonia — Arquitetura da Intervenção
## Estrutura superficial vs. estrutura profunda

**Para que serve este documento:** guiar adaptações da Sintonia para outros públicos sem perder
eficácia. Mesma lógica do Farol, do Floresça, do Matiz e do Aurora (referência metodológica: adaptação
cultural de programas, Resnicow et al., 1999; GEPPSVida/Murta).

- **Estrutura superficial** = a "roupa": linguagem, cores, ícones, nomes, o timbre dos sons.
- **Estrutura profunda** = o mecanismo ativo de mudança: **não alterar sem reavaliar a evidência**.

**Regra prática:** se a mudança altera O QUE a pessoa pratica ou POR QUE funciona → profunda. Se altera COMO
se explica ou ilustra → superficial.

---

## Arquitetura técnica (igual à dos apps anteriores)

| Item | Sintonia | Observação |
|---|---|---|
| Pilha | HTML + CSS + JS puros, **sem build** | O áudio é gerado no navegador (Web Audio API), sem arquivos de som |
| Arquivos | `index.html`, `style.css`, `extra.css` (herdados), `sintonia.css`, `app.js` (ATT clássica, dados, navegação), `toques.js` (tipo Com toques), `progresso.js` (progresso, reflexão semanal, relatório), `sw.js`, `manifest.json`, `assets/` | `style.css` e `extra.css` são os mesmos do Aurora (design system da marca). A cor própria da Sintonia é o lavanda (`--lav`, `--lav-d`) |
| Estado | `localStorage`, chaves `sintonia_*` | Ver "Chaves de dados" |
| Navegação | `SCREENS` + `goTo()` + uma `render*()` por tela | Telas: Treinar (início), Sessão, Depois, Registro salvo, Bloco (toques), Bloco concluído, Progresso, Aprender. As telas de exercício escondem a barra de navegação (classe `foco` no `body`). A tela inicial muda com o tipo de treino (`data-tipo` e as classes `only-classico` / `only-toques`) |
| Offline | `sw.js` (HTML network-first, assets cache-first). **Incrementar `CACHE_VERSION` a cada deploy** | `/auth/` e `/shared/` sempre da rede |
| Login/sync | `../auth/auth.js` (conta por convite, "usar sem conta", sincronização), `data-storage-keys` lista as chaves sincronizadas | Igual aos outros apps. Migração `painel_sintonia` aplicada (seção 14 de `supabase/schema.sql`) |
| Painel | `../shared/sintonia-painel.js` (leitura da profissional) + projeção `projecao_sintonia` no banco | Só números (data, duração, completa, notas antes e depois); a observação escrita só com a permissão da pessoa. A pessoa também leva os dados por "Copiar resumo" (Progresso) |
| Pesquisa | Nenhuma (`data-pesquisa="nao"`) | Igual ao Aurora |

### Chaves de dados
`sintonia_sessoes` · `sintonia_semanal` · `sintonia_ob` (sincronizadas) e `sintonia_cfg` (volume, duração, voz e ajustes do tipo Com toques) e `sintonia_nome` (nome opcional do relatório): só neste aparelho

Cada sessão guarda: `id`, `iso`, `modo` (`full`/`short`), `planejado` e `feito` (segundos), `completa`, `antes` e `depois` (`{w, s, c}`, de 0 a 10 ou `null` quando a pessoa não deu nota) e `nota` (texto livre).
Blocos com toques acrescentam: `tipo:'toques'`, `fase` (1 a 3), `cenario`, `sons`, `ritmo`, `acertos`, `chamadas`, `rt` (mediana, em segundos), `longest` (foco contínuo, em segundos), `voltas` e `mente` (`{antes, depois}`, de 1 a 5). A reflexão semanal (`sintonia_semanal`) guarda `{ key (segunda-feira), ts, items (4 notas de 1 a 5), note }`.

---

## O exercício (estrutura profunda: preservar)

Baseado na **Técnica de Treino da Atenção (ATT)** de Adrian Wells (terapia metacognitiva): sessão de 12 minutos, com cinco sons em posições diferentes ao redor da pessoa e o olhar fixo num ponto à frente.

| Fase | Duração (completa / curta) | O que a pessoa faz | Por que importa |
|---|---|---|---|
| Preparação | 8 s | Escolhe um ponto à frente e mantém o olhar | Reduz a fuga do olhar e a vigilância visual |
| 1 · Um som por vez | 5 min / 2,5 min | Atenção seletiva: cada um dos cinco sons por 1 min (30 s na curta), em ordem fixa | Treina **focar** num alvo escolhido, ignorando os outros sons e os pensamentos |
| 2 · Troca rápida | 5 min / 2,5 min | O som-alvo muda a cada 5 a 9 s (sorteio, nunca repete o anterior); a pessoa acompanha o mais rápido que conseguir | Treina **flexibilidade**: mudar o foco de propósito |
| 3 · Todos juntos | 2 min / 1 min | Perceber todos os sons ao mesmo tempo, sem se fixar em nenhum | Atenção dividida: nenhum som "ganha" a atenção |

Regras que **não** devem mudar sem reavaliar a evidência:
- A instrução é **voltar ao som indicado**, nunca "esvaziar a mente" nem "afastar pensamentos". Não é relaxamento nem distração.
- Os sons ficam em **posições distintas** (esquerda, direita, frente, atrás à esquerda e atrás à direita), com fones estéreo. Sem fones, a técnica perde o sentido.
- Três fases, nessa ordem, e a versão curta mantém as **mesmas proporções** (5 : 5 : 2).
- Os sons são **simples e neutros** de propósito; o que importa é para onde a atenção vai, não o conteúdo do som.
- O som na **fase 2 muda sem previsibilidade** (sorteio), para exigir troca ativa e não ritmo previsível.

Superficial (adaptável): timbres dos sons, nomes, cores, textos das instruções (inclusive a voz), duração exata da preparação.

---

## Tipo "Com toques" (adaptação para TDAH, a partir da Clareira)

Criado a partir do artefato **Clareira**. É um **segundo mecanismo**, e não a ATT de Wells: na ATT clássica a pessoa não responde a nada e não há acerto ou erro; aqui há uma **tarefa de detecção** com medida de desempenho. Por isso é um tipo à parte, escolhido na tela inicial, e cada registro guarda `tipo:'toques'`, para a profissional nunca misturar os dois.

| Elemento | Superficial (adaptável) | Profundo (preservar) |
|---|---|---|
| Fases | Nomes e textos | **Foco seletivo** (um som, outros chegam aos poucos), **Alternância** (o alvo muda de lugar, com anel-guia e aviso sonoro) e **Atenção dividida** (todos os sons, quem chama?). Um bloco = uma fase |
| Chamada dupla | Timbres, cenários (Floresta, Oceano, Espaço) | Às vezes um som vem **duas vezes seguidas** (a segunda 12% mais aguda, 0,17 s depois). A pessoa toca na fonte em até cerca de 3 s. Chamadas só ocorrem depois de alguns sons de cada fonte, com intervalo mínimo entre elas |
| Medidas | Rótulos | **Chamadas percebidas** (%), **tempo de resposta** (mediana), **foco contínuo** (maior sequência de percepções com intervalos de até 14 s) e **voltas ao foco** (mais de 14 s entre duas percepções) |
| Ajustes para TDAH | Valores e rótulos | **Blocos curtos** (3, 5 ou 8 min), **menos sons** (3 a 5), **ritmo das trocas** lento a rápido, **intensidade visual** calma a viva, **anel-guia** ligado ou desligado, teclado (teclas 1 a 6 e Esc). Tudo escolhido pela pessoa, no aparelho |
| Linguagem | Frases | **Sem pontos, derrota ou ranking.** "Momentos de foco", nunca "acertos" na tela; a dispersão é tratada como parte do exercício ("perceber e voltar é o exercício"). A pessoa só se compara consigo mesma |
| Mente antes/depois | Rótulos | Uma única escala de **1 (calma) a 5 (agitada)**, opcional, para pouca carga |
| Reflexão semanal | Perguntas | 4 itens de 1 a 5 sobre o **dia a dia**, uma vez por semana, mais uma situação em texto. Mostra a experiência da pessoa, **não prova** que o treino causou a mudança |
| Relatório | Layout | PDF, texto, CSV e resumo para a profissional, com período de 7, 30 ou 90 dias. O nome é opcional. O PDF carrega as bibliotecas (`jsPDF`, `autoTable`, da cdnjs) **só quando a pessoa pede**, então precisa de internet; texto, CSV e resumo funcionam offline |

Limite honesto, repetido na tela inicial: o treino de atenção costuma ter **efeito limitado fora do exercício**, por isso funciona melhor junto de estratégias do dia a dia. A sugestão do dia é descritiva ("Blocos curtos e regulares funcionam melhor"), sem meta.

---

## Cenário Bateria (pessoas que tocam ou estão aprendendo bateria)

Pensado para um cliente que toca bateria. Vale para os **dois tipos de treino** e **não muda o mecanismo**, só o conteúdo sonoro (estrutura superficial):

| Onde | Como aparece | O que toca |
|---|---|---|
| Clássico | Cartão "Sons" na tela inicial (Padrão ou Bateria), guardado em `CFG.conjunto` | Mesmas cinco posições ao redor: **Prato** (esquerda), **Chimbal** (direita), **Bumbo** (frente), **Tom** (atrás, à direita) e **Caixa** (atrás, à esquerda). O bumbo mantém um pulso regular, como a madeira do conjunto padrão |
| Com toques | Cenário "Bateria" nos ajustes (`CFG.cenario`) | Bumbo, caixa, chimbal, tom agudo, tom grave e prato. A **chamada dupla** (um som duas vezes seguidas) corresponde ao toque duplo (*double stroke*) |

- Todos os sons são **sintetizados no navegador** (ruído filtrado e osciladores); não há arquivos de áudio. Não soam como um kit gravado. Trocar por gravações com licença seria só substituir a síntese.
- **Cuidado auditivo:** quem toca bateria já tem o ouvido mais exposto. Quando a Bateria está escolhida, a tela inicial mostra o aviso "Cuide do ouvido" e o volume continua baixo por padrão.
- Cada registro marca `conjunto:'bateria'` (clássico) ou `cenario:'bateria'` (com toques); o painel da profissional mostra "(bateria)".
- Fora de escopo, por precisar de validação clínica: exercícios que usam pulso e ritmo (por exemplo, manter um pulso interno enquanto os sons trocam).

---

## Diferenças deliberadas em relação ao Farol/Floresça

| Elemento | Farol/Floresça | Sintonia | Por quê (profundo) |
|---|---|---|---|
| Gamificação | XP, níveis, medalhas | **Nenhuma** | O treino é repetição, e um número que sobe ou "sequência" que quebra vira mais um motivo de cobrança. O progresso é descritivo: sessões, dias com prática, minutos |
| Sequência (streak) | "dias seguidos" | **Removida**; só "dias com prática" | Uma sequência que se quebra pune quem mais precisa |
| Retorno após pausa | Nudge de retorno | Aviso **acolhedor** depois de 7 dias ("não é preciso recuperar nada; 6 minutos já contam") | Evitar o efeito "estraguei tudo" |
| Notas antes e depois | — | **Opcionais, por item** (0 a 10): só grava o item em que a pessoa mexeu | Pedir nota de tudo vira obrigação; "sem nota" é um dado válido |
| Pesquisa | Envio opcional para planilha | **Nenhuma** | Dados de saúde mental sem coleta de pesquisa; consentimento mais simples |
| Segurança | Aviso geral | **Apoio de crise** na tela inicial, durante a sessão (pausa o exercício), depois da sessão e em Aprender | O exercício pode mobilizar pensamentos difíceis; sair e pedir ajuda tem que ser fácil |
| Som | — | Volume baixo por padrão, teste dos fones, aviso para quem tem zumbido ou sensibilidade a sons, compressor no áudio | Segurança auditiva |

---

## Medidas de antes e depois (superficial: rótulos; profundo: o que se mede)

| Medida | Pergunta | Base |
|---|---|---|
| `w` Preocupação ou ruminação | 0 = nenhuma, 10 = muito intensa | A ATT busca reduzir a atenção presa em pensamento repetitivo |
| `s` Atenção presa em mim | pensamentos e sensações do corpo, de 0 a 10 | Atenção autofocada é um dos alvos da terapia metacognitiva |
| `c` Controle sobre a atenção | 0 = nenhum, 10 = total | Sensação de controle atencional é o mecanismo treinado |

Formulação própria de apoio, **não é escala validada**. A pessoa compara só consigo mesma, e mudanças pequenas ou nenhuma mudança são esperadas ("o treino pesa mais pela repetição do que por uma sessão isolada").

---

## Para publicar uma atualização
1. Editar os arquivos.
2. Incrementar `CACHE_VERSION` em `sw.js`.
3. `git commit` e `git push` (o GitHub Pages atualiza em cerca de 1 minuto). Quem já usou o app precisa recarregar a página duas vezes para o service worker trocar de versão.

## Pendências conhecidas
- Testar o painel de ponta a ponta com uma conta real: a projeção (`painel_sintonia` e `painel_sintonia_toques`) foi testada com dados fictícios, mas ainda não há uma pessoa vinculada usando a Sintonia.
- O tipo Com toques ainda não foi validado com pessoas com TDAH: ajustar tempos, quantidade de sons e linguagem depois dos primeiros testes.
- O áudio depende de o navegador manter a página viva: a sessão pausa se a tela for para segundo plano (comportamento intencional). No iPhone, o modo silencioso bloqueia o som.
- Possíveis próximos passos: escolher o conjunto de sons, lembrete diário opcional (como no Aurora) e testes com pessoas reais, incluindo quem usa leitor de tela.
