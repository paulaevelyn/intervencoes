/* phq9.js — Questionário sobre a Saúde do/a Paciente-9 (PHQ-9), versão em português do Brasil.

   Texto dos itens, instrução e rótulos: formulário oficial "PHQ-9 Portuguese for Brazil"
   (Pfizer Inc., © 2005, "reproduzido sob permissão"; os PHQ são de livre reprodução, sem pedido de
   permissão, segundo phqscreeners.com), conferido em 2026-10-05 no PDF
   multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ-9-Portuguese.pdf.
   Original: Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9. J Gen Intern Med, 16, 606–613.
   Validação brasileira: Santos, I. S. et al. (2013). Sensibilidade e especificidade do PHQ-9 entre
   adultos da população geral. Cad Saúde Pública, 29(8), 1533–1543.

   Escala: 9 itens, "últimas 2 semanas", 0 (nenhuma vez) a 3 (quase todos os dias), SOMA de 0 a 27.
   Pergunta 10 (não pontua): grau de dificuldade em trabalho/casa/relações, 4 opções (0–3).
   Faixas da literatura (só para a profissional): 0–4 mínimo · 5–9 leve · 10–14 moderado ·
   15–19 moderadamente grave · 20–27 grave. O app NÃO classifica a pessoa na tela dela.

   ⚠ SEGURANÇA — ITEM 9 ("pensar em se ferir… ou que seria melhor estar morto/a"): qualquer resposta
   maior que 0 deve mostrar apoio de crise na hora (CVV 188, SAMU 192) e dizer com clareza que o app
   NÃO envia alerta a ninguém. Implementado em aurora/public/escala.html. */
(function (global) {
  'use strict';
  global.ESCALAS = global.ESCALAS || {};
  global.ESCALAS.phq9 = {
    id: 'phq9',
    versao: 'PHQ-9, português do Brasil (Pfizer, 2005)',
    nome: 'Como você tem se sentido',
    instrucao: 'Durante as últimas 2 semanas, com que freqüência você foi incomodado/a por qualquer um dos problemas abaixo?',
    valorMin: 0,
    opcoes: 4,
    ancoras: { 0: 'Nenhuma vez', 3: 'Quase todos os dias' },
    rotulos: ['Nenhuma vez', 'Vários dias', 'Mais da metade dos dias', 'Quase todos os dias'],
    itens: [
      'Pouco interesse ou pouco prazer em fazer as coisas',
      'Se sentir “para baixo”, deprimido/a ou sem perspectiva',
      'Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume',
      'Se sentir cansado/a ou com pouca energia',
      'Falta de apetite ou comendo demais',
      'Se sentir mal consigo mesmo/a — ou achar que você é um fracasso ou que decepcionou sua família ou você mesmo/a',
      'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão',
      'Lentidão para se movimentar ou falar, a ponto das outras pessoas perceberem? Ou o oposto – estar tão agitado/a ou irrequieto/a que você fica andando de um lado para o outro muito mais do que de costume',
      'Pensar em se ferir de alguma maneira ou que seria melhor estar morto/a'
    ],
    pontuacao: { tipo: 'soma', invertidos: [] },
    itemRisco: 9,   // índice (1-based) do item sobre pensamentos de morte/autolesão
    funcional: {
      pergunta: 'Se você assinalou qualquer um dos problemas, indique o grau de dificuldade que os mesmos lhe causaram para realizar seu trabalho, tomar conta das coisas em casa ou para se relacionar com as pessoas?',
      opcoes: ['Nenhuma dificuldade', 'Alguma dificuldade', 'Muita dificuldade', 'Extrema dificuldade']
    },
    reaplicacaoSemanas: 4,
    fonte: 'PHQ-9, versão em português do Brasil. © Pfizer Inc., 2005; reproduzido sob permissão. Validado no Brasil (Santos e cols., 2013). É uma triagem de sintomas e não um diagnóstico.'
  };
})(window);
