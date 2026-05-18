/* LAZLAB service worker — v1
   Strategy:
   - Cache-first for the LAZLAB shell + icons + manifest
   - Network-first for the /app/ children (these are dev builds; freshness wins)
   - Offline fallback to the cached index.html for the LAZLAB shell only
*/
const VERSION = 'lazlab-v2-neon-2026.05';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo-256.jpg',
  './assets/logo-512.jpg',
  './assets/logo-1024.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  const isAppChild = url.pathname.includes('/app/');
  const isShell    = !isAppChild;

  if (isAppChild) {
    // Network-first for child apps (always freshest debug build)
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  if (isShell) {
    // Cache-first for the shell
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match('./')))
    );
  }
});
