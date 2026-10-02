# Matiz — Arquitetura da Intervenção

## Estrutura superficial vs. estrutura profunda

Mesma lógica do Floresça (`intervencao-emocoes-positivas/ARQUITETURA.md`),
referência metodológica GEPPSVida/Murta: **estrutura superficial** é a
roupa (linguagem, cores, ícones, nome) — pode mudar ao adaptar para outro
público. **Estrutura profunda** é o mecanismo ativo de mudança — não mexer
sem reavaliar a evidência.

---

## Racional central: granularidade emocional (Barrett)

**Mecanismo ativo:** pessoas que nomeiam o que sentem com *precisão* (não
só "bem"/"mal") regulam melhor suas emoções — a granularidade emocional
(Lisa Feldman Barrett) funciona como o paladar: quem só reconhece "doce e
salgado" sente menos nuances do que quem reconhece sabores específicos.
O Matiz ensina as 6 emoções básicas (Ekman) com esse racional explícito,
e não como curiosidade solta — é a mesma lógica do módulo 2 do Floresça,
aplicada às emoções básicas (incluindo as difíceis, não só as positivas).

**Por que isso importa para alexitimia:** dificuldade em identificar e
descrever emoções é o núcleo da alexitimia. Dar palavras + pistas de corpo
concretas é a intervenção mais direta possível para esse público — e
funciona também para quem simplesmente nunca teve vocabulário emocional
rico, sem que isso implique patologizar ninguém.

**Superficial:** os emojis, as cores por emoção, os exemplos de frases.

### Terapia Focada nas Emoções, neurobiologia e Circumplexo (Russell)

Três adições de fundamentação, todas a serviço do objetivo central do
app — **educar e desenvolver consciência emocional**, não só ensinar
rótulos:

1. **Neurobiologia** — novo card conceitual explicando amígdala (alarme
   rápido), ínsula (leitura do corpo/interocepção), córtex pré-frontal
   (avaliação e escolha da resposta) e sistema nervoso autônomo
   (simpático=acelerador, parassimpático=freio). Objetivo: dar um "porquê"
   biológico simples pras sensações de corpo já ensinadas por emoção,
   sem jargão técnico excessivo.
2. **Terapia Focada nas Emoções (Greenberg)** — dois acréscimos:
   (a) reformulação de "pra que servem as emoções" como **informação**,
   não problema a eliminar — "chegar até" a emoção em vez de evitá-la;
   (b) nova etapa **"Nem toda emoção é o que parece"**, com a tipologia
   de respostas emocionais: primária adaptativa, primária mal-adaptativa,
   secundária e instrumental. **Mecanismo ativo:** ensinar que a mesma
   emoção "nomeada corretamente" pode ainda assim não ser a informação
   mais confiável do momento — uma camada de consciência emocional além
   da granularidade lexical.
3. **Circumplexo de Russell (1980)** — nova etapa **"Termômetro
   emocional"**, um quadrado interativo de valência (desagradável↔
   agradável) x ativação (pouca↔muita energia), onde a pessoa marca como
   está se sentindo agora e recebe de volta o quadrante + palavras que
   costumam habitar ali. **Mecanismo ativo:** ensinar que toda emoção
   pode ser descrita por duas dimensões contínuas *antes* de virar uma
   categoria com nome — complementa (não substitui) o ensino categórico
   das 6 emoções básicas, e conecta com a própria ideia de granularidade
   emocional (Barrett) que já fundamenta o app.

### Camadas teóricas do onboarding (uma vez só)

Antes do check-in corporal, uma sequência conceitual cobre: (a) os três
componentes de uma emoção — corpo, sentimento subjetivo, tendência de
ação (Scherer); (b) função adaptativa das emoções básicas, sem hierarquia
de "certo/errado"; (c) **tendência de ação** (Frijda) — cada emoção
carrega um impulso específico, e reconhecê-lo é o que abre a escolha de
segui-lo ou não; (d) regulação emocional como habilidade de
perceber→nomear→escolher (Gross), não como supressão; (e) dois radares de
reconhecimento — interno (interocepção) e externo (expressões
faciais/posturais universais, Ekman); (f) **Circumplexo de Russell**
(Termômetro Emocional); (g) tipologia de respostas emocionais da EFT
(Nem toda emoção é o que parece). Essa sequência roda **uma única vez**
(controlado por `prefs.onboarded`) — em retornos, "Começar" pula direto
pro check-in corporal.

## O núcleo: check-in corporal (substitui o antigo jogo de associação)

**Mudança de mecanismo, não só de tela.** A versão anterior ensinava as 6
emoções por leitura linear + um jogo de associação abstrato (tocar
emoção → tocar descrição, com pontuação). O núcleo agora é um **fluxo de
reconhecimento que começa na sensação do corpo, não no rótulo** —
alinhado ao desafio real da alexitimia: a dificuldade não costuma ser
lembrar o nome certo, é a ponte entre sensação física e palavra.

**Mecanismo ativo:** reconhecimento assistido, nunca recall livre. Em
nenhum momento o app pergunta "o que você está sentindo?" em aberto — ele
sempre oferece 2-3 famílias compatíveis com a sensação marcada, com
"nenhuma dessas ainda" e "ainda não sei" como respostas válidas e
igualmente ao lado (mesmo peso visual, não linguagem de erro). **Sem
pontuação, sem certo/errado** — o que cresce é um mapa pessoal, não um
placar.

Sequência (repetível, uma "sessão" = um check-in):
1. **Entrada pela sensação** (`scr-body-entry`) — mapa do corpo (silhueta
   decorativa + botões-hotspot reais, rotulados, sem depender de acertar
   um pixel) ou lista de descritores (aperto, calor, peso, formigamento,
   vazio, tensão). Alternável a qualquer momento, sem compromisso fixo.
2. **Sugestão de famílias** (`scr-family`) — `sensationToFamilies`/
   `regionToFamilies` mapeiam a sensação pra 2-3 das 6 emoções básicas.
3. **Intensidade** (`scr-intensity`, só se uma família foi escolhida) —
   variações descritas (ex.: Irritação → Aborrecimento → Raiva → Fúria),
   nunca uma régua numérica de 0-10.
4. **Contexto** (`scr-context`, sempre opcional) — situação disparadora.
5. **Ação possível** (`scr-action`) — reaproveita `actionTendency` ("o
   que o corpo quer fazer", sem julgar o impulso) e `healthy` ("uma ação
   possível", não a única certa) já existentes por emoção; conteúdo
   genérico e igualmente acolhedor quando nenhuma família foi identificada.
6. **Registro no mapa** (`scr-map-register`) — confirma o registro em
   `matiz_bodymap_v1` e mostra um resumo (sensação mais comum, família
   mais identificada) — sem gráfico complexo, sem comparação social.

O conteúdo rico por emoção (origem evolutiva, tendência de ação, sinais
em outros, cenário, aplicação — antes só na tela "Aprendizado") não foi
descartado: alimenta a tela de Ação do check-in **e** continua acessível
por inteiro, fora do fluxo obrigatório, na **Biblioteca das emoções**
(`scr-library`, botão de nav, sem jogo, sem pontuação — consulta livre).

---

## Elementos transversais

| Elemento | Superficial (adaptável) | Profundo (preservar) |
|---|---|---|
| 6 blocos por emoção (Biblioteca/Ação) | Textos, exemplos, ordem dos blocos | Sempre emparelhar rótulo + pista de corpo + pensamento típico (dual coding, aprendizagem multimodal — Mayer) |
| Camada científica colapsável | Texto da curiosidade | Ser **opcional**, nunca obrigatória — reduz carga cognitiva extra para quem não precisa dela (UDL) |
| Check-in corporal (6 telas) | Emojis, ícones, texto das sensações/famílias | Reconhecimento assistido (2-3 opções + "nenhuma"/"ainda não sei"), nunca recall livre nem pergunta aberta — sem pontuação, sem certo/errado |
| Mapa pessoal (`matiz_bodymap_v1`) | Layout do resumo | Cresce com o tempo; mostra frequência (sensação/família), nunca compara com outras pessoas nem define uma "meta" |
| "Nenhuma dessas ainda" / "Ainda não sei" | Texto do botão | Mesmo peso visual das opções "certas" — recusar rotular é uma resposta válida, não uma falha |
| Retomada de sessão | Texto do banner | **Sem culpa** — nunca linguagem de "você abandonou"; efeito Zeigarnik usado a favor do usuário, não como pressão |
| Plano "quando eu perceber ___" | Chips de exemplo, redação | Formato implementation intention (Gollwitzer, 1999): gatilho específico + ação específica — é o que faz a prática sair do app e entrar no dia a dia (COM-B: Oportunidade) |
| Cartão de referência rápida (export) | Layout, cores | Ser um artefato físico/portátil usável fora do app — Oportunidade física (COM-B) |
| Preferências (movimento, texto, contraste, áudio) | Ícones, textos | Controle explícito do usuário sobre estimulação sensorial e modalidade de apresentação — nunca inferido só do sistema operacional |
| Autoavaliação antes/depois | Perguntas exatas, rótulos da escala | Não é instrumento validado — isso é sempre dito explicitamente; opcional, roda só no onboarding (uma vez) |
| Dose Cultivada (check-in semanal) | Tags, texto do card | Auto-relato semanal de prática ativa do plano quando-então; só aparece pra quem já tem registro no mapa; nunca bloqueante; "dispensar essa semana" é uma opção tão válida quanto registrar |
| Encerramento | Texto do fechamento | Sem gatilho de reengajamento artificial (sem "volte amanhã", sem streak, sem notificação) — bem-estar digital (Peters/Positive Computing) acima de tempo de tela |

---

## Mapeamento COM-B

- **Capability (psicológica):** linguagem simples, sem jargão; pistas de
  corpo concretas; camada científica opcional para quem quiser aprofundar.
- **Opportunity (física):** cartão de referência rápida exportável; app
  funciona offline após primeiro carregamento; sem exigência de conta ou
  conexão contínua.
- **Opportunity (social):** exportações pensadas para levar a uma conversa
  com psicólogo/a — o app não substitui, mas municia essa conversa.
- **Motivation (reflexiva):** plano "quando-então" ao final, conectando a
  prática a um gatilho real do dia a dia.
- **Motivation (automática):** reconhecimento assistido reduz a fricção
  de "ter que adivinhar sozinho"; o mapa pessoal reforça sem comparar com
  ninguém — cresce com o próprio uso, não com desempenho.

---

## Bem-estar digital (Dorian Peters / Positive Computing)

Princípios aplicados: autonomia (pular, pausar, decidir o que aprofundar),
competência (dificuldade progressiva mas sem punição), sem padrões de
manipulação (sem streaks de culpa, sem urgência artificial, sem
notificações), fechamento que permite sair "completo" — o app não tenta
prender atenção além do necessário para o objetivo educativo.

---

## Neurodivergência / Universal Design for Learning

- Múltiplos meios de representação: texto + ícone + cor + áudio opcional
  (Web Speech API, `pt-BR`, com detecção de suporte do navegador).
- Múltiplos meios de ação/expressão: duas formas de marcar a sensação
  (mapa do corpo ou lista de texto, alternáveis a qualquer momento); sem
  cronômetro; retomada sem perda de progresso.
- Múltiplos meios de engajamento: preferências explícitas (movimento,
  contraste, tamanho de texto); linguagem literal, sem metáforas obscuras;
  autoavaliação e captura de vocabulário sempre opcionais; "ainda não
  sei" sempre disponível, sem exigir uma resposta forçada.

---

© 2026 Psicoterapia e Afins · psicoterapiaeafins.com.br
