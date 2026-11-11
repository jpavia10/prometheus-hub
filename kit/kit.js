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

  function toast(msg, ms = 2200) {
    const t = h("div.toast", { role: "status", text: msg });
    document.body.append(t);
    setTimeout(() => t.remove(), ms);
  }

  /** Per-pillar storage: lists of records with ids, kept in localStorage, exportable as one JSON file. */
  function store(pillar) {
    const key = (k) => `prometheus.${pillar}.${k}`;
    const read = (k, dflt) => { try { const v = localStorage.getItem(key(k)); return v == null ? dflt : JSON.parse(v); } catch (_) { return dflt; } };
    const write = (k, v) => { try { localStorage.setItem(key(k), JSON.stringify(v)); return true; } catch (_) { toast("This browser would not save. Export your data."); return false; } };
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
    btns.forEach((b) => b.addEventListener("click", () => show(b)));
    let first = btns[0]; try { first = document.getElementById(localStorage.getItem(id)) || first; } catch (_) {}
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
})();
