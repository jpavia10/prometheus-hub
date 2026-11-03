/* Prometheus Hub world picker. Data is TITAN_WORLDS. No theme intros, no FX engines.
   Choosing a world loads styles/atmo/<id>.css and sets data-atmo. */
(function () {
  "use strict";
  var W = window.TITAN_WORLDS || [];
  var by = {};
  W.forEach(function (w) { by[w.id] = w; });
  var root = document.documentElement;
  var reduced = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var esc = function (t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var LIGHT = { banknote: 1, bauhaus: 1, conservator: 1, diorama: 1, marbled: 1, notepad: 1, papercut: 1, pulp: 1, sketch: 1, y2k: 1 };

  function isLight(w) { return !!(LIGHT[w.id]); }
  function pass(w, f) { return f === "light" ? isLight(w) : f === "dark" ? !isLight(w) : true; }

  var GROUPS = [
    { name: "Museum and study", note: "Calm rooms for looking closely", ids: ["afterhours", "conservator", "drafting", "sketch", "marbled", "banknote", "notepad"] },
    { name: "Vaults and treasure", note: "Gold, silver and hoards", ids: ["colossus", "glacier", "valhalla", "dynasty", "abyss", "alchemist"] },
    { name: "Journeys", note: "Maps, ships, stations and stars", ids: ["odyssey", "silkroad", "terminal", "contour", "solaris", "supercell"] },
    { name: "Calm and quiet", note: "Slow, soft and still", ids: ["nocturne", "zen", "samadhi", "cathedral", "kintsugi"] },
    { name: "Neon and otherworld", note: "Glow, code and strange places", ids: ["kaleido", "neon", "construct", "xeno", "cursedwing", "lumen", "horizon"] },
    { name: "Playful and retro", note: "Games, comics, paper and toys", ids: ["arcade", "pulp", "diorama", "bauhaus", "y2k", "papercut", "freefall"] },
    { name: "Matter and machines", note: "Liquids, metals and moving parts", ids: ["ferro", "rift"] }
  ];

  function groups() {
    var seen = {};
    var out = GROUPS.map(function (g) {
      var list = g.ids.map(function (id) { return by[id]; }).filter(Boolean);
      list.forEach(function (w) { seen[w.id] = 1; });
      return { name: g.name, note: g.note, list: list };
    });
    var rest = W.filter(function (w) { return !seen[w.id]; });
    if (rest.length) out.push({ name: "New and more", note: "Themes still waiting for a group", list: rest });
    return out;
  }

  function picture(w) {
    if (w.art && w.art.card) {
      return '<span class="th-img th-art"><img loading="lazy" decoding="async" width="640" height="400" alt="" src="art/themes/' + w.art.card + '"></span>';
    }
    return '<span class="th-img th-swatch atmo-swatch sw-' + w.id + '" aria-hidden="true"></span>';
  }

  function tile(w, cur) {
    return '<button type="button" class="th-card th-tile" data-world="' + w.id + '" aria-pressed="' + (cur === w.id) + '">' +
      picture(w) +
      '<span class="th-name">' + esc(w.name) + '</span><span class="th-now" aria-hidden="true">✓</span></button>';
  }

  function hero(id) {
    var w = by[id];
    if (!w) return "";
    return picture(w) + '<span class="th-hero-body"><span class="th-hero-k">Now showing</span><span class="th-name">' + esc(w.name) +
      '</span><span class="th-mood">' + esc(w.mood) + '</span><button type="button" class="th-surprise" data-th-surprise="1">Surprise me</button></span>';
  }

  function render(el) {
    if (!el) return;
    var cur = root.getAttribute("data-atmo") || "afterhours";
    var f = el.dataset.filter || "all";
    var nL = W.filter(isLight).length;
    function chip(k, label, n) {
      return '<button type="button" class="th-filter" data-th-filter="' + k + '" aria-pressed="' + (f === k) + '">' + label + " <span>" + n + "</span></button>";
    }
    var html = '<div class="th-bar" role="group" aria-label="Show themes">' +
      chip("all", "All", W.length) + chip("light", "Light", nL) + chip("dark", "Dark", W.length - nL) + "</div>" +
      '<div class="th-hero" id="th-hero-' + (el.id || "x") + '">' + hero(cur) + "</div>";
    groups().forEach(function (g) {
      var list = g.list.filter(function (w) { return pass(w, f); });
      if (!list.length) return;
      html += '<section class="th-group"><h3 class="th-coll">' + esc(g.name) + ' <span class="th-note">' + esc(g.note) +
        '</span></h3><div class="th-grid">' + list.map(function (w) { return tile(w, cur); }).join("") + "</div></section>";
    });
    el.innerHTML = html;
  }

  function mounts() {
    return [document.getElementById("th-ops"), document.getElementById("th-sheet-mount")].filter(Boolean);
  }

  function paint() { mounts().forEach(render); }

  function paintThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (bg) meta.setAttribute("content", bg);
  }

  function loadCss(id) {
    return new Promise(function (resolve) {
      var prev = document.querySelector('link[data-atmo-css="' + id + '"]');
      if (prev) { resolve(true); return; }
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.atmoCss = id;
      link.href = "styles/atmo/" + id + ".css";
      link.onload = function () { resolve(true); };
      link.onerror = function () { resolve(false); };
      document.head.appendChild(link);
    });
  }

  function dropOthers(id) {
    document.querySelectorAll("link[data-atmo-css]").forEach(function (link) {
      if (link.dataset.atmoCss !== id) link.remove();
    });
  }

  function syncUi(id) {
    var w = by[id];
    if (w && w.ui && w.ui.length) root.setAttribute("data-ui", w.ui.join(" "));
    else root.removeAttribute("data-ui");
  }

  function apply(id) {
    if (!by[id]) return;
    var go = function () {
      root.setAttribute("data-atmo", id);
      try { localStorage.setItem("ph_atmo_v1", id); } catch (err) {}
      dropOthers(id);
      syncUi(id);
      paintThemeColor();
      paint();
      var sheet = document.getElementById("th-sheet");
      if (sheet) sheet.hidden = true;
    };
    if (root.getAttribute("data-atmo") === id && document.querySelector('link[data-atmo-css="' + id + '"]')) {
      syncUi(id);
      paint();
      return;
    }
    loadCss(id).then(function (ok) {
      if (!ok) return;
      if (reduced()) { go(); return; }
      root.classList.add("world-fade");
      setTimeout(function () {
        go();
        requestAnimationFrame(function () { root.classList.remove("world-fade"); });
      }, 160);
    });
  }

  function surprise(f) {
    var cur = root.getAttribute("data-atmo");
    var list = W.filter(function (w) { return pass(w, f || "all") && w.id !== cur; });
    return list.length ? list[Math.floor(Math.random() * list.length)].id : null;
  }

  document.addEventListener("click", function (event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var filter = t.closest("[data-th-filter]");
    if (filter) {
      var host = filter.closest("#th-ops, #th-sheet-mount");
      if (host) { host.dataset.filter = filter.getAttribute("data-th-filter"); render(host); }
      return;
    }
    if (t.closest("[data-th-surprise]")) {
      var host2 = t.closest("#th-ops, #th-sheet-mount");
      var id = surprise(host2 && host2.dataset.filter);
      if (id) apply(id);
      return;
    }
    var card = t.closest("[data-world]");
    if (card && card.closest("#th-ops, #th-sheet, #th-sheet-mount")) apply(card.getAttribute("data-world"));
  });

  var openBtn = document.getElementById("atmo-open");
  var sheet = document.getElementById("th-sheet");
  if (openBtn && sheet) {
    openBtn.addEventListener("click", function () {
      sheet.hidden = !sheet.hidden;
      if (!sheet.hidden) render(document.getElementById("th-sheet-mount"));
    });
  }
  var closeBtn = document.getElementById("th-sheet-close");
  if (closeBtn && sheet) closeBtn.addEventListener("click", function () { sheet.hidden = true; });

  if (!by[root.getAttribute("data-atmo")]) apply("afterhours");
  else syncUi(root.getAttribute("data-atmo"));
  paint();
  window.PrometheusWorlds = { count: W.length, apply: apply, ids: W.map(function (w) { return w.id; }) };
})();
