/* LAZLAB Hub — service worker
   Scope: /app/ only.

   Strategy
   • Shell (index, manifest, icons) is precached at install → the Hub opens with no network.
   • Navigations: network-first with a 4 s budget, then the cached shell. Online users always get the latest deploy.
   • Same-origin assets: stale-while-revalidate.
   • CDN libraries + fonts (JSZip, html2canvas, jsPDF, Google Fonts): precached best-effort, then
     stale-while-revalidate, so ZIP loading and PDF/PNG export keep working offline.
   • Everything else (api.groq.com, URL debug sessions, …) is never touched.

   Cache names are namespaced "lazlab-hub-*". johnlaz.github.io is ONE shared origin for every app,
   so this worker never deletes or reads a cache it did not create.

   To ship an update: bump VERSION below (and APP_VER in index.html). */
const VERSION = 'lazlab-hub-v2.3.2';
const PREFIX  = 'lazlab-hub-';

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

const RUNTIME_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

const cacheable = res => !!res && (res.ok || res.type === 'opaque');

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await cache.addAll(CORE);                                   // required: install fails loudly if the shell is incomplete
    await Promise.allSettled(CDN.map(async url => {             // best-effort: offline libs, but never block install
      const res = await fetch(new Request(url, { mode: 'no-cors' }));
      await cache.put(url, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith(PREFIX) && k !== VERSION)       // only OUR old versions
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(req, ms) {
  const cache = await caches.open(VERSION);
  const net = fetch(req).then(res => { if (cacheable(res)) cache.put(req, res.clone()); return res; });
  net.catch(() => {});                                          // avoid unhandled rejection if the timeout wins
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
  try {
    return await Promise.race([net, timeout]);
  } catch (_) {
    const hit = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
    return hit || net;                                          // nothing cached yet: wait for the network
  }
}

async function staleWhileRevalidate(event, req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  const refresh = fetch(req)
    .then(res => { if (cacheable(res)) cache.put(req, res.clone()); return res; })
    .catch(() => null);
  if (hit) { event.waitUntil(refresh); return hit; }
  return (await refresh) || Response.error();
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') { event.respondWith(networkFirst(req, 4000)); return; }
    event.respondWith(staleWhileRevalidate(event, req));
    return;
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, req));
  }
  // anything else: leave to the network untouched
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
