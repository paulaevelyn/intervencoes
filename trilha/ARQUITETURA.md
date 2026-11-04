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
| Arquivos | `index.html`, `trilha.css`, `data.js` (conteúdo, fonte única), `app.js` (núcleo), `ferramentas.js`, `sw.js`, `manifest.json` |
| Estado | `localStorage`, chaves `trilha_*` (sincronizadas por `auth/auth.js`) |
| Orientações da profissional | tabela `trilha_orientacoes` (somente leitura para o adolescente). `auth.js` expõe `window.PeaAuth` e o evento `pea-auth-pronto`; o app lê por RLS. Cache local amarrado ao id do usuário (`trilha_orient`, não sincroniza) |
| Painel | `shared/trilha-painel.js` (leitura) e `shared/trilha-orientacoes.js` (editor), ligados em `painel/index.html` |
| Banco | `supabase/trilha.sql` (aplicado em 2026-11-04) |

### Chaves de dados
`trilha_regs` · `trilha_semanal` · `trilha_escada` · `trilha_feitos` · `trilha_lidos` · `trilha_plano` · `trilha_agenda` · `trilha_sos` · `trilha_ob` (sincronizadas) e `trilha_cfg` (nome opcional) · `trilha_orient` (cache): só neste aparelho.

Registro: `{ id, ts, date, f, n:{números}, c:{listas de ids}, t:{textos} }`. **Regra:** número, escolha (id) e texto vão em `n`, `c` e `t`;
texto livre nunca em `n`/`c`, porque esses dois chegam ao painel mesmo sem a permissão de textos (a projeção SQL filtra por tipo e formato).

## O que a profissional vê (lista branca em `projecao_trilha`)
| Sempre que o adolescente libera "números" | Só com "textos" |
|---|---|
| Emoções/corpo/impulso (ids), intensidades, antes/depois, uso das ferramentas, balanço semanal (inclui o **item de risco**), degraus (números e tentativas), tarefas feitas, módulos vistos, se o plano existe | Pensamentos, previsões, cartas, nota do balanço, descrição dos degraus, **conteúdo do plano de segurança** |

**Nunca projetado:** Caixa SOS e Ações da semana (listas pessoais).

## Decisões de cuidado (revisar com a profissional)
1. **Item de risco no Balanço semanal** ("pensei em me machucar…", 0–3, opcional). Se marcado: o app mostra cuidado e o plano de segurança, e **não avisa ninguém**. A profissional só vê se o adolescente liberar números; por isso a conversa sobre compartilhamento deve acontecer cedo em sessão. A tela diz isso com todas as letras.
2. **Sem pontos, níveis ou sequência.** "Dias com prática (14 dias)" não precisa ser consecutivo.
3. **Exposição interoceptiva (módulo 6) só em sessão.** O app orienta observar e respirar, nunca provocar sensações. Escada de enfrentamento: "só os degraus combinados".
4. **Sem escalas validadas na v1.** O balanço semanal é formulação própria (como na Sintonia). Escalas para adolescentes (por exemplo, PHQ-A, SCARED) só depois de conferir validação e licença no Brasil.
5. **Links da sessão:** só `https://` (filtrados no banco por `trilha_sanear` e de novo no app por `linkSeguro`). Todo texto da profissional entra por `esc()`/`textContent`.

## Pendências antes de usar com pacientes
- Migração aplicada e funções testadas isoladamente. **Falta testar o caminho completo com contas reais** (adolescente e profissional): leitura das orientações, sincronização, projeção e painel.
- **Consentimento de menores (LGPD e Código de Ética).** O aviso de privacidade do `auth.js` é o geral dos apps. Para adolescentes, definir fora do sistema: termo assinado pelos responsáveis + assentimento do adolescente, antes de enviar o convite. Revisar o texto com apoio jurídico/CFP (a regulamentação de atendimento mediado por tecnologia está na resolução vigente do CFP).
- Convidar a conta do adolescente (Supabase) e vincular no painel, como nos outros apps.
- Testar com adolescentes reais (linguagem, tamanho dos textos) e com leitor de tela.
- Limite técnico: cada app guarda até ~2 MB por pessoa na conta; o `auth.js` mostra "não salvou" se passar.
- Ideias fora da v1: projetar as Ações da semana (adesão), lembrete opcional, módulos por queixa (TOC, trauma), medidas validadas, painel de tarefas feitas por nome.

## Para publicar uma atualização
1. Editar os arquivos. 2. Incrementar `CACHE_VERSION` em `sw.js`. 3. `git commit` e `git push` (GitHub Pages).
