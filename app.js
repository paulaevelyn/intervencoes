/* ════════════════════════════════════════════════════════
   Floresça — Cultivando Emoções Positivas · app.js v1
   Gameful Learning · pt-BR · Psicologia Positiva · TFC · TCC · COM-B
   © 2026 Psicoterapia e Afins — psicoterapiaeafins.com.br
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
<div style="margin:8px 0 0;background:#F0F6F3;border-radius:14px;padding:16px 18px;border:1px solid rgba(94,125,115,.12)">
  <div style="margin-bottom:12px">
    <img src="assets/floresca-logo.svg" alt="Floresça" width="150" style="display:block">
  </div>
  <div style="font-size:12px;color:#5A6B65;line-height:1.65;border-top:1px solid rgba(94,125,115,.15);padding-top:10px">
    ⚕️ <strong>Recurso psicoeducativo</strong> — não substitui acompanhamento psicológico profissional.<br>
    🌐 <a href="https://www.psicoterapiaeafins.com.br" target="_blank" style="color:#3D5A52;font-weight:700;text-decoration:none">psicoterapiaeafins.com.br</a>
    &nbsp;·&nbsp;
    📷 <a href="https://www.instagram.com/psicoterapiaeafins" target="_blank" style="color:#B85550;font-weight:700;text-decoration:none">@psicoterapiaeafins</a>
  </div>
</div>
<div style="font-size:10px;color:#A0ADB8;text-align:center;padding:8px 0 4px;line-height:1.6">
  © 2026 Psicoterapia e Afins · Todos os direitos reservados<br>
  Proibida a reprodução sem autorização prévia
</div>`;

/* ══════════════════════════════════
   PERSISTENCE
   ══════════════════════════════════ */
const SK = 'floresca_v1';
let D = {
  xp: 0,
  badges: [],
  obDone: false,
  obLevel: 0,
  moduleProgress: {},   // { m1: { steps: [true,false,...], done: false } }
  entries: [],          // registro de momentos positivos
  experiments: [],      // execuções de experimentos { id, expId, ts, date, predicted, predictNote, status, actual, noticed, tsDone }
  assessment: null,     // SPANE { p, n, b, date, answers }
  nickname: '',
  demographics: null,
  reminders: { enabled:false, hour:20 },
  installSeen: false,   // já viu a instrução de instalar na tela de início
  consentGiven: false,
  consentDate: null,
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
      if(!D.participantId) D.participantId = generateUUID();
      if(D.consentDate  === undefined) D.consentDate  = null;
      if(D.lastSync     === undefined) D.lastSync     = null;
      if(D.nickname     === undefined) D.nickname     = '';
      if(D.demographics === undefined) D.demographics = null;
      if(!D.reminders) D.reminders = { enabled:false, hour:20 };
      if(D.installSeen === undefined) D.installSeen = false;
    } else {
      D.participantId = generateUUID();
    }
  }catch(e){}
}
function save(){
  try{ localStorage.setItem(SK,JSON.stringify(D)); }
  catch(e){
    console.warn('[Floresça] save falhou:', e.message);
    if(typeof toast==='function') toast('⚠️ Não foi possível guardar. Exporte os seus dados em Dados → Exportar.');
  }
}

/* Cartão de apoio — mostrado quando SPANE-Negativo muito alto */
function supportCardHTML(){
  return `
  <div class="crisis-card">
    <div class="crisis-title">💛 Você não precisa atravessar isso sozinho/a</div>
    <div class="crisis-body">
      As suas respostas sugerem que as emoções difíceis têm pesado bastante ultimamente.
      Este app pode ajudar a cultivar o que é bom, mas <strong>não substitui ajuda profissional</strong> —
      e procurá-la é um ato de coragem, não de fraqueza.
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
const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS  = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const DIAS_C= ['D','S','T','Q','Q','S','S'];

/* ══════════════════════════════════
   XP / LEVEL SYSTEM — crescimento da planta
   ══════════════════════════════════ */
const LEVELS = [
  { n:1, name:'Semente',        emoji:'🌰', min:0,   max:100  },
  { n:2, name:'Broto',          emoji:'🌱', min:100, max:250  },
  { n:3, name:'Ramo Verde',     emoji:'🌿', min:250, max:430  },
  { n:4, name:'Em Flor',        emoji:'🌸', min:430, max:595  },
  { n:5, name:'Jardim Vivo',    emoji:'🌳', min:595, max:9999 },
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
  { id:'b_m1',   emoji:'🌅', name:'Solo Preparado',      desc:'Completou o Módulo 1' },
  { id:'b_m2',   emoji:'🎨', name:'Colorista',           desc:'Completou o Módulo 2' },
  { id:'b_m3',   emoji:'🔍', name:'Olhar de Jardineiro', desc:'Completou o Módulo 3' },
  { id:'b_m4',   emoji:'🍯', name:'Saboreador/a',        desc:'Completou o Módulo 4' },
  { id:'b_m5',   emoji:'🙏', name:'Grato/a',             desc:'Completou o Módulo 5' },
  { id:'b_m6',   emoji:'💚', name:'Contentamento',       desc:'Completou o Módulo 6' },
  { id:'b_m7',   emoji:'🧪', name:'Destemido/a',         desc:'Completou o Módulo 7' },
  { id:'b_m8',   emoji:'🌳', name:'Jardim Completo',     desc:'Completou todos os módulos' },
  { id:'b_str7', emoji:'🔥', name:'Constância',          desc:'7 dias seguidos' },
  { id:'b_d10',  emoji:'📔', name:'Caçador/a de Momentos', desc:'10+ momentos registrados' },
  { id:'b_xp',   emoji:'⭐', name:'Dedicado/a',          desc:'Atingiu 300 XP' },
  { id:'b_exp1', emoji:'🔬', name:'Cientista de Si',     desc:'Concluiu o 1º experimento' },
  { id:'b_exp5', emoji:'🏆', name:'Pesquisador/a',       desc:'Concluiu 5 experimentos' },
];
function awardBadge(id){
  if(D.badges.includes(id)) return;
  D.badges.push(id); save();
  const b = ALL_BADGES.find(x => x.id===id);
  if(b) toast('🏅 Conquista: '+b.name);
}
function checkBadges(){
  if(D.xp >= 300) awardBadge('b_xp');
  if(D.entries.length >= 10) awardBadge('b_d10');
  const expDone = D.experiments.filter(e=>e.status==='done').length;
  if(expDone >= 1) awardBadge('b_exp1');
  if(expDone >= 5) awardBadge('b_exp5');
  // streak
  if(D.entries.length){
    const dates = [...new Set(D.entries.map(e=>e.date))].sort().reverse();
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
   AS 10 EMOÇÕES POSITIVAS (Fredrickson, 2009)
   ══════════════════════════════════ */
const EMOTIONS = [
  { id:'alegria',    emoji:'😄', name:'Alegria',     desc:'Quando algo bom e inesperado acontece' },
  { id:'gratidao',   emoji:'🙏', name:'Gratidão',    desc:'Quando você recebe algo valioso de alguém' },
  { id:'serenidade', emoji:'😌', name:'Serenidade',  desc:'Quando tudo está bem e você pode relaxar' },
  { id:'interesse',  emoji:'🔎', name:'Interesse',   desc:'Quando algo novo desperta sua curiosidade' },
  { id:'esperanca',  emoji:'🌅', name:'Esperança',   desc:'Quando você acredita que algo pode melhorar' },
  { id:'orgulho',    emoji:'🏅', name:'Orgulho',     desc:'Quando você conquista algo com o seu esforço' },
  { id:'diversao',   emoji:'😂', name:'Diversão',    desc:'Quando algo é engraçado e compartilhado' },
  { id:'inspiracao', emoji:'✨', name:'Inspiração',  desc:'Quando você testemunha a excelência humana' },
  { id:'admiracao',  emoji:'🌌', name:'Admiração',   desc:'Quando algo grandioso te faz sentir pequeno/a (awe)' },
  { id:'amor',       emoji:'💗', name:'Amor',        desc:'Micro-momentos de conexão genuína com alguém' },
];
const SAVORING_CHIPS = ['Parei para notar','Respirei e prolonguei','Compartilhei com alguém','Agradeci','Anotei/fotografei','Revivi mais tarde','Ainda não saboreei'];

/* ══════════════════════════════════
   SVG DIAGRAMS
   ══════════════════════════════════ */
function svgBroaden(){
  return `<div class="diagram-wrap">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">A Espiral Ascendente (Broaden-and-Build)</p>
  <svg viewBox="0 0 300 260" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <defs>
      <marker id="arrowJ" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#A0ADB8"/>
      </marker>
    </defs>
    <!-- Node: Emoção positiva (top) -->
    <ellipse cx="150" cy="34" rx="72" ry="22" fill="#FBF0DF" stroke="#C47D2A" stroke-width="2"/>
    <text x="150" y="30" text-anchor="middle" font-size="11" font-weight="700" fill="#7A4A10" font-family="Nunito Sans,sans-serif">Emoção positiva</text>
    <text x="150" y="43" text-anchor="middle" font-size="10" fill="#7A4A10" font-family="Nunito Sans,sans-serif">mesmo breve e sutil</text>
    <path d="M212,45 Q255,80 255,120" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Mente amplia (right) -->
    <ellipse cx="248" cy="140" rx="48" ry="24" fill="#EEE9FB" stroke="#8B7FB8" stroke-width="2"/>
    <text x="248" y="134" text-anchor="middle" font-size="10" font-weight="700" fill="#3D2E7A" font-family="Nunito Sans,sans-serif">A mente amplia</text>
    <text x="248" y="147" text-anchor="middle" font-size="9" fill="#3D2E7A" font-family="Nunito Sans,sans-serif">atenção · criatividade</text>
    <path d="M240,166 Q230,210 180,225" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Recursos crescem (bottom) -->
    <ellipse cx="150" cy="230" rx="72" ry="22" fill="#F0F6F3" stroke="#5E7D73" stroke-width="2"/>
    <text x="150" y="226" text-anchor="middle" font-size="11" font-weight="700" fill="#3D5A52" font-family="Nunito Sans,sans-serif">Recursos crescem</text>
    <text x="150" y="239" text-anchor="middle" font-size="10" fill="#3D5A52" font-family="Nunito Sans,sans-serif">laços · ideias · saúde</text>
    <path d="M120,225 Q60,210 52,166" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
    <!-- Node: Resiliência (left) -->
    <ellipse cx="52" cy="140" rx="46" ry="24" fill="#FAF0EF" stroke="#D96C63" stroke-width="2"/>
    <text x="52" y="134" text-anchor="middle" font-size="10" font-weight="700" fill="#B85550" font-family="Nunito Sans,sans-serif">Resiliência</text>
    <text x="52" y="147" text-anchor="middle" font-size="9" fill="#B85550" font-family="Nunito Sans,sans-serif">amortece as quedas</text>
    <path d="M60,118 Q90,70 90,45" fill="none" stroke="#A0ADB8" stroke-width="1.5" marker-end="url(#arrowJ)"/>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Cada volta da espiral deixa você com <strong>mais recursos</strong> do que tinha antes — mesmo depois que a emoção passa.</p>
</div>`;
}

function svgNegativityBias(){
  return `<div class="diagram-wrap">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:var(--coral-xl);border-radius:12px;padding:14px;border:1.5px solid var(--coral-l)">
      <div style="font-size:22px;margin-bottom:6px">⚠️</div>
      <div style="font-size:13px;font-weight:800;color:var(--coral-d);margin-bottom:4px">O negativo</div>
      <div style="font-size:12px;color:var(--coral-d);line-height:1.5">Gruda como <strong>velcro</strong><br>Chama atenção sozinho<br>Fica na memória<br>Grita</div>
    </div>
    <div style="background:var(--mint-xl);border-radius:12px;padding:14px;border:1.5px solid var(--mint-l)">
      <div style="font-size:22px;margin-bottom:6px">🌸</div>
      <div style="font-size:13px;font-weight:800;color:var(--mint-d);margin-bottom:4px">O positivo</div>
      <div style="font-size:12px;color:var(--mint-d);line-height:1.5">Escorrega como <strong>teflon</strong><br>Precisa ser notado<br>Evapora rápido<br>Sussurra</div>
    </div>
  </div>
  <div style="background:var(--white);border-radius:10px;padding:10px 12px;margin-top:10px;font-size:12px;color:var(--muted);line-height:1.6;border-left:3px solid var(--mint)">
    💡 Isso é o <strong style="color:var(--mint-d)">viés de negatividade</strong> — uma herança evolutiva. Quem notava o perigo sobrevivia. Notar o bom não era urgente. Por isso, cultivar o positivo exige <strong>intenção</strong>.
  </div>
</div>`;
}

function svgThreeSystems(){
  return `<div class="diagram-wrap">
  <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin-bottom:10px">Os Três Sistemas de Regulação (Gilbert)</p>
  <svg viewBox="0 0 300 240" style="width:100%;max-width:320px;display:block;margin:0 auto">
    <circle cx="105" cy="145" r="72" fill="rgba(217,108,99,.18)" stroke="#D96C63" stroke-width="2"/>
    <text x="88" y="130" font-size="18" text-anchor="middle" font-family="sans-serif">⚠️</text>
    <text x="88" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#B85550" font-family="Nunito Sans,sans-serif">Ameaça</text>
    <text x="88" y="161" text-anchor="middle" font-size="9" fill="#B85550" font-family="Nunito Sans,sans-serif">medo · ansiedade</text>
    <text x="88" y="173" text-anchor="middle" font-size="9" fill="#B85550" font-family="Nunito Sans,sans-serif">raiva · evitamento</text>
    <circle cx="195" cy="145" r="72" fill="rgba(196,125,42,.15)" stroke="#C47D2A" stroke-width="2"/>
    <text x="212" y="130" font-size="18" text-anchor="middle" font-family="sans-serif">🎯</text>
    <text x="212" y="148" text-anchor="middle" font-size="11" font-weight="800" fill="#7A4A10" font-family="Nunito Sans,sans-serif">Conquista</text>
    <text x="212" y="161" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Nunito Sans,sans-serif">ambição · excitação</text>
    <text x="212" y="173" text-anchor="middle" font-size="9" fill="#7A4A10" font-family="Nunito Sans,sans-serif">busca · realização</text>
    <circle cx="150" cy="88" r="72" fill="rgba(94,125,115,.15)" stroke="#5E7D73" stroke-width="2.5"/>
    <text x="150" y="68" font-size="20" text-anchor="middle" font-family="sans-serif">💚</text>
    <text x="150" y="88" text-anchor="middle" font-size="11" font-weight="800" fill="#3D5A52" font-family="Nunito Sans,sans-serif">Calmante</text>
    <text x="150" y="101" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Nunito Sans,sans-serif">contentamento · segurança</text>
    <text x="150" y="113" text-anchor="middle" font-size="9" fill="#3D5A52" font-family="Nunito Sans,sans-serif">pertencimento · calor</text>
  </svg>
  <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;line-height:1.5">Vivemos alternando entre <strong style="color:#B85550">Ameaça</strong> e <strong style="color:#7A4A10">Conquista</strong>. O sistema <strong style="color:#3D5A52">Calmante</strong> — fonte do contentamento — costuma ser o mais esquecido.</p>
</div>`;
}

function emoGridHTML(){
  return `<div class="emo-grid">${EMOTIONS.map(e=>`
    <div class="emo-cell"><span class="emo-emoji">${e.emoji}</span>
      <div><div class="emo-name">${e.name}</div><div class="emo-desc">${e.desc}</div></div>
    </div>`).join('')}</div>`;
}

/* ══════════════════════════════════
   MODULE DATA — 8 canteiros
   ══════════════════════════════════ */
const MODULES = [
  /* ─────────────────────────────────────────
     M1: Por que cultivar emoções positivas
     ───────────────────────────────────────── */
  {
    id:'m1', color:'mint', emoji:'🌅',
    levelTag:'Nível 1 — Preparar o Solo',
    title:'Por que Cultivar Emoções Positivas',
    tagline:'A ciência do que faz bem',
    xp:50, badgeId:'b_m1', unlockAfter:null,
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Seu cérebro tem um viés — e não é culpa sua',
        content:`<p class="step-text">Se você sente que as coisas ruins do dia ocupam mais espaço na cabeça do que as boas, você está certo/a — e isso tem nome.</p>
${svgNegativityBias()}
<p class="step-text" style="margin-top:10px">A boa notícia vem da pesquisadora <strong>Barbara Fredrickson</strong>: emoções positivas não servem só para "sentir-se bem". A teoria <em>Broaden-and-Build</em> (ampliar e construir), com décadas de evidência, mostra que elas têm uma função evolutiva poderosa:</p>
${svgBroaden()}
<div class="tip mint">🔑 <strong>Ideia central:</strong> Emoções difíceis estreitam o foco para sobreviver ao agora. Emoções positivas <strong>ampliam a mente e constroem recursos duráveis</strong> — criatividade, vínculos, saúde, resiliência. Cultivá-las é um investimento, não um luxo.</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'O que a ciência realmente diz?',
        question:'Segundo a teoria Broaden-and-Build, qual é a função das emoções positivas?',
        opts:[
          { text:'Substituir e eliminar as emoções negativas', correct:false },
          { text:'Ampliar a mente e construir recursos duráveis (vínculos, ideias, resiliência)', correct:true },
          { text:'Mostrar aos outros que estamos bem', correct:false },
          { text:'Nenhuma — são apenas um efeito colateral agradável', correct:false },
        ],
        feedbackOk:'✅ Exato! Emoções positivas ampliam a atenção e o pensamento no momento — e, repetidas ao longo do tempo, constroem recursos que ficam com você mesmo depois que a emoção passa.',
        feedbackNo:'Quase! Emoções positivas não existem para eliminar as negativas (todas têm função). Elas <strong>ampliam a mente e constroem recursos duráveis</strong> — essa é a descoberta central de Fredrickson.'
      },
      {
        type:'flipcard', typeLabel:'🃏 Cartas interativas',
        title:'Mito ou fato? Vire as cartas',
        hint:'Toque em cada carta para revelar o que a ciência diz.',
        cards:[
          { front:'"Cultivar emoções positivas é fingir que está tudo bem"', back:'🚫 Mito — isso seria positividade tóxica. Cultivar o positivo é ADICIONAR, não negar. As emoções difíceis continuam válidas.', color:'coral' },
          { front:'"Felicidade é questão de sorte ou genética"', back:'🔬 Em parte — mas uma fatia importante do bem-estar responde a atividades intencionais (Lyubomirsky). É treinável.', color:'mint' },
          { front:'"Preciso resolver todos os problemas antes de me permitir sentir bem"', back:'🚫 Mito — é o contrário: emoções positivas RECUPERAM o corpo do estresse (efeito undo) e ajudam a resolver melhor.', color:'coral' },
          { front:'"Emoções positivas duram pouco"', back:'✅ Fato — e é por isso que notar e saborear importam tanto. O efeito delas é cumulativo, como regar uma planta.', color:'mint' },
          { front:'"Pessoas resilientes sentem menos emoções negativas"', back:'🚫 Mito — elas sentem as negativas TAMBÉM, mas mantêm acesso às positivas durante a adversidade. É isso que amortece.', color:'coral' },
          { front:'"Sentir alegria em tempos difíceis é falta de respeito"', back:'🚫 Mito — no luto e na crise, momentos de leveza são combustível para aguentar. Não é traição, é sustento.', color:'mint' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Reflexão pessoal',
        title:'O que te trouxe até aqui?',
        prompt:'Pense na sua vida hoje. Quanto espaço as emoções positivas têm? O que mudaria no seu dia a dia se você as sentisse com mais frequência e intensidade?',
        placeholder:'Hoje, as emoções positivas na minha vida... Se eu cultivasse mais, eu...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M2: O repertório — 10 emoções positivas
     ───────────────────────────────────────── */
  {
    id:'m2', color:'lav', emoji:'🎨',
    levelTag:'Nível 1 — Preparar o Solo',
    title:'O Repertório: 10 Emoções Positivas',
    tagline:'Nomear com precisão amplia o sentir',
    xp:60, badgeId:'b_m2', unlockAfter:'m1',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Granularidade: o vocabulário do sentir',
        content:`<p class="step-text">A neurocientista <strong>Lisa Feldman Barrett</strong> descobriu algo curioso: pessoas que nomeiam suas emoções com <em>precisão</em> ("estou sentindo serenidade", em vez de só "estou bem") regulam melhor o que sentem — e sentem com mais riqueza.</p>
<p class="step-text" style="margin-top:10px">Isso se chama <strong>granularidade emocional</strong>. E funciona como paladar: quem só conhece "doce e salgado" sente menos sabores do que quem reconhece nuances. Conheça as <strong>10 emoções positivas mais estudadas</strong> (Fredrickson):</p>
${emoGridHTML()}
<div class="tip lav">💡 Repare: só 2 ou 3 delas são "animadas". A maioria é <strong>sutil e silenciosa</strong> — serenidade, gratidão, admiração. Se você só procura euforia, deixa 80% do repertório passar.</div>`
      },
      {
        type:'flipcard', typeLabel:'🃏 Cartas interativas',
        title:'Que emoção é essa?',
        hint:'Leia a cena e tente nomear a emoção antes de virar a carta.',
        cards:[
          { front:'Você olha o mar à noite e se sente pequeno/a — de um jeito bom.', back:'🌌 Admiração (awe) — a emoção diante do que é vasto. Expande a noção de tempo e reduz a ruminação.', color:'mint' },
          { front:'Alguém segurou o elevador para você e sorriu.', back:'💗 Amor — micro-momento de conexão. Para o cérebro, conexão breve e genuína já conta.', color:'coral' },
          { front:'Domingo de manhã, café pronto, nada urgente para fazer.', back:'😌 Serenidade — a emoção do "está tudo bem agora". Baixa ativação, alto valor.', color:'mint' },
          { front:'Você assiste a um vídeo de alguém superando algo enorme.', back:'✨ Inspiração — testemunhar excelência humana desperta vontade de crescer.', color:'coral' },
          { front:'Você terminou algo difícil que vinha adiando.', back:'🏅 Orgulho — reconhecer o próprio esforço. Não é arrogância: é combustível de motivação.', color:'mint' },
          { front:'Você já imagina a viagem do próximo mês.', back:'🌅 Esperança + antecipação — saborear o futuro também é emoção positiva no presente.', color:'coral' },
        ]
      },
      {
        type:'classify', typeLabel:'🗂️ Atividade de classificação',
        title:'Expansiva ou tranquila?',
        instruction:'Emoções positivas vêm em dois "volumes": as expansivas (alta energia) e as tranquilas (baixa energia). Classifique:',
        btnA:'⚡ Expansiva', btnB:'🌿 Tranquila',
        items:[
          { text:'Diversão — rir alto com amigos', cat:'u', label:'Expansiva — alta energia' },
          { text:'Serenidade — paz de um fim de tarde', cat:'n', label:'Tranquila — baixa energia' },
          { text:'Alegria — receber uma ótima notícia', cat:'u', label:'Expansiva — alta energia' },
          { text:'Gratidão — reconhecer o que se recebeu', cat:'n', label:'Tranquila — baixa energia' },
          { text:'Inspiração — vontade de criar agora', cat:'u', label:'Expansiva — alta energia' },
          { text:'Contentamento — "não falta nada agora"', cat:'n', label:'Tranquila — baixa energia' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Reflexão pessoal',
        title:'O inventário do seu jardim',
        prompt:'Olhe a lista das 10 emoções. Quais você sente com alguma frequência? Quais estão raras ou ausentes? Escolha UMA emoção "em falta" que você gostaria de cultivar nas próximas semanas.',
        placeholder:'Sinto com frequência: ...\n\nEstão em falta: ...\n\nQuero cultivar: ... porque...',
        minChars:40
      }
    ]
  },

  /* ─────────────────────────────────────────
     M3: Notar — o radar do positivo
     ───────────────────────────────────────── */
  {
    id:'m3', color:'amber', emoji:'🔍',
    levelTag:'Nível 2 — Notar e Saborear',
    title:'Notar: o Radar do Positivo',
    tagline:'Treinar a atenção para o que já vai bem',
    xp:65, badgeId:'b_m3', unlockAfter:'m2',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'O que você procura, você encontra',
        content:`<p class="step-text">A atenção funciona como um holofote: ilumina uma coisa e deixa o resto no escuro. O viés de negatividade aponta esse holofote para problemas — <strong>automaticamente</strong>.</p>
<p class="step-text" style="margin-top:10px">Mas holofotes podem ser redirecionados. A prática mais estudada para isso chama-se <strong>Três Coisas Boas</strong> (Seligman): anotar, no fim do dia, 3 coisas que foram bem — e <em>por que</em> foram bem.</p>
<div class="tip amber"><strong>📊 A evidência:</strong> No estudo original, uma semana desta prática aumentou felicidade e reduziu sintomas depressivos por até <strong>6 meses</strong>. Não porque o dia melhora — mas porque o radar aprende a captar o que antes passava batido.</div>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>🔍 Vale notar:</strong> o café que estava bom · o ônibus que passou na hora · a mensagem de alguém · 10 minutos de silêncio · você ter feito algo apesar do cansaço</div>
  <div class="tip coral" style="margin:0"><strong>⚠️ Armadilha comum:</strong> esperar coisas GRANDES. Quem só registra promoções e viagens registra 3 vezes por ano. O treino é com o pequeno e cotidiano.</div>
</div>
<p class="step-text">É exatamente para isso que existe o botão <strong>Registrar</strong> aqui do app — seu caderno de jardineiro/a.</p>`
      },
      {
        type:'guided', typeLabel:'⚙️ Prática guiada',
        title:'Caça ao positivo — agora mesmo',
        phases:[
          { num:'Passo 1', title:'Ao seu redor', text:'Olhe ao redor, agora, e encontre <strong>uma coisa agradável aos sentidos</strong> que você não tinha notado.<br><br>Uma cor, a luz entrando, uma textura, um som distante, o cheiro do ambiente.<br><br>Fique 15 segundos só com ela. Não precisa ser especial — precisa ser <em>notada</em>.', btn:'Encontrei' },
          { num:'Passo 2', title:'Nas últimas 24 horas', text:'Agora escaneie o seu ontem e hoje: <strong>o que foi bem?</strong> Mesmo pequeno.<br><br>Encontrou? Agora reviva por 20 segundos: onde você estava, o que sentiu no corpo, quem estava junto.<br><br>Reviver com detalhes é o que grava a memória — o cérebro re-sente o que você re-visita.', btn:'Revivi' },
          { num:'Passo 3', title:'Em você', text:'A parte mais difícil do radar: apontar para dentro.<br><br>Note <strong>uma coisa em você</strong> — um esforço que você fez, uma qualidade que apareceu, algo que você aguentou.<br><br>Diga mentalmente, como um fato: <em>"Hoje eu [fiz/fui/aguentei]..."</em><br><br>Tire uma "foto mental" desse reconhecimento.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'Por que escrever funciona melhor?',
        question:'A prática das Três Coisas Boas pede para ESCREVER, não só pensar. Por quê?',
        opts:[
          { text:'Porque pensar não tem nenhum efeito', correct:false },
          { text:'Escrever exige atenção sustentada e elaboração — o que consolida a memória e treina o radar', correct:true },
          { text:'Para ter provas de que o dia foi bom', correct:false },
          { text:'Porque escrever dá mais trabalho e esforço sempre é melhor', correct:false },
        ],
        feedbackOk:'✅ Isso! Escrever obriga a mente a segurar o momento por mais tempo e a elaborá-lo ("por que isso foi bom?"). É essa demora + elaboração que muda o padrão de atenção.',
        feedbackNo:'Pensar ajuda, mas escrever exige <strong>atenção sustentada e elaboração</strong> — a mente segura o momento por mais tempo, e é isso que consolida a memória e re-treina o radar.'
      },
      {
        type:'fill', typeLabel:'✍️ Design de hábito',
        title:'Quando o seu radar vai ligar?',
        prompt:'Hábitos precisam de âncora (COM-B: criar oportunidade). Complete o plano:\n\n"Depois de [algo que já faço todo dia — ex.: escovar os dentes à noite, deitar na cama, almoçar], vou abrir o Floresça e registrar 1 momento bom do dia."\n\nOnde o celular vai estar nesse momento? O que pode atrapalhar, e como resolver?',
        placeholder:'Depois de..., vou registrar 1 momento bom.\nO celular estará...\nSe eu esquecer, vou...',
        minChars:30
      }
    ]
  },

  /* ─────────────────────────────────────────
     M4: Saborear
     ───────────────────────────────────────── */
  {
    id:'m4', color:'coral', emoji:'🍯',
    levelTag:'Nível 2 — Notar e Saborear',
    title:'Saborear: Presente, Passado e Futuro',
    tagline:'Amplificar e prolongar o que é bom',
    xp:70, badgeId:'b_m4', unlockAfter:'m3',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Savoring: a arte de ficar no momento bom',
        content:`<p class="step-text">Notar é o primeiro passo. <strong>Saborear</strong> (savoring — Bryant & Veroff) é o segundo: a capacidade de <em>amplificar e prolongar</em> a experiência positiva, em vez de deixá-la escorregar.</p>
<p class="step-text" style="margin-top:10px">E aqui está o segredo que quase ninguém usa: dá para saborear em <strong>três tempos</strong>:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip coral" style="margin:0"><strong>🍽️ Presente</strong> — absorção total: desacelerar, usar os sentidos, expressar a emoção (sorrir, dizer em voz alta "que bom isso").</div>
  <div class="tip amber" style="margin:0"><strong>📸 Passado</strong> — reminiscência: revisitar memórias boas com detalhes. Fotos, cheiros e músicas são portais.</div>
  <div class="tip lav" style="margin:0"><strong>🎈 Futuro</strong> — antecipação: planejar algo bom e saboreá-lo ANTES de acontecer. Metade do prazer da viagem acontece antes da viagem.</div>
</div>
<div class="tip mint">⚠️ E o inimigo do sabor tem nome: <strong>amortecimento</strong> (dampening). São os pensamentos que apagam o momento bom: <em>"não mereço", "vai acabar logo", "foi só sorte"</em> — e o hábito de estar no celular enquanto a vida boa acontece. Vamos treinar para reconhecê-los.</div>`
      },
      {
        type:'guided', typeLabel:'🍯 Prática guiada',
        title:'Saborear em 2 minutos — agora',
        phases:[
          { num:'Fase 1', title:'Escolha algo para saborear', text:'Escolha UMA coisa agradável disponível agora: um gole de café ou água, uma música, a vista da janela, uma memória boa recente.<br><br>Decida: pelos próximos 2 minutos, <strong>só isso existe</strong>.', btn:'Escolhi' },
          { num:'Fase 2', title:'Absorção pelos sentidos', text:'Explore devagar, como se fosse a primeira vez:<br><br><em>O que você vê? Que detalhes? E os sons? Temperatura? Textura? Sabor?</em><br><br>Quando a mente fugir (ela vai), traga de volta sem bronca. Isso É o exercício.', btn:'Próxima fase' },
          { num:'Fase 3', title:'Nomeie e expresse', text:'Que emoção apareceu? Serenidade? Interesse? Gratidão? <strong>Nomeie</strong> — de preferência em voz baixa.<br><br>Agora <strong>expresse</strong>: deixe um meio-sorriso acontecer, solte os ombros, respire fundo uma vez.<br><br>Expressar a emoção no corpo amplifica o sinal no cérebro.', btn:'Próxima fase' },
          { num:'Fase 4', title:'Guarde a semente', text:'Antes de encerrar, tire uma "foto mental" deliberada: <em>"quero lembrar disto".</em><br><br>Se quiser potencializar: registre este momento no app (botão Registrar) ou conte a alguém hoje.<br><br>Compartilhar um momento bom <strong>dobra o efeito dele</strong> — é a prática de capitalização.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'classify', typeLabel:'🗂️ Atividade de classificação',
        title:'Amplifica ou apaga?',
        instruction:'Diante de um momento bom, cada reação amplifica o sabor ou apaga. Classifique:',
        btnA:'🍯 Amplifica', btnB:'🧯 Apaga',
        items:[
          { text:'Contar a novidade boa para alguém querido', cat:'u', label:'Amplifica — capitalização comprovada' },
          { text:'"Foi só sorte, não conta"', cat:'n', label:'Apaga — desqualifica a experiência' },
          { text:'Fechar os olhos para ouvir a música favorita', cat:'u', label:'Amplifica — absorção sensorial' },
          { text:'Checar e-mails durante o jantar especial', cat:'n', label:'Apaga — atenção dividida mata o sabor' },
          { text:'"Amanhã tem reunião difícil" no meio do passeio', cat:'n', label:'Apaga — viagem mental para o problema' },
          { text:'Dizer em voz alta: "que momento bom esse"', cat:'u', label:'Amplifica — expressar marca a emoção' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Saborear o futuro',
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
    id:'m5', color:'mint', emoji:'🙏',
    levelTag:'Nível 3 — Aprofundar',
    title:'Gratidão que Transforma',
    tagline:'A prática com mais evidência da área',
    xp:70, badgeId:'b_m5', unlockAfter:'m4',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Por que gratidão funciona (quando bem feita)',
        content:`<p class="step-text">Gratidão é a emoção positiva <strong>mais estudada</strong> da psicologia. Nos estudos de <strong>Emmons & McCullough</strong>, quem registrava motivos de gratidão semanalmente dormia melhor, sentia mais bem-estar e até se exercitava mais do que os grupos de comparação.</p>
<p class="step-text" style="margin-top:10px">O mecanismo tem duas engrenagens:</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip mint" style="margin:0"><strong>👁️ Atenção</strong><br>Gratidão obriga o radar a varrer o que foi <em>recebido</em> — que o viés de negatividade esconde.</div>
  <div class="tip coral" style="margin:0"><strong>🤝 Vínculo</strong><br>Reconhecer quem nos fez bem fortalece os laços — o maior preditor de bem-estar que existe.</div>
</div>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip amber" style="margin:0"><strong>O que gratidão NÃO é:</strong><br>• Dívida ("agora tenho que retribuir") — isso é peso, não gratidão.<br>• Obrigação de estar grato/a por tudo, sempre.<br>• Anular queixas legítimas ("seja grato/a e não reclame").</div>
</div>
<div class="tip lav">💡 <strong>Segredo da eficácia:</strong> especificidade e variedade. "Sou grata pela minha família" (genérico, repetido) perde efeito rápido. "Sou grata porque minha irmã me ligou ontem só para saber de mim" — isso o cérebro sente.</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'Qual prática tem mais efeito?',
        question:'Duas pessoas praticam gratidão diariamente. Qual delas tende a manter os benefícios ao longo do tempo?',
        opts:[
          { text:'Ana: escreve todo dia "sou grata pela saúde, família e trabalho"', correct:false },
          { text:'Bia: escreve a cada dia algo específico e diferente — "o motorista esperou eu correr até o ponto"', correct:true },
          { text:'As duas igualmente — o que importa é repetir', correct:false },
          { text:'Nenhuma — gratidão só funciona em datas especiais', correct:false },
        ],
        feedbackOk:'✅ Exato! O cérebro se adapta ao repetido (adaptação hedônica). Especificidade + variedade mantêm a prática "viva" — cada registro exige que o radar realmente procure.',
        feedbackNo:'A prática da Bia é mais eficaz: o cérebro se <strong>adapta ao repetido</strong> e a lista genérica vira ritual vazio. Especificidade e variedade obrigam o radar a procurar de verdade.'
      },
      {
        type:'guided', typeLabel:'💌 Prática guiada',
        title:'A carta de gratidão',
        phases:[
          { num:'Passo 1', title:'Escolha a pessoa', text:'Pense em alguém que fez algo importante por você e que <strong>nunca foi devidamente agradecido/a</strong>.<br><br>Pode ser algo grande ou um gesto pequeno que ficou. Um professor, um amigo, um familiar, alguém que apareceu na hora certa.<br><br>Deixe um nome surgir. O primeiro que veio geralmente é o certo.', btn:'Escolhi' },
          { num:'Passo 2', title:'Reviva o que ela fez', text:'Antes de escrever, reconstrua mentalmente:<br><br><em>O que exatamente essa pessoa fez? O que estava acontecendo na sua vida? O que teria sido diferente sem ela? O que isso diz sobre ela?</em><br><br>Sinta o que aparece no corpo enquanto lembra. Isso já é a gratidão trabalhando.', btn:'Próximo passo' },
          { num:'Passo 3', title:'Decida o destino', text:'Na próxima etapa você vai escrever a carta. Ela pode ter três destinos — <strong>todos válidos</strong>:<br><br>📬 <strong>Entregar/ler para a pessoa</strong> — efeito mais forte nos estudos (a "visita de gratidão" de Seligman).<br>✉️ <strong>Enviar por mensagem</strong> — mais viável, ainda poderoso.<br>🗃️ <strong>Só escrever e guardar</strong> — o benefício de escrever já é real.<br><br>Escolha sem pressão.', btn:'Vamos escrever ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Carta de gratidão',
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
    id:'m6', color:'lav', emoji:'💚',
    levelTag:'Nível 3 — Aprofundar',
    title:'Contentamento e Segurança (TFC)',
    tagline:'O bem-estar que não depende de conquista',
    xp:80, badgeId:'b_m6', unlockAfter:'m5',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Dois tipos de "sentir-se bem"',
        content:`<p class="step-text">Paul Gilbert, criador da Terapia Focada na Compaixão (TFC), mostrou que temos <strong>três sistemas emocionais</strong> — e que existem dois tipos muito diferentes de emoção positiva:</p>
${svgThreeSystems()}
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0">
  <div class="tip amber" style="margin:0"><strong>🎯 Positivas de Conquista</strong><br>Excitação, euforia, "consegui!". Dependem de alcançar algo. Aceleram.</div>
  <div class="tip mint" style="margin:0"><strong>💚 Positivas de Calmaria</strong><br>Contentamento, segurança, calor humano. Não dependem de conquistar nada. Desaceleram.</div>
</div>
<p class="step-text">A nossa cultura hipertreina o sistema de Conquista: sentir-se bem só quando produz, alcança, ganha. O resultado é uma vida em que o descanso vira culpa e o bem-estar está sempre <em>no próximo objetivo</em>.</p>
<div class="tip lav">🔑 <strong>Ideia central:</strong> o sistema Calmante é ativado por ritmo lento, calor humano, memória de afeto e segurança. Ele é <strong>treinável</strong> — e é a base da resiliência: quem consegue se acalmar, consegue se recuperar.</div>`
      },
      {
        type:'breath', typeLabel:'🌬️ Respiração do ritmo calmante',
        title:'Ativando o sistema calmante',
        instruction:'Esta respiração, usada na TFC, é mais lenta e focada na <em>sensação</em> de desaceleração. Imagine que o corpo encontra o próprio ritmo — como ondas calmas.<br><br>Ritmo: inspire suavemente pelo nariz (5s), expire lentamente (7s). A expiração longa é o freio fisiológico do corpo.<br><br>Toque para começar. Faça 4 ciclos com atenção gentil.',
        pattern:[ {label:'Inspira suave',dur:5,cls:'expand soothe'},{label:'Expira lenta',dur:7,cls:'contract soothe'} ],
        totalCycles:4
      },
      {
        type:'guided', typeLabel:'🌿 Prática guiada (TFC)',
        title:'Memória de gentileza',
        phases:[
          { num:'Preparação', title:'Postura e ritmo', text:'Sente-se confortavelmente. Suavize o olhar ou feche os olhos.<br><br>Respire duas vezes no ritmo calmante que você acabou de praticar.<br><br>Você vai acessar uma memória — e o seu sistema nervoso vai respondê-la como se fosse agora. Isso é fisiologia, não imaginação.', btn:'Estou pronto/a' },
          { num:'A memória', title:'Alguém foi gentil com você', text:'Lembre de um momento em que alguém foi <strong>genuinamente gentil</strong> com você. Um cuidado, uma palavra na hora certa, uma presença.<br><br>Reconstrua a cena: onde era? Que expressão a pessoa tinha? Que tom de voz?<br><br>Deixe a sensação de <em>ser cuidado/a</em> aparecer. Não force — permita.', btn:'Estou lá' },
          { num:'No corpo', title:'Onde você sente?', text:'Onde essa memória toca o corpo?<br><br>Um calor no peito? Os ombros que descem? A respiração que solta?<br><br>Fique 30 segundos com essa sensação. Isso é o seu sistema calmante <strong>ligado</strong> — contentamento e segurança têm endereço físico.', btn:'Próxima fase' },
          { num:'Alegria compassiva', title:'Sentir junto', text:'Última camada: lembre de uma alegria de <strong>alguém que você ama</strong> — uma conquista, uma boa notícia dela.<br><br>Perceba: dá para sentir prazer com a alegria do outro. Essa emoção (os budistas chamam <em>mudita</em>) é uma fonte infinita — porque não depende só da SUA vida ir bem.<br><br>Crie um gesto de âncora: mão no peito + uma respiração lenta. Ele te traz de volta aqui quando precisar.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Mapa do contentamento',
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
    id:'m7', color:'coral', emoji:'🧪',
    levelTag:'Nível 4 — Florescer',
    title:'Crenças que Bloqueiam a Alegria',
    tagline:'Testar na prática os medos do bem-estar',
    xp:90, badgeId:'b_m7', unlockAfter:'m6',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Medo de sentir-se bem existe — e tem lógica',
        content:`<p class="step-text">Parece contraditório, mas é comum e bem documentado: muitas pessoas têm <strong>medo das emoções positivas</strong> (Gilbert). O bem-estar dispara um alarme:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:14px 0">
  <div class="tip coral" style="margin:0">"Se eu ficar muito feliz, <strong>algo ruim vai acontecer</strong>" (não posso baixar a guarda)</div>
  <div class="tip coral" style="margin:0">"Eu <strong>não mereço</strong> me sentir bem" (enquanto outros sofrem / com tudo que fiz)</div>
  <div class="tip coral" style="margin:0">"Sentir orgulho é <strong>se achar</strong>" (vão me julgar, vou atrair inveja)</div>
  <div class="tip coral" style="margin:0">"Descansar e aproveitar é <strong>perda de tempo</strong>" (só produção justifica existir)</div>
</div>
<p class="step-text">Essas crenças geralmente foram <strong>aprendidas como proteção</strong>: em algum momento, relaxar saiu caro, comemorar atraiu crítica, ou a alegria foi interrompida por algo doloroso. A crença virou um guarda na porta do jardim.</p>
<div class="tip mint">🔑 O problema: a crença faz você <strong>evitar ou amortecer</strong> o bem-estar — e assim ela nunca é testada. O guarda nunca descobre que a guerra acabou. A saída não é discutir com a crença: é <strong>testá-la em experimentos pequenos e seguros</strong>.</div>`
      },
      {
        type:'flipcard', typeLabel:'🃏 Cartas interativas',
        title:'A crença e o outro lado',
        hint:'Vire cada carta para ver o que os dados e a lógica dizem.',
        cards:[
          { front:'"Se eu comemorar antes da hora, estrago tudo"', back:'🧪 Testável: comemorar não altera probabilidades — mas motiva a continuar. Times que celebram pequenas vitórias persistem mais.', color:'coral' },
          { front:'"Não mereço estar bem enquanto há problemas"', back:'🧪 Inverta: você cuida melhor dos problemas descansado/a ou esgotado/a? Bem-estar é combustível, não prêmio.', color:'mint' },
          { front:'"Se eu relaxar, vou baixar a guarda e ser pego/a"', back:'🧪 O corpo em alerta constante erra MAIS, não menos. Vigilância crônica degrada exatamente o desempenho que ela tenta proteger.', color:'coral' },
          { front:'"Sentir orgulho é arrogância"', back:'🧪 Arrogância é se colocar acima dos outros. Orgulho é reconhecer o próprio esforço. São emoções diferentes — e confundi-las custa caro.', color:'mint' },
          { front:'"Alegria demais atrai inveja/olho gordo"', back:'🧪 Talvez algumas pessoas se incomodem. Experimente: compartilhe com quem é seguro. O problema era a alegria ou a plateia?', color:'coral' },
          { front:'"Sou pessimista, não vou mudar"', back:'🧪 Ninguém precisa "virar otimista". O treino é de atenção e comportamento — e esses mudam com prática, seja qual for o temperamento.', color:'mint' },
        ]
      },
      {
        type:'info', typeLabel:'🔬 Método',
        title:'Como funciona um experimento comportamental',
        content:`<p class="step-text">O experimento comportamental é a ferramenta mais poderosa da TCC — porque a mente acredita mais no que <strong>vive</strong> do que no que ouve. O ciclo tem 4 passos:</p>
<div class="ob-num-steps" style="margin:14px 0">
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--coral-xl);color:var(--coral-d)">1</div>
    <div class="ob-num-step-body"><strong>Previsão</strong><span>"Se eu fizer X, acho que vai acontecer Y / vou sentir tanto assim." Anote ANTES — sem isso não há experimento.</span></div>
  </div>
  <div class="ob-num-step">
    <div class="ob-num-circle" style="background:var(--amber-l);color:#7A4A10">2</div>
    <div class="ob-num-step-body"><strong>Teste</strong><span>Faça a ação — pequena, segura, definida. Não precisa "dar certo": precisa acontecer.</span></div>
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
<div class="tip lav">🧪 O <strong>Laboratório</strong> deste app (aba "Testar") faz exatamente esse ciclo: você escolhe um experimento, registra sua previsão, testa na vida real e compara. Spoiler dos estudos: a mente <strong>subestima sistematicamente</strong> o quanto essas experiências fazem bem.</div>`
      },
      {
        type:'fill', typeLabel:'✍️ Meu experimento',
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
    id:'m8', color:'amber', emoji:'🌳',
    levelTag:'Nível 4 — Florescer',
    title:'Um Jardim que Dura',
    tagline:'Transformar práticas em recursos para a vida',
    xp:100, badgeId:'b_m8', unlockAfter:'m7',
    steps:[
      {
        type:'info', typeLabel:'📖 Psicoeducação',
        title:'Bem-estar tem arquitetura',
        content:`<p class="step-text">Seligman resumiu os pilares do bem-estar duradouro no modelo <strong>PERMA</strong>:</p>
<div class="emo-grid" style="grid-template-columns:1fr">
  <div class="emo-cell"><span class="emo-emoji">😊</span><div><div class="emo-name">P — Emoções Positivas</div><div class="emo-desc">Tudo que você treinou até aqui: notar, saborear, gratidão</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">🌊</span><div><div class="emo-name">E — Engajamento</div><div class="emo-desc">Atividades que te absorvem por inteiro (flow)</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">🤝</span><div><div class="emo-name">R — Relacionamentos</div><div class="emo-desc">O maior preditor de bem-estar em todos os estudos</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">🧭</span><div><div class="emo-name">M — Significado (Meaning)</div><div class="emo-desc">Fazer parte de algo maior que você</div></div></div>
  <div class="emo-cell"><span class="emo-emoji">🏔️</span><div><div class="emo-name">A — Realização (Accomplishment)</div><div class="emo-desc">Progredir em algo que importa — e reconhecer o progresso</div></div></div>
</div>
<p class="step-text" style="margin-top:10px">E dois avisos da ciência para o longo prazo:</p>
<div style="display:flex;flex-direction:column;gap:8px;margin:12px 0">
  <div class="tip coral" style="margin:0"><strong>⚠️ Adaptação hedônica:</strong> o cérebro se acostuma com o repetido. Antídoto: <strong>variedade</strong> — alterne práticas, mude horários, surpreenda-se (Lyubomirsky).</div>
  <div class="tip mint" style="margin:0"><strong>🤝 Capitalização (Gable):</strong> compartilhar boas notícias com quem responde com interesse genuíno multiplica o efeito delas — e fortalece a relação. Escolha bem a plateia.</div>
</div>`
      },
      {
        type:'quiz', typeLabel:'🧩 Atividade',
        title:'A arte de responder a boas notícias',
        question:'Sua amiga conta, animada: "Fui aprovada no processo seletivo!". Qual resposta FORTALECE a relação e a emoção dela?',
        opts:[
          { text:'"Que ótimo." (e muda de assunto)', correct:false },
          { text:'"Cuidado, essas empresas exploram muito, viu?"', correct:false },
          { text:'"Que demais! Me conta tudo — como você soube? Como comemorou?"', correct:true },
          { text:'"Legal! Isso me lembra quando EU fui aprovada..."', correct:false },
        ],
        feedbackOk:'✅ Perfeito! Essa é a resposta ativa-construtiva: interesse genuíno + perguntas que fazem a pessoa reviver e saborear. É a única das quatro que amplifica a alegria E o vínculo.',
        feedbackNo:'A resposta que fortalece é a <strong>ativa-construtiva</strong>: "Que demais! Me conta tudo..." — interesse genuíno com perguntas. As outras esvaziam a notícia, roubam a cena ou apontam perigo.'
      },
      {
        type:'guided', typeLabel:'⚙️ Design do sistema',
        title:'Desenhe o seu sistema de cultivo',
        phases:[
          { num:'Passo 1', title:'Suas práticas favoritas', text:'Olhe para trás no percurso: registro de momentos, saborear em 2 minutos, gratidão específica, respiração calmante, memória de gentileza, experimentos, antecipação...<br><br>Escolha <strong>2 ou 3</strong> que funcionaram DE VERDADE para você. Não as "que deveriam" — as que funcionaram.<br><br>Menos práticas mantidas valem mais que muitas abandonadas.', btn:'Escolhi' },
          { num:'Passo 2', title:'Âncoras se-então', text:'Agora transforme cada uma em plano <strong>"quando-então"</strong> (Gollwitzer — dobra a chance de acontecer):<br><br><em>"Quando eu deitar na cama, então registro 1 momento bom."<br>"Quando o café ficar pronto, então saboreio os 3 primeiros goles."<br>"Quando alguém me contar uma boa notícia, então pergunto mais."</em><br><br>Formule as suas mentalmente agora.', btn:'Formulei' },
          { num:'Passo 3', title:'Prepare o terreno', text:'Último passo (COM-B: capacidade você já tem, motivação também — falta desenhar a <strong>oportunidade</strong>):<br><br>• Deixe o app na primeira tela do celular<br>• Ative o lembrete diário (em Dados)<br>• Conte a alguém o que está praticando — testemunhas criam constância<br>• Decida já o que fazer quando falhar um dia: <em>recomeçar sem drama no dia seguinte</em>. Jardins sobrevivem a dias sem rega.', btn:'Concluído ✓' },
        ]
      },
      {
        type:'fill', typeLabel:'✍️ Carta ao futuro',
        title:'Uma carta para você em 3 meses',
        prompt:'Escreva uma carta curta para o seu eu de daqui a 3 meses. Inclua:\n— Que práticas você espera que ele/a esteja mantendo\n— Que emoções você deseja que estejam mais presentes na vida dele/a\n— Um lembrete gentil para os dias em que o jardim parecer seco\n\nEscreva com o carinho de quem cuida de algo que está crescendo.',
        placeholder:'Oi, eu do futuro...\n\nEspero que você esteja...\n\nSe o jardim parecer seco, lembre que...',
        minChars:80
      }
    ]
  },
]; // end MODULES

/* ══════════════════════════════════
   LABORATÓRIO — banco de experimentos
   ══════════════════════════════════ */
const EXPERIMENTS = [
  { id:'e1',  emoji:'💌', title:'Mensagem de gratidão',      emotion:'Gratidão',    time:'5 min',
    desc:'Envie hoje uma mensagem específica a alguém, agradecendo por algo concreto que essa pessoa fez — sem ser data especial, sem motivo "oficial".',
    belief:'"Vão achar estranho / não vai fazer diferença."' },
  { id:'e2',  emoji:'🍽️', title:'Refeição saboreada',        emotion:'Serenidade',  time:'15 min',
    desc:'Faça UMA refeição sem telas. Nos três primeiros garfos, atenção total: sabor, textura, temperatura. Depois coma normalmente.',
    belief:'"Comer é só abastecer, não dá para curtir isso."' },
  { id:'e3',  emoji:'📣', title:'Compartilhar a boa notícia', emotion:'Alegria',     time:'5 min',
    desc:'Aconteceu algo bom, mesmo pequeno? Conte hoje para alguém que responde bem — com detalhes, deixando-se animar ao contar.',
    belief:'"Falar das minhas coisas boas é me exibir."' },
  { id:'e4',  emoji:'🌳', title:'Caminhada de admiração',     emotion:'Admiração',   time:'15 min',
    desc:'Caminhe 15 minutos procurando deliberadamente o que você nunca notou: uma árvore antiga, um detalhe de prédio, o céu. Pare em 3 coisas.',
    belief:'"Meu bairro/dia a dia não tem nada de especial."' },
  { id:'e5',  emoji:'🎁', title:'Gentileza anônima',          emotion:'Amor',        time:'10 min',
    desc:'Faça um ato de gentileza sem receber crédito: um elogio sincero, pagar um café, deixar algo bom no caminho de alguém.',
    belief:'"Gestos pequenos não mudam nada."' },
  { id:'e6',  emoji:'🎶', title:'Uma música, corpo inteiro',  emotion:'Diversão',    time:'5 min',
    desc:'Escolha UMA música que você ama e dance ou cante junto — sozinho/a se preferir, do início ao fim, sem fazer mais nada.',
    belief:'"Isso é ridículo / não tenho mais idade para isso."' },
  { id:'e7',  emoji:'📸', title:'Beleza do dia (3 dias)',     emotion:'Interesse',   time:'1 min/dia',
    desc:'Por 3 dias, fotografe UMA coisa bonita ou interessante por dia. No 3º dia, reveja as três fotos com calma.',
    belief:'"Não tenho olhar para essas coisas."' },
  { id:'e8',  emoji:'🌇', title:'Dez minutos de céu',         emotion:'Serenidade',  time:'10 min',
    desc:'Assista ao pôr do sol, ao céu ou à rua da janela por 10 minutos, sem celular, sem tarefa. Só olhar — como quem não deve nada.',
    belief:'"Ficar parado/a é desperdiçar tempo."' },
  { id:'e9',  emoji:'🏅', title:'Relembrar uma conquista',    emotion:'Orgulho',     time:'10 min',
    desc:'Escreva sobre uma conquista sua — o obstáculo, o que VOCÊ fez, como conseguiu. Termine com: "isso fui eu que fiz".',
    belief:'"Sentir orgulho é se achar demais."' },
  { id:'e10', emoji:'📅', title:'Plantar uma antecipação',    emotion:'Esperança',   time:'10 min',
    desc:'Marque algo bom e concreto para os próximos 7 dias (com hora!). Nos dias antes, imagine 3 detalhes dele. Saboreie antes de viver.',
    belief:'"Melhor não criar expectativa para não me frustrar."' },
  { id:'e11', emoji:'🛋️', title:'Descanso declarado',         emotion:'Contentamento', time:'30 min',
    desc:'Agende 30 minutos de descanso DE PROPÓSITO (não "sobrou tempo"): série, banho longo, sofá. Antes, diga: "isto é descanso, e é legítimo".',
    belief:'"Descansar sem ter terminado tudo é preguiça."' },
  { id:'e12', emoji:'☕', title:'Micro-momento de conexão',   emotion:'Amor',        time:'5 min',
    desc:'Tenha hoje UMA conversa de verdade — olho no olho ou voz — com alguém: um colega, o porteiro, um familiar. Pergunte e ouça de verdade.',
    belief:'"Conversa pequena é vazia, ninguém liga de verdade."' },
];

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
function obNext(n){ document.getElementById('obs'+(n-1)).classList.remove('on'); document.getElementById('obs'+n).classList.add('on'); }
function obSelect(el,v){
  _obSel=v;
  document.querySelectorAll('.ob-opt').forEach(o=>o.classList.remove('sel'));
  el.classList.add('sel');
  const btn=document.getElementById('ob-btn3');
  if(btn){ btn.disabled=false; btn.style.opacity='1'; }
  D.obLevel=v;
}
function obSkip(){ obDone(); }
function obConsentToggle(cb){
  const btn=document.getElementById('ob-btn5');
  if(!btn) return;
  btn.disabled = !cb.checked;
  btn.style.opacity = cb.checked ? '1' : '';
  D.consentGiven = cb.checked;
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
  obDone();
  syncToResearch({ silent: true, requirePretest: false });
}
function obDone(){
  D.obDone=true;
  D.consentGiven=true;
  if(!D.consentDate) D.consentDate = new Date().toISOString();
  save();
  trackAppEvent('onboarding_complete');
  document.getElementById('onboard').classList.add('hide');
  if(!D.pretest){ goTo('pretest'); } else { goTo('home'); }
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
   ESCALAS — SPANE (Diener et al., 2009) + Crenças
   ══════════════════════════════════ */
const SPANE_ITEMS = [
  { t:'Positivo/a',    k:'p' },
  { t:'Negativo/a',    k:'n' },
  { t:'Bem',           k:'p' },
  { t:'Mal',           k:'n' },
  { t:'Agradável — em estados agradáveis', k:'p' },
  { t:'Desagradável — em estados desagradáveis', k:'n' },
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
   Fears of Positive Emotions, Gilbert et al. — adaptação livre, não validada) */
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
  flor:   { icon:'🌸', title:'Florescendo',          msg:'As emoções positivas têm presença forte na sua vida. O cultivo aqui vai torná-las ainda mais conscientes e resilientes.' },
  verde:  { icon:'🌿', title:'Equilíbrio positivo',  msg:'O saldo emocional está a favor do positivo, com espaço claro para crescer — especialmente em frequência e intensidade.' },
  fragil: { icon:'🌱', title:'Equilíbrio frágil',    msg:'Positivas e difíceis estão praticamente empatadas. É exatamente o cenário em que este treino costuma fazer mais diferença.' },
  seco:   { icon:'🍂', title:'Terreno seco',         msg:'As emoções difíceis têm dominado ultimamente. O cultivo pode ajudar — e, se o peso for grande, um/a profissional pode ajudar muito mais.' },
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

function renderPretest(){
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
  toast('Sem problema — a pré-avaliação fica à sua espera. 🌱');
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
      ${q===0 ? `<h2>${isPost?'📊 Reavaliação':'🧭 Pré-avaliação'}</h2>
      <p>${isPost
        ? 'Vamos verificar como você está agora para comparar com quando começou.'
        : 'Antes de plantar, queremos conhecer o terreno. Leva cerca de 3 minutos.'}</p>` : ''}
    </div>
    <div class="pretest-prog-bar">
      <div class="pretest-prog-fill" style="width:${pct}%"></div>
    </div>
    <div class="pt-section">
      <div class="pt-section-lbl">SPANE — Experiências emocionais <span>Pergunta ${q+1}/${SPANE_ITEMS.length}</span></div>
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
    <p style="font-size:12px;color:var(--light);text-align:center;margin-top:4px">Não há respostas certas ou erradas — responda com sinceridade.</p>
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
      <div style="font-size:56px;margin-bottom:20px">🌱</div>
      <h2 style="font-size:22px;font-weight:800;margin-bottom:10px">A semente foi plantada!</h2>
      <p style="font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:24px">
        Avaliação registrada. Ao longo do cultivo voltaremos a medir<br>para ver o quanto o seu jardim cresceu.
      </p>
      ${needSupport ? supportCardHTML() : ''}
      <button class="btn" style="max-width:320px;margin:16px auto 0" onclick="goTo('home')">Começar o cultivo 🌿</button>
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
  document.getElementById('modal-title').textContent='📊 Como você está agora?';
  document.getElementById('modal-body').textContent='Você já cultivou um bom trecho! Que tal uma reavaliação rápida (≈3 min) para ver o quanto cresceu?';
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
      <div style="font-size:52px;margin-bottom:14px">${bImproved?'🌸':'💚'}</div>
      <h2>O crescimento do jardim</h2>
      <p>Comparando o terreno de quando você chegou com agora.</p>
    </div>
    <div class="delta-card">
      <div class="card-lbl" style="margin-bottom:8px">Pré vs. Pós</div>
      ${rowsHTML}
      ${bImproved && post.spane.b>pre.spane.b ? '<div style="font-size:13px;color:var(--mint-d);margin-top:8px">Saldo emocional '+(post.spane.b-pre.spane.b)+' pontos acima — o cultivo está funcionando! 🎉</div>':''}
    </div>
    <button class="btn mint" onclick="goTo('home')" style="margin-top:8px">Ver meu progresso completo</button>
    <button class="btn ghost" onclick="goTo('progress')" style="margin-top:0">Ver conquistas</button>
  </div>`;
}

/* ══════════════════════════════════
   HOME
   ══════════════════════════════════ */
const SUBS = [
  'O que você nota, cresce.',
  'Pequenos momentos, regados todos os dias.',
  'O positivo sussurra — você está aprendendo a escutar.',
  'Saborear é multiplicar.',
  'A constância rega mais que a intensidade.',
  'Seu jardim, suas regras, seu ritmo.',
];
function renderHome(){
  const now=new Date(), h=now.getHours();
  const gr = h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
  document.getElementById('h-date').textContent = DIAS[now.getDay()]+', '+now.getDate()+' de '+MESES[now.getMonth()];
  document.getElementById('h-hi').textContent   = D.nickname ? gr+', '+D.nickname+' 👋' : gr+' 👋';
  document.getElementById('h-sub').textContent  = SUBS[now.getDate()%SUBS.length];
  renderNudge();

  const lv = getLevel(D.xp), pct = getLevelPct(D.xp), nextLv = LEVELS[lv.n] || lv;
  document.getElementById('h-xp').innerHTML =
    `<div class="xp-wrap">
      <div class="xp-head">
        <span class="xp-level">${lv.emoji} Nível ${lv.n} — ${lv.name}</span>
        <span class="xp-val">${D.xp} XP</span>
      </div>
      <div class="xp-bar-bg"><div class="xp-bar" style="width:${pct}%"></div></div>
      <div class="xp-label" style="margin-top:5px">${lv.n<5?'Para o próximo nível: '+(nextLv.min-D.xp)+' XP restantes':'🌳 Nível máximo atingido!'}</div>
    </div>`;

  const done = MODULES.filter(m=>D.moduleProgress[m.id]?.done).length;
  const streak = calcStreak();
  document.getElementById('hs-mod').textContent = done+'/'+MODULES.length;
  document.getElementById('hs-str').textContent = streak;
  document.getElementById('hs-xp').textContent  = D.xp;
  document.getElementById('h-assess-sub').textContent = D.assessment?'Refazer avaliação':'SPANE · Como você se sente';

  const next = MODULES.find(m=>!D.moduleProgress[m.id]?.done && isUnlocked(m));
  document.getElementById('h-mod-sub').textContent = next ? '▶ '+next.title : done===MODULES.length ? '✅ Todos concluídos!' : 'Continue cultivando';

  const expDone = D.experiments.filter(e=>e.status==='done').length;
  const expActive = D.experiments.find(e=>e.status==='active');
  document.getElementById('h-lab-sub').textContent = expActive ? '⏳ 1 em andamento' : expDone ? expDone+' concluído'+(expDone>1?'s':'') : 'Experimentos para sentir';

  renderMiniChart('h-chart','h-chart-empty');

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
  const vals=days.map(d=>{ const de=D.entries.filter(e=>e.date===d); return de.length?de.reduce((a,e)=>a+e.intensity,0)/de.length:null; });
  if(!vals.some(v=>v!==null)){ svg.style.display='none'; if(em)em.style.display='block'; return; }
  svg.style.display='block'; if(em)em.style.display='none';
  const W=320,H=72,px=14,py=10,step=(W-2*px)/6;
  const pts=vals.map((v,i)=>({x:px+i*step,y:v===null?null:H-py-((v-1)/4)*(H-2*py),v}));
  const valid=pts.filter(p=>p.y!==null);
  // subindo = florescendo (dourado) · estável/descendo = verde calmo
  const col=valid.length>=2&&valid[valid.length-1].v>valid[0].v+.4?'#C4922A':'#5E7D73';
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
  const emos=(e.emotions||[]).map(id=>{
    const em=EMOTIONS.find(x=>x.id===id);
    return em?'<span class="badge-tag bl">'+em.emoji+' '+em.name+'</span>':'';
  }).join('');
  const sav=(e.savoring||[]).filter(s=>s!=='Ainda não saboreei').map(s=>'<span class="badge-tag bg">'+esc(s)+'</span>').join('');
  const stars='<span class="badge-tag bt">'+'★'.repeat(e.intensity||3)+'</span>';
  return '<div class="entry"><div class="entry-dt">'+dt+'</div><div class="entry-w">'+esc(e.moment||'(sem texto)')+'</div><div class="entry-meta">'+stars+emos+sav+'</div></div>';
}

/* ══════════════════════════════════
   MODULE LIST
   ══════════════════════════════════ */
function isUnlocked(mod){
  if(!mod.unlockAfter) return true;
  return D.moduleProgress[mod.unlockAfter]?.done === true;
}
function modProgress(mod){
  const mp = D.moduleProgress[mod.id];
  if(!mp) return 0;
  const done = (mp.steps||[]).filter(Boolean).length;
  return Math.round(done/mod.steps.length*100);
}

function renderModuleList(){
  const levels = ['Nível 1 — Preparar o Solo','Nível 2 — Notar e Saborear','Nível 3 — Aprofundar','Nível 4 — Florescer'];
  let html = '';
  levels.forEach(lv=>{
    const mods = MODULES.filter(m=>m.levelTag===lv);
    if(!mods.length) return;
    html += `<div class="level-header"><div class="level-pip"></div><span class="level-title">${lv}</span></div>`;
    mods.forEach(m=>{
      const unlocked = isUnlocked(m);
      const done = D.moduleProgress[m.id]?.done;
      const pct  = modProgress(m);
      const statusIcon = done ? '✅' : unlocked ? '▶' : '🔒';
      html += `<div class="mod-card ${unlocked?'':'locked'}" onclick="${unlocked?'openModule(\''+m.id+'\')':'void 0'}">
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
    });
  });
  document.getElementById('modules-list').innerHTML = html;
}

/* ══════════════════════════════════
   MODULE VIEW — step system
   ══════════════════════════════════ */
let _curModId = null, _curStep = 0, _stepOk = false;
let _breathTimer = null, _breathPhase = 0, _breathCount = 0, _breathCycles = 0;

function openModule(id){
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
    mint:  'linear-gradient(135deg,#5E7D73,#3D5A52)',
    coral: 'linear-gradient(135deg,#D96C63,#B85550)',
    amber: 'linear-gradient(135deg,#C47D2A,#8A5520)',
    lav:   'linear-gradient(135deg,#8B7FB8,#5B4E8A)',
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
  const btnLabel = isLast ? 'Concluir módulo 🎉' : 'Continuar →';

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
  document.getElementById('cel-emoji').textContent  = mod.emoji;
  document.getElementById('cel-title').textContent  = mod.title+' concluído!';
  document.getElementById('cel-xp').textContent     = '+'+mod.xp+' XP conquistados';
  document.getElementById('cel-sub').textContent    = 'Seu progresso foi salvo. Continue para o próximo canteiro ou registre um momento bom!';
  document.getElementById('celebrate-card').classList.add('show');
}
function closeCelebrate(){
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
        <button class="cl-btn" onclick="classifyItem(${i},'u')">${step.btnA||'✅'}</button>
        <button class="cl-btn neg" onclick="classifyItem(${i},'n')">${step.btnB||'❌'}</button>
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
  el.innerHTML = `<span style="flex:1">${esc(it.text)}</span><span style="font-size:13px;font-weight:700">${correct?'✅':'💡'} ${it.label}</span>`;
  _classifyDone[idx]=true;
  if(_classifyDone.filter(Boolean).length >= step.items.length){
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
   REGISTRO DE MOMENTOS (diário)
   ══════════════════════════════════ */
function renderDiary(){ renderDiaryForm(); renderDiaryHist(); }

function renderDiaryForm(){
  document.getElementById('diary-form').innerHTML=
    `<div style="margin-bottom:20px">
      <label class="form-lbl" for="dw">O que aconteceu de bom?</label>
      <div class="form-hint">Pequeno também conta: um café, um raio de sol, uma mensagem.</div>
      <textarea id="dw" rows="3" maxlength="300" placeholder="Descreva o momento..." oninput="document.getElementById('dcc').textContent=this.value.length"></textarea>
      <div style="text-align:right;font-size:11px;color:var(--light);margin-top:3px"><span id="dcc">0</span>/300</div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">Que emoções você sentiu?</label>
      <div class="form-hint">Nomear com precisão amplia o sentir.</div>
      <div class="chips" id="d-emo">${EMOTIONS.map(e=>`<span class="chip" data-emo="${e.id}" onclick="toggleChip(this)">${e.emoji} ${e.name}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:20px">
      <label class="form-lbl">Como você saboreou</label>
      <div class="form-hint">Saborear amplifica — mas notar já é o primeiro passo.</div>
      <div class="chips" id="d-sav">${SAVORING_CHIPS.map(c=>`<span class="chip" onclick="toggleChip(this)">${c}</span>`).join('')}</div>
    </div>
    <div style="margin-bottom:24px">
      <label class="form-lbl">Intensidade do momento</label>
      <div class="form-hint">1 = leve e sutil · 5 = intenso</div>
      <div class="slider-row"><span style="font-size:20px">🙂</span><input type="range" id="da" min="1" max="5" value="3" step="1" oninput="document.getElementById('dav').textContent=this.value"><span style="font-size:20px">🤩</span><span class="slider-val" id="dav">3</span></div>
    </div>
    <button class="btn" onclick="saveDiary()" style="width:100%;margin:0 0 36px">Guardar momento 🌸</button>`;
}

function toggleChip(el){ el.classList.toggle('sel'); }

function saveDiary(){
  const w=document.getElementById('dw')?.value.trim();
  if(!w){ toast('Descreva o momento primeiro.'); return; }
  const emotions=[...document.querySelectorAll('#d-emo .chip.sel')].map(c=>c.dataset.emo);
  const savoring=[...document.querySelectorAll('#d-sav .chip.sel')].map(c=>c.textContent);
  const intensity=parseInt(document.getElementById('da')?.value||3);
  D.entries.unshift({id:Date.now().toString(),ts:Date.now(),date:today(),moment:w,emotions,savoring,intensity});
  save(); checkBadges(); trackDiaryEvent(); checkPosttestTrigger(); toast('Momento guardado! 🌸');
  renderDiaryForm(); renderDiaryHist();
  setTimeout(maybeShowIfThen, 900);
  scheduleLocalReminder();
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
  let html = `<div class="lab-intro">🧪 <strong>Como funciona:</strong> escolha um experimento, registre sua <strong>previsão</strong> (quanto prazer/emoção você acha que vai sentir), faça na vida real e depois volte para <strong>comparar</strong>. É assim que crenças são testadas — com dados, não com discussão.</div>`;

  if(active){
    const exp = EXPERIMENTS.find(x=>x.id===active.expId);
    html += `<div class="lab-card lab-active" id="lab-active-card">
      <div class="lab-active-tag">⏳ Experimento em andamento</div>
      <div class="lab-card-head">
        <div class="lab-emoji">${exp.emoji}</div>
        <div style="flex:1">
          <div class="lab-title">${exp.title}</div>
          <div class="lab-meta"><span class="exp-tag">${exp.emotion}</span> · ${exp.time} · iniciado ${new Date(active.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</div>
        </div>
      </div>
      <div class="lab-desc">${exp.desc}</div>
      <div class="lab-belief">🔬 Testa a crença: <strong>${exp.belief}</strong></div>
      <div class="predict-panel">
        <div class="predict-lbl">Sua previsão foi: ${active.predicted}/5 ${active.predictNote?'— "'+esc(active.predictNote)+'"':''}</div>
        <div class="predict-lbl" style="margin-top:12px">Já fez? Quanto você REALMENTE sentiu?</div>
        <div class="slider-row"><span style="font-size:18px">😐</span><input type="range" id="exp-actual" min="1" max="5" value="3" step="1" oninput="document.getElementById('exp-actual-v').textContent=this.value"><span style="font-size:18px">🤩</span><span class="slider-val" id="exp-actual-v">3</span></div>
        <div class="predict-lbl" style="margin-top:10px">O que você notou? (o que aconteceu de verdade)</div>
        <textarea id="exp-noticed" placeholder="O que aconteceu, o que sentiu, o que te surpreendeu..."></textarea>
        <div class="lab-actions">
          <button class="lab-btn" onclick="completeExperiment()">Concluir experimento ✓</button>
          <button class="lab-btn ghost" onclick="cancelExperiment()">Desistir desta vez</button>
        </div>
      </div>
    </div>`;
  }

  html += `<div class="sdiv">${active?'Outros experimentos':'Escolha um experimento'}</div>`;

  EXPERIMENTS.forEach(exp=>{
    if(active && exp.id===active.expId) return;
    const doneRuns = D.experiments.filter(e=>e.expId===exp.id && e.status==='done').length;
    html += `<div class="lab-card ${doneRuns?'done-before':''}" id="lab-${exp.id}">
      <div class="lab-card-head">
        <div class="lab-emoji">${exp.emoji}</div>
        <div style="flex:1">
          <div class="lab-title">${exp.title}</div>
          <div class="lab-meta"><span class="exp-tag">${exp.emotion}</span> · ${exp.time}</div>
        </div>
      </div>
      <div class="lab-desc">${exp.desc}</div>
      <div class="lab-belief">🔬 Testa a crença: <strong>${exp.belief}</strong></div>
      ${doneRuns?`<span class="lab-done-tag">✓ Feito ${doneRuns}×</span>`:''}
      <div id="lab-panel-${exp.id}"></div>
      <div class="lab-actions" id="lab-btnrow-${exp.id}">
        <button class="lab-btn" ${active?'disabled':''} onclick="openPredict('${exp.id}')">${active?'Conclua o experimento ativo':'Iniciar experimento'}</button>
      </div>
    </div>`;
  });

  el.innerHTML = html;
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
    <div class="predict-lbl">🔮 Antes de fazer: quanto prazer/emoção você PREVÊ sentir?</div>
    <div class="slider-row"><span style="font-size:18px">😐</span><input type="range" id="exp-pred-${expId}" min="1" max="5" value="2" step="1" oninput="document.getElementById('exp-pred-v-${expId}').textContent=this.value"><span style="font-size:18px">🤩</span><span class="slider-val" id="exp-pred-v-${expId}">2</span></div>
    <div class="predict-lbl" style="margin-top:10px">O que você acha que vai acontecer? (opcional)</div>
    <textarea id="exp-note-${expId}" placeholder="Ex.: vou me sentir boba, não vai dar em nada, a pessoa vai estranhar..."></textarea>
    <div class="lab-actions">
      <button class="lab-btn" onclick="startExperiment('${expId}')">Ativar experimento 🧪</button>
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
  toast('🧪 Experimento ativado! Agora é viver — depois volte para comparar.');
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
  if(delta > 0) insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. A mente subestimou o que faz bem — os estudos mostram que isso é a regra, não a exceção. O que mais ela pode estar subestimando?`;
  else if(delta === 0) insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. Previsão precisa! O valor está no dado: agora você sabe por experiência, não por suposição.`;
  else insight = `Você previu <strong>${run.predicted}/5</strong> e sentiu <strong>${actual}/5</strong>. Nem todo experimento floresce — e isso também é dado. Contexto, dia e cansaço contam. Vale repetir em outro momento antes de concluir.`;

  document.getElementById('modal-title').textContent = '🔬 Revisão do experimento';
  document.getElementById('modal-body').innerHTML =
    `<div class="predict-vs" style="margin:0 0 10px">
      <div style="text-align:center"><div style="font-size:11px;color:var(--muted)">Previsto</div><div class="pv-num" style="color:var(--muted)">${run.predicted}</div></div>
      <div style="font-size:20px">→</div>
      <div style="text-align:center"><div style="font-size:11px;color:var(--muted)">Sentido</div><div class="pv-num" style="color:${delta>=0?'var(--mint-d)':'var(--coral-d)'}">${actual}</div></div>
    </div>
    ${insight}<br><br><span style="font-size:12px;color:var(--light)">${exp?('Crença testada: '+exp.belief):''}</span>`;
  document.getElementById('modal-actions').innerHTML =
    '<button class="btn mint" onclick="closeModal();renderLab()">Continuar 🌱</button>';
  document.getElementById('modal-ov').classList.add('on');
  renderLab();
}

function cancelExperiment(){
  const idx = D.experiments.findIndex(e=>e.status==='active');
  if(idx<0) return;
  D.experiments.splice(idx,1);
  save();
  toast('Sem problema — o experimento fica para outro momento. 🌿');
  renderLab();
}

/* ══════════════════════════════════
   PROGRESS
   ══════════════════════════════════ */
function renderProgress(){
  const el=document.getElementById('progress-content');
  const lv=getLevel(D.xp), pct=getLevelPct(D.xp);
  const doneMods=MODULES.filter(m=>D.moduleProgress[m.id]?.done);
  const totalXP=MODULES.reduce((a,m)=>a+m.xp,0);

  const badgesHTML=ALL_BADGES.map(b=>{
    const earned=D.badges.includes(b.id);
    return `<div class="badge-item"><div class="badge-icon ${earned?'earned':'locked'}">${b.emoji}</div><div class="badge-name">${b.name}</div></div>`;
  }).join('');

  // Repertório de emoções já sentidas/registradas
  const felt = new Set(D.entries.flatMap(e=>e.emotions||[]));
  const repHTML = `<div class="repertoire">${EMOTIONS.map(e=>
    `<span class="rep-item ${felt.has(e.id)?'felt':''}">${e.emoji} ${e.name}</span>`).join('')}</div>`;

  // Insights
  const insights=[];
  if(D.entries.length){
    // emoção-assinatura
    const emoC={};
    D.entries.flatMap(e=>e.emotions||[]).forEach(id=>{emoC[id]=(emoC[id]||0)+1;});
    const top=Object.entries(emoC).sort((a,b)=>b[1]-a[1])[0];
    if(top){
      const em=EMOTIONS.find(x=>x.id===top[0]);
      if(em) insights.push({c:'',t:em.emoji+' Sua emoção-assinatura',b:`<strong>${em.name}</strong> é a emoção que você mais registra (${top[1]}×). ${felt.size<10?'E ainda há '+(10-felt.size)+' emoções para descobrir no repertório.':'Repertório completo — as 10 já apareceram!'}`});
    }
    // taxa de saboreio
    const savored=D.entries.filter(e=>(e.savoring||[]).some(s=>s!=='Ainda não saboreei')).length;
    const pctS=Math.round(savored/D.entries.length*100);
    insights.push({c:'l',t:'🍯 Taxa de saboreio',b:`Em <strong>${pctS}% dos momentos</strong> você fez algo para amplificar a experiência. Saborear é o multiplicador do notar.`});
    const streak=calcStreak();
    if(streak>0) insights.push({c:'',t:'🔥 Sequência atual',b:`<strong>${streak} dia${streak!==1?'s':''}</strong> de registro consecutivo. A constância rega mais que a intensidade.`});
  }
  // experimentos
  const expDone = D.experiments.filter(e=>e.status==='done');
  if(expDone.length){
    const avgPred=(expDone.reduce((a,e)=>a+e.predicted,0)/expDone.length).toFixed(1);
    const avgAct =(expDone.reduce((a,e)=>a+e.actual,0)/expDone.length).toFixed(1);
    const under = parseFloat(avgAct) > parseFloat(avgPred);
    insights.push({c:'s',t:'🧪 Laboratório',b:`<strong>${expDone.length} experimento${expDone.length>1?'s':''}</strong> concluído${expDone.length>1?'s':''}. Média prevista: <strong>${avgPred}/5</strong> · média sentida: <strong>${avgAct}/5</strong>.${under?' Sua mente vem <strong>subestimando</strong> o que faz bem — bom argumento contra as crenças bloqueadoras.':''}`});
  }
  insights.push({c:'s',t:'📚 Canteiros cultivados',b:`<strong>${doneMods.length} de ${MODULES.length}</strong> módulos concluídos · <strong>${D.xp} de ${totalXP} XP</strong> totais conquistados.`});

  el.innerHTML=
    `<div class="xp-wrap" style="margin:0 16px 12px">
      <div class="xp-head">
        <span class="xp-level">${lv.emoji} Nível ${lv.n} — ${lv.name}</span>
        <span class="xp-val">${D.xp} XP</span>
      </div>
      <div class="xp-bar-bg"><div class="xp-bar" style="width:${pct}%"></div></div>
      <div class="xp-label" style="margin-top:5px">${lv.n<5?'Para o próximo nível: '+(LEVELS[lv.n].min-D.xp)+' XP restantes':'🌳 Nível máximo!'}</div>
    </div>
    <div class="card">
      <div class="card-lbl">Momentos positivos — 7 dias</div>
      <svg class="chart-svg" id="p-chart" viewBox="0 0 320 72"></svg>
      <div id="p-chart-e" style="display:none;font-size:13px;color:var(--muted);text-align:center;padding:10px 0">Sem dados suficientes.</div>
    </div>
    <div class="card">
      <div class="card-lbl">Repertório de emoções (${felt.size}/10)</div>
      ${repHTML}
    </div>
    ${insights.map(i=>`<div class="insight-c ${i.c}"><div class="insight-t">${i.t}</div><div class="insight-b">${i.b}</div></div>`).join('')}
    <div class="sdiv">Conquistas</div>
    <div class="card"><div class="badge-shelf">${badgesHTML}</div></div>
    <div class="sdiv">Exportar</div>
    <button class="btn ghost-mint" onclick="exportHTML()">Baixar relatório (HTML)</button>
    <button class="btn ghost" onclick="exportJSON()" style="margin-top:0">Exportar dados (JSON)</button>
    ${BRAND_FOOTER_HTML}`;

  renderMiniChart('p-chart','p-chart-e');
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
      <div class="result-hero ${lvl==='seco'?'hi':lvl==='fragil'?'mid':'low'}"><h2>${info.icon} ${info.title}</h2><p>${info.msg}</p></div>
      ${needSupport ? supportCardHTML() : ''}
      <div class="card">
        <div class="card-lbl">Suas pontuações (SPANE)</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:2px">Emoções positivas: <strong style="color:var(--mint-d)">${a.p}</strong> / 30</div>
        ${bar(a.p,6,30,'var(--mint)')}
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:2px">Emoções negativas: <strong style="color:var(--coral-d)">${a.n}</strong> / 30</div>
        ${bar(a.n,6,30,'var(--coral)')}
        <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-top:8px">Saldo emocional (P − N): <strong>${a.b>0?'+':''}${a.b}</strong> (varia de −24 a +24)</div>
      </div>
      <div style="font-size:11px;color:var(--light);text-align:center;margin-bottom:16px">Avaliado em ${d} · SPANE (Diener et al., 2009) · Não é um diagnóstico clínico</div>
      <button class="btn ghost" onclick="D.assessment=null;save();renderAssess()">Refazer avaliação</button>
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
    app:'Floresça — Cultivando Emoções Positivas',
    xp:D.xp,badges:D.badges,
    modulesCompleted:MODULES.filter(m=>D.moduleProgress[m.id]?.done).map(m=>m.title),
    assessment:D.assessment,pretest:D.pretest,posttest:D.posttest,
    entries:D.entries,experiments:D.experiments,
  },null,2),'application/json');
  toast('Dados exportados!');
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
  const emoName=id=>{const em=EMOTIONS.find(x=>x.id===id);return em?em.emoji+' '+em.name:id;};
  const rows=[...D.entries].sort((a,b)=>b.ts-a.ts).map(e=>{
    const dt=new Date(e.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
    return `<tr><td>${dt}</td><td>${esc(e.moment||'?')}</td><td>${(e.emotions||[]).map(emoName).join(', ')||'—'}</td><td>${(e.savoring||[]).join(', ')||'—'}</td><td>${'★'.repeat(e.intensity||3)}</td></tr>`;
  }).join('');
  const expRows=expDone.sort((a,b)=>b.tsDone-a.tsDone).map(r=>{
    const exp=EXPERIMENTS.find(x=>x.id===r.expId)||{};
    return `<tr><td>${new Date(r.tsDone).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'})}</td><td>${exp.emoji||''} ${exp.title||r.expId}</td><td>${r.predicted}/5</td><td>${r.actual}/5</td><td>${esc(r.noticed||'—')}</td></tr>`;
  }).join('');
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório — Floresça</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Nunito Sans',sans-serif;background:#F7F3EF;color:#3F434B}
.hero{background:linear-gradient(140deg,#5E7D73,#2B4A42);padding:40px 32px 32px;color:white}.hero h1{font-size:26px;font-weight:800;margin-bottom:6px}.hero p{font-size:13px;opacity:.82}
.body{max-width:760px;margin:0 auto;padding:28px 24px 48px}h2{font-size:17px;font-weight:800;margin:24px 0 12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:4px}
.stat{background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.05)}.stat-n{font-size:28px;font-weight:800;color:#5E7D73;line-height:1}.stat-l{font-size:12px;color:#6B7280;margin-top:5px}
.ins{background:white;border-left:4px solid #5E7D73;border-radius:10px;padding:14px 16px;margin-bottom:10px}.ins-b{font-size:14px;line-height:1.65;color:#6B7280}.ins-b strong{color:#3D5A52}
.pill{display:inline-block;background:#F0F6F3;color:#3D5A52;font-size:12px;padding:4px 10px;border-radius:20px;margin:3px;font-weight:700}
table{width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05);font-size:13px}th{background:#5E7D73;color:white;padding:10px 12px;text-align:left;font-weight:700;font-size:12px}td{padding:10px 12px;border-bottom:1px solid #F0EDE5;vertical-align:top;line-height:1.4}tr:last-child td{border-bottom:none}tr:nth-child(even)td{background:#FAFAF7}
.ft{margin-top:32px;padding-top:20px;border-top:1px solid #E0DDD5;font-size:12px;color:#A0ADB8;text-align:center;line-height:1.7}
@media print{body{background:white}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>
<div class="hero">
  <div style="font-size:12px;opacity:.75;font-weight:600;margin-bottom:2px">Psicoterapia e Afins · psicoterapiaeafins.com.br</div>
  <h1>🌸 Floresça — Cultivando Emoções Positivas</h1>
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
  <div class="stat"><div class="stat-n">${D.xp}</div><div class="stat-l">XP · Nível ${lv.n} ${lv.name}</div></div>
  <div class="stat"><div class="stat-n">${doneMods.length}/${MODULES.length}</div><div class="stat-l">módulos concluídos</div></div>
</div>
${doneMods.length?`<h2>Módulos concluídos</h2><div class="ins"><div class="ins-b">${doneMods.map(m=>`<span class="pill">${m}</span>`).join('')}</div></div>`:''}
${D.assessment?`<h2>Autoavaliação SPANE</h2><div class="ins"><div class="ins-b">Positivas: <strong>${D.assessment.p}/30</strong> · Negativas: <strong>${D.assessment.n}/30</strong> · Saldo: <strong>${D.assessment.b>0?'+':''}${D.assessment.b}</strong> (${new Date(D.assessment.date+'T12:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})})</div></div>`:''}
${expDone.length?`<h2>Experimentos (previsto vs. sentido)</h2><table><thead><tr><th>Data</th><th>Experimento</th><th>Previsto</th><th>Sentido</th><th>O que notou</th></tr></thead><tbody>${expRows}</tbody></table>`:''}
<h2>Todos os momentos</h2>
<table><thead><tr><th>Data</th><th>Momento</th><th>Emoções</th><th>Saboreio</th><th>Intensidade</th></tr></thead><tbody>${rows}</tbody></table>
<div class="ft">
  <strong>© 2026 Psicoterapia e Afins · Todos os direitos reservados</strong><br>
  Este relatório contém dados pessoais. Compartilhe somente com seu profissional de saúde mental de confiança.<br>
  <strong>Recurso psicoeducativo baseado em evidências — não substitui psicoterapia profissional.</strong><br>
  🌐 <a href="https://www.psicoterapiaeafins.com.br" style="color:#5E7D73">psicoterapiaeafins.com.br</a>
  &nbsp;·&nbsp;
  📷 <a href="https://www.instagram.com/psicoterapiaeafins" style="color:#D96C63">@psicoterapiaeafins</a><br>
  Proibida a reprodução total ou parcial sem autorização prévia e por escrito.
</div>
</div></body></html>`;
  dl('floresca-relatorio-'+today()+'.html',html,'text/html;charset=utf-8');
  toast('Relatório exportado!');
}

function exportCSV(){
  const csvEsc = s => '"'+String(s||'').replace(/"/g,'""')+'"';
  const pre = D.pretest, post = D.posttest;
  const preCols  = pre  ? [pre.spane.p,pre.spane.n,pre.spane.b,pre.beliefs.score].join(',')   : ',,,';
  const postCols = post ? [post.spane.p,post.spane.n,post.spane.b,post.beliefs.score].join(',') : ',,,';
  const rows = [
    ['record_type','timestamp','date','text','emotions','savoring_or_predicted','intensity_or_actual',
     'pre_spane_p','pre_spane_n','pre_spane_b','pre_beliefs',
     'post_spane_p','post_spane_n','post_spane_b','post_beliefs'].join(','),
  ];
  D.entries.forEach(e=>{
    rows.push(['moment',e.ts,e.date,csvEsc(e.moment),csvEsc((e.emotions||[]).join('|')),csvEsc((e.savoring||[]).join('|')),e.intensity,preCols,postCols].join(','));
  });
  D.experiments.filter(e=>e.status==='done').forEach(r=>{
    const exp=EXPERIMENTS.find(x=>x.id===r.expId)||{};
    rows.push(['experiment',r.tsDone,r.date,csvEsc(exp.title||r.expId),csvEsc(exp.emotion||''),r.predicted,r.actual,preCols,postCols].join(','));
  });
  if(rows.length<=1){ toast('Sem dados para exportar.'); return; }
  dl('floresca-pesquisa-'+today()+'.csv', '﻿'+rows.join('\n'), 'text/csv;charset=utf-8');
  toast('CSV exportado! 📊');
}

function dl(name,content,type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }

/* ══════════════════════════════════
   SINCRONIZAÇÃO COM GOOGLE SHEETS
   ══════════════════════════════════ */
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
      experiments:   D.experiments,
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
      console.warn('[Floresça] sync error:', result.error);
    }
  }catch(err){
    if(!silent) toast('⚠️ Falha na ligação. Verifique a rede e tente novamente.');
    console.warn('[Floresça] syncToResearch:', err.message);
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
  const pid=D.participantId, cd=D.consentDate, ls=D.lastSync;
  D={
    xp:0, badges:[], obDone:true, obLevel:D.obLevel,
    moduleProgress:{}, entries:[], experiments:[], assessment:null,
    nickname:D.nickname, demographics:D.demographics,
    reminders:D.reminders||{enabled:false,hour:20},
    consentGiven:true, consentDate:cd,
    participantId:pid, lastSync:ls,
    pretest:null, posttest:null, posttestRemindAfter:null,
    analytics:{sessions:[],moduleEvents:[],diaryEvents:[],labEvents:[]},
  };
  save();
  document.getElementById('modal-ov').classList.remove('on');
  toast('Dados apagados.');
  goTo('home');
}

function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('on'),2800); }

/* ══════════════════════════════════
   NUDGES COMPORTAMENTAIS (home)
   Prioridade: pré-teste pendente > experimento ativo >
   retorno após pausa (autocompaixão) > módulo a meio (Zeigarnik) > streak
   ══════════════════════════════════ */
function renderNudge(){
  const el = document.getElementById('h-nudge');
  if(!el) return;
  const streak = calcStreak();
  const lastEntry = D.entries.length ? [...D.entries].sort((a,b)=>b.ts-a.ts)[0] : null;
  const daysSince = lastEntry ? Math.floor((Date.now()-lastEntry.ts)/864e5) : null;
  const halfMod = MODULES.find(m=>{ const mp=D.moduleProgress[m.id]; return mp && !mp.done && mp.steps?.some(Boolean); });
  const activeExp = D.experiments.find(e=>e.status==='active');

  let html = '';

  // 0. Pré-avaliação pendente
  if(!D.pretest && D.obDone){
    html = `<div class="nudge mint">
      <div class="nudge-icon">🧭</div>
      <div class="nudge-body"><strong>Pré-avaliação pendente.</strong>
      São ~3 minutos e é o ponto de partida para medir o crescimento do seu jardim.</div>
      <button class="nudge-btn" onclick="goTo('pretest')">Responder agora</button>
    </div>`;
  }
  // 1. Instalar na tela de início (uma vez, se ainda não instalou)
  else if(!isInstalled() && !D.installSeen){
    html = `<div class="nudge lav">
      <div class="nudge-icon">📲</div>
      <div class="nudge-body"><strong>Leve o Floresça com você.</strong>
      Adicione à tela de início para abrir como um app — com o ícone da flor e funcionando offline.</div>
      <button class="nudge-btn" onclick="showInstallModal()">Ver como</button>
    </div>`;
  }
  // 2. Experimento ativo aguardando conclusão
  else if(activeExp){
    const exp = EXPERIMENTS.find(x=>x.id===activeExp.expId);
    html = `<div class="nudge amber">
      <div class="nudge-icon">🧪</div>
      <div class="nudge-body"><strong>Experimento em andamento:</strong> ${exp?exp.title:''}.
      Já fez? Volte ao laboratório para comparar previsão e realidade.</div>
      <button class="nudge-btn" onclick="goTo('lab')">Ir ao laboratório</button>
    </div>`;
  }
  // 2. Retorno após pausa — acolher sem culpa
  else if(daysSince !== null && daysSince >= 3){
    html = `<div class="nudge lav">
      <div class="nudge-icon">🤗</div>
      <div class="nudge-body"><strong>Que bom ter você de volta.</strong>
      Jardins sobrevivem a dias sem rega — o que importa é regar hoje. Um momento pequeno já recomeça o cultivo.</div>
      <button class="nudge-btn" onclick="goTo('diary')">Registrar agora</button>
    </div>`;
  }
  // 3. Módulo a meio (Zeigarnik)
  else if(halfMod){
    const pct = modProgress(halfMod);
    html = `<div class="nudge mint">
      <div class="nudge-icon">📖</div>
      <div class="nudge-body"><strong>${halfMod.title}</strong> está ${pct}% completo.
      Faltam só alguns passos para fechar este canteiro.</div>
      <button class="nudge-btn" onclick="openModule('${halfMod.id}')">Continuar</button>
    </div>`;
  }
  // 4. Streak ativo — reforço sem pressão
  else if(streak >= 2){
    html = `<div class="nudge amber">
      <div class="nudge-icon">🔥</div>
      <div class="nudge-body"><strong>${streak} dias seguidos de cultivo.</strong>
      A constância — não a perfeição — é o que treina o radar.</div>
    </div>`;
  }
  el.innerHTML = html;
}

/* Intenção de implementação (Gollwitzer, 1999) */
const IFTHEN_PLANS = [
  'Quando algo bom acontecer amanhã, vou <strong>parar 10 segundos para saborear</strong> antes de seguir.',
  'Quando eu notar um momento agradável, vou <strong>nomear a emoção</strong> que ele desperta.',
  'Quando receber um elogio, vou <strong>respirar e só agradecer</strong> — sem devolver nem minimizar.',
  'Quando terminar algo difícil, vou <strong>reconhecer meu esforço</strong> em uma frase.',
  'Quando alguém me contar uma boa notícia, vou <strong>perguntar mais e comemorar junto</strong>.',
];
function maybeShowIfThen(){
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
  toast('🌼 Floresça instalado! Procure a flor na tela de início.');
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
    + step(1,'Abra o Floresça no <strong>Safari</strong> (outros navegadores não têm essa opção no iOS)')
    + step(2,'Toque no botão <strong>Compartilhar</strong> — o quadrado com a seta para cima (⬆️), na barra inferior')
    + step(3,'Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>')
    + step(4,'Toque em <strong>Adicionar</strong> — a flor 🌼 aparece junto aos seus apps');
  if(isAndroid) return `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No Android (Chrome)</div>`
    + step(1,'Abra o Floresça no <strong>Chrome</strong>')
    + step(2,'Toque no menu <strong>⋮</strong> (três pontinhos, no canto superior direito)')
    + step(3,'Toque em <strong>"Adicionar à tela inicial"</strong> (ou <strong>"Instalar app"</strong>)')
    + step(4,'Confirme — a flor 🌼 aparece junto aos seus apps');
  return `<div style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:8px 0 10px">No computador (Chrome/Edge)</div>`
    + step(1,'Procure o <strong>ícone de instalação</strong> no fim da barra de endereço (um monitor com uma seta para baixo)')
    + step(2,'Clique nele e depois em <strong>Instalar</strong>')
    + step(3,'Se não vir o ícone: menu <strong>⋮</strong> → "Salvar e compartilhar" → <strong>"Instalar Floresça"</strong>')
    + step(4,'O app abre em janela própria, com a flor 🌼 na barra de tarefas');
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
    document.getElementById('modal-title').textContent = '🌼 Já está instalado!';
    document.getElementById('modal-body').innerHTML = 'Você já está usando o Floresça como app. É só procurar a flor na tela de início sempre que quiser voltar.';
    document.getElementById('modal-actions').innerHTML = '<button class="btn mint" onclick="closeModal()">Ótimo!</button>';
    document.getElementById('modal-ov').classList.add('on');
    return;
  }
  document.getElementById('modal-title').textContent = '📲 Floresça na tela de início';
  document.getElementById('modal-body').innerHTML =
    `<p style="margin-bottom:12px;text-align:left">Com o atalho, o Floresça vira um app de verdade: abre em tela cheia, com o ícone da flor 🌼, e funciona até sem internet.</p>`
    + (_installPrompt
        ? `<p style="font-size:13px;color:var(--muted);text-align:left">Boa notícia: seu navegador instala com um toque. 👇</p>`
        : installInstructionsHTML());
  document.getElementById('modal-actions').innerHTML =
    (_installPrompt ? `<button class="btn mint" onclick="installApp()">Instalar agora 🌼</button>` : '')
    + `<button class="btn ${_installPrompt?'ghost':'mint'}" onclick="closeModal();if(typeof renderNudge==='function')renderNudge()">Entendi</button>`;
  document.getElementById('modal-ov').classList.add('on');
}

/* ══════════════════════════════════
   LEMBRETES (Notification API + Service Worker)
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

const REMINDER_MSGS = [
  '🌱 Hora de regar: o que foi bom hoje? 1 minuto de registro já conta.',
  '🌸 Que momento de hoje merece ser guardado? Seu jardim espera.',
  '🍯 Pequena pausa para saborear: registre uma coisa boa de hoje.',
];
async function fireReminder(){
  if(!D.reminders.enabled) return;
  const msg = REMINDER_MSGS[Math.floor(Math.random()*REMINDER_MSGS.length)];
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
  if(!D.pretest){
    goTo('pretest');
  } else {
    goTo('home');
    checkPosttestTrigger();
  }
}
