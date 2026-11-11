export type GoalId = 'sobrecarga' | 'comecar' | 'ansiedade' | 'acalmar' | 'energia' | 'limite' | 'apoio';

export const GOALS: { id: GoalId; label: string; hint: string }[] = [
  { id: 'sobrecarga', label: 'Estou sobrecarregado/a', hint: 'Muito estímulo ou muita demanda' },
  { id: 'comecar', label: 'Preciso começar algo', hint: 'Quando a largada é a parte difícil' },
  { id: 'ansiedade', label: 'Estou ansioso/a', hint: 'Mente acelerada ou corpo em alerta' },
  { id: 'acalmar', label: 'Preciso me acalmar', hint: 'Baixar o ritmo do corpo' },
  { id: 'energia', label: 'Preciso de energia', hint: 'Um empurrãozinho gentil' },
  { id: 'limite', label: 'Preciso de um limite', hint: 'Dizer não ou combinar um ajuste' },
  { id: 'apoio', label: 'Preciso pedir apoio', hint: 'Frases prontas e pedidos de ajuste' },
];

export type Practice =
  | { id: string; title: string; minutes: number; goals: GoalId[]; summary: string; kind: 'steps'; steps: string[]; note?: string }
  | { id: string; title: string; minutes: number; goals: GoalId[]; summary: string; kind: 'breathing'; note?: string }
  | { id: string; title: string; minutes: number; goals: GoalId[]; summary: string; kind: 'checklist'; items: string[]; note?: string }
  | { id: string; title: string; minutes: number; goals: GoalId[]; summary: string; kind: 'text'; lines: string[]; copyable?: boolean; link?: { to: string; label: string }; note?: string };

export const PRACTICES: Practice[] = [
  {
    id: 'respiracao', title: 'Respiração guiada', minutes: 2, goals: ['sobrecarga', 'ansiedade', 'acalmar'],
    summary: 'Soltar o ar mais devagar do que puxa. Sem contar, se preferir.', kind: 'breathing',
    note: 'Se respirar com atenção deixar você mais agitado/a, pare. Tente movimento ou o 5-4-3-2-1.',
  },
  {
    id: 'grounding', title: 'Grounding sensorial 5-4-3-2-1', minutes: 3, goals: ['ansiedade', 'acalmar', 'sobrecarga'],
    summary: 'Usar os sentidos para voltar ao aqui e agora.', kind: 'steps',
    steps: [
      'Olhe ao redor e nomeie 5 coisas que você vê. Pode ser em voz baixa ou só na mente.',
      'Perceba 4 coisas que você pode tocar. Sinta a textura de uma delas.',
      'Escute 3 sons. Se o ambiente estiver barulhento, escolha só um som.',
      'Note 2 cheiros. Se não houver, lembre de 2 cheiros de que você gosta.',
      'Perceba 1 gosto na boca, ou beba um gole de água.',
      'Respire uma vez com calma. Você terminou. Pode repetir só um dos sentidos, se quiser.',
    ],
    note: 'Pode pular qualquer sentido que incomode. Não existe jeito errado de fazer.',
  },
  {
    id: 'descompressao', title: 'Pausa de descompressão', minutes: 5, goals: ['sobrecarga', 'acalmar'],
    summary: 'Cinco minutos de menos estímulo e nenhuma demanda.', kind: 'steps',
    steps: [
      'Saia do ambiente, se puder. Se não puder, diminua o que der: luz, tela, volume.',
      'Coloque fones, óculos escuros ou capuz, se isso ajuda você.',
      'Fique em um lugar onde ninguém peça nada de você por 5 minutos.',
      'Se quiser, segure um objeto de que gosta ou aperte as mãos com firmeza.',
      'Não precisa pensar em nada. Pode ficar parado/a ou se mexer do seu jeito.',
      'Ao final, beba água. Depois, decida só o próximo passo pequeno, ou continue em pausa.',
    ],
    note: 'Dica: se você já sabe o que ajuda, deixe registrado no seu plano de apoio.',
  },
  {
    id: 'autocompaixao', title: 'Roteiro de autocompaixão', minutes: 3, goals: ['ansiedade', 'acalmar', 'limite'],
    summary: 'Falar consigo como falaria com alguém de quem você gosta.', kind: 'text',
    lines: [
      'Este está sendo um momento difícil.',
      'Meu cérebro funciona de um jeito próprio e, às vezes, o mundo pede demais dele.',
      'Sentir isso não é falha minha. Eu estou me virando com o que tenho agora.',
      'O que eu preciso neste momento? Menos estímulo, uma pausa, alguém por perto, ou só tempo?',
      'Eu posso fazer o mínimo hoje. O mínimo conta.',
      'Eu mereço cuidado, inclusive o meu.',
    ],
    note: 'Leia devagar, uma linha por vez. Se alguma frase soar falsa, troque por uma que pareça verdadeira para você.',
  },
  {
    id: 'reduzir-demandas', title: 'Checklist para reduzir demandas', minutes: 4, goals: ['sobrecarga', 'limite'],
    summary: 'Marque o que pode esperar, ser menor ou ser pedido a outra pessoa.', kind: 'checklist',
    items: [
      'Posso adiar uma tarefa para outro dia',
      'Posso fazer uma versão menor de uma tarefa (só a parte principal)',
      'Posso responder mensagens só amanhã',
      'Posso cancelar ou remarcar um compromisso',
      'Posso pedir que alguém assuma uma parte',
      'Posso pular uma refeição elaborada e comer algo simples',
      'Posso deixar a bagunça como está até me sentir melhor',
      'Posso desligar notificações por algumas horas',
    ],
    note: 'Esta lista não é salva. Se quiser guardar o que você pode reduzir, use o seu plano de apoio.',
  },
  {
    id: 'frases-apoio', title: 'Frases para pedir apoio', minutes: 1, goals: ['apoio', 'limite', 'sobrecarga'],
    summary: 'Prontas para copiar quando falar está difícil.', kind: 'text', copyable: true,
    lines: [
      'Estou com sobrecarga e preciso de uma pausa. Posso voltar a falar daqui a pouco?',
      'Hoje está difícil. Você pode ficar por perto, sem precisar conversar?',
      'Preciso de ajuda para decidir o próximo passo. Podemos fazer isso juntos?',
      'Estou sem energia para essa conversa agora. Podemos combinar outro horário?',
      'Se eu ficar quieto/a, não é por você. Estou me recuperando.',
      'Pode me mandar por escrito? Assim consigo responder melhor.',
    ],
    link: { to: '/comunicacao', label: 'Ver mais modelos de mensagens' },
  },
  {
    id: 'acomodacoes', title: 'Modelo para pedir acomodações no trabalho', minutes: 5, goals: ['apoio', 'limite'],
    summary: 'Um texto-base para adaptar. Você escolhe o que contar.', kind: 'text', copyable: true,
    lines: [
      'Olá, [nome]. Gostaria de combinar alguns ajustes que me ajudam a trabalhar melhor.',
      'Funciono melhor com: instruções por escrito, prazos claros e pausas curtas ao longo do dia.',
      'Também ajudaria: [ex.: poder usar fones, ter um lugar mais silencioso, reduzir reuniões sem pauta].',
      'Esses ajustes me ajudam a manter a qualidade e a constância do meu trabalho.',
      'Podemos conversar quando for conveniente? Posso enviar um resumo por escrito antes.',
    ],
    note: 'Você não é obrigado/a a contar um diagnóstico para pedir ajustes. Escolha o que quer compartilhar e com quem. Em caso de dúvida, procure o RH, um sindicato ou orientação jurídica.',
    link: { to: '/comunicacao', label: 'Ver mais modelos de mensagens' },
  },
  {
    id: 'comecar-2min', title: 'Começar pelos 2 minutos', minutes: 2, goals: ['comecar'],
    summary: 'Prometa só 2 minutos. Parar depois é permitido.', kind: 'steps',
    steps: [
      'Escolha uma ação mínima. Exemplo: abrir o documento, ou pegar o material.',
      'Diga em voz alta ou na mente: “só 2 minutos”.',
      'Faça essa ação. Se quiser, use um cronômetro.',
      'Quando passar 2 minutos, pergunte: dá para continuar um pouco? Se sim, continue. Se não, pare. Os dois valem.',
    ],
  },
  {
    id: 'preparar', title: 'Preparar o ambiente', minutes: 3, goals: ['comecar'],
    summary: 'Facilitar a largada mexendo no lugar, não em você.', kind: 'checklist',
    items: [
      'Deixei só o necessário à vista',
      'Água ou algo para beber por perto',
      'Reduzi o que distrai (celular longe, abas fechadas)',
      'Luz e som no jeito que me ajuda',
      'Escrevi o primeiro passo num papel',
    ],
  },
  {
    id: 'transicao', title: 'Transição suave entre atividades', minutes: 3, goals: ['comecar', 'sobrecarga'],
    summary: 'Mudar de atividade custa energia. Dê um intervalo.', kind: 'steps',
    steps: [
      'Avise a si mesmo/a: “em 2 minutos vou mudar de atividade”.',
      'Salve ou anote onde parou, para não precisar guardar tudo na cabeça.',
      'Levante, se alongue ou beba água.',
      'Diga qual é o primeiro passo da próxima atividade. Só o primeiro.',
    ],
  },
  {
    id: 'movimento', title: 'Movimento livre', minutes: 2, goals: ['energia', 'acalmar', 'ansiedade'],
    summary: 'Mexer o corpo do jeito que for bom, inclusive stims.', kind: 'steps',
    steps: [
      'Escolha um movimento que seja bom para você: balançar, esticar, caminhar, mexer as mãos, pular de leve.',
      'Faça por 2 minutos, sem se preocupar com a aparência.',
      'Perceba o que muda no corpo: respiração, ombros, mandíbula.',
      'Se estiver em um lugar público, escolha uma versão discreta, como apertar um objeto ou mexer os pés.',
    ],
    note: 'Movimentos repetitivos (stims) são uma forma legítima de regulação. Você não precisa escondê-los de si.',
  },
  {
    id: 'reiniciar', title: 'Reiniciar o corpo em 3 minutos', minutes: 3, goals: ['energia'],
    summary: 'Água, luz e movimento. O básico que costuma ajudar.', kind: 'steps',
    steps: [
      'Beba um copo de água.',
      'Vá até uma janela ou lugar com luz natural, se der.',
      'Estique braços e costas por 30 segundos.',
      'Se estiver com fome, coma algo simples.',
      'Escolha uma coisa pequena para fazer em seguida.',
    ],
    note: 'Se a falta de energia está durando muito, vale conversar com um profissional de saúde.',
  },
  {
    id: 'checagem-corpo', title: 'Checagem do corpo', minutes: 2, goals: ['sobrecarga', 'acalmar', 'energia'],
    summary: 'Às vezes o corpo está pedindo algo básico.', kind: 'checklist',
    items: [
      'Estou com fome?',
      'Estou com sede?',
      'Dormi pouco?',
      'Tem barulho, luz ou cheiro me incomodando?',
      'Minha roupa ou sapato está apertando ou arranhando?',
      'Estou com calor ou frio?',
      'Preciso ir ao banheiro?',
      'Faz tempo que não me movo?',
    ],
    note: 'Marcar um item já mostra o próximo passo. Não precisa resolver todos.',
  },
  {
    id: 'pressao', title: 'Pressão profunda', minutes: 3, goals: ['acalmar', 'sobrecarga', 'ansiedade'],
    summary: 'Pressão firme costuma acalmar o corpo.', kind: 'steps',
    steps: [
      'Escolha: cobertor pesado, abraço apertado em si mesmo/a, almofada no colo ou pressionar as palmas das mãos uma contra a outra.',
      'Aplique pressão firme, mas confortável, por 1 a 2 minutos.',
      'Solte devagar e perceba como o corpo ficou.',
    ],
    note: 'Se pressão ou toque incomodam você, pule esta prática.',
  },
  {
    id: 'dizer-nao', title: 'Dizer “não agora” com gentileza', minutes: 2, goals: ['limite'],
    summary: 'Um limite pode ser dito de modo simples e educado.', kind: 'text', copyable: true,
    lines: [
      'Obrigado/a por lembrar de mim, mas não consigo ir desta vez.',
      'Agora não consigo. Posso retornar sobre isso na [dia]?',
      'Prefiro não, mas fico feliz em ajudar de outro jeito: [alternativa].',
      'Preciso pensar com calma. Respondo até [dia].',
    ],
    note: 'Você não precisa dar explicações longas. “Não consigo” é uma frase completa.',
    link: { to: '/comunicacao', label: 'Ver mais modelos de mensagens' },
  },
];

export const practiceById = (id: string) => PRACTICES.find((p) => p.id === id);
