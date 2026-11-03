(function () {
  "use strict";

  var THEMES = {
    classic: "Classic",
    bridge: "Starship Bridge",
    orbit: "Orbit",
    terminal: "Tactical Terminal"
  };
  var THEME_KEY = "prometheus_theme_v1";

  var projects = Array.isArray(window.PROMETHEUS_PROJECTS) ? window.PROMETHEUS_PROJECTS : null;
  var openPane = document.getElementById("pane-open");
  var benchPane = document.getElementById("pane-bench");
  var statusEl = document.getElementById("live-status");
  var chipsEl = document.getElementById("hdr-chips");

  if (!projects) {
    if (openPane) {
      openPane.innerHTML = '<p class="error" role="alert">The project list did not load. projects.js needs to sit beside this page.</p>';
    }
    return;
  }

  var primary = projects.filter(function (p) { return p && p.tier === "primary"; });
  var bench = projects.filter(function (p) { return p && p.tier !== "primary"; });
  var linked = projects.filter(function (p) { return p && p.status === "live"; }).length;
  var waiting = projects.filter(function (p) { return p && p.status === "slot"; }).length;

  document.body.dataset.linked = String(linked);
  document.body.dataset.waiting = String(waiting);

  if (statusEl) {
    statusEl.innerHTML = '<span class="dot" aria-hidden="true"></span>' + linked + " linked · " + waiting + " waiting";
  }

  if (chipsEl) {
    chipsEl.innerHTML = primary.map(function (project) {
      var link = firstLink(project);
      var label = "<strong>" + esc(shortName(project)) + "</strong>";
      if (!link) return '<span class="chip">' + label + "</span>";
      return '<a class="chip" href="' + esc(link.href) + '" target="_blank" rel="noopener noreferrer">' +
        label + "<span>" + esc(chipSub(project)) + "</span></a>";
    }).join("");
  }

  if (openPane) {
    openPane.innerHTML = primary.length
      ? '<div class="project-grid">' + primary.map(renderProject).join("") + "</div>"
      : '<p class="error">No primary projects yet. Mark one with tier "primary" in projects.js.</p>';
  }

  if (benchPane) {
    benchPane.innerHTML =
      '<p class="pane-note">Named slots. Add a link in <code>projects.js</code> when a specialist has an address.</p>' +
      (bench.length
        ? '<div class="bench-grid">' + bench.map(renderSlot).join("") + "</div>"
        : '<p class="error">No bench slots yet.</p>');
  }

  bindTabs();
  bindThemePicker();
  applyHash();
  window.addEventListener("hashchange", applyHash);

  document.dispatchEvent(new CustomEvent("prometheus:render"));

  if (window.PROMETHEUS_THEME) {
    loadScripts(["themes/fx.js", "themes/" + window.PROMETHEUS_THEME + ".js"]);
  }

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  function renderProject(project) {
    var id = slug(project.id || project.name || "project");
    var links = renderLinks(project.links || []);
    var note = project.note ? '<p class="note">' + esc(project.note) + "</p>" : "";
    return (
      '<article class="card" id="' + id + '">' +
        "<h3>" + esc(project.kicker || "Project") +
          ' <span class="badge-status live">Linked</span></h3>' +
        '<p class="val">' + esc(project.name || "Untitled") + "</p>" +
        '<p class="hint">' + esc(project.summary || "") + "</p>" +
        note +
        links +
      "</article>"
    );
  }

  function renderSlot(project) {
    var id = slug(project.id || project.name || "slot");
    var status = project.status || "slot";
    var foot = status === "empty"
      ? '<p class="quiet-line">Add an object to <code>projects.js</code>.</p>'
      : '<p class="quiet-line">No outbound link yet.</p>';
    var links = renderLinks(project.links || []);
    return (
      '<article class="slot-card is-' + esc(status) + '" id="' + id + '">' +
        '<p class="slot-kicker">' + esc(project.kicker || "Slot") + "</p>" +
        "<h3>" + esc(project.name || "Untitled") + "</h3>" +
        '<p class="hint">' + esc(project.summary || "") + "</p>" +
        (links || foot) +
      "</article>"
    );
  }

  function renderLinks(links) {
    var safe = [];
    (links || []).forEach(function (link) {
      if (!link) return;
      var href = safeUrl(link.href);
      var label = typeof link.label === "string" ? link.label.trim() : "";
      if (!href || !label) return;
      safe.push({ href: href, label: label });
    });
    if (!safe.length) return "";
    return (
      '<div class="links">' +
      safe.map(function (link, index) {
        var quiet = index === 0 ? "" : " quiet";
        return (
          '<a class="btn' + quiet + '" href="' + esc(link.href) + '" target="_blank" rel="noopener noreferrer">' +
            '<span class="btn-label">' + esc(link.label) + " ↗</span>" +
            '<span class="btn-host">' + esc(hostLine(link.href)) + "</span>" +
            '<span class="sr-only">Opens in a new tab</span>' +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  function firstLink(project) {
    var links = project.links || [];
    for (var i = 0; i < links.length; i++) {
      var href = safeUrl(links[i] && links[i].href);
      if (href) return { href: href, label: links[i].label || "Open" };
    }
    return null;
  }

  function shortName(project) {
    if (project.id === "titan-reliquary") return "Titan";
    if (project.id === "sylade-fleet") return "Sylade";
    if (project.id === "finances") return "Midas";
    var name = project.name || "Open";
    return name.split(" ")[0];
  }

  function chipSub(project) {
    if (project.id === "finances") return "Ledger";
    return project.kicker || "Open";
  }

  function bindTabs() {
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { selectTab(tab.dataset.tab, true); });
      tab.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        var list = Array.prototype.slice.call(tabs);
        var i = list.indexOf(tab);
        var next = event.key === "ArrowRight" ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
        list[next].focus();
        selectTab(list[next].dataset.tab, true);
      });
    });
  }

  function selectTab(name, writeHash) {
    var open = name !== "bench";
    document.querySelectorAll(".tab").forEach(function (tab) {
      var on = (tab.dataset.tab === "bench") !== open;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (openPane) {
      openPane.classList.toggle("active", open);
      openPane.hidden = !open;
    }
    if (benchPane) {
      benchPane.classList.toggle("active", !open);
      benchPane.hidden = open;
    }
    if (writeHash) {
      var next = open ? "#open" : "#bench";
      if (location.hash !== next) history.replaceState(null, "", next);
    }
  }

  function applyHash() {
    selectTab(location.hash === "#bench" ? "bench" : "open", false);
  }

  function bindThemePicker() {
    function open() { themePicker(); }
    var mark = document.getElementById("theme-mark");
    var button = document.getElementById("theme-btn");
    if (mark) mark.addEventListener("click", function (event) { event.stopPropagation(); open(); });
    if (button) button.addEventListener("click", function (event) { event.stopPropagation(); open(); });
  }

  function themePicker() {
    var existing = document.getElementById("theme-pop");
    if (existing) { existing.remove(); return; }
    var current = window.PROMETHEUS_THEME || "classic";
    var params = new URLSearchParams(location.search);
    var fromUrl = params.has("theme");
    var pop = document.createElement("div");
    pop.id = "theme-pop";
    pop.className = "theme-pop";
    pop.setAttribute("role", "menu");
    pop.innerHTML = '<div class="tp-title">Display theme</div>' +
      Object.keys(THEMES).map(function (key) {
        var on = key === current;
        return '<button type="button" role="menuitemradio" aria-checked="' + on + '" class="tp-item' +
          (on ? " on" : "") + '" data-theme="' + key + '">' + esc(THEMES[key]) + "</button>";
      }).join("") +
      '<div class="tp-note">' + (fromUrl
        ? "Previewing from the link. Picking one saves it on this device."
        : "Saved on this device only.") + "</div>";
    document.body.appendChild(pop);
    var anchor = document.getElementById("theme-btn") || document.getElementById("theme-mark");
    if (anchor) {
      var rect = anchor.getBoundingClientRect();
      var width = pop.offsetWidth || 240;
      var left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      pop.style.top = Math.round(rect.bottom + 8) + "px";
      pop.style.left = Math.round(left) + "px";
    }
    pop.querySelectorAll(".tp-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var choice = item.getAttribute("data-theme");
        try { localStorage.setItem(THEME_KEY, choice); } catch (err) {}
        var url = new URL(location.href);
        url.searchParams.delete("theme");
        if (fromUrl) url.searchParams.set("theme", choice);
        location.replace(url.pathname + url.search + location.hash);
      });
    });
    setTimeout(function () {
      document.addEventListener("click", function off(event) {
        if (!pop.contains(event.target)) {
          pop.remove();
          document.removeEventListener("click", off);
        }
      });
      document.addEventListener("keydown", function onKey(event) {
        if (event.key === "Escape") {
          pop.remove();
          document.removeEventListener("keydown", onKey);
        }
      });
    }, 0);
  }

  function loadScripts(sources) {
    var i = 0;
    function next() {
      if (i >= sources.length) return;
      var script = document.createElement("script");
      script.src = sources[i++];
      script.onload = next;
      script.onerror = next;
      document.body.appendChild(script);
    }
    next();
  }

  function safeUrl(href) {
    if (typeof href !== "string") return "";
    var trimmed = href.trim();
    if (!/^https?:\/\//i.test(trimmed)) return "";
    try {
      var url = new URL(trimmed);
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
    return String(value).replace(/[^A-Za-z0-9_-]/g, "") || "project";
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
