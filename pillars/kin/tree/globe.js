/* Kin · the family tree in 3D: Places. A dotted night globe with every place in the records, and the family's movements on it:
   each person's own journey (Joseph Termenas from Telšiai to Hamburg, Ellis Island, Cambridge, France and Detroit) and the
   line's slower drift from one generation's birthplace to the next (North Carolina to Tennessee to Michigan). Coastlines are
   Odyssey's Natural Earth rings (pillars/odyssey/globe.js). */
import * as THREE from "three";
import { ribbons, ribbonUniforms, hexRGB, haloTexture } from "./gfx.js";
import { L, NOW } from "./core.js";

export const GR = 10;
const D2R = Math.PI / 180;
export const ll = (lat, lon, r = GR) => { const a = lat * D2R, b = lon * D2R; return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); };

function inside(lon, lat, ring) { /* ring: flat tenths of a degree */
  let c = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i] / 10, yi = ring[i + 1] / 10, xj = ring[j] / 10, yj = ring[j + 1] / 10;
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi) c = !c;
  }
  return c;
}

export function makeGlobe(T, px, lowTier) {
  const scene = new THREE.Scene();
  const spin = new THREE.Group(); scene.add(spin);
  const U = ribbonUniforms(px); U.uFog.value = 0.0;

  /* the ocean: dark glass with a lit rim and a faint graticule */
  const ocean = new THREE.Mesh(new THREE.SphereGeometry(GR, 96, 64), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform float uTime;
      void main(){ vec3 p = normalize(vP); float lat = asin(p.y), lon = atan(p.x, p.z), st = 0.2617994;
        float gl = 1.0 - smoothstep(0.0, 0.006, abs(fract(lat / st + 0.5) - 0.5) * st);
        float gm = 1.0 - smoothstep(0.0, 0.006, abs(fract(lon / st + 0.5) - 0.5) * st * cos(lat));
        float f = 1.0 - max(dot(vN, vV), 0.0);
        vec3 c = vec3(0.012, 0.024, 0.05) + vec3(0.25, 0.5, 0.95) * pow(f, 3.0) * 0.75 + vec3(0.16, 0.28, 0.5) * max(gl, gm) * 0.22;
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  spin.add(ocean);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(GR * 1.12, 64, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float f = pow(max(0.0, 0.72 - dot(vN, -vV)), 3.0) * 2.6; gl_FragColor = vec4(vec3(0.35, 0.6, 1.0) * f, f); }`,
  }));
  scene.add(atmo);

  /* land as dots (equal-area grid tested against the coastline rings) and the coastlines themselves */
  const rings = (window.ODYSSEY_GLOBE || []).map((r) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < r.length; i += 2) { x0 = Math.min(x0, r[i]); x1 = Math.max(x1, r[i]); y0 = Math.min(y0, r[i + 1]); y1 = Math.max(y1, r[i + 1]); } return { r, x0: x0 / 10, x1: x1 / 10, y0: y0 / 10, y1: y1 / 10 }; });
  const dots = [], step = lowTier ? 1.6 : 1.15;
  for (let lat = -84; lat <= 84; lat += step) {
    const n = Math.max(1, Math.round((360 / step) * Math.cos(lat * D2R)));
    for (let k = 0; k < n; k++) {
      const lon = -180 + (k + 0.5) * (360 / n);
      let land = false;
      for (const q of rings) if (lon >= q.x0 && lon <= q.x1 && lat >= q.y0 && lat <= q.y1 && inside(lon, lat, q.r)) { land = !land; }
      if (land) { const v = ll(lat, lon, GR * 1.002); dots.push(v.x, v.y, v.z); }
    }
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
  const dotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uPx: { value: px } },
    vertexShader: `uniform float uPx; varying float vF; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vec3 n = normalize(normalMatrix * position); vF = max(0.0, dot(n, normalize(-mv.xyz))); gl_PointSize = uPx * clamp(70.0 / -mv.z, 1.2, 4.5); }`,
    fragmentShader: `varying float vF; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.2, d) * (0.25 + 0.6 * vF); gl_FragColor = vec4(vec3(0.5, 0.68, 0.95) * a, a); }`,
  });
  spin.add(new THREE.Points(dg, dotMat));
  const cl = [];
  for (const q of rings) { const r = q.r; for (let i = 0; i < r.length - 2; i += 2) { const a = ll(r[i + 1] / 10, r[i] / 10, GR * 1.003), b = ll(r[i + 3] / 10, r[i + 2] / 10, GR * 1.003); cl.push(a.x, a.y, a.z, b.x, b.y, b.z); } }
  const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(cl, 3));
  spin.add(new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0x6f93c8, transparent: true, opacity: 0.32, depthWrite: false })));

  /* places in the records, and what happened at each */
  const PL = Object.fromEntries(L.places.filter((p) => p.lat != null).map((p) => [p.id, p]));
  const at = {};
  for (const e of L.events) if (e.place && PL[e.place]) (at[e.place] = at[e.place] || []).push(e);
  const pins = Object.keys(at).map((id) => ({ id, pl: PL[id], ev: at[id].sort((a, b) => (a.date.sort || "").localeCompare(b.date.sort || "")), v: ll(PL[id].lat, PL[id].lon, GR * 1.006) }));
  const halo = haloTexture();
  for (const p of pins) {
    const first = p.ev[0], who = first && first.who.map((w) => T.byId[w]).find(Boolean);
    const col = who && who.side === "mat" ? "#f2cf7e" : who && who.side === "pat" ? "#8fd3ea" : "#fff6e4";
    p.col = col;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: new THREE.Color(col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.copy(p.v); s.scale.setScalar(0.62); p.sprite = s; spin.add(s);
    const c = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    c.position.copy(p.v); c.scale.setScalar(0.2); spin.add(c);
  }

  /* journeys: a person's own moves in date order, and a line's move from a parent's birthplace to a child's */
  const lines = [];
  const arc = (a, b, lift) => { const out = [], A = a.clone().normalize(), B = b.clone().normalize(), ang = A.angleTo(B), n = Math.max(12, Math.ceil(ang * 60)); for (let i = 0; i <= n; i++) { const t = i / n; const v = A.clone().multiplyScalar(Math.sin((1 - t) * ang)).add(B.clone().multiplyScalar(Math.sin(t * ang))).divideScalar(Math.sin(ang) || 1); out.push(v.multiplyScalar(GR * (1.008 + lift * ang * Math.sin(Math.PI * t)))); } return out; };
  const colOf = (n) => hexRGB(n && n.side === "mat" ? "#f2cf7e" : n && n.side === "pat" ? "#8fd3ea" : "#fff6e4");
  for (const n of T.nodes) {
    const ev = L.events.filter((e) => e.who[0] === n.id && e.place && PL[e.place] && e.date && e.date.sort).sort((a, b) => a.date.sort.localeCompare(b.date.sort));
    let prev = null;
    for (const e of ev) {
      if (prev && prev.place !== e.place) {
        const a = PL[prev.place], b = PL[e.place];
        if (Math.abs(a.lat - b.lat) + Math.abs(a.lon - b.lon) > 0.2) lines.push({ pts: arc(ll(a.lat, a.lon), ll(b.lat, b.lon), 0.32), col: colOf(n), a: 0.95, kind: 5, w: 2.4, life: [+prev.date.sort.slice(0, 4), +e.date.sort.slice(0, 4)], who: n.id, from: prev.place, to: e.place });
      }
      prev = e;
    }
  }
  const birthAt = (id) => { const e = L.events.find((x) => x.who.includes(id) && x.type === "birth" && x.place && PL[x.place]); return e ? PL[e.place] : null; };
  for (const lk of T.links) {
    const a = birthAt(lk.parent), b = birthAt(lk.child);
    if (a && b && Math.abs(a.lat - b.lat) + Math.abs(a.lon - b.lon) > 0.2) lines.push({ pts: arc(ll(a.lat, a.lon), ll(b.lat, b.lon), 0.22), col: colOf(T.byId[lk.child]), a: 0.5, kind: 5, w: 1.6, life: [T.byId[lk.child].by, T.byId[lk.child].by], who: lk.child, gen: true });
  }
  const R = lines.length ? ribbons(lines, U) : null;
  if (R) spin.add(R.mesh);

  return { scene, spin, U, pins, lines, R, dotMat, ocean };
}

/* the latitude and longitude to turn to the front, for a set of places */
export function centreOf(places) {
  if (!places.length) return { lat: 44, lon: -40 };
  const v = new THREE.Vector3();
  for (const p of places) v.add(ll(p.lat, p.lon, 1));
  v.normalize();
  return { lat: Math.asin(v.y) / D2R, lon: Math.atan2(v.x, v.z) / D2R, spread: Math.max(...places.map((p) => ll(p.lat, p.lon, 1).angleTo(v))) };
}
