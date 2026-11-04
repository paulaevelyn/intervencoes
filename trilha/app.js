/* ═══════════════════════════════════════════════════════════════════════
   Trilha — app.js (núcleo)
   Mesma arquitetura dos outros apps: HTML/CSS/JS puros (sem build), dados no localStorage,
   SCREENS + goTo(), uma render*() por tela. As ferramentas ficam em ferramentas.js.
   Veja ARQUITETURA.md.

   Escolhas deliberadas (adolescentes, terapia online):
   • SEM pontos, níveis, medalhas ou "sequência". O progresso é descritivo.
   • Decisões mínimas, textos curtos, linguagem direta e sem tom infantil.
   • Apoio de crise sempre à mão (188, 192, 100) e o app NUNCA avisa ninguém sozinho.
   • Responsáveis não acessam o sistema. A profissional só vê o que o adolescente liberar.
   • O que a profissional escreve (módulo, sessões, tarefas) chega por trilha_orientacoes,
     somente leitura aqui, e é sempre inserido como texto (esc) — links só https.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Dados ───────────────────────────────────────────────────────────── */
const K = {
  regs:   'trilha_regs',     // [ { id, ts, date, f, n:{números}, c:{listas de ids}, t:{textos} } ]
  sem:    'trilha_semanal',  // [ { key (segunda), ts, n:{humor,ansiedade,sono,animo,relacoes,risco}, t:{nota} } ]
  esc:    'trilha_escada',   // [ { id, ts, t:{desc}, n:{previsto}, tentativas:[{ts,n:{durante}}] } ]
  feitos: 'trilha_feitos',   // { idTarefa: ts }  (tarefas combinadas com a profissional)
  lidos:  'trilha_lidos',    // { idModulo: ts }
  plano:  'trilha_plano',    // { ts, t:{sinais,estrategias,distracao,pessoas,profissionais,ambiente} }
  agenda: 'trilha_agenda',   // [ { id, ts, t:{acao}, c:{tipo:[]}, feito:ts|null } ]   (não vai para a profissional)
  sos:    'trilha_sos',      // [ { id, ts, t:{item} } ]                               (só da pessoa)
  ob:     'trilha_ob',       // { feito, data }
  cfg:    'trilha_cfg',      // { nome }  só neste aparelho (não sincroniza)
  jogo:     'trilha_jogo',      // { pts, miss, med, revd, pet }  energia, missões, medalhas (jogo.js)
  rev:      'trilha_rev',       // { idQuestao: { b, d } }  revisão espaçada
  forcas:   'trilha_forcas',    // { ts, top:[ids], dev:[ids], t:{ex_id, uso_id} }
  recursos: 'trilha_recursos',  // [ { id, ts, cat, t:{item} } ]  só da pessoa
  orient: 'trilha_orient'    // cache das orientações da profissional (não sincroniza; amarrado ao usuário)
};
const SYNC = ['trilha_regs', 'trilha_semanal', 'trilha_escada', 'trilha_feitos', 'trilha_lidos', 'trilha_plano', 'trilha_agenda', 'trilha_sos', 'trilha_ob',
              'trilha_jogo', 'trilha_rev', 'trilha_forcas', 'trilha_recursos'];

function rd(k, fb) { try { const r = localStorage.getItem(k); return r !== null ? JSON.parse(r) : fb; } catch (e) { return fb; } }
function wr(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) { console.warn('[Trilha] não consegui salvar:', e.message); if (typeof toast === 'function') toast('⚠️ Não foi possível guardar neste aparelho.'); }
}
const getRegs = () => rd(K.regs, []);
const getSem = () => rd(K.sem, []);
const getFeitos = () => rd(K.feitos, {});
const getLidos = () => rd(K.lidos, {});
const getPlano = () => rd(K.plano, null);

function pad(n) { return String(n).padStart(2, '0'); }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }   // data LOCAL
function today() { return iso(new Date()); }
function segunda(dateStr) {                       // segunda-feira da semana de uma data AAAA-MM-DD
  const d = new Date(dateStr + 'T12:00:00'); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return iso(d);
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function $(id) { return document.getElementById(id); }
function fmtDay(d, long) {
  const x = new Date(d + 'T12:00:00');
  return x.toLocaleDateString('pt-BR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
}
function fmtQuando(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
/* Só links https (a profissional já é limitada no banco; aqui é a segunda trava). */
function linkSeguro(u) {
  try { const x = new URL(String(u || '')); return x.protocol === 'https:' ? x.href : null; } catch (e) { return null; }
}
const moduloPorId = id => TRILHA.MODULOS.find(m => m.id === id);
const ferramentaPorId = id => TRILHA.FERRAMENTAS.find(f => f.id === id);
function rotuloOpt(lista, v) { const o = TRILHA.OPTS[lista].find(x => x.v === v); return o ? o.l : v; }

/* ── Orientações da profissional (somente leitura) ───────────────────── */
let ORI = {};
function usuarioId() { try { return window.PeaAuth && window.PeaAuth.usuario() ? window.PeaAuth.usuario().id : null; } catch (e) { return null; } }
function lerCacheOri() {
  const c = rd(K.orient, null), u = usuarioId();
  ORI = (c && c.uid && c.uid === u && c.conteudo && typeof c.conteudo === 'object') ? c.conteudo : {};
}
async function carregarOrientacoes() {
  const A = window.PeaAuth, u = usuarioId(); if (!A || !u) return;
  try {
    const r = await A.cliente().from('trilha_orientacoes').select('conteudo').maybeSingle();
    if (r.error) throw r.error;
    ORI = (r.data && r.data.conteudo) || {};
    wr(K.orient, { uid: u, conteudo: ORI, ts: Date.now() });
  } catch (e) { console.warn('[Trilha] sem orientações agora:', e.message); lerCacheOri(); }
  if (_cur === 'home') renderHome(); if (_cur === 'trilha') renderTrilha();
}
document.addEventListener('pea-auth-pronto', () => { lerCacheOri(); carregarOrientacoes(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') carregarOrientacoes(); });

/* ── Navegação ───────────────────────────────────────────────────────── */
const SCREENS = ['home', 'trilha', 'modulo', 'missao', 'revisao', 'tools', 'tool', 'registro', 'eu'];
const SUBTELAS = ['modulo', 'missao', 'revisao', 'tool', 'registro'];
let _hist = [], _cur = 'home';
function voltar() { const p = _hist.pop() || 'home'; goTo(p, true); }
function goTo(s) {
  if (!arguments[1] && s !== _cur) { _hist.push(_cur); if (_hist.length > 8) _hist.shift(); }
  _cur = s;
  if (typeof pararRespiracao === 'function') pararRespiracao();
  SCREENS.forEach(id => { $('scr-' + id)?.classList.remove('on'); $('nb-' + id)?.classList.remove('on'); });
  const scr = $('scr-' + s); if (!scr) return;
  scr.classList.add('on');
  if (SUBTELAS.indexOf(s) >= 0 && !scr.querySelector('.back-btn')) { const b = document.createElement('button'); b.className = 'back-btn'; b.type = 'button'; b.textContent = '← Voltar'; b.onclick = voltar; scr.insertBefore(b, scr.firstChild); }
  $('nb-' + s)?.classList.add('on');
  window.scrollTo(0, 0); scr.scrollTop = 0;
  if (s === 'home') renderHome();
  if (s === 'trilha') renderTrilha();
  if (s === 'tools') renderTools();
  if (s === 'registro') renderRegistro();
  if (s === 'eu') renderEu();
}

/* ── Toast, modal, ajuda em crise ────────────────────────────────────── */
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2800); }
function showModal(title, bodyHTML, actionsHTML) {
  $('modal-title').textContent = title; $('modal-body').innerHTML = bodyHTML; $('modal-actions').innerHTML = actionsHTML;
  $('modal-ov').classList.add('on');
}
function closeModal(e) { if (!e || e.target === $('modal-ov')) $('modal-ov').classList.remove('on'); }
function crisisBoxHTML(titulo) {
  return `<div class="crisis-box"><div class="crisis-title">${esc(titulo)}</div>
    <div><a href="tel:188">188 (CVV)</a>, gratuito, 24 horas, ou chat em <a href="https://cvv.org.br" target="_blank" rel="noopener">cvv.org.br</a>.
    Em risco imediato, <a href="tel:192">192 (SAMU)</a> ou um pronto-socorro. Se alguém está te machucando ou desrespeitando seus direitos, <a href="tel:100">100</a>.</div></div>`;
}
function openCrisis() {
  const p = getPlano(), t = (p && p.t) || {};
  let meu = '';
  if (t.estrategias || t.pessoas) {
    meu = `<div class="bloco" style="margin:0 0 12px;padding:12px 14px;text-align:left"><h3>Do seu plano de segurança</h3>` +
      (t.estrategias ? `<p style="font-size:13.5px"><strong>O que me ajuda:</strong> ${esc(t.estrategias)}</p>` : '') +
      (t.pessoas ? `<p style="font-size:13.5px;margin-top:6px"><strong>Quem posso chamar:</strong> ${esc(t.pessoas)}</p>` : '') + `</div>`;
  }
  showModal('Você não está sozinho/a',
    `<p style="text-align:left;margin-bottom:10px">Se está muito difícil agora, falar com alguém pode ajudar. Você não precisa explicar tudo.</p>${meu}${crisisBoxHTML('Ajuda agora')}`,
    `<a class="btn" href="tel:188" style="text-align:center;text-decoration:none">Ligar para o 188 (CVV)</a>
     <a class="btn ghost" href="tel:192" style="text-align:center;text-decoration:none;margin:0">Ligar para o 192 (SAMU)</a>
     <button class="btn ghost" style="margin:0" onclick="closeModal();openTool('plano')">Abrir meu plano de segurança</button>
     <button class="btn ghost" style="margin:0" onclick="closeModal()">Fechar</button>`);
}
function openModal(id) {
  if (id === 'del') {
    showModal('Apagar os dados deste aparelho?', 'Isso apaga registros, listas, plano e histórico guardados <strong>neste aparelho</strong>, e não tem volta. Se você usa conta, os dados dela são apagados em “Minha conta”. Baixe uma cópia antes, se quiser guardar.',
      '<button class="btn danger" onclick="deleteAll()">Sim, apagar</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>');
  }
}
function deleteAll() {
  SYNC.concat([K.cfg, K.orient]).forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ok */ } });
  closeModal(); toast('Dados apagados deste aparelho.'); setTimeout(() => location.reload(), 600);
}
/* Cuidado diante de um sinal de risco: acolhe, sem alarmar e sem prometer o que o app não faz. */
function cuidadoHTML() {
  return `<div class="cuidado"><h3>Obrigado/a por contar</h3>
    <p>Pensar em se machucar ou que seria melhor não estar aqui é algo que merece cuidado, e você não precisa passar por isso sozinho/a.</p>
    <p><strong>O app não avisa ninguém sozinho.</strong> Por isso, fale com sua psicóloga o quanto antes e com alguém de confiança.</p>
    <p>Se for agora: <a href="tel:188">188 (CVV)</a>, 24 horas · <a href="tel:192">192 (SAMU)</a> em risco imediato.</p>
    <div class="tr-acoes"><button class="tr-btn" type="button" onclick="openTool('plano')">Abrir meu plano de segurança</button><button class="tr-btn ghost" type="button" onclick="openCrisis()">Ver opções de ajuda</button></div></div>`;
}

/* ── Hoje ────────────────────────────────────────────────────────────── */
const SAUDACOES = ['Que bom ter você aqui.', 'Um passo de cada vez.', 'Como você está hoje?', 'Dia difícil também conta.'];
function diasComPratica() {
  const lim = new Date(); lim.setDate(lim.getDate() - 13); const ini = iso(lim), set = new Set();
  getRegs().forEach(r => { if (r.date >= ini) set.add(r.date); });
  rd(K.agenda, []).forEach(a => { if (a.feito) { const d = iso(new Date(a.feito)); if (d >= ini) set.add(d); } });
  return set.size;
}
function renderHome() {
  const nome = (rd(K.cfg, {}).nome || '').trim();
  const dia = fmtDay(today(), true); $('h-date').textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
  $('h-hi').textContent = nome ? 'Oi, ' + nome : 'Oi';
  $('h-sub').textContent = SAUDACOES[new Date().getDate() % SAUDACOES.length];

  // Próxima sessão (registrada pela profissional; a sala de vídeo é externa)
  const agora = Date.now() - 90 * 60 * 1000;
  const prox = (ORI.sessoes || []).filter(s => s && Date.parse(s.inicio) >= agora).sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))[0];
  let hs = '';
  if (prox) {
    const l = linkSeguro(prox.link);
    hs = `<div class="tr-card"><div class="tr-lbl">Próxima sessão</div><h3>${esc(fmtQuando(prox.inicio))}</h3>` +
      (prox.combinados ? `<p>${esc(prox.combinados)}</p>` : '') +
      (l ? `<div class="tr-acoes"><a class="tr-btn" href="${esc(l)}" target="_blank" rel="noopener noreferrer">Entrar na sessão</a></div>` : `<p style="margin-top:6px">O link da sala chega com sua psicóloga.</p>`) + `</div>`;
  }
  $('h-sessao').innerHTML = hs;

  // Tarefas combinadas
  const feitos = getFeitos(), tarefas = (ORI.tarefas || []).filter(t => t && t.id);
  let ht = '';
  if (tarefas.length) {
    const aberta = tarefas.filter(t => !feitos[t.id]), feitas = tarefas.filter(t => feitos[t.id]);
    const linha = t => {
      const f = t.ferramenta ? ferramentaPorId(t.ferramenta) : null, ok = !!feitos[t.id];
      return `<div class="tarefa${ok ? ' feita' : ''}"><button class="ck" type="button" aria-label="${ok ? 'Desmarcar' : 'Marcar como feita'}: ${esc(t.titulo)}" aria-pressed="${ok}" onclick="toggleTarefa('${esc(t.id)}')">${ok ? '✓' : ''}</button>
        <div style="flex:1;min-width:0"><div class="tt">${esc(t.titulo)}</div>${t.instrucao ? `<div class="ds">${esc(t.instrucao)}</div>` : ''}
        ${t.ate ? `<div class="ds">Combinado para ${esc(fmtDay(t.ate))}</div>` : ''}
        ${f && !ok ? `<div class="tr-acoes" style="margin-top:8px"><button class="tr-btn ghost" type="button" onclick="openTool('${esc(f.id)}','${esc(t.id)}')">${esc(f.emoji)} Abrir ${esc(f.nome)}</button></div>` : ''}</div></div>`;
    };
    ht = `<div class="tr-card"><div class="tr-lbl">Combinado com sua psicóloga</div>` +
      (aberta.length ? aberta.map(linha).join('') : `<p>Tudo marcado por enquanto. Sem pressa, vale levar o que aprendeu para a próxima sessão.</p>`) +
      (feitas.length && aberta.length ? feitas.slice(0, 3).map(linha).join('') : '') + `</div>`;
  }
  $('h-tarefas').innerHTML = ht;

  // Módulo atual
  const m = moduloPorId(ORI.modulo);
  $('h-modulo').innerHTML = m ? `<div class="tr-card suave"><div class="tr-lbl">Módulo de agora</div><h3>${esc(m.emoji)} ${esc(m.nome)}</h3><p>${esc(m.porque)}</p>
    <div class="tr-acoes"><button class="tr-btn" type="button" onclick="openModulo(${m.id})">Abrir módulo</button></div></div>` : '';

  if (typeof renderJogoHome === 'function') renderJogoHome();

  // Balanço da semana (opcional)
  const sk = segunda(today()), fez = getSem().some(s => s.key === sk);
  $('h-semanal').innerHTML = fez ? '' : `<div class="tr-card suave"><div class="tr-lbl">Opcional</div><h3>📋 Balanço da semana</h3><p>Como foi a semana, em poucos itens (2 minutos).</p>
    <div class="tr-acoes"><button class="tr-btn ghost" type="button" onclick="openTool('semanal')">Fazer o balanço</button></div></div>`;

  $('hs-dias').textContent = diasComPratica();
  $('hs-regs').textContent = getRegs().length;
  $('hs-mods').textContent = typeof getJogo === 'function' ? TRILHA.MODULOS.filter(m => modCompleto(getJogo(), m.id)).length : 0;
  const p = getPlano(); $('h-plano-sub').textContent = p && p.t && Object.keys(p.t).length ? 'Ver e atualizar' : 'Montar com sua psicóloga';
}
function toggleTarefa(id) {
  const f = getFeitos();
  if (f[id]) delete f[id]; else f[id] = Date.now();
  wr(K.feitos, f); renderHome();
}

/* ── Trilha ──────────────────────────────────────────────────────────── */
function renderTrilha() {
  const lidos = getLidos(); let h = '';
  const J = typeof getJogo === 'function' ? getJogo() : null;
  TRILHA.FASES.forEach(f => {
    const feitos = J ? f.mods.filter(id => modCompleto(J, id)).length : 0;
    h += `<div class="fase-h">${esc(f.nome)}${J ? ` <span class="fase-p">${feitos}/${f.mods.length} missões</span>` : ''}</div>`;
    f.mods.forEach(id => {
      const m = moduloPorId(id), agora = ORI.modulo === id;
      h += `<button class="mod${agora ? ' agora' : ''}" type="button" onclick="openModulo(${m.id})">
        <span class="mod-e">${esc(m.emoji)}</span>
        <span style="flex:1;min-width:0"><span class="mod-n">Módulo ${m.id}</span><br><span class="mod-t">${esc(m.nome)}</span><br>
          ${agora ? '<span class="mod-tag">Agora</span>' : ''}${lidos[m.id] ? '<span class="mod-tag vis">Visto</span>' : ''}${J && J.med['mod' + m.id] ? '<span class="mod-tag vis">Medalha</span>' : ''}<span class="mod-tag ab">${esc(m.abord)}</span></span>${typeof pipsHTML === 'function' ? pipsHTML(m.id) : ''}</button>`;
    });
  });
  h += `<div class="insight-c l"><div class="insight-t">E se eu precisar de outra coisa?</div><div class="insight-b">Além desses módulos, você e sua psicóloga podem combinar trabalhos específicos (por exemplo, para uma fobia, TOC ou algo difícil que você viveu). Isso é conversado na sessão.</div></div>`;
  $('t-lista').innerHTML = h;
}
function openModulo(id) {
  const m = moduloPorId(id); if (!m) return;
  const lido = !!getLidos()[id];
  const fs = m.ferramentas.map(fid => ferramentaPorId(fid)).filter(Boolean);
  $('m-wrap').innerHTML = `<div class="hdr"><h1>${esc(m.emoji)} ${esc(m.nome)}</h1><p>Módulo ${m.id} · ${esc(m.abord)}</p></div>
    <div style="height:14px"></div>
    <div class="bloco"><h3>Por que isso?</h3><p>${esc(m.porque)}</p></div>
    <div class="bloco"><h3>Na sessão</h3><p>${esc(m.sessao)}</p></div>
    <div class="bloco"><h3>Para praticar</h3><p>${esc(m.pratica)}</p></div>
    <div class="sdiv">Ferramentas deste módulo</div>
    <div class="quick-grid">${fs.map(f => `<div class="quick-card" role="button" tabindex="0" onclick="openTool('${esc(f.id)}')" onkeydown="if(event.key==='Enter')openTool('${esc(f.id)}')"><div class="quick-icon">${esc(f.emoji)}</div><div class="quick-title">${esc(f.nome)}</div><div class="quick-sub">${esc(f.sub)}</div></div>`).join('')}</div>
    ${typeof hubMissaoHTML === 'function' ? hubMissaoHTML(m) : ''}
    <button class="btn ${lido ? 'ghost-mint' : 'mint'}" type="button" onclick="marcarLido(${m.id})">${lido ? '✓ Visto (toque para desmarcar)' : 'Marcar como visto'}</button>`;
  goTo('modulo');
}
function marcarLido(id) {
  const l = getLidos(); if (l[id]) delete l[id]; else l[id] = Date.now();
  wr(K.lidos, l); openModulo(id);
}

/* ── Ferramentas (lista) ─────────────────────────────────────────────── */
function renderTools() {
  $('f-grid').innerHTML = TRILHA.FERRAMENTAS.map(f => `<div class="quick-card" role="button" tabindex="0" onclick="openTool('${esc(f.id)}')" onkeydown="if(event.key==='Enter')openTool('${esc(f.id)}')">
    <div class="quick-icon">${esc(f.emoji)}</div><div class="quick-title">${esc(f.nome)}</div><div class="quick-sub">${esc(f.sub)}</div><span class="f-min">${esc(f.min)}</span></div>`).join('');
}

/* ── Histórico ───────────────────────────────────────────────────────── */
function resumoRegistro(r) {
  const f = ferramentaPorId(r.f); if (!f) return '';
  const partes = [];
  if (r.c && r.c.emocao && r.c.emocao.length) partes.push(r.c.emocao.map(v => rotuloOpt('EMOCOES', v)).join(', '));
  if (r.n && typeof r.n.intensidade === 'number') partes.push('intensidade ' + r.n.intensidade);
  if (r.n && typeof r.n.antes === 'number' && typeof r.n.depois === 'number') partes.push('crença ' + r.n.antes + ' → ' + r.n.depois);
  if (r.n && typeof r.n.min === 'number') partes.push(r.n.min + ' min');
  if (r.t && r.t.pensamento) partes.push('“' + r.t.pensamento + '”');
  else if (r.t && r.t.previsao) partes.push('“' + r.t.previsao + '”');
  return partes.join(' · ');
}
function renderRegistro() {
  const regs = getRegs().slice().sort((a, b) => b.ts - a.ts);
  if (!regs.length) { $('r-lista').innerHTML = '<div class="act-empty" style="text-align:center;color:var(--muted);padding:22px 16px">Nada por aqui ainda. Quando você registrar um check-in ou usar uma ferramenta, aparece aqui.</div>'; return; }
  let h = '', dia = '';
  regs.slice(0, 200).forEach(r => {
    if (r.date !== dia) { dia = r.date; h += `<div class="hist-d">${esc(fmtDay(r.date))}</div>`; }
    const f = ferramentaPorId(r.f);
    h += `<div class="hist"><div style="display:flex;justify-content:space-between;gap:8px"><div class="hist-t">${f ? esc(f.emoji) + ' ' + esc(f.nome) : esc(r.f)}</div>
      <button class="li-x" type="button" aria-label="Apagar este registro" onclick="apagarRegistro('${esc(r.id)}')">🗑</button></div>
      <div class="hist-s">${esc(resumoRegistro(r))}</div></div>`;
  });
  $('r-lista').innerHTML = h;
}
function apagarRegistro(id) {
  showModal('Apagar este registro?', 'Ele sai do seu histórico e não tem volta.',
    `<button class="btn danger" onclick="confirmaApagar('${esc(id)}')">Apagar</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>`);
}
function confirmaApagar(id) { wr(K.regs, getRegs().filter(r => r.id !== id)); closeModal(); renderRegistro(); toast('Registro apagado.'); }

/* ── Eu ──────────────────────────────────────────────────────────────── */
function renderEu() {
  if (typeof renderCamp === 'function') renderCamp();
  $('eu-privacidade').innerHTML = `<div class="pv-txt">
    <div class="pv-linha"><span>🙋</span><span><strong>Sua psicóloga</strong> só vê o que você liberar em “Minha conta” (botão no topo): nada, só números, ou números e textos. Você pode mudar quando quiser.</span></div>
    <div class="pv-linha"><span>👨‍👩‍👧</span><span><strong>Seus responsáveis</strong> não têm acesso ao app. O que a família sabe é combinado nas sessões.</span></div>
    <div class="pv-linha"><span>🧰</span><span><strong>Caixa SOS</strong> e suas <strong>ações da semana</strong> ficam só com você.</span></div>
    <div class="pv-linha"><span>📋</span><span><strong>Balanço da semana:</strong> se você liberar os números, sua psicóloga vê também a pergunta sobre pensamentos de se machucar. Ela existe para você ser cuidado/a mais cedo.</span></div>
    <div class="pv-linha"><span>🤝</span><span><strong>Limite do sigilo:</strong> em risco sério para você ou para outra pessoa, sua psicóloga pode precisar envolver outras pessoas. O app não avisa ninguém sozinho.</span></div></div>`;
  $('eu-nome').value = rd(K.cfg, {}).nome || '';
}
function salvarNome(v) { const c = rd(K.cfg, {}); c.nome = String(v || '').trim().slice(0, 30); wr(K.cfg, c); toast('Salvo neste aparelho.'); }
function baixar(nome, tipo, conteudo) {
  const b = new Blob([conteudo], { type: tipo }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function exportJSON() {
  const o = {}; SYNC.forEach(k => { o[k] = rd(k, null); });
  baixar('trilha-' + today() + '.json', 'application/json', JSON.stringify(o, null, 2));
}
function csvCel(v) { const s = String(v == null ? '' : v).replace(/"/g, '""'); return /^[=+\-@\t\r]/.test(s) ? '"\'' + s + '"' : '"' + s + '"'; }   // evita injeção de fórmula na planilha
function exportCSV() {
  const linhas = [['data', 'ferramenta', 'numeros', 'escolhas', 'textos']];
  getRegs().slice().sort((a, b) => a.ts - b.ts).forEach(r => {
    linhas.push([r.date, r.f, JSON.stringify(r.n || {}), JSON.stringify(r.c || {}), JSON.stringify(r.t || {})]);
  });
  baixar('trilha-registros-' + today() + '.csv', 'text/csv;charset=utf-8', '﻿' + linhas.map(l => l.map(csvCel).join(',')).join('\n'));
}

/* ── Onboarding ──────────────────────────────────────────────────────── */
function obNext(n) { document.querySelectorAll('.ob-slide').forEach(s => s.classList.remove('on')); $('obs' + n).classList.add('on'); }
function obDone() { wr(K.ob, { feito: true, data: new Date().toISOString() }); $('onboard').classList.add('hide'); goTo('home'); }

/* ── Service worker (offline) ────────────────────────────────────────── */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('[Trilha] SW:', e.message));

/* ── Splash ──────────────────────────────────────────────────────────── */
(function () {
  const splash = $('splash'); if (!splash) return;
  setTimeout(() => { splash.classList.add('out'); setTimeout(() => splash.classList.add('gone'), 460); }, 1500);
})();

/* ── Início ──────────────────────────────────────────────────────────── */
/* Chamada por um <script> no fim do index.html, depois de carregar ferramentas.js e jogo.js. */
function iniciarTrilha() {
  lerCacheOri();
  const ob = rd(K.ob, null), temDados = getRegs().length > 0;
  if ((ob && ob.feito) || temDados) { $('onboard').classList.add('hide'); goTo('home'); }
  else { $('onboard').classList.remove('hide'); }
}
