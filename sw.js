// Offline cache. Bump VERSION when files change.
const VERSION = 'jg-v12';
const ASSETS = ['./', 'index.html', 'quest.css', 'quest.js', 'easy-notes.js', 'lab-data.js', 'lab.js', 'lab.css', 'walkthrough-data.js', 'walkthrough.js?v=12', 'walkthrough.css?v=10', 'topic-visuals.js?v=12', 'topic-visuals.css?v=12', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];
const DATA = [
  'data/notes-FA.json', 'data/notes-TX.json', 'data/notes-CM.json',
  'data/q-FA.json', 'data/q-TX.json', 'data/q-CM.json',
  'data/study-FA.json', 'data/study-TX.json', 'data/study-CM.json'
];
const FONT_HOST = 'cdn.jsdelivr.net';

self.addEventListener('install', e => {
  // Data files are cached one by one so a missing file does not break the install.
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(ASSETS).then(() => Promise.all(DATA.map(u => c.add(u).catch(() => {})))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('jg-v') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Web font: cache first (files are versioned and never change).
  if (url.host === FONT_HOST){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
    })));
    return;
  }
  // App files: network first (so updates arrive), cache fallback when offline.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && url.origin === location.origin){
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
