/* LAZLAB Studio — retirement worker.
   The landing page is a plain website now (no manifest, no offline cache).
   This worker exists only so browsers that installed the old one pick it up, clear its caches, and unregister.
   It touches only caches this site created (lazlab-site-* and the old lazlab-v<N>* names), never other apps' caches
   on the shared johnlaz.github.io origin. Once it has been live for a few weeks, delete this file and the
   registration block at the bottom of index.html. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => /^lazlab-site-/.test(k) || /^lazlab-v\d/.test(k)).map(k => caches.delete(k)));
    await self.registration.unregister();
  })());
});
