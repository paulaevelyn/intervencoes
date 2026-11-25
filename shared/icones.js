/* icones.js — ícones lineares no lugar dos emoji (compartilhado).
   Dois jeitos de usar:
   1) icone('leaf') ou icone('🌿') devolve um <svg class="ic"> que herda a cor e o tamanho do texto;
   2) iconizar() troca sozinho os emoji do HTML e dos textos que o app escreve depois (MutationObserver),
      sem precisar mexer em cada string. Emoji só de enfeite (👋 🎉 👇) são removidos.
   O CSS de .ic fica no revisao.css de cada app. */
(function(){
const IC_PATHS = {
activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  brush: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z',
  check: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  smile: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  waves: 'M2 8c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2M2 16c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
  wind: 'M9.59 4.59A2 2 0 1 1 11 8H2M12.59 19.41A2 2 0 1 0 14 16H2M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  lifebuoy: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
  briefcase: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  dot: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 12h.01',
  feather: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9',
  compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  clipboard: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9z',
  lock: 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  trash: 'M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  phone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16M21 21l-4.3-4.3',
  steps: 'M4 20h4v-4h4v-4h4V8h4',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  cloud: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z',
  ban: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M4.93 4.93l14.14 14.14',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  warn: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  hand: 'M11 14l3-3a2 2 0 0 0-3-3l-2 2M2 12l5-5M14 11l4 4a2 2 0 0 1-3 3l-4-4M7 17l2 2',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
  key: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  tool: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',
  map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4zM8 2v16M16 6v16',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  x: 'M18 6 6 18M6 6l12 12',
  arrowup: 'M12 19V5M5 12l7-7 7 7',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  flask: 'M9 3h6M10 3v6L4 20a1 1 0 0 0 .9 1.5h14.2A1 1 0 0 0 20 20l-6-11V3',
  door: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  call: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  face2: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M9 9.5h.01M15 9.5h.01M8.5 16.2s1.4-1.2 3.5-1.2 3.5 1.2 3.5 1.2',
  face3: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M9 9.5h.01M15 9.5h.01M8.5 15.5h7',
  face4: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M9 9.5h.01M15 9.5h.01M8.5 14.5s1.4 1.5 3.5 1.5 3.5-1.5 3.5-1.5'
};
const IC_EMOJI = {
  '🏃':'activity','👥':'users','🌿':'leaf','🌱':'leaf','🎨':'brush','✅':'check','😊':'smile','💛':'heart','💚':'heart','💙':'heart','💞':'heart','🤍':'heart',
  '🌸':'sun','🌻':'sun','🌅':'sun','✨':'sparkle','🌊':'waves','🌟':'star','⭐':'star','🏅':'star','🏆':'star','🌬':'wind','📷':'camera','🧠':'bulb','💡':'bulb','🏮':'bulb',
  '⚡':'zap','💬':'message','💭':'message','🆘':'lifebuoy','🏠':'home','💼':'briefcase','🎈':'dot','💪':'zap','🕊':'feather','🤝':'users','🤗':'heart','🤲':'heart',
  '🧭':'compass','⚓':'compass','⛵':'compass','📚':'book','📔':'book','📖':'book','🃏':'book','🗂':'book','📝':'brush','✍':'brush','📋':'clipboard',
  '🔒':'lock','🔔':'bell','🔕':'bell','⬇':'download','📥':'download','📄':'file','🗑':'trash','📲':'phone','📱':'phone','📞':'call','🌐':'globe',
  '🔄':'refresh','🌀':'refresh','🔎':'search','🔍':'search','🔬':'search','🪜':'steps','⚕':'shield','🏛':'shield','🏥':'shield','☁':'cloud','🚫':'ban','❌':'x',
  '🕒':'clock','🕐':'clock','⏰':'clock','🤫':'moon','⚠':'warn','🚨':'warn','📈':'activity','📊':'activity','👀':'eye','🎯':'target','🔑':'key',
  '🔧':'tool','🛠':'tool','🗺':'map','📍':'pin','⬆':'arrowup','⚙':'sliders','🧪':'flask','🚪':'door','😌':'face4','😐':'face3','😟':'face2','🧩':'dot'
};
const IC_DROP = /[\u{1F44B}\u{1F389}\u{1F447}]/u;
function norm(e){ return e.replace(/\uFE0F/g,''); }
function icone(chave){
  const nome = IC_PATHS[chave] ? chave : IC_EMOJI[norm(String(chave||''))];
  const d = IC_PATHS[nome] || IC_PATHS.dot;
  return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
}
const EMO = /(?:\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*) ?/gu;
const SKIP = {SCRIPT:1,STYLE:1,TEXTAREA:1,OPTION:1,INPUT:1,TITLE:1,SVG:1,svg:1};
function trocar(no){
  if(no.nodeType === 3){
    const t = no.nodeValue;
    if(!/\p{Extended_Pictographic}/u.test(t) || /^[\u2713\u2714]+$/.test(t.trim())) return;
    const pai = no.parentNode; if(!pai || SKIP[pai.nodeName]) return;
    const frag = document.createDocumentFragment(); let ult = 0, m, mudou = false;
    EMO.lastIndex = 0;
    while((m = EMO.exec(t))){
      const e = norm(m[0].trim());
      if(/^[\u2713\u2714\u2705]$/.test(e) && e !== '\u2705') continue;
      frag.appendChild(document.createTextNode(t.slice(ult, m.index)));
      if(!IC_DROP.test(e)){ const s = document.createElement('span'); s.innerHTML = icone(e); frag.appendChild(s.firstChild); if(/ $/.test(m[0])) frag.appendChild(document.createTextNode(' ')); }
      ult = m.index + m[0].length; mudou = true;
    }
    if(!mudou) return;
    frag.appendChild(document.createTextNode(t.slice(ult)));
    pai.replaceChild(frag, no);
  } else if(no.nodeType === 1 && !SKIP[no.nodeName]){
    Array.from(no.childNodes).forEach(trocar);
  }
}
function iconizar(raiz){ trocar(raiz || document.body); }
function iniciar(){
  iconizar(document.body);
  new MutationObserver(ms => ms.forEach(m => {
    if(m.type === 'characterData') trocar(m.target);
    else m.addedNodes.forEach(n => trocar(n));
  })).observe(document.body, {childList:true, subtree:true, characterData:true});
}
window.icone = icone; window.iconizar = iconizar;
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
