/* Kin · the family tree in 3D: the scene, the camera, the people, and everything a tap opens.
   Modes: Roots (the tree in time), Places (the globe), Records (every document), Research (what is proven, what is open).
   window.KIN3D is the handle the proofs use (proofs/run.py, KIN-3D). Method: pillars/kin/docs/LINEAGE_METHOD.md;
   design: pillars/kin/docs/LINEAGE_3D.md. */
import * as THREE from "three";
import { L, build, pathTo, completeness, STATUS, TYPE, KIND, INFO, EV, esc, nm, firstName, known, initials, yOf, yearOf, NOW, RS } from "./core.js";
import { ribbons, ribbonUniforms, bridge, ring, medallion, haloTexture, sky, dust, surface, shafts, hexRGB } from "./gfx.js";

const PK = window.PK;
const DOCS = "../lineage/docs/";
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1); /* "Left Europe" -> "left Europe" */
const phone = () => innerWidth < 760;
const LOW = (navigator.hardwareConcurrency || 8) <= 4 || /Android [4-8]\b/.test(navigator.userAgent);
const S = PK.store("kin");
const SRC = Object.fromEntries(L.sources.map((s) => [s.id, s]));
const PLC = Object.fromEntries(L.places.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ renderer */
const cv = $("#tv-gl");
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
const DPR = Math.min(devicePixelRatio || 1, LOW ? 1.5 : 2);
renderer.setPixelRatio(DPR);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2400);
const U = ribbonUniforms(DPR);
const skyMesh = sky(); scene.add(skyMesh);

let T = null, world = null, R = null, motes = null, plane = null, beams = null;
const labels = $(".tv-labels");
const state = { mode: "roots", sel: null, path: new Set(), selT: 0, grow: RM ? 99 : 0, introAt: 0, intro: !RM, cards: [], frames: 0, year: NOW, timeOn: false, playing: false, viewer: null, globe: null };

/* ------------------------------------------------------------------ the world, built from the model (rebuilt when you name someone) */
function makeWorld() {
  if (world) { scene.remove(world); world.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map && o.material.map !== haloTexture()) o.material.map.dispose(); o.material.dispose(); } }); }
  labels.innerHTML = "";
  T = build();
  world = new THREE.Group(); scene.add(world);
  const lines = [];
  const col = (n) => hexRGB((STATUS[n.status] || STATUS.possible).c);
  for (const n of T.nodes) {
    const pts = []; for (let i = 0; i <= 16; i++) pts.push(new THREE.Vector3(n.x, yOf(n.by + ((n.dy - n.by) * i) / 16), n.z));
    lines.push({ pts, col: col(n), a: n.ghost ? 0.36 : 0.85, kind: 0, w: n.id === L.root ? 3.2 : 2.5, g: n.gen != null ? n.gen : (T.byId[n.rel && n.rel.of] || {}).gen || 1, life: [n.by, n.dy], fe: n.dq === "estimate", id: n.id });
  }
  for (const lk of T.links) {
    const c = T.byId[lk.child], q = T.byId[lk.parent];
    const yy = clamp(c.y, q.y, yOf(q.dy)), A = new THREE.Vector3(c.x, c.y, c.z), B = new THREE.Vector3(q.x, yy, q.z);
    const mix = col(q).map((v, i) => v * 0.65 + col(c)[i] * 0.35);
    lines.push({ pts: bridge(A, B, 0.35 + A.distanceTo(B) * 0.08), col: mix, a: q.ghost ? 0.45 : lk.cert != null ? 0.3 + 0.7 * (lk.cert / 100) : 0.8, kind: lk.unsure || q.ghost ? 2 : 1, w: 3.1, g: c.gen != null ? c.gen : 1, life: [c.by, c.by], child: c.id, parent: q.id, unsure: lk.unsure });
  }
  for (const id of T.stubs) {
    const n = T.byId[id], k = (n.r + RS * 0.85) / Math.max(n.r, 0.01);
    lines.push({ pts: [new THREE.Vector3(n.x, n.y, n.z), new THREE.Vector3(n.x * k, n.y - 4.2, n.z * k)], col: hexRGB("#7d8db3"), a: 0.55, kind: 4, w: 1.6, g: n.gen, id: "stub:" + id, of: id });
  }
  const yLow = yearOf(T.yMin);
  state.strata = [];
  for (let y = 2000; y >= yLow - 25; y -= 50) {
    const rr = clamp(((NOW - y) / 27) * RS + 5, 8, T.rMax + 6);
    lines.push({ pts: ring(rr, yOf(y), 160), col: hexRGB("#9db4dc"), a: y % 100 ? 0.12 : 0.2, kind: 3, w: 1.15, g: 0 });
    state.strata.push({ y, rr });
  }
  R = ribbons(lines, U);
  world.add(R.mesh);

  /* people: a medallion (portrait or monogram) and a halo, with an HTML label for crisp type */
  const halo = haloTexture();
  for (const n of T.nodes) {
    const st = STATUS[n.status] || STATUS.possible;
    const face = T.faceOf(n.id);
    const mat = new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, depthWrite: false, alphaTest: 0.02 });
    const spr = new THREE.Sprite(mat); spr.position.set(n.x, n.y, n.z); spr.scale.setScalar(n.size); spr.renderOrder = 3;
    const paint = (img) => { const t = medallion(n, { color: st.c, ghost: n.ghost, self: n.id === L.root, proven: n.status === "proven", text: n.id === L.root ? "You" : initials(n.p), face: img }); if (mat.map) mat.map.dispose(); mat.map = t; mat.needsUpdate = true; };
    paint(null);
    if (face) { const im = new Image(); im.onload = () => paint(im); im.src = DOCS + face + ".webp"; }
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: new THREE.Color(st.c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: n.ghost ? 0.22 : 0.62 }));
    h.position.copy(spr.position); h.scale.setScalar(n.size * 3.1); h.renderOrder = 1;
    world.add(spr); world.add(h);
    n.spr = spr; n.halo = h; n.v = spr.position;
    const el = document.createElement("div");
    el.className = `tv-lbl s-${n.status}${n.ghost ? " ghost" : ""}${n.id === L.root ? " me" : ""}`;
    el.innerHTML = `<b>${esc(n.id === L.root ? nm(n.p) || "You" : known(n.p) ? nm(n.p) : n.p.placeholder || "Not yet known")}</b><span>${esc(n.id === L.root ? "you" : lifeText(n))}</span>`;
    labels.appendChild(el); n.el = el; n.lw = 0;
  }
  plane = surface(T.rMax + 12, RS); world.add(plane);
  state.yearPlane = surface(T.rMax + 6, RS, 1); state.yearPlane.visible = false; world.add(state.yearPlane);
  beams = shafts(T.yMin); world.add(beams);
  motes = dust(LOW ? 700 : 1600, T.rMax + 18, T.yMin); world.add(motes);
  for (const s of state.strata) {
    const el = document.createElement("div"); el.className = "tv-era"; el.textContent = s.y; labels.appendChild(el); s.el = el;
  }
  const now = document.createElement("div"); now.className = "tv-era now"; now.textContent = "Today"; labels.appendChild(now); state.nowEl = now;
  state.yearRing = null;
  stats();
}

function lifeText(n) {
  if (n.id === L.root) return "";
  if (!known(n.p)) return "not yet known";
  const b = n.bq === "estimate" ? `c. ${Math.round(n.by / 5) * 5}` : n.bq === "tree" ? `${n.by}` : `${n.by}`;
  const d = n.dq === "living" ? "" : n.dq === "estimate" ? "?" : `${n.dy}`;
  return n.p.living ? `born ${b}` : `${b}–${d}`;
}

/* ------------------------------------------------------------------ the camera: orbit, pinch, travel through time, fly to a person */
const cam = { tx: 0, ty: -14, tz: 0, th: Math.PI / 2, ph: 1.08, d: 90 };
const want = { ...cam };
let fly = null;
function flyTo(to, dur = 1.25) {
  const from = { ...cam }, tgt = { ...cam, ...to };
  while (tgt.th - from.th > Math.PI) tgt.th -= Math.PI * 2;
  while (from.th - tgt.th > Math.PI) tgt.th += Math.PI * 2;
  if (RM) { Object.assign(cam, tgt); Object.assign(want, tgt); fly = null; return; }
  fly = { from, to: tgt, t0: performance.now(), dur: dur * 1000 };
}
function overview(th = Math.PI / 2, ph = innerWidth < innerHeight ? 0.84 : 1.04) {
  /* the closest camera that keeps everyone between the header and the time bar */
  const c = new THREE.PerspectiveCamera(camera.fov, innerWidth / Math.max(1, innerHeight), 0.1, 2400), W = innerWidth, H = innerHeight;
  const top = 108 / H, bot = 1 - 150 / H, pts = T.nodes.map((n) => new THREE.Vector3(n.x, n.y, n.z)), v = new THREE.Vector3();
  let ty = T.yMin * 0.48, d = 80;
  for (let pass = 0; pass < 3; pass++) {
    let lo = 15, hi = 600;
    const box = (dd) => { const sp = Math.sin(ph); c.position.set(dd * sp * Math.cos(th), ty + dd * Math.cos(ph), dd * sp * Math.sin(th)); c.lookAt(0, ty, 0); c.updateMatrixWorld(); let x0 = 1, x1 = 0, y0 = 1, y1 = 0; for (const p of pts) { v.copy(p).project(c); const x = v.x * 0.5 + 0.5, y = -v.y * 0.5 + 0.5; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x0, x1, y0, y1 }; };
    for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2, b = box(m); if (b.x0 > 10 / W && b.x1 < 1 - 10 / W && b.y0 > top && b.y1 < bot) hi = m; else lo = m; }
    d = hi; const b = box(d), want = (top + bot) / 2, have = (b.y0 + b.y1) / 2;
    ty -= (have - want) * 2 * d * Math.tan((camera.fov * Math.PI) / 360) * 0.9;
  }
  return { tx: 0, ty, tz: 0, ph, th, d };
}
function placeCamera() {
  const sp = Math.sin(cam.ph);
  camera.position.set(cam.tx + cam.d * sp * Math.cos(cam.th), cam.ty + cam.d * Math.cos(cam.ph), cam.tz + cam.d * sp * Math.sin(cam.th));
  camera.lookAt(cam.tx, cam.ty, cam.tz);
}
function stepCamera(now) {
  if (fly) {
    const t = clamp((now - fly.t0) / fly.dur, 0, 1), e = ease(t);
    for (const k of Object.keys(fly.to)) cam[k] = fly.from[k] + (fly.to[k] - fly.from[k]) * e;
    if (t >= 1) { fly = null; Object.assign(want, cam); }
  } else {
    for (const k of Object.keys(cam)) cam[k] += (want[k] - cam[k]) * 0.14;
  }
  placeCamera();
}

/* input on the canvas */
const ptr = new Map();
let gest = null, idleAt = performance.now(), vel = { th: 0, ph: 0 };
cv.addEventListener("pointerdown", (e) => {
  cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (state.intro) skipIntro();
  if (ptr.size === 1) gest = { x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false };
  else if (gest) gest.moved = true;
  fly = null; Object.assign(want, cam); vel = { th: 0, ph: 0 }; idleAt = performance.now();
});
cv.addEventListener("pointermove", (e) => {
  const p = ptr.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  if (ptr.size === 1) {
    if (gest && Math.hypot(e.clientX - gest.x0, e.clientY - gest.y0) > 7) gest.moved = true;
    if (!gest || gest.moved) {
      if (state.mode === "places") globeDrag(dx, dy);
      else { want.th += dx * 0.0058; want.ph = clamp(want.ph - dy * 0.0042, 0.16, 1.64); vel = { th: dx * 0.0058, ph: -dy * 0.0042 }; }
    }
  } else if (ptr.size === 2) {
    const [a, b] = [...ptr.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y);
    p.x = e.clientX; p.y = e.clientY;
    const [c, d] = [...ptr.values()], d1 = Math.hypot(c.x - d.x, c.y - d.y);
    if (state.mode === "places") globeZoom(d0 / Math.max(1, d1));
    else { want.d = clamp(want.d * (d0 / Math.max(1, d1)), 5, 300); want.ty = clamp(want.ty + dy * 0.035 * (want.d / 40), T.yMin - 8, 8); want.th += dx * 0.003; }
    idleAt = performance.now(); return;
  }
  p.x = e.clientX; p.y = e.clientY; idleAt = performance.now();
});
const up = (e) => {
  const had = ptr.has(e.pointerId); ptr.delete(e.pointerId);
  if (!had) return;
  if (ptr.size === 0 && gest && !gest.moved && performance.now() - gest.t0 < 500) tapAt(e.clientX, e.clientY);
  if (ptr.size === 0) { gest = null; if (state.mode !== "places") { want.th += vel.th * 6; want.ph = clamp(want.ph + vel.ph * 6, 0.16, 1.64); } }
};
cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
cv.addEventListener("wheel", (e) => {
  e.preventDefault(); idleAt = performance.now(); fly = null;
  if (state.mode === "places") return globeZoom(Math.exp(e.deltaY * 0.0012));
  if (e.shiftKey) want.ty = clamp(want.ty - e.deltaY * 0.04, T.yMin - 8, 8);
  else want.d = clamp(want.d * Math.exp(e.deltaY * 0.0012), 5, 300);
}, { passive: false });
addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea")) return;
  if (e.key === "Escape") { if (state.viewer) return closeViewer(); if (!$("#tv-find").hidden) return closeFind(); if (state.sel) return deselect(); }
  if (state.viewer) { if (e.key === "ArrowRight") viewerStep(1); if (e.key === "ArrowLeft") viewerStep(-1); return; }
  if (state.mode !== "roots") return;
  const k = { ArrowLeft: () => (want.th -= 0.12), ArrowRight: () => (want.th += 0.12), ArrowUp: () => (want.ty = clamp(want.ty + 2, T.yMin - 8, 8)), ArrowDown: () => (want.ty = clamp(want.ty - 2, T.yMin - 8, 8)), "+": () => (want.d *= 0.85), "=": () => (want.d *= 0.85), "-": () => (want.d /= 0.85) }[e.key];
  if (k) { k(); fly = null; idleAt = performance.now(); }
});

/* ------------------------------------------------------------------ projecting people to the screen: labels and taps */
const v3 = new THREE.Vector3();
function project() {
  const W = innerWidth, H = innerHeight, f = H / 2 / Math.tan((camera.fov * Math.PI) / 360);
  for (const n of T.nodes) {
    v3.copy(n.v).project(camera);
    const dist = camera.position.distanceTo(n.v);
    n.sx = (v3.x * 0.5 + 0.5) * W; n.sy = (-v3.y * 0.5 + 0.5) * H; n.sr = ((Math.max(n.spr.scale.x, n.size) / 2) * f) / dist; n.dist = dist;
    n.on = v3.z < 1 && n.sx > -60 && n.sx < W + 60 && n.sy > -60 && n.sy < H + 60;
  }
}
function placeLabels() {
  const H = innerHeight, top = 70, bot = H - bottomInset();
  const order = T.nodes.filter((n) => n.on && n.grown).sort((a, b) => prio(b) - prio(a));
  const taken = [];
  for (const n of T.nodes) n.show = false;
  for (const n of order) {
    const must = n.id === state.sel || (n.id === L.root && !state.sel);
    if (!must && state.sel && !state.path.has(n.id) && !near(n.id) && n.sr < 15) continue;
    if (!must && state.timeOn && (!n.alive || n.ghost)) continue;
    if (!must && order.some((m) => m !== n && m.dist < n.dist - 0.5 && m.sr > 5 && Math.hypot(m.sx - n.sx, m.sy - n.sy) < m.sr + 6)) continue; /* its own medallion is behind a nearer one */
    if (!must && n.sr < (state.sel ? 9 : state.timeOn ? 3.5 : n.gen != null && n.gen <= 2 ? 5.5 : 8)) continue;
    if (!n.lw) { n.lw = n.el.offsetWidth || 120; n.lh = n.el.offsetHeight || 34; }
    const x = n.sx - n.lw / 2, y = n.sy + n.sr + 3, r = { x, y, w: n.lw, h: n.lh };
    if (y < top || y > bot - 10) continue;
    if (!must && taken.some((q) => !(r.x + r.w < q.x || q.x + q.w < r.x || r.y + r.h < q.y || q.y + q.h < r.y))) continue;
    if (order.some((m) => m !== n && m.dist < n.dist && m.sr > 6 && m.sx + m.sr > r.x && m.sx - m.sr < r.x + r.w && m.sy + m.sr > r.y && m.sy - m.sr < r.y + r.h)) continue; /* a nearer medallion covers where the label would go */
    taken.push(r); n.show = true;
    n.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
  }
  for (const n of T.nodes) {
    const vis = n.show && state.mode === "roots";
    if (vis !== n.elVis) { n.el.classList.toggle("on", vis); n.elVis = vis; }
    if (vis) n.el.classList.toggle("dim", state.sel && !state.path.has(n.id) && !near(n.id));
  }
  /* the era marks ride on the side of each ring nearest the camera's right */
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
  for (const s of state.strata) {
    v3.copy(right).multiplyScalar(s.rr).setY(yOf(s.y)).project(camera);
    const x = (v3.x * 0.5 + 0.5) * innerWidth, y = (-v3.y * 0.5 + 0.5) * H, ok = v3.z < 1 && y > top && y < bot && x < innerWidth - 10 && state.mode === "roots";
    s.el.classList.toggle("on", ok); if (ok) s.el.style.transform = `translate3d(${Math.min(x + 6, innerWidth - 52).toFixed(1)}px,${(y - 9).toFixed(1)}px,0)`;
  }
  v3.copy(right).multiplyScalar(T.rMax + 8).setY(0).project(camera);
  const nx = (v3.x * 0.5 + 0.5) * innerWidth, ny = (-v3.y * 0.5 + 0.5) * H, nok = v3.z < 1 && ny > top && ny < bot && state.mode === "roots";
  state.nowEl.classList.toggle("on", nok); if (nok) state.nowEl.style.transform = `translate3d(${Math.min(nx, innerWidth - 60).toFixed(1)}px,${(ny - 9).toFixed(1)}px,0)`;
}
const prio = (n) => (n.id === state.sel ? 1e6 : 0) + (state.path.has(n.id) ? 1e5 : 0) + (n.id === L.root ? 5e4 : 0) + (state.timeOn && n.alive ? 2e4 : 0) + (n.status === "proven" ? 30 : 0) + (n.ghost ? -50 : 0) + n.sr;
const near = (id) => { if (!state.sel) return false; const s = state.sel; return T.parents(s).includes(id) || T.children(s).includes(id) || T.spouses(s).includes(id); };
const bottomInset = () => { const sh = $("#tv-dossier"); const r = sh && !sh.hidden ? sh.getBoundingClientRect() : null; return Math.max(132, r && phone() ? innerHeight - r.top + 6 : 132); };

function tapAt(x, y) {
  if (state.mode === "places") return globeTap(x, y);
  if (state.mode !== "roots") return;
  for (const c of state.cards) { /* a document floating by the chosen person */
    v3.copy(c.mesh.position).project(camera);
    const sx = (v3.x * 0.5 + 0.5) * innerWidth, sy = (-v3.y * 0.5 + 0.5) * innerHeight, half = (c.mesh.scale.y * (innerHeight / 2 / Math.tan((camera.fov * Math.PI) / 360))) / camera.position.distanceTo(c.mesh.position) / 2;
    if (Math.abs(x - sx) < half * 0.8 + 8 && Math.abs(y - sy) < half + 8) return c.more ? openDossierAt("media") : openViewer(T.media(state.sel), c.i);
  }
  let best = null, bd = 1e9;
  for (const n of T.nodes) { if (!n.on || !n.grown) continue; const d = Math.hypot(n.sx - x, n.sy - y); if (d < Math.max(n.sr, 10) + 14 && d - n.sr * 0.3 < bd) { bd = d - n.sr * 0.3; best = n; } }
  if (best) select(best.id); else if (state.sel) deselect();
}

/* ------------------------------------------------------------------ choosing a person */
function select(id, o = {}) {
  const n = T.byId[id]; if (!n) return;
  state.sel = id; state.path = pathTo(T, id); state.selT = performance.now();
  const relSet = new Set([id, ...T.parents(id), ...T.children(id), ...T.spouses(id)]);
  R.setHi((l) => {
    if (l.kind === 0) return state.path.has(l.id) || relSet.has(l.id) ? 1 : 0;
    if (l.kind === 1 || l.kind === 2) return (state.path.has(l.child) && state.path.has(l.parent)) || l.child === id || l.parent === id ? 1 : 0;
    if (l.kind === 4) return state.path.has(l.of) ? 1 : 0;
    return 0;
  });
  for (const m of T.nodes) { const lit = state.path.has(m.id) || relSet.has(m.id); m.spr.material.color.setScalar(lit ? 1 : 0.32); m.halo.material.opacity = (m.ghost ? 0.22 : 0.62) * (lit ? 1 : 0.25); }
  if (o.fly !== false) focusOn(n);
  cards(n);
  if (o.open !== false) dossier(id);
  try { history.replaceState(null, "", "#" + id); } catch (_) { /* file:// */ }
}
function focusOn(n) {
  const d = phone() ? 21 : 17, th = n.r > 0.5 ? n.th : cam.th;
  flyTo({ tx: n.x, ty: n.y - 0.4, tz: n.z, th, ph: 1.02, d }, 1.35);
}
function deselect() {
  state.sel = null; state.path = new Set();
  R.setHi(() => 0);
  for (const m of T.nodes) { m.spr.material.color.setScalar(1); m.halo.material.opacity = m.ghost ? 0.22 : 0.62; }
  cards(null); closeDossier();
  try { history.replaceState(null, "", location.pathname + location.search); } catch (_) { /* file:// */ }
}

/* the chosen person's records, floating beside them as cards */
const texCache = new Map();
function cardTexture(img, more) {
  const key = more ? "more:" + more : img;
  if (texCache.has(key)) return Promise.resolve(texCache.get(key));
  return new Promise((res) => {
    const make = (im) => {
      const W = 240, H = 300, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
      x.fillStyle = "#efe6d2"; x.fillRect(0, 0, W, H);
      if (im) { const s = Math.max((W - 20) / im.width, (H - 20) / im.height), w = im.width * s, h = im.height * s; x.save(); x.beginPath(); x.rect(10, 10, W - 20, H - 20); x.clip(); x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); x.restore(); }
      else { x.fillStyle = "#1b2540"; x.fillRect(10, 10, W - 20, H - 20); x.fillStyle = "#f2cf7e"; x.font = '600 64px "Cormorant Garamond", serif'; x.textAlign = "center"; x.fillText("+" + more, W / 2, H / 2 + 10); x.font = '500 22px "Outfit", sans-serif'; x.fillStyle = "#cfd8ea"; x.fillText("more records", W / 2, H / 2 + 46); }
      x.strokeStyle = "rgba(0,0,0,.25)"; x.lineWidth = 2; x.strokeRect(10, 10, W - 20, H - 20);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; texCache.set(key, t); res(t);
    };
    if (more) return make(null);
    const im = new Image(); im.onload = () => make(im); im.onerror = () => res(null); im.src = DOCS + "t/" + img + ".webp";
  });
}
function cards(n) {
  for (const c of state.cards) { world.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh.material.dispose(); }
  state.cards = [];
  if (!n) return;
  const media = T.media(n.id), max = phone() ? 5 : 7, show = media.slice(0, media.length > max ? max - 1 : max);
  const items = show.map((m, i) => ({ img: m.img, i })); if (media.length > show.length) items.push({ more: media.length - show.length, i: show.length });
  const k = items.length, sel = n.id;
  items.forEach((it, j) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    mesh.renderOrder = 5; mesh.scale.setScalar(0.001);
    const a = k === 1 ? Math.PI / 2 : Math.PI * (0.86 - (0.72 * j) / (k - 1));
    const c = { mesh, a, j, i: it.i, more: it.more, born: performance.now() + j * 90 };
    state.cards.push(c); world.add(mesh);
    cardTexture(it.img, it.more).then((t) => { if (!t || state.sel !== sel) return; mesh.material.map = t; mesh.material.needsUpdate = true; });
  });
}
function stepCards(now) {
  if (!state.cards.length || !state.sel) return;
  const n = T.byId[state.sel]; if (!n || n.sx == null) return;
  /* a hand of cards fanned out just under the person's name, sized in screen pixels so they read at any distance */
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), upv = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const f = innerHeight / 2 / Math.tan((camera.fov * Math.PI) / 360), unit = camera.position.distanceTo(n.v) / f;
  const k = state.cards.length, cw = phone() ? 62 : 84, ch = cw * 1.25, gap = phone() ? 8 : 12, mid = (k - 1) / 2;
  const top = Math.max(n.sr, 8) + (n.lh || 34) + 10;
  for (const c of state.cards) {
    const t = clamp((now - c.born) / 650, 0, 1), e = ease(t), o = c.j - mid, bob = Math.sin(now / 900 + c.j) * 2;
    const dx = o * (cw + gap) * (0.6 + 0.4 * e), dy = top + ch / 2 + o * o * 3 + bob + (1 - e) * 18;
    c.mesh.position.copy(n.v).addScaledVector(right, dx * unit).addScaledVector(upv, -dy * unit);
    c.mesh.quaternion.copy(camera.quaternion); c.mesh.rotateZ(-o * 0.07 * e);
    c.mesh.scale.setScalar(Math.max(0.001, ch * unit * (0.7 + 0.3 * e)));
    c.mesh.material.opacity = e * (c.mesh.material.map ? 1 : 0);
  }
}

/* ------------------------------------------------------------------ the dossier: everything known about a person, and how */
const sheet = $("#tv-dossier"), sin = $(".tv-sheet-in", sheet);
function chipsFor(a) { const s = SRC[a.src] || {}; return `<span class="tv-chip k-${s.kind}">${KIND[s.kind] || "?"}</span><span class="tv-chip i-${a.info}">${INFO[a.info] || "?"}</span><span class="tv-chip e-${a.ev}">${EV[a.ev] || "?"}</span>`; }
function famChip(id) { const n = T.byId[id]; if (!n) return ""; return `<button type="button" class="tv-pchip s-${n.status}" data-go="${id}"><i></i>${esc(id === L.root ? "You" : known(n.p) ? nm(n.p) : n.p.placeholder)}<small>${esc(lifeText(n))}</small></button>`; }
function dossier(id) {
  const n = T.byId[id], p = n.p, st = STATUS[n.status] || STATUS.possible;
  const ev = L.events.filter((e) => e.who.includes(id)).sort((a, b) => (a.date.sort || "").localeCompare(b.date.sort || ""));
  const media = T.media(id), face = T.faceOf(id);
  const names = (p.names || []).filter((x) => x.given || x.surname);
  const cons = L.conflicts.filter((c) => c.person === id || ev.some((e) => e.conflict === c.id));
  const qs = L.questions.filter((q) => q.person === id);
  const gps = (L.gps || {})[id];
  const par = T.parents(id), sp = T.spouses(id), ch = T.children(id), sib = T.siblings(id);
  const unsure = T.unsure(id) ? `<p class="tv-unsure">Not settled: ${esc(Object.values((T.M.families.find((f) => f.children.includes(id)) || {}).uncertain || {})[0] || "")}</p>` : "";
  /* a line to you that runs through a link not yet settled says so where the relationship is named */
  const via = [...pathTo(T, id)].filter((x) => x !== id && T.unsure(x) && T.parents(x).some((q) => pathTo(T, id).has(q)));
  const relNote = via.length ? `<p class="tv-relnote">Through ${esc(via.map((x) => firstName(T.byId[x].p)).join(" and "))}, a link not yet settled: ${esc(Object.values((T.M.families.find((f) => f.children.includes(via[0])) || {}).uncertain || {})[0] || "not yet settled")}</p>` : "";
  sin.innerHTML = `
    <header class="tv-dh">
      <div class="tv-face s-${n.status}${n.ghost ? " ghost" : ""}">${face ? `<img src="${DOCS + face}.webp" alt="">` : `<span>${esc(n.id === L.root ? "You" : initials(p))}</span>`}</div>
      <div><p class="tv-rel">${esc(T.rel(id))}</p><h2>${esc(n.id === L.root ? nm(p) || "You" : known(p) ? nm(p) : p.placeholder)}</h2>
      ${relNote}<p class="tv-life">${esc(lifeLine(n))}</p>${n.cert ? `<p class="tv-cert" title="${esc(n.cert.basis)}"><i style="--p:${n.cert.pct}%"></i>${n.cert.pct}% sure of ${n.id === L.root ? "this" : "the link to " + (n.p.sex === "F" ? "her" : "his") + " parents"}${n.cert.gemini || n.cert.muse ? ` <small>(${[n.cert.gemini ? "Gemini: " + n.cert.gemini + "%" : "", n.cert.muse ? "Muse: " + n.cert.muse + "%" : ""].filter(Boolean).join(", ")})</small>` : ""}</p>` : ""}<span class="tv-st s-${n.status}">${esc(st.t)}</span></div>
      <button type="button" class="tv-x" data-close aria-label="Close">×</button>
    </header>
    ${p.summary ? `<p class="tv-sum">${esc(p.summary)}</p>` : ""}${p.note ? `<p class="tv-note">${esc(p.note)}</p>` : ""}
    ${n.ghost ? ghostHtml(n) : ""}
    ${media.length ? `<section class="tv-sec" id="tv-media"><h3>Records and pictures <small>${media.length}</small></h3><div class="tv-strip">${media.map((m, i) => `<button type="button" class="tv-doc" data-doc="${i}" aria-label="${esc(m.cap || "record")}"><img loading="lazy" src="${DOCS}t/${m.img}.webp" alt=""><span>${esc(((SRC[m.src] || {}).year || "") + "")}</span></button>`).join("")}</div></section>` : ""}
    ${names.length > 1 ? `<section class="tv-sec"><h3>Names in the records</h3><ul class="tv-names">${names.map((x) => `<li><b>${esc(`${x.given || ""} ${x.surname || ""}`.trim())}</b> <small>${esc(x.type || "")}${x.note ? " · " + esc(x.note) : ""}</small></li>`).join("")}</ul></section>` : ""}
    ${ev.length ? `<section class="tv-sec"><h3>Life, from the records</h3><ol class="tv-life-ev">${ev.map((e) => `<li class="c-${e.confidence || "possible"}"><details><summary><time>${esc(e.date.text || "")}</time><b>${esc(TYPE[e.type] || e.type)}</b>${e.place && PLC[e.place] ? `<span>${esc(PLC[e.place].name)}</span>` : ""}</summary>
      <p>${esc(e.conclusion || "")}</p>${(e.assert || []).map((a) => `<div class="tv-as"><p>“${esc(a.value)}”</p><p class="tv-src">${esc((SRC[a.src] || {}).short || a.src)}${a.note ? " · " + esc(a.note) : ""}</p><p>${chipsFor(a)}</p></div>`).join("")}</details></li>`).join("")}</ol></section>` : ""}
    <section class="tv-sec"><h3>Family</h3>${unsure}<div class="tv-fam">
      ${par.length ? `<p>Parents</p><div>${par.map(famChip).join("")}</div>` : ""}${sp.length ? `<p>Partners</p><div>${sp.map(famChip).join("")}</div>` : ""}
      ${ch.length ? `<p>Children</p><div>${ch.map(famChip).join("")}</div>` : ""}${sib.length ? `<p>Brothers and sisters</p><div>${sib.map(famChip).join("")}</div>` : ""}</div></section>
    ${cons.length ? `<section class="tv-sec"><h3>Where the evidence disagrees</h3>${cons.map((c) => `<details class="tv-con s-${c.status}"><summary><b>${esc(c.q)}</b><span>${esc(c.status)}: ${esc(c.conclusion)}</span></summary><p>${esc(c.argument)}</p></details>`).join("")}</section>` : ""}
    ${qs.length ? `<section class="tv-sec"><h3>Still open</h3><ul class="tv-qs">${qs.map((q) => `<li class="${q.task === "owner" ? "own" : ""}">${q.task === "owner" ? "<b>For you</b> " : ""}${esc(q.q)}</li>`).join("")}</ul></section>` : ""}
    ${gps ? `<section class="tv-sec"><h3>Proof standard</h3><dl class="tv-gps">${[["search", "Search"], ["cite", "Citations"], ["analysis", "Analysis"], ["conflicts", "Conflicts"], ["written", "Written up"]].map(([k, t]) => `<dt>${t}</dt><dd>${esc(gps[k] || "")}</dd>`).join("")}</dl></section>` : ""}
    <p class="tv-foot"><button type="button" class="tv-btn" data-places>See ${n.id === L.root ? "your" : "their"} places</button> <a class="tv-btn quiet" href="../#ln-tree">Plain tree</a></p>`;
  sheet.hidden = false; sheet.dataset.who = id; document.body.classList.add("has-sheet");
  requestAnimationFrame(() => sheet.classList.add("on"));
  sheet.classList.toggle("full", !phone());
  sin.scrollTop = 0;
}
function lifeLine(n) {
  if (n.id === L.root) return "The centre of the tree.";
  if (!known(n.p)) return "No record names this person yet.";
  const birth = L.events.find((e) => e.who.includes(n.id) && e.type === "birth"), death = L.events.find((e) => e.who.includes(n.id) && e.type === "death");
  const b = birth ? `${birth.date.text}${birth.place && PLC[birth.place] ? ", " + PLC[birth.place].name : ""}` : n.bq === "tree" ? `${n.by} (compiled trees)` : `about ${n.by} (estimate)`;
  const d = n.p.living ? "" : death ? ` – ${death.date.text}${death.place && PLC[death.place] ? ", " + PLC[death.place].name : ""}` : n.dq === "tree" ? ` – ${n.dy}` : "";
  return b + d;
}
function ghostHtml(n) {
  const p = n.p;
  return `<section class="tv-sec tv-ghost"><h3>What can be said already</h3><ul>${(p.infer || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${p.hint ? `<p class="tv-note">${esc(p.hint)}</p>` : ""}
    <form class="tv-name" data-id="${esc(n.id)}"><p>Do you know ${esc(p.placeholder ? p.placeholder.toLowerCase() : "them")}? Name them here; it stays on this device and goes into the GEDCOM export.</p>
    <label>Given names <input name="given" autocomplete="off"></label><label>Surname <input name="surname" autocomplete="off"></label><label>Born (year) <input name="born" inputmode="numeric" autocomplete="off"></label>
    <button class="tv-btn" type="submit">Save</button></form></section>`;
}
function closeDossier() { sheet.classList.remove("on"); document.body.classList.remove("has-sheet"); setTimeout(() => { if (!sheet.classList.contains("on")) sheet.hidden = true; }, 360); }
function openDossierAt(sec) { if (!state.sel) return; sheet.classList.add("full"); const el = $("#tv-" + sec, sheet); if (el) el.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); }
sheet.addEventListener("click", (e) => {
  const b = e.target.closest("[data-go],[data-doc],[data-close],[data-places]"); if (!b) return;
  if (b.dataset.go) { setMode("roots"); select(b.dataset.go); }
  else if (b.dataset.doc != null) openViewer(T.media(state.sel), +b.dataset.doc);
  else if (b.hasAttribute("data-close")) deselect();
  else if (b.hasAttribute("data-places")) setMode("places");
});
sheet.addEventListener("submit", (e) => {
  const f = e.target.closest("form.tv-name"); if (!f) return; e.preventDefault();
  const id = f.dataset.id, d = Object.fromEntries(new FormData(f));
  if (!d.given && !d.surname) return PK.toast("Write a given name or a surname first.");
  const loc = Object.assign({ names: {}, people: [], families: [], links: [] }, S.get("lineage", {}) || {});
  loc.names[id] = { given: d.given.trim(), surname: d.surname.trim(), born: d.born.trim() }; S.set("lineage", loc);
  PK.toast("Saved on this device."); const keep = id; makeWorld(); state.grow = 99; select(keep, { fly: false });
});
/* the sheet on a phone: a peek you can pull up to read in full */
(() => {
  const grip = $(".tv-grip", sheet); let y0 = null;
  grip.addEventListener("click", () => sheet.classList.toggle("full"));
  grip.addEventListener("pointerdown", (e) => { y0 = e.clientY; grip.setPointerCapture(e.pointerId); });
  grip.addEventListener("pointerup", (e) => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; if (dy < -30) sheet.classList.add("full"); else if (dy > 30) { if (sheet.classList.contains("full")) sheet.classList.remove("full"); else deselect(); } });
})();

/* ------------------------------------------------------------------ the document viewer: pinch, pan, read the transcription */
const vw = $("#tv-viewer");
function openViewer(list, i) {
  if (!list || !list.length) return;
  state.viewer = { list, i: clamp(i, 0, list.length - 1), s: 1, x: 0, y: 0 };
  vw.hidden = false; requestAnimationFrame(() => vw.classList.add("on"));
  showDoc();
}
function showDoc() {
  const V = state.viewer, m = V.list[V.i], s = SRC[m.src] || {};
  const people = L.events.filter((e) => (e.assert || []).some((a) => a.src === m.src)).flatMap((e) => e.who).filter((v, k, a) => a.indexOf(v) === k && T.byId[v]);
  $(".tv-vimg", vw).innerHTML = `<img src="${DOCS + m.img}.webp" alt="${esc(s.short || "record")}" draggable="false">`;
  $(".tv-vcap", vw).innerHTML = `<p class="tv-vk">${esc(s.year || "")} · ${esc(KIND[s.kind] || "Record")}${V.list.length > 1 ? ` · ${V.i + 1} of ${V.list.length}` : ""}</p><h3>${esc(m.cap || s.short || "")}</h3>
    ${s.read ? `<details open><summary>What it says</summary><p>${esc(s.read)}</p></details>` : ""}${s.cite ? `<details><summary>Citation</summary><p>${esc(s.cite)}</p>${s.url ? `<p><a href="${esc(s.url)}" target="_blank" rel="noopener">Open the source</a></p>` : ""}</details>` : ""}
    ${people.length ? `<div class="tv-vp">${people.slice(0, 6).map(famChip).join("")}</div>` : ""}`;
  V.s = 1; V.x = 0; V.y = 0; applyDoc();
  $(".tv-vprev", vw).hidden = V.list.length < 2; $(".tv-vnext", vw).hidden = V.list.length < 2;
}
function applyDoc() { const V = state.viewer, im = $(".tv-vimg img", vw); if (im) im.style.transform = `translate(${V.x}px,${V.y}px) scale(${V.s})`; }
function viewerStep(k) { const V = state.viewer; if (!V) return; V.i = (V.i + k + V.list.length) % V.list.length; showDoc(); }
function closeViewer() { vw.classList.remove("on"); state.viewer = null; setTimeout(() => { if (!state.viewer) vw.hidden = true; }, 300); }
vw.addEventListener("click", (e) => {
  const b = e.target.closest("[data-vclose],.tv-vprev,.tv-vnext,[data-go]"); if (!b) return;
  if (b.dataset.go) { closeViewer(); setMode("roots"); select(b.dataset.go); return; }
  if (b.hasAttribute("data-vclose")) closeViewer(); else viewerStep(b.classList.contains("tv-vnext") ? 1 : -1);
});
(() => {
  const box = $(".tv-vimg", vw), P = new Map(); let last = 0;
  box.addEventListener("pointerdown", (e) => { box.setPointerCapture(e.pointerId); P.set(e.pointerId, { x: e.clientX, y: e.clientY }); const t = performance.now(); if (P.size === 1 && t - last < 300) { const V = state.viewer; V.s = V.s > 1.2 ? 1 : 2.6; if (V.s === 1) V.x = V.y = 0; applyDoc(); } last = t; });
  box.addEventListener("pointermove", (e) => {
    const p = P.get(e.pointerId), V = state.viewer; if (!p || !V) return;
    if (P.size === 1) { V.x += e.clientX - p.x; V.y += e.clientY - p.y; }
    else { const [a, b] = [...P.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y); p.x = e.clientX; p.y = e.clientY; const [c, d] = [...P.values()]; V.s = clamp(V.s * (Math.hypot(c.x - d.x, c.y - d.y) / Math.max(1, d0)), 1, 6); applyDoc(); return; }
    p.x = e.clientX; p.y = e.clientY; applyDoc();
  });
  const end = (e) => { P.delete(e.pointerId); const V = state.viewer; if (V && V.s <= 1.02 && P.size === 0) { if (Math.abs(V.x) > 70) { viewerStep(V.x < 0 ? 1 : -1); return; } V.x = V.y = 0; applyDoc(); } };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  box.addEventListener("wheel", (e) => { e.preventDefault(); const V = state.viewer; if (!V) return; V.s = clamp(V.s * Math.exp(-e.deltaY * 0.0015), 1, 6); if (V.s === 1) V.x = V.y = 0; applyDoc(); }, { passive: false });
})();

/* ------------------------------------------------------------------ time: scrub or play through the centuries */
const track = $(".tv-track"), thumb = $(".tv-thumb"), yout = $(".tv-year"), cap = $(".tv-cap");
let Y0 = 1700;
function timeRange() { Y0 = Math.floor((yearOf(T.yMin) - 5) / 50) * 50; $(".tv-eras").innerHTML = [...Array(Math.floor((2000 - Y0) / 50) + 1)].map((_, i) => { const y = Y0 + i * 50; return `<i style="left:${((y - Y0) / (NOW - Y0)) * 100}%"><span>${y % 100 === 0 ? y : ""}</span></i>`; }).join(""); track.setAttribute("aria-valuemin", Y0); track.setAttribute("aria-valuemax", NOW); }
function setYear(y, follow = true) {
  y = clamp(Math.round(y), Y0, NOW); state.year = y; state.timeOn = true;
  U.uYear.value = y; U.uTimeOn.value = 1;
  thumb.style.left = `${((y - Y0) / (NOW - Y0)) * 100}%`; yout.textContent = y; track.setAttribute("aria-valuenow", y);
  document.body.classList.add("timing");
  if (follow && state.mode === "roots") { const first = !state.timeCam; state.timeCam = true; fly = null; want.ty = clamp(yOf(y) - 3, T.yMin - 6, 4); if (first && !state.sel) { want.tx = 0; want.tz = 0; want.d = overview().d * 0.55; want.ph = innerWidth < innerHeight ? 0.82 : 1.0; } }
  if (state.mode === "places" && state.globe) state.globe.U.uYear.value = y, state.globe.U.uTimeOn.value = 1;
  for (const n of T.nodes) { const on = n.by <= y && y <= n.dy; n.alive = on; if (!state.sel) n.spr.material.color.setScalar(on ? 1 : 0.38); }
  caption(y);
}
function caption(y) {
  const hits = L.events.filter((e) => e.date && e.date.sort && +e.date.sort.slice(0, 4) === y && e.who.some((w) => T.byId[w]));
  const ctx = (L.context || []).filter((c) => +c.date.slice(0, 4) === y).sort((a, b) => (b.w || 0) - (a.w || 0));   /* the family's own regions first (kit/history.js) */
  const born = T.nodes.filter((n) => n.by === y && n.bq !== "estimate" && known(n.p) && !hits.some((e) => e.type === "birth" && e.who.includes(n.id)));
  const rows = hits.slice(0, 3).map((e) => `<li><b>${esc(e.who.map((w) => (T.byId[w] ? firstName(T.byId[w].p) : "")).filter(Boolean).join(" & "))}</b> ${esc(lc(TYPE[e.type] || e.type))}${e.place && PLC[e.place] ? `, ${esc(PLC[e.place].name)}` : ""} <time>${esc(e.date.text)}</time></li>`)
    .concat(born.slice(0, 2).map((n) => `<li><b>${esc(firstName(n.p))}</b> born <time>${n.by}</time></li>`))
    .concat(ctx.slice(0, 1).map((c) => `<li class="ctx">${esc(c.text)}</li>`));
  const alive = T.nodes.filter((n) => n.alive && known(n.p) && n.id !== L.root).length;
  cap.innerHTML = `<p><b>${y}</b> · ${alive} of the family alive${rows.length ? "" : ""}</p>${rows.length ? `<ul>${rows.join("")}</ul>` : ""}<button type="button" class="tv-x" data-timeoff aria-label="Back to today">×</button>`;
  cap.hidden = false;
}
function timeOff() {
  state.timeOn = false; state.timeCam = false; state.playing = false; U.uTimeOn.value = 0; if (state.globe) state.globe.U.uTimeOn.value = 0;
  cap.hidden = true; document.body.classList.remove("timing"); $("#tv-play").classList.remove("on"); $("#tv-play").setAttribute("aria-label", "Play through time");
  thumb.style.left = "100%"; yout.textContent = "Today";
  if (!state.sel) for (const n of T.nodes) n.spr.material.color.setScalar(1);
}
cap.addEventListener("click", (e) => { if (e.target.closest("[data-timeoff]")) timeOff(); });
(() => {
  let on = false;
  const at = (e) => { const r = track.getBoundingClientRect(); return Y0 + clamp((e.clientX - r.left) / r.width, 0, 1) * (NOW - Y0); };
  track.addEventListener("pointerdown", (e) => { on = true; track.setPointerCapture(e.pointerId); state.playing = false; $("#tv-play").classList.remove("on"); setYear(at(e)); });
  track.addEventListener("pointermove", (e) => { if (on) setYear(at(e)); });
  track.addEventListener("pointerup", () => (on = false));
  track.addEventListener("keydown", (e) => { const k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key]; if (k) { e.preventDefault(); setYear((state.timeOn ? state.year : NOW) + k); } if (e.key === "Home") setYear(Y0); if (e.key === "End") timeOff(); });
  $("#tv-play").addEventListener("click", () => {
    if (state.playing) { state.playing = false; $("#tv-play").classList.remove("on"); $("#tv-play").setAttribute("aria-label", "Play through time"); return; }
    if (!state.timeOn || state.year >= NOW - 1) setYear(Y0);
    state.playing = true; state.playT = performance.now(); state.playY = state.year; $("#tv-play").classList.add("on"); $("#tv-play").setAttribute("aria-label", "Pause");
  });
  yout.addEventListener("click", timeOff);
})();

/* ------------------------------------------------------------------ modes */
let globeMod = null;
async function setMode(m) {
  if (m === state.mode && m !== "places") return;
  state.mode = m; document.body.dataset.mode = m; $(".tv-glabels").hidden = m !== "places";
  for (const b of $$(".tv-tabs button")) { const on = b.dataset.m === m; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); }
  $("#tv-records").hidden = m !== "records"; $("#tv-research").hidden = m !== "research";
  $(".tv-placecard").hidden = true;
  if (m === "records") records();
  if (m === "research") research();
  if (m === "places") {
    if (!globeMod) globeMod = await import("./globe.js");
    if (!state.globe) { state.globe = globeMod.makeGlobe(T, DPR, LOW); state.globe.U.uRes.value.set(innerWidth * DPR, innerHeight * DPR); state.gcam = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 500); buildPlaceLabels(); }
    focusPlaces(state.sel);
  }
  if (m !== "roots" && m !== "places") closeDossier(); else if (state.sel && m === "roots") dossier(state.sel);
  if (m === "places") closeDossier();
}
for (const b of $$(".tv-tabs button")) b.addEventListener("click", () => setMode(b.dataset.m));

/* Places: turning the globe, its labels, a tap on a place */
const gv = { lat: 44, lon: -40, d: 34, tlat: 44, tlon: -40, td: 34 };
function globeDrag(dx, dy) { const k = 0.25 * (gv.d / 34); gv.tlon -= dx * k; gv.tlat = clamp(gv.tlat + dy * k, -70, 75); }
function globeZoom(f) { gv.td = clamp(gv.td * f, 13.5, 70); }
function focusPlaces(id) {
  const G = state.globe;
  const evs = id ? L.events.filter((e) => e.who.includes(id) && e.place && PLC[e.place] && PLC[e.place].lat != null) : [];
  const pls = (evs.length ? evs.map((e) => PLC[e.place]) : L.places.filter((p) => p.lat != null));
  const c = globeMod.centreOf(pls);
  gv.tlat = clamp(c.lat, -60, 70); gv.tlon = c.lon; gv.td = clamp(16 + c.spread * 38, 16, 46);
  if (G.R) G.R.setHi((l) => (id && l.who === id ? 1 : 0));
  G.U.uSel.value = id && G.lines.some((l) => l.who === id) ? 1 : 0;
  $(".tv-gnote").innerHTML = id && T.byId[id] ? `<b>${esc(known(T.byId[id].p) ? nm(T.byId[id].p) : "")}</b> ${evs.length ? `· ${new Set(evs.map((e) => e.place)).size} places in the records` : "· no place in the records yet"} <button type="button" class="tv-x" data-gall aria-label="Show everyone">×</button>` : `Every place in the records · <span class="k-pat">your father's side</span> · <span class="k-mat">your mother's side</span>`;
}
$(".tv-gnote").addEventListener("click", (e) => { if (e.target.closest("[data-gall]")) focusPlaces(null); });
function buildPlaceLabels() {
  const box = $(".tv-glabels"); box.innerHTML = "";
  for (const p of state.globe.pins) { const el = document.createElement("div"); el.className = "tv-glbl"; el.textContent = p.pl.name; box.appendChild(el); p.el = el; p.w = 0; }
}
const gq = new THREE.Quaternion();
function stepGlobe() {
  const G = state.globe;
  gv.lat += (gv.tlat - gv.lat) * 0.1; gv.lon += (gv.tlon - gv.lon) * 0.1; gv.d += (gv.td - gv.d) * 0.1;
  if (!ptr.size && performance.now() - idleAt > 7000 && !RM) gv.tlon += 0.02;
  G.spin.rotation.set((gv.lat * Math.PI) / 180, (-gv.lon * Math.PI) / 180, 0, "XYZ");
  const c = state.gcam; c.aspect = innerWidth / innerHeight; c.position.set(0, phone() ? -2.2 : 0, gv.d); c.lookAt(0, phone() ? -2.2 : 0, 0); c.updateProjectionMatrix();
  G.scene.updateMatrixWorld();
  /* labels for places facing us */
  const taken = [], W = innerWidth, H = innerHeight;
  const order = G.pins.map((p) => { const w = p.v.clone().applyMatrix4(G.spin.matrixWorld); const facing = w.clone().normalize().dot(c.position.clone().sub(w).normalize()); return { p, w, facing }; }).sort((a, b) => b.p.ev.length - a.p.ev.length);
  for (const o of order) {
    const p = o.p; let show = false;
    if (o.facing > 0.18) {
      v3.copy(o.w).project(c); p.sx = (v3.x * 0.5 + 0.5) * W; p.sy = (-v3.y * 0.5 + 0.5) * H;
      if (!p.w) p.w = p.el.offsetWidth || 90;
      const r = { x: p.sx + 8, y: p.sy - 9, w: p.w, h: 18 }; if (r.x + r.w > W - 6) r.x = p.sx - 8 - r.w;
      if (r.y > 74 && r.y < H - 150 && !taken.some((q) => !(r.x + r.w < q.x || q.x + q.w < r.x || r.y + r.h < q.y || q.y + q.h < r.y))) { taken.push(r); show = true; p.el.style.transform = `translate3d(${r.x.toFixed(1)}px,${r.y.toFixed(1)}px,0)`; }
    }
    p.front = o.facing > 0.05;
    if (show !== p.vis) { p.el.classList.toggle("on", show); p.vis = show; }
  }
}
function globeTap(x, y) {
  const G = state.globe; let best = null, bd = 30;
  for (const p of G.pins) { if (!p.front || p.sx == null) continue; const d = Math.hypot(p.sx - x, p.sy - y); if (d < bd) { bd = d; best = p; } }
  const box = $(".tv-placecard");
  if (!best) { box.hidden = true; return; }
  box.innerHTML = `<header><div><p class="tv-rel">${esc(best.pl.hist || "")}</p><h3>${esc(best.pl.name)}</h3></div><button type="button" class="tv-x" data-pclose aria-label="Close">×</button></header>
    <ol>${best.ev.map((e) => `<li><time>${esc(e.date.text)}</time> <b>${esc(TYPE[e.type] || e.type)}</b> ${e.who.filter((w) => T.byId[w]).map((w) => `<button type="button" class="tv-plink" data-go="${w}">${esc(known(T.byId[w].p) ? nm(T.byId[w].p) : "")}</button>`).join(", ")}</li>`).join("")}</ol>`;
  box.hidden = false;
}
$(".tv-placecard").addEventListener("click", (e) => { const b = e.target.closest("[data-go],[data-pclose]"); if (!b) return; if (b.dataset.go) { setMode("roots"); select(b.dataset.go); } else $(".tv-placecard").hidden = true; });

/* Records: every document and picture, in date order, as a turning gallery */
function allRecords() {
  const out = [];
  for (const s of L.sources) for (const im of s.img || []) out.push({ img: im, src: s.id, cap: s.short, year: s.year || null });
  for (const m of L.media || []) if (!out.some((o) => o.img === m.img)) out.push({ img: m.img, src: m.src, cap: m.caption, year: (SRC[m.src] || {}).year });
  return out.sort((a, b) => (a.year || 9999) - (b.year || 9999));
}
function records() {
  const list = allRecords(), box = $("#tv-records .tv-rail");
  $("#tv-records .tv-rcount").textContent = `${list.length} images from ${new Set(list.map((r) => r.src)).size} sources`;
  if (box.dataset.n === String(list.length)) return;
  box.dataset.n = list.length;
  box.innerHTML = list.map((r, i) => `<button type="button" class="tv-rec" data-i="${i}"><span class="tv-rimg"><img loading="lazy" src="${DOCS}t/${r.img}.webp" alt=""></span><span class="tv-ry">${esc(r.year || "undated")}</span><b>${esc(r.cap || "")}</b><small>${esc(KIND[(SRC[r.src] || {}).kind] || "")}</small></button>`).join("");
  const turn = () => { const c = box.scrollLeft + box.clientWidth / 2; for (const el of box.children) { const m = el.offsetLeft + el.offsetWidth / 2, k = clamp((m - c) / (el.offsetWidth * 1.4), -2.2, 2.2); el.style.transform = `perspective(900px) rotateY(${(-k * 24).toFixed(1)}deg) translateZ(${(-Math.abs(k) * 70).toFixed(0)}px) scale(${(1 - Math.min(1, Math.abs(k)) * 0.12).toFixed(3)})`; el.style.opacity = (1 - Math.min(1, Math.abs(k) / 2.2) * 0.55).toFixed(2); } };
  box.addEventListener("scroll", () => requestAnimationFrame(turn), { passive: true }); requestAnimationFrame(turn);
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".tv-rec"); if (!b) return;
    const c = box.scrollLeft + box.clientWidth / 2, m = b.offsetLeft + b.offsetWidth / 2;
    if (Math.abs(m - c) > b.offsetWidth * 0.6) return box.scrollTo({ left: m - box.clientWidth / 2, behavior: RM ? "auto" : "smooth" });
    openViewer(list, +b.dataset.i);
  });
}

/* Research: the state of the proof, what is open, what only you can answer */
function research() {
  const box = $("#tv-research .tv-rin"), people = T.nodes.filter((n) => known(n.p) && n.id !== L.root);
  const cnt = (s) => people.filter((n) => n.status === s).length;
  const comp = completeness(T), open = L.conflicts.filter((c) => c.status === "open"), own = L.questions.filter((q) => q.task === "owner");
  box.innerHTML = `
    <div class="tv-kpis"><div><b>${people.length}</b><span>people named</span></div><div><b>${cnt("proven")}</b><span>proven</span></div><div><b>${cnt("probable")}</b><span>probable</span></div><div><b>${L.sources.length}</b><span>sources</span></div><div><b>${open.length}</b><span>open conflicts</span></div></div>
    <section class="tv-sec"><h3>How far back the names go</h3><div class="tv-comp">${comp.map((r) => `<div><span>${["", "Parents", "Grandparents", "Great-grandparents", "2× great", "3× great", "4× great", "5× great"][r.g]}</span><i><em style="width:${((r.have / r.all) * 100).toFixed(1)}%"></em></i><b>${r.have} of ${r.all}</b></div>`).join("")}</div></section>
    ${own.length ? `<section class="tv-sec"><h3>Only you can answer</h3><ul class="tv-qs">${own.map((q) => `<li class="own">${q.person && T.byId[q.person] ? famChip(q.person) : ""}${esc(q.q)}</li>`).join("")}</ul></section>` : ""}
    <section class="tv-sec"><h3>How sure each link is</h3><p class="tv-note">For each person, how sure the link to their parents is. 90 and over: primary records agree; 70 to 89: indexes and consensus; 40 to 69: a working hypothesis; under 40: disputed. Where Gemini (G) or Muse (M) scored a link differently, their figures are shown too.</p><div class="tv-certs">${T.nodes.filter((n) => n.cert && n.id !== L.root).sort((a, b) => (a.gen ?? 99) - (b.gen ?? 99) || b.cert.pct - a.cert.pct).map((n) => `<button type="button" data-go="${n.id}" class="tv-certrow"><b>${esc(nm(n.p))}</b><i><em style="width:${n.cert.pct}%" class="${n.cert.pct >= 90 ? "hi" : n.cert.pct >= 70 ? "mid" : n.cert.pct >= 40 ? "lo" : "no"}"></em></i><span>${n.cert.pct}%${n.cert.gemini ? ` <small>G ${n.cert.gemini}</small>` : ""}${n.cert.muse ? ` <small>M ${n.cert.muse}</small>` : ""}</span><small class="why">${esc(n.cert.basis)}</small></button>`).join("")}</div></section>
    <section class="tv-sec"><h3>Where the evidence disagrees</h3>${L.conflicts.map((c) => `<details class="tv-con s-${c.status}"><summary><b>${esc(c.id)} · ${esc(c.q)}</b><span>${esc(c.status)}: ${esc(c.conclusion)}</span></summary><p>${esc(c.argument)}</p>${c.person && T.byId[c.person] ? famChip(c.person) : ""}</details>`).join("")}</section>
    <section class="tv-sec"><h3>Research questions</h3><ul class="tv-qs">${L.questions.filter((q) => q.task !== "owner").map((q) => `<li>${q.person && T.byId[q.person] ? famChip(q.person) : ""}${esc(q.q)}</li>`).join("")}</ul></section>
    <section class="tv-sec"><h3>Research log</h3><ol class="tv-log">${(L.log || []).map((x) => `<li><time>${esc(x.date)}</time> <b>${esc(x.by)}</b> · ${esc(x.where)}: ${esc(x.terms)} <em class="r-${esc(String(x.result).replace(/\s/g, "-"))}">${esc(x.result)}</em>${x.note ? `<p>${esc(x.note)}</p>` : ""}</li>`).join("")}</ol></section>
    <section class="tv-sec"><h3>The standard</h3><p class="tv-note">${esc(L.standard.name)} (${esc(L.standard.by)}). Every fact is classified by its source (original, derivative, authored), its information (primary, secondary, undetermined) and its evidence (direct, indirect, negative).</p>
    <p class="tv-foot"><button type="button" class="tv-btn" id="tv-ged">Export GEDCOM 7</button> <a class="tv-btn quiet" href="../#ln-tree">Plain tree and fan</a></p></section>`;
}
$("#tv-research").addEventListener("click", (e) => {
  const b = e.target.closest("[data-go],#tv-ged"); if (!b) return;
  if (b.id === "tv-ged") { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([window.KIN_LINEAGE_UI.gedcom()], { type: "text/plain" })); a.download = "family-tree.ged"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return; }
  setMode("roots"); select(b.dataset.go);
});
$("#tv-records").addEventListener("click", (e) => { if (e.target.closest("[data-rclose]")) setMode("roots"); });
$("#tv-research").addEventListener("click", (e) => { if (e.target.closest("[data-rclose]")) setMode("roots"); });

/* Find a person */
function openFind() {
  const box = $("#tv-find"), list = $(".tv-flist", box);
  const rows = T.nodes.slice().sort((a, b) => (a.gen ?? 50) - (b.gen ?? 50) || a.by - b.by);
  list.innerHTML = rows.map((n) => `<li><button type="button" data-go="${n.id}" class="s-${n.status}"><i></i><b>${esc(n.id === L.root ? "You" : known(n.p) ? nm(n.p) : n.p.placeholder)}</b><small>${esc(T.rel(n.id))}${lifeText(n) ? " · " + esc(lifeText(n)) : ""}</small></button></li>`).join("");
  box.hidden = false; requestAnimationFrame(() => box.classList.add("on"));
  const q = $("input", box); q.value = ""; setTimeout(() => q.focus(), 60);
}
function closeFind() { const box = $("#tv-find"); box.classList.remove("on"); setTimeout(() => { if (!box.classList.contains("on")) box.hidden = true; }, 250); }
$("#tv-find-b").addEventListener("click", openFind);
$("#tv-find").addEventListener("click", (e) => { const b = e.target.closest("[data-go],[data-fclose]"); if (!b) return; closeFind(); if (b.dataset.go) { setMode("roots"); select(b.dataset.go); } });
$("#tv-find input").addEventListener("input", (e) => { const q = e.target.value.trim().toLowerCase(); for (const li of $$("#tv-find li")) li.hidden = q && !li.textContent.toLowerCase().includes(q); });

function stats() {
  const people = T.nodes.filter((n) => known(n.p) && n.id !== L.root), deep = Math.max(...T.nodes.filter((n) => n.ancestor).map((n) => n.gen));
  $(".tv-stats").innerHTML = `<b>${people.length}</b> people · <b>${deep}</b> generations · <b>${yearOf(T.yMin)}</b> to today · <b>${L.sources.length}</b> sources`;
}

/* ------------------------------------------------------------------ the opening: the roots grow from you into the past */
function startIntro() {
  const ov = overview();
  if (RM) { Object.assign(cam, ov, { th: Math.PI / 2 }); Object.assign(want, cam); $(".tv-intro").remove(); state.intro = false; return; }
  Object.assign(cam, { tx: 0, ty: -2, tz: 0, th: Math.PI / 2 - 0.9, ph: 0.55, d: 22 }); Object.assign(want, cam);
  state.introAt = performance.now();
  flyTo({ ...ov, th: Math.PI / 2 }, 5.2); fly.t0 += 350;
  setTimeout(() => { const el = $(".tv-intro"); if (el) el.classList.add("out"); }, 2600);
}
function skipIntro() {
  if (!state.intro) return;
  state.intro = false; state.grow = 99; const el = $(".tv-intro"); if (el) { el.classList.add("out"); setTimeout(() => el.remove(), 600); }
  if (fly) { Object.assign(cam, fly.to); Object.assign(want, cam); fly = null; }
}

/* ------------------------------------------------------------------ the loop */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  U.uRes.value.set(w * DPR, h * DPR);
  if (state.globe) state.globe.U.uRes.value.set(w * DPR, h * DPR);
  if (motes) motes.material.uniforms.uPx.value = DPR;
  for (const n of T ? T.nodes : []) n.lw = 0;
  if (state.globe) for (const p of state.globe.pins) p.w = 0;
}
addEventListener("resize", resize);
let t0 = performance.now(), hidden = false;
const vo = { x: 0, y: 0 };
document.addEventListener("visibilitychange", () => (hidden = document.hidden));
function frame(now) {
  requestAnimationFrame(frame);
  if (hidden) return;
  const t = (now - t0) / 1000;
  state.frames++;
  U.uTime.value = t; skyMesh.material.uniforms.uTime.value = t;
  if (state.intro) {
    const k = clamp((now - state.introAt - 300) / 5200, 0, 1);
    const maxG = Math.max(...T.nodes.map((n) => (n.gen != null ? n.gen : 1))) + 2;
    state.grow = ease(k) * maxG;
    $(".tv-intro-y").textContent = Math.round(NOW - ease(k) * (NOW - yearOf(T.yMin)));
    if (k >= 1) { state.intro = false; state.grow = 99; setTimeout(() => { const el = $(".tv-intro"); if (el) el.remove(); }, 700); }
  }
  U.uGrow.value = state.grow;
  const target = state.sel ? 1 : 0; U.uSel.value += (target - U.uSel.value) * 0.12;
  if (state.playing) {
    const y = state.playY + ((now - state.playT) / 1000) * 11;
    if (y >= NOW) { setYear(NOW); state.playing = false; $("#tv-play").classList.remove("on"); } else if (Math.round(y) !== state.year) setYear(y);
  }
  if (state.mode === "places" && state.globe) {
    const G = state.globe; G.U.uTime.value = t;
    stepGlobe();
    renderer.render(G.scene, state.gcam);
    for (const n of T.nodes) if (n.elVis) { n.el.classList.remove("on"); n.elVis = false; }
    for (const s of state.strata) s.el.classList.remove("on"); state.nowEl.classList.remove("on");
    return;
  }
  if (!ptr.size && !fly && !state.sel && !state.intro && !RM && now - idleAt > 6000 && state.mode === "roots") want.th += 0.0007;
  stepCamera(now);
  /* keep the chosen person centred in the part of the screen the sheet leaves open */
  const sh = state.sel && !sheet.hidden && sheet.classList.contains("on"), full = sheet.classList.contains("full");
  const wantX = sh && !phone() ? 220 : 0, wantY = sh && phone() ? (full ? 0 : innerHeight * 0.2) : 0;
  vo.x += (wantX - vo.x) * 0.12; vo.y += (wantY - vo.y) * 0.12;
  if (Math.abs(vo.x) > 0.5 || Math.abs(vo.y) > 0.5) camera.setViewOffset(innerWidth, innerHeight, vo.x, vo.y, innerWidth, innerHeight); else if (camera.view && camera.view.enabled) camera.clearViewOffset();
  const fpx = innerHeight / 2 / Math.tan((camera.fov * Math.PI) / 360);
  for (const m of [plane, beams, motes]) m && m.material && m.material.uniforms && (m.material.uniforms.uTime.value = t);
  if (beams) beams.children.forEach((c) => (c.material.uniforms.uTime.value = t));
  if (state.yearPlane) { state.yearPlane.visible = state.timeOn; if (state.timeOn) { state.yearPlane.position.y += (yOf(state.year) - state.yearPlane.position.y) * 0.25; state.yearPlane.material.uniforms.uTime.value = t; } }
  for (const n of T.nodes) {
    const g = n.gen != null ? n.gen : (T.byId[n.rel && n.rel.of] || {}).gen || 1;
    const k = clamp(state.grow - g, 0, 1); n.grown = k > 0.6;
    const pulse = n.id === state.sel ? 1 + 0.06 * Math.sin(now / 260) : 1;
    const born = state.timeOn && n.alive ? 1 + 0.25 * Math.exp(-Math.pow((state.year - n.by) / 3, 2)) : 1;
    const minW = n.dist ? (2 * (n.ghost ? 4 : 6.5) * n.dist) / fpx : 0;
    n.spr.scale.setScalar(Math.max(0.001, Math.max(n.size * pulse * born, minW) * ease(k)));
    n.halo.scale.setScalar(n.size * 3.1 * ease(k) * (n.id === state.sel ? 1.35 + 0.15 * Math.sin(now / 400) : 1));
  }
  stepCards(now);
  project(); placeLabels();
  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ start */
(async function start() {
  try { await Promise.all([document.fonts.load('600 80px "Cormorant Garamond"'), document.fonts.load('italic 500 80px "Cormorant Garamond"'), document.fonts.load('500 16px "Outfit"')]); } catch (_) { /* fonts are a nicety */ }
  makeWorld(); timeRange(); resize();
  thumb.style.left = "100%"; yout.textContent = "Today";
  startIntro();
  requestAnimationFrame(frame);
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && T.byId[hash]) setTimeout(() => { skipIntro(); select(hash); }, RM ? 0 : 400);
  document.body.classList.add("ready");
  window.KIN3D = {
    ready: true, T: () => T, select: (id) => select(id), deselect, mode: (m) => setMode(m), year: (y) => (y == null ? timeOff() : setYear(y)), skip: skipIntro,
    screen: (id) => { const n = T.byId[id]; return n ? { x: n.sx, y: n.sy, r: n.sr, on: n.on && n.grown, label: !!n.show } : null; },
    place: (id) => { const p = state.globe && state.globe.pins.find((q) => q.id === id); return p ? { x: p.sx, y: p.sy, on: p.front } : null; },
    state: () => ({ mode: state.mode, sel: state.sel, frames: state.frames, nodes: T.nodes.length, links: T.links.length, labels: T.nodes.filter((n) => n.show).length, cards: state.cards.length, viewer: !!state.viewer, glines: state.globe ? state.globe.lines.length : 0, pins: state.globe ? state.globe.pins.length : 0, year: state.timeOn ? state.year : null, intro: state.intro, gl: !!renderer.getContext() }),
  };
})();
