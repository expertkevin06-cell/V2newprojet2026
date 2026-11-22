/* KEV FUSION 2026 — service worker : socle hors ligne, réseau pour les sources */
const CACHE = "kevfusion26-bench-v3";
const SHELL = ["/newprojet2026/", "/newprojet2026/index.html", "/newprojet2026/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put("/newprojet2026/index.html", fresh.clone()).catch(() => {});
        return fresh;
      } catch (_) {
        const c = await caches.open(CACHE);
        return (await c.match("/newprojet2026/index.html")) || (await c.match("/newprojet2026/")) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200 && fresh.type === "basic") c.put(req, fresh.clone()).catch(() => {});
      return fresh;
    } catch (_) {
      return hit || Response.error();
    }
  })());
});
