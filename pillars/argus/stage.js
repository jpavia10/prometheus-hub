/* Argus signature: the hundred eyes. Every picture the pillars hold turning on one ring in depth (Titan's coin photographs as they are
   published, plus what you added here); the nearest one comes forward. With nothing yet, the eye itself, following your finger. */
(function () {
  const I = PK.ink, TITAN = new URLSearchParams(location.search).get("titan") || "https://jpavia10.github.io/titan-reliquary-preview/";
  let pics = [], local = 0, titan = 0, tried = false;
  const add = (src, label) => { const im = new Image(); im.decoding = "async"; im.src = src; pics.push({ im, label }); };
  function load(api) { if (tried) return; tried = true;
    fetch(TITAN + "data/index.json").then((r) => r.ok ? r.json() : null).then((ix) => { if (!ix) return; const list = (ix.flips || []).filter((f) => f.thumb && f.status !== "Removed"); titan = list.length;
      for (const f of list.slice(0, 48)) add(TITAN + f.thumb, `${f.country || ""} ${f.year || ""}`.trim()); api && api.refresh(); }).catch(() => {});
    try { const r = indexedDB.open("prometheus-argus", 1); r.onupgradeneeded = () => r.result.createObjectStore("photos", { keyPath: "id" });
      r.onsuccess = () => { try { const q = r.result.transaction("photos").objectStore("photos").getAll(); q.onsuccess = () => { const all = q.result || []; local = all.length; for (const p of all.slice(0, 24)) if (p.blob) add(URL.createObjectURL(p.blob), p.pillar || ""); api && api.refresh(); }; } catch (e) { /* empty */ } }; } catch (e) { /* no storage */ } }
  const api = PK.stage({
    label: "Every picture the pillars hold, on one turning ring",
    data() { return { n: pics.length, local, titan }; },
    readouts(D) { return [{ v: D.titan || "—", k: "Titan coin photos" }, { v: D.local, k: "Added on this device" }, { v: D.n, k: "On the ring now" }]; },
    draw(g, S, I) {
      const w = S.w, h = S.h, cx = w / 2, cy = h / 2, A = S.accent, B = S.accent2, ready = pics.filter((p) => p.im.complete && p.im.naturalWidth);
      if (!ready.length) {                                                                 // the eye
        const px = S.ptr.on ? S.ptr.x : cx + Math.cos(S.t * 0.7) * 40, py = S.ptr.on ? S.ptr.y : cy + Math.sin(S.t * 0.9) * 16, dx = I.clamp((px - cx) / w, -0.5, 0.5) * 60, dy = I.clamp((py - cy) / h, -0.5, 0.5) * 30, R = Math.min(w, h) * 0.3;
        g.save(); g.beginPath(); g.ellipse(cx, cy, R * 1.6, R * 0.82, 0, 0, Math.PI * 2); g.clip(); I.halo(g, cx, cy, R * 1.8, B, 0.4);
        const iris = g.createRadialGradient(cx + dx, cy + dy, R * 0.12, cx + dx, cy + dy, R * 0.62); iris.addColorStop(0, I.rgba(A, 1)); iris.addColorStop(0.6, I.rgba(B, 0.75)); iris.addColorStop(1, I.rgba(B, 0)); g.fillStyle = iris; g.beginPath(); g.arc(cx + dx, cy + dy, R * 0.62, 0, Math.PI * 2); g.fill();
        for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2; I.line(g, cx + dx + Math.cos(a) * R * 0.2, cy + dy + Math.sin(a) * R * 0.2, cx + dx + Math.cos(a) * R * 0.55, cy + dy + Math.sin(a) * R * 0.55, "#ffffff", 0.8, 0.18); }
        I.dot(g, cx + dx, cy + dy, R * 0.18, "#03040b"); I.dot(g, cx + dx - R * 0.07, cy + dy - R * 0.08, R * 0.05, "#ffffff", 0.9); g.restore();
        g.beginPath(); g.ellipse(cx, cy, R * 1.6, R * 0.82, 0, 0, Math.PI * 2); I.glow(g, A, 14); g.strokeStyle = I.rgba(A, 0.8); g.lineWidth = 1.5; g.stroke(); I.noGlow(g);
        I.text(g, tried ? "No pictures here yet: add one below" : "Opening the album…", cx, h - 16, { size: 10.5, align: "center", color: "#dfe6f5", alpha: 0.8 }); return; }
      const N = Math.min(14, ready.length), R = Math.min(w * 0.4, 300), spin = S.still ? 0.35 : S.t * 0.28, size0 = Math.min(h * 0.5, 120);
      I.halo(g, cx, cy, w * 0.55, A, 0.22); g.beginPath(); g.ellipse(cx, cy + 6, R, R * 0.2, 0, 0, Math.PI * 2); g.strokeStyle = I.rgba(A, 0.25); g.lineWidth = 1; g.stroke();
      const slots = Array.from({ length: N }, (_, i) => { const a = spin + i / N * Math.PI * 2, turn = Math.floor((a + Math.PI) / (Math.PI * 2)), p = ready[(i + turn * N) % ready.length];   // a slot takes the next picture each time it passes behind
        return { p, x: cx + Math.sin(a) * R, y: cy + Math.cos(a) * R * 0.2, z: Math.cos(a) }; }).sort((a, b) => a.z - b.z);
      slots.forEach((it, k) => { const front = k === slots.length - 1, s = 0.38 + 0.62 * (it.z + 1) / 2, size = size0 * s, y = it.y - size * 0.25;
        g.save(); g.globalAlpha = 0.3 + 0.7 * (it.z + 1) / 2; g.beginPath(); g.arc(it.x, y, size / 2, 0, Math.PI * 2); g.clip(); try { g.drawImage(it.p.im, it.x - size / 2, y - size / 2, size, size); } catch (e) { /* not decoded */ } g.restore();
        if (front) { I.glow(g, A, 20); I.arc(g, it.x, y, size / 2 + 3, 0, Math.PI * 2, A, 2, 0.95); I.noGlow(g); I.text(g, I.fit(g, it.p.label, w - 40, 12, 500), cx, h - 16, { size: 12, align: "center" }); } });
    },
  });
  load(api);
})();
