/* Agenda Estrela — funciona sem internet depois da primeira visita */
var V = "agenda-estrela-v4";
var CDN = "elementos-cdn-v1";
var SHELL = ["./", "index.html", "style.css", "app.js", "elements.js", "decor.js", "stickers.js", "templates.js", "jspdf.umd.min.js", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V && k !== "fonts" && k !== CDN; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
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
  /* ilustrações (jsDelivr): guardadas no celular. Sempre busca em modo CORS para a mesma
     resposta servir tanto para a miniatura (<img>) quanto para o desenho/PDF (fetch). */
  if (u.hostname === "cdn.jsdelivr.net") {
    e.respondWith(caches.open(CDN).then(function (c) {
      return c.match(u.href).then(function (hit) {
        if (hit && hit.type !== "opaque") return hit;
        return fetch(new Request(u.href, { mode: "cors", credentials: "omit" })).then(function (r) {
          if (r.ok) c.put(u.href, r.clone());
          return r;
        }).catch(function () { return hit || Response.error(); });
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
