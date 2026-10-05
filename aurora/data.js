/* data.js — conteúdo do Aurora (atividades, exercícios e artigos).
   Portado SEM alterações de texto do app anterior em React (aurora/src/utils/activities.js,
   pages/Emotions.jsx e pages/Learn.jsx). Só foram removidos os campos de cor do Tailwind,
   que não fazem parte do conteúdo. Para editar um texto, edite aqui. */

const CATEGORIES = {
  corpo: { label: 'Corpo e Movimento', emoji: '🏃', color: 'sage' },
  social: { label: 'Conexão Social', emoji: '👥', color: 'calm' },
  natureza: { label: 'Natureza', emoji: '🌿', color: 'sage' },
  criatividade: { label: 'Criatividade', emoji: '🎨', color: 'purple' },
  conquista: { label: 'Conquistas', emoji: '✅', color: 'warm' },
  prazer: { label: 'Prazer e Lazer', emoji: '😊', color: 'rose' },
  cuidado: { label: 'Autocuidado', emoji: '💛', color: 'warm' },
}

// Atividades de ativação comportamental (Martell, Addis & Jacobson, 2001; Lewinsohn).
const ACTIVITIES = [
  // Corpo e Movimento (strong evidence: Blumenthal et al., 1999; Kvam et al., 2016)
  { id: 'walk_10', category: 'corpo', label: 'Caminhada de 10 minutos', duration: '10 min', evidence: 'Reduz sintomas depressivos em até 30%' },
  { id: 'walk_30', category: 'corpo', label: 'Caminhada de 30 minutos', duration: '30 min', evidence: 'Eficácia comparável a antidepressivos para depressão leve-moderada' },
  { id: 'stretch', category: 'corpo', label: 'Alongamento suave', duration: '10 min', evidence: 'Ativa o sistema nervoso parassimpático' },
  { id: 'dance', category: 'corpo', label: 'Dançar por uma música', duration: '5 min', evidence: 'Eleva dopamina e endorfinas' },
  { id: 'yoga', category: 'corpo', label: 'Yoga ou tai chi', duration: '20 min', evidence: 'Reduz cortisol e melhora humor' },
  { id: 'bike', category: 'corpo', label: 'Pedalar ou nadar', duration: '30 min', evidence: 'Aeróbico moderado com forte evidência antidepressiva' },

  // Conexão Social (Cacioppo & Patrick, 2008; Holt-Lunstad et al.)
  { id: 'call_friend', category: 'social', label: 'Ligar para um amigo ou familiar', duration: '15 min', evidence: 'Ativação do sistema de recompensa social' },
  { id: 'message', category: 'social', label: 'Mandar uma mensagem carinhosa', duration: '5 min', evidence: 'Fortalece vínculos mesmo à distância' },
  { id: 'meet_person', category: 'social', label: 'Encontrar alguém pessoalmente', duration: '1h', evidence: 'Contato presencial é o mais protetor contra depressão' },
  { id: 'pet', category: 'social', label: 'Brincar com um animal de estimação', duration: '10 min', evidence: 'Oxitocina e redução de cortisol' },
  { id: 'volunteer', category: 'social', label: 'Fazer algo por alguém', duration: '20 min', evidence: 'Altruísmo ativa circuitos de recompensa' },

  // Natureza (Bratman et al., 2015)
  { id: 'park', category: 'natureza', label: 'Sentar num parque ou jardim', duration: '15 min', evidence: 'Reduz ruminação e ativa o sistema de calma' },
  { id: 'sunlight', category: 'natureza', label: 'Tomar sol da manhã', duration: '10 min', evidence: 'Regula melatonina e serotonina' },
  { id: 'plant', category: 'natureza', label: 'Cuidar de uma planta', duration: '10 min', evidence: 'Conecta com ciclos naturais e promove calma' },
  { id: 'water', category: 'natureza', label: 'Ouvir sons da natureza (água, vento)', duration: '10 min', evidence: 'Ativa resposta de relaxamento' },

  // Criatividade
  { id: 'draw', category: 'criatividade', label: 'Desenhar ou colorir', duration: '15 min', evidence: 'Induz estado de fluxo e reduz ansiedade' },
  { id: 'write_story', category: 'criatividade', label: 'Escrever uma história curta', duration: '20 min', evidence: 'Expressão criativa como processamento emocional' },
  { id: 'music', category: 'criatividade', label: 'Tocar um instrumento ou cantar', duration: '15 min', evidence: 'Sincronização neural e elevação de humor' },
  { id: 'cook', category: 'criatividade', label: 'Cozinhar algo especial', duration: '30 min', evidence: 'Atividade de maestria com reforço imediato' },
  { id: 'craft', category: 'criatividade', label: 'Artesanato ou trabalho manual', duration: '20 min', evidence: 'Estado de fluxo e senso de controle' },

  // Conquistas (Bandura, 1997 - self-efficacy)
  { id: 'small_task', category: 'conquista', label: 'Completar uma tarefa pequena', duration: '10 min', evidence: 'Cada pequena conquista reconstrói autoeficácia' },
  { id: 'organize', category: 'conquista', label: 'Organizar um espaço pequeno', duration: '15 min', evidence: 'Senso de controle e ambiente ordenado melhora humor' },
  { id: 'learn', category: 'conquista', label: 'Aprender algo novo por 10 min', duration: '10 min', evidence: 'Curiosidade e crescimento ativam recompensa' },
  { id: 'plan_day', category: 'conquista', label: 'Planejar o dia no papel', duration: '5 min', evidence: 'Estrutura reduz paralisia depressiva' },
  { id: 'read', category: 'conquista', label: 'Ler por 15 minutos', duration: '15 min', evidence: 'Engajamento cognitivo e escape saudável' },

  // Prazer e Lazer (Pleasant Events Schedule - Lewinsohn)
  { id: 'movie', category: 'prazer', label: 'Assistir um episódio de uma série', duration: '45 min', evidence: 'Reforço de atividades prazerosas' },
  { id: 'bath', category: 'prazer', label: 'Banho quente e relaxante', duration: '15 min', evidence: 'Regulação térmica associada à calma' },
  { id: 'music_listen', category: 'prazer', label: 'Ouvir músicas favoritas', duration: '20 min', evidence: 'Dopamina e memórias positivas' },
  { id: 'game', category: 'prazer', label: 'Jogar um jogo que aprecia', duration: '30 min', evidence: 'Engajamento e senso de competência' },
  { id: 'coffee', category: 'prazer', label: 'Tomar um café/chá com calma', duration: '10 min', evidence: 'Ritual de autocuidado e desaceleração' },

  // Autocuidado (sleep hygiene, nutrition evidence)
  { id: 'sleep_routine', category: 'cuidado', label: 'Ir dormir no mesmo horário', duration: '–', evidence: 'Sono regular é fator chave na recuperação da depressão' },
  { id: 'meal', category: 'cuidado', label: 'Fazer uma refeição nutritiva', duration: '20 min', evidence: 'Nutrição afeta diretamente neurotransmissores' },
  { id: 'hydrate', category: 'cuidado', label: 'Beber água ao longo do dia', duration: '–', evidence: 'Desidratação piora fadiga e humor' },
  { id: 'breathe', category: 'cuidado', label: 'Respiração lenta por 5 min (4-7-8)', duration: '5 min', evidence: 'Ativa nervo vago e reduz ativação simpática' },
  { id: 'screen_off', category: 'cuidado', label: 'Ficar 30 min sem telas antes de dormir', duration: '30 min', evidence: 'Melhora qualidade do sono e reduz ruminação noturna' },
]

// Exercícios de emoções positivas (Fredrickson, 2009; Seligman, 2011; Emmons & McCullough, 2003).
const EXERCISES = [
  {
    id: 'savor',
    title: 'Saborear o Momento',
    emoji: '🌸',
    duration: '5 min',
    theory: 'Saborear (savoring) amplia emoções positivas já presentes, contrabalanceando o viés negativo da depressão. Evidência: Bryant & Veroff (2007).',
    steps: [
      'Encontre algo agradável ao seu redor — pode ser luz, uma textura, um cheiro, uma lembrança.',
      'Feche os olhos e concentre toda a atenção nessa experiência por 2 minutos.',
      'Observe cada detalhe: cor, forma, sensação, temperatura.',
      'Deixe a experiência se expandir. Não pressa. Apenas esteja com ela.',
      'Ao terminar, diga para si mesmo: "Eu mereço momentos como esse."',
    ],
  },
  {
    id: 'gratitude_3',
    title: '3 Coisas Boas',
    emoji: '✨',
    duration: '5-10 min',
    theory: 'Identificar 3 coisas positivas diariamente por 2 semanas reduz depressão e aumenta bem-estar em estudos de Seligman et al. (2005). O cérebro aprende a notar o positivo.',
    steps: [
      'Pegue papel e caneta (escrever à mão potencializa o efeito).',
      'Pense em 3 coisas boas que aconteceram hoje — podem ser pequenas.',
      'Para cada uma, escreva: O que aconteceu? Por que foi bom? Qual foi seu papel nisso?',
      'Leia o que escreveu em voz alta, lentamente.',
      'Guarde o papel. Ao longo do tempo, você vai acumular evidências de que há coisas boas na vida.',
    ],
  },
  {
    id: 'kindness',
    title: 'Ato de Bondade',
    emoji: '💛',
    duration: '10 min',
    theory: 'Praticar atos de bondade aumenta afeto positivo e autoestima (Lyubomirsky, 2005). A conexão com o outro é um dos antidepressivos naturais mais potentes.',
    steps: [
      'Pense em alguém em sua vida — um familiar, amigo, colega, ou até um desconhecido.',
      'Escolha um ato de bondade pequeno e concreto: uma mensagem, um elogio genuíno, ajudar em algo.',
      'Faça agora. Não adie. O poder está na ação imediata.',
      'Observe como você se sente durante e após o gesto.',
      'Registre mentalmente: "Eu contribuí com algo positivo no mundo hoje."',
    ],
  },
  {
    id: 'body_scan',
    title: 'Escaneamento Corporal',
    emoji: '🌊',
    duration: '8 min',
    theory: 'Mindfulness corporal desconecta a ruminação e ativa o sistema nervoso parassimpático. Eficaz como complemento no tratamento da depressão (MBCT — Segal, Williams & Teasdale, 2002).',
    steps: [
      'Deite-se ou sente-se confortavelmente. Feche os olhos.',
      'Comece pelos pés: observe qualquer sensação — temperatura, contato, formigamento. Sem julgamento.',
      'Suba lentamente: pernas, quadril, abdômen, peito, costas, ombros, braços, mãos.',
      'Observe o rosto: mandíbula, olhos, testa. Permita que se relaxem.',
      'Respire fundo e volte ao seu corpo inteiro. Você está aqui, agora.',
    ],
  },
  {
    id: 'love_kindness',
    title: 'Bondade Amorosa (Metta)',
    emoji: '💚',
    duration: '10 min',
    theory: 'Loving-kindness meditation aumenta emoções positivas, autocompaixão e reduz autocrítica — componente central da depressão (Hofmann et al., 2011).',
    steps: [
      'Sente-se confortavelmente e feche os olhos. Respire fundo três vezes.',
      'Visualize a si mesmo. Repita em silêncio: "Que eu esteja bem. Que eu seja feliz. Que eu esteja livre do sofrimento."',
      'Agora visualize alguém que você ama. Repita os mesmos desejos para essa pessoa.',
      'Visualize alguém neutro — um conhecido, um vizinho. Repita os desejos.',
      'Por fim, expanda para todas as pessoas: "Que todos estejam bem. Que todos sejam felizes."',
    ],
  },
  {
    id: 'best_self',
    title: 'Melhor Versão de Você',
    emoji: '🌟',
    duration: '10 min',
    theory: 'Imaginar o melhor eu possível (Best Possible Self) aumenta otimismo e expectativas positivas — reduz indefensabilidade aprendida associada à depressão (King, 2001).',
    steps: [
      'Pegue papel e caneta. Vá a um lugar tranquilo.',
      'Imagine sua vida daqui a 1-2 anos, depois de superar o momento atual.',
      'Escreva sobre essa versão de você: Como você está? O que você faz? Como se relaciona?',
      'Não filtre. Deixe fluir qualquer coisa positiva que vier à mente.',
      'Leia o que escreveu. Essa versão de você já existe em potência — e está sendo construída agora.',
    ],
  },
  {
    id: 'breathing_478',
    title: 'Respiração 4-7-8',
    emoji: '🌬️',
    duration: '5 min',
    theory: 'A respiração controlada ativa o nervo vago e o sistema parassimpático, reduzindo ativação ansiosa que alimenta o ciclo depressivo (Zaccaro et al., 2018).',
    steps: [
      'Sente-se ereto, ombros relaxados, mãos sobre as pernas.',
      'Inspire pelo nariz contando mentalmente até 4.',
      'Segure o ar contando até 7 — sem tensão, apenas retenção suave.',
      'Expire pela boca contando até 8, emitindo um som suave de "fsh".',
      'Repita o ciclo 4 vezes. Com a prática, você terá uma ferramenta poderosa de autorregulação.',
    ],
  },
  {
    id: 'positive_memory',
    title: 'Viagem de Memória Positiva',
    emoji: '📷',
    duration: '8 min',
    theory: 'Revisitar memórias positivas reativa circuitos de recompensa e contrabalança a tendência depressiva de recuperar apenas memórias negativas (Werner-Seidler & Moulds, 2011).',
    steps: [
      'Feche os olhos e respire fundo. Permita que sua mente vague pelo passado.',
      'Procure um momento em que você se sentiu bem — paz, alegria, conexão, orgulho.',
      'Reviva essa memória em detalhes: onde você estava, quem estava com você, o que sentiu no corpo.',
      'Fique nessa memória por 3-4 minutos. Permita que as emoções retornem.',
      'Ao abrir os olhos, lembre-se: você já viveu momentos bons. E viverá de novo.',
    ],
  },
]

// Artigos de psicoeducação.
const ARTICLES = [
  {
    id: 'what_depression',
    emoji: '🧠',
    title: 'O que é depressão?',
    subtitle: 'Muito além de tristeza',
    content: [
      {
        heading: 'Uma condição biopsicossocial',
        text: 'A depressão não é fraqueza, preguiça ou falta de força de vontade. É uma condição médica reconhecida que envolve alterações em neurotransmissores (serotonina, dopamina, noradrenalina), estrutura cerebral e padrões de pensamento.',
      },
      {
        heading: 'Sintomas comuns',
        text: 'Humor deprimido na maior parte do dia · Perda de prazer em atividades antes agradáveis (anedonia) · Fadiga e falta de energia · Dificuldade de concentração · Sentimentos de inutilidade ou culpa · Alterações no sono e apetite · Pensamentos sobre morte.',
      },
      {
        heading: 'Prevalência',
        text: 'A OMS estima que 280 milhões de pessoas vivem com depressão globalmente. No Brasil, é a condição de saúde mental mais prevalente. Você não está sozinho.',
      },
      {
        heading: 'Quando buscar ajuda',
        text: 'Se os sintomas persistem por mais de 2 semanas ou afetam sua função diária, busque um profissional de saúde mental. Este app é um complemento — não substitui tratamento profissional.',
      },
    ],
  },
  {
    id: 'ba_model',
    emoji: '⚡',
    title: 'Ativação Comportamental',
    subtitle: 'A ciência por trás do movimento',
    content: [
      {
        heading: 'O ciclo da depressão',
        text: 'A depressão cria um ciclo vicioso: humor baixo → evitação de atividades → menos reforço positivo → humor ainda mais baixo. A Ativação Comportamental (BA) rompe esse ciclo de forma direta.',
      },
      {
        heading: 'A evidência',
        text: 'Martell, Addis e Jacobson (2001) demonstraram que a BA sozinha é tão eficaz quanto a Terapia Cognitivo-Comportamental completa para depressão moderada a grave. É uma das intervenções com mais suporte empírico disponíveis.',
      },
      {
        heading: 'Como funciona na prática',
        text: 'Identificamos atividades que trazem prazer e sensação de conquista. Programamos essas atividades mesmo quando o humor está baixo. Registramos o humor antes e depois. Com o tempo, o humor melhora — porque seguiu a ação, não o contrário.',
      },
      {
        heading: 'Atividades de maestria vs prazer',
        text: 'Equilibre dois tipos: Maestria (atividades que dão senso de competência, como organizar algo) e Prazer (atividades agradáveis, como ouvir música). Os dois tipos são necessários para uma recuperação completa.',
      },
      {
        heading: 'A regra dos 5 minutos',
        text: 'Não espere motivação para começar. Comprometa-se com apenas 5 minutos. Quase sempre, uma vez que você começa, a ativação aumenta. E mesmo que não aumente, 5 minutos já contam.',
      },
    ],
  },
  {
    id: 'positive_psychology',
    emoji: '🌻',
    title: 'Psicologia Positiva',
    subtitle: 'Não é sobre "pensar positivo"',
    content: [
      {
        heading: 'O que é psicologia positiva?',
        text: 'É o estudo científico do que faz a vida valer a pena: bem-estar, forças, virtudes e florescimento humano. Foi fundada por Martin Seligman e tem décadas de pesquisa sólida.',
      },
      {
        heading: 'Teoria do Ampliar-e-Construir (Fredrickson, 2001)',
        text: 'Emoções positivas ampliam nossa atenção, pensamento e repertório de ações. Ao longo do tempo, constroem recursos duradouros: resiliência, habilidades sociais, saúde física. Este é o mecanismo científico por trás dos exercícios do app.',
      },
      {
        heading: 'Gratidão funciona?',
        text: 'Sim, com ressalvas. Estudos (Emmons & McCullough, 2003; Seligman et al., 2005) mostram que escrever 3 coisas boas diariamente por 2 semanas reduz sintomas depressivos e aumenta bem-estar — efeitos que duram meses.',
      },
      {
        heading: 'Forças de caráter',
        text: 'Todo ser humano tem forças únicas (criatividade, coragem, bondade, curiosidade etc.). Identificar e usar suas forças na vida diária está entre as intervenções com maior tamanho de efeito na psicologia positiva.',
      },
      {
        heading: 'Autocompaixão',
        text: 'Kristin Neff demonstrou que a autocompaixão (tratar a si mesmo com a mesma gentileza que trataria um amigo) é superior à autoestima como protetor de saúde mental — e é especialmente importante na depressão, onde a autocrítica é intensa.',
      },
    ],
  },
  {
    id: 'mind_body',
    emoji: '🏃',
    title: 'Corpo e Cérebro',
    subtitle: 'Exercício, sono e alimentação',
    content: [
      {
        heading: 'Exercício como antidepressivo',
        text: 'Uma revisão de 2016 (Kvam et al.) analisou 23 estudos e concluiu que o exercício aeróbico tem eficácia comparável a antidepressivos para depressão leve a moderada. O mecanismo envolve BDNF, serotonina, endorfinas e neurogênese no hipocampo.',
      },
      {
        heading: 'Quanto exercício?',
        text: '150 minutos por semana de atividade moderada (caminhada rápida, natação, dança) já é suficiente para obter benefícios. Começar com 10 minutos por dia e aumentar gradualmente é uma estratégia validada.',
      },
      {
        heading: 'Sono e depressão',
        text: 'Sono e depressão têm relação bidirecional: cada um piora o outro. Horários regulares de sono, evitar telas 1h antes de dormir, e técnicas de relaxamento são componentes do tratamento. A privação de sono piora regulação emocional de forma aguda.',
      },
      {
        heading: 'Alimentação e humor',
        text: 'O eixo intestino-cérebro é real: 90% da serotonina do corpo é produzida no intestino. Dietas ricas em vegetais, peixes e probióticos estão associadas a menor risco de depressão (Jacka et al., 2017). Açúcar em excesso piora inflamação e humor.',
      },
      {
        heading: 'Luz solar',
        text: 'Exposição à luz natural pela manhã regula o ritmo circadiano, aumenta serotonina e melatonina. Em países com pouca luz solar no inverno, a Terapia de Luz tem evidência forte para depressão sazonal e benefício geral para depressão.',
      },
    ],
  },
  {
    id: 'therapy',
    emoji: '💬',
    title: 'Terapia Baseada em Evidências',
    subtitle: 'O que a ciência diz sobre tratamento',
    content: [
      {
        heading: 'Terapia Cognitivo-Comportamental (TCC)',
        text: 'A abordagem mais estudada para depressão. Trabalha a relação entre pensamentos, emoções e comportamentos. Meta-análises mostram eficácia superior a lista de espera e comparável a medicação, com menor taxa de recaída.',
      },
      {
        heading: 'Ativação Comportamental (BA)',
        text: 'Componente da TCC com eficácia autônoma comprovada. Foca na mudança comportamental sem necessariamente reestruturar cognições. Especialmente útil quando há paralisia e inação.',
      },
      {
        heading: 'Terapia de Aceitação e Compromisso (ACT)',
        text: 'Baseada em flexibilidade psicológica, aceitação de experiências internas e ação guiada por valores. Evidência crescente para depressão, especialmente para reduzir ruminação e evitação experiencial.',
      },
      {
        heading: 'Terapia Interpessoal (TIP)',
        text: 'Foca em relações interpessoais e transições de vida. Eficaz especialmente quando a depressão está ligada a perdas, conflitos ou mudanças de papel social.',
      },
      {
        heading: 'Medicação',
        text: 'Antidepressivos (ISRS, IRSN e outros) têm eficácia comprovada para depressão moderada a grave. Combinação de medicação e psicoterapia costuma ter melhores resultados. Sempre com prescrição e acompanhamento médico.',
      },
      {
        heading: 'Este app',
        text: 'As intervenções neste app são baseadas em evidências e podem ser usadas como autoajuda estruturada ou como complemento ao tratamento profissional. Não substituem diagnóstico nem tratamento especializado.',
      },
    ],
  },
  {
    id: 'crisis',
    emoji: '🆘',
    title: 'Em Crise? Aqui Está Ajuda',
    subtitle: 'Recursos de emergência',
    content: [
      {
        heading: 'CVV — Centro de Valorização da Vida',
        text: 'Ligue 188 (gratuito, 24h) ou acesse cvv.org.br. Escuta empática e sigilosa para pessoas em sofrimento emocional ou crise suicida.',
      },
      {
        heading: 'CAPS — Centro de Atenção Psicossocial',
        text: 'Serviço público gratuito do SUS para saúde mental. Encontre o mais próximo na prefeitura ou secretaria de saúde do seu município.',
      },
      {
        heading: 'UPA / Pronto-Socorro',
        text: 'Em situação de risco imediato, vá a uma UPA ou pronto-socorro. Crise psiquiátrica é emergência médica e deve ser tratada como tal.',
      },
      {
        heading: 'Se você está pensando em se machucar',
        text: 'Você não precisa enfrentar isso sozinho. Ligue 188 agora. Ou fale com alguém de confiança. Cada momento de ajuda é um passo para ficar.',
      },
    ],
  },
]
