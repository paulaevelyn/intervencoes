# Ritmo — diretrizes de design: o que segue, o que adaptamos e o que ainda falta

Base: diretrizes de design do Ritmo (calma, previsibilidade, respeito; sem “eficiência corporativa” nem motivação agressiva), adaptadas à marca **Psicoterapia e Afins** (mesma paleta e fontes dos outros apps do repositório).
Verificado em 2026-11-11 com testes automatizados (Playwright + axe) e leitura das telas. Não substitui teste com leitor de tela e com pessoas reais.

## Logo do Ritmo (2026-11-11)
Arte original criada pela profissional (barras em onda, laranja → lilás → azul → verde, palavra "ritmo" em verde-escuro, "o seu dia, no seu compasso"). Reconstruída em vetor com as medidas e cores medidas da imagem (21 barras; palavra em Nunito Black contornada, a fonte mais próxima da arte).

| Arquivo (em `ritmo/`) | Uso |
|---|---|
| `symbol.svg` | só as barras |
| `logo.svg`, `logo-dark.svg`, `logo-slogan.svg` | empilhada (fundo claro, fundo escuro, com o slogan) |
| `logo-horizontal.svg` | símbolo + palavra; acompanha o tema claro/escuro do sistema (usada no login e na página inicial do repositório) |
| `logo-horizontal-dark.svg` | para fundos escuros |
| `icon.svg`, `icon-192.png`, `icon-512.png` | ícone do app (verde-escuro, barras coloridas) |
| `icon-maskable.svg`, `icon-maskable-512.png`, `apple-touch-icon.png` | ícones sem cantos, para Android e iPhone |
| `icon-alt.svg` | variante verde com barras brancas (não usada no app) |

- **Tela de abertura:** o Ritmo no centro e "por Psicoterapia e Afins" embaixo, pequeno. Estática, sem animação, dura até ~1,3 s, uma vez por sessão, e fecha com um toque ou tecla. Enquanto o login carrega, a mesma tela aparece em HTML puro.
- **Modo calmo:** as barras da logo ficam numa cor só (sem laranja, lilás e azul).
- A logo é a única parte do app com várias cores vivas e gradiente: a interface continua calma, sem gradientes.

## Marca (adaptação)
| Diretriz | Como ficou no Ritmo |
|---|---|
| Fundo off-white | Areia da logo `#F2EDE3`, cartões creme `#FBF8F0` (claro) e carvão quente `#1F2326` (escuro) |
| Texto suave, sem preto puro | Verde-grafite `#26362F` (palavra da logo `#12372F` só na logo); nunca branco puro |
| Cor principal azul-esverdeada | Verde da logo `#1B6B55` (claro) / `#6FCAA8` (escuro) |
| Apoio verde-sálvia | `#DCECE3` |
| Energia/ação terracota suave | `#EC8F6C` (laranja suave da logo), só nos botões de começar e agir, com texto escuro (contraste) |
| Alerta âmbar discreto | `#FBF0DF` (âmbar claro da marca) em avisos |
| Evitar vermelho intenso, amarelo vibrante, roxo saturado, gradientes | Nenhum gradiente; lilás da marca só como cor opcional de rotina |
| Tipografia humanista | **Nunito Sans** no app todo; a palavra “ritmo” é a da logo; **Atkinson Hyperlegible** como “fonte de leitura” opcional. Fontes empacotadas no app: sem chamadas externas, funcionam offline |
| Tamanho 16–18 px, entrelinha 1,5–1,7 | 16 px, 1,6 (1,9 com espaçamento amplo); ajustável até 150% |
| 60–75 caracteres por linha | Parágrafos limitados a 70ch |

## Checklist
Legenda: ✅ segue · 🟡 segue em parte · ⚪ diferente de propósito

| Diretriz | Status | Observação |
|---|---|---|
| Visual caloroso, arredondado, cartões amplos, sem excesso de dados | ✅ | Cantos 16–20 px, uma ideia por tela |
| Ilustração simples, abstrata e inclusiva | 🟡 | Uma ilustração abstrata (boas-vindas e Hoje); some no Modo calmo. Faltam outras |
| Ícones de contorno fino, sempre com rótulo | ✅ | Traço 1,75; todos com texto |
| Movimento curto, discreto e desativável | ✅ | Só transições de cor; respiração guiada é iniciada pela pessoa; sem parallax, confete, som |
| Navegação rasa: Hoje, Tarefas, Rotinas, Regulação, Perfil | ✅ | Plano de apoio e Meus estados ficam em Regulação; ajustes e privacidade em Perfil |
| Qualquer função em até 2 toques | 🟡 | Todas as telas em ≤ 2 toques (testado). Práticas de regulação específicas levam 3 (Regulação → objetivo → prática) |
| Hoje: uma pergunta, três caminhos, uma ação sugerida; sem gráficos, metas, streaks | ✅ | Testado |
| Cartão de tarefa: primeiro passo + Começar / Adiar / Dividir (ou Simplificar) | ✅ | “Começar” é o botão principal; nunca “Concluir” |
| Tarefa em andamento: uma informação; Feito / Preciso de ajuda / Pausar; depois “próximo passo” ou “parar” | ✅ | Cronômetro é opcional |
| Rotina visual: um passo por vez, ícone, tempo, “Próximo”; sem barras de progresso nem % | ✅ | Mostra “Passo 2 de 5”, nunca porcentagem |
| Modo Calmo central: na 1ª tela, no menu e nos ajustes | ✅ | Menos cor, sem enfeites, sem movimento, só a próxima tarefa, sem lembrete diário nem vibração |
| Microcopy sem cobrança | ✅ | Varredura de todas as telas sem “falhou”, “streak”, “complete”, “registre” etc. |
| Boas-vindas: 1 frase, “Começar”, privacidade, aviso de não diagnóstico | ✅ | Como nos outros apps do repositório, o login compartilhado aparece primeiro, com “Continuar sem conta” (⚪ a diretriz pedia abrir sem cadastro; mantido o padrão do repositório). Depois vêm as boas-vindas do Ritmo, com “Começar” e “Pular e explorar” |
| Onboarding: até 3 telas, puláveis, sem diagnóstico | ✅ | Pesos do dia, jeito de receber apoio, ajustes |
| Perfil com traços (TDAH, autismo etc.) | ⚪ | O onboarding não pergunta diagnóstico (diretriz). O perfil existe só em **Perfil**, opcional e autodeclarado, a pedido da profissional |
| Estado: no máx. 3 perguntas, volta sem perder dados | ✅ | |
| Regulação por necessidade (inclui “Preciso pedir apoio”) | ✅ | 7 objetivos |
| Plano de apoio privado + “Preciso de apoio agora” sempre visível | ✅ | |
| Comunicação assistida (editar e copiar) | ✅ | |
| Ajustes: tema, baixo estímulo, fonte, contraste, som/vibração, notificações, exportar/apagar, privacidade | ✅ | Contraste: suave ou alto. Som: o app nunca toca som. Vibração: opcional e nunca no Modo calmo |
| Idioma | ⚪ | Só português do Brasil, como os demais apps do repositório (sem seletor de idioma) |
| Alvos ≥ 44 px | ✅ | Menor medido: 48 px em 19 telas |
| Teclado e leitor de tela | 🟡 | axe sem violações, foco visível, título focado ao trocar de tela. Falta teste com leitor de tela real |
| Alternativas a arrastar; tempo ajustável; pausar movimento | ✅ | Sem arrastar; estimativas editáveis; nada avança sozinho |
| Autenticação simples | ✅ | Opcional; login compartilhado do repositório |

## Da evidência à função (conversa do Perplexity, 2026-11-11)
**Atenção:** as fontes abaixo foram citadas pelo Perplexity. Não consegui abri-las (o ambiente de desenvolvimento não alcança PubMed Central nem Springer), então **não foram conferidas** e nenhuma citação aparece dentro do app. Antes de citar qualquer estudo em texto público, confira cada link.

| Barreira | Função no Ritmo | Status |
|---|---|---|
| Iniciar, priorizar, concluir | Tarefas em micro-passos, “Começar”, primeiro passo, adiar sem culpa | ✅ já existia |
| Memória de trabalho | **Caixa de captura** (nova), lista única, lembretes opcionais | ✅ |
| Distração e perda do fio | **“Guardei uma distração”** durante a tarefa (novo): salva na caixa e devolve à tarefa | ✅ |
| Organizar o dia por tempo (timeboxing) | **Meu dia em blocos** (novo): 3 prioridades, despejo mental e grade de horários, com sugestão automática, sem arrastar e sem cobrança | ✅ |
| Gestão do tempo | **Blocos de tempo flexíveis** (novo): 2, 10, 25 min ou o tempo da tarefa; cronômetro opcional; aviso 2 min antes do fim em blocos longos; pausa de 5 min | ✅ |
| Passo ainda grande demais | **“Dividir este passo em passos menores”** (novo), em “Preciso de ajuda” | ✅ |
| Sobrecarga sensorial | Registro sensorial + Modo calmo | ✅ já existia |
| Instruções vagas, imprevisibilidade | Rotinas visuais com alerta antes da transição | ✅ já existia |
| Pedir acomodações | Mensagens prontas (novo modelo: prioridades e instruções por escrito) | ✅ |
| Culpa e autocrítica | Linguagem compassiva, sem streak, ranking ou punição | ✅ |
| Acessibilidade de texto/contraste | Painel de ajustes | ✅ |
| Estado atual | Hoje: 3 caminhos; **2 a 3 sugestões**, não 1 (decisão original da profissional) | ⚪ |
| Testes com pessoas neurodivergentes antes do lançamento | Processo, não função | ❌ ainda não feito |
