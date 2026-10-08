/* 离线缓存：install 预缓存壳与内置资源；运行时 same-origin GET 未命中再回填（cache-first）。 */
var CACHE = 'puzzle-island-v1';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/levels.js',
  './js/rng.js',
  './js/geometry.js',
  './js/pieces.js',
  './js/storage.js',
  './js/images.js',
  './js/game.js',
  './js/format.js',
  './js/audio.js',
  './js/ui-home.js',
  './js/ui-game.js',
  './js/ui-done.js',
  './js/main.js',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/builtin/b1.jpg',
  './assets/builtin/b2.jpg',
  './assets/builtin/b3.jpg',
  './assets/builtin/b4.jpg',
  './assets/builtin/b5.jpg',
  './assets/builtin/b6.jpg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
