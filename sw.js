/* Prometheus deck: offline shell. Same-origin only; the weather is never cached here (the deck keeps its own last reading).
   Pages and code: network first, cache as the fallback, so a new build shows up on the next load and the deck still opens offline.
   Pictures, fonts, sounds and models (2026-11-25, c9, the phone pass): from their own cache at once, refreshed behind for next time.
   That cache outlives builds (its name does not start "prometheus-hub-"), so a new build no longer re-downloads every painting, and on a
   phone a page no longer waits on the network for its font and its painting (the late font was reflowing the text). */
var CACHE = "prometheus-hub-deck-d113";
var MEDIA = "prometheus-media-v1", MEDIA_RE = /\.(webp|png|jpe?g|gif|svg|woff2?|webm|m4a|mp3|glb)$/i;
var PILLAR_IDS = [
  "kairos", "hearth", "garage", "apollo", "money", "selling", "records", "icarus", "hermes",
  "piano", "bastion", "athenaeum", "odyssey", "privacy", "argus", "games", "forge", "foundry",
  "observatory", "kin", "sylade", "aether", "polis", "mythos", "continuity", "atlas", "aegis"
];
var SHELL = [
  "./", "./index.html", "./manifest.webmanifest", "./pillars.json",
  "./pillars/kairos/methods.js", "./pillars/kairos/fixed-dates.js", "./deck/core/deadlines.js",
  "./deck/deck.css", "./deck/lock.js", "./deck/app.js", "./deck/caps.js", "./deck/pillars.js",
  "./deck/core/legacy.js", "./deck/core/fx.js", "./deck/core/reach.js",
  "./deck/core/store.js", "./deck/core/dates.js", "./deck/core/ui.js", "./deck/core/feeds.js", "./deck/core/atmo.js", "./deck/core/weather.js", "./deck/core/ics.js", "./deck/core/now.js", "./deck/core/session.js",
  "./deck/models/time.js", "./deck/models/money.js", "./deck/models/profile.js",
  "./deck/views/picture.js", "./deck/views/realm.js", "./deck/views/townsound.js", "./deck/core/season.js", "./deck/views/wxchip.js", "./deck/views/menu.js", "./art/worlds/index.json", "./art/worlds/world_home.webp", "./art/worlds/strip.webp", "./art/worlds/strip.json", "./deck/views/parts.js", "./deck/views/orrery.js", "./deck/splash.js", "./deck/views/time.js", "./deck/views/money.js", "./deck/views/system.js",
  "./deck/data/focus.js", "./deck/data/demo.js", "./deck/data/money-words.js", "./deck/data/fixed-dates.json", "./deck/data/issuers.json", "./deck/data/offers.json", "./deck/data/payoff-cases.json",
  "./deck/fonts/outfit-latin-wght-normal.woff2",
  "./kit/prometheus.css", "./kit/kit.js", "./kit/world.js", "./kit/bus.js", "./kit/links.js", "./kit/stage.js", "./kit/refs.js",
  "./kit/fonts/outfit-latin-300-normal.woff2", "./kit/fonts/outfit-latin-400-normal.woff2", "./kit/fonts/outfit-latin-500-normal.woff2",
  "./icons/favicon-32.png", "./icons/apple-touch-icon.png", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
].concat(PILLAR_IDS.reduce(function (acc, id) {
  acc.push("./pillars/" + id + "/", "./pillars/" + id + "/index.html", "./pillars/" + id + "/pillar.json", "./pillars/" + id + "/app.css", "./pillars/" + id + "/app.js");
  if (id !== "athenaeum") acc.push("./pillars/" + id + "/stage.js");
  return acc;
}, [])).concat([
  "./pillars/atlas/pay.js", "./pillars/aegis/cover.js", "./pillars/athenaeum/vault.js", "./pillars/athenaeum/ideas-seed.js", "./pillars/athenaeum/history-seed.js",
  "./pillars/odyssey/odyssey-data.js", "./pillars/odyssey/basemap.js", "./pillars/odyssey/photos.js", "./pillars/odyssey/odyssey-extra.js", "./pillars/odyssey/globe.js", "./pillars/polis/kern-rules.js", "./pillars/continuity/legacy-policies.js", "./pillars/hearth/permits.js", "./pillars/argus/corpus-data.js", "./pillars/observatory/subjects-seed.js",
  "./pillars/athenaeum/js/app.js", "./pillars/athenaeum/js/sky.js", "./pillars/athenaeum/js/model.js", "./pillars/athenaeum/data/cause-event-consequence.json",
  "./pillars/kin/lineage/data.js", "./pillars/kin/lineage/album.js", "./pillars/kin/lineage/stories.js", "./pillars/kin/lineage/kinship.js", "./pillars/kin/lineage/lineage.js",
  "./pillars/kin/album/", "./pillars/kin/album/index.html", "./pillars/kin/album/album.css", "./pillars/kin/album/app.js", "./pillars/kin/album/catalog.js", "./kit/history.js", "./pillars/athenaeum/data/world-history.js", "./pillars/kin/lineage/lineage.css", "./kit/vendor/three/build/three.module.min.js",
  "./pillars/kin/tree/", "./pillars/kin/tree/index.html", "./pillars/kin/tree/tree.css", "./pillars/kin/tree/main.js", "./pillars/kin/tree/core.js", "./pillars/kin/tree/gfx.js", "./pillars/kin/tree/globe.js", "./pillars/kin/tree/poster.webp",
  "./pillars/kin/tree/fonts/cormorant-garamond-latin-500-normal.woff2", "./pillars/kin/tree/fonts/cormorant-garamond-latin-600-normal.woff2", "./pillars/kin/tree/fonts/cormorant-garamond-latin-500-italic.woff2"
]);

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.allSettled(SHELL.map(function (url) { return cache.add(url); }));
    }).then(function () { return self.skipWaiting(); })
  );
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
  if (MEDIA_RE.test(url.pathname) && !request.headers.has("range")) {
    event.respondWith(caches.open(MEDIA).then(function (media) {
      return media.match(request).then(function (hit) {
        /* one more try after a short wait before giving up: on a phone's flaky signal (and on the live proofs) a single dropped request
           should not leave a painting or a photo missing */
        var get = function () { return fetch(request).then(function (response) { if (response && response.ok && response.type === "basic") media.put(request, response.clone()); return response; }); };
        var net = get().then(function (response) { return response.ok || hit ? response : new Promise(function (r) { setTimeout(r, 400); }).then(get); })
          .catch(function () { return hit || new Promise(function (r) { setTimeout(r, 400); }).then(get).catch(function () { return caches.match(request).then(function (old) { return old || Response.error(); }); }); });
        if (hit) { event.waitUntil(net.catch(function () {})); return hit; }
        return net;
      });
    }));
    return;
  }
  event.respondWith(fetch(request).then(function (response) {
    if (response && response.ok && response.type === "basic") { var copy = response.clone(); caches.open(CACHE).then(function (cache) { cache.put(request, copy); }); }
    return response;
  }).catch(function () {
    return caches.match(request, { ignoreSearch: request.mode === "navigate" }).then(function (hit) { return hit || (request.mode === "navigate" ? caches.match("./index.html") : Response.error()); });
  }));
});
