# Trilha — Arquitetura
## Apoio entre as sessões de terapia online com adolescentes

Mesma lógica dos outros apps (Farol, Floresça, Matiz, Aurora, Sintonia): **estrutura superficial** (linguagem, cores, ícones)
pode ser adaptada; **estrutura profunda** (o que a pessoa pratica e por quê) não deve mudar sem reavaliar a evidência.
Conteúdo de base: `docs/trilha-saude-mental-adolescentes.md` (UP-A de Barlow/Ehrenreich-May + TFC de Gilbert + TCC).

## Escopo da v1 (decidido com a profissional)
- App do adolescente + leitura e edição no painel da profissional.
- **Responsáveis não acessam o sistema.** O que a família sabe é combinado em sessão.
- **Vídeo fora do sistema** (Meet/Zoom): a profissional registra data, link https e combinados; o app só mostra.
- App **não listado** em `/index.html` (acesso por link e por convite), por ser instrumento clínico.

## Arquitetura técnica
| Item | Trilha |
|---|---|
| Pilha | HTML + CSS + JS puros, sem build. `style.css` e `extra.css` são os do Aurora (design system) |
| Arquivos | `index.html`, `trilha.css`, `data.js` (módulos, forças, níveis, ferramentas: fonte única), `missoes.js` (aulas, questões e desafios dos 13 módulos), `app.js` (núcleo), `ferramentas.js`, `jogo.js` (energia, medalhas, missões, revisão, forças, acampamento), `sw.js`, `manifest.json` |
| Estado | `localStorage`, chaves `trilha_*` (sincronizadas por `auth/auth.js`) |
| Orientações da profissional | tabela `trilha_orientacoes` (somente leitura para o adolescente). `auth.js` expõe `window.PeaAuth` e o evento `pea-auth-pronto`; o app lê por RLS. Cache local amarrado ao id do usuário (`trilha_orient`, não sincroniza) |
| Painel | `shared/trilha-painel.js` (leitura) e `shared/trilha-orientacoes.js` (editor), ligados em `painel/index.html` |
| Banco | `supabase/trilha.sql` (aplicado em 2026-11-04) |

### Chaves de dados
`trilha_regs` · `trilha_semanal` · `trilha_escada` · `trilha_feitos` · `trilha_lidos` · `trilha_plano` · `trilha_agenda` · `trilha_sos` · `trilha_ob` · `trilha_jogo` · `trilha_rev` · `trilha_forcas` · `trilha_recursos` (sincronizadas) e `trilha_cfg` (nome opcional) · `trilha_orient` (cache): só neste aparelho.

Registro: `{ id, ts, date, f, n:{números}, c:{listas de ids}, t:{textos} }`. **Regra:** número, escolha (id) e texto vão em `n`, `c` e `t`;
texto livre nunca em `n`/`c`, porque esses dois chegam ao painel mesmo sem a permissão de textos (a projeção SQL filtra por tipo e formato).

## O que a profissional vê (lista branca em `projecao_trilha`)
| Sempre que o adolescente libera "números" | Só com "textos" |
|---|---|
| Emoções/corpo/impulso (ids), intensidades, antes/depois, uso das ferramentas, balanço semanal (inclui o **item de risco**), degraus (números e tentativas), tarefas feitas, módulos vistos, se o plano existe | Pensamentos, previsões, cartas, nota do balanço, descrição dos degraus, **conteúdo do plano de segurança** |

**Nunca projetado:** Caixa SOS, Ações da semana, Mochila de recursos e a Revisão espaçada (`trilha_rev`).
Com a migração `trilha_jogo`, também chegam ao painel: energia total, etapas por módulo, ids das medalhas e as forças escolhidas (exemplos escritos só com textos).

## Decisões de cuidado (revisar com a profissional)
1. **Item de risco no Balanço semanal** ("pensei em me machucar…", 0–3, opcional). Se marcado: o app mostra cuidado e o plano de segurança, e **não avisa ninguém**. A profissional só vê se o adolescente liberar números; por isso a conversa sobre compartilhamento deve acontecer cedo em sessão. A tela diz isso com todas as letras.
2. **Gamificação sem perdas (ver seção abaixo).** "Dias com prática (14 dias)" não precisa ser consecutivo. Nada de sequência que quebra.
3. **Exposição interoceptiva (módulo 6) só em sessão.** O app orienta observar e respirar, nunca provocar sensações. Escada de enfrentamento: "só os degraus combinados".
4. **Sem escalas validadas na v1.** O balanço semanal é formulação própria (como na Sintonia). Escalas para adolescentes (por exemplo, PHQ-A, SCARED) só depois de conferir validação e licença no Brasil.
5. **Links da sessão:** só `https://` (filtrados no banco por `trilha_sanear` e de novo no app por `linkSeguro`). Todo texto da profissional entra por `esc()`/`textContent`.

## Pendências antes de usar com pacientes
- Migração aplicada e funções testadas isoladamente. **Falta testar o caminho completo com contas reais** (adolescente e profissional): leitura das orientações, sincronização, projeção e painel.
- **Consentimento de menores (LGPD e Código de Ética).** O aviso de privacidade do `auth.js` é o geral dos apps. Para adolescentes, definir fora do sistema: termo assinado pelos responsáveis + assentimento do adolescente, antes de enviar o convite. Revisar o texto com apoio jurídico/CFP (a regulamentação de atendimento mediado por tecnologia está na resolução vigente do CFP).
- Convidar a conta do adolescente (Supabase) e vincular no painel, como nos outros apps.
- Testar com adolescentes reais (linguagem, tamanho dos textos) e com leitor de tela.
- Limite técnico: cada app guarda até ~2 MB por pessoa na conta; o `auth.js` mostra "não salvou" se passar.
- **Migração `supabase/trilha_jogo.sql`** (projeção do jogo e das forças, e as novas ferramentas permitidas nas tarefas): testada num Postgres local, **ainda não aplicada** no banco real. Sem ela o app funciona, mas o painel não mostra o jogo nem as forças.
- Conteúdo das missões (`missoes.js`) escrito de forma resumida: **revisar clinicamente** (principalmente módulos 6 e 8) antes de usar.
- Ideias fora da v1: projetar as Ações da semana (adesão), lembrete opcional, módulos por queixa (TOC, trauma), medidas validadas, painel de tarefas feitas por nome.

## Expedição: gamificação sem perdas e estratégias de aprendizagem
**Decisão:** modelo de domínio e aventura, tema de expedição (mapa, bússola, acampamento), 13 módulos com conteúdo resumido.
Esta camada **reverte de propósito** o princípio inicial "sem pontos, níveis ou sequência", mas preserva o motivo dele (não gerar culpa nem perfeccionismo):

| Regra | Por quê |
|---|---|
| Energia (pontos) **só sobe**; sem sequência que quebra, ranking ou tempo limite | Quem falta não perde nada; evita a culpa típica de ansiedade e perfeccionismo |
| Pontos por **completar**, nunca por acertar; questões sem nota na tela | Errar custa zero; o foco é aprender, não performar |
| Nada bloqueado: qualquer missão em qualquer ordem; a profissional só indica o "Agora" | Autonomia (teoria da autodeterminação) |
| Medalhas = habilidades aprendidas (nunca "dias seguidos") | Reforça competência, não assiduidade |
| Sem comemoração por cima de mensagem de cuidado (item de risco) | Não trivializar um sinal sério |
| Companheiros (avatar) desbloqueiam por nível; sem loja, sem compra, sem anúncios | Pertencimento e identidade, sem monetização |

**Estrutura da missão (por módulo):** *Aprender* (4 cartões, +10), *Treinar* (2 questões com explicação, +15), *Praticar* (desafio com uma ferramenta real + reflexão "ensine com suas palavras", +15), bônus +10 e medalha ao completar as três.
**Estratégias de aprendizagem aplicadas:** micro-aprendizagem; recuperação ativa com feedback imediato; **revisão espaçada** (Revisão relâmpago: intervalos 1, 3, 7, 14 e 30 dias; a correção só agenda a revisão e nunca vira placar); prática situada com as ferramentas; reflexão e ensino com as próprias palavras; forças aplicadas às missões.
**Habilidades socioemocionais (modelo CASEL):** autoconhecimento, autogestão, consciência social, relacionamentos e decisões responsáveis. Cada módulo mapeia 1 a 3 delas (`hab` em `missoes.js`) e o acampamento mostra o progresso (não é medida validada, só progresso de missões).
**Forças:** 24 forças com textos próprios, inspiradas na psicologia positiva (sem reproduzir itens de instrumentos protegidos, como o VIA). O adolescente escolhe até 5 "mais parecem comigo" e até 2 "quero desenvolver", registra exemplos e usos, e usa a "Força do dia". Elas aparecem sugeridas nos desafios das missões. **Mochila de recursos** (pessoas, lugares, atividades, o que já superou, o que sabe fazer): só da pessoa.
**Cuidados:** as lições são psicoeducação, não tratamento. Módulo 6 (sensações) e 8 (escada) reforçam que os exercícios de exposição são só com a psicóloga. Pontuação, medalhas e nível ficam no aparelho e na conta do adolescente; a profissional vê agregados (energia, etapas) apenas com a permissão de números.

## Para publicar uma atualização
1. Editar os arquivos. 2. Incrementar `CACHE_VERSION` em `sw.js`. 3. `git commit` e `git push` (GitHub Pages).
