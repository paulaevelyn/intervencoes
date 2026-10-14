/* sintonia-painel.js — leitura dos registros da Sintonia (treino de atenção auditiva) para a profissional.
   SintoniaPainel.render(estado, { textos }) -> HTMLElement
   `estado` = { sessoes: [ { date, iso, modo?, tipo?, fase?, planejado, feito, completa, antes:{w,s,c}, depois:{w,s,c},
                              acertos?, chamadas?, rt?, longest?, voltas?, mente?:{antes,depois}, tem_nota, nota? } ],
                semanal: [ { key, ts, items:[1..5], nota? } ] }
   (a projeção de painel_dados). Só números por padrão; `nota` (texto livre) só chega com a permissão da pessoa.
   Sessões com tipo 'toques' são o treino com toques (tarefa de detecção); as demais são a ATT clássica.
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
  var FASES = { 1: 'Foco seletivo', 2: 'Alternância', 3: 'Atenção dividida' };
  function numero(x) { return typeof x === 'number'; }
  function min(sec) { return String(Math.round((sec || 0) / 60 * 10) / 10).replace('.', ','); }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
  function perc(s) { return numero(s.acertos) && numero(s.chamadas) && s.chamadas > 0 ? s.acertos / s.chamadas * 100 : null; }
  function dmy(key) { var p = String(key).split('-'); return p[2] + '/' + p[1]; }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    estado = estado || {};
    var ss = (estado.sessoes || []).filter(function (s) { return s && s.date; })
      .sort(function (a, b) { return a.date === b.date ? ((a.iso || '') < (b.iso || '') ? -1 : 1) : (a.date < b.date ? -1 : 1); });
    var wk = (estado.semanal || []).filter(function (e) { return e && e.key && Array.isArray(e.items) && e.items.length; })
      .sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    if (!ss.length && !wk.length) {
      var v = U.cartao('Registros'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há sessões registradas.' }));
      raiz.appendChild(v); return raiz;
    }

    if (ss.length) {
      var cls = ss.filter(function (s) { return s.tipo !== 'toques'; });
      var tq = ss.filter(function (s) { return s.tipo === 'toques'; });

      // ── Resumo ────────────────────────────────────────────────────
      var dias = {}; ss.forEach(function (s) { dias[s.date] = 1; });
      var totalSeg = ss.reduce(function (a, s) { return a + (s.feito || 0); }, 0);
      raiz.appendChild(h('div', { class: 'fp-resumo' },
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(ss.length) }), h('span', { texto: 'sessões' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(dias).length) }), h('span', { texto: 'dias com prática' })),
        h('div', { class: 'fp-stat' }, h('strong', { texto: String(Math.round(totalSeg / 60)) }), h('span', { texto: 'minutos treinados' }))));

      var c1 = U.cartao('Sessões por semana', 'Últimas 8 semanas');
      c1.appendChild(U.graficoSemanas(ss)); raiz.appendChild(c1);

      var inc = ss.filter(function (s) { return s.completa === false; }).length;
      var c2 = U.cartao('Como foram as sessões', 'Completa = a pessoa chegou ao fim do exercício');
      c2.appendChild(h('p', { class: 'fp-texto', texto: (ss.length - inc) + ' de ' + ss.length + ' sessões completas' + (inc ? '; ' + inc + ' encerrada' + (inc === 1 ? '' : 's') + ' antes do fim.' : '.') }));
      c2.appendChild(h('p', { class: 'fp-dica', texto: cls.length + ' de ATT clássica · ' + tq.length + ' com toques' }));
      raiz.appendChild(c2);

      // ── ATT clássica: antes e depois (notas de 0 a 10) ─────────────
      if (cls.length) {
        var c3 = U.cartao('ATT clássica: antes e depois', 'Notas de 0 a 10 dadas pela própria pessoa; sempre opcionais. Mudanças pequenas ou nenhuma são esperadas.');
        var algum = false;
        METRICAS.forEach(function (m) {
          var pares = cls.filter(function (s) { return s.antes && s.depois && numero(s.antes[m.k]) && numero(s.depois[m.k]); });
          if (!pares.length) return;
          algum = true;
          var ma = U.media(pares.map(function (s) { return s.antes[m.k]; })), md = U.media(pares.map(function (s) { return s.depois[m.k]; }));
          c3.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: m.nome }),
            h('strong', { texto: ma.toFixed(1) + ' → ' + md.toFixed(1) + ' (' + pares.length + ' sessões)' })));
        });
        if (!algum) c3.appendChild(h('p', { class: 'fp-vazio', texto: 'Nenhuma sessão com as notas de antes e depois.' }));
        raiz.appendChild(c3);
      }

      // ── Com toques: tarefa de detecção por fase ────────────────────
      if (tq.length) {
        var c4 = U.cartao('Treino com toques', 'Chamadas percebidas = chamadas duplas de som que a pessoa percebeu tocando na fonte (até cerca de 3 s). Não é instrumento diagnóstico.');
        [1, 2, 3].forEach(function (f) {
          var x = tq.filter(function (s) { return s.fase === f && perc(s) !== null; }); if (!x.length) return;
          var rts = x.filter(function (s) { return numero(s.rt); }).map(function (s) { return s.rt; });
          var lg = x.filter(function (s) { return numero(s.longest); }).map(function (s) { return s.longest; });
          var vl = x.filter(function (s) { return numero(s.voltas); }).map(function (s) { return s.voltas; });
          var partes = ['chamadas percebidas ' + Math.round(U.media(x.map(perc))) + '%'];
          if (rts.length) partes.push('resposta ' + f1(U.media(rts)) + ' s');
          if (lg.length) partes.push('foco contínuo médio ' + Math.round(U.media(lg)) + ' s');
          if (vl.length) partes.push('voltas ao foco ' + f1(U.media(vl)) + ' por bloco');
          c4.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: FASES[f] }), h('span', { class: 'fp-tag', texto: x.length + (x.length === 1 ? ' bloco' : ' blocos') })),
            h('p', { class: 'fp-texto', texto: partes.join(' · ') })));
        });
        var mente = tq.filter(function (s) { return s.mente && numero(s.mente.antes) && numero(s.mente.depois); });
        if (mente.length) {
          c4.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Agitação da mente (1 calma, 5 agitada)' }),
            h('strong', { texto: f1(U.media(mente.map(function (s) { return s.mente.antes; }))) + ' → ' + f1(U.media(mente.map(function (s) { return s.mente.depois; }))) + ' (' + mente.length + ' blocos)' })));
        }
        raiz.appendChild(c4);
      }

      // ── Sessões recentes ──────────────────────────────────────────
      var c5 = U.cartao('Sessões recentes', 'Mais recentes primeiro');
      ss.slice().reverse().slice(0, 12).forEach(function (s) {
        var ehTq = s.tipo === 'toques';
        var topo = h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(s.date) }),
          h('span', { class: 'fp-tag', texto: (ehTq ? (FASES[s.fase] || 'Com toques') : 'ATT clássica') + ' · ' + (s.completa === false ? 'encerrada' : 'completa') + ' · ' + min(s.feito) + ' de ' + min(s.planejado) + ' min' }));
        var it = h('div', { class: 'fp-item' }, topo);
        if (ehTq) {
          var p = perc(s);
          it.appendChild(h('p', { class: 'fp-texto', texto: (p === null ? 'sem chamadas' : s.acertos + ' de ' + s.chamadas + ' chamadas percebidas (' + Math.round(p) + '%)') + (numero(s.rt) ? ' · resposta ' + f1(s.rt) + ' s' : '') + (s.mente && numero(s.mente.antes) && numero(s.mente.depois) ? ' · mente ' + s.mente.antes + ' → ' + s.mente.depois : '') }));
        } else {
          METRICAS.forEach(function (m) {
            var a = s.antes && numero(s.antes[m.k]) ? s.antes[m.k] : null, d = s.depois && numero(s.depois[m.k]) ? s.depois[m.k] : null;
            if (a === null && d === null) return;
            it.appendChild(h('p', { class: 'fp-texto', texto: m.nome + ': ' + (a === null ? 'sem nota' : a) + ' → ' + (d === null ? 'sem nota' : d) }));
          });
        }
        if (opts.textos && s.nota) it.appendChild(h('p', { class: 'fp-texto', texto: '“' + s.nota + '”' }));
        c5.appendChild(it);
      });
      if (!opts.textos && ss.some(function (s) { return s.tem_nota; })) c5.appendChild(h('p', { class: 'fp-vazio', texto: 'As observações escritas não foram compartilhadas.' }));
      raiz.appendChild(c5);
    }

    // ── Reflexão semanal sobre o dia a dia ─────────────────────────
    if (wk.length) {
      var c6 = U.cartao('No dia a dia (reflexão semanal)', 'Escala de 1 (quase nunca) a 5 (quase sempre): percebi a distração, voltei ao que fazia, comecei com menos esforço, menos sobrecarga. Mostra a experiência da pessoa, não prova que o treino causou a mudança.');
      wk.slice(-8).reverse().forEach(function (e) {
        var nums = e.items.filter(numero);
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: 'Semana de ' + dmy(e.key) }),
          h('span', { class: 'fp-tag', texto: 'média ' + (nums.length ? f1(U.media(nums)) : '–') })),
          h('p', { class: 'fp-texto', texto: nums.join(' · ') }));
        if (opts.textos && e.nota) it.appendChild(h('p', { class: 'fp-texto', texto: '“' + e.nota + '”' }));
        c6.appendChild(it);
      });
      if (!opts.textos) c6.appendChild(h('p', { class: 'fp-vazio', texto: 'As situações escritas não foram compartilhadas.' }));
      raiz.appendChild(c6);
    }
    return raiz;
  }

  global.SintoniaPainel = { render: render };
})(window);
