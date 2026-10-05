/* tas20.js — Escala de Alexitimia de Toronto (TAS-20), versão em português do Brasil.

   Original: Bagby, R. M., Parker, J. D. A., & Taylor, G. J. (1994). The twenty-item
   Toronto Alexithymia Scale: I. Item selection and cross-validation of the factor structure.
   Referência brasileira indicada por Paula: COLOMBAROLLI, M. S.; ZUANAZZI, A. C.; MIGUEL, F. K.;
   GIROMINI, L. (2019). Psychometric properties of the Toronto Alexithymia Scale (TAS-20) in
   Brazil. Transcultural Psychiatry, 56(5), 992–1010. doi:10.1177/1363461519847312.

   ⚠ PENDÊNCIAS DE CONFERÊNCIA (ver o artigo antes de usar em pesquisa):
   1. O TEXTO DOS ITENS foi transcrito de uma página de plataforma de testes enviada por Paula
      (que cita o artigo acima), e NÃO do artigo. Confirmar o texto contra o artigo/anexo.
   2. ITEM 5: essa página não o inverte, mas na TAS-20 original e na literatura os itens
      invertidos são 4, 5, 10, 18 e 19. Aqui vale a regra da literatura. Se o artigo brasileiro
      disser outra coisa, ajustar APENAS a lista `invertidos` abaixo.
   3. Pontos de corte (≤51 sem alexitimia · 52–60 possível · ≥61 alexitimia) são os da
      literatura internacional; o app NÃO rotula o paciente (rótulo só no painel da profissional).

   Escala: 20 itens, 1 (discordo totalmente) a 5 (concordo totalmente), soma de 20 a 100.
   Subescalas (estrutura de 3 fatores): DIF = 1,3,6,7,9,13,14 · DDF = 2,4,11,12,17 ·
   EOT = 5,8,10,15,16,18,19,20. É uma medida de TRAÇO (janela de tempo não especificada). */
(function (global) {
  'use strict';
  global.ESCALAS = global.ESCALAS || {};
  global.ESCALAS.tas20 = {
    id: 'tas20',
    versao: 'TAS-20 Brasil (ref.: Colombarolli et al., 2019) — texto dos itens a conferir',
    nome: 'Como você lida com as emoções',
    instrucao: 'Leia cada uma das afirmações abaixo e indique o quanto você concorda ou discorda. Pense em como você é, na maior parte do tempo.',
    opcoes: 5,
    ancoras: { 1: 'Discordo totalmente', 5: 'Concordo totalmente' },
    rotulos: ['Discordo totalmente', 'Discordo', 'Nem concordo nem discordo', 'Concordo', 'Concordo totalmente'],
    itens: [
      'Eu frequentemente fico confuso sobre qual emoção estou sentindo.',
      'É difícil encontrar as palavras certas para expressar meus sentimentos.',
      'Tenho sensações físicas que até os médicos não conseguem explicar.',
      'Eu consigo descrever meus sentimentos com facilidade.',
      'Prefiro analisar os problemas a simplesmente descrevê-los.',
      'Quando estou chateado, não sei se estou triste, com medo ou com raiva.',
      'Muitas vezes fico intrigado com sensações no corpo.',
      'Prefiro deixar as coisas acontecerem a tentar entender por que ocorreram.',
      'Tenho sentimentos que não consigo realmente identificar.',
      'Estar em contato com emoções é essencial.',
      'Tenho dificuldade de descrever como me sinto em relação às pessoas.',
      'As pessoas dizem que eu deveria descrever mais meus sentimentos.',
      'Não sei o que está acontecendo dentro de mim.',
      'Muitas vezes não sei por que estou com raiva.',
      'Prefiro conversar sobre atividades diárias do que sobre sentimentos.',
      'Prefiro assistir a programas leves do que a dramas psicológicos.',
      'Acho difícil revelar meus sentimentos mais profundos mesmo a bons amigos.',
      'Posso sentir proximidade com alguém, mesmo em momentos de silêncio.',
      'Acredito que examinar meus sentimentos é útil para resolver problemas pessoais.',
      'Procuro significados ocultos em filmes ou peças.'
    ],
    pontuacao: { tipo: 'soma', invertidos: [4, 5, 10, 18, 19] },
    subescalas: { DIF: [1, 3, 6, 7, 9, 13, 14], DDF: [2, 4, 11, 12, 17], EOT: [5, 8, 10, 15, 16, 18, 19, 20] },
    reaplicacaoSemanas: 8,
    fonte: 'Toronto Alexithymia Scale (TAS-20; Bagby, Parker e Taylor, 1994), versão para o português do Brasil. Referência: Colombarolli, Zuanazzi, Miguel e Giromini (2019). Não é um instrumento de diagnóstico.'
  };
})(window);
