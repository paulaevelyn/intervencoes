/* ═══════════════════════════════════════════════════════════════════════
   Trilha — missoes.js
   Conteúdo das missões (psicoeducação em formato de aprendizagem). Cada módulo tem 3 etapas:
     • Aprender: micro-aula em cartões (4 cartões curtos)
     • Treinar: 2 questões com feedback imediato (recuperação ativa; entram na Revisão relâmpago)
     • Praticar: desafio com uma ferramenta + reflexão (ensinar com as próprias palavras)
   Questões: tipo 'mc' (ops: [{t, ok, fb}]) ou 'sort' (cats + itens com c = id da categoria).
   Todas as respostas explicam o porquê. Pontos são por COMPLETAR, nunca por acertar.
   Ids de questão (q1, q2…) são únicos e estáveis: a revisão espaçada depende deles.
   Conteúdo psicoeducativo: NÃO é tratamento. Exposição a sensações (módulo 6) e escada (módulo 8)
   são só combinadas com a psicóloga. Conferir o conteúdo com a profissional antes de uso clínico.
   ═══════════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';
  var M = {};

  M[1] = { hab: ['auto', 'decisao'], medalha: { n: 'Bússola ajustada', e: '🧭' },
    licao: [
      { e: '🙋', t: 'A terapia é sobre você', x: 'Funciona melhor quando tem a ver com o que VOCÊ quer mudar, e não só com o que os outros esperam. Você pode dizer o que ajuda, o que não ajuda e o que quer trabalhar.' },
      { e: '🎯', t: 'Metas pequenas e claras', x: 'Uma boa meta é específica e possível nesta semana. “Ser feliz” é um sonho; “conversar 5 minutos com um colega na quinta” é uma meta que dá para cumprir e comemorar.' },
      { e: '🧭', t: 'Valores: a direção', x: 'Metas são pontos no mapa. Valores são a direção para onde você quer ir (amizade, criatividade, coragem…). Quando a meta e o valor combinam, fica mais fácil continuar.' },
      { e: '💬', t: 'Você manda no ritmo', x: 'Se algo na terapia não está ajudando, ou está rápido demais, dizer isso também faz parte do trabalho. Sua psicóloga quer saber.' }
    ],
    quiz: [
      { id: 'm1q1', tipo: 'mc', q: 'Qual destas é uma meta clara e possível para esta semana?', ops: [
        { t: 'Ser feliz', ok: false, fb: 'É um desejo legítimo, mas grande e vago: não dá para saber quando você “chegou lá”.' },
        { t: 'Conversar 5 minutos com um colega na quinta', ok: true, fb: 'Isso: específica, pequena e dá para comemorar.' },
        { t: 'Nunca mais sentir ansiedade', ok: false, fb: 'A ansiedade faz parte de ser humano. A meta realista é aprender a lidar com ela.' }] },
      { id: 'm1q2', tipo: 'mc', q: 'Se algo na terapia não está ajudando, o melhor é…', ops: [
        { t: 'Aguentar calado/a para não incomodar', ok: false, fb: 'Aguentar calado/a tira da psicóloga a chance de ajustar o caminho.' },
        { t: 'Contar para a psicóloga, mesmo que seja difícil', ok: true, fb: 'Isso mesmo: ajustar o jeito de trabalhar faz parte da terapia.' },
        { t: 'Parar de ir sem avisar', ok: false, fb: 'Dá para conversar antes. Sair sem dizer nada deixa o problema sem solução.' }] }
    ],
    desafio: { t: 'Escreva uma meta sua, em uma frase, para levar à sessão. Se quiser, comece fazendo um check-in para observar como você está.', ferramenta: 'checkin', reflexao: 'Explique com suas palavras: o que é uma boa meta?' } };

  M[2] = { hab: ['auto', 'gestao'], medalha: { n: 'Tradutor de emoções', e: '🌡️' },
    licao: [
      { e: '🚨', t: 'Emoção é um aviso', x: 'Emoções não são defeitos. Cada uma traz uma mensagem: o medo avisa de perigo, a tristeza de uma perda, a raiva de um limite. Nem sempre o aviso está certo, mas ele sempre merece atenção.' },
      { e: '🧩', t: 'Três partes que andam juntas', x: 'Toda emoção tem: o que você PENSA, o que sente no CORPO e o que tem vontade de FAZER. Separar as três ajuda a ver por onde dá para mexer.' },
      { e: '🔄', t: 'O ciclo', x: 'A emoção dá vontade de agir (fugir, brigar, se isolar). O alívio vem rápido, mas muitas vezes o problema continua. Perceber o ciclo é o primeiro passo para mudá-lo.' },
      { e: '🏷️', t: 'Dar nome ajuda', x: 'Nomear com precisão (“estou frustrado/a”, não só “estou mal”) acalma o cérebro e ajuda a escolher o que fazer. Por isso o check-in pede o nome da emoção.' }
    ],
    quiz: [
      { id: 'm2q1', tipo: 'sort', q: 'Toque para dizer a que parte da emoção cada item pertence.', cats: [{ id: 'p', l: 'Pensamento' }, { id: 'c', l: 'Corpo' }, { id: 'a', l: 'Ação' }],
        itens: [{ t: '“Vão rir de mim”', c: 'p' }, { t: 'Coração acelerado', c: 'c' }, { t: 'Sair da sala', c: 'a' }, { t: 'Mãos suando', c: 'c' }, { t: '“Sou um fracasso”', c: 'p' }, { t: 'Ficar no celular para não pensar', c: 'a' }],
        fb: 'Pensamento é o que passa na cabeça, corpo é o que se sente, ação é o que se faz. Separar os três é a base de todo o resto.' },
      { id: 'm2q2', tipo: 'mc', q: 'Sentir uma emoção desconfortável quer dizer que…', ops: [
        { t: 'Tem algo errado comigo', ok: false, fb: 'Sentir é normal e esperado. O desconforto não prova que algo está errado com você.' },
        { t: 'É um aviso, e dá para aprender a lidar com ele', ok: true, fb: 'Isso: a emoção traz informação, e lidar com ela é uma habilidade que se treina.' },
        { t: 'Preciso me livrar dela o mais rápido possível', ok: false, fb: 'Tentar eliminar a emoção a qualquer custo costuma deixá-la mais forte. Entender o aviso funciona melhor.' }] }
    ],
    desafio: { t: 'Faça um check-in e preencha as três partes: pensamento, corpo e ação.', ferramenta: 'checkin', reflexao: 'Explique para um amigo: o que são as três partes de uma emoção?' } };

  M[3] = { hab: ['auto', 'gestao'], medalha: { n: 'Mestre dos três modos', e: '🧠' },
    licao: [
      { e: '🔴', t: 'Modo alerta', x: 'Detecta ameaças (reais ou imaginadas) para te proteger. Quando fica ligado demais, tudo parece perigoso: coração acelera, a mente corre, vem vontade de fugir ou brigar.' },
      { e: '🟡', t: 'Modo conquista', x: 'É a energia de correr atrás do que você quer: notas, esporte, ser aceito/a. É bom, mas sozinho cansa: sempre falta mais um pouco.' },
      { e: '🟢', t: 'Modo calma', x: 'É o modo de acalmar e se conectar: respirar devagar, ser gentil consigo, estar com quem faz bem. É ele que “esfria” o modo alerta, e se treina.' },
      { e: '💛', t: 'Não é culpa sua', x: 'O cérebro evoluiu para sobreviver, não para ser feliz o tempo todo. Viver muito no alerta não é defeito seu, é o cérebro tentando te proteger. Dá para equilibrar.' }
    ],
    quiz: [
      { id: 'm3q1', tipo: 'mc', q: 'Antes de uma prova, coração acelerado, mãos frias e mente voando. Qual modo está mais ligado?', ops: [
        { t: 'Alerta', ok: true, fb: 'Isso: o corpo se prepara para uma ameaça. Respirar devagar ajuda o modo calma a entrar.' },
        { t: 'Calma', ok: false, fb: 'Na calma, o corpo está mais solto e a respiração mais lenta.' },
        { t: 'Conquista', ok: false, fb: 'O modo conquista aparece junto, mas os sinais de corpo acelerado e mente voando são do alerta.' }] },
      { id: 'm3q2', tipo: 'sort', q: 'Em que modo está cada situação?', cats: [{ id: 'al', l: 'Alerta' }, { id: 'co', l: 'Conquista' }, { id: 'ca', l: 'Calma' }],
        itens: [{ t: 'Treinar para o campeonato', c: 'co' }, { t: 'Respirar devagar com a mão no peito', c: 'ca' }, { t: 'Ficar atento a tudo que pode dar errado', c: 'al' }, { t: 'Abraçar alguém de quem você gosta', c: 'ca' }, { t: 'Correr atrás de nota 10', c: 'co' }, { t: 'Evitar o professor depois de errar', c: 'al' }],
        fb: 'Alerta protege, conquista impulsiona, calma recupera. Um modo não é “bom” ou “ruim”: a saúde está no equilíbrio entre os três.' }
    ],
    desafio: { t: 'Experimente o ritmo calmante (respirar 4 por 6). Depois, repare: o que mudou, mesmo que pouco?', ferramenta: 'respirar', reflexao: 'Qual atividade ativa o seu modo calma? Explique por quê.' } };

  M[4] = { hab: ['auto', 'gestao'], medalha: { n: 'Presença no agora', e: '🔍' },
    licao: [
      { e: '🛫', t: 'A mente viaja', x: 'A mente adora ir para o passado (“por que eu fiz aquilo?”) e para o futuro (“e se der errado?”). Quase todo sofrimento extra mora nessas viagens.' },
      { e: '👀', t: 'Atenção ao presente', x: 'Treinar a atenção é notar o que está acontecendo agora, sem julgar. Não é esvaziar a mente: pensamentos vão aparecer, e o treino é perceber e voltar.' },
      { e: '🌊', t: 'Emoção como onda', x: 'Uma emoção sobe, chega ao pico e desce, se a gente não brigar com ela. Observar a onda, sem se afogar nela, tira boa parte da força.' },
      { e: '🌳', t: 'Aterramento', x: 'O 5-4-3-2-1 leva a atenção para os sentidos. Não é fugir do que sente: é dar ao corpo um chão para pisar enquanto a emoção passa.' }
    ],
    quiz: [
      { id: 'm4q1', tipo: 'mc', q: 'Praticar atenção plena é…', ops: [
        { t: 'Esvaziar a mente de pensamentos', ok: false, fb: 'Ninguém consegue isso. Pensamentos vão aparecer, e tudo bem.' },
        { t: 'Notar o que está acontecendo agora, sem julgar', ok: true, fb: 'Exatamente: observar com curiosidade, sem brigar com o que aparece.' },
        { t: 'Ficar relaxado/a o tempo todo', ok: false, fb: 'Relaxar pode acontecer, mas não é o objetivo. O objetivo é estar presente.' }] },
      { id: 'm4q2', tipo: 'mc', q: 'Na prática, sua mente fugiu 20 vezes. O que isso quer dizer?', ops: [
        { t: 'Que não é para você', ok: false, fb: 'Muito pelo contrário: cada vez que você percebe e volta é uma repetição do treino.' },
        { t: 'Que você treinou voltar 20 vezes', ok: true, fb: 'Isso! Perceber que a mente foi e voltar é justamente o exercício.' },
        { t: 'Que precisa tentar com mais força', ok: false, fb: 'Forçar costuma atrapalhar. A atitude é de gentileza e curiosidade.' }] }
    ],
    desafio: { t: 'Faça o aterramento 5-4-3-2-1 em um momento em que a cabeça estiver cheia. Repare no seu corpo antes e depois.', ferramenta: 'aterrar', reflexao: 'O que você percebeu agora que normalmente passa despercebido?' } };

  M[5] = { hab: ['auto', 'decisao'], medalha: { n: 'Cientista de si', e: '🧪' },
    licao: [
      { e: '🔮', t: 'A emoção faz previsões', x: 'A ansiedade costuma prever o pior (“vão rir de mim”). Acreditar ou brigar com a previsão não resolve. Dá para testá-la.' },
      { e: '🧪', t: 'Experimento', x: 'Um experimento tem 3 partes: uma previsão clara, um teste pequeno e possível, e o resultado de verdade. Você é a cientista ou o cientista da sua própria vida.' },
      { e: '👣', t: 'Comece pequeno', x: 'O primeiro experimento deve ser fácil (falar com 1 pessoa, e não com a sala inteira). Teste combinado com a psicóloga é ainda mais seguro.' },
      { e: '📏', t: 'Compare', x: 'Depois, compare o que você achava com o que aconteceu. Se foi melhor do que o previsto, o cérebro aprende que a previsão estava exagerada, e isso diminui o medo.' }
    ],
    quiz: [
      { id: 'm5q1', tipo: 'mc', q: 'Qual é um bom experimento?', ops: [
        { t: 'Apresentar para a escola inteira, para acabar com o medo de uma vez', ok: false, fb: 'Grande demais: se ficar muito difícil, o cérebro aprende só que é perigoso. Comece menor.' },
        { t: 'Prever “vão rir de mim” e perguntar algo a um colega, vendo o que acontece', ok: true, fb: 'Isso: previsão clara, teste pequeno e possível, e resultado para observar.' },
        { t: 'Só pensar mais no assunto até ter certeza', ok: false, fb: 'Pensar sem testar costuma só aumentar a dúvida. O teste é o que traz informação nova.' }] },
      { id: 'm5q2', tipo: 'mc', q: 'O resultado foi melhor do que você previu. Isso mostra que…', ops: [
        { t: 'Foi sorte', ok: false, fb: 'Pode ser tentador pensar assim, mas repetir o teste mostra se foi sorte ou se a previsão estava exagerada.' },
        { t: 'A previsão pode estar exagerada, e vale repetir o teste', ok: true, fb: 'Isso: cada experimento é uma evidência nova sobre o que realmente acontece.' },
        { t: 'Você deu sorte e não deve tentar de novo', ok: false, fb: 'O contrário: repetir é como o aprendizado se firma.' }] }
    ],
    desafio: { t: 'Monte um experimento pequeno: escreva uma previsão, o teste e, depois de fazer, o resultado. Pode deixar o resultado para voltar depois.', ferramenta: 'experimento', reflexao: 'Que previsão sua você gostaria de testar?' } };

  M[6] = { hab: ['auto', 'gestao'], medalha: { n: 'Amigo/a do corpo', e: '🫀' },
    licao: [
      { e: '🫀', t: 'O corpo se prepara', x: 'Na ansiedade e no medo, o corpo se prepara para lutar ou fugir: coração acelera, respiração muda, músculos tensionam, estômago aperta. É um alarme antigo e útil.' },
      { e: '🌡️', t: 'Desconfortável não é perigoso', x: 'Essas sensações incomodam, mas passam sozinhas e não fazem mal. Quando algo novo, forte ou repetido te preocupa, vale falar com um médico para descartar causas físicas.' },
      { e: '🙈', t: 'Fugir das sensações aumenta o medo', x: 'Quando a gente evita tudo o que faz o coração acelerar, o corpo “aprende” que aquilo era perigoso. Aprender a tolerar as sensações tira esse poder.' },
      { e: '🧑‍⚕️', t: 'Só com a psicóloga', x: 'Os exercícios que provocam sensações de propósito (para você ver que passam) só devem ser feitos COM sua psicóloga, nunca sozinho/a. Aqui você só observa e respira.' }
    ],
    quiz: [
      { id: 'm6q1', tipo: 'mc', q: 'Coração acelerado durante a ansiedade costuma ser…', ops: [
        { t: 'Uma resposta do corpo que passa sozinha', ok: true, fb: 'Isso: o corpo se prepara para o “perigo” e depois desacelera. Se algo for novo, forte ou te preocupar, vale falar com um médico.' },
        { t: 'Sinal de que algo grave está acontecendo', ok: false, fb: 'Normalmente não. Mas na dúvida, procure um médico: tranquiliza e descarta causas físicas.' },
        { t: 'Algo que eu preciso impedir a qualquer custo', ok: false, fb: 'Brigar com a sensação costuma intensificá-la. Observar e respirar ajuda mais.' }] },
      { id: 'm6q2', tipo: 'mc', q: 'Exercícios que provocam sensações de propósito devem ser feitos…', ops: [
        { t: 'Sozinho/a, para treinar mais', ok: false, fb: 'Esses exercícios são para fazer COM a psicóloga, que sabe como e quando.' },
        { t: 'Só com a psicóloga, na sessão', ok: true, fb: 'Isso: com acompanhamento é seguro e eficaz.' },
        { t: 'Com amigos, como desafio', ok: false, fb: 'Nada de desafios. É um recurso terapêutico, não uma brincadeira.' }] }
    ],
    desafio: { t: 'Da próxima vez que sentir uma emoção, procure onde ela aparece primeiro no corpo. Depois, use o ritmo calmante.', ferramenta: 'respirar', reflexao: 'Onde, no seu corpo, a emoção costuma aparecer primeiro?' } };

  M[7] = { hab: ['auto', 'decisao'], medalha: { n: 'Atalhos à vista', e: '🚪' },
    licao: [
      { e: '🚪', t: 'Os atalhos', x: 'Quando sentimos algo difícil, temos atalhos para aliviar: evitar, fugir, se isolar, ficar no celular, deixar para depois. Todo mundo tem os seus, sem culpa.' },
      { e: '⏱️', t: 'Alívio agora, custo depois', x: 'O atalho funciona na hora (alívio!), mas muitas vezes mantém o problema e o medo cresce. Ver o “preço” de cada atalho é o primeiro passo.' },
      { e: '🔁', t: 'Ação diferente', x: 'Em vez de lutar contra a emoção, você pode escolher agir de outro jeito: o que a emoção pede é uma coisa, o que combina com o que você quer é outra.' },
      { e: '🌱', t: 'Um por vez', x: 'Não precisa largar todos os atalhos. Escolha um e teste agir diferente numa situação de baixa intensidade, e olhe o que acontece.' }
    ],
    quiz: [
      { id: 'm7q1', tipo: 'mc', q: 'Faltar à aula para não apresentar um trabalho costuma trazer…', ops: [
        { t: 'Alívio agora, mas o medo tende a crescer depois', ok: true, fb: 'Isso: é o preço do atalho. O alívio imediato ensina ao cérebro que apresentar é perigoso.' },
        { t: 'Mais coragem na próxima vez', ok: false, fb: 'Em geral acontece o oposto: evitar reforça o medo.' },
        { t: 'Nenhuma consequência', ok: false, fb: 'Pode parecer, mas o custo aparece: mais medo, trabalho acumulado, vergonha.' }] },
      { id: 'm7q2', tipo: 'mc', q: 'Qual seria uma ação diferente, e pequena, no lugar de evitar?', ops: [
        { t: 'Apresentar primeiro para duas pessoas de confiança', ok: true, fb: 'Isso: um degrau menor e possível, que vai preparando o próximo.' },
        { t: 'Esperar o medo passar sozinho antes de tentar', ok: false, fb: 'O medo costuma diminuir justamente depois de agir, e não antes.' },
        { t: 'Nunca mais apresentar nada', ok: false, fb: 'Esse é o atalho levado ao extremo: o medo só cresce.' }] }
    ],
    desafio: { t: 'Faça um check-in e, no campo “vontade de…”, marque seus atalhos. Observe qual aparece mais.', ferramenta: 'checkin', reflexao: 'Qual atalho você mais usa, e qual seria uma ação diferente, pequena?' } };

  M[8] = { hab: ['gestao', 'decisao'], medalha: { n: 'Passo a passo', e: '🪜' },
    licao: [
      { e: '🪜', t: 'A escada', x: 'Enfrentar o que dá medo de uma vez é demais. A escada divide em degraus, do mais fácil ao mais difícil, para você subir no seu ritmo.' },
      { e: '🧠', t: 'O medo diminui ficando', x: 'Quando a gente fica na situação e vê que aguenta, o cérebro aprende que não era tão perigosa. Não precisa estar sem medo para tentar.' },
      { e: '🤝', t: 'Combinado com a psicóloga', x: 'Os degraus são montados com sua psicóloga: ela ajuda a escolher o tamanho certo e a se preparar. Faça só os que vocês combinaram.' },
      { e: '🎉', t: 'Tentar já é a vitória', x: 'Antes, use o ritmo calmante. Depois, reconheça o que fez, mesmo que tenha sido desconfortável. O foco é tentar, e não “passar sem medo”.' }
    ],
    quiz: [
      { id: 'm8q1', tipo: 'mc', q: 'O primeiro degrau da escada deve ser…', ops: [
        { t: 'O mais difícil, para acabar logo', ok: false, fb: 'Começar pelo mais difícil costuma assustar demais e fazer desistir.' },
        { t: 'Um que dá um pouco de desconforto, mas é possível', ok: true, fb: 'Isso: desafiador o bastante para ensinar algo, possível o bastante para você conseguir.' },
        { t: 'Um que não dá nenhum desconforto', ok: false, fb: 'Sem desconforto, o cérebro não aprende nada novo.' }] },
      { id: 'm8q2', tipo: 'mc', q: 'Depois de tentar um degrau, o mais útil é…', ops: [
        { t: 'Reconhecer o que você fez e o que aprendeu', ok: true, fb: 'Isso: o aprendizado e a gentileza consigo consolidam o passo.' },
        { t: 'Se criticar por ter sentido medo', ok: false, fb: 'Sentir medo é esperado. Autocrítica só atrapalha o próximo passo.' },
        { t: 'Fingir que nada aconteceu', ok: false, fb: 'Perder a chance de aprender com o que você viveu.' }] }
    ],
    desafio: { t: 'Com sua psicóloga, monte ou revise sua escada. Se já tiver combinado um degrau, registre a tentativa depois.', ferramenta: 'escada', reflexao: 'Qual poderia ser o seu primeiro degrau? (combine na sessão)' } };

  M[9] = { hab: ['auto', 'decisao'], medalha: { n: 'Detetive de pensamentos', e: '🕵️' },
    licao: [
      { e: '💭', t: 'Pensamento não é fato', x: 'Um pensamento é só uma ideia que a mente produz, e pode estar certa, errada ou exagerada. Acreditar em tudo o que a gente pensa é um convite à ansiedade.' },
      { e: '🪤', t: 'Armadilhas da mente', x: 'A mente cai nas mesmas: catástrofe (“vai dar tudo errado”), ler mentes (“eles me acham chato”), tudo ou nada, “sempre” e “nunca”, rótulos. Ver o padrão ajuda a perder a força.' },
      { e: '🕵️', t: 'As perguntas do detetive', x: 'Que provas eu tenho a favor e contra? Existe outra explicação? O que eu diria a um amigo? Qual é o pior, o melhor e o mais provável?' },
      { e: '⚖️', t: 'Realista, não forçado', x: 'O objetivo não é pensar positivo à força, e sim chegar a um pensamento mais equilibrado e verdadeiro, que combine com as provas.' }
    ],
    quiz: [
      { id: 'm9q1', tipo: 'sort', q: 'Qual armadilha está em cada pensamento?', cats: [{ id: 'ca', l: 'Catástrofe' }, { id: 'lm', l: 'Ler mentes' }, { id: 'tn', l: 'Tudo ou nada' }, { id: 'sn', l: 'Sempre/nunca' }],
        itens: [{ t: '“Vou reprovar e minha vida acaba”', c: 'ca' }, { t: '“Ela não respondeu, deve me odiar”', c: 'lm' }, { t: '“Se não ficar perfeito, é um fracasso”', c: 'tn' }, { t: '“Eu sempre estrago tudo”', c: 'sn' }],
        fb: 'Dar nome à armadilha tira parte da força do pensamento: “Ah, é a catástrofe de novo”.' },
      { id: 'm9q2', tipo: 'mc', q: 'Qual é um pensamento alternativo bom?', ops: [
        { t: '“Estou ótimo, nada pode dar errado”', ok: false, fb: 'É positivo à força: o cérebro não compra, porque não combina com as provas.' },
        { t: '“Fiquei nervoso/a, mas consegui falar um pedaço; dá para melhorar”', ok: true, fb: 'Isso: realista, reconhece a dificuldade e o que deu certo.' },
        { t: '“Sou um fracasso e nunca vou conseguir”', ok: false, fb: 'Esse é o pensamento original em outra roupa: tudo ou nada e “nunca”.' }] }
    ],
    desafio: { t: 'Quando um pensamento pesado aparecer, faça um registro do detetive: pensamento, armadilha, provas e alternativa.', ferramenta: 'detetive', reflexao: 'Explique para um amigo: o que é “pensamento não é fato”?' } };

  M[10] = { hab: ['gestao', 'decisao'], medalha: { n: 'Pequenas ações', e: '⚡' },
    licao: [
      { e: '📉', t: 'O ciclo do desânimo', x: 'Quando o humor cai, a gente faz menos coisas; com menos coisas boas na vida, o humor cai mais. Esperar a vontade voltar para agir costuma prolongar o ciclo.' },
      { e: '🚀', t: 'Agir antes da vontade', x: 'A vontade muitas vezes vem DEPOIS de começar. Uma ação pequena, de 5 a 15 minutos, já mexe no humor.' },
      { e: '🎯', t: 'Três tipos de ações', x: 'Prazer (algo de que você gosta), algo que importa (estudo, meta, cuidado) e gente (contato com alguém). Misturar os três dá mais equilíbrio.' },
      { e: '😴', t: 'Sono e rotina', x: 'Horários mais regulares para dormir e acordar, menos telas na última hora e luz natural de manhã ajudam o humor e a ansiedade.' }
    ],
    quiz: [
      { id: 'm10q1', tipo: 'mc', q: 'Sem vontade nenhuma, o que costuma ajudar?', ops: [
        { t: 'Esperar a vontade voltar', ok: false, fb: 'Pode demorar. A vontade muitas vezes aparece depois de começar.' },
        { t: 'Uma ação bem pequena, mesmo sem vontade', ok: true, fb: 'Isso: começar pequeno quebra o ciclo do desânimo.' },
        { t: 'Um dia inteiro de tarefas para compensar', ok: false, fb: 'Grande demais: em geral dá desânimo e desistência.' }] },
      { id: 'm10q2', tipo: 'mc', q: 'Qual ação é pequena o suficiente?', ops: [
        { t: 'Caminhar 10 minutos depois da aula', ok: true, fb: 'Isso: curta, concreta e possível.' },
        { t: 'Treinar duas horas todos os dias', ok: false, fb: 'Ótimo como projeto, mas grande demais para ser o primeiro passo.' },
        { t: 'Reorganizar a vida toda', ok: false, fb: 'Vago e enorme. Prefira ações concretas e pequenas.' }] }
    ],
    desafio: { t: 'Planeje 3 ações pequenas para esta semana: uma de prazer, uma que importa e uma com gente.', ferramenta: 'agenda', reflexao: 'Qual das três ações você mais quer fazer, e por quê?' } };

  M[11] = { hab: ['auto', 'relacoes'], medalha: { n: 'Voz gentil', e: '💬' },
    licao: [
      { e: '📢', t: 'A voz crítica', x: 'A voz crítica acha que está te protegendo (“se eu me cobrar, vou errar menos”). Mas, em geral, só traz vergonha, medo de tentar e cansaço.' },
      { e: '💞', t: 'Autocompaixão', x: 'Tem 3 partes: perceber que você está sofrendo, lembrar que sofrer é humano (todo mundo passa por isso) e se tratar com a mesma gentileza que daria a um amigo.' },
      { e: '💪', t: 'Gentil não é fraco', x: 'Ser gentil consigo não é se acomodar nem fugir de responsabilidade. Quem se trata com cuidado tem mais energia e coragem para tentar de novo.' },
      { e: '✍️', t: 'A carta', x: 'Escrever o que você diria a um amigo na sua situação, e depois endereçar a você mesmo/a, treina essa voz mais gentil e firme.' }
    ],
    quiz: [
      { id: 'm11q1', tipo: 'mc', q: 'Qual frase é autocompassiva?', ops: [
        { t: '“Você é um desastre, devia ter feito melhor”', ok: false, fb: 'Isso é a voz crítica: humilha em vez de ajudar a aprender.' },
        { t: '“Foi difícil e é normal se sentir assim. O que posso fazer agora para me ajudar?”', ok: true, fb: 'Isso: reconhece o sofrimento, normaliza e aponta um passo gentil.' },
        { t: '“Não foi nada, nem sei por que estou chateado/a”', ok: false, fb: 'Negar o que sente também não ajuda. Autocompaixão começa reconhecendo.' }] },
      { id: 'm11q2', tipo: 'mc', q: 'Ser gentil consigo faz você…', ops: [
        { t: 'Ficar mais fraco/a', ok: false, fb: 'Mito comum. A pesquisa mostra o contrário.' },
        { t: 'Ter mais energia para tentar de novo', ok: true, fb: 'Isso: sem tanto medo de errar, fica mais fácil recomeçar.' },
        { t: 'Desistir das responsabilidades', ok: false, fb: 'Gentileza e responsabilidade andam juntas: você pode se cuidar e se esforçar.' }] }
    ],
    desafio: { t: 'Escreva uma carta gentil para você sobre uma situação que está pesando.', ferramenta: 'carta', reflexao: 'Como a voz gentil soaria na sua cabeça? Diga com suas palavras.' } };

  M[12] = { hab: ['relacoes', 'social', 'decisao'], medalha: { n: 'Ponte entre pessoas', e: '🤝' },
    licao: [
      { e: '🗣️', t: 'Três jeitos de falar', x: 'Passivo (engole tudo), agressivo (ataca) e assertivo (diz o que sente e quer, com respeito). O assertivo é o que mais protege você e a relação.' },
      { e: '🧱', t: 'Limites', x: 'Dizer “não” ou “agora não” não é falta de carinho: é cuidado com você. Uma fórmula simples: descrever o fato, dizer como se sente, pedir o que precisa.' },
      { e: '🌍', t: 'Olhar o outro', x: 'Perceber o que o outro sente e respeitar diferenças (de opinião, de jeito, de cultura) faz parte de se relacionar bem, mesmo quando você discorda.' },
      { e: '📱', t: 'Redes sociais', x: 'O que aparece nas redes é, em geral, o destaque da vida de cada um. Compare-se menos, siga o que faz bem e saiba que pedir ajuda também vale online e offline.' }
    ],
    quiz: [
      { id: 'm12q1', tipo: 'sort', q: 'Que jeito de falar é cada frase?', cats: [{ id: 'p', l: 'Passivo' }, { id: 'g', l: 'Agressivo' }, { id: 'a', l: 'Assertivo' }],
        itens: [{ t: '“Tá, faço o que você quiser”', c: 'p' }, { t: '“Você é um egoísta!”', c: 'g' }, { t: '“Prefiro não ir hoje. Podemos combinar outro dia?”', c: 'a' }, { t: 'Concordar com tudo para não discutir', c: 'p' }],
        fb: 'O assertivo diz o que sente e quer sem atacar nem se anular. Dá para treinar, como qualquer habilidade.' },
      { id: 'm12q2', tipo: 'mc', q: 'Ver só o “melhor” da vida dos outros nas redes…', ops: [
        { t: 'Mostra como todo mundo está bem o tempo todo', ok: false, fb: 'Quase sempre é um recorte editado: ninguém posta os dias difíceis.' },
        { t: 'É um recorte: não mostra a vida inteira da pessoa', ok: true, fb: 'Isso: comparar sua vida inteira com o destaque do outro costuma magoar sem motivo.' },
        { t: 'Prova que eu estou ficando para trás', ok: false, fb: 'É a comparação enganosa. Quem você segue influencia como se sente: dá para ajustar.' }] }
    ],
    desafio: { t: 'Pratique um pedido ou um limite pequeno esta semana, com alguém de confiança, e registre como foi.', ferramenta: 'experimento', reflexao: 'Como você diria “não” ou pediria algo de forma assertiva? Escreva um exemplo.' } };

  M[13] = { hab: ['auto', 'gestao', 'decisao'], medalha: { n: 'Guia de si', e: '🏁' },
    licao: [
      { e: '📈', t: 'Olhar para o caminho', x: 'Fechar o ciclo é ver o que mudou, o que funcionou e o que você aprendeu sobre você. Mudanças pequenas somam.' },
      { e: '📒', t: 'Manual de bolso', x: 'Junte o que mais ajudou (ferramentas, forças, pessoas) num guia curto para consultar nos dias difíceis. Ele é seu.' },
      { e: '🚦', t: 'Sinais de alerta', x: 'Perceber cedo o que costuma te desorganizar (sono ruim, isolamento, pensamentos de sempre) ajuda a agir antes de piorar.' },
      { e: '🤗', t: 'Pedir ajuda é cuidado', x: 'Ter um dia ruim depois de melhorar é normal e não apaga o que você aprendeu. Se durar, voltar a conversar com a psicóloga é cuidar de si, e não recomeçar do zero.' }
    ],
    quiz: [
      { id: 'm13q1', tipo: 'mc', q: 'Um dia ruim depois de ter melhorado quer dizer…', ops: [
        { t: 'Que tudo foi em vão', ok: false, fb: 'Mito. As habilidades continuam com você.' },
        { t: 'Que é normal: dá para usar o manual e, se durar, falar com a psicóloga', ok: true, fb: 'Isso: contratempos fazem parte, e você já sabe o que fazer.' },
        { t: 'Que melhor esconder de todos', ok: false, fb: 'Falar com alguém de confiança ajuda mais do que guardar sozinho/a.' }] },
      { id: 'm13q2', tipo: 'mc', q: 'Pedir ajuda de novo, mais adiante, é…', ops: [
        { t: 'Um sinal de fracasso', ok: false, fb: 'Pedir ajuda é uma habilidade, e não um fracasso.' },
        { t: 'Um jeito de cuidar de si', ok: true, fb: 'Isso: quem se conhece e pede ajuda cedo costuma se recuperar mais rápido.' },
        { t: 'Algo para evitar a todo custo', ok: false, fb: 'Evitar costuma atrasar o cuidado. Pedir cedo ajuda mais.' }] }
    ],
    desafio: { t: 'Revise ou monte seu plano de segurança com sua psicóloga e anote o que você faria diante dos primeiros sinais de alerta.', ferramenta: 'plano', reflexao: 'O que você diria ao “você” do início da trilha?' } };

  global.TRILHA_MISSOES = M;
})(window);
