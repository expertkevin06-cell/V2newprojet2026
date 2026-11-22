/* KEV FUSION 2026 — SW v12 : socle hors ligne + icônes PNG pour PWABuilder/install */
const CACHE = "kevfusion26-v12";
const SHELL = ["./", "./index.html", "./data.js", "./app.js", "./manifest.webmanifest"];
const ICONS = [
  "https://cdn-icons-png.flaticon.com/192/3202/3202926.png",
  "https://cdn-icons-png.flaticon.com/512/3202/3202926.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => {})));
    /* icônes : meilleur effort (install réussit même sans réseau) */
    await Promise.all(ICONS.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => {})));
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
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);

  /* icônes CDN : réseau d'abord, repli cache (utile hors ligne après install) */
  if (u.origin !== self.location.origin && u.hostname.endsWith("flaticon.com")) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const f = await fetch(r, { mode: "cors" });
        if (f && f.status === 200) c.put(r, f.clone()).catch(() => {});
        return f;
      } catch (_) {
        return (await c.match(r)) || Response.error();
      }
    })());
    return;
  }

  if (u.origin !== self.location.origin) return;

  if (r.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const f = await fetch(r);
        const c = await caches.open(CACHE);
        c.put("./index.html", f.clone()).catch(() => {});
        return f;
      } catch (_) {
        const c = await caches.open(CACHE);
        return (await c.match("./index.html")) || (await c.match("./")) || Response.error();
      }
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const h = await c.match(r);
    if (h) return h;
    try {
      const f = await fetch(r);
      if (f && f.status === 200 && f.type === "basic") c.put(r, f.clone()).catch(() => {});
      return f;
    } catch (_) {
      return h || Response.error();
    }
  })());
});
