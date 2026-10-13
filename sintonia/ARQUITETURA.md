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
| Arquivos | `index.html`, `style.css`, `extra.css` (herdados), `sintonia.css`, `app.js`, `sw.js`, `manifest.json`, `assets/` | `style.css` e `extra.css` são os mesmos do Aurora (design system da marca). A cor própria da Sintonia é o lavanda (`--lav`, `--lav-d`) |
| Estado | `localStorage`, chaves `sintonia_*` | Ver "Chaves de dados" |
| Navegação | `SCREENS` + `goTo()` + uma `render*()` por tela | Telas: Treinar (início), Sessão, Depois, Registro salvo, Progresso, Aprender. Sessão, Depois e Registro salvo escondem a barra de navegação (classe `foco` no `body`) |
| Offline | `sw.js` (HTML network-first, assets cache-first). **Incrementar `CACHE_VERSION` a cada deploy** | `/auth/` e `/shared/` sempre da rede |
| Login/sync | `../auth/auth.js` (conta por convite, "usar sem conta", sincronização), `data-storage-keys` lista as chaves sincronizadas | Igual aos outros apps. **Depende da migração 14 em `supabase/schema.sql`** para a sincronização funcionar |
| Painel | **Ainda não há** projeção para o painel da profissional | Hoje a pessoa leva os dados por "Copiar resumo" (Progresso) ou pelos arquivos de Aprender → Seus dados |
| Pesquisa | Nenhuma (`data-pesquisa="nao"`) | Igual ao Aurora |

### Chaves de dados
`sintonia_sessoes` · `sintonia_ob` (sincronizadas) e `sintonia_cfg` (volume, duração e voz: só neste aparelho)

Cada sessão guarda: `id`, `iso`, `modo` (`full`/`short`), `planejado` e `feito` (segundos), `completa`, `antes` e `depois` (`{w, s, c}`, de 0 a 10 ou `null` quando a pessoa não deu nota) e `nota` (texto livre).

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
- **Migração do banco** (`supabase/schema.sql`, seção 14): liberar `app = 'sintonia'` em `app_dados` antes de convidar pessoas para usar conta.
- **Painel da profissional:** criar a projeção `projecao_sintonia` (somente números: data, duração, completa, notas antes e depois; o texto livre só com permissão da pessoa) e `shared/sintonia-painel.js`, como no Aurora.
- O áudio depende de o navegador manter a página viva: a sessão pausa se a tela for para segundo plano (comportamento intencional). No iPhone, o modo silencioso bloqueia o som.
- Possíveis próximos passos: escolher o conjunto de sons, lembrete diário opcional (como no Aurora) e testes com pessoas reais, incluindo quem usa leitor de tela.
