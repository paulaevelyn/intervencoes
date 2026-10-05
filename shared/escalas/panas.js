/* panas.js — Escala de Afetos Positivos e Negativos (PANAS), versão brasileira de 19 itens.

   Original: Watson, D., Clark, L. A., & Tellegen, A. (1988). Development and validation of brief
   measures of positive and negative affect: the PANAS scales. J Pers Soc Psychol, 54(6), 1063–1070.
   Versão brasileira: CARVALHO, H. W. et al. (2013). Validade estrutural e confiabilidade da Escala de
   Afeto Positivo e Negativo (PANAS): evidências de uma grande amostra comunitária brasileira.
   Rev Bras Psiquiatr, 35(2), 169–172. doi:10.1590/1516-4446-2012-0957.

   CONFERIDO (2026-10-05) contra o artigo (SciELO) e o PDF enviado por Paula: 19 itens (o item
   "orgulhoso" foi excluído por carga fatorial < 0,3), 9 de afeto positivo e 10 de afeto negativo,
   resposta de 1 ("muito pouco ou nada") a 5 ("extremamente"), pontuação = SOMA por subescala
   (AP: 9–45 · AN: 10–50), solução de dois fatores, α = 0,88 (AP) e 0,87 (AN).
   NÃO há pontuação total: as duas subescalas são independentes (`semTotal`).

   JANELA DE TEMPO: o estudo de validação perguntou como a pessoa se sente "em geral, na vida como
   um todo". O PDF de Paula deixa o período "indicado pelo terapeuta". Mudar a janela (por exemplo,
   "nas últimas semanas") muda o que a escala mede e não está validado: decidir por app e registrar.

   Estado de uso: definição pronta, ainda NÃO ligada a nenhum app. */
(function (global) {
  'use strict';
  global.ESCALAS = global.ESCALAS || {};
  global.ESCALAS.panas = {
    id: 'panas',
    versao: 'PANAS-Br 19 itens (Carvalho et al., 2013)',
    nome: 'Como você se sente',
    instrucao: 'Esta escala consiste em uma série de palavras que descrevem diferentes sentimentos e emoções. Leia cada item e marque a resposta apropriada. Não existem respostas certas ou erradas. Pense em como você geralmente se sente, na sua vida como um todo.',
    opcoes: 5,
    ancoras: { 1: 'Muito pouco ou nada', 5: 'Extremamente' },
    rotulos: ['Muito pouco ou nada', 'Um pouco', 'Moderadamente', 'Bastante', 'Extremamente'],
    itens: [
      'Ativo', 'Alerta', 'Atento', 'Determinado', 'Entusiasmado', 'Empolgado', 'Inspirado', 'Interessado', 'Forte',
      'Com medo', 'Envergonhado', 'Aflito', 'Culpado', 'Hostil', 'Irritável', 'Inquieto', 'Nervoso', 'Apavorado', 'Chateado'
    ],
    pontuacao: { tipo: 'soma-por-subescala', invertidos: [] },
    semTotal: true,
    subescalas: { AP: [1, 2, 3, 4, 5, 6, 7, 8, 9], AN: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
    fonte: 'Escala de Afetos Positivos e Negativos (PANAS; Watson, Clark e Tellegen, 1988), versão brasileira de 19 itens (Carvalho e cols., 2013). Não é um instrumento de diagnóstico.'
  };
})(window);
