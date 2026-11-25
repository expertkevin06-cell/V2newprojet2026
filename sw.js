/* KEV FUSION 2026 — SW v20 · network-first · purge des caches obsolètes */
const CACHE = "kevfusion26-v20";
const SHELL = ["./", "./index.html", "./data.js?v=15", "./app.js?v=15", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  const d = e.data;
  if (d === "skipWaiting") self.skipWaiting();
  if (d && d.type === "PURGE") {
    e.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      self.skipWaiting();
    })());
  }
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const f = await fetch(r, { cache: "no-store" });
      if (f && f.status === 200 && f.type === "basic") c.put(r, f.clone()).catch(() => {});
      return f;
    } catch (_) {
      const hit = (await c.match(r)) || (await c.match(r, { ignoreSearch: true }));
      if (hit) return hit;
      if (r.mode === "navigate") {
        return (await c.match("./index.html")) || (await c.match("./")) || Response.error();
      }
      return Response.error();
    }
  })());
});
