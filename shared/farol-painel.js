/* farol-painel.js — leitura dos registros de preocupação do Farol.
   Usado pelo app (o paciente vê os próprios dados) e pelo painel (a profissional
   vê os dados que o paciente liberou). Recebe o estado do Farol, ou a projeção
   entregue por painel_dados(), que tem os mesmos nomes de campo.

   FarolPainel.render(estado, { textos: true|false }) -> HTMLElement

   Segurança: todo texto vindo do paciente entra por textContent, nunca por
   innerHTML. Isto importa no painel, onde o texto é de outra pessoa. */
(function (global) {
  'use strict';

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var TIPOS = { c: 'Posso agir agora', n: 'Não depende de mim', u: 'Sem tipo' };
  var NS = 'http://www.w3.org/2000/svg';

  function h(tag, props) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === 'class') e.className = props[k];
      else if (k === 'texto') e.textContent = props[k];
      else e.setAttribute(k, props[k]);
    });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) e.appendChild(arguments[i]);
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function segunda(dataStr) {            // 'YYYY-MM-DD' -> segunda-feira da semana
    var d = new Date(dataStr + 'T12:00:00');
    var dif = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dif);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function rotuloSemana(dataStr) {
    var d = new Date(dataStr + 'T12:00:00');
    return d.getDate() + ' ' + MESES[d.getMonth()];
  }
  function rotuloData(dataStr) {
    var d = new Date(dataStr + 'T12:00:00');
    return d.getDate() + ' ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
  }
  function contar(lista) {
    var c = {};
    lista.forEach(function (x) { c[x] = (c[x] || 0) + 1; });
    return Object.keys(c).map(function (k) { return [k, c[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
  }
  function media(nums) {
    return nums.length ? nums.reduce(function (a, b) { return a + b; }, 0) / nums.length : null;
  }

  function cartao(titulo, dica) {
    var c = h('div', { class: 'fp-card' }, h('div', { class: 'fp-lbl', texto: titulo }));
    if (dica) c.appendChild(h('div', { class: 'fp-dica', texto: dica }));
    return c;
  }

  // Barras: registros por semana (últimas 8)
  function graficoSemanas(entries) {
    var hoje = new Date();
    var hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    var atual = segunda(hojeStr);
    var semanas = [];
    for (var i = 7; i >= 0; i--) {
      var d = new Date(atual + 'T12:00:00'); d.setDate(d.getDate() - 7 * i);
      semanas.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    }
    var porSemana = {};
    entries.forEach(function (e) { var s = segunda(e.date); porSemana[s] = (porSemana[s] || 0) + 1; });
    var max = Math.max(1, Math.max.apply(null, semanas.map(function (s) { return porSemana[s] || 0; })));
    var W = 320, H = 110, base = 86, larg = 28, passo = 38;
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'fp-svg', role: 'img', 'aria-label': 'Registros por semana' });
    semanas.forEach(function (sem, i) {
      var n = porSemana[sem] || 0, alt = Math.round((n / max) * 64), x = 8 + i * passo;
      s.appendChild(svg('rect', { x: x, y: base - alt, width: larg, height: Math.max(alt, n ? 3 : 1), rx: 4, class: n ? 'fp-barra' : 'fp-barra-vazia' }));
      if (n) { var t = svg('text', { x: x + larg / 2, y: base - alt - 5, 'text-anchor': 'middle', class: 'fp-num' }); t.textContent = n; s.appendChild(t); }
      var r = svg('text', { x: x + larg / 2, y: base + 14, 'text-anchor': 'middle', class: 'fp-eixo' }); r.textContent = rotuloSemana(sem); s.appendChild(r);
    });
    return s;
  }

  // Média semanal de "como ficou depois" (1 = muito melhor, 5 = igual ou pior)
  function graficoDepois(entries) {
    var porSemana = {};
    entries.forEach(function (e) { if (typeof e.after === 'number') { var s = segunda(e.date); (porSemana[s] = porSemana[s] || []).push(e.after); } });
    var chaves = Object.keys(porSemana).sort().slice(-8);
    if (chaves.length < 2) return null;
    var W = 320, H = 100, pad = 20, pts = chaves.map(function (k, i) {
      var m = media(porSemana[k]);
      return { x: pad + i * ((W - 2 * pad) / (chaves.length - 1)), y: 12 + ((m - 1) / 4) * 56, m: m, k: k };
    });
    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'fp-svg', role: 'img', 'aria-label': 'Como ficou depois, média semanal' });
    s.appendChild(svg('polyline', { points: pts.map(function (p) { return p.x + ',' + p.y; }).join(' '), class: 'fp-linha', fill: 'none' }));
    pts.forEach(function (p) {
      s.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 4, class: 'fp-ponto' }));
      var r = svg('text', { x: p.x, y: 90, 'text-anchor': 'middle', class: 'fp-eixo' }); r.textContent = rotuloSemana(p.k); s.appendChild(r);
    });
    return s;
  }

  function listaBarras(pares, total) {
    var ul = h('div', { class: 'fp-barras' });
    pares.slice(0, 6).forEach(function (p) {
      var pct = Math.round((p[1] / total) * 100);
      var fill = h('div', { class: 'fp-preenche' }); fill.style.width = pct + '%';
      ul.appendChild(h('div', { class: 'fp-linha-b' },
        h('span', { class: 'fp-nome', texto: p[0] }),
        h('span', { class: 'fp-trilho' }, fill),
        h('span', { class: 'fp-val', texto: p[1] })));
    });
    return ul;
  }

  function escala(nome, d) {
    if (!d || !d.gad7) return null;
    return h('div', { class: 'fp-escala' },
      h('span', { class: 'fp-nome', texto: nome }),
      h('strong', { texto: 'GAD-7: ' + d.gad7.score + (d.gad7.level ? ' · ' + d.gad7.level : '') }));
  }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    var entries = ((estado && estado.entries) || []).filter(function (e) { return e && e.date; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });

    // Escalas
    var esc = [escala('Pré-teste', estado && estado.pretest), escala('Pós-teste', estado && estado.posttest)].filter(Boolean);
    if (esc.length) { var ce = cartao('Escalas'); esc.forEach(function (x) { ce.appendChild(x); }); raiz.appendChild(ce); }

    if (!entries.length) {
      var vazio = cartao('Registros de preocupação');
      vazio.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há registros no diário.' }));
      raiz.appendChild(vazio);
      return raiz;
    }

    // Resumo
    var semanaAtras = Date.now() - 7 * 864e5;
    var ult7 = entries.filter(function (e) { return e.ts >= semanaAtras; }).length;
    var mAfter = media(entries.map(function (e) { return e.after; }).filter(function (x) { return typeof x === 'number'; }));
    var res = h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(entries.length) }), h('span', { texto: 'registros' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(ult7) }), h('span', { texto: 'nos últimos 7 dias' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: mAfter === null ? '—' : mAfter.toFixed(1) }), h('span', { texto: 'depois (1 melhor · 5 igual)' })));
    raiz.appendChild(res);

    var c1 = cartao('Registros por semana', 'Últimas 8 semanas');
    c1.appendChild(graficoSemanas(entries)); raiz.appendChild(c1);

    var g2 = graficoDepois(entries);
    if (g2) { var c2 = cartao('Como ficou depois', 'Média por semana. Quanto menor, mais alívio.'); c2.appendChild(g2); raiz.appendChild(c2); }

    var tipos = contar(entries.map(function (e) { return TIPOS[e.type] || TIPOS.u; }));
    var c3 = cartao('Tipo de preocupação'); c3.appendChild(listaBarras(tipos, entries.length)); raiz.appendChild(c3);

    var corpo = contar([].concat.apply([], entries.map(function (e) { return e.bodyReactions || []; })));
    if (corpo.length) { var c4 = cartao('Reações no corpo'); c4.appendChild(listaBarras(corpo, entries.length)); raiz.appendChild(c4); }

    var estr = contar([].concat.apply([], entries.map(function (e) { return e.strategies || []; })));
    if (estr.length) { var c5 = cartao('O que a pessoa tentou'); c5.appendChild(listaBarras(estr, entries.length)); raiz.appendChild(c5); }

    // Qualitativo
    var c6 = cartao('O que preocupou', 'Registros mais recentes primeiro');
    if (!opts.textos) {
      c6.appendChild(h('p', { class: 'fp-vazio', texto: 'Os textos das preocupações não foram compartilhados.' }));
    } else {
      var recentes = entries.slice().reverse();
      var lista = h('div', { class: 'fp-tempo' });
      var mostrar = function (n) {
        lista.textContent = '';
        recentes.slice(0, n).forEach(function (e) {
          lista.appendChild(h('div', { class: 'fp-item' },
            h('div', { class: 'fp-item-topo' },
              h('span', { class: 'fp-data', texto: rotuloData(e.date) }),
              h('span', { class: 'fp-tag fp-tag-' + (e.type || 'u'), texto: TIPOS[e.type] || TIPOS.u }),
              typeof e.after === 'number' ? h('span', { class: 'fp-depois', texto: 'depois: ' + e.after }) : null),
            h('p', { class: 'fp-texto', texto: e.worry || '(sem texto)' })));
        });
      };
      mostrar(10);
      c6.appendChild(lista);
      if (recentes.length > 10) {
        var btn = h('button', { class: 'fp-mais', type: 'button', texto: 'Mostrar todos (' + recentes.length + ')' });
        var aberto = false;
        btn.addEventListener('click', function () { aberto = !aberto; mostrar(aberto ? recentes.length : 10); btn.textContent = aberto ? 'Mostrar menos' : 'Mostrar todos (' + recentes.length + ')'; });
        c6.appendChild(btn);
      }
    }
    raiz.appendChild(c6);
    return raiz;
  }

  global.FarolPainel = { render: render };
})(window);
