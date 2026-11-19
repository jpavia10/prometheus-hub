/* Garage 3D viewer (Sebastian, 2026-11-14): a hand-rolled canvas 3D engine — zero libraries.
   Perspective projection, painter's-algorithm solid faces, one fixed light with Lambert shading.
   Drag to rotate (pointer events, so touch works); slow auto-rotate when idle.
   Models are built from extruded side-profile prisms, boxes and tubes, in metres, from the real
   factory dimensions: Sorento 4,815 x 1,900 x 1,695 mm (WB 2,815); MT-07 2,085 x 795 x 1,095 mm (WB 1,400).
   window.G3D = { attach(canvas, captionEl), setVehicle(key) } — app.js calls attach() once and
   setVehicle() from paint(), so the viewer always shows the active vehicle. */
(function () {
  "use strict";

  // ---------- small vector helpers ----------
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.round(((n >> 16) & 255) * f)), g = Math.min(255, Math.round(((n >> 8) & 255) * f)), b = Math.min(255, Math.round((n & 255) * f));
    return `rgb(${r},${g},${b})`;
  }

  // ---------- part builders (a part = {verts:[[x,y,z]...], faces:[{v:[idx...], c:hex}]}) ----------
  // Extrude a side profile (x = length, +x front; y = up) between z0..z1.
  function prism(profile, z0, z1, color) {
    const n = profile.length, verts = [];
    for (const p of profile) verts.push([p[0], p[1], z0]);
    for (const p of profile) verts.push([p[0], p[1], z1]);
    const faces = [];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push({ v: [i, j, n + j, n + i], c: color }); }
    faces.push({ v: [...Array(n).keys()].reverse(), c: color });
    faces.push({ v: [...Array(n).keys()].map((i) => i + n), c: color });
    return { verts, faces };
  }
  const box = (cx, cy, cz, sx, sy, sz, color) =>
    prism([[cx - sx / 2, cy - sy / 2], [cx + sx / 2, cy - sy / 2], [cx + sx / 2, cy + sy / 2], [cx - sx / 2, cy + sy / 2]], cz - sz / 2, cz + sz / 2, color);

  // Cylinder between two points (wheels, fork legs, handlebar, exhaust).
  function tube(p1, p2, r, color, seg = 12) {
    const a = norm(sub(p2, p1));
    const ref = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
    const u = norm(cross(a, ref)), w = cross(a, u);
    const verts = [], faces = [];
    for (const p of [p1, p2]) for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2, co = Math.cos(t), si = Math.sin(t);
      verts.push([p[0] + r * (u[0] * co + w[0] * si), p[1] + r * (u[1] * co + w[1] * si), p[2] + r * (u[2] * co + w[2] * si)]);
    }
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; faces.push({ v: [i, j, seg + j, seg + i], c: color }); }
    faces.push({ v: [...Array(seg).keys()].reverse(), c: color });
    faces.push({ v: [...Array(seg).keys()].map((i) => i + seg), c: color });
    return { verts, faces };
  }
  // Wheel: tyre tube + slightly proud hub disc, axle along z.
  function wheel(x, y, zc, r, width, tireC, hubC) {
    return [
      tube([x, y, zc - width / 2], [x, y, zc + width / 2], r, tireC, 16),
      tube([x, y, zc - width / 2 - 0.008], [x, y, zc + width / 2 + 0.008], r * 0.58, hubC, 12),
    ];
  }

  // ---------- 2025 Kia Sorento Hybrid ----------
  function buildSorento() {
    const BODY = "#8fa1b5", GLASS = "#141f2a", CLAD = "#272e36", ROOF = "#a7b4c2", TRIM = "#c7d2dd",
      LIGHT = "#ffe9b0", TAIL = "#a8343e", TIRE = "#121519", HUB = "#97a5b3";
    const parts = [];
    // Lower body: one extruded side profile — nose, hood, beltline, tail.
    parts.push(prism([
      [-2.40, 0.30], [2.30, 0.30], [2.41, 0.52], [2.40, 0.74], [2.05, 0.90], [1.00, 1.00],
      [-0.60, 1.03], [-2.28, 1.05], [-2.41, 0.96], [-2.41, 0.55],
    ], -0.87, 0.87, BODY));
    // Glasshouse: windshield, roof line, backlight — narrower than the body.
    parts.push(prism([
      [0.98, 1.01], [0.30, 1.52], [-0.18, 1.655], [-1.72, 1.655], [-2.05, 1.50], [-2.33, 1.06], [-0.60, 1.04],
    ], -0.79, 0.79, GLASS));
    // Roof cap in body colour over the glass.
    parts.push(prism([[-0.20, 1.655], [0.26, 1.60], [0.10, 1.695], [-1.60, 1.695], [-1.76, 1.655]], -0.81, 0.81, ROOF));
    // Lower cladding band.
    parts.push(prism([[-2.38, 0.16], [2.28, 0.16], [2.36, 0.30], [-2.40, 0.30]], -0.89, 0.89, CLAD));
    // Grille + headlights + tail bar.
    parts.push(box(2.415, 0.66, 0, 0.03, 0.20, 1.30, CLAD));
    parts.push(box(2.40, 0.80, -0.62, 0.05, 0.07, 0.42, LIGHT));
    parts.push(box(2.40, 0.80, 0.62, 0.05, 0.07, 0.42, LIGHT));
    parts.push(box(-2.415, 0.88, 0, 0.03, 0.06, 1.45, TAIL));
    // Mirrors.
    parts.push(box(0.88, 1.16, -0.98, 0.16, 0.09, 0.10, TRIM));
    parts.push(box(0.88, 1.16, 0.98, 0.16, 0.09, 0.10, TRIM));
    // Wheels at the real wheelbase (±1.4075 m), 235/60R18 ≈ 0.74 m diameter.
    for (const sx of [-1.4075, 1.4075]) for (const sz of [-0.83, 0.83]) parts.push(...wheel(sx, 0.37, sz, 0.37, 0.235, TIRE, HUB));
    return { parts, len: 4.815, h: 1.695, caption: "2025 Kia Sorento Hybrid — 4,815 × 1,900 × 1,695 mm · wheelbase 2,815 mm · 1.6L turbo hybrid, 227 hp combined. Drag to rotate." };
  }

  // ---------- 2021 Yamaha MT-07 ----------
  function buildMt07() {
    const BLUE = "#2b5ea7", GRAPH = "#22272d", FRAME = "#77808a", ENG = "#33393f", SEAT = "#0e1013",
      METAL = "#8b939c", TIRE = "#121519", HUB = "#4c545d", LIGHT = "#ffe9b0", TAIL = "#a8343e";
    const parts = [];
    // Wheels at the real wheelbase (±0.70 m): front 120/70-17 (Ø 0.60), rear 180/55-17 (Ø 0.63).
    parts.push(...wheel(0.70, 0.30, 0, 0.30, 0.12, TIRE, HUB));
    parts.push(...wheel(-0.70, 0.315, 0, 0.315, 0.18, TIRE, HUB));
    // Front brake disc.
    parts.push(tube([0.70, 0.30, -0.065], [0.70, 0.30, 0.065], 0.149, METAL, 14));
    // Engine: the CP2 twin is the frame's stressed member — one low central block.
    parts.push(box(0.02, 0.36, 0, 0.52, 0.34, 0.34, ENG));
    // Exposed frame: two side plates from steering head sweeping back over the engine.
    for (const sz of [-0.145, 0.145]) parts.push(prism([[0.50, 0.92], [0.44, 0.66], [0.10, 0.52], [-0.30, 0.50], [-0.34, 0.66], [-0.02, 0.74], [0.34, 0.86]], sz - 0.018, sz + 0.018, FRAME));
    // Fuel tank: sculpted profile prism, Icon Blue.
    parts.push(prism([[0.50, 0.84], [0.34, 0.99], [0.02, 1.045], [-0.26, 0.95], [-0.30, 0.84], [0.05, 0.78], [0.38, 0.76]], -0.165, 0.165, BLUE));
    // Seat + raised tail with tail light.
    parts.push(prism([[-0.26, 0.90], [-0.88, 0.945], [-0.97, 1.00], [-0.90, 1.015], [-0.30, 0.965]], -0.125, 0.125, SEAT));
    parts.push(box(-0.985, 0.985, 0, 0.03, 0.045, 0.13, TAIL));
    // Radiator ahead of the engine.
    parts.push(box(0.335, 0.52, 0, 0.09, 0.30, 0.36, GRAPH));
    // Fork legs (raked tubes) + handlebar at full 795 mm span.
    for (const sz of [-0.055, 0.055]) parts.push(tube([0.70, 0.30, sz], [0.505, 0.97, sz], 0.021, METAL, 8));
    parts.push(tube([0.475, 0.99, 0], [0.475, 1.075, 0], 0.024, ENG, 8));
    parts.push(tube([0.475, 1.075, -0.3975], [0.475, 1.075, 0.3975], 0.016, ENG, 8));
    // Headlight wedge.
    parts.push(prism([[0.60, 0.80], [0.545, 0.97], [0.475, 0.95], [0.50, 0.79]], -0.085, 0.085, GRAPH));
    parts.push(box(0.585, 0.885, 0, 0.035, 0.07, 0.13, LIGHT));
    // Swingarm pair + low 2-into-1 exhaust on the right, muffler at the rear.
    for (const sz of [-0.085, 0.085]) parts.push(box(-0.44, 0.335, sz, 0.56, 0.055, 0.035, FRAME));
    parts.push(tube([0.22, 0.24, 0.19], [-0.28, 0.22, 0.21], 0.032, METAL, 8));
    parts.push(box(-0.48, 0.235, 0.215, 0.34, 0.10, 0.09, METAL));
    // Front fender: three angled slabs over the front wheel.
    parts.push(box(0.775, 0.575, 0, 0.20, 0.02, 0.17, GRAPH));
    parts.push(box(0.635, 0.60, 0, 0.17, 0.02, 0.17, GRAPH));
    parts.push(box(0.885, 0.475, 0, 0.16, 0.02, 0.17, GRAPH));
    return { parts, len: 2.085, h: 1.095, caption: "2021 Yamaha MT-07 — 2,085 × 795 × 1,095 mm · wheelbase 1,400 mm · 689cc CP2 twin, 72.4 hp (54 kW). Drag to rotate." };
  }

  const MODELS = { sorento: buildSorento, mt07: buildMt07 };

  // ---------- viewer ----------
  let canvas = null, capEl = null, ctx = null, model = null, raf = 0;
  let yaw = -0.65, pitch = 0.34, dragging = false, idleFor = 99, lastT = 0, lastX = 0, lastY = 0;

  function render(now) {
    raf = requestAnimationFrame(render);
    if (!ctx || !model) return;
    const dt = Math.min(0.05, (now - lastT) / 1000 || 0); lastT = now;
    if (!dragging) { idleFor += dt; if (idleFor > 2.5) yaw += dt * 0.25; }
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;
    // Backdrop: soft vertical gradient + ground shadow ellipse.
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "rgba(16,22,34,0.25)"); bg.addColorStop(1, "rgba(5,8,14,0.55)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const f = W * 1.15, s = (W * 0.40) / (model.len / 2);
    const cx = W / 2, gy = H * 0.86; // ground line
    const proj = (v) => {
      const x1 = v[0] * cy - v[2] * sy, z1 = v[0] * sy + v[2] * cy;
      const y2 = v[1] * cp - z1 * sp, z2 = v[1] * sp + z1 * cp;
      const k = f / (f + z2 * s);
      return [cx + x1 * s * k, gy - y2 * s * k, z2];
    };
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(cx, gy + H * 0.015, W * 0.36, H * 0.035, 0, 0, Math.PI * 2); ctx.fill();

    const L = norm([-0.35, 0.8, 0.55]); // direction to the light, view space
    const faces = [];
    for (const part of model.parts) {
      const pv = part.verts.map(proj);
      for (const fc of part.faces) {
        const pts = fc.v.map((i) => pv[i]);
        let nx = 0, ny = 0, nz = 0, depth = 0;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
          depth += a[2];
        }
        const nl = Math.hypot(nx, ny, nz) || 1;
        const lam = Math.max(0, dot([nx / nl, ny / nl, nz / nl], L));
        faces.push({ pts, depth: depth / pts.length, c: fc.c, lam });
      }
    }
    faces.sort((a, b) => b.depth - a.depth); // farthest first; nearer faces paint over
    for (const fc of faces) {
      ctx.beginPath();
      fc.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.closePath();
      ctx.fillStyle = shade(fc.c, 0.34 + 0.66 * fc.lam);
      ctx.fill();
    }
  }

  function fit() {
    if (!canvas) return;
    const w = canvas.clientWidth || 600, dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(w * 0.46 * dpr);
  }

  function attach(cv, cap) {
    canvas = cv; capEl = cap || null; ctx = canvas.getContext("2d");
    fit(); window.addEventListener("resize", fit);
    canvas.addEventListener("pointerdown", (e) => { dragging = true; idleFor = 0; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.008; pitch += (e.clientY - lastY) * 0.005;
      pitch = Math.max(-0.15, Math.min(1.15, pitch));
      lastX = e.clientX; lastY = e.clientY;
    });
    const end = () => { dragging = false; idleFor = 0; };
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    if (!model) setVehicle("sorento");
    cancelAnimationFrame(raf); lastT = 0; raf = requestAnimationFrame(render);
  }

  function setVehicle(key) {
    const build = MODELS[key] || MODELS.sorento;
    model = build();
    if (capEl) capEl.textContent = model.caption;
  }

  window.G3D = { attach, setVehicle };
})();
