/* matiz-progresso.js — o mapa pessoal do Matiz: contagens e marcas do caminho, sem níveis, sem pontos à vista e sem ranking.

   Tudo é CALCULADO a partir dos registros que o app já guarda (check-ins, planos,
   vocabulário, dose semanal, escala). Não há contador gravado: o progresso nunca fica
   fora de sincronia entre aparelhos e não muda a lógica interna do app.

   MatizProgresso.calcular(estado) -> { xp, nivel, pct, faltam, medalhas[] }
   MatizProgresso.estadoLocal()    -> estado lido do localStorage
   MatizProgresso.render(estado)   -> HTMLElement (cartão completo)
   MatizProgresso.resumo(el)       -> escreve o resumo curto do mapa em `el`
   Todo texto entra por textContent. */
(function (global) {
  'use strict';

  var NIVEIS = [
    { n: 1, nome: 'Curiosidade',    emoji: '🌱', min: 0,   max: 60 },
    { n: 2, nome: 'Exploração', emoji: '🔍', min: 60,  max: 150 },
    { n: 3, nome: 'Praticante',   emoji: '🌿', min: 150, max: 280 },
    { n: 4, nome: 'Olhar atento', emoji: '⭐', min: 280, max: 450 },
    { n: 5, nome: 'Companhia de si', emoji: '💚', min: 450, max: 99999 }
  ];

  var XP = { checkin: 10, familia: 3, plano: 5, palavra: 4, dose: 5, escala: 15 };

  function ler(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function estadoLocal() {
    var dose = ler('matiz_dose_v1') || {};
    return { checkins: ler('matiz_bodymap_v1') || [], doseRecords: dose.records || [], vocab: ler('matiz_vocab_v1') || {}, escalas: ler('matiz_escalas_v1') };
  }

  function segunda(ts) {
    var d = new Date(ts), dif = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dif);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function calcular(estado) {
    estado = estado || {};
    var cs = (estado.checkins || []).filter(function (c) { return c && c.ts; });
    var doses = estado.doseRecords || [];
    var vocab = estado.vocab && typeof estado.vocab === 'object' ? Object.keys(estado.vocab).filter(function (k) { return estado.vocab[k]; }).length : 0;
    var esc = estado.escalas || {};
    var temPre = !!(esc.pre && esc.pre.tas20 && typeof esc.pre.tas20.total === 'number');
    var temPos = !!(esc.pos && esc.pos.tas20 && typeof esc.pos.tas20.total === 'number');
    var comFamilia = cs.filter(function (c) { return c.chosenFamily; }).length;
    var comPlano = cs.filter(function (c) { return c.ifThenPlan; }).length;
    var semanas = {}; cs.forEach(function (c) { semanas[segunda(c.ts)] = 1; });

    var xp = cs.length * XP.checkin + comFamilia * XP.familia + comPlano * XP.plano + vocab * XP.palavra +
             doses.length * XP.dose + (temPre ? XP.escala : 0) + (temPos ? XP.escala : 0);

    var niv = NIVEIS.slice().reverse().find(function (l) { return xp >= l.min; }) || NIVEIS[0];
    var pct = niv.n === 5 ? 100 : Math.min(100, Math.round((xp - niv.min) / (niv.max - niv.min) * 100));

    var medalhas = [
      { id: 'ci1',   emoji: '🫀', nome: 'Primeiro check-in',  desc: 'Fez o primeiro check-in',               ganha: cs.length >= 1 },
      { id: 'ci10',  emoji: '🗺️', nome: 'Mapa em construção', desc: '10 check-ins registrados',              ganha: cs.length >= 10 },
      { id: 'fam5',  emoji: '🎨', nome: 'Nomeando tons',      desc: 'Nomeou a família da emoção 5 vezes',    ganha: comFamilia >= 5 },
      { id: 'plano3',emoji: '🧭', nome: 'Com um plano',       desc: '3 planos “quando… então…”',             ganha: comPlano >= 3 },
      { id: 'voc3',  emoji: '📖', nome: 'Vocabulário próprio', desc: '3 palavras suas na Biblioteca',        ganha: vocab >= 3 },
      { id: 'sem4',  emoji: '📅', nome: 'Constância',         desc: 'Check-ins em 4 semanas diferentes',     ganha: Object.keys(semanas).length >= 4 },
      { id: 'dose3', emoji: '⚓', nome: 'Prática semanal',    desc: '3 semanas com prática registrada',      ganha: doses.length >= 3 },
      { id: 'esc',   emoji: '📋', nome: 'Olhar para si',      desc: 'Respondeu ao questionário',             ganha: temPre },
      { id: 'xp300', emoji: '⭐', nome: 'Presença no caminho', desc: 'Seguiu em frente ao longo do caminho', ganha: xp >= 300 }
    ];

    return { xp: xp, nivel: niv, pct: pct, faltam: niv.n < 5 ? niv.max - xp : 0, medalhas: medalhas };
  }

  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  function render(estado) {
    var r = calcular(estado), e = estado || {}, raiz = h('div', 'mp');
    var cs = (e.checkins || []).filter(function (c) { return c && c.ts; });
    var vocab = e.vocab && typeof e.vocab === 'object' ? Object.keys(e.vocab).filter(function (k) { return e.vocab[k]; }).length : 0;
    var topo = h('div', 'mp-topo');
    topo.appendChild(h('span', 'mp-nivel', 'Seu mapa'));
    raiz.appendChild(topo);
    raiz.appendChild(h('p', 'mp-prox', cs.length + ' ' + (cs.length === 1 ? 'check-in' : 'check-ins') + ' e ' + vocab + ' ' + (vocab === 1 ? 'palavra sua' : 'palavras suas') + ' até aqui. No seu ritmo, sem meta.'));
    var prat = h('div', 'mp-medalhas');
    r.medalhas.filter(function (m) { return m.ganha; }).forEach(function (m) {
      var it = h('div', 'mp-med on');
      it.title = m.desc;
      it.appendChild(h('span', 'mp-emoji', m.emoji));
      it.appendChild(h('span', 'mp-nome', m.nome));
      prat.appendChild(it);
    });
    if (prat.children.length) raiz.appendChild(prat);
    raiz.appendChild(h('p', 'mp-nota', 'Estas marcas só mostram o quanto você usou o Matiz. Elas não dizem nada sobre o quanto você sente ou acerta, e não há ranking nem comparação.'));
    return raiz;
  }

  function resumo(el) {
    if (!el) return;
    var e = estadoLocal(), n = (e.checkins || []).filter(function (c) { return c && c.ts; }).length;
    el.textContent = 'Seu mapa: ' + n + ' ' + (n === 1 ? 'check-in' : 'check-ins') + '.';
  }

  global.MatizProgresso = { calcular: calcular, estadoLocal: estadoLocal, render: render, resumo: resumo, NIVEIS: NIVEIS, XP: XP };
})(window);
