/* Prometheus kit (Claude, 2026-11-05): the field, on-device storage and small UI helpers every pillar shares.
   window.PK = { field(opts), store(pillar), $, $$, h, money, num, day, toast, tabs(root), spark(canvas, series, opts), download(name, obj), pickFile() }
   Nothing here talks to a server. Data stays in this browser (localStorage) until the owner exports it. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** h("div.glass", {onclick}, ...children): a tiny element builder. */
  function h(tag, attrs, ...kids) {
    const [name, ...cls] = tag.split(".");
    const e = document.createElement(name || "div");
    if (cls.length) e.className = cls.join(" ");
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (k === "html") e.innerHTML = v;
      else if (k === "text") e.textContent = v;
      else e.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
    return e;
  }
  const NF = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const money = (n, d = 2) => (n == null || isNaN(n) ? "—" : (n < 0 ? "−$" : "$") + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const num = (n, d) => (n == null || isNaN(n) ? "—" : d == null ? NF.format(n) : Number(n).toFixed(d));
  const pad = (n) => String(n).padStart(2, "0");
  const day = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function toast(msg, ms = 6000, undo) {
    const t = h("div.toast", { role: "status" });
    t.append(document.createTextNode(msg));
    if (typeof undo === "function") {
      t.append(h("button", { type: "button", onclick: () => { undo(); t.remove(); } }, "Undo"));
    }
    document.body.append(t);
    setTimeout(() => { if (t.isConnected) t.remove(); }, ms);
  }

  /** Per-pillar storage: lists of records with ids, kept in localStorage, exportable as one JSON file. */
  function store(pillar) {
    const key = (k) => `prometheus.${pillar}.${k}`;
    const read = (k, dflt) => { try { const v = localStorage.getItem(key(k)); return v == null ? dflt : JSON.parse(v); } catch (_) { return dflt; } };
    const write = (k, v) => { try { localStorage.setItem(key(k), JSON.stringify(v)); try { window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar, k } })); } catch (_) { /* old browser */ } return true; } catch (_) { toast("This browser would not save. Export your data."); return false; } };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return {
      get: read, set: write,
      list: (k) => read(k, []),
      add(k, rec) { const l = read(k, []); const r = { id: uid(), at: new Date().toISOString(), ...rec }; l.push(r); write(k, l); return r; },
      update(k, id, patch) { const l = read(k, []).map((r) => (r.id === id ? { ...r, ...patch } : r)); write(k, l); },
      remove(k, id) { write(k, read(k, []).filter((r) => r.id !== id)); },
      dump() { const out = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(`prometheus.${pillar}.`)) out[k.slice(pillar.length + 12)] = read(k.slice(pillar.length + 12)); } return { pillar, exported: new Date().toISOString(), data: out }; },
      load(obj) { if (!obj || obj.pillar !== pillar || !obj.data) throw new Error("This file is not a " + pillar + " export."); for (const [k, v] of Object.entries(obj.data)) write(k, v); },
    };
  }
  function download(name, obj) {
    const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(obj, null, 1)], { type: "application/json" })), download: name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function pickFile(accept = "application/json") {
    return new Promise((res) => { const i = h("input", { type: "file", accept }); i.onchange = () => res(i.files[0] || null); i.click(); });
  }

  /** Tabs: buttons [role=tab][aria-controls] inside root; remembers the last one per page. */
  function tabs(root, onShow) {
    const btns = $$('[role="tab"]', root), id = "prometheus.tab." + location.pathname;
    const show = (b) => {
      btns.forEach((x) => { const on = x === b; x.setAttribute("aria-selected", on); const p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on; });
      try { localStorage.setItem(id, b.id); } catch (_) {}
      onShow && onShow(b.getAttribute("aria-controls"));
    };
    btns.forEach((b) => b.addEventListener("click", () => { show(b); if (b.id) history.replaceState(null, "", "#" + b.id); }));
    let first = btns[0];
    const hashTab = document.getElementById((location.hash || "").slice(1));
    if (hashTab && btns.includes(hashTab)) first = hashTab;
    else { try { first = document.getElementById(localStorage.getItem(id)) || first; } catch (_) {} }
    if (first) show(first);
    return show;
  }

  /** A line chart on a canvas: series = [{x, y}] (x numbers, ascending). Draws a glow line, fill and the last value dot. */
  function spark(cv, series, o = {}) {
    const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth || 300, hgt = cv.clientHeight || 120;
    cv.width = w * dpr; cv.height = hgt * dpr;
    const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, hgt);
    const css = getComputedStyle(document.body), acc = (o.color || css.getPropertyValue("--accent")).trim() || "#9fd4e6";
    if (!series.length) { c.fillStyle = "rgba(183,196,214,.5)"; c.font = "14px Outfit, sans-serif"; c.fillText(o.empty || "No points yet", 8, hgt / 2); return; }
    const xs = series.map((p) => p.x), ys = series.map((p) => p.y);
    let y0 = o.min ?? Math.min(...ys), y1 = o.max ?? Math.max(...ys); if (y0 === y1) { y0 -= 1; y1 += 1; }
    const x0 = Math.min(...xs), x1 = Math.max(...xs) === x0 ? x0 + 1 : Math.max(...xs), padY = 10;
    const X = (x) => 6 + ((x - x0) / (x1 - x0)) * (w - 12), Y = (y) => hgt - padY - ((y - y0) / (y1 - y0)) * (hgt - padY * 2);
    if (o.zero != null && o.zero >= y0 && o.zero <= y1) { c.strokeStyle = "rgba(214,226,245,.18)"; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(0, Y(o.zero)); c.lineTo(w, Y(o.zero)); c.stroke(); c.setLineDash([]); }
    const g = c.createLinearGradient(0, 0, 0, hgt); g.addColorStop(0, acc + "55"); g.addColorStop(1, acc + "00");
    c.beginPath(); series.forEach((p, i) => (i ? c.lineTo(X(p.x), Y(p.y)) : c.moveTo(X(p.x), Y(p.y))));
    c.lineTo(X(xs[xs.length - 1]), hgt); c.lineTo(X(xs[0]), hgt); c.closePath(); c.fillStyle = g; c.fill();
    c.beginPath(); series.forEach((p, i) => (i ? c.lineTo(X(p.x), Y(p.y)) : c.moveTo(X(p.x), Y(p.y))));
    c.strokeStyle = acc; c.lineWidth = 2; c.shadowColor = acc; c.shadowBlur = 10; c.stroke(); c.shadowBlur = 0;
    const L = series[series.length - 1]; c.fillStyle = "#f4f7fb"; c.beginPath(); c.arc(X(L.x), Y(L.y), 3.5, 0, 7); c.fill();
  }

  /** The field: drifting points in the pillar's accent that gather into its glyph (glyph(n, rand) -> [x,y] in -1..1) and part around the pointer. */
  function field(o = {}) {
    const cv = document.getElementById("field"); if (!cv) return;
    cv.dataset.lit = "1";
    const c = cv.getContext("2d"); let W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now();
    const N = Math.round((o.count || 900) * (matchMedia("(max-width: 700px)").matches ? 0.55 : 1));
    let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const P = Array.from({ length: N }, () => ({ x: rand(), y: rand(), vx: 0, vy: 0, tx: 0, ty: 0, s: 0.4 + rand() * 1.4, a: 0.25 + rand() * 0.6, g: rand() < (o.share ?? 0.55) }));
    const glyph = o.glyph ? o.glyph(N, rand) : null;
    if (glyph) P.forEach((p, i) => { const g = glyph[i % glyph.length]; p.tx = g[0]; p.ty = g[1]; });
    const ptr = { x: -9, y: -9, on: false };
    const css = getComputedStyle(document.body), acc = css.getPropertyValue("--accent").trim(), acc2 = css.getPropertyValue("--accent-2").trim();
    function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    const gx = o.at ? o.at[0] : 0.72, gy = o.at ? o.at[1] : 0.32, gs = o.scale || 0.26;
    function frame(now) {
      const t = (now - t0) / 1000; c.clearRect(0, 0, W, H);
      const S = Math.min(W, H) * gs, cx = W * (W < 700 ? 0.5 : gx), cy = H * (W < 700 ? 0.22 : gy);
      for (const p of P) {
        let ax = Math.sin(p.y * 6 + t * 0.15) * 0.00004, ay = Math.cos(p.x * 6 + t * 0.12) * 0.00004;
        if (glyph && p.g) { const tx = (cx + p.tx * S) / W, ty = (cy + p.ty * S) / H; ax += (tx - p.x) * 0.0016; ay += (ty - p.y) * 0.0016; }
        if (ptr.on) { const dx = p.x - ptr.x, dy = (p.y - ptr.y) * (H / W), d2 = dx * dx + dy * dy; if (d2 < 0.012) { const f = 0.00045 / (d2 + 0.0008); ax += dx * f; ay += dy * f; } }
        p.vx = (p.vx + ax) * 0.93; p.vy = (p.vy + ay) * 0.93; p.x += p.vx; p.y += p.vy;
        if (!p.g) { if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02; if (p.y < -0.02) p.y = 1.02; if (p.y > 1.02) p.y = -0.02; }
        const tw = 0.6 + 0.4 * Math.sin(t * 1.3 + p.s * 9);
        c.globalAlpha = p.a * tw; c.fillStyle = p.g ? acc : (p.s > 1.4 ? acc2 : "#dfe8f5");
        c.fillRect(p.x * W, p.y * H, p.s, p.s);
      }
      c.globalAlpha = 1;
      if (!reduced()) raf = requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size, { passive: true });
    addEventListener("pointermove", (e) => { ptr.x = e.clientX / W; ptr.y = e.clientY / H; ptr.on = true; }, { passive: true });
    addEventListener("pointerleave", () => (ptr.on = false));
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && !reduced()) raf = requestAnimationFrame(frame); });
    if (reduced()) { for (let i = 0; i < 400; i++) frame(t0 + i * 16); } else raf = requestAnimationFrame(frame);
  }

  /** Glyph helpers: sample points along polylines/circles (all in -1..1). */
  const G = {
    ring(n, r, cx = 0, cy = 0, a0 = 0, a1 = Math.PI * 2) { return Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); },
    line(n, x0, y0, x1, y1) { return Array.from({ length: n }, (_, i) => { const k = i / Math.max(1, n - 1); return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]; }); },
    poly(n, pts) { const segs = []; let L = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); L += d; }
      const out = []; for (let i = 1; i < pts.length; i++) out.push(...G.line(Math.max(2, Math.round(n * segs[i - 1] / L)), ...pts[i - 1], ...pts[i])); return out; },
  };

  window.PK = { $, $$, h, money, num, day, toast, store, download, pickFile, tabs, spark, field, G, reduced };

  if (new URLSearchParams(location.search).get("embed") === "1") document.documentElement.classList.add("is-embed");
  const embedded = document.documentElement.classList.contains("is-embed");
  const appMain = document.getElementById("app");
  if (!embedded && appMain && !document.querySelector("a.skip")) {
    if (!appMain.hasAttribute("tabindex")) appMain.setAttribute("tabindex", "-1");
    document.body.prepend(h("a.skip", { href: "#app" }, "Skip to this module"));
  }
  const bar = document.querySelector("header.bar");
  const parts = location.pathname.split("/").filter(Boolean);
  const at = parts.indexOf("pillars");
  if (bar && at >= 0 && parts[at + 1] && !embedded && !bar.querySelector(".compass")) {
    const here = parts[at + 1];
    const seats = [["kairos", "Kairos"], ["apollo", "Apollo"], ["piano", "Piano"], ["hermes", "Hermes"], ["argus", "Argus"], ["money", "Money"], ["selling", "Selling"], ["icarus", "Icarus"], ["garage", "Garage"], ["odyssey", "Odyssey"], ["bastion", "Bastion"], ["records", "Records"], ["athenaeum", "Athenaeum"], ["privacy", "Privacy"], ["hearth", "Hearth"], ["games", "Games"], ["forge", "Forge"], ["foundry", "Foundry"], ["observatory", "Observatory"], ["kin", "Kin"], ["sylade", "Sylade"], ["aether", "Aether"], ["polis", "Polis"], ["mythos", "Mythos"], ["continuity", "Continuity"]];
    const idx = seats.findIndex(([id]) => id === here);
    const link = (id, name, current) => h("a", Object.assign({ href: id ? "../" + id + "/" : "../../#/" }, current ? { "aria-current": "page" } : {}), name);
    const step = (seat, dir) => {
      const id = seat ? seat[0] : "";
      const name = seat ? seat[1] : "Desk";
      const which = dir < 0 ? "Previous module" : "Next module";
      const keys = dir < 0 ? "[" : "]";
      return h("a.compass-step", {
        href: id ? "../" + id + "/" : "../../#/",
        "aria-label": which + ", " + name,
        title: which + ", " + name + " (" + keys + ")",
        "aria-keyshortcuts": keys
      }, h("span.compass-go", { "aria-hidden": "true" }, dir < 0 ? "‹" : "›"), h("span.compass-name", null, name));
    };
    const prev = idx > 0 ? seats[idx - 1] : null;
    const next = idx >= 0 && idx < seats.length - 1 ? seats[idx + 1] : null;
    const track = h("div.compass-track", null,
      link("", "Desk", false),
      ...seats.map(([id, name]) => link(id, name, id === here)));
    const nav = h("nav.compass", { "aria-label": "Modules" }, step(prev, -1), track, step(next, 1));
    const spacer = bar.querySelector(".spacer");
    if (spacer) spacer.replaceWith(nav);
    else bar.append(nav);
    const cur = track.querySelector('[aria-current="page"]');
    if (cur) {
      const edges = () => {
        const box = track.getBoundingClientRect();
        let left = 0, right = 0;
        track.querySelectorAll("a").forEach((a) => {
          const r = a.getBoundingClientRect();
          if (r.left < box.left - 1 && r.right > box.left + 1) left = Math.ceil(r.right - box.left);
          if (r.right > box.right + 1 && r.left < box.right - 1) right = Math.ceil(box.right - r.left);
        });
        if (left < 8) left = 0;
        if (right < 8) right = 0;
        const mask = !left && !right ? ""
          : `linear-gradient(to right, transparent ${left}px, #000 ${left}px, #000 calc(100% - ${right}px), transparent calc(100% - ${right}px))`;
        track.style.webkitMaskImage = mask;
        track.style.maskImage = mask;
      };
      const place = () => {
        const left = cur.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
        const max = Math.max(0, track.scrollWidth - track.clientWidth);
        track.scrollLeft = Math.max(0, Math.min(max, left - (track.clientWidth - cur.offsetWidth) / 2));
        edges();
      };
      track.addEventListener("scroll", edges, { passive: true });
      place();
      requestAnimationFrame(() => requestAnimationFrame(place));
      addEventListener("resize", place, { passive: true });
    }
    const go = (dir) => {
      const seat = dir < 0 ? prev : next;
      location.href = seat ? "../" + seat[0] + "/" : "../../#/";
    };
    document.addEventListener("keydown", (e) => {
      if (e.defaultPrevented || document.querySelector("dialog[open]")) return;
      const typing = e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable='true']");
      if (typing) return;
      const chord = e.metaKey || e.ctrlKey || e.shiftKey;
      const prevKey = e.key === "[" || (e.altKey && !chord && e.key === "ArrowLeft");
      const nextKey = e.key === "]" || (e.altKey && !chord && e.key === "ArrowRight");
      if ((e.key === "[" || e.key === "]") && (e.altKey || chord)) return;
      if (!prevKey && !nextKey) return;
      e.preventDefault();
      go(prevKey ? -1 : 1);
    });
  }
})();

/* ================================================================== pillar shell v2 (2026-11-12) ==================================================================
   The default look of every pillar, upgraded in one place (owner: "level up the default pillar look ... I opened the piano one its
   junk"). Nothing in a pillar's own code changes: this reads the page it finds and dresses it.
   - a crest: the pillar's own cell from the hub's core, beside its name
   - sections: a page that is one long stack of panels becomes tabs made from the panels' own titles (three or more panels)
   - one tab rail for every pillar, with a light that slides to the chosen tab; the incoming section turns in from its side
   - a dock like the hub's: previous pillar, back to the core, next pillar
   - a ripple under the finger on anything pressable */
(function () {
  if (document.documentElement.classList.contains("is-embed")) return;
  var body = document.body, pillar = body && body.dataset.pillar, shell = document.querySelector(".shell"), main = document.getElementById("app");
  if (!pillar || !shell || !main) return;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = { kairos: "M7 3.5h10M7 20.5h10M8 3.5c0 4 4 5.5 4 8.5s-4 4.5-4 8.5M16 3.5c0 4-4 5.5-4 8.5s4 4.5 4 8.5", apollo: "M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
    piano: "M4 5h16v14H4zM8 5v8M12 5v8M16 5v8M8 13v6M12 13v6M16 13v6", hermes: "M4 6h16v12H4zM4 7l8 6l8-6", argus: "M2.5 12s3.5-6.5 9.5-6.5s9.5 6.5 9.5 6.5s-3.5 6.5-9.5 6.5S2.5 12 2.5 12M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6",
    money: "M4 17a8 8 0 0 1 16 0M12 17V9M12 9l-3 3M12 9l3 3M4 20h16", selling: "M4 4h7l9 9-7 7-9-9zM8 8h.01", icarus: "M3 17c5 0 9-2 12-6c2-2.7 4-4 6-4c-1 5-4 9-9 10.5c-3 1-6 .7-9-.5M9 14.5c2-.5 4-2 5.5-4",
    garage: "M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13.5h.01M16.5 13.5h.01", odyssey: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18M15.5 8.5l-2 5l-5 2l2-5z",
    bastion: "M12 3l7 3v5.5c0 4.5-3 8-7 9.5c-4-1.500-7-5-7-9.500V6z", athenaeum: "M4 20h16M5 8h14L12 4zM7 8v9M12 8v9M17 8v9M5 17h14", privacy: "M6.5 11h11v9h-11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 14.5v2", hearth: "M4 11l8-6.5l8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5", sylade: "M9 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9M15 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9", forge: "M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.6.8-2.4 1.6-3.2c.4 1.6 1.2 2 1.6 2c0-2.4-.8-4 .8-6.800M5 20h14M8 20l1-3h6l1 3", foundry: "M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1", observatory: "M4 16l9-9l3 3l-9 9zM13 7l2.5-2.5l3 3L16 10M6 19l-2 2.5M9 21l1-3M15 4.5a5 5 0 0 1 4.5 4.5", kin: "M8.5 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6M3 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5M16.5 10a2.5 2.5 0 1 0 0-5M17 14c2.5.3 4 2.4 4 5", games: "M6 9h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5 2.2L14.5 15h-5L8 16.2A3 3 0 0 1 3 14v-2a3 3 0 0 1 3-3M8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01", records: "M7 3.5h7l4 4V20.5H7zM14 3.5v4h4", aether: "M3 16c3-6 5-10 9-6s6 0 9-6M3 20c4-4 6-6 10-3s5 1 8-3", polis: "M3 20h18M4 10h16M6 10v10M10 10v10M14 10v10M18 10v10M12 3l9 7H3z", mythos: "M20 4a6 6 0 0 0-8.5 0L5 10.5V19h8.5L20 12.5A6 6 0 0 0 20 4M16 8L2 22M17.5 15H9", continuity: "M4 5h16v14H4zM8 19v1.5M16 19v1.5M12 12a3 3 0 1 0 0 .01M12 9v1M12 14v1M9 12h1M14 12h1", sylade: "M12 3.5l2.6 5.6l6 .7l-4.5 4.1l1.2 6l-5.3-3l-5.3 3l1.2-6L3.4 9.8l6-.7z", hearth: "M4 8h13a3 3 0 0 0 3-2H4zM7 8c0 3 1 4 3 5v3M15 8c0 3-1 4-3 5M7 19h10M8.5 16h7v3h-7z", games: "M6 9h12a3 3 0 0 1 3 3v2a3 3 0 0 1-5 2.2L14.5 15h-5L8 16.2A3 3 0 0 1 3 14v-2a3 3 0 0 1 3-3M8 11v3M6.5 12.5h3M15.5 12h.01M17.5 13.5h.01", forge: "M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.6.8-2.4 1.6-3.2c.4 1.6 1.2 2 1.6 2c0-2.4-.8-4 .8-6.8M5 20h14M8 20l1-3h6l1 3", foundry: "M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3", observatory: "M4 16l9-9l3 3l-9 9zM13 7l2.5-2.5l3 3L16 10M6 19l-2 2.5M9 21l1-3", kin: "M8.5 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6M3 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5M16.5 10a2.5 2.5 0 1 0 0-5M17 14c2.5.3 4 2.4 4 5" };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  body.classList.add("pk-v2");

  /* the crest */
  var hero = shell.querySelector(".hero");
  if (hero && !hero.querySelector(".pk-crest")) {
    var crest = el("span", "pk-crest"); crest.setAttribute("aria-hidden", "true");
    crest.innerHTML = '<i><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + (ICON[pillar] || "M12 5v14M5 12h14") + '"/></svg></i>';
    hero.classList.add("pk-hero"); hero.prepend(crest);
    var lede = hero.querySelector(".lede");
    if (lede && lede.textContent.length > 110) { var more = el("button", "pk-more", "More"); more.type = "button"; more.setAttribute("aria-expanded", "false");
      more.addEventListener("click", function () { var open = lede.classList.toggle("open"); more.textContent = open ? "Less" : "More"; more.setAttribute("aria-expanded", String(open)); }); lede.after(more); }
  }

  /* the dock: previous pillar, the core, next pillar, plus command launcher */
  var compass = document.querySelector("nav.compass"), steps = compass ? compass.querySelectorAll("a.compass-step") : [];
  var dock = el("nav", "pk-dock"); dock.setAttribute("aria-label", "Pillars");
  var core = el("a", "pk-core"); core.href = "../../"; core.setAttribute("aria-label", "Back to the core"); core.appendChild(el("span", null, "Core"));
  if (steps[0]) dock.appendChild(steps[0]); else dock.appendChild(el("span", "pk-gap"));
  dock.appendChild(core); if (steps[1]) dock.appendChild(steps[1]); else dock.appendChild(el("span", "pk-gap"));
  var cmdBtn = el("button", "pk-cmd-btn"); cmdBtn.type = "button"; cmdBtn.setAttribute("aria-label", "Open Pillar Command Palette"); cmdBtn.title = "Command Palette (Ctrl+K)";
  cmdBtn.innerHTML = "<span>&#8984;K</span>";
  dock.appendChild(cmdBtn);
  body.appendChild(dock);

  /* the light that slides under the chosen tab */
  function ink(tabs) {
    if (!tabs) return; var on = tabs.querySelector('.tab[aria-selected="true"]'), mark = tabs.querySelector(".pk-ink");
    if (!mark) { mark = el("span", "pk-ink"); mark.setAttribute("aria-hidden", "true"); tabs.appendChild(mark); }
    if (!on) { mark.style.opacity = "0"; return; }
    mark.style.opacity = "1"; mark.style.width = on.offsetWidth + "px"; mark.style.transform = "translateX(" + on.offsetLeft + "px)";
    var left = on.offsetLeft - 16, right = on.offsetLeft + on.offsetWidth + 16 - tabs.clientWidth; if (tabs.scrollLeft > left) tabs.scrollLeft = Math.max(0, left); else if (tabs.scrollLeft < right) tabs.scrollLeft = right;
  }
  function turnIn(panel, dir) { if (!panel || still) return; panel.style.setProperty("--pk-dir", dir < 0 ? "-1" : "1"); panel.classList.remove("pk-in"); void panel.offsetWidth; panel.classList.add("pk-in"); }

  /* sections for a page that is one long stack */
  var key = "prometheus.section." + location.pathname, made = null, active = 0, lastIdx = {};
  try { active = parseInt(sessionStorage.getItem(key) || "0", 10) || 0; } catch (e) { active = 0; }
  function label(h2) { var t = (h2.textContent || "").split(/ — | – | - |: |\. /)[0].replace(/^(The|Your|A|An) /i, "").trim(); t = t.charAt(0).toUpperCase() + t.slice(1); return t.length > 22 ? t.slice(0, 21).trim() + "…" : t; }
  function sections() {
    if (main.querySelector(":scope > .tabs:not(.pk-tabs)")) return;                 // the pillar has its own tabs
    var grid = main.querySelector(":scope > section.grid"), panels = grid ? Array.prototype.filter.call(grid.children, function (c) { return c.classList.contains("glass") && c.querySelector(":scope > h2"); }) : [];
    var old = main.querySelector(":scope > .pk-tabs");
    if (panels.length < 3) { if (old) old.remove(); made = null; return; }
    var names = panels.map(function (p) { return label(p.querySelector(":scope > h2")); }), sig = names.join("|");
    if (!old || old.dataset.sig !== sig) {
      if (old) old.remove(); old = el("div", "tabs pk-tabs"); old.setAttribute("role", "tablist"); old.dataset.sig = sig;
      names.forEach(function (n, i) { var b = el("button", "tab", n); b.type = "button"; b.setAttribute("role", "tab"); b.addEventListener("click", function () { show(i, true); }); old.appendChild(b); });
      main.insertBefore(old, grid);
    }
    made = { grid: grid, panels: panels, tabs: old }; grid.classList.add("pk-sections"); show(Math.min(active, panels.length - 1), false);
  }
  function show(i, byHand) {
    if (!made) return; var prev = active; active = i; try { sessionStorage.setItem(key, String(i)); } catch (e) { /* fine */ }
    var owner = null; Array.prototype.forEach.call(made.grid.children, function (c) { var k = made.panels.indexOf(c); if (k >= 0) owner = k; c.classList.toggle("pk-off", owner !== i); });   // loose blocks follow the panel above them
    Array.prototype.forEach.call(made.tabs.querySelectorAll(".tab"), function (b, k) { b.setAttribute("aria-selected", String(k === i)); });
    ink(made.tabs);
    if (byHand) { made.grid.classList.add("pk-picked"); turnIn(made.panels[i], i - prev); var top = made.tabs.getBoundingClientRect().top; if (top < 40) window.scrollTo({ top: window.scrollY + top - 70, behavior: still ? "auto" : "smooth" }); window.dispatchEvent(new Event("resize")); }
  }

  function syncCockpitButtons() {
    var on = body.classList.contains("pk-all-open");
    var btns = document.querySelectorAll(".pk-cockpit-btn");
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute("aria-pressed", String(on));
      btns[i].textContent = on ? "All Panels: ON" : "All Panels";
    }
  }
  function ensureCockpitBtn(tb) {
    if (!tb || tb.querySelectorAll('.tab, [role="tab"]').length < 2) return;
    var btn = tb.querySelector(".pk-cockpit-btn");
    if (!btn) {
      btn = el("button", "pk-cockpit-btn");
      btn.type = "button";
      if (!document.getElementById("pk-cockpit-btn")) btn.id = "pk-cockpit-btn";
      btn.title = "Toggle simultaneous multi-panel cockpit view";
      btn.addEventListener("click", function () {
        body.classList.toggle("pk-all-open");
        syncCockpitButtons();
        window.dispatchEvent(new Event("resize"));
      });
      tb.appendChild(btn);
    }
    syncCockpitButtons();
  }

  var queued = false;
  function sync() {
    queued = false;
    sections();
    Array.prototype.forEach.call(main.querySelectorAll(".tabs"), function (tb) {
      ensureCockpitBtn(tb);
      ink(tb);
    });
  }
  function later() { if (!queued) { queued = true; requestAnimationFrame(sync); } }
  new MutationObserver(function (list) {
    for (var k = 0; k < list.length; k++) { var m = list[k];
      if (m.type === "attributes" && m.target.classList && m.target.classList.contains("tab") && m.target.getAttribute("aria-selected") === "true" && !m.target.closest(".pk-tabs")) {   // a pillar's own tab changed
        var tabs = m.target.closest(".tabs"), all = tabs ? Array.prototype.slice.call(tabs.querySelectorAll(".tab")) : [], idx = all.indexOf(m.target), id = tabs ? tabs.id || "t" : "t";
        turnIn(document.getElementById(m.target.getAttribute("aria-controls")), idx - (lastIdx[id] || 0)); lastIdx[id] = idx; }
    }
    later();
  }).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-selected"] });
  window.addEventListener("resize", later); window.addEventListener("load", later); if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  sync();

  /* a ripple under the finger */
  if (!still) document.addEventListener("pointerdown", function (e) {
    var t = e.target.closest && e.target.closest(".btn, .tab, .chip, .chord, .compass-step, .pk-core, .pk-cmd-btn"); if (!t) return;
    var r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2, s = el("span", "pk-ripple"); s.style.width = s.style.height = d + "px"; s.style.left = e.clientX - r.left - d / 2 + "px"; s.style.top = e.clientY - r.top - d / 2 + "px";
    t.appendChild(s); setTimeout(function () { s.remove(); }, 620);
  }, { passive: true });

  /* Auto-ignite unlit #field canvases across all 25 pillars with reactive themed presets */
  function igniteAutoField() {
    var cv = document.getElementById("field");
    if (!cv || cv.dataset.lit) return;
    cv.dataset.lit = "auto";
    var ctx = cv.getContext("2d");
    if (!ctx) return;
    var slug = (body.dataset.pillar || "").toLowerCase();
    var mode = ({
      apollo: "orbital", kairos: "orbital", odyssey: "orbital", observatory: "orbital",
      piano: "waves", aether: "waves", sylade: "waves",
      garage: "compass", records: "compass", kin: "compass", polis: "compass",
      bastion: "lattice", privacy: "lattice", argus: "lattice", continuity: "lattice", foundry: "lattice",
      forge: "sparks", hearth: "sparks", money: "sparks", selling: "sparks", games: "sparks", icarus: "sparks"
    })[slug] || "constellation";

    var cs = getComputedStyle(body);
    var c1 = cs.getPropertyValue("--accent").trim() || "#ff9d5c";
    var c2 = cs.getPropertyValue("--accent-2").trim() || "#4de8ff";
    var W = 0, H = 0, dpr = 1, raf = 0, ptr = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };
    var nodes = [];
    for (var i = 0; i < 44; i++) {
      nodes.push({
        x: (i * 0.6180339887) % 1,
        y: ((i * 0.381966 + 0.17) * 1.37) % 1,
        vx: (Math.sin(i * 2.1) * 0.00018),
        vy: (Math.cos(i * 1.7) * 0.00018),
        r: 1.1 + (i % 4) * 0.65,
        p: i * 0.43
      });
    }

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, window.innerWidth);
      H = Math.max(1, window.innerHeight);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }

    function paint(ts) {
      raf = 0;
      var t = (ts || 0) * 0.001;
      ptr.x += (ptr.tx - ptr.x) * 0.06;
      ptr.y += (ptr.ty - ptr.y) * 0.06;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var cx = W * (0.5 + (ptr.x - 0.5) * 0.08), cy = H * (0.34 + (ptr.y - 0.5) * 0.06);
      var rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.62);
      rad.addColorStop(0, c1 + "1a");
      rad.addColorStop(0.45, c2 + "0d");
      rad.addColorStop(1, "transparent");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);

      if (mode === "orbital" || mode === "compass") {
        ctx.save();
        ctx.strokeStyle = c1;
        ctx.globalAlpha = 0.09;
        ctx.lineWidth = 1;
        for (var rIdx = 1; rIdx <= 3; rIdx++) {
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(W, H) * (0.14 * rIdx), 0, Math.PI * 2);
          ctx.stroke();
        }
        if (mode === "compass") {
          for (var a = 0; a < 12; a++) {
            var ang = (a / 12) * Math.PI * 2 + t * 0.04;
            var r0 = Math.min(W, H) * 0.39, r1 = r0 + (a % 3 === 0 ? 14 : 6);
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
            ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
            ctx.stroke();
          }
        }
        ctx.restore();
      } else if (mode === "waves") {
        ctx.save();
        ctx.lineWidth = 1.1;
        for (var w = 0; w < 3; w++) {
          ctx.strokeStyle = w % 2 ? c2 : c1;
          ctx.globalAlpha = 0.11 - w * 0.025;
          ctx.beginPath();
          for (var x = 0; x <= W; x += 24) {
            var y = H * (0.28 + w * 0.14) + Math.sin(x * 0.006 + t * (0.6 + w * 0.2) + ptr.x * 2) * (18 + w * 8);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      /* drift nodes & connect close pairs */
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!still) {
          n.x = (n.x + n.vx + (mode === "sparks" ? 0 : 0) + 1) % 1;
          n.y = (n.y + n.vy + (mode === "sparks" ? -0.00022 : 0) + 1) % 1;
        }
        var nx = n.x * W + (ptr.x - 0.5) * 18 * ((i % 3) + 1) * 0.25;
        var ny = n.y * H + (ptr.y - 0.5) * 18 * ((i % 3) + 1) * 0.25;
        n._px = nx; n._py = ny;
      }

      if (mode === "lattice" || mode === "constellation" || mode === "orbital") {
        ctx.lineWidth = 0.8;
        for (var i = 0; i < nodes.length; i++) {
          var aNode = nodes[i];
          for (var j = i + 1; j < nodes.length; j++) {
            var bNode = nodes[j];
            var dx = aNode._px - bNode._px, dy = aNode._py - bNode._py;
            var d2 = dx * dx + dy * dy;
            if (d2 < 17500) {
              ctx.strokeStyle = (i + j) % 2 ? c2 : c1;
              ctx.globalAlpha = (1 - d2 / 17500) * 0.16;
              ctx.beginPath(); ctx.moveTo(aNode._px, aNode._py); ctx.lineTo(bNode._px, bNode._py); ctx.stroke();
            }
          }
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var nd = nodes[k];
        var pulse = still ? 0.5 : 0.45 + 0.35 * Math.sin(t * 1.4 + nd.p);
        ctx.fillStyle = k % 3 === 0 ? c2 : c1;
        ctx.globalAlpha = 0.24 + pulse * 0.28;
        ctx.beginPath();
        ctx.arc(nd._px, nd._py, nd.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!still && !document.hidden) raf = requestAnimationFrame(paint);
    }

    resize();
    paint(0);
    window.addEventListener("resize", function () { resize(); if (still && !raf) raf = requestAnimationFrame(paint); }, { passive: true });
    document.addEventListener("pointermove", function (e) {
      ptr.tx = e.clientX / Math.max(1, W);
      ptr.ty = e.clientY / Math.max(1, H);
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !still && !raf) raf = requestAnimationFrame(paint);
    });
  }

  if (document.readyState === "complete") setTimeout(igniteAutoField, 30);
  else window.addEventListener("load", function () { setTimeout(igniteAutoField, 30); });

  /* In-pillar Cmd+K / Ctrl+K Command Palette */
  var PAL_ROUTES = [
    { name: "Hub Core · Orrery", sub: "3D live orbital core & cross-pillar telemetry", href: "../../#/", k: "hub core home orrery" },
    { name: "Hub · Money Console", sub: "Payoff timeline & recurring bills", href: "../../#/money", k: "hub money debt payoff" },
    { name: "Hub · Kairos Console", sub: "Schedule & calendar view", href: "../../#/time", k: "hub time kairos schedule" },
    { name: "Hub · Backup Vault", sub: "Export & restore entire ecosystem", href: "../../#/backup", k: "hub backup export json" },
    { name: "Kairos Meridian", sub: "Deadlines, collisions & focus sprint timer", href: "../kairos/", k: "time deadlines schedule pomodoro" },
    { name: "Money · Payoff Simulator", sub: "Consolidation, windfall & hardship simulator", href: "../money/", k: "finance debt apr avalanche snowball" },
    { name: "Apollo Temple", sub: "Biometrics, radar, clinical review & training", href: "../apollo/", k: "health sleep steps weight radar" },
    { name: "Garage", sub: "Maintenance, CA DMV radar & resale dossier", href: "../garage/", k: "car vehicle fuel oil maintenance" },
    { name: "Records · Paper Killer", sub: "Warranties, TK school expiry & serial vault", href: "../records/", k: "documents serial receipt expiry" },
    { name: "Bossa Piano Studio", sub: "16-step comping sequencer, BPM ladder & staff", href: "../piano/", k: "music jazz bossa chords sightread" },
    { name: "Selling Pipeline", sub: "FB Marketplace shipping-only copy & profit ledger", href: "../selling/", k: "sales inventory shipping profit" },
    { name: "Bastion · Mountain Prep", sub: "Big Bear storm & outage readiness", href: "../bastion/", k: "emergency battery mountain prep" },
    { name: "Athenaeum", sub: "Ideas, notes & cross-pillar handoff", href: "../athenaeum/", k: "notes writing ideas handoff" },
    { name: "Forge", sub: "3D & physical fabrication queue", href: "../forge/", k: "print 3d projects hardware" },
    { name: "Foundry", sub: "Software builds, shipped tools & repos", href: "../foundry/", k: "code dev software builds" },
    { name: "Observatory", sub: "Deep reading, study & research", href: "../observatory/", k: "reading books articles study" },
    { name: "Kin", sub: "Family & household moments", href: "../kin/", k: "family sebastian care moments" },
    { name: "Hephaestus Hearth", sub: "11-room build phases, materials & budget", href: "../hearth/", k: "house renovation materials budget" },
    { name: "Aether · Field Lab", sub: "Atmospheric telemetry, solar & air quality", href: "../aether/", k: "weather power solar grid field" },
    { name: "Polis · Civic Watch", sub: "CA state & local legal/civic watchlist", href: "../polis/", k: "policy law ca legislature bills" },
    { name: "Mythos · Lore Studio", sub: "Worldbuilding, entity graph & chapters", href: "../mythos/", k: "story lore graph characters" },
    { name: "Continuity · Sovereign Vault", sub: "AES-256-GCM encrypted emergency continuity box", href: "../continuity/", k: "crypto encrypt vault emergency" },
    { name: "Privacy · CA DROP", sub: "Data broker opt-out & digital footprint audit", href: "../privacy/", k: "privacy delete broker security" },
    { name: "Odyssey · Trips & Away", sub: "Pack lists, itineraries & Away mode", href: "../odyssey/", k: "travel trips away mode" },
    { name: "Ludus Arcade", sub: "Focus warmups & reflex challenges", href: "../games/", k: "games reflex play" },
    { name: "Argus Album", sub: "Visual inspection & gallery archive", href: "../argus/", k: "photos album media archive" },
    { name: "Hermes Post", sub: "Outbound correspondence & follow-up log", href: "../hermes/", k: "mail post messages correspondence" },
    { name: "Icarus Stake", sub: "Risk watchlist & paper journal (read-only)", href: "../icarus/", k: "stocks watchlist paper market" },
    { name: "Sylade · Presence", sub: "Calm attention & mindful stillness", href: "../sylade/", k: "presence breath stillness" }
  ];

  var palBack = null, palInput = null, palList = null, palSel = 0, palItems = [];
  function renderPalette() {
    if (!palList) return;
    var q = (palInput.value || "").trim().toLowerCase();
    palItems = !q ? PAL_ROUTES.slice(0, 10) : PAL_ROUTES.filter(function (r) {
      return (r.name + " " + r.sub + " " + r.k).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);
    if (palSel >= palItems.length) palSel = Math.max(0, palItems.length - 1);
    palList.innerHTML = "";
    if (!palItems.length) {
      palList.appendChild(el("div", "pk-pal-empty", "No matching pillars or consoles"));
      return;
    }
    palItems.forEach(function (item, idx) {
      var btn = el("a", "pk-pal-item" + (idx === palSel ? " active" : ""));
      btn.href = item.href;
      var t = el("b", null, item.name), s = el("span", null, item.sub);
      btn.appendChild(t); btn.appendChild(s);
      btn.addEventListener("mouseenter", function () { palSel = idx; highlightPal(); });
      palList.appendChild(btn);
    });
  }
  function highlightPal() {
    if (!palList) return;
    var els = palList.querySelectorAll(".pk-pal-item");
    for (var i = 0; i < els.length; i++) els[i].classList.toggle("active", i === palSel);
  }
  function openPalette() {
    if (!palBack) {
      palBack = el("div", "pk-palette-back");
      palBack.setAttribute("role", "dialog"); palBack.setAttribute("aria-modal", "true"); palBack.setAttribute("aria-label", "Pillar Command Palette");
      var box = el("div", "pk-palette");
      palInput = document.createElement("input"); palInput.type = "search"; palInput.className = "pk-pal-in"; palInput.placeholder = "Jump to any pillar or Hub console...";
      palList = el("div", "pk-pal-list");
      var hint = el("div", "pk-pal-hint", "Arrows select · Enter jump · Esc close");
      box.appendChild(palInput); box.appendChild(palList); box.appendChild(hint);
      palBack.appendChild(box);
      palBack.addEventListener("click", function (e) { if (e.target === palBack) closePalette(); });
      palInput.addEventListener("input", function () { palSel = 0; renderPalette(); });
      palInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); closePalette(); }
        else if (e.key === "ArrowDown") { e.preventDefault(); palSel = (palSel + 1) % Math.max(1, palItems.length); highlightPal(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); palSel = (palSel - 1 + Math.max(1, palItems.length)) % Math.max(1, palItems.length); highlightPal(); }
        else if (e.key === "Enter" && palItems[palSel]) { e.preventDefault(); window.location.href = palItems[palSel].href; }
      });
      body.appendChild(palBack);
    }
    palBack.hidden = false;
    palSel = 0;
    palInput.value = "";
    renderPalette();
    setTimeout(function () { palInput.focus(); }, 20);
  }
  function closePalette() { if (palBack) palBack.hidden = true; }
  cmdBtn.addEventListener("click", function () { if (palBack && !palBack.hidden) closePalette(); else openPalette(); });
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (palBack && !palBack.hidden) closePalette(); else openPalette();
    } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        e.preventDefault();
        openPalette();
      }
    }
  });
})();
