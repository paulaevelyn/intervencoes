import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

/**
 * Camada de login/sincronização compartilhada do repositório (../auth/auth.js), igual aos outros apps.
 * Entra só no build: o app publicado fica em ritmo/, ao lado de auth/ e shared/.
 * Se o login não carregar (sem internet), o app abre mesmo assim, só com os dados do aparelho,
 * porque o plano de apoio precisa estar disponível offline.
 */
const logoSvg = () => readFileSync(new URL('./public/logo.svg', import.meta.url), 'utf8').replace(/fill="#12372F"/g, 'fill="var(--logo-ink)"').replace('<svg ', '<svg style="width:min(70vw,260px);height:auto" ').trim();

const abertura = () => `${logoSvg()}<p class="rs-por">por Psicoterapia e Afins</p>`;

const login = (): Plugin => ({
  name: 'ritmo-login',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      if (ctx.server) return [];
      return [
        { tag: 'link', attrs: { rel: 'stylesheet', href: '../auth/auth.css' }, injectTo: 'head' },
        // O login troca o conteúdo da tela de carregamento por uma mensagem de erro quando falha: guardamos o erro e mantemos a abertura.
        { tag: 'script', children: `(function(){var h=${JSON.stringify(abertura())};new MutationObserver(function(){var a=document.getElementById('pea-auth-aviso');if(!a||a.querySelector('.rs-por')||!a.textContent)return;if(/^N.o consegui/.test(a.textContent))window.__loginFalhou=true;a.innerHTML=h}).observe(document.documentElement,{childList:true,subtree:true,characterData:true})})();`, injectTo: 'head' },
        { tag: 'script', children: `document.documentElement.classList.add('pea-auth-carregando');
(function () {
  var n = 0, t = setInterval(function () {
    n++;
    var r = document.documentElement, a = document.getElementById('pea-auth-aviso');
    if (!r.classList.contains('pea-auth-carregando') || n > 160) { clearInterval(t); return; }
    if (document.getElementById('pea-auth-tela')) return; // tela de acesso visível: a pessoa decide
    // login falhou, sem internet ou demorando demais (mais de ~8 s): abre com os dados do aparelho
    if (!navigator.onLine || n > 10 || window.__loginFalhou) {
      r.classList.remove('pea-auth-carregando'); if (a) a.remove(); clearInterval(t);
    }
  }, 750);
})();`, injectTo: 'head' },
        // Tela de abertura enquanto o login carrega: o Ritmo no centro e "por Psicoterapia e Afins" embaixo, pequeno.
        { tag: 'script', children: `try{var s=JSON.parse(localStorage.getItem('ritmo:v1')||'{}').settings||{},t=s.theme||'sistema';if(t==='escuro'||(t==='sistema'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.setAttribute('data-rs','dark');if(s.lowStim)document.documentElement.setAttribute('data-rs-calm','1')}catch(e){}`, injectTo: 'head' },
        { tag: 'style', children: `html body #pea-auth-aviso{background:var(--rs-bg,#fbf8f0);color:var(--rs-muted,#4d6156);--logo-ink:#12372f}html[data-rs=dark] body #pea-auth-aviso{--rs-bg:#1f2326;--rs-muted:#b3b9bf;--logo-ink:#fbf8f0}html[data-rs-calm] #pea-auth-aviso rect{fill:#4a5a58}html[data-rs=dark][data-rs-calm] #pea-auth-aviso rect{fill:#aebdb9}#pea-auth-aviso .rs-por{position:absolute;left:0;right:0;bottom:max(2rem,env(safe-area-inset-bottom));text-align:center;font:600 .8rem/1.4 'Nunito Sans',system-ui,sans-serif;letter-spacing:.02em;margin:0}`, injectTo: 'head' },
        { tag: 'div', attrs: { id: 'pea-auth-aviso', role: 'status', 'aria-label': 'Ritmo, carregando' }, children: abertura(), injectTo: 'body-prepend' },
        { tag: 'script', attrs: { type: 'module', src: '../auth/auth.js', 'data-app': 'ritmo', 'data-nome': 'Ritmo', 'data-logo': 'logo-horizontal.svg', 'data-pesquisa': 'nao', 'data-storage-keys': 'ritmo:v1' }, injectTo: 'body' },
      ];
    },
  },
});

// O app publicado fica em ritmo/ (index.html + assets/), ao lado dos outros apps do repositório.
// O código-fonte fica em ritmo/fonte/.
export default defineConfig({
  base: './',
  plugins: [react(), login()],
  build: { outDir: '..', emptyOutDir: false, assetsDir: 'assets', sourcemap: false },
});
