/* Prometheus deck: offline shell. Same-origin only; the weather is never cached here (the deck keeps its own last reading).
   Pages and code: network first, cache as the fallback, so a new build shows up on the next load and the deck still opens offline.
   The url list is generated (sw-precache.js). A waiting worker stays waiting until the page's Update ready chip asks it to take over. */
importScripts("./sw-precache.js");
var CACHE = "prometheus-hub-deck-d21";
var SHELL = self.PRECACHE || [];

function addAll(cache, urls) {
  var queue = urls.slice();
  function pump() {
    if (!queue.length) return Promise.resolve();
    var url = queue.shift();
    return cache.add(url).catch(function () { return null; }).then(pump);
  }
  var workers = [];
  for (var i = 0; i < 6; i++) workers.push(pump());
  return Promise.all(workers);
}

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return addAll(cache, SHELL); }));
});
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
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
