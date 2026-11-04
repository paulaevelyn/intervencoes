import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Camada de login/sincronização compartilhada do repositório (../auth/auth.js), igual aos outros apps.
 * Entra só no build: o app publicado fica em ritmo/, ao lado de auth/ e shared/.
 * Se o login não carregar (sem internet), o app abre mesmo assim, só com os dados do aparelho,
 * porque o plano de apoio precisa estar disponível offline.
 */
const login = (): Plugin => ({
  name: 'ritmo-login',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      if (ctx.server) return [];
      return [
        { tag: 'link', attrs: { rel: 'stylesheet', href: '../auth/auth.css' }, injectTo: 'head' },
        { tag: 'script', children: `document.documentElement.classList.add('pea-auth-carregando');
(function () {
  var n = 0, t = setInterval(function () {
    n++;
    var r = document.documentElement, a = document.getElementById('pea-auth-aviso');
    if (!r.classList.contains('pea-auth-carregando') || n > 160) { clearInterval(t); return; }
    if (document.getElementById('pea-auth-tela')) return; // tela de acesso visível: a pessoa decide
    // login falhou, sem internet ou demorando demais (mais de ~8 s): abre com os dados do aparelho
    if (!navigator.onLine || n > 10 || (a && /^N.o consegui/.test(a.textContent || ''))) {
      r.classList.remove('pea-auth-carregando'); if (a) a.remove(); clearInterval(t);
    }
  }, 750);
})();`, injectTo: 'head' },
        { tag: 'div', attrs: { id: 'pea-auth-aviso' }, children: 'carregando…', injectTo: 'body-prepend' },
        { tag: 'script', attrs: { type: 'module', src: '../auth/auth.js', 'data-app': 'ritmo', 'data-nome': 'Ritmo', 'data-logo': 'icon.svg', 'data-pesquisa': 'nao', 'data-storage-keys': 'ritmo:v1' }, injectTo: 'body' },
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
