/* ═══════════════════════════════════════════════════════════════════════
   Aurora — app.js
   Mesma arquitetura do Farol e do Floresça: HTML/CSS/JS puros (sem build), dados no
   localStorage, SCREENS + goTo(), uma render*() por tela, toast, modal, onboarding e
   service worker. Veja ARQUITETURA.md.

   Adaptado à depressão e à ativação comportamental (diferenças de propósito):
   • SEM XP, níveis ou medalhas, e sem "sequência" que se quebra: quem está sem energia não
     deve ser cobrado nem se sentir punido por um dia ruim. O progresso é descritivo.
   • Decisões mínimas: a tela inicial sugere UM passo pequeno por dia.
   • Retorno sem culpa depois de uma pausa.
   • Apoio de crise sempre à mão (botão na tela inicial e na aba Aprender).
   • Chaves de dados separadas (depressao_app_*), idênticas às do Aurora anterior, para quem já
     usava o app não perder nada e para o login/sincronização/painel funcionarem sem adaptação.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Dados ───────────────────────────────────────────────────────────── */
const K = {
  mood:  'depressao_app_mood_history',     // { 'AAAA-MM-DD': { rating, note, timestamp } }
  log:   'depressao_app_activities_log',   // { 'AAAA-MM-DD': [idsFeitos] }
  sched: 'depressao_app_scheduled',        // { 'AAAA-MM-DD': [idsProgramados] }
  grat:  'depressao_app_gratitude',        // { 'AAAA-MM-DD': { items:[3 textos], timestamp } }
  esc:   'depressao_app_escalas',          // { pre:{phq9:{…}}, pos:{phq9:{…}} }
  ob:    'depressao_app_ob'                // { feito:true, data }
};
const MOODS = [
  { v: 1, e: '😞', l: 'Muito baixo' }, { v: 2, e: '😔', l: 'Baixo' }, { v: 3, e: '😐', l: 'Neutro' },
  { v: 4, e: '🙂', l: 'Bem' },         { v: 5, e: '😊', l: 'Muito bem' }
];
const MOOD_COLORS = ['', '#B85550', '#D96C63', '#C47D2A', '#5E7D73', '#3D5A52'];
const GREETINGS = [
  'Como você está se sentindo agora?', 'Que bom ter você aqui.', 'Cada dia que você chega aqui conta.', 'Você importa. Como está hoje?'
];
const PROMPTS = [
  'O que foi um pouco melhor do que o esperado hoje?',
  'Que pequena coisa trouxe algum alívio ou conforto?',
  'Teve algum momento de conexão, mesmo que breve?',
  'O que você fez hoje que levou algum esforço?',
  'O que você notou ao seu redor que foi agradável?',
  'Houve algo que o fez sorrir, mesmo que por pouco?',
  'Que pensamento gentil você teve hoje — sobre você ou alguém?'
];

function rd(k, fb) { try { const r = localStorage.getItem(k); return r !== null ? JSON.parse(r) : fb; } catch (e) { return fb; } }
function wr(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) { console.warn('[Aurora] não consegui salvar:', e.message); if (typeof toast === 'function') toast('⚠️ Não foi possível guardar neste aparelho.'); }
}
const getMood = () => rd(K.mood, {});
const getLog = () => rd(K.log, {});
const getSched = () => rd(K.sched, {});
const getGrat = () => rd(K.grat, {});
const getEsc = () => rd(K.esc, {});

function pad(n) { return String(n).padStart(2, '0'); }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }   // data LOCAL (o app anterior usava UTC)
function today() { return iso(new Date()); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function $(id) { return document.getElementById(id); }
function fmtDay(d, long) {
  const x = new Date(d + 'T12:00:00');
  return x.toLocaleDateString('pt-BR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
}
function activityById(id) { return ACTIVITIES.find(a => a.id === id); }

function saveMood(rating, note) {
  const h = getMood(), t = today(), prev = h[t] || {};
  h[t] = { rating: rating != null ? rating : prev.rating, note: note != null ? note : (prev.note || ''), timestamp: Date.now() };
  wr(K.mood, h);
}
function toggleSched(id, date) {
  const d = date || today(), s = getSched(); s[d] = s[d] || [];
  const i = s[d].indexOf(id); if (i >= 0) s[d].splice(i, 1); else s[d].push(id);
  wr(K.sched, s);
}
function toggleDone(id, date) {
  const d = date || today(), l = getLog(); l[d] = l[d] || [];
  const i = l[d].indexOf(id);
  if (i >= 0) { l[d].splice(i, 1); wr(K.log, l); return false; }
  l[d].push(id); wr(K.log, l);
  const s = getSched(); s[d] = s[d] || [];
  if (s[d].indexOf(id) < 0) { s[d].push(id); wr(K.sched, s); }       // fazer sem ter programado também conta como programado
  return true;
}
function daysWithRecord() {
  const set = new Set(Object.keys(getMood()));
  const l = getLog(); Object.keys(l).forEach(d => { if (l[d] && l[d].length) set.add(d); });
  return set;
}

/* ── Navegação ───────────────────────────────────────────────────────── */
const SCREENS = ['home', 'activate', 'diary', 'feel', 'learn', 'progress', 'assess', 'dados'];
function goTo(s) {
  SCREENS.forEach(id => { $('scr-' + id)?.classList.remove('on'); $('nb-' + id)?.classList.remove('on'); });
  const scr = $('scr-' + s); if (!scr) return;
  scr.classList.add('on');
  $('nb-' + s)?.classList.add('on');
  window.scrollTo(0, 0); scr.scrollTop = 0;
  if (s === 'home') renderHome();
  if (s === 'activate') renderActivate();
  if (s === 'diary') { _dDate = null; _dRating = undefined; _gEdit = false; renderDiary(); }
  if (s === 'feel') renderFeel();
  if (s === 'learn') renderLearn();
  if (s === 'progress') renderProgress();
  if (s === 'assess') renderAssess();
}

/* ── Toast e modal ───────────────────────────────────────────────────── */
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2800); }
function showModal(title, bodyHTML, actionsHTML) {
  $('modal-title').textContent = title; $('modal-body').innerHTML = bodyHTML; $('modal-actions').innerHTML = actionsHTML;
  $('modal-ov').classList.add('on');
}
function closeModal(e) { if (!e || e.target === $('modal-ov')) $('modal-ov').classList.remove('on'); }
function crisisBoxHTML(titulo) {
  return `<div class="crisis-box"><div class="crisis-title">${esc(titulo)}</div>
    <div>Ligue <a href="tel:188">188 (CVV)</a>, gratuito, 24 horas, ou use o chat em <a href="https://cvv.org.br" target="_blank" rel="noopener">cvv.org.br</a>.
    Em risco imediato, ligue <a href="tel:192">192 (SAMU)</a> ou vá a um pronto-socorro.</div></div>`;
}
function openCrisis() {
  showModal('Você não está sozinho/a',
    `<p style="text-align:left;margin-bottom:10px">Se você está em sofrimento agora, falar com alguém pode ajudar. Você não precisa explicar tudo.</p>${crisisBoxHTML('Ajuda agora')}`,
    `<a class="btn" href="tel:188" style="text-align:center;text-decoration:none">Ligar para o 188 (CVV)</a>
     <a class="btn ghost" href="tel:192" style="text-align:center;text-decoration:none;margin:0">Ligar para o 192 (SAMU)</a>
     <button class="btn ghost" style="margin:0" onclick="closeModal();goTo('learn')">Ver mais informações</button>
     <button class="btn ghost" style="margin:0" onclick="closeModal()">Fechar</button>`);
}

/* ═══════════════ HOJE ═══════════════ */
let _stepOffset = 0;
function moodPickerHTML(sel) {
  return MOODS.map(m => `<button class="mood-btn" role="radio" aria-checked="${sel === m.v}" onclick="pickMood(${m.v})"><span class="mo-e">${m.e}</span><span class="mo-l">${m.l}</span></button>`).join('');
}
function pickMood(v) { saveMood(v); toast('Humor registrado. Obrigado/a por contar.'); renderHome(); }

function renderHome() {
  const now = new Date(), h = now.getHours();
  $('h-date').textContent = fmtDay(today(), true);
  $('h-hi').textContent = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  $('h-sub').textContent = GREETINGS[now.getDate() % GREETINGS.length];

  const t = today(), mood = getMood()[t], sel = mood ? mood.rating : null;
  $('h-mood').innerHTML = moodPickerHTML(sel);
  const mo = MOODS.find(m => m.v === sel);
  $('h-mood-cap').textContent = mo ? 'Hoje: ' + mo.l : 'Toque no rosto que mais combina com agora.';

  const log = getLog(), sched = getSched();
  $('hs-days').textContent = daysWithRecord().size;
  $('hs-done').textContent = Object.keys(log).reduce((a, d) => a + (log[d] || []).length, 0);
  $('hs-today').textContent = (sched[t] || []).length;

  renderNudge(); renderStep(); renderToday(); renderMoodChart();
  const e = getEsc(), p = e.pos && e.pos.phq9 || e.pre && e.pre.phq9;
  $('h-assess-sub').textContent = p ? 'Já respondida · ver' : 'PHQ-9 · opcional, 3 min';
}

// Retorno sem culpa: depois de uma pausa, acolhe em vez de cobrar.
function renderNudge() {
  const el = $('h-nudge'), dias = [...daysWithRecord()].sort();
  if (!dias.length) { el.innerHTML = ''; return; }
  const ult = new Date(dias[dias.length - 1] + 'T12:00:00'), gap = Math.floor((Date.now() - ult.getTime()) / 864e5);
  el.innerHTML = gap >= 3
    ? `<div class="insight-c l"><div class="insight-t">Que bom ver você de novo</div><div class="insight-b">Pausas acontecem, principalmente em fases difíceis. Não é preciso recuperar nada: um passo pequeno hoje já basta.</div></div>`
    : '';
}

// Um passo pequeno por dia: reduz a decisão (e o peso) de escolher entre dezenas de atividades.
function suggestionList() {
  const t = today(), feitas = getLog()[t] || [];
  return ACTIVITIES.filter(a => { const m = parseInt(a.duration, 10); return m && m <= 10 && feitas.indexOf(a.id) < 0; });
}
function renderStep() {
  const el = $('h-step'), lista = suggestionList();
  if (!lista.length) { el.innerHTML = ''; return; }
  const d = new Date(), doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const a = lista[(doy + _stepOffset) % lista.length], cat = CATEGORIES[a.category];
  const jaProg = (getSched()[today()] || []).indexOf(a.id) >= 0;
  el.innerHTML = `<div class="step-card"><div class="st-lbl">Um passo pequeno para hoje</div>
    <div class="st-t">${esc(a.label)}</div><div class="st-m">${cat.emoji} ${esc(cat.label)} · ${esc(a.duration)}</div>
    ${jaProg ? '<button class="btn ghost" disabled style="opacity:.7">Já está na sua lista de hoje ✓</button>' : `<button class="btn" onclick="stepAdd('${a.id}')">Programar para hoje</button>`}
    <button class="btn ghost" style="margin:8px 0 0" onclick="stepOther()">Outra ideia</button></div>`;
}
function stepAdd(id) { toggleSched(id); toast('Adicionado à sua lista de hoje.'); renderHome(); }
function stepOther() { _stepOffset++; renderStep(); }

function renderToday() {
  const el = $('h-today'), t = today(), ids = getSched()[t] || [], done = getLog()[t] || [];
  if (!ids.length) {
    el.innerHTML = `<div class="act-empty">Nenhuma atividade na sua lista de hoje ainda.<br><button class="btn ghost" style="margin-top:10px;width:auto;padding:9px 18px" onclick="goTo('activate')">Escolher atividades</button></div>`;
    return;
  }
  el.innerHTML = ids.map(id => actRow(id, done.indexOf(id) >= 0, 'homeDone')).join('');
}
function homeDone(id) { const f = toggleDone(id); if (f) toast('Feito. Isso conta!'); renderHome(); }

function actRow(id, isDone, fn) {
  const a = activityById(id); if (!a) return '';
  const c = CATEGORIES[a.category];
  return `<div class="act${isDone ? ' done' : ''}"><button class="act-ck" aria-label="${isDone ? 'Desmarcar' : 'Marcar como feito'}: ${esc(a.label)}" onclick="${fn}('${id}')">${isDone ? '✓' : ''}</button>
    <div class="act-body"><div class="act-t">${esc(a.label)}</div><div class="act-meta"><span class="act-cat">${c.emoji} ${esc(c.label)}</span><span>${esc(a.duration)}</span></div></div></div>`;
}

function renderMoodChart() {
  const svg = $('h-chart'), empty = $('h-chart-empty'), h = getMood(), dias = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dias.push({ d: iso(d), w: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }) }); }
  const algum = dias.some(x => h[x.d] && h[x.d].rating);
  svg.style.display = algum ? '' : 'none'; empty.style.display = algum ? 'none' : '';
  if (!algum) { svg.innerHTML = ''; return; }
  svg.innerHTML = dias.map((x, i) => {
    const r = h[x.d] && h[x.d].rating, bx = 14 + i * 44, ht = r ? Math.round(r / 5 * 46) : 4, fill = r ? MOOD_COLORS[r] : 'rgba(63,67,75,.12)';
    return `<rect x="${bx}" y="${54 - ht}" width="28" height="${ht}" rx="6" fill="${fill}"/><text x="${bx + 14}" y="68" text-anchor="middle" font-size="9" fill="#6B7280" font-family="inherit">${esc(x.w)}</text>`;
  }).join('');
}

/* ═══════════════ ATIVAR ═══════════════ */
let _aFilter = 'all', _aOnlyToday = false;
const _aOpen = new Set();
function renderActivate() {
  const chips = [['all', '✨', 'Todas']].concat(Object.keys(CATEGORIES).map(k => [k, CATEGORIES[k].emoji, CATEGORIES[k].label]));
  $('a-filters').innerHTML = chips.map(c => `<button class="chip${_aFilter === c[0] ? ' sel' : ''}" onclick="setFilter('${c[0]}')">${c[1]} ${esc(c[2])}</button>`).join('');
  const t = today(), sched = getSched()[t] || [], done = getLog()[t] || [];
  let lista = ACTIVITIES.filter(a => _aFilter === 'all' || a.category === _aFilter);
  if (_aOnlyToday) lista = lista.filter(a => sched.indexOf(a.id) >= 0);
  $('a-count').innerHTML = `<span>${lista.length} atividades · ${sched.length} para hoje · ${done.length} feitas</span>
    <button class="chip${_aOnlyToday ? ' sel' : ''}" onclick="toggleOnlyToday()">Só hoje</button>`;
  $('a-list').innerHTML = lista.length ? lista.map(a => {
    const isDone = done.indexOf(a.id) >= 0, isSched = sched.indexOf(a.id) >= 0, c = CATEGORIES[a.category], open = _aOpen.has(a.id);
    return `<div class="act${isDone ? ' done' : ''}">
      <button class="act-ck" aria-label="${isDone ? 'Desmarcar' : 'Marcar como feito'}: ${esc(a.label)}" onclick="actDone('${a.id}')">${isDone ? '✓' : ''}</button>
      <div class="act-body"><div class="act-t">${esc(a.label)}</div>
        <div class="act-meta"><span class="act-cat">${c.emoji} ${esc(c.label)}</span><span>${esc(a.duration)}</span></div>
        <button class="act-why" aria-expanded="${open}" onclick="toggleWhy('${a.id}')">Por que funciona?</button>
        ${open ? `<div class="act-ev">${esc(a.evidence)}</div>` : ''}</div>
      <button class="act-plus${isSched ? ' on' : ''}" aria-pressed="${isSched}" onclick="actSched('${a.id}')">${isSched ? 'Na lista' : '+ Hoje'}</button></div>`;
  }).join('') : '<div class="act-empty">Nenhuma atividade na sua lista de hoje ainda.</div>';
}
function setFilter(k) { _aFilter = k; renderActivate(); }
function toggleOnlyToday() { _aOnlyToday = !_aOnlyToday; renderActivate(); }
function toggleWhy(id) { if (_aOpen.has(id)) _aOpen.delete(id); else _aOpen.add(id); renderActivate(); }
function actSched(id) { toggleSched(id); renderActivate(); }
function actDone(id) { const f = toggleDone(id); if (f) toast('Feito. Isso conta!'); renderActivate(); }

/* ═══════════════ REGISTRAR (humor + 3 coisas boas) ═══════════════ */
let _dDate = null, _dPage = 0, _dRating;   // _dRating undefined = ainda não carregado do armazenamento
function renderDiary() {
  if (!_dDate) _dDate = today();
  const t = today(), isToday = _dDate === t, m = getMood()[_dDate], g = getGrat()[_dDate];
  if (_dRating === undefined) _dRating = m ? m.rating : null;
  const mo = MOODS.find(x => x.v === _dRating);
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length];
  const itens = g && g.items ? g.items.concat(['', '', '']).slice(0, 3) : ['', '', ''];
  const gSaved = g && g.items && g.items.some(x => x && x.trim());

  $('d-form').innerHTML = `
    ${!isToday ? `<div class="insight-c l" style="margin:0 0 12px"><div class="insight-t">${esc(fmtDay(_dDate, true))}</div><div class="insight-b">Você está vendo um dia anterior. <a href="#" onclick="event.preventDefault();pickDay('${t}')" style="color:var(--mint-d);font-weight:800">Voltar para hoje</a></div></div>` : ''}
    <div class="card"><div class="card-lbl">📓 Humor${isToday ? '' : ' desse dia'}</div>
      <div class="mood-row" role="radiogroup" aria-label="Humor">${MOODS.map(x => `<button class="mood-btn" role="radio" aria-checked="${_dRating === x.v}" ${isToday ? `onclick="dMood(${x.v})"` : 'disabled'}><span class="mo-e">${x.e}</span><span class="mo-l">${x.l}</span></button>`).join('')}</div>
      <div class="mood-caption">${mo ? esc(mo.l) : ''}</div>
      <textarea class="d-note" id="d-note" maxlength="500" ${isToday ? '' : 'readonly'} placeholder="${isToday ? 'Como foi o dia? O que estava acontecendo? (opcional)' : 'Sem nota registrada.'}" aria-label="Nota do dia">${esc(m ? m.note : '')}</textarea>
      ${isToday ? `<button class="btn" style="margin-top:10px" ${_dRating ? '' : 'disabled'} onclick="dSaveMood()">${m ? 'Atualizar humor' : 'Salvar humor'}</button>` : ''}</div>
    <div class="card"><div class="card-lbl">✨ 3 coisas boas</div>
      <div class="as-note" style="margin-bottom:10px">“${esc(prompt)}”</div>
      ${gSaved && !(_gEdit && isToday)
        ? itens.map((x, i) => x.trim() ? `<div class="g-saved"><strong>${i + 1}.</strong> ${esc(x)}</div>` : '').join('') + (isToday ? '<button class="btn ghost" style="margin-top:10px" onclick="gEdit()">Editar</button>' : '')
        : itens.map((x, i) => `<div class="g-field"><span>${i + 1}.</span><input type="text" id="g-${i}" maxlength="140" value="${esc(x)}" ${isToday ? '' : 'disabled'} placeholder="Algo bom do dia ${i + 1}…" aria-label="Algo bom ${i + 1}"></div>`).join('') + (isToday ? '<button class="btn" style="margin-top:6px" onclick="gSave()">Salvar</button>' : '')}
    </div>`;

  // histórico (30 dias, 7 por página)
  const dias = []; for (let i = 0; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() - i); dias.push(iso(d)); }
  const page = dias.slice(_dPage * 7, _dPage * 7 + 7), hm = getMood(), hg = getGrat(), hl = getLog();
  $('d-hist').innerHTML = `<div class="sdiv">Histórico</div>` + page.map(d => {
    const e = hm[d], gg = hg[d], n = (hl[d] || []).length, ee = e && MOODS.find(x => x.v === e.rating);
    const partes = []; if (e && e.note) partes.push(esc(e.note.length > 60 ? e.note.slice(0, 60) + '…' : e.note)); if (gg && gg.items) partes.push(gg.items.filter(x => x && x.trim()).length + ' coisas boas'); if (n) partes.push(n + (n === 1 ? ' atividade' : ' atividades'));
    return `<button class="d-day${d === _dDate ? ' sel' : ''}" onclick="pickDay('${d}')"><span class="dd-e">${ee ? ee.e : '·'}</span><span><div class="dd-t">${d === t ? 'Hoje' : esc(fmtDay(d))}${ee ? ' · ' + esc(ee.l) : ''}</div><div class="dd-s">${partes.length ? partes.join(' · ') : 'Sem registro'}</div></span></button>`;
  }).join('') + `<div class="d-pager"><button class="btn ghost" ${(_dPage + 1) * 7 >= dias.length ? 'disabled' : ''} onclick="dPage(1)">← Mais antigos</button><button class="btn ghost" ${_dPage === 0 ? 'disabled' : ''} onclick="dPage(-1)">Mais recentes →</button></div>`;
}
let _gEdit = false;
function pickDay(d) { _dDate = d; _gEdit = false; _dRating = undefined; renderDiary(); window.scrollTo(0, 0); }
function dPage(n) { _dPage = Math.max(0, _dPage + n); renderDiary(); }
function dMood(v) { _dRating = v; const n = $('d-note'); const keep = n ? n.value : ''; renderDiary(); const n2 = $('d-note'); if (n2) n2.value = keep; }
function dSaveMood() { if (!_dRating) return; saveMood(_dRating, $('d-note').value.trim()); toast('Humor salvo.'); renderDiary(); }
function gEdit() { _gEdit = true; renderDiary(); }
function gSave() {
  const items = [0, 1, 2].map(i => ($('g-' + i).value || '').trim());
  if (!items.some(Boolean)) { toast('Escreva pelo menos uma coisa boa.'); return; }
  const g = getGrat(); g[today()] = { items: items, timestamp: Date.now() }; wr(K.grat, g);
  _gEdit = false; toast('Salvo.'); renderDiary();
}

/* ═══════════════ SENTIR ═══════════════ */
const _fOpen = new Set(), _fStep = {};
function renderFeel() {
  $('f-list').innerHTML = EXERCISES.map(ex => {
    const open = _fOpen.has(ex.id), st = _fStep[ex.id];
    let corpo = '';
    if (open) {
      corpo = `<div class="acc-b"><div class="acc-theory">${esc(ex.theory)}</div>`;
      if (st === 'done') {
        corpo += `<div class="ex-done"><div style="font-size:1.8rem">🌱</div><div style="font-weight:800;margin:4px 0">Exercício concluído</div><div class="as-note">Cada prática fortalece novos padrões.</div><button class="btn ghost" style="margin-top:10px;width:auto;padding:9px 18px" onclick="exReset('${ex.id}')">Fazer novamente</button></div>`;
      } else if (typeof st === 'number') {
        corpo += `<div class="ex-guide"><div class="as-note">Passo ${st + 1} de ${ex.steps.length}</div><div class="ex-prog">${ex.steps.map((_, i) => `<span class="${i <= st ? 'on' : ''}"></span>`).join('')}</div><div class="ex-cur">${esc(ex.steps[st])}</div><button class="btn" onclick="exNext('${ex.id}')">${st < ex.steps.length - 1 ? 'Próximo passo' : 'Concluir'}</button></div>`;
      } else {
        corpo += `<div class="ex-steps">${ex.steps.map((s, i) => `<div class="ex-step"><span class="ex-n">${i + 1}</span><span>${esc(s)}</span></div>`).join('')}</div><button class="btn" style="margin-top:12px" onclick="exStart('${ex.id}')">Iniciar modo guiado</button>`;
      }
      corpo += '</div>';
    }
    return `<div class="acc${open ? ' open' : ''}"><button class="acc-h" aria-expanded="${open}" onclick="exToggle('${ex.id}')"><span class="acc-e">${ex.emoji}</span><span class="acc-tt"><div class="acc-t">${esc(ex.title)}</div><div class="acc-s">${esc(ex.duration)}</div></span><span class="acc-ar">⌄</span></button>${corpo}</div>`;
  }).join('');
}
function exToggle(id) { if (_fOpen.has(id)) _fOpen.delete(id); else _fOpen.add(id); renderFeel(); }
function exStart(id) { _fStep[id] = 0; renderFeel(); }
function exNext(id) { const ex = EXERCISES.find(e => e.id === id); if (_fStep[id] < ex.steps.length - 1) _fStep[id]++; else _fStep[id] = 'done'; renderFeel(); }
function exReset(id) { delete _fStep[id]; renderFeel(); }

/* ═══════════════ APRENDER ═══════════════ */
const _lOpen = new Set();
function renderLearn() {
  $('l-list').innerHTML = ARTICLES.map(a => {
    const open = _lOpen.has(a.id);
    return `<div class="acc${open ? ' open' : ''}${a.id === 'crisis' ? ' crisis' : ''}"><button class="acc-h" aria-expanded="${open}" onclick="artToggle('${a.id}')"><span class="acc-e">${a.emoji}</span><span class="acc-tt"><div class="acc-t">${esc(a.title)}</div><div class="acc-s">${esc(a.subtitle)}</div></span><span class="acc-ar">⌄</span></button>
      ${open ? `<div class="acc-b">${a.content.map(s => `<div class="acc-sec"><h4>${esc(s.heading)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div>` : ''}</div>`;
  }).join('');
}
function artToggle(id) { if (_lOpen.has(id)) _lOpen.delete(id); else _lOpen.add(id); renderLearn(); }

/* ═══════════════ PROGRESSO ═══════════════ */
function estadoPainel() {
  const lista = (o, f) => Object.keys(o || {}).sort().map(d => f(d, o[d]));
  return {
    humor: lista(getMood(), (d, v) => ({ date: d, rating: v && v.rating, ts: v && v.timestamp, note: v && v.note })),
    feitas: lista(getLog(), (d, ids) => ({ date: d, ids: ids })),
    agendadas: lista(getSched(), (d, ids) => ({ date: d, ids: ids })),
    gratidao: lista(getGrat(), (d, v) => ({ date: d, n: v && v.items ? v.items.length : 0, ts: v && v.timestamp, items: v && v.items })),
    escalas: getEsc()
  };
}
function renderProgress() {
  const el = $('p-content');
  el.innerHTML = `<div class="insight-c"><div class="insight-t">Sem cobrança</div><div class="insight-b">Aqui você vê o seu humor e as suas atividades ao longo das semanas. Dias mais difíceis fazem parte do caminho e não apagam o que você já fez.</div></div><div id="p-painel" style="padding:0 16px"></div>
    <div class="sdiv">Levar com você</div><div style="padding:0 16px">
    <button class="btn ghost-mint" onclick="exportCSV()">Baixar humor e atividades (CSV)</button>
    <button class="btn ghost" style="margin-top:0" onclick="exportJSON()">Baixar tudo (JSON)</button></div>`;
  if (window.AuroraPainel) $('p-painel').appendChild(AuroraPainel.render(estadoPainel(), { textos: true }));
}

/* ═══════════════ AUTOAVALIAÇÃO (PHQ-9) ═══════════════ */
function semanasDesdePre() {
  const p = getEsc().pre && getEsc().pre.phq9; if (!p || !p.data) return null;
  return (Date.now() - new Date(p.data).getTime()) / (7 * 864e5);
}
function renderAssess() {
  const el = $('as-wrap'), e = getEsc(), pre = e.pre && e.pre.phq9, pos = e.pos && e.pos.phq9, ult = pos || pre;
  let h = '';
  if (ult && ult.item9 > 0) h += crisisBoxHTML('Se você precisar de ajuda agora') + '<div style="height:12px"></div>';
  h += `<div class="as-card"><div class="as-note">Um questionário curto e opcional (uns 3 minutos) sobre como você tem se sentido nas últimas 2 semanas. Serve para você acompanhar a si mesmo/a. <strong>Não é um diagnóstico</strong>, e não há resposta certa. O resultado não é enviado a ninguém, a menos que você compartilhe em "Minha conta".</div></div>`;
  [['Início', pre], ['Depois', pos]].forEach(par => {
    if (par[1]) h += `<div class="as-card"><div class="as-note">${par[0]} · ${esc(fmtDay(par[1].data.slice(0, 10)))}</div><div class="as-big">${par[1].total} de ${par[1].maximo}</div><div class="as-note">Quanto mais alto, mais sintomas nas últimas 2 semanas.</div></div>`;
  });
  if (pre && pos) { const d = pos.total - pre.total; h += `<div class="as-note" style="margin-bottom:12px">Diferença entre o início e agora: ${d > 0 ? '+' : ''}${d} ponto${Math.abs(d) === 1 ? '' : 's'}.</div>`; }
  const sem = semanasDesdePre();
  if (!pre) h += `<button class="btn" onclick="startPhq('pre')">Responder agora</button>`;
  else if (sem >= ESCALAS.phq9.reaplicacaoSemanas) h += `<button class="btn" onclick="startPhq('pos')">${pos ? 'Responder de novo' : 'Responder de novo, para comparar'}</button>`;
  else h += `<div class="as-note">Costuma-se esperar cerca de ${ESCALAS.phq9.reaplicacaoSemanas} semanas entre uma resposta e outra, para ver se algo mudou.</div><button class="btn ghost" style="margin-top:10px" onclick="startPhq('pos')">Responder mesmo assim</button>`;
  h += `<div class="as-note" style="margin-top:14px">Mesmo que o número seja baixo, se você está se sentindo mal há algumas semanas, vale conversar com um profissional de saúde.</div>`;
  el.innerHTML = h;
}
function startPhq(momento) {
  const el = $('as-wrap'); el.innerHTML = ''; window.scrollTo(0, 0);
  const box = document.createElement('div'); el.appendChild(box);
  Escala.render(box, ESCALAS.phq9, { onDone: res => phqFuncional(res, momento), onSkip: renderAssess });
}
function phqFuncional(res, momento) {
  const el = $('as-wrap'), D9 = ESCALAS.phq9; let esc_ = null; window.scrollTo(0, 0);
  el.innerHTML = `<div class="as-card as-func"><div style="font-weight:700;margin-bottom:10px;line-height:1.45">${esc(D9.funcional.pergunta)}</div>
    ${D9.funcional.opcoes.map((o, i) => `<label><input type="radio" name="func" value="${i}"> ${esc(o)}</label>`).join('')}</div>
    <button class="btn" id="func-ok" disabled>Concluir</button><button class="btn ghost" style="margin-top:8px" id="func-skip">Pular esta pergunta</button>`;
  el.querySelectorAll('input[name=func]').forEach(r => r.addEventListener('change', () => { esc_ = parseInt(r.value, 10); $('func-ok').disabled = false; }));
  $('func-ok').onclick = () => phqConcluir(res, momento, esc_);
  $('func-skip').onclick = () => phqConcluir(res, momento, null);
}
function phqConcluir(res, momento, funcional) {
  const reg = { id: 'phq9', versao: ESCALAS.phq9.versao, respostas: res.respostas, total: res.total, maximo: res.maximo, item9: res.respostas[ESCALAS.phq9.itemRisco - 1], funcional: funcional, data: res.data };
  const e = getEsc(); e[momento] = e[momento] || {}; e[momento].phq9 = reg; wr(K.esc, e);
  const el = $('as-wrap'); window.scrollTo(0, 0);
  let h = '';
  if (reg.item9 > 0) {
    h += `<div class="crisis-box" role="alert"><div class="crisis-title">Obrigado/a por contar o que está sentindo</div>
      <div>Você marcou que tem pensado em se ferir ou que seria melhor estar morto/a. Esses pensamentos são mais comuns do que parece, e você não precisa passar por isso sozinho/a.<br><br>
      Se você está em perigo agora, ligue <a href="tel:192">192 (SAMU)</a> ou vá a um pronto-socorro. Para conversar com alguém agora, ligue <a href="tel:188">188 (CVV, 24 horas, gratuito)</a> ou use o chat em <a href="https://cvv.org.br" target="_blank" rel="noopener">cvv.org.br</a>.<br><br>
      Se você já tem acompanhamento, conte para a sua psicóloga ou psicólogo o quanto antes. <strong>Este aplicativo não envia o seu resultado nem nenhum alerta a ninguém</strong>: só quem você escolher compartilhar em "Minha conta" o vê, e isso não substitui uma conversa.</div></div><div style="height:12px"></div>`;
  }
  h += `<div class="as-card"><div class="as-note">Sua pontuação</div><div class="as-big">${reg.total} de ${reg.maximo}</div><div class="as-note">Pontuações mais altas indicam mais sintomas nas últimas 2 semanas. É um retrato desse período, não um diagnóstico, e muda com o tempo.</div>`;
  const pre = e.pre && e.pre.phq9;
  if (momento === 'pos' && pre) { const d = reg.total - pre.total; h += `<div class="as-note" style="margin-top:8px">No início você respondeu ${pre.total}. ${d === 0 ? 'Agora está igual.' : d < 0 ? 'Agora está ' + Math.abs(d) + (Math.abs(d) === 1 ? ' ponto abaixo.' : ' pontos abaixo.') : 'Agora está ' + d + (d === 1 ? ' ponto acima.' : ' pontos acima.') + ' Isso também acontece, e vale conversar sobre isso com um profissional.'}</div>`; }
  h += `</div><div class="as-note" style="margin-bottom:12px">Mesmo que o número seja baixo, se você está se sentindo mal há algumas semanas, vale conversar com um profissional de saúde. Este aplicativo não envia o seu resultado a ninguém, a menos que você compartilhe em "Minha conta".</div>
    <button class="btn" onclick="goTo('home')">Continuar</button>`;
  el.innerHTML = h;
  el.insertAdjacentHTML('beforeend', `<div class="as-note" style="margin-top:14px;font-size:11.5px">${esc(ESCALAS.phq9.fonte)}</div>`);
}

/* ═══════════════ DADOS ═══════════════ */
function baixar(nome, tipo, texto) {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo })), a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJSON() {
  baixar('aurora-meus-dados.json', 'application/json', JSON.stringify({ exportado_em: new Date().toISOString(), humor: getMood(), atividades_feitas: getLog(), atividades_programadas: getSched(), gratidao: getGrat(), questionarios: getEsc() }, null, 2));
  toast('Arquivo baixado.');
}
function exportCSV() {
  const m = getMood(), l = getLog(), s = getSched(), datas = [...new Set([].concat(Object.keys(m), Object.keys(l), Object.keys(s)))].sort();
  const cel = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const nomes = ids => (ids || []).map(id => (activityById(id) || { label: id }).label).join('; ');
  const linhas = [['data', 'humor_1a5', 'nota', 'atividades_feitas', 'atividades_programadas'].map(cel).join(',')]
    .concat(datas.map(d => [d, m[d] ? m[d].rating : '', m[d] ? m[d].note : '', nomes(l[d]), nomes(s[d])].map(cel).join(',')));
  baixar('aurora-humor-e-atividades.csv', 'text/csv;charset=utf-8', '﻿' + linhas.join('\r\n'));
  toast('Arquivo baixado.');
}
function openModal(id) {
  if (id === 'del') {
    showModal('Apagar os dados deste aparelho?', 'Isso apaga humor, atividades, diário e questionários guardados <strong>neste aparelho</strong>, e não tem volta. Se você usa uma conta, os dados dela são apagados em "Minha conta". Baixe uma cópia antes, se quiser guardar.',
      '<button class="btn danger" onclick="deleteAll()">Sim, apagar</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>');
  }
}
function deleteAll() {
  [K.mood, K.log, K.sched, K.grat, K.esc].forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ok */ } });
  closeModal(); toast('Dados apagados deste aparelho.'); goTo('home');
}
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _installPrompt = e; });
function isInstalled() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function installApp() { if (!_installPrompt) return; _installPrompt.prompt(); _installPrompt.userChoice.finally(() => { _installPrompt = null; closeModal(); }); }
function showInstallModal() {
  if (isInstalled()) { showModal('🌅 Já está instalado!', 'Você já está usando o Aurora como app. É só procurar o ícone do sol nascendo na tela de início.', '<button class="btn mint" onclick="closeModal()">Ótimo!</button>'); return; }
  showModal('📲 Aurora na tela de início',
    '<p style="text-align:left;margin-bottom:10px">Com o atalho, o Aurora abre em tela cheia, como um app, e funciona até sem internet.</p>' +
    (_installPrompt ? '<p style="font-size:13px;color:var(--muted);text-align:left">Seu navegador instala com um toque. 👇</p>'
      : '<p style="font-size:13px;color:var(--muted);text-align:left"><strong>iPhone (Safari):</strong> toque em Compartilhar e depois em "Adicionar à Tela de Início".<br><strong>Android (Chrome):</strong> menu ⋮ e depois "Instalar app" ou "Adicionar à tela inicial".</p>'),
    (_installPrompt ? '<button class="btn mint" onclick="installApp()">Instalar agora</button>' : '') + `<button class="btn ${_installPrompt ? 'ghost' : 'mint'}" onclick="closeModal()">Entendi</button>`);
}

/* ═══════════════ ONBOARDING ═══════════════ */
function obNext(n) { document.querySelectorAll('.ob-slide').forEach(s => s.classList.remove('on')); $('obs' + n).classList.add('on'); }
function obSkip() { obDone(); }
function obDone() {
  wr(K.ob, { feito: true, data: new Date().toISOString() });
  $('onboard').classList.add('hide'); goTo('home');
}

/* ── Service worker (offline) ── */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('[Aurora] SW:', e.message));

/* ── Splash ── */
(function () {
  const splash = $('splash'); if (!splash) return;
  setTimeout(() => { splash.classList.add('out'); setTimeout(() => splash.classList.add('gone'), 460); }, 1800);
})();

/* ═══════════════ INIT ═══════════════ */
(function () {
  const ob = rd(K.ob, null), temDados = daysWithRecord().size > 0;
  if (ob && ob.feito || temDados) { $('onboard').classList.add('hide'); goTo('home'); }   // quem já usava o Aurora não vê a introdução de novo
  else { $('onboard').classList.remove('hide'); }
})();
