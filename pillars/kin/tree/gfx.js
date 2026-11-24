/* Kin · the family tree in 3D: the drawing pieces (light ribbons, medallions, the sky, the dust of time, the surface).
   All hand-written shaders on the kit's vendored three.js; no post-processing pass, so it holds 60 fps on a phone. */
import * as THREE from "three";

export const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const rgba = (h, a) => { const [r, g, b] = hexRGB(h); return `rgba(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0},${a})`; };

/* ------------------------------------------------------------------ light ribbons
   Every line in the scene (lifelines, the bridges from a child to its parents, the year rings, the globe's journeys) is one
   ribbon in a single draw call: a strip that keeps a soft core a few pixels wide whatever the distance, with light running
   along it. kind: 0 lifeline, 1 bridge (light flows down to you), 2 unsure bridge (dashed), 3 ring, 4 open end, 5 journey. */
const RV = `
uniform vec2 uRes; uniform float uPx;
attribute vec3 prev; attribute vec3 next; attribute float side; attribute float u; attribute vec3 col; attribute float a;
attribute float g; attribute float hi; attribute float kind; attribute vec2 life; attribute float len; attribute float w; attribute float fe;
varying float vSide; varying float vU; varying vec3 vCol; varying float vA; varying float vG; varying float vHi; varying float vKind;
varying vec2 vLife; varying float vLen; varying float vDepth; varying float vFe; varying float vYear;
void main() {
  mat4 pvm = projectionMatrix * modelViewMatrix;
  vec4 c = pvm * vec4(position, 1.0), p = pvm * vec4(prev, 1.0), n = pvm * vec4(next, 1.0);
  if (c.w <= 0.05) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  p.w = max(p.w, 0.05); n.w = max(n.w, 0.05);
  vec2 h = uRes * 0.5, cs = c.xy / c.w * h, ps = p.xy / p.w * h, ns = n.xy / n.w * h;
  vec2 d1 = cs - ps, d2 = ns - cs, d;
  if (length(d1) < 1e-4) d = normalize(d2 + 1e-6); else if (length(d2) < 1e-4) d = normalize(d1); else d = normalize(normalize(d1) + normalize(d2));
  vec2 nrm = vec2(-d.y, d.x);
  float px = w * uPx * 1.7 * clamp(30.0 / c.w, 0.8, 1.5) * (1.0 + hi * 0.6);
  c.xy += nrm * side * px / h * c.w;
  gl_Position = c;
  vSide = side; vU = u; vCol = col; vA = a; vG = g; vHi = hi; vKind = kind; vLife = life; vLen = len; vFe = fe;
  vDepth = (modelViewMatrix * vec4(position, 1.0)).z * -1.0;
  vYear = mix(life.x, life.y, u);
}`;
const RF = `
uniform float uTime; uniform float uGrow; uniform float uSel; uniform float uTimeOn; uniform float uYear; uniform float uFog;
varying float vSide; varying float vU; varying vec3 vCol; varying float vA; varying float vG; varying float vHi; varying float vKind;
varying vec2 vLife; varying float vLen; varying float vDepth; varying float vFe; varying float vYear;
void main() {
  float k = vKind;
  float grow = k < 0.5 ? vG + 0.2 + vU * 0.8 : (k < 2.5 ? vG + vU : (k < 3.5 ? -1.0 : (k < 4.5 ? vG + 1.0 + vU : -1.0)));
  if (grow > uGrow) discard;
  if (k > 1.5 && k < 2.5 && fract(vU * vLen * 0.55) > 0.5) discard;
  float core = exp(-vSide * vSide * 10.0) + 0.32 * exp(-vSide * vSide * 1.8);
  float b = core;
  float flow = 0.0;
  if ((k > 0.5 && k < 2.5) || (k > 4.5)) { float q = fract(vU * vLen * 0.09 + uTime * (k > 4.5 ? -0.32 : 0.3)); flow = smoothstep(0.86, 1.0, q) * 1.6; }
  if (k < 0.5) { float q = fract(vU * vLen * 0.05 - uTime * 0.08); flow = smoothstep(0.93, 1.0, q) * 0.7; }
  float ends = k < 0.5 ? smoothstep(0.0, 0.03, vU) * mix(1.0, 1.0 - smoothstep(0.45, 1.0, vU), vFe) : 1.0;
  if (k > 3.5 && k < 4.5) ends = 1.0 - vU;
  float dim = k > 2.5 && k < 3.5 ? 1.0 : mix(1.0, mix(0.16, 1.0, vHi), uSel);
  float alive = 1.0;
  if (uTimeOn > 0.5 && k < 2.5) {
    float on = k < 0.5 ? step(vLife.x, uYear) * step(uYear, vLife.y) : step(vLife.x, uYear);
    alive = mix(0.18, 1.25, on);
    if (k < 0.5) alive += 1.6 * on * exp(-pow((vYear - uYear) * 0.25, 2.0));
  }
  if (uTimeOn > 0.5 && k > 4.5) alive = mix(0.07, 1.3, step(vLife.x, uYear));
  float fog = exp(-max(vDepth - 40.0, 0.0) * uFog) * smoothstep(2.0, 9.0, vDepth);
  float a = vA * b * dim * alive * fog * ends;
  vec3 colr = vCol * (1.0 + flow * (0.6 + vHi)) + vec3(flow * 0.25);
  gl_FragColor = vec4(colr * a, a);
}`;

export function ribbons(lines, uniforms) {
  let nv = 0, ni = 0;
  for (const l of lines) { nv += l.pts.length * 2; ni += (l.pts.length - 1) * 6; }
  const F = (k) => new Float32Array(nv * k);
  const A = { position: F(3), prev: F(3), next: F(3), side: F(1), u: F(1), col: F(3), a: F(1), g: F(1), hi: F(1), kind: F(1), life: F(2), len: F(1), w: F(1), fe: F(1) };
  const idx = new Uint32Array(ni);
  let v = 0, k = 0;
  for (const l of lines) {
    const N = l.pts.length; l.v0 = v; l.nv = N * 2;
    const cum = [0]; let T = 0;
    for (let i = 1; i < N; i++) { T += l.pts[i].distanceTo(l.pts[i - 1]); cum.push(T); }
    const c = l.col;
    for (let i = 0; i < N; i++) {
      const P = l.pts[i], Pp = l.pts[Math.max(0, i - 1)], Pn = l.pts[Math.min(N - 1, i + 1)];
      for (const s of [-1, 1]) {
        A.position.set([P.x, P.y, P.z], v * 3); A.prev.set([Pp.x, Pp.y, Pp.z], v * 3); A.next.set([Pn.x, Pn.y, Pn.z], v * 3);
        A.side[v] = s; A.u[v] = T ? cum[i] / T : 0; A.col.set(c, v * 3); A.a[v] = l.a; A.g[v] = l.g || 0; A.hi[v] = 0; A.kind[v] = l.kind;
        A.life.set(l.life || [0, 9999], v * 2); A.len[v] = T; A.w[v] = l.w || 2; A.fe[v] = l.fe ? 1 : 0;
        v++;
      }
    }
    for (let i = 0; i < N - 1; i++) { const b = l.v0 + i * 2; idx.set([b, b + 1, b + 2, b + 1, b + 3, b + 2], k); k += 6; }
  }
  const geo = new THREE.BufferGeometry();
  for (const [name, arr] of Object.entries(A)) geo.setAttribute(name, new THREE.BufferAttribute(arr, arr.length / nv));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeBoundingSphere();
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: RV, fragmentShader: RF, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  const setHi = (fn) => { const hi = geo.attributes.hi.array; for (const l of lines) { const val = fn(l) || 0; hi.fill(val, l.v0, l.v0 + l.nv); } geo.attributes.hi.needsUpdate = true; };
  return { mesh, setHi, lines };
}

export function ribbonUniforms(px) {
  return { uRes: { value: new THREE.Vector2(1, 1) }, uPx: { value: px }, uTime: { value: 0 }, uGrow: { value: 99 }, uSel: { value: 0 }, uTimeOn: { value: 0 }, uYear: { value: 2026 }, uFog: { value: 0.0045 } };
}

/* a gentle curve between two points: the bridge from a child's birth to a parent's lifeline sags a little into the past */
export function bridge(a, b, sag = 0.9, n = 18) {
  const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
  const c = new THREE.QuadraticBezierCurve3(a, mid, b);
  return c.getPoints(n);
}
export function ring(r, y, n = 120) { const out = []; for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI * 2; out.push(new THREE.Vector3(r * Math.cos(t), y, r * Math.sin(t))); } return out; }

/* ------------------------------------------------------------------ medallions: a portrait or a monogram in a ring of its status */
export function medallion(n, opts) {
  const S = 256, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const x = cv.getContext("2d"), cx = S / 2, R = 116, col = opts.color;
  x.save(); x.beginPath(); x.arc(cx, cx, R, 0, Math.PI * 2); x.closePath(); x.clip();
  const bg = x.createRadialGradient(cx, cx - R * 0.45, R * 0.05, cx, cx, R);
  bg.addColorStop(0, opts.ghost ? "#172038" : "#24345a"); bg.addColorStop(1, opts.ghost ? "#060912" : "#070b17");
  x.fillStyle = bg; x.fillRect(0, 0, S, S);
  if (opts.face) {
    x.drawImage(opts.face, cx - R, cx - R, R * 2, R * 2);
    const vg = x.createRadialGradient(cx, cx, R * 0.55, cx, cx, R); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(2,4,10,.55)");
    x.fillStyle = vg; x.fillRect(0, 0, S, S);
  } else {
    const tint = x.createRadialGradient(cx, cx + R * 0.6, 0, cx, cx + R * 0.6, R * 1.2); tint.addColorStop(0, rgba(col, opts.ghost ? 0.1 : 0.26)); tint.addColorStop(1, rgba(col, 0));
    x.fillStyle = tint; x.fillRect(0, 0, S, S);
    const t = opts.text || "?", big = t.length <= 2;
    x.font = `${opts.ghost ? "italic 500" : "600"} ${big ? R * 0.92 : R * 0.6}px "Cormorant Garamond", Georgia, serif`;
    x.textAlign = "center"; x.textBaseline = "middle";
    x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 8;
    x.fillStyle = opts.ghost ? "rgba(196,206,228,.5)" : "#f7eed9";
    x.fillText(t, cx, cx + R * 0.07);
    x.shadowBlur = 0;
  }
  const hl = x.createLinearGradient(0, cx - R, 0, cx + R * 0.1); hl.addColorStop(0, "rgba(255,255,255,.18)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = hl; x.beginPath(); x.ellipse(cx, cx - R * 0.42, R * 0.82, R * 0.56, 0, 0, Math.PI * 2); x.fill();
  x.restore();
  x.lineWidth = opts.self ? 11 : 8; x.strokeStyle = col;
  if (opts.ghost) x.setLineDash([12, 10]);
  x.beginPath(); x.arc(cx, cx, R - 4, 0, Math.PI * 2); x.stroke(); x.setLineDash([]);
  x.lineWidth = 1.6; x.strokeStyle = rgba(col, 0.55); x.beginPath(); x.arc(cx, cx, R - 15, 0, Math.PI * 2); x.stroke();
  if (opts.proven) { x.fillStyle = col; x.beginPath(); x.moveTo(cx, cx - R - 2); x.lineTo(cx + 9, cx - R + 9); x.lineTo(cx, cx - R + 20); x.lineTo(cx - 9, cx - R + 9); x.closePath(); x.fill(); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true;
  return tex;
}

let _halo;
export function haloTexture() {
  if (_halo) return _halo;
  const S = 128, cv = document.createElement("canvas"); cv.width = cv.height = S; const x = cv.getContext("2d");
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(0.18, "rgba(255,255,255,.42)"); g.addColorStop(0.45, "rgba(255,255,255,.1)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  _halo = new THREE.CanvasTexture(cv); _halo.colorSpace = THREE.SRGBColorSpace;
  return _halo;
}

/* ------------------------------------------------------------------ the sky above the present and the dark of the past below it */
export function sky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec3 vD; uniform float uTime;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
      void main(){
        float y = vD.y;
        vec3 above = mix(vec3(0.045, 0.06, 0.13), vec3(0.012, 0.016, 0.04), smoothstep(0.0, 0.7, y));
        vec3 below = mix(vec3(0.03, 0.05, 0.09), vec3(0.006, 0.008, 0.016), smoothstep(0.0, -0.55, y));
        vec3 c = y > 0.0 ? above : below;
        c += vec3(0.10, 0.08, 0.05) * exp(-abs(y) * 9.0) * 0.55;
        vec3 q = floor(vD * 340.0); float s = h(q);
        float star = step(0.9965, s) * smoothstep(0.02, 0.25, y) * (0.55 + 0.45 * sin(uTime * 1.3 + s * 60.0));
        c += vec3(star * 0.8);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(600, 48, 24), mat);
  m.renderOrder = -10;
  return m;
}

/* the dust of time: motes drifting up through the generations */
export function dust(count, R, yMin) {
  const pos = new Float32Array(count * 3), seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * R, t = Math.random() * Math.PI * 2;
    pos.set([r * Math.cos(t), yMin - 6 + Math.random() * (14 - yMin), r * Math.sin(t)], i * 3); seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uSpan: { value: 20 - yMin }, uBase: { value: yMin - 6 } },
    vertexShader: `attribute float seed; uniform float uTime; uniform float uPx; uniform float uSpan; uniform float uBase; varying float vA; varying float vW;
      void main(){ vec3 p = position; p.y = uBase + mod(p.y - uBase + uTime * (0.12 + seed * 0.3), uSpan);
        p.x += sin(uTime * 0.13 + seed * 40.0) * 0.9; p.z += cos(uTime * 0.11 + seed * 23.0) * 0.9;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = uPx * (1.2 + seed * 3.2) * clamp(40.0 / -mv.z, 0.4, 5.0);
        vA = (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.6 + seed) + seed * 50.0))) * smoothstep(170.0, 25.0, -mv.z) * smoothstep(0.5, 6.0, -mv.z);
        vW = step(0.94, seed); }`,
    fragmentShader: `varying float vA; varying float vW; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.5;
        vec3 c = mix(vec3(0.62, 0.78, 1.0), vec3(1.0, 0.86, 0.58), vW); gl_FragColor = vec4(c * a, a); }`,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 1;
  return pts;
}

/* the present: a sheet of light at 2026, ringed at every generation */
export function surface(R, RS, tint = 0) {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uR: { value: R }, uRS: { value: RS }, uTint: { value: tint } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying vec2 vP; uniform float uTime; uniform float uR; uniform float uRS; uniform float uTint;
      void main(){ float r = length(vP); float edge = 1.0 - smoothstep(uR * 0.55, uR, r);
        float gr = abs(fract(r / uRS + 0.5) - 0.5) * uRS; float rings = (1.0 - smoothstep(0.0, 0.09, gr)) * step(uRS * 0.5, r);
        float ang = atan(vP.y, vP.x); float ticks = (1.0 - smoothstep(0.0, 0.02, abs(fract(ang * 36.0 / 6.2831853) - 0.5) - 0.47)) * step(0.0, rings - 0.5);
        float core = exp(-r * 0.22) * 0.5;
        float wave = 0.5 + 0.5 * sin(r * 0.6 - uTime * 0.9);
        float a = (0.035 + rings * (0.16 + 0.08 * wave) + core) * edge;
        vec3 c = mix(mix(vec3(0.55, 0.75, 1.0), vec3(1.0, 0.9, 0.7), core * 1.4), vec3(1.0, 0.8, 0.45), uTint);
        a *= mix(1.0, 0.75, uTint);
        gl_FragColor = vec4(c * a, a); }`,
  });
  const m = new THREE.Mesh(new THREE.CircleGeometry(R, 128), mat);
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1;
  return m;
}

/* shafts of light falling from the present into the past */
export function shafts(yMin) {
  const g = new THREE.Group(), H = -yMin + 10;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uTime;
      void main(){ float f = pow(abs(dot(vN, vV)), 2.0); float a = f * smoothstep(0.0, 0.85, vUv.y) * (0.05 + 0.015 * sin(uTime * 0.7 + vUv.x * 6.0));
        gl_FragColor = vec4(vec3(0.85, 0.82, 0.7) * a, a); }`,
  });
  const spots = [[-9, 6, 2.4, 11], [13, -4, 1.6, 8], [3, 15, 2.0, 9], [-16, -12, 1.4, 7]];
  for (const [x, z, rt, rb] of spots) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, H, 32, 1, true), mat);
    c.position.set(x, -H / 2 + 0.5, z); g.add(c);
  }
  g.renderOrder = 0;
  return g;
}
