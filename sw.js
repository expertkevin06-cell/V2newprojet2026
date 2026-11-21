const CACHE_NAME = 'kev-fusion-v2026';
const ASSETS_TO_CACHE = [
  '/newprojet2026/',
  '/newprojet2026/index.html',
  '/newprojet2026/script.js',
  '/newprojet2026/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
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
    })
  );
  self.clients.claim();
});

// Stratégie : Network First pour les API, Cache First pour l'interface
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('api.nhtsa.gov')) {
    // Network first pour les rappels VIN
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Hors ligne" }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  } else {
    // Cache first pour l'interface
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
