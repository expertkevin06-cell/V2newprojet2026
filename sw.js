/* KEV FUSION 2026 — SW v11 : chemins relatifs, socle hors ligne */
const CACHE="kevfusion26-v11";
const SHELL=["./","./index.html","./data.js","./app.js","./manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
await Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})));self.skipWaiting();})());});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{const k=await caches.keys();
await Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)));await self.clients.claim();})());});
self.addEventListener("message",e=>{if(e.data==="skipWaiting")self.skipWaiting();});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(u.origin!==self.location.origin)return;
if(r.mode==="navigate"){e.respondWith((async()=>{try{const f=await fetch(r);const c=await caches.open(CACHE);
c.put("./index.html",f.clone()).catch(()=>{});return f;}catch(_){const c=await caches.open(CACHE);
return (await c.match("./index.html"))||(await c.match("./"))||Response.error();}})());return;}
e.respondWith((async()=>{const c=await caches.open(CACHE);const h=await c.match(r);if(h)return h;
try{const f=await fetch(r);if(f&&f.status===200&&f.type==="basic")c.put(r,f.clone()).catch(()=>{});return f;}
catch(_){return h||Response.error();}})());});
