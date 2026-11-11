export interface Template { id: string; title: string; when: string; text: string }

/** Textos curtos e adaptáveis. Trechos entre [colchetes] viram campos para preencher. */
export const TEMPLATES: Template[] = [
  {
    id: 'prazo', title: 'Pedir prazo extra', when: 'Quando a entrega está maior do que a sua energia hoje.',
    text: 'Olá, [nome]. Estou trabalhando em [tarefa] e preciso de um pouco mais de tempo para entregar com qualidade. Consigo concluir até [nova data]. Isso funciona para você? Se preferir, posso enviar uma parte antes.',
  },
  {
    id: 'pausa', title: 'Explicar necessidade de pausa', when: 'Quando você precisa parar, sem se justificar demais.',
    text: 'Preciso de uma pausa de [tempo] para me reorganizar. Volto às [horário] e consigo continuar com mais clareza. Obrigado/a pela compreensão.',
  },
  {
    id: 'sensorial', title: 'Pedir acomodação sensorial', when: 'Quando luz, som ou ambiente atrapalham.',
    text: 'Olá, [nome]. Alguns estímulos do ambiente, como [ex.: barulho, luz forte], me deixam sobrecarregado/a e prejudicam meu foco. Poderíamos ajustar [pedido, ex.: mudar de lugar, usar fones, baixar a luz]? Isso me ajuda a trabalhar melhor.',
  },
  {
    id: 'prioridade', title: 'Pedir prioridades e instruções por escrito', when: 'Quando há muita coisa e pouca clareza do que vem primeiro.',
    text: 'Olá, [nome]. Para me organizar melhor, eu me beneficio de instruções escritas e de uma lista clara de prioridades. Você poderia me enviar o resultado esperado, o prazo e o que vem primeiro em [tarefa ou projeto]?',
  },
  {
    id: 'recusar', title: 'Recusar um convite sem culpa', when: 'Quando você não tem energia para o evento.',
    text: 'Oi, [nome]! Obrigado/a pelo convite. Desta vez não vou conseguir ir. Fico feliz de ter lembrado de mim. Se quiser, podemos combinar algo mais tranquilo em [alternativa].',
  },
  {
    id: 'instrucoes', title: 'Explicar que precisa de instruções claras', when: 'Quando o pedido ficou vago.',
    text: 'Olá, [nome]. Para fazer isso bem, preciso de instruções mais claras. Você poderia me passar por escrito: o que precisa ser feito, o prazo e como saberemos que está pronto? Se tiver um exemplo do que espera, ajuda muito.',
  },
  {
    id: 'limites', title: 'Comunicar limites em relacionamentos', when: 'Quando você precisa de espaço ou de outro combinado.',
    text: 'Eu gosto de estar com você e preciso combinar uma coisa: [limite, ex.: preciso de um tempo sozinho/a depois de eventos sociais]. Isso não muda o que sinto por você. É o que me ajuda a ficar bem para estar presente. Podemos combinar assim?',
  },
];
