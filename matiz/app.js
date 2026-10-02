document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var PREFS_KEY = 'matiz_prefs_v1';
  var PROGRESS_KEY = 'matiz_progress_v1';
  var DOSE_KEY = 'matiz_dose_v1';
  var BODYMAP_KEY = 'matiz_bodymap_v1';

  var DOSE_TAGS = ['🔍 Percebi um sinal no corpo', '🏷️ Consegui nomear a emoção', '💬 Comentei com alguém', '📝 Usei meu plano quando-então'];

  var osReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speechSupported = 'speechSynthesis' in window;

  // ---------------------------------------------------------------
  // Conteúdo conceitual (tela "O que é uma emoção?") — base teórica:
  // três componentes da emoção (Scherer), tendência de ação (Frijda),
  // expressões universais (Ekman), regulação como habilidade e não
  // como supressão (Gross), emoção como informação (EFT/Greenberg).
  // ---------------------------------------------------------------
  var concepts = [
    {
      icon: '🧩', title: 'O que é uma emoção?',
      text: 'Não é "coisa da cabeça" nem fraqueza — é informação rápida. Toda emoção tem três partes que acontecem quase juntas: <strong>uma mudança no corpo</strong> (coração, respiração, tensão), <strong>um sentimento</strong> (o jeito como isso é vivido por dentro) e <strong>uma vontade de agir</strong> específica. Quando você sente antes de "pensar", é essa engrenagem funcionando.'
    },
    {
      icon: '🛡️', title: 'Pra que servem as emoções',
      text: 'Cada uma das seis emoções básicas existe porque, ao longo da nossa história como espécie, ela resolveu um problema real: fugir de perigo, notar uma perda, defender um limite, se aproximar do que é bom. <strong>Não existe emoção "errada"</strong> — existe emoção incômoda de sentir. O objetivo aqui não é eliminar nenhuma delas, é entender o recado que cada uma traz.'
    },
    {
      icon: '⚡', title: 'Tendência de ação',
      text: 'Cada emoção vem com um "programa" pronto: um impulso específico do que fazer — o medo empurra pra fugir, a raiva empurra pra enfrentar, o nojo empurra pra afastar. Isso se chama <strong>tendência de ação</strong>. Reconhecer esse impulso não significa obedecer a ele automaticamente — significa ganhar a escolha de segui-lo ou não.'
    },
    {
      icon: '🧠', title: 'Seu cérebro emocional',
      text: 'Quando algo acontece, a <strong>amígdala</strong> dá o alarme rápido, antes de qualquer análise consciente. A <strong>ínsula</strong> lê os sinais do corpo (é ela que te avisa do coração acelerado, do nó na garganta). O <strong>córtex pré-frontal</strong> é o "painel de controle" mais lento e mais reflexivo — é ele que avalia, pondera e ajuda a escolher a resposta, e é a conexão entre ele e a amígdala que fica mais forte quando a gente pratica nomear emoções. Por baixo disso tudo, o <strong>sistema nervoso autônomo</strong> funciona como acelerador (sistema simpático, prepara ação) e freio (sistema parassimpático, traz calma) — as sensações do corpo que você percebe em cada emoção são esse sistema em ação.'
    },
    {
      icon: '🎛️', title: 'O que é regulação emocional',
      text: 'Regular uma emoção <strong>não é reprimir</strong> nem "ficar bem" o tempo todo. É um processo de três passos: <strong>perceber</strong> o que está acontecendo no corpo, <strong>nomear</strong> a emoção com precisão, e só então <strong>escolher</strong> a resposta — em vez de reagir no piloto automático. Regular bem não significa nunca sentir raiva ou medo; significa ter mais opções quando eles aparecerem.'
    },
    {
      icon: '👥', title: 'Reconhecer em você e nos outros',
      text: 'Existem dois radares: um <strong>interno</strong> (interocepção) — os sinais do seu próprio corpo — e um <strong>externo</strong> — expressões faciais e de postura que, segundo o pesquisador Paul Ekman, se repetem de forma parecida em culturas bem diferentes. Treinar os dois radares é a base do que costuma ser chamado de inteligência emocional.'
    },
    {
      icon: '🧭', title: 'Emoção como informação (Terapia Focada nas Emoções)',
      text: 'Na Terapia Focada nas Emoções (Leslie Greenberg), a emoção não é vista como "problema" a ser eliminado, mas como uma <strong>fonte de informação</strong> sobre o que importa pra você — o trabalho é <strong>chegar até ela</strong>, sentir o que realmente está ali, e usar essa informação, em vez de evitá-la ou ser dominado por ela. Nem toda emoção que aparece, porém, é o retrato mais direto do que está acontecendo — e é isso que vamos ver a seguir.'
    }
  ];

  // ---------------------------------------------------------------
  // Tipologia de respostas emocionais (Greenberg — Terapia Focada nas
  // Emoções): nem toda emoção sentida é um sinal direto e confiável da
  // situação atual. Reconhecer o TIPO de resposta é uma camada a mais
  // de consciência emocional, além de só nomear a emoção.
  // ---------------------------------------------------------------
  var eftTypes = [
    {
      icon: '🎯', title: 'Emoção primária adaptativa',
      text: 'Uma resposta direta e útil à situação de agora. Ela combina com o tamanho e o tipo do que está acontecendo.',
      example: 'Sentir medo real diante de um perigo real. Sentir tristeza genuína por uma perda recente.'
    },
    {
      icon: '🕰️', title: 'Emoção primária mal-adaptativa',
      text: 'Um padrão antigo, aprendido em outro momento da vida, que continua sendo ativado mesmo quando não cabe mais na situação atual.',
      example: 'Uma vergonha profunda ativada por uma crítica pequena — como se ainda fosse aquela criança sendo julgada.'
    },
    {
      icon: '🌊', title: 'Emoção secundária',
      text: 'Uma emoção que aparece por cima de outra mais primária — às vezes reagindo a ela, às vezes escondendo-a.',
      example: 'Raiva que aparece no lugar de uma tristeza ou de um medo mais vulnerável de se mostrar.'
    },
    {
      icon: '🎭', title: 'Emoção instrumental',
      text: 'Expressa — nem sempre de forma consciente — para produzir um efeito em alguém, mais do que sentida de forma genuína naquele momento.',
      example: 'Um choro ou uma irritação usados (mesmo sem perceber) pra conseguir atenção ou fazer o outro ceder.'
    }
  ];

  // ---------------------------------------------------------------
  // Conteúdo das emoções — linguagem simples e âncoras concretas de
  // corpo/pensamento, mais origem evolutiva, tendência de ação,
  // sinais visíveis em outras pessoas e uma cena do dia a dia pra
  // conectar com a realidade. Cada emoção carrega uma frase-gatilho
  // curta usada no plano "quando eu perceber ___". Fonte de conteúdo
  // reaproveitada pela Biblioteca e pela tela de Ação do check-in.
  // ---------------------------------------------------------------
  var emotions = [
    {
      name: 'Alegria', emoji: '😊', accent: 'joy', trigger: 'uma sensação de leveza no corpo',
      definition: 'Uma sensação boa que aparece quando algo dá certo ou é agradável.',
      origin: 'Evoluiu porque nos aproxima do que é bom — comida, companhia, segurança. Quem sentia prazer em se conectar e explorar tinha mais chances de sobreviver e prosperar.',
      actionTendency: ['Dá vontade de se aproximar', 'Compartilhar com alguém', 'Continuar fazendo aquilo'],
      thoughts: ['"Isso é bom."', '"Quero repetir isso."', '"Quero contar pra alguém."'],
      physical: ['Mais energia no corpo', 'Sorriso que vem sem esforço', 'Sensação de leveza'],
      recognizeOthers: ['Sorriso que chega aos olhos', 'Postura mais aberta e solta', 'Fala mais leve e mais rápida'],
      scenario: 'Você recebe uma notícia boa e sente vontade de contar pra alguém na mesma hora — é a alegria empurrando você a compartilhar e fortalecer vínculos.',
      applyPrompt: 'Da próxima vez: nomeie em voz alta e aproveite 10 segundos antes de seguir em frente.',
      healthy: ['Aproveitar o momento', 'Agradecer', 'Compartilhar com alguém de confiança'],
      unhealthy: ['Buscar só prazer rápido o tempo todo', 'Depender da aprovação dos outros para se sentir bem'],
      fn: 'Nos motiva a repetir o que faz bem e fortalece nossos laços com as pessoas.',
      science: 'O cérebro libera dopamina e serotonina — substâncias ligadas a prazer e bem-estar.'
    },
    {
      name: 'Tristeza', emoji: '😢', accent: 'sad', trigger: 'um nó na garganta',
      definition: 'Aparece quando perdemos algo ou alguém, ou vivemos uma decepção.',
      origin: 'Evoluiu como resposta à perda — de pessoas, vínculos, recursos. Ela reduz nossa energia pra pedir ajuda e reavaliar o que realmente importa.',
      actionTendency: ['Dá vontade de se recolher', 'Ficar quieto por um tempo', 'Buscar conforto'],
      thoughts: ['"Sinto falta disso."', '"Isso é difícil."', '"Preciso de um tempo."'],
      physical: ['Peito mais pesado', 'Menos energia', 'Vontade de chorar'],
      recognizeOthers: ['Cantos da boca caídos', 'Olhar baixo, ombros curvados', 'Fala mais devagar e mais baixa'],
      scenario: 'Um amigo se muda de cidade e você sente um vazio quando pensa nele — a tristeza está sinalizando o quanto esse vínculo importava.',
      applyPrompt: 'Da próxima vez: permita-se sentir por alguns minutos antes de tentar "resolver" — a tristeza pede tempo, não solução imediata.',
      healthy: ['Permitir-se sentir', 'Pedir apoio', 'Dar tempo pra si mesmo'],
      unhealthy: ['Esconder o que sente', 'Se isolar completamente', 'Ficar remoendo sem buscar ajuda'],
      fn: 'Ajuda a processar perdas e avisa às pessoas ao redor que precisamos de cuidado.',
      science: 'Áreas do cérebro ligadas ao processamento emocional (como a amígdala) ficam mais ativas.'
    },
    {
      name: 'Raiva', emoji: '😠', accent: 'anger', trigger: 'o coração acelerado e músculos tensos',
      definition: 'Surge quando algo parece injusto, quando somos frustrados ou nos sentimos ameaçados.',
      origin: 'Evoluiu para nos defender quando algo importante é violado — nossos limites, nosso espaço, nossa dignidade.',
      actionTendency: ['Dá vontade de enfrentar', 'Corrigir a injustiça', 'Se impor'],
      thoughts: ['"Isso é injusto."', '"Não vou aceitar isso."', '"Preciso me defender."'],
      physical: ['Coração acelera', 'Músculos tensos', 'Sensação de calor'],
      recognizeOthers: ['Sobrancelhas franzidas, olhar fixo', 'Mandíbula tensa, lábios apertados', 'Gestos mais bruscos'],
      scenario: 'Alguém fura sua fila depois de você esperar 40 minutos — a raiva é o sinal de que um limite foi ultrapassado.',
      applyPrompt: 'Da próxima vez: nomeie "estou com raiva" antes de agir — isso já cria uma pausa entre sentir e fazer.',
      healthy: ['Reconhecer o que sente', 'Falar de forma direta e respeitosa', 'Colocar limites'],
      unhealthy: ['Explodir sem pensar', 'Agredir com palavras ou ações', 'Engolir tudo por dentro'],
      fn: 'Ajuda a enfrentar obstáculos e proteger o que é importante pra gente.',
      science: 'O corpo entra em alerta e libera adrenalina, preparando uma reação rápida.'
    },
    {
      name: 'Medo', emoji: '😨', accent: 'fear', trigger: 'o coração disparado e a respiração rápida',
      definition: 'Aparece quando algo parece uma ameaça à nossa segurança, física ou emocional.',
      origin: 'Evoluiu para nos manter vivos diante de ameaças reais — é um dos sistemas mais antigos e mais rápidos do cérebro.',
      actionTendency: ['Dá vontade de fugir', 'Se esconder', 'Congelar no lugar'],
      thoughts: ['"Isso é perigoso."', '"Algo ruim pode acontecer."', '"Preciso me proteger."'],
      physical: ['Coração dispara', 'Pupilas dilatam', 'Respiração rápida'],
      recognizeOthers: ['Olhos arregalados, sobrancelhas erguidas', 'Corpo encolhido ou tenso', 'Voz mais aguda ou trêmula'],
      scenario: 'Um carro freia bruscamente perto de você — o coração dispara antes mesmo de "pensar" no perigo. É o medo te protegendo.',
      applyPrompt: 'Da próxima vez: pergunte-se "esse perigo é real e imediato, ou é só uma possibilidade?" — ajuda a calibrar a resposta.',
      healthy: ['Avaliar o perigo com calma', 'Se proteger quando necessário', 'Encarar aos poucos o que assusta'],
      unhealthy: ['Evitar tudo que dá medo', 'Entrar em pânico', 'Viver preocupado com coisas pouco prováveis'],
      fn: 'Nos protege de perigos reais, preparando o corpo para agir rápido.',
      science: 'A amígdala detecta ameaças e aciona uma resposta antes mesmo de "pensarmos" conscientemente.'
    },
    {
      name: 'Nojo', emoji: '🤢', accent: 'disgust', trigger: 'vontade de me afastar de algo ou alguém',
      definition: 'Uma reação de rejeição a algo que parece contaminado, nocivo ou que fere nossos valores.',
      origin: 'Evoluiu para nos afastar do que pode contaminar ou adoecer — comida estragada, doenças e, mais tarde, também violações morais.',
      actionTendency: ['Dá vontade de se afastar', 'Rejeitar', 'Expelir ou evitar contato'],
      thoughts: ['"Isso é repulsivo."', '"Preciso me afastar."', '"Isso pode me fazer mal."'],
      physical: ['Enjoo', 'Nariz franzido', 'Vontade de se afastar'],
      recognizeOthers: ['Nariz enrugado, lábio superior levantado', 'Cabeça ou corpo virado pra longe', 'Expressão de repulsa no rosto'],
      scenario: 'Você abre a geladeira e sente um cheiro estranho — o nojo faz você recuar antes de qualquer risco real.',
      applyPrompt: 'Da próxima vez: repare se o nojo é sobre algo concreto (comida, cheiro) ou um julgamento moral — parecem iguais, mas pedem respostas diferentes.',
      healthy: ['Reconhecer o incômodo', 'Se afastar quando faz sentido', 'Questionar reações exageradas'],
      unhealthy: ['Rejeitar pessoas ou situações sem refletir', 'Julgar com base só numa reação forte'],
      fn: 'Nos protege de coisas que podem nos fazer mal, como comida estragada ou situações arriscadas.',
      science: 'Ativa a ínsula, área do cérebro ligada a sabores desagradáveis e sensações de repulsa.'
    },
    {
      name: 'Surpresa', emoji: '😲', accent: 'surprise', trigger: 'uma reação rápida a algo inesperado',
      definition: 'Uma reação rápida a algo inesperado, que interrompe o que estávamos pensando ou fazendo.',
      origin: 'Evoluiu pra interromper o que estávamos fazendo e redirecionar toda a atenção pro que é novo — antes mesmo de sabermos se é bom ou ruim.',
      actionTendency: ['Dá vontade de parar', 'Olhar e prestar atenção', 'Entender rápido o que aconteceu'],
      thoughts: ['"Não esperava por isso!"', '"O que está acontecendo?"', '"Preciso entender rápido."'],
      physical: ['Sobrancelhas sobem', 'Olhos arregalam', 'Respiração muda de repente'],
      recognizeOthers: ['Sobrancelhas erguidas, olhos arregalados', 'Boca aberta', 'Corpo momentaneamente parado'],
      scenario: 'Alguém aparece de surpresa numa festa — antes de sentir alegria ou susto, o corpo já reagiu à surpresa em si.',
      applyPrompt: 'Da próxima vez: dê um segundo pra deixar a surpresa passar antes de decidir como reagir ao que veio depois dela.',
      healthy: ['Ficar aberto ao novo', 'Se adaptar com calma à mudança'],
      unhealthy: ['Travar diante do inesperado', 'Reagir de forma exagerada a pequenas mudanças'],
      fn: 'Ajuda a redirecionar rápido nossa atenção para o que é novo, preparando uma resposta.',
      science: 'Ativa por um instante o sistema de alerta do cérebro, pausando o que estava em andamento.'
    }
  ];

  function emotionByAccent(accent) {
    return emotions.filter(function (e) { return e.accent === accent; })[0];
  }

  // ---------------------------------------------------------------
  // Circumplexo de Russell (1980): toda experiência emocional pode
  // ser localizada em duas dimensões contínuas — valência (agradável
  // / desagradável) e ativação (muita / pouca energia) — antes mesmo
  // de virar uma categoria com nome.
  // ---------------------------------------------------------------
  var moodQuadrants = {
    'alta-desagradavel': { label: 'Muita energia + desagradável', words: 'raiva, medo, estresse, ansiedade' },
    'alta-agradavel': { label: 'Muita energia + agradável', words: 'alegria, entusiasmo, euforia, orgulho' },
    'baixa-desagradavel': { label: 'Pouca energia + desagradável', words: 'tristeza, cansaço, tédio, desânimo' },
    'baixa-agradavel': { label: 'Pouca energia + agradável', words: 'calma, serenidade, satisfação, contentamento' }
  };

  // ---------------------------------------------------------------
  // Check-in corporal — entrada pela sensação, não pelo rótulo. É o
  // núcleo do app: reconhecimento assistido (nunca recall livre),
  // sem pontuação, sem certo/errado.
  // ---------------------------------------------------------------
  var sensationDescriptors = [
    { key: 'aperto', label: 'Aperto' },
    { key: 'calor', label: 'Calor' },
    { key: 'peso', label: 'Peso' },
    { key: 'formigamento', label: 'Formigamento' },
    { key: 'vazio', label: 'Vazio' },
    { key: 'tensao', label: 'Tensão' }
  ];

  var bodyRegions = [
    { key: 'rosto', label: 'Rosto', icon: '😐', top: 8, left: 50 },
    { key: 'garganta', label: 'Garganta', icon: '😮', top: 21, left: 50 },
    { key: 'peito', label: 'Peito', icon: '❤️', top: 35, left: 50 },
    { key: 'estomago', label: 'Estômago', icon: '🌀', top: 49, left: 50 },
    { key: 'maos-bracos', label: 'Mãos e braços', icon: '✋', top: 40, left: 14 },
    { key: 'ombros-musculos', label: 'Ombros e músculos', icon: '💪', top: 26, left: 86 }
  ];

  // Mapeamentos de sensação → famílias emocionais compatíveis (2-3 cada).
  // São heurísticas psicoeducativas, não um instrumento diagnóstico —
  // servem pra oferecer reconhecimento assistido, nunca recall livre.
  var sensationToFamilies = {
    aperto: ['anger', 'fear', 'sad'],
    calor: ['anger', 'joy'],
    peso: ['sad', 'disgust'],
    formigamento: ['fear', 'surprise', 'joy'],
    vazio: ['sad', 'disgust'],
    tensao: ['anger', 'fear', 'disgust']
  };

  var regionToFamilies = {
    rosto: ['surprise', 'disgust', 'joy'],
    garganta: ['sad', 'fear'],
    peito: ['fear', 'anger', 'joy'],
    estomago: ['disgust', 'fear', 'sad'],
    'maos-bracos': ['anger', 'fear'],
    'ombros-musculos': ['anger', 'fear', 'sad']
  };

  var ALL_ACCENTS = ['joy', 'sad', 'anger', 'fear', 'disgust', 'surprise'];

  // Variações de intensidade dentro de cada família — descritas, não
  // numéricas (0-10 é frio demais pra quem está começando a perceber
  // o que sente).
  var intensityLevels = {
    joy: [
      { label: 'Contentamento', text: 'Uma sensação leve e tranquila de que está tudo bem.' },
      { label: 'Alegria', text: 'A sensação boa e clara de que algo deu certo.' },
      { label: 'Entusiasmo', text: 'Vontade de se mexer, falar, compartilhar.' },
      { label: 'Euforia', text: 'Uma onda forte, quase incontrolável, de empolgação.' }
    ],
    sad: [
      { label: 'Incômodo leve', text: 'Um mal-estar discreto, quase passageiro.' },
      { label: 'Melancolia', text: 'Uma tristeza mais silenciosa, meio pra dentro.' },
      { label: 'Tristeza', text: 'O peso mais claro, com vontade de se recolher.' },
      { label: 'Angústia', text: 'Uma dor mais funda, difícil de sustentar sozinho.' }
    ],
    anger: [
      { label: 'Irritação', text: 'Um incômodo leve, fácil de deixar passar.' },
      { label: 'Aborrecimento', text: 'Já pesa mais, começa a ocupar a cabeça.' },
      { label: 'Raiva', text: 'Clara, com vontade real de agir.' },
      { label: 'Fúria', text: 'Intensa, quase avassaladora, difícil de conter.' }
    ],
    fear: [
      { label: 'Cautela', text: 'Um alerta leve — mais atenção do que medo.' },
      { label: 'Preocupação', text: 'A mente já antecipa o que pode dar errado.' },
      { label: 'Medo', text: 'O corpo entra em alerta de verdade.' },
      { label: 'Pânico', text: 'Intensidade máxima, sensação de perigo iminente.' }
    ],
    disgust: [
      { label: 'Estranhamento', text: 'Um "isso não parece certo" discreto.' },
      { label: 'Desagrado', text: 'Incômodo mais claro com o que está diante de você.' },
      { label: 'Nojo', text: 'Vontade real de se afastar.' },
      { label: 'Repulsa', text: 'Intensa, quase física, difícil de ignorar.' }
    ],
    surprise: [
      { label: 'Curiosidade', text: 'Um pequeno "hm, que interessante".' },
      { label: 'Espanto', text: 'Algo genuinamente inesperado chamou sua atenção.' },
      { label: 'Surpresa', text: 'A interrupção clara do que você esperava.' },
      { label: 'Choque', text: 'Intensa, deixa a pessoa momentaneamente sem reação.' }
    ]
  };

  var contextSituations = [
    { key: 'trabalho', label: 'Trabalho/estudo' },
    { key: 'relacionamento', label: 'Relacionamento' },
    { key: 'sozinho', label: 'Sozinho(a)' },
    { key: 'imprevisto', label: 'Notícia/imprevisto' },
    { key: 'saude', label: 'Corpo/saúde' },
    { key: 'prefiro-nao-dizer', label: 'Prefiro não dizer' }
  ];

  var extraChips = ['não souber nomear o que sinto'];

  function propToText(val) { return Array.isArray(val) ? val.join(' ') : val; }
  function li(text) { return '<li>' + text + '</li>'; }

  // ---------------------------------------------------------------
  // Preferências (persistidas, independentes do histórico)
  // ---------------------------------------------------------------
  var prefs = loadPrefs();

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return {
        reducedMotion: p.reducedMotion === true,
        largeText: p.largeText === true,
        highContrast: p.highContrast === true,
        audioEnabled: p.audioEnabled !== false,
        profile: p.profile === 'body-first' ? 'body-first' : 'general',
        bodyEntryMode: p.bodyEntryMode === 'text' ? 'text' : 'body',
        onboarded: p.onboarded === true
      };
    } catch (e) {
      return { reducedMotion: false, largeText: false, highContrast: false, audioEnabled: true, profile: 'general', bodyEntryMode: 'body', onboarded: false };
    }
  }

  function savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* indisponível */ }
  }

  function applyPrefs() {
    document.body.classList.toggle('pref-reduced-motion', prefs.reducedMotion);
    document.body.classList.toggle('pref-large-text', prefs.largeText);
    document.body.classList.toggle('pref-high-contrast', prefs.highContrast);
  }

  function reducedMotionActive() { return osReducedMotion || prefs.reducedMotion; }

  // Vocabulário pessoal da Biblioteca — independente do mapa corporal.
  var VOCAB_KEY = 'matiz_vocab_v1';
  function loadVocab() {
    try { var raw = localStorage.getItem(VOCAB_KEY); return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
  }
  function saveVocabWord(emotionName, word) {
    var v = loadVocab();
    if (word) v[emotionName] = word; else delete v[emotionName];
    try { localStorage.setItem(VOCAB_KEY, JSON.stringify(v)); } catch (e) { /* indisponível */ }
  }

  // ---------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------
  var state = {
    screen: 'start',
    emotionIndex: 0,
    selfBefore: [null, null],
    selfAfter: [null, null],
    showAfterCheck: false,
    ifThenPlan: '',
    moodPoint: null,
    lastEntryTs: null,
    checkin: { entryMode: null, sensationKey: null, sensationLabel: null, suggestedFamilies: [], chosenFamily: undefined, intensityLabel: null, context: { situation: null, note: '' } }
  };

  var totalSteps = 6; // passos do check-in corporal (tela 1 a 6)
  var completedSteps = 0;
  var currentUtterance = null;

  // ---------------------------------------------------------------
  // Elementos
  // ---------------------------------------------------------------
  var screens = {
    start: document.getElementById('scr-start'),
    prefs: document.getElementById('scr-prefs'),
    check: document.getElementById('scr-check'),
    concept: document.getElementById('scr-concept'),
    thermometer: document.getElementById('scr-thermometer'),
    efttypes: document.getElementById('scr-efttypes'),
    library: document.getElementById('scr-library'),
    bodyentry: document.getElementById('scr-body-entry'),
    family: document.getElementById('scr-family'),
    intensity: document.getElementById('scr-intensity'),
    context: document.getElementById('scr-context'),
    action: document.getElementById('scr-action'),
    mapregister: document.getElementById('scr-map-register'),
    ifthen: document.getElementById('scr-ifthen'),
    result: document.getElementById('scr-result'),
    data: document.getElementById('scr-data')
  };

  var el = {
    startBtn: document.getElementById('start-btn'),
    resumeBanner: document.getElementById('resume-banner'),
    resumeBtn: document.getElementById('resume-btn'),
    freshStartBtn: document.getElementById('fresh-start-btn'),

    prefsBtn: document.getElementById('prefs-btn'),
    prefsDoneBtn: document.getElementById('prefs-done-btn'),
    prefReducedMotion: document.getElementById('pref-reduced-motion'),
    prefLargeText: document.getElementById('pref-large-text'),
    prefHighContrast: document.getElementById('pref-high-contrast'),
    prefAudio: document.getElementById('pref-audio'),
    profileGeneral: document.getElementById('profile-general'),
    profileBodyFirst: document.getElementById('profile-body-first'),

    doseCard: document.getElementById('dose-card'),
    doseTags: document.getElementById('dose-tags'),
    doseText: document.getElementById('dose-text'),
    doseSaveBtn: document.getElementById('dose-save-btn'),
    doseSkipBtn: document.getElementById('dose-skip-btn'),

    skipCheckBtn: document.getElementById('skip-check-btn'),
    checkContinueBtn: document.getElementById('check-continue-btn'),
    checkTitle: document.getElementById('check-title'),
    checkQuestions: document.getElementById('check-questions'),

    conceptList: document.getElementById('concept-list'),
    conceptContinueBtn: document.getElementById('concept-continue-btn'),

    moodPad: document.getElementById('mood-pad'),
    moodMarker: document.getElementById('mood-marker'),
    moodFeedback: document.getElementById('mood-feedback'),
    thermometerContinueBtn: document.getElementById('thermometer-continue-btn'),

    eftList: document.getElementById('eft-list'),
    eftContinueBtn: document.getElementById('eft-continue-btn'),

    libraryBtn: document.getElementById('library-btn'),
    prevEmotion: document.getElementById('prev-emotion'),
    nextEmotion: document.getElementById('next-emotion'),
    learningProgress: document.getElementById('learning-progress'),
    emotionContent: document.getElementById('emotion-content'),

    entryModeBody: document.getElementById('entry-mode-body'),
    entryModeText: document.getElementById('entry-mode-text'),
    bodyMapPanel: document.getElementById('body-map-panel'),
    sensationListPanel: document.getElementById('sensation-list-panel'),
    bodyHotspots: document.getElementById('body-hotspots'),
    sensationChips: document.getElementById('sensation-chips'),

    familyOptions: document.getElementById('family-options'),

    intensityTitle: document.getElementById('intensity-title'),
    intensityOptions: document.getElementById('intensity-options'),

    contextChips: document.getElementById('context-chips'),
    contextNote: document.getElementById('context-note'),
    contextContinueBtn: document.getElementById('context-continue-btn'),
    contextSkipBtn: document.getElementById('context-skip-btn'),

    actionContent: document.getElementById('action-content'),
    actionContinueBtn: document.getElementById('action-continue-btn'),

    mapRegisterSummary: document.getElementById('map-register-summary'),
    mapRegisterContinueBtn: document.getElementById('map-register-continue-btn'),

    ifthenChips: document.getElementById('ifthen-chips'),
    ifthenInput: document.getElementById('ifthen-input'),
    ifthenContinueBtn: document.getElementById('ifthen-continue-btn'),
    ifthenSkipBtn: document.getElementById('ifthen-skip-btn'),

    resultDelta: document.getElementById('result-delta'),
    restartBtn: document.getElementById('restart-btn'),

    backBtn: document.getElementById('back-btn'),
    homeBtn: document.getElementById('home-btn'),
    skipBtn: document.getElementById('skip-btn'),
    dataBtn: document.getElementById('data-btn'),
    overallProgressBar: document.getElementById('overall-progress-bar'),

    sessionList: document.getElementById('session-list'),
    planList: document.getElementById('plan-list'),
    exportHtmlBtn: document.getElementById('export-html-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    clearDataBtn: document.getElementById('clear-data-btn'),
    exportHtmlResult: document.getElementById('export-html-result'),
    exportJsonResult: document.getElementById('export-json-result'),
    exportRefResult: document.getElementById('export-ref-result')
  };

  var checkQuestionsText = [
    'Quando sinto algo forte, consigo dizer com palavras o que é (ex.: "isso é raiva", "isso é medo").',
    'Consigo perceber sinais no meu corpo (coração acelerado, nó na garganta) que me ajudam a entender o que sinto.'
  ];
  var scaleLabels = ['Quase nunca', 'Raramente', 'Às vezes', 'Quase sempre', 'Sempre'];

  // ---------------------------------------------------------------
  // Navegação entre telas
  // ---------------------------------------------------------------
  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      if (screens[k]) screens[k].classList.toggle('hidden', k !== name);
    });
    state.screen = name;
    updateNav();
    window.scrollTo({ top: 0, behavior: reducedMotionActive() ? 'auto' : 'smooth' });
  }

  function updateNav() {
    var isStart = state.screen === 'start';
    el.backBtn.disabled = isStart;
    el.skipBtn.classList.toggle('hidden', !(state.screen === 'concept' || state.screen === 'thermometer' || state.screen === 'efttypes'));
    el.dataBtn.classList.toggle('hidden', state.screen === 'data');
  }

  function updateOverallProgress() {
    var pct = Math.min(100, (completedSteps / totalSteps) * 100);
    el.overallProgressBar.style.width = pct + '%';
  }

  // ---------------------------------------------------------------
  // Retomada de sessão (efeito Zeigarnik, sem culpa) — cobre as telas
  // do check-in corporal, que agora é o fluxo repetível principal.
  // ---------------------------------------------------------------
  var RESUMABLE_SCREENS = ['bodyentry', 'family', 'intensity', 'context', 'action'];

  function loadProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveProgress() {
    var progress = {
      screen: state.screen,
      completedSteps: completedSteps,
      checkin: state.checkin,
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch (e) { /* indisponível */ }
  }

  function clearProgress() {
    try { localStorage.removeItem(PROGRESS_KEY); } catch (e) { /* indisponível */ }
  }

  function checkForResume() {
    var progress = loadProgress();
    if (progress && RESUMABLE_SCREENS.indexOf(progress.screen) !== -1) {
      el.resumeBanner.classList.remove('hidden');
      el.resumeBanner._data = progress;
      return true;
    }
    el.resumeBanner.classList.add('hidden');
    return false;
  }

  el.resumeBtn.addEventListener('click', function () {
    var progress = el.resumeBanner._data;
    if (!progress) return;
    state.checkin = progress.checkin || state.checkin;
    completedSteps = progress.completedSteps || 0;
    updateOverallProgress();
    if (progress.screen === 'family') { renderFamilyScreen(); showScreen('family'); }
    else if (progress.screen === 'intensity') { renderIntensityScreen(); showScreen('intensity'); }
    else if (progress.screen === 'context') { renderContextScreen(); showScreen('context'); }
    else if (progress.screen === 'action') { renderActionScreen(); showScreen('action'); }
    else { renderBodyEntry(); showScreen('bodyentry'); }
  });

  el.freshStartBtn.addEventListener('click', function () {
    clearProgress();
    el.resumeBanner.classList.add('hidden');
  });

  // ---------------------------------------------------------------
  // Dose Cultivada: check-in semanal leve e opcional, só aparece pra
  // quem já tem pelo menos um registro no mapa. Nunca bloqueia, nunca
  // cobra — "dispensar essa semana" é uma opção tão válida quanto
  // registrar.
  // ---------------------------------------------------------------
  function weekStart(dateObj) {
    var d = dateObj ? new Date(dateObj) : new Date();
    var day = (d.getDay() + 6) % 7; // segunda = 0
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function loadDose() {
    try {
      var raw = localStorage.getItem(DOSE_KEY);
      return raw ? JSON.parse(raw) : { records: [], skipWeek: null };
    } catch (e) { return { records: [], skipWeek: null }; }
  }

  function saveDose(dose) {
    try { localStorage.setItem(DOSE_KEY, JSON.stringify(dose)); } catch (e) { /* indisponível */ }
  }

  function renderDoseCard() {
    var ws = weekStart();
    var dose = loadDose();
    var alreadyLogged = dose.records.some(function (r) { return r.weekStart === ws; });
    var hasHistory = loadBodyMap().length > 0;
    if (!hasHistory || alreadyLogged || dose.skipWeek === ws) {
      el.doseCard.classList.add('hidden');
      return;
    }
    el.doseTags.innerHTML = DOSE_TAGS.map(function (t) {
      return '<button type="button" class="chip" data-tag="' + t.replace(/"/g, '&quot;') + '" aria-pressed="false">' + t + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.doseTags.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      });
    });
    el.doseText.value = '';
    el.doseCard.classList.remove('hidden');
  }

  el.doseSaveBtn.addEventListener('click', function () {
    var tags = Array.prototype.filter.call(el.doseTags.querySelectorAll('.chip'), function (c) { return c.getAttribute('aria-pressed') === 'true'; }).map(function (c) { return c.dataset.tag; });
    var text = el.doseText.value.trim();
    if (!tags.length && !text) { el.doseCard.classList.add('hidden'); return; }
    var dose = loadDose();
    dose.records.push({ ts: Date.now(), date: new Date().toISOString(), weekStart: weekStart(), tags: tags, text: text });
    saveDose(dose);
    el.doseCard.classList.add('hidden');
  });

  el.doseSkipBtn.addEventListener('click', function () {
    var dose = loadDose();
    dose.skipWeek = weekStart();
    saveDose(dose);
    el.doseCard.classList.add('hidden');
  });

  function refreshStartScreen() {
    var resuming = checkForResume();
    if (!resuming) renderDoseCard(); else el.doseCard.classList.add('hidden');
  }

  // ---------------------------------------------------------------
  // Preferências
  // ---------------------------------------------------------------
  function renderPrefsScreen() {
    el.prefReducedMotion.checked = prefs.reducedMotion;
    el.prefLargeText.checked = prefs.largeText;
    el.prefHighContrast.checked = prefs.highContrast;
    el.prefAudio.checked = prefs.audioEnabled;
    el.profileGeneral.setAttribute('aria-pressed', String(prefs.profile === 'general'));
    el.profileBodyFirst.setAttribute('aria-pressed', String(prefs.profile === 'body-first'));
  }

  el.prefsBtn.addEventListener('click', function () { renderPrefsScreen(); showScreen('prefs'); });
  el.prefsDoneBtn.addEventListener('click', function () { showScreen('start'); });

  el.prefReducedMotion.addEventListener('change', function () { prefs.reducedMotion = this.checked; savePrefs(); applyPrefs(); });
  el.prefLargeText.addEventListener('change', function () { prefs.largeText = this.checked; savePrefs(); applyPrefs(); });
  el.prefHighContrast.addEventListener('change', function () { prefs.highContrast = this.checked; savePrefs(); applyPrefs(); });
  el.prefAudio.addEventListener('change', function () { prefs.audioEnabled = this.checked; savePrefs(); if (state.screen === 'library') showEmotion(state.emotionIndex); });

  // "Como você aprende melhor?" agora reordena a Biblioteca (física
  // primeiro) — mantido como preferência pessoal, sem afetar o
  // check-in (que já começa pelo corpo por definição).
  el.profileGeneral.addEventListener('click', function () { prefs.profile = 'general'; savePrefs(); renderPrefsScreen(); });
  el.profileBodyFirst.addEventListener('click', function () { prefs.profile = 'body-first'; savePrefs(); renderPrefsScreen(); });

  // ---------------------------------------------------------------
  // Reset — onboarding completo (primeira vez) vs. novo check-in
  // ---------------------------------------------------------------
  function resetCheckin() {
    state.checkin = { entryMode: null, sensationKey: null, sensationLabel: null, suggestedFamilies: [], chosenFamily: undefined, intensityLabel: null, context: { situation: null, note: '' } };
    state.lastEntryTs = null;
    completedSteps = 0;
    updateOverallProgress();
  }

  function resetSession() {
    stopSpeech();
    state.selfBefore = [null, null];
    state.selfAfter = [null, null];
    state.ifThenPlan = '';
    state.moodPoint = null;
    state.showAfterCheck = false;
    resetCheckin();
  }

  function startCheckinFlow() {
    resetCheckin();
    renderBodyEntry();
    showScreen('bodyentry');
  }

  // ---------------------------------------------------------------
  // Tela inicial → onboarding (1ª vez) ou direto pro check-in
  // ---------------------------------------------------------------
  el.startBtn.addEventListener('click', function () {
    resetSession();
    clearProgress();
    if (prefs.onboarded) {
      startCheckinFlow();
    } else {
      renderCheck('before');
      showScreen('check');
    }
  });

  function renderCheck(phase) {
    el.checkTitle.textContent = phase === 'before' ? 'Antes de começar (opcional)' : 'Agora que você terminou (opcional)';
    el.checkQuestions.innerHTML = '';
    checkQuestionsText.forEach(function (q, qi) {
      var row = document.createElement('div');
      row.className = 'scale-row';
      var label = document.createElement('div');
      label.className = 'scale-question';
      label.textContent = q;
      var opts = document.createElement('div');
      opts.className = 'scale-options';
      opts.setAttribute('role', 'radiogroup');
      opts.setAttribute('aria-label', q);
      scaleLabels.forEach(function (lbl, vi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'scale-opt';
        b.textContent = lbl;
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          var target = phase === 'before' ? state.selfBefore : state.selfAfter;
          target[qi] = vi;
          Array.prototype.forEach.call(opts.querySelectorAll('.scale-opt'), function (o) { o.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
        });
        opts.appendChild(b);
      });
      row.appendChild(label);
      row.appendChild(opts);
      el.checkQuestions.appendChild(row);
    });
    el.checkContinueBtn.dataset.phase = phase;
  }

  el.checkContinueBtn.addEventListener('click', proceedFromCheck);
  el.skipCheckBtn.addEventListener('click', proceedFromCheck);

  function proceedFromCheck() {
    var phase = el.checkContinueBtn.dataset.phase;
    if (phase === 'before') {
      renderConceptScreen();
      showScreen('concept');
    } else {
      showScreen('ifthen');
      renderIfThen();
    }
  }

  function renderConceptScreen() {
    el.conceptList.innerHTML = concepts.map(function (c) {
      return '<div class="concept-card"><div class="concept-icon" aria-hidden="true">' + c.icon + '</div><div><h3>' + c.title + '</h3><p>' + c.text + '</p></div></div>';
    }).join('');
  }

  el.conceptContinueBtn.addEventListener('click', function () {
    resetMoodPad();
    showScreen('thermometer');
  });

  // ---------------------------------------------------------------
  // Termômetro Emocional — Circumplexo de Russell (valência x ativação)
  // ---------------------------------------------------------------
  function resetMoodPad() {
    el.moodMarker.classList.add('hidden');
    el.moodFeedback.innerHTML = '<p class="empty-note">Toque em qualquer ponto do quadrado pra marcar como você está se sentindo agora.</p>';
  }

  function handleMoodPadPick(clientX, clientY) {
    var rect = el.moodPad.getBoundingClientRect();
    var x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    var y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    var valence = x; // 0 = desagradável, 1 = agradável
    var arousal = 1 - y; // 0 = pouca energia, 1 = muita energia (y cresce pra baixo)

    el.moodMarker.style.left = (x * 100) + '%';
    el.moodMarker.style.top = (y * 100) + '%';
    el.moodMarker.classList.remove('hidden');

    var quadKey = (arousal >= 0.5 ? 'alta' : 'baixa') + '-' + (valence >= 0.5 ? 'agradavel' : 'desagradavel');
    var quad = moodQuadrants[quadKey];
    state.moodPoint = { valence: Math.round(valence * 100) / 100, arousal: Math.round(arousal * 100) / 100, quadrant: quadKey };

    el.moodFeedback.innerHTML = '<p><strong>' + quad.label + '.</strong> Emoções que costumam morar por aqui: ' + quad.words + '.</p><p class="info-note">Não existe posição errada — isso é só um retrato de agora, não um rótulo fixo.</p>';
  }

  el.moodPad.addEventListener('click', function (ev) { handleMoodPadPick(ev.clientX, ev.clientY); });

  el.thermometerContinueBtn.addEventListener('click', function () {
    renderEftScreen();
    showScreen('efttypes');
  });

  // ---------------------------------------------------------------
  // Nem toda emoção é o que parece — tipologia EFT (Greenberg)
  // ---------------------------------------------------------------
  function renderEftScreen() {
    el.eftList.innerHTML = eftTypes.map(function (t) {
      return '<div class="concept-card"><div class="concept-icon" aria-hidden="true">' + t.icon + '</div><div><h3>' + t.title + '</h3><p>' + t.text + '</p><p class="science-note" style="border-top:none;padding-top:0;margin-top:6px"><strong>Exemplo:</strong> ' + t.example + '</p></div></div>';
    }).join('');
  }

  function finishOnboardingIntoCheckin() {
    state.showAfterCheck = !prefs.onboarded;
    prefs.onboarded = true;
    savePrefs();
    startCheckinFlow();
  }

  el.eftContinueBtn.addEventListener('click', finishOnboardingIntoCheckin);

  // ---------------------------------------------------------------
  // Biblioteca das emoções — referência livre, sem jogo, acessível a
  // qualquer momento pelo nav. Reaproveita o conteúdo rico por emoção.
  // ---------------------------------------------------------------
  function stopSpeech() {
    if (speechSupported) window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  function buildSpeechText(e) {
    return e.name + '. ' + e.definition + ' No corpo, em você, pode parecer: ' + e.physical.join(', ') + '. Nos outros, dá pra notar: ' + e.recognizeOthers.join(', ') + '. Dá vontade de: ' + e.actionTendency.join(', ');
  }

  var BODY_FIRST_LIBRARY_ORDER = ['fear', 'anger', 'disgust', 'sad', 'joy', 'surprise'];

  function libraryOrder() {
    if (prefs.profile === 'body-first') {
      return BODY_FIRST_LIBRARY_ORDER.map(function (a) { return emotionByAccent(a); });
    }
    return emotions;
  }

  function showEmotion(index) {
    stopSpeech();
    var list = libraryOrder();
    var e = list[index];
    el.learningProgress.style.width = (((index + 1) / list.length) * 100) + '%';
    el.prevEmotion.disabled = index === 0;
    el.nextEmotion.disabled = index === list.length - 1;

    var listenBtnHtml = (speechSupported && prefs.audioEnabled)
      ? '<button type="button" id="listen-btn" class="listen-btn" aria-pressed="false">🔊 Ouvir</button>' : '';

    var vocab = loadVocab();
    var savedWord = vocab[e.name] || '';

    el.emotionContent.innerHTML =
      '<div class="emotion-layout">' +
        '<div class="emotion-badge accent-' + e.accent + '" aria-hidden="true">' + e.emoji + '</div>' +
        '<div class="emotion-info">' +
          '<div class="emotion-head">' +
            '<h3 class="emotion-name accent-text-' + e.accent + '">' + e.name + '</h3>' +
            listenBtnHtml +
          '</div>' +
          '<div class="emotion-block"><h4>O que é</h4><p>' + e.definition + '</p></div>' +
          '<div class="emotion-block"><h4>De onde vem</h4><p>' + e.origin + '</p></div>' +
          '<div class="scenario-box"><strong>Imagine que...</strong> ' + e.scenario + '</div>' +
          '<div class="emotion-grid-2">' +
            '<div class="emotion-block"><h4>No corpo, em você</h4><ul>' + e.physical.map(li).join('') + '</ul></div>' +
            '<div class="emotion-block"><h4>Como reconhecer nos outros</h4><ul>' + e.recognizeOthers.map(li).join('') + '</ul></div>' +
          '</div>' +
          '<div class="emotion-block"><h4>O que dá vontade de fazer</h4><ul>' + e.actionTendency.map(li).join('') + '</ul></div>' +
          '<div class="emotion-block"><h4>Pensamentos comuns</h4><ul>' + e.thoughts.map(li).join('') + '</ul></div>' +
          '<div class="emotion-grid-2">' +
            '<div class="emotion-block"><h4>Isso ajuda</h4><ul>' + e.healthy.map(li).join('') + '</ul></div>' +
            '<div class="emotion-block"><h4>Isso pode atrapalhar</h4><ul>' + e.unhealthy.map(li).join('') + '</ul></div>' +
          '</div>' +
          '<div class="apply-tip">🎯 <strong>Pra aplicar:</strong> ' + e.applyPrompt + '</div>' +
          '<button type="button" class="science-toggle" id="science-toggle" aria-expanded="false">Quer saber mais? (camada científica)</button>' +
          '<p class="science-note hidden" id="science-note"><strong>Curiosidade:</strong> ' + e.science + '</p>' +
          '<div class="vocab-row">' +
            '<label for="vocab-input">Qual palavra você usaria pra isso, no seu dia a dia? <span style="font-weight:400;color:var(--muted)">(opcional)</span></label>' +
            '<input type="text" id="vocab-input" placeholder="ex.: irritado, com raiva, puto..." value="' + savedWord.replace(/"/g, '&quot;') + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    var scienceToggle = document.getElementById('science-toggle');
    var scienceNote = document.getElementById('science-note');
    scienceToggle.addEventListener('click', function () {
      var expanded = scienceToggle.getAttribute('aria-expanded') === 'true';
      scienceToggle.setAttribute('aria-expanded', String(!expanded));
      scienceNote.classList.toggle('hidden', expanded);
    });

    document.getElementById('vocab-input').addEventListener('change', function () {
      saveVocabWord(e.name, this.value.trim());
    });

    var listenBtn = document.getElementById('listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', function () {
        if (window.speechSynthesis.speaking) {
          stopSpeech();
          listenBtn.setAttribute('aria-pressed', 'false');
          listenBtn.textContent = '🔊 Ouvir';
          return;
        }
        var utt = new SpeechSynthesisUtterance(buildSpeechText(e));
        utt.lang = 'pt-BR';
        utt.onend = function () { listenBtn.setAttribute('aria-pressed', 'false'); listenBtn.textContent = '🔊 Ouvir'; };
        currentUtterance = utt;
        listenBtn.setAttribute('aria-pressed', 'true');
        listenBtn.textContent = '⏸ Parar';
        window.speechSynthesis.speak(utt);
      });
    }
  }

  el.libraryBtn.addEventListener('click', function () {
    stopSpeech();
    state.emotionIndex = 0;
    showScreen('library');
    showEmotion(0);
  });

  el.prevEmotion.addEventListener('click', function () {
    if (state.emotionIndex > 0) { state.emotionIndex--; showEmotion(state.emotionIndex); }
  });

  el.nextEmotion.addEventListener('click', function () {
    if (state.emotionIndex < libraryOrder().length - 1) { state.emotionIndex++; showEmotion(state.emotionIndex); }
  });

  // ---------------------------------------------------------------
  // CHECK-IN 1 — Entrada pela sensação (mapa do corpo ou lista)
  // ---------------------------------------------------------------
  function setEntryMode(mode) {
    prefs.bodyEntryMode = mode;
    savePrefs();
    el.entryModeBody.setAttribute('aria-selected', String(mode === 'body'));
    el.entryModeText.setAttribute('aria-selected', String(mode === 'text'));
    el.bodyMapPanel.classList.toggle('hidden', mode !== 'body');
    el.sensationListPanel.classList.toggle('hidden', mode !== 'text');
  }

  el.entryModeBody.addEventListener('click', function () { setEntryMode('body'); });
  el.entryModeText.addEventListener('click', function () { setEntryMode('text'); });

  function renderBodyEntry() {
    setEntryMode(prefs.bodyEntryMode);
    el.bodyHotspots.innerHTML = bodyRegions.map(function (r) {
      return '<button type="button" class="body-hotspot" style="top:' + r.top + '%;left:' + r.left + '%" data-region="' + r.key + '"><span aria-hidden="true">' + r.icon + '</span> ' + r.label + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.bodyHotspots.querySelectorAll('.body-hotspot'), function (btn) {
      btn.addEventListener('click', function () {
        var region = bodyRegions.filter(function (r) { return r.key === btn.dataset.region; })[0];
        pickSensation('body', region.key, region.label);
      });
    });

    el.sensationChips.innerHTML = sensationDescriptors.map(function (s) {
      return '<button type="button" class="chip" data-sensation="' + s.key + '">' + s.label + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.sensationChips.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        var s = sensationDescriptors.filter(function (d) { return d.key === btn.dataset.sensation; })[0];
        pickSensation('text', s.key, s.label);
      });
    });
  }

  function pickSensation(mode, key, label) {
    state.checkin.entryMode = mode;
    state.checkin.sensationKey = key;
    state.checkin.sensationLabel = label;
    completedSteps = 1;
    updateOverallProgress();
    renderFamilyScreen();
    showScreen('family');
    saveProgress();
  }

  // ---------------------------------------------------------------
  // CHECK-IN 2 — Sugestão de famílias emocionais (reconhecimento
  // assistido; "nenhuma dessas ainda" e "ainda não sei" são respostas
  // válidas, nunca uma pergunta aberta).
  // ---------------------------------------------------------------
  function familyCardHtml(accent) {
    var e = emotionByAccent(accent);
    return '<button type="button" class="family-card" data-accent="' + accent + '">' +
      '<span class="emoji-circle accent-' + e.accent + '" aria-hidden="true">' + e.emoji + '</span>' +
      '<span><strong>' + e.name + '</strong><br><span class="family-card-def">' + e.definition + '</span></span>' +
      '</button>';
  }

  function renderFamilyScreen() {
    var mode = state.checkin.entryMode;
    var families = (mode === 'body' ? regionToFamilies : sensationToFamilies)[state.checkin.sensationKey] || [];
    state.checkin.suggestedFamilies = families.slice();
    el.familyOptions.innerHTML =
      '<p style="color:var(--muted);margin-top:0">Você marcou: <strong>' + state.checkin.sensationLabel + '</strong></p>' +
      families.map(familyCardHtml).join('') +
      '<button type="button" class="family-card family-card-more" id="family-more-btn">Nenhuma dessas ainda</button>';
    wireFamilyCards();
    document.getElementById('family-more-btn').addEventListener('click', revealMoreFamilies);
  }

  function wireFamilyCards() {
    Array.prototype.forEach.call(el.familyOptions.querySelectorAll('.family-card[data-accent]'), function (btn) {
      btn.addEventListener('click', function () { pickFamily(btn.dataset.accent); });
    });
  }

  function revealMoreFamilies() {
    var remaining = ALL_ACCENTS.filter(function (a) { return state.checkin.suggestedFamilies.indexOf(a) === -1; });
    el.familyOptions.innerHTML =
      '<p style="color:var(--muted);margin-top:0">Sem problema — aqui estão as outras:</p>' +
      remaining.map(familyCardHtml).join('') +
      '<button type="button" class="family-card family-card-more" id="family-unknown-btn">Ainda não sei</button>';
    wireFamilyCards();
    document.getElementById('family-unknown-btn').addEventListener('click', function () { pickFamily(null); });
  }

  function pickFamily(accent) {
    state.checkin.chosenFamily = accent;
    completedSteps = accent ? 2 : 3;
    updateOverallProgress();
    if (accent) {
      renderIntensityScreen();
      showScreen('intensity');
    } else {
      renderContextScreen();
      showScreen('context');
    }
    saveProgress();
  }

  // ---------------------------------------------------------------
  // CHECK-IN 3 — Intensidade dentro da família escolhida
  // ---------------------------------------------------------------
  function renderIntensityScreen() {
    var e = emotionByAccent(state.checkin.chosenFamily);
    el.intensityTitle.textContent = 'Dentro de ' + e.name + ', qual combina mais?';
    var levels = intensityLevels[state.checkin.chosenFamily];
    el.intensityOptions.innerHTML = levels.map(function (lvl) {
      return '<button type="button" class="family-card" data-label="' + lvl.label.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + lvl.label + '</strong><br><span class="family-card-def">' + lvl.text + '</span></span>' +
        '</button>';
    }).join('');
    Array.prototype.forEach.call(el.intensityOptions.querySelectorAll('.family-card'), function (btn) {
      btn.addEventListener('click', function () { pickIntensity(btn.dataset.label); });
    });
  }

  function pickIntensity(label) {
    state.checkin.intensityLabel = label;
    completedSteps = 3;
    updateOverallProgress();
    renderContextScreen();
    showScreen('context');
    saveProgress();
  }

  // ---------------------------------------------------------------
  // CHECK-IN 4 — Contexto (sempre opcional)
  // ---------------------------------------------------------------
  function renderContextScreen() {
    el.contextChips.innerHTML = contextSituations.map(function (s) {
      var pressed = state.checkin.context.situation === s.key;
      return '<button type="button" class="chip" data-situation="' + s.key + '" aria-pressed="' + pressed + '">' + s.label + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.contextChips.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        var already = btn.getAttribute('aria-pressed') === 'true';
        Array.prototype.forEach.call(el.contextChips.querySelectorAll('.chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
        state.checkin.context.situation = already ? null : btn.dataset.situation;
        if (!already) btn.setAttribute('aria-pressed', 'true');
      });
    });
    el.contextNote.value = state.checkin.context.note || '';
  }

  function proceedFromContext() {
    state.checkin.context.note = el.contextNote.value.trim();
    completedSteps = 4;
    updateOverallProgress();
    renderActionScreen();
    showScreen('action');
    saveProgress();
  }

  el.contextContinueBtn.addEventListener('click', proceedFromContext);
  el.contextSkipBtn.addEventListener('click', function () {
    state.checkin.context.situation = null;
    state.checkin.context.note = '';
    completedSteps = 4;
    updateOverallProgress();
    renderActionScreen();
    showScreen('action');
    saveProgress();
  });

  // ---------------------------------------------------------------
  // CHECK-IN 5 — Ação possível (impulso do corpo x uma opção, sem
  // julgamento; conteúdo genérico quando nenhuma família foi eleita)
  // ---------------------------------------------------------------
  function renderActionScreen() {
    var accent = state.checkin.chosenFamily;
    if (accent) {
      var e = emotionByAccent(accent);
      el.actionContent.innerHTML =
        '<div class="emotion-block"><h4>O que seu corpo quer fazer</h4><ul>' + e.actionTendency.map(li).join('') + '</ul></div>' +
        '<div class="emotion-block"><h4>Uma ação possível (não a única certa)</h4><ul>' + e.healthy.map(li).join('') + '</ul></div>' +
        '<div class="apply-tip">🎯 ' + e.applyPrompt + '</div>';
    } else {
      el.actionContent.innerHTML =
        '<p>Sem problema não ter uma família ainda — só perceber a sensação já é um passo.</p>' +
        '<div class="emotion-block"><h4>Algumas ideias gerais</h4><ul>' +
        li('Respirar fundo por alguns segundos') + li('Beber um pouco de água') + li('Mudar de ambiente por um momento') + li('Só continuar observando, sem pressa de nomear') +
        '</ul></div>';
    }
  }

  el.actionContinueBtn.addEventListener('click', function () {
    completedSteps = 5;
    updateOverallProgress();
    finalizeCheckinEntry();
    renderMapRegisterScreen();
    showScreen('mapregister');
  });

  // ---------------------------------------------------------------
  // CHECK-IN 6 — Registro no mapa pessoal (sem pontuação)
  // ---------------------------------------------------------------
  function finalizeCheckinEntry() {
    var entry = {
      ts: Date.now(),
      date: new Date().toISOString(),
      entryMode: state.checkin.entryMode,
      sensationKey: state.checkin.sensationKey,
      sensationLabel: state.checkin.sensationLabel,
      suggestedFamilies: state.checkin.suggestedFamilies,
      chosenFamily: state.checkin.chosenFamily || null,
      intensityLabel: state.checkin.intensityLabel,
      context: state.checkin.context,
      ifThenPlan: null
    };
    saveBodyMapEntry(entry);
    state.lastEntryTs = entry.ts;
    completedSteps = 6;
    updateOverallProgress();
    clearProgress();
  }

  function renderMapRegisterScreen() {
    var map = loadBodyMap();
    var s = summarizeBodyMap(map);
    var sensationLabelOf = function (key) {
      var d = sensationDescriptors.filter(function (x) { return x.key === key; })[0];
      if (d) return d.label;
      var r = bodyRegions.filter(function (x) { return x.key === key; })[0];
      return r ? r.label : key;
    };
    var html = '<p style="margin:0 0 10px"><strong>Você já tem ' + s.total + ' registro' + (s.total === 1 ? '' : 's') + '</strong> no seu mapa pessoal.</p>';
    if (s.topSensation) html += '<p style="margin:4px 0">Sensação mais comum: <strong>' + sensationLabelOf(s.topSensation) + '</strong> (' + s.topSensationCount + 'x)</p>';
    if (s.topFamily) html += '<p style="margin:4px 0">Família mais identificada: <strong>' + emotionByAccent(s.topFamily).name + '</strong> (' + s.topFamilyCount + 'x)</p>';
    if (s.unknownCount) html += '<p style="margin:4px 0;color:var(--muted)">Em ' + s.unknownRate + '% dos registros, ainda não rolou identificar uma família — completamente normal, isso também é dado.</p>';
    el.mapRegisterSummary.innerHTML = html;
  }

  el.mapRegisterContinueBtn.addEventListener('click', function () {
    if (state.showAfterCheck) {
      state.showAfterCheck = false;
      renderCheck('after');
      showScreen('check');
    } else {
      showScreen('ifthen');
      renderIfThen();
    }
  });

  // ---------------------------------------------------------------
  // Pular etapa (só se aplica ao trio de onboarding — cada tela do
  // check-in já tem seus próprios botões de continuar/pular)
  // ---------------------------------------------------------------
  el.skipBtn.addEventListener('click', function () {
    if (state.screen === 'concept') {
      resetMoodPad();
      showScreen('thermometer');
    } else if (state.screen === 'thermometer') {
      renderEftScreen();
      showScreen('efttypes');
    } else if (state.screen === 'efttypes') {
      finishOnboardingIntoCheckin();
    }
  });

  // ---------------------------------------------------------------
  // Plano "quando eu perceber ___" (implementation intention)
  // ---------------------------------------------------------------
  function renderIfThen() {
    var chips = emotions.map(function (e) { return e.trigger; }).concat(extraChips);
    el.ifthenChips.innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-trigger="' + c.replace(/"/g, '&quot;') + '">' + c + '</button>';
    }).join('');
    Array.prototype.forEach.call(el.ifthenChips.querySelectorAll('.chip'), function (chip) {
      chip.addEventListener('click', function () {
        el.ifthenInput.value = 'Quando eu perceber ' + chip.dataset.trigger + ', vou tentar nomear o que sinto.';
        el.ifthenInput.focus();
      });
    });
    el.ifthenInput.value = state.ifThenPlan || '';
  }

  el.ifthenContinueBtn.addEventListener('click', function () {
    state.ifThenPlan = el.ifthenInput.value.trim();
    finalizeResult();
  });
  el.ifthenSkipBtn.addEventListener('click', function () {
    state.ifThenPlan = '';
    finalizeResult();
  });

  // ---------------------------------------------------------------
  // Resultado — anexa o plano quando-então ao registro do mapa que
  // acabou de ser criado, mostra o delta da autoavaliação (se houver)
  // ---------------------------------------------------------------
  function finalizeResult() {
    if (state.ifThenPlan && state.lastEntryTs) {
      var map = loadBodyMap();
      var entry = map.filter(function (r) { return r.ts === state.lastEntryTs; })[0];
      if (entry) {
        entry.ifThenPlan = state.ifThenPlan;
        try { localStorage.setItem(BODYMAP_KEY, JSON.stringify(map)); } catch (e) { /* indisponível */ }
      }
    }

    var deltaHtml = '';
    if (state.selfBefore.every(function (v) { return v !== null; }) && state.selfAfter.every(function (v) { return v !== null; })) {
      var d1 = state.selfAfter[0] - state.selfBefore[0];
      var d2 = state.selfAfter[1] - state.selfBefore[1];
      deltaHtml = '<p class="science-note">Sua autopercepção mudou em ' + (d1 >= 0 ? '+' + d1 : d1) + ' ponto(s) na questão 1 e ' + (d2 >= 0 ? '+' + d2 : d2) + ' ponto(s) na questão 2, comparado ao início. Isso não é um diagnóstico — é só um retrato de como você se percebeu hoje.</p>';
    }
    el.resultDelta.innerHTML = deltaHtml;
    showScreen('result');
  }

  el.restartBtn.addEventListener('click', function () {
    resetSession();
    refreshStartScreen();
    showScreen('start');
  });

  // ---------------------------------------------------------------
  // Voltar / Início
  // ---------------------------------------------------------------
  el.backBtn.addEventListener('click', function () {
    switch (state.screen) {
      case 'prefs': showScreen('start'); break;
      case 'check': showScreen(el.checkContinueBtn.dataset.phase === 'after' ? 'mapregister' : 'start'); break;
      case 'concept': showScreen('start'); break;
      case 'thermometer': showScreen('concept'); break;
      case 'efttypes': showScreen('thermometer'); break;
      case 'library': showScreen('start'); break;
      case 'bodyentry': showScreen('efttypes'); break;
      case 'family': showScreen('bodyentry'); break;
      case 'intensity': showScreen('family'); break;
      case 'context': showScreen(state.checkin.chosenFamily ? 'intensity' : 'family'); break;
      case 'action': showScreen('context'); break;
      case 'mapregister': showScreen('action'); break;
      case 'ifthen': showScreen('mapregister'); break;
      case 'result': showScreen('ifthen'); break;
      case 'data': showScreen('start'); break;
    }
  });

  el.homeBtn.addEventListener('click', function () { stopSpeech(); refreshStartScreen(); showScreen('start'); });

  el.dataBtn.addEventListener('click', function () { renderDataScreen(); showScreen('data'); });
  document.getElementById('data-back-btn').addEventListener('click', function () { showScreen('start'); });

  // ---------------------------------------------------------------
  // Mapa pessoal (check-in corporal) — substitui a pontuação por um
  // histórico que cresce com o tempo, sem certo/errado.
  // ---------------------------------------------------------------
  function loadBodyMap() {
    try {
      var raw = localStorage.getItem(BODYMAP_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveBodyMapEntry(entry) {
    var map = loadBodyMap();
    map.push(entry);
    try { localStorage.setItem(BODYMAP_KEY, JSON.stringify(map)); } catch (e) { /* indisponível */ }
    return map;
  }

  function summarizeBodyMap(map) {
    function topKey(counts) {
      var best = null;
      Object.keys(counts).forEach(function (k) {
        if (!best || counts[k] > counts[best]) best = k;
      });
      return best;
    }
    var sensationCounts = {}, familyCounts = {}, unknownCount = 0;
    map.forEach(function (r) {
      sensationCounts[r.sensationKey] = (sensationCounts[r.sensationKey] || 0) + 1;
      if (r.chosenFamily) familyCounts[r.chosenFamily] = (familyCounts[r.chosenFamily] || 0) + 1;
      else unknownCount++;
    });
    var topSensation = topKey(sensationCounts);
    var topFamily = topKey(familyCounts);
    return {
      total: map.length,
      topSensation: topSensation, topSensationCount: topSensation ? sensationCounts[topSensation] : 0,
      topFamily: topFamily, topFamilyCount: topFamily ? familyCounts[topFamily] : 0,
      unknownCount: unknownCount,
      unknownRate: map.length ? Math.round((unknownCount / map.length) * 100) : 0
    };
  }

  function renderDataScreen() {
    var map = loadBodyMap();
    if (!map.length) {
      el.sessionList.innerHTML = '<p class="empty-note">Nenhum registro ainda. Faça um check-in para começar seu mapa pessoal.</p>';
    } else {
      el.sessionList.innerHTML = map.slice().reverse().map(function (r) {
        var d = new Date(r.date);
        var familyName = r.chosenFamily ? emotionByAccent(r.chosenFamily).name : 'ainda não identificada';
        return '<div class="session-row"><span>' + d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' — ' + (r.sensationLabel || r.sensationKey) + '</span><span>' + familyName + '</span></div>';
      }).join('');
    }

    var plans = map.filter(function (r) { return r.ifThenPlan; });
    if (!plans.length) {
      el.planList.innerHTML = '<p class="empty-note">Nenhum plano salvo ainda.</p>';
    } else {
      el.planList.innerHTML = plans.slice().reverse().map(function (r) {
        var d = new Date(r.date);
        return '<div class="session-row" style="display:block"><strong>' + d.toLocaleDateString('pt-BR') + ':</strong> ' + r.ifThenPlan + '</div>';
      }).join('');
    }
  }

  el.exportJsonBtn.addEventListener('click', function () { exportJSON(loadBodyMap()); });
  el.exportHtmlBtn.addEventListener('click', function () { exportHTML(loadBodyMap()); });
  el.exportJsonResult.addEventListener('click', function () { exportJSON(loadBodyMap()); });
  el.exportHtmlResult.addEventListener('click', function () { exportHTML(loadBodyMap()); });
  el.exportRefResult.addEventListener('click', function () { exportQuickReference(); });

  el.clearDataBtn.addEventListener('click', function () {
    if (window.confirm('Isso vai apagar todo o histórico salvo neste dispositivo. Deseja continuar?')) {
      localStorage.removeItem(BODYMAP_KEY);
      renderDataScreen();
    }
  });

  function downloadFile(filename, content, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function exportJSON(map) {
    var payload = { app: 'Matiz', exportedAt: new Date().toISOString(), bodyMap: map };
    downloadFile('matiz-dados-' + Date.now() + '.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportHTML(map) {
    var rows = map.map(function (r, i) {
      var d = new Date(r.date);
      var familyName = r.chosenFamily ? emotionByAccent(r.chosenFamily).name : 'ainda não identificada';
      return '<div style="margin-bottom:24px;padding:16px;border:1px solid #E5E0D8;border-radius:12px;">' +
        '<strong>Registro ' + (i + 1) + '</strong> — ' + d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) +
        '<p>Sensação: ' + (r.sensationLabel || r.sensationKey) + ' · Família: ' + familyName + (r.intensityLabel ? ' (' + r.intensityLabel + ')' : '') + '</p>' +
        (r.context && (r.context.situation || r.context.note) ? '<p>Contexto: ' + (r.context.situation || '') + (r.context.note ? ' — ' + r.context.note : '') + '</p>' : '') +
        (r.ifThenPlan ? '<p><strong>Plano:</strong> ' + r.ifThenPlan + '</p>' : '') +
        '</div>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<title>Relatório Matiz</title>' +
      '<style>body{font-family:sans-serif;max-width:720px;margin:40px auto;color:#33312E;padding:0 20px}h1{color:#38505B}</style>' +
      '</head><body>' +
      '<h1>Relatório pessoal — Matiz</h1>' +
      '<p>Exportado em ' + new Date().toLocaleString('pt-BR') + '.</p>' +
      '<p style="background:#DCE6E9;padding:12px 16px;border-radius:10px;"><strong>Nota:</strong> este relatório é um recurso psicoeducativo e não substitui avaliação ou acompanhamento profissional. Pode ser levado ou enviado para conversar com seu/sua psicólogo/a.</p>' +
      rows +
      '<p style="font-size:12px;color:#6B6863;margin-top:30px">© Psicoterapia e Afins · psicoterapiaeafins.com.br</p>' +
      '</body></html>';

    downloadFile('matiz-relatorio-' + Date.now() + '.html', html, 'text/html');
  }

  function exportQuickReference() {
    var cards = emotions.map(function (e) {
      return '<div style="border:1.5px solid #E5E0D8;border-radius:12px;padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;break-inside:avoid;">' +
        '<div style="font-size:28px">' + e.emoji + '</div>' +
        '<div><strong>' + e.name + '</strong><br>' +
        '<span style="font-size:13px;color:#6B6863">Em você: ' + e.physical[0] + '</span><br>' +
        '<span style="font-size:13px;color:#6B6863">Nos outros: ' + e.recognizeOthers[0] + '</span><br>' +
        '<span style="font-size:13px;color:#6B6863">Dá vontade de: ' + e.actionTendency[0] + '</span></div>' +
        '</div>';
    }).join('');

    var html = '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
      '<title>Cartão de referência rápida — Matiz</title>' +
      '<style>body{font-family:sans-serif;max-width:480px;margin:30px auto;color:#33312E;padding:0 16px}h1{font-size:20px;color:#38505B}@media print{body{margin:0}}</style>' +
      '</head><body>' +
      '<h1>Matiz — cartão de referência rápida</h1>' +
      '<p style="font-size:13px;color:#6B6863">Guarde ou imprima. Um lembrete rápido das 6 emoções básicas, suas pistas no corpo e pensamentos comuns.</p>' +
      cards +
      '<p style="font-size:11px;color:#A9A399;margin-top:16px">Recurso psicoeducativo · © Psicoterapia e Afins</p>' +
      '</body></html>';

    downloadFile('matiz-referencia-rapida-' + Date.now() + '.html', html, 'text/html');
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  applyPrefs();
  updateNav();
  updateOverallProgress();
  refreshStartScreen();
});
