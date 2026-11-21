const CACHE_NAME = 'kev-fusion-v2026-diagnostic';
const ASSETS = [
    '/newprojet2026/', '/newprojet2026/index.html', '/newprojet2026/script.js',
    '/newprojet2026/backup.js', '/newprojet2026/manifest.json'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(n => Promise.all(n.filter(x => x !== CACHE_NAME).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('api.nhtsa.gov') || e.request.url.includes('raw.githubusercontent.com')) {
        e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE_NAME).then(x => x.put(e.request, c).catch(() => {})); return r; }).catch(() => caches.match(e.request)));
        return;
    }
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('Offline', {status:503}))));
});
