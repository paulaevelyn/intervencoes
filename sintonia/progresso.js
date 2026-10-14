/* ═══════════════════════════════════════════════════════════════════════
   Sintonia — progresso.js
   Parte do tipo "Com toques" que também vale para o clássico: comparação com os próprios blocos anteriores,
   gráficos, reflexão semanal sobre o dia a dia e relatório para a profissional (PDF, texto, planilha, resumo).
   Adaptado da Clareira. A pessoa se compara só consigo mesma; nada aqui é ranking, meta ou diagnóstico.
   Usa SESS, K, rd/wr, baixar, toast e sessOrdenadas de app.js.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

const WQ = ['Percebi quando minha mente se distraiu.', 'Consegui voltar ao que estava fazendo.', 'Comecei tarefas com menos esforço.', 'Senti menos sobrecarga mental.'];
const PH = [[0, 'Todas'], [1, 'Foco seletivo'], [2, 'Alternância'], [3, 'Atenção dividida']];
const PERS = [[7, '7 dias'], [30, '30 dias'], [90, '90 dias']];
const NKEY = 'sintonia_nome';   // só neste aparelho, nunca sincronizada
let WK = (function () { const d = rd(K.sem, []); return Array.isArray(d) ? d : []; })();
let wkDraft = [null, null, null, null], wkIniciado = false, PF = 0, PER = 30;

function fmt1(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
function avg(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; }
function weekKey(ts) { const d = new Date(ts); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function keyToDmy(k) { const p = k.split('-'); return p[2] + '/' + p[1]; }
function tsDe(r) { return Date.parse(r.iso) || r.id; }
function tqSess() { return sessOrdenadas().filter(r => r.tipo === 'toques'); }
function percDe(r) { return r.chamadas > 0 ? r.acertos / r.chamadas * 100 : null; }

/* ── Gráficos ────────────────────────────────────────────────────────── */
function lineChart(host, pts, o) {
  if (!pts.length) { host.innerHTML = '<p class="hint-t">Sem dados ainda.</p>'; return; }
  const W = Math.max(260, Math.floor(host.clientWidth) || 320), H = 200, L = 46, R = 14, T = 24, B = 32;
  const iw = W - L - R, ih = H - T - B;
  const x = i => pts.length === 1 ? L + iw / 2 : L + iw * i / (pts.length - 1);
  const y = v => T + ih * (1 - (v - o.min) / (o.max - o.min));
  let s = '';
  o.ticks.forEach(t => { s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (y(t) + 4).toFixed(1) + '" text-anchor="end">' + o.fmt(t) + '</text>'; });
  const pth = a => a.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p).toFixed(1)).join(' ');
  const vals = pts.map(p => p.v);
  if (pts.length > 1) {
    s += '<path class="area" d="' + pth(vals) + ' L' + x(pts.length - 1).toFixed(1) + ' ' + y(o.min).toFixed(1) + ' L' + x(0).toFixed(1) + ' ' + y(o.min).toFixed(1) + ' Z"/>';
    s += '<path class="line" d="' + pth(vals) + '"/>';
  }
  if (pts.length >= 4) { const mv = vals.map((v, i) => avg(vals.slice(Math.max(0, i - 2), i + 1))); s += '<path class="avg" d="' + pth(mv) + '"/>'; }
  pts.forEach((p, i) => { const last = i === pts.length - 1; s += '<circle class="pt' + (last ? ' last' : '') + '" cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="' + (last ? 6 : 3.5) + '"/>'; });
  const lp = pts[pts.length - 1];
  s += '<text class="ax val" x="' + x(pts.length - 1).toFixed(1) + '" y="' + (y(lp.v) - 11).toFixed(1) + '" text-anchor="' + (pts.length > 1 ? 'end' : 'middle') + '">' + o.fmt(lp.v) + '</text>';
  const li = [0]; if (pts.length >= 5) li.push(Math.floor((pts.length - 1) / 2)); if (pts.length > 1) li.push(pts.length - 1);
  li.forEach(i => { s += '<text class="ax" x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (pts.length === 1 ? 'middle' : (i === 0 ? 'start' : (i === pts.length - 1 ? 'end' : 'middle'))) + '">' + pts[i].label + '</text>'; });
  host.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + o.aria + '">' + s + '</svg>';
}
function moodChart(host, rows) {
  if (!rows.length) { host.innerHTML = '<p class="hint-t">Marque sua agitação antes e depois dos blocos para ver este gráfico.</p>'; return; }
  const W = Math.max(260, Math.floor(host.clientWidth) || 320), H = 190, L = 58, R = 14, T = 16, B = 32;
  const iw = W - L - R, ih = H - T - B;
  const x = i => rows.length === 1 ? L + iw / 2 : L + iw * i / (rows.length - 1);
  const y = v => T + ih * (1 - (v - 1) / 4);
  let s = '';
  [[1, 'calma'], [3, '3'], [5, 'agitada']].forEach(t => { s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t[0]).toFixed(1) + '" y2="' + y(t[0]).toFixed(1) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (y(t[0]) + 4).toFixed(1) + '" text-anchor="end">' + t[1] + '</text>'; });
  rows.forEach((r, i) => {
    s += '<line class="link" x1="' + x(i).toFixed(1) + '" x2="' + x(i).toFixed(1) + '" y1="' + y(r.b).toFixed(1) + '" y2="' + y(r.a).toFixed(1) + '"/>';
    s += '<circle class="pb" cx="' + x(i).toFixed(1) + '" cy="' + y(r.b).toFixed(1) + '" r="5"/>';
    s += '<circle class="pt" cx="' + x(i).toFixed(1) + '" cy="' + y(r.a).toFixed(1) + '" r="5"/>';
  });
  const li = [0]; if (rows.length > 1) li.push(rows.length - 1);
  li.forEach(i => { s += '<text class="ax" x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (rows.length === 1 ? 'middle' : (i === 0 ? 'start' : 'end')) + '">' + rows[i].label + '</text>'; });
  host.innerHTML = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Agitação da mente antes e depois de cada bloco">' + s + '</svg>';
}
function cmpItem(titulo, val, txt, up) { return '<div class="cmpi"><span class="hint-t">' + titulo + '</span><b>' + val + '</b><span class="cmp-d' + (up ? ' up' : '') + '">' + txt + '</span></div>'; }

/* ── Progresso do treino com toques ──────────────────────────────────── */
function buildPhase() {
  const el = $('phaseSeg'); el.innerHTML = '';
  PH.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p[1]; b.dataset.v = p[0]; b.setAttribute('aria-pressed', String(PF === p[0])); el.appendChild(b); });
}
function renderToques() {
  if ($('p-toques').hidden) return;
  buildPhase();
  const sess = tqSess().filter(r => (PF === 0 || r.fase === PF) && r.chamadas > 0);
  $('progEmpty').hidden = sess.length > 0; $('progBody').hidden = sess.length === 0;
  if (!sess.length) return;
  const last = sess.slice(-20);
  lineChart($('chRate'), last.map(r => ({ v: percDe(r), label: fmtShort(r.iso) })), { min: 0, max: 100, ticks: [0, 50, 100], fmt: v => Math.round(v) + '%', aria: 'Porcentagem de chamadas percebidas em cada bloco' });
  const rtp = last.filter(r => r.rt != null).map(r => ({ v: r.rt, label: fmtShort(r.iso) }));
  const mx = Math.max(2, Math.ceil(Math.max.apply(null, rtp.map(p => p.v).concat([0])) * 1.15 * 2) / 2);
  lineChart($('chRt'), rtp, { min: 0, max: mx, ticks: [0, mx / 2, mx], fmt: v => fmt1(v) + ' s', aria: 'Tempo de resposta em cada bloco' });
  const g = $('cmpGrid');
  if (sess.length < 2) { g.innerHTML = ''; $('cmpSub').textContent = 'Faça mais um bloco para ver a comparação.'; }
  else {
    const n = Math.min(3, Math.floor(sess.length / 2));
    const cur = sess.slice(-n), pri = sess.slice(sess.length - 2 * n, sess.length - n);
    $('cmpSub').textContent = 'Média ' + (n === 1 ? 'do último bloco contra a do anterior' : 'dos ' + n + ' últimos blocos contra a dos ' + n + ' anteriores') + '. A comparação fica mais justa com os mesmos ajustes.';
    let h = '';
    const A = (a, f) => avg(a.map(f));
    const dr = A(cur, percDe) - A(pri, percDe);
    h += cmpItem('Chamadas percebidas', Math.round(A(cur, percDe)) + '%', dr >= 3 ? '+' + Math.round(dr) + ' pontos' : dr <= -3 ? Math.round(-dr) + ' pontos a menos, oscilar é normal' : 'estável', dr >= 3);
    const cr = cur.filter(r => r.rt != null), pr = pri.filter(r => r.rt != null);
    if (cr.length && pr.length) {
      const dt = A(cr, r => r.rt) - A(pr, r => r.rt);
      h += cmpItem('Tempo de resposta', fmt1(A(cr, r => r.rt)) + ' s', dt <= -0.1 ? fmt1(-dt) + ' s mais rápido' : dt >= 0.1 ? fmt1(dt) + ' s mais lento' : 'estável', dt <= -0.1);
    }
    const dl = A(cur, r => r.longest) - A(pri, r => r.longest);
    h += cmpItem('Foco contínuo mais longo', Math.round(A(cur, r => r.longest)) + ' s', dl >= 3 ? '+' + Math.round(dl) + ' s' : dl <= -3 ? Math.round(-dl) + ' s a menos' : 'estável', dl >= 3);
    h += cmpItem('Voltas ao foco por bloco', fmt1(A(cur, r => r.voltas)), 'antes ' + fmt1(A(pri, r => r.voltas)) + '. Perceber a dispersão e voltar é o exercício.', false);
    g.innerHTML = h;
  }
  const mood = tqSess().filter(r => r.mente && r.mente.antes && r.mente.depois).slice(-12).map(r => ({ b: r.mente.antes, a: r.mente.depois, label: fmtShort(r.iso) }));
  moodChart($('chMood'), mood);
  if (mood.length) {
    const d = avg(mood.map(r => r.b - r.a));
    $('moodSum').textContent = d >= 0.3 ? 'Em média, a agitação ficou ' + fmt1(d) + ' ' + (Math.round(d * 10) / 10 === 1 ? 'ponto' : 'pontos') + ' menor depois dos blocos.'
      : d <= -0.3 ? 'Em média, a agitação ficou um pouco maior depois dos blocos. Isso acontece, principalmente em fases mais desafiadoras.'
      : 'Em média, a agitação ficou parecida depois dos blocos.';
  } else $('moodSum').textContent = '';
}

/* ── Reflexão semanal ────────────────────────────────────────────────── */
function buildQuestions() {
  const host = $('wkQs'); host.innerHTML = '';
  WQ.forEach((q, qi) => {
    const wrap = document.createElement('div'); wrap.className = 'field';
    const p = document.createElement('p'); p.className = 'slabel'; p.id = 'wq' + qi; p.textContent = q;
    const sc = document.createElement('div'); sc.className = 'scale'; sc.setAttribute('role', 'group'); sc.setAttribute('aria-labelledby', 'wq' + qi);
    for (let i = 1; i <= 5; i++) { const b = document.createElement('button'); b.type = 'button'; b.textContent = i; b.dataset.v = i; b.setAttribute('aria-pressed', String(wkDraft[qi] === i)); sc.appendChild(b); }
    sc.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const v = +b.dataset.v; wkDraft[qi] = wkDraft[qi] === v ? null : v;
      sc.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(wkDraft[qi] === +x.dataset.v)));
      $('wkSave').disabled = wkDraft.includes(null);
    });
    wrap.appendChild(p); wrap.appendChild(sc); host.appendChild(wrap);
  });
}
function loadWeekDraft() {
  const k = weekKey(Date.now()); const e = WK.find(x => x.key === k);
  wkDraft = e ? e.items.slice() : [null, null, null, null];
  $('wkNote').value = e ? (e.note || '') : '';
  $('wkSave').textContent = e ? 'Atualizar reflexão da semana' : 'Salvar reflexão da semana';
  buildQuestions(); $('wkSave').disabled = wkDraft.includes(null);
}
function renderWeekly() {
  lineChart($('chWk'), WK.slice(-8).map(e => ({ v: avg(e.items), label: keyToDmy(e.key) })), { min: 1, max: 5, ticks: [1, 3, 5], fmt: v => String(Math.round(v * 10) / 10).replace('.', ','), aria: 'Média semanal das reflexões sobre o dia a dia' });
  const ul = $('wkList'); ul.innerHTML = '';
  WK.slice(-6).reverse().forEach(e => {
    const n = sessOrdenadas().filter(r => weekKey(tsDe(r)) === e.key).length;
    const li = document.createElement('li');
    const a = document.createElement('span'); a.textContent = 'Semana de ' + keyToDmy(e.key) + ' · média ' + fmt1(avg(e.items)) + ' · ' + n + ' ' + tqPl(n, 'sessão', 'sessões'); li.appendChild(a);
    if (e.note) { const b = document.createElement('span'); b.className = 'hint-t'; b.textContent = e.note; li.appendChild(b); }
    ul.appendChild(li);
  });
}
/* Lembrete gentil na tela inicial (sem cobrança) */
function wkLembreteHTML() {
  const ss = sessOrdenadas(); const last = WK.length ? WK[WK.length - 1].ts : 0;
  if (ss.length < 3 || Date.now() - last <= 7 * 864e5) return '';
  return '<div class="insight-c"><div class="insight-t">Quando quiser</div><div class="insight-b">Em <strong>Progresso</strong> você pode registrar o que percebeu no dia a dia. Leva um minuto e ajuda a conversar na sessão.</div></div>';
}

/* ── Relatório ───────────────────────────────────────────────────────── */
function periodRows(days) { const since = Date.now() - days * 864e5; return sessOrdenadas().filter(r => tsDe(r) >= since); }
function fmtDT(ts) { return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function cenarioNome(k) { return TQ_CENAS[k] ? TQ_CENAS[k].label : (k || ''); }
function tipoNome(r) { return r.tipo === 'toques' ? 'Com toques · ' + (TQ_FASES[r.fase] || '') : 'Clássico (' + (r.modo === 'short' ? '6 min' : '12 min') + ')'; }
function medidasLinha(r) {
  return METRICS.map(m => { const a = r.antes ? r.antes[m.k] : null, d = r.depois ? r.depois[m.k] : null; return (a == null && d == null) ? null : m.curto + ' ' + (a == null ? '-' : a) + ' > ' + (d == null ? '-' : d); }).filter(Boolean).join(' · ');
}
function summaryLines(days, semSemanal) {
  const since = Date.now() - days * 864e5; const rs = periodRows(days); const L = [];
  if (!rs.length) L.push('Nenhuma sessão registrada no período.');
  else {
    L.push('Sessões: ' + rs.length + ' · tempo total: ' + Math.round(rs.reduce((q, r) => q + (r.feito || 0), 0) / 60) + ' min');
    const cl = rs.filter(r => r.tipo !== 'toques');
    if (cl.length) {
      const med = METRICS.map(m => { const p = cl.filter(r => r.antes && r.depois && typeof r.antes[m.k] === 'number' && typeof r.depois[m.k] === 'number'); return p.length ? m.nome + ': ' + fmt1(avg(p.map(r => r.antes[m.k]))) + ' > ' + fmt1(avg(p.map(r => r.depois[m.k]))) + ' (' + p.length + ')' : null; }).filter(Boolean);
      L.push('ATT clássica: ' + cl.length + ' ' + tqPl(cl.length, 'sessão', 'sessões') + (med.length ? '. Notas de 0 a 10, média antes > depois: ' + med.join('; ') : ''));
    }
    [1, 2, 3].forEach(f => {
      const x = rs.filter(r => r.tipo === 'toques' && r.fase === f && r.chamadas > 0); if (!x.length) return;
      const rts = x.filter(r => r.rt != null).map(r => r.rt);
      L.push(TQ_FASES[f] + ': ' + x.length + ' ' + tqPl(x.length, 'bloco', 'blocos') + ', chamadas percebidas ' + Math.round(avg(x.map(percDe))) + '%' + (rts.length ? ', tempo de resposta médio ' + fmt1(avg(rts)) + ' s' : '') + ', foco contínuo médio ' + Math.round(avg(x.map(r => r.longest))) + ' s, voltas ao foco por bloco ' + fmt1(avg(x.map(r => r.voltas))));
    });
    const mood = rs.filter(r => r.mente && r.mente.antes && r.mente.depois);
    if (mood.length) L.push('Agitação da mente (1 calma, 5 agitada), média antes ' + fmt1(avg(mood.map(r => r.mente.antes))) + ' e depois ' + fmt1(avg(mood.map(r => r.mente.depois))) + ' em ' + mood.length + ' ' + tqPl(mood.length, 'bloco', 'blocos'));
  }
  const wk = WK.filter(e => e.ts >= since);
  if (wk.length && !semSemanal) { L.push('Reflexões semanais (1 a 5: percebi a distração, voltei ao que fazia, comecei com menos esforço, menos sobrecarga):'); wk.forEach(e => L.push('Semana de ' + keyToDmy(e.key) + ': ' + e.items.join(', ') + (e.note ? ' · ' + e.note : ''))); }
  return L;
}
function buildSummaryText(days) { return ['Resumo da Sintonia, últimos ' + days + ' dias'].concat(summaryLines(days)).join('\n'); }
function sessaoLinha(r) {
  const dur = Math.max(1, Math.round((r.feito || 0) / 60)) + ' min' + (r.completa ? '' : ' (encerrada antes do fim)');
  if (r.tipo === 'toques') {
    const perc = r.chamadas > 0 ? r.acertos + ' de ' + r.chamadas + ' (' + Math.round(percDe(r)) + '%)' : 'n/d';
    return fmtDT(tsDe(r)) + ' | ' + tipoNome(r) + ' | ' + cenarioNome(r.cenario) + ' | ' + dur + ' | sons ' + (r.sons || 'n/d') + ' | chamadas percebidas ' + perc + ' | resposta ' + (r.rt != null ? fmt1(r.rt) + ' s' : 'n/d') + ' | foco contínuo ' + (r.longest || 0) + ' s | voltas ao foco ' + (r.voltas || 0) + ' | mente ' + ((r.mente && r.mente.antes) || 'n/d') + ' para ' + ((r.mente && r.mente.depois) || 'n/d');
  }
  return fmtDT(tsDe(r)) + ' | ' + tipoNome(r) + ' | ' + dur + ' | ' + (medidasLinha(r).replace(/>/g, 'para') || 'sem notas');
}
function buildReport(days) {
  const nome = ($('repName').value || '').trim(); const rs = periodRows(days); const since = Date.now() - days * 864e5;
  const L = ['RELATÓRIO SINTONIA', 'Paciente: ' + (nome || 'não informado'), 'Gerado em: ' + fmtDT(Date.now()), 'Período: últimos ' + days + ' dias', '', 'RESUMO'];
  summaryLines(days, true).forEach(x => L.push(x));
  L.push('', 'SESSÕES (do mais antigo ao mais recente)');
  if (!rs.length) L.push('Nenhuma sessão no período.');
  rs.forEach(r => { L.push(sessaoLinha(r)); if (r.nota) L.push('    Observação: ' + r.nota); });
  const wk = WK.filter(e => e.ts >= since);
  L.push('', 'REFLEXÕES SEMANAIS (1 quase nunca, 5 quase sempre)');
  if (!wk.length) L.push('Nenhuma reflexão no período.');
  wk.forEach(e => { L.push('Semana de ' + keyToDmy(e.key) + ':'); WQ.forEach((q, i) => L.push('  ' + q + ' ' + e.items[i])); if (e.note) L.push('  Situação relatada: ' + e.note); });
  L.push('', 'NOTAS',
    'Os dados foram registrados automaticamente pelo app, no aparelho da própria pessoa.',
    'ATT clássica: a pessoa escuta e leva a atenção ao som indicado; não há acertos nem erros. As notas de 0 a 10 (preocupação, atenção presa em si, controle da atenção) são opcionais e de formulação própria, não de uma escala validada.',
    'Com toques: tarefa de detecção. Chamadas percebidas = porcentagem das chamadas duplas de som que a pessoa percebeu tocando na fonte, em até cerca de 3 segundos.',
    'Voltas ao foco: vezes em que passaram mais de 14 segundos entre duas percepções e a atenção retornou. Foco contínuo: maior sequência de percepções com intervalos de até 14 segundos.',
    'Escala de agitação da mente: 1 calma, 5 agitada, marcada antes e depois do bloco quando a pessoa quis.',
    'Este relatório não é instrumento diagnóstico e deve ser lido junto com a avaliação clínica.');
  return L.join('\n');
}
function csvCell(v) { const t = (v == null ? '' : String(v)); return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; }
function csvSessoes(rs) {
  const head = ['data_hora', 'tipo', 'fase', 'cenario', 'minutos_planejados', 'minutos_feitos', 'completa',
    'preocupacao_antes', 'preocupacao_depois', 'atencao_em_mim_antes', 'atencao_em_mim_depois', 'controle_antes', 'controle_depois',
    'chamadas_percebidas', 'chamadas_total', 'tempo_resposta_s', 'foco_continuo_s', 'voltas_ao_foco', 'mente_antes_1a5', 'mente_depois_1a5', 'observacao'];
  const v = (o, k) => (o && o[k] != null) ? o[k] : '';
  const rows = rs.map(r => {
    const tq = r.tipo === 'toques';
    return [fmtDT(tsDe(r)), tq ? 'com toques' : 'classico', tq ? (TQ_FASES[r.fase] || '') : '', tq ? cenarioNome(r.cenario) : '', minTxt(r.planejado), minTxt(r.feito), r.completa ? 'sim' : 'não',
      v(r.antes, 'w'), v(r.depois, 'w'), v(r.antes, 's'), v(r.depois, 's'), v(r.antes, 'c'), v(r.depois, 'c'),
      tq ? r.acertos : '', tq ? r.chamadas : '', tq && r.rt != null ? String(r.rt).replace('.', ',') : '', tq ? r.longest : '', tq ? r.voltas : '',
      tq ? v(r.mente, 'antes') : '', tq ? v(r.mente, 'depois') : '', r.nota || ''];
  });
  return '﻿' + [head].concat(rows).map(a => a.map(csvCell).join(';')).join('\r\n');
}

/* PDF: as bibliotecas só são carregadas quando a pessoa pede o PDF (os dados não saem do aparelho) */
function carregarScript(src) { return new Promise((ok, err) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => err(new Error('falha ao carregar')); document.head.appendChild(s); }); }
async function garantirPdf() {
  const tem = () => !!(window.jspdf && window.jspdf.jsPDF);
  const temTab = () => !!(tem() && window.jspdf.jsPDF.API && window.jspdf.jsPDF.API.autoTable);
  if (!tem()) await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  if (tem() && !temTab()) { try { await carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'); } catch (e) { /* o PDF sai sem tabelas */ } }
  return tem();
}
function pdfClean(t) { return String(t == null ? '' : t).replace(/→/g, '>').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[^\n\x20-\x7E\xA0-\xFF]/g, ''); }
function buildPdf(days) {
  const lib = window.jspdf; if (!lib || !lib.jsPDF) return null;
  const doc = new lib.jsPDF({ unit: 'pt', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth(), PHt = doc.internal.pageSize.getHeight(), M = 44, CW = PW - 2 * M;
  const ACC = [61, 46, 122], INK = [63, 67, 75], MUTED = [107, 114, 128], LINE = [220, 222, 226];
  const PCOL = { 1: [94, 125, 115], 2: [196, 125, 42], 3: [139, 127, 184] };
  const nome = ($('repName').value || '').trim(); const rs = periodRows(days); const since = Date.now() - days * 864e5; const wk = WK.filter(e => e.ts >= since);
  let y = M;
  const need = h => { if (y + h > PHt - 52) { doc.addPage(); y = M; } };
  const h2 = t => { need(44); y += 6; doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(ACC[0], ACC[1], ACC[2]); doc.text(pdfClean(t), M, y); y += 18; doc.setTextColor(INK[0], INK[1], INK[2]); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); };
  const at = o => { if (typeof doc.autoTable === 'function') { doc.autoTable(o); return true; } return false; };
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(INK[0], INK[1], INK[2]); doc.text(pdfClean('Relatório Sintonia'), M, y + 18);
  y += 36; doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(pdfClean('Treino de atenção auditiva'), M, y); y += 24;
  doc.setTextColor(INK[0], INK[1], INK[2]); doc.setFontSize(11);
  [['Paciente', nome || 'não informado'], ['Gerado em', fmtDT(Date.now())], ['Período', 'últimos ' + days + ' dias']].forEach(m => {
    doc.setFont('helvetica', 'bold'); doc.text(pdfClean(m[0]) + ':', M, y); doc.setFont('helvetica', 'normal'); doc.text(pdfClean(m[1]), M + 72, y); y += 16;
  });
  doc.setDrawColor(ACC[0], ACC[1], ACC[2]); doc.setLineWidth(1.5); doc.line(M, y, PW - M, y); y += 16; doc.setFontSize(10);

  h2('Resumo');
  summaryLines(days, true).forEach(l => {
    const parts = doc.splitTextToSize(pdfClean(l), CW - 14); need(parts.length * 13 + 4);
    doc.setFillColor(ACC[0], ACC[1], ACC[2]); doc.circle(M + 3, y - 3, 1.7, 'F');
    doc.text(parts, M + 14, y); y += parts.length * 13 + 4;
  });

  const sess = rs.filter(r => r.tipo === 'toques' && r.chamadas > 0).slice(-20); const rtp = sess.filter(r => r.rt != null);
  function grafico(x, top, w, h, pts, o) {
    const L = 36, T = 6, B = 16, iw = w - L - 8, ih = h - T - B;
    const X = i => pts.length === 1 ? x + L + iw / 2 : x + L + iw * i / (pts.length - 1);
    const Y = v => top + T + ih * (1 - (v - o.min) / (o.max - o.min));
    doc.setFontSize(8); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]); doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(.5);
    o.ticks.forEach(t => { doc.line(x + L, Y(t), x + w - 8, Y(t)); doc.text(pdfClean(o.fmt(t)), x + L - 5, Y(t) + 3, { align: 'right' }); });
    doc.setDrawColor(MUTED[0], MUTED[1], MUTED[2]); doc.setLineWidth(1);
    for (let i = 1; i < pts.length; i++) doc.line(X(i - 1), Y(pts[i - 1].v), X(i), Y(pts[i].v));
    pts.forEach((p, i) => { const c = PCOL[p.m] || ACC; doc.setFillColor(c[0], c[1], c[2]); doc.circle(X(i), Y(p.v), 3, 'F'); });
    doc.text(pdfClean(pts[0].label), X(0), top + h - 4, { align: pts.length === 1 ? 'center' : 'left' });
    if (pts.length > 1) doc.text(pdfClean(pts[pts.length - 1].label), X(pts.length - 1), top + h - 4, { align: 'right' });
  }
  if (sess.length) {
    h2('Evolução por bloco (com toques)');
    const gw = (CW - 18) / 2, gh = 118; need(gh + 40);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(pdfClean('Chamadas percebidas (%)'), M, y); if (rtp.length) doc.text(pdfClean('Tempo de resposta (s)'), M + gw + 18, y);
    doc.setFont('helvetica', 'normal'); y += 6;
    grafico(M, y, gw, gh, sess.map(r => ({ v: percDe(r), m: r.fase, label: fmtShort(r.iso) })), { min: 0, max: 100, ticks: [0, 50, 100], fmt: v => Math.round(v) + '%' });
    if (rtp.length) {
      const mx = Math.max(2, Math.ceil(Math.max.apply(null, rtp.map(r => r.rt)) * 1.15 * 2) / 2);
      grafico(M + gw + 18, y, gw, gh, rtp.map(r => ({ v: r.rt, m: r.fase, label: fmtShort(r.iso) })), { min: 0, max: mx, ticks: [0, mx / 2, mx], fmt: v => fmt1(v) + ' s' });
    }
    y += gh + 12; doc.setFontSize(8); let lx = M;
    [1, 2, 3].forEach(f => { const c = PCOL[f]; doc.setFillColor(c[0], c[1], c[2]); doc.circle(lx + 3, y - 2.5, 3, 'F'); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]); doc.text(pdfClean(TQ_FASES[f]), lx + 10, y); lx += doc.getTextWidth(TQ_FASES[f]) + 30; });
    y += 14; doc.setFontSize(10); doc.setTextColor(INK[0], INK[1], INK[2]);
  }

  h2('Sessões (do mais antigo ao mais recente)');
  if (!rs.length) { doc.text(pdfClean('Nenhuma sessão no período.'), M, y); y += 16; }
  else {
    const body = rs.map(r => {
      const tq = r.tipo === 'toques';
      return [fmtDT(tsDe(r)), tipoNome(r), (Math.max(1, Math.round((r.feito || 0) / 60))) + ' min',
        tq ? (r.chamadas > 0 ? r.acertos + ' de ' + r.chamadas + ' (' + Math.round(percDe(r)) + '%)' : 'n/d') : '-',
        tq ? (r.rt != null ? fmt1(r.rt) + ' s' : 'n/d') : '-', tq ? (r.longest || 0) + ' s' : '-', tq ? String(r.voltas || 0) : '-',
        tq ? (((r.mente && r.mente.antes) || '-') + ' / ' + ((r.mente && r.mente.depois) || '-')) : (medidasLinha(r) || '-')].map(pdfClean);
    });
    const ok = at({ startY: y, margin: { left: M, right: M, bottom: 52 }, theme: 'grid',
      head: [['Data', 'Tipo', 'Duração', 'Chamadas percebidas', 'Resposta', 'Foco contínuo', 'Voltas', 'Mente antes / depois (1 a 5) ou notas 0 a 10']], body: body,
      styles: { font: 'helvetica', fontSize: 7.5, cellPadding: 3.5, textColor: INK, lineColor: LINE, lineWidth: .5 },
      headStyles: { fillColor: ACC, textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [247, 243, 239] } });
    if (ok) y = ((doc.lastAutoTable && doc.lastAutoTable.finalY) || y) + 16;
    else body.forEach(row => { const p = doc.splitTextToSize(row.join(' | '), CW); need(p.length * 12 + 4); doc.text(p, M, y); y += p.length * 12 + 4; });
    const obs = rs.filter(r => r.nota);
    if (obs.length) {
      h2('Observações escritas nas sessões');
      obs.forEach(r => { const p = doc.splitTextToSize(pdfClean(fmtDT(tsDe(r)) + ': ' + r.nota), CW); need(p.length * 12 + 4); doc.text(p, M, y); y += p.length * 12 + 4; });
    }
  }

  h2('Reflexões semanais sobre o dia a dia');
  doc.setFontSize(8.5); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  const sub = doc.splitTextToSize(pdfClean('Escala de 1 (quase nunca) a 5 (quase sempre), respondida pelo paciente.'), CW); doc.text(sub, M, y); y += sub.length * 11 + 6;
  doc.setFontSize(10); doc.setTextColor(INK[0], INK[1], INK[2]);
  if (!wk.length) { need(20); doc.text(pdfClean('Nenhuma reflexão no período.'), M, y); y += 16; }
  else {
    const wb = wk.map(e => [('Semana de ' + keyToDmy(e.key)), String(e.items[0]), String(e.items[1]), String(e.items[2]), String(e.items[3]), e.note || ''].map(pdfClean));
    const ok = at({ startY: y, margin: { left: M, right: M, bottom: 52 }, theme: 'grid',
      head: [['Semana', 'Percebi a distração', 'Voltei ao que fazia', 'Comecei com menos esforço', 'Menos sobrecarga mental', 'Situação relatada']], body: wb,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 3.5, textColor: INK, lineColor: LINE, lineWidth: .5, valign: 'top' },
      headStyles: { fillColor: ACC, textColor: 255, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } }, alternateRowStyles: { fillColor: [247, 243, 239] } });
    if (ok) y = ((doc.lastAutoTable && doc.lastAutoTable.finalY) || y) + 16;
    else wb.forEach(row => { const p = doc.splitTextToSize(row.join(' | '), CW); need(p.length * 12 + 4); doc.text(p, M, y); y += p.length * 12 + 4; });
  }

  h2('Notas');
  doc.setFontSize(8.5); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  [
    'Os dados foram registrados automaticamente pelo app, no aparelho da própria pessoa.',
    'ATT clássica: não há acertos nem erros. As notas de 0 a 10 são opcionais e de formulação própria, não de uma escala validada.',
    'Chamadas percebidas: porcentagem das chamadas duplas de som que a pessoa percebeu tocando na fonte, em até cerca de 3 segundos.',
    'Resposta: tempo mediano entre a chamada e o toque. Foco contínuo: maior sequência de percepções com intervalos de até 14 segundos.',
    'Voltas ao foco: vezes em que passaram mais de 14 segundos entre duas percepções e a atenção retornou.',
    'Mente antes / depois: escala de agitação de 1 (calma) a 5 (agitada), marcada quando a pessoa quis.',
    'Este relatório não é instrumento diagnóstico e deve ser lido junto com a avaliação clínica.'
  ].forEach(t => { const p = doc.splitTextToSize(pdfClean(t), CW); need(p.length * 11 + 3); doc.text(p, M, y); y += p.length * 11 + 3; });

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(pdfClean('Sintonia · gerado pelo paciente · não é instrumento diagnóstico'), M, PHt - 26);
    doc.text('Página ' + i + ' de ' + n, PW - M, PHt - 26, { align: 'right' });
  }
  return doc.output('blob');
}

function buildPer() {
  const el = $('perSeg'); el.innerHTML = '';
  PERS.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = p[1]; b.dataset.v = p[0]; b.setAttribute('aria-pressed', String(PER === p[0])); el.appendChild(b); });
}
function stamp() { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function temDados() { const since = Date.now() - PER * 864e5; return periodRows(PER).length > 0 || WK.some(e => e.ts >= since); }
function avisoRel(txt) { $('copyMsg').textContent = txt; }

function renderProgressoExtra() {
  if (!wkIniciado) { loadWeekDraft(); wkIniciado = true; }
  renderToques(); renderWeekly(); buildPer();
}

/* ═══════════════ INIT ═══════════════ */
(function progInit() {
  $('repName').value = rd(NKEY, '') || '';
  $('repName').addEventListener('input', e => { try { localStorage.setItem(NKEY, JSON.stringify(e.target.value.slice(0, 80))); } catch (x) { /* ok */ } });
  $('phaseSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; PF = +b.dataset.v; renderToques(); });
  $('perSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; PER = +b.dataset.v; buildPer(); $('fallback').hidden = true; avisoRel(''); });
  $('wkSave').addEventListener('click', () => {
    if (wkDraft.includes(null)) return;
    const key = weekKey(Date.now());
    WK = WK.filter(x => x.key !== key);
    WK.push({ key, ts: Date.now(), items: wkDraft.slice(), note: $('wkNote').value.trim().slice(0, 300) });
    WK.sort((a, b) => a.key < b.key ? -1 : 1); WK = WK.slice(-52); wr(K.sem, WK);
    $('wkMsg').textContent = 'Reflexão salva. Volte daqui a uma semana.';
    loadWeekDraft(); renderWeekly();
  });
  $('pdfSave').addEventListener('click', async () => {
    if (!temDados()) { avisoRel('Ainda não há sessões ou reflexões neste período.'); return; }
    avisoRel('Preparando o PDF…');
    let blob = null;
    try { if (await garantirPdf()) blob = buildPdf(PER); } catch (e) { blob = null; }
    if (!blob) { avisoRel('Não foi possível gerar o PDF agora (é preciso estar conectado). Salve o texto ou copie o resumo.'); return; }
    baixar('relatorio-sintonia-' + stamp() + '.pdf', 'application/pdf', blob); avisoRel('PDF salvo. Envie do jeito que vocês combinaram.');
  });
  $('repSave').addEventListener('click', () => {
    if (!temDados()) { avisoRel('Ainda não há sessões ou reflexões neste período.'); return; }
    baixar('relatorio-sintonia-' + stamp() + '.txt', 'text/plain;charset=utf-8', buildReport(PER)); avisoRel('Arquivo salvo. Envie do jeito que vocês combinaram.');
  });
  $('csvSave').addEventListener('click', () => {
    if (!temDados()) { avisoRel('Ainda não há sessões ou reflexões neste período.'); return; }
    baixar('sessoes-sintonia-' + stamp() + '.csv', 'text/csv;charset=utf-8', csvSessoes(periodRows(PER))); avisoRel('Arquivo salvo.');
  });
  $('copy').addEventListener('click', async () => {
    if (!temDados()) { avisoRel('Ainda não há sessões ou reflexões neste período.'); return; }
    const txt = buildSummaryText(PER);
    try { await navigator.clipboard.writeText(txt); avisoRel('Resumo copiado. Cole onde quiser enviar.'); }
    catch (e) { const ta = $('fallback'); ta.hidden = false; ta.value = txt; ta.focus(); ta.select(); avisoRel('Selecione o texto abaixo e copie.'); }
  });
  window.addEventListener('resize', () => { if (_cur === 'progress') { renderToques(); renderWeekly(); } });
})();
