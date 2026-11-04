/* ═══════════════════════════════════════════════════════════════════════
   Trilha — jogo.js  ·  Expedição (gamificação por domínio, SEM perdas)

   Regras de projeto (não mudar sem rever o impacto clínico):
   • Energia (pontos) SÓ SOBE. Sem sequência que quebra, sem ranking, sem tempo limite, sem perda por faltar.
   • Pontos são por COMPLETAR, nunca por acertar: errar uma questão não custa nada e não aparece como nota.
   • A correção só alimenta a Revisão relâmpago (espaçamento), nunca um placar.
   • Medalhas são habilidades aprendidas (e nunca "dias seguidos"). Nada é bloqueado: qualquer missão pode ser jogada.
   • Estratégias de aprendizagem: micro-aulas, recuperação ativa com feedback imediato, revisão espaçada,
     prática com ferramentas reais, reflexão (ensinar com as próprias palavras) e forças aplicadas às missões.

   Estado (sincronizado): trilha_jogo { pts:{chave:n}, miss:{modulo:{a,t,p:ts}}, med:{id:ts}, revd:{data:1}, pet }
                          trilha_rev { qid:{b:caixa 0–4, d:data da próxima revisão} }
                          trilha_forcas { ts, top:[ids], dev:[ids], t:{ex_id, uso_id} }
                          trilha_recursos [ {id, ts, cat, t:{item}} ]   (só da pessoa; nunca vai ao painel)
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

const PTS_ETAPA = { a: 10, t: 15, p: 15 };
const INTERVALOS_REV = [1, 3, 7, 14, 30];
const MISSOES = window.TRILHA_MISSOES || {};
const NOMES_ETAPA = { a: 'Aprender', t: 'Treinar', p: 'Praticar' };

function addDias(dateStr, n) { const d = new Date(dateStr + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); }
function embaralha(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
const getForcas = () => rd(K.forcas, null);

/* ── Estado e energia ────────────────────────────────────────────────── */
function getJogo() {
  const j = rd(K.jogo, null) || {};
  j.pts = j.pts || {}; j.miss = j.miss || {}; j.med = j.med || {}; j.revd = j.revd || {}; j.pet = j.pet || 'raposa';
  return j;
}
function xpDe(J) { return Object.keys(J.pts).reduce((a, k) => a + (Number(J.pts[k]) || 0), 0); }
function nivelDe(xp) { let i = 0; TRILHA.NIVEIS.forEach((n, k) => { if (xp >= n.min) i = k; }); return i; }
function nivelInfo(xp) {
  const i = nivelDe(xp), n = TRILHA.NIVEIS[i], prox = TRILHA.NIVEIS[i + 1];
  return { i: i, n: n, prox: prox, pct: prox ? Math.round((xp - n.min) / (prox.min - n.min) * 100) : 100, falta: prox ? prox.min - xp : 0 };
}
function ptsAdd(J, chave, n) { if (!J.pts[chave]) J.pts[chave] = n; }
function etapasFeitas(J, mod) { const x = J.miss[mod] || {}; return ['a', 't', 'p'].filter(k => x[k]).length; }
function modCompleto(J, mod) { return etapasFeitas(J, mod) === 3; }

/* ── Medalhas: habilidades aprendidas, nunca "dias seguidos" ─────────── */
function emocoesDistintas() {
  const s = {}; getRegs().filter(r => r.f === 'checkin').forEach(r => ((r.c && r.c.emocao) || []).forEach(v => { s[v] = 1; })); return Object.keys(s).length;
}
function diasComForca() { const s = {}; getRegs().filter(r => r.f === 'forca').forEach(r => { s[r.date] = 1; }); return Object.keys(s).length; }
const MEDALHAS = TRILHA.MODULOS.map(m => ({ id: 'mod' + m.id, e: MISSOES[m.id].medalha.e, n: MISSOES[m.id].medalha.n, d: 'Concluiu as três etapas do módulo ' + m.id + '.', ok: J => modCompleto(J, m.id) }))
  .concat([
    { id: 'primeiro', e: '📍', n: 'Primeiro registro', d: 'Fez o primeiro registro na Trilha.', ok: () => getRegs().length >= 1 },
    { id: 'vocab', e: '🗣️', n: 'Vocabulário emocional', d: 'Nomeou 7 emoções diferentes nos check-ins.', ok: () => emocoesDistintas() >= 7 },
    { id: 'mochila', e: '🎒', n: 'Mochila montada', d: 'Descobriu as suas forças.', ok: () => { const f = getForcas(); return !!(f && f.top && f.top.length); } },
    { id: 'forcas5', e: '🌟', n: 'Forças em ação', d: 'Usou e registrou suas forças em 5 dias diferentes.', ok: () => diasComForca() >= 5 },
    { id: 'revisao3', e: '🗺️', n: 'Memória de explorador/a', d: 'Fez a revisão relâmpago em 3 dias.', ok: J => Object.keys(J.revd).length >= 3 },
    { id: 'experimento1', e: '🔬', n: 'Mão na massa', d: 'Registrou o primeiro experimento.', ok: () => getRegs().some(r => r.f === 'experimento') },
    { id: 'degrau1', e: '🥇', n: 'Primeiro degrau', d: 'Tentou o primeiro degrau da escada.', ok: () => rd(K.esc, []).some(d => (d.tentativas || []).length) }
  ]);

/* ── Atualização central (energia, medalhas, nível, celebrações) ─────── */
const _cel = [];
/* Nunca comemorar por cima de uma mensagem de cuidado (ex.: item de risco do balanço semanal). */
window._semCelebrar = false;
function celebra(titulo, html) { if (window._semCelebrar) return; _cel.push([titulo, html]); setTimeout(mostrarCel, 350); }
function mostrarCel() {
  const ov = $('modal-ov'); if (!_cel.length || (ov && ov.classList.contains('on'))) return;
  const c = _cel.shift();
  showModal(c[0], '<div style="text-align:center">' + c[1] + '</div>', '<button class="btn" onclick="fecharCel()">Continuar</button>');
}
function fecharCel() { closeModal(); setTimeout(mostrarCel, 250); }

function jogoAtualiza(fn) {
  const J = getJogo(), xp0 = xpDe(J), n0 = nivelDe(xp0);
  fn(J);
  const ks = Object.keys(J.pts);                           // compacta usos antigos (sem perder pontos)
  if (ks.length > 400) { const lim = addDias(today(), -90); let s = 0; ks.forEach(k => { if (k.indexOf('u:') === 0 && k.slice(-10) < lim) { s += J.pts[k]; delete J.pts[k]; } }); J.pts.arq = (J.pts.arq || 0) + s; }
  const novas = MEDALHAS.filter(m => !J.med[m.id] && m.ok(J));
  novas.forEach(m => { J.med[m.id] = Date.now(); });
  wr(K.jogo, J);
  const xp1 = xpDe(J), n1 = nivelDe(xp1);
  if (xp1 > xp0 && !window._semCelebrar) toast('+' + (xp1 - xp0) + ' de energia');
  novas.forEach(m => celebra('Medalha conquistada', `<div style="font-size:64px;line-height:1.1">${esc(m.e)}</div><h3 style="margin:8px 0 4px">${esc(m.n)}</h3><p>${esc(m.d)}</p>`));
  if (n1 > n0) {
    const lv = TRILHA.NIVEIS[n1], pets = TRILHA.COMPANHEIROS.filter(c => c.nivel === n1).map(c => c.e + ' ' + c.nome);
    celebra('Novo nível!', `<div style="font-size:64px;line-height:1.1">${esc(lv.emoji)}</div><h3 style="margin:8px 0 4px">${esc(lv.nome)}</h3><p>Você avançou na expedição.${pets.length ? ' Novo companheiro disponível: ' + esc(pets.join(', ')) + '.' : ''}</p>`);
  }
  if (_cur === 'home') renderHome();
}
function pontuaUso(f) { jogoAtualiza(J => ptsAdd(J, 'u:' + f + ':' + today(), 3)); }
function pontuarRegistro(rec) { if (rec.f !== 'missao') pontuaUso(rec.f); }
function etapaFeita(mod, et) {
  jogoAtualiza(J => {
    J.miss[mod] = J.miss[mod] || {}; if (!J.miss[mod][et]) J.miss[mod][et] = Date.now();
    ptsAdd(J, 'm' + mod + ':' + et, PTS_ETAPA[et]);
    if (modCompleto(J, mod)) ptsAdd(J, 'm' + mod + ':ok', 10);
  });
}

/* ── Revisão espaçada (recuperação ativa) ────────────────────────────── */
function questaoPorId(qid) { for (const k in MISSOES) { const q = MISSOES[k].quiz.find(x => x.id === qid); if (q) return q; } return null; }
function revAdicionar(qids) { const r = rd(K.rev, {}); qids.forEach(q => { if (!r[q]) r[q] = { b: 0, d: addDias(today(), 1) }; }); wr(K.rev, r); }
function revDevidas() {
  const r = rd(K.rev, {}), t = today();
  return Object.keys(r).filter(q => r[q].d <= t && questaoPorId(q)).sort((a, b) => (r[a].d < r[b].d ? -1 : 1)).slice(0, 3);
}
function revRegistra(qid, certo) {
  const r = rd(K.rev, {}), it = r[qid] || { b: 0 };
  it.b = certo ? Math.min(INTERVALOS_REV.length - 1, it.b + 1) : 0;
  it.d = addDias(today(), INTERVALOS_REV[it.b]); r[qid] = it; wr(K.rev, r);
}

/* ── Questões (mc e sort) com feedback imediato e SEM nota na tela ───── */
function renderQuestao(cont, q, cb) {
  cont.innerHTML = '';
  const box = document.createElement('div'); cont.appendChild(box);
  if (q.tipo === 'mc') {
    const ops = embaralha(q.ops);
    box.innerHTML = `<div class="qz-q">${esc(q.q)}</div><div class="qz-ops">${ops.map((o, i) => `<button type="button" class="qz-op" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
      <div class="qz-fb" hidden></div><div class="tr-acoes" hidden><button class="tr-btn" type="button" data-next>Continuar</button></div>`;
    let respondida = false, primeiraOk = false;
    box.querySelectorAll('.qz-op').forEach(b => b.addEventListener('click', () => {
      if (respondida) return; respondida = true;
      const o = ops[Number(b.dataset.i)], certa = ops.find(x => x.ok);
      primeiraOk = !!o.ok;
      box.querySelectorAll('.qz-op').forEach((x, i) => { x.disabled = true; if (ops[i].ok) x.classList.add('ok'); });
      if (!o.ok) b.classList.add('no');
      const fb = box.querySelector('.qz-fb'); fb.hidden = false;
      fb.innerHTML = (o.ok ? '<strong>Isso!</strong> ' : '<strong>Quase.</strong> ') + esc(o.fb) + (o.ok ? '' : '<br><br><strong>Mais útil:</strong> ' + esc(certa.t) + '. ' + esc(certa.fb));
      fb.insertAdjacentHTML('afterend', '<details class="qz-todas"><summary>Ver por que cada opção é assim</summary>' +
        ops.map(x => `<div class="qz-ex${x.ok ? ' ok' : ''}"><strong>${esc(x.t)}</strong><br>${esc(x.fb)}</div>`).join('') + '</details>');
      box.querySelector('.tr-acoes').hidden = false;
    }));
    box.querySelector('[data-next]').addEventListener('click', () => cb(primeiraOk));
  } else {
    const itens = embaralha(q.itens), sel = {};
    box.innerHTML = `<div class="qz-q">${esc(q.q)}</div>` + itens.map((it, i) => `<div class="qz-item" data-i="${i}"><div class="qz-it">${esc(it.t)}</div>
      <div class="chips">${q.cats.map(c => `<button type="button" class="chip" data-i="${i}" data-c="${esc(c.id)}">${esc(c.l)}</button>`).join('')}</div><div class="qz-res" hidden></div></div>`).join('') +
      `<div class="qz-fb" hidden></div><div class="tr-acoes"><button class="tr-btn" type="button" data-ver disabled>Verificar</button><button class="tr-btn" type="button" data-next hidden>Continuar</button></div>`;
    let conferido = false, tudoOk = false;
    box.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
      if (conferido) return; const i = Number(ch.dataset.i); sel[i] = ch.dataset.c;
      box.querySelectorAll(`.chip[data-i="${i}"]`).forEach(x => x.classList.toggle('sel', x === ch));
      box.querySelector('[data-ver]').disabled = Object.keys(sel).length < itens.length;
    }));
    box.querySelector('[data-ver]').addEventListener('click', () => {
      conferido = true; tudoOk = true;
      itens.forEach((it, i) => {
        const ok = sel[i] === it.c; if (!ok) tudoOk = false;
        const r = box.querySelector(`.qz-item[data-i="${i}"] .qz-res`); r.hidden = false; r.classList.add(ok ? 'ok' : 'no');
        r.textContent = ok ? '✓ Isso' : '→ Seria: ' + q.cats.find(c => c.id === it.c).l;
      });
      const fb = box.querySelector('.qz-fb'); fb.hidden = false; fb.textContent = q.fb;
      box.querySelector('[data-ver]').hidden = true; box.querySelector('[data-next]').hidden = false;
    });
    box.querySelector('[data-next]').addEventListener('click', () => cb(tudoOk, itens.map((it, i) => ({ c: it.c, ok: sel[i] === it.c }))));
  }
}

/* ── Missões: hub (na tela do módulo) e etapas ───────────────────────── */
function hubMissaoHTML(m) {
  const J = getJogo(), x = J.miss[m.id] || {}, med = MISSOES[m.id].medalha;
  const et = [['a', '📖', 'Aprender', 'Micro-aula de 4 cartões'], ['t', '🎮', 'Treinar', '2 questões com explicação'], ['p', '🏕️', 'Praticar', 'Desafio e sua reflexão']];
  return `<div class="sdiv">Missão do módulo</div><div class="etapas">` + et.map(e => `<button class="etapa${x[e[0]] ? ' feita' : ''}" type="button" onclick="abrirEtapa(${m.id},'${e[0]}')">
      <span class="et-e">${x[e[0]] ? '✓' : e[1]}</span><span><strong>${e[2]}</strong><small>${e[3]} · +${PTS_ETAPA[e[0]]} de energia</small></span></button>`).join('') + `</div>
    <div class="tr-card suave"><div class="tr-lbl">Medalha</div><p>${esc(med.e)} <strong>${esc(med.n)}</strong> · ${J.med['mod' + m.id] ? 'conquistada' : 'conquiste concluindo as três etapas, em qualquer ordem'}</p></div>`;
}
function pipsHTML(id) {
  const n = etapasFeitas(getJogo(), id);
  return '<span class="pips" aria-label="' + n + ' de 3 etapas">' + [0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('') + '</span>';
}

let _ms = null;
function abrirEtapa(mod, et) { _ms = { mod: mod, et: et, i: 0, prim: [] }; goTo('missao'); renderEtapa(); }
function cabecalhoEtapa() {
  const m = moduloPorId(_ms.mod);
  return `<div class="hdr"><h1>${esc(m.emoji)} ${esc(NOMES_ETAPA[_ms.et])}</h1><p>Módulo ${m.id} · ${esc(m.nome)}</p></div><div style="height:14px"></div>`;
}
function renderEtapa() {
  const w = $('ms-wrap'), M = MISSOES[_ms.mod], head = cabecalhoEtapa();
  if (_ms.et === 'a') {
    const c = M.licao[_ms.i], ult = _ms.i === M.licao.length - 1;
    w.innerHTML = head + `<div class="dots">${M.licao.map((_, i) => `<i class="${i <= _ms.i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="bloco licao"><div class="licao-e">${esc(c.e)}</div><h3>${esc(c.t)}</h3><p>${esc(c.x)}</p></div>
      <div class="tr-acoes" style="padding:0 var(--pg)">${_ms.i > 0 ? '<button class="tr-btn ghost" type="button" onclick="_ms.i--;renderEtapa()">Voltar</button>' : ''}
      <button class="tr-btn" type="button" onclick="${ult ? 'fimAprender()' : '_ms.i++;renderEtapa()'}">${ult ? 'Concluir a aula' : 'Próximo'}</button></div>`;
  } else if (_ms.et === 't') {
    const q = M.quiz[_ms.i];
    w.innerHTML = head + `<div class="dots">${M.quiz.map((_, i) => `<i class="${i <= _ms.i ? 'on' : ''}"></i>`).join('')}</div><div class="bloco"><div id="ms-q"></div></div>
      ${_ms.i > 0 ? '<div class="tr-acoes" style="padding:0 var(--pg) 8px"><button class="tr-btn ghost" type="button" onclick="_ms.i--;renderEtapa()">← Questão anterior</button></div>' : ''}
      <p class="pv-txt" style="padding:0 var(--pg)">Aqui não tem nota: errar é parte de aprender. Você ganha energia por completar.</p>`;
    renderQuestao($('ms-q'), q, ok => { _ms.prim.push(ok); if (_ms.i < M.quiz.length - 1) { _ms.i++; renderEtapa(); } else fimTreinar(); });
  } else {
    const f = getForcas(), top = (f && f.top) || [], forca = top.length ? TRILHA.FORCAS.find(x => x.id === top[(_ms.mod - 1) % top.length]) : null;
    const ft = ferramentaPorId(M.desafio.ferramenta);
    w.innerHTML = head + `<div class="bloco"><h3>Desafio</h3><p>${esc(M.desafio.t)}</p>
      ${ft ? `<div class="tr-acoes"><button class="tr-btn" type="button" onclick="openTool('${esc(ft.id)}')">${esc(ft.emoji)} Abrir ${esc(ft.nome)}</button></div>` : ''}</div>
      ${forca ? `<div class="tr-card"><div class="tr-lbl">Sua força pode ajudar</div><p>${esc(forca.e)} <strong>${esc(forca.n)}</strong>: use para ${esc(forca.uso)}</p></div>`
              : `<div class="tr-card suave"><div class="tr-lbl">Dica</div><p>Descubra suas forças e elas passam a aparecer aqui, ajudando no desafio.</p><div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="openTool('forcas')">🎒 Descobrir minhas forças</button></div></div>`}
      <div class="campo"><label class="form-lbl" for="ms-refl">Ensine com suas palavras (opcional)</label><div class="form-hint">${esc(M.desafio.reflexao)} Explicar ajuda a fixar. Só você vê, a menos que libere os textos.</div>
        <textarea id="ms-refl" rows="3" maxlength="1500"></textarea></div>
      <button class="btn" type="button" onclick="concluirPratica()">Concluir a etapa</button>`;
  }
  window.scrollTo(0, 0);
}
function fimEtapaHTML(msg) {
  const w = $('ms-wrap'), proxima = ['a', 't', 'p'].find(k => !(getJogo().miss[_ms.mod] || {})[k]);
  w.innerHTML = cabecalhoEtapa() + `<div class="tr-card"><h3>Etapa concluída 🎉</h3><p>${esc(msg)}</p><div class="tr-acoes">
    ${proxima ? `<button class="tr-btn" type="button" onclick="abrirEtapa(${_ms.mod},'${proxima}')">Próxima: ${esc(NOMES_ETAPA[proxima])}</button>` : ''}
    <button class="tr-btn ghost" type="button" onclick="openModulo(${_ms.mod})">Voltar ao módulo</button></div></div>`;
  window.scrollTo(0, 0);
}
function fimAprender() { etapaFeita(_ms.mod, 'a'); fimEtapaHTML('Você concluiu a aula. Para fixar, vale treinar com as questões.'); }
function fimTreinar() {
  revAdicionar(MISSOES[_ms.mod].quiz.map(q => q.id)); etapaFeita(_ms.mod, 't');
  fimEtapaHTML('Essas questões voltam, aos poucos, na Revisão relâmpago, o que ajuda o cérebro a guardar o que você aprendeu.');
}
function concluirPratica() {
  const t = ($('ms-refl').value || '').trim(), rec = novoRegistro('missao'); rec.n.modulo = _ms.mod; if (t) rec.t.reflexao = t.slice(0, 1500);
  guardarRegistro(rec); etapaFeita(_ms.mod, 'p'); fimEtapaHTML('Praticar na vida real é o que faz a diferença. Leve o que viu para a sessão, se quiser.');
}

/* ── Revisão relâmpago ───────────────────────────────────────────────── */
let _rv = null;
function abrirRevisao() { _rv = { ids: revDevidas(), i: 0 }; goTo('revisao'); renderRevisao(); }
function renderRevisao() {
  const w = $('rv-wrap');
  if (!_rv.ids.length) { w.innerHTML = `<div class="hdr"><h1>⚡ Revisão relâmpago</h1><p>Retomar o que você aprendeu.</p></div><div class="tr-card" style="margin-top:14px"><h3>Nada para revisar agora</h3><p>Conforme você fizer as etapas “Treinar” das missões, as questões voltam aqui em intervalos crescentes.</p></div>`; return; }
  if (_rv.i >= _rv.ids.length) {
    jogoAtualiza(J => { ptsAdd(J, 'rev:' + today(), 5); J.revd[today()] = 1; });
    w.innerHTML = `<div class="hdr"><h1>⚡ Revisão relâmpago</h1><p>Feita.</p></div><div class="tr-card" style="margin-top:14px"><h3>Revisão concluída 🎉</h3><p>Voltar ao que se aprendeu, aos poucos, é uma das formas mais eficazes de fixar. Não tem placar: só importa ter revisto.</p>
      <div class="tr-acoes"><button class="tr-btn" type="button" onclick="goTo('home')">Voltar ao início</button></div></div>`; return;
  }
  const q = questaoPorId(_rv.ids[_rv.i]);
  w.innerHTML = `<div class="hdr"><h1>⚡ Revisão relâmpago</h1><p>Questão ${_rv.i + 1} de ${_rv.ids.length}</p></div><div class="bloco" style="margin-top:14px"><div id="rv-q"></div></div>`;
  renderQuestao($('rv-q'), q, ok => { revRegistra(_rv.ids[_rv.i], ok); _rv.i++; renderRevisao(); });
}

/* ── Forças ──────────────────────────────────────────────────────────── */
let _fo = null;
function renderForcas() {
  const ex = getForcas();
  _fo = { step: 1, top: ((ex && ex.top) || []).slice(), dev: ((ex && ex.dev) || []).slice() };
  _draft = { n: {}, c: {}, t: Object.assign({}, (ex && ex.t) || {}) };
  passoForcas();
}
function cartoesForcas(sel, bloqueadas) {
  return '<div class="fc-grid">' + TRILHA.FORCAS.map(f => `<button type="button" class="fc${sel.indexOf(f.id) >= 0 ? ' sel' : ''}" data-f="${esc(f.id)}"${bloqueadas.indexOf(f.id) >= 0 ? ' disabled' : ''} aria-pressed="${sel.indexOf(f.id) >= 0}">
    <span class="fc-e">${esc(f.e)}</span><strong>${esc(f.n)}</strong><small>${esc(f.d)}</small></button>`).join('') + '</div>';
}
function passoForcas() {
  const w = $('tool-wrap');
  if (_fo.step === 1) {
    w.innerHTML = `<div class="campo"><div class="pv-txt"><strong>Forças são jeitos de ser que te ajudam.</strong> Não existe força “certa”: escolha de <strong>1 a 5</strong> que mais parecem com você, mesmo que ainda não use sempre. Elas viram o seu equipamento na expedição.</div></div>
      ${cartoesForcas(_fo.top, [])}<div class="campo" style="margin-top:12px"><div class="esc-note" id="fo-cont">${_fo.top.length} de 5 escolhidas</div></div>
      <button class="btn" type="button" id="fo-prox"${_fo.top.length ? '' : ' disabled'} onclick="_fo.step=2;passoForcas()">Continuar</button>`;
  } else if (_fo.step === 2) {
    w.innerHTML = `<div class="campo"><div class="pv-txt">Agora, até <strong>2 forças que você quer desenvolver</strong>. Forças crescem com treino, como músculos.</div></div>
      ${cartoesForcas(_fo.dev, _fo.top)}<div class="campo" style="margin-top:12px"><div class="esc-note" id="fo-cont">${_fo.dev.length} de 2 escolhidas</div></div>
      <button class="btn" type="button" onclick="_fo.step=3;passoForcas()">Continuar</button><button class="btn ghost" type="button" onclick="_fo.step=1;passoForcas()" style="margin-top:0">Voltar</button>`;
  } else {
    let h = `<div class="campo"><div class="pv-txt">Para cada força, conte (se quiser) <strong>quando você a usou</strong> e <strong>como pode usar nesta semana</strong>. Tudo opcional.</div></div>`;
    _fo.top.forEach(id => {
      const f = TRILHA.FORCAS.find(x => x.id === id); if (!f) return;
      h += `<div class="bloco"><h3>${esc(f.e)} ${esc(f.n)}</h3>
        <label class="form-lbl" for="ex-${esc(id)}">Quando você usou essa força?</label><input type="text" id="ex-${esc(id)}" maxlength="${MAXTXT}" autocomplete="off" data-txt="ex_${esc(id)}" value="${esc(_draft.t['ex_' + id] || '')}">
        <label class="form-lbl" for="us-${esc(id)}" style="margin-top:10px">Como pode usar nesta semana?</label><input type="text" id="us-${esc(id)}" maxlength="${MAXTXT}" autocomplete="off" data-txt="uso_${esc(id)}" placeholder="Ex.: ${esc(f.uso)}" value="${esc(_draft.t['uso_' + id] || '')}"></div>`;
    });
    h += `<button class="btn" type="button" onclick="salvarForcas()">Salvar minha mochila</button><button class="btn ghost" type="button" onclick="_fo.step=2;passoForcas()" style="margin-top:0">Voltar</button>`;
    w.innerHTML = h;
  }
}
function salvarForcas() {
  const t = {}; _fo.top.forEach(id => { ['ex_', 'uso_'].forEach(p => { const v = String(_draft.t[p + id] || '').trim().slice(0, MAXTXT); if (v) t[p + id] = v; }); });
  wr(K.forcas, { ts: Date.now(), top: _fo.top.slice(), dev: _fo.dev.slice(), t: t });
  jogoAtualiza(J => ptsAdd(J, 'forcas:desc', 20)); concluirTarefa();
  fimTela('Mochila montada 🎒', 'Suas forças vão aparecer nas missões e no seu acampamento. Use a “Força do dia” para treiná-las.');
}
$('tool-wrap').addEventListener('click', ev => {
  const b = ev.target.closest('[data-f]'); if (!b || !_fo || _ft.id !== 'forcas') return;
  const id = b.dataset.f, lista = _fo.step === 1 ? _fo.top : _fo.dev, max = _fo.step === 1 ? 5 : 2, i = lista.indexOf(id);
  if (i >= 0) lista.splice(i, 1); else if (lista.length < max) lista.push(id); else { toast('Máximo de ' + max + '. Desmarque uma para trocar.'); return; }
  b.classList.toggle('sel', i < 0); b.setAttribute('aria-pressed', String(i < 0));
  const c = $('fo-cont'); if (c) c.textContent = lista.length + ' de ' + max + ' escolhidas';
  const p = $('fo-prox'); if (p) p.disabled = !_fo.top.length;
});

/* ── Mochila de recursos (só da pessoa) ──────────────────────────────── */
let _rcCat = 'pessoas';
function renderRecursos() {
  const lista = rd(K.recursos, []);
  let h = `<div class="campo"><div class="pv-txt">Recursos são o que te sustenta: <strong>pessoas</strong>, <strong>lugares</strong>, <strong>atividades</strong>, <strong>o que você já superou</strong> e <strong>o que você sabe fazer</strong>. Esta mochila é só sua.</div></div>
    <div class="campo"><div class="chips" role="group" aria-label="Categoria">${TRILHA.OPTS.CAT_RECURSOS.map(o => `<button type="button" class="chip${o.v === _rcCat ? ' sel' : ''}" aria-pressed="${o.v === _rcCat}" data-rc="${esc(o.v)}">${esc(o.l)}</button>`).join('')}</div></div>
    <div class="li-add"><input type="text" id="rc-novo" maxlength="${MAXTXT}" autocomplete="off" aria-label="Novo recurso" placeholder="Escreva um recurso"><button class="tr-btn" type="button" onclick="addRecurso()">Adicionar</button></div>`;
  TRILHA.OPTS.CAT_RECURSOS.forEach(c => {
    const its = lista.filter(x => x.cat === c.v); if (!its.length) return;
    h += `<div class="hist-d">${esc(c.l)}</div>` + its.map(it => `<div class="li"><div class="li-t">${esc(it.t.item)}</div><button class="li-x" type="button" aria-label="Remover" onclick="removerRecurso('${esc(it.id)}')">✕</button></div>`).join('');
  });
  $('tool-wrap').innerHTML = h;
  const inp = $('rc-novo'); if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') addRecurso(); });
}
function addRecurso() {
  const v = $('rc-novo').value.trim(); if (!v) { toast('Escreva algo primeiro.'); return; }
  const l = rd(K.recursos, []); l.push({ id: uid(), ts: Date.now(), cat: _rcCat, t: { item: v } }); wr(K.recursos, l); pontuaUso('recursos'); renderRecursos();
}
function removerRecurso(id) { wr(K.recursos, rd(K.recursos, []).filter(x => x.id !== id)); renderRecursos(); }
$('tool-wrap').addEventListener('click', ev => { const b = ev.target.closest('[data-rc]'); if (b && _ft && _ft.id === 'recursos') { _rcCat = b.dataset.rc; renderRecursos(); } });

/* ── Home e acampamento ──────────────────────────────────────────────── */
function renderJogoHome() {
  const J = getJogo(), xp = xpDe(J), ni = nivelInfo(xp), pet = TRILHA.COMPANHEIROS.find(c => c.id === J.pet) || TRILHA.COMPANHEIROS[0], f = getForcas();
  let h = `<div class="tr-card nivel" onclick="goTo('eu')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')goTo('eu')"><div class="nv-pet">${esc(pet.e)}</div>
    <div style="flex:1;min-width:0"><div class="tr-lbl">Nível · ${esc(ni.n.nome)}</div><div class="xpbar" aria-hidden="true"><i style="width:${ni.pct}%"></i></div>
    <div class="nv-t">${esc(String(xp))} de energia${ni.prox ? ' · faltam ' + ni.falta + ' para ' + esc(ni.prox.nome) : ' · você chegou ao topo do mapa'}</div></div></div>`;
  const dev = revDevidas().length;
  if (dev) h += `<div class="tr-card"><div class="tr-lbl">Opcional · 2 minutos</div><h3>⚡ Revisão relâmpago</h3><p>${dev} questão${dev > 1 ? 'ões' : ''} das suas missões para rever.</p><div class="tr-acoes"><button class="tr-btn" type="button" onclick="abrirRevisao()">Rever agora</button></div></div>`;
  if (typeof treinoHomeHTML === 'function') h += treinoHomeHTML();
  h += f && f.top && f.top.length
    ? `<div class="tr-card suave"><div class="tr-lbl">Força do dia</div><h3>🌟 Qual força você usou hoje?</h3><p>Notar suas forças em gestos pequenos é o que as faz crescer.</p><div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="openTool('forca')">Registrar</button></div></div>`
    : `<div class="tr-card suave"><div class="tr-lbl">Para começar</div><h3>🎒 Descubra suas forças</h3><p>Escolha o que você tem de melhor e ganhe seu equipamento da expedição (10 minutos).</p><div class="tr-acoes"><button class="tr-btn" type="button" onclick="openTool('forcas')">Descobrir</button></div></div>`;
  $('h-jogo').innerHTML = h;
}
function setPet(id) {
  const c = TRILHA.COMPANHEIROS.find(x => x.id === id), J = getJogo(); if (!c || c.nivel > nivelDe(xpDe(J))) return;
  J.pet = id; wr(K.jogo, J); renderCamp(); toast(c.e + ' ' + c.nome + ' agora te acompanha.');
}
function renderCamp() {
  const J = getJogo(), xp = xpDe(J), ni = nivelInfo(xp), pet = TRILHA.COMPANHEIROS.find(c => c.id === J.pet) || TRILHA.COMPANHEIROS[0], f = getForcas();
  let h = `<div class="bloco camp"><div class="camp-pet">${esc(pet.e)}</div><div class="tr-lbl" style="text-align:center">Seu acampamento</div>
    <h3 style="text-align:center;font-size:19px">${esc(ni.n.emoji)} ${esc(ni.n.nome)}</h3><div class="xpbar" aria-hidden="true"><i style="width:${ni.pct}%"></i></div>
    <p class="pv-txt" style="text-align:center">${xp} de energia${ni.prox ? ' · faltam ' + ni.falta + ' para ' + esc(ni.prox.nome) : ''}. A energia só sobe: nada se perde.</p>
    <div class="chips" style="justify-content:center;margin-top:10px">${TRILHA.COMPANHEIROS.map(c => c.nivel <= ni.i
      ? `<button type="button" class="chip${c.id === pet.id ? ' sel' : ''}" aria-pressed="${c.id === pet.id}" onclick="setPet('${esc(c.id)}')">${esc(c.e)} ${esc(c.nome)}</button>`
      : `<span class="chip trava" title="Disponível no nível ${esc(TRILHA.NIVEIS[c.nivel].nome)}">🔒 ${esc(TRILHA.NIVEIS[c.nivel].nome)}</span>`).join('')}</div></div>`;

  h += `<div class="sdiv">Minhas habilidades socioemocionais</div><div class="bloco">` + TRILHA.HABILIDADES.map(hb => {
    const mods = TRILHA.MODULOS.filter(m => MISSOES[m.id].hab.indexOf(hb.id) >= 0);
    const soma = mods.reduce((a, m) => a + etapasFeitas(J, m.id) / 3, 0), pct = mods.length ? Math.round(soma / mods.length * 100) : 0;
    return `<div class="hab"><div class="hab-t"><span>${esc(hb.emoji)} <strong>${esc(hb.nome)}</strong></span><span>${pct}%</span></div><div class="xpbar" aria-hidden="true"><i style="width:${pct}%"></i></div><div class="hab-d">${esc(hb.desc)}</div></div>`;
  }).join('') + `<p class="pv-txt">Crescem conforme você completa as missões e pratica na vida real.</p></div>`;

  const ganhas = MEDALHAS.filter(m => J.med[m.id]).length;
  h += `<div class="sdiv">Medalhas · ${ganhas} de ${MEDALHAS.length}</div><div class="med-grid">` + MEDALHAS.map(m => J.med[m.id]
    ? `<div class="med on" title="${esc(m.d)}"><span class="med-e">${esc(m.e)}</span><span class="med-n">${esc(m.n)}</span></div>`
    : `<div class="med" title="${esc(m.d)}"><span class="med-e">❔</span><span class="med-n">${esc(m.n)}</span></div>`).join('') + `</div>`;

  h += `<div class="sdiv">Minha mochila</div><div class="bloco">`;
  if (f && f.top && f.top.length) {
    h += `<h3>Minhas forças</h3><div class="chips">${f.top.map(id => { const x = TRILHA.FORCAS.find(y => y.id === id); return x ? `<span class="chip sel">${esc(x.e)} ${esc(x.n)}</span>` : ''; }).join('')}</div>`;
    if (f.dev && f.dev.length) h += `<h3 style="margin-top:12px">Quero desenvolver</h3><div class="chips">${f.dev.map(id => { const x = TRILHA.FORCAS.find(y => y.id === id); return x ? `<span class="chip">${esc(x.e)} ${esc(x.n)}</span>` : ''; }).join('')}</div>`;
  } else h += `<p>Você ainda não descobriu suas forças.</p>`;
  h += `<div class="tr-acoes"><button class="tr-btn" type="button" onclick="openTool('forcas')">${f && f.top && f.top.length ? 'Rever minhas forças' : '🎒 Descobrir minhas forças'}</button><button class="tr-btn ghost" type="button" onclick="openTool('recursos')">Meus recursos</button></div></div>`;
  $('eu-camp').innerHTML = h;
}
