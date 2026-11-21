const CACHE_NAME = 'kev-fusion-v2026-integrity';
const ASSETS = [
    '/newprojet2026/',
    '/newprojet2026/index.html',
    '/newprojet2026/script.js',
    '/newprojet2026/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS).catch(e => console.warn('Cache error:', e)))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(names => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('api.nhtsa.gov')) {
        event.respondWith(
            fetch(event.request)
                .then(r => {
                    const clone = r.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone).catch(() => {}));
                    return r;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(r => r || fetch(event.request).catch(() => new Response('Offline', {status: 503})))
    );
});
