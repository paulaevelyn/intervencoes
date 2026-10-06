/* Floresça — Service Worker
   Offline-first para assets, network-first para HTML.
   Incrementar CACHE_VERSION a cada deploy para forçar atualização. */
const CACHE_VERSION = 'floresca-v9';
const CORE = [
  './',
  './index.html',
  './style.css',
  './extra.css',
  './app.js',
  './manifest.json',
  './assets/floresca-logo.svg',
  './assets/floresca-icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Login e componentes compartilhados: sempre da rede (correções chegam na hora)
  const caminho = new URL(req.url).pathname;
  if (caminho.includes('/auth/') || caminho.includes('/shared/')) return;

  // HTML: tenta rede primeiro (apanha atualizações), cache como fallback offline
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Restantes assets: cache primeiro, rede como fallback (e guarda)
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});

// Clique na notificação → abre/foca o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./');
    })
  );
});
