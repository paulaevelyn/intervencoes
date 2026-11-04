/** Divisão de tarefas em micro-passos, por regras simples (sem IA e sem internet). */
const clip = (t: string, n = 38) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t);

const RULES: { test: RegExp; steps: (t: string) => string[] }[] = [
  { test: /e-?mail|mensagem|responder|whats|retornar/i, steps: () => [
    'Abra só a mensagem que precisa de resposta',
    'Escreva a primeira frase, mesmo que imperfeita',
    'Complete com o essencial (3 ou 4 linhas)',
    'Releia uma vez',
    'Envie, ou salve como rascunho',
  ] },
  { test: /pagar|boleto|fatura|banco|conta de/i, steps: () => [
    'Separe o app ou o documento do banco',
    'Confira o valor e a data',
    'Faça o pagamento ou agende',
    'Guarde o comprovante sempre no mesmo lugar',
  ] },
  { test: /consulta|marcar|agendar|ligar|telefon/i, steps: () => [
    'Anote em 1 ou 2 frases o que precisa dizer',
    'Veja quais dias e horários servem para você',
    'Abra o contato ou o site (prefira mensagem, se puder)',
    'Faça o contato',
    'Anote a data e a hora combinadas',
  ] },
  { test: /estud|ler |leitura|prova|curso|aula/i, steps: () => [
    'Escolha só um trecho pequeno',
    'Deixe o material e a água à mão',
    'Estude por 10 minutos com tempo marcado',
    'Anote em uma frase o que entendeu',
    'Decida: pausa, ou mais 10 minutos',
  ] },
  { test: /escrev|relat[óo]rio|texto|trabalho|projeto|apresenta|documento/i, steps: () => [
    'Abra o arquivo e escreva só o título',
    'Liste 3 tópicos em palavras soltas',
    'Escreva o tópico mais fácil, sem revisar',
    'Faça uma pausa curta',
    'Complete os outros tópicos',
    'Salve e anote onde parou',
  ] },
  { test: /mercado|compras|comprar|feira/i, steps: () => [
    'Olhe geladeira e armários para ver o que falta',
    'Escreva uma lista curta',
    'Separe sacola, carteira e chaves',
    'Faça a compra, ou peça a entrega',
    'Guarde as compras',
  ] },
  { test: /limp|arrum|organiz|lou[çc]a|quarto|bagun|lavar|roupa/i, steps: () => [
    'Escolha só um cantinho para começar',
    'Pegue um saco ou cesto para o que for lixo',
    'Recolha o que está fora do lugar nesse cantinho',
    'Guarde o que tem lugar óbvio',
    'Pare quando o cantinho estiver pronto. Já conta',
  ] },
  { test: /banho|dent|higiene|rem[eé]dio/i, steps: () => [
    'Separe o que vai usar',
    'Ajuste luz e temperatura do jeito confortável',
    'Faça só a parte principal',
    'Vista ou guarde algo confortável',
  ] },
];

export function splitTask(title: string): string[] {
  const rule = RULES.find((r) => r.test.test(title));
  if (rule) return rule.steps(title);
  return [
    `Separe o que você precisa para “${clip(title)}”`,
    'Defina o que é “bom o suficiente” para hoje',
    'Comece pelo menor pedaço possível',
    'Trabalhe por 10 minutos, com tempo marcado',
    'Pare e olhe: dá para continuar, ou já basta por agora?',
    'Anote onde parou, para retomar sem esforço',
  ];
}
