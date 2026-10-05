/* floresca-painel.js — leitura dos registros do Floresça (momentos positivos,
   emoções, saboreio e Laboratório de experimentos). Mesmo uso do FarolPainel:
   o paciente vê no app, a profissional vê no painel o que foi liberado.

   FlorescaPainel.render(estado, { textos: true|false }) -> HTMLElement
   Depende de farol-painel.js (carregue-o antes). Todo texto entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[FlorescaPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;

  function escalaSpane(nome, d) {
    if (!d || !d.spane) return null;
    var s = d.spane;
    return h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: nome }),
      h('strong', { texto: 'SPANE-B: ' + s.b + ' (positivo ' + s.p + ' · negativo ' + s.n + ')' }));
  }
  function escalaCrencas(nome, d) {
    if (!d || !d.beliefs || typeof d.beliefs.score === 'undefined') return null;
    return h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: nome }),
      h('strong', { texto: 'Crenças sobre emoções positivas: ' + d.beliefs.score }));
  }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    var entries = ((estado && estado.entries) || []).filter(function (e) { return e && e.date; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    var exps = ((estado && estado.experiments) || []).filter(function (x) { return x && x.status === 'done' && typeof x.actual === 'number' && typeof x.predicted === 'number'; });

    var esc = [escalaSpane('Pré-teste', estado && estado.pretest), escalaCrencas('Pré-teste', estado && estado.pretest),
               escalaSpane('Pós-teste', estado && estado.posttest), escalaCrencas('Pós-teste', estado && estado.posttest)].filter(Boolean);
    if (esc.length) { var ce = U.cartao('Escalas'); esc.forEach(function (x) { ce.appendChild(x); }); raiz.appendChild(ce); }

    if (!entries.length && !exps.length) {
      var v = U.cartao('Registros'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há momentos nem experimentos registrados.' }));
      raiz.appendChild(v); return raiz;
    }

    if (entries.length) {
      var ult7 = entries.filter(function (e) { return e.ts >= Date.now() - 7 * 864e5; }).length;
      var mInt = U.media(entries.map(function (e) { return e.intensity; }).filter(function (x) { return typeof x === 'number'; }));
      raiz.appendChild(h('div', { class: 'fp-resumo' },
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(entries.length) }), h('span', { texto: 'momentos registrados' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(ult7) }), h('span', { texto: 'nos últimos 7 dias' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: mInt === null ? '—' : mInt.toFixed(1) }), h('span', { texto: 'intensidade média (1–5)' }))));

      var c1 = U.cartao('Momentos por semana', 'Últimas 8 semanas'); c1.appendChild(U.graficoSemanas(entries)); raiz.appendChild(c1);
      var g = U.graficoMedia(entries, 'intensity', 'Intensidade média por semana');
      if (g) { var c2 = U.cartao('Intensidade dos momentos', 'Média por semana. Quanto mais alto, mais intenso.'); c2.appendChild(g); raiz.appendChild(c2); }

      var emo = U.contar([].concat.apply([], entries.map(function (e) { return e.emotions || []; })));
      if (emo.length) { var c3 = U.cartao('Emoções positivas mais frequentes'); c3.appendChild(U.listaBarras(emo, entries.length)); raiz.appendChild(c3); }
      var sav = U.contar([].concat.apply([], entries.map(function (e) { return e.savoring || []; })));
      if (sav.length) { var c4 = U.cartao('Como a pessoa saboreou'); c4.appendChild(U.listaBarras(sav, entries.length)); raiz.appendChild(c4); }
    }

    // Laboratório: previsão x vivência
    if (exps.length) {
      var acima = exps.filter(function (x) { return x.actual > x.predicted; }).length;
      var igual = exps.filter(function (x) { return x.actual === x.predicted; }).length;
      var c5 = U.cartao('Laboratório de experimentos', 'Previsão antes, vivência depois (1–5)');
      c5.appendChild(h('p', { class: 'fp-texto', texto: 'Em ' + acima + ' de ' + exps.length + ' experimentos a vivência superou a previsão' + (igual ? ' (e em ' + igual + ' foi igual).' : '.') }));
      var lista = h('div', { class: 'fp-tempo' });
      exps.slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 10).forEach(function (x) {
        var it = h('div', { class: 'fp-item' },
          h('div', { class: 'fp-item-topo' },
            h('span', { class: 'fp-data', texto: U.rotuloData(x.date) }),
            h('span', { class: 'fp-tag', texto: 'previu ' + x.predicted + ' → viveu ' + x.actual })));
        if (opts.textos) {
          if (x.predictNote) it.appendChild(h('p', { class: 'fp-texto', texto: 'Previsão: ' + x.predictNote }));
          if (x.noticed) it.appendChild(h('p', { class: 'fp-texto', texto: 'Notou: ' + x.noticed }));
        }
        lista.appendChild(it);
      });
      c5.appendChild(lista);
      raiz.appendChild(c5);
    }

    // Qualitativo: os momentos escritos
    if (entries.length) {
      var c6 = U.cartao('Momentos positivos', 'Registros mais recentes primeiro');
      if (!opts.textos) {
        c6.appendChild(h('p', { class: 'fp-vazio', texto: 'Os textos dos momentos não foram compartilhados.' }));
      } else {
        var rec = entries.slice().reverse(), lt = h('div', { class: 'fp-tempo' });
        var mostrar = function (n) {
          lt.textContent = '';
          rec.slice(0, n).forEach(function (e) {
            lt.appendChild(h('div', { class: 'fp-item' },
              h('div', { class: 'fp-item-topo' },
                h('span', { class: 'fp-data', texto: U.rotuloData(e.date) }),
                (e.emotions && e.emotions.length) ? h('span', { class: 'fp-tag', texto: e.emotions.join(', ') }) : null,
                typeof e.intensity === 'number' ? h('span', { class: 'fp-depois', texto: 'intensidade: ' + e.intensity }) : null),
              h('p', { class: 'fp-texto', texto: e.moment || '(sem texto)' })));
          });
        };
        mostrar(10); c6.appendChild(lt);
        if (rec.length > 10) {
          var b = h('button', { class: 'fp-mais', type: 'button', texto: 'Mostrar todos (' + rec.length + ')' }), aberto = false;
          b.addEventListener('click', function () { aberto = !aberto; mostrar(aberto ? rec.length : 10); b.textContent = aberto ? 'Mostrar menos' : 'Mostrar todos (' + rec.length + ')'; });
          c6.appendChild(b);
        }
      }
      raiz.appendChild(c6);
    }
    return raiz;
  }

  global.FlorescaPainel = { render: render };
})(window);
