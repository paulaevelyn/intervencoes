/* sintonia-painel.js — leitura dos registros da Sintonia (treino de atenção auditiva) para a profissional.
   SintoniaPainel.render(estado, { textos }) -> HTMLElement
   `estado` = { sessoes: [ { date, iso, modo, planejado, feito, completa, antes:{w,s,c}, depois:{w,s,c}, nota? } ] }
   (a projeção de painel_dados). Só números por padrão; `nota` (texto livre) só chega com a permissão da pessoa.
   Depende de farol-painel.js. Todo texto vindo do paciente entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[SintoniaPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;

  var METRICAS = [
    { k: 'w', nome: 'Preocupação ou ruminação' },
    { k: 's', nome: 'Atenção presa em mim' },
    { k: 'c', nome: 'Controle sobre a atenção' }
  ];
  function numero(x) { return typeof x === 'number'; }
  function min(sec) { return String(Math.round((sec || 0) / 60 * 10) / 10).replace('.', ','); }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    var ss = ((estado || {}).sessoes || []).filter(function (s) { return s && s.date; })
      .sort(function (a, b) { return a.date === b.date ? ((a.iso || '') < (b.iso || '') ? -1 : 1) : (a.date < b.date ? -1 : 1); });
    if (!ss.length) {
      var v = U.cartao('Registros'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há sessões registradas.' }));
      raiz.appendChild(v); return raiz;
    }

    // ── Resumo ──────────────────────────────────────────────────────
    var dias = {}; ss.forEach(function (s) { dias[s.date] = 1; });
    var totalSeg = ss.reduce(function (a, s) { return a + (s.feito || 0); }, 0);
    raiz.appendChild(h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(ss.length) }), h('span', { texto: 'sessões' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(dias).length) }), h('span', { texto: 'dias com prática' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(Math.round(totalSeg / 60)) }), h('span', { texto: 'minutos treinados' }))));

    var c1 = U.cartao('Sessões por semana', 'Últimas 8 semanas');
    c1.appendChild(U.graficoSemanas(ss)); raiz.appendChild(c1);

    var inc = ss.filter(function (s) { return !s.completa; }).length;
    var c2 = U.cartao('Como foram as sessões', 'Completa = a pessoa chegou ao fim do exercício');
    c2.appendChild(h('p', { class: 'fp-texto', texto: (ss.length - inc) + ' de ' + ss.length + ' sessões completas' + (inc ? '; ' + inc + ' encerrada' + (inc === 1 ? '' : 's') + ' antes do fim.' : '.') }));
    raiz.appendChild(c2);

    // ── Antes e depois (médias, só das sessões em que a pessoa deu as duas notas) ──
    var c3 = U.cartao('Antes e depois da sessão', 'Notas de 0 a 10 dadas pela própria pessoa; sempre opcionais. Mudanças pequenas ou nenhuma são esperadas.');
    var algum = false;
    METRICAS.forEach(function (m) {
      var pares = ss.filter(function (s) { return s.antes && s.depois && numero(s.antes[m.k]) && numero(s.depois[m.k]); });
      if (!pares.length) return;
      algum = true;
      var ma = U.media(pares.map(function (s) { return s.antes[m.k]; })), md = U.media(pares.map(function (s) { return s.depois[m.k]; }));
      c3.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: m.nome }),
        h('strong', { texto: ma.toFixed(1) + ' → ' + md.toFixed(1) + ' (' + pares.length + ' sessões)' })));
    });
    if (!algum) c3.appendChild(h('p', { class: 'fp-vazio', texto: 'Nenhuma sessão com as notas de antes e depois.' }));
    raiz.appendChild(c3);

    // ── Sessões recentes ────────────────────────────────────────────
    var c4 = U.cartao('Sessões recentes', 'Mais recentes primeiro');
    ss.slice().reverse().slice(0, 12).forEach(function (s) {
      var topo = h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(s.date) }),
        h('span', { class: 'fp-tag', texto: (s.completa ? 'completa' : 'encerrada') + ' · ' + min(s.feito) + ' de ' + min(s.planejado) + ' min' }));
      var it = h('div', { class: 'fp-item' }, topo);
      METRICAS.forEach(function (m) {
        var a = s.antes && numero(s.antes[m.k]) ? s.antes[m.k] : null, d = s.depois && numero(s.depois[m.k]) ? s.depois[m.k] : null;
        if (a === null && d === null) return;
        it.appendChild(h('p', { class: 'fp-texto', texto: m.nome + ': ' + (a === null ? 'sem nota' : a) + ' → ' + (d === null ? 'sem nota' : d) }));
      });
      if (opts.textos && s.nota) it.appendChild(h('p', { class: 'fp-texto', texto: '“' + s.nota + '”' }));
      c4.appendChild(it);
    });
    if (!opts.textos && ss.some(function (s) { return s.tem_nota; })) c4.appendChild(h('p', { class: 'fp-vazio', texto: 'As observações escritas não foram compartilhadas.' }));
    raiz.appendChild(c4);
    return raiz;
  }

  global.SintoniaPainel = { render: render };
})(window);
