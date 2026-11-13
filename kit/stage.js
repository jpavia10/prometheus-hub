/* Stage (2026-11-13): the engine under each pillar's signature instrument, the live picture at the top of the page. The engine is
   shared (canvas at device sharpness, one animation loop that stops off screen and in a background tab, reduced motion = still
   frames, redraw the moment the pillar saves); the picture is the pillar's own (pillars/<id>/stage.js). Data comes only from the
   pillar's own records and the reference data it already ships; nothing here writes anything.
   PK.stage({ label, height: [phone, desktop], data(), draw(g, S), readouts(d) -> [{ v, k, tone? }], tap?(x, y, S), init?(S) })
   PK.ink: drawing helpers. */
(function () {
  "use strict";
  const PK = window.PK; if (!PK) return;
  const STILL = matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]still=1\b/.test(location.search);
  const css = (n, f) => (getComputedStyle(document.body).getPropertyValue(n) || "").trim() || f;
  const hex = (c) => { c = String(c || "#ffffff").replace("#", ""); if (c.length === 3) c = c.split("").map((x) => x + x).join(""); const n = parseInt(c.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgba = (c, a) => { const [r, g, b] = Array.isArray(c) ? c : hex(c); return `rgba(${r},${g},${b},${a == null ? 1 : a})`; };
  const mix = (a, b, t) => { const A = Array.isArray(a) ? a : hex(a), B = Array.isArray(b) ? b : hex(b); return [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t)); };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const ink = {
    rgba, mix, hex, clamp, lerp, ease,
    glow(g, color, blur) { g.shadowColor = color; g.shadowBlur = blur; },
    noGlow(g) { g.shadowBlur = 0; g.shadowColor = "transparent"; },
    dot(g, x, y, r, color, a = 1) { g.beginPath(); g.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2); g.fillStyle = rgba(color, a); g.fill(); },
    halo(g, x, y, r, color, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(color, a)); gr.addColorStop(0.35, rgba(color, a * 0.35)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); },
    line(g, x1, y1, x2, y2, color, w = 1, a = 1) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = rgba(color, a); g.lineWidth = w; g.stroke(); },
    arc(g, x, y, r, a0, a1, color, w = 2, a = 1) { g.beginPath(); g.arc(x, y, r, a0, a1); g.strokeStyle = rgba(color, a); g.lineWidth = w; g.stroke(); },
    text(g, s, x, y, o = {}) { g.font = `${o.weight || 500} ${o.size || 11}px ${o.font || "Outfit, system-ui, sans-serif"}`; g.textAlign = o.align || "left"; g.textBaseline = o.base || "middle"; g.fillStyle = rgba(o.color || "#ffffff", o.alpha == null ? 1 : o.alpha); if (o.spacing && "letterSpacing" in g) g.letterSpacing = o.spacing + "px"; g.fillText(String(s), x, y); if ("letterSpacing" in g) g.letterSpacing = "0px"; },
    fit(g, s, max, size, weight) { g.font = `${weight || 500} ${size}px Outfit, system-ui, sans-serif`; s = String(s); if (g.measureText(s).width <= max) return s; while (s.length > 2 && g.measureText(s + "…").width > max) s = s.slice(0, -1); return s.trimEnd() + "…"; },
    rand(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; },
    days(a, b) { return Math.round((new Date(String(b).slice(0, 10) + "T12:00:00") - new Date(String(a).slice(0, 10) + "T12:00:00")) / 864e5); },
    today() { const q = new URLSearchParams(location.search).get("today"); return /^\d{4}-\d{2}-\d{2}$/.test(q || "") ? q : PK.day(); },
  };

  function stage(o) {
    const shell = document.querySelector(".shell"), hero = shell && shell.querySelector(".hero"), main = document.getElementById("app");
    if (!shell || !main || document.documentElement.classList.contains("is-embed")) return null;
    const canvas = PK.h("canvas", { "aria-hidden": "true" }), layer = PK.h("div.pk-stage-layer"), reads = PK.h("div.pk-stage-reads", { role: "group", "aria-label": o.label || "At a glance" });
    const sec = PK.h("section.pk-stage", { "aria-label": o.label || "At a glance" }, PK.h("div.pk-stage-frame", null, canvas, layer), reads);
    (hero && hero.nextSibling ? shell.insertBefore(sec, hero.nextSibling) : shell.insertBefore(sec, main));
    const g = canvas.getContext("2d"), S = { w: 1, h: 1, dpr: 1, t: 0, dt: 0, still: STILL, ptr: { x: -1, y: -1, on: false, down: false }, layer, canvas, data: null, accent: css("--accent", "#7fd1ff"), accent2: css("--accent-2", "#b9a2ff"), tick: 0 };
    let raf = 0, last = 0, seen = true, dirty = true;
    const size = () => { const r = canvas.getBoundingClientRect(); S.w = Math.max(1, r.width); S.h = Math.max(1, r.height); S.dpr = Math.min(2, window.devicePixelRatio || 1); const w = Math.round(S.w * S.dpr), h = Math.round(S.h * S.dpr); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } dirty = true; };
    const frame = () => { g.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); g.clearRect(0, 0, S.w, S.h); if (S.data != null) try { o.draw(g, S, ink); } catch (e) { console.error("[stage]", e); } ink.noGlow(g); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; dirty = false; };
    const loop = (t) => { raf = requestAnimationFrame(loop); if (!seen || document.hidden) { last = t; return; } S.dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; S.t += S.dt; S.tick++; if (!STILL || dirty) frame(); };
    let shown = [];
    const paintReads = () => { let list = []; try { list = (S.data != null && o.readouts && o.readouts(S.data, S)) || []; } catch (e) { console.error("[stage readouts]", e); } const same = list.length === shown.length && list.every((r, i) => shown[i] && shown[i].v === r.v && shown[i].k === r.k);
      if (same) return; shown = list; reads.replaceChildren(...list.map((r) => PK.h("div.pk-read" + (r.tone ? "." + r.tone : ""), null, PK.h("b", null, String(r.v)), PK.h("span", null, r.k)))); };
    const refresh = () => { try { S.data = o.data ? o.data(S) : null; } catch (e) { console.error("[stage data]", e); S.data = null; } paintReads(); dirty = true; if (STILL) frame(); };
    const at = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    canvas.addEventListener("pointermove", (e) => { [S.ptr.x, S.ptr.y] = at(e); S.ptr.on = true; if (STILL) frame(); });
    canvas.addEventListener("pointerleave", () => { S.ptr.on = false; S.ptr.down = false; });
    canvas.addEventListener("pointerdown", (e) => { [S.ptr.x, S.ptr.y] = at(e); S.ptr.on = true; S.ptr.down = true; if (o.press) o.press(S.ptr.x, S.ptr.y, S); });
    canvas.addEventListener("pointerup", (e) => { S.ptr.down = false; const [x, y] = at(e); if (o.tap) { o.tap(x, y, S); refresh(); } });
    if (o.tap || o.press) { canvas.removeAttribute("aria-hidden"); canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", o.label || "Signature view"); canvas.style.cursor = "pointer"; }
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; }, { rootMargin: "60px" }).observe(sec);
    window.addEventListener("resize", () => { size(); if (STILL) frame(); });
    window.addEventListener("pk:store", refresh); window.addEventListener("storage", refresh); window.addEventListener("focus", refresh);
    size(); if (o.init) o.init(S, ink); refresh(); if (STILL) { S.t = 2.4; frame(); } raf = requestAnimationFrame(loop);
    const api = { S, refresh, frame: () => frame(), section: sec };
    (window.__stage = window.__stage || []).push(api);
    return api;
  }
  PK.stage = stage; PK.ink = ink;
})();
