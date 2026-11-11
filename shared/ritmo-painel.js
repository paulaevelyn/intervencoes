/* ritmo-painel.js — leitura dos registros do Ritmo (apoio para adultos neurodivergentes) para a profissional.
   RitmoPainel.render(estado, { textos }) -> HTMLElement
   `estado` = projeção de painel_dados('ritmo'):
     { checkins:  [ { date, energy?, overload?, need? } ],
       sensorial: [ { date, env?, level?, stimuli?: [rótulo], helped?: [rótulo] } ],
       estados:   [ { date, state } ],
       tarefas:   { total, feitas, depois },
       rotinas:   número }
   SÓ NÚMEROS E CATEGORIAS. Não há textos livres, plano de apoio, perfil de traços nem títulos de tarefas: o banco
   nunca os projeta, nem com a permissão de textos (por isso `opts.textos` é ignorado aqui).
   Sem metas, sem comparações e sem leitura de "bom" ou "ruim": a tela mostra o que a pessoa registrou.
   Depende de farol-painel.js. Todo texto vindo do paciente entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[RitmoPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;

  var ENERGIA = { baixa: 'Baixa', media: 'Média', alta: 'Alta' };
  var SOBRECARGA = { nenhuma: 'Nenhuma', leve: 'Leve', moderada: 'Moderada', alta: 'Alta' };
  var NECESSIDADE = { foco: 'Foco', descanso: 'Descanso', organizacao: 'Organização', regulacao: 'Regulação emocional', registrar: 'Só registrar' };
  var AMBIENTE = { casa: 'Casa', trabalho: 'Trabalho', estudo: 'Estudo', transporte: 'Transporte', social: 'Social', outro: 'Outro' };
  var ESTADOS = {
    sobrecarga: 'Sobrecarga', meltdown: 'Meltdown', shutdown: 'Shutdown', exaustao: 'Exaustão / burnout',
    paralisia: 'Paralisia para começar', hiperfoco: 'Hiperfoco', rejeicao: 'Sensibilidade intensa à rejeição',
    tedio: 'Falta de estímulo / tédio', ansiedade: 'Ansiedade', tristeza: 'Tristeza', raiva: 'Raiva / irritação'
  };

  function pares(lista, mapa) {
    var c = U.contar(lista);
    return c.map(function (p) { return [mapa ? (mapa[p[0]] || p[0]) : p[0], p[1]]; });
  }
  function valido(e) { return e && typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date); }

  function render(estado) {
    var raiz = h('div', { class: 'fp' });
    estado = estado || {};
    var chk = (estado.checkins || []).filter(valido);
    var sen = (estado.sensorial || []).filter(valido);
    var sta = (estado.estados || []).filter(valido);
    var tar = estado.tarefas || {};
    var temTar = typeof tar.total === 'number' && tar.total > 0;

    if (!chk.length && !sen.length && !sta.length && !temTar) {
      var v = U.cartao('Registros');
      v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há registros do Ritmo.' }));
      raiz.appendChild(v);
      return raiz;
    }

    // ── Resumo ────────────────────────────────────────────────────
    var dias = {};
    chk.concat(sen, sta).forEach(function (e) { dias[e.date] = 1; });
    raiz.appendChild(h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(dias).length) }), h('span', { texto: 'dias com registro' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(chk.length) }), h('span', { texto: 'check-ins' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(sen.length) }), h('span', { texto: 'registros sensoriais' }))));

    raiz.appendChild(h('p', { class: 'fp-dica', texto: 'O Ritmo não tem metas nem pontos: aqui aparece só o que a pessoa escolheu registrar e compartilhar. Textos, plano de apoio, perfil e títulos de tarefas nunca chegam ao painel.' }));

    var todos = chk.concat(sen, sta);
    if (todos.length) {
      var c1 = U.cartao('Registros por semana', 'Últimas 8 semanas');
      c1.appendChild(U.graficoSemanas(todos));
      raiz.appendChild(c1);
    }

    // ── Check-ins de energia ──────────────────────────────────────
    if (chk.length) {
      var c2 = U.cartao('Check-ins de energia', 'Respostas da própria pessoa; ela responde só o que quiser.');
      var en = chk.map(function (e) { return e.energy; }).filter(Boolean);
      var ov = chk.map(function (e) { return e.overload; }).filter(Boolean);
      var nd = chk.map(function (e) { return e.need; }).filter(Boolean);
      if (en.length) { c2.appendChild(h('div', { class: 'fp-lbl', texto: 'Energia' })); c2.appendChild(U.listaBarras(pares(en, ENERGIA), en.length)); }
      if (ov.length) { c2.appendChild(h('div', { class: 'fp-lbl', texto: 'Sobrecarga' })); c2.appendChild(U.listaBarras(pares(ov, SOBRECARGA), ov.length)); }
      if (nd.length) { c2.appendChild(h('div', { class: 'fp-lbl', texto: 'Do que precisava' })); c2.appendChild(U.listaBarras(pares(nd, NECESSIDADE), nd.length)); }
      raiz.appendChild(c2);
    }

    // ── Registros sensoriais ──────────────────────────────────────
    if (sen.length) {
      var c3 = U.cartao('Registros sensoriais', 'O que pesou e o que ajudou, dentro das opções do app.');
      var amb = sen.map(function (e) { return e.env; }).filter(Boolean);
      var niv = sen.map(function (e) { return e.level; }).filter(Boolean);
      var est = [], aju = [];
      sen.forEach(function (e) { (e.stimuli || []).forEach(function (x) { est.push(x); }); (e.helped || []).forEach(function (x) { aju.push(x); }); });
      if (amb.length) { c3.appendChild(h('div', { class: 'fp-lbl', texto: 'Onde' })); c3.appendChild(U.listaBarras(pares(amb, AMBIENTE), amb.length)); }
      if (niv.length) { c3.appendChild(h('div', { class: 'fp-lbl', texto: 'Nível de sobrecarga' })); c3.appendChild(U.listaBarras(pares(niv, SOBRECARGA), niv.length)); }
      if (est.length) { c3.appendChild(h('div', { class: 'fp-lbl', texto: 'O que estava pesando' })); c3.appendChild(U.listaBarras(pares(est), sen.length)); }
      if (aju.length) { c3.appendChild(h('div', { class: 'fp-lbl', texto: 'O que ajudou' })); c3.appendChild(U.listaBarras(pares(aju), sen.length)); }
      raiz.appendChild(c3);
    }

    // ── Estados marcados ──────────────────────────────────────────
    if (sta.length) {
      var c4 = U.cartao('Estados que a pessoa marcou', 'Só o nome do estado e a data. Sensações, contexto e notas ficam só com a pessoa.');
      c4.appendChild(U.listaBarras(pares(sta.map(function (e) { return e.state; }), ESTADOS), sta.length));
      raiz.appendChild(c4);
    }

    // ── Tarefas e rotinas: só contagens ───────────────────────────
    if (temTar || estado.rotinas) {
      var c5 = U.cartao('Tarefas e rotinas', 'Só contagens. Os títulos e os passos não são compartilhados.');
      if (temTar) {
        c5.appendChild(h('p', { class: 'fp-texto', texto: tar.total + ' tarefa' + (tar.total === 1 ? '' : 's') + ' criada' + (tar.total === 1 ? '' : 's') +
          ' · ' + (tar.feitas || 0) + ' concluída' + (tar.feitas === 1 ? '' : 's') + ' · ' + (tar.depois || 0) + ' deixada' + (tar.depois === 1 ? '' : 's') + ' para depois.' }));
      }
      if (estado.rotinas) {
        c5.appendChild(h('p', { class: 'fp-texto', texto: estado.rotinas + ' rotina' + (estado.rotinas === 1 ? '' : 's') + ' criada' + (estado.rotinas === 1 ? '' : 's') + '.' }));
      }
      raiz.appendChild(c5);
    }

    return raiz;
  }

  global.RitmoPainel = { render: render };
})(window);
