# Bem-estar digital e design compassivo — princípios e como cada app os aplica

Estes princípios valem para **todos os apps** do repositório (Farol, Floresça, Matiz, Segurança Interna, Aurora e o painel). São diretrizes de projeto, não uma norma
certificada. A camada compartilhada `bemestar.js` / `bemestar.css` (carregada por `auth/auth.js`, que todos os apps já incluem) implementa a parte técnica; o restante
depende de texto, tom e decisões de cada app.

## O que a camada compartilhada faz (em todos os apps)

| Recurso | Para que serve |
|---|---|
| **Barra de progresso da tela** (topo) e botão **Topo** | Os celulares escondem a barra de rolagem nativa, e a pessoa não sabe se há mais conteúdo. A barra mostra o quanto da tela já foi percorrido; o botão volta ao início sem ficar "rolando para cima". Só aparece quando a tela rola. Funciona com os dois jeitos de rolar usados nos apps (contêiner interno ou janela) e tem `role="progressbar"` para leitores de tela. |
| **Barra de rolagem visível** (desktop) | Fina e com a cor da marca, para a rolagem ser perceptível sem poluir. |
| **Painel "Cuidado digital"** (botão ⚙ no topo) | Diz com clareza o que o app promete, dá **ajuda em crise (188 CVV e 192 SAMU)** em qualquer app e reúne três ajustes. |
| **Menos movimento** | Segue `prefers-reduced-motion` do aparelho e pode ser ligado ou desligado no painel; também desliga a rolagem suave. |
| **Convite de pausa** | Depois de cerca de 20 minutos de uso contínuo (contando só com a tela visível), um convite discreto: respirar, beber água, se alongar. Não bloqueia nada, pode ser adiado ou desligado para sempre, e há uma pausa guiada de 1 minuto. |
| **Ajustes lembrados** | `localStorage` (`pea_bemestar`), só no aparelho. |

## Princípios e como aparecem

### Bem-estar digital (o app serve à pessoa, não ao tempo de tela)
1. **Sem tática para prender a atenção:** sem anúncios, feed, rolagem infinita, autoplay ou contadores de "perda".
2. **Notificações pedidas, raras e gentis:** só se a pessoa ligar, no máximo uma por dia, e só se ela ainda não usou o app naquele dia (Farol, Floresça, Aurora).
3. **Fácil de sair e de pausar:** o convite de pausa; nenhum fluxo prende a pessoa (sempre há "pular", "voltar" ou "agora não").
4. **Transparência:** o painel diz o que o app faz e o que não faz com os dados.
5. **Controle dos dados:** baixar e apagar; usar **sem conta**; compartilhar com a profissional só por escolha, e o que se compartilha (números ou textos) é decidido pela própria pessoa.

### Design compassivo
1. **Linguagem sem culpa e sem julgamento:** dias difíceis "fazem parte do processo", pausas não "estragam" nada.
2. **Autonomia e escolha:** quase tudo é opcional (escalas, lembretes, compartilhamento); consentimento explícito e revogável.
3. **Segurança primeiro:** ajuda em crise sempre à mão e **ação imediata** quando uma escala indica risco (item 9 do PHQ-9 no Aurora).
4. **Carga cognitiva baixa:** telas curtas, um passo por vez, sugestão de um "passo pequeno" (Aurora), onboarding curto.
5. **Acessibilidade:** alvos de toque confortáveis, foco visível, contraste, texto simples, respeito a menos movimento, `aria-*` nos recursos novos.
6. **Sem rótulos nem comparações:** as escalas mostram números, não diagnósticos; faixas de gravidade só para a profissional; a pessoa se compara consigo mesma, não com normas.

## Auditoria por app (o que já atende e o que ainda tensiona os princípios)

Revisão com os referenciais TFC, psicologia positiva, COM-B e SDT (Teoria da Autodeterminação). Mudanças aplicadas:

| Mudança | Onde | Referencial |
|---|---|---|
| **Sem sequência que se quebra:** "🔥 N dias seguidos" virou "dias com prática nas últimas 4 semanas", que só soma | Farol, Floresça | TFC (ameaça), SDT |
| **Etapas em vez de ranking:** "Nível N — Especialista/Mestre/a" virou etapas-metáfora (Farol: Zarpando → Porto seguro; Floresça: Semente → Jardim Vivo; Matiz: Primeiros traços → Mapa vivo) | Farol, Floresça, Matiz | TFC (desempenho), psicologia positiva |
| **Reconhecimento só informativo:** sem "+15 XP" nem "Conquista:" nas mensagens ("Registrado ✓ … Isso conta."), sem "faltam N XP", sem "Dedicado/a: 300 XP"; "Conquistas" virou "Marcas do caminho" | Farol, Floresça, Matiz | SDT (motivação intrínseca) |
| **"Por que isso?"** recolhido em cada módulo/exercício/etapa (explica o sentido e lembra que a pessoa decide) | Farol, Floresça, Matiz, Aurora, Segurança Interna | SDT (autonomia) |
| **"Quando e onde você vai fazer?"** (opcional) ao programar uma atividade e nos planos | Aurora (atividades), Farol/Floresça (plano "quando-então", experimentos), Matiz (plano) | COM-B (oportunidade, pista) |
| **Pessoa de apoio** (opcional): guarda o nome só no aparelho e oferece uma frase pronta para copiar/compartilhar; nada é enviado pelo app | Farol, Floresça, Matiz, Aurora, Segurança Interna | SDT (relação/pertencimento) |

O que sustenta tudo isso fica em `shared/apoio.js` e `shared/apoio.css`, carregados por `auth/auth.js`. Os números de pontos (XP) continuam existindo internamente só para encher a barra de etapa e para o painel de pesquisa da profissional.

| App | Atende | Tensões / lacunas |
|---|---|---|
| **Farol** | Notificações opt-in e raras; apoio de crise no app; pesquisa opcional; sem conta possível; sem sequência; etapas sem ranking | A barra de etapa ainda é uma forma de progresso quantificado (informativa) |
| **Floresça** | Idem | Idem |
| **Matiz** | Sem notificações; sem sequência; progresso calculado dos registros; etapas sem ranking | **Sem ajuda em crise dentro do app** (só pelo painel ⚙) |
| **Segurança Interna** | Sem pontos, sem sequência, sem notificações; ritmo livre; "Por que isso?" e pessoa de apoio | **Sem ajuda em crise dentro do app** (só pelo painel ⚙), embora o tema possa mobilizar sofrimento |
| **Aurora** | Sem pontos nem sequência; lembrete só se não registrou; passo pequeno; retorno acolhedor; crise visível; PHQ-9 com cuidado no item 9; "quando e onde" ao programar | Lembretes locais podem não disparar se o app for encerrado (limitação técnica) |

## Sugestões ainda não aplicadas (dependem de decisão da profissional)
1. **Matiz e Segurança Interna:** acrescentar um botão visível "Preciso de ajuda agora" (como no Aurora).
2. **Pessoa de apoio:** hoje é só uma frase para copiar/compartilhar; uma ponte com a profissional (compartilhamento opcional) já existe pelo painel, mas não há canal de apoio entre pares.
3. **Modo escuro** e **ajuste de tamanho do texto** nos apps (hoje seguem o zoom do navegador).
4. **Testes com pessoas reais**, incluindo quem usa leitor de tela e quem está em sofrimento.
