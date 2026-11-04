/* ═══════════════════════════════════════════════════════════════════════
   Trilha — data.js
   Conteúdo da trilha (módulos, emoções, ferramentas). Fonte ÚNICA: o app do adolescente
   e o painel da profissional (editor de orientações) leem este arquivo.

   Regras de identificadores (o banco só aceita estes formatos, ver supabase/trilha.sql):
   • ids de emoção/corpo/impulso/armadilha: minúsculas sem acento, a-z 0-9 _ -  (até 30)
   • ids de ferramenta: os da lista em trilha_sanear
   • chaves de campo (k): a-z 0-9 _  (até 30)
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* Fases e módulos. `abord` = abordagem de base (UP-A, TFC, TCC, DBT/ACT). Os módulos
     específicos por queixa (TOC, trauma, etc.) NÃO entram aqui: são combinados em sessão. */
  var FASES = [
    { id: 'A', nome: 'Começando', mods: [1, 2, 3] },
    { id: 'B', nome: 'Entendendo suas reações', mods: [4, 5, 6, 7, 8] },
    { id: 'C', nome: 'Pensamentos e rotina', mods: [9, 10] },
    { id: 'D', nome: 'Cuidar de si e dos outros', mods: [11, 12] },
    { id: 'F', nome: 'Fechando o ciclo', mods: [13] }
  ];

  var MODULOS = [
    { id: 1, emoji: '🧭', nome: 'O que eu quero mudar', abord: 'UP-A',
      porque: 'A terapia funciona melhor quando tem a ver com o que VOCÊ quer, e não só com o que os outros querem. Aqui a gente começa pelas suas metas.',
      sessao: 'Conversamos sobre o que está pesado, o que você gostaria que fosse diferente e o que já funciona na sua vida.',
      pratica: 'Escolha 3 metas suas (podem ser pequenas) e monte uma playlist que diga quem você é.',
      ferramentas: ['checkin', 'sos'] },
    { id: 2, emoji: '🌡️', nome: 'Entendendo as emoções', abord: 'UP-A',
      porque: 'Emoção não é defeito: é um aviso. Toda emoção tem 3 partes que andam juntas: o que você pensa, o que sente no corpo e o que tem vontade de fazer.',
      sessao: 'Olhamos situações reais da sua semana e separamos pensamento, corpo e ação.',
      pratica: 'Faça um check-in por dia (leva 1 minuto) para treinar o olhar.',
      ferramentas: ['checkin'] },
    { id: 3, emoji: '🧠', nome: 'Os três modos do cérebro', abord: 'TFC',
      porque: 'Seu cérebro tem um modo alerta (ameaça), um modo conquista (correr atrás) e um modo calma. Muita gente vive só nos dois primeiros, e isso cansa. Não é culpa sua: é o cérebro tentando te proteger.',
      sessao: 'Desenhamos os três modos com exemplos seus e vemos qual domina na sua semana.',
      pratica: 'Anote, por dia, uma coisa que ativa o seu modo calma. Teste o ritmo calmante.',
      ferramentas: ['respirar', 'sos'] },
    { id: 4, emoji: '🔍', nome: 'Prestar atenção no agora', abord: 'UP-A',
      porque: 'Quando você nota a emoção sem brigar com ela, ela perde um pouco de força. Isso é treino, como qualquer outro.',
      sessao: 'Praticamos exercícios curtos de atenção (de 2 a 5 minutos), com música ou objetos.',
      pratica: 'Faça 2 minutos de atenção por dia. Use o aterramento quando a cabeça estiver a mil.',
      ferramentas: ['aterrar', 'respirar'] },
    { id: 5, emoji: '🧪', nome: 'Testando o que a emoção diz', abord: 'UP-A',
      porque: 'A emoção costuma prever o pior ("vai dar tudo errado"). Em vez de acreditar ou brigar, você pode testar: faz uma previsão, tenta, e vê o que acontece de verdade.',
      sessao: 'Montamos o primeiro experimento juntos: previsão, plano e como vamos medir.',
      pratica: 'Um experimento pequeno por semana, anotando o que você achava e o que aconteceu.',
      ferramentas: ['experimento'] },
    { id: 6, emoji: '🫀', nome: 'O que o corpo sente', abord: 'UP-A',
      porque: 'Coração acelerado, nó na barriga, falta de ar: são sensações desconfortáveis, mas não perigosas. Entender o corpo tira muito do medo.',
      sessao: 'Fazemos exercícios que provocam essas sensações de propósito, COM sua psicóloga, para você ver que passa. Esses exercícios são só na sessão.',
      pratica: 'Observe e anote onde cada emoção aparece no corpo. Use a respiração para dar um descanso.',
      ferramentas: ['checkin', 'respirar'] },
    { id: 7, emoji: '🚪', nome: 'O que eu faço quando sinto', abord: 'UP-A',
      porque: 'Fugir, evitar, ficar no celular ou se isolar alivia na hora, mas muitas vezes mantém o problema. Dá para perceber esses "atalhos" sem culpa.',
      sessao: 'Mapeamos os seus atalhos e o que eles custam e dão a curto e longo prazo.',
      pratica: 'Pegue um atalho por semana e teste agir de outro jeito, em um momento de baixa intensidade.',
      ferramentas: ['checkin', 'experimento'] },
    { id: 8, emoji: '🪜', nome: 'Enfrentando de pouco em pouco', abord: 'UP-A',
      porque: 'Quanto mais a gente evita, maior o medo fica. Enfrentar aos poucos, no seu ritmo, faz o medo diminuir de verdade.',
      sessao: 'Montamos a escada de degraus e ensaiamos o primeiro. Os degraus são combinados com sua psicóloga.',
      pratica: 'Faça só os degraus que vocês combinaram. Antes, use o ritmo calmante; depois, uma frase gentil para si.',
      ferramentas: ['escada', 'respirar', 'carta'] },
    { id: 9, emoji: '🕵️', nome: 'Detetive de pensamentos', abord: 'TCC',
      porque: 'Pensamento não é fato. A mente adora cair em armadilhas ("sempre dá errado", "todo mundo me acha chato"). O detetive investiga as provas.',
      sessao: 'Treinamos a investigar pensamentos com situações reais e a criar alternativas mais realistas.',
      pratica: 'Faça um registro do detetive quando um pensamento pesado aparecer.',
      ferramentas: ['detetive'] },
    { id: 10, emoji: '⚡', nome: 'Energia, sono e rotina', abord: 'TCC',
      porque: 'Quando o humor cai, a gente faz menos coisas, e aí o humor cai mais. Quebrar esse ciclo com ações pequenas ajuda mais do que esperar a vontade chegar.',
      sessao: 'Olhamos sono, rotina e o que dá prazer, sentido e contato com pessoas. Escolhemos ações pequenas.',
      pratica: 'Planeje 3 ações pequenas na semana (prazer, algo que importa e algo com gente).',
      ferramentas: ['agenda'] },
    { id: 11, emoji: '💬', nome: 'Voz crítica e voz gentil', abord: 'TFC',
      porque: 'Muita gente é bem mais dura consigo do que seria com um amigo. Ser gentil não é ser fraco: é o que dá força para tentar de novo.',
      sessao: 'Conversamos sobre a voz crítica, de onde ela vem, e treinamos uma voz mais gentil e firme.',
      pratica: 'Escreva uma carta para você num dia difícil, como se fosse para um amigo.',
      ferramentas: ['carta', 'respirar'] },
    { id: 12, emoji: '🤝', nome: 'Relações, limites e redes', abord: 'DBT/ACT',
      porque: 'Dizer não, pedir ajuda e lidar com conflito são habilidades. Redes sociais também mexem com como a gente se sente.',
      sessao: 'Ensaiamos conversas difíceis (role-play), pensamos em limites e olhamos o seu feed com cuidado.',
      pratica: 'Pratique um pedido ou um limite por semana e ajuste o que você segue nas redes.',
      ferramentas: ['experimento', 'agenda'] },
    { id: 13, emoji: '🏁', nome: 'Olhar para trás e para frente', abord: 'UP-A',
      porque: 'Fechar o ciclo é ver o que mudou, o que funcionou e como continuar sozinho/a, sabendo quando pedir ajuda de novo.',
      sessao: 'Revisamos sua jornada e montamos o seu "manual de bolso".',
      pratica: 'Monte sua caixa SOS final, revise o plano de segurança e escreva uma carta para você no futuro.',
      ferramentas: ['semanal', 'sos', 'plano'] }
  ];

  /* Opções de "chips": value = id (a-z0-9_-). Rótulos com acento ficam só aqui. */
  var EMOCOES = [
    { v: 'ansiedade', e: '😰', l: 'Ansiedade' }, { v: 'medo', e: '😨', l: 'Medo' },
    { v: 'tristeza', e: '😢', l: 'Tristeza' }, { v: 'raiva', e: '😠', l: 'Raiva' },
    { v: 'vergonha', e: '😳', l: 'Vergonha' }, { v: 'culpa', e: '😔', l: 'Culpa' },
    { v: 'solidao', e: '🫥', l: 'Solidão' }, { v: 'frustracao', e: '😤', l: 'Frustração' },
    { v: 'tedio', e: '😑', l: 'Tédio/vazio' }, { v: 'confusao', e: '😵‍💫', l: 'Confusão' },
    { v: 'alegria', e: '😊', l: 'Alegria' }, { v: 'calma', e: '😌', l: 'Calma' },
    { v: 'alivio', e: '😮‍💨', l: 'Alívio' }, { v: 'animo', e: '🤩', l: 'Empolgação' }
  ];
  var CORPO = [
    { v: 'aperto_peito', l: 'Aperto no peito' }, { v: 'no_barriga', l: 'Nó na barriga' },
    { v: 'coracao', l: 'Coração acelerado' }, { v: 'tensao', l: 'Tensão/músculos duros' },
    { v: 'cansaco', l: 'Cansaço' }, { v: 'calor', l: 'Calor/suor' },
    { v: 'tremor', l: 'Tremor' }, { v: 'cabeca', l: 'Dor de cabeça' },
    { v: 'falta_ar', l: 'Falta de ar' }, { v: 'nada', l: 'Nada em especial' }
  ];
  var IMPULSOS = [
    { v: 'evitar', l: 'Evitar/fugir' }, { v: 'isolar', l: 'Me isolar' },
    { v: 'brigar', l: 'Brigar/discutir' }, { v: 'chorar', l: 'Chorar' },
    { v: 'celular', l: 'Ficar no celular' }, { v: 'adiar', l: 'Deixar para depois' },
    { v: 'pedir_ajuda', l: 'Pedir ajuda' }, { v: 'conversar', l: 'Conversar' },
    { v: 'nada', l: 'Nada em especial' }
  ];
  var ARMADILHAS = [
    { v: 'catastrofe', l: 'Catástrofe: "vai dar tudo errado"' },
    { v: 'ler_mentes', l: 'Ler mentes: "eles acham que..."' },
    { v: 'tudo_nada', l: 'Tudo ou nada' },
    { v: 'deveria', l: 'Regras rígidas: "eu deveria..."' },
    { v: 'culpa_minha', l: 'Culpa minha por tudo' },
    { v: 'sempre_nunca', l: '"Sempre" e "nunca"' },
    { v: 'so_o_ruim', l: 'Ver só o negativo' },
    { v: 'rotulo', l: 'Rótulo: "sou um fracasso"' }
  ];
  var TIPOS_ACAO = [
    { v: 'prazer', l: 'Prazer' }, { v: 'importa', l: 'Algo que importa' },
    { v: 'gente', l: 'Com gente' }, { v: 'corpo', l: 'Corpo/sono' }
  ];

  /* Ferramentas. tipo 'form' = formulário genérico (campos: k, bucket n|c|t, tipo).
     Os demais tipos têm tela própria no app.js. */
  var FERRAMENTAS = [
    { id: 'checkin', emoji: '🌡️', nome: 'Check-in', sub: 'Pensamento, corpo e o que fiz', tipo: 'form', min: '1 min',
      intro: 'Um registro rápido para treinar o olhar. Nada aqui está certo ou errado.',
      campos: [
        { k: 'emocao', b: 'c', t: 'chips', multi: true, l: 'O que você está sentindo?', opts: 'EMOCOES' },
        { k: 'intensidade', b: 'n', t: 'esc', l: 'Quão forte está? (0 = quase nada, 10 = o máximo)' },
        { k: 'corpo', b: 'c', t: 'chips', multi: true, l: 'Onde aparece no corpo?', opts: 'CORPO' },
        { k: 'pensamento', b: 't', t: 'txt', l: 'O que passou pela sua cabeça?', ph: 'Uma frase já basta' },
        { k: 'impulso', b: 'c', t: 'chips', multi: true, l: 'Teve vontade de...', opts: 'IMPULSOS' }
      ] },
    { id: 'respirar', emoji: '🌬️', nome: 'Ritmo calmante', sub: 'Respirar para baixar o alerta', tipo: 'respirar', min: '1–3 min' },
    { id: 'aterrar', emoji: '🌳', nome: 'Aterramento 5-4-3-2-1', sub: 'Voltar para o aqui e agora', tipo: 'aterrar', min: '2 min' },
    { id: 'detetive', emoji: '🕵️', nome: 'Detetive de pensamentos', sub: 'Investigar um pensamento pesado', tipo: 'form', min: '5 min',
      intro: 'Pensamento não é fato. Vamos olhar as provas, com calma.',
      campos: [
        { k: 'situacao', b: 't', t: 'txt', l: 'O que aconteceu?', ph: 'Onde, quando, com quem' },
        { k: 'pensamento', b: 't', t: 'txt', l: 'Qual foi o pensamento?', ph: 'A frase que veio na cabeça' },
        { k: 'emocao', b: 'c', t: 'chips', multi: true, l: 'Que emoção veio?', opts: 'EMOCOES' },
        { k: 'antes', b: 'n', t: 'esc', l: 'Quanto você acredita nesse pensamento? (0 a 10)' },
        { k: 'armadilha', b: 'c', t: 'chips', multi: true, l: 'Alguma armadilha?', opts: 'ARMADILHAS' },
        { k: 'contra', b: 't', t: 'area', l: 'O que mostra que talvez não seja bem assim?', ph: 'Exceções, fatos, o que um amigo diria' },
        { k: 'alternativa', b: 't', t: 'area', l: 'Um pensamento mais realista', ph: 'Nem tão ruim quanto o medo, nem forçado' },
        { k: 'depois', b: 'n', t: 'esc', l: 'E agora, quanto você acredita no pensamento original? (0 a 10)' }
      ] },
    { id: 'experimento', emoji: '🧪', nome: 'Experimento', sub: 'Testar uma previsão na prática', tipo: 'form', min: '5 min + o teste',
      intro: 'Faça uma previsão, teste num passo pequeno e veja o que acontece de verdade.',
      campos: [
        { k: 'previsao', b: 't', t: 'area', l: 'O que você acha que vai acontecer?', ph: 'Ex.: "Se eu falar na aula, vão rir de mim"' },
        { k: 'crenca', b: 'n', t: 'esc', l: 'Quanto você acredita nessa previsão? (0 a 10)' },
        { k: 'plano', b: 't', t: 'area', l: 'Qual é o seu teste? (pequeno e possível)', ph: 'O que, quando, onde' },
        { k: 'resultado', b: 't', t: 'area', l: 'O que aconteceu de verdade? (preencha depois do teste)', ph: 'Pode deixar vazio agora e voltar depois' },
        { k: 'depois', b: 'n', t: 'esc', l: 'E agora, quanto você acredita na previsão? (0 a 10)' }
      ] },
    { id: 'escada', emoji: '🪜', nome: 'Escada de enfrentamento', sub: 'Degraus combinados com sua psicóloga', tipo: 'escada', min: 'no seu ritmo' },
    { id: 'carta', emoji: '💌', nome: 'Carta gentil', sub: 'Falar consigo como com um amigo', tipo: 'form', min: '5 min',
      intro: 'Pense numa situação difícil e escreva como se fosse para alguém de quem você gosta muito.',
      campos: [
        { k: 'situacao', b: 't', t: 'txt', l: 'Qual é a situação?', ph: 'Algo que está pesando' },
        { k: 'critica', b: 't', t: 'area', l: 'O que a sua voz crítica diz?', ph: 'Escreva do jeito que ela fala' },
        { k: 'amigo', b: 't', t: 'area', l: 'O que você diria a um amigo nessa situação?', ph: 'Sem julgar, com firmeza e cuidado' },
        { k: 'carta', b: 't', t: 'area', l: 'Agora escreva isso para você', ph: 'Querido/a eu...' },
        { k: 'peso', b: 'n', t: 'esc', l: 'O quanto isso pesa agora? (0 a 10)' }
      ] },
    { id: 'agenda', emoji: '🗓️', nome: 'Ações da semana', sub: 'Pequenas ações que fazem bem', tipo: 'lista', min: 'no seu ritmo' },
    { id: 'sos', emoji: '🧰', nome: 'Caixa SOS', sub: 'O que me ajuda quando está difícil', tipo: 'lista', min: 'no seu ritmo' },
    { id: 'plano', emoji: '🛟', nome: 'Plano de segurança', sub: 'Para os dias muito difíceis', tipo: 'plano', min: '10 min, com sua psicóloga' },
    { id: 'semanal', emoji: '📋', nome: 'Balanço da semana', sub: 'Como foi a semana, em poucos itens', tipo: 'semanal', min: '2 min' }
  ];

  var OPTS = { EMOCOES: EMOCOES, CORPO: CORPO, IMPULSOS: IMPULSOS, ARMADILHAS: ARMADILHAS, TIPOS_ACAO: TIPOS_ACAO };

  global.TRILHA = { FASES: FASES, MODULOS: MODULOS, FERRAMENTAS: FERRAMENTAS, OPTS: OPTS, EMOCOES: EMOCOES };
})(window);
