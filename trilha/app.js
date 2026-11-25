/* ═══════════════════════════════════════════════════════════════════════
   Trilha: app.js (núcleo)
   Mesma arquitetura dos outros apps: HTML/CSS/JS puros (sem build), dados no localStorage,
   SCREENS + goTo(), uma render*() por tela. As ferramentas ficam em ferramentas.js.
   Veja ARQUITETURA.md.

   Escolhas deliberadas (adolescentes, terapia online):
   • SEM pontos, níveis, medalhas ou "sequência". O progresso é descritivo.
   • Decisões mínimas, textos curtos, linguagem direta e sem tom infantil.
   • Apoio de crise sempre à mão (188, 192, 100) e o app NUNCA avisa ninguém sozinho.
   • Responsáveis não acessam o sistema. A profissional só vê o que o adolescente liberar.
   • O que a profissional escreve (módulo, sessões, tarefas) chega por trilha_orientacoes,
     somente leitura aqui, e é sempre inserido como texto (esc), links só https.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Ícones (traço fino, estilo Lucide), no lugar de emojis ───────────
   Mesmo mecanismo do Farol, do Floresça e da Aurora: ico(nome, tamanho) e [data-ico] no HTML. */
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

/* Ícones extras (mesmo traço fino, 24x24) */
Object.assign(ICONS, {
 "flag": "<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"/><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\"/>",
 "log-out": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><polyline points=\"16 17 21 12 16 7\"/><line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\"/>",
 "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>",
 "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"/>",
 "paw": "<circle cx=\"11\" cy=\"4\" r=\"2\"/><circle cx=\"18\" cy=\"8\" r=\"2\"/><circle cx=\"20\" cy=\"16\" r=\"2\"/><path d=\"M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z\"/>",
 "layers": "<path d=\"m12 2-10 5 10 5 10-5z\"/><path d=\"m2 12 10 5 10-5\"/><path d=\"m2 17 10 5 10-5\"/>",
 "scale": "<path d=\"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/><path d=\"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z\"/><path d=\"M7 21h10\"/><path d=\"M12 3v18\"/><path d=\"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2\"/>",
 "map-pin": "<path d=\"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>",
 "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>",
 "tag": "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>",
 "eye-off": "<path d=\"M9.88 9.88a3 3 0 1 0 4.24 4.24\"/><path d=\"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68\"/><path d=\"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61\"/><line x1=\"2\" x2=\"22\" y1=\"2\" y2=\"22\"/>",
 "trending-down": "<polyline points=\"22 17 13.5 8.5 8.5 13.5 2 7\"/><polyline points=\"16 17 22 17 22 11\"/>",
 "bar-chart": "<line x1=\"12\" x2=\"12\" y1=\"20\" y2=\"10\"/><line x1=\"18\" x2=\"18\" y1=\"20\" y2=\"4\"/><line x1=\"6\" x2=\"6\" y1=\"20\" y2=\"16\"/>",
 "map": "<polygon points=\"3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21\"/><line x1=\"9\" x2=\"9\" y1=\"3\" y2=\"18\"/><line x1=\"15\" x2=\"15\" y1=\"6\" y2=\"21\"/>",
 "x": "<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>",
 "dot-red": "<circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#C4534B\" stroke=\"none\"/>",
 "dot-yellow": "<circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#D9A21B\" stroke=\"none\"/>",
 "dot-green": "<circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#4B8F6E\" stroke=\"none\"/>",
 "dot-black": "<circle cx=\"12\" cy=\"12\" r=\"7\" fill=\"#3F434B\" stroke=\"none\"/>",
 "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>",
 "wind": "<path d=\"M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2\"/><path d=\"M9.6 4.6A2 2 0 1 1 11 8H2\"/><path d=\"M12.6 19.4A2 2 0 1 0 14 16H2\"/>",
 "waves": "<path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/><path d=\"M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/><path d=\"M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1\"/>",
 "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/><path d=\"M8 16h.01\"/>",
 "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"/><polyline points=\"16 7 22 7 22 13\"/>",
 "camera": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>",
 "refresh": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>",
 "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>",
 "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/>",
 "bell-off": "<path d=\"M8.7 3A6 6 0 0 1 18 8c0 2.7.5 4.5 1.2 5.8\"/><path d=\"M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/><path d=\"m2 2 20 20\"/>",
 "list-checks": "<path d=\"m3 17 2 2 4-4\"/><path d=\"m3 7 2 2 4-4\"/><path d=\"M13 6h8\"/><path d=\"M13 12h8\"/><path d=\"M13 18h8\"/>",
 "activity": "<path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/>",
 "home": "<path d=\"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>",
 "briefcase": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"7\" rx=\"2\" ry=\"2\"/><path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/>",
 "ban": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m4.9 4.9 14.2 14.2\"/>",
 "sparkles": "<path d=\"m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z\"/>",
 "face-1": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 18c1-3 7-3 8 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>",
 "face-2": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8.5 16.5c1-1.5 6-1.5 7 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>",
 "face-3": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8.5 15.5h7\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>",
 "face-4": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8.5 14.5c1 1.5 6 1.5 7 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>",
 "face-5": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 13c1 3 7 3 8 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>"
});

/* ── Emoji → ícone ──────────────────────────────────────────────────────
   O conteúdo da Trilha (módulos, missões, cenários, conquistas) traz emojis nos dados. Em vez de
   reescrever cada texto, qualquer emoji que tenha ícone correspondente é trocado pelo ícone de traço
   assim que aparece na tela (texto novo, toast ou modal). Os rostos de emoção ficam como emoji, porque
   a diferença entre eles é o conteúdo (ansiedade, medo, vergonha...). */
const EMOJI_ICONE = {
'🏠':'home',
'📄':'file-text',
'🏛':'building',
'⏱':'clock',
'♾':'refresh',
'⚕':'shield',
'⚖':'scale',
'⚠':'alert',
'⚡':'zap',
'⚫':'dot-black',
'⛈':'cloud',
'✍':'pencil',
'✕':'x',
'❌':'x',
'❔':'info',
'🌄':'sunrise',
'🌅':'sunrise',
'🌊':'waves',
'🌍':'globe',
'🌐':'globe',
'🌟':'star',
'🌡':'activity',
'🌪':'wind',
'🌬':'wind',
'🌱':'sprout',
'🌳':'sprout',
'🌾':'sprout',
'🌿':'leaf',
'🎁':'gift',
'🎉':'sparkles',
'🎒':'briefcase',
'🎛':'target',
'🎤':'message',
'🎨':'palette',
'🎭':'users',
'🎮':'target',
'🎯':'target',
'🎱':'target',
'🏁':'flag',
'🏅':'award',
'🏆':'trophy',
'🏐':'users',
'🏔':'mountain',
'🏕':'mountain',
'🏫':'building',
'🏷':'tag',
'🐢':'paw',
'🐺':'paw',
'👀':'eye',
'👋':'message',
'👣':'activity',
'👥':'users',
'👧':'users',
'👨':'users',
'👩':'users',
'💌':'mail',
'💓':'heart',
'💚':'heart',
'💛':'heart',
'💞':'heart',
'💡':'lightbulb',
'💪':'zap',
'💬':'message',
'💭':'message',
'📈':'trending-up',
'📉':'trending-down',
'📊':'bar-chart',
'📋':'clipboard-list',
'📍':'map-pin',
'📏':'list-checks',
'📒':'book',
'📖':'book',
'📚':'book',
'📝':'book',
'📢':'message',
'📱':'mobile',
'🔁':'refresh',
'🔄':'refresh',
'🔍':'search',
'🔎':'search',
'🔒':'lock',
'🔬':'flask',
'🔭':'search',
'🔮':'sparkles',
'🔴':'dot-red',
'🕊':'leaf',
'🕵':'eye',
'🗃':'calendar',
'🗑':'trash',
'🗑':'trash',
'🗓':'calendar',
'🗣':'message',
'🗺':'map',
'😄':'smile',
'😴':'moon',
'🙈':'eye-off',
'🙋':'users',
'🙌':'users',
'🙏':'heart',
'🚀':'zap',
'🚚':'compass',
'🚦':'alert',
'🚨':'alert',
'🚩':'flag',
'🚪':'log-out',
'🚫':'ban',
'🚶':'activity',
'🛟':'lifebuoy',
'🛠':'wrench',
'🛫':'compass',
'🟡':'dot-yellow',
'🟢':'dot-green',
'🤍':'heart',
'🤗':'users',
'🤝':'users',
'🥇':'star',
'🥾':'activity',
'🦁':'paw',
'🦅':'paw',
'🦉':'paw',
'🦊':'paw',
'🦌':'paw',
'🧑':'users',
'🧗':'mountain',
'🧘':'leaf',
'🧠':'lightbulb',
'🧩':'layers',
'🧪':'flask',
'🧭':'compass',
'🧰':'briefcase',
'🧱':'layers',
'🪜':'list-checks',
'🪞':'eye',
'🪟':'eye',
'🪤':'alert',
'🫀':'heart'
};
const EMOJI_RE = new RegExp('(' + Object.keys(EMOJI_ICONE).sort((a,b)=>b.length-a.length).map(e=>e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') + ')\\uFE0F?', 'g');
function emojiParaIcone(raiz){
  const w = document.createTreeWalker(raiz || document.body, NodeFilter.SHOW_TEXT, null);
  const alvos = [];
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeValue && /[^\u0000-\u2000]/.test(n.nodeValue) && !n.parentNode.closest('script,style,textarea,[data-sem-icone]')) { EMOJI_RE.lastIndex = 0; if (EMOJI_RE.test(n.nodeValue)) alvos.push(n); } }
  alvos.forEach(n => {
    const frag = document.createDocumentFragment(); let ultimo = 0; const t = n.nodeValue; EMOJI_RE.lastIndex = 0; let m;
    while ((m = EMOJI_RE.exec(t))) {
      if (m.index > ultimo) frag.appendChild(document.createTextNode(t.slice(ultimo, m.index)));
      const s = document.createElement('span'); s.className = 'ico-i'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = ico(EMOJI_ICONE[m[1].replace(/\uFE0F/g, '')], 18); frag.appendChild(s);
      ultimo = m.index + m[0].length;
    }
    if (ultimo < t.length) frag.appendChild(document.createTextNode(t.slice(ultimo)));
    n.parentNode.replaceChild(frag, n);
  });
}
(function(){
  let agendado = false;
  const ob = new MutationObserver(() => { if (agendado) return; agendado = true; Promise.resolve().then(() => { agendado = false; ob.disconnect(); try { emojiParaIcone(document.body); } finally { ob.observe(document.body, { childList: true, subtree: true, characterData: true }); } }); });
  const iniciar = () => { emojiParaIcone(document.body); ob.observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();


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
const SCREENS = ['home', 'trilha', 'modulo', 'missao', 'revisao', 'treino', 'cenario', 'armadilhas', 'psa', 'tools', 'tool', 'registro', 'eu'];
const SUBTELAS = ['modulo', 'missao', 'revisao', 'treino', 'cenario', 'armadilhas', 'psa', 'tool', 'registro'];
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
  if (s === 'treino' && typeof renderTreino === 'function') renderTreino();
  if (s === 'armadilhas' && typeof renderArmadilhas === 'function') renderArmadilhas();
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
  h += `<div class="tr-card"><div class="tr-lbl">Treino livre</div><h3>🎮 Cenários, pensamentos e pensar-sentir-agir</h3><p>Situações do dia a dia, com explicação de cada opção. Sem nota.</p><div class="tr-acoes"><button class="tr-btn" type="button" onclick="goTo('treino')">Abrir o treino</button><button class="tr-btn ghost" type="button" onclick="goTo('armadilhas')">🪤 Mapa das armadilhas</button></div></div>`;
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
    ${typeof linksTreinoHTML === 'function' ? linksTreinoHTML(m.id) : ''}
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
  if (r.f === 'missao') return r.n && r.n.modulo ? 'Módulo ' + r.n.modulo + (r.t && r.t.reflexao ? ' · “' + r.t.reflexao + '”' : '') : '';
  if (r.f === 'treino') { const id = r.c && ((r.c.cenario && r.c.cenario[0]) || (r.c.psa && r.c.psa[0])); const c = id && (typeof cenarioPorId === 'function' ? cenarioPorId(id) : null) || (id && typeof CEN !== 'undefined' ? CEN.PSA.find(s => s.id === id) : null); return c ? c.titulo : ''; }
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
    const f = ferramentaPorId(r.f) || ({ missao: { emoji: '🏕️', nome: 'Missão' }, treino: { emoji: '🎮', nome: 'Treino' } })[r.f];
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
  iconize();
  lerCacheOri();
  const ob = rd(K.ob, null), temDados = getRegs().length > 0;
  if ((ob && ob.feito) || temDados) { $('onboard').classList.add('hide'); goTo('home'); }
  else { $('onboard').classList.remove('hide'); }
}
