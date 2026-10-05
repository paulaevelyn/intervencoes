/* tpas.js — Types of Positive Affect Scale (TPAS), com TRADUÇÃO PRÓPRIA para o português do Brasil.

   Original: Gilbert, P., McEwan, K., Mitra, R., Franks, L., Richter, A., & Rockliff, H. (2008).
   Feeling safe and content: A specific affect regulation system? Relationship to depression,
   anxiety, stress, and self-criticism. The Journal of Positive Psychology, 3, 182–191. © Gilbert, 2008.
   Fonte do formulário e da pontuação (conferidos): PDF oficial em inglês "three-types-of-positive-
   affect-scale.pdf" (cdn.prod.website-files.com), baixado em 2026-10-05.

   O QUE VEM DO ORIGINAL (conferido): 18 palavras, resposta de 0 ("nada característico de mim") a 4
   ("muito característico de mim"), três subescalas por SOMA:
     Afeto positivo ATIVADO (8):  energetic, lively, adventurous, active, enthusiastic, dynamic, excited, eager
     Afeto positivo RELAXADO (6): relaxed, peaceful, calm, tranquil, laid back, serene
     Afeto positivo SEGURO/CALOROSO (4): safe, content, secure, warm
   => faixas 0–32, 0–24 e 0–16. Não há pontuação total nem pontos de corte no documento.

   ⚠ O QUE É TRADUÇÃO PRÓPRIA (NÃO VALIDADA): as palavras e a instrução em português abaixo foram
   traduzidas por Claude a pedido de Paula, sem tradução reversa, sem revisão de especialistas e sem
   estudo psicométrico. Escolhas que merecem revisão: "Safe" → "Protegido/a" e "Secure" → "Seguro/a"
   (em português as duas costumam virar "seguro"); "Warm" → "Caloroso/a"; "Content" → "Satisfeito/a"
   (e não "contente", que lembra alegria); "Eager" → "Cheio/a de vontade" (evitei "ansioso/a");
   "Peaceful" → "Em paz"; "Lively" → "Animado/a"; "Excited" → "Empolgado/a". Há uma versão
   portuguesa (Portugal) de Pinto-Gouveia, Dinis & Matos (2008), não publicada, que não foi consultada.
   REVISÃO: as escolhas de palavras acima foram APROVADAS por Paula em 2026-10-05. Isso é uma
   aprovação editorial da profissional, e NÃO uma validação psicométrica.
   Para uso em pesquisa: tradução reversa, revisão por especialistas e validação são necessárias.
   Direitos: © Gilbert, 2008 — confirmar com o autor/Compassionate Mind Foundation as condições de uso.

   A ORDEM das palavras é a do formulário oficial. Os rótulos de gênero usam "o/a". */
(function (global) {
  'use strict';
  global.ESCALAS = global.ESCALAS || {};
  global.ESCALAS.tpas = {
    id: 'tpas',
    versao: 'TPAS — tradução própria para o português (não validada)',
    nome: 'Como você costuma se sentir',
    instrucao: 'Abaixo há uma série de palavras que descrevem diferentes emoções positivas. Algumas delas têm a ver com se sentir animado/a, cheio/a de energia e empolgado/a, enquanto outras têm a ver com se sentir relaxado/a, calmo/a e em paz. Queremos saber o quanto você costuma sentir cada uma delas. Para cada palavra, indique o quanto esse sentimento é característico de você.',
    valorMin: 0,
    opcoes: 5,
    ancoras: { 0: 'Nada característico de mim', 4: 'Muito característico de mim' },
    // Legenda como no formulário oficial: 1, 2 e 3 ficam sob "razoavelmente característico".
    legenda: '0 = Nada característico de mim · 1, 2 e 3 = Razoavelmente característico de mim · 4 = Muito característico de mim',
    itens: [
      'Seguro/a',            // 1  Secure
      'Calmo/a',             // 2  Calm
      'Ativo/a',             // 3  Active
      'Descontraído/a',      // 4  Laid back
      'Animado/a',           // 5  Lively
      'Cheio/a de energia',  // 6  Energetic
      'Sereno/a',            // 7  Serene
      'Cheio/a de vontade',  // 8  Eager
      'Dinâmico/a',          // 9  Dynamic
      'Protegido/a',         // 10 Safe
      'Caloroso/a',          // 11 Warm
      'Satisfeito/a',        // 12 Content
      'Empolgado/a',         // 13 Excited
      'Aventureiro/a',       // 14 Adventurous
      'Tranquilo/a',         // 15 Tranquil
      'Em paz',              // 16 Peaceful
      'Entusiasmado/a',      // 17 Enthusiastic
      'Relaxado/a'           // 18 Relaxed
    ],
    pontuacao: { tipo: 'soma-por-subescala', invertidos: [] },
    semTotal: true,
    subescalas: {
      ATIVO:    [3, 5, 6, 8, 9, 13, 14, 17],   // 8 palavras: faixa 0–32
      RELAXADO: [2, 4, 7, 15, 16, 18],         // 6 palavras: faixa 0–24
      SEGURO:   [1, 10, 11, 12]                // 4 palavras: faixa 0–16
    },
    fonte: 'Types of Positive Affect Scale (TPAS; Gilbert e colaboradores, 2008). Tradução própria para o português do Brasil, ainda sem validação. Os números servem para você acompanhar a si mesmo/a ao longo do tempo, não para comparar com outras pessoas nem para diagnóstico.'
  };
})(window);
