/* ═══════════════════════════════════════════════════════════════════════
   Trilha — cenarios.js
   Treino social e de pensamentos. Conteúdo próprio, escrito para adolescentes, a partir das estratégias
   observadas nos jogos do Psicoterapia e Afins (aprendizagem por problema, feedback explicado para CADA opção
   com rótulo do estilo, dica de aprendizagem, glossário das distorções, dificuldade progressiva e
   micro-ação), sem a pontuação punitiva (sequência, % de acerto, ❌) e sem o visual intenso.

   Cenário: { id, tipo:'social'|'pens', hab (social) | arm (pens), nivel 1–3, e, titulo, situacao, contexto?,
              pens? (o pensamento automático, só em 'pens'), dicaSocial? (leitura de sinais, só em 'social'),
              ops:[{ t, r (rótulo do estilo), ok, x (por que) }], dica (para guardar), micro (micro-ação sugerida) }
   Ids: a-z 0-9 _ - (até 30). Vão para o banco como escolhas (c) e números (n), nunca como texto.
   Conteúdo psicoeducativo, não é tratamento: conferir com a profissional antes do uso clínico.
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var SOCIAIS = [
    { id: 'soc_conversar', tipo: 'social', hab: 'Começar conversas', nivel: 1, e: '👋', titulo: 'Chegando numa turma nova',
      situacao: 'É seu primeiro dia numa turma nova. No intervalo, você vê um colega sentado sozinho perto da quadra.',
      contexto: 'Ele está mexendo no celular, mas de vez em quando olha em volta. Não parece estar com pressa.',
      dicaSocial: 'Sinais para observar: ele olha em volta de vez em quando, o que costuma indicar abertura para uma conversa. Mas ele pode dizer “agora não”, e tudo bem: isso não é rejeição pessoal.',
      ops: [
        { t: 'Que celular legal! Qual é o modelo?', r: 'Comentário sobre algo pessoal', ok: false, x: 'Pode funcionar, mas como primeira frase soa invasivo: vocês ainda nem se apresentaram.' },
        { t: 'Oi! Sou novo/a aqui. Posso sentar contigo?', r: 'Apresentação simples + pedido educado', ok: true, x: 'É direta, educada e dá à pessoa a chance de dizer sim ou não. Quem recebe sabe o que fazer.' },
        { t: 'Ficar de longe, esperando alguém me chamar', r: 'Esperar sem tomar iniciativa', ok: false, x: 'É compreensível quando se tem medo, mas perde a chance de treinar e pode parecer desinteresse, mesmo não sendo.' },
        { t: 'Essa escola é péssima, né?', r: 'Quebra-gelo negativo', ok: false, x: 'Começar com reclamação costuma deixar o clima pesado logo no início.' }],
      dica: 'Para começar uma conversa: oi, quem você é e um pedido ou pergunta simples. Não precisa ser engraçado nem perfeito.',
      micro: 'Cumprimentar uma pessoa da turma e dizer seu nome.' },

    { id: 'soc_sinais', tipo: 'social', hab: 'Ler sinais sociais', nivel: 1, e: '👀', titulo: 'Sinais de desconforto',
      situacao: 'Você está contando uma história empolgante para um amigo. Ele cruzou os braços, olha para o lado, responde “ah” e “sei” e mexe o pé.',
      contexto: 'Vocês conversam há 15 minutos. O jeito dele mudou nos últimos 5.',
      dicaSocial: 'Sinais que costumam indicar desconforto ou desinteresse: braços cruzados, olhar desviado, respostas curtas e inquietação. Eles podem ter outras causas (cansaço, preocupação), por isso perguntar é melhor do que adivinhar.',
      ops: [
        { t: '“Ele está prestando atenção. Vou continuar.”', r: 'Ignorar os sinais', ok: false, x: 'Os sinais indicam o contrário de atenção total. Seguir sem checar pode aumentar o desconforto.' },
        { t: 'Parar de falar de repente e ir embora', r: 'Reação extrema', ok: false, x: 'Deixa a outra pessoa confusa e não resolve nada.' },
        { t: '“Vou falar mais alto e dar mais detalhes.”', r: 'Intensificar', ok: false, x: 'Aumentar a intensidade quando o outro está desconfortável costuma piorar.' },
        { t: '“Parece que você está cansado ou com a cabeça longe. Quer mudar de assunto?”', r: 'Notar o sinal e perguntar', ok: true, x: 'Você leu o sinal sem assumir o motivo e ofereceu uma saída fácil. Isso é cuidado e habilidade social.' }],
      dica: 'Sinais não-verbais são pistas, não certezas. O melhor caminho é notar e checar com delicadeza.',
      micro: 'Observar, numa conversa, dois sinais da outra pessoa (olhar, postura, tom) e checar com uma pergunta.' },

    { id: 'soc_assertividade', tipo: 'social', hab: 'Assertividade', nivel: 2, e: '🗣️', titulo: 'O colega que some no trabalho em grupo',
      situacao: 'Num trabalho em grupo, um colega não fez a parte dele. A entrega é na sexta e você está irritado/a.',
      contexto: 'Vocês se dão bem e ele nunca tinha falhado antes. Ninguém falou com ele ainda.',
      ops: [
        { t: 'Fazer a parte dele em silêncio', r: 'Passivo: engolir e compensar', ok: false, x: 'Resolve hoje, mas costuma gerar ressentimento, e ele nem fica sabendo que isso incomodou.' },
        { t: '“Você nunca faz nada! Que preguiça!”', r: 'Agressivo: ataque à pessoa', ok: false, x: 'Ataca quem ele é, e não o que aconteceu. Em geral só provoca defesa.' },
        { t: '“Vi que a parte de história ainda está aberta. Consegue fechar até quarta? Se precisar de ajuda, me avisa.”', r: 'Assertivo: fato + pedido + abertura', ok: true, x: 'Descreve o fato sem atacar, pede o que você precisa e deixa espaço para ele se explicar.' },
        { t: 'Postar uma indireta no status', r: 'Passivo-agressivo: indireta', ok: false, x: 'Indiretas raramente chegam como você quer e podem criar um problema novo.' }],
      dica: 'Assertivo = dizer o fato, o que você sente ou precisa e fazer um pedido claro, sem atacar e sem se anular.',
      micro: 'Pedir algo pequeno a alguém de forma clara e gentil (por exemplo, pedir para baixar o volume).' },

    { id: 'soc_feedback', tipo: 'social', hab: 'Receber feedback', nivel: 2, e: '📝', titulo: '“Seu texto está confuso”',
      situacao: 'O professor devolve sua redação e diz: “O texto está confuso. Você precisa organizar melhor as ideias.”',
      contexto: 'Você se esforçou muito e ficou chateado/a. É a primeira vez que ouve isso.',
      ops: [
        { t: '“Eu me esforcei muito! O senhor não entendeu meu estilo.”', r: 'Defensivo', ok: false, x: 'É natural sentir vontade de se defender, mas isso fecha a porta para aprender.' },
        { t: 'Ficar em silêncio e só balançar a cabeça', r: 'Silêncio', ok: false, x: 'Você perde a chance de entender o que melhorar.' },
        { t: '“Sou péssimo/a em escrever. Desculpa.”', r: 'Autodepreciação', ok: false, x: 'Vira um julgamento sobre você, e não sobre o texto, e deixa a conversa pesada.' },
        { t: '“Obrigado/a. Pode me mostrar um trecho confuso para eu entender?”', r: 'Agradecer + pedir exemplo', ok: true, x: 'Mostra abertura e transforma uma crítica vaga em algo concreto para melhorar.' }],
      dica: 'Feedback é sobre o trabalho, não sobre quem você é. Agradecer e pedir um exemplo ajuda a separar uma coisa da outra.',
      micro: 'Pedir um feedback concreto sobre algo que você fez (“o que eu poderia melhorar?”).' },

    { id: 'soc_dizernao', tipo: 'social', hab: 'Dizer não', nivel: 2, e: '🚫', titulo: '“Faz minha lição pra mim?”',
      situacao: 'Um colega pede para você fazer a lição dele porque “não deu tempo”. Você já ajudou antes e hoje não quer.',
      contexto: 'Ele costuma pedir, e você tem receio de ele ficar chateado.',
      ops: [
        { t: '“Ah… é que… sei lá… talvez… não sei…”', r: 'Hesitante', ok: false, x: 'A resposta fica confusa, e ele pode entender que ainda existe chance de você aceitar.' },
        { t: '“Hoje não vou fazer. Posso te explicar o exercício no recreio, se quiser.”', r: 'Clara + alternativa', ok: true, x: 'É clara, educada e oferece uma ajuda que não te obriga a abrir mão do que acha certo.' },
        { t: '“Você sempre pede! Aprenda a se organizar!”', r: 'Agressiva', ok: false, x: 'Transforma o “não” em briga.' },
        { t: '“Estou com dor de cabeça.”', r: 'Desculpa inventada', ok: false, x: 'Pode funcionar hoje, mas esconde o seu limite real, e o pedido volta.' }],
      dica: 'Um bom “não” é curto, claro e, se você quiser, vem com uma alternativa. Você não precisa se justificar demais.',
      micro: 'Treinar um “não” gentil numa situação pequena (por exemplo, recusar um lanche de que você não gosta).' },

    { id: 'soc_amizade', tipo: 'social', hab: 'Manter amizades', nivel: 2, e: '🤝', titulo: 'Sempre sou eu que chamo',
      situacao: 'Faz meses que é você quem chama para sair e puxa assunto. Seu amigo raramente toma a iniciativa.',
      contexto: 'Vocês se divertem juntos, mas você está cansado/a de ser sempre quem começa.',
      ops: [
        { t: 'Parar de chamar para “testar” se ele vai atrás', r: 'Teste silencioso', ok: false, x: 'Ele pode nem perceber o teste, e o silêncio vira mal-entendido.' },
        { t: 'Continuar sempre chamando, sem falar nada', r: 'Engolir', ok: false, x: 'Aguentar calado/a pode acumular ressentimento.' },
        { t: '“Notei que sou eu quem sempre chama. Que tal você escolher o rolê da próxima vez?”', r: 'Dizer com clareza + sugerir', ok: true, x: 'Você explica o que sente sem acusar e propõe algo concreto.' },
        { t: 'Reclamar dele para outras pessoas', r: 'Fofoca', ok: false, x: 'Ele não fica sabendo do problema, e a relação só piora.' }],
      dica: 'Amizade é de mão dupla, e nem sempre as pessoas percebem o padrão até alguém falar com carinho.',
      micro: 'Fazer um convite a alguém e, na vez seguinte, deixar a outra pessoa escolher.' },

    { id: 'soc_conflito', tipo: 'social', hab: 'Resolver conflitos', nivel: 3, e: '⚡', titulo: 'Duas amigas brigadas',
      situacao: 'Duas amigas suas brigaram por causa de um mal-entendido. Cada uma quer que você diga que a outra está errada.',
      contexto: 'Você gosta das duas e acha que dá para resolver conversando.',
      ops: [
        { t: 'Sumir até elas resolverem', r: 'Evitação', ok: false, x: 'Pode parecer abandono para as duas, e você perde a chance de ajudar.' },
        { t: 'Dizer a cada uma que a outra errou', r: 'Agradar as duas', ok: false, x: 'Funciona na hora, mas, se descobrirem, a confiança em você se perde.' },
        { t: '“Eu gosto de vocês duas. Que tal conversarmos juntas?”', r: 'Neutralidade + convite ao diálogo', ok: true, x: 'Você não toma partido, valoriza as duas e propõe um caminho.' },
        { t: 'Escolher o lado de quem parece estar certa', r: 'Tomar partido', ok: false, x: 'Pode ferir uma amizade sem resolver o mal-entendido.' }],
      dica: 'Em conflito entre amigos, manter-se neutro e propor uma conversa conjunta costuma ajudar mais do que escolher um lado. Se houver ameaça ou violência, peça ajuda a um adulto.',
      micro: 'Numa discordância, perguntar “o que você acha?” antes de dar a sua opinião.' },

    { id: 'soc_redes', tipo: 'social', hab: 'Redes e privacidade', nivel: 3, e: '📱', titulo: 'A foto no grupo da turma',
      situacao: 'Um colega postou, no grupo da turma, uma foto sua que te deixou constrangido/a. Algumas pessoas reagiram rindo.',
      contexto: 'Você ficou com vergonha e raiva. A foto ainda está no grupo.',
      ops: [
        { t: 'Responder no grupo com xingamentos', r: 'Reagir com agressão', ok: false, x: 'Aumenta a exposição e te coloca no centro da confusão.' },
        { t: 'Postar uma foto constrangedora dele', r: 'Retaliar', ok: false, x: 'Pode gerar um ciclo de ataques e te colocar em risco também.' },
        { t: 'Pedir no privado: “Apaga, por favor, me senti mal.” Se não apagar, guardar print e falar com um adulto de confiança ou com a coordenação', r: 'Pedir com clareza + buscar apoio', ok: true, x: 'Você afirma o limite, junta provas e pede ajuda se precisar. Ninguém precisa resolver exposição online sozinho.' },
        { t: 'Sair do grupo e fingir que nada aconteceu', r: 'Sumir', ok: false, x: 'Alivia hoje, mas a foto continua lá e você não resolveu nada nem pediu ajuda.' }],
      dica: 'Se alguém expõe você online, você pode pedir que apague, guardar provas e pedir ajuda a um adulto. Se for repetido, ameaça ou conteúdo íntimo, procure ajuda imediatamente (Disque 100, coordenação da escola e denúncia na própria plataforma).',
      micro: 'Revisar as configurações de privacidade de uma rede e ajustar quem pode te marcar.' }
  ];

  var PENSAMENTOS = [
    { id: 'pen_catastrofe', tipo: 'pens', arm: 'catastrofe', nivel: 1, e: '🎤', titulo: 'Apresentação na aula',
      situacao: 'Você vai apresentar um trabalho para a turma. Enquanto espera, nota que suas mãos estão tremendo.',
      pens: '“Todo mundo vai ver que estou nervoso e vai rir de mim. Vai ser um desastre.”',
      ops: [
        { t: '“É normal ficar nervoso. Posso respirar e fazer o meu melhor, mesmo tremendo um pouco.”', r: 'Pensamento equilibrado', ok: true, x: 'Reconhece o nervosismo como normal e foca no que dá para fazer.' },
        { t: '“Todo mundo vai rir e eu nunca mais vou conseguir olhar para eles.”', r: 'Catástrofe: imaginar o pior', ok: false, x: 'Prevê o pior cenário possível sem provas. É a mente tentando proteger, mas exagerando.' },
        { t: '“Vou fingir que estou doente.”', r: 'Evitação', ok: false, x: 'Alivia hoje, mas ensina ao cérebro que apresentar é perigoso, e o medo tende a crescer.' }],
      dica: 'Catástrofe é quando a mente salta para o pior cenário. Pergunte: qual é o pior, o melhor e o mais provável?',
      micro: 'Antes de uma situação que preocupa, escrever o pior, o melhor e o mais provável.' },

    { id: 'pen_lermentes', tipo: 'pens', arm: 'ler_mentes', nivel: 1, e: '💬', titulo: 'O grupo no intervalo',
      situacao: 'No intervalo, um grupo de colegas conversa. Você queria entrar, mas ninguém te chamou.',
      pens: '“Se quisessem que eu participasse, teriam me chamado. Eles não gostam de mim.”',
      ops: [
        { t: '“Posso chegar e dar oi. Talvez eles só não tenham pensado em me chamar.”', r: 'Pensamento equilibrado', ok: true, x: 'Não assume o que os outros pensam e escolhe uma ação pequena.' },
        { t: '“Eles com certeza não me querem ali.”', r: 'Leitura de mente', ok: false, x: 'Você não consegue ler a mente deles. Isso é uma suposição apresentada como fato.' },
        { t: '“Vou esperar alguém me chamar.”', r: 'Evitação passiva', ok: false, x: 'Esperar pode custar a chance de conexão, e o medo continua no comando.' }],
      dica: 'Leitura de mente é achar que sabe o que o outro pensa. Confira: que provas eu tenho? Existe outra explicação?',
      micro: 'Chegar em um grupo e dar um oi simples.' },

    { id: 'pen_adivinhacao', tipo: 'pens', arm: 'adivinhacao', nivel: 1, e: '🎱', titulo: 'A fila da cantina',
      situacao: 'Você está na fila da cantina atrás de um colega que parece legal, mas vocês nunca conversaram.',
      pens: '“Não tenho nada interessante para dizer. Vou parecer chato. Melhor ficar quieto.”',
      ops: [
        { t: '“Posso falar algo simples, como perguntar da aula ou comentar a comida. Conversas começam assim.”', r: 'Pensamento equilibrado', ok: true, x: 'Conversas costumam começar com coisas simples; não precisa ser brilhante.' },
        { t: '“Com certeza vou falar alguma bobagem.”', r: 'Adivinhação negativa', ok: false, x: 'Prevê o fracasso antes de tentar, como se desse para saber o futuro.' },
        { t: '“Vou esperar ter algo realmente impressionante para dizer.”', r: 'Perfeccionismo que adia', ok: false, x: 'Esperar o momento perfeito costuma significar nunca começar.' }],
      dica: 'Adivinhação negativa é prever que algo vai dar errado sem testar. Um teste pequeno diz mais do que a previsão.',
      micro: 'Fazer uma pergunta simples a alguém que você ainda não conhece bem.' },

    { id: 'pen_tudonada', tipo: 'pens', arm: 'tudo_nada', nivel: 2, e: '📊', titulo: 'A nota que não foi 10',
      situacao: 'Você estudou muito e tirou 7 numa prova. Esperava 10.',
      pens: '“Se não foi 10, foi um fracasso.”',
      ops: [
        { t: '“Não foi o que eu queria, mas 7 mostra que aprendi boa parte. Posso ver o que errei.”', r: 'Pensamento equilibrado', ok: true, x: 'Reconhece a frustração e vê o meio-termo: uma parte deu certo e há o que melhorar.' },
        { t: '“Se não é 10, é fracasso. Não adianta tentar.”', r: 'Tudo ou nada', ok: false, x: 'Só existem dois extremos: perfeito ou fracasso. A vida real tem muitos meios-termos.' },
        { t: '“Nem vou olhar a prova. Já sei que fui mal.”', r: 'Evitação', ok: false, x: 'Evitar impede de aprender com os erros.' }],
      dica: 'Tudo ou nada é enxergar só os extremos. Pergunte: existe um meio-termo?',
      micro: 'Ao avaliar algo que você fez, escrever uma coisa que foi bem e uma que pode melhorar.' },

    { id: 'pen_generaliza', tipo: 'pens', arm: 'sempre_nunca', nivel: 2, e: '♾️', titulo: 'O convite recusado',
      situacao: 'Você convidou um colega para o cinema e ele disse que não podia.',
      pens: '“Ninguém nunca quer sair comigo.”',
      ops: [
        { t: '“Ele não podia hoje. Posso chamar outra pessoa ou tentar outro dia.”', r: 'Pensamento equilibrado', ok: true, x: 'Trata o fato como um caso isolado e mantém a porta aberta.' },
        { t: '“Sempre é assim. Ninguém gosta de mim.”', r: 'Generalização: “sempre/nunca”', ok: false, x: 'Uma recusa vira regra para a vida inteira.' },
        { t: '“Nunca mais vou convidar ninguém.”', r: 'Evitação', ok: false, x: 'Protege da dor de hoje, mas fecha oportunidades.' }],
      dica: '“Sempre” e “nunca” quase nunca são verdade. Procure exceções: já houve uma vez em que foi diferente?',
      micro: 'Anotar uma situação desta semana em que alguém disse sim ou foi gentil com você.' },

    { id: 'pen_culpa', tipo: 'pens', arm: 'culpa_minha', nivel: 2, e: '🎯', titulo: 'A amiga calada',
      situacao: 'Sua melhor amiga chegou quieta e quase não falou com você no almoço.',
      pens: '“Eu fiz alguma coisa errada. A culpa é minha.”',
      ops: [
        { t: '“Pode ser algo dela. Posso perguntar se está tudo bem.”', r: 'Pensamento equilibrado', ok: true, x: 'Considera outras explicações e escolhe checar com cuidado.' },
        { t: '“Foi por minha causa, com certeza.”', r: 'Culpa minha por tudo', ok: false, x: 'Assume toda a responsabilidade por algo que pode nem ser sobre você.' },
        { t: '“Vou ficar longe para não piorar.”', r: 'Evitação', ok: false, x: 'Afastar-se pode ser lido como desinteresse e aumenta o mal-entendido.' }],
      dica: 'Nem tudo gira em torno de você. Pergunte: que outras explicações existem?',
      micro: 'Antes de concluir que a culpa é sua, listar duas outras explicações possíveis.' },

    { id: 'pen_filtro', tipo: 'pens', arm: 'so_o_ruim', nivel: 3, e: '🔍', titulo: 'Cinco elogios e uma sugestão',
      situacao: 'Você apresentou um trabalho. Cinco pessoas elogiaram e uma sugeriu melhorar a parte final.',
      pens: '“Só me lembro do erro. Foi péssimo.”',
      ops: [
        { t: '“Foram cinco elogios e uma sugestão. Valorizo o que deu certo e uso a sugestão.”', r: 'Pensamento equilibrado', ok: true, x: 'Vê o quadro completo: o que foi bom e o que pode melhorar.' },
        { t: '“Só importa a crítica. O resto foi educação.”', r: 'Só o ruim (filtro negativo)', ok: false, x: 'O filtro deixa passar só o negativo e descarta o positivo.' },
        { t: '“Nunca mais apresento nada.”', r: 'Evitação', ok: false, x: 'Uma sugestão vira motivo para desistir.' }],
      dica: 'O filtro negativo faz a mente guardar só o ruim. Pergunte: o que mais aconteceu além disso?',
      micro: 'No fim do dia, anotar 3 coisas que deram certo, mesmo pequenas.' },

    { id: 'pen_deveria', tipo: 'pens', arm: 'deveria', nivel: 3, e: '📏', titulo: 'Dar conta de tudo',
      situacao: 'Semana cheia: provas, treino e o aniversário de um amigo. Você está esgotado/a.',
      pens: '“Eu deveria dar conta de tudo. Se não der, sou fraco/a.”',
      ops: [
        { t: '“Tenho limites, como qualquer pessoa. Posso priorizar e pedir ajuda.”', r: 'Pensamento equilibrado', ok: true, x: 'Troca a regra rígida por uma visão realista e gentil.' },
        { t: '“Eu deveria conseguir. Quem não consegue é fraco.”', r: 'Regra rígida (“eu deveria”)', ok: false, x: 'Exige o impossível e transforma cansaço em defeito pessoal.' },
        { t: '“Vou desistir de tudo.”', r: 'Tudo ou nada', ok: false, x: 'Da regra impossível passa-se ao abandono total. Existe meio-termo.' }],
      dica: '“Eu deveria” cria regras duras. Pergunte: eu falaria isso para um amigo? Que regra mais gentil e realista eu poderia usar?',
      micro: 'Escolher uma tarefa da semana para adiar ou pedir ajuda.' }
  ];

  /* Mapa das armadilhas do pensamento (glossário). `arm` dos cenários aponta para estes ids. */
  var ARMADILHAS = [
    { id: 'catastrofe', e: '🌪️', n: 'Catástrofe', soa: '“Vai dar tudo errado e vai ser horrível.”', pergunta: 'Qual é o pior, o melhor e o mais provável?', eq: 'Pode ser desconfortável, mas eu dou conta.' },
    { id: 'ler_mentes', e: '🔮', n: 'Leitura de mente', soa: '“Eles acham que eu sou chato.”', pergunta: 'Que provas eu tenho? Existe outra explicação?', eq: 'Não sei o que pensam. Posso observar ou perguntar.' },
    { id: 'adivinhacao', e: '🎱', n: 'Adivinhação negativa', soa: '“Vou fracassar, nem vou tentar.”', pergunta: 'Já tentei algo parecido? O que aconteceu de verdade?', eq: 'Não dá para saber. Posso testar um pedacinho.' },
    { id: 'tudo_nada', e: '⚫', n: 'Tudo ou nada', soa: '“Se não for perfeito, fracassei.”', pergunta: 'Existe um meio-termo?', eq: 'Foi parcialmente bom, e dá para melhorar.' },
    { id: 'sempre_nunca', e: '♾️', n: '“Sempre” e “nunca”', soa: '“Eu sempre estrago tudo.”', pergunta: 'Já houve uma exceção?', eq: 'Dessa vez não deu, mas outras vezes deu.' },
    { id: 'culpa_minha', e: '🎯', n: 'Culpa minha por tudo', soa: '“Foi por minha causa.”', pergunta: 'Que outros fatores existem?', eq: 'Posso ter participado, mas não controlo tudo.' },
    { id: 'so_o_ruim', e: '🔍', n: 'Só o ruim (filtro negativo)', soa: '“Só lembro do erro.”', pergunta: 'O que mais aconteceu, além do ruim?', eq: 'Teve coisa boa e coisa a melhorar.' },
    { id: 'deveria', e: '📏', n: 'Regras rígidas (“eu deveria”)', soa: '“Eu deveria dar conta de tudo.”', pergunta: 'Essa regra é realista? Eu falaria assim com um amigo?', eq: 'Tenho limites, e pedir ajuda faz parte.' },
    { id: 'rotulo', e: '🏷️', n: 'Rótulo', soa: '“Sou um fracasso.”', pergunta: 'Isso descreve a pessoa toda ou uma situação?', eq: 'Eu errei nisso. Não sou “um erro”.' },
    { id: 'raciocinio_emocional', e: '💓', n: 'Sentir é prova', soa: '“Sinto medo, então é perigoso.”', pergunta: 'Sentir algo prova que é verdade?', eq: 'Estou com medo, e isso não significa que haja perigo.' }
  ];

  /* Pensar, sentir e agir: classificação com dificuldade progressiva (nível 1 → 3). */
  var PSA_CATS = [{ id: 'pens', l: 'Pensamento' }, { id: 'emo', l: 'Emoção e corpo' }, { id: 'acao', l: 'Ação' }];
  var PSA_FB = 'Pensamento é o que passa na cabeça (muitas vezes entre aspas). Emoção inclui o sentimento e o que o corpo sente. Ação é o que você faz. Pensamentos nem sempre vêm como frases: podem ser imagens, lembranças ou sons.';
  var PSA = [
    { id: 'psa_1', nivel: 1, e: '🎁', titulo: 'Um presente de aniversário', situacao: 'Léo ganhou um presente de aniversário.',
      itens: [{ t: '“Que presente incrível!”', c: 'pens' }, { t: 'Alegria', c: 'emo' }, { t: 'Sorrir e abraçar quem deu', c: 'acao' }, { t: 'Coração batendo de felicidade', c: 'emo' }, { t: '“Vou usar hoje mesmo”', c: 'pens' }, { t: 'Mandar mensagem agradecendo', c: 'acao' }] },
    { id: 'psa_2', nivel: 1, e: '⛈️', titulo: 'A tempestade', situacao: 'Maria tem medo de tempestade e uma está chegando.',
      itens: [{ t: '“Vai ser perigoso”', c: 'pens' }, { t: 'Fechar as janelas', c: 'acao' }, { t: 'Medo com o coração acelerado', c: 'emo' }, { t: '“Preciso me proteger”', c: 'pens' }, { t: 'Mãos suando e tremendo', c: 'emo' }, { t: 'Ficar perto da família', c: 'acao' }] },
    { id: 'psa_3', nivel: 2, e: '🚚', titulo: 'O melhor amigo mudou de cidade', situacao: 'Ana está triste porque o melhor amigo se mudou para outra cidade.',
      itens: [{ t: '“Vou sentir muita falta dele”', c: 'pens' }, { t: 'Tristeza com vontade de chorar', c: 'emo' }, { t: 'Mandar mensagem todo dia', c: 'acao' }, { t: '“A amizade vai continuar”', c: 'pens' }, { t: 'Aperto no peito', c: 'emo' }, { t: 'Marcar uma videochamada', c: 'acao' }] },
    { id: 'psa_4', nivel: 2, e: '📚', titulo: 'A prova de amanhã', situacao: 'Pedro tem uma prova importante amanhã.',
      itens: [{ t: '“Não vou conseguir”', c: 'pens' }, { t: 'Ansiedade com a barriga gelada', c: 'emo' }, { t: 'Revisar a matéria', c: 'acao' }, { t: '“Eu me preparei”', c: 'pens' }, { t: 'Nervosismo com as mãos frias', c: 'emo' }, { t: 'Respirar fundo antes de dormir', c: 'acao' }] },
    { id: 'psa_5', nivel: 3, e: '🏫', titulo: 'Escola nova', situacao: 'Sofia vai começar numa escola nova e sente de tudo um pouco.',
      itens: [{ t: '“Vou me sentir sozinha”', c: 'pens' }, { t: 'Empolgação misturada com medo', c: 'emo' }, { t: 'Visitar a escola antes', c: 'acao' }, { t: '“Posso fazer amigos”', c: 'pens' }, { t: 'Frio na barriga', c: 'emo' }, { t: 'Ficar no celular para não pensar no assunto', c: 'acao' }] },
    { id: 'psa_6', nivel: 3, e: '💬', titulo: 'Deixado de fora do grupo', situacao: 'Carlos descobriu que ficou de fora de um grupo de mensagens da turma.',
      itens: [{ t: '“Eles não gostam de mim”', c: 'pens' }, { t: 'Tristeza e raiva misturadas', c: 'emo' }, { t: 'Sair da conversa sem dizer nada', c: 'acao' }, { t: '“Talvez tenha sido esquecimento”', c: 'pens' }, { t: 'Calor no rosto e nó na garganta', c: 'emo' }, { t: 'Perguntar a um amigo se aconteceu algo', c: 'acao' }] }
  ];

  global.TRILHA_CENARIOS = { SOCIAIS: SOCIAIS, PENSAMENTOS: PENSAMENTOS, ARMADILHAS: ARMADILHAS, PSA: PSA, PSA_CATS: PSA_CATS, PSA_FB: PSA_FB };
})(window);
