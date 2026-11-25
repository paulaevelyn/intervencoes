/* ════════════════════════════════════════════════════════
   Floresça: Cultivando Emoções Positivas · app.js v1
   Gameful Learning · pt-BR · Psicologia Positiva · TFC · TCC · COM-B
   © 2026 Psicoterapia e Afins: psicoterapiaeafins.com.br
   ════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   CONFIGURAÇÃO DE PESQUISA
   Para ativar a sincronização automática com Google Sheets:
   1. Crie uma planilha nova → Extensões → Apps Script
   2. Cole o conteúdo de research-sync.gs (nesta pasta)
   3. Implante como App da Web (Executar como: você; Acesso: Qualquer pessoa)
   4. Substitua null abaixo pelo URL de implantação
      Exemplo: 'https://script.google.com/macros/s/XXXXX/exec'
   ══════════════════════════════════ */
const RESEARCH_ENDPOINT = "https://script.google.com/macros/s/AKfycbyfdve1eTq55rzys-FeYpNqVamTXkG2nAfWFYpeme1GS1PNaQQvz5M4peODCY721pVe/exec";

/* ══════════════════════════════════
   BRAND ASSETS
   ══════════════════════════════════ */
const BRAND_FOOTER_HTML = `
<div style="margin:8px 0 0;background:#EDF7F3;border-radius:14px;padding:16px 18px;border:1px solid rgba(27,139,111,.12)">
  <div style="margin-bottom:12px">
    <img src="../logos/floresca.svg" alt="Floresça" width="150" style="display:block">
  </div>
  <div style="font-size:12px;color:#5A6B65;line-height:1.65;border-top:1px solid rgba(94,125,115,.15);padding-top:10px">
    <strong>Recurso psicoeducativo</strong>, não substitui acompanhamento psicológico profissional.<br>
    <a href="https://www.psicoterapiaeafins.com.br" target="_blank" style="color:#3D5A52;font-weight:700;text-decoration:none">psicoterapiaeafins.com.br</a>
    &nbsp;·&nbsp;
    <a href="https://www.instagram.com/psicoterapiaeafins" target="_blank" style="color:#A34A45;font-weight:700;text-decoration:none">@psicoterapiaeafins</a>
  </div>
</div>
<div style="font-size:12px;color:#6B6F78;text-align:center;padding:8px 0 4px;line-height:1.6">
  © 2026 Psicoterapia e Afins · Todos os direitos reservados<br>
  Proibida a reprodução sem autorização prévia
</div>`;

/* ══════════════════════════════════
   ÍCONES: traço fino (1.5px), cantos arredondados, estilo Lucide
   Direção do design system: leves, lineares, sem preenchimento.
   ══════════════════════════════════ */
const ICONS = {
 "sprout": "<path d=\"M7 20h10\"/><path d=\"M10 20c5.5-2.5.8-6.4 3-10\"/><path d=\"M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z\"/><path d=\"M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z\"/>",
 "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"/>",
 "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m21 21-4.3-4.3\"/>",
 "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>",
 "flask": "<path d=\"M9 3h6\"/><path d=\"M10 3v6.6L4.9 18a2 2 0 0 0 1.8 3h10.6a2 2 0 0 0 1.8-3L14 9.6V3\"/><path d=\"M7.5 14h9\"/>",
 "book": "<path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/>",
 "leaf": "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/>",
 "flower": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5\"/><path d=\"M12 7.5V9M7.5 12H9M16.5 12H15M12 16.5V15\"/>",
 "star": "<path d=\"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/>",
 "gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13\"/><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\"/>",
 "message": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>",
 "coffee": "<path d=\"M17 8h1a4 4 0 1 1 0 8h-1\"/><path d=\"M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z\"/><path d=\"M6 2v2M10 2v2M14 2v2\"/>",
 "eye": "<path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
 "music": "<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>",
 "cloud": "<path d=\"M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z\"/>",
 "award": "<circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.48 12.89 17 22l-5-3-5 3 1.52-9.11\"/>",
 "sunrise": "<path d=\"M12 2v8\"/><path d=\"m4.93 10.93 1.41 1.41\"/><path d=\"M2 18h2M20 18h2\"/><path d=\"m19.07 10.93-1.41 1.41\"/><path d=\"M22 22H2\"/><path d=\"m8 6 4-4 4 4\"/><path d=\"M16 18a4 4 0 0 0-8 0\"/>",
 "shield": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/>",
 "tree": "<path d=\"M12 22v-7\"/><path d=\"M12 15a6 6 0 1 0-6-6c0 3.3 2.7 6 6 6z\"/><path d=\"M12 15a6 6 0 1 0 6-6\"/>",
 "palette": "<circle cx=\"13.5\" cy=\"6.5\" r=\".6\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".6\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".6\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".6\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.8-1.7 1.7-1.7H16c3.1 0 5.5-2.4 5.5-5.5C21.5 6 17.5 2 12 2z\"/>",
 "lock": "<rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
 "trash": "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>",
 "phone": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z\"/>",
 "alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4M12 17h.01\"/>",
 "building": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1\"/><path d=\"M12 8v6M9 11h6\"/>",
 "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>",
 "mobile": "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M12 18h.01\"/>",
 "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/>",
 "compass": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z\"/>",
 "calendar": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/>",
 "check": "<path d=\"M20 6 9 17l-5-5\"/>",
 "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75\"/>",
 "zap": "<path d=\"M13 2 3 14h9l-1 8 10-12h-9l1-8z\"/>",
 "smile": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01\"/>",
 "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>",
 "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
 "mountain": "<path d=\"m8 3 4 8 5-5 5 15H2L8 3z\"/>",
 "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4M12 8h.01\"/>",
 "chevron": "<path d=\"m9 18 6-6-6-6\"/>",
 "lifebuoy": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24\"/>"
};
function ico(name,size){
  size = size || 24;
  const body = ICONS[name]; if(!body) return '';
  return '<svg class="ico" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+body+'</svg>';
}
function iconize(root){
  (root||document).querySelectorAll('[data-ico]:empty').forEach(el=>{ el.innerHTML = ico(el.getAttribute('data-ico'), parseInt(el.getAttribute('data-ico-size')||'0')||undefined); });
}

/* ══════════════════════════════════
   PERSISTENCE
   ══════════════════════════════════ */
const SK = 'floresca_v1';
let D = {
  xp: 0,
  badges: [],
  obDone: false,
  obLevel: 0,
  userProfile: null,    // { onboardingPath: 0|1|2 }, definido ao responder obs5
  moduleProgress: {},   // { m1: { steps: [true,false,...], done: false } }
  entries: [],          // registro de momentos positivos
  experiments: [],      // execuções de experimentos { id, expId, ts, date, predicted, predictNote, status, actual, noticed, tsDone }
  doseRecords: [],      // dose cultivada semanal { ts, date, weekStart, tags[], text }
  doseSkipWeek: null,   // semana (segunda-feira) em que dispensou o prompt
  moduleFeedback: [],   // vocabulário do usuário { ts, date, moduleId, word }
  assessment: null,     // SPANE { p, n, b, date, answers }
  nickname: '',
  demographics: null,
  reminders: { enabled:false, hour:20 },
  installSeen: false,   // já viu a instrução de instalar na tela de início
  notifSeen: false,     // já viu a instrução de ativar lembretes
  consentGiven: false,
  consentDate: null,
  firstPracticeSeen: false, // já viu a primeira prática de 1 minuto
  weekSummarySeen: null, // semana (segunda) em que fechou o resumo semanal
  researchInviteSeen: false, // já viu (e respondeu) o convite opcional de pesquisa
  anchor: null,         // âncora de rotina escolhida: { id, label, hour }
  weeklyGoal: 2,        // meta semanal gentil: nº de momentos por semana
  participantId: null,
  lastSync: null,
  pretest:  null,       // { spane:{p,n,b,answers}, beliefs:{score,answers}, date }
  posttest: null,
  posttestRemindAfter: null,
  analytics: {
    sessions: [],
    moduleEvents: [],
    diaryEvents: [],
    labEvents: [],
  },
};
function generateUUID(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=Math.random()*16|0;
    return(c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}
function load(){
  try{
    const r=localStorage.getItem(SK);
    if(r){
      D=JSON.parse(r);
      if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[], labEvents:[] };
      if(!D.analytics.sessions)     D.analytics.sessions=[];
      if(!D.analytics.moduleEvents) D.analytics.moduleEvents=[];
      if(!D.analytics.diaryEvents)  D.analytics.diaryEvents=[];
      if(!D.analytics.labEvents)    D.analytics.labEvents=[];
      if(!D.experiments) D.experiments=[];
      if(!D.doseRecords) D.doseRecords=[];
      if(D.doseSkipWeek === undefined) D.doseSkipWeek = null;
      if(!D.moduleFeedback) D.moduleFeedback=[];
      if(!D.participantId) D.participantId = generateUUID();
      if(D.consentDate  === undefined) D.consentDate  = null;
      if(D.firstPracticeSeen === undefined) D.firstPracticeSeen = false;
      if(D.researchInviteSeen === undefined) D.researchInviteSeen = !!D.consentGiven;
      if(D.anchor === undefined) D.anchor = null;
      if(D.weekSummarySeen === undefined) D.weekSummarySeen = null;
      if(!D.weeklyGoal) D.weeklyGoal = 2;
      if(D.lastSync     === undefined) D.lastSync     = null;
      if(D.nickname     === undefined) D.nickname     = '';
      if(D.demographics === undefined) D.demographics = null;
      if(!D.reminders) D.reminders = { enabled:false, hour:20 };
      if(D.installSeen === undefined) D.installSeen = false;
      if(D.notifSeen === undefined) D.notifSeen = false;
      if(D.userProfile === undefined) D.userProfile = null;
    } else {
      D.participantId = generateUUID();
    }
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(SK,JSON.stringify(D)); }
  catch(e){
    console.warn('[Floresça] save falhou:', e.message);
    if(typeof toast==='function') toast('Não foi possível guardar. Exporte os seus dados em Dados → Exportar.');
  }
}

/* Cartão de apoio — mostrado quando SPANE-Negativo muito alto */
function supportCardHTML(){
  return `
  <div class="crisis-card">
    <div class="crisis-title">Você não precisa atravessar isso sozinho/a</div>
    <div class="crisis-body">
      Nas últimas semanas, as emoções difíceis parecem ter pesado bastante. Isso é um retrato do momento, não de quem você é.
      Este app pode ajudar a cultivar o que é bom, mas <strong>não substitui ajuda profissional</strong> —
      e procurá-la é um ato de coragem, não de fraqueza.
    </div>
    <div class="crisis-resources">
      <a href="tel:188" class="crisis-res"><span>${ico('phone',22)}</span><div><strong>CVV: 188</strong><small>Ligação gratuita, 24h, todos os dias</small></div></a>
      <a href="https://www.cvv.org.br" target="_blank" class="crisis-res"><span>${ico('message',22)}</span><div><strong>Chat do CVV</strong><small>cvv.org.br: conversa por escrito</small></div></a>
      <div class="crisis-res"><span>${ico('building',22)}</span><div><strong>CAPS ou UBS</strong><small>Atendimento gratuito pelo SUS na sua cidade</small></div></div>
      <div class="crisis-res"><span>${ico('alert',22)}</span><div><strong>SAMU: 192</strong><small>Em emergência, ligue imediatamente</small></div></div>
      <a href="tel:988" class="crisis-res"><span>${ico('globe',22)}</span><div><strong>EUA e Canadá: 988</strong><small>Linha de crise e prevenção do suicídio, ligação ou SMS, 24h. Emergência: 911</small></div></a>
      <a href="tel:024" class="crisis-res"><span>${ico('globe',22)}</span><div><strong>Espanha: 024</strong><small>Linha de atenção ao comportamento suicida, 24h. Emergência: 112</small></div></a>
      <div class="crisis-res"><span>${ico('globe',22)}</span><div><strong>Em outro país</strong><small>Ligue para o número de emergência local (112 na Europa)</small></div></div>
    </div>
  </div>`;
}

/* ══════════════════════════════════
   DATE HELPERS
   ══════════════════════════════════ */
const p2 = n => String(n).padStart(2,'0');
const today = () => { const d=new Date(); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); };
const prevDay = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()); };
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS  = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const DIAS_C= ['D','S','T','Q','Q','S','S'];

/* Segunda-feira da semana de uma data (semana = seg-dom) */
function weekStart(dateStr){
  const d = dateStr ? new Date(dateStr+'T12:00') : new Date();
  const dow = (d.getDay()+6)%7; // 0 = segunda
  d.setDate(d.getDate()-dow);
  return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
}

/* Dose Cultivada — tags rápidas, uma por canteiro praticável */
const DOSE_TAGS = ['Notei','Saboreei','Agradeci','Me acalmei',
  'Testei uma crença','Compartilhei algo bom','Reconheci meu esforço','Planejei algo bom'];

/* ══════════════════════════════════
   XP / LEVEL SYSTEM: crescimento da planta
   ══════════════════════════════════ */
const LEVELS = [
  { n:1, name:'Semente',        emoji:'', min:0,   max:100  },
  { n:2, name:'Broto',          emoji:'', min:100, max:250  },
  { n:3, name:'Ramo Verde',     emoji:'', min:250, max:430  },
  { n:4, name:'Em Flor',        emoji:'', min:430, max:595  },
  { n:5, name:'Jardim Vivo',    emoji:'', min:595, max:9999 },
];
function getLevel(xp){ return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0]; }
function getLevelPct(xp){
  const lv = getLevel(xp);
  if(lv.n === 5) return 100;
  return Math.min(100, Math.round((xp - lv.min)/(lv.max - lv.min)*100));
}
function awardXP(amount, msg){
  // Os pontos continuam sendo guardados (continuidade dos dados), mas não aparecem
  // mais para a pessoa: o retorno é de significado, não de número.
  D.xp += amount; save();
  const m = String(msg||'');
  toast(m.charAt(0).toUpperCase()+m.slice(1)+'. Cada passo conta.');
}

/* ══════════════════════════════════
   BADGES
   ══════════════════════════════════ */
const ALL_BADGES = [
  { id:'b_m1',   emoji:'', name:'Solo Preparado',      desc:'Completou o Módulo 1' },
  { id:'b_m2',   emoji:'', name:'Colorista',           desc:'Completou o Módulo 2' },
  { id:'b_m3',   emoji:'', name:'Olhar de Jardineiro', desc:'Completou o Módulo 3' },
  { id:'b_m4',   emoji:'', name:'Saboreador/a',        desc:'Completou o Módulo 4' },
  { id:'b_m5',   emoji:'', name:'Grato/a',             desc:'Completou o Módulo 5' },
  { id:'b_m6',   emoji:'', name:'Contentamento',       desc:'Completou o Módulo 6' },
  { id:'b_m7',   emoji:'', name:'Destemido/a',         desc:'Completou o Módulo 7' },
  { id:'b_m8',   emoji:'', name:'Jardim Completo',     desc:'Completou todos os módulos' },
  { id:'b_str7', emoji:'', name:'Sete dias de cuidado', desc:'7 dias de cultivo' },
  { id:'b_d10',  emoji:'', name:'Caçador/a de Momentos', desc:'10+ momentos registrados' },
  { id:'b_xp',   emoji:'', name:'Dedicado/a',          desc:'Cuidou do jardim com constância' },
  { id:'b_exp1', emoji:'', name:'Cientista de Si',     desc:'Concluiu o 1º experimento' },
  { id:'b_exp5', emoji:'', name:'Pesquisador/a',       desc:'Concluiu 5 experimentos' },
];
function awardBadge(id){
  if(D.badges.includes(id)) return;
  D.badges.push(id); save();
}
function checkBadges(){
  if(D.xp >= 300) awardBadge('b_xp');
  if(D.entries.length >= 10) awardBadge('b_d10');
  const expDone = D.experiments.filter(e=>e.status==='done').length;
  if(expDone >= 1) awardBadge('b_exp1');
  if(expDone >= 5) awardBadge('b_exp5');
  // dias de cultivo (acumulado: pausas não zeram o progresso)
  if(calcTotalDays() >= 7) awardBadge('b_str7');
}
function calcTotalDays(){
  return new Set(D.entries.map(e=>e.date)).size;
}

/* ══════════════════════════════════
   JARDIM VISUAL: substitui XP e níveis
   Cada emoção positiva vira uma planta. Ela avança quando a pessoa
   registra, em dias diferentes, um momento com aquela emoção
   (no máximo um avanço por dia). Nada encolhe nem murcha.
   ══════════════════════════════════ */
const PLANT_SPEC = {
  alegria:    { t:'daisy',  c1:'#D96C63', c2:'#7A9A8E' },
  gratidao:   { t:'tulip',  c1:'#E9A39C', c2:'#7A9A8E' },
  serenidade: { t:'bell',   c1:'#9DBBB0', c2:'#5E7D73' },
  interesse:  { t:'berry',  c1:'#E08780', c2:'#7A9A8E' },
  esperanca:  { t:'leafy',  c1:'#E9A39C', c2:'#5E7D73' },
  orgulho:    { t:'tulip',  c1:'#D96C63', c2:'#5E7D73' },
  diversao:   { t:'daisy',  c1:'#EFBDB3', c2:'#7A9A8E' },
  inspiracao: { t:'bell',   c1:'#E9A39C', c2:'#7A9A8E' },
  admiracao:  { t:'berry',  c1:'#9DBBB0', c2:'#5E7D73' },
  amor:       { t:'daisy',  c1:'#E08780', c2:'#5E7D73' },
};
function plantSVG(t,c1,c2,w){
  const h = Math.round(w*1.25);
  const st = `stroke="${c2}" stroke-width="3" stroke-linecap="round" fill="none"`;
  let body = '';
  if(t==='sprout') body = `<path d="M40 98 V70" ${st}/><path d="M40 74 Q22 70 20 54 Q36 56 40 74Z" fill="${c2}"/><path d="M40 70 Q58 66 60 50 Q44 52 40 70Z" fill="${c2}"/>`;
  else if(t==='daisy') body = `<path d="M40 98 V44" ${st}/><path d="M40 80 Q24 78 20 64 Q36 64 40 80Z" fill="${c2}"/><ellipse cx="40" cy="34" rx="6" ry="15" fill="${c1}"/><ellipse cx="40" cy="34" rx="6" ry="15" fill="${c1}" transform="rotate(60 40 34)"/><ellipse cx="40" cy="34" rx="6" ry="15" fill="${c1}" transform="rotate(120 40 34)"/><circle cx="40" cy="34" r="6" fill="#F7F3EF"/>`;
  else if(t==='tulip') body = `<path d="M40 98 V50" ${st}/><path d="M40 84 Q22 82 18 64 Q36 66 40 84Z" fill="${c2}"/><path d="M26 22 Q26 48 40 48 Q54 48 54 22 L47 30 L40 18 L33 30 Z" fill="${c1}"/>`;
  else if(t==='berry') body = `<path d="M40 98 Q40 60 48 40" ${st}/><path d="M42 82 Q26 80 22 66 Q38 66 42 82Z" fill="${c2}"/><circle cx="48" cy="32" r="9" fill="${c1}"/><circle cx="34" cy="44" r="8" fill="${c1}"/><circle cx="56" cy="48" r="7" fill="${c1}"/>`;
  else if(t==='bell') body = `<path d="M40 98 Q40 50 30 34" ${st}/><path d="M40 84 Q56 82 60 66 Q44 68 40 84Z" fill="${c2}"/><path d="M14 38 Q16 18 30 18 Q44 18 46 38 Q30 44 14 38Z" fill="${c1}"/><circle cx="30" cy="46" r="3" fill="${c1}"/>`;
  else body = `<path d="M40 98 V30" ${st}/><path d="M40 82 Q22 80 18 64 Q36 64 40 82Z" fill="${c2}"/><path d="M40 82 Q58 80 62 64 Q44 64 40 82Z" fill="${c2}"/><path d="M40 58 Q24 56 20 40 Q36 40 40 58Z" fill="${c2}"/><path d="M40 58 Q56 56 60 40 Q44 40 40 58Z" fill="${c2}"/><path d="M40 38 Q32 28 40 14 Q48 28 40 38Z" fill="${c1}"/>`;
  return `<svg viewBox="0 0 80 100" width="${w}" height="${h}" aria-hidden="true" focusable="false">${body}</svg>`;
}
function isElaborated(e){ return !!(e && e.why && e.why.trim().length >= 12); }
/* Pontos de cuidado por emoção: cada dia com a emoção nomeada vale 1;
   se nesse dia a pessoa também escreveu POR QUE foi bom, vale 2 (teto: 2 por dia).
   Assim, escrever o porquê, que é o ingrediente ativo das "Três Coisas Boas",
   cresce mais do que repetir registros vazios. */
function emotionDays(){
  const m = {};
  D.entries.forEach(e=>(e.emotions||[]).forEach(id=>{
    const day = (m[id]||(m[id]={}));
    day[e.date] = Math.max(day[e.date]||0, isElaborated(e) ? 2 : 1);
  }));
  const out = {};
  Object.keys(m).forEach(id=>{ out[id] = { size: Object.values(m[id]).reduce((a,b)=>a+b,0) }; });
  return out;
}
function plantStage(n){ return n>=6 ? 3 : n>=3 ? 2 : n>=1 ? 1 : 0; }
function gardenItems(){
  const days = emotionDays();
  return EMOTIONS.map(e=>{ const n = days[e.id] ? days[e.id].size : 0; return { e, n, st:plantStage(n) }; })
    .filter(x=>x.st>0).sort((a,b)=>b.st-a.st);
}
function gardenDescription(list){
  if(!list.length) return 'Seu jardim espera a primeira semente. Registre um momento e nomeie a emoção para ela brotar.';
  const bloom = list.filter(x=>x.st===3).map(x=>x.e.name.toLowerCase());
  const grow  = list.filter(x=>x.st<3).map(x=>x.e.name.toLowerCase());
  const parts = [];
  if(bloom.length) parts.push(bloom.join(', ')+(bloom.length>1?' em flor':' em flor'));
  if(grow.length)  parts.push(grow.join(', ')+' brotando');
  return 'Seu jardim tem '+list.length+(list.length>1?' emoções: ':' emoção: ')+parts.join('; ')+'.';
}
function gardenHTML(){
  const list = gardenItems();
  const base = { 1:52, 2:64, 3:80 };
  const scale = Math.min(1, 320 / Math.max(1, list.reduce((a,x)=>a+base[x.st],0)));
  const w = { 1:Math.round(base[1]*scale), 2:Math.round(base[2]*scale), 3:Math.round(base[3]*scale) };
  const plants = list.map(x=>{
    const sp = PLANT_SPEC[x.e.id];
    const svg = x.st===1 ? plantSVG('sprout',sp.c1,sp.c2,w[1]) : x.st===2 ? plantSVG('leafy',sp.c2,sp.c2,w[2]) : plantSVG(sp.t,sp.c1,sp.c2,w[3]);
    return `<div class="g-plant">${svg}</div>`;
  }).join('');
  const desc = gardenDescription(list);
  return `<div class="garden" role="img" aria-label="${esc(desc)}"><div class="g-ground"></div><div class="g-row">${plants || '<div class="g-seed"></div>'}</div></div>
    <p class="g-desc">${esc(desc)}</p>`;
}
function weekCount(){
  const ws = weekStart();
  return D.entries.filter(e=>e.date>=ws).length;
}
function setWeeklyGoal(n){ D.weeklyGoal = n; save(); closeModal(); if(document.getElementById('scr-home').classList.contains('on')) renderHome(); toast('Meta da semana: '+n+(n>1?' momentos':' momento')+'.'); }
function showGoalModal(){
  document.getElementById('modal-title').textContent = 'Meta da semana';
  document.getElementById('modal-body').innerHTML = '<p style="text-align:left">Quantos momentos bons você quer registrar por semana? Escolha um número que caiba na sua vida. Ele nunca vira cobrança: é só uma direção.</p>';
  document.getElementById('modal-actions').innerHTML = '<div class="chips" style="justify-content:center;margin-bottom:6px">'+[1,2,3,4,5].map(n=>`<button class="chip ${n===D.weeklyGoal?'sel':''}" onclick="setWeeklyGoal(${n})">${n}</button>`).join('')+'</div><button class="btn ghost" onclick="closeModal()">Fechar</button>';
  document.getElementById('modal-ov').classList.add('on');
}
function showSupport(){
  trackAppEvent('support_opened');
  document.getElementById('modal-title').textContent = 'Apoio agora';
  document.getElementById('modal-body').innerHTML = supportCardHTML();
  document.getElementById('modal-actions').innerHTML = '<button class="btn mint" onclick="closeModal()">Fechar</button>';
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   AS 10 EMOÇÕES POSITIVAS (Fredrickson, 2009)
   ══════════════════════════════════ */
const EMOTIONS = [
  { id:'alegria',    emoji:'', ico:'sun', name:'Alegria',     desc:'Quando algo bom e inesperado acontece' },
  { id:'gratidao',   emoji:'', ico:'gift', name:'Gratidão',    desc:'Quando você recebe algo valioso de alguém' },
  { id:'serenidade', emoji:'', ico:'moon', name:'Serenidade',  desc:'Quando tudo está bem e você pode relaxar' },
  { id:'interesse',  emoji:'', ico:'search', name:'Interesse',   desc:'Quando algo novo desperta sua curiosidade' },
  { id:'esperanca',  emoji:'', ico:'sunrise', name:'Esperança',   desc:'Quando você acredita que algo pode melhorar' },
  { id:'orgulho',    emoji:'', ico:'award', name:'Orgulho',     desc:'Quando você conquista algo com o seu esforço' },
  { id:'diversao',   emoji:'', ico:'smile', name:'Diversão',    desc:'Quando algo é engraçado e compartilhado' },
  { id:'inspiracao', emoji:'', ico:'zap', name:'Inspiração',  desc:'Quando você testemunha a excelência humana' },
  { id:'admiracao',  emoji:'', ico:'star', name:'Admiração',   desc:'Quando algo grandioso te faz sentir pequeno/a (awe)' },
  { id:'amor',       emoji:'', ico:'heart', name:'Amor',        desc:'Micro-momentos de conexão genuína com alguém' },
];
const SAVORING_CHIPS = ['Parei para notar','Respirei e prolonguei','Compartilhei com alguém','Agradeci','Anotei/fotografei','Revivi mais tarde','Ainda não saboreei'];

/* ══════════════════════════════════
   SVG DIAGRAMS
   ══════════════════════════════════ */
function svgBroaden(){
  return `<div class="diagram-wrap">
  <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">A Espiral Ascendente (Broaden-and-Build)</p>
  <svg viewBox="0 0 300 260" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <defs>
      <marker id="arrowJ" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#A0ADB8"/>
      </marker>
    </defs>
    <!-- Node: Emoção positiva (top) -->
    <ellipse cx="150" cy="34" rx="72" ry="22" fill="#FBF0DF" stroke="#C47D2A" stroke-width="2"/>
    <text x="150" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="#7A4A10" font-family="Poppins,sans-serif">Emoção positiva</text>
    <text x="150" y="43" text-anchor="middle" font-size="10" fill="#7A4A10" font-family="Poppins,sans-serif">mesmo breve e sutil</text>
    <path d="M212,45 Q255,80 255,120" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Mente amplia (right) -->
    <ellipse cx="248" cy="140" rx="48" ry="24" fill="#EEE9FB" stroke="#8B7FB8" stroke-width="2"/>
    <text x="248" y="134" text-anchor="middle" font-size="10" font-weight="700" fill="#3D2E7A" font-family="Poppins,sans-serif">A mente amplia</text>
    <text x="248" y="147" text-anchor="middle" font-size="9" fill="#3D2E7A" font-family="Poppins,sans-serif">atenção · criatividade</text>
    <path d="M240,166 Q230,210 180,225" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Recursos crescem (bottom) -->
    <ellipse cx="150" cy="230" rx="72" ry="22" fill="#F0F6F3" stroke="#5E7D73" stroke-width="2"/>
    <text x="150" y="226" text-anchor="middle" font-size="11" font-weight="700" fill="#3D5A52" font-family="Poppins,sans-serif">Recursos crescem</text>
    <text x="150" y="239" text-anchor="middle" font-size="10" fill="#3D5A52" font-family="Poppins,sans-serif">laços · ideias · saúde</text>
    <path d="M120,225 Q60,210 52,166" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Resiliência (left) -->
    <ellipse cx="52" cy="140" rx="46" ry="24" fill="#FAF0EF" stroke="#D96C63" stroke-width="2"/>
    <text x="52" y="134" text-anchor="middle" font-size="10" font-weight="700" fill="#A34A45" font-family="Poppins,sans-serif">Resiliência</text>
    <text x="52" y="147" text-anchor="middle" font-size="9" fill="#A34A45" font-family="Poppins,sans-serif">amortece as quedas</text>
    <path d="M60,118 Q90,70 90,45" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Cada volta da espiral deixa você com <strong>mais recursos</strong> do que tinha antes: mesmo depois que a emoção passa.</p>
</div>`;
}

function svgNegativityBias(){
  return `<div class="diagram-wrap">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:var(--coral-xl);border-radius:12px;padding:14px;border:1.5px solid var(--coral-l)">
      <div style="font-size:22px;margin-bottom:6px"></div>
      <div style="font-size:13px;font-weight:600;color:var(--coral-d);margin-bottom:4px">O negativo</div>
      <div style="font-size:12px;color:var(--coral-d);line-height:1.5">Gruda como <strong>velcro</strong><br>Chama atenção sozinho<br>Fica na memória<br>Grita</div>
    </div>
    <div style="background:var(--mint-xl);border-radius:12px;padding:14px;border:1.5px solid var(--mint-l)">
      <div style="font-size:22px;margin-bottom:6px"></div>
      <div style="font-size:13px;font-weight:600;color:var(--mint-d);margin-bottom:4px">O positivo</div>
      <div style="font-size:12px;color:var(--mint-d);line-height:1.5">Escorrega como <strong>teflon</strong><br>Precisa ser notado<br>Evapora rápido<br>Sussurra</div>
    </div>
  </div>
  <div style="background:var(--white);border-radius:10px;padding:10px 12px;margin-top:10px;font-size:12px;color:var(--muted);line-height:1.6;border-left:3px solid var(--mint)">
    Isso é o <strong style="color:var(--mint-d)">viés de negatividade</strong>, uma herança evolutiva. Quem notava o perigo sobrevivia. Notar o bom não era urgente. Por isso, cultivar o positivo exige <strong>intenção</strong>.
  </div>
</div>`;
}

function svgThreeSystems(){
  return `<div class="diagram-wrap">
  <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">Os Três Sistemas de Regulação (Gilbert)</p>
  <svg viewBox="0 0 300 240" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <circle cx="105" cy="145" r="72" fill="rgba(217,108,99,.18)" stroke="#D96C63" stroke-width="2"/>
    <text x="88" y="130" font-size="18" text-anchor="middle" font-family="sans-serif"></text>
    <text x="88" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#A34A45" font-family="Poppins,sans-serif">Ameaça</text>
    <text x="88" y="161" text-anchor="middle" font-size="9" fill="#A34A45" font-family="Poppins,sans-serif">medo · ansiedade</text>
    <text x="88" y="173" text-anchor="middle" font-size="9" fill="#A34A45" font-family="Poppins,sans-serif">raiva · evitamento</text>
    <circle cx="195" cy="145" r="72" fill="rgba(196,125,42,.15)" stroke="#C47D2A" stroke-width="2"/>
    <text x="212" y="130" font-size="18" text-anchor="middle" font-family="sans-serif"></text>
    <text x="212" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#7A4A10" font-family="Poppins,sans-serif">Conquista</text>
    <text x="212" y="161" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Poppins,sans-serif">ambição · excitação</text>
    <text x="212" y="173" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Poppins,sans-serif">busca · realização</text>
    <circle cx="150" cy="88" r="72" fill="rgba(94,125,115,.15)" stroke="#5E7D73" stroke-width="2.5"/>
    <text x="150" y="68" font-size="20" text-anchor="middle" font-family="sans-serif"></text>
    <text x="150" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#3D5A52" font-family="Poppins,sans-serif">Calmante</text>
    <text x="150" y="101" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Poppins,sans-serif">contentamento · segurança</text>
    <text x="150" y="113" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Poppins,sans-serif">pertencimento · calor</text>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Vivemos alternando entre <strong style="color:#A34A45">Ameaça</strong> e <strong style="color:#7A4A10">Conquista</strong>. O sistema <strong style="color:#3D5A52">Calmante</strong>, fonte do contentamento: costuma ser o mais esquecido.</p>
</div>`;
}

function emoGridHTML(){
  return `<div class="emo-grid">${EMOTIONS.map(e=>`
    <div class="emo-cell"><span class="emo-emoji">${ico(e.ico,20)}</span>
      <div><div class="emo-name">${e.name}</div><div class="emo-desc">${e.desc}</div></div>
    </div>`).join('')}</div>`;
}

/* ══════════════════════════════════
   MODULE DATA, 8 canteiros
   ══════════════════════════════════ */
const MODULES = [
  /* ─────────────────────────────────────────
     M1: Por que cultivar emoções positivas
     ───────────────────────────────────────── */
  {
    id:'m1', color:'mint', emoji:'', ico:'sunrise',
    levelTag:'Preparar o Solo',
    title:'Por que Cultivar Emoções Positivas',
    tagline:'A ciência do que faz bem',
    porque:'Emoções positivas ampliam atenção e recursos, e não são um luxo. Aqui você aprende como elas funcionam, sem obrigação de se sentir bem.',
    xp:50, badgeId:'b_m1', unlockAfter:null,
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Seu cérebro tem um viés, e não é culpa sua',
        content:`<p class="step-text">Se você sente que as coisas ruins do dia ocupam mais espaço na cabeça do que as boas, você está certo/a, e isso tem nome.</p>
${svgNegativityBias()}
<p class="step-text" style="margin-top:10px">A boa notícia vem da pesquisadora <strong>Barbara Fredrickson</strong>: emoções positivas não servem só para "sentir-se bem". A teoria <em>Broaden-and-Build</em> (ampliar e construir), com décadas de evidência, mostra que elas têm uma função evolutiva poderosa:</p>
${svgBroaden()}
<div class="tip mint"><strong>Ideia central:</strong> Emoções difíceis estreitam o foco para sobreviver ao agora. Emoções positivas <strong>ampliam a mente e constroem recursos duráveis</strong>, criatividade, vínculos, saúde, resiliência. Cultivá-las é um investimento, não um luxo.</div>`
      },
      {
        type:'quiz', typeLabel:'Atividade',
        title:'O que a ciência realmente diz?',
        question:'Segundo a teoria Broaden-and-Build, qual é a função das emoções positivas?',
        opts:[
          { text:'Substituir e eliminar as emoções negativas', correct:false },
          { text:'Ampliar a mente e construir recursos duráveis (vínculos, ideias, resiliência)', correct:true },
          { text:'Mostrar aos outros que estamos bem', correct:false },
          { text:'Nenhuma: são apenas um efeito colateral agradável', correct:false },
        ],
        feedbackOk:'Isso mesmo. Emoções positivas ampliam a atenção e o pensamento no momento, e, repetidas ao longo do tempo, constroem recursos que ficam com você mesmo depois que a emoção passa.',
        feedbackNo:'Quase. Emoções positivas não existem para eliminar as negativas (todas têm função). Elas <strong>ampliam a mente e constroem recursos duráveis</strong>, essa é a descoberta central de Fredrickson.'
      },
      {
        type:'flipcard', typeLabel:'Cartas interativas',
        title:'Mito ou fato? Vire as cartas',
        hint:'Toque em cada carta para revelar o que a ciência diz.',
        cards:[
          { front:'"Cultivar emoções positivas é fingir que está tudo bem"', back:'Mito: isso seria positividade tóxica. Cultivar o positivo é ADICIONAR, não negar. As emoções difíceis continuam válidas.', color:'coral' },
          { front:'"Felicidade é questão de sorte ou genética"', back:'Em parte: mas uma fatia importante do bem-estar responde a atividades intencionais (Lyubomirsky). É treinável.', color:'mint' },
          { front:'"Preciso resolver todos os problemas antes de me permitir sentir bem"', back:'Mito: é o contrário. Emoções positivas RECUPERAM o corpo do estresse (efeito undo) e ajudam a resolver melhor.', color:'coral' },
          { front:'"Emoções positivas duram pouco"', back:'Fato: e é por isso que notar e saborear importam tanto. O efeito delas é cumulativo, como regar uma planta.', color:'mint' },
          { front:'"Pessoas resilientes sentem menos emoções negativas"', back:'Mito: elas sentem as negativas TAMBÉM, mas mantêm acesso às positivas durante a adversidade. É isso que amortece.', color:'coral' },
          { front:'"Sentir alegria em tempos difíceis é falta de respeito"', back:'Mito: no luto e na crise, momentos de leveza são combustível para aguentar. Não é traição, é sustento.', color:'mint' },
        ]
      },
      {
        type:'fill', typeLabel:'Reflexão pessoal',
        title:'O que te trouxe até aqui?',
        prompt:'Pense na sua vida hoje. Quanto espaço as emoções positivas têm? O que mudaria no seu dia a dia se você as sentisse com mais frequência e intensidade?',
        placeholder:'Hoje, as emoções positivas na minha vida... Se eu cultivasse mais, eu...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M2: O repertório, 10 emoções positivas
     ───────────────────────────────────────── */
  {
    id:'m2', color:'lav', emoji:'', ico:'palette',
    levelTag:'Preparar o Solo',
    title:'O Repertório: 10 Emoções Positivas',
    tagline:'Nomear com precisão amplia o sentir',
    porque:'Quanto mais nomes você tem para o que sente de bom, mais fácil é perceber e voltar a elas. Escolha as que fazem sentido para você.',
    xp:60, badgeId:'b_m2', unlockAfter:'m1',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Granularidade: o vocabulário do sentir',
        content:`<p class="step-text">A neurocientista <strong>Lisa Feldman Barrett</strong> descobriu algo curioso: pessoas que nomeiam suas emoções com <em>precisão</em> ("estou sentindo serenidade", em vez de só "estou bem") regulam melhor o que sentem, e sentem com mais riqueza.</p>
<p class="step-text" style="margin-top:10px">Isso se chama <strong>granularidade emocional</strong>. E funciona como paladar: quem só conhece "doce e salgado" sente menos sabores do que quem reconhece nuances. Conheça as <strong>10 emoções positivas mais estudadas</strong> (Fredrickson):</p>
${emoGridHTML()}
<div class="tip lav">Repare: só 2 ou 3 delas são "animadas". A maioria é <strong>sutil e silenciosa</strong>, serenidade, gratidão, admiração. Se você só procura euforia, deixa 80% do repertório passar.</div>`
      },
      {
        type:'flipcard', typeLabel:'Cartas interativas',
        title:'Que emoção é essa?',
        hint:'Leia a cena e tente nomear a emoção antes de virar a carta.',
        cards:[
          { front:'Você olha o mar à noite e se sente pequeno/a, de um jeito bom.', back:'Admiração (awe): a emoção diante do que é vasto. Expande a noção de tempo e reduz a ruminação.', color:'mint' },
          { front:'Alguém segurou o elevador para você e sorriu.', back:'Amor: micro-momento de conexão. Para o cérebro, conexão breve e genuína já conta.', color:'coral' },
          { front:'Domingo de manhã, café pronto, nada urgente para fazer.', back:'Serenidade: a emoção do "está tudo bem agora". Baixa ativação, alto valor.', color:'mint' },
          { front:'Você assiste a um vídeo de alguém superando algo enorme.', back:'Inspiração: testemunhar excelência humana desperta vontade de crescer.', color:'coral' },
          { front:'Você terminou algo difícil que vinha adiando.', back:'Orgulho: reconhecer o próprio esforço. Não é arrogância: é combustível de motivação.', color:'mint' },
          { front:'Você já imagina a viagem do próximo mês.', back:'Esperança + antecipação: saborear o futuro também é emoção positiva no presente.', color:'coral' },
        ]
      },
      {
        type:'classify', typeLabel:'Atividade de classificação',
        title:'Expansiva ou tranquila?',
        instruction:'Emoções positivas vêm em dois "volumes": as expansivas (alta energia) e as tranquilas (baixa energia). Classifique:',
        btnA:'Expansiva', btnB:'Tranquila',
        items:[
          { text:'Diversão: rir alto com amigos', cat:'u', label:'Expansiva: alta energia' },
          { text:'Serenidade: paz de um fim de tarde', cat:'n', label:'Tranquila: baixa energia' },
          { text:'Alegria: receber uma ótima notícia', cat:'u', label:'Expansiva: alta energia' },
          { text:'Gratidão: reconhecer o que se recebeu', cat:'n', label:'Tranquila: baixa energia' },
          { text:'Inspiração: vontade de criar agora', cat:'u', label:'Expansiva: alta energia' },
          { text:'Contentamento, "não falta nada agora"', cat:'n', label:'Tranquila: baixa energia' },
        ]
      },
      {
        type:'fill', typeLabel:'Reflexão pessoal',
        title:'O inventário do seu jardim',
        prompt:'Olhe a lista das 10 emoções. Quais você sente com alguma frequência? Quais estão raras ou ausentes? Escolha UMA emoção "em falta" que você gostaria de cultivar nas próximas semanas.',
        placeholder:'Sinto com frequência: ...\n\nEstão em falta: ...\n\nQuero cultivar: ... porque...',
        minChars:40
      }
    ]
  },

  /* ─────────────────────────────────────────
     M3: Notar: o radar do positivo
     ───────────────────────────────────────── */
  {
    id:'m3', color:'amber', emoji:'', ico:'search',
    levelTag:'Notar e Saborear',
    title:'Notar: o Radar do Positivo',
    tagline:'Treinar a atenção para o que já vai bem',
    porque:'O cérebro prioriza o que ameaça. Treinar o radar para o que é bom corrige um pouco esse viés, sem negar o que é difícil.',
    xp:65, badgeId:'b_m3', unlockAfter:'m2',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'O que você procura, você encontra',
        content:`<p class="step-text">A atenção funciona como um holofote: ilumina uma coisa e deixa o resto no escuro. O viés de negatividade aponta esse holofote para problemas, <strong>automaticamente</strong>.</p>
<p class="step-text" style="margin-top:10px">Mas holofotes podem ser redirecionados. Uma das práticas mais estudadas para isso chama-se <strong>Três Coisas Boas</strong> (Seligman): anotar, no fim do dia, 3 coisas que foram bem, e <em>por que</em> foram bem.</p>
<div class="tip amber"><strong>A evidência:</strong> No estudo original, uma semana desta prática aumentou felicidade e reduziu sintomas depressivos por até <strong>6 meses</strong>. Não porque o dia melhora, mas porque o radar aprende a captar o que antes passava batido.</div>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>Vale notar:</strong> o café que estava bom · o ônibus que passou na hora · a mensagem de alguém · 10 minutos de silêncio · você ter feito algo apesar do cansaço</div>
  <div class="tip coral" style="margin:0"><strong>Armadilha comum:</strong> esperar coisas GRANDES. Quem só registra promoções e viagens registra 3 vezes por ano. O treino é com o pequeno e cotidiano.</div>
</div>
<p class="step-text">É exatamente para isso que existe o botão <strong>Registrar</strong> aqui do app: seu caderno de jardineiro/a.</p>`
      },
      {
        type:'guided', typeLabel:'Prática guiada',
        title:'Caça ao positivo: agora mesmo',
        phases:[
          { num:'Passo 1', title:'Ao seu redor', text:'Olhe ao redor, agora, e encontre <strong>uma coisa agradável aos sentidos</strong> que você não tinha notado.<br><br>Uma cor, a luz entrando, uma textura, um som distante, o cheiro do ambiente.<br><br>Fique 15 segundos só com ela. Não precisa ser especial, precisa ser <em>notada</em>.', btn:'Encontrei' },
          { num:'Passo 2', title:'Nas últimas 24 horas', text:'Agora escaneie o seu ontem e hoje: <strong>o que foi bem?</strong> Mesmo pequeno.<br><br>Encontrou? Agora reviva por 20 segundos: onde você estava, o que sentiu no corpo, quem estava junto.<br><br>Reviver com detalhes é o que grava a memória, o cérebro re-sente o que você re-visita.', btn:'Revivi' },
          { num:'Passo 3', title:'Em você', text:'A parte mais difícil do radar: apontar para dentro.<br><br>Note <strong>uma coisa em você</strong>, um esforço que você fez, uma qualidade que apareceu, algo que você aguentou.<br><br>Diga mentalmente, como um fato: <em>"Hoje eu [fiz/fui/aguentei]..."</em><br><br>Tire uma "foto mental" desse reconhecimento.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'quiz', typeLabel:'Atividade',
        title:'Por que escrever funciona melhor?',
        question:'A prática das Três Coisas Boas pede para ESCREVER, não só pensar. Por quê?',
        opts:[
          { text:'Porque pensar não tem nenhum efeito', correct:false },
          { text:'Escrever exige atenção sustentada e elaboração, o que consolida a memória e treina o radar', correct:true },
          { text:'Para ter provas de que o dia foi bom', correct:false },
          { text:'Porque escrever dá mais trabalho e esforço sempre é melhor', correct:false },
        ],
        feedbackOk:'Isso mesmo. Escrever obriga a mente a segurar o momento por mais tempo e a elaborá-lo ("por que isso foi bom?"). É essa demora + elaboração que muda o padrão de atenção.',
        feedbackNo:'Pensar ajuda, mas escrever exige <strong>atenção sustentada e elaboração</strong>, a mente segura o momento por mais tempo, e é isso que consolida a memória e re-treina o radar.'
      },
      {
        type:'fill', typeLabel:'Design de hábito',
        title:'Quando o seu radar vai ligar?',
        prompt:'Hábitos precisam de âncora (COM-B: criar oportunidade). Complete o plano:\n\n"Depois de [algo que já faço todo dia, ex.: escovar os dentes à noite, deitar na cama, almoçar], vou abrir o Floresça e registrar 1 momento bom do dia."\n\nOnde o celular vai estar nesse momento? O que pode atrapalhar, e como resolver?',
        placeholder:'Depois de..., vou registrar 1 momento bom.\nO celular estará...\nSe eu esquecer, vou...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M4: Saborear
     ───────────────────────────────────────── */
  {
    id:'m4', color:'coral', emoji:'', ico:'coffee',
    levelTag:'Notar e Saborear',
    title:'Saborear: Presente, Passado e Futuro',
    tagline:'Amplificar e prolongar o que é bom',
    porque:'Saborear amplia a duração do que é bom. Experimente as versões e fique com a que combina com você.',
    xp:70, badgeId:'b_m4', unlockAfter:'m3',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Savoring: a arte de ficar no momento bom',
        content:`<p class="step-text">Notar é o primeiro passo. <strong>Saborear</strong> (savoring, Bryant & Veroff) é o segundo: a capacidade de <em>amplificar e prolongar</em> a experiência positiva, em vez de deixá-la escorregar.</p>
<p class="step-text" style="margin-top:10px">E aqui está o segredo que quase ninguém usa: dá para saborear em <strong>três tempos</strong>:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip coral" style="margin:0"><strong>Presente</strong>: absorção total: desacelerar, usar os sentidos, expressar a emoção (sorrir, dizer em voz alta "que bom isso").</div>
  <div class="tip amber" style="margin:0"><strong>Passado</strong>: reminiscência: revisitar memórias boas com detalhes. Fotos, cheiros e músicas são portais.</div>
  <div class="tip lav" style="margin:0"><strong>Futuro</strong>: antecipação: planejar algo bom e saboreá-lo ANTES de acontecer. Metade do prazer da viagem acontece antes da viagem.</div>
</div>
<div class="tip mint">E o inimigo do sabor tem nome: <strong>amortecimento</strong> (dampening). São os pensamentos que apagam o momento bom: <em>"não mereço", "vai acabar logo", "foi só sorte"</em>, e o hábito de estar no celular enquanto a vida boa acontece. Vamos treinar para reconhecê-los.</div>`
      },
      {
        type:'guided', typeLabel:'Prática guiada',
        title:'Saborear em 2 minutos: agora',
        phases:[
          { num:'Fase 1', title:'Escolha algo para saborear', text:'Escolha UMA coisa agradável disponível agora: um gole de café ou água, uma música, a vista da janela, uma memória boa recente.<br><br>Decida: pelos próximos 2 minutos, <strong>só isso existe</strong>.', btn:'Escolhi' },
          { num:'Fase 2', title:'Absorção pelos sentidos', text:'Explore devagar, como se fosse a primeira vez:<br><br><em>O que você vê? Que detalhes? E os sons? Temperatura? Textura? Sabor?</em><br><br>Quando a mente fugir (ela vai), traga de volta sem bronca. Isso É o exercício.', btn:'Próxima fase' },
          { num:'Fase 3', title:'Nomeie e expresse', text:'Que emoção apareceu? Serenidade? Interesse? Gratidão? <strong>Nomeie</strong>, de preferência em voz baixa.<br><br>Agora <strong>expresse</strong>: deixe um meio-sorriso acontecer, solte os ombros, respire fundo uma vez.<br><br>Expressar a emoção no corpo amplifica o sinal no cérebro.', btn:'Próxima fase' },
          { num:'Fase 4', title:'Guarde a semente', text:'Antes de encerrar, tire uma "foto mental" deliberada: <em>"quero lembrar disto".</em><br><br>Se quiser potencializar: registre este momento no app (botão Registrar) ou conte a alguém hoje.<br><br>Compartilhar um momento bom <strong>dobra o efeito dele</strong>, é a prática de capitalização.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'classify', typeLabel:'Atividade de classificação',
        title:'Amplifica ou apaga?',
        instruction:'Diante de um momento bom, cada reação amplifica o sabor ou apaga. Classifique:',
        btnA:'Amplifica', btnB:'Apaga',
        items:[
          { text:'Contar a novidade boa para alguém querido', cat:'u', label:'Amplifica: capitalização, com respaldo em pesquisa' },
          { text:'"Foi só sorte, não conta"', cat:'n', label:'Apaga: desqualifica a experiência' },
          { text:'Fechar os olhos para ouvir a música favorita', cat:'u', label:'Amplifica: absorção sensorial' },
          { text:'Checar e-mails durante o jantar especial', cat:'n', label:'Apaga: atenção dividida mata o sabor' },
          { text:'"Amanhã tem reunião difícil" no meio do passeio', cat:'n', label:'Apaga: viagem mental para o problema' },
          { text:'Dizer em voz alta: "que momento bom esse"', cat:'u', label:'Amplifica: expressar marca a emoção' },
        ]
      },
      {
        type:'fill', typeLabel:'Saborear o futuro',
        title:'Plante uma antecipação',
        prompt:'Escolha algo bom e realista para os próximos 7 dias (um café especial, um episódio da série, um encontro, uma caminhada). Escreva: o que será, quando, e 2-3 detalhes que você já consegue imaginar e saborear ANTES de acontecer.',
        placeholder:'Nos próximos 7 dias eu vou...\nQuando: ...\nJá consigo imaginar: ...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M5: Gratidão
     ───────────────────────────────────────── */
  {
    id:'m5', color:'mint', emoji:'', ico:'gift',
    levelTag:'Aprofundar',
    title:'Gratidão que Transforma',
    tagline:'Bem estudada, com efeitos modestos',
    porque:'A gratidão funciona melhor quando é específica e genuína. Se hoje não surgir, tudo bem: você pode voltar quando quiser.',
    xp:70, badgeId:'b_m5', unlockAfter:'m4',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Por que gratidão funciona (quando bem feita)',
        content:`<p class="step-text">Gratidão é uma das emoções positivas <strong>mais estudadas</strong>. No estudo clássico de <strong>Emmons & McCullough</strong> (2003), quem registrava motivos de gratidão semanalmente relatou mais bem-estar e otimismo, menos queixas físicas e mais exercício do que os grupos de comparação.</p>
<p class="step-text" style="margin-top:10px">Vale saber o <strong>tamanho</strong> disso: nas revisões de muitos estudos, os efeitos são <strong>pequenos a moderados</strong> e nem sempre se repetem. Para depressão e ansiedade, o efeito é pequeno (Cregg & Cheavens, 2021). A gratidão pode somar ao seu cuidado, mas não substitui acompanhamento profissional.</p>
<p class="step-text" style="margin-top:10px">O mecanismo tem duas engrenagens:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>Atenção</strong><br>Gratidão obriga o radar a varrer o que foi <em>recebido</em>, que o viés de negatividade esconde.</div>
  <div class="tip coral" style="margin:0"><strong>Vínculo</strong><br>Reconhecer quem nos fez bem fortalece os laços, um dos preditores mais consistentes de bem-estar.</div>
</div>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip amber" style="margin:0"><strong>O que gratidão NÃO é:</strong><br>• Dívida ("agora tenho que retribuir"), isso é peso, não gratidão.<br>• Obrigação de estar grato/a por tudo, sempre.<br>• Anular queixas legítimas ("seja grato/a e não reclame").</div>
</div>
<div class="tip lav"><strong>Segredo da eficácia:</strong> especificidade e variedade. "Sou grata pela minha família" (genérico, repetido) perde efeito rápido. "Sou grata porque minha irmã me ligou ontem só para saber de mim", isso o cérebro sente.</div>`
      },
      {
        type:'quiz', typeLabel:'Atividade',
        title:'Qual prática tem mais efeito?',
        question:'Duas pessoas praticam gratidão diariamente. Qual delas tende a manter os benefícios ao longo do tempo?',
        opts:[
          { text:'Ana: escreve todo dia "sou grata pela saúde, família e trabalho"', correct:false },
          { text:'Bia: escreve a cada dia algo específico e diferente, "o motorista esperou eu correr até o ponto"', correct:true },
          { text:'As duas igualmente: o que importa é repetir', correct:false },
          { text:'Nenhuma: gratidão só funciona em datas especiais', correct:false },
        ],
        feedbackOk:'Isso mesmo. O cérebro se adapta ao repetido (adaptação hedônica). Especificidade + variedade mantêm a prática "viva", cada registro exige que o radar realmente procure.',
        feedbackNo:'A prática da Bia é mais eficaz: o cérebro se <strong>adapta ao repetido</strong> e a lista genérica vira ritual vazio. Especificidade e variedade obrigam o radar a procurar de verdade.'
      },
      {
        type:'guided', typeLabel:'Prática guiada',
        title:'A carta de gratidão',
        phases:[
          { num:'Passo 1', title:'Escolha a pessoa', text:'Pense em alguém que fez algo importante por você e que <strong>nunca foi devidamente agradecido/a</strong>.<br><br>Pode ser algo grande ou um gesto pequeno que ficou. Um professor, um amigo, um familiar, alguém que apareceu na hora certa.<br><br>Deixe um nome surgir. O primeiro que veio geralmente é o certo.', btn:'Escolhi' },
          { num:'Passo 2', title:'Reviva o que ela fez', text:'Antes de escrever, reconstrua mentalmente:<br><br><em>O que exatamente essa pessoa fez? O que estava acontecendo na sua vida? O que teria sido diferente sem ela? O que isso diz sobre ela?</em><br><br>Sinta o que aparece no corpo enquanto lembra. Isso já é a gratidão trabalhando.', btn:'Próximo passo' },
          { num:'Passo 3', title:'Decida o destino', text:'Na próxima etapa você vai escrever a carta. Ela pode ter três destinos, <strong>todos válidos</strong>:<br><br><strong>Entregar/ler para a pessoa</strong>, efeito mais forte nos estudos (a "visita de gratidão" de Seligman).<br>✉<strong>Enviar por mensagem</strong>, mais viável, ainda poderoso.<br><strong>Só escrever e guardar</strong>, o benefício de escrever já é real.<br><br>Escolha sem pressão.', btn:'Vamos escrever ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'Carta de gratidão',
        title:'Escreva a carta',
        prompt:'Escreva a carta para a pessoa escolhida. Inclua:\n— O que ela fez, com detalhes concretos\n— O efeito que isso teve na sua vida (na época e hoje)\n— O que isso revela sobre ela\n\nEscreva como se ela fosse ler.',
        placeholder:'Querido/a ...,\n\nTalvez você nem lembre, mas...\n\nIsso mudou para mim porque...\n\nO que isso diz sobre você é...',
        minChars:100
      }
    ]
  },

  /* ─────────────────────────────────────────
     M6: Contentamento e segurança (TFC)
     ───────────────────────────────────────── */
  {
    id:'m6', color:'lav', emoji:'', ico:'shield',
    levelTag:'Aprofundar',
    title:'Contentamento e Segurança (TFC)',
    tagline:'O bem-estar que não depende de conquista',
    porque:'Há um bem-estar que não depende de conquistar nada, ligado ao sistema calmante. Ele pode ser cultivado devagar.',
    xp:80, badgeId:'b_m6', unlockAfter:'m5',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Dois tipos de "sentir-se bem"',
        content:`<p class="step-text">Paul Gilbert, criador da Terapia Focada na Compaixão (TFC), mostrou que temos <strong>três sistemas emocionais</strong>, e que existem dois tipos muito diferentes de emoção positiva:</p>
${svgThreeSystems()}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip amber" style="margin:0"><strong>Positivas de Conquista</strong><br>Excitação, euforia, "consegui!". Dependem de alcançar algo. Aceleram.</div>
  <div class="tip mint" style="margin:0"><strong>Positivas de Calmaria</strong><br>Contentamento, segurança, calor humano. Não dependem de conquistar nada. Desaceleram.</div>
</div>
<p class="step-text">A nossa cultura hipertreina o sistema de Conquista: sentir-se bem só quando produz, alcança, ganha. O resultado é uma vida em que o descanso vira culpa e o bem-estar está sempre <em>no próximo objetivo</em>.</p>
<div class="tip lav"><strong>Ideia central:</strong> o sistema Calmante é ativado por ritmo lento, calor humano, memória de afeto e segurança. Ele é <strong>treinável</strong>, e é a base da resiliência: quem consegue se acalmar, consegue se recuperar.</div>`
      },
      {
        type:'breath', typeLabel:'Respiração do ritmo calmante',
        title:'Ativando o sistema calmante',
        instruction:'Esta respiração, usada na TFC, é mais lenta e focada na <em>sensação</em> de desaceleração. Imagine que o corpo encontra o próprio ritmo, como ondas calmas.<br><br>Ritmo: inspire suavemente pelo nariz (5s), expire lentamente (7s). A expiração longa é o freio fisiológico do corpo.<br><br>Toque para começar. Faça 4 ciclos com atenção gentil.',
        pattern:[ {label:'Inspira suave',dur:5,cls:'expand soothe'},{label:'Expira lenta',dur:7,cls:'contract soothe'} ],
        totalCycles:4
      },
      {
        type:'guided', typeLabel:'Prática guiada (TFC)',
        title:'Memória de gentileza',
        phases:[
          { num:'Preparação', title:'Postura e ritmo', text:'Sente-se confortavelmente. Suavize o olhar ou feche os olhos.<br><br>Respire duas vezes no ritmo calmante que você acabou de praticar.<br><br>Você vai acessar uma memória, e o seu sistema nervoso vai respondê-la como se fosse agora. Isso é fisiologia, não imaginação.', btn:'Estou pronto/a' },
          { num:'A memória', title:'Alguém foi gentil com você', text:'Lembre de um momento em que alguém foi <strong>genuinamente gentil</strong> com você. Um cuidado, uma palavra na hora certa, uma presença.<br><br>Reconstrua a cena: onde era? Que expressão a pessoa tinha? Que tom de voz?<br><br>Deixe a sensação de <em>ser cuidado/a</em> aparecer. Não force: permita.', btn:'Estou lá' },
          { num:'No corpo', title:'Onde você sente?', text:'Onde essa memória toca o corpo?<br><br>Um calor no peito? Os ombros que descem? A respiração que solta?<br><br>Fique 30 segundos com essa sensação. Isso é o seu sistema calmante <strong>ligado</strong>, contentamento e segurança têm endereço físico.', btn:'Próxima fase' },
          { num:'Alegria compassiva', title:'Sentir junto', text:'Última camada: lembre de uma alegria de <strong>alguém que você ama</strong>, uma conquista, uma boa notícia dela.<br><br>Perceba: dá para sentir prazer com a alegria do outro. Essa emoção (os budistas chamam <em>mudita</em>) é uma fonte infinita: porque não depende só da SUA vida ir bem.<br><br>Crie um gesto de âncora: mão no peito + uma respiração lenta. Ele te traz de volta aqui quando precisar.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'Mapa do contentamento',
        title:'O que ativa o seu sistema calmante?',
        prompt:'Liste o que genuinamente desacelera e aconchega você: pessoas, lugares, rituais, sons, atividades (ex.: cozinhar ouvindo música, andar sem pressa, um banho longo, aquela amiga).\n\nDepois escolha UM item e marque quando ele vai acontecer nesta semana.',
        placeholder:'Ativa meu sistema calmante: ...\n\nEsta semana vou... no dia... às...',
        minChars:40
      }
    ]
  },

  /* ─────────────────────────────────────────
     M7: Crenças que bloqueiam + experimentos
     ───────────────────────────────────────── */
  {
    id:'m7', color:'coral', emoji:'', ico:'flask',
    levelTag:'Florescer',
    title:'Crenças que Bloqueiam a Alegria',
    tagline:'Testar na prática os medos do bem-estar',
    porque:'Crenças como "não mereço sentir prazer" bloqueiam a alegria. Você vai testá-las como hipóteses, sem precisar aceitá-las ou rejeitá-las de cara.',
    xp:90, badgeId:'b_m7', unlockAfter:'m6',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Medo de sentir-se bem existe, e tem lógica',
        content:`<p class="step-text">Parece contraditório, mas é comum e bem documentado: muitas pessoas têm <strong>medo das emoções positivas</strong> (Gilbert). O bem-estar dispara um alarme:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip coral" style="margin:0">"Se eu ficar muito feliz, <strong>algo ruim vai acontecer</strong>" (não posso baixar a guarda)</div>
  <div class="tip coral" style="margin:0">"Eu <strong>não mereço</strong> me sentir bem" (enquanto outros sofrem / com tudo que fiz)</div>
  <div class="tip coral" style="margin:0">"Sentir orgulho é <strong>se achar</strong>" (vão me julgar, vou atrair inveja)</div>
  <div class="tip coral" style="margin:0">"Descansar e aproveitar é <strong>perda de tempo</strong>" (só produção justifica existir)</div>
</div>
<p class="step-text">Essas crenças geralmente foram <strong>aprendidas como proteção</strong>: em algum momento, relaxar saiu caro, comemorar atraiu crítica, ou a alegria foi interrompida por algo doloroso. A crença virou um guarda na porta do jardim.</p>
<div class="tip mint">O problema: a crença faz você <strong>evitar ou amortecer</strong> o bem-estar, e assim ela nunca é testada. O guarda nunca descobre que a guerra acabou. A saída não é discutir com a crença: é <strong>testá-la em experimentos pequenos e seguros</strong>.</div>`
      },
      {
        type:'flipcard', typeLabel:'Cartas interativas',
        title:'A crença e o outro lado',
        hint:'Vire cada carta para ver o que os dados e a lógica dizem.',
        cards:[
          { front:'"Se eu comemorar antes da hora, estrago tudo"', back:'Testável: comemorar não altera probabilidades, mas motiva a continuar. Times que celebram pequenas vitórias persistem mais.', color:'coral' },
          { front:'"Não mereço estar bem enquanto há problemas"', back:'Inverta: você cuida melhor dos problemas descansado/a ou esgotado/a? Bem-estar é combustível, não prêmio.', color:'mint' },
          { front:'"Se eu relaxar, vou baixar a guarda e ser pego/a"', back:'O corpo em alerta constante erra MAIS, não menos. Vigilância crônica degrada exatamente o desempenho que ela tenta proteger.', color:'coral' },
          { front:'"Sentir orgulho é arrogância"', back:'Arrogância é se colocar acima dos outros. Orgulho é reconhecer o próprio esforço. São emoções diferentes, e confundi-las custa caro.', color:'mint' },
          { front:'"Alegria demais atrai inveja/olho gordo"', back:'Talvez algumas pessoas se incomodem. Experimente: compartilhe com quem é seguro. O problema era a alegria ou a plateia?', color:'coral' },
          { front:'"Sou pessimista, não vou mudar"', back:'Ninguém precisa "virar otimista". O treino é de atenção e comportamento, e esses mudam com prática, seja qual for o temperamento.', color:'mint' },
        ]
      },
      {
        type:'info', typeLabel:'Método',
        title:'Como funciona um experimento comportamental',
        content:`<p class="step-text">O experimento comportamental é a ferramenta mais poderosa da TCC, porque a mente acredita mais no que <strong>vive</strong> do que no que ouve. O ciclo tem 4 passos:</p>
<div class="ob-num-steps" style="margin:14px 0">
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--coral-xl);color:var(--coral-d)">1</div>
    <div class="ob-num-step-body"><strong>Previsão</strong><span>"Se eu fizer X, acho que vai acontecer Y / vou sentir tanto assim." Anote ANTES: sem isso não há experimento.</span></div>
  </div>
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--amber-l);color:#7A4A10">2</div>
    <div class="ob-num-step-body"><strong>Teste</strong><span>Faça a ação: pequena, segura, definida. Não precisa "dar certo": precisa acontecer.</span></div>
  </div>
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--mint-xl);color:var(--mint-d)">3</div>
    <div class="ob-num-step-body"><strong>Observação</strong><span>O que realmente aconteceu? O que você realmente sentiu? Dados, não opinião.</span></div>
  </div>
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--lav-l);color:#3D2E7A">4</div>
    <div class="ob-num-step-body"><strong>Revisão</strong><span>Compare com a previsão. A crença sobreviveu aos dados? O que isso muda?</span></div>
  </div>
</div>
<div class="tip lav">O <strong>Laboratório</strong> deste app (aba "Testar") faz exatamente esse ciclo: você escolhe um experimento, registra sua previsão, testa na vida real e compara. Spoiler dos estudos: a mente <strong>subestima sistematicamente</strong> o quanto essas experiências fazem bem.</div>`
      },
      {
        type:'fill', typeLabel:'Meu experimento',
        title:'Desenhe o teste da SUA crença',
        prompt:'Complete com honestidade:\n\n1) "Quando algo bom acontece, eu costumo..." (amortecer? desconfiar? minimizar?)\n\n2) A crença por trás disso: "Se eu me permitir sentir alegria/descanso/orgulho, então..."\n\n3) Um experimento pequeno e seguro para testar essa crença esta semana: o que você vai fazer, quando, e o que PREVÊ que vai acontecer?',
        placeholder:'1) Quando algo bom acontece, eu...\n\n2) Minha crença: se eu me permitir..., então...\n\n3) Experimento: vou... no dia... Prevejo que...',
        minChars:60
      }
    ]
  },

  /* ─────────────────────────────────────────
     M8: Um jardim que dura
     ───────────────────────────────────────── */
  {
    id:'m8', color:'amber', emoji:'', ico:'tree',
    levelTag:'Florescer',
    title:'Um Jardim que Dura',
    tagline:'Transformar práticas em recursos para a vida',
    porque:'Hábitos pequenos, ligados a um lugar e a um momento, duram mais. Você monta o seu plano, no seu ritmo.',
    xp:100, badgeId:'b_m8', unlockAfter:'m7',
    steps:[
      {
        type:'info', typeLabel:'Psicoeducação',
        title:'Bem-estar tem arquitetura',
        content:`<p class="step-text">Seligman resumiu os pilares do bem-estar duradouro no modelo <strong>PERMA</strong>:</p>
<div class="emo-grid" style="grid-template-columns:1fr">
  <div class="emo-cell"><span class="emo-emoji">${ico('smile',20)}</span><div><div class="emo-name">P: Emoções Positivas</div><div class="emo-desc">Tudo que você treinou até aqui: notar, saborear, gratidão</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">${ico('target',20)}</span><div><div class="emo-name">E: Engajamento</div><div class="emo-desc">Atividades que te absorvem por inteiro (flow)</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">${ico('users',20)}</span><div><div class="emo-name">R: Relacionamentos</div><div class="emo-desc">Um dos preditores mais consistentes de bem-estar nos estudos</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">${ico('compass',20)}</span><div><div class="emo-name">M: Significado (Meaning)</div><div class="emo-desc">Fazer parte de algo maior que você</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">${ico('award',20)}</span><div><div class="emo-name">A: Realização (Accomplishment)</div><div class="emo-desc">Progredir em algo que importa, e reconhecer o progresso</div></div></div>
</div>
<p class="step-text" style="margin-top:10px">E dois avisos da ciência para o longo prazo:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:12px 0">
  <div class="tip coral" style="margin:0"><strong>Adaptação hedônica:</strong> o cérebro se acostuma com o repetido. Antídoto: <strong>variedade</strong>, alterne práticas, mude horários, surpreenda-se (Lyubomirsky).</div>
  <div class="tip mint" style="margin:0"><strong>Capitalização (Gable):</strong> compartilhar boas notícias com quem responde com interesse genuíno multiplica o efeito delas, e fortalece a relação. Escolha bem a plateia.</div>
</div>`
      },
      {
        type:'quiz', typeLabel:'Atividade',
        title:'A arte de responder a boas notícias',
        question:'Sua amiga conta, animada: "Fui aprovada no processo seletivo!". Qual resposta FORTALECE a relação e a emoção dela?',
        opts:[
          { text:'"Que ótimo." (e muda de assunto)', correct:false },
          { text:'"Cuidado, essas empresas exploram muito, viu?"', correct:false },
          { text:'"Que demais! Me conta tudo: como você soube? Como comemorou?"', correct:true },
          { text:'"Legal! Isso me lembra quando EU fui aprovada..."', correct:false },
        ],
        feedbackOk:'Isso mesmo. Essa é a resposta ativa-construtiva: interesse genuíno + perguntas que fazem a pessoa reviver e saborear. É a única das quatro que amplifica a alegria E o vínculo.',
        feedbackNo:'A resposta que fortalece é a <strong>ativa-construtiva</strong>: "Que demais! Me conta tudo...": interesse genuíno com perguntas. As outras esvaziam a notícia, roubam a cena ou apontam perigo.'
      },
      {
        type:'guided', typeLabel:'Design do sistema',
        title:'Desenhe o seu sistema de cultivo',
        phases:[
          { num:'Passo 1', title:'Suas práticas favoritas', text:'Olhe para trás no percurso: registro de momentos, saborear em 2 minutos, gratidão específica, respiração calmante, memória de gentileza, experimentos, antecipação...<br><br>Escolha <strong>2 ou 3</strong> que funcionaram DE VERDADE para você. Não as "que deveriam", as que funcionaram.<br><br>Menos práticas mantidas valem mais que muitas abandonadas.', btn:'Escolhi' },
          { num:'Passo 2', title:'Âncoras se-então', text:'Agora transforme cada uma em plano <strong>"quando-então"</strong> (Gollwitzer: dobra a chance de acontecer):<br><br><em>"Quando eu deitar na cama, então registro 1 momento bom."<br>"Quando o café ficar pronto, então saboreio os 3 primeiros goles."<br>"Quando alguém me contar uma boa notícia, então pergunto mais."</em><br><br>Formule as suas mentalmente agora.', btn:'Formulei' },
          { num:'Passo 3', title:'Prepare o terreno', text:'Último passo (COM-B: capacidade você já tem, motivação também, falta desenhar a <strong>oportunidade</strong>):<br><br>• Deixe o app na primeira tela do celular<br>• Ative o lembrete diário (em Dados)<br>• Conte a alguém o que está praticando, testemunhas criam constância<br>• Decida já o que fazer quando falhar um dia: <em>recomeçar sem drama no dia seguinte</em>. Jardins sobrevivem a dias sem rega.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'Carta ao futuro',
        title:'Uma carta para você em 3 meses',
        prompt:'Escreva uma carta curta para o seu eu de daqui a 3 meses. Inclua:\n— Que práticas você espera que ele/a esteja mantendo\n— Que emoções você deseja que estejam mais presentes na vida dele/a\n— Um lembrete gentil para os dias em que o jardim parecer seco\n\nEscreva com o carinho de quem cuida de algo que está crescendo.',
        placeholder:'Oi, eu do futuro...\n\nEspero que você esteja...\n\nSe o jardim parecer seco, lembre que...',
        minChars:80
      }
    ]
  },
]; // end MODULES

/* ══════════════════════════════════
   TAILORING: ordem dos módulos por perfil (obs5)
   m1 e m2 sempre primeiros (fundamentos para todos)
   ══════════════════════════════════ */
const MODULE_PATHS = {
  0: ['m1','m2','m4','m3','m5','m6','m7','m8'], // sente mas passa rápido → Saborear primeiro
  1: ['m1','m2','m3','m4','m5','m6','m7','m8'], // no automático → Notar primeiro (padrão)
  2: ['m1','m2','m6','m3','m4','m7','m5','m8'], // medo do prazer → Calmante antes; Gratidão só após testar crenças
};
const PATH_EXPLANATIONS = {
  0: 'Como as coisas boas passam rápido para você, aprender a saboreá-las vem logo no início do caminho.',
  2: 'Seu caminho começa pelo sistema calmante e por testar crenças com carinho, preparando o terreno para práticas como a gratidão fazerem sentido.',
};
function modulePath(){
  const p = D.userProfile && D.userProfile.onboardingPath;
  return MODULE_PATHS[p] || MODULE_PATHS[1];
}
function orderedModules(){
  return modulePath().map(id=>MODULES.find(m=>m.id===id)).filter(Boolean);
}

/* ══════════════════════════════════
   LABORATÓRIO: banco de experimentos
   ══════════════════════════════════ */
const EXPERIMENTS = [
  { id:'e1',  emoji:'', ico:'message', title:'Mensagem de gratidão',      emotion:'Gratidão',    time:'5 min',
    desc:'Envie hoje uma mensagem específica a alguém, agradecendo por algo concreto que essa pessoa fez, sem ser data especial, sem motivo "oficial".',
    belief:'"Vão achar estranho / não vai fazer diferença."' },
  { id:'e2',  emoji:'', ico:'coffee', title:'Refeição saboreada',        emotion:'Serenidade',  time:'15 min',
    desc:'Faça UMA refeição sem telas. Nos três primeiros garfos, atenção total: sabor, textura, temperatura. Depois coma normalmente.',
    belief:'"Comer é só abastecer, não dá para curtir isso."' },
  { id:'e3',  emoji:'', ico:'users', title:'Compartilhar a boa notícia', emotion:'Alegria',     time:'5 min',
    desc:'Aconteceu algo bom, mesmo pequeno? Conte hoje para alguém que responde bem, com detalhes, deixando-se animar ao contar.',
    belief:'"Falar das minhas coisas boas é me exibir."' },
  { id:'e4',  emoji:'', ico:'mountain', title:'Caminhada de admiração',     emotion:'Admiração',   time:'15 min',
    desc:'Caminhe 15 minutos procurando deliberadamente o que você nunca notou: uma árvore antiga, um detalhe de prédio, o céu. Pare em 3 coisas.',
    belief:'"Meu bairro/dia a dia não tem nada de especial."' },
  { id:'e5',  emoji:'', ico:'gift', title:'Gentileza anônima',          emotion:'Amor',        time:'10 min',
    desc:'Faça um ato de gentileza sem receber crédito: um elogio sincero, pagar um café, deixar algo bom no caminho de alguém.',
    belief:'"Gestos pequenos não mudam nada."' },
  { id:'e6',  emoji:'', ico:'music', title:'Uma música, corpo inteiro',  emotion:'Diversão',    time:'5 min',
    desc:'Escolha UMA música que você ama e dance ou cante junto, sozinho/a se preferir, do início ao fim, sem fazer mais nada.',
    belief:'"Isso é ridículo / não tenho mais idade para isso."' },
  { id:'e7',  emoji:'', ico:'eye', title:'Beleza do dia (3 dias)',     emotion:'Interesse',   time:'1 min/dia',
    desc:'Por 3 dias, fotografe UMA coisa bonita ou interessante por dia. No 3º dia, reveja as três fotos com calma.',
    belief:'"Não tenho olhar para essas coisas."' },
  { id:'e8',  emoji:'', ico:'cloud', title:'Dez minutos de céu',         emotion:'Serenidade',  time:'10 min',
    desc:'Assista ao pôr do sol, ao céu ou à rua da janela por 10 minutos, sem celular, sem tarefa. Só olhar, como quem não deve nada.',
    belief:'"Ficar parado/a é desperdiçar tempo."' },
  { id:'e9',  emoji:'', ico:'award', title:'Relembrar uma conquista',    emotion:'Orgulho',     time:'10 min',
    desc:'Escreva sobre uma conquista sua, o obstáculo, o que VOCÊ fez, como conseguiu. Termine com: "isso fui eu que fiz".',
    belief:'"Sentir orgulho é se achar demais."' },
  { id:'e10', emoji:'', ico:'calendar', title:'Plantar uma antecipação',    emotion:'Esperança',   time:'10 min',
    desc:'Marque algo bom e concreto para os próximos 7 dias (com hora!). Nos dias antes, imagine 3 detalhes dele. Saboreie antes de viver.',
    belief:'"Melhor não criar expectativa para não me frustrar."' },
  { id:'e11', emoji:'', ico:'moon', title:'Descanso declarado',         emotion:'Contentamento', time:'30 min',
    desc:'Agende 30 minutos de descanso DE PROPÓSITO (não "sobrou tempo"): série, banho longo, sofá. Antes, diga: "isto é descanso, e é legítimo".',
    belief:'"Descansar sem ter terminado tudo é preguiça."' },
  { id:'e12', emoji:'', ico:'heart', title:'Micro-momento de conexão',   emotion:'Amor',        time:'5 min',
    desc:'Tenha hoje UMA conversa de verdade, olho no olho ou voz, com alguém: um colega, o porteiro, um familiar. Pergunte e ouça de verdade.',
    belief:'"Conversa pequena é vazia, ninguém liga de verdade."' },
  { id:'e13', emoji:'', ico:'sunrise', title:'Melhor eu possível',         emotion:'Esperança',   time:'15 min',
    desc:'Reserve 15 minutos e escreva, sem parar, sobre a sua vida daqui a alguns anos <em>indo bem, de um jeito realista</em>: relações, trabalho, saúde, o que lhe faz bem. Descreva como se já fosse real. Depois releia e circule UM passo que dá para dar esta semana. Se doer comparar com o agora, pare: tudo bem. Uma vez só costuma não durar; repita uma vez por semana, por algumas semanas. <small>Base: King (2001); Carrillo e cols. (2019). Os efeitos são pequenos.</small>',
    belief:'"Imaginar o futuro que quero só vai me frustrar."' },
];

/* ══════════════════════════════════
   MÓDULOS ↔ EXPERIMENTOS
   Cada canteiro sugere 1 a 3 experimentos que testam, na vida real, o que ele ensina.
   Para mudar uma sugestão, edite só esta tabela. A sugestão é sempre opcional.
   ══════════════════════════════════ */
const EXP_DO_MODULO = {
  m1:['e12'],            // Por que cultivar → um micro-momento de conexão (5 min, fácil de começar)
  m2:['e4','e6'],        // Repertório de emoções → admiração e diversão (as que mais costumam faltar)
  m3:['e7','e8'],        // Notar → beleza do dia, dez minutos de céu
  m4:['e2','e3','e10'],  // Saborear → refeição, boa notícia compartilhada, antecipação
  m5:['e1'],             // Gratidão → mensagem de gratidão
  m6:['e11','e5'],       // Contentamento e segurança (TFC) → descanso declarado, gentileza anônima
  m7:['e9','e3'],        // Crenças que bloqueiam a alegria → orgulho, falar do que é bom
  m8:['e13','e10']       // Um jardim que dura → melhor eu possível, antecipação
};
function expDoModulo(modId){ return (EXP_DO_MODULO[modId]||[]).map(id=>EXPERIMENTS.find(e=>e.id===id)).filter(Boolean); }
function moduloDoExp(expId){   // primeiro canteiro, na ordem do caminho da pessoa, que sugere este experimento
  return orderedModules().find(m=>(EXP_DO_MODULO[m.id]||[]).includes(expId)) || MODULES.find(m=>(EXP_DO_MODULO[m.id]||[]).includes(expId)) || null;
}
function expJaFeito(expId){ return D.experiments.some(e=>e.expId===expId && e.status==='done'); }
function expAtivo(){ return D.experiments.find(e=>e.status==='active'); }
function expSugeridos(){   // dos canteiros que a pessoa já concluiu ou começou, e que ela ainda não testou
  const ids=[];
  orderedModules().forEach(m=>{
    const mp=D.moduleProgress[m.id];
    if(mp && (mp.done || (mp.steps||[]).some(Boolean))) (EXP_DO_MODULO[m.id]||[]).forEach(id=>{ if(!ids.includes(id) && !expJaFeito(id)) ids.push(id); });
  });
  return ids.slice(0,3);
}
function abrirNoLab(expId){   // vai ao laboratório com a previsão deste experimento já aberta
  goTo('lab');
  setTimeout(()=>{
    if(expAtivo()) return;
    openPredict(expId);
    const c=document.getElementById('lab-'+expId); if(c && c.scrollIntoView) c.scrollIntoView({block:'center'});
  },150);
}
function irAoTeste(expId){ closeCelebrate(); abrirNoLab(expId); }
function renderTesteNaPratica(mod){   // fim do módulo: sugestão opcional
  const el=document.getElementById('cel-teste'); if(!el) return;
  const lista=expDoModulo(mod.id).filter(e=>!expJaFeito(e.id)).slice(0,2);
  if(!lista.length){ el.innerHTML=''; return; }
  const ativo=expAtivo();
  el.innerHTML=`<div class="teste-pratica">
    <div class="tp-h">Teste na prática <small>(opcional)</small></div>
    <p class="tp-p">Para ver o que este canteiro muda na vida real:</p>
    ${lista.map(e=>`<div class="tp-row"><span class="tp-em" aria-hidden="true">${ico(e.ico,18)}</span><span class="tp-tx"><strong>${e.title}</strong><small>${e.time} · testa a crença ${e.belief}</small></span>${ativo?'':`<button type="button" class="tp-btn" onclick="irAoTeste('${e.id}')">Testar</button>`}</div>`).join('')}
    ${ativo?'<p class="tp-p">Você já tem um experimento em andamento. Conclua-o no Laboratório para começar outro.</p>':''}
  </div>`;
}

/* ══════════════════════════════════
   NAVIGATION
   ══════════════════════════════════ */
const SCREENS = ['home','modules','module','diary','lab','progress','assess','dados','pretest'];
function goTo(s){
  SCREENS.forEach(id=>{
    document.getElementById('scr-'+id)?.classList.remove('on');
    document.getElementById('nb-'+id)?.classList.remove('on');
  });
  const scr = document.getElementById('scr-'+s);
  if(!scr) return;
  scr.classList.add('on');
  document.getElementById('nb-'+s)?.classList.add('on');
  scr.scrollTop = 0;
  const nav = document.getElementById('nav');
  if(nav) nav.style.display = (s==='pretest') ? 'none' : '';
  if(s==='home')     renderHome();
  if(s==='modules')  renderModuleList();
  if(s==='diary')    renderDiary();
  if(s==='lab')      renderLab();
  if(s==='progress') renderProgress();
  if(s==='assess')   renderAssess();
  if(s==='pretest')  renderPretest();
  if(s==='dados'){ renderDadosSync(); renderReminderUI(); }
}

/* ══════════════════════════════════
   ONBOARDING
   ══════════════════════════════════ */
let _obSel=-1;
let _obDemo={};
function obShow(id){
  document.querySelectorAll('#onboard .ob-slide').forEach(x=>x.classList.remove('on'));
  const el=document.getElementById(id); if(el){ el.classList.add('on'); el.scrollTop=0; }
}
function obNext(n){ obShow('obs'+n); }
function obOpen(id){ document.getElementById('onboard').classList.remove('hide'); obShow(id); }
function obClose(){ document.getElementById('onboard').classList.add('hide'); }
function openAbout(){ obOpen('obs1'); }
function openInvite(){ if(D.consentGiven){ toast('Você já participa. Pode desligar em Dados.'); return; } closeModal(); obOpen('obs6'); }
function obDecline(){
  D.consentGiven=false; D.researchInviteSeen=true; save();
  trackAppEvent('research_invite_declined');
  obClose(); toast('Tudo bem. O app segue igual para você.');
  if(typeof renderNudge==='function') renderNudge();
}
function obStart(){ obDone(); }
function obSelect(el,v){
  _obSel=v;
  document.querySelectorAll('.ob-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  const btn=document.getElementById('ob-btn3');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; }
  D.obLevel=v;
  D.userProfile = { onboardingPath: v };
}
function obSkip(){ obDone(); }
function obConsentToggle(cb){
  const btn=document.getElementById('ob-btn5');
  if(!btn) return;
  btn.disabled = !cb.checked;
  btn.style.opacity = cb.checked ? '1' : '';
}
function demoPick(field, value, el){
  _obDemo[field] = value;
  el.closest('.demo-pill-row').querySelectorAll('.demo-pill').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
}
function obFinish(){
  const nameVal    = (document.getElementById('demo-name')?.value||'').trim();
  const ageVal     = parseInt(document.getElementById('demo-age')?.value||'') || null;
  const cityVal    = (document.getElementById('demo-city')?.value||'').trim();
  const countryVal = (document.getElementById('demo-country')?.value||'').trim();
  if(nameVal) D.nickname = nameVal;
  D.demographics = {
    gender:  _obDemo.gender  || null,
    age:     ageVal,
    city:    cityVal  || null,
    country: countryVal || null,
    therapy: _obDemo.therapy || null,
  };
  // O consentimento só é gravado aqui, depois de o convite ter sido lido e aceito.
  D.consentGiven = true;
  if(!D.consentDate) D.consentDate = new Date().toISOString();
  D.researchInviteSeen = true;
  save();
  trackAppEvent('research_consent_given');
  obClose();
  toast('Obrigada por participar.');
  syncToResearch({ silent: true, requirePretest: false });
  if(typeof renderNudge==='function') renderNudge();
}
function obDone(){
  D.obDone=true;
  save();
  trackAppEvent('onboarding_complete');
  obClose();
  if(!D.firstPracticeSeen){ goTo('pretest'); } else { goTo('home'); }
}

/* ══════════════════════════════════
   ANALYTICS
   ══════════════════════════════════ */
function trackAppEvent(event){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[], labEvents:[] };
  D.analytics.sessions.push({ ts: Date.now(), event });
  save();
}
function trackModuleEvent(moduleId, event){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[], labEvents:[] };
  D.analytics.moduleEvents.push({ ts: Date.now(), moduleId, event });
  save();
}
function trackDiaryEvent(){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[], labEvents:[] };
  D.analytics.diaryEvents.push({ ts: Date.now() });
  save();
}
function trackLabEvent(expId, event){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[], labEvents:[] };
  if(!D.analytics.labEvents) D.analytics.labEvents=[];
  D.analytics.labEvents.push({ ts: Date.now(), expId, event });
  save();
}

/* ══════════════════════════════════
   ESCALAS, SPANE (Diener et al., 2009) + Crenças
   ══════════════════════════════════ */
const SPANE_ITEMS = [
  { t:'Positivo/a',    k:'p' },
  { t:'Negativo/a',    k:'n' },
  { t:'Bem',           k:'p' },
  { t:'Mal',           k:'n' },
  { t:'Agradável: em estados agradáveis', k:'p' },
  { t:'Desagradável: em estados desagradáveis', k:'n' },
  { t:'Feliz',         k:'p' },
  { t:'Triste',        k:'n' },
  { t:'Com medo',      k:'n' },
  { t:'Alegre',        k:'p' },
  { t:'Com raiva',     k:'n' },
  { t:'Contente',      k:'p' },
];
const SPANE_LABELS = ['Muito raramente ou nunca','Raramente','Às vezes','Frequentemente','Muito frequentemente ou sempre']; // 1-5

/* Crenças sobre emoções positivas — checklist psicoeducativo
   (inspirado em Fear of Happiness Scale, Joshanloo 2013, e
   Fears of Positive Emotions, Gilbert et al., adaptação livre, não validada) */
const BELIEF_ITEMS = [
  'Quando me sinto muito feliz, temo que algo ruim aconteça em seguida.',
  'Não mereço me sentir bem enquanto houver problemas na minha vida.',
  'Se eu relaxar e aproveitar, vou baixar a guarda.',
  'Sentir orgulho das minhas conquistas é se achar demais.',
  'Demonstrar alegria pode atrair inveja ou julgamento.',
  'Ficar contente demais é sinal de ingenuidade.',
  'Se eu comemorar antes da hora, estrago tudo.',
  'Descansar e aproveitar é perda de tempo que eu deveria usar produzindo.',
];
const BELIEF_LABELS = ['Discordo totalmente','Discordo','Nem concordo nem discordo','Concordo','Concordo totalmente']; // 0-4

function calcSpane(answers){
  let p=0, n=0;
  SPANE_ITEMS.forEach((it,i)=>{ if(it.k==='p') p+=answers[i]; else n+=answers[i]; });
  return { p, n, b: p-n };
}
function spaneLevel(b){
  return b>=12?'flor':b>=3?'verde':b>=-3?'fragil':'seco';
}
const SPANE_LEVEL_INFO = {
  flor:   { icon:'flower', title:'Florescendo',          msg:'As emoções positivas têm presença forte na sua vida. O cultivo aqui vai torná-las ainda mais conscientes e resilientes.' },
  verde:  { icon:'leaf', title:'Equilíbrio positivo',  msg:'O saldo emocional está a favor do positivo, com espaço claro para crescer, especialmente em frequência e intensidade.' },
  fragil: { icon:'sprout', title:'Equilíbrio frágil',    msg:'Positivas e difíceis estão praticamente empatadas. É exatamente o cenário em que este treino costuma fazer mais diferença.' },
  seco:   { icon:'cloud', title:'Uma fase mais pesada', msg:'Nas últimas semanas, as emoções difíceis pesaram mais. É um retrato do momento, não de quem você é. O cultivo pode ajudar, e, se o peso for grande, conversar com um/a profissional pode ajudar muito mais.' },
};

/* ══════════════════════════════════
   PRETEST / POSTTEST
   ══════════════════════════════════ */
let _pt = {
  phase: 'spane',   // 'spane' | 'beliefs'
  isPost: false,
  spaneAnswers: [], spaneQ: 0,
  beliefAnswers: [], beliefQ: 0,
};

/* Primeira prática curta (1 min), oferecida antes do pré-teste para a pessoa sentir um benefício cedo.
   Respiração com expiração prolongada (sistema calmante, Gilbert; ver Módulo 6). Sempre pode pular. */
let _fp = { timer:null };
function firstPracticeStop(){ if(_fp.timer){ clearInterval(_fp.timer); _fp.timer=null; } }
function renderFirstPractice(){
  firstPracticeStop();
  document.getElementById('pretest-content').innerHTML = `
  <div class="pretest-wrap" style="text-align:center;padding-top:48px">
    <div style="font-size:48px;margin-bottom:14px"></div>
    <h2 style="font-size:22px;font-weight:600;margin-bottom:10px">Um minuto só para você</h2>
    <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:20px">
      Antes da avaliação, uma pausa curta: inspire pelo nariz e solte o ar devagar, mais longo do que a inspiração.
      Se algo incomodar, respire do seu jeito ou pule. Não existe jeito errado.
    </p>
    <div id="fp-circle" style="width:120px;height:120px;border-radius:50%;margin:0 auto 14px;background:var(--mint-l,#DDF1EA);border:2px solid var(--mint-d,#1B6A58);transition:transform 4s ease-in-out"></div>
    <div id="fp-text" role="status" aria-live="polite" style="font-size:16px;font-weight:700;min-height:24px;margin-bottom:6px"> </div>
    <div id="fp-time" style="font-size:13px;color:var(--light);margin-bottom:18px"> </div>
    <button class="btn" id="fp-start" onclick="firstPracticeStart()">Começar (1 minuto)</button>
    <button class="btn ghost" style="margin-top:0" onclick="firstPracticeSkip()">Pular</button>
  </div>`;
}
function firstPracticeStart(){
  const btn=document.getElementById('fp-start'); if(btn) btn.style.display='none';
  const circle=document.getElementById('fp-circle'), txt=document.getElementById('fp-text'), tm=document.getElementById('fp-time');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOTAL=60; let t=0; let phaseLeft=0, inhale=true;
  const tick=()=>{
    if(t>=TOTAL){ firstPracticeDone(); return; }
    if(phaseLeft<=0){
      inhale = !inhale || t===0;
      if(t===0) inhale = true;
      phaseLeft = inhale ? 4 : 6;
      txt.textContent = inhale ? 'Inspire' : 'Solte o ar devagar';
      if(!reduce){ circle.style.transition='transform '+phaseLeft+'s ease-in-out'; circle.style.transform = inhale ? 'scale(1.35)' : 'scale(1)'; }
    }
    phaseLeft--; t++;
    tm.textContent = (TOTAL-t)+'s';
  };
  tick();
  _fp.timer = setInterval(tick, 1000);
}
const ANCHORS = [
  { id:'cafe',  label:'Depois do café da manhã', hour:8 },
  { id:'casa',  label:'Quando eu chegar em casa', hour:18 },
  { id:'sono',  label:'Antes de dormir', hour:21 },
  { id:'outro', label:'Em outro momento que eu escolher', hour:20 },
];
function firstPracticeDone(){
  firstPracticeStop();
  D.firstPracticeDone = true; D.firstPracticeSeen = true; save();
  trackAppEvent('first_practice_done');
  awardXP(10, 'primeira prática concluída');
  renderAnchorStep(true);
}
function firstPracticeSkip(){
  firstPracticeStop();
  D.firstPracticeSeen = true;
  trackAppEvent('first_practice_skipped');
  save();
  renderAnchorStep(false);
}
function renderAnchorStep(didPractice){
  document.getElementById('pretest-content').innerHTML = `
  <div class="pretest-wrap" style="padding-top:48px">
    <h2 style="font-size:22px;font-weight:300;margin-bottom:10px">${didPractice?'Esse foi o primeiro cuidado.':'Tudo bem, fica para outro dia.'}</h2>
    <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:18px">
      Hábito é mais fácil quando vem colado em algo que você já faz. <strong>Em que momento do seu dia você pode regar o jardim?</strong>
    </p>
    <div class="ob-opts" style="margin-bottom:14px">
      ${ANCHORS.map(a=>`<button class="ob-opt" onclick="anchorPick('${a.id}')">${a.label}</button>`).join('')}
    </div>
    <button class="btn ghost" style="margin:0" onclick="renderFirstMoment()">Escolher depois</button>
  </div>`;
}
function anchorPick(id){
  const a = ANCHORS.find(x=>x.id===id); if(!a) return;
  D.anchor = a; D.reminders.hour = a.hour; save();
  trackAppEvent('anchor_chosen');
  renderFirstMoment();
}
let _fmEmo = new Set();
function fmToggle(el){ const id=el.dataset.emo; if(_fmEmo.has(id)){ _fmEmo.delete(id); el.classList.remove('sel'); } else { _fmEmo.add(id); el.classList.add('sel'); } }
function renderFirstMoment(){
  _fmEmo = new Set();
  document.getElementById('pretest-content').innerHTML = `
  <div class="pretest-wrap" style="padding-top:40px">
    ${D.anchor?`<div class="plan-box"><strong>Seu plano:</strong> ${esc(D.anchor.label)}, vou registrar uma coisa boa do dia.</div>`:''}
    <h2 style="font-size:22px;font-weight:300;margin-bottom:8px">Vamos regar já.</h2>
    <label class="form-lbl" for="fm-text">O que foi bom hoje, mesmo que pequeno?</label>
    <textarea id="fm-text" rows="3" maxlength="300" placeholder="Um café, um raio de sol, uma mensagem…"></textarea>
    <div class="form-hint" style="margin-top:14px">Se quiser, dê nome à emoção. É ela que faz uma planta brotar no seu jardim.</div>
    <div class="chips" style="margin-bottom:18px">${EMOTIONS.map(e=>`<button class="chip" data-emo="${e.id}" onclick="fmToggle(this)">${e.name}</button>`).join('')}</div>
    <button class="btn" onclick="saveFirstMoment()" style="margin-bottom:8px">Guardar e ver meu jardim</button>
    <button class="btn ghost" style="margin:0" onclick="finishFirstFlow()">Fazer depois</button>
  </div>`;
}
function saveFirstMoment(){
  const w = (document.getElementById('fm-text')?.value||'').trim();
  if(!w){ toast('Escreva uma linha, mesmo curta.'); return; }
  D.entries.unshift({id:Date.now().toString(),ts:Date.now(),date:today(),moment:w,emotions:[..._fmEmo],savoring:[],intensity:3});
  save(); checkBadges(); trackDiaryEvent(); trackAppEvent('first_moment_saved');
  finishFirstFlow();
  toast('Primeiro dia de cultivo. Seu jardim começou.');
}
function finishFirstFlow(){
  if(!D.anchor && !D.notifSeen){ /* o convite ao lembrete aparece depois, na Home */ }
  goTo('home');
}

function renderPretest(skipIntro){
  if(!skipIntro && !D.pretest && !D.firstPracticeSeen){ renderFirstPractice(); return; }
  _pt.phase='spane';
  _pt.spaneAnswers=[]; _pt.spaneQ=0;
  _pt.beliefAnswers=[]; _pt.beliefQ=0;
  _pt.isPost = !!D.pretest;
  document.getElementById('pretest-content').innerHTML='';
  renderPretestSpane();
}

function pretestProgress(){
  const total = SPANE_ITEMS.length + BELIEF_ITEMS.length;
  const done = _pt.spaneAnswers.length + _pt.beliefAnswers.length;
  return Math.round(done/total*100);
}

function pretestFooterHTML(){
  const canBack = _pt.spaneAnswers.length > 0 || _pt.beliefAnswers.length > 0;
  return `<div class="pt-footer">
    ${canBack?`<button class="pt-link" onclick="pretestBack()">← Corrigir anterior</button>`:'<span></span>'}
    ${!_pt.isPost?`<button class="pt-link muted" onclick="pretestLater()">Responder depois</button>`:''}
  </div>`;
}

function pretestBack(){
  if(_pt.phase==='beliefs'){
    if(_pt.beliefQ > 0){ _pt.beliefAnswers.pop(); _pt.beliefQ--; renderPretestBeliefs(); }
    else { _pt.phase='spane'; _pt.spaneAnswers.pop(); _pt.spaneQ--; renderPretestSpane(); }
  } else if(_pt.spaneQ > 0){
    _pt.spaneAnswers.pop(); _pt.spaneQ--; renderPretestSpane();
  }
}

function pretestLater(){
  trackAppEvent('pretest_postponed');
  toast('Sem problema: a pré-avaliação fica à sua espera. ');
  goTo('home');
}

function renderPretestSpane(){
  const q = _pt.spaneQ;
  const pct = pretestProgress();
  const el = document.getElementById('pretest-content');
  const isPost = _pt.isPost;
  el.innerHTML = `
  <div class="pretest-wrap">
    <div class="pretest-hdr">
      ${q===0 ? `<h2>${isPost?'Reavaliação':'Pré-avaliação'}</h2>
      <p>${isPost
        ? 'Vamos verificar como você está agora para comparar com quando começou.'
        : 'Antes de plantar, queremos conhecer o terreno. Leva cerca de 3 minutos.'}</p>` : ''}
    </div>
    <div class="pretest-prog-bar">
      <div class="pretest-prog-fill" style="width:${pct}%"></div>
    </div>
    <div class="pt-section">
      <div class="pt-section-lbl">SPANE: Experiências emocionais <span>Pergunta ${q+1}/${SPANE_ITEMS.length}</span></div>
      <div class="pt-q-wrap">
        <div class="pt-q-text">Nas últimas 4 semanas, com que frequência você se sentiu: <em>${SPANE_ITEMS[q].t}</em></div>
        <div class="pt-scale">
          ${SPANE_LABELS.map((o,i)=>`<button class="scale-btn" onclick="answerSpane(${i+1})">${o}</button>`).join('')}
        </div>
      </div>
    </div>
    ${pretestFooterHTML()}
  </div>`;
}

function answerSpane(v){
  _pt.spaneAnswers.push(v);
  _pt.spaneQ++;
  if(_pt.spaneQ < SPANE_ITEMS.length){ renderPretestSpane(); }
  else { _pt.phase='beliefs'; renderPretestBeliefs(); }
}

function renderPretestBeliefs(){
  const q = _pt.beliefQ;
  const pct = pretestProgress();
  const el = document.getElementById('pretest-content');
  el.innerHTML = `
  <div class="pretest-wrap">
    <div class="pretest-prog-bar">
      <div class="pretest-prog-fill" style="width:${pct}%"></div>
    </div>
    <div class="pt-section">
      <div class="pt-section-lbl">Crenças sobre emoções positivas <span>Pergunta ${q+1}/${BELIEF_ITEMS.length}</span></div>
      <div class="mcq-item">
        <div class="mcq-q">${BELIEF_ITEMS[q]}</div>
        <div class="mcq-scale">
          ${BELIEF_LABELS.map((l,i)=>`<button class="scale-btn" onclick="answerBelief(${i})">${l}</button>`).join('')}
        </div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--light);text-align:center;margin-top:4px">Não há respostas certas ou erradas, responda com sinceridade.</p>
    ${pretestFooterHTML()}
  </div>`;
}

function answerBelief(v){
  _pt.beliefAnswers.push(v);
  _pt.beliefQ++;
  if(_pt.beliefQ < BELIEF_ITEMS.length){ renderPretestBeliefs(); }
  else { finishPretest(); }
}

function finishPretest(){
  const spane = calcSpane(_pt.spaneAnswers);
  const beliefScore = _pt.beliefAnswers.reduce((a,b)=>a+b,0);

  const result = {
    spane: { ...spane, answers: [..._pt.spaneAnswers] },
    beliefs: { score: beliefScore, answers: [..._pt.beliefAnswers] },
    date: today(),
  };

  if(_pt.isPost){
    D.posttest = result;
    D.posttestRemindAfter = null;
    save();
    trackAppEvent('posttest_complete');
    syncToResearch({ silent: true });
    showPosttestDelta();
  } else {
    D.pretest = result;
    D.assessment = { p:spane.p, n:spane.n, b:spane.b, date: today(), answers:[..._pt.spaneAnswers] };
    save();
    trackAppEvent('pretest_complete');
    const needSupport = spane.n >= 24 || spane.b <= -10;
    const el = document.getElementById('pretest-content');
    el.innerHTML = `
    <div class="pretest-wrap" style="text-align:center;padding-top:60px">
      <div style="font-size:56px;margin-bottom:20px"></div>
      <h2 style="font-size:22px;font-weight:600;margin-bottom:10px">A semente foi plantada.</h2>
      <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:24px">
        Avaliação registrada. Ao longo do cultivo voltaremos a medir<br>para ver o quanto o seu jardim cresceu.
      </p>
      ${needSupport ? supportCardHTML() : ''}
      <button class="btn" style="max-width:320px;margin:16px auto 0" onclick="goTo('home')">Começar o cultivo </button>
    </div>`;
  }
}

/* Post-test trigger */
function checkPosttestTrigger(){
  if(D.posttest) return;
  if(!D.pretest) return;
  if(D.posttestRemindAfter){
    const remind = new Date(D.posttestRemindAfter);
    if(new Date() < remind) return;
  }
  const doneMods = MODULES.filter(m=>D.moduleProgress[m.id]?.done).length;
  const pretestTs = new Date(D.pretest.date+'T12:00').getTime();
  const diaryAfter = D.entries.filter(e=>e.ts>pretestTs).length;
  if(doneMods >= 3 || diaryAfter >= 5){
    setTimeout(showPosttestPrompt, 1200);
  }
}

function showPosttestPrompt(){
  if(document.getElementById('modal-ov').classList.contains('on')) return;
  document.getElementById('modal-title').textContent='Como você está agora?';
  document.getElementById('modal-body').textContent='Você já cultivou um bom trecho. Que tal uma reavaliação rápida (≈3 min) para ver o quanto cresceu?';
  document.getElementById('modal-actions').innerHTML=`
    <button class="btn mint" onclick="startPosttest()">Fazer reavaliação</button>
    <button class="btn ghost" onclick="dismissPosttest()">Agora não</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

function dismissPosttest(){
  const d = new Date(); d.setDate(d.getDate()+7);
  D.posttestRemindAfter = d.toISOString();
  save();
  document.getElementById('modal-ov').classList.remove('on');
}

function startPosttest(){
  document.getElementById('modal-ov').classList.remove('on');
  _pt.isPost = true;
  goTo('pretest');
}

/* Convite voluntário após o pós-teste (sem pressão; só se a pessoa ainda não participa e é maior de 18 anos) */
function researchAskHTML(){
  const _a = D.demographics && D.demographics.age;
  if(!RESEARCH_ENDPOINT || D.consentGiven || (_a !== null && _a !== undefined && _a < 18)) return '';
  return `
    <div class="delta-card" id="research-ask">
      <div class="card-lbl" style="margin-bottom:8px">Quer ajudar a pesquisa?</div>
      <div style="font-size:14px;line-height:1.7;color:var(--muted)">
        O seu antes e depois ajuda a entender como o Floresça pode apoiar quem vem depois de você.
        Se quiser, participe <strong>sem nome nem contato</strong>: o envio inclui as respostas às escalas, o uso do app, idade, gênero, cidade e país (se você informou), e não inclui os textos que você escreve.
        É uma escolha sua: dizer "agora não" não muda nada no seu jardim, e você pode participar depois em Dados.
      </div>
      <button class="btn" style="margin-top:12px" onclick="researchAskDismiss();openInvite()">Participar da pesquisa</button>
      <button class="btn ghost" style="margin-top:0" onclick="researchAskDismiss()">Agora não</button>
    </div>`;
}
function researchAskDismiss(){
  const el = document.getElementById('research-ask');
  if(el) el.remove();
}
function showPosttestDelta(){
  const pre = D.pretest, post = D.posttest;
  // Direções: P e B → subir é melhor · N e Crenças → descer é melhor
  const rows = [
    { lbl:'Emoções positivas (SPANE-P)', pre:pre.spane.p, post:post.spane.p, higherBetter:true },
    { lbl:'Emoções negativas (SPANE-N)', pre:pre.spane.n, post:post.spane.n, higherBetter:false },
    { lbl:'Saldo emocional (SPANE-B)',   pre:pre.spane.b, post:post.spane.b, higherBetter:true },
    { lbl:'Crenças que bloqueiam',       pre:pre.beliefs.score, post:post.beliefs.score, higherBetter:false },
  ];
  const rowsHTML = rows.map(r=>{
    const d2 = r.post - r.pre;
    const dir = d2===0?'same':( (d2>0)===r.higherBetter ? 'better':'worse');
    const arrow = d2<0?'▼':d2>0?'▲':'—';
    return `<div class="delta-row">
      <span class="delta-lbl">${r.lbl}</span>
      <span class="delta-vals">
        <span>${r.pre}</span>
        <span class="delta-arrow delta-${dir}">${arrow}</span>
        <span>${r.post}</span>
      </span>
    </div>`;
  }).join('');

  const bImproved = post.spane.b >= pre.spane.b;
  const el = document.getElementById('pretest-content');
  el.innerHTML = `
  <div class="delta-wrap">
    <div class="delta-hdr">
      <div style="font-size:52px;margin-bottom:14px">${bImproved?'':''}</div>
      <h2>O crescimento do jardim</h2>
      <p>Comparando o terreno de quando você chegou com agora.</p>
    </div>
    <div class="delta-card">
      <div class="card-lbl" style="margin-bottom:8px">Pré vs. Pós</div>
      ${rowsHTML}
      ${bImproved && post.spane.b>pre.spane.b ? '<div style="font-size:13px;color:var(--mint-d);margin-top:8px">Saldo emocional '+(post.spane.b-pre.spane.b)+' pontos acima do que era no início. Esse resultado é seu: você se dedicou a isso. </div>':''}
    </div>
    ${researchAskHTML()}
    <button class="btn mint" onclick="goTo('home')" style="margin-top:8px">Ver meu progresso completo</button>
    <button class="btn ghost" onclick="goTo('progress')" style="margin-top:0">Ver marcas do caminho</button>
  </div>`;
}

/* ══════════════════════════════════
   HOME
   ══════════════════════════════════ */
const SUBS = [
  'O que você nota, cresce.',
  'Pequenos momentos, regados todos os dias.',
  'O positivo sussurra: você está aprendendo a escutar.',
  'Saborear é multiplicar.',
  'A constância rega mais que a intensidade.',
  'Seu jardim, suas regras, seu ritmo.',
];
function nextModule(){ return orderedModules().find(m=>!D.moduleProgress[m.id]?.done && isUnlocked(m)); }
function assessSuggested(){
  if(!D.assessment) return true;
  const days = Math.floor((new Date(today()+'T12:00') - new Date(D.assessment.date+'T12:00'))/864e5);
  return days >= 28;
}
/* ══════════════════════════════════
   FRASES DE IDENTIDADE e RESUMO SEMANAL
   Regra de ouro: só dizemos o que a pessoa de fato fez. Nada de elogio
   genérico, comparação com outras pessoas ou ranking. O resumo usa as
   palavras que a própria pessoa escreveu.
   ══════════════════════════════════ */
function identityLine(){
  const out = [];
  const nEntries = D.entries.length;
  const felt = new Set(D.entries.flatMap(e=>e.emotions||[]));
  const savored = D.entries.filter(e=>(e.savoring||[]).some(x=>x!=='Ainda não saboreei')).length;
  const exps = D.experiments.filter(e=>e.status==='done').length;
  if(nEntries>=1) out.push('Você é alguém que repara no que é bom.');
  if(felt.size>=3) out.push('Você está ampliando seu repertório: já nomeou '+felt.size+' emoções diferentes.');
  if(savored>=1) out.push('Você é alguém que se permite saborear o que é bom.');
  if(exps>=1) out.push('Você é alguém que testa antes de acreditar.');
  if(calcTotalDays()>=3) out.push('Voltar a cada dia, do seu jeito, também é cultivar.');
  if(!out.length) return '';
  const k = Math.floor(Date.now()/864e5) % out.length;
  return out[k];
}
function weekStats(fromDate, toDateExcl){
  const list = D.entries.filter(e=>e.date>=fromDate && e.date<toDateExcl);
  const days = new Set(list.map(e=>e.date)).size;
  const cnt = {};
  list.forEach(e=>(e.emotions||[]).forEach(id=>{ cnt[id]=(cnt[id]||0)+1; }));
  const top = Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,2)
    .map(([id])=>{ const em=EMOTIONS.find(x=>x.id===id); return em?em.name.toLowerCase():null; }).filter(Boolean);
  const best = [...list].filter(e=>e.moment).sort((a,b)=>(b.intensity||0)-(a.intensity||0) || b.ts-a.ts)[0];
  return { n:list.length, days, top, quote: best ? best.moment : '' };
}
function weekSummaryText(st, goal, label){
  const plural=(n,a,b)=>n+' '+(n===1?a:b);
  let t = label+', você registrou <strong>'+plural(st.n,'momento','momentos')+'</strong> em '+plural(st.days,'dia','dias')+'.';
  if(st.top.length) t += ' O que mais apareceu: <strong>'+st.top.join(' e ')+'</strong>.';
  if(st.n>=goal) t += ' Você chegou à sua meta de '+plural(goal,'momento','momentos')+'.';
  return t;
}
function renderWeekSummary(){
  const el = document.getElementById('h-week'); if(!el) return;
  const ws = weekStart();
  const pws = weekStart(prevDay(7));
  if(D.weekSummarySeen === ws){ el.innerHTML=''; return; }
  const st = weekStats(pws, ws);
  if(st.n<1){ el.innerHTML=''; return; }
  const quote = st.quote ? `<blockquote class="wk-quote">“${esc(st.quote.length>110?st.quote.slice(0,107)+'…':st.quote)}”</blockquote><div class="wk-quote-by">Palavras suas, da semana passada.</div>` : '';
  el.innerHTML = `<div class="card week-card">
    <div class="card-lbl">Sua semana passada</div>
    <p class="wk-text">${weekSummaryText(st, D.weeklyGoal||2, 'Na semana passada')}</p>
    ${quote}
    <div class="wk-actions"><button class="link-btn" onclick="closeWeekSummary()">Fechar</button><button class="link-btn" onclick="goTo('progress')">Ver no Progresso</button></div>
  </div>`;
}
function closeWeekSummary(){
  D.weekSummarySeen = weekStart(); save();
  trackAppEvent('week_summary_closed');
  renderWeekSummary();
}

function renderNextStep(){
  const el = document.getElementById('h-next'); if(!el) return;
  const doneToday = D.entries.some(e=>e.date===today());
  const nm = nextModule();
  if(!doneToday){
    el.innerHTML = `<div class="next-card">
      <div class="next-lbl">Seu próximo passo</div>
      <div class="next-title">O que foi bom hoje, mesmo que pequeno?</div>
      ${D.anchor?`<div class="next-sub">Seu gatilho: ${esc(D.anchor.label.toLowerCase())}.</div>`:''}
      <button class="btn next-btn" onclick="goTo('diary')">Registrar em um minuto</button>
    </div>`;
  } else {
    el.innerHTML = `<div class="next-card done">
      <div class="next-lbl">Hoje já foi regado</div>
      <div class="next-title">Um momento já conta. O resto do dia é descanso.</div>
      ${identityLine()?`<div class="next-sub">${esc(identityLine())}</div>`:''}
      ${nm?`<div class="next-sub">Próximo para você: ${esc(nm.title)}</div><button class="btn next-btn ghost-light" onclick="openModule('${nm.id}')">Continuar o módulo</button>`:''}
    </div>`;
  }
}
function renderGardenCard(){
  const el = document.getElementById('h-garden'); if(!el) return;
  const days = calcTotalDays();
  const goal = D.weeklyGoal || 2, got = weekCount();
  const goalTxt = got>=goal ? 'Meta da semana cumprida. O resto é bônus.' : 'Esta semana: '+got+' de '+goal+(goal>1?' momentos':' momento')+'.';
  el.innerHTML = `<div class="card garden-card">
    <div class="card-lbl">Seu jardim</div>
    ${gardenHTML()}
    <div class="g-meta">
      <span>${days} ${days===1?'dia':'dias'} de cultivo</span>
      <span>${goalTxt} <button class="link-btn" onclick="showGoalModal()">Ajustar meta</button></span>
    </div>
  </div>`;
}
function renderHomeMore(){
  const el = document.getElementById('h-more'); if(!el) return;
  const nm = nextModule();
  const expActive = D.experiments.find(e=>e.status==='active');
  const expDone = D.experiments.filter(e=>e.status==='done').length;
  const row = (click,title,sub,ic)=>`<button class="row-link" onclick="${click}"><span class="rl-ico">${ico(ic||'leaf',22)}</span><span class="rl-txt"><strong>${title}</strong><small>${sub}</small></span><span class="set-arr" aria-hidden="true">›</span></button>`;
  let html = '<div class="sdiv">Para quando quiser</div><div class="set-group">';
  if(nm) html += row(`openModule('${nm.id}')`, 'Próximo para você', esc(nm.title), nm.ico);
  html += row("goTo('lab')", 'Laboratório', expActive ? '1 experimento em andamento' : expDone ? expDone+' concluído'+(expDone>1?'s':'') : 'Preveja, teste, compare', 'flask');
  if(assessSuggested()) html += row("goTo('assess')", 'Autoavaliação', D.assessment ? 'Já faz um tempo: quer ver como você está?' : 'SPANE: como você se sente', 'compass');
  html += '</div><div class="support-line"><button class="link-btn" onclick="showSupport()">Preciso de apoio agora</button></div>';
  el.innerHTML = html;
}
function renderHome(){
  const now=new Date(), h=now.getHours();
  const gr = h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  document.getElementById('h-date').textContent = DIAS[now.getDay()]+', '+now.getDate()+' de '+MESES[now.getMonth()];
  document.getElementById('h-hi').textContent   = D.nickname ? gr+', '+D.nickname : gr;
  document.getElementById('h-sub').textContent  = SUBS[now.getDate()%SUBS.length];
  renderNudge();
  renderNextStep();
  renderWeekSummary();
  renderGardenCard();
  _doseAberta = false;
  renderDoseCard();
  renderHomeMore();
}

function renderMiniChart(svgId,emptyId){
  const svg=document.getElementById(svgId), em=document.getElementById(emptyId);
  if(!svg) return;
  const days=Array.from({length:7},(_,i)=>prevDay(6-i));
  const vals=days.map(d=>{ const de=D.entries.filter(e=>e.date===d); return de.length?de.reduce((a,e)=>a+e.intensity,0)/de.length:null; });
  if(!vals.some(v=>v!==null)){ svg.style.display='none'; if(em)em.style.display='block'; return; }
  svg.style.display='block'; if(em)em.style.display='none';
  const W=320,H=72,px=14,py=10,step=(W-2*px)/6;
  const pts=vals.map((v,i)=>({x:px+i*step,y:v===null?null:H-py-((v-1)/4)*(H-2*py),v}));
  const valid=pts.filter(p=>p.y!==null);
  // subindo = florescendo (dourado) · estável/descendo = verde calmo
  const col=valid.length>=2&&valid[valid.length-1].v>valid[0].v+.4?'#C4922A':'#1B8B6F';
  let pd=''; pts.forEach(p=>{if(p.y!==null)pd+=pd?'L'+p.x+','+p.y:'M'+p.x+','+p.y;});
  const f=valid[0],l=valid[valid.length-1];
  svg.innerHTML='<defs><linearGradient id="cg'+svgId+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+col+'" stop-opacity=".18"/><stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+pd+' L'+l.x+','+H+' L'+f.x+','+H+' Z" fill="url(#cg'+svgId+')"/>'+
    '<path d="'+pd+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    valid.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="3.5" fill="'+col+'"/>').join('')+
    days.map((d,i)=>'<text x="'+(px+i*step)+'" y="'+H+'" text-anchor="middle" font-size="9" fill="#6B6F78" font-family="Poppins,sans-serif">'+DIAS_C[new Date(d+'T12:00').getDay()]+'</text>').join('');
}

function buildEntry(e){
  const dt=new Date(e.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  const emos=(e.emotions||[]).map(id=>{
    const em=EMOTIONS.find(x=>x.id===id);
    return em?'<span class="badge-tag bl">'+em.emoji+' '+em.name+'</span>':'';
  }).join('');
  const sav=(e.savoring||[]).filter(s=>s!=='Ainda não saboreei').map(s=>'<span class="badge-tag bg">'+esc(s)+'</span>').join('');
  const stars='<span class="badge-tag bt">'+'★'.repeat(e.intensity||3)+'</span>';
  const why = isElaborated(e) ? '<div class="entry-why"><span>Porque</span> '+esc(e.why)+'</div>' : '';
  const share = e.moment ? '<button class="link-btn entry-share" onclick="shareMoment(\''+e.id+'\')">'+(e.shared?'Compartilhado. Enviar de novo':'Compartilhar')+'</button>' : '';
  return '<div class="entry"><div class="entry-dt">'+dt+'</div><div class="entry-w">'+esc(e.moment||'(sem texto)')+'</div>'+why+'<div class="entry-meta">'+stars+emos+sav+'</div>'+share+'</div>';
}

/* ══════════════════════════════════
   MODULE LIST
   ══════════════════════════════════ */
function isUnlocked(mod){
  // Autonomia: todos os módulos podem ser lidos quando a pessoa quiser.
  // A ordem só é protegida onde há razão clínica: no caminho 2 (medo do prazer),
  // a gratidão (m5) só abre depois do sistema calmante (m6) e do teste de crenças (m7).
  const p = D.userProfile && D.userProfile.onboardingPath;
  if(p === 2 && mod.id === 'm5'){
    return D.moduleProgress['m6']?.done === true && D.moduleProgress['m7']?.done === true;
  }
  return true;
}
function modProgress(mod){
  const mp = D.moduleProgress[mod.id];
  if(!mp) return 0;
  const done = (mp.steps||[]).filter(Boolean).length;
  return Math.round(done/mod.steps.length*100);
}

function renderModuleList(){
  const p = D.userProfile && D.userProfile.onboardingPath;
  const custom = p === 0 || p === 2;
  let html = `<div class="level-header"><div class="level-pip"></div><span class="level-title">${custom?'Seu caminho personalizado':'Seu caminho de cultivo'}</span></div>`;
  const nextId = (nextModule()||{}).id;
  if(custom && PATH_EXPLANATIONS[p]){
    html += `<div style="margin:-4px 16px 12px;font-size:12.5px;color:var(--muted);line-height:1.55">${PATH_EXPLANATIONS[p]}</div>`;
  }
  orderedModules().forEach((m,i)=>{
    const unlocked = isUnlocked(m);
    const done = D.moduleProgress[m.id]?.done;
    const pct  = modProgress(m);
    const statusIcon = done ? ico('check',22) : unlocked ? ico('chevron',22) : ico('lock',20);
    html += `<div class="mod-card ${unlocked?'':'locked'}" onclick="${unlocked?'openModule(\''+m.id+'\')':'void 0'}">
      <div class="mod-card-inner">
        <div class="mod-emoji ${m.color}" aria-hidden="true">${ico(m.ico,24)}</div>
        <div class="mod-info">
          <div class="mod-level-tag">${m.tagline}${m.id===nextId?' · <strong>Próximo para você</strong>':''}</div>
          <div class="mod-title">${m.title}</div>
          <div class="mod-xp">Canteiro ${i+1} · ${m.steps.length} etapas</div>
          <div class="mod-prog-bar"><div class="mod-prog-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="mod-status">${statusIcon}</div>
      </div>
      ${!unlocked?`<div class="mod-lock-overlay"><span class="mod-lock-msg">Este canteiro fica mais seguro depois de cuidar do calmante e das crenças</span></div>`:''}
    </div>`;
  });
  document.getElementById('modules-list').innerHTML = html;
}

/* ══════════════════════════════════
   MODULE VIEW: step system
   ══════════════════════════════════ */
let _curModId = null, _curStep = 0, _stepOk = false;
let _breathTimer = null, _breathPhase = 0, _breathCount = 0, _breathCycles = 0;

function showPretestGate(id){
  document.getElementById('modal-title').textContent = 'Antes do primeiro módulo';
  document.getElementById('modal-body').innerHTML = '<p style="text-align:left">Uma avaliação de cerca de 3 minutos marca o seu ponto de partida, para você ver depois o quanto o jardim cresceu. Você pode responder agora ou abrir o módulo e responder depois.</p>';
  document.getElementById('modal-actions').innerHTML = '<button class="btn mint" onclick="closeModal();goTo(\'pretest\')">Responder agora</button><button class="btn ghost" onclick="D.pretestGateSkipped=true;save();closeModal();openModule(\''+id+'\')">Abrir o módulo mesmo assim</button>';
  document.getElementById('modal-ov').classList.add('on');
}
function openModule(id){
  if(!D.pretest && !D.pretestGateSkipped && !D.moduleProgress[id]){ showPretestGate(id); return; }
  _curModId = id;
  const mod = MODULES.find(m=>m.id===id);
  const done = D.moduleProgress[id]?.steps || [];
  let resume = 0;
  if(!D.moduleProgress[id]?.done){
    resume = mod.steps.findIndex((_,i)=>!done[i]);
    if(resume < 0) resume = 0;
  }
  _curStep = resume;
  goTo('module');
  renderModuleStep();
}

function renderModuleStep(){
  const mod  = MODULES.find(m=>m.id===_curModId);
  const step = mod.steps[_curStep];
  _stepOk    = (step.type==='info'||step.type==='flipcard'||step.type==='guided') || !!D.moduleProgress[_curModId]?.steps?.[_curStep];
  stopBreath();
  _classifyDone = [];
  _flipsAll = 0;
  _guidedPhase = 0;

  const heroGrad = {
    mint:  'linear-gradient(135deg,#1B8B6F,#146E57)',
    coral: 'linear-gradient(135deg,#BC5821,#9E4719)',
    amber: 'linear-gradient(135deg,#C47D2A,#8A5520)',
    lav:   'linear-gradient(135deg,#7A74D6,#5B4E8A)',
  };
  const grad = heroGrad[mod.color]||heroGrad.mint;

  const dots = mod.steps.map((_,i)=>{
    const cl = i<_curStep?'step-dot done':i===_curStep?'step-dot current':'step-dot';
    return `<div class="${cl}"></div>`;
  }).join('');

  let body = '';
  if(step.type==='info'){
    body = `<div class="step-type-tag">${step.typeLabel}</div>
      <div class="step-title">${step.title}</div>
      <div>${step.content}</div>`;
  }
  else if(step.type==='quiz')     body = renderQuizStep(step);
  else if(step.type==='classify') body = renderClassifyStep(step);
  else if(step.type==='flipcard') body = renderFlipStep(step);
  else if(step.type==='fill')     body = renderFillStep(step);
  else if(step.type==='breath')   body = renderBreathStepHTML(step);
  else if(step.type==='guided')   body = renderGuidedStep(step);

  const isLast = _curStep === mod.steps.length - 1;
  const btnLabel = isLast ? 'Concluir módulo ' : 'Continuar →';

  document.getElementById('module-content').innerHTML =
    `<div style="background:${grad};min-height:150px;padding:calc(env(safe-area-inset-top,0px) + 20px) 24px 28px;color:white;position:relative;overflow:hidden">
      <div style="position:absolute;right:-6px;top:-6px;opacity:.16;user-select:none;color:#fff">${ico(mod.ico,96)}</div>
      <button class="mod-hero-back" onclick="goTo('modules')" aria-label="Voltar para os módulos">←</button>
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;opacity:.8;margin-bottom:8px;margin-top:40px">${mod.levelTag}</div>
      <div role="heading" aria-level="1" style="font-size:20px;font-weight:600;letter-spacing:-.3px;line-height:1.25;margin-bottom:10px">${mod.title}</div>
      <div style="font-size:12px;font-weight:700;opacity:.85;background:rgba(255,255,255,.15);display:inline-block;padding:4px 10px;border-radius:20px">Etapa ${_curStep+1} de ${mod.steps.length}</div>
    </div>
    <div style="background:var(--sand);padding:8px 0 4px">${dots.length>1?`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:4px 0">${dots}</div>`:''}</div>
    ${_curStep===0&&mod.porque?`<details class="porque" style="margin:8px 16px 0;font-size:13.5px;color:var(--muted)"><summary style="cursor:pointer;font-weight:800;color:var(--mint-d)">Por que isso?</summary><p style="margin-top:6px">${mod.porque}</p></details>`:''}
    <div class="step-body" style="padding-bottom:8px">${body}</div>
    <div class="step-footer">
      ${_curStep>0?`<button class="btn ghost step-prev" onclick="prevStep()">← Anterior</button>`:''}
      <button class="btn ${mod.color==='coral'?'':'mint'}" id="step-continue" ${_stepOk?'':'disabled'} onclick="advanceStep()">${btnLabel}</button>
    </div>`;
}

function prevStep(){
  if(_curStep===0) return;
  stopBreath();
  _curStep--;
  renderModuleStep();
  document.getElementById('scr-module').scrollTop=0;
}

function enableContinue(){
  _stepOk = true;
  const btn = document.getElementById('step-continue');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; }
}

function advanceStep(){
  const mod = MODULES.find(m=>m.id===_curModId);
  if(!D.moduleProgress[_curModId]) D.moduleProgress[_curModId]={steps:[],done:false};
  D.moduleProgress[_curModId].steps[_curStep]=true;
  save();
  stopBreath();
  if(_curStep < mod.steps.length-1){
    _curStep++; renderModuleStep();
    document.getElementById('scr-module').scrollTop=0;
  } else {
    completeModule();
  }
}

function completeModule(){
  const mod = MODULES.find(m=>m.id===_curModId);
  if(!D.moduleProgress[_curModId]) D.moduleProgress[_curModId]={steps:[],done:false};
  D.moduleProgress[_curModId].done = true;
  awardXP(mod.xp, mod.title);
  awardBadge(mod.badgeId);
  checkBadges();
  save();
  trackModuleEvent(_curModId, 'complete');
  checkPosttestTrigger();
  showCelebrate(mod);
}

function showCelebrate(mod){
  document.getElementById('cel-emoji').innerHTML  = ico(mod.ico,52);
  document.getElementById('cel-title').textContent  = mod.title+' concluído.';
  document.getElementById('cel-xp').textContent     = 'O jardim ganhou um canteiro cuidado';
  document.getElementById('cel-sub').textContent    = 'Seu progresso foi salvo. Quando quiser, siga para o próximo canteiro ou registre um momento bom.';
  const w = document.getElementById('cel-word'); if(w) w.value='';
  renderTesteNaPratica(mod);
  document.getElementById('celebrate-card').classList.add('show');
}
function closeCelebrate(dest){
  const word = (document.getElementById('cel-word')?.value||'').trim();
  if(word){
    D.moduleFeedback.push({ ts:Date.now(), date:today(), moduleId:_curModId, word });
    save();
    trackAppEvent('module_feedback');
    toast('Obrigada por compartilhar ');
  }
  document.getElementById('celebrate-card').classList.remove('show');
  goTo(typeof dest==='string' ? dest : 'modules');
}

/* ── Quiz step ── */
function renderQuizStep(step){
  const opts = step.opts.map((o,i)=>
    `<button class="quiz-opt" onclick="handleQuiz(this,${o.correct},${i})">${o.text}</button>`
  ).join('');
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title}</div>
    <div class="step-text" style="margin-bottom:4px">${step.question}</div>
    <div class="quiz-opts" id="quiz-opts">${opts}</div>
    <div class="quiz-feedback" id="qfb"></div>`;
}
function handleQuiz(el, correct, idx){
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((o,i)=>{ o.className='quiz-opt '+(i===idx?(correct?'correct':'wrong'):'neutral'); });
  const fb = document.getElementById('qfb');
  const step = MODULES.find(m=>m.id===_curModId).steps[_curStep];
  fb.innerHTML = correct ? step.feedbackOk : step.feedbackNo;
  fb.className = 'quiz-feedback show '+(correct?'ok':'no');
  enableContinue();
}

/* ── Classify step ── */
function renderClassifyStep(step){
  const items = step.items.map((it,i)=>
    `<div class="cl-item" id="cli${i}">
      <span style="flex:1">${esc(it.text)}</span>
      <div class="cl-btns">
        <button class="cl-btn" onclick="classifyItem(${i},'u')">${step.btnA||''}</button>
        <button class="cl-btn neg" onclick="classifyItem(${i},'n')">${step.btnB||''}</button>
      </div>
    </div>`
  ).join('');
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title}</div>
    <p class="step-text" style="margin-bottom:12px">${step.instruction}</p>
    <div class="classify-items" id="cl-items">${items}</div>
    <div class="cl-score" id="cl-score"></div>`;
}

let _classifyDone=[];
function classifyItem(idx, cat){
  const step = MODULES.find(m=>m.id===_curModId).steps[_curStep];
  const it   = step.items[idx];
  const el   = document.getElementById('cli'+idx);
  const correct = cat===it.cat;
  el.className = 'cl-item '+(correct?'done-u':'done-n');
  el.innerHTML = `<span style="flex:1">${esc(it.text)}</span><span style="font-size:13px;font-weight:700">${correct?'':''} ${it.label}</span>`;
  _classifyDone[idx]=true;
  if(_classifyDone.filter(Boolean).length >= step.items.length){
    document.getElementById('cl-score').textContent = 'Classificação concluída. Você identificou o padrão.';
    document.getElementById('cl-score').classList.add('show');
    enableContinue();
  }
}

/* ── Flipcard step ── */
function renderFlipStep(step){
  const cards = step.cards.map((c,i)=>
    `<div class="flipcard" id="fc${i}" onclick="flipCard(${i})">
      <div class="fc-front"><div class="fc-front-tag">Toque para revelar</div>${esc(c.front)}</div>
      <div class="fc-back">${c.back}</div>
    </div>`
  ).join('');
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title}</div>
    <div class="fc-hint">${step.hint}</div>
    <div class="flipcard-grid">${cards}</div>`;
}
let _flipsAll=0;
function flipCard(i){
  const fc = document.getElementById('fc'+i);
  if(fc.classList.contains('flipped')) return;
  fc.classList.add('flipped');
  _flipsAll++;
  const step = MODULES.find(m=>m.id===_curModId).steps[_curStep];
  if(_flipsAll >= step.cards.length) enableContinue();
}

/* ── Fill step ── */
function renderFillStep(step){
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title}</div>
    <p class="step-text" style="margin-bottom:12px">${step.prompt.replace(/\n/g,'<br>')}</p>
    <div class="fill-wrap">
      <textarea class="fill-area" id="fill-area" rows="6" placeholder="${step.placeholder}"
        oninput="checkFill(${step.minChars||0})"></textarea>
      <div class="fill-counter"><span id="fill-count">0</span> caracteres</div>
    </div>`;
}
function checkFill(min){
  const ta = document.getElementById('fill-area');
  const n  = (ta?.value||'').trim().length;
  document.getElementById('fill-count').textContent = n;
  if(n >= (min||10)) enableContinue();
}

/* ── Breath step ── */
function renderBreathStepHTML(step){
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title||'Respiração guiada'}</div>
    <p class="step-text" style="margin-bottom:0">${step.instruction}</p>
    <div class="breath-wrap">
      <div class="breath-ring" id="bc" onclick="startBreath()">
        <div class="breath-label" id="bp" role="status" aria-live="polite">Toque</div>
        <div class="breath-count" id="bcount"></div>
      </div>
      <div class="breath-phase" id="bphase">para começar</div>
      <div class="breath-cycles" id="bcycles"></div>
    </div>
    <div class="btn-row" style="margin-top:8px">
      <button class="btn sm ghost-mint" onclick="startBreath()">Iniciar</button>
      <button class="btn sm ghost" onclick="stopBreath()">Parar</button>
    </div>`;
}

function startBreath(){
  stopBreath();
  const mod = MODULES.find(m=>m.id===_curModId);
  const step= mod.steps[_curStep];
  const pattern = step.pattern;
  const total   = step.totalCycles;
  _breathPhase=0; _breathCount=0; _breathCycles=0;
  function tick(){
    const ph = pattern[_breathPhase%pattern.length];
    const bc=document.getElementById('bc'), bp=document.getElementById('bp'),
          bcount=document.getElementById('bcount'), bphase=document.getElementById('bphase'),
          bcyc=document.getElementById('bcycles');
    if(bc){ bc.className='breath-ring '+ph.cls; }
    if(bp) bp.textContent = ph.label;
    const rem = ph.dur - _breathCount;
    if(bcount) bcount.textContent = rem > 0 ? rem : '';
    if(bphase) bphase.textContent = ph.label;
    if(bcyc) bcyc.textContent = `Ciclo ${_breathCycles+1} de ${total}`;
    _breathCount++;
    if(_breathCount > ph.dur){
      _breathCount=0; _breathPhase++;
      if(_breathPhase % pattern.length === 0){
        _breathCycles++;
        if(_breathCycles >= total){
          stopBreath();
          if(bp)bp.textContent='';
          if(bphase)bphase.textContent='Completo. Muito bem.';
          if(bcyc)bcyc.textContent=total+' ciclos concluídos';
          enableContinue();
        }
      }
    }
  }
  tick();
  _breathTimer = setInterval(tick, 1000);
}
function stopBreath(){
  if(_breathTimer){ clearInterval(_breathTimer); _breathTimer=null; }
  const bc=document.getElementById('bc'),bp=document.getElementById('bp'),bcount=document.getElementById('bcount');
  if(bc){bc.className='breath-ring';} if(bp&&bp.textContent!=='')bp.textContent='Toque'; if(bcount)bcount.textContent='';
}

/* ── Guided step ── */
let _guidedPhase=0;
function renderGuidedStep(step){
  _guidedPhase=0;
  const phases = step.phases.map((ph,i)=>
    `<div class="guided-phase ${i===0?'active':''}" id="gph${i}">
      <div class="gp-num">${ph.num}</div>
      <div class="gp-title">${ph.title}</div>
      <div class="gp-text">${ph.text}</div>
      <button class="gp-next" onclick="nextGuided(${i},${step.phases.length})">${ph.btn}</button>
    </div>`
  ).join('');
  return `<div class="step-type-tag">${step.typeLabel}</div>
    <div class="step-title">${step.title}</div>
    <div class="guided-phases">${phases}</div>`;
}
function nextGuided(idx, total){
  document.getElementById('gph'+idx)?.classList.remove('active');
  const next = idx+1;
  if(next < total){
    document.getElementById('gph'+next)?.classList.add('active');
    document.getElementById('scr-module').scrollTop = 9999;
  }
  if(next >= total) enableContinue();
}

/* ══════════════════════════════════
   REGISTRO DE MOMENTOS (diário)
   ══════════════════════════════════ */
function renderDiary(){ renderDiaryForm(); renderDiaryHist(); }

function renderDiaryForm(){
  const di=document.getElementById('d-insight'); if(di) di.innerHTML='';
  document.getElementById('diary-form').innerHTML=
    `<div style="margin-bottom:20px">
      <label class="form-lbl" for="dw">O que aconteceu de bom?</label>
      <div class="form-hint">Pequeno também conta: um café, um raio de sol, uma mensagem.</div>
      <textarea id="dw" rows="3" maxlength="300" placeholder="Descreva o momento..." oninput="document.getElementById('dcc').textContent=this.value.length"></textarea>
      <div style="text-align:right;font-size:12px;color:var(--light);margin-top:3px"><span id="dcc">0</span>/300</div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl" for="dwhy">Por que isso foi bom? <span style="font-weight:400;text-transform:none;letter-spacing:0">(opcional)</span></label>
      <div class="form-hint">Dizer o porquê é o que mais ajuda a notar o bom de novo. Uma frase basta.</div>
      <textarea id="dwhy" rows="2" maxlength="300" placeholder="Porque…"></textarea>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">Que emoções você sentiu?</label>
      <div class="form-hint">Nomear com precisão amplia o sentir.</div>
      <div class="chips" id="d-emo">${EMOTIONS.map(e=>`<span class="chip" data-emo="${e.id}" onclick="toggleChip(this)">${e.emoji} ${e.name}</span>`).join('')}</div>
    </div>
    <details class="more-details">
    <summary>Mais detalhes (opcional)</summary>
    <div style="margin:14px 0 20px">
      <label class="form-lbl">Como você saboreou</label>
      <div class="form-hint">Saborear amplifica: mas notar já é o primeiro passo.</div>
      <div class="chips" id="d-sav">${SAVORING_CHIPS.map(c=>`<span class="chip" onclick="toggleChip(this)">${c}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:24px">
      <label class="form-lbl">Intensidade do momento</label>
      <div class="form-hint">1 = leve e sutil · 5 = intenso</div>
      <div class="slider-row"><span style="font-size:20px"></span><input type="range" id="da" min="1" max="5" value="3" step="1" oninput="document.getElementById('dav').textContent=this.value"><span style="font-size:20px"></span><span class="slider-val" id="dav">3</span></div>
    </div>
    </details>
    <button class="btn" onclick="saveDiary()" style="width:100%;margin:0 0 14px">Guardar momento</button>
    <div class="support-line" style="margin-bottom:36px"><button class="link-btn" onclick="showSupport()">Se hoje está difícil, veja caminhos de apoio</button></div>`;
}

function toggleChip(el){ el.classList.toggle('sel'); el.setAttribute('aria-pressed', el.classList.contains('sel')); }

function saveDiary(){
  const w=document.getElementById('dw')?.value.trim();
  if(!w){ toast('Descreva o momento primeiro.'); return; }
  const emotions=[...document.querySelectorAll('#d-emo .chip.sel')].map(c=>c.dataset.emo);
  const savoring=[...document.querySelectorAll('#d-sav .chip.sel')].map(c=>c.textContent);
  const intensity=parseInt(document.getElementById('da')?.value||3);
  const why=(document.getElementById('dwhy')?.value||'').trim();
  const entry={id:Date.now().toString(),ts:Date.now(),date:today(),moment:w,why:why||null,emotions,savoring,intensity};
  D.entries.unshift(entry);
  save(); checkBadges(); trackDiaryEvent(); checkPosttestTrigger(); if(isElaborated(entry)) trackAppEvent('moment_elaborated'); toast(isElaborated(entry) ? 'Momento guardado. Escrever o porquê ensina a notar o bom de novo.' : emotions.length ? 'Momento guardado. Seu jardim agradece.' : 'Momento guardado. Nomeie a emoção da próxima vez para uma planta brotar.');
  renderDiaryForm(); renderDiaryHist(); showShareOffer(entry.id);
  mostrarInsightDiario(entry, D.entries.slice(1));
  scheduleLocalReminder();
}

/* Compartilhar uma boa notícia (capitalização, Gable et al.): contar a alguém
   amplifica o efeito. Só envia o que a pessoa tocar para enviar, sem conta, sem servidor. */
function shareText(e){ return 'Uma coisa boa do meu dia: '+e.moment+(isElaborated(e)?' ('+e.why.trim()+')':''); }
async function shareMoment(id){
  const e = D.entries.find(x=>x.id===id); if(!e) return;
  const text = shareText(e);
  let done = false;
  try{
    if(navigator.share){ await navigator.share({ text }); done = true; }
    else if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(text); toast('Copiado. Cole numa conversa com quem você quer contar.'); done = true; }
    else toast('Seu navegador não permite compartilhar daqui. Copie o texto manualmente.');
  }catch(err){ /* cancelado pela pessoa: nada a fazer */ }
  if(done){
    e.shared = true; save(); trackAppEvent('moment_shared');
    const offer = document.getElementById('share-offer');
    if(offer){ offer.remove(); setTimeout(maybeShowIfThen, 400); }
    renderDiaryHist();
  }
}
function dismissShareOffer(){ const o=document.getElementById('share-offer'); if(o) o.remove(); trackAppEvent('share_offer_dismissed'); setTimeout(maybeShowIfThen, 300); }
function showShareOffer(id){
  const e = D.entries.find(x=>x.id===id); const host = document.getElementById('diary-form');
  if(!e || !host) return;
  const div = document.createElement('div');
  div.id = 'share-offer'; div.className = 'share-offer';
  div.innerHTML = `<div class="card-lbl">Quer contar a alguém?</div>
    <p class="so-text">Compartilhar uma boa notícia com uma pessoa de confiança amplia o efeito. Só vai o que você tocar para enviar.</p>
    <blockquote class="wk-quote">“${esc(e.moment.length>110?e.moment.slice(0,107)+'…':e.moment)}”</blockquote>
    <div class="wk-actions"><button class="btn mint" style="margin:0;width:auto;padding:12px 22px" onclick="shareMoment('${e.id}')">Compartilhar</button><button class="link-btn" onclick="dismissShareOffer()">Agora não</button></div>`;
  host.prepend(div);
  const sc=document.getElementById('scr-diary'); if(sc) sc.scrollTop=0;
}

/* Insights do momento que a pessoa acabou de registrar. Só usam o que ela escolheu (emoções, técnicas, intensidade),
   nunca o texto livre. Sempre como convite, no máximo dois, e dispensáveis. Ficam só no aparelho. */
function mostrarInsightDiario(novo, antes){
  const el = document.getElementById('d-insight'); if(!el) return;
  const itens = [];
  const jaSentidas = new Set(antes.flatMap(e=>e.emotions||[]));
  const novas = (novo.emotions||[]).filter(id=>!jaSentidas.has(id));
  if(novas.length && antes.length){
    const em = EMOTIONS.find(x=>x.id===novas[0]);
    if(em){
      const exp = EXPERIMENTS.find(e=>e.emotion===em.name && !expJaFeito(e.id));
      itens.push(ico(em.ico,16)+' <strong>Primeira vez que você registra '+em.name+'.</strong> Seu repertório está crescendo.'
        + (exp && !expAtivo() ? ' Existe um experimento para ela: <button type="button" class="di-link" onclick="abrirNoLab(\''+exp.id+'\')">'+exp.title+'</button>.' : ''));
    }
  }
  const sav = (novo.savoring||[]).filter(s=>s!=='Ainda não saboreei');
  if(!sav.length) itens.push('<strong>Que tal prolongar este momento?</strong> Por 30 segundos, fique com a sensação, respire devagar e note onde ela aparece no corpo.');
  else if(novo.intensity>=4 && !sav.includes('Revivi mais tarde')) itens.push('<strong>Você deu espaço a um momento forte.</strong> Voltar a ele mais tarde, em uma frase ou só lembrando, ajuda a prolongá-lo.');
  if(novo.intensity<=2 && itens.length<2) itens.push('<strong>Momentos pequenos também contam.</strong> Notar o pequeno é justamente o treino.');
  if(!itens.length){ el.innerHTML=''; return; }
  el.innerHTML = itens.slice(0,2).map(t=>`<div class="d-insight"><div class="di-tx">${t}</div><button type="button" class="di-x" aria-label="Fechar" onclick="this.closest('.d-insight').remove()">×</button></div>`).join('');
}

function renderDiaryHist(){
  const el=document.getElementById('diary-hist');
  if(!D.entries.length){ el.innerHTML=''; return; }
  const sorted=[...D.entries].sort((a,b)=>b.ts-a.ts);
  const groups={};
  sorted.forEach(e=>{ (groups[e.date]||(groups[e.date]=[])).push(e); });
  const ML=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const DL=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  el.innerHTML='<div class="sdiv">Momentos anteriores</div>'+
    Object.entries(groups).map(([date,gr])=>{
      const d=new Date(date+'T12:00');
      return `<div class="sdiv" style="text-transform:capitalize;padding-top:6px">${DL[d.getDay()]}, ${d.getDate()} de ${ML[d.getMonth()]}</div>${gr.map(buildEntry).join('')}`;
    }).join('');
}

/* ══════════════════════════════════
   LABORATÓRIO DE EXPERIMENTOS
   Ciclo: previsão → teste → observação → revisão
   ══════════════════════════════════ */
let _labPredictOpen = null; // expId com painel de previsão aberto

function renderLab(){
  _labPredictOpen = null;
  const el = document.getElementById('lab-content');
  const active = D.experiments.find(e=>e.status==='active');
  let html = `<div class="lab-intro"><strong>Como funciona:</strong> escolha um experimento, registre sua <strong>previsão</strong> (quanto prazer/emoção você acha que vai sentir), faça na vida real e depois volte para <strong>comparar</strong>. É assim que crenças são testadas, com dados, não com discussão.</div>`;

  if(active){
    const exp = EXPERIMENTS.find(x=>x.id===active.expId);
    html += `<div class="lab-card lab-active" id="lab-active-card">
      <div class="lab-active-tag">Experimento em andamento</div>
      <div class="lab-card-head">
        <div class="lab-emoji">${ico(exp.ico,22)}</div>
        <div style="flex:1">
          <div class="lab-title">${exp.title}</div>
          <div class="lab-meta"><span class="exp-tag">${exp.emotion}</span> · ${exp.time} · iniciado ${new Date(active.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
        </div>
      </div>
      <div class="lab-desc">${exp.desc}</div>
      <div class="lab-belief">Testa a crença: <strong>${exp.belief}</strong></div>
      <div class="predict-panel">
        <div class="predict-lbl">Sua previsão foi: ${active.predicted}/5 ${active.predictNote?'— "'+esc(active.predictNote)+'"':''}</div>
        <div class="predict-lbl" style="margin-top:12px">Já fez? Quanto você REALMENTE sentiu?</div>
        <div class="slider-row"><span style="font-size:18px"></span><input type="range" id="exp-actual" min="1" max="5" value="3" step="1" oninput="document.getElementById('exp-actual-v').textContent=this.value"><span style="font-size:18px"></span><span class="slider-val" id="exp-actual-v">3</span></div>
        <div class="predict-lbl" style="margin-top:10px">O que você notou? (o que aconteceu de verdade)</div>
        <textarea id="exp-noticed" placeholder="O que aconteceu, o que sentiu, o que te surpreendeu..."></textarea>
        <div class="lab-actions">
          <button class="lab-btn" onclick="completeExperiment()">Concluir experimento ✓</button>
          <button class="lab-btn ghost" onclick="cancelExperiment()">Desistir desta vez</button>
        </div>
      </div>
    </div>`;
  }

  const sug = expSugeridos();
  const lista = EXPERIMENTS.filter(e=>!(active && e.id===active.expId));
  const grupoSug = lista.filter(e=>sug.includes(e.id)), resto = lista.filter(e=>!sug.includes(e.id));
  if(grupoSug.length){
    html += `<div class="sdiv">Sugeridos pelos seus canteiros</div>`;
    grupoSug.forEach(exp=>{ html += cartaoExp(exp, active, true); });
  }
  html += `<div class="sdiv">${active?'Outros experimentos':grupoSug.length?'Mais experimentos':'Escolha um experimento'}</div>`;
  resto.forEach(exp=>{ html += cartaoExp(exp, active, false); });

  el.innerHTML = html;
}

function cartaoExp(exp, active, sugerido){
  const doneRuns = D.experiments.filter(e=>e.expId===exp.id && e.status==='done').length;
  const mod = moduloDoExp(exp.id);
  const modLinha = mod ? `<div class="lab-mod">Do canteiro: ${isUnlocked(mod)
      ? `<button type="button" class="lab-link" onclick="openModule('${mod.id}')">${mod.title}</button>`
      : `<span>${mod.title}</span> <small>(abre ao concluir o anterior)</small>`}</div>` : '';
  return `<div class="lab-card ${doneRuns?'done-before':''}" id="lab-${exp.id}">
      ${sugerido?'<div class="sug-tag">Sugerido pelo seu caminho</div>':''}
      <div class="lab-card-head">
        <div class="lab-emoji">${ico(exp.ico,22)}</div>
        <div style="flex:1">
          <div class="lab-title">${exp.title}</div>
          <div class="lab-meta"><span class="exp-tag">${exp.emotion}</span> · ${exp.time}</div>
        </div>
      </div>
      <div class="lab-desc">${exp.desc}</div>
      <div class="lab-belief">Testa a crença: <strong>${exp.belief}</strong></div>
      ${modLinha}
      ${doneRuns?`<span class="lab-done-tag">✓ Feito ${doneRuns}×</span>`:''}
      <div id="lab-panel-${exp.id}"></div>
      <div class="lab-actions" id="lab-btnrow-${exp.id}">
        <button class="lab-btn" ${active?'disabled':''} onclick="openPredict('${exp.id}')">${active?'Conclua o experimento ativo':'Iniciar experimento'}</button>
      </div>
    </div>`;
}

function openPredict(expId){
  // fecha painel anterior
  if(_labPredictOpen && _labPredictOpen!==expId){
    const prev=document.getElementById('lab-panel-'+_labPredictOpen);
    if(prev) prev.innerHTML='';
    const prevBtn=document.getElementById('lab-btnrow-'+_labPredictOpen);
    if(prevBtn) prevBtn.style.display='';
  }
  _labPredictOpen = expId;
  const panel=document.getElementById('lab-panel-'+expId);
  const btnrow=document.getElementById('lab-btnrow-'+expId);
  if(btnrow) btnrow.style.display='none';
  panel.innerHTML = `<div class="predict-panel">
    <div class="predict-lbl">Antes de fazer: quanto prazer/emoção você PREVÊ sentir?</div>
    <div class="slider-row"><span style="font-size:18px"></span><input type="range" id="exp-pred-${expId}" min="1" max="5" value="2" step="1" oninput="document.getElementById('exp-pred-v-${expId}').textContent=this.value"><span style="font-size:18px"></span><span class="slider-val" id="exp-pred-v-${expId}">2</span></div>
    <div class="predict-lbl" style="margin-top:10px">O que você acha que vai acontecer? (opcional)</div>
    <textarea id="exp-note-${expId}" placeholder="Ex.: vou me sentir boba, não vai dar em nada, a pessoa vai estranhar..."></textarea>
    <div class="lab-actions">
      <button class="lab-btn" onclick="startExperiment('${expId}')">Ativar experimento </button>
      <button class="lab-btn ghost" onclick="renderLab()">Cancelar</button>
    </div>
  </div>`;
  panel.scrollIntoView({behavior:'smooth',block:'center'});
}

function startExperiment(expId){
  const predicted = parseInt(document.getElementById('exp-pred-'+expId)?.value||2);
  const note = (document.getElementById('exp-note-'+expId)?.value||'').trim();
  D.experiments.push({
    id: Date.now().toString(), expId, ts: Date.now(), date: today(),
    predicted, predictNote: note, status:'active',
    actual: null, noticed: null, tsDone: null,
  });
  save();
  trackLabEvent(expId,'start');
  toast('Experimento ativado. Agora é viver, depois volte para comparar.');
  renderLab();
}

function completeExperiment(){
  const run = D.experiments.find(e=>e.status==='active');
  if(!run) return;
  const actual = parseInt(document.getElementById('exp-actual')?.value||3);
  const noticed = (document.getElementById('exp-noticed')?.value||'').trim();
  run.status='done';
  run.actual=actual;
  run.noticed=noticed;
  run.tsDone=Date.now();
  save();
  awardXP(25,'Experimento concluído');
  checkBadges();
  trackLabEvent(run.expId,'complete');

  const exp = EXPERIMENTS.find(x=>x.id===run.expId);
  const delta = actual - run.predicted;
  let insight;
  if(delta > 0) insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. A mente subestimou o que faz bem, os estudos mostram que isso é a regra, não a exceção. O que mais ela pode estar subestimando?`;
  else if(delta === 0) insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. Previsão precisa. O valor está no dado: agora você sabe por experiência, não por suposição.`;
  else insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. Nem todo experimento floresce, e isso também é dado. Contexto, dia e cansaço contam. Vale repetir em outro momento antes de concluir.`;

  // comparação com o que a própria pessoa já fez (convite, nunca interpretação sobre ela)
  let comparacao = '';
  const antes = D.experiments.filter(e=>e.expId===run.expId && e.status==='done' && e.id!==run.id).sort((x,y)=>y.tsDone-x.tsDone);
  if(antes.length) comparacao += `<br><br><strong>Da última vez</strong> neste experimento, você previu ${antes[0].predicted}/5 e sentiu ${antes[0].actual}/5.`;
  const feitos = D.experiments.filter(e=>e.status==='done');
  if(feitos.length >= 5){
    const dif = feitos.reduce((s,e)=>s+(e.actual-e.predicted),0)/feitos.length;
    if(dif >= 0.5) comparacao += `<br><br><strong>Parece que</strong>, nos seus ${feitos.length} experimentos, o que você sentiu costuma ficar acima do que previu (em média ${dif.toFixed(1).replace('.',',')} ponto${dif>=1.5?'s':''}). Pode valer lembrar disso na próxima previsão.`;
  }
  const modExp = moduloDoExp(run.expId);
  document.getElementById('modal-title').textContent = 'Revisão do experimento';
  document.getElementById('modal-body').innerHTML =
    `<div class="predict-vs" style="margin:0 0 10px">
      <div style="text-align:center"><div style="font-size:12px;color:var(--muted)">Previsto</div><div class="pv-num" style="color:var(--muted)">${run.predicted}</div></div>
      <div style="font-size:20px">→</div>
      <div style="text-align:center"><div style="font-size:12px;color:var(--muted)">Sentido</div><div class="pv-num" style="color:${delta>=0?'var(--mint-d)':'var(--coral-d)'}">${actual}</div></div>
    </div>
    ${insight}${comparacao}<br><br><span style="font-size:12px;color:var(--light)">${exp?('Crença testada: '+exp.belief):''}</span>`;
  document.getElementById('modal-actions').innerHTML =
    '<button class="btn mint" onclick="closeModal();renderLab()">Continuar </button>'
    + `<button class="btn ghost" onclick="registrarDoExperimento('${run.id}')">Registrar no diário</button>`
    + (modExp && isUnlocked(modExp) ? `<button class="btn ghost" onclick="closeModal();openModule('${modExp.id}')">Rever o canteiro desta prática</button>` : '');
  document.getElementById('modal-ov').classList.add('on');
  renderLab();
}

function registrarDoExperimento(runId){   // leva o que a pessoa notou para o diário, já com a emoção marcada
  const run = D.experiments.find(e=>e.id===runId); if(!run) return;
  const exp = EXPERIMENTS.find(x=>x.id===run.expId) || {};
  closeModal(); goTo('diary');
  setTimeout(()=>{
    const t = document.getElementById('dw');
    if(t && run.noticed){ t.value = run.noticed.slice(0,300); const c=document.getElementById('dcc'); if(c) c.textContent = t.value.length; }
    const em = EMOTIONS.find(x=>x.name===exp.emotion);
    if(em){ const chip=document.querySelector('#d-emo .chip[data-emo="'+em.id+'"]'); if(chip) chip.classList.add('sel'); }
    if(t) t.focus();
  },80);
}

function cancelExperiment(){
  const idx = D.experiments.findIndex(e=>e.status==='active');
  if(idx<0) return;
  D.experiments.splice(idx,1);
  save();
  toast('Sem problema: o experimento fica para outro momento. ');
  renderLab();
}

/* ══════════════════════════════════
   DOSE CULTIVADA: prática ativa semanal
   Mede o que a pessoa PRATICOU (dose cultivada),
   distinto do Registro de Momentos (estado).
   ══════════════════════════════════ */
let _doseAberta = false;
function abrirDose(){ _doseAberta = true; renderDoseCard(); const t=document.getElementById('dose-text'); if(t) t.focus(); }
function recolherDose(){ _doseAberta = false; renderDoseCard(); }
function renderDoseCard(){
  const el = document.getElementById('h-dose');
  if(!el) return;
  const ws = weekStart();
  const answered = D.doseRecords.some(r=>r.weekStart===ws);
  const skipped  = D.doseSkipWeek === ws;
  if(answered || skipped || !D.pretest){ el.innerHTML=''; return; }
  if(!_doseAberta){   // fechado por padrão: uma linha só, para não dominar a tela
    el.innerHTML = `<div class="card dose-compacta"><div class="dose-linha">
      <div><div class="card-lbl">Dose da semana</div><div class="dose-sub">O que você cultivou nesta semana?</div></div>
      <button type="button" class="dose-btn" aria-expanded="false" onclick="abrirDose()">Responder</button>
    </div></div>`;
    return;
  }
  el.innerHTML = `<div class="card" style="border:1.5px solid var(--mint-l)">
    <div class="card-lbl">Dose da semana</div>
    <div style="font-size:14px;line-height:1.6;margin-bottom:10px">Essa semana, o que você <strong>cultivou</strong>? Cultivar é todo pequeno passo: notar, saborear, agradecer, testar uma crença...</div>
    <div class="chips" id="dose-tags" style="margin-bottom:10px">${DOSE_TAGS.map(t=>`<span class="chip" onclick="toggleChip(this)">${t}</span>`).join('')}</div>
    <textarea id="dose-text" rows="2" maxlength="400" placeholder="Escreva aqui..." style="width:100%"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn mint" style="flex:1;margin:0" onclick="saveDose()">Guardar</button>
      <button class="btn ghost" style="width:auto;margin:0;padding:0 16px" onclick="skipDose()">Agora não</button>
    </div>
    <button type="button" class="link-btn" style="margin-top:6px" onclick="recolherDose()">Recolher</button>
  </div>`;
}
function saveDose(){
  const text=(document.getElementById('dose-text')?.value||'').trim();
  const tags=[...document.querySelectorAll('#dose-tags .chip.sel')].map(c=>c.textContent);
  if(!text && !tags.length){ toast('Escolha uma tag ou escreva um pouquinho. '); return; }
  D.doseRecords.push({ ts:Date.now(), date:today(), weekStart:weekStart(), tags, text });
  save();
  awardXP(15,'Dose da semana cultivada');
  trackAppEvent('dose_saved');
  _doseAberta = false;
  renderDoseCard();
}
function skipDose(){
  D.doseSkipWeek = weekStart(); save();
  trackAppEvent('dose_skipped');
  renderDoseCard();
}

/* ══════════════════════════════════
   PROGRESS
   ══════════════════════════════════ */
/* ══════════════════════════════════
   PADRÕES PROVISÓRIOS (tela Progresso)
   Pistas ao longo do tempo a partir do que a pessoa ESCOLHEU: horário do registro, emoções, técnicas de saborear e
   intensidade. Nunca leem o texto livre. Mínimo de 5 registros, tom de convite ("parece que…"), cada um dispensável
   (D.padroesOff). Ficam só no aparelho e não entram na sincronização da pesquisa.
   ══════════════════════════════════ */
// Limites dos padrões. Mais baixo = aparece mais cedo, mas com mais chance de ser acaso.
// Padrões DESCRITIVOS (só contam fatos: quando registra, que emoções faltam, que técnica usa) têm limites soltos.
// Padrões que COMPARAM intensidade (período do dia; fim de semana x dias úteis) precisam, além disso, de uma diferença grande
// frente à variação dos próprios registros (teste t de Welch), porque comparar médias de poucos registros numa escala de 1 a 5
// inventa "padrões" do acaso com muita facilidade (ver ARQUITETURA.md).
const PADROES_MIN = 4;   // registros no total para começar a mostrar padrões
const PADROES_LIM = {
  horaFreqMin: 3,    // descritivo: registros no mesmo período do dia para dizer "você costuma registrar…" (e pelo menos metade do total)
  horaFreqPct: 0.5,
  tecnicaMin: 2,     // descritivo: usos de uma técnica de saborear para destacá-la
  grupoMin: 3,       // comparativo: registros em cada grupo comparado
  horaDif: 0.8,      // comparativo: diferença mínima de intensidade média entre períodos...
  semanaDif: 0.8,    // ...e entre fim de semana e dias úteis
  tHoraInt: 3,       // comparativo: |t| mínimo entre períodos (alto, porque se escolhe o par mais extremo)
  tSemana: 2.5       // comparativo: |t| mínimo entre fim de semana e dias úteis
};
function tWelch(a, b){   // |t| da diferença entre duas médias; Infinity se os dois grupos não variam nada e as médias diferem
  const m = x => x.reduce((s,v)=>s+v,0)/x.length;
  const v = (x,mx) => x.reduce((s,y)=>s+(y-mx)*(y-mx),0)/(x.length-1);
  const ma = m(a), mb = m(b), den = Math.sqrt(v(a,ma)/a.length + v(b,mb)/b.length);
  return den === 0 ? (ma === mb ? 0 : Infinity) : Math.abs(ma-mb)/den;
}
const NOME_PERIODO = { madrugada:'de madrugada', manhã:'de manhã', tarde:'à tarde', noite:'à noite' };
function periodoDoDia(h){ return h<5?'madrugada':h<12?'manhã':h<18?'tarde':'noite'; }
function calcularPadroes(){
  const E = D.entries, out = [];
  if(E.length < PADROES_MIN) return out;
  const media = a => a.reduce((s,x)=>s+x,0)/a.length;
  const f1 = n => n.toFixed(1).replace('.',',');

  // 1. em que período do dia a pessoa mais registra, e em qual a intensidade é maior
  const porPeriodo = {};
  E.forEach(e=>{ const p = periodoDoDia(new Date(e.ts).getHours()); (porPeriodo[p] = porPeriodo[p] || []).push(e); });
  const ord = Object.entries(porPeriodo).sort((x,y)=>y[1].length-x[1].length);
  if(ord[0][1].length >= PADROES_LIM.horaFreqMin && ord[0][1].length/E.length >= PADROES_LIM.horaFreqPct){
    out.push({ id:'hora-freq', ic:'sun', t:'Quando você costuma registrar',
      b:`Parece que ${ord[0][1].length} dos seus ${E.length} momentos foram registrados <strong>${NOME_PERIODO[ord[0][0]]}</strong>. Pode ser um bom horário para uma pausa de notar o que foi bom.` });
  }
  const fortes = Object.entries(porPeriodo).filter(([,l])=>l.length>=PADROES_LIM.grupoMin).map(([p,l])=>({ p, m:media(l.map(e=>e.intensity||3)), v:l.map(e=>e.intensity||3) })).sort((x,y)=>y.m-x.m);
  if(fortes.length>=2 && fortes[0].m - fortes[fortes.length-1].m >= PADROES_LIM.horaDif && tWelch(fortes[0].v, fortes[fortes.length-1].v) >= PADROES_LIM.tHoraInt){
    const alto = fortes[0], baixo = fortes[fortes.length-1];
    out.push({ id:'hora-int', ic:'zap', t:'Quando os momentos são mais intensos',
      b:`Pelo horário dos registros, a intensidade costuma ser maior <strong>${NOME_PERIODO[alto.p]}</strong> (média ${f1(alto.m)}) do que <strong>${NOME_PERIODO[baixo.p]}</strong> (${f1(baixo.m)}). É só uma pista: o horário do registro nem sempre é o do momento.` });
  }

  // 2. fim de semana × dias úteis
  const fds = E.filter(e=>[0,6].includes(new Date(e.date+'T12:00').getDay())), util = E.filter(e=>![0,6].includes(new Date(e.date+'T12:00').getDay()));
  if(fds.length>=PADROES_LIM.grupoMin && util.length>=PADROES_LIM.grupoMin){
    const mf = media(fds.map(e=>e.intensity||3)), mu = media(util.map(e=>e.intensity||3));
    if(Math.abs(mf-mu) >= PADROES_LIM.semanaDif && tWelch(fds.map(e=>e.intensity||3), util.map(e=>e.intensity||3)) >= PADROES_LIM.tSemana){
      out.push({ id:'semana', ic:'calendar', t:'Fim de semana e dias úteis',
        b: mf>mu
          ? `Seus momentos de fim de semana têm intensidade média <strong>${f1(mf)}</strong>, contra <strong>${f1(mu)}</strong> nos dias úteis. Pode valer plantar um momento pequeno no meio da semana: um café saboreado, um minuto de céu.`
          : `Seus momentos dos dias úteis têm intensidade média <strong>${f1(mu)}</strong>, contra <strong>${f1(mf)}</strong> no fim de semana. Fins de semana não precisam ser grandiosos: um momento pequeno já conta.` });
    }
  }

  // 3. emoções que ainda não apareceram, com o experimento de cada uma
  const sentidas = new Set(E.flatMap(e=>e.emotions||[]));
  const faltam = EMOTIONS.filter(x=>!sentidas.has(x.id));
  if(faltam.length && faltam.length < EMOTIONS.length){
    const sug = faltam.map(em=>({ em, exp: EXPERIMENTS.find(x=>x.emotion===em.name && !expJaFeito(x.id)) })).filter(x=>x.exp).slice(0,2);
    out.push({ id:'faltam', ic:'compass', t:'Emoções que ainda não apareceram',
      b:`No seu repertório ainda não apareceu: ${faltam.slice(0,3).map(x=>x.name).join(', ')}${faltam.length>3?' e mais '+(faltam.length-3):''}.`
        + (sug.length && !expAtivo() ? ' Experimentos para começar a notá-las: ' + sug.map(x=>`<button type="button" class="di-link" onclick="abrirNoLab('${x.exp.id}')">${x.exp.title}</button>`).join(' · ') + '.' : '') });
  }

  // 4. técnicas de saborear mais usadas e ainda não tentadas
  const usos = {};
  E.forEach(e=>(e.savoring||[]).filter(s=>s!=='Ainda não saboreei').forEach(s=>{ usos[s]=(usos[s]||0)+1; }));
  const top = Object.entries(usos).sort((x,y)=>y[1]-x[1])[0];
  const naoTentadas = SAVORING_CHIPS.filter(s=>s!=='Ainda não saboreei' && !usos[s]);
  if(top && top[1]>=PADROES_LIM.tecnicaMin && naoTentadas.length){
    out.push({ id:'tecnica', ic:'coffee', t:'Seu jeito de saborear',
      b:`Você mais usa <strong>“${top[0]}”</strong> (${top[1]} vezes). Ainda não tentou: ${naoTentadas.slice(0,2).map(s=>'“'+s+'”').join(' e ')}. Pode valer experimentar uma delas no próximo momento.` });
  }
  return out;
}
function htmlPadroes(){
  const todos = calcularPadroes(), off = D.padroesOff || {};
  if(!todos.length){
    if(D.entries.length>0 && D.entries.length<PADROES_MIN)
      return `<div class="insight-c pad"><div class="insight-t">Padrões</div><div class="insight-b">Com ${PADROES_MIN} momentos registrados, começo a mostrar pistas sobre horários, emoções e jeitos de saborear. Faltam ${PADROES_MIN-D.entries.length}.</div></div>`;
    return '';
  }
  const vis = todos.filter(p=>!off[p.id]), ocultos = todos.length - vis.length;
  if(!vis.length && !ocultos) return '';
  return `<div class="sdiv">Padrões provisórios</div>
    <p class="pad-aviso">Com ${D.entries.length} registros. São pistas, não conclusões: mudam conforme você registra mais.</p>`
    + vis.map(p=>`<div class="insight-c pad"><div class="insight-t">${ico(p.ic,16)} ${p.t}</div><div class="insight-b">${p.b}</div><button type="button" class="pad-x" onclick="dispensarPadrao('${p.id}')">Não quero ver este</button></div>`).join('')
    + (ocultos ? `<button type="button" class="pad-restaurar" onclick="restaurarPadroes()">Mostrar ${ocultos===1?'o que escondi':'os '+ocultos+' que escondi'}</button>` : '');
}
function dispensarPadrao(id){ D.padroesOff = D.padroesOff || {}; D.padroesOff[id] = true; save(); renderProgress(); }
function restaurarPadroes(){ D.padroesOff = {}; save(); renderProgress(); }

function renderProgress(){
  const el=document.getElementById('progress-content');
  const doneMods=MODULES.filter(m=>D.moduleProgress[m.id]?.done);
  const days=calcTotalDays();
  const felt = new Set(D.entries.flatMap(e=>e.emotions||[]));
  const repHTML = `<div class="repertoire">${EMOTIONS.map(e=>
    `<span class="rep-item ${felt.has(e.id)?'felt':''}">${felt.has(e.id)?'<span class="sr-only">sentida: </span>':''}${e.name}</span>`).join('')}</div>`;
  const marks = [7,30,100].map(n=>`<li class="${days>=n?'on':''}">${n} dias de cultivo${days>=n?'<span> · alcançado</span>':''}</li>`).join('');

  const insights=[];
  if(D.entries.length){
    const emoC={};
    D.entries.flatMap(e=>e.emotions||[]).forEach(id=>{emoC[id]=(emoC[id]||0)+1;});
    const top=Object.entries(emoC).sort((a,b)=>b[1]-a[1])[0];
    if(top){
      const em=EMOTIONS.find(x=>x.id===top[0]);
      if(em) insights.push({c:'',t:'Sua emoção-assinatura',b:`<strong>${em.name}</strong> é a emoção que você mais registra (${top[1]}×). ${felt.size<10?'Ainda há '+(10-felt.size)+' emoções para descobrir no seu jardim.':'Você já visitou todas as dez emoções.'}`});
    }
    const savored=D.entries.filter(e=>(e.savoring||[]).some(s=>s!=='Ainda não saboreei')).length;
    const pctS=Math.round(savored/D.entries.length*100);
    insights.push({c:'l',t:'Taxa de saboreio',b:`Em <strong>${pctS}% dos momentos</strong> você fez algo para amplificar a experiência. Saborear é o multiplicador do notar.`});
  }
  const expDone = D.experiments.filter(e=>e.status==='done');
  if(expDone.length){
    const avgPred=(expDone.reduce((a,e)=>a+e.predicted,0)/expDone.length).toFixed(1);
    const avgAct =(expDone.reduce((a,e)=>a+e.actual,0)/expDone.length).toFixed(1);
    const under = parseFloat(avgAct) > parseFloat(avgPred);
    insights.push({c:'s',t:'Laboratório',b:`<strong>${expDone.length} experimento${expDone.length>1?'s':''}</strong> concluído${expDone.length>1?'s':''}. Média prevista: <strong>${avgPred}/5</strong> · média sentida: <strong>${avgAct}/5</strong>. ${under?'A realidade costuma ser melhor do que a previsão.':'Observar a diferença entre prever e viver é o que ensina.'}`});
  }
  const doseStart = D.consentDate ? weekStart(D.consentDate.slice(0,10)) : (D.doseRecords[0]?.weekStart || null);
  if(doseStart){
    const totalWeeks = Math.max(1, Math.floor((new Date(weekStart()+'T12:00') - new Date(doseStart+'T12:00'))/(7*864e5)) + 1);
    const practicedWeeks = new Set(D.doseRecords.map(r=>r.weekStart)).size;
    insights.push({c:'l',t:'Dose cultivada',b:`Semanas com prática registrada: <strong>${practicedWeeks} de ${totalWeeks}</strong> desde o início. A dose que importa é a praticada, não a recebida.`});
  }
  insights.push({c:'s',t:'Canteiros cultivados',b:`<strong>${doneMods.length} de ${MODULES.length}</strong> módulos concluídos.`});

  const thisWs = weekStart();
  const stNow = weekStats(thisWs, '9999-12-31');
  const stPrev = weekStats(weekStart(prevDay(7)), thisWs);
  const weekHTML = (stNow.n||stPrev.n) ? `<div class="card week-card"><div class="card-lbl">Suas semanas</div>
      ${stNow.n?`<p class="wk-text">${weekSummaryText(stNow, D.weeklyGoal||2, 'Esta semana, até agora')}</p>`:''}
      ${stPrev.n?`<p class="wk-text">${weekSummaryText(stPrev, D.weeklyGoal||2, 'Na semana passada')}</p>`:''}
      ${identityLine()?`<p class="wk-id">${esc(identityLine())}</p>`:''}</div>` : '';
  el.innerHTML=
    `<div class="card garden-card">
      <div class="card-lbl">Seu jardim</div>
      ${gardenHTML()}
      <div class="g-meta"><span>${days} ${days===1?'dia':'dias'} de cultivo. Pausas fazem parte e nada murcha.</span></div>
      <ul class="milestones">${marks}</ul>
    </div>
    ${weekHTML}
    <div class="card">
      <div class="card-lbl">Momentos positivos (7 dias)</div>
      <svg class="chart-svg" id="p-chart" viewBox="0 0 320 72" role="img" aria-label="Gráfico de momentos positivos nos últimos sete dias"></svg>
      <div id="p-chart-e" style="display:none;font-size:13px;color:var(--muted);text-align:center;padding:10px 0">Sem dados suficientes.</div>
    </div>
    <div class="card">
      <div class="card-lbl">Repertório de emoções (${felt.size}/10)</div>
      ${repHTML}
    </div>
    ${insights.map(i=>`<div class="insight-c ${i.c}"><div class="insight-t">${i.t}</div><div class="insight-b">${i.b}</div></div>`).join('')}
    ${htmlPadroes()}
    <div class="sdiv">Exportar</div>
    <button class="btn ghost-mint" onclick="exportHTML()">Baixar relatório (HTML)</button>
    <button class="btn ghost" onclick="exportJSON()" style="margin-top:0">Exportar dados (JSON)</button>
    ${BRAND_FOOTER_HTML}`;

  renderMiniChart('p-chart','p-chart-e');
  // Leitura dos momentos e experimentos (componente compartilhado com o painel)
  const pr=document.getElementById('p-registros');
  if(pr && window.FlorescaPainel) pr.appendChild(FlorescaPainel.render(D,{textos:true}));
}

/* ══════════════════════════════════
   ASSESS (SPANE avulso)
   ══════════════════════════════════ */
let _asA=[],_asQ=0;

function renderAssess(){ _asA=[];_asQ=0; if(D.assessment)renderAssessResult(); else renderAssessQ(); }
function renderAssessQ(){
  const pct=Math.round(_asQ/SPANE_ITEMS.length*100);
  document.getElementById('assess-wrap').innerHTML=
    `<div class="qa-wrap">
      <div class="card-lbl" style="margin-bottom:8px">Nas últimas 4 semanas, com que frequência você se sentiu...</div>
      <div class="qa-prog"><div class="qa-bar" style="width:${pct}%"></div></div>
      <div class="qa-q">${SPANE_ITEMS[_asQ].t}</div>
      <div class="qa-opts">${SPANE_LABELS.map((o,i)=>`<button class="qa-opt" onclick="asAnswer(${i+1})">${o}</button>`).join('')}</div>
      <div class="qa-hint" style="font-size:12px;color:var(--light);text-align:center;margin-top:16px">Pergunta ${_asQ+1} de ${SPANE_ITEMS.length} · Sem respostas certas ou erradas</div>
    </div>`;
}
function asAnswer(v){ _asA.push(v);_asQ++; if(_asQ<SPANE_ITEMS.length)renderAssessQ(); else asFinish(); }
function asFinish(){
  const s=calcSpane(_asA);
  D.assessment={p:s.p,n:s.n,b:s.b,date:today(),answers:[..._asA]};
  save(); renderAssessResult();
}
function renderAssessResult(){
  const a=D.assessment;
  const lvl=spaneLevel(a.b);
  const info=SPANE_LEVEL_INFO[lvl];
  const needSupport = a.n>=24 || a.b<=-10;
  const d=new Date(a.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  const bar=(v,min,max,col)=>{
    const p=Math.round((v-min)/(max-min)*100);
    return `<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span style="color:var(--muted)"></span></div>
      <div class="xp-bar-bg"><div class="xp-bar" style="width:${p}%;background:${col}"></div></div></div>`;
  };
  document.getElementById('assess-wrap').innerHTML=
    `<div style="padding:0 16px 24px">
      <div class="result-hero ${lvl==='seco'?'hi':lvl==='fragil'?'mid':'low'}"><h2 class="result-title"><span class="result-ico">${ico(info.icon,28)}</span>${info.title}</h2><p>${info.msg}</p></div>
      ${needSupport ? supportCardHTML() : ''}
      <div class="card">
        <div class="card-lbl">Suas pontuações (SPANE)</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:2px">Emoções positivas: <strong style="color:var(--mint-d)">${a.p}</strong> / 30</div>
        ${bar(a.p,6,30,'var(--mint)')}
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:2px">Emoções negativas: <strong style="color:var(--coral-d)">${a.n}</strong> / 30</div>
        ${bar(a.n,6,30,'var(--coral)')}
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-top:8px">Saldo emocional (P − N): <strong>${a.b>0?'+':''}${a.b}</strong> (varia de −24 a +24)</div>
      </div>
      <div style="font-size:12px;color:var(--light);text-align:center;margin-bottom:16px">Avaliado em ${d} · SPANE (Diener et al., 2009) · Não é um diagnóstico clínico</div>
      ${(()=>{ const dd=Math.floor((new Date(today()+'T12:00')-new Date(a.date+'T12:00'))/864e5); return dd<28 ? `<div style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:12px;line-height:1.55">Medir com muita frequência pode virar um hábito de se vigiar. A próxima avaliação sugerida é em <strong>${28-dd} dia${28-dd>1?'s':''}</strong>.</div>` : ''; })()}
      <button class="btn ghost" onclick="D.assessment=null;save();renderAssess()">${Math.floor((new Date(today()+'T12:00')-new Date(a.date+'T12:00'))/864e5)<28?'Refazer mesmo assim':'Refazer avaliação'}</button>
      <button class="btn mint" onclick="goTo('modules')" style="margin-top:0">Ver módulos</button>
    </div>`;
}

/* ══════════════════════════════════
   EXPORT
   ══════════════════════════════════ */
function exportJSON(){
  if(!D.entries.length && !D.experiments.length){toast('Sem dados para exportar.');return;}
  dl('floresca-dados-'+today()+'.json',JSON.stringify({
    exportedAt:new Date().toISOString(),
    app:'Floresça: Cultivando Emoções Positivas',
    xp:D.xp,badges:D.badges,
    modulesCompleted:MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title),
    assessment:D.assessment,pretest:D.pretest,posttest:D.posttest,
    entries:D.entries,experiments:D.experiments,doseRecords:D.doseRecords,moduleFeedback:D.moduleFeedback,
  },null,2),'application/json');
  toast('Dados exportados.');
}

function exportHTML(){
  if(!D.entries.length){toast('Registre pelo menos um momento primeiro.');return;}
  const sorted=[...D.entries].sort((a,b)=>a.ts-b.ts);
  const days=Math.max(1,Math.round((Date.now()-sorted[0].ts)/864e5)+1);
  const savored=D.entries.filter(e=>(e.savoring||[]).some(s=>s!=='Ainda não saboreei')).length;
  const pctS=Math.round(savored/D.entries.length*100);
  const avg=(D.entries.reduce((a,e)=>a+e.intensity,0)/D.entries.length).toFixed(1);
  const lv=getLevel(D.xp);
  const doneMods=MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title);
  const felt = new Set(D.entries.flatMap(e=>e.emotions||[]));
  const expDone=D.experiments.filter(e=>e.status==='done');
  const emoName=id=>{const em=EMOTIONS.find(x=>x.id===id);return em?em.name:id;};
  const rows=[...D.entries].sort((a,b)=>b.ts-a.ts).map(e=>{
    const dt=new Date(e.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    return `<tr><td>${dt}</td><td>${esc(e.moment||'?')}</td><td>${(e.emotions||[]).map(emoName).join(', ')||'—'}</td><td>${(e.savoring||[]).join(', ')||'—'}</td><td>${'★'.repeat(e.intensity||3)}</td></tr>`;
  }).join('');
  const expRows=expDone.sort((a,b)=>b.tsDone-a.tsDone).map(r=>{
    const exp=EXPERIMENTS.find(x=>x.id===r.expId)||{};
    return `<tr><td>${new Date(r.tsDone).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</td><td>${exp.emoji||''} ${exp.title||r.expId}</td><td>${r.predicted}/5</td><td>${r.actual}/5</td><td>${esc(r.noticed||'—')}</td></tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório: Floresça</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Poppins',sans-serif;background:#F7F3EF;color:#3F434B}
.hero{background:linear-gradient(140deg,#5E7D73,#2B4A42);padding:40px 32px 32px;color:white}.hero h1{font-size:26px;font-weight:600;margin-bottom:6px}.hero p{font-size:13px;opacity:.82}
.body{max-width:760px;margin:0 auto;padding:28px 24px 48px}h2{font-size:17px;font-weight:600;margin:24px 0 12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:4px}
.stat{background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.05)}.stat-n{font-size:28px;font-weight:600;color:#5E7D73;line-height:1}.stat-l{font-size:12px;color:#6B7280;margin-top:5px}
.ins{background:white;border-left:4px solid #5E7D73;border-radius:10px;padding:14px 16px;margin-bottom:10px}.ins-b{font-size:14px;line-height:1.65;color:#6B7280}.ins-b strong{color:#3D5A52}
.pill{display:inline-block;background:#F0F6F3;color:#3D5A52;font-size:12px;padding:4px 10px;border-radius:20px;margin:3px;font-weight:700}
table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);font-size:13px}th{background:#5E7D73;color:white;padding:10px 12px;text-align:left;font-weight:700;font-size:12px}td{padding:10px 12px;border-bottom:1px solid #F0EDE5;vertical-align:top;line-height:1.4}tr:last-child td{border-bottom:none}tr:nth-child(even)td{background:#FAFAF7}
.ft{margin-top:32px;padding-top:20px;border-top:1px solid #E0DDD5;font-size:12px;color:#6B6F78;text-align:center;line-height:1.7}
@media print{body{background:white}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="hero">
  <div style="font-size:12px;opacity:.75;font-weight:600;margin-bottom:2px">Psicoterapia e Afins · psicoterapiaeafins.com.br</div>
  <h1>Floresça: Cultivando Emoções Positivas</h1>
  <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})} · ${D.entries.length} momentos registrados</p>
</div>
<div class="body"><h2>Resumo</h2>
<div class="stats">
  <div class="stat"><div class="stat-n">${D.entries.length}</div><div class="stat-l">momentos registrados</div></div>
  <div class="stat"><div class="stat-n">${days}d</div><div class="stat-l">período de uso</div></div>
  <div class="stat"><div class="stat-n">${pctS}%</div><div class="stat-l">momentos saboreados</div></div>
  <div class="stat"><div class="stat-n">${avg}</div><div class="stat-l">intensidade média (1-5)</div></div>
  <div class="stat"><div class="stat-n">${felt.size}/10</div><div class="stat-l">repertório de emoções</div></div>
  <div class="stat"><div class="stat-n">${expDone.length}</div><div class="stat-l">experimentos concluídos</div></div>
  <div class="stat"><div class="stat-n">${calcTotalDays()}</div><div class="stat-l">dias de cultivo</div></div>
  <div class="stat"><div class="stat-n">${doneMods.length}/${MODULES.length}</div><div class="stat-l">módulos concluídos</div></div>
</div>
${doneMods.length?`<h2>Módulos concluídos</h2><div class="ins"><div class="ins-b">${doneMods.map(m=>`<span class="pill">${m}</span>`).join('')}</div></div>`:''}
${D.assessment?`<h2>Autoavaliação SPANE</h2><div class="ins"><div class="ins-b">Positivas: <strong>${D.assessment.p}/30</strong> · Negativas: <strong>${D.assessment.n}/30</strong> · Saldo: <strong>${D.assessment.b>0?'+':''}${D.assessment.b}</strong> (${new Date(D.assessment.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})})</div></div>`:''}
${expDone.length?`<h2>Experimentos (previsto vs. sentido)</h2><table><thead><tr><th>Data</th><th>Experimento</th><th>Previsto</th><th>Sentido</th><th>O que notou</th></tr></thead><tbody>${expRows}</tbody></table>`:''}
${D.doseRecords.length?`<h2>Dose cultivada (semanal)</h2>
<table><thead><tr><th>Semana de</th><th>Práticas</th><th>O que cultivou</th></tr></thead><tbody>
${[...D.doseRecords].sort((a,b)=>b.ts-a.ts).map(r=>
  `<tr><td>${new Date(r.weekStart+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</td><td>${(r.tags||[]).join(', ')||'—'}</td><td>${esc(r.text||'—')}</td></tr>`).join('')}
</tbody></table>`:''}
<h2>Todos os momentos</h2>
<table><thead><tr><th>Data</th><th>Momento</th><th>Emoções</th><th>Saboreio</th><th>Intensidade</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ft">
  <strong>© 2026 Psicoterapia e Afins · Todos os direitos reservados</strong><br>
  Este relatório contém dados pessoais. Compartilhe somente com seu profissional de saúde mental de confiança.<br>
  <strong>Recurso psicoeducativo baseado em evidências, não substitui psicoterapia profissional.</strong><br>
  <a href="https://www.psicoterapiaeafins.com.br" style="color:#5E7D73">psicoterapiaeafins.com.br</a>
  &nbsp;·&nbsp;
  <a href="https://www.instagram.com/psicoterapiaeafins" style="color:#D96C63">@psicoterapiaeafins</a><br>
  Proibida a reprodução total ou parcial sem autorização prévia e por escrito.
</div>
</div></body></html>`;
  dl('floresca-relatorio-'+today()+'.html',html,'text/html;charset=utf-8');
  toast('Relatório exportado.');
}

function exportCSV(){
  const csvEsc = s => '"'+String(s||'').replace(/"/g,'""')+'"';
  const pre = D.pretest, post = D.posttest;
  const preCols  = pre  ? [pre.spane.p,pre.spane.n,pre.spane.b,pre.beliefs.score].join(',')   : ',,,';
  const postCols = post ? [post.spane.p,post.spane.n,post.spane.b,post.beliefs.score].join(',') : ',,,';
  const rows = [
    ['record_type','timestamp','date','text','emotions','savoring_or_predicted','intensity_or_actual',
     'pre_spane_p','pre_spane_n','pre_spane_b','pre_beliefs',
     'post_spane_p','post_spane_n','post_spane_b','post_beliefs','why_text','shared'].join(','),
  ];
  D.entries.forEach(e=>{
    rows.push(['moment',e.ts,e.date,csvEsc(e.moment),csvEsc((e.emotions||[]).join('|')),csvEsc((e.savoring||[]).join('|')),e.intensity,preCols,postCols,csvEsc(e.why||''),e.shared?1:0].join(','));
  });
  D.experiments.filter(e=>e.status==='done').forEach(r=>{
    const exp=EXPERIMENTS.find(x=>x.id===r.expId)||{};
    rows.push(['experiment',r.tsDone,r.date,csvEsc(exp.title||r.expId),csvEsc(exp.emotion||''),r.predicted,r.actual,preCols,postCols,'',''].join(','));
  });
  D.doseRecords.forEach(r=>{
    rows.push(['dose',r.ts,r.date,csvEsc(r.text),csvEsc((r.tags||[]).join('|')),'','',preCols,postCols,'',''].join(','));
  });
  D.moduleFeedback.forEach(r=>{
    rows.push(['feedback',r.ts,r.date,csvEsc(r.word),r.moduleId,'','',preCols,postCols,'',''].join(','));
  });
  if(rows.length<=1){ toast('Sem dados para exportar.'); return; }
  dl('floresca-pesquisa-'+today()+'.csv', '﻿'+rows.join('\n'), 'text/csv;charset=utf-8');
  toast('CSV exportado.');
}

function dl(name,content,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }

/* ══════════════════════════════════
   SINCRONIZAÇÃO COM GOOGLE SHEETS
   ══════════════════════════════════ */
async function syncToResearch({ silent=false, requirePretest=true }={}){
  // Sem consentimento explícito (aceito no convite opcional), nada é enviado.
  if(!D.consentGiven){
    if(!silent) openInvite();
    return;
  }
  // A pesquisa é só para maiores de 18 anos: menores usam o app, mas nada é enviado.
  const _age = D.demographics && D.demographics.age;
  if(_age !== null && _age !== undefined && _age < 18){
    if(!silent) toast('A participação na pesquisa é só para maiores de 18 anos. Seus dados ficam apenas neste aparelho.');
    return;
  }
  if(!RESEARCH_ENDPOINT){
    if(!silent) toast('URL de pesquisa não configurado em app.js');
    return;
  }
  if(requirePretest && !D.pretest){
    if(!silent) toast('Complete o pré-teste antes de enviar dados.');
    return;
  }
  const btn  = document.getElementById('sync-btn');
  if(!silent && btn){ btn.textContent='A enviar…'; btn.style.opacity='0.6'; btn.onclick=null; }

  try{
    const doneMods = MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title);
    const payload = {
      participantId: D.participantId,
      consentDate:   D.consentDate,
      demographics:  D.demographics,
      onboardingPath: D.userProfile ? D.userProfile.onboardingPath : null,
      pretest:       D.pretest,
      posttest:      D.posttest || null,
      // Pesquisa: só campos estruturados. O texto livre (o momento, as notas dos
      // experimentos, a nota da dose) fica no aparelho e na conta da pessoa:
      // pode conter nomes e situações que identificam quem escreveu.
      entries:       D.entries.map(({moment, ...resto}) => resto),
      experiments:   D.experiments.map(({predictNote, noticed, ...resto}) => resto),
      doseRecords:   D.doseRecords.map(({text, ...resto}) => resto),
      moduleFeedback: D.moduleFeedback,
      xp:            D.xp,
      analytics:     D.analytics,
      modulesCompletedList: doneMods,
    };

    const resp = await fetch(RESEARCH_ENDPOINT, {
      method:   'POST',
      redirect: 'follow',
      headers:  { 'Content-Type': 'text/plain;charset=utf-8' },
      body:     JSON.stringify(payload),
    });

    const result = await resp.json();
    if(result.success){
      D.lastSync = new Date().toISOString();
      save();
      renderDadosSync();
      trackAppEvent('research_sync_ok');
      toast(silent ? 'Dados enviados para a pesquisa.' : 'Dados enviados. Obrigada pela contribuição.');
    } else {
      if(!silent) toast('Erro no servidor: '+(result.error||'resposta inesperada'));
      console.warn('[Floresça] sync error:', result.error);
    }
  }catch(err){
    if(!silent) toast('Falha na ligação. Verifique a rede e tente novamente.');
    console.warn('[Floresça] syncToResearch:', err.message);
  }

  if(!silent && btn){ btn.textContent='Enviar'; btn.style.opacity='1'; btn.onclick=()=>syncToResearch(); }
}

function researchStop(){
  if(!confirm('Parar de participar da pesquisa? Nada mais será enviado. O que já foi enviado não identifica você diretamente e continua nos resultados.')) return;
  D.consentGiven = false;
  save(); renderDadosSync();
  toast('Você parou de participar. Nada mais será enviado.');
}
function copyParticipantId(){
  const id = D.participantId || '';
  const done = () => toast('Código copiado.');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(id).then(done, () => toast('Não foi possível copiar. Selecione o código e copie manualmente.'));
  } else { toast('Selecione o código e copie manualmente.'); }
}
/* Versão do app: mesma numeração do cache do service worker (sw.js) */
const APP_VERSION = '26';
async function renderAppVersion(){
  const el = document.getElementById('app-version-box'); if(!el) return;
  let status = '';
  try{
    if('caches' in window){
      const keys = await caches.keys();
      status = keys.includes('floresca-v'+APP_VERSION) ? 'Você está na versão mais recente.' : 'Uma atualização está sendo preparada. Feche e abra o app de novo.';
    }
  }catch(e){}
  el.textContent = (status ? status+' ' : '') + 'Versão '+APP_VERSION+'.';
}
async function checkForUpdate(){
  toast('Procurando atualização…');
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    if(reg) await reg.update();
  }catch(e){}
  setTimeout(()=>location.reload(), 900);
}
function renderDadosSync(){
  renderAppVersion();
  const pidEl = document.getElementById('pid-code');
  if(pidEl) pidEl.textContent = D.participantId || '';
  const desc = document.getElementById('sync-desc');
  if(!desc) return;
  const sb=document.getElementById('sync-btn'), stop=document.getElementById('research-stop');
  if(sb) sb.textContent = D.consentGiven ? 'Enviar' : 'Participar';
  if(stop) stop.style.display = D.consentGiven ? '' : 'none';
  if(!D.consentGiven){
    desc.textContent = 'Participar é opcional e não muda nada no app. Se quiser contribuir, toque em Participar.';
    return;
  }
  if(!RESEARCH_ENDPOINT){
    desc.textContent = 'Endpoint não configurado (ver app.js)';
    return;
  }
  if(D.lastSync){
    const d=new Date(D.lastSync);
    const fmt=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+p2(d.getHours())+':'+p2(d.getMinutes());
    desc.textContent='Último envio: '+fmt;
  } else {
    desc.textContent='Nunca enviado. Você pode contribuir com a pesquisa.';
  }
}

/* ══════════════════════════════════
   MODAL / TOAST
   ══════════════════════════════════ */
function focusModal(){ const b=document.querySelector('#modal-ov.on button, #modal-ov.on [role=button]'); if(b) b.focus(); }
function openModal(id){
  if(id==='del'){
    document.getElementById('modal-title').textContent='Apagar todos os dados?';
    document.getElementById('modal-body').textContent='Esta ação é permanente e irreversível e remove os dados deste dispositivo. Se você já enviou dados para a pesquisa, essa cópia anônima continua com a equipe; para pedir a remoção, escreva para contato@psicoterapiaeafins.com.br com o seu código de participante.';
    document.getElementById('modal-actions').innerHTML='<button class="btn danger" onclick="deleteAll()">Sim, apagar tudo</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>';
    document.getElementById('modal-ov').classList.add('on');
  }
}
function closeModal(e){ if(!e||e.target===document.getElementById('modal-ov')) document.getElementById('modal-ov').classList.remove('on'); }
function deleteAll(){
  const pid=D.participantId, cd=D.consentDate, ls=D.lastSync, cg=!!D.consentGiven;
  D={
    xp:0, badges:[], obDone:true, obLevel:D.obLevel,
    moduleProgress:{}, entries:[], experiments:[], assessment:null,
    nickname:D.nickname, demographics:D.demographics,
    reminders:D.reminders||{enabled:false,hour:20},
    consentGiven:cg, consentDate:cd, researchInviteSeen:D.researchInviteSeen,
    participantId:pid, lastSync:ls,
    pretest:null, posttest:null, posttestRemindAfter:null,
    analytics:{sessions:[],moduleEvents:[],diaryEvents:[],labEvents:[]},
  };
  save();
  document.getElementById('modal-ov').classList.remove('on');
  toast('Dados apagados.');
  goTo('home');
}

/* Acessibilidade: elementos clicáveis que não são botões ganham papel, foco e teclado */
function a11yEnhance(root){
  (root||document).querySelectorAll('[onclick]:not(button):not(a):not(input):not(select):not(textarea):not(label):not(summary):not(#modal-ov):not([role])').forEach(el=>{
    el.setAttribute('role','button'); el.setAttribute('tabindex','0');
  });
}
document.addEventListener('keydown',e=>{
  const t=e.target;
  if(t && t.getAttribute && t.getAttribute('role')==='button' && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); t.click(); }
  if(e.key==='Escape'){ const ov=document.getElementById('modal-ov'); if(ov && ov.classList.contains('on')) ov.classList.remove('on'); }
});
function a11yHeading(){
  const scr = document.querySelector('.scr.on') || document.querySelector('#onboard:not(.hide) .ob-slide.on');
  if(!scr || scr.querySelector('h1,[aria-level="1"]')) return;
  const h = scr.querySelector('h2,.ob-title,.home-hi,.pt-hdr h2');
  if(h){ h.setAttribute('role','heading'); h.setAttribute('aria-level','1'); }
}
let _a11yT=null;
new MutationObserver(()=>{ clearTimeout(_a11yT); _a11yT=setTimeout(()=>{ a11yEnhance(); a11yHeading(); iconize(); },50); }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

/* Modal: foco entra no diálogo, Tab fica preso nele e o foco volta ao fechar */
let _lastFocus=null;
(function(){
  const ov=document.getElementById('modal-ov');
  if(!ov) return;
  new MutationObserver(()=>{
    if(ov.classList.contains('on')){
      if(!_lastFocus) _lastFocus=document.activeElement;
      setTimeout(()=>{ const b=ov.querySelector('button,[role=button],select,input'); if(b) b.focus(); },30);
    } else if(_lastFocus){
      try{ _lastFocus.focus(); }catch(e){}
      _lastFocus=null;
    }
  }).observe(ov,{attributes:true,attributeFilter:['class']});
  ov.addEventListener('keydown',e=>{
    if(e.key!=='Tab') return;
    const f=[...ov.querySelectorAll('button,[role=button],select,input,a[href],textarea')].filter(x=>!x.disabled && x.offsetParent!==null);
    if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  });
})();

function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('on'),2800); }

/* ══════════════════════════════════
   PRÓXIMO PASSO (home)
   Um único passo em destaque, para ninguém se perder. Ordem:
   primeiros passos (quem está começando) > experimento em andamento > módulo a meio >
   próximo canteiro > laboratório. Abaixo dele: o caminho dos canteiros ("você está aqui") e,
   só depois dos primeiros passos, os avisos secundários (instalar, lembretes, dias de prática).
   Sem pontos a perder e sem sequência a manter.
   ══════════════════════════════════ */
function renderNudge(){
  const el = document.getElementById('h-nudge');
  if(!el) return;
  const totalDays = calcTotalDays();
  const lastEntry = D.entries.length ? [...D.entries].sort((a,b)=>b.ts-a.ts)[0] : null;
  const daysSince = lastEntry ? Math.floor((Date.now()-lastEntry.ts)/864e5) : null;
  const halfMod = MODULES.find(m=>{ const mp=D.moduleProgress[m.id]; return mp && !mp.done && mp.steps?.some(Boolean); });
  const activeExp = D.experiments.find(e=>e.status==='active');

  let html = '';

  // 0. Pré-avaliação pendente
  if(!D.pretest && D.obDone){
    html = `<div class="nudge mint">
      <div class="nudge-icon">${ico('compass',24)}</div>
      <div class="nudge-body"><strong>Um ponto de partida.</strong>
      São cerca de 3 minutos para medir como você está hoje. Os módulos se abrem depois dela.</div>
      <button class="nudge-btn" onclick="goTo('pretest')">Responder agora</button>
    </div>`;
  }
  // 1. Instalar na tela de início (uma vez, se ainda não instalou)
  else if(!isInstalled() && !D.installSeen){
    html = `<div class="nudge lav">
      <div class="nudge-icon">${ico('mobile',24)}</div>
      <div class="nudge-body"><strong>Leve o Floresça com você.</strong>
      Adicione à tela de início para abrir como um app, com o ícone da flor e funcionando offline.</div>
      <button class="nudge-btn" onclick="showInstallModal()">Ver como</button>
    </div>`;
  }
  // 1b. Ativar lembretes (uma vez, depois de conhecer a instalação)
  else if(D.installSeen && !D.notifSeen && !D.reminders.enabled){
    html = `<div class="nudge mint">
      <div class="nudge-icon">${ico('bell',24)}</div>
      <div class="nudge-body"><strong>Ligue o cultivo à sua rotina.</strong>
      Um lembrete no calendário ou no navegador ajuda a criar o hábito. Escolha o que funciona para você.</div>
      <button class="nudge-btn" onclick="showNotifModal()">Ver opções</button>
    </div>`;
  }
  // 1c. Convite opcional para a pesquisa (uma vez, depois de conhecer o app)
  else if(D.pretest && !D.researchInviteSeen && !D.consentGiven && totalDays >= 2){
    html = `<div class="nudge lav">
      <div class="nudge-icon">${ico('flask',24)}</div>
      <div class="nudge-body"><strong>Convite opcional.</strong>
      Quer contribuir com a pesquisa do Psicoterapia e Afins? Não muda nada no app, e você pode recusar.</div>
      <button class="nudge-btn" onclick="openInvite()">Ver convite</button>
    </div>`;
  }
  // 2. Experimento ativo aguardando conclusão
  else if(activeExp){
    const exp = EXPERIMENTS.find(x=>x.id===activeExp.expId);
    html = `<div class="nudge amber">
      <div class="nudge-icon">${ico('flask',24)}</div>
      <div class="nudge-body"><strong>Experimento em andamento:</strong> ${exp?exp.title:''}.
      Já fez? Volte ao laboratório para comparar previsão e realidade.</div>
      <button class="nudge-btn" onclick="goTo('lab')">Ir ao laboratório</button>
    </div>`;
  }
  // 2. Retorno após pausa — acolher sem culpa
  else if(daysSince !== null && daysSince >= 3){
    html = `<div class="nudge lav">
      <div class="nudge-icon">${ico('heart',24)}</div>
      <div class="nudge-body"><strong>Que bom ter você de volta.</strong>
      Jardins sobrevivem a dias sem rega. ${identityLine()?esc(identityLine())+' ':''}Muitas vezes basta um momento pequeno hoje para retomar o cultivo.</div>
      <button class="nudge-btn" onclick="goTo('diary')">Registrar agora</button>
    </div>`;
  }
  // 3. Módulo a meio (Zeigarnik)
  else if(halfMod){
    const pct = modProgress(halfMod);
    html = `<div class="nudge mint">
      <div class="nudge-icon">${ico('book',24)}</div>
      <div class="nudge-body"><strong>${halfMod.title}</strong> está ${pct}% completo.
      Faltam só alguns passos para fechar este canteiro.</div>
      <button class="nudge-btn" onclick="openModule('${halfMod.id}')">Continuar</button>
    </div>`;
  }
  // 4. Dias de cultivo acumulados — reforço sem pressão (nunca zera)
  else if(totalDays >= 2){
    html = `<div class="nudge amber">
      <div class="nudge-icon">${ico('leaf',24)}</div>
      <div class="nudge-body"><strong>${totalDays} dias de cultivo até agora.</strong>
      Cada dia conta, e pausas fazem parte do cultivo. É a prática repetida, não a perfeição, que treina o radar.</div>
    </div>`;
  }
  el.innerHTML = html;
}

/* Intenção de implementação (Gollwitzer, 1999) */
const IFTHEN_PLANS = [
  'Quando algo bom acontecer amanhã, vou <strong>parar 10 segundos para saborear</strong> antes de seguir.',
  'Quando eu notar um momento agradável, vou <strong>nomear a emoção</strong> que ele desperta.',
  'Quando receber um elogio, vou <strong>respirar e só agradecer</strong>, sem devolver nem minimizar.',
  'Quando terminar algo difícil, vou <strong>reconhecer meu esforço</strong> em uma frase.',
  'Quando alguém me contar uma boa notícia, vou <strong>perguntar mais e comemorar junto</strong>.',
];
function maybeShowIfThen(){
  if(D.entries.length % 3 !== 1) return;
  const plan = IFTHEN_PLANS[Math.floor(Math.random()*IFTHEN_PLANS.length)];
  document.getElementById('modal-title').textContent = 'Um plano para amanhã';
  document.getElementById('modal-body').innerHTML =
    plan + '<br><br><span style="font-size:12px;color:var(--light)">Planos "quando-então" duplicam a chance de agir no momento certo (Gollwitzer, 1999).</span>';
  document.getElementById('modal-actions').innerHTML =
    '<button class="btn mint" onclick="closeModal()">Combinado </button>';
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   INSTALAÇÃO: atalho na tela de início (PWA)
   ══════════════════════════════════ */
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
});
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  D.installSeen = true; save();
  toast('Floresça instalado. Procure a flor na tela de início.');
  trackAppEvent('pwa_installed');
});

function isInstalled(){
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function installInstructionsHTML(){
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const step = (n,txt)=>`<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">
    <div style="width:22px;height:22px;border-radius:50%;background:var(--mint-xl);color:var(--mint-d);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0">${n}</div>
    <div style="font-size:13.5px;line-height:1.55;text-align:left">${txt}</div>
  </div>`;
  if(isIOS) return `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No iPhone/iPad (Safari)</div>`
    + step(1,'Abra o Floresça no <strong>Safari</strong> (outros navegadores não têm essa opção no iOS)')
    + step(2,'Toque no botão <strong>Compartilhar</strong>, o quadrado com a seta para cima (), na barra inferior')
    + step(3,'Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>')
    + step(4,'Toque em <strong>Adicionar</strong>, a flor aparece junto aos seus apps');
  if(isAndroid) return `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No Android (Chrome)</div>`
    + step(1,'Abra o Floresça no <strong>Chrome</strong>')
    + step(2,'Toque no menu <strong>⋮</strong> (três pontinhos, no canto superior direito)')
    + step(3,'Toque em <strong>"Adicionar à tela inicial"</strong> (ou <strong>"Instalar app"</strong>)')
    + step(4,'Confirme: a flor aparece junto aos seus apps');
  return `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No computador (Chrome/Edge)</div>`
    + step(1,'Procure o <strong>ícone de instalação</strong> no fim da barra de endereço (um monitor com uma seta para baixo)')
    + step(2,'Clique nele e depois em <strong>Instalar</strong>')
    + step(3,'Se não vir o ícone: menu <strong>⋮</strong> → "Salvar e compartilhar" → <strong>"Instalar Floresça"</strong>')
    + step(4,'O app abre em janela própria, com a flor na barra de tarefas');
}

async function installApp(){
  if(!_installPrompt){ return; }
  _installPrompt.prompt();
  try{
    const choice = await _installPrompt.userChoice;
    if(choice && choice.outcome === 'accepted'){ closeModal(); }
  }catch(e){}
  _installPrompt = null;
}

function showInstallModal(){
  D.installSeen = true; save();
  if(isInstalled()){
    document.getElementById('modal-title').textContent = 'Já está instalado.';
    document.getElementById('modal-body').innerHTML = 'Você já está usando o Floresça como app. É só procurar a flor na tela de início sempre que quiser voltar.';
    document.getElementById('modal-actions').innerHTML = '<button class="btn mint" onclick="closeModal()">Ótimo</button>';
    document.getElementById('modal-ov').classList.add('on');
    return;
  }
  document.getElementById('modal-title').textContent = 'Floresça na tela de início';
  document.getElementById('modal-body').innerHTML =
    `<p style="margin-bottom:12px;text-align:left">Com o atalho, o Floresça vira um app de verdade: abre em tela cheia, com o ícone da flor , e funciona até sem internet.</p>`
    + (_installPrompt
        ? `<p style="font-size:13px;color:var(--muted);text-align:left">Boa notícia: seu navegador instala com um toque. </p>`
        : installInstructionsHTML());
  document.getElementById('modal-actions').innerHTML =
    (_installPrompt ? `<button class="btn mint" onclick="installApp()">Instalar agora </button>` : '')
    + `<button class="btn ${_installPrompt?'ghost':'mint'}" onclick="closeModal();if(typeof renderNudge==='function')renderNudge()">Entendi</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   LEMBRETES (Notification API + Service Worker)
   ══════════════════════════════════ */
let _reminderTimer = null;

/* Explica como os lembretes funcionam ANTES de pedir permissão ao navegador
   (pre-permission prompt): evita pedido "a frio", que tem alta recusa e
   é quase irreversível de desfazer depois. */
function notifAvailable(){
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if(!('Notification' in window)) return false;
  if(Notification.permission === 'denied') return false;
  if(isIOS && !isInstalled()) return false;
  return true;
}
function reminderText(){
  return (D.anchor ? D.anchor.label+': ' : '')+'um minuto para regar o jardim. O que foi bom hoje?';
}
function downloadReminderICS(){
  const hour = parseInt(document.getElementById('notif-hour')?.value || D.reminders.hour || 20);
  D.reminders.hour = hour; save();
  const d = new Date();
  const stamp = d.getUTCFullYear()+p2(d.getUTCMonth()+1)+p2(d.getUTCDate())+'T'+p2(d.getUTCHours())+p2(d.getUTCMinutes())+'00Z';
  const start = d.getFullYear()+p2(d.getMonth()+1)+p2(d.getDate())+'T'+p2(hour)+'0000';
  const url = location.origin + location.pathname;
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Floresca//PT-BR','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    'UID:floresca-lembrete-diario@'+location.host,'DTSTAMP:'+stamp,'DTSTART:'+start,'DURATION:PT5M','RRULE:FREQ=DAILY',
    'SUMMARY:Regar o jardim (Floresça)','DESCRIPTION:'+reminderText().replace(/[,;]/g,' ')+' '+url,'URL:'+url,
    'BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:Regar o jardim','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  dl('floresca-lembrete.ics', ics, 'text/calendar');
  trackAppEvent('reminder_ics_downloaded');
  toast('Abra o arquivo para adicionar o lembrete ao seu calendário.');
}
/* Explica como os lembretes funcionam ANTES de pedir permissão ao navegador.
   Honesto sobre o limite: notificação do navegador não é garantida com o app fechado. */
function showNotifModal(){
  D.notifSeen = true; save();
  const hour = (D.anchor && D.anchor.hour) || D.reminders.hour || 20;
  const hours = [8,12,13,18,20,21];
  if(!hours.includes(hour)) hours.push(hour);
  hours.sort((a,b)=>a-b);
  document.getElementById('modal-title').textContent = 'Lembrete diário';
  document.getElementById('modal-body').innerHTML = `
    <div style="text-align:left;font-size:13.5px;line-height:1.6">
      ${D.anchor?`<div class="plan-box" style="margin-bottom:12px"><strong>Seu gatilho:</strong> ${esc(D.anchor.label.toLowerCase())}.</div>`:''}
      <div style="margin-bottom:10px"><strong>No calendário (recomendado).</strong> Um evento diário no seu celular. Funciona mesmo com o app fechado.</div>
      <div style="margin-bottom:10px"><strong>Notificação do navegador.</strong> Chega com o app aberto ou em segundo plano. Se você fechar o app por completo, ela pode não aparecer.${notifAvailable()?'':' Neste aparelho ela não está disponível agora.'}</div>
      <div style="margin-bottom:14px">No máximo 1 por dia, e você desliga quando quiser em Dados.</div>
      <label for="notif-hour" style="font-size:12.5px;font-weight:700;color:var(--muted);display:block;margin-bottom:6px">Horário do lembrete</label>
      <select id="notif-hour" class="demo-input" style="width:auto;padding:8px 12px">
        ${hours.map(h=>`<option value="${h}" ${h===hour?'selected':''}>${p2(h)}:00</option>`).join('')}
      </select>
    </div>`;
  document.getElementById('modal-actions').innerHTML =
    `<button class="btn mint" onclick="downloadReminderICS()">Adicionar ao calendário</button>`
    + (notifAvailable() ? `<button class="btn ghost" onclick="activateNotifFromModal()">Ativar notificação do navegador</button>` : '')
    + `<button class="btn ghost" onclick="closeModal();renderNudge()">Agora não</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

async function activateNotifFromModal(){
  const hour = parseInt(document.getElementById('notif-hour')?.value || '20');
  const perm = await Notification.requestPermission();
  if(perm !== 'granted'){
    toast('Permissão negada. Você pode usar o lembrete do calendário em Dados.');
    closeModal();
    return;
  }
  D.reminders.enabled = true;
  D.reminders.hour = hour;
  save();
  scheduleLocalReminder();
  trackAppEvent('reminders_on');
  closeModal();
  toast('Notificação ativada para as '+p2(hour)+':00, com o app aberto ou em segundo plano.');
  // notificação de boas-vindas — mostra exatamente como o lembrete vai aparecer
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    const msg = 'Combinado. Às '+p2(hour)+':00 eu te lembro de regar, se o app estiver aberto ou em segundo plano e você ainda não tiver passado por aqui.';
    if(reg){ reg.showNotification('Floresça', { body: msg, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'floresca-welcome' }); }
    else { new Notification('Floresça', { body: msg, icon: 'icon-192.png' }); }
  }catch(e){}
  renderReminderUI();
  if(typeof renderNudge==='function') renderNudge();
}

async function toggleReminders(cb){
  if(cb.checked){
    if(!('Notification' in window)){
      toast('Este navegador não suporta notificações.');
      cb.checked = false; return;
    }
    const perm = await Notification.requestPermission();
    if(perm !== 'granted'){
      toast('Permissão negada: ative nas configurações do navegador.');
      cb.checked = false; return;
    }
    D.reminders.enabled = true; save();
    scheduleLocalReminder();
    toast('Lembrete diário ativado.');
    trackAppEvent('reminders_on');
  } else {
    D.reminders.enabled = false; save();
    if(_reminderTimer) clearTimeout(_reminderTimer);
    toast('Lembrete desativado.');
    trackAppEvent('reminders_off');
  }
  renderReminderUI();
}

function setReminderHour(sel){
  D.reminders.hour = parseInt(sel.value); save();
  scheduleLocalReminder();
  toast('Lembrete às '+sel.value+':00.');
}

function scheduleLocalReminder(){
  if(_reminderTimer) clearTimeout(_reminderTimer);
  if(!D.reminders.enabled || Notification.permission !== 'granted') return;
  const now = new Date();
  const next = new Date(now);
  next.setHours(D.reminders.hour, 0, 0, 0);
  if(next <= now) next.setDate(next.getDate()+1);
  const practicedToday = D.entries.some(e=>e.date===today());
  if(practicedToday && next.getDate()===now.getDate()) next.setDate(next.getDate()+1);
  _reminderTimer = setTimeout(fireReminder, next - now);
}

const REMINDER_MSGS_BASE = [
  'Hora de regar: o que foi bom hoje? 1 minuto de registro já conta.',
  'Que momento de hoje merece ser guardado? Seu jardim espera.',
  'Pequena pausa para saborear: registre uma coisa boa de hoje.',
];
async function fireReminder(){
  if(!D.reminders.enabled) return;
  const msg = D.anchor ? ('Hora de regar: '+D.anchor.label.toLowerCase()+', que tal registrar uma coisa boa?') : REMINDER_MSGS_BASE[Math.floor(Math.random()*REMINDER_MSGS_BASE.length)];
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    if(reg){
      reg.showNotification('Floresça', { body: msg, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'floresca-daily' });
    } else {
      new Notification('Floresça', { body: msg, icon: 'icon-192.png' });
    }
    trackAppEvent('reminder_fired');
  }catch(e){ console.warn('[Floresça] notificação falhou:', e); }
  scheduleLocalReminder();
}

function renderReminderUI(){
  const cb  = document.getElementById('rem-toggle');
  const sel = document.getElementById('rem-hour');
  const row = document.getElementById('rem-hour-row');
  if(cb)  cb.checked = D.reminders.enabled;
  if(sel) sel.value  = String(D.reminders.hour);
  if(row) row.style.display = D.reminders.enabled ? '' : 'none';
}

/* ── Service worker (offline + notificações) ── */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(e=>console.warn('[Floresça] SW:', e.message));
}

/* ── Splash screen ── */
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  setTimeout(function(){
    splash.classList.add('out');
    setTimeout(function(){ splash.classList.add('gone'); }, 460);
  }, 1800);
})();

/* ══════════════════════════════════
   INIT
   ══════════════════════════════════ */
load();
_classifyDone=[];
_flipsAll=0;
trackAppEvent('app_open');
scheduleLocalReminder();
if(!D.obDone){
  document.getElementById('onboard').classList.remove('hide');
} else {
  document.getElementById('onboard').classList.add('hide');
  if(!D.firstPracticeSeen && !D.pretest){
    goTo('pretest');
  } else {
    goTo('home');
    checkPosttestTrigger();
  }
}

a11yEnhance();
iconize();
