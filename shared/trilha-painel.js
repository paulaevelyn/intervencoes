/* trilha-painel.js — leitura dos registros da Trilha (adolescentes) para a profissional.
   TrilhaPainel.render(estado, { textos }) -> HTMLElement
   `estado` = projeção de painel_dados('trilha'):
     { registros:[{ts,date,f,n,c,t?}], semanal:[{key,ts,n,t?}], escada:[{id,n,tentativas:[{ts,n}],t?}],
       feitos:{idTarefa:ts}, lidos:{modulo:ts}, plano:{preenchido,ts,t?} }
   Só números e escolhas por padrão; textos (`t`) só chegam com a permissão do adolescente.
   Depende de farol-painel.js e de trilha/data.js (rótulos). Todo texto do paciente entra por textContent. */
(function (global) {
  'use strict';
  var U = global.FarolPainel && global.FarolPainel.util;
  if (!U) { console.error('[TrilhaPainel] carregue farol-painel.js antes.'); return; }
  var h = U.h;
  var T = global.TRILHA || { OPTS: {}, FERRAMENTAS: [], MODULOS: [] };

  var ITENS = [['humor', 'Humor'], ['ansiedade', 'Ansiedade/tensão'], ['sono', 'Sono'], ['animo', 'Ânimo'], ['relacoes', 'Relações']];
  var RISCO = ['Não', 'Uma vez ou outra', 'Várias vezes', 'Quase todo dia'];

  function numero(x) { return typeof x === 'number'; }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
  function rotulo(lista, v) { var o = (T.OPTS[lista] || []).filter(function (x) { return x.v === v; })[0]; return o ? o.l : v; }
  function ferr(id) { if (id === 'missao') return 'Missão do módulo'; if (id === 'treino') return 'Treino social e de pensamentos'; var f = T.FERRAMENTAS.filter(function (x) { return x.id === id; })[0]; return f ? f.nome : id; }
  function forca(id) { var f = (T.FORCAS || []).filter(function (x) { return x.id === id; })[0]; return f ? f.e + ' ' + f.n : id; }
  function nivelDe(xp) { var n = (T.NIVEIS || [])[0], i; for (i = 0; i < (T.NIVEIS || []).length; i++) if (xp >= T.NIVEIS[i].min) n = T.NIVEIS[i]; return n; }
  function dmy(key) { var p = String(key).split('-'); return p[2] + '/' + p[1]; }
  function lista(regs, k, campo) { return [].concat.apply([], regs.map(function (r) { return (r.c && r.c[campo]) || []; })); }
  function pares(regs, f) { return regs.filter(function (r) { return r.f === f; }); }

  function render(estado, opts) {
    opts = opts || {};
    var raiz = h('div', { class: 'fp' });
    estado = estado || {};
    var regs = (estado.registros || []).filter(function (r) { return r && r.date; });
    var sem = (estado.semanal || []).filter(function (s) { return s && s.key && s.n; }).sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    var esc = estado.escada || [], feitos = estado.feitos || {}, lidos = estado.lidos || {}, plano = estado.plano || {};
    var jogo = estado.jogo || { xp: 0, miss: {}, med: [] }, fc = estado.forcas || { top: [], dev: [] };
    var temJogo = (jogo.xp || 0) > 0 || Object.keys(jogo.miss || {}).length, temForcas = (fc.top || []).length;

    if (!regs.length && !sem.length && !esc.length && !plano.preenchido && !temJogo && !temForcas) {
      var v = U.cartao('Registros'); v.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não há registros da Trilha.' })); raiz.appendChild(v); return raiz;
    }

    // ── Alerta: item de risco do balanço semanal ──────────────────────
    var comRisco = sem.filter(function (s) { return numero(s.n.risco) && s.n.risco >= 1; });
    if (comRisco.length) {
      var ult = comRisco[comRisco.length - 1], recente = sem[sem.length - 1];
      var al = U.cartao('Atenção: pensamentos de se machucar assinalados', 'Resposta ao item “Esta semana, pensei em me machucar ou que seria melhor não estar aqui”. É um sinal para conversar, não um diagnóstico nem uma avaliação de risco.');
      al.style.border = '2px solid #C47D2A'; al.style.background = 'rgba(196,125,42,.10)';
      al.appendChild(h('p', { class: 'fp-texto', texto: 'Última vez assinalado: semana de ' + dmy(ult.key) + ' (' + RISCO[ult.n.risco] + ').' +
        (recente.key !== ult.key ? ' Balanço mais recente (semana de ' + dmy(recente.key) + '): ' + (numero(recente.n.risco) ? RISCO[recente.n.risco] : 'sem resposta') + '.' : '') }));
      al.appendChild(h('p', { class: 'fp-dica', texto: 'Semanas assinaladas: ' + comRisco.map(function (s) { return dmy(s.key) + ' (' + s.n.risco + ')'; }).join(' · ') }));
      raiz.appendChild(al);
    }

    // ── Resumo ────────────────────────────────────────────────────────
    var lim = new Date(); lim.setDate(lim.getDate() - 13);
    var ini = lim.getFullYear() + '-' + String(lim.getMonth() + 1).padStart(2, '0') + '-' + String(lim.getDate()).padStart(2, '0');
    var dias = {}; regs.forEach(function (r) { if (r.date >= ini) dias[r.date] = 1; });
    raiz.appendChild(h('div', { class: 'fp-resumo' },
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(regs.length) }), h('span', { texto: 'registros' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(dias).length) }), h('span', { texto: 'dias com prática (14 dias)' })),
      h('div', { class: 'fp-stat' }, h('strong', { texto: String(Object.keys(jogo.miss || {}).filter(function (k) { return jogo.miss[k] === 3; }).length || Object.keys(lidos).length) }), h('span', { texto: Object.keys(jogo.miss || {}).length ? 'missões concluídas' : 'módulos vistos' }))));

    // ── Expedição (jogo) e forças ─────────────────────────────────────
    if (temJogo) {
      var cj = U.cartao('Expedição', 'Energia só sobe e vale por completar, não por acertar. Não é avaliação de desempenho.');
      var nv = nivelDe(jogo.xp || 0);
      cj.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Nível' }), h('strong', { texto: (nv ? nv.emoji + ' ' + nv.nome : '–') + ' · ' + Math.round(jogo.xp || 0) + ' de energia' })));
      (T.MODULOS || []).forEach(function (m) {
        var n = jogo.miss && jogo.miss[m.id]; if (!n) return;
        cj.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Módulo ' + m.id + ' · ' + m.nome }), h('strong', { texto: n === 3 ? 'concluída' : n + ' de 3 etapas' })));
      });
      cj.appendChild(h('p', { class: 'fp-dica', texto: (jogo.med || []).length + ' medalha' + ((jogo.med || []).length === 1 ? '' : 's') + ' conquistada' + ((jogo.med || []).length === 1 ? '' : 's') + '.' }));
      raiz.appendChild(cj);
    }
    // ── Treino social e de pensamentos (derivado dos registros f:'treino') ──
    var tr = pares(regs, 'treino'), CEN = global.TRILHA_CENARIOS;
    if (tr.length && CEN) {
      var ct = U.cartao('Treino social e de pensamentos', 'Cenários e classificação. Não é avaliação: serve de ponto de partida para conversar em sessão.');
      var todos = CEN.SOCIAIS.concat(CEN.PENSAMENTOS), vistos = {};
      tr.forEach(function (r) { var id = r.c && r.c.cenario && r.c.cenario[0]; if (id && !vistos[id]) vistos[id] = r.n && r.n.p; });
      var ids = Object.keys(vistos);
      if (ids.length) {
        ct.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Cenários feitos' }), h('strong', { texto: ids.length + ' de ' + todos.length })));
        ids.forEach(function (id) {
          var c = todos.filter(function (x) { return x.id === id; })[0]; if (!c) return;
          ct.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' },
            h('span', { class: 'fp-data', texto: c.titulo }),
            h('span', { class: 'fp-tag', texto: (c.tipo === 'social' ? c.hab : 'Pensamentos') + ' · nível ' + c.nivel })),
            h('p', { class: 'fp-texto', texto: vistos[id] === 1 ? 'Primeira escolha: a mais útil.' : 'Primeira escolha: outra opção (explorou as explicações).' })));
        });
      }
      var kt = { pens: [0, 0], emo: [0, 0], acao: [0, 0] }, nps = 0;
      tr.forEach(function (r) { if (!(r.c && r.c.psa)) return; nps++; ['pens', 'emo', 'acao'].forEach(function (c) { kt[c][0] += (r.n && r.n[c + '_c']) || 0; kt[c][1] += (r.n && r.n[c + '_t']) || 0; }); });
      if (nps) {
        var nm = { pens: 'Pensamentos', emo: 'Emoções e corpo', acao: 'Ações' };
        ct.appendChild(h('div', { class: 'fp-lbl', texto: 'Pensar, sentir e agir (' + nps + ' de ' + CEN.PSA.length + ' situações)', style: 'margin-top:10px' }));
        ['pens', 'emo', 'acao'].forEach(function (c) {
          ct.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: nm[c] + ' identificados de primeira' }), h('strong', { texto: kt[c][0] + ' de ' + kt[c][1] })));
        });
      }
      raiz.appendChild(ct);
    }

    if (temForcas) {
      var cf = U.cartao('Forças escolhidas', 'Escolhidas pelo próprio adolescente. Boa porta de entrada para a conversa em sessão.');
      cf.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Mais parecem comigo' }), h('strong', { texto: (fc.top || []).map(forca).join(', ') })));
      if ((fc.dev || []).length) cf.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Quero desenvolver' }), h('strong', { texto: fc.dev.map(forca).join(', ') })));
      if (opts.textos && fc.t) (fc.top || []).forEach(function (id) {
        var ex = fc.t['ex_' + id], us = fc.t['uso_' + id]; if (!ex && !us) return;
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: forca(id) })));
        if (ex) it.appendChild(h('p', { class: 'fp-texto', texto: 'Quando usou: ' + ex }));
        if (us) it.appendChild(h('p', { class: 'fp-texto', texto: 'Como pode usar: ' + us }));
        cf.appendChild(it);
      });
      else cf.appendChild(h('p', { class: 'fp-vazio', texto: 'Os exemplos escritos não foram compartilhados.' }));
      raiz.appendChild(cf);
    }

    if (regs.length) {
      var c1 = U.cartao('Registros por semana', 'Últimas 8 semanas');
      c1.appendChild(U.graficoSemanas(regs)); raiz.appendChild(c1);
    }

    // ── Balanço semanal ───────────────────────────────────────────────
    if (sem.length) {
      var c2 = U.cartao('Balanço da semana', 'Notas de 0 a 10 dadas pelo adolescente (opcionais, formulação própria, não é escala validada). Ele compara só consigo mesmo.');
      sem.slice(-8).reverse().forEach(function (s) {
        var partes = ITENS.filter(function (i) { return numero(s.n[i[0]]); }).map(function (i) { return i[1] + ' ' + s.n[i[0]]; });
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: 'Semana de ' + dmy(s.key) }),
          numero(s.n.risco) && s.n.risco >= 1 ? h('span', { class: 'fp-tag fp-tag-n', texto: 'pensamentos de se machucar: ' + RISCO[s.n.risco] }) : null),
          h('p', { class: 'fp-texto', texto: partes.length ? partes.join(' · ') : 'sem notas' }));
        if (opts.textos && s.t && s.t.nota) it.appendChild(h('p', { class: 'fp-texto', texto: '“' + s.t.nota + '”' }));
        c2.appendChild(it);
      });
      if (!opts.textos) c2.appendChild(h('p', { class: 'fp-vazio', texto: 'As observações escritas não foram compartilhadas.' }));
      raiz.appendChild(c2);
    }

    // ── Check-ins ─────────────────────────────────────────────────────
    var ck = pares(regs, 'checkin');
    if (ck.length) {
      var c3 = U.cartao('Check-ins', ck.length + ' registro' + (ck.length === 1 ? '' : 's') + ' (pensamento, corpo e ação)');
      var ints = ck.filter(function (r) { return numero(r.n && r.n.intensidade); }).map(function (r) { return r.n.intensidade; });
      if (ints.length) c3.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: 'Intensidade média (0–10)' }), h('strong', { texto: f1(U.media(ints)) })));
      [['emocao', 'Emoções mais frequentes', 'EMOCOES'], ['corpo', 'No corpo', 'CORPO'], ['impulso', 'Vontade de', 'IMPULSOS']].forEach(function (g) {
        var cont = U.contar(lista(ck, 'c', g[0]));
        if (!cont.length) return;
        c3.appendChild(h('div', { class: 'fp-lbl', texto: g[1], style: 'margin-top:10px' }));
        c3.appendChild(U.listaBarras(cont.map(function (p) { return [rotulo(g[2], p[0]), p[1]]; }), ck.length));
      });
      raiz.appendChild(c3);

      var c4 = U.cartao('Check-ins recentes', 'Mais recentes primeiro');
      ck.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 10).forEach(function (r) {
        var em = ((r.c && r.c.emocao) || []).map(function (v) { return rotulo('EMOCOES', v); }).join(', ');
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(r.date) }),
          numero(r.n && r.n.intensidade) ? h('span', { class: 'fp-tag', texto: 'intensidade ' + r.n.intensidade }) : null),
          h('p', { class: 'fp-texto', texto: em || 'sem emoção marcada' }));
        if (opts.textos && r.t && r.t.pensamento) it.appendChild(h('p', { class: 'fp-texto', texto: '“' + r.t.pensamento + '”' }));
        c4.appendChild(it);
      });
      if (!opts.textos) c4.appendChild(h('p', { class: 'fp-vazio', texto: 'Os pensamentos escritos não foram compartilhados.' }));
      raiz.appendChild(c4);
    }

    // ── Detetive e experimentos: crença antes → depois ────────────────
    [['detetive', 'Detetive de pensamentos', 'antes', 'depois', 'Quanto acredita no pensamento (0–10)'],
     ['experimento', 'Experimentos', 'crenca', 'depois', 'Quanto acredita na previsão (0–10)']].forEach(function (g) {
      var x = pares(regs, g[0]); if (!x.length) return;
      var c5 = U.cartao(g[1], x.length + ' registro' + (x.length === 1 ? '' : 's'));
      var pp = x.filter(function (r) { return r.n && numero(r.n[g[2]]) && numero(r.n[g[3]]); });
      if (pp.length) c5.appendChild(h('div', { class: 'fp-escala' }, h('span', { class: 'fp-nome', texto: g[4] }),
        h('strong', { texto: f1(U.media(pp.map(function (r) { return r.n[g[2]]; }))) + ' → ' + f1(U.media(pp.map(function (r) { return r.n[g[3]]; }))) + ' (' + pp.length + ')' })));
      var arm = U.contar(lista(x, 'c', 'armadilha'));
      if (arm.length) c5.appendChild(U.listaBarras(arm.map(function (p) { return [rotulo('ARMADILHAS', p[0]), p[1]]; }), x.length));
      if (opts.textos) x.slice().sort(function (a, b) { return b.ts - a.ts; }).slice(0, 5).forEach(function (r) {
        var tx = r.t && (r.t.pensamento || r.t.previsao); if (!tx) return;
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: U.rotuloData(r.date) })), h('p', { class: 'fp-texto', texto: '“' + tx + '”' }));
        var res = r.t.alternativa || r.t.resultado; if (res) it.appendChild(h('p', { class: 'fp-texto', texto: '→ ' + res }));
        c5.appendChild(it);
      });
      raiz.appendChild(c5);
    });

    // ── Escada de enfrentamento ───────────────────────────────────────
    if (esc.length) {
      var c6 = U.cartao('Escada de enfrentamento', 'Desconforto previsto e vivido (0–10). Degraus combinados em sessão.');
      esc.slice().sort(function (a, b) { return ((a.n && a.n.previsto) || 0) - ((b.n && b.n.previsto) || 0); }).forEach(function (d) {
        var tent = d.tentativas || [], dur = tent.filter(function (t) { return t.n && numero(t.n.durante); }).map(function (t) { return t.n.durante; });
        var it = h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' },
          h('span', { class: 'fp-data', texto: opts.textos && d.t && d.t.desc ? d.t.desc : 'Degrau' }),
          h('span', { class: 'fp-tag', texto: 'previsto ' + (d.n && numero(d.n.previsto) ? d.n.previsto : '–') + ' · ' + tent.length + ' tentativa' + (tent.length === 1 ? '' : 's') + (dur.length ? ' · vivido ' + dur.join(', ') : '') })));
        c6.appendChild(it);
      });
      if (!opts.textos) c6.appendChild(h('p', { class: 'fp-vazio', texto: 'As descrições dos degraus não foram compartilhadas.' }));
      raiz.appendChild(c6);
    }

    // ── Plano de segurança ────────────────────────────────────────────
    var c7 = U.cartao('Plano de segurança', 'Modelo Stanley-Brown, preenchido pelo adolescente');
    if (plano.preenchido) {
      c7.appendChild(h('p', { class: 'fp-texto', texto: 'Preenchido' + (numero(plano.ts) ? ', última atualização em ' + new Date(plano.ts).toLocaleDateString('pt-BR') : '') + '.' }));
      if (opts.textos && plano.t) {
        [['sinais', 'Sinais de crise'], ['estrategias', 'Para se acalmar'], ['distracao', 'Distração'], ['pessoas', 'Pessoas de apoio'], ['profissionais', 'Profissionais'], ['ambiente', 'Ambiente seguro']].forEach(function (p) {
          if (plano.t[p[0]]) c7.appendChild(h('div', { class: 'fp-item' }, h('div', { class: 'fp-item-topo' }, h('span', { class: 'fp-data', texto: p[1] })), h('p', { class: 'fp-texto', texto: plano.t[p[0]] })));
        });
      } else c7.appendChild(h('p', { class: 'fp-vazio', texto: 'O conteúdo não foi compartilhado. Vale pedir para ver na sessão.' }));
    } else c7.appendChild(h('p', { class: 'fp-vazio', texto: 'Ainda não preenchido. Pode ser montado junto na sessão.' }));
    raiz.appendChild(c7);

    // ── Uso das ferramentas ───────────────────────────────────────────
    if (regs.length) {
      var c8 = U.cartao('Ferramentas usadas', 'Quantas vezes cada uma foi usada');
      c8.appendChild(U.listaBarras(U.contar(regs.map(function (r) { return r.f; })).map(function (p) { return [ferr(p[0]), p[1]]; }), regs.length));
      var nf = Object.keys(feitos).length;
      if (nf) c8.appendChild(h('p', { class: 'fp-dica', texto: nf + ' tarefa' + (nf === 1 ? '' : 's') + ' combinada' + (nf === 1 ? '' : 's') + ' marcada' + (nf === 1 ? '' : 's') + ' como feita' + (nf === 1 ? '' : 's') + '.' }));
      raiz.appendChild(c8);
    }
    return raiz;
  }

  global.TrilhaPainel = { render: render };
})(window);
