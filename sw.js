/* Prometheus Hub. Network first. Same-origin shell only. No secrets. */
var CACHE = "prometheus-hub-desk-v9";
var SHELL = [
  "./",
  "./index.html",
  "./sylade.html",
  "./styles.css",
  "./hub.js",
  "./desk-strip.js",
  "./desk-home.js",
  "./pillars/kairos/fixed-dates.js",
  "./manifest.webmanifest",
  "./icons/favicon.svg",
  "./icons/favicon-32.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./kit/prometheus.css",
  "./kit/kit.js",
  "./kit/bus.js",
  "./kit/fonts/outfit-latin-300-normal.woff2",
  "./kit/fonts/outfit-latin-400-normal.woff2",
  "./kit/fonts/outfit-latin-500-normal.woff2"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(SHELL);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.indexOf("prometheus-hub-") === 0 && key !== CACHE; }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(function (response) {
    if (response && response.ok) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
    }
    return response;
  }).catch(function () {
    return caches.match(request).then(function (hit) { return hit || caches.match("./index.html"); });
  }));
});
