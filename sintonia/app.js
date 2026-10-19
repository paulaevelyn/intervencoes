/* ═══════════════════════════════════════════════════════════════════════
   Sintonia — app.js
   Mesma arquitetura do Farol, do Floresça e do Aurora: HTML/CSS/JS puros (sem build), dados no
   localStorage, SCREENS + goTo(), uma render*() por tela, toast, modal, onboarding e service
   worker. Veja ARQUITETURA.md.

   O que é específico deste app:
   • Exercício de Treino da Atenção (ATT, Wells): três fases (um som por vez, troca rápida,
     todos juntos) com cinco sons gerados no navegador (Web Audio) e posicionados em 3D (HRTF).
   • SEM pontos, níveis, medalhas ou "sequência" que se quebra. O progresso é descritivo.
   • Notas de 0 a 10 antes e depois, sempre opcionais; a pessoa só compara consigo mesma.
   • Apoio de crise sempre à mão (tela inicial, durante a sessão, depois da sessão e em Aprender).
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Dados ───────────────────────────────────────────────────────────── */
const K = {
  sess: 'sintonia_sessoes',   // [ { id, iso, modo, planejado, feito, completa, antes:{w,s,c}, depois:{w,s,c}, nota } ]  (sincronizada)
                              // Com toques: tipo:'toques', fase, cenario, sons, ritmo, acertos, chamadas, rt, longest, voltas, mente:{antes,depois} (1 a 5)
  sem:  'sintonia_semanal',   // [ { key, ts, items:[4 notas de 1 a 5], note } ]  reflexão semanal sobre o dia a dia             (sincronizada)
  ob:   'sintonia_ob',        // { feito:true, data }                                                                    (sincronizada)
  cfg:  'sintonia_cfg'        // { volume, mode, voice, tipo, cenario, tdur, sons, ritmo, visual, guia }  preferências deste aparelho (NÃO sincronizada)
};
/* Conjuntos de sons do tipo Clássico: Padrão e Bateria (pensado para quem toca ou está aprendendo bateria).
   Mesmas cinco posições ao redor da pessoa; muda só o que cada ponto toca. */
const SOURCES_PADRAO = [
  { id: 'sino',    nome: 'Sino',      onde: 'à sua esquerda',     ang: 290 },
  { id: 'gotas',   nome: 'Gotas',     onde: 'à sua direita',      ang: 70 },
  { id: 'madeira', nome: 'Madeira',   onde: 'à sua frente',       ang: 0 },
  { id: 'tom',     nome: 'Tom grave', onde: 'atrás, à direita',   ang: 140 },
  { id: 'vento',   nome: 'Vento',     onde: 'atrás, à esquerda',  ang: 220 }
];
const SOURCES_BATERIA = [
  { id: 'prato',   nome: 'Prato',     onde: 'à sua esquerda',     ang: 290 },
  { id: 'chimbal', nome: 'Chimbal',   onde: 'à sua direita',      ang: 70 },
  { id: 'bumbo',   nome: 'Bumbo',     onde: 'à sua frente',       ang: 0 },
  { id: 'tomb',    nome: 'Tom',       onde: 'atrás, à direita',   ang: 140 },
  { id: 'caixa',   nome: 'Caixa',     onde: 'atrás, à esquerda',  ang: 220 }
];
let SOURCES = SOURCES_PADRAO;
const METRICS = [
  { k: 'w', nome: 'Preocupação ou ruminação', curto: 'Preocupação',    dica: '0 = nenhuma, 10 = muito intensa' },
  { k: 's', nome: 'Atenção presa em mim',     curto: 'Atenção em mim', dica: 'pensamentos e sensações do corpo, de 0 a 10' },
  { k: 'c', nome: 'Controle sobre a atenção', curto: 'Controle',       dica: '0 = nenhum, 10 = total' }
];
const MODES = { full: { durs: [300, 300, 120] }, short: { durs: [150, 150, 60] } };
const LEAD = 8;   // segundos de preparação antes da fase 1
const PH_TXT = [
  { titulo: 'Preparação',      txt: 'Escolha um ponto à sua frente e mantenha o olhar nele até o fim. Os sons vão começar suavemente.', voz: 'Escolha um ponto à sua frente e mantenha o olhar nele.' },
  { titulo: 'Um som por vez',  txt: 'Dirija toda a atenção ao som indicado. Se outros sons ou pensamentos surgirem, perceba e volte ao som escolhido.', voz: 'Fase um. Foque em um som de cada vez.' },
  { titulo: 'Troca rápida',    txt: 'A cada poucos segundos, o som indicado muda. Leve a atenção até ele o mais rápido que conseguir.', voz: 'Fase dois. Mude a atenção para o som indicado, o mais rápido que puder.' },
  { titulo: 'Todos juntos',    txt: 'Perceba todos os sons ao mesmo tempo, sem se fixar em nenhum.', voz: 'Fase três. Perceba todos os sons ao mesmo tempo.' }
];

let STORE_OK = true;
function rd(k, fb) { try { const r = localStorage.getItem(k); return r !== null ? JSON.parse(r) : fb; } catch (e) { return fb; } }
function wr(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); }
  catch (e) { STORE_OK = false; console.warn('[Sintonia] não consegui salvar:', e.message); if (typeof toast === 'function') toast('⚠️ Não foi possível guardar neste aparelho.'); }
}
(function () { try { localStorage.setItem('__sint', '1'); localStorage.removeItem('__sint'); } catch (e) { STORE_OK = false; } })();

let SESS = (function () { const d = rd(K.sess, []); return Array.isArray(d) ? d : []; })();   // em memória: vale mesmo sem armazenamento
const CFG = Object.assign({
  volume: 55, mode: 'full', voice: false,
  tipo: 'classico',                                   // 'classico' (ATT) ou 'toques' (adaptação para TDAH)
  conjunto: 'padrao',                                 // sons do tipo clássico: 'padrao' ou 'bateria'
  cenario: 'floresta', tdur: 3, sons: 4, ritmo: 'medio', visual: 'media', guia: true   // ajustes do tipo 'toques'
}, rd(K.cfg, {}) || {});
function saveSess() { wr(K.sess, SESS); }
function saveCfg() { wr(K.cfg, CFG); }

function pad(n) { return String(n).padStart(2, '0'); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function $(id) { return document.getElementById(id); }
function mmss(s) { s = Math.max(0, Math.ceil(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
function fmtDate(iso) { const d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function fmtShort(iso) { const d = new Date(iso); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
function diaLocal(iso) { const d = new Date(iso); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
function minTxt(sec) { return String(Math.round(sec / 60 * 10) / 10).replace('.', ','); }
/* Menos movimento: segue o aparelho e o painel "Cuidado digital" (classes pea-calmo / pea-mov-ok, de shared/bemestar.js) */
function reduced() {
  const h = document.documentElement.classList;
  if (h.contains('pea-calmo')) return true;
  if (h.contains('pea-mov-ok')) return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* ── Navegação ───────────────────────────────────────────────────────── */
const SCREENS = ['home', 'session', 'after', 'done', 'tap', 'tapsum', 'progress', 'learn'];
const FOCO = ['session', 'after', 'done', 'tap', 'tapsum'];   // telas sem a barra de navegação
let _cur = 'home', _booted = false;
function goTo(s) {
  _cur = s;
  SCREENS.forEach(id => { $('scr-' + id)?.classList.remove('on'); $('nb-' + id)?.classList.remove('on'); });
  const scr = $('scr-' + s); if (!scr) return;
  scr.classList.add('on');
  document.body.classList.toggle('foco', FOCO.indexOf(s) >= 0);
  $('nb-' + s)?.classList.add('on');
  window.scrollTo(0, 0); scr.scrollTop = 0;
  if (s === 'home') renderHome();
  if (s === 'progress') renderProgress();
  if (_booted && (s === 'after' || s === 'done' || s === 'tapsum')) { const h = scr.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
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
const CRISIS_CORPO = '<p style="text-align:left;margin-bottom:10px">Se você está em sofrimento agora, falar com alguém pode ajudar. Você não precisa explicar tudo.</p>';
const CRISIS_LIGAR = `<a class="btn" href="tel:188" style="text-align:center;text-decoration:none">Ligar para o 188 (CVV)</a>
     <a class="btn ghost" href="tel:192" style="text-align:center;text-decoration:none;margin:0">Ligar para o 192 (SAMU)</a>`;
function openCrisis() {
  showModal('Você não está sozinho/a', CRISIS_CORPO + crisisBoxHTML('Ajuda agora'),
    CRISIS_LIGAR + '<button class="btn ghost-mint" onclick="closeModal()" style="margin:0">Fechar</button>');
}
/* Durante a sessão: pausa o exercício e oferece voltar ou encerrar, sem pressa */
function ajudaNaSessao() {
  pause();
  showModal('Você não está sozinho/a', CRISIS_CORPO + crisisBoxHTML('Ajuda agora'),
    CRISIS_LIGAR + '<button class="btn ghost-mint" onclick="closeModal();resume()" style="margin:0">Voltar ao exercício</button>' +
    '<button class="btn danger" onclick="closeModal();finish(false)" style="margin:0">Encerrar o exercício</button>');
}

/* ── Mapa sonoro ─────────────────────────────────────────────────────── */
const CX = 180, CY = 180, RAD = 125;
function srcPos(a) { const r = a * Math.PI / 180; return { x: CX + RAD * Math.sin(r), y: CY - RAD * Math.cos(r) }; }
class MapView {
  constructor(svg) { this.svg = svg; this.angle = 0; this.build(); }
  build() {
    let h = '<circle class="guide-c" cx="180" cy="180" r="62"/><circle class="guide-c" cx="180" cy="180" r="125"/><circle class="guide-c dash" cx="180" cy="180" r="160"/>';
    h += '<text class="axis" x="180" y="12">FRENTE</text><text class="axis" x="180" y="355">ATRÁS</text>';
    h += '<line class="beam" x1="180" y1="180" x2="180" y2="60"/>';
    h += '<g class="ripples"></g>';
    SOURCES.forEach((s, i) => {
      const p = srcPos(s.ang);
      h += '<g class="src" data-i="' + i + '" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')"><circle class="halo" r="19"/><circle class="dot" r="7"/><text class="lbl" y="32">' + s.nome + '</text></g>';
    });
    h += '<circle class="fix-ring" cx="180" cy="180" r="12"/><circle class="fix" cx="180" cy="180" r="4.5"/>';
    this.svg.innerHTML = h;
    this.rip = this.svg.querySelector('.ripples');
    this.srcEls = Array.from(this.svg.querySelectorAll('.src'));
    this.beam = this.svg.querySelector('.beam');
  }
  setLive(b) { this.svg.classList.toggle('live', b); }
  setTargets(set, angle) {
    this.srcEls.forEach((g, i) => g.classList.toggle('on', set.has(i)));
    if (angle == null) { this.svg.classList.remove('focus'); }
    else {
      const d = ((angle - this.angle) % 360 + 540) % 360 - 180;
      this.angle += d;
      this.beam.style.transform = 'rotate(' + this.angle + 'deg)';
      this.svg.classList.add('focus');
    }
  }
  ripple(i) {
    if (reduced()) return;
    const p = srcPos(SOURCES[i].ang);
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'ripple');
    c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', '8');
    c.addEventListener('animationend', () => c.remove());
    this.rip.appendChild(c);
    setTimeout(() => { if (c.isConnected) c.remove(); }, 2200);
  }
}
let homeMap, liveMap;

/* ── Som (Web Audio) ─────────────────────────────────────────────────── */
const Au = {
  ctx: null, master: null, noise: null, srcs: [], timer: null, live: false,
  init() {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const c = new AC(); this.ctx = c;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 20; comp.ratio.value = 4; comp.attack.value = 0.01; comp.release.value = 0.25;
      const m = c.createGain(); m.gain.value = 0; m.connect(comp); comp.connect(c.destination); this.master = m;
      const len = c.sampleRate * 2;
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
      return true;
    } catch (e) { return false; }
  },
  level(v) { return Math.pow(v / 100, 1.6) * 0.9; },
  setVol(v) {
    if (this.master && this.live) this.master.gain.setTargetAtTime(this.level(v), this.ctx.currentTime, 0.05);
  },
  panner(ang, r) {
    const c = this.ctx, p = c.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = r; p.maxDistance = 100; p.rolloffFactor = 0.2;
    const a = ang * Math.PI / 180, x = r * Math.sin(a), z = -r * Math.cos(a);
    if (p.positionX) { p.positionX.value = x; p.positionY.value = 0; p.positionZ.value = z; }
    else if (p.setPosition) { p.setPosition(x, 0, z); }
    return p;
  },
  bell(dest, t) {
    const c = this.ctx, f0 = [523.25, 587.33, 659.25, 783.99][Math.floor(Math.random() * 4)];
    [[1, 0.5, 2.4], [2.76, 0.22, 1.3], [5.4, 0.1, 0.6]].forEach(p => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f0 * p[0];
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p[1], t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + p[2] + 0.05);
    });
  },
  drop(dest, t) {
    const c = this.ctx, f = [760, 880, 990, 1180, 1320][Math.floor(Math.random() * 5)];
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f * 0.8, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.25, t + 0.06);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.3);
  },
  wood(dest, t, acc) {
    const c = this.ctx;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = acc ? 420 : 580;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.12);
    const n = c.createBufferSource(); n.buffer = this.noise;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 2;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    n.connect(bp); bp.connect(ng); ng.connect(dest);
    n.start(t, Math.random() * 1.5, 0.05);
  },
  gong(t) {
    const c = this.ctx;
    [[196, 0.4, 4.2], [293.7, 0.2, 3], [440.5, 0.1, 2]].forEach(p => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = p[0];
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(p[1], t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + p[2] + 0.05);
    });
  },
  /* Bateria sintetizada (sem arquivos de som) */
  noiseHit(dest, t, ft, f, q, d, peak) {
    const c = this.ctx, n = c.createBufferSource(); n.buffer = this.noise;
    const fl = c.createBiquadFilter(); fl.type = ft; fl.frequency.value = f; fl.Q.value = q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    n.connect(fl); fl.connect(g); g.connect(dest);
    n.start(t, Math.random() * Math.max(0.05, 1.9 - d), d + 0.05);
  },
  toneHit(dest, t, type, f0, f1, d, peak) {
    const c = this.ctx, o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + Math.min(d, 0.14));
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05);
  },
  kick(dest, t) { this.toneHit(dest, t, 'sine', 150, 48, 0.32, 0.9); this.noiseHit(dest, t, 'lowpass', 600, 0.5, 0.03, 0.15); },
  snare(dest, t) { this.noiseHit(dest, t, 'highpass', 1400, 0.7, 0.17, 0.5); this.toneHit(dest, t, 'triangle', 190, 150, 0.1, 0.35); },
  hat(dest, t) { this.noiseHit(dest, t, 'highpass', 7500, 0.5, 0.05, 0.3); },
  cymbal(dest, t) { this.noiseHit(dest, t, 'highpass', 5200, 0.6, 1.3, 0.28); this.noiseHit(dest, t, 'bandpass', 8800, 2.5, 0.9, 0.12); },
  tomHit(dest, t) { this.toneHit(dest, t, 'sine', 175, 100, 0.38, 0.65); this.noiseHit(dest, t, 'lowpass', 900, 0.5, 0.03, 0.12); },
  build(i) {
    const c = this.ctx, s = SOURCES[i];
    const out = c.createGain(), pan = this.panner(s.ang, 3);
    out.connect(pan); pan.connect(this.master);
    const o = { i: i, out: out, pan: pan, nodes: null, next: 0, n: 0, fire: null, iv: null };
    if (s.id === 'prato') {
      out.gain.value = 0.55; o.fire = t => this.cymbal(out, t); o.iv = () => 3.2 + Math.random() * 1.8;
    } else if (s.id === 'chimbal') {
      out.gain.value = 0.55; o.fire = t => this.hat(out, t); o.iv = () => 0.3 + Math.random() * 0.6;
    } else if (s.id === 'bumbo') {
      out.gain.value = 0.6; o.fire = t => this.kick(out, t); o.iv = () => 0.625;
    } else if (s.id === 'tomb') {
      out.gain.value = 0.6; o.fire = t => this.tomHit(out, t); o.iv = () => 2.6 + Math.random() * 1.6;
    } else if (s.id === 'caixa') {
      out.gain.value = 0.6; o.fire = t => this.snare(out, t); o.iv = () => 2.2 + Math.random() * 1.6;
    } else if (s.id === 'sino') {
      out.gain.value = 0.55; o.fire = t => this.bell(out, t); o.iv = () => 2.2 + Math.random() * 1.6;
    } else if (s.id === 'gotas') {
      out.gain.value = 0.5; o.fire = t => this.drop(out, t); o.iv = () => 0.25 + Math.random() * 0.9;
    } else if (s.id === 'madeira') {
      out.gain.value = 0.55; o.fire = t => { this.wood(out, t, o.n % 4 === 3); o.n++; }; o.iv = () => 0.625;
    } else if (s.id === 'vento') {
      out.gain.value = 0.9; o.fire = () => {}; o.iv = () => 2.6 + Math.random() * 1.4;
      const n = c.createBufferSource(); n.buffer = this.noise; n.loop = true;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = 0.7;
      const l1 = c.createOscillator(); l1.frequency.value = 0.09;
      const lg1 = c.createGain(); lg1.gain.value = 280; l1.connect(lg1); lg1.connect(bp.frequency);
      const l2 = c.createOscillator(); l2.frequency.value = 0.13;
      const lg2 = c.createGain(); lg2.gain.value = 0.35; l2.connect(lg2); lg2.connect(g.gain);
      n.connect(bp); bp.connect(g); g.connect(out);
      o.nodes = [n, l1, l2];
    } else {
      out.gain.value = 0.5; o.fire = () => {}; o.iv = () => 3 + Math.random() * 1.5;
      const amp = c.createGain(); amp.gain.value = 0.7; amp.connect(out);
      const mk = (f, a) => {
        const x = c.createOscillator(); x.type = 'sine'; x.frequency.value = f;
        const gg = c.createGain(); gg.gain.value = a; x.connect(gg); gg.connect(amp); return x;
      };
      const l = c.createOscillator(); l.frequency.value = 0.08;
      const lg = c.createGain(); lg.gain.value = 0.3; l.connect(lg); lg.connect(amp.gain);
      o.nodes = [mk(130.8, 0.4), mk(131.7, 0.4), mk(196, 0.18), l];
    }
    return o;
  },
  begin(vol) {
    const c = this.ctx, now = c.currentTime;
    this.srcs = SOURCES.map((_, i) => this.build(i));
    this.srcs.forEach((o, i) => {
      if (o.nodes) o.nodes.forEach(n => n.start(now));
      o.next = now + 0.4 + i * 0.45;
    });
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(0.0001, now);
    this.master.gain.linearRampToValueAtTime(this.level(vol), now + 4);
    this.live = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 50);
  },
  tick() {
    if (!this.live) return;
    const c = this.ctx, h = c.currentTime + 0.3;
    this.srcs.forEach(o => {
      let guard = 0;
      while (o.next < h && guard++ < 20) {
        const t = o.next;
        o.fire(t);
        setTimeout(() => pulse(o.i), Math.max(0, (t - c.currentTime) * 1000));
        o.next += o.iv();
      }
    });
  },
  end(natural) {
    if (!this.ctx) return;
    const c = this.ctx, now = c.currentTime;
    this.live = false; clearInterval(this.timer);
    if (natural) this.gong(now + 0.2);
    const list = this.srcs; this.srcs = [];
    list.forEach(o => { o.out.gain.cancelScheduledValues(now); o.out.gain.setTargetAtTime(0, now, 0.2); });
    setTimeout(() => {
      list.forEach(o => {
        (o.nodes || []).forEach(n => { try { n.stop(); } catch (e) { /* ok */ } });
        try { o.out.disconnect(); o.pan.disconnect(); } catch (e) { /* ok */ }
      });
    }, 1800);
  },
  test(vol, kit) {
    if (!this.init()) return false;
    const c = this.ctx;
    if (c.resume) c.resume();
    const now = c.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.level(vol), now);
    const tmp = (ang, gv) => {
      const g = c.createGain(); g.gain.value = gv;
      const p = this.panner(ang, 3); g.connect(p); p.connect(this.master);
      setTimeout(() => { try { g.disconnect(); p.disconnect(); } catch (e) { /* ok */ } }, 6000);
      return g;
    };
    const L = tmp(290, 0.55), Rr = tmp(70, 0.5), F = tmp(0, 0.55);
    if (kit) {
      this.cymbal(L, now + 0.15);
      [1.5, 1.8, 2.2].forEach(d => this.hat(Rr, now + d));
      [0, 1, 2, 3].forEach(k => this.kick(F, now + 3.2 + k * 0.5));
    } else {
      this.bell(L, now + 0.15);
      [1.5, 1.8, 2.2].forEach(d => this.drop(Rr, now + d));
      [0, 1, 2, 3].forEach(k => this.wood(F, now + 3.2 + k * 0.5, k === 3));
    }
    return true;
  }
};

/* ── Voz (opcional) ──────────────────────────────────────────────────── */
const Voice = {
  ok: ('speechSynthesis' in window) && ('SpeechSynthesisUtterance' in window), on: false,
  say(t) {
    if (!this.on || !this.ok) return;
    try {
      speechSynthesis.cancel();
      setTimeout(() => {
        try {
          const u = new SpeechSynthesisUtterance(t);
          u.lang = 'pt-BR'; u.rate = 0.92; u.volume = 0.9;
          const v = speechSynthesis.getVoices().find(x => /^pt[-_]BR/i.test(x.lang));
          if (v) u.voice = v;
          speechSynthesis.speak(u);
        } catch (e) { /* ok */ }
      }, 60);
    } catch (e) { /* ok */ }
  },
  stop() { try { if (this.ok) speechSynthesis.cancel(); } catch (e) { /* ok */ } }
};

/* ── Tela sempre ligada durante a sessão ─────────────────────────────── */
let wl = null;
async function lockScreen() { try { if ('wakeLock' in navigator) wl = await navigator.wakeLock.request('screen'); } catch (e) { /* ok */ } }
function unlockScreen() { try { if (wl) wl.release(); } catch (e) { /* ok */ } wl = null; }

/* ── Estado da sessão ────────────────────────────────────────────────── */
const S = {
  mode: 'full', tl: [], ph: [], total: 0, elapsed: 0, seg: -1, phase: -1,
  running: false, finished: false, last: 0, iv: null, before: null, targets: new Set(),
  doneSec: 0, completa: false, ck: 'w'
};

function pulse(i) {
  if (S.running && _cur === 'session' && S.targets.has(i)) liveMap.ripple(i);
}

function buildTimeline(mode) {
  const durs = MODES[mode].durs, tl = [], ph = [];
  let t = 0;
  tl.push({ phase: 0, start: 0, end: LEAD, t: [] }); t = LEAD;
  const order = [0, 1, 2, 3, 4], each = durs[0] / order.length, p1s = t;
  order.forEach(i => { tl.push({ phase: 1, start: t, end: t + each, t: [i] }); t += each; });
  ph.push({ start: p1s, end: t, dur: durs[0] });
  const p2s = t, p2e = t + durs[1];
  let last = order[order.length - 1];
  while (t < p2e - 0.01) {
    let d = 5 + Math.floor(Math.random() * 9) / 2;
    if (p2e - (t + d) < 3) d = p2e - t;
    let i;
    do { i = Math.floor(Math.random() * SOURCES.length); } while (i === last);
    tl.push({ phase: 2, start: t, end: t + d, t: [i] });
    last = i; t += d;
  }
  ph.push({ start: p2s, end: p2e, dur: durs[1] });
  tl.push({ phase: 3, start: t, end: t + durs[2], t: [0, 1, 2, 3, 4] });
  ph.push({ start: t, end: t + durs[2], dur: durs[2] });
  t += durs[2];
  return { tl: tl, ph: ph, total: t };
}

function segAt(e) {
  for (let i = Math.max(0, S.seg); i < S.tl.length; i++) { if (e < S.tl[i].end) return i; }
  return S.tl.length - 1;
}

function onSeg(seg) {
  const newPhase = S.phase !== seg.phase;
  S.phase = seg.phase;
  S.targets = new Set(seg.t);
  const P = PH_TXT[seg.phase];
  const single = seg.t.length === 1 ? SOURCES[seg.t[0]] : null;
  if (newPhase) {
    $('ph-tag').textContent = seg.phase === 0 ? 'Preparação' : 'Fase ' + seg.phase + ' de 3 · ' + P.titulo;
    $('instr').textContent = P.txt;
    if (seg.phase >= 1 && Au.ctx) Au.gong(Au.ctx.currentTime + 0.05);
  }
  $('f-k').textContent = ['Olhar fixo', 'Foque neste som', 'Troque para', 'Perceba'][seg.phase];
  $('f-n').textContent = seg.phase === 0 ? 'Um ponto à frente' : single ? single.nome : 'Todos os sons';
  $('f-w').textContent = seg.phase === 0 ? 'e mantenha o olhar nele' : single ? single.onde : 'ao seu redor';
  liveMap.setTargets(S.targets, single ? single.ang : null);
  if (newPhase) {
    let txt = P.voz;
    if (single) txt += (seg.phase === 1 ? ' Primeiro, ' : ' ') + single.nome.toLowerCase() + (seg.phase === 1 ? ', ' + single.onde : '') + '.';
    Voice.say(txt);
  } else if (single) {
    Voice.say(seg.phase === 1 ? 'Agora, ' + single.nome.toLowerCase() + ', ' + single.onde + '.' : single.nome);
  }
}

function render() {
  const i = segAt(S.elapsed);
  if (i !== S.seg) { S.seg = i; onSeg(S.tl[i]); }
  const seg = S.tl[S.seg];
  const phEnd = seg.phase === 0 ? LEAD : S.ph[seg.phase - 1].end;
  $('clk').textContent = mmss(phEnd - S.elapsed);
  $('clk-total').textContent = mmss(S.total - S.elapsed);
  document.querySelectorAll('#bars .pseg i').forEach((el, k) => {
    el.style.setProperty('--p', clamp((S.elapsed - S.ph[k].start) / S.ph[k].dur, 0, 1));
  });
}

function tick() {
  if (!S.running) return;
  const now = performance.now();
  S.elapsed = Math.min(S.total, S.elapsed + (now - S.last) / 1000);
  S.last = now;
  render();
  if (S.elapsed >= S.total) finish(true);
}

function setPauseUI(p) {
  $('btn-pause').textContent = p ? 'Continuar' : 'Pausar';
  $('paused').hidden = !p;
}
function pause() {
  if (!S.running) return;
  S.running = false; clearInterval(S.iv);
  if (Au.ctx && Au.ctx.suspend) Au.ctx.suspend();
  Voice.stop(); setPauseUI(true);
}
function resume() {
  if (S.running || S.finished) return;
  S.running = true; S.last = performance.now();
  S.iv = setInterval(tick, 250);
  if (Au.ctx && Au.ctx.resume) Au.ctx.resume();
  lockScreen(); setPauseUI(false);
}

async function startSession() {
  if (S.running) return;
  if (!Au.init()) { toast('Este navegador não consegue reproduzir os sons. Tente outro navegador.'); return; }
  try { await Au.ctx.resume(); } catch (e) { /* ok */ }
  S.mode = CFG.mode;
  S.before = readSliders('b');
  const t = buildTimeline(S.mode);
  S.tl = t.tl; S.ph = t.ph; S.total = t.total;
  S.elapsed = 0; S.seg = -1; S.phase = -1; S.finished = false; S.targets = new Set();
  $('bars').innerHTML = S.ph.map(p => '<div class="pseg" style="flex:' + p.dur + ' 1 0"><i></i></div>').join('');
  liveMap.setLive(true); liveMap.setTargets(new Set(), null);
  $('end-confirm').hidden = true;
  goTo('session'); setPauseUI(false);
  Au.begin(CFG.volume);
  lockScreen();
  S.running = true; S.last = performance.now();
  S.iv = setInterval(tick, 250);
  render();
}

function finish(natural) {
  if (S.finished) return;
  S.finished = true; S.running = false; clearInterval(S.iv);
  Voice.stop();
  if (natural) Voice.say('Fim do exercício. Respire e volte ao ambiente.');
  Au.end(natural); unlockScreen();
  S.doneSec = Math.round(Math.max(0, S.elapsed - LEAD));
  S.completa = natural;
  $('after-tag').textContent = natural ? 'Sessão completa' : 'Sessão encerrada antes do fim';
  resetSliders('a'); $('note').value = '';
  liveMap.setLive(false);
  goTo('after');
}

/* ── Campos de nota (0 a 10, sempre opcionais) ───────────────────────── */
function sliderHtml(p, m) {
  return '<div class="field" data-touched="0" data-k="' + m.k + '"><div class="field-h"><label for="' + p + '-' + m.k + '">' + m.nome + '</label><output class="val" id="' + p + '-' + m.k + '-o" for="' + p + '-' + m.k + '">sem nota</output></div><span class="hint-t">' + m.dica + '</span><input class="rng" type="range" id="' + p + '-' + m.k + '" min="0" max="10" step="1" value="5"></div>';
}
function buildSliders() {
  $('sl-b').innerHTML = METRICS.map(m => sliderHtml('b', m)).join('');
  $('sl-a').innerHTML = METRICS.map(m => sliderHtml('a', m)).join('');
}
function readSliders(p) {
  const o = { w: null, s: null, c: null };
  METRICS.forEach(m => {
    const f = $(p + '-' + m.k).closest('.field');
    if (f.dataset.touched === '1') o[m.k] = +$(p + '-' + m.k).value;
  });
  return o;
}
function resetSliders(p) {
  METRICS.forEach(m => {
    const inp = $(p + '-' + m.k);
    inp.value = 5; inp.closest('.field').dataset.touched = '0';
    $(p + '-' + m.k + '-o').textContent = 'sem nota';
  });
}
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches && t.matches('.field input[type=range]')) {
    t.closest('.field').dataset.touched = '1';
    const out = $(t.id + '-o'); if (out) out.textContent = t.value;
  }
});

function dumb(label, a, b) {
  let marks = '';
  if (a != null) marks += '<i class="m b" style="left:' + a * 10 + '%"></i>';
  if (b != null) marks += '<i class="m a" style="left:' + b * 10 + '%"></i>';
  const bar = (a != null && b != null) ? '<i class="bar" style="left:' + Math.min(a, b) * 10 + '%;width:' + Math.abs(a - b) * 10 + '%"></i>' : '';
  const val = (a != null && b != null) ? a + ' → ' + b : a != null ? 'antes ' + a : b != null ? 'depois ' + b : 'sem registro';
  return '<div class="dumb"><span class="dumb-l">' + label + '</span><div class="dumb-t">' + bar + marks + '</div><span class="dumb-v">' + val + '</span></div>';
}

/* ── Salvar ──────────────────────────────────────────────────────────── */
function saveSession() {
  const rec = {
    id: Date.now(), iso: new Date().toISOString(), modo: S.mode,
    conjunto: CFG.conjunto === 'bateria' ? 'bateria' : undefined,
    planejado: MODES[S.mode].durs.reduce((a, b) => a + b, 0),
    feito: S.doneSec, completa: S.completa,
    antes: S.before || { w: null, s: null, c: null },
    depois: readSliders('a'), nota: $('note').value.trim()
  };
  SESS.push(rec); saveSess();
  $('done-rows').innerHTML = METRICS.map(m => dumb(m.nome, rec.antes[m.k], rec.depois[m.k])).join('');
  $('done-warn').hidden = STORE_OK;
  resetSliders('b');
  goTo('done');
}

/* ── Progresso ───────────────────────────────────────────────────────── */
function exampleItems() {
  const W = { b: [8, 6, 7, 7, 5, 6], a: [6, 5, 7, 4, 4, 6] }, A = { b: [7, 6, 6, 7, 5, 5], a: [5, 5, 6, 5, 4, 4] }, C = { b: [3, 4, 3, 4, 5, 4], a: [4, 4, 3, 5, 5, 6] };
  const out = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(); d.setDate(d.getDate() - (5 - i));
    out.push({ iso: d.toISOString(), antes: { w: W.b[i], s: A.b[i], c: C.b[i] }, depois: { w: W.a[i], s: A.a[i], c: C.a[i] } });
  }
  return out;
}

function chartSvg(items, key) {
  const W = 420, H = 260, L = 30, R = 24, T = 22, B = 36, pw = W - L - R, ph = H - T - B, n = items.length;
  const X = i => n === 1 ? L + pw / 2 : L + pw * i / (n - 1);
  const Y = v => T + ph * (1 - v / 10);
  let g = '';
  for (let v = 0; v <= 10; v += 2) {
    g += '<line class="gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
  }
  const step = n > 8 ? 2 : 1;
  items.forEach((it, i) => {
    if ((n - 1 - i) % step === 0) g += '<text class="ax" x="' + X(i).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle">' + fmtShort(it.iso) + '</text>';
  });
  const series = (k2, cls) => {
    let d = '', pts = '', run = false;
    items.forEach((it, i) => {
      const v = it[k2] ? it[k2][key] : null;
      if (v == null) { run = false; return; }
      d += (run ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' ';
      run = true;
      pts += '<circle class="pt ' + cls + '" cx="' + X(i).toFixed(1) + '" cy="' + Y(v).toFixed(1) + '" r="4.5"/>';
    });
    return '<path class="ln ' + cls + '" d="' + d + '"/>' + pts;
  };
  g += series('antes', 'b') + series('depois', 'a');
  let li = -1;
  items.forEach((it, i) => { if (it.depois && it.depois[key] != null) li = i; });
  if (li >= 0) {
    const v = items[li].depois[key], yy = Y(v) < T + 14 ? Y(v) + 22 : Y(v) - 11;
    g += '<text class="endv" x="' + X(li).toFixed(1) + '" y="' + yy.toFixed(1) + '" text-anchor="middle">' + v + '</text>';
  }
  const nome = METRICS.find(m => m.k === key).nome;
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de ' + nome + ' antes e depois de cada sessão, de 0 a 10">' + g + '</svg>';
}

function sessOrdenadas() { return SESS.slice().sort((a, b) => a.id - b.id); }

function renderProgress() {
  const ss = sessOrdenadas();
  const cls = ss.filter(r => r.tipo !== 'toques'), tq = ss.filter(r => r.tipo === 'toques');
  const ex = ss.length === 0;                 // sem nenhum registro: mostra o gráfico de exemplo
  const items = (ex ? exampleItems() : cls).slice(-12);
  $('ps-n').textContent = ss.length;
  $('ps-d').textContent = new Set(ss.map(r => diaLocal(r.iso))).size;
  $('ps-m').textContent = Math.round(ss.reduce((a, r) => a + (r.feito || 0), 0) / 60);
  $('chart-wrap').style.display = (ex || cls.length) ? '' : 'none';
  if (ex || cls.length) {
    $('chart').innerHTML = chartSvg(items, S.ck);
    $('chart-wrap').classList.toggle('is-example', ex);
    $('ex-badge').hidden = !ex;
    document.querySelectorAll('#ck button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === S.ck ? 'true' : 'false'));
  }
  $('store-warn').hidden = STORE_OK;
  $('p-toques').hidden = tq.length === 0;
  if (typeof renderProgressoExtra === 'function') renderProgressoExtra();   // progresso.js: toques, reflexão semanal e relatório
  $('hist-count').textContent = ex ? 'Sessões' : ss.length + (ss.length === 1 ? ' sessão registrada' : ' sessões registradas');
  const list = $('hist-list');
  if (ex) {
    list.innerHTML = '<div class="empty-t">Nenhuma sessão registrada ainda. O gráfico acima é só um exemplo de como ficará. Depois da sua primeira sessão, cada registro aparece aqui, com as notas de antes e depois.</div>';
    return;
  }
  list.innerHTML = ss.slice().reverse().map(r => {
    const dur = r.completa ? minTxt(r.planejado) + ' min, completa' : 'encerrada com ' + Math.floor(r.feito / 60) + ' de ' + minTxt(r.planejado) + ' min';
    const corpo = r.tipo === 'toques'
      ? '<p class="note-box" style="margin:6px 0 0">' + esc(tqResumoLinha(r)) + '</p>'
      : METRICS.map(m => dumb(m.nome, r.antes ? r.antes[m.k] : null, r.depois ? r.depois[m.k] : null)).join('');
    const nome = r.tipo === 'toques' ? ' · ' + (TQ_FASES[r.fase] || 'Com toques') : '';
    return '<article class="hs"><div class="hs-h"><div><strong>' + fmtDate(r.iso) + '</strong> <span class="muted">' + esc(nome) + ' · ' + dur + '</span></div><button type="button" class="link-btn" data-del="' + r.id + '" aria-label="Remover o registro de ' + fmtDate(r.iso) + '">Remover</button></div>'
      + corpo + (r.nota ? '<p class="note-box">' + esc(r.nota) + '</p>' : '') + '</article>';
  }).join('');
}

/* ── Tela inicial ────────────────────────────────────────────────────── */
function renderPhaseList() {
  const d = MODES[S.mode].durs;
  const mins = s => s >= 60 ? String(s / 60).replace('.', ',') + ' min' : s + ' s';
  const swap = S.mode === 'full' ? 'a cada minuto' : 'a cada 30 segundos';
  const rows = [
    ['Um som por vez', 'Atenção em um único som, trocando de som ' + swap + '.'],
    ['Troca rápida', 'A cada poucos segundos, a atenção muda para outro som.'],
    ['Todos juntos', 'Perceber todos os sons ao mesmo tempo, sem se fixar em nenhum.']
  ];
  $('phase-list').innerHTML = rows.map((r, i) => '<li><span class="pn">' + (i + 1) + '</span><b>' + r[0] + '</b><span class="pd">' + mins(d[i]) + '</span><p>' + r[1] + '</p></li>').join('');
}
/* Retorno acolhedor: depois de uma pausa longa, sem cobrança e sem "recuperar" nada */
function renderHome() {
  const ss = sessOrdenadas(), box = $('h-nudge');
  box.innerHTML = '';
  if (!ss.length) return;
  const dias = Math.floor((Date.now() - ss[ss.length - 1].id) / 86400000);
  if (dias >= 7) {
    box.innerHTML = '<div class="insight-c l"><div class="insight-t">Que bom ver você de novo</div><div class="insight-b">Não é preciso recuperar nada. Se hoje estiver difícil, um bloco curto já conta.</div></div>';
  }
  if (typeof wkLembreteHTML === 'function') box.innerHTML += wkLembreteHTML();   // progresso.js
}
/* Bateria: vale para o Clássico (conjunto) e para o Com toques (cenário) */
function usaKit() { return CFG.tipo === 'toques' ? CFG.cenario === 'bateria' : CFG.conjunto === 'bateria'; }
function descrMapa() {
  const n = SOURCES.map(s => s.nome.toLowerCase() + ' ' + s.onde.replace('à sua ', 'à ')).join(', ');
  return 'Mapa dos cinco sons ao seu redor: ' + n + '.';
}
function aplicarConjunto(inicio) {
  SOURCES = CFG.conjunto === 'bateria' ? SOURCES_BATERIA : SOURCES_PADRAO;
  if (!inicio) { homeMap.build(); liveMap.build(); }
  $('map-home').setAttribute('aria-label', descrMapa());
  atualizarAvisoBateria();
}
function atualizarAvisoBateria() {
  const a = $('bat-aviso'); if (a) a.hidden = !usaKit();
  const t = $('test-msg'); if (t) t.textContent = usaKit()
    ? 'Use fones de ouvido. No teste, o prato vem da esquerda, o chimbal da direita e as batidas de bumbo da frente.'
    : 'Use fones de ouvido. No teste, o sino vem da esquerda, as gotas da direita e as batidas da frente.';
}
function setVol(v) {
  v = +v;
  CFG.volume = v;
  $('vol').value = v; $('vol-live').value = v;
  Au.setVol(v); saveCfg();
}

/* ── Dados: exportar e apagar ────────────────────────────────────────── */
function baixar(nome, tipo, texto) {
  const url = URL.createObjectURL(texto instanceof Blob ? texto : new Blob([texto], { type: tipo })), a = document.createElement('a');
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportJSON() {
  baixar('sintonia-meus-dados.json', 'application/json', JSON.stringify({ exportado_em: new Date().toISOString(), app: 'Sintonia', sessoes: sessOrdenadas() }, null, 2));
  toast('Arquivo baixado.');
}
function exportCSV() {
  baixar('sintonia-sessoes.csv', 'text/csv;charset=utf-8', csvSessoes(sessOrdenadas()));
  toast('Arquivo baixado.');
}
function openModal(id) {
  if (id === 'del') {
    showModal('Apagar os dados deste aparelho?', 'Isso apaga as sessões e as notas guardadas <strong>neste aparelho</strong>, e não tem volta. Se você usa uma conta, os dados dela são apagados em "Minha conta". Baixe uma cópia antes, se quiser guardar.',
      '<button class="btn danger" onclick="deleteAll()">Sim, apagar</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>');
  }
}
function deleteAll() {
  SESS = []; try { localStorage.removeItem(K.sess); localStorage.removeItem(K.sem); localStorage.removeItem('sintonia_nome'); } catch (e) { /* ok */ }
  if (typeof WK !== 'undefined') { WK = []; wkIniciado = false; $('repName').value = ''; }
  closeModal(); toast('Dados apagados deste aparelho.'); goTo('home');
}
function removeOne(id) {
  SESS = SESS.filter(s => s.id !== id); saveSess();
  closeModal(); renderProgress(); toast('Registro removido.');
}

let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _installPrompt = e; });
function isInstalled() { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function installApp() { if (!_installPrompt) return; _installPrompt.prompt(); _installPrompt.userChoice.finally(() => { _installPrompt = null; closeModal(); }); }
function showInstallModal() {
  if (isInstalled()) { showModal('🎧 Já está instalado!', 'Você já está usando a Sintonia como app. É só procurar o ícone na tela de início.', '<button class="btn mint" onclick="closeModal()">Ótimo!</button>'); return; }
  showModal('📲 Sintonia na tela de início',
    '<p style="text-align:left;margin-bottom:10px">Com o atalho, a Sintonia abre em tela cheia, como um app, e funciona até sem internet.</p>' +
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
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('[Sintonia] SW:', e.message));

/* ── Splash ── */
(function () {
  const splash = $('splash'); if (!splash) return;
  setTimeout(() => { splash.classList.add('out'); setTimeout(() => splash.classList.add('gone'), 460); }, 1800);
})();

/* ═══════════════ INIT ═══════════════ */
(function init() {
  if (CFG.conjunto !== 'bateria') CFG.conjunto = 'padrao';
  SOURCES = CFG.conjunto === 'bateria' ? SOURCES_BATERIA : SOURCES_PADRAO;
  homeMap = new MapView($('map-home'));
  liveMap = new MapView($('map-session'));
  buildSliders();

  if (!MODES[CFG.mode]) CFG.mode = 'full';
  S.mode = CFG.mode;
  $('mode-' + CFG.mode).checked = true;
  $('vol').value = CFG.volume; $('vol-live').value = CFG.volume;
  if (!Voice.ok) { $('voice-wrap').hidden = true; CFG.voice = false; }
  $('voice').checked = !!CFG.voice; Voice.on = !!CFG.voice && Voice.ok;
  renderPhaseList();

  $('ck').innerHTML = METRICS.map(m => '<button type="button" class="chip" data-k="' + m.k + '" aria-pressed="' + (m.k === S.ck) + '">' + m.curto + '</button>').join('');

  document.querySelectorAll('input[name=mode]').forEach(r => r.addEventListener('change', () => {
    CFG.mode = r.value; S.mode = r.value; saveCfg(); renderPhaseList();
  }));
  $('vol').addEventListener('input', e => setVol(e.target.value));
  $('vol-live').addEventListener('input', e => setVol(e.target.value));
  $('voice').addEventListener('change', e => {
    CFG.voice = e.target.checked; Voice.on = e.target.checked && Voice.ok; saveCfg();
    if (Voice.on) Voice.say('Instruções faladas ligadas.');
  });
  $('test').addEventListener('click', () => {
    const kit = usaKit(), ok = Au.test(CFG.volume, kit);
    $('test-msg').textContent = ok ? (kit ? 'Você deve ouvir um prato à esquerda, chimbal à direita e quatro batidas de bumbo à frente. Se tudo vier do mesmo lado, confira os fones.' : 'Você deve ouvir um sino à esquerda, gotas à direita e quatro batidas à frente. Se tudo vier do mesmo lado, confira os fones.') : 'Este navegador não consegue reproduzir os sons. Tente outro navegador.';
  });
  const cj = $('conj-' + CFG.conjunto); if (cj) cj.checked = true;
  document.querySelectorAll('input[name=conjunto]').forEach(r => r.addEventListener('change', () => { CFG.conjunto = r.value; saveCfg(); aplicarConjunto(); }));
  aplicarConjunto(true);
  $('start').addEventListener('click', startSession);
  $('btn-pause').addEventListener('click', () => { S.running ? pause() : resume(); });
  $('btn-end').addEventListener('click', () => { pause(); $('end-confirm').hidden = false; });
  $('end-no').addEventListener('click', () => { $('end-confirm').hidden = true; resume(); });
  $('end-yes').addEventListener('click', () => { $('end-confirm').hidden = true; finish(false); });
  $('save').addEventListener('click', saveSession);
  $('discard').addEventListener('click', () => { resetSliders('b'); goTo('home'); });
  $('done-hist').addEventListener('click', () => goTo('progress'));
  $('done-new').addEventListener('click', () => goTo('home'));

  $('ck').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    S.ck = b.dataset.k; renderProgress();
  });
  $('hist-list').addEventListener('click', e => {
    const b = e.target.closest('[data-del]'); if (!b) return;
    const id = +b.dataset.del;
    showModal('Remover este registro?', 'O registro desta sessão será apagado deste aparelho e não tem volta.',
      '<button class="btn danger" onclick="removeOne(' + id + ')">Sim, remover</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && S.running) pause(); });

  let k = 0;
  setInterval(() => {
    if (_cur === 'home' && CFG.tipo !== 'toques' && !document.hidden) { homeMap.ripple(k % SOURCES.length); k++; }
  }, 1700);

  const ob = rd(K.ob, null);
  if ((ob && ob.feito) || SESS.length) { $('onboard').classList.add('hide'); goTo('home'); }   // quem já usava não vê a introdução de novo
  else { $('onboard').classList.remove('hide'); }
  _booted = true;
})();
