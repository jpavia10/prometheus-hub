/* Athenaeum sky: the ideas as stars in a real 3D space, drawn with WebGL (no library). One nebula pass, soft point stars, lines with
   light travelling along them, each refinement a moon on its own orbit, the chronicle as a spiral arm. The camera orbits a target and
   eases toward wherever it is sent; labels are real buttons placed over the stars each frame, so the sky can be read and tabbed.
   createSky(canvas, layer, hooks) -> { setIdeas, setLinks, setChron, setClusters, focus, flyHome, setNow, setArm, setShift, ignite,
   project, debug, running, destroy } */

const VS_FULL = `attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP * .5 + .5; gl_Position = vec4(aP, 0., 1.); }`;
const FS_NEB = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv; uniform vec2 uRes; uniform float uTime, uOct; uniform vec2 uCam; uniform vec3 uTintA, uTintB;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { if (float(i) >= uOct) break; s += a * noise(p); p = p * 2.03 + vec2(17., 9.); a *= .5; } return s; }
void main(){
  vec2 uv = (vUv - .5) * vec2(uRes.x / uRes.y, 1.);
  vec2 p = uv * 1.5 + vec2(uCam.x * .42, -uCam.y * .6);
  float w = fbm(p * 1.3 + uTime * .010);
  float n = fbm(p + w * 1.1);
  float m = fbm(p * 2.1 - vec2(uTime * .006, 0.) + 5.);
  vec3 c = vec3(.012, .016, .042);
  c += uTintA * pow(n, 2.1) * .78;
  c += uTintB * pow(m, 2.5) * .62;
  c += vec3(.5, .62, 1.) * pow(max(0., n * m), 2.2) * .9;
  float band = exp(-pow((uv.y + uv.x * .35 + (n - .5) * .5) * 1.7, 2.));
  c += mix(uTintB, uTintA, .5) * band * .2;
  c *= mix(.5, 1., smoothstep(1.3, .2, length(uv)));
  gl_FragColor = vec4(c, 1.);
}`;
const VS_PT = `
attribute vec3 aPos; attribute float aSize; attribute vec4 aCol; attribute vec2 aKind;
uniform mat4 uVP; uniform float uPx, uTime, uMax; varying vec4 vCol; varying vec2 vKind;
void main(){
  vec4 p = uVP * vec4(aPos, 1.); gl_Position = p;
  float tw = aKind.x < .5 ? (.72 + .28 * sin(uTime * (.5 + aKind.y * 1.9) + aKind.y * 40.)) : 1.;
  float haze = aKind.x < .5 ? 1. : clamp(1.75 - p.w * .16, .4, 1.);
  gl_PointSize = clamp(aSize * uPx / max(p.w, .05), 1.5, uMax);
  vCol = vec4(aCol.rgb, aCol.a * tw * haze * step(.05, p.w)); vKind = aKind;
}`;
const FS_PT = `
precision mediump float; varying vec4 vCol; varying vec2 vKind;
void main(){
  vec2 q = gl_PointCoord * 2. - 1.; float r = length(q); if (r > 1.) discard;
  float a; vec3 c = vCol.rgb;
  if (vKind.x < .5) { a = 1. - r; a *= a; }
  else if (vKind.x < 1.5) {
    float core = exp(-r * r * 110.), halo = exp(-r * 4.4) * .62 + exp(-r * r * 9.) * .22;
    float sp = max(0., 1. - abs(q.x) * 16.) * max(0., 1. - abs(q.y) * 1.05) + max(0., 1. - abs(q.y) * 16.) * max(0., 1. - abs(q.x) * 1.05);
    a = (core * 1.8 + halo + sp * .5) * (1. - smoothstep(.7, 1., r)); c = mix(c, vec3(1.), min(1., core * 1.6 + sp * .35));
  } else { float core = exp(-r * r * 14.); a = core + (1. - r) * .12; c = mix(c, vec3(1.), core * .6); }
  gl_FragColor = vec4(c * a * vCol.a, 1.);
}`;
const VS_LN = `
attribute vec3 aA; attribute vec3 aB; attribute vec2 aEnd; attribute vec4 aCol; attribute vec2 aInfo;
uniform mat4 uVP; uniform vec2 uRes; uniform float uWidth, uNow; varying vec4 vCol; varying float vSide, vAlong, vPhase;
void main(){
  vec4 pa = uVP * vec4(aA, 1.), pb = uVP * vec4(aB, 1.);
  if (pa.w < .08 || pb.w < .08) { gl_Position = vec4(2., 2., 2., 1.); vCol = vec4(0.); vSide = 0.; vAlong = 0.; vPhase = 0.; return; }
  vec2 d = (pb.xy / pb.w - pa.xy / pa.w) * uRes; float L = length(d); d = L > .0001 ? d / L : vec2(1., 0.);
  vec4 p = mix(pa, pb, aEnd.x);
  p.xy += vec2(-d.y, d.x) * aEnd.y * uWidth / uRes * 2. * p.w;
  gl_Position = p; vSide = aEnd.y; vAlong = aEnd.x; vPhase = aInfo.y;
  vCol = vec4(aCol.rgb, aCol.a * step(aInfo.x, uNow));
}`;
const FS_LN = `
precision mediump float; varying vec4 vCol; varying float vSide, vAlong, vPhase; uniform float uTime, uPulse, uGain;
void main(){
  float e = 1. - abs(vSide); e *= e;
  float t = fract(vAlong * 1. - uTime * .16 + vPhase);
  float pulse = smoothstep(0., .05, t) * smoothstep(.2, .05, t) * uPulse;
  float fade = smoothstep(0., .12, vAlong) * smoothstep(1., .88, vAlong) * .6 + .4;
  gl_FragColor = vec4(vCol.rgb * vCol.a * uGain * (.5 + 1.9 * pulse) * e * fade, 1.);
}`;

const STRIDE = 10, LSTRIDE = 14;
function persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; }
function look(e, c) {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2]; let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
  let xx = zz, xy = 0, xz = -zx; l = Math.hypot(xx, xz) || 1; xx /= l; xz /= l;                       // up is +y
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx, o = new Float32Array(16);
  o[0] = xx; o[4] = xy; o[8] = xz; o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
  o[1] = yx; o[5] = yy; o[9] = yz; o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
  o[2] = zx; o[6] = zy; o[10] = zz; o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); o[15] = 1; return o;
}
function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
const rnd = (seed) => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export function createSky(canvas, layer, hooks = {}) {
  const still = !!hooks.still, calm = still || matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gl = null, P = {}, B = {}, maxPt = 256, dpr = 1, W = 1, H = 1, ok = false, raf = 0, last = 0, time = 0, slow = 0, oct = 5, quality = 2;
  let ideas = [], links = [], chron = [], groups = [], focusI = -1, focusMix = 0, chronI = -1, now = 1, armGain = .32, armGoal = .32, shift = 0, shiftGoal = 0, shiftX = 0, shiftXGoal = 0, paused = false, idle = 0, dimAll = 1;
  const cam = { yaw: .5, pitch: .3, dist: 4.4, t: [0, 0, 0] }, goal = { yaw: .5, pitch: .3, dist: 4.4, t: [0, 0, 0] }, vel = { yaw: 0, pitch: 0 };
  let home = 4.4, vp = new Float32Array(16), lineCount = 0, armCount = 0, ringCount = 0, dustCount = 0, sprite = new Float32Array(STRIDE * 64), ringBuf = new Float32Array(LSTRIDE * 6 * 64);
  const labels = [], names = [], years = [], rings = [], inset = [112, 150]; const reticle = el("i", "ath-reticle"); reticle.setAttribute("aria-hidden", "true"); layer.append(reticle);

  function compile(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader"); return s; }
  function program(vs, fs, attrs, unis) {
    const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
    const o = { p, a: {}, u: {} }; for (const a of attrs) o.a[a] = gl.getAttribLocation(p, a); for (const u of unis) o.u[u] = gl.getUniformLocation(p, u); return o;
  }
  function init() {
    gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }) || canvas.getContext("experimental-webgl");
    if (!gl) return false;
    try {
      P.neb = program(VS_FULL, FS_NEB, ["aP"], ["uRes", "uTime", "uOct", "uCam", "uTintA", "uTintB"]);
      P.pt = program(VS_PT, FS_PT, ["aPos", "aSize", "aCol", "aKind"], ["uVP", "uPx", "uTime", "uMax"]);
      P.ln = program(VS_LN, FS_LN, ["aA", "aB", "aEnd", "aCol", "aInfo"], ["uVP", "uRes", "uWidth", "uNow", "uTime", "uPulse", "uGain"]);
    } catch (e) { console.warn("Athenaeum sky: " + e.message); gl = null; return false; }
    const r = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE); maxPt = Math.min(r ? r[1] : 64, 420);
    B.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, B.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    B.dust = gl.createBuffer(); B.sprite = gl.createBuffer(); B.line = gl.createBuffer(); B.arm = gl.createBuffer(); B.ring = gl.createBuffer();
    const R = rnd(7), n = 1700, d = new Float32Array(n * STRIDE);
    for (let i = 0; i < n; i++) {
      const u = R() * 2 - 1, th = R() * 6.2832, rad = 3.4 + Math.pow(R(), 1.6) * 9, s = Math.sqrt(1 - u * u), o = i * STRIDE, warm = R();
      d[o] = Math.cos(th) * s * rad; d[o + 1] = u * rad * .8; d[o + 2] = Math.sin(th) * s * rad; d[o + 3] = .018 + Math.pow(R(), 3) * .085;
      d[o + 4] = .72 + warm * .28; d[o + 5] = .78 + R() * .16; d[o + 6] = 1 - warm * .3; d[o + 7] = .35 + R() * .5; d[o + 8] = 0; d[o + 9] = R();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, B.dust); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW); dustCount = n;
    gl.disable(gl.DEPTH_TEST); ok = true; size(); buildLines(); buildArm(); return true;
  }
  function size() {
    const r = canvas.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, quality === 2 ? 2 : quality === 1 ? 1.5 : 1);
    const w = Math.round(W * dpr), h = Math.round(H * dpr); if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    home = W / H < .75 ? 4.15 : W / H < 1.2 ? 3.6 : 3.0; if (gl) gl.viewport(0, 0, w, h);
  }

  /* ---- geometry that only changes when the data does ---- */
  function seg(out, o, a, b, col, alpha, born, phase) {
    const ends = [[0, -1], [1, -1], [1, 1], [0, -1], [1, 1], [0, 1]];
    for (const [e, s] of ends) { out[o++] = a[0]; out[o++] = a[1]; out[o++] = a[2]; out[o++] = b[0]; out[o++] = b[1]; out[o++] = b[2]; out[o++] = e; out[o++] = s; out[o++] = col[0]; out[o++] = col[1]; out[o++] = col[2]; out[o++] = alpha; out[o++] = born; out[o++] = phase; }
    return o;
  }
  function buildLines() {
    if (!ok) return; const out = new Float32Array(links.length * 6 * LSTRIDE); let o = 0;
    links.forEach((l, k) => { const A = ideas[l.a], Bn = ideas[l.b]; if (!A || !Bn) return; const c = [(A.color[0] + Bn.color[0]) / 2, (A.color[1] + Bn.color[1]) / 2, (A.color[2] + Bn.color[2]) / 2];
      o = seg(out, o, A.pos, Bn.pos, c, .16 + Math.min(.5, l.w * .9), Math.max(A.born, Bn.born), (k * .37) % 1); });
    gl.bindBuffer(gl.ARRAY_BUFFER, B.line); gl.bufferData(gl.ARRAY_BUFFER, out.subarray(0, o), gl.STATIC_DRAW); lineCount = o / LSTRIDE;
  }
  function buildArm() {
    if (!ok) return; const n = Math.max(0, chron.length - 1), out = new Float32Array(n * 6 * LSTRIDE); let o = 0;
    for (let i = 0; i < n; i++) o = seg(out, o, chron[i].pos, chron[i + 1].pos, [1, .74, .36], .5, 0, (i * .11) % 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, B.arm); gl.bufferData(gl.ARRAY_BUFFER, out, gl.STATIC_DRAW); armCount = o / LSTRIDE;
  }

  /* ---- labels: real buttons over the stars ---- */
  function syncLabels() {
    while (labels.length > ideas.length) labels.pop().remove();
    ideas.forEach((n, i) => {
      let b = labels[i]; if (!b) { b = el("button", "ath-label"); b.type = "button"; b.append(el("i"), el("span")); labels[i] = b; layer.append(b); b.addEventListener("click", () => hooks.onPick && hooks.onPick("idea", +b.dataset.i)); }
      b.dataset.i = i; b.lastChild.textContent = n.label; b.setAttribute("aria-label", n.title + (n.sats ? `, ${n.sats.length} refinement${n.sats.length === 1 ? "" : "s"}` : "")); b.style.setProperty("--c", `rgb(${n.color.map((x) => Math.round(x * 255)).join(",")})`); b._w = 22 + n.label.length * 6.3;
    });
    while (names.length > groups.length) names.pop().remove();
    groups.forEach((g, i) => { let s = names[i]; if (!s) { s = el("span", "ath-const"); s.setAttribute("aria-hidden", "true"); names[i] = s; layer.prepend(s); } s.textContent = g.name; s.style.setProperty("--c", `rgb(${g.color.map((x) => Math.round(x * 255)).join(",")})`); });
    while (years.length > chron.length) years.pop().remove();
    chron.forEach((e, i) => { let b = years[i]; if (!b) { b = el("button", "ath-year"); b.type = "button"; years[i] = b; layer.append(b); b.addEventListener("click", () => hooks.onPick && hooks.onPick("event", +b.dataset.i)); } b.dataset.i = i; b.textContent = e.short; b.setAttribute("aria-label", e.name + ", " + e.date); });
  }
  function place(node, x, y, op) { if (op < .02) { if (node._on !== 0) { node.style.opacity = "0"; node.style.pointerEvents = "none"; node.tabIndex = -1; node._on = 0; } return; }
    node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; const o = op.toFixed(2); if (node._op !== o) { node.style.opacity = o; node._op = o; }
    if (node._on !== 1) { node.style.pointerEvents = ""; node.tabIndex = 0; node._on = 1; } }

  /* ---- camera ---- */
  function matrices() {
    const cp = Math.cos(cam.pitch), eye = [cam.t[0] + cam.dist * cp * Math.sin(cam.yaw), cam.t[1] + cam.dist * Math.sin(cam.pitch), cam.t[2] + cam.dist * cp * Math.cos(cam.yaw)];
    vp = mul(persp(1.0472, W / H, .05, 60), look(eye, cam.t));
    if (shift) { vp[1] += shift * vp[3]; vp[5] += shift * vp[7]; vp[9] += shift * vp[11]; vp[13] += shift * vp[15]; }     // slide the whole view up when a sheet covers the bottom
    if (shiftX) { vp[0] += shiftX * vp[3]; vp[4] += shiftX * vp[7]; vp[8] += shiftX * vp[11]; vp[12] += shiftX * vp[15]; } // or sideways when a panel covers the right
  }
  function project(p) { const x = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12], y = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13], w = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
    return { x: (x / w * .5 + .5) * W, y: (1 - (y / w * .5 + .5)) * H, w, on: w > .08 }; }
  function ease(dt) {
    const k = 1 - Math.exp(-dt * (still ? 400 : drag.on ? 16 : 3.4));
    cam.yaw += (goal.yaw - cam.yaw) * k; cam.pitch += (goal.pitch - cam.pitch) * k; cam.dist += (goal.dist - cam.dist) * k;
    for (let i = 0; i < 3; i++) cam.t[i] += (goal.t[i] - cam.t[i]) * k;
    shift += (shiftGoal - shift) * (1 - Math.exp(-dt * (still ? 400 : 6))); shiftX += (shiftXGoal - shiftX) * (1 - Math.exp(-dt * (still ? 400 : 6))); armGain += (armGoal - armGain) * (1 - Math.exp(-dt * (still ? 400 : 4)));
    focusMix += ((focusI >= 0 ? 1 : 0) - focusMix) * (1 - Math.exp(-dt * (still ? 400 : 5)));
    if (!drag.on && (Math.abs(vel.yaw) > .0002 || Math.abs(vel.pitch) > .0002)) { goal.yaw += vel.yaw * dt; goal.pitch = Math.max(-1.25, Math.min(1.25, goal.pitch + vel.pitch * dt)); const f = Math.exp(-dt * 3.4); vel.yaw *= f; vel.pitch *= f; }
    idle += dt; if (!calm && !drag.on && focusI < 0 && chronI < 0 && idle > 3.5 && !paused) goal.yaw += dt * .028;
  }

  /* ---- one frame ---- */
  function basis(i) { const R = rnd(i * 977 + 13), a = R() * 6.2832, t = (R() - .5) * 1.3; const u = [Math.cos(a), Math.sin(t) * .5, Math.sin(a)], l = Math.hypot(u[0], u[1], u[2]); u[0] /= l; u[1] /= l; u[2] /= l;
    let v = [-u[2], .35 + R() * .5, u[0]]; const d = v[0] * u[0] + v[1] * u[1] + v[2] * u[2]; v = [v[0] - u[0] * d, v[1] - u[1] * d, v[2] - u[2] * d]; const m = Math.hypot(v[0], v[1], v[2]); return [u, [v[0] / m, v[1] / m, v[2] / m], R() * 6.2832]; }
  function draw(dt) {
    ease(dt); matrices();
    const need = (ideas.length + chron.length + ideas.reduce((s, n) => s + (n.sats ? n.sats.length : 0), 0) + 8) * STRIDE; if (sprite.length < need) sprite = new Float32Array(need * 2);
    let o = 0, ro = 0; const put = (p, s, c, a, kind, ph) => { sprite[o++] = p[0]; sprite[o++] = p[1]; sprite[o++] = p[2]; sprite[o++] = s; sprite[o++] = c[0]; sprite[o++] = c[1]; sprite[o++] = c[2]; sprite[o++] = a; sprite[o++] = kind; sprite[o++] = ph; };
    const shown = [];
    ideas.forEach((n, i) => {
      const sc = project(n.pos); n._s = sc; if (now < n.born) { n._a = 0; shown.push(null); return; }
      const age = now - n.born, flash = Math.max(0, 1 - age / .035), foc = i === focusI ? focusMix : 0, quiet = n.dim ? .16 : focusI >= 0 && i !== focusI && !n.near ? .5 : 1;
      n._a = quiet; const breathe = calm ? 1 : 1 + .05 * Math.sin(time * 1.1 + i * 1.7);
      put(n.pos, n.size * (.52 + .26 * foc + .6 * flash) * breathe, n.color, Math.min(1.8, quiet * (1.15 + .5 * foc + 1.2 * flash)), 1, i * .13);
      if (!n._b) n._b = basis(i);
      const [u, v, ph] = n._b, live = (n.sats || []).filter((s) => now >= s.born), spread = 1 + .9 * foc;
      live.forEach((s, k) => {
        const rad = (.085 + .03 * k) * n.size * spread, ang = ph + k * 2.4 + (calm ? 0 : time * (.55 / (1 + k * .28))), ca = Math.cos(ang) * rad, sa = Math.sin(ang) * rad;
        put([n.pos[0] + u[0] * ca + v[0] * sa, n.pos[1] + u[1] * ca + v[1] * sa, n.pos[2] + u[2] * ca + v[2] * sa], .075 + .012 * foc, [.55 + .45 * n.color[0], .55 + .45 * n.color[1], .55 + .45 * n.color[2]], quiet * (.9 + .3 * foc) * Math.min(1, (now - s.born) / .01 + .3), 2, k * .3);
        if (foc > .05 && ro + 40 * 6 * LSTRIDE <= ringBuf.length) { let prev = null; for (let j = 0; j <= 40; j++) { const a2 = j / 40 * 6.2832, c2 = Math.cos(a2) * rad, s2 = Math.sin(a2) * rad, p2 = [n.pos[0] + u[0] * c2 + v[0] * s2, n.pos[1] + u[1] * c2 + v[1] * s2, n.pos[2] + u[2] * c2 + v[2] * s2]; if (prev) ro = seg(ringBuf, ro, prev, p2, n.color, .2 * foc, 0, 0); prev = p2; } }
      });
      shown.push(sc);
    });
    chron.forEach((e, i) => { const sc = project(e.pos); e._s = sc; const foc = i === chronI ? 1 : 0; put(e.pos, .2 + .22 * foc, foc ? [1, .9, .66] : [1, .74, .36], Math.min(1.5, armGain * (1 + 1.4 * foc)), 1, i * .21); });
    const sprites = o / STRIDE; ringCount = ro / LSTRIDE;

    gl.disable(gl.BLEND); gl.useProgram(P.neb.p); gl.bindBuffer(gl.ARRAY_BUFFER, B.quad); gl.enableVertexAttribArray(P.neb.a.aP); gl.vertexAttribPointer(P.neb.a.aP, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(P.neb.u.uRes, canvas.width, canvas.height); gl.uniform1f(P.neb.u.uTime, time); gl.uniform1f(P.neb.u.uOct, oct); gl.uniform2f(P.neb.u.uCam, cam.yaw, cam.pitch);
    const tA = groups[0] ? groups[0].color : [1, .77, .32], tB = groups[1] ? groups[1].color : [.72, .63, 1];
    gl.uniform3f(P.neb.u.uTintA, tA[0] * .5 * dimAll, tA[1] * .42 * dimAll, tA[2] * .6 * dimAll); gl.uniform3f(P.neb.u.uTintB, tB[0] * .5 * dimAll, tB[1] * .5 * dimAll, tB[2] * .8 * dimAll);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.disableVertexAttribArray(P.neb.a.aP);

    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    const pts = (buf, count, dynamic) => { if (!count) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); if (dynamic) gl.bufferData(gl.ARRAY_BUFFER, sprite.subarray(0, count * STRIDE), gl.DYNAMIC_DRAW);
      const a = P.pt.a, S = STRIDE * 4; gl.enableVertexAttribArray(a.aPos); gl.vertexAttribPointer(a.aPos, 3, gl.FLOAT, false, S, 0); gl.enableVertexAttribArray(a.aSize); gl.vertexAttribPointer(a.aSize, 1, gl.FLOAT, false, S, 12);
      gl.enableVertexAttribArray(a.aCol); gl.vertexAttribPointer(a.aCol, 4, gl.FLOAT, false, S, 16); gl.enableVertexAttribArray(a.aKind); gl.vertexAttribPointer(a.aKind, 2, gl.FLOAT, false, S, 32); gl.drawArrays(gl.POINTS, 0, count); };
    const lns = (buf, count, width, pulse, gain, data) => { if (!count) return; gl.bindBuffer(gl.ARRAY_BUFFER, buf); if (data) gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      const a = P.ln.a, S = LSTRIDE * 4; gl.enableVertexAttribArray(a.aA); gl.vertexAttribPointer(a.aA, 3, gl.FLOAT, false, S, 0); gl.enableVertexAttribArray(a.aB); gl.vertexAttribPointer(a.aB, 3, gl.FLOAT, false, S, 12);
      gl.enableVertexAttribArray(a.aEnd); gl.vertexAttribPointer(a.aEnd, 2, gl.FLOAT, false, S, 24); gl.enableVertexAttribArray(a.aCol); gl.vertexAttribPointer(a.aCol, 4, gl.FLOAT, false, S, 32); gl.enableVertexAttribArray(a.aInfo); gl.vertexAttribPointer(a.aInfo, 2, gl.FLOAT, false, S, 48);
      gl.uniform1f(P.ln.u.uWidth, width * dpr); gl.uniform1f(P.ln.u.uPulse, calm ? 0 : pulse); gl.uniform1f(P.ln.u.uGain, gain); gl.drawArrays(gl.TRIANGLES, 0, count); };
    gl.useProgram(P.ln.p); gl.uniformMatrix4fv(P.ln.u.uVP, false, vp); gl.uniform2f(P.ln.u.uRes, canvas.width, canvas.height); gl.uniform1f(P.ln.u.uNow, now); gl.uniform1f(P.ln.u.uTime, time);
    lns(B.arm, armCount, 1.9, .7, (armGain * 1.5 + .1) * dimAll); lns(B.line, lineCount, 2.2, 1, (focusI >= 0 ? .55 : 1) * dimAll); if (ringCount) lns(B.ring, ringCount, 1.1, 0, 1, ringBuf.subarray(0, ro));
    for (const k in P.ln.a) gl.disableVertexAttribArray(P.ln.a[k]);
    gl.useProgram(P.pt.p); gl.uniformMatrix4fv(P.pt.u.uVP, false, vp); gl.uniform1f(P.pt.u.uPx, canvas.height / (2 * Math.tan(.5236))); gl.uniform1f(P.pt.u.uTime, calm ? 0 : time); gl.uniform1f(P.pt.u.uMax, Math.min(maxPt, 190 * dpr));
    pts(B.dust, dustCount, false); pts(B.sprite, sprites, true);
    for (const k in P.pt.a) gl.disableVertexAttribArray(P.pt.a[k]);
    overlay(shown);
  }
  function overlay(shown) {
    const taken = [], order = ideas.map((n, i) => i).sort((a, b) => (b === focusI) - (a === focusI) || (ideas[b].near ? 1 : 0) - (ideas[a].near ? 1 : 0) || (ideas[a]._s ? ideas[a]._s.w : 9) - (ideas[b]._s ? ideas[b]._s.w : 9));
    const show = new Array(ideas.length).fill(0); let considered = 0;
    for (const i of order) { if (++considered > 70) break;                         // a very large sky labels only what is nearest
      const sc = shown[i], n = ideas[i], b = labels[i]; if (!sc || !sc.on || !b) continue;
      if (sc.x < -20 || sc.x > W + 20 || sc.y < inset[0] || sc.y > H - inset[1]) continue;
      const half = b._w / 2, lx = Math.max(half + 6, Math.min(W - half - 6, sc.x)); n._lx = lx;
      let op = n.dim ? 0 : i === focusI ? 0 : Math.max(0, Math.min(1, 2.1 - sc.w * .26)) * (focusI >= 0 && !n.near ? .0 : 1) * (1 - Math.min(1, Math.max(0, armGain - .5) * 2.4));
      const box = [lx - half, sc.y + 12, lx + half, sc.y + 36]; if (op > .05 && taken.some((t) => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) op = 0; if (op > .05) taken.push(box); show[i] = op; }
    ideas.forEach((n, i) => { const b = labels[i], sc = shown[i]; if (b) place(b, sc ? n._lx || sc.x : 0, sc ? sc.y + 13 : 0, sc ? show[i] : 0); });
    groups.forEach((g, i) => { const s = names[i]; if (!s) return; const live = g.members.filter((m) => ideas[m] && now >= ideas[m].born); if (!live.length) return place(s, 0, 0, 0);
      const c = [0, 0, 0]; for (const m of live) { c[0] += ideas[m].pos[0]; c[1] += ideas[m].pos[1]; c[2] += ideas[m].pos[2]; } const sc = project([c[0] / live.length, c[1] / live.length + .34, c[2] / live.length]);
      const nw = g.name.length * 12 + 20, nb = [sc.x - nw / 2, sc.y - 10, sc.x + nw / 2, sc.y + 10], clash = taken.some((t) => nb[0] < t[2] && nb[2] > t[0] && nb[1] < t[3] && nb[3] > t[1]);
      place(s, sc.x, sc.y, W >= 700 && sc.on && !clash && sc.y > inset[0] && focusI < 0 && armGain < .6 ? Math.max(0, Math.min(.62, 1.5 - sc.w * .2)) : 0); if (!clash) taken.push(nb); });
    const yt = []; chron.forEach((e, i) => { const b = years[i], sc = e._s; if (!b) return; let op = sc && sc.on && armGain > .6 && sc.y > inset[0] - 14 && sc.y < H - inset[1] ? Math.max(0, Math.min(1, 2 - sc.w * .22)) : 0; if (i === chronI) op = 0;
      if (op > .05) { const box = [sc.x - 26, sc.y + 8, sc.x + 26, sc.y + 26]; if (yt.some((t) => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) op = 0; else yt.push(box); } place(b, sc ? sc.x : 0, sc ? sc.y + 9 : 0, op); });
    const f = focusI >= 0 ? ideas[focusI] && ideas[focusI]._s : chronI >= 0 ? chron[chronI] && chron[chronI]._s : null;
    if (f && f.on) { reticle.style.transform = `translate3d(${f.x.toFixed(1)}px,${f.y.toFixed(1)}px,0)`; reticle.style.opacity = "1"; reticle.style.setProperty("--s", Math.max(.6, Math.min(1.6, 3.4 / f.w)).toFixed(2)); } else reticle.style.opacity = "0";
    for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i], n = ideas[r.i]; if (!n || !n._s || performance.now() - r.at > 1400) { r.node.remove(); rings.splice(i, 1); continue; } r.node.style.transform = `translate3d(${n._s.x.toFixed(1)}px,${n._s.y.toFixed(1)}px,0)`; }
  }
  function frame(t) {
    raf = requestAnimationFrame(frame); if (paused || document.hidden || !ok) { last = t; return; }
    const dt = Math.min(.05, (t - last) / 1000 || .016), real = (t - last) / 1000; last = t; time += dt;
    if (real > .034) { if (++slow > 45 && quality > 0) { quality--; slow = 0; oct = quality === 1 ? 4 : 3; size(); } } else if (slow > 0) slow--;
    draw(dt); if (hooks.onFrame) hooks.onFrame();
  }

  /* ---- hands ---- */
  const drag = { on: false, x: 0, y: 0, x0: 0, y0: 0, t0: 0, moved: 0, pinch: 0, ids: new Map() };
  function down(e) { canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); drag.ids.set(e.pointerId, [e.clientX, e.clientY]); idle = 0;
    if (drag.ids.size === 1) { drag.on = true; drag.x = drag.x0 = e.clientX; drag.y = drag.y0 = e.clientY; drag.t0 = performance.now(); drag.moved = 0; vel.yaw = vel.pitch = 0; }
    else if (drag.ids.size === 2) { const p = [...drag.ids.values()]; drag.pinch = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); drag.moved = 99; } }
  function move(e) { if (!drag.ids.has(e.pointerId)) return; drag.ids.set(e.pointerId, [e.clientX, e.clientY]); idle = 0;
    if (drag.ids.size >= 2) { const p = [...drag.ids.values()], d = Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]); if (drag.pinch > 0) goal.dist = Math.max(.9, Math.min(11, goal.dist * drag.pinch / Math.max(1, d))); drag.pinch = d; return; }
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved < 6) return; const k = .0058 * Math.min(1.6, Math.max(.5, cam.dist / 4)); goal.yaw -= dx * k; goal.pitch = Math.max(-1.25, Math.min(1.25, goal.pitch + dy * k)); vel.yaw = -dx * k * 60 * .28; vel.pitch = dy * k * 60 * .28; }
  function up(e) { const had = drag.ids.size; drag.ids.delete(e.pointerId); if (drag.ids.size) { drag.pinch = 0; return; } drag.on = false;
    if (had === 1 && drag.moved < 8 && performance.now() - drag.t0 < 450) { vel.yaw = vel.pitch = 0; const r = canvas.getBoundingClientRect(); tap(e.clientX - r.left, e.clientY - r.top); } }
  function tap(x, y) {
    let best = null, bd = 34 * 34; ideas.forEach((n, i) => { if (!n._s || !n._s.on || now < n.born || n.dim) return; const d = (n._s.x - x) ** 2 + (n._s.y - y) ** 2; if (d < bd) { bd = d; best = ["idea", i]; } });
    if (!best || armGain > .6) { let cd = best ? bd : 30 * 30; chron.forEach((e, i) => { if (!e._s || !e._s.on) return; const d = (e._s.x - x) ** 2 + (e._s.y - y) ** 2; if (d < cd && (armGain > .6 || !best)) { cd = d; best = ["event", i]; } }); }
    if (hooks.onPick) best ? hooks.onPick(best[0], best[1]) : hooks.onPick(null, -1);
  }
  function wheel(e) { e.preventDefault(); idle = 0; goal.dist = Math.max(.9, Math.min(11, goal.dist * Math.exp(e.deltaY * .0012))); }
  canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up); canvas.addEventListener("wheel", wheel, { passive: false });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); ok = false; }); canvas.addEventListener("webglcontextrestored", () => { init(); });
  const onSize = () => { size(); if (still && ok) draw(0); }; window.addEventListener("resize", onSize);

  const api = {
    get ok() { return ok; },
    setIdeas(list) { ideas = list; if (focusI >= ideas.length) focusI = -1; buildLines(); syncLabels(); },
    setLinks(list) { links = list; buildLines(); },
    setChron(list) { chron = list; buildArm(); syncLabels(); },
    setClusters(list) { groups = list; syncLabels(); },
    /** Fly to an idea (index), a chronicle entry, or back out. */
    focus(kind, i) {
      idle = 0; vel.yaw = vel.pitch = 0;
      if (kind === "idea" && ideas[i]) { focusI = i; chronI = -1; const p = ideas[i].pos; goal.t = [p[0], p[1], p[2]]; goal.dist = Math.max(2.0, home * .5); ideas.forEach((n, k) => { n.near = k === i || links.some((l) => (l.a === i && l.b === k) || (l.b === i && l.a === k)); });
        const back = Math.atan2(p[0], p[2]); let d = back - goal.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); goal.yaw += d * .55; goal.pitch = Math.max(-.5, Math.min(.6, .18 + p[1] * .35)); }
      else if (kind === "event" && chron[i]) { chronI = i; focusI = -1; const p = chron[i].pos; goal.t = [p[0] * .82, p[1] + .1, p[2] * .82]; goal.dist = 2.3; const back = Math.atan2(p[0], p[2]); let d = back - goal.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); goal.yaw += d; goal.pitch = .42; ideas.forEach((n) => { n.near = false; }); }
      else { focusI = -1; chronI = -1; ideas.forEach((n) => { n.near = false; }); }
      if (still && ok) draw(0);
    },
    flyHome(mode) { focusI = -1; chronI = -1; ideas.forEach((n) => { n.near = false; }); goal.t = mode === "chronicle" ? [0, -.55, 0] : [0, 0, 0]; goal.dist = mode === "chronicle" ? home * 1.5 : home; goal.pitch = mode === "chronicle" ? .78 : .3; idle = 0; if (still && ok) draw(0); },
    /** Look at a place in the sky without choosing a star (a constellation's middle). */
    lookAt(p, dist) { idle = 0; focusI = -1; chronI = -1; goal.t = [p[0], p[1], p[2]]; goal.dist = dist || home * .7; if (still && ok) draw(0); },
    setArm(on) { armGoal = on ? 1 : .32; }, setShift(s, x) { shiftGoal = s; shiftXGoal = x || 0; }, setNow(t) { now = t; if (still && ok) draw(0); }, setDim(d) { dimAll = d; },
    refresh() { if (ok) draw(0); },
    ignite(i) { const r = el("i", "ath-ring"); r.setAttribute("aria-hidden", "true"); layer.append(r); rings.push({ i, node: r, at: performance.now() }); },
    nudge(dyaw, dpitch, zoom) { idle = 0; goal.yaw += dyaw; goal.pitch = Math.max(-1.25, Math.min(1.25, goal.pitch + dpitch)); if (zoom) goal.dist = Math.max(.9, Math.min(11, goal.dist * zoom)); },
    pause(p) { paused = p; }, project, setInsets(top, bottom) { inset[0] = top; inset[1] = bottom; },
    debug() { return { ok, quality, focus: focusI, event: chronI, now, cam: { ...cam, t: [...cam.t] }, ideas: ideas.map((n) => n._s && { id: n.id, x: Math.round(n._s.x), y: Math.round(n._s.y), on: n._s.on && now >= n.born }), size: [W, H], sprites: ideas.length, lines: lineCount / 6, arm: armCount / 6 }; },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", onSize); },
  };
  if (init()) { goal.dist = cam.dist = home; if (still) draw(0); raf = requestAnimationFrame(frame); }
  return api;
}
