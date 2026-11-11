# Ritmo — diretrizes de design: o que segue, o que adaptamos e o que ainda falta

Base: diretrizes de design do Ritmo (calma, previsibilidade, respeito; sem “eficiência corporativa” nem motivação agressiva), adaptadas à marca **Psicoterapia e Afins** (mesma paleta e fontes dos outros apps do repositório).
Verificado em 2026-11-11 com testes automatizados (Playwright + axe) e leitura das telas. Não substitui teste com leitor de tela e com pessoas reais.

## Marca (adaptação)
| Diretriz | Como ficou no Ritmo |
|---|---|
| Fundo off-white | Areia da marca `#F7F3EF` (claro) e carvão quente `#1F2326` (escuro, igual às diretrizes) |
| Texto grafite suave, sem preto puro | Grafite da marca `#3F434B`; cartões `#FFFEFC`, nunca branco puro |
| Cor principal azul-esverdeada | Verde-menta da marca `#3D5A52` (claro) / `#8FB3A6` (escuro) |
| Apoio verde-sálvia | `#DDEAE2` (menta clara da marca) |
| Energia/ação terracota suave | `#D98E73`, só nos botões de começar e agir, com texto escuro (contraste) |
| Alerta âmbar discreto | `#FBF0DF` (âmbar claro da marca) em avisos |
| Evitar vermelho intenso, amarelo vibrante, roxo saturado, gradientes | Nenhum gradiente; lilás da marca só como cor opcional de rotina |
| Tipografia humanista | **Nunito Sans** (marca) no app todo; **Fraunces** só no nome “Ritmo”; **Atkinson Hyperlegible** como “fonte de leitura” opcional. Fontes empacotadas no app: sem chamadas externas, funcionam offline |
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
