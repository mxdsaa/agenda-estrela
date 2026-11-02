/* Agenda Estrela — funciona sem internet depois da primeira visita */
var V = "agenda-estrela-v2";
var SHELL = ["./", "index.html", "style.css", "app.js", "elements.js", "jspdf.umd.min.js", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V && k !== "fonts"; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open("fonts").then(function (c) {
      return c.match(e.request).then(function (hit) {
        var net = fetch(e.request).then(function (r) { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
    return;
  }
  if (u.origin !== location.origin) return;
  // rede primeiro (para receber atualizações), cache se estiver sem internet
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var cl = r.clone(); caches.open(V).then(function (c) { c.put(e.request, cl); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (h) { return h || caches.match("index.html"); }); }));
});
