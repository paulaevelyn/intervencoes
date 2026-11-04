import type { TraitId } from '../types';

export interface EstadoInfo {
  id: string;
  label: string;
  short: string;
  /** Para quem costuma ser mais relevante (só para ordenar a lista, nunca para esconder). */
  destaque: TraitId[];
  oQue: string;
  sinais: string[];
  agora: string[];
  evitar: string[];
  depois: string[];
  parar: string[];
  ajuda: string;
  compaixao: string;
  praticas: string[];
}

export const ESTADOS: EstadoInfo[] = [
  {
    id: 'sobrecarga', label: 'Sobrecarga', short: 'Estímulo ou demanda demais para o seu sistema agora',
    destaque: ['autismo', 'audhd', 'tdah'],
    oQue: 'O corpo e a mente receberam mais do que conseguem processar: som, luz, gente, decisões, tarefas. Não é fraqueza. É um limite de capacidade que muda de um dia para o outro.',
    sinais: ['Irritação ou vontade de fugir', 'Barulhos e luzes ficam insuportáveis', 'Dificuldade de decidir ou de achar palavras', 'Mais movimentos repetitivos, ou rigidez', 'Cabeça pesada, mandíbula e ombros tensos'],
    agora: ['Reduza um estímulo: sair do ambiente, baixar a luz, usar fones ou óculos escuros.', 'Diminua as demandas: adie ou simplifique o que der, sem se explicar demais.', 'Faça uma pausa de 5 minutos sem pedir nada de você.'],
    evitar: ['Decisões grandes e conversas difíceis.', 'Colocar mais um estímulo “para relaxar” (telas, barulho).', 'Se cobrar para “dar conta” como se estivesse bem.'],
    depois: ['Beba água e coma algo simples.', 'Anote no registro sensorial o que pesou e o que ajudou.', 'Planeje um período de baixa demanda nas próximas horas.'],
    parar: ['Pare quando perceber os primeiros sinais, não quando chegar ao limite.', 'Se estiver em meltdown ou shutdown, o foco passa a ser segurança e recuperação, não produtividade.'],
    ajuda: 'Se a sobrecarga vira rotina por semanas, vale conversar com um profissional sobre ajustes no trabalho, estudo e rotina.',
    compaixao: 'Meu sistema está cheio. Não preciso dar conta de tudo agora. Reduzir é cuidado, não fracasso.',
    praticas: ['descompressao', 'reduzir-demandas', 'checagem-corpo'],
  },
  {
    id: 'meltdown', label: 'Meltdown', short: 'Descarga intensa depois de passar do limite',
    destaque: ['autismo', 'audhd'],
    oQue: 'Resposta involuntária a uma sobrecarga que passou do limite. Pode aparecer como choro forte, gritos, agitação ou vontade de se machucar ou quebrar coisas. Não é birra nem manipulação, e a pessoa não está no controle naquele momento.',
    sinais: ['Corpo muito agitado, calor, respiração rápida', 'Dificuldade de falar ou pensar com clareza', 'Chorar, gritar, bater ou se debater sem querer', 'Vontade urgente de escapar'],
    agora: ['Segurança primeiro: vá para um lugar mais calmo e seguro, longe de quem possa se machucar ou de objetos perigosos.', 'Reduza estímulos ao máximo: luz, som, gente. Peça espaço com uma frase curta ou por gesto.', 'Deixe o corpo descarregar sem se julgar. Pressão profunda (abraçar uma almofada, cobertor) pode ajudar.', 'Não tente resolver, explicar ou discutir agora.'],
    evitar: ['Argumentar, pedir explicação ou exigir desculpas no momento.', 'Tocar sem permissão ou prender o corpo, a menos que haja risco imediato.', 'Se culpar. Isso não torna o próximo meltdown menos provável.'],
    depois: ['Espere o corpo baixar: pode levar de minutos a horas, e é comum vir exaustão ou shutdown depois.', 'Água, comida simples, silêncio, algo macio e familiar.', 'Só depois, se quiser, revise o que levou até aqui (sem culpa).', 'Reduza demandas pelo resto do dia.'],
    parar: ['Pare tudo o que for exigência. A única meta é voltar a se sentir seguro/a.', 'Se houver risco de se machucar ou machucar alguém, peça ajuda agora.'],
    ajuda: 'Se aparecem pensamentos de se machucar ou de acabar com a vida, ligue 188 (CVV, 24h) ou 192 (SAMU). Se meltdowns são frequentes ou perigosos, vale buscar apoio profissional.',
    compaixao: 'Eu passei do meu limite. O que aconteceu não define quem eu sou. Eu mereço cuidado agora.',
    praticas: ['pressao', 'descompressao', 'respiracao'],
  },
  {
    id: 'shutdown', label: 'Shutdown', short: 'Desligar por dentro quando é demais',
    destaque: ['autismo', 'audhd'],
    oQue: 'O sistema “desliga” para se proteger. Pode ser perda temporária da fala, sensação de vazio, corpo pesado, dificuldade de se mexer ou de responder. Parece calma por fora, mas é um estado de esgotamento.',
    sinais: ['Perder a fala ou só conseguir poucas palavras', 'Corpo pesado, olhar “fora”', 'Dificuldade de começar qualquer coisa', 'Vontade de ficar deitado/a no escuro', 'Sensação de vazio ou distância'],
    agora: ['Fique em um lugar seguro e silencioso. Nada de exigir resposta.', 'Se precisar avisar alguém, use texto curto ou um cartão pronto: “Estou em shutdown. Preciso de silêncio. Falo depois.”', 'Cobertor, luz baixa, objeto familiar. Faça o mínimo: beber água.'],
    evitar: ['Perguntas em sequência ou pedido para “falar sobre isso”.', 'Se forçar a continuar a tarefa ou o evento.', 'Concluir que “não está se esforçando”.'],
    depois: ['Volte devagar: água, comida, movimento suave.', 'Retome com uma coisa pequena, ou com nada, se precisar.', 'Considere o que levou ao shutdown para reduzir carga nos próximos dias.'],
    parar: ['Pare as demandas externas. Recuperação vem antes de produtividade.', 'Se durar muitos dias ou vier com desesperança intensa, procure apoio profissional.'],
    ajuda: 'Se o shutdown vem com pensamentos de desistir de tudo ou de se machucar, ligue 188 (CVV) ou 192 (SAMU).',
    compaixao: 'Meu corpo me protegeu quando ficou demais. Eu posso me recuperar no meu tempo.',
    praticas: ['descompressao', 'pressao', 'frases-apoio'],
  },
  {
    id: 'exaustao', label: 'Exaustão / burnout', short: 'Cansaço profundo de mascarar e de se esforçar demais',
    destaque: ['autismo', 'audhd', 'ah', 'tdah'],
    oQue: 'Esgotamento acumulado de semanas ou meses: esforçar-se para parecer “normal” (mascarar), lidar com ambientes difíceis e cobranças. Muito relatado por pessoas autistas e com TDAH. Pode vir com perda de habilidades, que voltam com descanso.',
    sinais: ['Cansaço que o sono não resolve', 'Mais sensibilidade a ruído e luz', 'Perda de habilidades antes fáceis', 'Dificuldade de fazer o básico', 'Afastamento e irritação'],
    agora: ['Corte o que não é essencial. Reveja o plano mínimo de autocuidado.', 'Reduza o mascaramento onde for seguro: sem forçar sorriso, contato visual ou conversa fiada.', 'Priorize sono, comida, água e baixa estimulação.'],
    evitar: ['Compensar com mais esforço ou mais tarefas.', 'Comparar-se com quem “dá conta”.', 'Decidir mudanças grandes no pior momento.'],
    depois: ['Recuperação leva semanas ou meses. Pense em ritmo, não em “voltar ao normal”.', 'Aos poucos, devolva demandas, uma por vez.', 'Procure ajustes duradouros: pausas, horários, ambientes.'],
    parar: ['Pare antes do colapso: sinais que se repetem pedem pausa, não força.', 'Se o cansaço vem com tristeza intensa ou desesperança, procure ajuda profissional.'],
    ajuda: 'Conversar com um profissional de saúde sobre afastamento, ajustes e apoio pode fazer diferença. O pedido de acomodações no trabalho está na Biblioteca.',
    compaixao: 'Eu venho me esforçando muito. Descansar não é preguiça: é o que me permite continuar.',
    praticas: ['reduzir-demandas', 'acomodacoes', 'reiniciar'],
  },
  {
    id: 'paralisia', label: 'Paralisia para começar', short: 'Quer fazer, mas o corpo não vai',
    destaque: ['tdah', 'audhd', 'ah'],
    oQue: 'Quando a tarefa parece grande, vaga ou carregada de pressão, o cérebro trava, mesmo com vontade. Em geral não é falta de motivação, e sim dificuldade de função executiva: planejar, iniciar, decidir por onde começar.',
    sinais: ['Olhar para a tarefa e não conseguir se mexer', 'Rolar a tela ou fazer outras coisas', 'Culpa crescente por não começar', 'Pensar “vai dar errado” ou “não está perfeito”'],
    agora: ['Reduza a tarefa a uma ação de 2 minutos: abrir o arquivo, pegar o material.', 'Use um cronômetro curto e permissão para parar depois.', 'Mude o corpo: levante, beba água, abra a janela. Depois, tente o passo.', 'Se puder, faça ao lado de alguém (body doubling), mesmo sem conversar.'],
    evitar: ['Planejar tudo antes de começar.', 'Se cobrar com frases duras. Aumentam a trava.', 'Escolher o passo mais difícil primeiro.'],
    depois: ['Comemore o começo, não o resultado.', 'Anote onde parou para retomar com facilidade.', 'Perceba o que ajudou e repita.'],
    parar: ['Pare quando o tempo acabar. Continuar é opcional.', 'Se parece impossível por dias, o problema pode ser carga ou cansaço, não vontade.'],
    ajuda: 'Se a trava vem com tristeza persistente ou desesperança, procure apoio profissional.',
    compaixao: 'Começar é difícil para o meu cérebro, e isso não diz nada sobre meu valor. Um passo pequeno já é um passo.',
    praticas: ['comecar-2min', 'preparar', 'movimento'],
  },
  {
    id: 'hiperfoco', label: 'Hiperfoco', short: 'Foco total em algo, às vezes sem perceber o resto',
    destaque: ['tdah', 'audhd', 'autismo', 'ah'],
    oQue: 'Imersão intensa em algo que interessa. Pode ser uma força, e também pode fazer esquecer comida, água, sono e outros compromissos. Parar bruscamente costuma ser dolorido.',
    sinais: ['O tempo “some”', 'Fome, sede ou xixi ignorados', 'Irritação quando interrompem', 'Dificuldade de trocar de atividade'],
    agora: ['Defina um ponto de parada: “termino este trecho e paro”.', 'Programe um alarme suave e anote onde parou para voltar depois.', 'Faça as necessidades básicas antes de continuar.'],
    evitar: ['Interromper do nada sem transição.', 'Culpar-se pelo tempo gasto.', 'Entrar em hiperfoco antes de compromissos importantes sem alarme.'],
    depois: ['Dê tempo para sair: alongar, beber água, uma transição curta.', 'Ao dormir tarde, reduza demandas no dia seguinte.'],
    parar: ['Pare quando o corpo pedir ou o alarme tocar, e se for preciso, mantenha a opção de voltar depois.', 'Hiperfoco que atrapalha sono ou saúde por dias merece atenção.'],
    ajuda: 'Se o hiperfoco afeta sono, trabalho ou relações de forma repetida, pode valer conversar com um profissional.',
    compaixao: 'Meu interesse é intenso, e isso é bonito. Eu também mereço água, comida e descanso.',
    praticas: ['transicao', 'checagem-corpo', 'movimento'],
  },
  {
    id: 'rejeicao', label: 'Sensibilidade intensa à rejeição', short: 'Dor forte por crítica ou sensação de ter falhado',
    destaque: ['tdah', 'audhd', 'ah', 'autismo'],
    oQue: 'Uma reação emocional muito forte e rápida a crítica, exclusão ou sensação de decepcionar. É muito relatada por pessoas com TDAH e autistas (às vezes chamada de RSD). Não é diagnóstico oficial, mas a dor é real.',
    sinais: ['Vergonha ou tristeza muito intensas e repentinas', 'Pensamentos como “sou um fracasso” ou “todo mundo me odeia”', 'Vontade de me afastar ou de reagir rápido', 'Reler mensagens procurando sinais de rejeição'],
    agora: ['Respire e lembre: a intensidade é do momento, e vai baixar.', 'Dê um nome: “estou com dor de rejeição”.', 'Antes de responder ou agir, espere. Escreva e guarde como rascunho.', 'Procure uma checagem de realidade com alguém de confiança, ou escreva fatos x interpretações.'],
    evitar: ['Responder no auge da emoção.', 'Tirar conclusões definitivas sobre a pessoa ou sobre si.', 'Isolar-se por muito tempo.'],
    depois: ['Revise com calma: o que foi fato e o que foi interpretação?', 'Se for o caso, converse com a pessoa, de forma direta e sem acusar.', 'Faça algo gentil por você.'],
    parar: ['Pare de reler e revisar a conversa. Isso alimenta a dor.', 'Se a dor vira desesperança, procure ajuda.'],
    ajuda: 'Se vierem pensamentos de se machucar, ligue 188 (CVV, 24h) ou 192 (SAMU).',
    compaixao: 'Essa dor é real, mesmo que a situação não seja tão grave quanto parece agora. Eu mereço gentileza, principalmente de mim.',
    praticas: ['autocompaixao', 'respiracao', 'grounding'],
  },
  {
    id: 'tedio', label: 'Falta de estímulo / tédio', short: 'Cérebro pedindo desafio, novidade ou movimento',
    destaque: ['tdah', 'audhd', 'ah'],
    oQue: 'Quando a tarefa é monótona ou fácil demais, o cérebro pode ficar agitado, disperso ou sonolento. É um sinal de necessidade de estímulo, e não de falta de caráter. Também cansa.',
    sinais: ['Inquietação, bocejos, vontade de mudar de atividade', 'Pensamentos “correndo” para outras coisas', 'Procrastinar com algo mais interessante', 'Irritação com o que é repetitivo'],
    agora: ['Adicione estímulo seguro: música, caminhada curta, mudar de lugar.', 'Torne um desafio: cronômetro, meta curta, versão mais difícil.', 'Alterne com algo interessante por alguns minutos e volte.'],
    evitar: ['Entrar em um estímulo que prende por horas (feed, jogo) sem limite.', 'Se criticar por “não conseguir se concentrar”.'],
    depois: ['Se a tarefa é chata e necessária, divida e agende recompensa depois.', 'Perceba que tipo de estímulo ajuda mais para repetir.'],
    parar: ['Pare quando a tarefa virar só luta contra o tédio. Mude de método ou de horário.', 'Se tédio e vazio andam juntos por dias, vale conversar com um profissional.'],
    ajuda: 'Se o tédio vem com tristeza persistente ou falta de prazer em quase tudo, procure apoio profissional.',
    compaixao: 'Meu cérebro gosta de estímulo e de sentido. Posso dar o que ele precisa sem me culpar.',
    praticas: ['movimento', 'reiniciar', 'comecar-2min'],
  },
  {
    id: 'ansiedade', label: 'Ansiedade', short: 'Alerta no corpo e preocupação antecipando o que vem',
    destaque: [],
    oQue: 'O corpo se prepara para um perigo, mesmo que seja uma situação social, uma tarefa ou uma incerteza. Em pessoas neurodivergentes, mudanças de planos e imprevistos costumam ser gatilhos fortes.',
    sinais: ['Coração rápido, aperto no peito ou no estômago', 'Pensamentos acelerados “e se…”', 'Dificuldade de relaxar ou dormir', 'Evitar situações'],
    agora: ['Solte o ar devagar, mais longo do que o ar que entra, por 2 minutos.', 'Aterrisse com os sentidos: 5-4-3-2-1.', 'Escreva a preocupação e um passo concreto que você pode dar, ou nenhum.', 'Se for incerteza, escreva o que você sabe e o que não sabe.'],
    evitar: ['Pesquisar sem parar em busca de certeza.', 'Cafeína e telas em excesso.', 'Se julgar por estar ansioso/a.'],
    depois: ['Perceba o que o corpo precisa: água, movimento, sono.', 'Se um evento está próximo, prepare roteiros e rotas B.'],
    parar: ['Pare quando estiver repetindo o mesmo pensamento sem novidade.', 'Se ansiedade atrapalha o dia a dia por semanas, procure apoio profissional.'],
    ajuda: 'Crises de pânico ou pensamentos de se machucar pedem ajuda: 188 (CVV, 24h) ou 192 (SAMU).',
    compaixao: 'Meu corpo está tentando me proteger. Eu posso me acalmar passo a passo.',
    praticas: ['respiracao', 'grounding', 'autocompaixao'],
  },
  {
    id: 'tristeza', label: 'Tristeza', short: 'Peso, vontade de chorar ou de se recolher',
    destaque: [],
    oQue: 'Emoção que sinaliza perda, cansaço ou necessidade de cuidado. Não precisa ser consertada na hora. Pode ser acolhida.',
    sinais: ['Peso no peito, nó na garganta', 'Vontade de chorar ou de ficar sozinho/a', 'Menos energia e interesse', 'Pensamentos mais negativos'],
    agora: ['Permita sentir: chorar, deitar, escrever, ouvir algo que conforta.', 'Ofereça-se uma frase gentil, como diria a um amigo.', 'Cuide do básico: água, comida, luz natural, contato com alguém de confiança.'],
    evitar: ['Cobrar-se por estar triste.', 'Decisões definitivas com a emoção no auge.', 'Ficar isolado/a por muito tempo.'],
    depois: ['Quando o peso baixar, faça uma coisa pequena e agradável.', 'Observe se a tristeza dura muito ou se repete.'],
    parar: ['Pare de se forçar a produzir. Descansar também é cuidar.', 'Se a tristeza dura mais de duas semanas ou tira o prazer de tudo, procure ajuda profissional.'],
    ajuda: 'Se aparecerem pensamentos de acabar com a vida, ligue 188 (CVV, 24h) ou 192 (SAMU).',
    compaixao: 'Estou triste e tudo bem. Eu posso ficar comigo com carinho.',
    praticas: ['autocompaixao', 'reiniciar', 'frases-apoio'],
  },
  {
    id: 'raiva', label: 'Raiva / irritação', short: 'Calor, tensão e vontade de reagir',
    destaque: [],
    oQue: 'A raiva costuma sinalizar um limite ultrapassado, injustiça ou sobrecarga. Pode ser um aviso de que algo precisa mudar, e a irritação também aparece quando estamos sobrecarregados/as.',
    sinais: ['Calor no corpo, mandíbula e mãos tensas', 'Respiração rápida', 'Vontade de responder ou sair', 'Pensamentos repetitivos sobre o que aconteceu'],
    agora: ['Saia do ambiente por alguns minutos, se puder.', 'Movimente o corpo: caminhar, apertar, empurrar a parede, esticar.', 'Respire soltando o ar devagar.', 'Se precisar falar, use uma frase curta: “Preciso de um tempo e volto a falar.”'],
    evitar: ['Responder mensagens ou decidir no auge.', 'Descontar em quem não tem relação.', 'Guardar sem cuidar: a tensão fica no corpo.'],
    depois: ['Pergunte: que limite foi cruzado? O que eu preciso?', 'Quando estiver mais calmo/a, comunique de forma direta e respeitosa.'],
    parar: ['Pare quando sentir que vai ferir alguém ou se ferir. Saia e busque ar.', 'Se explosões são frequentes, apoio profissional ajuda.'],
    ajuda: 'Se houver risco para você ou para outras pessoas, procure ajuda imediata: 192 (SAMU).',
    compaixao: 'Estou com raiva porque algo importou ou passou do meu limite. Posso cuidar disso com calma.',
    praticas: ['movimento', 'respiracao', 'dizer-nao'],
  },
];

export const estadoById = (id: string) => ESTADOS.find((e) => e.id === id);
