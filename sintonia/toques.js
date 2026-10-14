/* ═══════════════════════════════════════════════════════════════════════
   Sintonia — toques.js
   Tipo de treino "Com toques": adaptação para TDAH, a partir da Clareira (artefato criado pela Paula).
   Cada bloco é UMA fase (Foco seletivo, Alternância ou Atenção dividida), de 3, 5 ou 8 minutos, num cenário
   sonoro (Floresta, Oceano ou Espaço). De vez em quando um som vem DUAS vezes seguidas (a segunda, um pouco
   mais aguda): a pessoa toca na fonte quando percebe. Medimos chamadas percebidas, tempo de resposta, foco
   contínuo e voltas ao foco. Sem pontos, sem derrota, sem ranking: a pessoa só se compara consigo mesma.
   Usa o contexto de áudio (Au.ctx), o armazenamento (SESS), o modal e o toast de app.js.
   Não é a ATT clássica de Wells: é uma tarefa de detecção. Veja ARQUITETURA.md.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

const TQ_FASES = ['', 'Foco seletivo', 'Alternância', 'Atenção dividida'];
const TQ_OPCOES = {
  cenario: [['floresta', 'Floresta'], ['oceano', 'Oceano'], ['espaco', 'Espaço']],
  tdur: [[3, '3 min'], [5, '5 min'], [8, '8 min']],
  sons: [[3, 'Baixa'], [4, 'Média'], [5, 'Alta']],
  ritmo: [['lento', 'Lento'], ['medio', 'Médio'], ['rapido', 'Rápido']],
  visual: [['calma', 'Calma'], ['media', 'Média'], ['viva', 'Viva']],
  guia: [[true, 'Ligado'], [false, 'Desligado']]
};
const TQ_CENAS = {
  floresta: { label: 'Floresta', voices: [
    { name: 'Pássaro', lbl: 'o pássaro', hue: 48, gap: [1.7, 3.4], v: { kind: 'chirp', f0: 2500, f1: 3400, d: .16, wave: 'sine', peak: .16 } },
    { name: 'Gota', lbl: 'a gota', hue: 195, gap: [1.5, 3.0], v: { kind: 'chirp', f0: 650, f1: 1350, d: .09, wave: 'sine', peak: .2 } },
    { name: 'Grilo', lbl: 'o grilo', hue: 95, gap: [2.2, 4.0], v: { kind: 'trill', f: 4300, n: 5, gap: .055, d: .03, peak: .07 } },
    { name: 'Passos', lbl: 'os passos', hue: 22, gap: [1.4, 2.6], v: { kind: 'thump', f0: 130, f1: 50, d: .2, peak: .5 } },
    { name: 'Sinos', lbl: 'os sinos', hue: 290, gap: [2.4, 4.6], v: { kind: 'chime', f: 1175, d: 1.5, peak: .12 } },
    { name: 'Coruja', lbl: 'a coruja', hue: 340, gap: [2.8, 5.0], v: { kind: 'chirp', f0: 430, f1: 380, d: .38, wave: 'sine', vib: [5, 8], peak: .22 } }
  ] },
  oceano: { label: 'Oceano', voices: [
    { name: 'Gaivota', lbl: 'a gaivota', hue: 48, gap: [2.2, 4.0], v: { kind: 'chirp', f0: 1900, f1: 1350, d: .28, wave: 'triangle', vib: [9, 60], peak: .11 } },
    { name: 'Onda', lbl: 'a onda', hue: 195, gap: [3.0, 5.4], v: { kind: 'noise', ft: 'lowpass', f: 350, f1: 1400, q: .7, a: .9, d: 1.1, peak: .2 } },
    { name: 'Boia', lbl: 'a boia', hue: 22, gap: [3.0, 5.4], v: { kind: 'chime', f: 330, d: 2.0, peak: .14 } },
    { name: 'Golfinho', lbl: 'o golfinho', hue: 290, gap: [2.5, 4.5], v: { kind: 'whistle', f0: 1300, f1: 2800, f2: 1900, d: .42, peak: .1 } },
    { name: 'Barco', lbl: 'o barco', hue: 95, gap: [3.0, 5.0], v: { kind: 'hum', f: 62, a: .4, d: 1.2, peak: .24 } },
    { name: 'Bolhas', lbl: 'as bolhas', hue: 340, gap: [1.4, 2.8], v: { kind: 'chirp', f0: 300, f1: 900, d: .07, wave: 'sine', peak: .2 } }
  ] },
  espaco: { label: 'Espaço', voices: [
    { name: 'Pulsar', lbl: 'o pulsar', hue: 48, gap: [1.2, 2.2], v: { kind: 'blip', f: 760, d: .06, wave: 'square', peak: .06 } },
    { name: 'Sonar', lbl: 'o sonar', hue: 195, gap: [2.6, 4.6], v: { kind: 'chirp', f0: 1250, f1: 1190, d: .9, wave: 'sine', peak: .14 } },
    { name: 'Rádio', lbl: 'o rádio', hue: 22, gap: [1.8, 3.6], v: { kind: 'noise', ft: 'bandpass', f: 1800, q: 7, a: .02, d: .22, peak: .14 } },
    { name: 'Nave', lbl: 'a nave', hue: 95, gap: [3.2, 5.2], v: { kind: 'hum', f: 55, a: .5, d: 1.6, peak: .22 } },
    { name: 'Cometa', lbl: 'o cometa', hue: 340, gap: [3.5, 6.0], v: { kind: 'noise', ft: 'bandpass', f: 300, f1: 5200, q: 2.5, a: .15, d: .9, peak: .12 } },
    { name: 'Estrela', lbl: 'a estrela', hue: 290, gap: [2.2, 4.2], v: { kind: 'chime', f: 1568, d: 1.4, peak: .09 } }
  ] }
};
/* Cores do palco por cenário (o design system da Sintonia é só claro) */
const TQ_PAL = {
  floresta: { top: '#e2f1e7', bot: '#c4e1d0', gnd: '#a8cdb8', dot: '#fffbe0', stem: '#3f8a66' },
  oceano: { top: '#dcedf5', bot: '#b8dbe8', gnd: '#9cc8d9', dot: '#ffffff', stem: '#2f86a8' },
  espaco: { top: '#e6e5f5', bot: '#cdc9ea', gnd: '#b7b1de', dot: '#ffffff', stem: '#6a63b8' }
};
const TQ_TH = { fg: '#3F434B', glow: '#C47D2A' };

function tqRand(a, b) { return a + Math.random() * (b - a); }
function tqPl(n, s, p) { return n === 1 ? s : p; }
function tqShuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function tqRng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ── Áudio (usa o AudioContext da Sintonia, com a sua própria saída) ───── */
let tctx = null, tmaster = null, tnoise = null;
function tqAudio() {
  if (tctx) return true;
  if (!Au.init()) return false;
  tctx = Au.ctx;
  const comp = tctx.createDynamicsCompressor();
  tmaster = tctx.createGain(); tmaster.gain.value = 0; tmaster.connect(comp); comp.connect(tctx.destination);
  const len = Math.floor(tctx.sampleRate * 4);
  tnoise = tctx.createBuffer(1, len, tctx.sampleRate);
  const d = tnoise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return true;
}
function tqLevel() { return Math.max(Math.pow(CFG.volume / 100, 1.3) * 0.9, 0.0001); }   // volume baixo por padrão, como no tipo clássico
function tqPanner(p) { if (tctx.createStereoPanner) { const n = tctx.createStereoPanner(); n.pan.value = p; return n; } return null; }
function tqEnv(t, a, d, peak) { const g = tctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); return g; }
function tqNoise(v, t, dest) {
  const s = tctx.createBufferSource(); s.buffer = tnoise;
  const f = tctx.createBiquadFilter(); f.type = v.ft; f.Q.value = v.q || 1; f.frequency.setValueAtTime(v.f, t);
  if (v.f1) f.frequency.exponentialRampToValueAtTime(v.f1, t + v.a + v.d);
  const g = tqEnv(t, v.a, v.d, v.peak);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 1.8); s.stop(t + v.a + v.d + 0.05);
}
function tqVoice(v, t, dest, mul) {
  const k = v.kind;
  if (k === 'chirp' || k === 'whistle') {
    const o = tctx.createOscillator(); o.type = v.wave || 'sine';
    o.frequency.setValueAtTime(v.f0 * mul, t);
    if (k === 'chirp') { o.frequency.exponentialRampToValueAtTime(v.f1 * mul, t + v.d); }
    else { o.frequency.exponentialRampToValueAtTime(v.f1 * mul, t + v.d * 0.55); o.frequency.exponentialRampToValueAtTime(v.f2 * mul, t + v.d); }
    const vib = v.vib || (k === 'whistle' ? [7, 25] : null);
    if (vib) { const l = tctx.createOscillator(); l.frequency.value = vib[0]; const lg = tctx.createGain(); lg.gain.value = vib[1]; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + v.d + 0.1); }
    const g = tqEnv(t, k === 'whistle' ? 0.04 : 0.012, v.d, v.peak);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + v.d + 0.1);
  } else if (k === 'thump') {
    const o = tctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(v.f0 * mul, t); o.frequency.exponentialRampToValueAtTime(v.f1, t + v.d);
    const g = tqEnv(t, 0.004, v.d, v.peak); o.connect(g); g.connect(dest); o.start(t); o.stop(t + v.d + 0.1);
    tqNoise({ ft: 'lowpass', f: 500, q: .5, a: .003, d: .07, peak: .12 }, t, dest);
  } else if (k === 'chime') {
    [[1, 1], [2.76, .35], [5.4, .12]].forEach((p, i) => {
      const o = tctx.createOscillator(); o.type = 'sine'; o.frequency.value = v.f * p[0] * mul;
      const g = tqEnv(t, 0.006, v.d / (1 + 0.7 * i), v.peak * p[1]); o.connect(g); g.connect(dest); o.start(t); o.stop(t + v.d + 0.1);
    });
  } else if (k === 'trill') {
    for (let i = 0; i < v.n; i++) {
      const tt = t + i * v.gap; const o = tctx.createOscillator(); o.type = 'sine'; o.frequency.value = v.f * mul;
      const g = tqEnv(tt, 0.005, v.d, v.peak); o.connect(g); g.connect(dest); o.start(tt); o.stop(tt + v.d + 0.05);
    }
  } else if (k === 'blip') {
    const o = tctx.createOscillator(); o.type = v.wave || 'square'; o.frequency.value = v.f * mul;
    const g = tqEnv(t, 0.004, v.d, v.peak); o.connect(g); g.connect(dest); o.start(t); o.stop(t + v.d + 0.05);
  } else if (k === 'noise') {
    tqNoise(v, t, dest);
  } else if (k === 'hum') {
    const o = tctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = v.f * mul;
    const f = tctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
    const l = tctx.createOscillator(); l.frequency.value = .9; const lg = tctx.createGain(); lg.gain.value = 3; l.connect(lg); lg.connect(o.frequency);
    const g = tqEnv(t, v.a, v.d, v.peak);
    o.connect(f); f.connect(g); g.connect(dest);
    o.start(t); o.stop(t + v.a + v.d + 0.1); l.start(t); l.stop(t + v.a + v.d + 0.1);
  }
}
function tqPlayHit() {
  const t = tctx.currentTime + 0.01;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const tt = t + i * 0.06; const o = tctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
    const g = tqEnv(tt, 0.01, 0.35, 0.07); o.connect(g); g.connect(tmaster); o.start(tt); o.stop(tt + 0.5);
  });
}
function tqPlayCue(pan, t) {
  [587.33, 783.99].forEach((f, i) => {
    const tt = t + i * 0.13; const o = tctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = tqEnv(tt, 0.01, 0.4, 0.07); const p = tqPanner(pan);
    o.connect(g); if (p) { g.connect(p); p.connect(tmaster); } else g.connect(tmaster); o.start(tt); o.stop(tt + 0.6);
  });
}

/* ── Estado do bloco ─────────────────────────────────────────────────── */
let TG = null, tqTickId = 0, tqRaf = 0, tqAntes = null, TQ_REC = null;
const TV = { w: 0, h: 0, dpr: 1 };
let tcv = null, tcx = null;

function tqResize() {
  const st = $('tq-stage'); const w = st.clientWidth, h = st.clientHeight;
  if (!w || !h) return;
  TV.dpr = Math.min(window.devicePixelRatio || 1, 2); TV.w = w; TV.h = h;
  tcv.width = Math.round(w * TV.dpr); tcv.height = Math.round(h * TV.dpr);
}
function tqOrbR() { const n = TG ? TG.sources.length : 4; return clamp(Math.min(TV.w * 0.075, TV.h * 0.11), 18, 40) * (n >= 6 ? 0.85 : 1); }

function tqStart(fase) {
  if (TG && !TG.ended) return;
  if (!tqAudio()) { toast('Este navegador não consegue reproduzir os sons. Tente outro navegador.'); return; }
  tctx.resume();
  const cena = TQ_CENAS[CFG.cenario];
  const dur = CFG.tdur * 60;
  let n = CFG.sons; if (fase === 3) n = Math.max(n, 4);
  const pool = tqShuffle(cena.voices.slice()).slice(0, n);
  const now = tctx.currentTime;
  const sources = pool.map((def, i) => {
    const out = tctx.createGain(); out.gain.value = 0;
    const t = n === 1 ? 0.5 : i / (n - 1);
    const nx = 0.11 + 0.78 * t, ny = 0.36 - 0.15 * Math.sin(Math.PI * t);
    const pan = clamp((nx - 0.5) * 2 * 0.95, -0.95, 0.95);
    const pn = tqPanner(pan);
    if (pn) { out.connect(pn); pn.connect(tmaster); } else out.connect(tmaster);
    return { def, out, nx, ny, pan, joined: false, joinAt: 0, joinT: 0, nextAt: 0, eventCount: 0, lastSpecial: -99, pulses: [] };
  });
  const target = Math.floor(Math.random() * n);
  const others = tqShuffle(sources.map((s, i) => i).filter(i => i !== target));
  if (fase === 1) { sources[target].joinAt = 0; others.forEach((ix, k) => { sources[ix].joinAt = 16 + 9 * k; }); }
  else if (fase === 2) { sources[target].joinAt = 0; others.forEach((ix, k) => { sources[ix].joinAt = 4 + 9 * k; }); }
  else { tqShuffle(sources.map((s, i) => i)).forEach((ix, k) => { sources[ix].joinAt = 6 * k; }); }
  const parts = Array.from({ length: { calma: 8, media: 18, viva: 34 }[CFG.visual] }, () => ({ x: Math.random(), y: Math.random() * 0.8, r: tqRand(.8, 2.2), ph: tqRand(0, 6.28), sp: tqRand(.15, .5) }));
  TG = {
    fase, dur, sources, target: fase === 3 ? -1 : target, t0: now + 2.6, closing: false, closeAt: 0, fadeDur: 5, ended: false, paused: false, encerrado: false,
    hits: [], specials: [], blooms: [], ripples: [], parts, lastAny: -99, specialOK: 0, switches: 0, nextSwitchAt: 0, rotateStart: 24,
    ringFrom: [sources[target].nx, sources[target].ny], ringT0: now - 10, statusTxt: '', leftTxt: '', rts: [], oppTotal: 0, cenario: CFG.cenario, ritmo: CFG.ritmo, sons: n
  };
  TG.baseInt = { lento: 26, medio: 17, rapido: 10 }[CFG.ritmo];
  TG.nextSwitchAt = TG.t0 + TG.rotateStart;
  tmaster.gain.cancelScheduledValues(now); tmaster.gain.setValueAtTime(0.0001, now);
  tmaster.gain.linearRampToValueAtTime(tqLevel(), TG.t0 + 1.5);
  goTo('tap');
  $('tq-count').textContent = '0'; $('tq-fill').style.width = '0%'; $('tq-left').textContent = '';
  $('tq-pauseov').hidden = true; $('tq-pause').textContent = 'Pausar';
  tcv.setAttribute('aria-label', 'Paisagem sonora de ' + cena.label.toLowerCase() + ' com ' + n + ' fontes. Da esquerda para a direita: ' + sources.map(s => s.def.name).join(', ') + '.');
  $('tq-keys').textContent = 'Teclado: teclas 1 a ' + n + ' tocam nas fontes. Esc pausa.';
  tqResize();
  clearInterval(tqTickId); tqTickId = setInterval(tqTick, 30);
  cancelAnimationFrame(tqRaf); tqRaf = requestAnimationFrame(tqDraw);
  tqTick();
}

function tqJoined() { return TG.sources.filter(s => s.joined).length; }
function tqSetStatus(txt) { if (txt !== TG.statusTxt) { TG.statusTxt = txt; $('tq-status').textContent = txt; } }
function tqStatusText(st) {
  if (TG.closing) return 'Encerrando com calma. Respire.';
  if (st < 0) return 'Respire fundo. Já vamos começar.';
  const t = TG.target >= 0 ? TG.sources[TG.target] : null;
  const lbl = t ? t.def.lbl : '';
  if (TG.fase === 1) {
    if (TG.hits.length === 0) return st < 30 ? 'Escute ' + lbl + '. Às vezes o som vem duas vezes seguidas. Quando ouvir, toque na fonte.' : 'Continue com ' + lbl + '. Quando o som vier duas vezes, toque na fonte.';
    if (tqJoined() <= 1) return 'Isso. Agora outros sons vão chegar ao redor.';
    return 'Siga ' + lbl + '. Se a mente for embora, é só voltar.';
  }
  if (TG.fase === 2) {
    if (TG.hits.length === 0 && st < TG.rotateStart) return CFG.guia ? 'Siga o anel. Quando o som vier duas vezes seguidas, toque na fonte.' : 'Escute ' + lbl + '. Quando o som vier duas vezes seguidas, toque na fonte.';
    return 'Agora siga ' + lbl + '.';
  }
  return TG.hits.length === 0 ? 'Escute tudo ao redor. Quando algum som vier duas vezes seguidas, toque nele.' : 'Boa. Deixe o ouvido aberto para todos os lados.';
}

function tqSchedule(src, idx, when) {
  let special = false;
  if (!TG.closing) {
    const since = when - src.lastSpecial, anyGap = when - TG.lastAny;
    if (TG.fase === 3) {
      if (src.eventCount >= 2 && anyGap >= 1.1 && since >= 5) {
        let p = since >= 14 ? 0.9 : 0.16; if (anyGap >= 6) p = Math.max(p, 0.6);
        special = Math.random() < p;
      }
    } else if (idx === TG.target) {
      if (src.eventCount >= 2 && since >= 3.6 && when >= TG.specialOK && anyGap >= 1.3) {
        special = Math.random() < (since >= 10 ? 1 : 0.3);
      }
    } else {
      if (src.eventCount >= 3 && anyGap >= 1.3 && since >= 6) special = Math.random() < 0.14;
    }
  }
  src.eventCount++;
  tqVoice(src.def.v, when, src.out, 1);
  if (special) {
    tqVoice(src.def.v, when + 0.17, src.out, 1.12);
    src.lastSpecial = when; TG.lastAny = when;
    const conta = TG.fase === 3 || idx === TG.target;
    TG.specials.push({ src: idx, t: when, until: when + 0.17 + 2.8, counts: conta, done: false });
    if (conta) TG.oppTotal++;
  }
  src.pulses.push(when); if (src.pulses.length > 4) src.pulses.shift();
}

function tqSwitch(now) {
  const cand = TG.sources.map((s, i) => i).filter(i => TG.sources[i].joined && i !== TG.target);
  if (!cand.length) return;
  const nt = cand[Math.floor(Math.random() * cand.length)];
  const cur = tqRingPos(now);
  TG.ringFrom = [cur[0], cur[1]]; TG.ringT0 = now;
  TG.target = nt; TG.switches++; TG.specialOK = now + 2.4;
  TG.sources[nt].lastSpecial = -99;
  tqPlayCue(TG.sources[nt].pan, now + 0.02);
  TG.nextSwitchAt = now + TG.baseInt * Math.max(0.6, 1 - 0.05 * TG.switches);
}
function tqRingPos(now) {
  const t = TG.sources[TG.target]; if (!t) return [0.5, 0.4];
  const p = clamp((now - TG.ringT0) / 0.9, 0, 1); const e = 1 - Math.pow(1 - p, 3);
  return [TG.ringFrom[0] + (t.nx - TG.ringFrom[0]) * e, TG.ringFrom[1] + (t.ny - TG.ringFrom[1]) * e];
}

function tqTick() {
  if (!TG || TG.ended || TG.paused) return;
  const now = tctx.currentTime, st = now - TG.t0;
  if (!TG.closing && st >= TG.dur) tqClosing(now, 5);
  if (TG.closing && now >= TG.closeAt + TG.fadeDur + 0.2) { tqFinish(); return; }
  if (!TG.closing) {
    TG.sources.forEach(s => {
      if (!s.joined && st >= s.joinAt) { s.joined = true; s.joinT = now; s.out.gain.cancelScheduledValues(now); s.out.gain.setValueAtTime(0.0001, now); s.out.gain.linearRampToValueAtTime(1, now + 2); s.nextAt = now + tqRand(0.4, 1.2); }
    });
    if (TG.fase === 2 && st >= TG.rotateStart && now >= TG.nextSwitchAt) tqSwitch(now);
    TG.sources.forEach((s, i) => {
      if (!s.joined) return;
      while (s.nextAt <= now + 0.12) {
        const when = Math.max(s.nextAt, now + 0.02);
        tqSchedule(s, i, when);
        s.nextAt = when + tqRand(s.def.gap[0], s.def.gap[1]);
      }
    });
  }
  if (TG.specials.length > 12) TG.specials = TG.specials.filter(x => x.until > now - 1);
  tqSetStatus(tqStatusText(st));
  const frac = clamp(st / TG.dur, 0, 1);
  $('tq-fill').style.width = (frac * 100).toFixed(1) + '%';
  document.querySelector('.tbar').setAttribute('aria-valuenow', String(Math.round(frac * 100)));
  const left = Math.max(0, TG.dur - Math.max(st, 0));
  const txt = left > 60 ? 'restam cerca de ' + Math.ceil(left / 60) + ' min' : 'menos de 1 min';
  if (txt !== TG.leftTxt) { TG.leftTxt = txt; $('tq-left').textContent = txt; }
}

function tqClosing(now, fade) {
  if (TG.closing) return;
  TG.closing = true; TG.closeAt = now; TG.fadeDur = fade;
  tmaster.gain.cancelScheduledValues(now); tmaster.gain.setValueAtTime(Math.max(tmaster.gain.value, 0.0001), now);
  tmaster.gain.linearRampToValueAtTime(0.0001, now + fade);
}
function tqEnd() {
  if (!TG || TG.ended) return;
  if (TG.paused) tqPause(false);
  TG.encerrado = true; tqClosing(tctx.currentTime, 2.2);
}

function tqMetrics() {
  const h = TG.hits.slice().sort((a, b) => a - b); const GAP = 14;
  let returns = 0, longest = 0, start = 0, last = 0;
  for (let i = 0; i < h.length; i++) {
    if (i === 0) { start = h[0]; last = h[0]; continue; }
    if (h[i] - last > GAP) { returns++; start = h[i]; }
    last = h[i]; longest = Math.max(longest, last - start);
  }
  return { hits: h.length, longest: Math.round(longest), returns };
}

function tqFinish() {
  TG.ended = true; clearInterval(tqTickId);
  const now = tctx.currentTime; const secs = Math.round(clamp(now - TG.t0, 0, TG.dur));
  tctx.suspend();
  const m = tqMetrics();
  const prev = sessOrdenadas().filter(r => r.tipo === 'toques' && r.fase === TG.fase && r.chamadas > 0).pop();
  const pending = TG.specials.filter(x => x.counts && !x.done && x.until > TG.closeAt).length;
  const opps = Math.max(TG.oppTotal - pending, m.hits);
  const rts = TG.rts.slice().sort((a, b) => a - b);
  const rt = rts.length ? Math.round(rts[Math.floor(rts.length / 2)] * 100) / 100 : null;
  const rec = {
    id: Date.now(), iso: new Date().toISOString(), tipo: 'toques', fase: TG.fase, cenario: TG.cenario, sons: TG.sons, ritmo: TG.ritmo,
    planejado: TG.dur, feito: secs, completa: !TG.encerrado,
    acertos: m.hits, chamadas: opps, rt: rt, longest: m.longest, voltas: m.returns,
    mente: { antes: tqAntes, depois: null }, antes: { w: null, s: null, c: null }, depois: { w: null, s: null, c: null }, nota: ''
  };
  TQ_REC = rec; SESS.push(rec); saveSess();
  $('ts-hits').textContent = m.hits;
  $('ts-long').textContent = m.longest > 0 ? m.longest + ' s' : '0';
  $('ts-ret').textContent = m.returns;
  $('ts-perc').textContent = opps > 0 ? m.hits + ' de ' + opps : '0';
  $('ts-rt').textContent = rt != null ? fmt1(rt) + ' s' : 'n/d';
  let ct = '';
  if (opps > 0) {
    const rr = m.hits / opps * 100;
    if (prev) {
      const pr = prev.acertos / prev.chamadas * 100, d = rr - pr;
      ct = d >= 3 ? 'Você percebeu mais chamadas do que no bloco anterior desta fase (' + Math.round(rr) + '% contra ' + Math.round(pr) + '%).'
        : d <= -3 ? 'Hoje foi um pouco diferente do bloco anterior desta fase (' + Math.round(rr) + '% contra ' + Math.round(pr) + '%). Oscilar é normal.'
        : 'Muito parecido com o bloco anterior desta fase (' + Math.round(rr) + '%).';
    } else ct = 'Este é seu primeiro bloco desta fase. Ele vira sua base de comparação.';
  }
  $('ts-compare').textContent = ct;
  let msg;
  if (m.hits === 0) msg = 'Hoje a atenção estava em outro lugar, e tudo bem. Da próxima vez, experimente um bloco mais curto ou com menos sons.';
  else if (m.returns > 0) msg = 'Sua atenção se afastou e voltou ' + m.returns + ' ' + tqPl(m.returns, 'vez', 'vezes') + '. Perceber e voltar é o próprio exercício.';
  else msg = 'Seu foco ficou firme na maior parte do bloco.';
  $('ts-msg').textContent = msg;
  tqLimparEscala('after'); $('ts-delta').textContent = '';
  tqAntes = null; tqLimparEscala('before');
  cancelAnimationFrame(tqRaf);
  goTo('tapsum');
}

function tqPause(p) {
  if (!TG || TG.ended || TG.paused === p) return;
  TG.paused = p; $('tq-pauseov').hidden = !p; $('tq-pause').textContent = p ? 'Continuar' : 'Pausar';
  if (p) tctx.suspend(); else tctx.resume();
}
/* Durante o bloco: pausa e oferece ajuda, sem pressa */
function ajudaNoToque() {
  tqPause(true);
  showModal('Você não está sozinho/a', CRISIS_CORPO + crisisBoxHTML('Ajuda agora'),
    CRISIS_LIGAR + '<button class="btn ghost-mint" onclick="closeModal();tqPause(false)" style="margin:0">Voltar ao bloco</button>' +
    '<button class="btn danger" onclick="closeModal();tqEnd()" style="margin:0">Encerrar o bloco</button>');
}

/* ── Toques ──────────────────────────────────────────────────────────── */
function tqTap(i) {
  if (!TG || TG.ended || TG.paused || TG.closing) return;
  const now = tctx.currentTime, s = TG.sources[i]; if (!s || !s.joined) return;
  const sp = TG.specials.find(x => x.src === i && !x.done && now >= x.t - 0.05 && now <= x.until);
  if (sp && sp.counts) {
    sp.done = true;
    TG.rts.push(Math.max(0, now - (sp.t + 0.17)));
    TG.hits.push(now - TG.t0);
    TG.ripples.push({ src: i, t: now, kind: 'hit' });
    const k = TG.blooms.length;
    if (k < 40) TG.blooms.push({ t: now, x: ((0.12 + k * 0.618034) % 1) * 0.88 + 0.06, y: Math.random(), sz: Math.random(), lean: Math.random(), hue: s.def.hue, seed: Math.floor(Math.random() * 1e9) });
    tqPlayHit();
    const c = $('tq-count'); c.textContent = TG.hits.length;
    if (CFG.visual !== 'calma' && !reduced()) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
  } else {
    TG.ripples.push({ src: i, t: now, kind: 'soft' });
  }
}

/* ── Desenho ─────────────────────────────────────────────────────────── */
function tqOrbColor(h, a) { return 'hsla(' + h + ',55%,38%,' + a + ')'; }
function tqBloom(b, i, now, w, h, sc, fa) {
  const p = clamp((now - b.t) / 1.4, 0, 1), e = 1 - Math.pow(1 - p, 3);
  tcx.save(); tcx.globalAlpha = fa; tcx.lineCap = 'round';
  if (TG.cenario === 'floresta') {
    const x = b.x * w, y0 = h * (0.9 + 0.07 * b.y), H = (h * 0.07 + b.sz * h * 0.08) * e, lean = (b.lean - 0.5) * h * 0.05 * e;
    tcx.strokeStyle = sc.stem; tcx.lineWidth = 2; tcx.beginPath(); tcx.moveTo(x, y0); tcx.quadraticCurveTo(x + lean * 0.2, y0 - H * 0.55, x + lean, y0 - H); tcx.stroke();
    const hx = x + lean, hy = y0 - H, pr = (h * 0.014 + b.sz * h * 0.01) * e;
    tcx.fillStyle = tqOrbColor(b.hue, 0.95);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + (b.seed % 7); tcx.beginPath(); tcx.arc(hx + Math.cos(a) * pr * 1.3, hy + Math.sin(a) * pr * 1.3, pr, 0, 6.2832); tcx.fill(); }
    tcx.fillStyle = TQ_TH.glow; tcx.beginPath(); tcx.arc(hx, hy, pr * 0.8, 0, 6.2832); tcx.fill();
  } else if (TG.cenario === 'oceano') {
    const r = tqRng(b.seed), x = b.x * w, y0 = h * (0.93 + 0.05 * b.y), L = (h * 0.05 + b.sz * h * 0.04) * e;
    tcx.strokeStyle = tqOrbColor(b.hue, 0.95);
    (function br(x1, y1, len, ang, d) {
      if (d > 3) return; tcx.lineWidth = Math.max(1, 3.2 - d * 0.8);
      const x2 = x1 + Math.cos(ang) * len, y2 = y1 + Math.sin(ang) * len;
      tcx.beginPath(); tcx.moveTo(x1, y1); tcx.lineTo(x2, y2); tcx.stroke();
      br(x2, y2, len * 0.72, ang - 0.3 - r() * 0.5, d + 1); br(x2, y2, len * 0.72, ang + 0.3 + r() * 0.5, d + 1);
    })(x, y0, L, -Math.PI / 2, 0);
  } else {
    const x = b.x * w, y = h * (0.74 + 0.2 * b.y), s = (h * 0.014 + b.sz * h * 0.012) * e;
    if (i > 0) {
      const pb = TG.blooms[i - 1]; const px = pb.x * w, py = h * (0.74 + 0.2 * pb.y);
      tcx.strokeStyle = tqOrbColor(b.hue, 0.35 * e); tcx.lineWidth = 1; tcx.beginPath(); tcx.moveTo(px, py); tcx.lineTo(px + (x - px) * e, py + (y - py) * e); tcx.stroke();
    }
    tcx.fillStyle = tqOrbColor(b.hue, 0.95); tcx.beginPath(); tcx.arc(x, y, s * 0.6, 0, 6.2832); tcx.fill();
    tcx.strokeStyle = tqOrbColor(b.hue, 0.8); tcx.lineWidth = 1.5; tcx.beginPath(); tcx.moveTo(x - s * 1.8, y); tcx.lineTo(x + s * 1.8, y); tcx.moveTo(x, y - s * 1.8); tcx.lineTo(x, y + s * 1.8); tcx.stroke();
  }
  tcx.restore();
}

function tqDraw() {
  tqRaf = requestAnimationFrame(tqDraw);
  if (!TG || !TV.w) return;
  const now = tctx.currentTime, w = TV.w, h = TV.h;
  const sc = TQ_PAL[TG.cenario];
  const rd0 = reduced();
  const MF = { calma: .5, media: 1, viva: 1.6 }[CFG.visual] * (rd0 ? 0.3 : 1);
  const fade = TG.closing ? clamp(1 - (now - TG.closeAt) / TG.fadeDur, 0, 1) : 1;
  tcx.setTransform(TV.dpr, 0, 0, TV.dpr, 0, 0);
  const gr = tcx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, sc.top); gr.addColorStop(1, sc.bot);
  tcx.fillStyle = gr; tcx.fillRect(0, 0, w, h);
  TG.parts.forEach(p => {
    const px = (p.x + 0.02 * Math.sin(now * 0.2 * p.sp + p.ph) * MF) * w, py = (p.y + 0.015 * Math.cos(now * 0.25 * p.sp + p.ph) * MF) * h;
    const a = (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(now * p.sp * 2 * MF + p.ph))) * fade;
    tcx.fillStyle = sc.dot; tcx.globalAlpha = a; tcx.beginPath(); tcx.arc(px, py, p.r, 0, 6.2832); tcx.fill();
  });
  tcx.globalAlpha = 1;
  const gy = h * 0.86; tcx.fillStyle = sc.gnd; tcx.globalAlpha = 0.9; tcx.beginPath(); tcx.moveTo(0, h); tcx.lineTo(0, gy);
  for (let x = 0; x <= w + 20; x += 20) tcx.lineTo(x, gy + Math.sin(x * 0.02) * 4);
  tcx.lineTo(w, h); tcx.closePath(); tcx.fill(); tcx.globalAlpha = 1;
  TG.blooms.forEach((b, i) => tqBloom(b, i, now, w, h, sc, Math.max(fade, 0.35)));
  /* ponto de ancoragem (olhar) */
  const fx = w * 0.5, fy = h * 0.62, br = 5 + 1.5 * Math.sin(now * 6.2832 / 5) * (rd0 ? 0 : 1);
  tcx.globalAlpha = 0.5 * fade; tcx.strokeStyle = TQ_TH.fg; tcx.lineWidth = 1.2; tcx.beginPath(); tcx.arc(fx, fy, br * 2.6, 0, 6.2832); tcx.stroke();
  tcx.globalAlpha = 0.9 * fade; tcx.fillStyle = TQ_TH.glow; tcx.beginPath(); tcx.arc(fx, fy, br, 0, 6.2832); tcx.fill(); tcx.globalAlpha = 1;
  /* fontes */
  const R = tqOrbR();
  TG.sources.forEach((s, i) => {
    if (!s.joined) return;
    const x = s.nx * w, y = s.ny * h;
    const ja = clamp((now - s.joinT) / 1.8, 0, 1) * fade;
    let pk = 0, pdt = 9;
    s.pulses.forEach(t => { const dt = now - t; if (dt >= 0 && dt < 1.1) { const k = 1 - dt / 1.1; if (k > pk) { pk = k; pdt = dt; } } });
    const r = R * (1 + 0.14 * pk * MF);
    const gl = tcx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.4);
    gl.addColorStop(0, tqOrbColor(s.def.hue, (0.30 + 0.25 * pk) * ja)); gl.addColorStop(1, tqOrbColor(s.def.hue, 0));
    tcx.fillStyle = gl; tcx.beginPath(); tcx.arc(x, y, r * 2.4, 0, 6.2832); tcx.fill();
    tcx.globalAlpha = ja; tcx.fillStyle = tqOrbColor(s.def.hue, 0.95); tcx.beginPath(); tcx.arc(x, y, r, 0, 6.2832); tcx.fill();
    tcx.fillStyle = 'rgba(255,255,255,0.28)'; tcx.beginPath(); tcx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, 6.2832); tcx.fill();
    if (pk > 0) { tcx.globalAlpha = 0.45 * pk * ja * Math.min(MF, 1); tcx.strokeStyle = tqOrbColor(s.def.hue, 1); tcx.lineWidth = 2; tcx.beginPath(); tcx.arc(x, y, r * (1 + 1.2 * (pdt / 1.1)), 0, 6.2832); tcx.stroke(); }
    tcx.globalAlpha = 0.9 * ja; tcx.fillStyle = TQ_TH.fg; tcx.font = '800 ' + (w < 480 ? 12 : 14) + 'px "Nunito Sans", system-ui, sans-serif'; tcx.textAlign = 'center';
    tcx.fillText(s.def.name, x, y + r + 18);
    tcx.globalAlpha = 1;
  });
  /* anel guia */
  if (TG.fase !== 3 && CFG.guia && TG.target >= 0 && !TG.closing) {
    const rp = tqRingPos(now); const rx = rp[0] * w, ry = rp[1] * h;
    tcx.save(); tcx.strokeStyle = TQ_TH.glow; tcx.lineWidth = 2.5;
    if (!rd0 && CFG.visual !== 'calma') { tcx.setLineDash([7, 7]); tcx.lineDashOffset = -now * 10; }
    tcx.globalAlpha = 0.95; tcx.beginPath(); tcx.arc(rx, ry, R * 1.6, 0, 6.2832); tcx.stroke(); tcx.restore();
  }
  /* ondas de toque */
  TG.ripples = TG.ripples.filter(r => now - r.t < 1.4);
  TG.ripples.forEach(r => {
    const s = TG.sources[r.src]; const dt = now - r.t; if (dt < 0) return; const k = 1 - dt / 1.4;
    const x = s.nx * w, y = s.ny * h;
    tcx.save(); tcx.lineWidth = r.kind === 'hit' ? 3 : 1.5; tcx.strokeStyle = r.kind === 'hit' ? TQ_TH.glow : TQ_TH.fg;
    tcx.globalAlpha = (r.kind === 'hit' ? 0.7 : 0.22) * k;
    tcx.beginPath(); tcx.arc(x, y, R * (1 + dt * (r.kind === 'hit' ? 2.6 : 1.2)), 0, 6.2832); tcx.stroke();
    if (r.kind === 'hit') { tcx.globalAlpha = 0.4 * k; tcx.beginPath(); tcx.arc(x, y, R * (1 + dt * 1.6), 0, 6.2832); tcx.stroke(); }
    tcx.restore();
  });
}

/* ── Escalas de 1 a 5 (agitação da mente) e ajustes ──────────────────── */
function tqLimparEscala(qual) { document.querySelectorAll('[data-scale="' + qual + '"] button').forEach(b => b.setAttribute('aria-pressed', 'false')); }
function tqConstruirEscala(el) {
  for (let i = 1; i <= 5; i++) { const b = document.createElement('button'); b.type = 'button'; b.textContent = i; b.dataset.v = i; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', i + (i === 1 ? ', calma' : i === 5 ? ', agitada' : '')); el.appendChild(b); }
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const v = +b.dataset.v, was = b.getAttribute('aria-pressed') === 'true';
    el.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (!was) b.setAttribute('aria-pressed', 'true');
    const val = was ? null : v;
    if (el.dataset.scale === 'before') tqAntes = val;
    else if (TQ_REC) {
      TQ_REC.mente.depois = val; saveSess();
      $('ts-delta').textContent = (TQ_REC.mente.antes && TQ_REC.mente.depois) ? 'Antes você marcou ' + TQ_REC.mente.antes + ' e agora marcou ' + TQ_REC.mente.depois + ' (1 é calma, 5 é agitada).' : '';
    }
  });
}
function tqRenderAjustes() {
  document.querySelectorAll('#scr-home .seg').forEach(el => {
    const key = el.dataset.key;
    if (!el.children.length) {
      TQ_OPCOES[key].forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.textContent = o[1]; b.dataset.v = String(o[0]); el.appendChild(b); });
    }
    el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(CFG[key]))));
  });
  document.querySelectorAll('.tq-dur').forEach(el => { el.textContent = CFG.tdur + ' min'; });
}
function tqAplicarTipo() {
  $('scr-home').dataset.tipo = CFG.tipo;
  $('tipo-' + CFG.tipo).checked = true;
  $('tipo-dica').textContent = CFG.tipo === 'toques'
    ? 'Um exercício ativo de atenção: toque na fonte quando um som se repetir. Mostra o seu progresso, sem pontos nem derrota. Pensado para quem tem TDAH ou prefere algo mais ativo.'
    : 'A escuta guiada da ATT: você só ouve e leva a atenção ao som indicado, sem acertos nem erros.';
  $('hero-k').textContent = CFG.tipo === 'toques' ? 'Treino de atenção por escuta' : 'Técnica de Treino da Atenção (ATT)';
  $('hero-t').textContent = CFG.tipo === 'toques'
    ? 'Uma paisagem de sons ao seu redor. Você escolhe o que acompanhar e volta sempre que a mente se dispersa. Não há pontos nem derrota.'
    : 'Um exercício guiado para praticar entre as sessões. Você escuta cinco sons ao seu redor e treina levar a atenção de um para outro, em vez de deixá-la presa em preocupações.';
}
function tqResumoLinha(r) {
  const p = (r.chamadas > 0) ? Math.round(r.acertos / r.chamadas * 100) + '% das chamadas percebidas' : 'sem chamadas';
  const m = (r.mente && r.mente.antes && r.mente.depois) ? ' · mente ' + r.mente.antes + ' → ' + r.mente.depois : '';
  return r.acertos + ' ' + tqPl(r.acertos, 'momento', 'momentos') + ' de foco · ' + p + m;
}

/* ═══════════════ INIT ═══════════════ */
(function tqInit() {
  Object.keys(TQ_OPCOES).forEach(k => { if (!TQ_OPCOES[k].some(o => o[0] === CFG[k])) CFG[k] = { cenario: 'floresta', tdur: 3, sons: 4, ritmo: 'medio', visual: 'media', guia: true }[k]; });
  if (CFG.tipo !== 'toques') CFG.tipo = 'classico';
  tcv = $('tq-cv'); tcx = tcv.getContext('2d');
  if (window.ResizeObserver) new ResizeObserver(tqResize).observe($('tq-stage'));
  window.addEventListener('resize', tqResize);

  document.querySelectorAll('input[name=tipo]').forEach(r => r.addEventListener('change', () => { CFG.tipo = r.value; saveCfg(); tqAplicarTipo(); }));
  document.querySelectorAll('#scr-home .seg').forEach(el => el.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const key = el.dataset.key; const o = TQ_OPCOES[key].find(x => String(x[0]) === b.dataset.v); if (!o) return;
    CFG[key] = o[0]; saveCfg(); tqRenderAjustes();
  }));
  document.querySelectorAll('[data-scale]').forEach(tqConstruirEscala);
  document.querySelectorAll('[data-fase]').forEach(b => b.addEventListener('click', () => tqStart(+b.dataset.fase)));
  $('tq-pause').addEventListener('click', () => tqPause(!(TG && TG.paused)));
  $('tq-resume').addEventListener('click', () => tqPause(false));
  $('tq-end').addEventListener('click', tqEnd);
  $('ts-prog').addEventListener('click', () => goTo('progress'));
  $('ts-home').addEventListener('click', () => goTo('home'));
  $('ts-del').addEventListener('click', () => { if (TQ_REC) { SESS = SESS.filter(s => s.id !== TQ_REC.id); saveSess(); TQ_REC = null; toast('Bloco não guardado.'); } goTo('home'); });

  tcv.addEventListener('pointerdown', e => {
    if (!TG || TG.ended || TG.paused || TG.closing) return;
    const r = tcv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
    let best = -1, bd = 1e9;
    TG.sources.forEach((s, i) => { if (!s.joined) return; const d = Math.hypot(x - s.nx * TV.w, y - s.ny * TV.h); if (d < bd) { bd = d; best = i; } });
    if (best >= 0 && bd <= tqOrbR() * 2.2) tqTap(best);
  });
  document.addEventListener('keydown', e => {
    if (_cur !== 'tap' || !TG) return;
    if (e.key === 'Escape') { tqPause(!TG.paused); return; }
    if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) tqTap(+e.key - 1);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && TG && !TG.ended && _cur === 'tap') tqPause(true); });

  tqRenderAjustes(); tqAplicarTipo();
})();
