/* Garage showroom (Claude, 2026-11-16): the owner's real vehicles in 3D.
   Owner, 2026-11-16: "I want my car and motorcycle to be a real 3d model of the actual car. My mt07 is matte
   black and the Kia is blue ... not a bs one." This replaces the hand-rolled box models (model3d.js).
   - Models: models/models.json lists one GLB per vehicle (free models of the same generation, credited in
     models/CREDITS.md). Paint comes from the manifest, not the file: every material named "paint" takes
     the owner's colour (Sorento: Kia Mineral Blue M4B, glossy with clearcoat; MT-07: Yamaha Matte Raven Black).
   - Rendering: three.js 0.170 from kit/vendor/three (works offline once cached), ACES tone mapping,
     image-based reflections from RoomEnvironment, one key light, a soft contact shadow; drag to turn,
     pinch or wheel to zoom; slow turntable when idle. It draws only while on screen and the tab is visible.
   - No WebGL or a failed load: the still render from the manifest, or a plain caption. Never a fake model.
   Same API as before, so app.js is unchanged in spirit: window.G3D = { attach(canvas, captionEl), setVehicle(key) };
   "g3d:ready" fires on window once G3D exists (this file is a module, so it runs after app.js). */
import * as THREE from "three";
import { GLTFLoader } from "../../kit/vendor/three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "../../kit/vendor/three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "../../kit/vendor/three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "../../kit/vendor/three/addons/libs/meshopt_decoder.module.js";

const BASE = new URL("models/", import.meta.url);
const LABEL = { sorento: "2025 Kia Sorento Hybrid", mt07: "2021 Yamaha MT-07" };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

let canvas = null, capEl = null, still = null;
let renderer = null, scene = null, camera = null, controls = null, stage = null, shadow = null, floor = null;
let manifest = null, current = null, shown = null, wantKey = "sorento";
let onScreen = true, raf = 0, resumeTimer = 0;
const cache = new Map(); // key -> Promise<THREE.Object3D>

const caption = (t) => { if (capEl) capEl.textContent = t; };

function getManifest() {
  if (!manifest) manifest = fetch(new URL("models.json", BASE)).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifest;
}

/* ---------- fallback: the still render, never a stand-in model ---------- */
function showStill(entry, key, why) {
  if (canvas) canvas.hidden = true;
  if (entry && entry.still) {
    if (!still) { still = document.createElement("img"); still.className = "g3d-still"; still.decoding = "async"; canvas.after(still); }
    still.hidden = false;
    still.src = new URL(entry.still, BASE).href;
    still.alt = `${LABEL[key] || key}, ${entry.paintName || "factory paint"}`;
  }
  caption(`${LABEL[key] || key}${entry && entry.paintName ? " · " + entry.paintName : ""} · ${why}`);
}

/* ---------- scene ---------- */
function radialTexture(stops) {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), grd = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  for (const [at, col] of stops) grd.addColorStop(at, col);
  g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const flat = (map) => new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }));

function build() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { renderer = null; return false; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd4ff, 0.7); rim.position.set(-5, 3, -4); scene.add(rim);

  // A pool of light on the floor (so the vehicle reads as standing somewhere), then a soft contact shadow on it.
  floor = flat(radialTexture([[0, "rgba(190,215,255,0.20)"], [0.45, "rgba(150,185,235,0.08)"], [1, "rgba(120,160,220,0)"]]));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.001; floor.renderOrder = 0; scene.add(floor);
  shadow = flat(radialTexture([[0, "rgba(0,0,0,0.78)"], [0.5, "rgba(0,0,0,0.42)"], [1, "rgba(0,0,0,0)"]]));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; shadow.renderOrder = 1; scene.add(shadow);

  stage = new THREE.Group(); scene.add(stage);

  camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.05, 200);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minPolarAngle = 0.25; controls.maxPolarAngle = 1.48; // never under the floor
  controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 0.55;
  controls.addEventListener("start", () => { controls.autoRotate = false; clearTimeout(resumeTimer); });
  controls.addEventListener("end", () => { clearTimeout(resumeTimer); if (!reduceMotion) resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 6000); });

  new ResizeObserver(fit).observe(canvas.parentElement || canvas);
  new IntersectionObserver((es) => { onScreen = es.some((e) => e.isIntersecting); loop(); }, { rootMargin: "120px" }).observe(canvas);
  document.addEventListener("visibilitychange", loop);
  fit();
  return true;
}

function fit() {
  if (!renderer) return;
  const w = Math.max(240, canvas.parentElement ? canvas.parentElement.clientWidth - 24 : canvas.clientWidth || 600);
  const h = Math.round(Math.max(240, Math.min(520, w * (w < 560 ? 0.78 : 0.56))));
  renderer.setSize(w, h, false);
  canvas.style.width = "100%"; canvas.style.height = h + "px";
  camera.aspect = w / h; camera.updateProjectionMatrix();
  if (shown) frame(shown, false);
  draw();
}

function draw() { if (renderer && scene && camera) renderer.render(scene, camera); }

function loop() {
  cancelAnimationFrame(raf);
  if (!renderer || !onScreen || document.visibilityState === "hidden") return;
  const tick = () => { controls.update(); draw(); raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
}

/* ---------- models ---------- */
function paintIt(root, entry) {
  const col = entry.paint ? new THREE.Color(entry.paint) : null;
  const matte = entry.finish === "matte";
  root.traverse((o) => {
    if (!o.isMesh) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (!m) continue;
      if (m.name === "paint" && col) {
        m.color.copy(col);
        if (matte) { m.roughness = Math.max(m.roughness ?? 0.65, 0.6); if ("clearcoat" in m) m.clearcoat = 0; }
      }
      m.envMapIntensity = m.name === "paint" ? (matte ? 0.7 : 1.15) : 1;
      if (m.map) m.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
  });
}

function load(key) {
  if (cache.has(key)) return cache.get(key);
  const p = getManifest().then((mf) => {
    const entry = mf[key];
    if (!entry || !entry.file) throw Object.assign(new Error("no model"), { entry });
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    return new Promise((res, rej) => loader.load(new URL(entry.file, BASE).href, (g) => {
      const root = g.scene;
      paintIt(root, entry);
      // Seat it: wheels on the floor, centred, +X forward as the manifest promises.
      const box = new THREE.Box3().setFromObject(root), c = box.getCenter(new THREE.Vector3());
      root.position.x -= c.x; root.position.z -= c.z; root.position.y -= box.min.y;
      const holder = new THREE.Group(); holder.add(root); holder.userData = { entry, size: box.getSize(new THREE.Vector3()) };
      res(holder);
    }, (ev) => { if (current === key && ev.total) caption(`Loading the ${LABEL[key] || key} … ${Math.round((ev.loaded / ev.total) * 100)}%`); },
    (err) => rej(Object.assign(err instanceof Error ? err : new Error("load failed"), { entry }))));
  });
  cache.set(key, p);
  p.catch(() => cache.delete(key));
  return p;
}

function frame(holder, reset) {
  const s = holder.userData.size, r = 0.5 * Math.hypot(s.x, s.y, s.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fitH = r / Math.sin(fov / 2), fitW = fitH / Math.min(1, camera.aspect);
  const dist = Math.max(fitH, fitW) * 0.82;
  controls.target.set(0, s.y * 0.42, 0);
  controls.minDistance = dist * 0.55; controls.maxDistance = dist * 1.8;
  if (reset) {
    const yaw = THREE.MathUtils.degToRad(38), el = THREE.MathUtils.degToRad(13);
    camera.position.set(Math.cos(yaw) * Math.cos(el) * dist, s.y * 0.42 + Math.sin(el) * dist, Math.sin(yaw) * Math.cos(el) * dist);
  }
  shadow.scale.set(s.x * 1.3, s.z * 1.7 + 0.35, 1);
  const f = Math.max(s.x, s.z) * 2.3; floor.scale.set(f, f * 0.75, 1);
  controls.update();
}

function show(key) {
  current = key;
  if (!renderer) { getManifest().then((mf) => showStill(mf[key], key, "3D needs WebGL, which this browser has off")); return; }
  if (shown && shown.userData.key === key) return;
  caption(`Loading the ${LABEL[key] || key} …`);
  load(key).then((holder) => {
    if (current !== key) return;
    holder.userData.key = key;
    stage.clear(); stage.add(holder); shown = holder;
    canvas.hidden = false; if (still) still.hidden = true;
    frame(holder, true); draw(); loop();
    const e = holder.userData.entry;
    caption([LABEL[key] || key, e.paintName, e.credit, "drag to turn, pinch to zoom"].filter(Boolean).join(" · "));
  }).catch((err) => {
    if (current !== key) return;
    stage.clear(); shown = null; draw();
    showStill(err.entry, key, err.message === "no model" ? "3D model not in the bay yet" : "the 3D model did not load; try again online");
  });
}

function attach(cv, cap) {
  canvas = cv; capEl = cap || null;
  if (!renderer && !build()) renderer = null;
  show(wantKey);
}

function setVehicle(key) {
  wantKey = key;
  if (canvas) show(key);
}

window.G3D = { attach, setVehicle };
window.dispatchEvent(new Event("g3d:ready"));
