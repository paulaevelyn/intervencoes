/* eplo.js — Escala de Proximidade e Ligação com os Outros (EPLO).
   Versão brasileira da Social Safeness and Pleasure Scale (SSPS).

   Itens e instrução: Anexo H de PUREZA, J. R. (2020). Intersecções entre experiências
   de segurança e ameaça social e modelos de relação interna de autocompaixão e
   autocriticismo. Tese (Doutorado em Psicologia), PUCRS, Porto Alegre.
   Original: Gilbert, P., et al. (2009). Social safeness and pleasure scale.
   Adaptação para o português brasileiro: Pureza & Lisboa (2020).

   Escala: 11 itens, de 1 ("quase nunca") a 5 ("quase sempre"), um único fator,
   soma de 11 a 55, sem itens invertidos; pontuação mais alta = mais segurança social
   percebida. Não há pontos de corte no estudo de validação (α = 0,924, estudantes
   universitários brasileiros). Não é instrumento diagnóstico. */
(function (global) {
  'use strict';
  global.ESCALAS = global.ESCALAS || {};
  global.ESCALAS.eplo = {
    id: 'eplo',
    versao: 'EPLO-Br (Pureza & Lisboa, 2020)',
    nome: 'Como você se sente com as outras pessoas',
    instrucao: 'Estamos interessados em saber como as pessoas experimentam prazer, sentimentos e emoções positivas em interações sociais. Abaixo há um conjunto de afirmações sobre como uma pessoa pode se sentir em diferentes situações. Leia com atenção cada afirmação e escolha o número que melhor descreve o que você sente.',
    opcoes: 5,
    ancoras: { 1: 'Quase nunca', 5: 'Quase sempre' },
    itens: [
      'Me sinto satisfeito em minhas relações com os outros.',
      'Me sinto facilmente acalmado/tranquilizado pelos outros que estão à minha volta.',
      'Me sinto conectado aos outros.',
      'Sinto que faço parte de algo maior do que eu mesmo.',
      'Sinto que sou cuidado pelos outros.',
      'Me sinto seguro e querido pelos outros.',
      'Tenho um sentimento de pertencimento.',
      'Sinto que sou aceito pelos outros.',
      'Me sinto compreendido pelos outros.',
      'Sinto que as pessoas com quem me relaciono me tratam calorosamente.',
      'É fácil me sentir acalmado/tranquilizado pelos outros que são próximos de mim.'
    ],
    pontuacao: { tipo: 'soma', invertidos: [] },
    fonte: 'Escala de Proximidade e Ligação com os Outros (EPLO), versão brasileira da Social Safeness and Pleasure Scale (Gilbert e cols., 2009), adaptada por Pureza e Lisboa (2020). Validada com estudantes universitários brasileiros. Não é um instrumento de diagnóstico.'
  };
})(window);
