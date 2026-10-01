/* LAZLAB Studio — service worker
   Scope: /lazlab/ (the studio site).

   Strategy
   • Shell (page, manifest, logos, icons) is precached at install → the site opens with no network.
   • Navigations: network-first with a 4 s budget, then the cached shell. Edits you deploy show up on the next visit.
   • Same-origin assets (logos, icons): stale-while-revalidate.
   • Google Fonts: stale-while-revalidate, so the site keeps its typography offline.
   • /app/ belongs to the Hub, which ships its own service worker. This one never touches it.

   Cache names are namespaced "lazlab-site-*". johnlaz.github.io is ONE shared origin for every app, so this
   worker only ever deletes its own old versions. (The previous version deleted every cache that wasn't its own,
   which could wipe other apps' offline data on the same origin.)

   To ship an update: bump VERSION below. */
const VERSION = 'lazlab-site-2026.10';
const PREFIX  = 'lazlab-site-';
const LEGACY  = /^lazlab-v\d/;                       // this site's own old cache names, e.g. lazlab-v6-cards-2026.05

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

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const HUB_PATH = new URL('./app/', self.registration.scope).pathname;

const cacheable = res => !!res && (res.ok || res.type === 'opaque');

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => (k.startsWith(PREFIX) && k !== VERSION) || LEGACY.test(k))
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(req, ms) {
  const cache = await caches.open(VERSION);
  const net = fetch(req).then(res => { if (cacheable(res)) cache.put(req, res.clone()); return res; });
  net.catch(() => {});
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
  try {
    return await Promise.race([net, timeout]);
  } catch (_) {
    const hit = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
    return hit || net;
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
    if (url.pathname.startsWith(HUB_PATH)) return;            // the Hub owns /app/
    if (req.mode === 'navigate') { event.respondWith(networkFirst(req, 4000)); return; }
    event.respondWith(staleWhileRevalidate(event, req));
    return;
  }
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, req));
  }
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
