/* The deck's sky: one small WebGL canvas behind everything. It follows the real time of day (night, dawn, day, dusk) and the weather
   over the home location (cloud, rain, snow, wind, lightning). A mountain ridge line sits along the bottom in three depths.
   Guardrails: drawn at a reduced size, 30 frames a second, paused when the tab is hidden, stepped down automatically on slow
   hardware, and a single still frame when motion is reduced. If WebGL is missing the CSS gradient behind the canvas stands in.

   startSky(canvas) -> { set({ phase, cloud, rain, snow, wind, storm }), flash(), tier(), stop() }   phase: 0 midnight .. 0.5 noon .. 1 */

const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }";
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uT; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uGlow; uniform vec2 uSun;
uniform float uStars; uniform float uCloud; uniform float uRain; uniform float uSnow; uniform float uWind; uniform float uFlash; uniform vec2 uPar; uniform float uOct;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { if (float(i) >= uOct) break; s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
float ridge(float x, float seed){ return noise(vec2(x, seed)) * .6 + noise(vec2(x * 2.7, seed + 7.)) * .28 + noise(vec2(x * 7.1, seed + 19.)) * .12; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y; vec2 p = vec2((uv.x - .5) * asp, uv.y);
  vec3 col = mix(uLow, uMid, smoothstep(0., .5, uv.y)); col = mix(col, uTop, smoothstep(.38, 1., uv.y));
  float d = distance(p, vec2((uSun.x - .5) * asp, uSun.y));
  col += uGlow * (exp(-d * d * 22.) * .7 + exp(-d * 2.6) * .16) * (1. - uCloud * .75);
  vec2 g = floor(gl_FragCoord.xy / 2.); float st = step(.9972, hash(g));
  col += vec3(.82, .88, 1.) * st * (.55 + .45 * sin(uT * 1.6 + hash(g + 3.) * 40.)) * uStars * smoothstep(.22, .75, uv.y) * (1. - uCloud);
  vec2 q = p * vec2(1.5, 3.4) + vec2(uT * .012 * (1. + uWind * 5.), 0.) + uPar * .04;
  float c = fbm(q + vec2(fbm(q * 1.6 - uT * .008), 0.));
  float cov = smoothstep(.66 - uCloud * .4, .98 - uCloud * .3, c) * smoothstep(.12, .46, uv.y);
  vec3 lit = mix(uMid, uGlow, .35) + .12; vec3 dark = uLow * .55 + .02;
  col = mix(col, mix(lit, dark, smoothstep(.35, .95, c) * (.4 + .6 * uCloud)), cov * (.3 + .65 * uCloud));
  col += vec3(.72, .78, 1.) * uFlash * (.18 + cov * .95);
  for (int i = 0; i < 3; i++) {
    float fi = float(i); float y = .2 - fi * .055 + (ridge(p.x * (1.3 + fi * .9) + 3.7 * fi + uPar.x * (.02 + fi * .03), fi * 11.3) - .5) * (.2 - fi * .04);
    float m = smoothstep(y + .0035, y - .0035, uv.y);
    vec3 rc = mix(uLow * (.62 - fi * .16), uMid * .5, .28 - fi * .1) + vec3(.01, .014, .03) * (2. - fi);
    col = mix(col, rc + uFlash * .06, m * (.86 + fi * .07));
    col = mix(col, uMid * .8 + .02, (1. - m) * exp(-abs(uv.y - y) * 26.) * .1 * (1. + uCloud));
  }
  if (uRain > .01) {
    vec2 r = vec2(uv.x * asp * 46. + uv.y * 9. * (.25 + uWind), uv.y * 11. + uT * (9. + uWind * 5.));
    float sx = hash(vec2(floor(r.x), 3.)); float sy = fract(r.y * (.6 + sx * .8) + sx * 31.);
    col += vec3(.6, .7, .9) * smoothstep(.93, 1., sy) * step(.5, sx) * (1. - abs(fract(r.x) - .5) * 2.) * .16 * uRain;
  }
  if (uSnow > .01) {
    for (int k = 0; k < 2; k++) { float fk = float(k); vec2 sp = vec2(uv.x * asp, uv.y) * (9. + fk * 9.) + vec2(sin(uT * .5 + fk) * .4 + uT * uWind * (.6 + fk), uT * (.35 + fk * .25));
      vec2 ci = floor(sp); vec2 cf = fract(sp) - .5; vec2 o = vec2(hash(ci) - .5, hash(ci + 9.) - .5) * .7; float h2 = hash(ci + 21.);
      col += vec3(.9, .94, 1.) * smoothstep(.07, .0, length(cf - o)) * step(.55 - uSnow * .3, h2) * (.5 - fk * .18) * uSnow; }
  }
  float v = smoothstep(1.25, .35, length(vec2((uv.x - .5) * 1.15, uv.y - .52)));
  col *= .82 + .18 * v; col += (hash(gl_FragCoord.xy + fract(uT) * 91.) - .5) * .012;
  gl_FragColor = vec4(col, 1.);
}`;

/* sky colours through the day: [phase, top, mid, low(horizon), glow] */
const KEYS = [
  [0.00, [3, 5, 14], [6, 10, 26], [10, 15, 34], [70, 90, 160]],
  [0.20, [4, 7, 20], [10, 16, 40], [22, 24, 52], [90, 100, 170]],
  [0.25, [14, 22, 56], [58, 52, 92], [176, 96, 78], [255, 170, 110]],
  [0.31, [28, 62, 122], [96, 132, 182], [214, 170, 140], [255, 220, 170]],
  [0.50, [22, 70, 140], [70, 128, 190], [150, 186, 220], [255, 244, 220]],
  [0.69, [24, 60, 124], [104, 122, 172], [226, 168, 122], [255, 206, 150]],
  [0.75, [16, 20, 58], [70, 44, 86], [196, 88, 62], [255, 140, 84]],
  [0.80, [5, 8, 24], [14, 18, 46], [36, 30, 60], [110, 100, 170]],
  [1.00, [3, 5, 14], [6, 10, 26], [10, 15, 34], [70, 90, 160]],
];
const lerp = (a, b, t) => a + (b - a) * t;
export function palette(phase, cloud = 0, storm = 0) {
  let i = 0; while (i < KEYS.length - 2 && phase > KEYS[i + 1][0]) i++;
  const a = KEYS[i], b = KEYS[i + 1]; const t = Math.max(0, Math.min(1, (phase - a[0]) / (b[0] - a[0] || 1)));
  const mix = (k) => [0, 1, 2].map((j) => lerp(a[k][j], b[k][j], t) / 255);
  const grey = (c, amt) => { const l = c[0] * 0.3 + c[1] * 0.5 + c[2] * 0.2; return c.map((x) => lerp(x, l * 0.8, amt)); };
  const amt = Math.min(0.85, cloud * 0.55 + storm * 0.45); const dim = 1 - storm * 0.35;
  return { top: grey(mix(1), amt).map((x) => x * dim), mid: grey(mix(2), amt).map((x) => x * dim), low: grey(mix(3), amt).map((x) => x * dim), glow: mix(4).map((x) => x * (1 - cloud * 0.5)) };
}
/** Where the sun (day) or moon (night) sits on the canvas, and how many stars show. */
export function bodies(phase) {
  const day = phase > 0.25 && phase < 0.75; const k = day ? (phase - 0.25) / 0.5 : phase >= 0.75 ? (phase - 0.75) / 0.5 : (phase + 0.25) / 0.5;
  const dusk = Math.min(Math.abs(phase - 0.25), Math.abs(phase - 0.75));
  return { sun: [0.12 + k * 0.76, 0.2 + Math.sin(k * Math.PI) * (day ? 0.62 : 0.5)], stars: day ? 0 : Math.min(1, dusk / 0.06) };
}

export function startSky(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  let prog;
  try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)); }
  catch (e) { console.warn("[sky]", e); return null; }
  gl.useProgram(prog); const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; for (const n of ["uRes", "uT", "uTop", "uMid", "uLow", "uGlow", "uSun", "uStars", "uCloud", "uRain", "uSnow", "uWind", "uFlash", "uPar", "uOct"]) U[n] = gl.getUniformLocation(prog, n);

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const st = { phase: 0.5, cloud: 0.1, rain: 0, snow: 0, wind: 0.1, storm: 0, flash: 0, par: [0, 0], scale: 0.55, oct: 4, tier: 2, raf: 0, last: 0, t0: performance.now(), frames: 0, slow: 0, nextBolt: 0, stopped: false };
  const cur = { cloud: 0.1, rain: 0, snow: 0, wind: 0.1, storm: 0 };              // eased toward st.*

  function size() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight; const dpr = Math.min(devicePixelRatio || 1, 2);
    let s = st.scale * dpr; const long = Math.max(w, h) * s; if (long > 1100) s *= 1100 / long;
    const W = Math.max(2, Math.round(w * s)), H = Math.max(2, Math.round(h * s));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); }
  }
  function draw(now) {
    size(); const t = (now - st.t0) / 1000;
    for (const k of Object.keys(cur)) cur[k] += (st[k] - cur[k]) * 0.03;
    const pal = palette(st.phase, cur.cloud, cur.storm), b = bodies(st.phase);
    gl.uniform2f(U.uRes, canvas.width, canvas.height); gl.uniform1f(U.uT, still.matches ? 40 : t);
    gl.uniform3fv(U.uTop, pal.top); gl.uniform3fv(U.uMid, pal.mid); gl.uniform3fv(U.uLow, pal.low); gl.uniform3fv(U.uGlow, pal.glow);
    gl.uniform2f(U.uSun, b.sun[0], b.sun[1]); gl.uniform1f(U.uStars, b.stars);
    gl.uniform1f(U.uCloud, Math.max(cur.cloud, cur.storm * 0.9)); gl.uniform1f(U.uRain, cur.rain); gl.uniform1f(U.uSnow, cur.snow); gl.uniform1f(U.uWind, cur.wind);
    gl.uniform1f(U.uFlash, st.flash); gl.uniform2f(U.uPar, st.par[0], st.par[1]); gl.uniform1f(U.uOct, st.oct);
    gl.drawArrays(gl.TRIANGLES, 0, 3); canvas.dataset.frames = String(++st.frames);
  }
  function frame(now) {
    st.raf = 0; if (st.stopped || document.hidden) return;
    const gap = st.tier === 0 || still.matches ? 20000 : 33;
    if (now - st.last >= gap - 2) {
      const before = performance.now(); draw(now); gl.finish && st.frames < 40 && gl.finish(); const cost = performance.now() - before;
      if (st.frames > 6 && st.frames < 40 && cost > 24) st.slow++;
      if (st.frames === 40 && st.slow > 12) { if (st.tier === 2) { st.tier = 1; st.scale = 0.36; st.oct = 3; st.frames = 6; st.slow = 0; } else { st.tier = 0; } canvas.dataset.tier = String(st.tier); }
      st.last = now;
      if (st.flash > 0.01) st.flash *= 0.82; else st.flash = 0;
      if (cur.storm > 0.5 && !still.matches && now > st.nextBolt) { st.flash = 0.9; st.nextBolt = now + 5000 + Math.random() * 14000; }
    }
    if (st.tier === 0 || still.matches) setTimeout(() => { if (!st.raf && !st.stopped) st.raf = requestAnimationFrame(frame); }, 20000); else st.raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!st.raf && !st.stopped && !document.hidden) st.raf = requestAnimationFrame(frame); };
  document.addEventListener("visibilitychange", kick); addEventListener("resize", () => { st.last = 0; kick(); });
  const tilt = (e) => { st.par = [(e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2]; };
  addEventListener("pointermove", tilt, { passive: true });
  canvas.dataset.tier = "2"; kick();
  return {
    set(o) { for (const k of ["phase", "cloud", "rain", "snow", "wind", "storm"]) if (o[k] != null && !isNaN(o[k])) st[k] = Math.max(0, Math.min(1, o[k])); st.last = 0; kick(); },
    flash() { st.flash = 0.9; kick(); }, tier: () => st.tier, redraw() { st.last = 0; kick(); },
    stop() { st.stopped = true; if (st.raf) cancelAnimationFrame(st.raf); removeEventListener("pointermove", tilt); },
  };
}
