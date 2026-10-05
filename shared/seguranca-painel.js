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

    // Diário de segurança: registros curtos (nível 1–5, onde, o que ajudou); a nota só com permissão.
    var dia = ((estado && estado.diario) || []).filter(function (d) { return d && d.date; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    function anexarDiario() {
      if (!dia.length) return;
      var semanas = {}; dia.forEach(function (d) { semanas[U.segunda(d.date)] = 1; });
      var mNivel = U.media(dia.map(function (d) { return d.nivel; }).filter(function (x) { return typeof x === 'number'; }));
      raiz.appendChild(h('div', { class: 'fp-resumo' },
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(dia.length) }), h('span', { texto: 'registros no diário' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(semanas).length) }), h('span', { texto: 'semanas com registro' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: mNivel === null ? '—' : mNivel.toFixed(1) }), h('span', { texto: 'segurança média (1–5)' }))));
      var cd1 = U.cartao('Registros por semana', 'Últimas 8 semanas'); cd1.appendChild(U.graficoSemanas(dia)); raiz.appendChild(cd1);
      var gm = U.graficoMedia(dia, 'nivel', 'Segurança sentida por semana');
      if (gm) { var cd2 = U.cartao('Segurança sentida', 'Média por semana. Quanto mais alto, mais segurança.'); cd2.appendChild(gm); raiz.appendChild(cd2); }
      var onde = U.contar([].concat.apply([], dia.map(function (d) { return d.onde || []; })));
      if (onde.length) { var cd3 = U.cartao('Onde a pessoa sentiu segurança'); cd3.appendChild(U.listaBarras(onde, dia.length)); raiz.appendChild(cd3); }
      var aj = U.contar([].concat.apply([], dia.map(function (d) { return d.ajudou || []; })));
      if (aj.length) { var cd4 = U.cartao('O que ajudou'); cd4.appendChild(U.listaBarras(aj, dia.length)); raiz.appendChild(cd4); }
      var cd5 = U.cartao('Notas do diário', 'Registros mais recentes primeiro');
      if (!opts.textos) cd5.appendChild(h('p', { class: 'fp-vazio', texto: 'As notas escritas não foram compartilhadas.' }));
      else {
        var comNota = dia.filter(function (d) { return d.nota; }).reverse().slice(0, 15);
        if (!comNota.length) cd5.appendChild(h('p', { class: 'fp-vazio', texto: 'Nenhuma nota escrita.' }));
        comNota.forEach(function (d) {
          cd5.appendChild(h('div', { class: 'fp-item' },
            h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(d.date) }), h('span', { class: 'fp-tag', texto: 'segurança ' + d.nivel + ' de 5' })),
            h('p', { class: 'fp-texto', texto: d.nota })));
        });
      }
      raiz.appendChild(cd5);
    }

    // TPAS (tradução própria, não validada): 3 subescalas (seguro/caloroso, relaxado, ativado). Só números.
    var tp = esc && esc.pre && esc.pre.tpas, tq = esc && esc.pos && esc.pos.tpas;
    if (!tp || !tp.subescalas || typeof tp.subescalas.SEGURO !== 'number') tp = null;
    if (!tq || !tq.subescalas || typeof tq.subescalas.SEGURO !== 'number') tq = null;
    if (tp || tq) {
      var NOMES = { SEGURO: 'Seguro/a e caloroso/a', RELAXADO: 'Relaxado/a e calmo/a', ATIVO: 'Animado/a e cheio/a de energia' };
      var MAXS = { SEGURO: 16, RELAXADO: 24, ATIVO: 32 };
      var ct = U.cartao('Tipos de afeto positivo (TPAS)', 'Quanto cada tipo é característico da pessoa. Tradução própria, ainda sem validação: usar para acompanhar a própria pessoa, não para comparar com normas.');
      ['SEGURO', 'RELAXADO', 'ATIVO'].forEach(function (k) {
        var partes = [];
        if (tp) partes.push('início ' + tp.subescalas[k]);
        if (tq) partes.push('depois ' + tq.subescalas[k]);
        ct.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: NOMES[k] + ' (0–' + MAXS[k] + ')' }), h('strong', { texto: partes.join(' → ') })));
      });
      raiz.appendChild(ct);
    }

    if (!estado || (!estado.etapaAtual && !estado.programaConcluido)) {
      anexarDiario();
      if (pre || pos || tp || tq || dia.length) return raiz;
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

    anexarDiario();

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
