
const CACHE_NAME = 'bible-v2';
const ASSETS = [
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
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
      .catch(() => {
        return caches.match('/');
      })
  );
});
