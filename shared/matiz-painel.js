/* matiz-painel.js — leitura dos check-ins do Matiz (sensação no corpo, família de
   emoção, intensidade, contexto). MatizPainel.render(estado, { textos }) -> HTMLElement
   `estado` = { checkins, doseRecords, vocab? } (a projeção entregue por painel_dados).
   Depende de farol-painel.js. Todo texto entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[MatizPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;

  function dataLocal(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    var cs = ((estado && estado.checkins) || []).filter(function (c) { return c && c.ts; })
      .map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; o.date = dataLocal(c.ts); return o; })
      .sort(function (a, b) { return a.ts - b.ts; });

    // Escala de alexitimia (TAS-20): totais e subescalas, sem rótulo para a própria pessoa.
    var esc = estado && estado.escalas, pre = esc && esc.pre && esc.pre.tas20, pos = esc && esc.pos && esc.pos.tas20;
    if (!pre || typeof pre.total !== 'number') pre = null;   // a projeção devolve {} quando não há resposta
    if (!pos || typeof pos.total !== 'number') pos = null;
    if (pre || pos) {
      var ce = U.cartao('Como lida com as emoções (TAS-20)', 'Soma de 20 a 100. Mais alto = mais dificuldade em perceber e dizer o que se sente. Medida de traço, não é diagnóstico.');
      var linha = function (nome, r) {
        var sub = r.subescalas ? '  (identificar ' + r.subescalas.DIF + ' · descrever ' + r.subescalas.DDF + ' · externo ' + r.subescalas.EOT + ')' : '';
        return h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: nome }), h('strong', { texto: r.total + ' de ' + (r.maximo || 100) + sub }));
      };
      if (pre) ce.appendChild(linha('Início', pre));
      if (pos) ce.appendChild(linha('Depois', pos));
      if (pre && pos) { var d = pos.total - pre.total; ce.appendChild(h('p', { class: 'fp-dica', texto: 'Diferença: ' + (d > 0 ? '+' : '') + d + ' ponto' + (Math.abs(d) === 1 ? '' : 's') + '.' })); }
      if (opts.profissional) ce.appendChild(h('p', { class: 'fp-dica', texto: 'Faixas da literatura internacional (sem padrão brasileiro estabelecido): até 51 · 52 a 60 · 61 ou mais. Interpretar junto da entrevista clínica; pontuação alta pode aparecer em trauma, somatização e TEA.' }));
      raiz.appendChild(ce);
    }

    if (!cs.length) {
      if (pre || pos) return raiz;
      var v = U.cartao('Check-ins'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há check-ins registrados.' }));
      raiz.appendChild(v); return raiz;
    }

    var ult7 = cs.filter(function (c) { return c.ts >= Date.now() - 7 * 864e5; }).length;
    var famEscolhidas = cs.filter(function (c) { return c.chosenFamily; }).length;
    raiz.appendChild(h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(cs.length) }), h('span', { texto: 'check-ins' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(ult7) }), h('span', { texto: 'nos últimos 7 dias' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: Math.round(famEscolhidas / cs.length * 100) + '%' }), h('span', { texto: 'chegaram a nomear uma família' }))));

    var c1 = U.cartao('Check-ins por semana', 'Últimas 8 semanas'); c1.appendChild(U.graficoSemanas(cs)); raiz.appendChild(c1);

    var sens = U.contar(cs.map(function (c) { return c.sensationLabel; }).filter(Boolean));
    if (sens.length) { var c2 = U.cartao('Sensações no corpo', 'Por onde a pessoa começou'); c2.appendChild(U.listaBarras(sens, cs.length)); raiz.appendChild(c2); }

    var fam = U.contar(cs.map(function (c) { return c.chosenFamily; }).filter(Boolean));
    if (fam.length) { var c3 = U.cartao('Famílias de emoção escolhidas'); c3.appendChild(U.listaBarras(fam, cs.length)); raiz.appendChild(c3); }

    var inten = U.contar(cs.map(function (c) { return c.intensityLabel; }).filter(Boolean));
    if (inten.length) { var c4 = U.cartao('Intensidade'); c4.appendChild(U.listaBarras(inten, cs.length)); raiz.appendChild(c4); }

    var modo = U.contar(cs.map(function (c) { return c.entryMode; }).filter(Boolean));
    if (modo.length) { var c5 = U.cartao('Como começou o check-in'); c5.appendChild(U.listaBarras(modo, cs.length)); raiz.appendChild(c5); }

    var c6 = U.cartao('Contexto e planos', 'Registros mais recentes primeiro');
    if (!opts.textos) {
      c6.appendChild(h('p', { class: 'fp-vazio', texto: 'Os textos (contexto, planos e vocabulário) não foram compartilhados.' }));
    } else {
      var lista = h('div', { class: 'fp-tempo' });
      cs.slice().reverse().slice(0, 15).forEach(function (c) {
        var ctx = c.context || {};
        var item = h('div', { class: 'fp-item' },
          h('div', { class: 'fp-item-topo' },
            h('span', { class: 'fp-data', texto: U.rotuloData(c.date) }),
            c.chosenFamily ? h('span', { class: 'fp-tag', texto: c.chosenFamily }) : null,
            c.sensationLabel ? h('span', { class: 'fp-depois', texto: c.sensationLabel }) : null));
        var linhas = [ctx.situation, ctx.note].filter(function (x) { return typeof x === 'string' && x; });
        if (linhas.length) item.appendChild(h('p', { class: 'fp-texto', texto: linhas.join(' · ') }));
        if (c.ifThenPlan) item.appendChild(h('p', { class: 'fp-texto', texto: 'Plano: ' + c.ifThenPlan }));
        lista.appendChild(item);
      });
      c6.appendChild(lista);
      var vocab = estado.vocab && typeof estado.vocab === 'object' ? Object.keys(estado.vocab) : [];
      if (vocab.length) {
        var cv = U.cartao('Vocabulário pessoal', 'Palavra que a pessoa associa a cada emoção');
        vocab.forEach(function (k) { cv.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: k }), h('strong', { texto: String(estado.vocab[k]) }))); });
        raiz.appendChild(c6); raiz.appendChild(cv); return raiz;
      }
    }
    raiz.appendChild(c6);
    return raiz;
  }

  global.MatizPainel = { render: render };
})(window);
