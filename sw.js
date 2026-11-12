/* Prometheus deck: offline shell. Same-origin only; the weather is never cached here (the deck keeps its own last reading).
   Pages and code: network first, cache as the fallback, so a new build shows up on the next load and the deck still opens offline. */
var CACHE = "prometheus-hub-deck-d3";
var SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./deck/deck.css", "./deck/app.js", "./deck/caps.js", "./deck/pillars.js", "./deck/core/legacy.js", "./deck/core/fx.js", "./deck/views/orrery.js", "./kit/prometheus.css", "./kit/kit.js", "./kit/bus.js",
  "./deck/core/store.js", "./deck/core/dates.js", "./deck/core/ui.js", "./deck/core/feeds.js", "./deck/core/atmo.js", "./deck/core/weather.js", "./deck/core/ics.js",
  "./deck/models/time.js", "./deck/models/money.js", "./deck/models/profile.js",
  "./deck/views/picture.js", "./deck/views/parts.js", "./deck/views/time.js", "./deck/views/money.js", "./deck/views/system.js",
  "./deck/data/focus.js", "./deck/data/demo.js", "./deck/data/money-words.js", "./deck/data/fixed-dates.json", "./deck/data/issuers.json", "./deck/data/offers.json", "./deck/data/payoff-cases.json",
  "./deck/fonts/outfit-latin-wght-normal.woff2",
  "./icons/favicon.svg", "./icons/favicon-32.png", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];
self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key.indexOf("prometheus-hub-") === 0 && key !== CACHE; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (event) {
  var request = event.request; if (request.method !== "GET") return;
  var url = new URL(request.url); if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;
  event.respondWith(fetch(request).then(function (response) {
    if (response && response.ok && response.type === "basic") { var copy = response.clone(); caches.open(CACHE).then(function (cache) { cache.put(request, copy); }); }
    return response;
  }).catch(function () {
    return caches.match(request, { ignoreSearch: request.mode === "navigate" }).then(function (hit) { return hit || (request.mode === "navigate" ? caches.match("./index.html") : Response.error()); });
  }));
});
