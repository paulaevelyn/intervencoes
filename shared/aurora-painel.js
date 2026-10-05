/* aurora-painel.js — leitura dos registros do Aurora (ativação comportamental).
   AuroraPainel.render(estado, { textos, profissional }) -> HTMLElement
   `estado` = { humor[], feitas[], agendadas[], gratidao[], escalas } (a projeção de painel_dados,
   ou o que a página "Meu painel" monta do localStorage). Depende de farol-painel.js.
   Todo texto vindo do paciente entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[AuroraPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;

  // Categoria de cada atividade do Aurora (espelha aurora/src/utils/activities.js).
  var CAT = {
    corpo: 'Corpo e movimento', social: 'Conexão social', natureza: 'Natureza', criatividade: 'Criatividade',
    conquista: 'Conquistas', prazer: 'Prazer e lazer', cuidado: 'Autocuidado'
  };
  var DE = {
    walk_10: 'corpo', walk_30: 'corpo', stretch: 'corpo', dance: 'corpo', yoga: 'corpo', bike: 'corpo',
    call_friend: 'social', message: 'social', meet_person: 'social', pet: 'social', volunteer: 'social',
    park: 'natureza', sunlight: 'natureza', plant: 'natureza', water: 'natureza',
    draw: 'criatividade', write_story: 'criatividade', music: 'criatividade', cook: 'criatividade', craft: 'criatividade',
    small_task: 'conquista', organize: 'conquista', learn: 'conquista', plan_day: 'conquista', read: 'conquista',
    movie: 'prazer', bath: 'prazer', music_listen: 'prazer', game: 'prazer', coffee: 'prazer',
    sleep_routine: 'cuidado', meal: 'cuidado', hydrate: 'cuidado', breathe: 'cuidado', screen_off: 'cuidado'
  };
  var FAIXAS = [[0, 4, 'mínimo'], [5, 9, 'leve'], [10, 14, 'moderado'], [15, 19, 'moderadamente grave'], [20, 27, 'grave']];

  function numero(x) { return typeof x === 'number'; }

  function render(estado, opts) {
    opts = opts || {};
    estado = estado || {};
    var raiz = h('div', { class: 'fp' });

    var humor = (estado.humor || []).filter(function (m) { return m && m.date && numero(m.rating); })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var feitas = (estado.feitas || []).filter(function (f) { return f && f.date && Array.isArray(f.ids); });
    var agendadas = (estado.agendadas || []).filter(function (f) { return f && f.date && Array.isArray(f.ids); });
    var gratidao = (estado.gratidao || []).filter(function (g) { return g && g.date; });

    // ── Escala PHQ-9 ────────────────────────────────────────────────
    var esc = estado.escalas, pre = esc && esc.pre && esc.pre.phq9, pos = esc && esc.pos && esc.pos.phq9;
    if (!pre || !numero(pre.total)) pre = null;     // a projeção devolve {} quando não há resposta
    if (!pos || !numero(pos.total)) pos = null;
    if (pre || pos) {
      var ce = U.cartao('Sintomas de depressão (PHQ-9)', 'Soma de 0 a 27. Mais alto = mais sintomas nas últimas 2 semanas. Não é diagnóstico.');
      var linha = function (nome, r) {
        var faixa = '';
        if (opts.profissional) { FAIXAS.forEach(function (f) { if (r.total >= f[0] && r.total <= f[1]) faixa = ' · ' + f[2]; }); }
        return h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: nome }), h('strong', { texto: r.total + ' de ' + (r.maximo || 27) + faixa }));
      };
      if (pre) ce.appendChild(linha('Início', pre));
      if (pos) ce.appendChild(linha('Depois', pos));
      if (pre && pos) { var d = pos.total - pre.total; ce.appendChild(h('p', { class: 'fp-dica', texto: 'Diferença: ' + (d > 0 ? '+' : '') + d + ' ponto' + (Math.abs(d) === 1 ? '' : 's') + '.' })); }
      if (opts.profissional) {
        [['Início', pre], ['Depois', pos]].forEach(function (par) {
          var r = par[1]; if (r && numero(r.item9) && r.item9 > 0) {
            ce.appendChild(h('p', { class: 'fp-texto', texto: '⚠ Item 9 (pensamentos de morte ou de se ferir), ' + par[0].toLowerCase() + ': resposta ' + r.item9 + ' (0 a 3). Avaliar o risco.' }));
          }
        });
        ce.appendChild(h('p', { class: 'fp-dica', texto: 'Faixas da literatura (mínimo, leve, moderado, moderadamente grave, grave). Interpretar junto da entrevista clínica.' }));
      }
      raiz.appendChild(ce);
    }

    if (!humor.length && !feitas.length && !agendadas.length && !gratidao.length) {
      if (pre || pos) return raiz;
      var v = U.cartao('Registros'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há registros de humor nem de atividades.' }));
      raiz.appendChild(v); return raiz;
    }

    // ── Resumo ──────────────────────────────────────────────────────
    var eventos = []; feitas.forEach(function (f) { f.ids.forEach(function (id) { eventos.push({ date: f.date, id: id }); }); });
    var mHumor = U.media(humor.map(function (m) { return m.rating; }));
    raiz.appendChild(h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(humor.length) }), h('span', { texto: 'dias com humor registrado' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: mHumor === null ? '—' : mHumor.toFixed(1) }), h('span', { texto: 'humor médio (1–5)' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(eventos.length) }), h('span', { texto: 'atividades feitas' }))));

    // ── Humor ao longo do tempo ─────────────────────────────────────
    var gm = U.graficoMedia(humor, 'rating', 'Humor médio por semana');
    if (gm) { var c1 = U.cartao('Humor ao longo do tempo', 'Média por semana (1 = muito baixo · 5 = muito bem).'); c1.appendChild(gm); raiz.appendChild(c1); }

    // ── Atividades por semana e por categoria ───────────────────────
    if (eventos.length) {
      var c2 = U.cartao('Atividades feitas por semana', 'Últimas 8 semanas'); c2.appendChild(U.graficoSemanas(eventos)); raiz.appendChild(c2);
      var porCat = U.contar(eventos.map(function (e) { return CAT[DE[e.id]] || 'Outras'; }));
      var c3 = U.cartao('Tipos de atividade'); c3.appendChild(U.listaBarras(porCat, eventos.length)); raiz.appendChild(c3);
    }

    // ── Adesão: o que foi agendado e o que foi feito (o centro da ativação comportamental) ──
    var feitoPorDia = {}; feitas.forEach(function (f) { feitoPorDia[f.date] = f.ids; });
    var total = 0, cumpridas = 0;
    var hoje = new Date(); var hojeStr = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    agendadas.forEach(function (a) {
      if (a.date > hojeStr) return;                      // só conta o que já passou ou é de hoje
      a.ids.forEach(function (id) { total++; if ((feitoPorDia[a.date] || []).indexOf(id) >= 0) cumpridas++; });
    });
    if (total) {
      var c4 = U.cartao('Planejado e feito', 'Atividades que a pessoa agendou e chegou a fazer');
      c4.appendChild(h('p', { class: 'fp-texto', texto: cumpridas + ' de ' + total + ' atividades agendadas foram feitas (' + Math.round(cumpridas / total * 100) + '%).' }));
      raiz.appendChild(c4);
    }

    // ── Gratidão (só contagem; textos com permissão) ────────────────
    if (gratidao.length) {
      var c5 = U.cartao('Diário de gratidão', gratidao.length + ' registro' + (gratidao.length === 1 ? '' : 's'));
      if (!opts.textos) c5.appendChild(h('p', { class: 'fp-vazio', texto: 'Os textos do diário não foram compartilhados.' }));
      else {
        gratidao.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 10).forEach(function (g) {
          var itens = (g.items || []).filter(function (x) { return typeof x === 'string' && x; });
          if (!itens.length) return;
          c5.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(g.date) })), h('p', { class: 'fp-texto', texto: itens.join('\n') })));
        });
      }
      raiz.appendChild(c5);
    }

    // ── Notas de humor (texto) ──────────────────────────────────────
    var comNota = humor.filter(function (m) { return m.note; });
    if (humor.length) {
      var c6 = U.cartao('Notas do humor', 'Registros mais recentes primeiro');
      if (!opts.textos) c6.appendChild(h('p', { class: 'fp-vazio', texto: 'As notas escritas não foram compartilhadas.' }));
      else if (!comNota.length) c6.appendChild(h('p', { class: 'fp-vazio', texto: 'Nenhuma nota escrita.' }));
      else comNota.slice().reverse().slice(0, 15).forEach(function (m) {
        c6.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(m.date) }), h('span', { class: 'fp-tag', texto: 'humor ' + m.rating + ' de 5' })), h('p', { class: 'fp-texto', texto: m.note })));
      });
      raiz.appendChild(c6);
    }
    return raiz;
  }

  global.AuroraPainel = { render: render };
})(window);
