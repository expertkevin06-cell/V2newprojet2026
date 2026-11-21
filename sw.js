const CACHE_NAME = 'kev-fusion-v2026-massive';
const ASSETS = [
    '/newprojet2026/',
    '/newprojet2026/index.html',
    '/newprojet2026/script.js',
    '/newprojet2026/manifest.json',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    )));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('api.nhtsa.gov')) {
        event.respondWith(
            fetch(event.request)
                .then(r => {
                    const clone = r.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return r;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
    }
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') self.skipWaiting();
});
