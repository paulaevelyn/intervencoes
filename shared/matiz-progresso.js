/* matiz-progresso.js — XP, níveis e medalhas do Matiz (mesmo estilo do Farol).

   Tudo é CALCULADO a partir dos registros que o app já guarda (check-ins, planos,
   vocabulário, dose semanal, escala). Não há contador gravado: o progresso nunca fica
   fora de sincronia entre aparelhos e não muda a lógica interna do app.

   MatizProgresso.calcular(estado) -> { xp, nivel, pct, faltam, medalhas[] }
   MatizProgresso.estadoLocal()    -> estado lido do localStorage
   MatizProgresso.render(estado)   -> HTMLElement (cartão completo)
   MatizProgresso.resumo(el)       -> escreve o resumo curto (nível + XP) em `el`
   Todo texto entra por textContent. */
(function (global) {
  'use strict';

  var NIVEIS = [
    { n: 1, nome: 'Curioso/a',    emoji: '🌱', min: 0,   max: 60 },
    { n: 2, nome: 'Explorador/a', emoji: '🔍', min: 60,  max: 150 },
    { n: 3, nome: 'Praticante',   emoji: '🌿', min: 150, max: 280 },
    { n: 4, nome: 'Especialista', emoji: '⭐', min: 280, max: 450 },
    { n: 5, nome: 'Mestre/a',     emoji: '🏆', min: 450, max: 99999 }
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
      { id: 'xp300', emoji: '⭐', nome: 'Dedicado/a',         desc: 'Chegou a 300 XP',                       ganha: xp >= 300 }
    ];

    return { xp: xp, nivel: niv, pct: pct, faltam: niv.n < 5 ? niv.max - xp : 0, medalhas: medalhas };
  }

  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  function render(estado) {
    var r = calcular(estado), raiz = h('div', 'mp');
    var topo = h('div', 'mp-topo');
    topo.appendChild(h('span', 'mp-nivel', r.nivel.emoji + ' Nível ' + r.nivel.n + ' · ' + r.nivel.nome));
    topo.appendChild(h('span', 'mp-xp', r.xp + ' XP'));
    raiz.appendChild(topo);
    var trilho = h('div', 'mp-trilho'), fill = h('div', 'mp-fill'); fill.style.width = r.pct + '%'; trilho.appendChild(fill); raiz.appendChild(trilho);
    raiz.appendChild(h('p', 'mp-prox', r.nivel.n < 5 ? 'Faltam ' + r.faltam + ' XP para o próximo nível.' : 'Nível máximo. Obrigado por cuidar do seu mapa.'));
    var prat = h('div', 'mp-medalhas');
    r.medalhas.forEach(function (m) {
      var it = h('div', 'mp-med' + (m.ganha ? ' on' : ''));
      it.title = m.desc;
      it.appendChild(h('span', 'mp-emoji', m.ganha ? m.emoji : '🔒'));
      it.appendChild(h('span', 'mp-nome', m.nome));
      prat.appendChild(it);
    });
    raiz.appendChild(prat);
    raiz.appendChild(h('p', 'mp-nota', 'Pontos e medalhas só medem o quanto você usou o Matiz. Eles não dizem nada sobre o quanto você sente ou acerta.'));
    return raiz;
  }

  function resumo(el) {
    if (!el) return;
    var r = calcular(estadoLocal());
    el.textContent = r.nivel.emoji + ' Nível ' + r.nivel.n + ' · ' + r.nivel.nome + ' · ' + r.xp + ' XP';
  }

  global.MatizProgresso = { calcular: calcular, estadoLocal: estadoLocal, render: render, resumo: resumo, NIVEIS: NIVEIS, XP: XP };
})(window);
