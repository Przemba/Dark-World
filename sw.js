/* Service worker: cache wszystkiego, gra działa offline. Zmień VERSION przy każdej wersji, żeby odświeżyć cache. */
const VERSION = "dw-v6";
const FILES = ["./", "index.html", "manifest.webmanifest", "css/style.css", "js/items.js", "js/bestiary.js", "js/engine.js", "js/ui.js",
  "books/tom1.js", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match("index.html"))));
});
