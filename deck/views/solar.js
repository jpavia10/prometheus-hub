/* The Orbit, rebuilt as a solar system (owner, 2026-11-21: the old orbit was "a 5/100"; he chose "cinematic solar system").
   Every pillar is a planet wearing its own world painting (art/worlds/planet_{id}.webp, tools/art/planets.py), on its domain's tilted ring
   around a living star: Finance closest, then Civic, Mountain & Home, and Mind & Studio outermost. Drag to turn the system, pinch or
   scroll to come closer, tap a planet and the camera flies to it; tap it again (or Enter) and you dive into the pillar. The selected
   planet shows its synapses (the pillars it shares data with) as arcs of light. The labels are real links with the shared bus's badges,
   the star is the command button (search or add), the ticker says what is true right now. Nothing here invents a number.
   three.js is loaded only here (kit/vendor/three), so the menu home never pays for it. Reduced motion: no orbits, no flights. */
import { h, icon } from "../core/ui.js";
import { PILLARS } from "../pillars.js";
import { pillarStats, titan } from "../core/legacy.js";
import { clock, today, fmtTime } from "../core/dates.js";
import { warp, tick, blip, buzz } from "../core/fx.js";
import { PILLAR_DOMAINS, domainOf, peersFor, badgeFor, factsFor, brief, ticker } from "./orrery.js";

const TAU = Math.PI * 2;
const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const THREE_URL = new URL("../../kit/vendor/three/build/three.module.min.js", import.meta.url).href;
/* the rings, inside out: radius, inclination, the node it tilts about, and the domain's light */
const RINGS = { finance: { R: 2.5, inc: 0.11, node: 0.4, rgb: [0.5, 0.95, 0.78] }, civic: { R: 3.65, inc: -0.08, node: 1.9, rgb: [0.78, 0.66, 1.0] },
  homestead: { R: 4.85, inc: 0.07, node: 3.1, rgb: [0.62, 0.84, 1.0] }, mind: { R: 6.15, inc: -0.1, node: 4.4, rgb: [0.86, 0.7, 1.0] } };
const ORDER = ["finance", "civic", "homestead", "mind"];
const LABEL = Object.fromEntries(PILLAR_DOMAINS.filter((d) => d.quad).map((d) => [d.id, d.label]));
function hueRgb(hue, s = 0.85, l = 0.62) { const k = (n) => (n + hue / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0), f(8), f(4)]; }
function ringPoint(rg, a, out) {                                   // a point on a ring: in its plane, tilted by inc about x, turned by node about y
  const x1 = rg.R * Math.cos(a), z1 = rg.R * Math.sin(a), y2 = -z1 * Math.sin(rg.inc), z2 = z1 * Math.cos(rg.inc);
  out[0] = x1 * Math.cos(rg.node) + z2 * Math.sin(rg.node); out[1] = y2; out[2] = -x1 * Math.sin(rg.node) + z2 * Math.cos(rg.node); return out;
}

const PLANET_VS = "varying vec2 vUv; void main(){ vUv = uv * 2. - 1.; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }";
const PLANET_FS = `precision highp float;
uniform sampler2D map; uniform float has; uniform vec3 hue; uniform vec3 L; uniform float t; uniform float sel; uniform float rot; uniform float dim;
varying vec2 vUv;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), f.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), f.x), f.y); }
void main(){
  vec2 p = vUv * 1.32; float r = length(p); vec3 col = vec3(0.); float a = 0.;
  if (r < 1.) {
    vec3 n = vec3(p, sqrt(1. - r * r)); float lon = atan(n.x, n.z) + rot, lat = asin(clamp(n.y, -1., 1.));
    vec2 tuv = vec2(.5 + lon / 3.14159 * .9, .5 - lat / 3.14159 * .94);
    vec3 base = has > .5 ? texture2D(map, tuv).rgb : mix(hue * .35, hue, n2(vec2(lat * 7., lon * 2. + t * .02)) * .7 + .15);
    float d = dot(n, L), lit = smoothstep(-.28, .62, d);
    col = base * (.09 + 1.18 * lit) + hue * .08 * (1. - lit);
    col += hue * pow(1. - n.z, 2.6) * .7 * (.3 + .7 * lit);
    col += vec3(1.) * pow(max(dot(reflect(-L, n), vec3(0., 0., 1.)), 0.), 22.) * .16;
    a = smoothstep(1., .975, r);
  }
  float o = max(r - 1., 0.), side = .35 + .65 * (dot(normalize(vec3(p, .001)), L) * .5 + .5);
  vec3 glow = hue * exp(-o * 11.) * .6 * side * step(.975, r);
  float ring = sel * exp(-abs(r - 1.17) * 70.) * (.75 + .25 * sin(t * 3.));
  col = col * a + glow + hue * ring * 1.4;
  float alpha = max(a, clamp(max(glow.r, max(glow.g, glow.b)) * 1.4 + ring, 0., 1.));
  gl_FragColor = vec4(col * dim, alpha);
}`;
const SUN_FS = `precision highp float; uniform float t; uniform float e; varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){ vec2 p = vUv; float d = length(p); float R = .3; vec3 col = vec3(0.);
  if (d < R) { float z = sqrt(R * R - d * d); vec3 n = vec3(p, z) / R; vec2 uv = vec2(atan(n.x, n.z) + t * .1, asin(clamp(n.y, -1., 1.)));
    float f = fbm(uv * 3. + fbm(uv * 5. - t * .16) * 1.7), g = fbm(uv * 9. + t * .25); float heat = smoothstep(.18, .92, f * .74 + g * .32);
    vec3 body = mix(vec3(.42, .72, .86), vec3(.94, .97, 1.), heat); body = mix(body, vec3(1.), smoothstep(.78, 1., heat));
    col = body * (.55 + .7 * pow(z / R, .55)) * (1. + e * .5) + vec3(.58, .48, .92) * pow(1. - z / R, 2.6) * .9; }
  float o = max(d - R, 0.); float rays = fbm(vec2(atan(p.y, p.x) * 2.6, d * 4. - t * .3)); float out1 = step(R, d);
  col += (vec3(.62, .84, .95) * exp(-o * 9.) * (.45 + rays * .6) + vec3(.62, .5, .95) * exp(-o * 3.2) * .45 + vec3(.86, .92, 1.) * exp(-o * 5.5) * .2) * out1 * (1. + e * .7);
  float a = clamp(max(col.r, max(col.g, col.b)), 0., 1.) * smoothstep(1., .7, d);
  gl_FragColor = vec4(col, a); }`;
const ARC_VS = "attribute float u; varying float vU; void main(){ vU = u; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }";
const ARC_FS = "precision mediump float; uniform vec3 c; uniform float t; uniform float k; varying float vU; void main(){ float p = fract(t * .35 - vU); float pulse = smoothstep(.0, .06, p) * smoothstep(.22, .06, p); float a = (.16 + pulse * .75) * sin(vU * 3.14159) * k; gl_FragColor = vec4(c * (1. + pulse), a); }";
const STAR_VS = "attribute float s; attribute float w; uniform float t; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); vA = .45 + .55 * sin(t * (.6 + w) + w * 40.); gl_PointSize = s; gl_Position = projectionMatrix * mv; }";
const STAR_FS = "precision mediump float; varying float vA; void main(){ vec2 q = gl_PointCoord - .5; float d = length(q); if (d > .5) discard; gl_FragColor = vec4(vec3(.86, .9, 1.), (1. - d * 2.) * vA); }";

/* the backdrop: a nebula painted once on a small canvas, the domains' colours far away */
function nebula() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, 512); bg.addColorStop(0, "#03040b"); bg.addColorStop(0.5, "#070a18"); bg.addColorStop(1, "#02030a"); g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
  const blobs = [[180, 210, 260, "120,90,220", 0.22], [520, 260, 300, "70,140,230", 0.18], [820, 200, 240, "190,110,240", 0.16], [380, 330, 200, "60,200,170", 0.1], [700, 360, 220, "90,120,255", 0.12], [960, 280, 180, "160,90,220", 0.12], [60, 300, 180, "90,140,230", 0.12]];
  for (const [x, y, r, rgb, a] of blobs) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512); }
  const im = g.getImageData(0, 0, 1024, 512), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 6; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(im, 0, 0);
  return c;
}

export function solar(ctx) {
  const t0d = today(), stats = pillarStats(t0d); let tn = null; const calm = still();
  const list = PILLARS.slice(); const n = list.length;
  /* where each pillar sits: its ring, its starting angle, its speed (inner rings faster) */
  const byDom = {}; for (const p of list) (byDom[domainOf(p.id)] = byDom[domainOf(p.id)] || []).push(p);
  const bodies = list.map((p) => { const dom = RINGS[domainOf(p.id)] ? domainOf(p.id) : "mind"; const peers = byDom[dom] || [p]; const j = peers.indexOf(p);
    const rg = RINGS[dom]; return { p, dom, rg, a0: (j / peers.length) * TAU + ORDER.indexOf(dom) * 0.7, w: 0.11 / Math.pow(rg.R, 1.5), size: dom === "finance" ? 0.42 : dom === "mind" ? 0.4 : 0.44, pos: [0, 0, 0], sx: 0, sy: 0, sr: 0, z: 0 }; });

  /* the DOM: canvas, the labels (real links), the star's command button, the ticker, and one card */
  const cv = h("canvas.sol-gl", { "aria-hidden": "true" });
  const now0 = clock.now();
  const core = h("button.sol-core", { type: "button", "aria-label": "Command: search or add", onclick: () => { energy = 1; blip(); ctx.openSearch(); } },
    h("b.num", fmtTime(`${now0.getHours()}:${String(now0.getMinutes()).padStart(2, "0")}`).replace(/ ?[AP]M/i, "")), h("span", "Command"));
  let held = false, holdTimer = null, sel = -1;
  const labels = bodies.map((b, i) => {
    const badge = h("i.sol-badge", { hidden: true });
    const a = h("a.sol-pl", { href: b.p.route, dataset: { pillar: b.p.id, domain: b.dom }, style: { "--h": b.p.hue }, "aria-label": `${b.p.name}: ${b.p.what}`, draggable: "false",
      oncontextmenu: (e) => e.preventDefault(),
      onpointerdown: () => { held = false; clearTimeout(holdTimer); holdTimer = setTimeout(() => { held = true; buzz(18); brief(b.p, stats, tn, () => enter(i)); }, 480); },
      onpointerup: () => clearTimeout(holdTimer), onpointerleave: () => clearTimeout(holdTimer), onpointercancel: () => clearTimeout(holdTimer),
      onclick: (e) => { e.preventDefault(); clearTimeout(holdTimer); if (held) return; choose(i); } }, h("span.sol-name", b.p.short || b.p.name.split(" · ")[0]), badge);
    b.badge = badge; b.label = a; return a; });
  const labelBox = h("nav.sol-labels", { "aria-label": "Pillars" }, ...labels);
  const tickerEl = ticker(ctx, t0d, stats);
  const kick = h("p.sol-kick"), title = h("h2.sol-title"), sub = h("p.sol-sub"), fact = h("p.sol-fact"), syn = h("div.sol-syn");
  const prevB = h("button.sol-arrow", { type: "button", "aria-label": "Previous pillar", onclick: () => step(-1) }, icon("left", 18));
  const nextB = h("button.sol-arrow", { type: "button", "aria-label": "Next pillar", onclick: () => step(1) }, icon("right", 18));
  const enterB = h("button.sol-enter", { type: "button", onclick: () => (sel >= 0 ? enter(sel) : choose(0)) }, h("span", "Enter"), icon("right", 16));
  const card = h("div.sol-card", { "aria-live": "polite" }, kick, h("div.sol-card-top", title, h("div.sol-nav", prevB, enterB, nextB)), sub, h("div.sol-card-foot", fact, syn));
  const stage = h("div.sol-stage", cv, labelBox, core, tickerEl, card);
  const el = h("section.solar", { "aria-label": "The pillars as a solar system" }, stage);

  function paintCard() {
    const b = bodies[sel];
    if (!b) {
      kick.textContent = `Prometheus · ${n} pillars`; title.textContent = "The system"; sub.textContent = "Drag to turn it, pinch to come closer, tap a planet to fly there.";
      fact.textContent = "The star is the command: search or add."; syn.replaceChildren(); enterB.querySelector("span").textContent = "Begin"; card.style.removeProperty("--h"); card.classList.remove("on"); return;
    }
    const f = factsFor(b.p, stats, tn);
    kick.textContent = LABEL[b.dom] || "Prometheus"; title.textContent = b.p.name.split(" · ")[0]; sub.textContent = b.p.what;
    fact.textContent = f[0] || (b.p.ext ? "Lives on its own site; its data stays there." : "Nothing entered on this device yet.");
    syn.replaceChildren(...peersFor(b.p.id).slice(0, 4).map((q) => h("button.sol-chip", { type: "button", style: { "--h": q.hue }, onclick: () => choose(list.indexOf(q)) }, q.short || q.name.split(" · ")[0])));
    enterB.querySelector("span").textContent = b.p.ext ? "Open" : "Enter"; card.style.setProperty("--h", b.p.hue); card.classList.add("on");
  }
  function badges() { bodies.forEach((b) => { const v = badgeFor(b.p, stats, t0d, tn); b.badge.hidden = !v; b.badge.textContent = v || ""; }); }
  badges(); titan().then((d) => { tn = d; badges(); if (sel >= 0) paintCard(); });
  paintCard();

  /* camera: spherical around a target; overview looks at the star, a selection follows its planet */
  const C = { yaw: 0.5, pitch: 0.62, dist: 15, tYaw: 0.5, tPitch: 0.62, tDist: 15, tx: 0, ty: 0, tz: 0, vel: 0, dive: 0 };
  let energy = 0, last = 0, raf = 0, dead = false, seen = true, idleAt = performance.now(), T3 = null, R = null;
  const overDist = () => (stage.clientWidth / Math.max(1, stage.clientHeight) < 0.8 ? 14 : 11.5);
  function choose(i) {
    if (i === sel) { enter(i); return; }
    sel = i; tick(); C.tDist = 3.4; C.tPitch = 0.3; idleAt = performance.now(); paintCard(); arcs(); wake();
  }
  function overview() { sel = -1; C.tDist = overDist(); C.tPitch = 0.62; paintCard(); arcs(); wake(); }
  function step(d) { choose(((sel < 0 ? (d > 0 ? -1 : 0) : sel) + d + n) % n); }
  let going = false;
  function enter(i) {
    if (going) return; const b = bodies[i]; going = true; blip(); sel = i; paintCard(); el.classList.add("diving");
    const go = () => warp(b.sx || innerWidth / 2, b.sy || innerHeight / 2, `hsl(${b.p.hue} 100% 66%)`, () => { location.href = b.p.route; });
    if (calm || !R) { go(); return; }
    C.tDist = b.size * 1.6; C.dive = 1; wake(); setTimeout(go, 420);
  }

  /* the scene, once three.js is here */
  const ready = import(THREE_URL).then((THREE) => {
    if (dead) return; T3 = THREE;
    try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: "high-performance" }); } catch (e) { R = null; }
    if (!R) { el.classList.add("sol-flat"); return; }
    let dpr = Math.min(1.5, devicePixelRatio || 1); R.setPixelRatio(dpr); R.setClearColor(0x03040b, 1);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(nebula()), side: THREE.BackSide, depthWrite: false }));
    sky.material.map.colorSpace = THREE.SRGBColorSpace; sky.renderOrder = -3; scene.add(sky);
    const SN = calm ? 500 : 1300, sp = new Float32Array(SN * 3), ss = new Float32Array(SN), sw = new Float32Array(SN);
    for (let i = 0; i < SN; i++) { const u = Math.random() * 2 - 1, th = Math.random() * TAU, r = 70 + Math.random() * 30, q = Math.sqrt(1 - u * u); sp[i * 3] = r * q * Math.cos(th); sp[i * 3 + 1] = r * u; sp[i * 3 + 2] = r * q * Math.sin(th); ss[i] = (0.8 + Math.random() * 2.2) * dpr; sw[i] = Math.random(); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3)); sg.setAttribute("s", new THREE.BufferAttribute(ss, 1)); sg.setAttribute("w", new THREE.BufferAttribute(sw, 1));
    const starMat = new THREE.ShaderMaterial({ vertexShader: STAR_VS, fragmentShader: STAR_FS, uniforms: { t: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const stars = new THREE.Points(sg, starMat); stars.renderOrder = -2; scene.add(stars);
    for (const id of ORDER) { const rg = RINGS[id], pts = []; const v = [0, 0, 0]; for (let k = 0; k <= 180; k++) { ringPoint(rg, (k / 180) * TAU, v); pts.push(new THREE.Vector3(v[0], v[1], v[2])); }
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(...rg.rgb), transparent: true, opacity: 0.2, depthWrite: false })); ln.renderOrder = -1; scene.add(ln); }
    const sunMat = new THREE.ShaderMaterial({ vertexShader: PLANET_VS, fragmentShader: SUN_FS, uniforms: { t: { value: 0 }, e: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), sunMat); scene.add(sun);
    const loader = new THREE.TextureLoader(); const geo = new THREE.PlaneGeometry(2, 2);
    let arts = new Set(); fetch(new URL("../../art/worlds/index.json", import.meta.url)).then((r) => (r.ok ? r.json() : { worlds: [] })).then((j) => { arts = new Set(j.worlds || []);
      bodies.forEach((b) => { if (!arts.has(b.p.id)) return; loader.load(new URL(`../../art/worlds/planet_${b.p.id}.webp`, import.meta.url).href, (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.minFilter = THREE.LinearFilter; b.mat.uniforms.map.value = tx; b.mat.uniforms.has.value = 1; wake(); }); }); }).catch(() => {});
    for (const b of bodies) { const c = hueRgb(b.p.hue);
      b.mat = new THREE.ShaderMaterial({ vertexShader: PLANET_VS, fragmentShader: PLANET_FS, transparent: true, depthWrite: false,
        uniforms: { map: { value: null }, has: { value: 0 }, hue: { value: new THREE.Vector3(...c) }, L: { value: new THREE.Vector3(0, 0, 1) }, t: { value: 0 }, sel: { value: 0 }, rot: { value: 0 }, dim: { value: 1 } } });
      b.mesh = new THREE.Mesh(geo, b.mat); b.mesh.scale.setScalar(b.size * 1.32); scene.add(b.mesh); }
    /* synapse arcs from the selected planet to its peers */
    const ARC_N = 40; arcLines = [];
    for (let k = 0; k < 6; k++) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ARC_N * 3), 3)); const u = new Float32Array(ARC_N); for (let q = 0; q < ARC_N; q++) u[q] = q / (ARC_N - 1); g.setAttribute("u", new THREE.BufferAttribute(u, 1));
      const m = new THREE.ShaderMaterial({ vertexShader: ARC_VS, fragmentShader: ARC_FS, uniforms: { c: { value: new THREE.Vector3(1, 1, 1) }, t: { value: 0 }, k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const ln = new THREE.Line(g, m); ln.visible = false; ln.frustumCulled = false; scene.add(ln); arcLines.push({ ln, g, m, to: -1 }); }
    arcs();
    const V = new THREE.Vector3(), W = new THREE.Vector3(), S0 = new THREE.Vector3();
    let lift = 0;
    function size() { const w = stage.clientWidth, hh = stage.clientHeight; if (!w || !hh) return; R.setSize(w, hh, false); cam.aspect = w / hh;
      lift = Math.round(Math.min(hh * 0.3, (card.offsetHeight + 12) * 0.5)); cam.setViewOffset(w, hh + 2 * lift, 0, 2 * lift, w, hh); cam.updateProjectionMatrix(); if (sel < 0) C.tDist = C.dist = overDist(); }
    size(); sizeHook = size;
    let slow = 0;
    draw = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now; const t = now / 1000;
      if (dt > 0.03) slow += dt; else slow = Math.max(0, slow - dt * 0.5);
      if (slow > 2 && dpr > 0.75) { dpr = dpr > 1 ? 1 : 0.75; R.setPixelRatio(dpr); size(); slow = 0; }
      /* the system turns; the camera eases toward where it is going */
      const k = calm ? 1 : 1 - Math.exp(-dt * 3.2), sim = calm ? 0 : t;
      bodies.forEach((b) => ringPoint(b.rg, b.a0 + b.w * sim, b.pos));
      if (!calm && sel < 0 && now - idleAt > 4000) C.tYaw += dt * 0.03;
      C.tYaw += C.vel; C.vel *= Math.pow(0.04, dt);
      C.yaw += (C.tYaw - C.yaw) * k; C.pitch += (C.tPitch - C.pitch) * k; C.dist += (C.tDist - C.dist) * (C.dive ? 1 - Math.exp(-dt * 7) : k);
      const tgt = sel >= 0 ? bodies[sel].pos : [0, 0, 0]; C.tx += (tgt[0] - C.tx) * k; C.ty += (tgt[1] - C.ty) * k; C.tz += (tgt[2] - C.tz) * k;
      cam.position.set(C.tx + C.dist * Math.cos(C.pitch) * Math.sin(C.yaw), C.ty + C.dist * Math.sin(C.pitch), C.tz + C.dist * Math.cos(C.pitch) * Math.cos(C.yaw));
      cam.lookAt(C.tx, C.ty, C.tz); cam.updateMatrixWorld(); sky.position.copy(cam.position); stars.position.copy(cam.position);
      energy *= Math.pow(0.2, dt); sunMat.uniforms.t.value = t; sunMat.uniforms.e.value = energy; starMat.uniforms.t.value = t;
      sun.quaternion.copy(cam.quaternion);
      S0.set(0, 0, 0).applyMatrix4(cam.matrixWorldInverse);
      const w = stage.clientWidth, hh = stage.clientHeight, f = (hh + 2 * lift) / 2 / Math.tan((cam.fov * Math.PI) / 360);
      bodies.forEach((b, i) => {
        b.mesh.position.set(b.pos[0], b.pos[1], b.pos[2]); b.mesh.quaternion.copy(cam.quaternion);
        const big = i === sel ? 1.18 : 1; b.mesh.scale.setScalar(b.size * 1.32 * big);
        W.set(b.pos[0], b.pos[1], b.pos[2]).applyMatrix4(cam.matrixWorldInverse); const dz = -W.z;
        V.copy(S0).sub(W).normalize(); b.mat.uniforms.L.value.copy(V);
        b.mat.uniforms.t.value = t; b.mat.uniforms.sel.value += ((i === sel ? 1 : 0) - b.mat.uniforms.sel.value) * Math.min(1, dt * 6);
        b.mat.uniforms.rot.value = calm ? 0 : 0.32 * Math.sin(t * 0.06 + i * 1.7);
        b.mat.uniforms.dim.value = 1 - 0.45 * Math.min(1, Math.max(0, (dz - 6) / 18));
        V.set(b.pos[0], b.pos[1], b.pos[2]).project(cam); b.sx = (V.x * 0.5 + 0.5) * w; b.sy = (-V.y * 0.5 + 0.5) * hh; b.z = dz; b.sr = dz > 0 ? (b.size * big * f) / dz : 0;
      });
      for (const a of arcLines) if (a.ln.visible) { a.m.uniforms.t.value = t; a.m.uniforms.k.value += (1 - a.m.uniforms.k.value) * Math.min(1, dt * 3); const p = a.g.attributes.position.array, A = bodies[sel].pos, B = bodies[a.to].pos;
        const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 + 0.25 + Math.hypot(A[0] - B[0], A[2] - B[2]) * 0.22, mz = (A[2] + B[2]) / 2;
        for (let q = 0; q < ARC_N; q++) { const u = q / (ARC_N - 1), v = 1 - u; p[q * 3] = v * v * A[0] + 2 * v * u * mx + u * u * B[0]; p[q * 3 + 1] = v * v * A[1] + 2 * v * u * my + u * u * B[1]; p[q * 3 + 2] = v * v * A[2] + 2 * v * u * mz + u * u * B[2]; }
        a.g.attributes.position.needsUpdate = true; }
      R.render(scene, cam);
      /* the star's button and the labels follow the projection; nearer labels win when two would overlap */
      V.set(0, 0, 0).project(cam); core.style.transform = `translate3d(${((V.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-V.y * 0.5 + 0.5) * hh).toFixed(1)}px, 0) translate(-50%, -50%)`;
      core.classList.toggle("far", C.dist < 6);
      const order = bodies.map((b, i) => i).sort((x, y) => bodies[x].z - bodies[y].z), placed = [];
      for (const i of order) { const b = bodies[i]; const lx = b.sx, ly = b.sy + b.sr + 6;
        const cardTop = hh - card.offsetHeight - 14;
        let show = b.z > 0.2 && lx > 24 && lx < w - 24 && ly > 26 && ly < cardTop && (i === sel || (b.sr > 6.5 && placed.length < 12));
        if (show && i !== sel) for (const q of placed) if (Math.abs(q[0] - lx) < 62 && Math.abs(q[1] - ly) < 17) { show = false; break; }
        if (show) placed.push([lx, ly]);
        b.label.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, 0)`;
        b.label.classList.toggle("on", show); b.label.classList.toggle("sel", i === sel); }
    };
    wake();
  }).catch((e) => { console.warn("solar:", e); el.classList.add("sol-flat"); });
  let draw = null, sizeHook = null, arcLines = [];
  function arcs() { if (!arcLines.length) return; const peers = sel >= 0 ? peersFor(bodies[sel].p.id).map((q) => list.indexOf(q)).filter((i) => i >= 0).slice(0, arcLines.length) : [];
    arcLines.forEach((a, k) => { a.to = peers[k] == null ? -1 : peers[k]; a.ln.visible = a.to >= 0; a.m.uniforms.k.value = 0; if (a.to >= 0) a.m.uniforms.c.value.set(...hueRgb(bodies[a.to].p.hue, 0.9, 0.7)); }); }

  function frame(now) { raf = 0; if (dead || !draw) return; draw(now); if (seen && !document.hidden) raf = requestAnimationFrame(frame); }
  const wake = () => { if (!raf && !dead && draw) { last = 0; raf = requestAnimationFrame(frame); } };

  /* touch: one finger turns, two pinch; a tap picks the nearest planet under it (or the star) */
  const ptrs = new Map(); let downX = 0, downY = 0, moved = false, span = 0;
  cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) { downX = e.clientX; downY = e.clientY; moved = false; C.vel = 0; } else { const [a, b] = [...ptrs.values()]; span = Math.hypot(a[0] - b[0], a[1] - b[1]); moved = true; } idleAt = performance.now(); });
  cv.addEventListener("pointermove", (e) => { if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptrs.size === 1) { const dx = e.clientX - prev[0], dy = e.clientY - prev[1]; if (Math.hypot(e.clientX - downX, e.clientY - downY) > 7) moved = true;
      if (moved) { C.tYaw -= dx * 0.0062; C.vel = -dx * 0.0062 * 0.35; C.tPitch = Math.max(0.12, Math.min(1.25, C.tPitch + dy * 0.004)); wake(); } }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const s2 = Math.hypot(a[0] - b[0], a[1] - b[1]); if (span) C.tDist = Math.max(2.2, Math.min(26, C.tDist * (span / s2))); span = s2; wake(); }
    idleAt = performance.now(); });
  const up = (e) => { if (!ptrs.has(e.pointerId)) return; ptrs.delete(e.pointerId); if (ptrs.size || moved) return; pick(e.clientX, e.clientY); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", (e) => ptrs.delete(e.pointerId));
  cv.addEventListener("wheel", (e) => { e.preventDefault(); C.tDist = Math.max(2.2, Math.min(26, C.tDist * Math.exp(e.deltaY * 0.0012))); idleAt = performance.now(); wake(); }, { passive: false });
  function pick(x, y) {
    const r = stage.getBoundingClientRect(), px = x - r.left, py = y - r.top; let best = -1, bz = Infinity;
    bodies.forEach((b, i) => { if (b.z <= 0) return; const d = Math.hypot(b.sx - px, b.sy - py); if (d < b.sr + 16 && b.z < bz) { best = i; bz = b.z; } });
    if (best >= 0) { choose(best); return; }
    if (sel >= 0) overview();
  }
  const onKey = (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || document.querySelector(".modal-back, .sheet-back, .sheet-wrap, dialog[open], #pk-lock")) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); step(e.key === "ArrowLeft" ? -1 : 1); }
    else if (e.key === "Escape" && sel >= 0) overview();
    else if (e.key === "Enter" && sel >= 0 && document.activeElement === document.body) { e.preventDefault(); enter(sel); }
  };
  document.addEventListener("keydown", onKey);
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => { seen = es[0].isIntersecting; if (seen) wake(); }) : null; if (io) io.observe(stage);
  const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener("visibilitychange", onVis);
  /* the whole home fits above the dock: the stage takes what the now line and the card leave */
  function fit() { const view = document.getElementById("view"); if (!view || !stage.isConnected) return; const cur = stage.offsetHeight, spare = view.clientHeight - view.scrollHeight;
    const hgt = Math.max(300, Math.min(900, Math.floor(cur + spare - 2))); if (Math.abs(hgt - cur) > 1) { stage.style.height = hgt + "px"; if (sizeHook) sizeHook(); } }
  const onResize = () => { stage.style.height = ""; requestAnimationFrame(() => { fit(); if (sizeHook) sizeHook(); }); }; addEventListener("resize", onResize);
  const onShow = (e) => { if (e.persisted) { going = false; el.classList.remove("diving"); C.dive = 0; if (sel >= 0) C.tDist = 3.4; wake(); } }; addEventListener("pageshow", onShow);
  el.fit = () => requestAnimationFrame(() => { fit(); requestAnimationFrame(fit); });
  el.ready = ready;
  el.cleanup = () => { dead = true; cancelAnimationFrame(raf); if (io) io.disconnect(); document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); removeEventListener("pageshow", onShow); if (R) R.dispose(); };
  return el;
}
