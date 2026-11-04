/* ═══════════════════════════════════════════════════════════════════════
   Trilha — ferramentas.js
   Telas das ferramentas. Formato dos registros (o banco só projeta esta forma, ver
   supabase/trilha.sql): { id, ts, date, f, n:{números}, c:{listas de ids}, t:{textos} }
   Regra: o que é número, escolha (id) ou texto vai em n, c ou t. Texto livre NUNCA vai em n/c,
   porque n e c chegam à profissional mesmo sem a permissão de textos.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

let _ft = null;                         // ferramenta aberta
let _ctx = { tarefa: null };            // tarefa combinada que originou a abertura
let _draft = { n: {}, c: {}, t: {} };   // rascunho do formulário

const MAXTXT = 300, MAXAREA = 1500;

function openTool(id, tarefaId) {
  const ft = ferramentaPorId(id); if (!ft) return;
  _ft = ft; _ctx = { tarefa: tarefaId || null }; _draft = { n: {}, c: {}, t: {} };
  $('tool-h1').textContent = ft.emoji + ' ' + ft.nome;
  $('tool-sub').textContent = ft.sub;
  goTo('tool');
  ({ form: renderForm, respirar: renderRespirar, aterrar: renderAterrar, lista: renderLista,
     escada: renderEscada, plano: renderPlano, semanal: renderSemanal, forcas: renderForcas, recursos: renderRecursos }[ft.tipo])(ft);
}
function concluirTarefa() {
  if (!_ctx.tarefa) return;
  const f = getFeitos(); if (!f[_ctx.tarefa]) { f[_ctx.tarefa] = Date.now(); wr(K.feitos, f); toast('Marcado como feito no que foi combinado.'); }
  _ctx.tarefa = null;
}
function guardarRegistro(rec) { const r = getRegs(); r.push(rec); wr(K.regs, r); if (typeof pontuarRegistro === 'function') pontuarRegistro(rec); }
function novoRegistro(f) { return { id: uid(), ts: Date.now(), date: today(), f: f, n: {}, c: {}, t: {} }; }
function fimTela(titulo, msg, extraHTML) {
  $('tool-wrap').innerHTML = `<div class="tr-card"><h3>${esc(titulo)}</h3><p>${esc(msg)}</p>${extraHTML || ''}
    <div class="tr-acoes"><button class="tr-btn" type="button" onclick="goTo('home')">Voltar ao início</button><button class="tr-btn ghost" type="button" onclick="openTool('${esc(_ft.id)}')">Fazer outro</button></div></div>
    <div class="insight-c l"><div class="insight-t">Levar para a sessão</div><div class="insight-b">Se quiser, mostre isso para sua psicóloga. Ela só vê o que você liberar em “Minha conta”.</div></div>`;
  $('scr-tool').scrollTop = 0; window.scrollTo(0, 0);
}

/* ── Escala 0–10 (opcional) ──────────────────────────────────────────── */
function escalaHTML(k, valor, maxV) {
  const max = maxV == null ? 10 : maxV;
  let h = `<div class="esc-row" role="group" style="grid-template-columns:repeat(${max + 1},1fr)" data-escrow="${k}">`;
  for (let i = 0; i <= max; i++) h += `<button type="button" class="esc-b${valor === i ? ' sel' : ''}" aria-pressed="${valor === i}" data-esc="${k}" data-v="${i}">${i}</button>`;
  return h + '</div>';
}

/* ── Formulário genérico ─────────────────────────────────────────────── */
function renderForm(ft) {
  let h = ft.intro ? `<div class="campo"><div class="pv-txt">${esc(ft.intro)}</div></div>` : '';
  ft.campos.forEach(c => {
    const id = 'f-' + c.k;
    h += `<div class="campo"><label class="form-lbl"${c.t === 'txt' || c.t === 'area' ? ` for="${id}"` : ''}>${esc(c.l)}</label>`;
    if (c.t === 'chips') {
      h += `<div class="chips" role="group" aria-label="${esc(c.l)}">` + TRILHA.OPTS[c.opts].map(o =>
        `<button type="button" class="chip" aria-pressed="false" data-chip="${c.k}" data-v="${o.v}">${o.e ? esc(o.e) + ' ' : ''}${esc(o.l)}</button>`).join('') + '</div>';
    } else if (c.t === 'esc') {
      h += escalaHTML(c.k, null) + `<div class="esc-leg"><span>0</span><span>10</span></div><div class="esc-note">Opcional. Toque de novo para limpar.</div>`;
    } else if (c.t === 'txt') {
      h += `<input type="text" id="${id}" maxlength="${MAXTXT}" autocomplete="off" placeholder="${esc(c.ph || '')}" data-txt="${c.k}">`;
    } else {
      h += `<textarea id="${id}" rows="3" maxlength="${MAXAREA}" placeholder="${esc(c.ph || '')}" data-txt="${c.k}"></textarea>`;
    }
    h += '</div>';
  });
  h += `<button class="btn" type="button" onclick="salvarForm()">Salvar</button>`;
  $('tool-wrap').innerHTML = h;
}
function salvarForm() {
  const rec = novoRegistro(_ft.id); let algum = false;
  Object.keys(_draft.n).forEach(k => { if (typeof _draft.n[k] === 'number') { rec.n[k] = _draft.n[k]; algum = true; } });
  Object.keys(_draft.c).forEach(k => { if (_draft.c[k] && _draft.c[k].length) { rec.c[k] = _draft.c[k].slice(); algum = true; } });
  Object.keys(_draft.t).forEach(k => { const v = String(_draft.t[k] || '').trim(); if (v) { rec.t[k] = v; algum = true; } });
  if (!algum) { toast('Preencha pelo menos um item.'); return; }
  guardarRegistro(rec); concluirTarefa();
  let extra = '';
  if (_ft.id === 'checkin' && rec.n.intensidade >= 8) extra = `<div class="tr-acoes"><button class="tr-btn" type="button" onclick="openTool('respirar')">🌬️ Tentar o ritmo calmante</button></div>`;
  if (typeof rec.n.antes === 'number' && typeof rec.n.depois === 'number') extra = `<p style="margin-top:8px">Você foi de <strong>${rec.n.antes}</strong> para <strong>${rec.n.depois}</strong>. Mudar pouco, ou nada, também é uma resposta e vale conversar na sessão.</p>`;
  fimTela('Registrado', 'Isso é treino: quanto mais você observa, mais fácil fica.', extra);
}
/* Entrada de dados dos formulários (delegação: nada de valor do usuário em atributos on*) */
$('tool-wrap').addEventListener('click', ev => {
  const chip = ev.target.closest('[data-chip]');
  if (chip) {
    const k = chip.dataset.chip, v = chip.dataset.v, lista = _draft.c[k] = _draft.c[k] || [], i = lista.indexOf(v);
    if (i >= 0) lista.splice(i, 1); else lista.push(v);
    chip.classList.toggle('sel', i < 0); chip.setAttribute('aria-pressed', String(i < 0)); return;
  }
  const eb = ev.target.closest('[data-esc]');
  if (eb) {
    const k = eb.dataset.esc, v = Number(eb.dataset.v), atual = _draft.n[k];
    if (atual === v) delete _draft.n[k]; else _draft.n[k] = v;
    eb.parentNode.querySelectorAll('.esc-b').forEach(b => { const s = _draft.n[k] === Number(b.dataset.v); b.classList.toggle('sel', s); b.setAttribute('aria-pressed', String(s)); });
  }
});
$('tool-wrap').addEventListener('input', ev => { const t = ev.target.dataset && ev.target.dataset.txt; if (t) _draft.t[t] = ev.target.value; });

/* ── Ritmo calmante (respiração 4–6) ─────────────────────────────────── */
let _resp = null;
function renderRespirar() {
  $('tool-wrap').innerHTML = `<div class="campo"><div class="pv-txt">Inspirar por 4 tempos e soltar o ar por 6 (mais devagar) ajuda o corpo a sair do modo alerta. Se ficar tonto/a, respire normalmente e pare.</div></div>
    <div class="campo"><label class="form-lbl">Quanto tempo?</label><div class="chips" role="group" aria-label="Duração">
      <button type="button" class="chip sel" aria-pressed="true" data-min="1">1 min</button><button type="button" class="chip" aria-pressed="false" data-min="2">2 min</button><button type="button" class="chip" aria-pressed="false" data-min="3">3 min</button></div></div>
    <div class="resp-area"><div class="resp-circ" id="resp-c" aria-hidden="true"><span id="resp-t">Pronto/a?</span></div></div>
    <div class="resp-info" id="resp-i" aria-live="polite"></div>
    <button class="btn" type="button" id="resp-b" onclick="iniciarResp()">Começar</button>`;
  _resp = { min: 1, timer: null, fim: null };
  $('tool-wrap').querySelectorAll('[data-min]').forEach(b => b.addEventListener('click', () => {
    if (_resp.timer) return; _resp.min = Number(b.dataset.min);
    $('tool-wrap').querySelectorAll('[data-min]').forEach(x => { const s = x === b; x.classList.toggle('sel', s); x.setAttribute('aria-pressed', String(s)); });
  }));
}
function pararRespiracao() { if (_resp && _resp.timer) { clearTimeout(_resp.timer); _resp.timer = null; } }
function iniciarResp() {
  if (_resp.timer) { pararRespiracao(); $('resp-b').textContent = 'Começar'; $('resp-t').textContent = 'Pronto/a?'; $('resp-c').className = 'resp-circ'; return; }
  _resp.fim = Date.now() + _resp.min * 60 * 1000; $('resp-b').textContent = 'Parar';
  const ciclo = (entrando) => {
    if (Date.now() >= _resp.fim) { terminarResp(); return; }
    const c = $('resp-c'); if (!c) return;
    c.className = 'resp-circ ' + (entrando ? 'in' : 'out');
    $('resp-t').textContent = entrando ? 'Inspire' : 'Solte devagar';
    $('resp-i').textContent = entrando ? 'Pelo nariz, contando até 4' : 'Pela boca, contando até 6';
    _resp.timer = setTimeout(() => ciclo(!entrando), entrando ? 4000 : 6000);
  };
  ciclo(true);
}
function terminarResp() {
  pararRespiracao();
  const rec = novoRegistro('respirar'); rec.n.min = _resp.min; guardarRegistro(rec); concluirTarefa();
  fimTela('Feito', 'Perceba como está seu corpo agora. Não precisa estar “calmo/a”: só um pouco diferente já conta.');
}

/* ── Aterramento 5-4-3-2-1 ───────────────────────────────────────────── */
const PASSOS_ATERRAR = [
  { n: 5, t: 'coisas que você VÊ', d: 'Olhe ao redor e nomeie, de cabeça, 5 coisas.' },
  { n: 4, t: 'coisas que você SENTE tocando', d: 'A roupa, o chão, a cadeira, a temperatura.' },
  { n: 3, t: 'sons que você OUVE', d: 'Os de perto e os de longe.' },
  { n: 2, t: 'cheiros que você SENTE', d: 'Ou 2 cheiros de que você gosta.' },
  { n: 1, t: 'coisa BOA sobre você ou sobre agora', d: 'Qualquer coisa, por menor que seja.' }
];
function renderAterrar() { _draft.passo = 0; passoAterrar(); }
function passoAterrar() {
  const p = _draft.passo, s = PASSOS_ATERRAR[p];
  $('tool-wrap').innerHTML = `<div class="tr-card"><div class="tr-lbl">Passo ${p + 1} de 5</div><h3 style="font-size:19px">${s.n} ${esc(s.t)}</h3><p>${esc(s.d)}</p>
    <p style="margin-top:10px;font-size:12.5px">Respire devagar enquanto faz. Não precisa escrever nada.</p>
    <div class="tr-acoes">${p > 0 ? '<button class="tr-btn ghost" type="button" onclick="_draft.passo--;passoAterrar()">Voltar</button>' : ''}
    <button class="tr-btn" type="button" onclick="proximoAterrar()">${p < 4 ? 'Próximo' : 'Terminar'}</button></div></div>`;
}
function proximoAterrar() {
  if (_draft.passo < 4) { _draft.passo++; passoAterrar(); return; }
  const rec = novoRegistro('aterrar'); rec.n.passos = 5; guardarRegistro(rec); concluirTarefa();
  fimTela('Feito', 'Você voltou para o aqui e agora. Se ainda estiver forte, repita ou tente o ritmo calmante.');
}

/* ── Listas: Ações da semana (agenda) e Caixa SOS ────────────────────── */
function renderLista(ft) {
  const agenda = ft.id === 'agenda', chave = agenda ? K.agenda : K.sos, lista = rd(chave, []);
  let h = `<div class="campo"><div class="pv-txt">${agenda
    ? 'Escolha ações <strong>pequenas</strong> (de 5 a 15 minutos) e marque quando fizer, mesmo que pela metade. Esta lista é só sua.'
    : 'Reúna o que te ajuda quando está difícil: músicas, pessoas, lugares, frases, atividades. Esta lista é só sua.'}</div></div>
    <div class="li-add"><input type="text" id="li-novo" maxlength="${MAXTXT}" autocomplete="off" aria-label="Novo item" placeholder="${agenda ? 'Ex.: caminhar 10 min depois da aula' : 'Ex.: ouvir aquela playlist'}"><button class="tr-btn" type="button" onclick="addLista('${ft.id}')">Adicionar</button></div>`;
  if (agenda) h += `<div class="campo"><div class="chips" role="group" aria-label="Tipo da ação">${TRILHA.OPTS.TIPOS_ACAO.map(o => `<button type="button" class="chip" aria-pressed="false" data-chip="tipo" data-v="${o.v}">${esc(o.l)}</button>`).join('')}</div></div>`;
  h += lista.slice().reverse().slice(0, 60).map(it => {
    const tipo = agenda && it.c && it.c.tipo ? it.c.tipo.map(v => rotuloOpt('TIPOS_ACAO', v)).join(', ') : '';
    return `<div class="li${it.feito ? ' feita' : ''}">${agenda ? `<button class="ck" type="button" aria-pressed="${!!it.feito}" aria-label="Marcar como feita: ${esc(it.t.acao)}" onclick="toggleLista('${esc(it.id)}')">${it.feito ? '✓' : ''}</button>` : ''}
      <div style="flex:1;min-width:0"><div class="li-t">${esc(agenda ? it.t.acao : it.t.item)}</div>${tipo ? `<div class="li-m">${esc(tipo)}</div>` : ''}</div>
      <button class="li-x" type="button" aria-label="Remover" onclick="removerLista('${ft.id}','${esc(it.id)}')">✕</button></div>`;
  }).join('') || `<div style="text-align:center;color:var(--muted);padding:18px 16px;font-size:14px">Nada aqui ainda.</div>`;
  $('tool-wrap').innerHTML = h;
  const inp = $('li-novo'); if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') addLista(ft.id); });
}
function addLista(fid) {
  const agenda = fid === 'agenda', chave = agenda ? K.agenda : K.sos, v = $('li-novo').value.trim();
  if (!v) { toast('Escreva algo primeiro.'); return; }
  const l = rd(chave, []), it = { id: uid(), ts: Date.now(), t: agenda ? { acao: v } : { item: v } };
  if (agenda) { it.c = { tipo: (_draft.c.tipo || []).slice() }; it.feito = null; }
  l.push(it); wr(chave, l); _draft = { n: {}, c: {}, t: {} }; renderLista(_ft);
}
function toggleLista(id) {
  const l = rd(K.agenda, []), it = l.find(x => x.id === id); if (!it) return;
  it.feito = it.feito ? null : Date.now(); wr(K.agenda, l); if (it.feito) pontuaUso('agenda'); renderLista(_ft);
}
function removerLista(fid, id) { const chave = fid === 'agenda' ? K.agenda : K.sos; wr(chave, rd(chave, []).filter(x => x.id !== id)); renderLista(_ft); }

/* ── Escada de enfrentamento (combinada com a profissional) ──────────── */
function renderEscada() {
  const l = rd(K.esc, []).slice().sort((a, b) => ((a.n && a.n.previsto) || 0) - ((b.n && b.n.previsto) || 0));
  let h = `<div class="campo"><div class="pv-txt"><strong>Faça só os degraus que você e sua psicóloga combinaram.</strong> Aqui você organiza a escada e anota cada tentativa. Do mais fácil (embaixo) ao mais difícil (em cima). Antes, use o ritmo calmante; depois, seja gentil com você: tentar já é o passo.</div></div>
    <div class="campo"><label class="form-lbl" for="es-d">Novo degrau</label><input type="text" id="es-d" maxlength="${MAXTXT}" autocomplete="off" placeholder="Ex.: pedir uma informação na lanchonete"></div>
    <div class="campo"><label class="form-lbl">Quanto desconforto você prevê? (0 a 10)</label>${escalaHTML('previsto', _draft.n.previsto)}</div>
    <button class="btn" type="button" onclick="addDegrau()">Adicionar degrau</button>`;
  h += l.map(d => {
    const n = (d.tentativas || []).length;
    return `<div class="li"><div style="flex:1;min-width:0"><div class="li-t">${esc(d.t.desc)}</div>
      <div class="li-m">desconforto previsto ${esc((d.n && d.n.previsto) != null ? d.n.previsto : '–')} · ${n} ${n === 1 ? 'tentativa' : 'tentativas'}</div>
      <div class="tr-acoes" style="margin-top:8px"><button class="tr-btn" type="button" onclick="tentouDegrau('${esc(d.id)}')">Tentei</button></div></div>
      <button class="li-x" type="button" aria-label="Remover degrau" onclick="removerDegrau('${esc(d.id)}')">✕</button></div>`;
  }).join('');
  $('tool-wrap').innerHTML = h;
}
function addDegrau() {
  const v = $('es-d').value.trim(); if (!v) { toast('Descreva o degrau.'); return; }
  const l = rd(K.esc, []), it = { id: uid(), ts: Date.now(), t: { desc: v }, n: {}, tentativas: [] };
  if (typeof _draft.n.previsto === 'number') it.n.previsto = _draft.n.previsto;
  l.push(it); wr(K.esc, l); _draft = { n: {}, c: {}, t: {} }; renderEscada();
}
function removerDegrau(id) { wr(K.esc, rd(K.esc, []).filter(x => x.id !== id)); renderEscada(); }
function tentouDegrau(id) {
  let b = ''; for (let i = 0; i <= 10; i++) b += `<button type="button" class="esc-b" onclick="registrarTentativa('${esc(id)}',${i})">${i}</button>`;
  showModal('Como foi? 🙌', 'Parabéns por tentar. Quanto desconforto você sentiu <strong>durante</strong>? (0 a 10)<div class="esc-row" style="margin-top:12px">' + b + '</div>',
    `<button class="btn ghost" onclick="registrarTentativa('${esc(id)}',null)">Prefiro não dar nota</button>`);
}
function registrarTentativa(id, v) {
  const l = rd(K.esc, []), d = l.find(x => x.id === id); if (!d) return;
  d.tentativas = d.tentativas || []; const t = { ts: Date.now(), n: {} }; if (typeof v === 'number') t.n.durante = v; d.tentativas.push(t);
  wr(K.esc, l); closeModal(); concluirTarefa(); pontuaUso('escada'); renderEscada(); toast('Tentativa registrada.');
}

/* ── Plano de segurança (modelo Stanley-Brown) ───────────────────────── */
const CAMPOS_PLANO = [
  { k: 'sinais', l: '1. Sinais de que uma crise pode estar chegando', ph: 'Pensamentos, emoções, situações ou sinais no corpo' },
  { k: 'estrategias', l: '2. O que posso fazer sozinho/a para me acalmar', ph: 'Respirar, música, banho, caminhar, desenhar…' },
  { k: 'distracao', l: '3. Pessoas e lugares que me ajudam a me distrair', ph: 'Nome da pessoa, lugar, atividade' },
  { k: 'pessoas', l: '4. Pessoas a quem posso pedir ajuda', ph: 'Nome e telefone de 2 ou 3 pessoas de confiança' },
  { k: 'profissionais', l: '5. Profissionais e serviços', ph: 'Minha psicóloga: nome e contato. CVV 188 · SAMU 192' },
  { k: 'ambiente', l: '6. Como deixar o ambiente mais seguro', ph: 'Combine com sua psicóloga e um adulto de confiança' }
];
function renderPlano() {
  const p = getPlano(); _draft.t = Object.assign({}, (p && p.t) || {});
  let h = `<div class="campo"><div class="pv-txt"><strong>Monte este plano com sua psicóloga.</strong> Ele é para os dias em que está muito difícil: você segue do passo 1 ao 6 até se sentir mais seguro/a. Em risco imediato, ligue <a href="tel:188">188</a> ou <a href="tel:192">192</a> sem esperar.</div></div>`;
  CAMPOS_PLANO.forEach(c => {
    h += `<div class="campo"><label class="form-lbl" for="p-${c.k}">${esc(c.l)}</label><textarea id="p-${c.k}" rows="3" maxlength="600" placeholder="${esc(c.ph)}" data-txt="${c.k}">${esc(_draft.t[c.k] || '')}</textarea></div>`;
  });
  h += `<div class="campo"><div class="pv-txt">Se você liberar os textos em “Minha conta”, sua psicóloga vê este plano. Se não, ela só sabe que ele existe. Em ambos os casos, vale trazê-lo para a sessão.</div></div>
    <button class="btn" type="button" onclick="salvarPlano()">Salvar plano</button>`;
  $('tool-wrap').innerHTML = h;
}
function salvarPlano() {
  const t = {}; CAMPOS_PLANO.forEach(c => { const v = String(_draft.t[c.k] || '').trim().slice(0, 600); if (v) t[c.k] = v; });
  if (!Object.keys(t).length) { toast('Preencha pelo menos um passo.'); return; }
  wr(K.plano, { ts: Date.now(), t: t }); concluirTarefa(); pontuaUso('plano');
  fimTela('Plano salvo', 'Ele aparece também no botão “Preciso de ajuda agora”. Você pode atualizar quando quiser.');
}

/* ── Balanço da semana ───────────────────────────────────────────────── */
const ITENS_SEMANAL = [
  { k: 'humor', l: 'Como foi o seu humor? (0 = muito ruim, 10 = muito bom)' },
  { k: 'ansiedade', l: 'Quanta ansiedade ou tensão você sentiu? (0 = nenhuma, 10 = muita)' },
  { k: 'sono', l: 'Como foi o seu sono? (0 = muito ruim, 10 = muito bom)' },
  { k: 'animo', l: 'Ânimo para fazer as coisas (0 = nenhum, 10 = muito)' },
  { k: 'relacoes', l: 'Como estão as relações com amigos e família? (0 = muito ruins, 10 = muito boas)' }
];
const RISCO_OPTS = ['Não', 'Uma vez ou outra', 'Várias vezes', 'Quase todo dia'];
function renderSemanal() {
  const sk = segunda(today()), ex = getSem().find(s => s.key === sk);
  if (ex) { _draft.n = Object.assign({}, ex.n); _draft.t = Object.assign({}, ex.t || {}); }
  let h = `<div class="campo"><div class="pv-txt">Tudo aqui é opcional: responda só o que quiser. As notas são suas e comparam você só com você mesmo/a.</div></div>`;
  ITENS_SEMANAL.forEach(i => { h += `<div class="campo"><label class="form-lbl">${esc(i.l)}</label>${escalaHTML(i.k, _draft.n[i.k])}</div>`; });
  h += `<div class="campo"><label class="form-lbl">Esta semana, pensei em me machucar ou que seria melhor não estar aqui.</label><div class="form-hint">Pode deixar sem resposta. Se marcar, o app te mostra opções de cuidado.</div>
    <div class="chips" role="group" aria-label="Pensamentos de se machucar">` + RISCO_OPTS.map((o, i) =>
      `<button type="button" class="chip${_draft.n.risco === i ? ' sel' : ''}" aria-pressed="${_draft.n.risco === i}" data-risco="${i}">${esc(o)}</button>`).join('') + `</div></div>
    <div class="campo"><label class="form-lbl" for="sem-nota">Quer contar algo sobre a semana?</label><textarea id="sem-nota" rows="3" maxlength="${MAXAREA}" data-txt="nota">${esc(_draft.t.nota || '')}</textarea></div>
    <button class="btn" type="button" onclick="salvarSemanal()">Salvar balanço</button>`;
  $('tool-wrap').innerHTML = h;
  $('tool-wrap').querySelectorAll('[data-risco]').forEach(b => b.addEventListener('click', () => {
    const v = Number(b.dataset.risco); if (_draft.n.risco === v) delete _draft.n.risco; else _draft.n.risco = v;
    $('tool-wrap').querySelectorAll('[data-risco]').forEach(x => { const s = Number(x.dataset.risco) === _draft.n.risco; x.classList.toggle('sel', s); x.setAttribute('aria-pressed', String(s)); });
  }));
}
function salvarSemanal() {
  const n = {}, t = {};
  ITENS_SEMANAL.concat([{ k: 'risco' }]).forEach(i => { if (typeof _draft.n[i.k] === 'number') n[i.k] = _draft.n[i.k]; });
  const nota = String(_draft.t.nota || '').trim(); if (nota) t.nota = nota;
  if (!Object.keys(n).length && !nota) { toast('Responda pelo menos um item.'); return; }
  const sk = segunda(today()), l = getSem().filter(s => s.key !== sk); l.push({ key: sk, ts: Date.now(), n: n, t: t });
  wr(K.sem, l); concluirTarefa();
  window._semCelebrar = n.risco >= 1; pontuaUso('semanal'); window._semCelebrar = false;   // sem comemoração sobre a mensagem de cuidado
  fimTela('Balanço salvo', 'Obrigado/a por olhar para a sua semana.', n.risco >= 1 ? cuidadoHTML().replace(/^<div class="cuidado">/, '<div class="cuidado" style="margin:12px 0 0">') : '');
}
