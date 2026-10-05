/* ════════════════════════════════════════════════════════
   Navegando as Preocupações — app.js v4
   Gameful Learning · pt-BR · TCC · MCT · ACT · TFC/CFT
   © 2025 Psicoterapia e Afins — psicoterapiaeafins.com.br
   ════════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════
   CONFIGURAÇÃO DE PESQUISA
   Para activar a sincronização automática com Google Sheets:
   1. Abre research-sync.gs no Google Apps Script
   2. Implementa como Web App (Executar como: tu; Acesso: Qualquer pessoa)
   3. Substitui null abaixo pelo URL de implementação
      Exemplo: 'https://script.google.com/macros/s/XXXXX/exec'
   ══════════════════════════════════ */
const RESEARCH_ENDPOINT = "https://script.google.com/macros/s/AKfycby720SgD9OSF6zIgscg5ZZGFnOD6F4Fsgkq3xue0IXmvLGWhTjhMFJN_2ln10FMorOYvQ/exec";

/* ══════════════════════════════════
   BRAND ASSETS
   ══════════════════════════════════ */
const LOGO_SVG = `<svg width="32" height="38" viewBox="0 0 52 62" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="26" cy="10" r="9.5" fill="#3D5A52"/>
  <path d="M2 29Q26 13 50 29" stroke="#D96C63" stroke-width="4.8" stroke-linecap="round"/>
  <path d="M8 40Q26 25 44 40" stroke="#D96C63" stroke-width="4.8" stroke-linecap="round"/>
  <path d="M15 51Q26 38 37 51" stroke="#D96C63" stroke-width="4.8" stroke-linecap="round"/>
  <circle cx="26" cy="57.5" r="6" fill="#D96C63"/>
</svg>`;

const BRAND_FOOTER_HTML = `
<div style="margin:8px 0 0;background:#F0F6F3;border-radius:14px;padding:16px 18px;border:1px solid rgba(94,125,115,.12)">
  <div style="margin-bottom:12px">
    <img src="assets/farol-logo.svg" alt="Farol" width="140" style="display:block">
  </div>
  <div style="font-size:12px;color:#5A6B65;line-height:1.65;border-top:1px solid rgba(94,125,115,.15);padding-top:10px">
    ⚕️ <strong>Recurso psicoeducativo</strong> — não substitui acompanhamento psicológico profissional.<br>
    🌐 <a href="https://www.psicoterapiaeafins.com.br" target="_blank" style="color:#3D5A52;font-weight:700;text-decoration:none">psicoterapiaeafins.com.br</a>
    &nbsp;·&nbsp;
    📷 <a href="https://www.instagram.com/psicoterapiaeafins" target="_blank" style="color:#B85550;font-weight:700;text-decoration:none">@psicoterapiaeafins</a>
  </div>
</div>
<div style="font-size:10px;color:#A0ADB8;text-align:center;padding:8px 0 4px;line-height:1.6">
  © 2025 Psicoterapia e Afins · Todos os direitos reservados<br>
  Proibida a reprodução sem autorização prévia
</div>`;

/* ══════════════════════════════════
   PERSISTENCE
   ══════════════════════════════════ */
const SK = 'np_v4';
let D = {
  xp: 0,
  badges: [],
  obDone: false,
  obLevel: 0,
  moduleProgress: {},   // { m1: { steps: [true,false,...], done: false } }
  entries: [],          // diary
  doseRecords: [],      // dose praticada semanal { ts, date, weekStart, tags[], text }
  doseSkipWeek: null,   // semana (segunda-feira) em que dispensou o prompt
  moduleFeedback: [],   // vocabulário do usuário { ts, date, moduleId, word }
  assessment: null,
  nickname: '',         // como prefere ser chamada/o
  demographics: null,   // { gender, age, city, country, therapy }
  reminders: { enabled:false, hour:20, hourTouched:false }, // lembrete diário local
  notificationLog: [],  // { ts, tema, foiAberta } — engajamento com notificações
  installSeen: false,   // já viu a instrução de instalar na tela de início
  notifPromptSeen: false, // já viu o convite para ativar lembretes
  consentGiven: false,
  consentDate: null,    // ISO timestamp do consentimento
  participantId: null,  // UUID anônimo gerado uma vez
  lastSync: null,       // ISO timestamp do último envio para pesquisa
  pretest:  null,       // { gad7: {score,level,answers}, mcq30: {scores:{wf,cw,nc,pr,nb}, answers}, date }
  posttest: null,       // same shape as pretest
  posttestRemindAfter: null, // ISO date — after which to prompt
  userProfile: null,    // { recommendedPath:['m1',...], reasons:[], computedAt } — tailoring pelo pré-teste
  analytics: {
    sessions: [],       // [{ start, end, screen }]
    moduleEvents: [],   // [{ ts, moduleId, event }]
    diaryEvents: [],    // [{ ts }]
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
      // migrate: add missing fields to old saves
      if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[] };
      if(!D.analytics.sessions)    D.analytics.sessions=[];
      if(!D.analytics.moduleEvents)D.analytics.moduleEvents=[];
      if(!D.analytics.diaryEvents) D.analytics.diaryEvents=[];
      if(!D.doseRecords) D.doseRecords=[];
      if(D.doseSkipWeek === undefined) D.doseSkipWeek = null;
      if(!D.moduleFeedback) D.moduleFeedback=[];
      if(D.userProfile === undefined) D.userProfile = null;
      // usuários antigos com pré-teste feito ganham o caminho personalizado na hora
      if(!D.userProfile && D.pretest) D.userProfile = computeRecommendedPath(D.pretest);
      if(!D.participantId) D.participantId = generateUUID();
      if(D.consentDate    === undefined) D.consentDate    = null;
      if(D.lastSync       === undefined) D.lastSync       = null;
      if(D.nickname       === undefined) D.nickname       = '';
      if(D.demographics   === undefined) D.demographics   = null;
      if(!D.reminders) D.reminders = { enabled:false, hour:20, hourTouched:false };
      if(D.reminders.hourTouched === undefined) D.reminders.hourTouched = false;
      if(!D.notificationLog) D.notificationLog = [];
      if(D.installSeen === undefined) D.installSeen = false;
      if(D.notifPromptSeen === undefined) D.notifPromptSeen = false;
    } else {
      D.participantId = generateUUID();
    }
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(SK,JSON.stringify(D)); }
  catch(e){
    // quota cheia ou modo privado — avisa em vez de falhar em silêncio
    console.warn('[Farol] save falhou:', e.message);
    if(typeof toast==='function') toast('⚠️ Não foi possível guardar. Exporte os seus dados em Dados → Exportar.');
  }
}

/* GAD-7 — faixas oficiais (Spitzer et al., 2006):
   0-4 mínima · 5-9 leve · 10-14 moderada · 15-21 severa */
function gad7Level(score){
  return score<=4?'low':score<=9?'mid':score<=14?'hi':'sev';
}
const GAD7_LABELS = { low:'Mínima', mid:'Leve', hi:'Moderada', sev:'Severa' };

/* Cartão de apoio em crise — mostrado quando GAD-7 ≥ 15 */
function crisisCardHTML(){
  return `
  <div class="crisis-card">
    <div class="crisis-title">💛 Você não precisa atravessar isso sozinho/a</div>
    <div class="crisis-body">
      A sua pontuação sugere um sofrimento significativo neste momento. Este app é um apoio,
      mas <strong>não substitui ajuda profissional</strong> — e procurá-la é um ato de coragem, não de fraqueza.
    </div>
    <div class="crisis-resources">
      <a href="tel:188" class="crisis-res"><span>📞</span><div><strong>CVV — 188</strong><small>Ligação gratuita, 24h, todos os dias</small></div></a>
      <a href="https://www.cvv.org.br" target="_blank" class="crisis-res"><span>💬</span><div><strong>Chat do CVV</strong><small>cvv.org.br — conversa por escrito</small></div></a>
      <div class="crisis-res"><span>🏥</span><div><strong>CAPS ou UBS</strong><small>Atendimento gratuito pelo SUS na sua cidade</small></div></div>
      <div class="crisis-res"><span>🚨</span><div><strong>SAMU — 192</strong><small>Em emergência, ligue imediatamente</small></div></div>
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
function weekStart(dateStr){
  const d = dateStr ? new Date(dateStr+'T12:00') : new Date();
  const dow = (d.getDay()+6)%7; // 0 = segunda
  d.setDate(d.getDate()-dow);
  return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
}

/* Dose Praticada — tags alinhadas às técnicas dos módulos */
const DOSE_TAGS = ['🕐 Adiei uma preocupação','🔍 Percebi um pensamento automático',
  '🧠 Questionei uma crença','🌬️ Regulei pelo corpo','🌊 Deixei um pensamento passar',
  '💚 Fui gentil comigo mesmo/a','🎯 Agi apesar da dúvida'];

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS  = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const DIAS_C= ['D','S','T','Q','Q','S','S'];

/* ══════════════════════════════════
   XP / LEVEL SYSTEM
   ══════════════════════════════════ */
const LEVELS = [
  { n:1, name:'Curioso/a',    emoji:'🌱', min:0,   max:100  },
  { n:2, name:'Explorador/a', emoji:'🔍', min:100, max:250  },
  { n:3, name:'Praticante',   emoji:'🌿', min:250, max:430  },
  { n:4, name:'Especialista', emoji:'⭐', min:430, max:595  },
  { n:5, name:'Mestre/a',     emoji:'🏆', min:595, max:9999 },
];
function getLevel(xp){ return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0]; }
function getLevelPct(xp){
  const lv = getLevel(xp);
  if(lv.n === 5) return 100;
  return Math.min(100, Math.round((xp - lv.min)/(lv.max - lv.min)*100));
}
function awardXP(amount, msg){
  D.xp += amount; save();
  toast('+'+ amount +' XP — '+ msg);
}

/* ══════════════════════════════════
   BADGES
   ══════════════════════════════════ */
const ALL_BADGES = [
  { id:'b_m1',   emoji:'🧠', name:'Curioso/a',        desc:'Completou o Módulo 1' },
  { id:'b_m2',   emoji:'🔍', name:'Detetive',          desc:'Completou o Módulo 2' },
  { id:'b_m3',   emoji:'💭', name:'Metacognitivo/a',   desc:'Completou o Módulo 3' },
  { id:'b_m4',   emoji:'⏰', name:'Organizador/a',     desc:'Completou o Módulo 4' },
  { id:'b_m5',   emoji:'🌬️', name:'Ancorado/a',        desc:'Completou o Módulo 5' },
  { id:'b_m6',   emoji:'🔧', name:'Reestruturador/a',  desc:'Completou o Módulo 6' },
  { id:'b_m7',   emoji:'🌊', name:'Desapegado/a',      desc:'Completou o Módulo 7' },
  { id:'b_m8',   emoji:'💚', name:'Compassivo/a',      desc:'Completou todos os módulos' },
  { id:'b_str7', emoji:'🔥', name:'Consistente',       desc:'7 dias seguidos' },
  { id:'b_d10',  emoji:'📔', name:'Diário Regular',    desc:'10+ registros no diário' },
  { id:'b_xp',   emoji:'⭐', name:'Dedicado/a',        desc:'Atingiu 300 XP' },
];
function awardBadge(id){
  if(D.badges.includes(id)) return;
  D.badges.push(id); save();
  const b = ALL_BADGES.find(x => x.id===id);
  if(b) toast('🏅 Conquista: '+b.name);
}
function checkBadges(){
  if(D.xp >= 300) awardBadge('b_xp');
  const entries = D.entries;
  if(entries.length >= 10) awardBadge('b_d10');
  // streak
  if(entries.length){
    const dates = [...new Set(entries.map(e=>e.date))].sort().reverse();
    let streak=0, t=today(), y=prevDay(1);
    if(dates[0]===t||dates[0]===y){
      streak=1;
      for(let i=1;i<dates.length;i++){
        const a=new Date(dates[i-1]+'T12:00'),b2=new Date(dates[i]+'T12:00');
        if(Math.round((a-b2)/864e5)===1) streak++; else break;
      }
    }
    if(streak>=7) awardBadge('b_str7');
  }
}

/* ══════════════════════════════════
   SVG DIAGRAMS
   ══════════════════════════════════ */
function svgCycleWorry(){
  return `<div class="diagram-wrap">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">O Ciclo da Preocupação</p>
  <svg viewBox="0 0 300 260" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <defs>
      <marker id="arrowM" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#A0ADB8"/>
      </marker>
    </defs>
    <!-- Node: Gatilho (top-center) -->
    <ellipse cx="150" cy="34" rx="68" ry="22" fill="#FAF0EF" stroke="#D96C63" stroke-width="2" class="cycle-node"/>
    <text x="150" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="#B85550" font-family="Nunito Sans,sans-serif">Situação</text>
    <text x="150" y="43" text-anchor="middle" font-size="10" fill="#B85550" font-family="Nunito Sans,sans-serif">gatilho</text>
    <!-- Arrow top-right -->
    <path d="M210,45 Q255,80 255,120" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowM)" class="cycle-arrow"/>
    <!-- Node: Pensamento (right) -->
    <ellipse cx="248" cy="140" rx="46" ry="22" fill="#EEE9FB" stroke="#8B7FB8" stroke-width="2" class="cycle-node"/>
    <text x="248" y="136" text-anchor="middle" font-size="10" font-weight="700" fill="#3D2E7A" font-family="Nunito Sans,sans-serif">Pensamento</text>
    <text x="248" y="148" text-anchor="middle" font-size="9" fill="#3D2E7A" font-family="Nunito Sans,sans-serif">"E se...?"</text>
    <!-- Arrow right-bottom -->
    <path d="M240,163 Q230,210 180,225" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowM)" class="cycle-arrow"/>
    <!-- Node: Preocupação (bottom-center) -->
    <ellipse cx="150" cy="230" rx="68" ry="22" fill="#F0F6F3" stroke="#5E7D73" stroke-width="2" class="cycle-node"/>
    <text x="150" y="226" text-anchor="middle" font-size="11" font-weight="700" fill="#3D5A52" font-family="Nunito Sans,sans-serif">Preocupação</text>
    <text x="150" y="239" text-anchor="middle" font-size="10" fill="#3D5A52" font-family="Nunito Sans,sans-serif">ruminação</text>
    <!-- Arrow bottom-left -->
    <path d="M120,225 Q60,210 52,163" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowM)" class="cycle-arrow"/>
    <!-- Node: Ativação (left) -->
    <ellipse cx="52" cy="140" rx="44" ry="22" fill="#FBF0DF" stroke="#C47D2A" stroke-width="2" class="cycle-node"/>
    <text x="52" y="136" text-anchor="middle" font-size="10" font-weight="700" fill="#7A4A10" font-family="Nunito Sans,sans-serif">Ativação</text>
    <text x="52" y="148" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Nunito Sans,sans-serif">no corpo</text>
    <!-- Arrow left-top -->
    <path d="M60,118 Q90,70 90,45" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowM)" class="cycle-arrow"/>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Cada etapa alimenta a próxima — perceber o ciclo é o primeiro passo para sair dele.</p>
</div>`;
}

function svgThreeSystems(){
  return `<div class="diagram-wrap">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">Os Três Sistemas de Regulação</p>
  <svg viewBox="0 0 300 240" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <!-- Sistema Ameaça (left) -->
    <circle cx="105" cy="145" r="72" fill="rgba(217,108,99,.18)" stroke="#D96C63" stroke-width="2" class="sys-threat"/>
    <text x="88" y="130" font-size="18" text-anchor="middle" font-family="sans-serif">⚠️</text>
    <text x="88" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#B85550" font-family="Nunito Sans,sans-serif">Ameaça</text>
    <text x="88" y="161" text-anchor="middle" font-size="9" fill="#B85550" font-family="Nunito Sans,sans-serif">medo · ansiedade</text>
    <text x="88" y="173" text-anchor="middle" font-size="9" fill="#B85550" font-family="Nunito Sans,sans-serif">raiva · evitamento</text>
    <!-- Sistema Conquista (right) -->
    <circle cx="195" cy="145" r="72" fill="rgba(196,125,42,.15)" stroke="#C47D2A" stroke-width="2" class="sys-drive"/>
    <text x="212" y="130" font-size="18" text-anchor="middle" font-family="sans-serif">🎯</text>
    <text x="212" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#7A4A10" font-family="Nunito Sans,sans-serif">Conquista</text>
    <text x="212" y="161" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Nunito Sans,sans-serif">ambição · excitação</text>
    <text x="212" y="173" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Nunito Sans,sans-serif">busca · realização</text>
    <!-- Sistema Calmante (top-center) -->
    <circle cx="150" cy="88" r="72" fill="rgba(94,125,115,.15)" stroke="#5E7D73" stroke-width="2.5" class="sys-soothe"/>
    <text x="150" y="68" font-size="20" text-anchor="middle" font-family="sans-serif">💚</text>
    <text x="150" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#3D5A52" font-family="Nunito Sans,sans-serif">Calmante</text>
    <text x="150" y="101" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Nunito Sans,sans-serif">segurança · paz</text>
    <text x="150" y="113" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Nunito Sans,sans-serif">pertencimento · calor</text>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Na ansiedade, o sistema de <strong style="color:#B85550">Ameaça</strong> domina. O objetivo da TFC é ativar o sistema <strong style="color:#3D5A52">Calmante</strong>.</p>
</div>`;
}

function svgANS(){
  return `<div class="diagram-wrap">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:var(--coral-xl);border-radius:12px;padding:14px;border:1.5px solid var(--coral-l)">
      <div style="font-size:22px;margin-bottom:6px">⚡</div>
      <div style="font-size:13px;font-weight:800;color:var(--coral-d);margin-bottom:4px">Simpático</div>
      <div style="font-size:12px;color:var(--coral-d);line-height:1.5">Aceleração do coração<br>Tensão muscular<br>Respiração rápida<br>Modo "luta ou fuga"</div>
    </div>
    <div style="background:var(--mint-xl);border-radius:12px;padding:14px;border:1.5px solid var(--mint-l)">
      <div style="font-size:22px;margin-bottom:6px">🌿</div>
      <div style="font-size:13px;font-weight:800;color:var(--mint-d);margin-bottom:4px">Parassimpático</div>
      <div style="font-size:12px;color:var(--mint-d);line-height:1.5">Frequência cardíaca<br>diminui<br>Músculos relaxam<br>Modo "descanso"</div>
    </div>
  </div>
  <div style="background:var(--white);border-radius:10px;padding:10px 12px;margin-top:10px;font-size:12px;color:var(--muted);line-height:1.6;border-left:3px solid var(--mint)">
    💡 A respiração lenta ativa <strong style="color:var(--mint-d)">diretamente</strong> o nervo vago — o "freio" do sistema nervoso. Não é metáfora, é fisiologia.
  </div>
</div>`;
}

/* ══════════════════════════════════
   MODULE DATA
   ══════════════════════════════════ */
const MODULES = [
  /* ─────────────────────────────────────────
     M1: Entendendo as Preocupações
     ───────────────────────────────────────── */
  {
    id:'m1', color:'mint', emoji:'🧠',
    levelTag:'Nível 1 — Fundamentos',
    title:'Entendendo as Preocupações',
    tagline:'Como o ciclo da preocupação funciona',
    xp:50, badgeId:'b_m1', unlockAfter:null,
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'O que são preocupações?',
        content:`<p class="step-text">Preocupações são <strong>pensamentos verbais sobre ameaças futuras</strong> — o cérebro tentando antecipar e resolver problemas. Isso é evolutivamente inteligente.</p>
<p class="step-text" style="margin-top:10px">O problema aparece quando o sistema de alerta fica <strong>hipersensível</strong>, disparando alarmes mesmo sem perigo real. O pensamento cria tensão no corpo — que o cérebro lê como "confirmação" do perigo.</p>
${svgCycleWorry()}
<div class="tip mint">🔑 <strong>Ideia central:</strong> Não é falta de força de vontade. É biologia. E biologia pode ser re-treinada.</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'Identifique a fase do ciclo',
        question:'Você está no trabalho e pensa: <em>"E se eu cometer um erro grave e me demitir?"</em> Qual fase do ciclo isso representa?',
        opts:[
          { text:'Situação/Gatilho', correct:false },
          { text:'Pensamento automático "E se...?"', correct:true },
          { text:'Ativação corporal', correct:false },
          { text:'Comportamento de evitamento', correct:false },
        ],
        feedbackOk:'✅ Exato! "E se...?" é a marca do pensamento preocupante — ele antecipa um futuro negativo sem evidência suficiente.',
        feedbackNo:'Quase! O pensamento "E se eu cometer um erro..." é a fase do <strong>pensamento automático</strong>, não o gatilho (que seria o contexto do trabalho) nem a ativação física.'
      },
      {
        type:'fill', typeLabel:'✍️ Reflexão pessoal',
        title:'Quando você se preocupa mais?',
        prompt:'Pense nos últimos dias. Que situações ou horários costumam disparar suas preocupações? O que você percebe no seu corpo nesses momentos?',
        placeholder:'Ex.: À noite, quando fico quieto/a, começo a pensar em... No corpo sinto...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M2: Preocupação Útil vs. Inútil
     ───────────────────────────────────────── */
  {
    id:'m2', color:'amber', emoji:'🔍',
    levelTag:'Nível 1 — Fundamentos',
    title:'Preocupação Útil vs. Inútil',
    tagline:'Nem toda preocupação é igual',
    xp:60, badgeId:'b_m2', unlockAfter:'m1',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Dois tipos de preocupação',
        content:`<p class="step-text">O pesquisador Borkovec identificou uma distinção crucial entre dois tipos de preocupação:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>✅ Produtiva</strong><br>Leva a uma ação. Tem fim. Ex.: "Tenho uma reunião amanhã — vou preparar os pontos principais."</div>
  <div class="tip coral" style="margin:0"><strong>🔄 Ruminação</strong><br>Circular, sem progresso. Ex.: "E se eu fizer feio? E se me julgarem? E se...?"</div>
</div>
<div class="tip amber"><strong>3 Perguntas-filtro de Borkovec:</strong><br>1. Estou chegando a alguma conclusão <em>nova</em>?<br>2. Estou planejando algo <em>concreto</em>?<br>3. Este pensamento está me <em>ajudando</em>?<br><br>Se as respostas forem "não" — é ruminação. E ruminação não resolve nada.</div>`
      },
      {
        type:'flipcard', typeLabel:'🃏 Cartas interativas',
        title:'Vire as cartas — útil ou inútil?',
        hint:'Toque em cada carta para revelar a classificação.',
        cards:[
          { front:'"Preciso verificar se o prazo é sexta ou segunda"', back:'✅ Produtiva — levará a uma ação concreta', color:'mint' },
          { front:'"E se minha família adoecer por causa de algo que eu fiz?"', back:'🔄 Ruminação — não há ação possível, só ansiedade', color:'coral' },
          { front:'"Devo ligar para remarcar a consulta?"', back:'✅ Produtiva — resolvível em 5 minutos', color:'mint' },
          { front:'"E se eu nunca melhorar e sempre me preocupar?"', back:'🔄 Ruminação — catastrofização hipotética', color:'coral' },
          { front:'"Tenho dinheiro para pagar a conta este mês?"', back:'✅ Produtiva — pode virar um plano de ação', color:'mint' },
          { front:'"E se as pessoas não gostarem de mim?"', back:'🔄 Ruminação — baseada em suposições, não em fatos', color:'coral' },
        ]
      },
      {
        type:'classify', typeLabel:'🗂️ Atividade de classificação',
        title:'Classifique estas preocupações',
        instruction:'Para cada preocupação, decida: posso agir (Útil/Produtiva) ou é ruminação (Inútil)?',
        items:[
          { text:'E se eu nunca encontrar um parceiro/a?', cat:'n', label:'Ruminação — futuro hipotético' },
          { text:'Preciso agendar uma consulta médica.', cat:'u', label:'Produtiva — tem ação direta' },
          { text:'E se eu ficar doente gravemente?', cat:'n', label:'Ruminação — sem ação específica possível' },
          { text:'Devo estudar mais para a prova de amanhã.', cat:'u', label:'Produtiva — leva a uma ação concreta' },
          { text:'E se todos percebessem que sou incompetente?', cat:'n', label:'Ruminação — catastrofização social' },
          { text:'Preciso revisar esse documento antes de enviar.', cat:'u', label:'Produtiva — resolução direta' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Reflexão pessoal',
        title:'Minha preocupação desta semana',
        prompt:'Escreva uma preocupação que você teve recentemente. Ela é produtiva ou ruminação? O que isso muda na forma de lidar com ela?',
        placeholder:'A preocupação foi... Ela é produtiva/ruminação porque...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M3: Metacognições
     ───────────────────────────────────────── */
  {
    id:'m3', color:'lav', emoji:'💭',
    levelTag:'Nível 2 — Padrões Internos',
    title:'Metacognições: Crenças sobre o Pensar',
    tagline:'O verdadeiro motor da preocupação crônica',
    xp:70, badgeId:'b_m3', unlockAfter:'m2',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'O que são metacognições?',
        content:`<p class="step-text">Metacognições são <strong>crenças sobre os seus próprios pensamentos</strong>. São o motor da preocupação crônica.</p>
<p class="step-text" style="margin-top:10px">Adrian Wells, criador da Terapia Metacognitiva (MCT), mostrou que não é o <em>conteúdo</em> da preocupação que causa mais sofrimento — é a <em>relação</em> que você tem com ela.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip lav" style="margin:0"><strong>Crenças positivas</strong><br>"Preocupar me ajuda a estar preparada"<br>"Se eu pensar em tudo, evito o pior"</div>
  <div class="tip coral" style="margin:0"><strong>Crenças negativas</strong><br>"Não consigo controlar meus pensamentos"<br>"Me preocupar pode me deixar louca"</div>
</div>
<div class="tip mint"><strong>💡 Insight central:</strong> Ambos os tipos alimentam o ciclo. As positivas fazem você preocupar <em>de propósito</em>. As negativas fazem você ter medo <em>das preocupações em si</em>.</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'Identifique o tipo de metacognição',
        question:'<em>"Se eu me preocupar com saúde agora, estarei mais preparada para qualquer problema futuro."</em><br><br>Que tipo de metacognição é essa?',
        opts:[
          { text:'Crença metacognitiva negativa', correct:false },
          { text:'Crença metacognitiva positiva sobre preocupação', correct:true },
          { text:'Pensamento automático negativo', correct:false },
          { text:'Distorção cognitiva de catastrofização', correct:false },
        ],
        feedbackOk:'✅ Correto! Esta é uma crença positiva sobre a utilidade da preocupação — ela encoraja mais preocupação voluntária como "estratégia de preparo".',
        feedbackNo:'Essa é uma crença metacognitiva <strong>positiva</strong> sobre a preocupação — ela diz que se preocupar é útil/protetor. É diferente de medo de perder o controle (crença negativa).'
      },
      {
        type:'fill', typeLabel:'✍️ Reflexão pessoal',
        title:'Minhas metacognições pessoais',
        prompt:'Complete as frases abaixo com o que vier naturalmente:\n\n"Preocupar-me me ajuda a..."\n\n"Se eu parar de me preocupar, pode acontecer..."\n\n"Quando percebo que estou me preocupando, sinto..."',
        placeholder:'Preocupar-me me ajuda a...\n\nSe eu parar de me preocupar...\n\nQuando percebo que estou me preocupando...',
        minChars:40
      }
    ]
  },

  /* ─────────────────────────────────────────
     M4: Tempo de Preocupação
     ───────────────────────────────────────── */
  {
    id:'m4', color:'coral', emoji:'⏰',
    levelTag:'Nível 2 — Padrões Internos',
    title:'Tempo de Preocupação',
    tagline:'Aprenda a adiar, não a suprimir',
    xp:65, badgeId:'b_m4', unlockAfter:'m3',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'A técnica do Worry Time',
        content:`<p class="step-text">Tentar <em>suprimir</em> preocupações faz o oposto — elas voltam mais fortes (efeito rebote, Wegner). A solução não é parar de pensar — é <strong>reorganizar quando você pensa</strong>.</p>
<p class="step-text" style="margin-top:10px">O Tempo de Preocupação (Borkovec & Costello) é uma técnica com forte evidência científica:</p>
<div style="counter-reset:steps;display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>1. Defina um horário fixo</strong> — ex.: 17h, por 15-20 minutos. Não antes de dormir.</div>
  <div class="tip mint" style="margin:0"><strong>2. Fora do horário</strong> — quando surgir uma preocupação, diga: "Esse pensamento é válido. Vou guardar para as 17h." Anote brevemente se ajudar.</div>
  <div class="tip mint" style="margin:0"><strong>3. No horário</strong> — preocupe-se com intenção. Pense, escreva, encontre ações possíveis.</div>
  <div class="tip mint" style="margin:0"><strong>4. Encerre</strong> — ao acabar o tempo, feche mentalmente. Você cuidou disso.</div>
</div>
<div class="tip coral"><strong>⚠️ Isso não é ignorar seus sentimentos.</strong> É dar a eles um espaço adequado — e proteger o restante do dia.</div>`
      },
      {
        type:'guided', typeLabel:'⚙️ Prática guiada',
        title:'Praticando o adiamento',
        phases:[
          { num:'Fase 1', title:'Surgiu uma preocupação', text:'Você percebe um pensamento preocupante. Antes de seguir o fio, pause.<br><br>Respire uma vez. Nomeie: <em>"Estou tendo o pensamento de que..."</em><br><br>Pronto — você acabou de criar 1 segundo de distância. Isso é atenção desapegada.', btn:'Próxima fase' },
          { num:'Fase 2', title:'Anote e adie', text:'Abra o bloco de notas do celular ou um papel e escreva em <em>uma linha</em> o tema da preocupação. Não desenvolva.<br><br>Diga a si mesmo/a: <em>"Esse pensamento é real e importante. Vou dar atenção a ele às [seu horário]. Agora vou voltar para o que estou fazendo."</em><br><br>Essa frase valida sem alimentar.', btn:'Próxima fase' },
          { num:'Fase 3', title:'Comprometimento', text:'Defina agora um horário de preocupação para amanhã. Coloque um alarme com o nome "Tempo de Preocupação".<br><br>15-20 minutos. Longe de refeições e do horário de dormir.<br><br>Quando o alarme tocar: sente, pense com intenção, escreva o que surgir. E quando acabar o tempo — encerre.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Comprometimento',
        title:'Meu compromisso com o Worry Time',
        prompt:'Escreva: Qual horário você escolheu? Onde vai anotar as preocupações durante o dia? O que vai dizer a si mesmo/a quando surgir uma preocupação fora do horário?',
        placeholder:'Meu horário será às...\nVou anotar as preocupações em...\nQuando surgir fora do horário, vou dizer...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M5: Regulação pelo Corpo
     ───────────────────────────────────────── */
  {
    id:'m5', color:'mint', emoji:'🌬️',
    levelTag:'Nível 3 — Regulação',
    title:'Regulação pelo Corpo',
    tagline:'Fisiologia que acalma a ansiedade',
    xp:80, badgeId:'b_m5', unlockAfter:'m4',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'O sistema nervoso autônomo',
        content:`<p class="step-text">Quando você se preocupa, o sistema nervoso <strong>simpático</strong> ativa o modo "luta ou fuga" — coração acelera, músculos tensionam, respiração encurta. Isso é automático.</p>
<p class="step-text" style="margin-top:10px">A boa notícia: a respiração é a <strong>única função autônoma que você controla conscientemente</strong>. Ao respirar devagar, você ativa o nervo vago e o sistema parassimpático.</p>
${svgANS()}`
      },
      {
        type:'breath', typeLabel:'🌬️ Prática de respiração',
        title:'Respiração âncora (4-4-6)',
        instruction:'Esta sequência — inspirar 4s, segurar 4s, expirar 6s — é a mais estudada para redução de ansiedade. A expiração mais longa ativa o freio vagal.<br><br>Toque no círculo para começar. Faça 3 ciclos completos.',
        pattern:[ {label:'Inspira',dur:4,cls:'expand'},{label:'Segura',dur:4,cls:''},{label:'Expira',dur:6,cls:'contract'},{label:'Pausa',dur:2,cls:''} ],
        totalCycles:3
      },
      {
        type:'guided', typeLabel:'🧭 Ancoragem sensorial',
        title:'Exercício 5-4-3-2-1',
        phases:[
          { num:'5 coisas', title:'Que você pode VER agora', text:'Olhe ao redor e nomeie 5 objetos ou detalhes visuais. Não rapidamente — realmente <em>veja</em> cada um.<br><br>Ex.: "A textura do teto. A sombra no canto. O reflexo na tela..."<br><br>Faça isso agora antes de continuar.', btn:'Fiz isso' },
          { num:'4 coisas', title:'Que você pode TOCAR agora', text:'Sinta 4 texturas diferentes. A roupa no corpo, a cadeira, a superfície ao redor, a temperatura do ar.<br><br>Descreva mentalmente cada sensação com curiosidade, sem julgamento.', btn:'Fiz isso' },
          { num:'3 sons', title:'Que você pode OUVIR agora', text:'Feche os olhos por alguns segundos. Que sons existem neste momento? Sons de fundo que você estava ignorando.<br><br>Nomeie 3 com a máxima precisão.', btn:'Fiz isso' },
          { num:'2 cheiros', title:'Que você pode CHEIRAR', text:'Identifique 2 odores — os do ambiente, ou imagine os seus favoritos com detalhes sensoriais.<br><br>Cheiros têm uma via direta ao sistema límbico. Isso não é acidente.', btn:'Fiz isso' },
          { num:'1 sensação', title:'No seu corpo agora', text:'Note 1 sensação interna: o ritmo da respiração, o batimento cardíaco, a posição dos pés no chão.<br><br>Você está aqui. Agora. Seguro/a.<br><br>Respire uma vez longa e lenta.', btn:'Concluído ✓' },
        ]
      }
    ]
  },

  /* ─────────────────────────────────────────
     M6: Reestruturação Cognitiva
     ───────────────────────────────────────── */
  {
    id:'m6', color:'amber', emoji:'🔧',
    levelTag:'Nível 3 — Regulação',
    title:'Reestruturação Cognitiva',
    tagline:'Questionar pensamentos, não suprimi-los',
    xp:80, badgeId:'b_m6', unlockAfter:'m5',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Pensamentos automáticos e distorções',
        content:`<p class="step-text">Na TCC, identificamos que pensamentos automáticos negativos tendem a seguir padrões distorcidos. Reconhecê-los reduz seu poder.</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip coral" style="margin:0"><strong>Catastrofização:</strong> "Com certeza vai dar errado e vai ser terrível."</div>
  <div class="tip coral" style="margin:0"><strong>Leitura mental:</strong> "Todo mundo está me julgando."</div>
  <div class="tip coral" style="margin:0"><strong>Previsão do futuro:</strong> "Eu sei que vou fracassar."</div>
  <div class="tip coral" style="margin:0"><strong>Tudo ou nada:</strong> "Se não for perfeito, não presta."</div>
  <div class="tip coral" style="margin:0"><strong>Desconto do positivo:</strong> "Fui bem desta vez, mas foi sorte."</div>
</div>
<div class="tip mint"><strong>💡 Objetivo:</strong> Não é <em>pensar positivo</em> — é pensar com <em>mais precisão e equilíbrio</em>. A realidade raramente é tão catastrófica quanto o pensamento ansioso sugere.</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'Identifique a distorção cognitiva',
        question:'"Errei uma questão na prova. Sou completamente burra e nunca vou conseguir nada na vida."',
        opts:[
          { text:'Leitura mental', correct:false },
          { text:'Tudo ou nada + Catastrofização', correct:true },
          { text:'Desconto do positivo', correct:false },
          { text:'Previsão do futuro', correct:false },
        ],
        feedbackOk:'✅ Exato! "Completamente burra" é pensamento tudo-ou-nada, e "nunca vou conseguir nada" é catastrofização. As duas costumam aparecer juntas.',
        feedbackNo:'Aqui há duas distorções combinadas: <strong>tudo ou nada</strong> ("completamente burra") e <strong>catastrofização</strong> ("nunca vou conseguir nada"). Distorções frequentemente aparecem em pares.'
      },
      {
        type:'fill', typeLabel:'✍️ Registro ABC',
        title:'Seu registro de pensamento',
        prompt:'Pense numa situação recente que gerou ansiedade e preencha:\n\nA) SITUAÇÃO: O que aconteceu? Onde/quando?\n\nB) PENSAMENTO AUTOMÁTICO: O que passou pela sua cabeça?\n\nC) EMOÇÃO + INTENSIDADE (0-10): O que você sentiu?\n\nD) ALTERNATIVA EQUILIBRADA: Como alguém de fora, sem ansiedade, veria a situação?',
        placeholder:'A) Situação: ...\n\nB) Pensamento automático: ...\n\nC) Emoção (intensidade 0-10): ...\n\nD) Perspectiva equilibrada: ...',
        minChars:80
      }
    ]
  },

  /* ─────────────────────────────────────────
     M7: Desfusão e ACT
     ───────────────────────────────────────── */
  {
    id:'m7', color:'lav', emoji:'🌊',
    levelTag:'Nível 4 — Transformação',
    title:'Desfusão e Aceitação (ACT)',
    tagline:'Mudar a relação com os pensamentos',
    xp:90, badgeId:'b_m7', unlockAfter:'m6',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Fusão vs. desfusão cognitiva',
        content:`<p class="step-text">Na <strong>fusão cognitiva</strong> (ACT — Hayes), você se torna o pensamento. O pensamento "Sou incompetente" vira verdade absoluta, não um evento mental.</p>
<p class="step-text" style="margin-top:10px">Na <strong>desfusão</strong>, você cria distância: <em>"Estou tendo o pensamento de que sou incompetente."</em> Isso não muda o conteúdo — muda a relação com ele.</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip lav" style="margin:0"><strong>Técnica 1 — Nomeie o pensamento:</strong><br>"Estou tendo o pensamento de que..."</div>
  <div class="tip lav" style="margin:0"><strong>Técnica 2 — Dê um nome à sua mente:</strong><br>"Lá vem o Rádio Catástrofe novamente..."</div>
  <div class="tip lav" style="margin:0"><strong>Técnica 3 — Imagem do observador:</strong><br>Você é o céu. Pensamentos são nuvens passando. Você não é as nuvens.</div>
  <div class="tip lav" style="margin:0"><strong>Técnica 4 — Atenção desapegada (MCT):</strong><br>Observe o pensamento como espectador curioso. Não analise, não combata — observe a chegada e saída.</div>
</div>`
      },
      {
        type:'guided', typeLabel:'⚙️ Exercícios de desfusão',
        title:'Praticando a distância dos pensamentos',
        phases:[
          { num:'Exercício 1', title:'Nomeando o processo', text:'Traga à mente uma preocupação recorrente.<br><br>Em vez de pensar <em>o pensamento</em>, diga em voz alta ou mentalmente:<br><br><em>"Minha mente está tendo o pensamento de que [preocupação]."</em><br><br>Perceba a diferença. Você é quem observa — não o pensamento.', btn:'Próximo exercício' },
          { num:'Exercício 2', title:'A imagem da nuvem', text:'Imagine um céu azul amplo. Cada pensamento preocupante é uma nuvem passando.<br><br>Não tente afastar as nuvens. Não siga elas. Apenas observe do ponto de vista do céu.<br><br>Você é o céu — sempre presente, sempre maior que qualquer nuvem.<br><br>Fique 30 segundos com essa imagem.', btn:'Próximo exercício' },
          { num:'Exercício 3', title:'Clareza de valores', text:'A ACT trabalha com <strong>valores</strong> como bússola de ação. Diferente de metas, valores são direções contínuas.<br><br>Pergunte-se: mesmo que a preocupação esteja presente, <em>o que importa para mim?</em><br><br>Família. Saúde. Criatividade. Crescimento. Integridade. O que ressoa?<br><br>Esses são seus valores guia.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Meus valores guia',
        title:'O que importa para mim?',
        prompt:'Liste 3-5 valores que são fundamentais para você. Para cada um, escreva uma forma concreta de agir segundo esse valor esta semana — mesmo que a preocupação esteja presente.',
        placeholder:'Valor 1: ... → Esta semana vou...\n\nValor 2: ... → Esta semana vou...\n\nValor 3: ... → Esta semana vou...',
        minChars:60
      }
    ]
  },

  /* ─────────────────────────────────────────
     M8: Autocompaixão (TFC/CFT — Gilbert)
     ───────────────────────────────────────── */
  {
    id:'m8', color:'coral', emoji:'💚',
    levelTag:'Nível 4 — Transformação',
    title:'Autocompaixão para a Ansiedade',
    tagline:'TFC/CFT — o sistema calmante em ação',
    xp:100, badgeId:'b_m8', unlockAfter:'m7',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Os três sistemas de Gilbert',
        content:`<p class="step-text">Paul Gilbert identificou três sistemas emocionais que todo ser humano possui. Na ansiedade, o sistema de <strong style="color:var(--coral-d)">Ameaça</strong> domina — é hiperativo, exigindo atenção constante.</p>
${svgThreeSystems()}
<p class="step-text">A Terapia Focada na Compaixão (TFC/CFT) não tenta eliminar o sistema de Ameaça — ele é necessário. O objetivo é <strong>fortalecer o sistema Calmante</strong>, criando equilíbrio.</p>
<div class="tip mint">O sistema calmante é ativado por: calor humano, toque gentil, respiração lenta, presença segura e — crucialmente — por como <strong>você fala consigo mesmo/a</strong>.</div>`
      },
      {
        type:'breath', typeLabel:'🌬️ Respiração do ritmo calmante',
        instruction:'Esta respiração, desenvolvida por Gilbert, é mais lenta e focada na <em>sensação</em> de calma — não apenas na mecânica. Imagine que cada expiração libera tensão e cada inspiração traz leveza.<br><br>Ritmo: inspire suavemente pelo nariz (5s), expire lentamente pela boca (7s). Sem segurar.<br><br>Toque para começar. Faça 4 ciclos com atenção plena.',
        pattern:[ {label:'Inspira suave',dur:5,cls:'expand soothe'},{label:'Expira lenta',dur:7,cls:'contract soothe'} ],
        totalCycles:4
      },
      {
        type:'guided', typeLabel:'🌿 Lugar seguro (TFC)',
        title:'Criando seu lugar seguro interno',
        phases:[
          { num:'Preparação', title:'Postura e intenção', text:'Sente-se confortavelmente. Feche os olhos ou suavize o olhar.<br><br>Respire devagar duas vezes. Com cada expiração, sinta o peso do corpo apoiado na cadeira.<br><br>Intenção: você vai criar um lugar mental de segurança e calor — um recurso que você pode acessar a qualquer momento.', btn:'Estou pronto/a' },
          { num:'Criando o lugar', title:'Onde você se sente completamente seguro/a?', text:'Pode ser real ou imaginado: uma praia, uma floresta, um quarto aconchegante, um abraço... Deixe uma imagem surgir naturalmente.<br><br>Explore com os sentidos: <em>O que você vê? Que sons existem? Qual é a temperatura? Há algum cheiro?</em><br><br>Não force — deixe se construir aos poucos.', btn:'Próxima fase' },
          { num:'Aprofundando', title:'Registrando a sensação no corpo', text:'Agora, onde no corpo você sente a segurança desse lugar?<br><br>No peito relaxado? No ombro que desce? Na respiração mais suave?<br><br>Foque nessa sensação. Ela é real — você a criou. E seu sistema nervoso não diferencia imagem de realidade nível emocional.<br><br>Fique aqui por 30 segundos.', btn:'Próxima fase' },
          { num:'Ancoragem', title:'Um gesto de retorno', text:'Crie um gesto simples que represente este lugar — como tocar suavemente o peito, ou cruzar as mãos sobre o coração.<br><br>Toda vez que fizer este gesto + respirar uma vez lenta, você está enviando ao sistema nervoso uma mensagem de segurança.<br><br>Este é o seu âncora. Ele fica com você.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'guided', typeLabel:'💚 O Self Compassivo',
        title:'Desenvolvendo o observador compassivo',
        phases:[
          { num:'Conceito', title:'Quem é o self compassivo?', text:'Na TFC, desenvolvemos o "self compassivo" — a parte de você que é <strong>sábia, forte e genuinamente cuidadosa</strong> com seu próprio sofrimento.<br><br>Não é perfeccionismo. Não é condescendência. É a mesma qualidade de cuidado que você teria com alguém que ama muito e está sofrendo.<br><br>Essa parte existe em você — às vezes só precisa ser cultivada.', btn:'Próxima fase' },
          { num:'Prática', title:'Ativando o self compassivo', text:'Traga à mente sua ansiedade ou preocupação atual. Sinta-a por um momento.<br><br>Agora imagine que existe dentro de você uma versão muito sábia, calorosa e forte — que observa com gentileza.<br><br>O que essa versão diria para você agora? Com que tom de voz? Com que expressão?<br><br>Não force — deixe surgir. Pode ser uma sensação de calor, uma imagem, uma frase gentil.', btn:'Próxima fase' },
          { num:'Compaixão na ansiedade', title:'Para o sistema de Ameaça hiperativo', text:'Seu sistema de Ameaça está trabalhando demais — tentando proteger você. Não é seu inimigo.<br><br>O self compassivo reconhece: <em>"Eu vejo que você está com medo. É difícil. Eu estou aqui. Você não está sozinho/a nisto."</em><br><br>Esta não é fraqueza. É o recurso regulatório mais poderoso que a evolução nos deu — o sistema de afiliação e cuidado.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Carta do self compassivo',
        title:'Uma carta para sua parte ansiosa',
        prompt:'Escreva uma carta curta (3-5 parágrafos) do seu self compassivo para a sua parte ansiosa. Inclua:\n— Reconhecimento do sofrimento (sem minimizar)\n— Perspectiva sábia sobre a situação\n— Uma afirmação de que você pode lidar com isso\n\nEscreva com o tom que usaria para alguém que você ama muito.',
        placeholder:'Querida [seu nome],\n\nEu vejo que você está...\n\nSei que parece...\n\nO que eu quero que você saiba é...',
        minChars:100
      }
    ]
  },
]; // end MODULES

/* ══════════════════════════════════
   NAVIGATION
   ══════════════════════════════════ */
const SCREENS = ['home','modules','module','diary','progress','assess','dados','pretest'];
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
  // hide/show nav for pretest
  const nav = document.getElementById('nav');
  if(nav) nav.style.display = (s==='pretest') ? 'none' : '';
  if(s==='home')     renderHome();
  if(s==='modules')  renderModuleList();
  if(s==='diary')    renderDiary();
  if(s==='progress') renderProgress();
  if(s==='assess')   renderAssess();
  if(s==='pretest')  renderPretest();
  if(s==='dados'){ renderDadosSync(); renderReminderUI(); }
}

/* ══════════════════════════════════
   ONBOARDING
   ══════════════════════════════════ */
let _obSel=-1;
let _obDemo={};   // temp demographics before saving
function obNext(n){ document.getElementById('obs'+(n-1)).classList.remove('on'); document.getElementById('obs'+n).classList.add('on'); }
function obSelect(el,v){
  _obSel=v;
  document.querySelectorAll('.ob-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  const btn=document.getElementById('ob-btn3');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; }
  D.obLevel=v;
}
function obSkip(){
  // skip directo ao fim, mantém campos vazios
  obDone();
}
function obConsentToggle(cb){
  const btn=document.getElementById('ob-btn5');
  if(!btn) return;
  btn.disabled = !cb.checked;
  btn.style.opacity = cb.checked ? '1' : '';
  D.consentGiven = cb.checked;
}
/* Selecciona pill demográfico (gender / therapy) */
function demoPick(field, value, el){
  _obDemo[field] = value;
  // toggle visual dentro do mesmo grupo
  el.closest('.demo-pill-row').querySelectorAll('.demo-pill').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
}
/* Chamado pelo botão final da slide de perfil */
function obFinish(){
  // lê campos de texto
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
  obDone();
  // auto-sync: envia dados demográficos + consentimento (sem pré-teste ainda)
  syncToResearch({ silent: true, requirePretest: false });
}
function obDone(){
  D.obDone=true;
  D.consentGiven=true;
  if(!D.consentDate) D.consentDate = new Date().toISOString();
  save();
  trackAppEvent('onboarding_complete');
  document.getElementById('onboard').classList.add('hide');
  // Route to pretest if not yet done
  if(!D.pretest){
    goTo('pretest');
  } else {
    goTo('home');
  }
}

/* ══════════════════════════════════
   ANALYTICS
   ══════════════════════════════════ */
let _sessionStart = Date.now();
function trackAppEvent(event){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[] };
  D.analytics.sessions.push({ ts: Date.now(), event });
  save();
}
function trackModuleEvent(moduleId, event){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[] };
  D.analytics.moduleEvents.push({ ts: Date.now(), moduleId, event });
  save();
}
function trackDiaryEvent(){
  if(!D.analytics) D.analytics={ sessions:[], moduleEvents:[], diaryEvents:[] };
  D.analytics.diaryEvents.push({ ts: Date.now() });
  save();
}

/* ══════════════════════════════════
   MCQ-30 DATA
   ══════════════════════════════════ */
// Wells (1997) — 5 subscales × 6 items, scored 1-4
// Subscales: WF=Worry about worry/Fear, CW=Cognitive avoidance,
//            NC=Negative consequences, PR=Positive worry beliefs, NB=Need to control
const MCQ30_ITEMS = [
  // Positive beliefs about worry (PR)
  { id:0,  text:'Preocupar-me me ajuda a enfrentar os problemas.', sub:'pr' },
  { id:1,  text:'Preocupar-me mantém minha atenção nas coisas certas.', sub:'pr' },
  { id:2,  text:'Preocupar-me me ajuda a resolver problemas.', sub:'pr' },
  { id:3,  text:'Preocupar-me me ajuda a evitar que coisas ruins aconteçam.', sub:'pr' },
  { id:4,  text:'Preocupar-me me motiva a agir.', sub:'pr' },
  { id:5,  text:'Preocupar-me me ajuda a preparar o melhor possível.', sub:'pr' },
  // Negative beliefs about worry / uncontrollability (NC)
  { id:6,  text:'Não consigo controlar meus pensamentos preocupantes.', sub:'nc' },
  { id:7,  text:'Minha preocupação é incontrolável.', sub:'nc' },
  { id:8,  text:'Quando começo a me preocupar, não consigo parar.', sub:'nc' },
  { id:9,  text:'Minha preocupação continua, independentemente do que eu faça.', sub:'nc' },
  { id:10, text:'Eu não tenho controle sobre minha preocupação.', sub:'nc' },
  { id:11, text:'Minhas preocupações são incontroláveis.', sub:'nc' },
  // Cognitive confidence (CW — baixo = problema)
  { id:12, text:'Tenho pouca confiança na minha memória para palavras e nomes.', sub:'cw' },
  { id:13, text:'Tenho dificuldade em saber se realmente fiz alguma coisa ou apenas pensei em fazer.', sub:'cw' },
  { id:14, text:'Tenho dificuldade em saber se lembro algo com precisão.', sub:'cw' },
  { id:15, text:'Às vezes não sei se estou realmente fazendo algo ou apenas pensando nisso.', sub:'cw' },
  { id:16, text:'Tenho dificuldade em saber se preste atenção a alguma coisa.', sub:'cw' },
  { id:17, text:'Às vezes não sei se tenho certeza de minhas ações passadas.', sub:'cw' },
  // Need to control thoughts (NB)
  { id:18, text:'Não ser capaz de controlar meus pensamentos é sinal de fraqueza.', sub:'nb' },
  { id:19, text:'Deixar de controlar meus pensamentos é um sinal de que sou fraco/a.', sub:'nb' },
  { id:20, text:'Seria irresponsável não controlar meus pensamentos.', sub:'nb' },
  { id:21, text:'Deixar meus pensamentos fora de controle é perigoso.', sub:'nb' },
  { id:22, text:'Tenho que manter o controle dos meus pensamentos o tempo todo.', sub:'nb' },
  { id:23, text:'Se não controlar meus pensamentos algo ruim vai acontecer.', sub:'nb' },
  // Cognitive self-consciousness / fear (WF)
  { id:24, text:'Estou constantemente consciente dos meus pensamentos.', sub:'wf' },
  { id:25, text:'Monitoro meus pensamentos.', sub:'wf' },
  { id:26, text:'Presto muita atenção à forma como funciona minha mente.', sub:'wf' },
  { id:27, text:'Tenho medo de não poder controlar meus pensamentos.', sub:'wf' },
  { id:28, text:'Tenho medo de perder o controle dos meus pensamentos.', sub:'wf' },
  { id:29, text:'Não confio na minha mente.', sub:'wf' },
];
const MCQ30_LABELS = ['Discordo','Concordo um pouco','Concordo bastante','Concordo totalmente'];
const MCQ30_SUB_NAMES = { pr:'Crenças positivas', nc:'Incontrolabilidade', cw:'Confiança cognitiva', nb:'Controle de pensamentos', wf:'Autoconsciência cognitiva' };

/* ══════════════════════════════════
   PRETEST / POSTTEST
   ══════════════════════════════════ */
let _pt = {
  phase: 'gad7',  // 'gad7' | 'mcq30' | 'done'
  isPost: false,
  gad7Answers: [],
  gad7Q: 0,
  mcq30Answers: [],
  mcq30Q: 0,
};

function renderPretest(){
  _pt.phase = 'gad7';
  _pt.gad7Answers = [];
  _pt.gad7Q = 0;
  _pt.mcq30Answers = [];
  _pt.mcq30Q = 0;
  _pt.isPost = !!D.pretest; // if pretest exists this is posttest
  const el = document.getElementById('pretest-content');
  el.innerHTML = '';
  renderPretestGAD7();
}

function pretestProgress(){
  const gTotal = GAD_Q.length + MCQ30_ITEMS.length;
  const done = _pt.gad7Answers.length + _pt.mcq30Answers.length;
  return Math.round(done / gTotal * 100);
}

function renderPretestGAD7(){
  const q = _pt.gad7Q;
  const pct = pretestProgress();
  const el = document.getElementById('pretest-content');
  const isPost = _pt.isPost;
  el.innerHTML = `
  <div class="pretest-wrap">
    <div class="pretest-hdr">
      ${q===0 ? `<h2>${isPost?'📊 Reavaliação':'🧭 Pré-avaliação'}</h2>
      <p>${isPost
        ? 'Vamos verificar como você está agora para comparar com quando começou.'
        : 'Antes de zarpar, queremos entender como você está. Leva cerca de 5 minutos.'}</p>` : ''}
    </div>
    <div class="pretest-prog-bar">
      <div class="pretest-prog-fill" style="width:${pct}%"></div>
    </div>
    <div class="pt-section">
      <div class="pt-section-lbl">GAD-7 — Ansiedade Generalizada <span>Pergunta ${q+1}/${GAD_Q.length}</span></div>
      <div class="pt-q-wrap">
        <div class="pt-q-text">Nas últimas 2 semanas, com que frequência: <em>${GAD_Q[q]}</em></div>
        <div class="pt-scale">
          ${GAD_O.map((o,i)=>`<button class="scale-btn" onclick="answerGAD7(${i})">${o}</button>`).join('')}
        </div>
      </div>
    </div>
    ${pretestFooterHTML()}
  </div>`;
}

/* Rodapé do pré/pós-teste: corrigir resposta anterior + adiar */
function pretestFooterHTML(){
  const canBack = _pt.gad7Answers.length > 0 || _pt.mcq30Answers.length > 0;
  return `<div class="pt-footer">
    ${canBack?`<button class="pt-link" onclick="pretestBack()">← Corrigir anterior</button>`:'<span></span>'}
    ${!_pt.isPost?`<button class="pt-link muted" onclick="pretestLater()">Responder depois</button>`:''}
  </div>`;
}

function pretestBack(){
  if(_pt.phase==='mcq30'){
    if(_pt.mcq30Q > 0){ _pt.mcq30Answers.pop(); _pt.mcq30Q--; renderPretestMCQ30(); }
    else { _pt.phase='gad7'; _pt.gad7Answers.pop(); _pt.gad7Q--; renderPretestGAD7(); }
  } else if(_pt.gad7Q > 0){
    _pt.gad7Answers.pop(); _pt.gad7Q--; renderPretestGAD7();
  }
}

function pretestLater(){
  trackAppEvent('pretest_postponed');
  toast('Sem problema — a pré-avaliação fica à sua espera. 🧭');
  goTo('home');
}

function answerGAD7(v){
  _pt.gad7Answers.push(v);
  _pt.gad7Q++;
  if(_pt.gad7Q < GAD_Q.length){
    renderPretestGAD7();
  } else {
    _pt.phase = 'mcq30';
    renderPretestMCQ30();
  }
}

function renderPretestMCQ30(){
  const q = _pt.mcq30Q;
  const pct = pretestProgress();
  const el = document.getElementById('pretest-content');
  const item = MCQ30_ITEMS[q];
  el.innerHTML = `
  <div class="pretest-wrap">
    <div class="pretest-prog-bar">
      <div class="pretest-prog-fill" style="width:${pct}%"></div>
    </div>
    <div class="pt-section">
      <div class="pt-section-lbl">MCQ-30 — Crenças sobre preocupação <span>Pergunta ${q+1}/${MCQ30_ITEMS.length}</span></div>
      <div class="mcq-item">
        <div class="mcq-q">${item.text}</div>
        <div class="mcq-scale">
          ${MCQ30_LABELS.map((l,i)=>`<button class="scale-btn" onclick="answerMCQ30(${i+1})">${l}</button>`).join('')}
        </div>
      </div>
    </div>
    <p style="font-size:12px;color:var(--light);text-align:center;margin-top:4px">Não há respostas certas ou erradas — responda com sinceridade.</p>
    ${pretestFooterHTML()}
  </div>`;
}

function answerMCQ30(v){
  _pt.mcq30Answers.push(v);
  _pt.mcq30Q++;
  if(_pt.mcq30Q < MCQ30_ITEMS.length){
    renderPretestMCQ30();
  } else {
    finishPretest();
  }
}

function calcMCQ30Scores(answers){
  const subs = { pr:0, nc:0, cw:0, nb:0, wf:0 };
  MCQ30_ITEMS.forEach((item,i)=>{ subs[item.sub] += answers[i]; });
  return subs;
}

/* ══════════════════════════════════
   TAILORING — ordem personalizada de módulos
   Mapeamento pré-teste → caminho:
   · GAD-7 ≥ 15 (severo)  → M5 (regulação) logo após M1: estabilizar antes de trabalho cognitivo
   · MCQ nc ≥ 15 (incontrolabilidade) → M7 (desfusão/ACT) + M4 (adiamento/MCT) cedo:
     mudar a relação com o pensamento antes de questionar conteúdo
   · MCQ pr ≥ 15 (crenças positivas)  → M3 (metacognições) cedo e M6 (reestruturação) por último:
     evitar reforçar a crença de que a preocupação precisa ser "resolvida"
   · MCQ nb ≥ 15 (controle = fraqueza, proxy de autocrítica) → M8 (TFC) antes das técnicas ativas
   Limiar 15 = acima do ponto médio da subescala (6–24).
   ══════════════════════════════════ */
function computeRecommendedPath(pretest){
  const s = pretest.mcq30.scores, gad = pretest.gad7.score;
  const HI = 15;
  const reasons = [];
  const boosts = [];
  if(s.nc >= HI){ boosts.push('m7','m4'); reasons.push('As preocupações parecem difíceis de controlar → começamos por técnicas que mudam a <strong>relação</strong> com os pensamentos (desfusão e adiamento), em vez de lutar contra eles.'); }
  if(s.pr >= HI){ boosts.push('m3'); reasons.push('Preocupar-se parece útil/protetor para você → trabalhamos primeiro as <strong>crenças sobre a preocupação</strong>, antes de técnicas de questionar pensamentos.'); }
  if(s.nb >= HI){ boosts.push('m8'); reasons.push('Há autocobrança sobre os próprios pensamentos → a <strong>autocompaixão</strong> vem antes das técnicas mais ativas.'); }
  let rest = ['m3','m4','m5','m6','m7','m8'];
  if(s.pr >= HI) rest = rest.filter(id=>id!=='m6').concat('m6');
  const ordered = [...new Set([...boosts, ...rest])];
  let path;
  if(gad >= 15){
    reasons.unshift('Sua ansiedade está intensa agora → a <strong>regulação pelo corpo</strong> vem logo no início, para ter alívio prático desde já.');
    path = ['m1','m5','m2', ...ordered.filter(id=>id!=='m5')];
  } else {
    path = ['m1','m2', ...ordered];
  }
  return { recommendedPath: path, reasons, computedAt: today() };
}

const DEFAULT_PATH = ['m1','m2','m3','m4','m5','m6','m7','m8'];
function effectivePath(){
  const p = D.userProfile?.recommendedPath;
  if(Array.isArray(p) && p.length===DEFAULT_PATH.length && DEFAULT_PATH.every(id=>p.includes(id))) return p;
  return DEFAULT_PATH;
}

function finishPretest(){
  const gad7Score = _pt.gad7Answers.reduce((a,b)=>a+b,0);
  const gadLv = gad7Level(gad7Score);
  const mcq30Scores = calcMCQ30Scores(_pt.mcq30Answers);

  const result = {
    gad7: { score: gad7Score, level: gadLv, answers: [..._pt.gad7Answers] },
    mcq30: { scores: mcq30Scores, answers: [..._pt.mcq30Answers] },
    date: today(),
  };

  if(_pt.isPost){
    D.posttest = result;
    D.posttestRemindAfter = null;
    save();
    trackAppEvent('posttest_complete');
    // auto-sync: envia dados completos pré+pós-teste para investigação
    syncToResearch({ silent: true });
    showPosttestDelta();
  } else {
    D.pretest = result;
    save();
    trackAppEvent('pretest_complete');
    // update assessment from GAD-7 pretest scores
    D.assessment = { score: gad7Score, level: gadLv, date: today(), answers: [..._pt.gad7Answers] };
    // tailoring: caminho personalizado a partir dos escores
    D.userProfile = computeRecommendedPath(result);
    save();
    // show brief thank-you then go home — com rede de segurança se score severo
    const el = document.getElementById('pretest-content');
    el.innerHTML = `
    <div class="pretest-wrap" style="text-align:center;padding-top:60px">
      <div style="font-size:56px;margin-bottom:20px">🏮</div>
      <h2 style="font-size:22px;font-weight:800;margin-bottom:10px">O Farol está aceso!</h2>
      <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:24px">
        Avaliação registrada. Ao longo da travessia voltaremos a medir<br>para ver o quanto você progrediu.
      </p>
      ${D.userProfile && effectivePath().join()!==DEFAULT_PATH.join() ? `<div class="tip mint" style="text-align:left;max-width:340px;margin:0 auto 8px">🧭 <strong>Sua travessia foi personalizada:</strong> com base nas suas respostas, ajustamos a ordem dos módulos para o que tende a ajudar mais primeiro. Veja em "Módulos".</div>` : ''}
      ${gadLv==='sev' ? crisisCardHTML() : ''}
      <button class="btn" style="max-width:320px;margin:16px auto 0" onclick="goTo('home')">Começar a travessia ⛵</button>
    </div>`;
  }
}

/* Post-test trigger */
function checkPosttestTrigger(){
  if(D.posttest) return; // already done
  if(!D.pretest) return; // pretest not done yet
  if(D.posttestRemindAfter){
    const remind = new Date(D.posttestRemindAfter);
    if(new Date() < remind) return;
  }
  // trigger if: 3+ modules done OR 5+ diary entries after pretest
  const doneMods = MODULES.filter(m=>D.moduleProgress[m.id]?.done).length;
  const pretestTs = new Date(D.pretest.date+'T12:00').getTime();
  const diaryAfter = D.entries.filter(e=>e.ts>pretestTs).length;
  if(doneMods >= 3 || diaryAfter >= 5){
    setTimeout(showPosttestPrompt, 1200);
  }
}

function showPosttestPrompt(){
  if(document.getElementById('modal-ov').classList.contains('on')) return;
  document.getElementById('modal-title').textContent='📊 Como você está agora?';
  document.getElementById('modal-body').textContent='Você já percorreu um bom trecho! Que tal uma reavaliação rápida (≈5 min) para ver o quanto progrediu?';
  document.getElementById('modal-actions').innerHTML=`
    <button class="btn mint" onclick="startPosttest()">Fazer reavaliação</button>
    <button class="btn ghost" onclick="dismissPosttest()">Agora não</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

function dismissPosttest(){
  // remind again in 7 days
  const d = new Date(); d.setDate(d.getDate()+7);
  D.posttestRemindAfter = d.toISOString();
  save();
  document.getElementById('modal-ov').classList.remove('on');
}

function startPosttest(){
  document.getElementById('modal-ov').classList.remove('on');
  _pt.isPost = true;
  _pt.phase = 'gad7';
  _pt.gad7Answers = [];
  _pt.gad7Q = 0;
  _pt.mcq30Answers = [];
  _pt.mcq30Q = 0;
  goTo('pretest');
}

function showPosttestDelta(){
  const pre = D.pretest, post = D.posttest;
  const gadDelta = post.gad7.score - pre.gad7.score;
  const gadDir = gadDelta < 0 ? 'better' : gadDelta > 0 ? 'worse' : 'same';
  const gadArrow = gadDelta < 0 ? '▼' : gadDelta > 0 ? '▲' : '—';
  const subs = Object.keys(MCQ30_SUB_NAMES);
  const subsRows = subs.map(s=>{
    const d2 = post.mcq30.scores[s] - pre.mcq30.scores[s];
    const dir = (s==='cw') ? (d2>0?'better':d2<0?'worse':'same') : (d2<0?'better':d2>0?'worse':'same');
    const arrow = d2<0?'▼':d2>0?'▲':'—';
    return `<div class="delta-row">
      <span class="delta-lbl">${MCQ30_SUB_NAMES[s]}</span>
      <span class="delta-vals">
        <span>${pre.mcq30.scores[s]}</span>
        <span class="delta-arrow ${`delta-${dir}`}">${arrow}</span>
        <span>${post.mcq30.scores[s]}</span>
      </span>
    </div>`;
  }).join('');

  const el = document.getElementById('pretest-content');
  el.innerHTML = `
  <div class="delta-wrap">
    <div class="delta-hdr">
      <div style="font-size:52px;margin-bottom:14px">${gadDelta<=0?'🌟':'💙'}</div>
      <h2>Progresso da Travessia</h2>
      <p>Comparando o momento em que você chegou ao Farol com agora.</p>
    </div>
    <div class="delta-card">
      <div class="card-lbl" style="margin-bottom:8px">GAD-7 — Ansiedade</div>
      <div class="delta-row" style="border:none;padding:4px 0">
        <span class="delta-lbl">Pontuação (0–21)</span>
        <span class="delta-vals">
          <span style="color:var(--muted)">${pre.gad7.score}</span>
          <span class="delta-arrow delta-${gadDir}">${gadArrow}</span>
          <span class="delta-${gadDir==='better'?'better':'worse'}" style="font-size:16px">${post.gad7.score}</span>
        </span>
      </div>
      ${gadDelta<0?'<div style="font-size:13px;color:var(--mint-d);margin-top:8px">'+Math.abs(gadDelta)+' pontos a menos — isso é significativo! 🎉</div>':''}
    </div>
    <div class="delta-card">
      <div class="card-lbl" style="margin-bottom:8px">MCQ-30 — Crenças sobre preocupação</div>
      ${subsRows}
    </div>
    <button class="btn mint" onclick="goTo('home')" style="margin-top:8px">Ver meu progresso completo</button>
    <button class="btn ghost" onclick="goTo('progress')" style="margin-top:0">Ver conquistas</button>
  </div>`;
}

/* ══════════════════════════════════
   HOME
   ══════════════════════════════════ */
const SUBS = ['Cada prática conta. Você está aqui.','Observar sem julgar é um ato corajoso.','Seu sistema nervoso aprende com sua atenção.','Pequenas pausas fazem grande diferença.','A consistência supera a intensidade.','Preocupar-se é humano. Navegar, é habilidade.'];
function renderHome(){
  const now=new Date(), h=now.getHours();
  const gr = h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  document.getElementById('h-date').textContent = DIAS[now.getDay()]+', '+now.getDate()+' de '+MESES[now.getMonth()];
  document.getElementById('h-hi').textContent   = D.nickname ? gr+', '+D.nickname+' 👋' : gr+' 👋';
  document.getElementById('h-sub').textContent  = SUBS[now.getDate()%SUBS.length];
  renderNudge();
  renderDoseCard();

  // XP bar
  const lv = getLevel(D.xp), pct = getLevelPct(D.xp), nextLv = LEVELS[lv.n] || lv;
  document.getElementById('h-xp').innerHTML =
    `<div class="xp-wrap">
      <div class="xp-head">
        <span class="xp-level">${lv.emoji} Nível ${lv.n} — ${lv.name}</span>
        <span class="xp-val">${D.xp} XP</span>
      </div>
      <div class="xp-bar-bg"><div class="xp-bar" style="width:${pct}%"></div></div>
      <div class="xp-label" style="margin-top:5px">${lv.n<5?'Para o próximo nível: '+(nextLv.min-D.xp)+' XP restantes':'🏆 Nível máximo atingido!'}</div>
    </div>`;

  // Stats
  const done = MODULES.filter(m=>D.moduleProgress[m.id]?.done).length;
  const streak = calcStreak();
  document.getElementById('hs-mod').textContent = done+'/'+MODULES.length;
  document.getElementById('hs-str').textContent = streak;
  document.getElementById('hs-xp').textContent  = D.xp;
  document.getElementById('h-assess-sub').textContent = D.assessment?'Refazer avaliação':'GAD-7 · Conheça seu padrão';

  // Next module — segue o caminho recomendado
  const next = effectivePath().map(id=>MODULES.find(m=>m.id===id))
    .find(m=>!D.moduleProgress[m.id]?.done && isUnlocked(m));
  document.getElementById('h-mod-sub').textContent = next ? '▶ '+next.title : done===MODULES.length ? '✅ Todos concluídos!' : 'Continue aprendendo';

  renderMiniChart('h-chart','h-chart-empty');

  // Recent entry
  const rll=document.getElementById('h-rec-lbl'), rp=document.getElementById('h-rec');
  if(!D.entries.length){ rll.style.display='none'; rp.innerHTML=''; return; }
  rll.style.display='block';
  rp.innerHTML = buildEntry([...D.entries].sort((a,b)=>b.ts-a.ts)[0]);
}

function calcStreak(){
  if(!D.entries.length) return 0;
  const dates=[...new Set(D.entries.map(e=>e.date))].sort().reverse();
  let s=0,t=today(),y=prevDay(1);
  if(dates[0]===t||dates[0]===y){ s=1; for(let i=1;i<dates.length;i++){ const a=new Date(dates[i-1]+'T12:00'),b=new Date(dates[i]+'T12:00'); if(Math.round((a-b)/864e5)===1)s++; else break; } }
  return s;
}

function renderMiniChart(svgId,emptyId){
  const svg=document.getElementById(svgId), em=document.getElementById(emptyId);
  if(!svg) return;
  const days=Array.from({length:7},(_,i)=>prevDay(6-i));
  const vals=days.map(d=>{ const de=D.entries.filter(e=>e.date===d); return de.length?de.reduce((a,e)=>a+e.after,0)/de.length:null; });
  if(!vals.some(v=>v!==null)){ svg.style.display='none'; if(em)em.style.display='block'; return; }
  svg.style.display='block'; if(em)em.style.display='none';
  const W=320,H=72,px=14,py=10,step=(W-2*px)/6;
  const pts=vals.map((v,i)=>({x:px+i*step,y:v===null?null:H-py-((v-1)/4)*(H-2*py),v}));
  const valid=pts.filter(p=>p.y!==null);
  const col=valid.length>=2&&valid[valid.length-1].v>valid[0].v+.4?'#D96C63':'#5E7D73';
  let pd=''; pts.forEach(p=>{if(p.y!==null)pd+=pd?'L'+p.x+','+p.y:'M'+p.x+','+p.y;});
  const f=valid[0],l=valid[valid.length-1];
  svg.innerHTML='<defs><linearGradient id="cg'+svgId+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+col+'" stop-opacity=".18"/><stop offset="100%" stop-color="'+col+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+pd+' L'+l.x+','+H+' L'+f.x+','+H+' Z" fill="url(#cg'+svgId+')"/>'+
    '<path d="'+pd+'" fill="none" stroke="'+col+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    valid.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="3.5" fill="'+col+'"/>').join('')+
    days.map((d,i)=>'<text x="'+(px+i*step)+'" y="'+H+'" text-anchor="middle" font-size="9" fill="#A0ADB8" font-family="Nunito Sans,sans-serif">'+DIAS_C[new Date(d+'T12:00').getDay()]+'</text>').join('');
}

function buildEntry(e){
  const dt=new Date(e.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  const tb=e.type==='c'?'<span class="badge-tag bt">Posso agir</span>':e.type==='n'?'<span class="badge-tag bs">Deixar ir</span>':'';
  const ab=e.after<=2?'😌 melhorou':e.after===3?'😐 igual':'😟 mais intenso';
  const ss=(e.strategies||[]).map(s=>'<span class="badge-tag bl">'+esc(s)+'</span>').join('');
  return '<div class="entry"><div class="entry-dt">'+dt+'</div><div class="entry-w">'+esc(e.worry||'(sem texto)')+'</div><div class="entry-meta">'+tb+'<span class="badge-tag bg">'+ab+'</span>'+ss+'</div></div>';
}

/* ══════════════════════════════════
   MODULE LIST
   ══════════════════════════════════ */
function isUnlocked(mod){
  // desbloqueio segue o caminho recomendado: cada módulo abre o seguinte do caminho
  const path = effectivePath();
  const idx = path.indexOf(mod.id);
  if(idx === 0) return true;                       // M1 é sempre a porta de entrada
  if(idx < 0) return !mod.unlockAfter || D.moduleProgress[mod.unlockAfter]?.done === true;
  return D.moduleProgress[path[idx-1]]?.done === true;
}
function modProgress(mod){
  const mp = D.moduleProgress[mod.id];
  if(!mp) return 0;
  const done = (mp.steps||[]).filter(Boolean).length;
  return Math.round(done/mod.steps.length*100);
}

function modCardHTML(m){
  const unlocked = isUnlocked(m);
  const done = D.moduleProgress[m.id]?.done;
  const pct  = modProgress(m);
  const statusIcon = done ? '✅' : unlocked ? '▶' : '🔒';
  return `<div class="mod-card ${unlocked?'':'locked'}" onclick="${unlocked?'openModule(\''+m.id+'\')':'void 0'}">
    <div class="mod-card-inner">
      <div class="mod-emoji ${m.color}">${m.emoji}</div>
      <div class="mod-info">
        <div class="mod-level-tag">${m.tagline}</div>
        <div class="mod-title">${m.title}</div>
        <div class="mod-xp">+${m.xp} XP · ${m.steps.length} etapas</div>
        <div class="mod-prog-bar"><div class="mod-prog-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="mod-status">${statusIcon}</div>
    </div>
    ${!unlocked?`<div class="mod-lock-overlay"><span class="mod-lock-msg">🔒 Complete o módulo anterior</span></div>`:''}
  </div>`;
}

function renderModuleList(){
  const path = effectivePath();
  const personalized = D.userProfile && path.join() !== DEFAULT_PATH.join();
  let html = '';
  if(personalized){
    html += `<div class="card" style="border:1.5px solid var(--mint-l)">
      <div class="card-lbl">🧭 Travessia personalizada</div>
      <div style="font-size:13.5px;color:var(--muted);line-height:1.6">A ordem abaixo foi sugerida com base na sua pré-avaliação. Você pode segui-la no seu ritmo — cada parada desbloqueia a próxima.</div>
      ${(D.userProfile.reasons||[]).map(r=>`<div style="font-size:12.5px;color:var(--muted);line-height:1.55;margin-top:7px">• ${r}</div>`).join('')}
    </div>`;
    path.forEach((id,i)=>{
      const m = MODULES.find(x=>x.id===id);
      html += `<div class="level-header"><div class="level-pip"></div><span class="level-title">${i+1}ª parada</span></div>`;
      html += modCardHTML(m);
    });
  } else {
    const levels = ['Nível 1 — Fundamentos','Nível 2 — Padrões Internos','Nível 3 — Regulação','Nível 4 — Transformação'];
    levels.forEach(lv=>{
      const mods = MODULES.filter(m=>m.levelTag===lv);
      if(!mods.length) return;
      html += `<div class="level-header"><div class="level-pip"></div><span class="level-title">${lv}</span></div>`;
      mods.forEach(m=>{ html += modCardHTML(m); });
    });
  }
  document.getElementById('modules-list').innerHTML = html;
}

/* ══════════════════════════════════
   MODULE VIEW — step system
   ══════════════════════════════════ */
let _curModId = null, _curStep = 0, _stepOk = false;
let _breathTimer = null, _breathPhase = 0, _breathCount = 0, _breathCycles = 0;

function openModule(id){
  _curModId = id;
  // retoma na primeira etapa incompleta (em vez de recomeçar do zero)
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
  // etapa já concluída antes → continuar liberado (permite rever sem refazer)
  _stepOk    = (step.type==='info'||step.type==='flipcard'||step.type==='guided') || !!D.moduleProgress[_curModId]?.steps?.[_curStep];
  stopBreath();
  _classifyDone = [];
  _flipsAll = 0;
  _guidedPhase = 0;

  // Hero colors
  const heroGrad = {
    mint:  'linear-gradient(135deg,#5E7D73,#3D5A52)',
    coral: 'linear-gradient(135deg,#D96C63,#B85550)',
    amber: 'linear-gradient(135deg,#C47D2A,#8A5520)',
    lav:   'linear-gradient(135deg,#8B7FB8,#5B4E8A)',
  };
  const grad = heroGrad[mod.color]||heroGrad.mint;

  // Step dots
  const dots = mod.steps.map((_,i)=>{
    const cl = i<_curStep?'step-dot done':i===_curStep?'step-dot current':'step-dot';
    return `<div class="${cl}"></div>`;
  }).join('');

  // Step content
  let body = '', footerExtra = '';
  if(step.type==='info'){
    body = `<div class="step-type-tag">${step.typeLabel}</div>
      <div class="step-title">${step.title}</div>
      <div>${step.content}</div>`;
  }
  else if(step.type==='quiz'){
    body = renderQuizStep(step);
  }
  else if(step.type==='classify'){
    body = renderClassifyStep(step);
  }
  else if(step.type==='flipcard'){
    body = renderFlipStep(step);
  }
  else if(step.type==='fill'){
    body = renderFillStep(step);
  }
  else if(step.type==='breath'){
    body = renderBreathStepHTML(step);
  }
  else if(step.type==='guided'){
    body = renderGuidedStep(step);
  }

  const isLast = _curStep === mod.steps.length - 1;
  const btnLabel = isLast ? 'Concluir módulo 🎉' : 'Continuar →';
  const btnId    = 'step-continue';

  document.getElementById('module-content').innerHTML =
    `<div style="background:${grad};min-height:150px;padding:calc(env(safe-area-inset-top,0px)+20px) 20px 24px;color:white;position:relative;overflow:hidden">
      <div style="position:absolute;right:-8px;top:-8px;font-size:80px;opacity:.15;user-select:none">${mod.emoji}</div>
      <button class="mod-hero-back" onclick="goTo('modules')">←</button>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;opacity:.8;margin-bottom:6px;margin-top:24px">${mod.levelTag}</div>
      <div style="font-size:20px;font-weight:800;letter-spacing:-.3px;line-height:1.25;margin-bottom:10px">${mod.title}</div>
      <div style="font-size:12px;font-weight:700;opacity:.85;background:rgba(255,255,255,.15);display:inline-block;padding:4px 10px;border-radius:20px">Etapa ${_curStep+1} de ${mod.steps.length} · +${mod.xp} XP ao concluir</div>
    </div>
    <div style="background:var(--sand);padding:8px 0 4px">${dots.length>1?`<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:4px 0">${dots}</div>`:''}</div>
    <div class="step-body" style="padding-bottom:8px">${body}</div>
    <div class="step-footer">
      ${_curStep>0?`<button class="btn ghost step-prev" onclick="prevStep()">← Anterior</button>`:''}
      <button class="btn ${mod.color==='coral'?'':'mint'}" id="${btnId}" ${_stepOk?'':'disabled'} onclick="advanceStep()">${btnLabel}</button>
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
  if(_curModId==='m8') awardBadge('b_m8');
  checkBadges();
  save();
  trackModuleEvent(_curModId, 'complete');
  checkPosttestTrigger();
  showCelebrate(mod);
}

function showCelebrate(mod){
  document.getElementById('cel-emoji').textContent  = mod.emoji;
  document.getElementById('cel-title').textContent  = mod.title+' concluído!';
  document.getElementById('cel-xp').textContent     = '+'+mod.xp+' XP conquistados';
  document.getElementById('cel-sub').textContent    = 'Seu progresso foi salvo. Continue para o próximo módulo ou registre no diário!';
  const w = document.getElementById('cel-word'); if(w) w.value='';
  document.getElementById('celebrate-card').classList.add('show');
}
function closeCelebrate(){
  // vocabulário do usuário — matéria-prima para futura escala de satisfação
  const word = (document.getElementById('cel-word')?.value||'').trim();
  if(word){
    D.moduleFeedback.push({ ts:Date.now(), date:today(), moduleId:_curModId, word });
    save();
    trackAppEvent('module_feedback');
    toast('Obrigada por compartilhar 💚');
  }
  document.getElementById('celebrate-card').classList.remove('show');
  goTo('modules');
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
        <button class="cl-btn" onclick="classifyItem(${i},'u')">✅ Útil</button>
        <button class="cl-btn neg" onclick="classifyItem(${i},'n')">🔄 Ruminação</button>
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
  el.innerHTML = `<span style="flex:1">${esc(it.text)}</span><span style="font-size:13px;font-weight:700">${correct?'✅':'🔄'} ${it.label}</span>`;
  _classifyDone[idx]=true;
  if(_classifyDone.filter(Boolean).length >= step.items.length){
    const score = step.items.filter((it2,i)=>_classifyDone[i]&&document.getElementById('cli'+i)?.classList.contains('done-u')===( it2.cat==='u')).length;
    document.getElementById('cl-score').textContent = '✨ Classificação concluída! Você identificou o padrão.';
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
        <div class="breath-label" id="bp">Toque</div>
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
          if(bp)bp.textContent='✅';
          if(bphase)bphase.textContent='Completo! Muito bem.';
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
  if(bc){bc.className='breath-ring';} if(bp&&bp.textContent!=='✅')bp.textContent='Toque'; if(bcount)bcount.textContent='';
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
   DIARY
   ══════════════════════════════════ */
let _selType=null;
function renderDiary(){ renderDiaryForm(); renderDiaryHist(); }

function renderDiaryForm(){
  _selType=null;
  document.getElementById('diary-form').innerHTML=
    `<div style="margin-bottom:20px">
      <label class="form-lbl" for="dw">O que me preocupou</label>
      <div class="form-hint">Breve, sem julgamento.</div>
      <textarea id="dw" rows="3" maxlength="300" placeholder="Descreva a preocupação..." oninput="document.getElementById('dcc').textContent=this.value.length"></textarea>
      <div style="text-align:right;font-size:11px;color:var(--light);margin-top:3px"><span id="dcc">0</span>/300</div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">Tipo</label>
      <div class="form-hint">Ajuda a escolher a ferramenta certa.</div>
      <div class="type-row">
        <button class="type-btn" id="dt-c" onclick="pickDT('c')">Posso agir agora<br><span style="font-size:11px;font-weight:500">→ Resolução de Problemas</span></button>
        <button class="type-btn" id="dt-n" onclick="pickDT('n')">Não depende de mim<br><span style="font-size:11px;font-weight:500">→ Desfusão / Aceitação</span></button>
      </div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">Reação no corpo</label>
      <div class="chips" id="d-body">${['Tensão muscular','Aperto no peito','Frio na barriga','Coração acelerado','Cabeça pesada','Inquietação','Cansaço','Outro'].map(c=>`<span class="chip" onclick="toggleChip(this)">${c}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">O que tentei</label>
      <div class="chips" id="d-strat">${['Respirei','Questionei o pensamento','Falei com alguém','Me distraí','Escrevi','Me mexi','Deixei passar','Nada ainda'].map(c=>`<span class="chip" onclick="toggleChip(this)">${c}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:24px">
      <label class="form-lbl">Como ficou depois</label>
      <div class="form-hint">1 = muito melhor · 5 = igual ou pior</div>
      <div class="slider-row"><span style="font-size:20px">😌</span><input type="range" id="da" min="1" max="5" value="3" step="1" oninput="document.getElementById('dav').textContent=this.value"><span style="font-size:20px">😟</span><span class="slider-val" id="dav">3</span></div>
    </div>
    <button class="btn" onclick="saveDiary()" style="width:100%;margin:0 0 36px">Salvar registro</button>`;
}

function pickDT(t){ _selType=t; document.getElementById('dt-c').className='type-btn'+(t==='c'?' sel-t':''); document.getElementById('dt-n').className='type-btn'+(t==='n'?' sel-s':''); }
function toggleChip(el){ el.classList.toggle('sel'); }

function saveDiary(){
  const w=document.getElementById('dw')?.value.trim();
  if(!w){ toast('Descreva a preocupação primeiro.'); return; }
  const body=[...document.querySelectorAll('#d-body .chip.sel')].map(c=>c.textContent);
  const strats=[...document.querySelectorAll('#d-strat .chip.sel')].map(c=>c.textContent);
  const after=parseInt(document.getElementById('da')?.value||3);
  D.entries.unshift({id:Date.now().toString(),ts:Date.now(),date:today(),worry:w,type:_selType||'u',bodyReactions:body,strategies:strats,after});
  save(); checkBadges(); trackDiaryEvent(); checkPosttestTrigger(); toast('Registro salvo! 📔');
  renderDiaryForm(); renderDiaryHist();
  setTimeout(maybeShowIfThen, 900);
  scheduleLocalReminder(); // já praticou hoje → empurra lembrete para amanhã
}

function renderDiaryHist(){
  const el=document.getElementById('diary-hist');
  if(!D.entries.length){ el.innerHTML=''; return; }
  const sorted=[...D.entries].sort((a,b)=>b.ts-a.ts);
  const groups={};
  sorted.forEach(e=>{ (groups[e.date]||(groups[e.date]=[])).push(e); });
  const ML=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const DL=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  el.innerHTML='<div class="sdiv">Registros anteriores</div>'+
    Object.entries(groups).map(([date,gr])=>{
      const d=new Date(date+'T12:00');
      return `<div class="sdiv" style="text-transform:capitalize;padding-top:6px">${DL[d.getDay()]}, ${d.getDate()} de ${ML[d.getMonth()]}</div>${gr.map(buildEntry).join('')}`;
    }).join('');
}

/* ══════════════════════════════════
   DOSE PRATICADA — prática ativa semanal
   Mede o que a pessoa PRATICOU entre medições,
   distinto do GAD-7 (sintoma) e MCQ-30 (crenças).
   ══════════════════════════════════ */
function renderDoseCard(){
  const el = document.getElementById('h-dose');
  if(!el) return;
  const ws = weekStart();
  const answered = D.doseRecords.some(r=>r.weekStart===ws);
  const skipped  = D.doseSkipWeek === ws;
  if(answered || skipped || !D.pretest){ el.innerHTML=''; return; }
  el.innerHTML = `<div class="card" style="border:1.5px solid var(--mint-l)">
    <div class="card-lbl">⚓ Prática da semana</div>
    <div style="font-size:14px;line-height:1.6;margin-bottom:10px">Essa semana, o que você <strong>praticou</strong> sobre suas preocupações? Praticar é todo pequeno passo: perceber um pensamento, adiar uma preocupação, questionar uma crença, se permitir não resolver agora...</div>
    <div class="chips" id="dose-tags" style="margin-bottom:10px">${DOSE_TAGS.map(t=>`<span class="chip" onclick="toggleChip(this)">${t}</span>`).join('')}</div>
    <textarea id="dose-text" rows="2" maxlength="400" placeholder="Escreva aqui..." style="width:100%"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn mint" style="flex:1;margin:0" onclick="saveDose()">Guardar ⚓</button>
      <button class="btn ghost" style="width:auto;margin:0;padding:0 16px" onclick="skipDose()">Agora não</button>
    </div>
  </div>`;
}
function saveDose(){
  const text=(document.getElementById('dose-text')?.value||'').trim();
  const tags=[...document.querySelectorAll('#dose-tags .chip.sel')].map(c=>c.textContent);
  if(!text && !tags.length){ toast('Escolha uma tag ou escreva um pouquinho. ⚓'); return; }
  D.doseRecords.push({ ts:Date.now(), date:today(), weekStart:weekStart(), tags, text });
  save();
  awardXP(15,'Prática da semana registrada');
  trackAppEvent('dose_saved');
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
function renderProgress(){
  const el=document.getElementById('progress-content');
  const lv=getLevel(D.xp), pct=getLevelPct(D.xp);
  const doneMods=MODULES.filter(m=>D.moduleProgress[m.id]?.done);
  const totalXP=MODULES.reduce((a,m)=>a+m.xp,0);

  // Badges
  const badgesHTML=ALL_BADGES.map(b=>{
    const earned=D.badges.includes(b.id);
    return `<div class="badge-item"><div class="badge-icon ${earned?'earned':'locked'}">${b.emoji}</div><div class="badge-name">${b.name}</div></div>`;
  }).join('');

  // Insights
  const insights=[];
  if(D.entries.length){
    const improved=D.entries.filter(e=>e.after<=2).length;
    const pct2=Math.round(improved/D.entries.length*100);
    insights.push({c:'',t:'✨ Taxa de regulação',b:`Em <strong>${pct2}% dos episódios</strong> você sentiu alívio após o registro. O repertório de coping está ativo.`});
    const stratC={};
    D.entries.flatMap(e=>e.strategies).forEach(s=>{stratC[s]=(stratC[s]||0)+1;});
    const topS=Object.entries(stratC).sort((a,b)=>b[1]-a[1]).slice(0,3).map(s=>s[0]);
    if(topS.length) insights.push({c:'l',t:'🔧 Estratégias favoritas',b:`Ferramentas mais usadas: <strong>${topS.join(', ')}</strong>.`});
    const streak=calcStreak();
    if(streak>0) insights.push({c:'',t:'🔥 Sequência atual',b:`<strong>${streak} dia${streak!==1?'s':''}</strong> de prática consecutiva. Consistência cria mudança real.`});
  }
  // Dose praticada — semanas com prática vs. semanas desde o início
  const doseStart = D.consentDate ? weekStart(D.consentDate.slice(0,10)) : (D.doseRecords[0]?.weekStart || null);
  if(doseStart){
    const totalWeeks = Math.max(1, Math.floor((new Date(weekStart()+'T12:00') - new Date(doseStart+'T12:00'))/(7*864e5)) + 1);
    const practicedWeeks = new Set(D.doseRecords.map(r=>r.weekStart)).size;
    insights.push({c:'l',t:'⚓ Dose praticada',b:`Semanas com prática registrada: <strong>${practicedWeeks} de ${totalWeeks}</strong> desde o início. A dose que importa é a praticada, não a recebida.`});
  }
  insights.push({c:'s',t:'📚 Módulos concluídos',b:`<strong>${doneMods.length} de ${MODULES.length}</strong> módulos concluídos · <strong>${D.xp} de ${totalXP} XP</strong> totais conquistados.`});

  el.innerHTML=
    `<div class="xp-wrap" style="margin:0 16px 12px">
      <div class="xp-head">
        <span class="xp-level">${lv.emoji} Nível ${lv.n} — ${lv.name}</span>
        <span class="xp-val">${D.xp} XP</span>
      </div>
      <div class="xp-bar-bg"><div class="xp-bar" style="width:${pct}%"></div></div>
      <div class="xp-label" style="margin-top:5px">${lv.n<5?'Para o próximo nível: '+(LEVELS[lv.n].min-D.xp)+' XP restantes':'🏆 Nível máximo!'}</div>
    </div>
    <div class="card">
      <div class="card-lbl">Intensidade — 7 dias</div>
      <svg class="chart-svg" id="p-chart" viewBox="0 0 320 72"></svg>
      <div id="p-chart-e" style="display:none;font-size:13px;color:var(--muted);text-align:center;padding:10px 0">Sem dados suficientes.</div>
    </div>
    ${insights.map(i=>`<div class="insight-c ${i.c}"><div class="insight-t">${i.t}</div><div class="insight-b">${i.b}</div></div>`).join('')}
    <div class="sdiv">Seus registros de preocupação</div>
    <div id="p-worries" style="margin:0 16px 12px"></div>
    <div class="sdiv">Conquistas</div>
    <div class="card"><div class="badge-shelf">${badgesHTML}</div></div>
    <div class="sdiv">Exportar</div>
    <button class="btn ghost-mint" onclick="exportHTML()">Baixar relatório (HTML)</button>
    <button class="btn ghost" onclick="exportJSON()" style="margin-top:0">Exportar dados (JSON)</button>
    ${BRAND_FOOTER_HTML}`;

  renderMiniChart('p-chart','p-chart-e');
  // Leitura dos registros de preocupação (componente compartilhado com o painel)
  const pw=document.getElementById('p-worries');
  if(pw && window.FarolPainel) pw.appendChild(FarolPainel.render(D,{textos:true}));
}

/* ══════════════════════════════════
   ASSESS (GAD-7)
   ══════════════════════════════════ */
const GAD_Q=['Tenho me sentido nervoso/a, ansioso/a ou muito tenso/a','Não consigo parar ou controlar as preocupações','Me preocupo demais com coisas diversas','Tenho dificuldade em relaxar','Fico tão inquieto/a que é difícil ficar parado/a','Fico facilmente irritado/a ou frustrado/a','Tenho medo de que algo terrível possa acontecer'];
const GAD_O=['Nada','Vários dias','Mais da metade dos dias','Quase todos os dias'];
let _gadA=[],_gadQ=0;

function renderAssess(){ _gadA=[];_gadQ=0; if(D.assessment)renderAssessResult(); else renderAssessQ(); }
function renderAssessQ(){
  const pct=Math.round(_gadQ/7*100);
  document.getElementById('assess-wrap').innerHTML=
    `<div class="qa-wrap">
      <div class="card-lbl" style="margin-bottom:8px">Nas últimas 2 semanas, com que frequência...</div>
      <div class="qa-prog"><div class="qa-bar" style="width:${pct}%"></div></div>
      <div class="qa-q">${GAD_Q[_gadQ]}</div>
      <div class="qa-opts">${GAD_O.map((o,i)=>`<button class="qa-opt" onclick="gadAnswer(${i})">${o}</button>`).join('')}</div>
      <div class="qa-hint" style="font-size:12px;color:var(--light);text-align:center;margin-top:16px">Pergunta ${_gadQ+1} de ${GAD_Q.length} · Sem respostas certas ou erradas</div>
    </div>`;
}
function gadAnswer(v){ _gadA.push(v);_gadQ++; if(_gadQ<GAD_Q.length)renderAssessQ(); else gadFinish(); }
function gadFinish(){ const s=_gadA.reduce((a,b)=>a+b,0); D.assessment={score:s,level:gad7Level(s),date:today(),answers:_gadA}; save(); renderAssessResult(); }
function renderAssessResult(){
  const a=D.assessment;
  const info={
    low:{title:'Preocupação mínima',icon:'🌱',msg:'Pontuação '+a.score+'/21. As preocupações estão em um nível que não interfere significativamente no dia a dia.',rec:'Continue explorando os módulos e use o diário para monitorar os seus padrões.'},
    mid:{title:'Preocupação leve',icon:'🌿',msg:'Pontuação '+a.score+'/21. As preocupações têm algum impacto no cotidiano. Há ferramentas eficazes.',rec:'Os módulos 4 (Worry Time) e 6 (Reestruturação) são especialmente indicados.'},
    hi:{title:'Preocupação moderada',icon:'🌊',msg:'Pontuação '+a.score+'/21. As preocupações parecem causar impacto significativo. Este app pode ser apoio, mas considere consultar um profissional.',rec:'O app pode complementar o atendimento profissional. Módulo 5 (Regulação) e 8 (TFC) podem ajudar agora.'},
    sev:{title:'Preocupação severa',icon:'🌀',msg:'Pontuação '+a.score+'/21. Este nível sugere um sofrimento intenso — e ninguém deveria atravessá-lo sem apoio.',rec:'Recomendamos fortemente procurar um/a psicólogo/a ou o CAPS da sua cidade. O app continua aqui como complemento — Módulo 5 (Regulação) pode ajudar nos momentos agudos.'},
  }[a.level] || {title:'Avaliação',icon:'📋',msg:'Pontuação '+a.score+'/21.',rec:''};
  const d=new Date(a.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('assess-wrap').innerHTML=
    `<div style="padding:0 16px 24px">
      <div class="result-hero ${a.level==='sev'?'hi':a.level}"><h2>${info.icon} ${info.title}</h2><p>${info.msg}</p></div>
      ${a.level==='sev' ? crisisCardHTML() : ''}
      <div class="card"><div class="card-lbl">Próximo passo recomendado</div><div style="font-size:14px;color:var(--muted);line-height:1.65">${info.rec}</div></div>
      <div style="font-size:11px;color:var(--light);text-align:center;margin-bottom:16px">Avaliado em ${d} · Não é um diagnóstico clínico</div>
      <button class="btn ghost" onclick="D.assessment=null;save();renderAssess()">Refazer avaliação</button>
      <button class="btn mint" onclick="goTo('modules')" style="margin-top:0">Ver módulos</button>
    </div>`;
}

/* ══════════════════════════════════
   EXPORT
   ══════════════════════════════════ */
function exportJSON(){
  if(!D.entries.length){toast('Sem dados para exportar.');return;}
  dl('farol-dados-'+today()+'.json',JSON.stringify({exportedAt:new Date().toISOString(),app:'Farol — Navegando as Preocupações',xp:D.xp,badges:D.badges,modulesCompleted:MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title),assessment:D.assessment,pretest:D.pretest,posttest:D.posttest,userProfile:D.userProfile,entries:D.entries,doseRecords:D.doseRecords,moduleFeedback:D.moduleFeedback,notificationLog:D.notificationLog},null,2),'application/json');
  toast('Dados exportados!');
}
function exportHTML(){
  if(!D.entries.length){toast('Faça pelo menos um registro primeiro.');return;}
  const sorted=[...D.entries].sort((a,b)=>a.ts-b.ts);
  const days=Math.max(1,Math.round((Date.now()-sorted[0].ts)/864e5)+1);
  const pct=Math.round(D.entries.filter(e=>e.after<=2).length/D.entries.length*100);
  const avg=(D.entries.reduce((a,e)=>a+e.after,0)/D.entries.length).toFixed(1);
  const lv=getLevel(D.xp);
  const doneMods=MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title);
  const al=v=>v<=2?'melhorou':v===3?'igual':'mais intenso';
  const rows=[...D.entries].sort((a,b)=>b.ts-a.ts).map(e=>{
    const dt=new Date(e.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    const tc=e.type==='c'?'Posso agir':e.type==='n'?'Deixar ir':'?';
    return `<tr><td>${dt}</td><td>${esc(e.worry||'?')}</td><td>${tc}</td><td>${(e.strategies.join(', '))||'?'}</td><td>${al(e.after)}</td></tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório — Navegando as Preocupações</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Nunito Sans',sans-serif;background:#F7F3EF;color:#3F434B}
.hero{background:linear-gradient(140deg,#5E7D73,#2B4A42);padding:40px 32px 32px;color:white}.hero h1{font-size:26px;font-weight:800;margin-bottom:6px}.hero p{font-size:13px;opacity:.82}
.body{max-width:760px;margin:0 auto;padding:28px 24px 48px}h2{font-size:17px;font-weight:800;margin:24px 0 12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:4px}
.stat{background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.05)}.stat-n{font-size:28px;font-weight:800;color:#5E7D73;line-height:1}.stat-l{font-size:12px;color:#6B7280;margin-top:5px}
.ins{background:white;border-left:4px solid #5E7D73;border-radius:10px;padding:14px 16px;margin-bottom:10px}.ins-t{font-size:13px;font-weight:800;margin-bottom:5px}.ins-b{font-size:14px;line-height:1.65;color:#6B7280}.ins-b strong{color:#3D5A52}
.pill{display:inline-block;background:#F0F6F3;color:#3D5A52;font-size:12px;padding:4px 10px;border-radius:20px;margin:3px;font-weight:700}
table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);font-size:13px}th{background:#5E7D73;color:white;padding:10px 12px;text-align:left;font-weight:700;font-size:12px}td{padding:10px 12px;border-bottom:1px solid #F0EDE5;vertical-align:top;line-height:1.4}tr:last-child td{border-bottom:none}tr:nth-child(even)td{background:#FAFAF7}
.ft{margin-top:32px;padding-top:20px;border-top:1px solid #E0DDD5;font-size:12px;color:#A0ADB8;text-align:center;line-height:1.7}
@media print{body{background:white}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="hero">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
    <svg width="38" height="46" viewBox="0 0 52 62" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="26" cy="10" r="9.5" fill="rgba(255,255,255,.9)"/><path d="M2 29Q26 13 50 29" stroke="rgba(255,255,255,.75)" stroke-width="4.8" stroke-linecap="round"/><path d="M8 40Q26 25 44 40" stroke="rgba(255,255,255,.75)" stroke-width="4.8" stroke-linecap="round"/><path d="M15 51Q26 38 37 51" stroke="rgba(255,255,255,.75)" stroke-width="4.8" stroke-linecap="round"/><circle cx="26" cy="57.5" r="6" fill="rgba(255,255,255,.75)"/></svg>
    <div>
      <div style="font-size:12px;opacity:.75;font-weight:600;margin-bottom:2px">Psicoterapia e Afins · psicoterapiaeafins.com.br</div>
      <h1 style="margin:0">🏮 Farol — Navegando as Preocupações</h1>
    </div>
  </div>
  <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})} · ${D.entries.length} registros</p>
</div>
<div class="body"><h2>Resumo</h2>
<div class="stats">
  <div class="stat"><div class="stat-n">${D.entries.length}</div><div class="stat-l">registros totais</div></div>
  <div class="stat"><div class="stat-n">${days}d</div><div class="stat-l">período de uso</div></div>
  <div class="stat"><div class="stat-n">${pct}%</div><div class="stat-l">com melhoria após registro</div></div>
  <div class="stat"><div class="stat-n">${avg}</div><div class="stat-l">intensidade média (1-5)</div></div>
  <div class="stat"><div class="stat-n">${D.xp}</div><div class="stat-l">XP · Nível ${lv.n} ${lv.name}</div></div>
  <div class="stat"><div class="stat-n">${doneMods.length}/${MODULES.length}</div><div class="stat-l">módulos concluídos</div></div>
</div>
${doneMods.length?`<h2>Módulos concluídos</h2><div class="ins"><div class="ins-b">${doneMods.map(m=>`<span class="pill">${m}</span>`).join('')}</div></div>`:''}
${D.assessment?`<h2>Avaliação GAD-7</h2><div class="ins"><div class="ins-b">Pontuação: <strong>${D.assessment.score}/21</strong> — ${GAD7_LABELS[D.assessment.level]||''} (${new Date(D.assessment.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})})</div></div>`:''}
${D.doseRecords.length?`<h2>Dose praticada (semanal)</h2>
${[...D.doseRecords].sort((a,b)=>b.ts-a.ts).map(r=>
  `<div class="ins"><div class="ins-t">Semana de ${new Date(r.weekStart+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})}</div><div class="ins-b">${(r.tags||[]).map(t=>`<span class="pill">${esc(t)}</span>`).join('')}${r.text?`<br>${esc(r.text)}`:''}</div></div>`).join('')}`:''}
<h2>Todos os registros</h2>
<table><thead><tr><th>Data</th><th>Preocupação</th><th>Tipo</th><th>Estratégia</th><th>Depois</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ft">
  <strong>© 2025 Psicoterapia e Afins · Todos os direitos reservados</strong><br>
  Este relatório contém dados pessoais. Compartilhe somente com seu profissional de saúde mental de confiança.<br>
  <strong>Recurso psicoeducativo baseado em evidências — não substitui psicoterapia profissional.</strong><br>
  🌐 <a href="https://www.psicoterapiaeafins.com.br" style="color:#5E7D73">psicoterapiaeafins.com.br</a>
  &nbsp;·&nbsp;
  📷 <a href="https://www.instagram.com/psicoterapiaeafins" style="color:#D96C63">@psicoterapiaeafins</a><br>
  Proibida a reprodução total ou parcial sem autorização prévia e por escrito.
</div>
</div></body></html>`;
  dl('farol-relatorio-'+today()+'.html',html,'text/html;charset=utf-8');
  toast('Relatório exportado!');
}
function exportCSV(){
  const rows = [
    // header
    ['record_type','timestamp','date','worry','type','body_reactions','strategies','intensity_after',
     'pretest_gad7','posttest_gad7','gad7_delta',
     'pretest_mcq_pr','pretest_mcq_nc','pretest_mcq_cw','pretest_mcq_nb','pretest_mcq_wf',
     'posttest_mcq_pr','posttest_mcq_nc','posttest_mcq_cw','posttest_mcq_nb','posttest_mcq_wf'].join(','),
  ];
  const pre = D.pretest, post = D.posttest;
  const gadPre = pre?.gad7?.score ?? '';
  const gadPost = post?.gad7?.score ?? '';
  const gadDelta = (gadPre!==''&&gadPost!=='') ? gadPost-gadPre : '';
  const mcqPreRow = pre ? [pre.mcq30.scores.pr,pre.mcq30.scores.nc,pre.mcq30.scores.cw,pre.mcq30.scores.nb,pre.mcq30.scores.wf].join(',') : ',,,,' ;
  const mcqPostRow = post ? [post.mcq30.scores.pr,post.mcq30.scores.nc,post.mcq30.scores.cw,post.mcq30.scores.nb,post.mcq30.scores.wf].join(',') : ',,,,';
  const csvEsc = s => '"'+String(s||'').replace(/"/g,'""')+'"';
  D.entries.forEach(e=>{
    rows.push([
      'entry', e.ts, e.date,
      csvEsc(e.worry), e.type,
      csvEsc(e.bodyReactions?.join('|')||''),
      csvEsc(e.strategies?.join('|')||''),
      e.after,
      gadPre, gadPost, gadDelta,
      mcqPreRow, mcqPostRow,
    ].join(','));
  });
  D.doseRecords.forEach(r=>{
    rows.push([
      'dose', r.ts, r.date,
      csvEsc(r.text), '',
      '',
      csvEsc((r.tags||[]).join('|')),
      '',
      gadPre, gadPost, gadDelta,
      mcqPreRow, mcqPostRow,
    ].join(','));
  });
  D.moduleFeedback.forEach(r=>{
    rows.push([
      'feedback', r.ts, r.date,
      csvEsc(r.word), r.moduleId,
      '', '', '',
      gadPre, gadPost, gadDelta,
      mcqPreRow, mcqPostRow,
    ].join(','));
  });
  D.notificationLog.forEach(n=>{
    rows.push([
      'notif', n.ts, '',
      n.tema, n.foiAberta ? 'aberta' : 'nao_aberta',
      '', '', '',
      gadPre, gadPost, gadDelta,
      mcqPreRow, mcqPostRow,
    ].join(','));
  });
  if(rows.length<=1){ toast('Sem dados para exportar.'); return; }
  dl('farol-pesquisa-'+today()+'.csv', '﻿'+rows.join('\n'), 'text/csv;charset=utf-8');
  toast('CSV exportado! 📊');
}

function dl(name,content,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }

/* ══════════════════════════════════
   SINCRONIZAÇÃO COM GOOGLE SHEETS
   ══════════════════════════════════ */
// silent=true → sem toasts de erro nem loading no botão (para auto-sync)
// requirePretest=true → bloqueia se pré-teste não feito ainda (desligar para sync pós-consentimento)
async function syncToResearch({ silent=false, requirePretest=true }={}){
  if(!RESEARCH_ENDPOINT){
    if(!silent) toast('⚙️ URL de pesquisa não configurado em app.js');
    return;
  }
  if(requirePretest && !D.pretest){
    if(!silent) toast('⚠️ Complete o pré-teste antes de enviar dados.');
    return;
  }
  const btn  = document.getElementById('sync-btn');
  if(!silent && btn){ btn.textContent='⏳ A enviar…'; btn.style.opacity='0.6'; btn.onclick=null; }

  try{
    const doneMods = MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title);
    const payload = {
      participantId: D.participantId,
      consentDate:   D.consentDate,
      demographics:  D.demographics,
      pretest:       D.pretest,
      posttest:      D.posttest || null,
      entries:       D.entries,
      doseRecords:   D.doseRecords,
      moduleFeedback: D.moduleFeedback,
      notificationLog: D.notificationLog,
      userProfile:   D.userProfile,
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
      toast(silent ? '🔬 Dados enviados para a investigação.' : '✅ Dados enviados! Obrigada pela contribuição.');
    } else {
      if(!silent) toast('❌ Erro no servidor: '+(result.error||'resposta inesperada'));
      console.warn('[Farol] sync error:', result.error);
    }
  }catch(err){
    if(!silent) toast('⚠️ Falha na ligação. Verifique a rede e tente novamente.');
    console.warn('[Farol] syncToResearch:', err.message);
  }

  if(!silent && btn){ btn.textContent='🔬 Enviar'; btn.style.opacity='1'; btn.onclick=()=>syncToResearch(); }
}

function renderDadosSync(){
  const desc = document.getElementById('sync-desc');
  if(!desc) return;
  if(!RESEARCH_ENDPOINT){
    desc.textContent = 'Endpoint não configurado (ver app.js)';
    return;
  }
  if(D.lastSync){
    const d=new Date(D.lastSync);
    const fmt=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear()+' '+p2(d.getHours())+':'+p2(d.getMinutes());
    desc.textContent='Último envio: '+fmt;
  } else {
    desc.textContent='Nunca enviado — contribua com a investigação!';
  }
}

/* ══════════════════════════════════
   MODAL / TOAST
   ══════════════════════════════════ */
function openModal(id){
  if(id==='del'){
    document.getElementById('modal-title').textContent='Apagar todos os dados?';
    document.getElementById('modal-body').textContent='Esta ação é permanente e irreversível. Exporte primeiro se quiser guardar uma cópia.';
    document.getElementById('modal-actions').innerHTML='<button class="btn danger" onclick="deleteAll()">Sim, apagar tudo</button><button class="btn ghost" onclick="closeModal()">Cancelar</button>';
    document.getElementById('modal-ov').classList.add('on');
  }
}
function closeModal(e){ if(!e||e.target===document.getElementById('modal-ov')) document.getElementById('modal-ov').classList.remove('on'); }
function deleteAll(){
  // preserva identidade anônima para não duplicar participantes na base de dados
  const pid=D.participantId, cd=D.consentDate, ls=D.lastSync;
  D={
    xp:0, badges:[], obDone:true, obLevel:D.obLevel,
    moduleProgress:{}, entries:[], doseRecords:[], doseSkipWeek:null, moduleFeedback:[], assessment:null,
    nickname:D.nickname, demographics:D.demographics,
    reminders:D.reminders||{enabled:false,hour:20,hourTouched:false},
    notificationLog:[],
    installSeen:D.installSeen||false, notifPromptSeen:D.notifPromptSeen||false,
    consentGiven:true, consentDate:cd,
    participantId:pid, lastSync:ls,
    pretest:null, posttest:null, posttestRemindAfter:null, userProfile:null,
    analytics:{sessions:[],moduleEvents:[],diaryEvents:[]},
  };
  save();
  document.getElementById('modal-ov').classList.remove('on');
  toast('Dados apagados.');
  goTo('home');
}

function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('on'),2800); }

/* ══════════════════════════════════
   INIT
   ══════════════════════════════════ */
/* ══════════════════════════════════
   NUDGES COMPORTAMENTAIS (home)
   Prioridade: pós-teste pendente > retorno após pausa (autocompaixão)
   > módulo a meio (efeito Zeigarnik) > plano se-então (Gollwitzer)
   ══════════════════════════════════ */
function renderNudge(){
  const el = document.getElementById('h-nudge');
  if(!el) return;
  const streak = calcStreak();
  const lastEntry = D.entries.length ? [...D.entries].sort((a,b)=>b.ts-a.ts)[0] : null;
  const daysSince = lastEntry ? Math.floor((Date.now()-lastEntry.ts)/864e5) : null;
  const halfMod = MODULES.find(m=>{ const mp=D.moduleProgress[m.id]; return mp && !mp.done && mp.steps?.some(Boolean); });

  let html = '';

  // 0. Pré-avaliação pendente — caminho de volta para quem adiou
  if(!D.pretest && D.obDone){
    html = `<div class="nudge mint">
      <div class="nudge-icon">🧭</div>
      <div class="nudge-body"><strong>Pré-avaliação pendente.</strong>
      São ~5 minutos e é o ponto de partida para medir o seu progresso na travessia.</div>
      <button class="nudge-btn" onclick="goTo('pretest')">Responder agora</button>
    </div>`;
  }
  // 1. Instalar na tela de início (uma vez, se ainda não instalou)
  else if(!isInstalled() && !D.installSeen){
    html = `<div class="nudge lav">
      <div class="nudge-icon">📲</div>
      <div class="nudge-body"><strong>Leve o Farol com você.</strong>
      Adicione à tela de início para abrir como um app — com o ícone do farol e funcionando offline.</div>
      <button class="nudge-btn" onclick="showInstallModal()">Ver como</button>
    </div>`;
  }
  // 2. Convite para lembretes — uma vez, só depois da primeira prática (valor antes do pedido)
  else if(('Notification' in window) && !D.reminders.enabled && !D.notifPromptSeen && D.pretest
          && (D.entries.length >= 1 || MODULES.some(m=>D.moduleProgress[m.id]?.done))){
    html = `<div class="nudge mint">
      <div class="nudge-icon">🔔</div>
      <div class="nudge-body"><strong>Quer um lembrete gentil por dia?</strong>
      Um toque leve para manter a prática viva — no seu horário, no seu tom.</div>
      <button class="nudge-btn" onclick="showNotifModal()">Ver como funciona</button>
    </div>`;
  }
  // 3. Retorno após pausa — acolher sem culpa (evita o efeito "estraguei tudo")
  else if(daysSince !== null && daysSince >= 3){
    html = `<div class="nudge lav">
      <div class="nudge-icon">🤗</div>
      <div class="nudge-body"><strong>Que bom ter você de volta.</strong>
      Pausas fazem parte de qualquer travessia — o que importa é que o farol continua aceso. Um registro pequeno hoje já recomeça o caminho.</div>
      <button class="nudge-btn" onclick="goTo('diary')">Registrar agora</button>
    </div>`;
  }
  // 2. Módulo a meio — tarefas incompletas pedem fecho (Zeigarnik)
  else if(halfMod){
    const pct = modProgress(halfMod);
    html = `<div class="nudge mint">
      <div class="nudge-icon">📖</div>
      <div class="nudge-body"><strong>${halfMod.title}</strong> está ${pct}% completo.
      Faltam só alguns passos para fechar este capítulo.</div>
      <button class="nudge-btn" onclick="openModule('${halfMod.id}')">Continuar</button>
    </div>`;
  }
  // 3. Streak ativo — reforço do progresso (sem pressão)
  else if(streak >= 2){
    html = `<div class="nudge amber">
      <div class="nudge-icon">🔥</div>
      <div class="nudge-body"><strong>${streak} dias seguidos de prática.</strong>
      A constância — não a perfeição — é o que treina o cérebro.</div>
    </div>`;
  }
  el.innerHTML = html;
}

/* Intenção de implementação (Gollwitzer, 1999) — "quando X, então Y"
   duplica a probabilidade de executar o comportamento planeado */
const IFTHEN_PLANS = [
  'Quando eu notar a preocupação a crescer, vou <strong>respirar fundo 3 vezes</strong> antes de reagir.',
  'Quando um pensamento "e se..." aparecer, vou <strong>anotá-lo e adiá-lo para o meu Worry Time</strong>.',
  'Quando o corpo ficar tenso, vou <strong>soltar os ombros e desacelerar a expiração</strong>.',
  'Quando eu me pegar ruminando, vou <strong>nomear: "isto é só um pensamento"</strong> e voltar ao presente.',
];
function maybeShowIfThen(){
  // mostra a cada 3 registos para não saturar
  if(D.entries.length % 3 !== 1) return;
  const plan = IFTHEN_PLANS[Math.floor(Math.random()*IFTHEN_PLANS.length)];
  document.getElementById('modal-title').textContent = '🌱 Um plano para amanhã';
  document.getElementById('modal-body').innerHTML =
    plan + '<br><br><span style="font-size:12px;color:var(--light)">Planos "quando-então" duplicam a chance de agir no momento certo (Gollwitzer, 1999).</span>';
  document.getElementById('modal-actions').innerHTML =
    '<button class="btn mint" onclick="closeModal()">Combinado 🤝</button>';
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   INSTALAÇÃO — atalho na tela de início (PWA)
   ══════════════════════════════════ */
let _installPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _installPrompt = e;
});
window.addEventListener('appinstalled', () => {
  _installPrompt = null;
  D.installSeen = true; save();
  toast('🏮 Farol instalado! Procure o farol na tela de início.');
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
    <div style="width:22px;height:22px;border-radius:50%;background:var(--mint-xl);color:var(--mint-d);font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${n}</div>
    <div style="font-size:13.5px;line-height:1.55;text-align:left">${txt}</div>
  </div>`;
  if(isIOS) return `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No iPhone/iPad (Safari)</div>`
    + step(1,'Abra o Farol no <strong>Safari</strong> (outros navegadores não têm essa opção no iOS)')
    + step(2,'Toque no botão <strong>Compartilhar</strong> — o quadrado com a seta para cima (⬆️), na barra inferior')
    + step(3,'Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>')
    + step(4,'Toque em <strong>Adicionar</strong> — o farol 🏮 aparece junto aos seus apps');
  if(isAndroid) return `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No Android (Chrome)</div>`
    + step(1,'Abra o Farol no <strong>Chrome</strong>')
    + step(2,'Toque no menu <strong>⋮</strong> (três pontinhos, no canto superior direito)')
    + step(3,'Toque em <strong>"Adicionar à tela inicial"</strong> (ou <strong>"Instalar app"</strong>)')
    + step(4,'Confirme — o farol 🏮 aparece junto aos seus apps');
  return `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No computador (Chrome/Edge)</div>`
    + step(1,'Procure o <strong>ícone de instalação</strong> no fim da barra de endereço (um monitor com uma seta para baixo)')
    + step(2,'Clique nele e depois em <strong>Instalar</strong>')
    + step(3,'Se não vir o ícone: menu <strong>⋮</strong> → "Salvar e compartilhar" → <strong>"Instalar Farol"</strong>')
    + step(4,'O app abre em janela própria, com o farol 🏮 na barra de tarefas');
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
    document.getElementById('modal-title').textContent = '🏮 Já está instalado!';
    document.getElementById('modal-body').innerHTML = 'Você já está usando o Farol como app. É só procurar o farol na tela de início sempre que quiser voltar.';
    document.getElementById('modal-actions').innerHTML = '<button class="btn mint" onclick="closeModal()">Ótimo!</button>';
    document.getElementById('modal-ov').classList.add('on');
    return;
  }
  document.getElementById('modal-title').textContent = '📲 Farol na tela de início';
  document.getElementById('modal-body').innerHTML =
    `<p style="margin-bottom:12px;text-align:left">Com o atalho, o Farol vira um app de verdade: abre em tela cheia, com o ícone do farol 🏮, e funciona até sem internet.</p>`
    + (_installPrompt
        ? `<p style="font-size:13px;color:var(--muted);text-align:left">Boa notícia: seu navegador instala com um toque. 👇</p>`
        : installInstructionsHTML());
  document.getElementById('modal-actions').innerHTML =
    (_installPrompt ? `<button class="btn mint" onclick="installApp()">Instalar agora 🏮</button>` : '')
    + `<button class="btn ${_installPrompt?'ghost':'mint'}" onclick="closeModal();if(typeof renderNudge==='function')renderNudge()">Entendi</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   CONVITE PARA LEMBRETES
   Explicar antes de pedir: o pedido de permissão do navegador
   só chega depois de a pessoa aceitar o convite (SDT/CFT).
   ══════════════════════════════════ */
function showNotifModal(){
  D.notifPromptSeen = true; save();
  document.getElementById('modal-title').textContent = '🔔 Lembrete diário — como funciona';
  document.getElementById('modal-body').innerHTML = `
    <div style="text-align:left;font-size:13.5px;line-height:1.65">
      <div style="display:flex;gap:9px;margin-bottom:9px"><span>🕐</span><span><strong>No máximo 1 por dia</strong>, no horário que você escolher — sempre convite, nunca cobrança.</span></div>
      <div style="display:flex;gap:9px;margin-bottom:9px"><span>✅</span><span>Se você <strong>já praticou no dia</strong>, o lembrete nem aparece.</span></div>
      <div style="display:flex;gap:9px;margin-bottom:9px"><span>💙</span><span>As frases se adaptam: em semanas mais difíceis, o tom é só de <strong>acolhimento</strong>.</span></div>
      <div style="display:flex;gap:9px"><span>⚙️</span><span>Você pode <strong>desativar quando quiser</strong> em Dados → Lembretes.</span></div>
    </div>`;
  document.getElementById('modal-actions').innerHTML = `
    <button class="btn mint" onclick="enableRemindersFromModal()">Ativar lembrete 🔔</button>
    <button class="btn ghost" onclick="closeModal();renderNudge()">Agora não</button>`;
  document.getElementById('modal-ov').classList.add('on');
  trackAppEvent('notif_prompt_shown');
}

async function enableRemindersFromModal(){
  closeModal();
  const perm = await Notification.requestPermission();
  if(perm !== 'granted'){
    toast('Sem problema — dá para ativar depois em Dados → Lembretes.');
    renderNudge(); return;
  }
  D.reminders.enabled = true; save();
  scheduleLocalReminder();
  renderReminderUI();
  toast('🔔 Lembrete diário ativado! Ajuste o horário em Dados.');
  trackAppEvent('reminders_on');
  renderNudge();
}

/* ══════════════════════════════════
   LEMBRETES (Notification API + Service Worker)
   Limitação honesta: sem servidor push, o lembrete dispara
   quando o browser/PWA está aberto. No Android instalado
   como PWA, o service worker mantém-se ativo razoavelmente.
   ══════════════════════════════════ */
let _reminderTimer = null;

async function toggleReminders(cb){
  if(cb.checked){
    if(!('Notification' in window)){
      toast('Este navegador não suporta notificações.');
      cb.checked = false; return;
    }
    const perm = await Notification.requestPermission();
    if(perm !== 'granted'){
      toast('Permissão negada — ative nas configurações do navegador.');
      cb.checked = false; return;
    }
    D.reminders.enabled = true; save();
    scheduleLocalReminder();
    toast('🔔 Lembrete diário ativado!');
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
  D.reminders.hour = parseInt(sel.value);
  D.reminders.hourTouched = true; // escolheu manualmente — não sugerir horário
  save();
  scheduleLocalReminder();
  renderReminderUI();
  toast('Lembrete às '+sel.value+':00.');
}

function scheduleLocalReminder(){
  if(_reminderTimer) clearTimeout(_reminderTimer);
  if(!D.reminders.enabled || Notification.permission !== 'granted') return;
  const now = new Date();
  const next = new Date(now);
  next.setHours(D.reminders.hour, 0, 0, 0);
  if(next <= now) next.setDate(next.getDate()+1);
  // já praticou hoje? agenda só para amanhã
  const practicedToday = D.entries.some(e=>e.date===today());
  if(practicedToday && next.getDate()===now.getDate()) next.setDate(next.getDate()+1);
  _reminderTimer = setTimeout(fireReminder, next - now);
}

/* Banco de frases — tom sempre calmante (CFT): convite, nunca urgência ou culpa.
   4 temas; "acolhimento" é priorizado quando há sinais de dificuldade. */
const NOTIF_MSGS = {
  perceber: [
    '🏮 Um instante: que pensamento está passando por aí agora? Só observe.',
    '🌊 Os pensamentos vêm e vão como ondas. Vale espiar quais chegaram hoje.',
    '👀 Sem mudar nada: apenas notar o que a mente está fazendo já é prática.',
    '💭 Que tal 30 segundos de curiosidade sobre a própria mente?',
  ],
  adiar: [
    '🕐 Alguma preocupação rondando? Ela pode esperar pelo seu Tempo de Preocupação.',
    '📝 Anotar e adiar: a preocupação fica guardada, o seu momento fica livre.',
    '⏰ Lembrete gentil: preocupação tem hora marcada — o resto do dia é seu.',
    '🧭 Se um "e se..." aparecer hoje, experimente: anote, adie, respire.',
  ],
  gentileza: [
    '💚 Uma mão no peito, uma respiração lenta. Você merece essa pausa.',
    '🌬️ Expire devagar. O seu corpo agradece cada expiração longa.',
    '🤲 Fale consigo hoje como falaria com quem você ama.',
    '🌿 Pausa de gentileza: ombros soltos, mandíbula solta, uma respiração.',
  ],
  acolhimento: [
    '🤗 Sem cobrança hoje. O farol segue aceso, no seu tempo.',
    '🏮 Dias difíceis fazem parte da travessia. Estamos aqui quando quiser.',
    '🌊 Não precisa resolver nada agora. Só respirar já é suficiente.',
    '💙 Você não precisa estar bem o tempo todo. O farol não julga tempestades.',
  ],
};

/* Tema adaptativo: sem prática há 5+ dias OU GAD-7 recente ≥ 15
   → acolhimento (nunca "pratique mais") */
function pickNotifTheme(){
  const lastPractice = [
    ...D.entries.map(e=>e.ts),
    ...D.doseRecords.map(r=>r.ts),
  ].sort((a,b)=>b-a)[0];
  const semPratica = !lastPractice || (Date.now()-lastPractice) >= 5*864e5;
  const gadAlto = (D.assessment?.score ?? 0) >= 15;
  if(semPratica || gadAlto) return 'acolhimento';
  const temas = ['perceber','adiar','gentileza'];
  return temas[Math.floor(Math.random()*temas.length)];
}

async function fireReminder(){
  if(!D.reminders.enabled) return;
  const tema = pickNotifTheme();
  const opts = NOTIF_MSGS[tema];
  const msg = opts[Math.floor(Math.random()*opts.length)];
  try{
    const reg = await navigator.serviceWorker?.getRegistration();
    if(reg){
      reg.showNotification('Farol', { body: msg, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'farol-daily' });
    } else {
      new Notification('Farol', { body: msg, icon: 'icon-192.png' });
    }
    D.notificationLog.push({ ts: Date.now(), tema, foiAberta: false });
    if(D.notificationLog.length > 100) D.notificationLog = D.notificationLog.slice(-100);
    save();
    trackAppEvent('reminder_fired');
  }catch(e){ console.warn('[Farol] notificação falhou:', e); }
  scheduleLocalReminder(); // agenda o próximo
}

/* Marcada quando o usuário abre o app a partir da notificação */
function markNotifOpened(){
  const lastN = D.notificationLog[D.notificationLog.length-1];
  if(lastN && !lastN.foiAberta){ lastN.foiAberta = true; save(); trackAppEvent('reminder_opened'); }
}

/* Horário adaptativo: hora em que a pessoa mais abre o app (mín. 5 aberturas) */
function suggestedReminderHour(){
  const opens = (D.analytics?.sessions||[]).filter(s=>s.event==='app_open');
  if(opens.length < 5) return null;
  const freq = {};
  opens.forEach(s=>{ const h=new Date(s.ts).getHours(); freq[h]=(freq[h]||0)+1; });
  const top = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
  return top ? parseInt(top[0]) : null;
}

function applySuggestedHour(h){
  const sel = document.getElementById('rem-hour');
  if(sel && ![...sel.options].some(o=>o.value===String(h))){
    const opt = document.createElement('option');
    opt.value = String(h); opt.textContent = p2(h)+':00';
    sel.appendChild(opt);
  }
  D.reminders.hour = h;
  D.reminders.hourTouched = true; // aceitou a sugestão — não sugerir de novo
  save();
  scheduleLocalReminder();
  renderReminderUI();
  toast('Lembrete às '+p2(h)+':00. 🔔');
}

function renderReminderUI(){
  const cb  = document.getElementById('rem-toggle');
  const sel = document.getElementById('rem-hour');
  const row = document.getElementById('rem-hour-row');
  if(cb)  cb.checked = D.reminders.enabled;
  if(sel){
    if(![...sel.options].some(o=>o.value===String(D.reminders.hour))){
      const opt = document.createElement('option');
      opt.value = String(D.reminders.hour); opt.textContent = p2(D.reminders.hour)+':00';
      sel.appendChild(opt);
    }
    sel.value = String(D.reminders.hour);
  }
  if(row) row.style.display = D.reminders.enabled ? '' : 'none';
  // sugestão de horário — só se nunca mexeu no padrão e há dados de uso
  const sug = document.getElementById('rem-suggest');
  if(sug){
    const h = suggestedReminderHour();
    const show = D.reminders.enabled && !D.reminders.hourTouched && h !== null && h !== D.reminders.hour;
    sug.style.display = show ? '' : 'none';
    sug.innerHTML = show ? `
      <div style="flex:1">
        <div class="set-lbl">💡 Sugestão de horário</div>
        <div class="set-desc">Você costuma usar o app por volta das ${p2(h)}h. Quer o lembrete nesse horário?</div>
      </div>
      <button class="btn" style="padding:7px 16px;font-size:13px;width:auto;flex-shrink:0" onclick="applySuggestedHour(${h})">Usar ${p2(h)}h</button>` : '';
  }
}

/* ── Service worker (offline + notificações) ── */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(e=>console.warn('[Farol] SW:', e.message));
  // SW avisa quando o app foi focado a partir de uma notificação
  navigator.serviceWorker.addEventListener('message', e=>{
    if(e.data?.type==='notif-opened') markNotifOpened();
  });
}

/* ── Splash screen ── */
(function(){
  const splash = document.getElementById('splash');
  if(!splash) return;
  // Mostra durante 1.8s, depois dissolve em 0.45s
  setTimeout(function(){
    splash.classList.add('out');
    setTimeout(function(){ splash.classList.add('gone'); }, 460);
  }, 1800);
})();

load();
_classifyDone=[];
_flipsAll=0;
// app aberto por clique numa notificação (janela nova via SW)
if(location.search.includes('notif=1')) markNotifOpened();
trackAppEvent('app_open');
scheduleLocalReminder();
if(!D.obDone){
  document.getElementById('onboard').classList.remove('hide');
} else {
  document.getElementById('onboard').classList.add('hide');
  if(!D.pretest){
    goTo('pretest');
  } else {
    goTo('home');
    checkPosttestTrigger();
  }
}
