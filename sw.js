var CACHE = "prometheus-hub-morph-v1";
var SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./projects.js",
  "./manifest.webmanifest",
  "./icons/favicon.svg",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(function (response) {
    if (response && response.ok) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
    }
    return response;
  }).catch(function () {
    return caches.match(event.request).then(function (hit) { return hit || caches.match("./index.html"); });
  }));
});
