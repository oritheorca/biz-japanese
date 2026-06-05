const CACHE = 'keigo-v15';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './content.js',
  './ios-frame.jsx',
  './tweaks-panel.jsx',
  './jp.jsx',
  './cards.jsx',
  './screens.jsx',
  './app.jsx',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
];

const CDN_HOSTS = [
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCDN = CDN_HOSTS.some((h) => url.hostname.includes(h));

  if (!sameOrigin && !isCDN) return;

  if (sameOrigin) {
    // Network-first for our own app code so updates apply on reload.
    // Falls back to cache when offline.
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for stable, versioned CDN assets (React, Babel, fonts).
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
