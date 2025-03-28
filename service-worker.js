
const CACHE_NAME = 'bible-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/verse.html',
        '/styles.css',
        '/modal.css',
        '/app.js',
        '/modal.js',
        '/js/bookNames.js',
        '/site.webmanifest',
        '/data/kjv.json',
        '/modal.png',
        '/web-app-manifest-192x192.png',
        '/web-app-manifest-512x512.png',
        'https://fonts.googleapis.com/css2?family=Titillium+Web:ital@0;1&family=Anton&display=swap',
        'https://fonts.googleapis.com/icon?family=Material+Icons'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
      .catch(() => {
        return caches.match('/');
      })
  );
});
