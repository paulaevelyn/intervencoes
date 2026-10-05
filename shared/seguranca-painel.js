/* seguranca-painel.js — leitura do percurso da Segurança Interna (5 etapas).
   SegurancaPainel.render(estado, { textos }) -> HTMLElement
   `estado` = { etapaAtual, telaAtual, programaConcluido, posturaEtapa2, respostas? }.
   Depende de farol-painel.js. Todo texto entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[SegurancaPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;
  var ETAPAS = 5;

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    // Escala de segurança social (EPLO/SSPS): pré e pós, só números.
    var esc = estado && estado.escalas, pre = esc && esc.pre && esc.pre.eplo, pos = esc && esc.pos && esc.pos.eplo;
    if (!pre || typeof pre.total !== 'number') pre = null;   // a projeção devolve {} quando não há resposta
    if (!pos || typeof pos.total !== 'number') pos = null;
    if (pre || pos) {
      var ce = U.cartao('Segurança social (EPLO)', 'Soma de 11 a 55. Mais alto = mais segurança e proximidade percebidas nas relações. Não é diagnóstico.');
      if (pre) ce.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Início' }), h('strong', { texto: pre.total + ' de ' + (pre.maximo || 55) })));
      if (pos) ce.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Depois' }), h('strong', { texto: pos.total + ' de ' + (pos.maximo || 55) })));
      if (pre && pos) {
        var d = pos.total - pre.total;
        ce.appendChild(h('p', { class: 'fp-dica', texto: 'Diferença: ' + (d > 0 ? '+' : '') + d + ' ponto' + (Math.abs(d) === 1 ? '' : 's') + '.' }));
      }
      raiz.appendChild(ce);
    }

    if (!estado || (!estado.etapaAtual && !estado.programaConcluido)) {
      if (pre || pos) return raiz;
      var v = U.cartao('Percurso'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'A pessoa ainda não começou o programa.' }));
      raiz.appendChild(v); return raiz;
    }

    var etapa = estado.programaConcluido ? ETAPAS : (estado.etapaAtual || 1);
    var c1 = U.cartao('Percurso', estado.programaConcluido ? 'Programa concluído' : 'Etapa em andamento: ' + etapa + ' de ' + ETAPAS);
    var trilha = h('div', { class: 'fp-barras' });
    for (var i = 1; i <= ETAPAS; i++) {
      var feita = estado.programaConcluido || i < etapa, atual = !estado.programaConcluido && i === etapa;
      var fill = h('div', { class: 'fp-preenche' }); fill.style.width = feita ? '100%' : (atual ? '45%' : '0%');
      trilha.appendChild(h('div', { class: 'fp-linha-b' },
        h('span', { class: 'fp-nome', texto: 'Etapa ' + i }),
        h('span', { class: 'fp-trilho' }, fill),
        h('span', { class: 'fp-val', texto: feita ? '✓' : (atual ? '…' : '') })));
    }
    c1.appendChild(trilha);
    raiz.appendChild(c1);

    if (estado.posturaEtapa2) {
      var c2 = U.cartao('Postura escolhida na Etapa 2');
      c2.appendChild(h('p', { class: 'fp-texto', texto: String(estado.posturaEtapa2) }));
      raiz.appendChild(c2);
    }

    var c3 = U.cartao('Respostas escritas');
    var r = estado.respostas;
    if (!opts.textos) {
      c3.appendChild(h('p', { class: 'fp-vazio', texto: 'Os textos não foram compartilhados.' }));
    } else if (!r || (!r.motivoInicial && !r.fraseAcolhimento)) {
      c3.appendChild(h('p', { class: 'fp-vazio', texto: 'Nenhuma resposta escrita ainda.' }));
    } else {
      if (r.motivoInicial) c3.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: 'O que trouxe a pessoa aqui' })), h('p', { class: 'fp-texto', texto: r.motivoInicial })));
      if (r.fraseAcolhimento) c3.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: 'Frase de acolhimento' })), h('p', { class: 'fp-texto', texto: r.fraseAcolhimento })));
    }
    raiz.appendChild(c3);
    return raiz;
  }

  global.SegurancaPainel = { render: render };
})(window);
