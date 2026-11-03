(function () {
  "use strict";

  var projects = Array.isArray(window.PROMETHEUS_PROJECTS) ? window.PROMETHEUS_PROJECTS : [];
  var byId = {};
  projects.forEach(function (project) { if (project && project.id) byId[project.id] = project; });

  var live = projects.filter(function (p) { return p && p.status === "live"; });
  var waiting = projects.filter(function (p) { return p && p.status === "slot"; });

  var stats = document.getElementById("desk-stats");
  if (stats) {
    stats.innerHTML = "<span><strong>" + live.length + "</strong> extensions live</span>" +
      "<span><strong>" + waiting.length + "</strong> still waiting</span>" +
      "<span><strong>Titan</strong> is the vault door</span>";
  }

  var railList = document.getElementById("rail-list");
  if (railList) {
    railList.innerHTML = live.map(function (project) {
      return "<li><span>" + esc(shortName(project)) + "</span><strong>open</strong></li>";
    }).join("") + waiting.map(function (project) {
      return "<li><span>" + esc(project.name || "") + "</span><strong>slot</strong></li>";
    }).join("");
  }

  var well = document.getElementById("well");
  if (well) well.innerHTML = renderWell(byId["titan-reliquary"]);

  var flank = document.getElementById("flank");
  if (flank) {
    flank.innerHTML = [byId["sylade-fleet"], byId["finances"]].filter(Boolean).map(renderSide).join("");
  }

  var wall = document.getElementById("ext-wall");
  if (wall) {
    var ordered = [byId["titan-reliquary"], byId["sylade-fleet"], byId["finances"]].filter(Boolean);
    var bench = projects.filter(function (p) { return p && p.tier !== "primary"; });
    wall.innerHTML = ordered.map(function (project) {
      return renderPlaque(project, project.id === "titan-reliquary");
    }).join("") + bench.map(function (project) { return renderPlaque(project, false); }).join("");
  }

  bindWings();
  applyHash();
  window.addEventListener("hashchange", applyHash);
  tickClock();
  setInterval(tickClock, 30000);
  startWellFire();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  function renderWell(project) {
    if (!project) return "<p>Titan Reliquary is not in projects.js.</p>";
    return '<canvas id="desk-ember" aria-hidden="true"></canvas>' +
      '<div class="well-copy">' +
        '<p class="eyebrow">Primary extension</p>' +
        "<h2>" + esc(project.name) + "</h2>" +
        '<p class="lede">' + esc(project.summary || "") + "</p>" +
        (project.note ? '<p class="bound">' + esc(project.note) + "</p>" : "") +
        renderActions(project.links, true) +
      "</div>";
  }

  function renderSide(project) {
    return '<article class="side">' +
      '<p class="eyebrow">' + esc(project.kicker || "Extension") + "</p>" +
      "<h3>" + esc(project.name || "") + "</h3>" +
      "<p>" + esc(project.summary || "") + "</p>" +
      renderActions(project.links, false) +
    "</article>";
  }

  function renderPlaque(project, primary) {
    var slot = project.status !== "live";
    var cls = "plaque" + (primary ? " titan" : "") + (slot ? " slot" : "");
    var foot = slot
      ? '<p class="quiet">' + (project.status === "empty" ? "Add an object in projects.js." : "No outbound link yet.") + "</p>"
      : (project.note ? '<p class="bound">' + esc(project.note) + "</p>" : "") + renderActions(project.links, primary);
    return '<article class="' + cls + '" id="ext-' + slug(project.id) + '">' +
      '<p class="eyebrow">' + esc(project.kicker || "Extension") + "</p>" +
      "<h3>" + esc(project.name || "") + "</h3>" +
      "<p>" + esc(project.summary || "") + "</p>" +
      foot +
    "</article>";
  }

  function renderActions(links, emphasizeFirst) {
    var safe = [];
    (links || []).forEach(function (link) {
      var href = safeUrl(link && link.href);
      var label = link && typeof link.label === "string" ? link.label.trim() : "";
      if (href && label) safe.push({ href: href, label: label });
    });
    if (!safe.length) return "";
    return '<div class="actions">' + safe.map(function (link, index) {
      var primary = emphasizeFirst && index === 0 ? " primary" : "";
      return '<a class="btn' + primary + '" href="' + esc(link.href) + '" target="_blank" rel="noopener noreferrer">' +
        "<span>" + esc(link.label) + " ↗</span>" +
        '<span class="btn-host">' + esc(hostLine(link.href)) + "</span>" +
      "</a>";
    }).join("") + "</div>";
  }

  var ATMOS = [
    ["afterhours", "After Hours", "#c8a94a"],
    ["conservator", "Conservator", "#7a2e2e"],
    ["colossus", "Colossus", "#f2a93b"],
    ["nocturne", "Nocturne", "#cfa95f"],
    ["odyssey", "Odyssey", "#ffb347"],
    ["abyss", "Abyss", "#4fd6e2"],
    ["neon", "Neon", "#ff4fd8"],
    ["glacier", "Glacier", "#7fdcff"],
    ["valhalla", "Valhalla", "#f39a3d"],
    ["solaris", "Solaris", "#ffb52e"],
    ["zen", "Zen", "#b9d58a"],
    ["silkroad", "Silk Road", "#e8ba4c"],
    ["kaleido", "Kaleido", "#ee6fd6"]
  ];
  var INK = {
    afterhours: "#060605", conservator: "#f1eadb", colossus: "#170f06", nocturne: "#070b16",
    odyssey: "#04121a", abyss: "#03111c", neon: "#07060d", glacier: "#071018",
    valhalla: "#0b0806", solaris: "#050507", zen: "#0a0c0d", silkroad: "#050b16",     kaleido: "#130b20"
  };

  bindAtmosphere();

  function currentAtmo() {
    return document.documentElement.getAttribute("data-atmo") || "afterhours";
  }

  function applyAtmo(id) {
    document.documentElement.setAttribute("data-atmo", id);
    try { localStorage.setItem("ph_atmo_v1", id); } catch (err) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && INK[id]) meta.setAttribute("content", INK[id]);
    document.querySelectorAll(".atmo-pick").forEach(function (btn) {
      var on = btn.getAttribute("data-atmo-val") === id;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function atmoButtons() {
    var cur = currentAtmo();
    return ATMOS.map(function (row) {
      var on = row[0] === cur ? " on" : "";
      return '<button type="button" class="atmo-pick' + on + '" data-atmo-val="' + row[0] + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        '<span class="atmo-swatch" style="--sw:' + row[2] + '"></span><span>' + row[1] + "</span></button>";
    }).join("");
  }

  function bindAtmosphere() {
    var grid = document.getElementById("atmo-grid");
    if (grid) grid.innerHTML = atmoButtons();
    document.addEventListener("click", function (event) {
      var pick = event.target.closest && event.target.closest(".atmo-pick");
      if (!pick) return;
      applyAtmo(pick.getAttribute("data-atmo-val"));
      var sheet = document.getElementById("atmo-sheet");
      if (sheet) sheet.hidden = true;
    });
    var open = document.getElementById("atmo-open");
    if (open) open.addEventListener("click", function () { toggleSheet(); });
  }

  function toggleSheet() {
    var sheet = document.getElementById("atmo-sheet");
    if (!sheet) {
      sheet = document.createElement("div");
      sheet.id = "atmo-sheet";
      sheet.className = "atmo-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", "Atmosphere");
      sheet.innerHTML = '<p class="eyebrow">Exhibition lighting</p><h2>Atmosphere</h2><div class="atmo-grid">' + atmoButtons() + "</div>";
      document.body.appendChild(sheet);
      return;
    }
    sheet.hidden = !sheet.hidden;
    if (!sheet.hidden) sheet.querySelector(".atmo-grid").innerHTML = atmoButtons();
  }

  function bindWings() {
    document.querySelectorAll(".wing").forEach(function (wing) {
      wing.addEventListener("click", function () {
        select(wing.getAttribute("data-wing"), true);
      });
    });
  }

  function select(name, write) {
    var wing = name === "extensions" || name === "ops" ? name : "desk";
    document.querySelectorAll(".wing").forEach(function (button) {
      var on = button.getAttribute("data-wing") === wing;
      button.classList.toggle("active", on);
      if (on) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    ["desk", "extensions", "ops"].forEach(function (id) {
      var pane = document.getElementById("pane-" + id);
      if (!pane) return;
      var on = id === wing;
      pane.classList.toggle("active", on);
      pane.hidden = !on;
    });
    if (write) {
      var hash = wing === "desk" ? "#desk" : "#" + wing;
      if (location.hash !== hash) history.replaceState(null, "", hash);
    }
  }

  function applyHash() {
    var hash = (location.hash || "").replace("#", "");
    select(hash || "desk", false);
  }

  function tickClock() {
    var el = document.getElementById("rail-time");
    if (!el) return;
    el.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date());
  }

  function startWellFire() {
    var canvas = document.getElementById("desk-ember");
    if (!canvas) return;
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) return;
    var ctx = canvas.getContext("2d");
    var parts = [];
    var n;
    for (n = 0; n < 48; n++) parts.push({ x: Math.random(), y: Math.random(), v: 0.15 + Math.random() * 0.45, s: 0.4 + Math.random() });
    function draw(now) {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, rect.width);
      var h = Math.max(1, rect.height);
      if (canvas.width !== Math.round(w * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var glow = ctx.createRadialGradient(w * 0.5, h * 0.82, 8, w * 0.5, h * 0.78, w * 0.46);
      glow.addColorStop(0, "rgba(255,210,140,0.45)");
      glow.addColorStop(0.4, "rgba(220,90,20,0.18)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      parts.forEach(function (p) {
        p.y -= p.v * 0.004;
        if (p.y < 0.15) p.y = 0.9 + Math.random() * 0.1;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,190,90," + (0.25 + p.s * 0.4) + ")";
        ctx.arc(p.x * w, p.y * h, p.s * 1.8, 0, 6.28);
        ctx.fill();
      });
      if (!document.hidden && document.getElementById("pane-desk").classList.contains("active")) {
        requestAnimationFrame(draw);
      } else {
        setTimeout(function () { requestAnimationFrame(draw); }, 400);
      }
    }
    requestAnimationFrame(draw);
  }

  function shortName(project) {
    if (project.id === "titan-reliquary") return "Titan";
    if (project.id === "sylade-fleet") return "Sylade";
    if (project.id === "finances") return "Midas";
    return (project.name || "").split(" ")[0];
  }

  function safeUrl(href) {
    if (typeof href !== "string" || !/^https?:\/\//i.test(href.trim())) return "";
    try {
      var url = new URL(href.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      return url.href;
    } catch (err) {
      return "";
    }
  }

  function hostLine(href) {
    var url = new URL(href);
    return url.hostname + url.pathname.replace(/\/$/, "");
  }

  function slug(value) {
    return String(value || "item").replace(/[^A-Za-z0-9_-]/g, "") || "item";
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
