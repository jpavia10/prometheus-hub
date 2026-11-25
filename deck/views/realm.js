/* The Orbit as one painted realm (owner, 2026-11-22: the solar system was "the wrong idea" and "looks cheap"; he chose "one painted
   realm map"). One panoramic matte painting (art/realm/, docs/art/requests/artreq_20261122-realm.json, tools/art/realm.py) where every
   pillar is a place: the vault, the museum, the clock tower, the forge, the cabin, the garage. Pan and pinch across it; the painting
   moves in depth as you do (a depth map estimated from the picture), its lamps breathe (a lights map), and each place glows softly in
   its pillar's colour. Tap a place and the view flies to it with its card; tap it again (or Enter) and you dive in. The labels are
   real links with the shared bus's badges, the pearl spire is the command button, the ticker says what is true now.
   Nothing is drawn by code but light: the world is the painting. Reduced motion: no drift, no flights, no flicker. */
import { h, icon } from "../core/ui.js";
import { PILLARS } from "../pillars.js";
import { pillarStats, titan } from "../core/legacy.js";
import { clock, today, fmtTime } from "../core/dates.js";
import { tick, blip, buzz } from "../core/fx.js";
import { PILLAR_DOMAINS, domainOf, peersFor, badgeFor, factsFor, brief } from "./orrery.js";
import * as wx from "../core/weather.js";
import { seasonOf, lateOf } from "../core/season.js";

const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ART = (f) => new URL(`../../art/realm/${f}`, import.meta.url).href;
const LABEL = Object.fromEntries(PILLAR_DOMAINS.filter((d) => d.quad).map((d) => [d.id, d.label]));
const MAXP = 28;
function hueRgb(hue, s = 0.9, l = 0.62) { const k = (n) => (n + hue / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0), f(8), f(4)]; }

const VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }";
const FS = `precision highp float;
uniform vec2 R; uniform float T; uniform sampler2D IMG; uniform sampler2D DEP; uniform sampler2D LIT; uniform vec2 IR; uniform vec3 VIEW;
uniform vec2 PAR; uniform float Q; uniform vec2 SP; uniform vec3 SC; uniform float SEL; uniform float DIVE; uniform float HAS;
uniform float PH; uniform vec4 SKY; uniform float FOG; uniform float WND; uniform float FLASH;
uniform sampler2D SEA; uniform vec2 SEAS; uniform float LATE;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(h1(i), h1(i + vec2(1, 0)), f.x), mix(h1(i + vec2(0, 1)), h1(i + vec2(1, 1)), f.x), f.y); }
void main(){
  vec2 fc = vec2(gl_FragCoord.x, R.y - gl_FragCoord.y);
  vec2 uv = VIEW.xy + (fc - .5 * R) / (IR * VIEW.z);
  vec3 col = vec3(.012, .016, .04);
  if (HAS > .5) {
    float dep = texture2D(DEP, uv).r;
    vec2 u = uv + PAR * (dep - .42) * vec2(.014, .02);
    col = texture2D(IMG, u).rgb;
    /* the season (2026-11-25): the same painting repainted for autumn or winter, blended in by the calendar and the real snow; snow comes
       in where the winter painting is brighter than the original first, so a light snowfall whitens the roofs and peaks before the rest */
    if (SEAS.x > .001) { vec3 sc = texture2D(SEA, u).rgb;
      float sn = clamp((dot(sc, vec3(.299, .587, .114)) - dot(col, vec3(.299, .587, .114))) * 4., 0., 1.);
      col = mix(col, sc, SEAS.y > .5 ? clamp(SEAS.x * 1.6 - (1. - sn) * .6, 0., 1.) : SEAS.x); }
    vec3 raw = col;
    col = mix(vec3(.012, .016, .04), col, smoothstep(1.06, .995, uv.y) * smoothstep(-.06, .005, uv.y) * smoothstep(1.03, .998, uv.x) * smoothstep(-.03, .002, uv.x));
    /* the real hour (owner, 2026-11-24: "real time weather and a day night cycle on the town ... synced with real time data"):
       PH is the day phase from today's sunrise and sunset (0 midnight, .25 sunrise, .5 noon, .75 sunset) */
    float el = sin((PH - .25) * 6.2831853), day = smoothstep(-.12, .3, el), tw = exp(-pow(el / .2, 2.)), night = 1. - day;
    float skyM = smoothstep(.42, .12, uv.y) * smoothstep(.55, .2, dep);
    float lum = dot(col, vec3(.299, .587, .114));
    vec3 dayC = mix(col, vec3(lum), -.12) * vec3(1.1, 1.06, 1.0) + vec3(.035, .04, .05);
    dayC = mix(dayC, dayC * vec3(.78, .9, 1.12) + vec3(.06, .1, .16), skyM * .55);
    vec3 nightC = col * vec3(.34, .4, .62);
    col = mix(nightC, dayC, day);
    col += vec3(1., .46, .22) * tw * (.2 * skyM + .06);
    /* stars where the sky is clear and dark */
    vec2 sg = floor(uv * IR / 3.);
    float star = step(.9965, h1(sg)) * (.55 + .45 * sin(T * 1.7 + h1(sg + 3.) * 40.));
    col += vec3(.9, .94, 1.) * star * night * skyM * (1. - SKY.x) * .9;
    /* late at night (LATE) the warm window light goes out one lit shape at a time (the lights map's G is each shape's own number); the
       town's cool, magical glows (the spire, the falls, the neon) stay on */
    vec2 lg = texture2D(LIT, u).rg; float li = lg.x;
    li *= 1. - step(.02, lg.y) * step(lg.y, LATE * .7) * clamp((raw.r - raw.b) * 3.5 - .1, 0., 1.);
    float fl = .84 + .1 * sin(T * 2.3 + u.x * 47.) + .06 * sin(T * 5.7 + u.y * 63.);
    float lamp = mix(1.9, .35, day) + tw * .5;
    col += (li * fl * vec3(1., .9, .74) * .28 + li * li * .12) * lamp;
    /* weather: SKY = (cloud, rain, snow, storm), FOG, WND */
    float cs = n2(vec2(u.x * 3.2 - T * (.004 + WND * .02), u.y * 7.));
    col = mix(col, vec3(dot(col, vec3(.299, .587, .114))) * .92, SKY.x * .42);
    col *= 1. - SKY.x * (.16 + .2 * cs) - SKY.y * .12 - SKY.w * .1;
    vec3 fogC = mix(vec3(.16, .18, .24), vec3(.72, .76, .82), day);
    col = mix(col, fogC, FOG * (.35 + .5 * (1. - dep)));
    col += vec3(.85, .9, 1.) * FLASH * (.45 + .3 * skyM);
    if (Q > .5) { vec2 st = vec2(0., -.006); float ray = texture2D(LIT, u + st).r * .6 + texture2D(LIT, u + st * 2.).r * .4 + texture2D(LIT, u + st * 3.).r * .25; col += vec3(.82, .88, 1.) * ray * .05; }
    /* mist drifting along the valley floor, thicker far away */
    float mist = n2(vec2(u.x * 9. + T * .03, u.y * 22.)) * n2(vec2(u.x * 23. - T * .05, u.y * 40.));
    col += vec3(.55, .62, .82) * mist * .08 * smoothstep(.25, .55, u.y) * (1. - dep);
    /* the chosen place burns (the others glow by their labels' halos, which cost the GPU nothing per pixel) */
    if (SEL > -.5) { vec2 d = (u - SP.xy) * IR * VIEW.z / R.y; float r2 = dot(d, d); col += SC * (exp(-r2 * 900.) * .34 + exp(-r2 * 90.) * .09) * (.85 + .15 * sin(T * 2.)); }
  }
  if (SKY.y > .01) { for (int k = 0; k < 2; k++) { float s = float(k); vec2 rp = fc / vec2(3. + s * 2., 46. + s * 30.); rp.x += rp.y * (.18 + WND * .9) * (1. + s);
      rp.y += T * (16. + s * 9.); vec2 ci = floor(rp); float r = step(.965 - SKY.y * .03, h1(ci + s * 17.)) * smoothstep(0., .6, fract(rp.y)) * (1. - fract(rp.y));
      col += vec3(.62, .68, .8) * r * SKY.y * (.16 + s * .1); } }
  if (SKY.z > .01) { for (int k = 0; k < 3; k++) { float s = float(k), sz = 22. + s * 16.; vec2 sp = fc / sz; sp.y -= T * (.55 + s * .35); sp.x += sin(T * .6 + sp.y * .7 + s) * .35 + T * WND * (.4 + s * .3);
      vec2 ci = floor(sp), f = fract(sp) - .5; vec2 o = vec2(h1(ci + s), h1(ci + s + 9.)) - .5; float d = length(f - o * .6);
      col += vec3(.95, .97, 1.) * smoothstep(.06 + s * .02, 0., d) * step(.55 - SKY.z * .35, h1(ci + 31. + s)) * SKY.z * (.55 + s * .2); } }
  vec2 p = fc / R - .5; col *= 1. - .55 * dot(p * vec2(.8, 1.1), p * vec2(.8, 1.1));
  /* the dive (owner, 2026-11-24: "the transition from hub to pillar is atrocious"; it washed out to white): an iris closes on the chosen
     place in its own colour and ends on a dark tint of it, which is where the pillar page begins */
  if (DIVE > 0.) { vec2 dd = (uv - SP.xy) * IR * VIEW.z / R.y; float rad = mix(1.5, 0., DIVE * DIVE), iris = smoothstep(rad + .3, rad, length(dd));
    vec3 tint = (SEL > -.5 ? SC * .09 : vec3(0.)) + vec3(.012, .016, .04);
    col = mix(tint, col * (1. + .35 * DIVE) + (SEL > -.5 ? SC : vec3(0.)) * .12 * DIVE, iris); col = mix(col, tint, smoothstep(.72, 1., DIVE)); }
  col += (h1(fc + fract(T) * 91.) - .5) * .015;
  gl_FragColor = vec4(col, 1.);
}`;

export function realm(ctx) {
  const t0d = today(), stats = pillarStats(t0d); let tn = null; const calm = still();
  const list = PILLARS.filter((p) => !p.paused); const n = list.length;
  const places = list.map((p) => ({ p, dom: domainOf(p.id), x: 0.5, y: 0.5, sx: -999, sy: -999, on: false }));

  /* the DOM: canvas, the labels (real links), the spire's command button, the ticker and one card */
  const cv = h("canvas.rl-gl", { "aria-hidden": "true" });
  const now0 = clock.now();
  let energy = 0;
  const core = h("button.rl-core", { type: "button", "aria-label": "Command: search or add", onclick: () => { energy = 1; blip(); ctx.openSearch(); } },
    h("b.num", fmtTime(`${now0.getHours()}:${String(now0.getMinutes()).padStart(2, "0")}`).replace(/ ?[AP]M/i, "")), h("span", "Command"));
  let held = false, holdTimer = null, sel = -1;
  const labels = places.map((pl, i) => {
    const badge = h("i.rl-badge", { hidden: true });
    const a = h("a.rl-pl", { href: pl.p.route, dataset: { pillar: pl.p.id, domain: pl.dom }, style: { "--h": pl.p.hue }, "aria-label": `${pl.p.name}: ${pl.p.what}`, draggable: "false",
      oncontextmenu: (e) => e.preventDefault(),
      onpointerdown: () => { held = false; clearTimeout(holdTimer); holdTimer = setTimeout(() => { held = true; buzz(18); brief(pl.p, stats, tn, () => enter(i)); }, 480); },
      onpointerup: () => clearTimeout(holdTimer), onpointerleave: () => clearTimeout(holdTimer), onpointercancel: () => clearTimeout(holdTimer),
      onclick: (e) => { e.preventDefault(); clearTimeout(holdTimer); if (held) return; choose(i); } },
      h("i.rl-dot"), h("span.rl-name", pl.p.short || pl.p.name.split(" · ")[0]), badge);
    pl.badge = badge; pl.label = a; return a; });
  const labelBox = h("nav.rl-labels", { "aria-label": "Pillars" }, ...labels);
  /* places off the screen: a marker on each side says how many and the nearest, a tap brings them in (owner: "odyssey is cut off") */
  const edgeL = h("button.rl-edge.l", { type: "button", hidden: true, onclick: () => panBy(-1) }), edgeR = h("button.rl-edge.r", { type: "button", hidden: true, onclick: () => panBy(1) });
  /* the opening: the town rises out of the dark with the hour and the weather (once a session) */
  const intro = h("div.rl-intro", { "aria-hidden": "true" });
  const kick = h("p.rl-kick"), title = h("h2.rl-title"), sub = h("p.rl-sub"), fact = h("p.rl-fact"), syn = h("div.rl-syn");
  const prevB = h("button.rl-arrow", { type: "button", "aria-label": "Previous pillar", onclick: () => step(-1) }, icon("left", 18));
  const nextB = h("button.rl-arrow", { type: "button", "aria-label": "Next pillar", onclick: () => step(1) }, icon("right", 18));
  const enterB = h("button.rl-enter", { type: "button", onclick: () => (sel >= 0 ? enter(sel) : choose(nearestToCentre())) }, h("span", "Enter"), icon("right", 16));
  const card = h("div.rl-card", { "aria-live": "polite" }, kick, h("div.rl-card-top", title, h("div.rl-nav", prevB, enterB, nextB)), sub, h("div.rl-card-foot", fact, syn));
  const stage = h("div.rl-stage", cv, labelBox, core, edgeL, edgeR, card, intro);
  const el = h("section.realm", { "aria-label": "The pillars as places in one realm" }, stage);

  function paintCard() {
    const pl = places[sel];
    if (!pl) {
      /* 2026-11-23: at rest the card says which places have something coming, soonest first (tap one to fly there), not how to use a map */
      const due = places.map((q, i) => ({ q, i, nx: stats[q.p.id] && stats[q.p.id].next })).filter((x) => x.nx).sort((a, b) => a.nx.date.localeCompare(b.nx.date)).slice(0, 4);
      kick.textContent = `Prometheus · ${n} places`; title.textContent = "The realm";
      sub.textContent = due.length ? `Next: ${due[0].nx.title}` : "Drag to look around, pinch to come closer, tap a place to go there.";
      fact.textContent = due.length ? "" : "The pearl spire is the command: search or add.";
      syn.replaceChildren(...due.map((x) => h("button.rl-chip", { type: "button", style: { "--h": x.q.p.hue }, onclick: () => choose(x.i) }, (x.q.p.short || x.q.p.name.split(" · ")[0]) + " · " + (badgeFor(x.q.p, stats, t0d, tn) || ""))));
      enterB.querySelector("span").textContent = "Go"; card.style.removeProperty("--h"); card.classList.remove("on"); card.classList.add("rest"); return;
    }
    const f = factsFor(pl.p, stats, tn);
    kick.textContent = LABEL[pl.dom] || "Prometheus"; title.textContent = pl.p.name.split(" · ")[0]; sub.textContent = pl.p.what;
    fact.textContent = f[0] || (pl.p.ext ? "Lives on its own site; its data stays there." : "Nothing entered on this device yet.");
    syn.replaceChildren(...peersFor(pl.p.id).slice(0, 3).map((q) => h("button.rl-chip", { type: "button", style: { "--h": q.hue }, onclick: () => choose(list.indexOf(q)) }, q.short || q.name.split(" · ")[0])));
    enterB.querySelector("span").textContent = pl.p.ext ? "Open" : "Enter"; card.style.setProperty("--h", pl.p.hue); card.classList.add("on"); card.classList.remove("rest");
  }
  function badges() { places.forEach((pl) => { const v = badgeFor(pl.p, stats, t0d, tn); pl.badge.hidden = !v; pl.badge.textContent = v || ""; }); }
  badges(); titan().then((d) => { tn = d; badges(); paintCard(); }); paintCard();

  /* the view: centre (cx, cy) in the painting, zoom over "the painting's height fills the stage" */
  const V = { cx: 0.5, cy: 0.5, z: 1, tcx: 0.5, tcy: 0.5, tz: 1, vx: 0, vy: 0, dive: 0 };
  let IRW = 6144, IRH = 2606, coreXY = [0.5, 0.44], idleAt = performance.now(), going = false;
  const base = () => stage.clientHeight / IRH;                               // css px per painting px at zoom 1
  const halfW = (z) => stage.clientWidth / 2 / (IRW * base() * z), halfH = (z) => stage.clientHeight / 2 / (IRH * base() * z);
  const zMin = () => Math.max(1, stage.clientWidth / Math.max(1, IRW * base()));   // 2026-11-23: a wide screen never sees past the painting's sides (they smeared)
  const clampV = () => { V.tz = Math.max(zMin(), V.tz); const hw = halfW(V.tz), hh = halfH(V.tz), under = sel >= 0 ? lift() / (IRH * base() * V.tz) : 0;   // a chosen place may pull the view a little past the bottom so it clears the card
    V.tcx = Math.min(1 - hw, Math.max(hw, V.tcx)); V.tcy = Math.min(1 - hh + under, Math.max(hh, V.tcy)); };
  const lift = () => (sel >= 0 ? card.offsetHeight + 12 + DOCK : DOCK - 40) / 2;   // keep a chosen place above the card and the dock
  const DOCK = 104, TOP = 66;                                                  // the deck's header and dock float over the full-screen town
  function focusOn(i, z) { const pl = places[i]; V.tz = z; V.tcx = pl.x; V.tcy = pl.y + lift() / (IRH * base() * z); clampV(); }
  function nearestToCentre() { let b = 0, bd = Infinity; places.forEach((pl, i) => { const d = Math.hypot(pl.x - V.cx, (pl.y - V.cy) * IRH / IRW); if (d < bd) { bd = d; b = i; } }); return b; }
  /* the first tap readies the second (2026-11-24): the pillar page and its painting's three layers are fetched while you look at the card */
  const fetched = new Set();
  function prefetch(p) {
    if (!p || !p.route || fetched.has(p.id) || /^[a-z]+:/i.test(p.route) || (navigator.connection && navigator.connection.saveData)) return; fetched.add(p.id);
    const add = (href, as) => { const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; if (as) l.as = as; document.head.appendChild(l); };
    const w = "art/worlds/world_" + (p.id === "sylade" ? "presence" : p.id); add(p.route, "document"); add(w + ".webp", "image"); add(w + "_depth.webp", "image"); add(w + "_lights.webp", "image");
  }
  function choose(i) { if (i === sel) { enter(i); return; } sel = i; tick(); prefetch(places[i].p); focusOn(i, stage.clientWidth / Math.max(1, stage.clientHeight) < 0.8 ? 2.1 : 1.6); idleAt = performance.now(); paintCard(); wake(); }
  function overview() { sel = -1; V.tz = zMin(); clampV(); paintCard(); wake(); }
  function step(d) { choose(((sel < 0 ? (d > 0 ? -1 : 0) : sel) + d + n) % n); }
  function panBy(d) { const hw = halfW(V.tz); V.tcx += d * hw * 1.6; clampV(); idleAt = performance.now(); tick(); wake(); }
  function enter(i) {
    if (going) return; const pl = places[i]; going = true; blip(); buzz(22); sel = i; paintCard(); el.classList.add("diving"); document.body.classList.add("town-diving"); prefetch(pl.p);
    /* the pillar's living painting starts pushed in and settles (kit/world.js), so the dive carries on through the page change */
    const go = () => { try { sessionStorage.setItem("pk:dive", JSON.stringify({ id: pl.p.id === "sylade" ? "presence" : pl.p.id, t: Date.now() })); } catch (e) { /* private mode */ } location.href = pl.p.route; };
    if (calm || !gl) { go(); return; }
    focusOn(i, Math.min(6, V.z * 3.2)); V.dive = 0.0001; wake(); setTimeout(go, 380);
  }

  /* WebGL: the painting and its two maps; WebGL2 when there is one, for mipmapped panning without shimmer */
  let gl = cv.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" }), gl2 = !!gl;
  if (!gl) gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  let prog = null, U = {}, has = 0, q = 1;
  const tex = [];
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (v && f) { prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.bindAttribLocation(prog, 0, "a"); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); prog = null; } }
    if (prog) {
      gl.useProgram(prog); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      for (const nme of ["R", "T", "IMG", "DEP", "LIT", "IR", "VIEW", "PAR", "Q", "SP", "SC", "SEL", "DIVE", "HAS", "PH", "SKY", "FOG", "WND", "FLASH", "SEA", "SEAS", "LATE"]) U[nme] = gl.getUniformLocation(prog, nme);
      for (let i = 0; i < 4; i++) { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([3, 4, 10, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); tex.push(t); }
      gl.uniform1i(U.IMG, 0); gl.uniform1i(U.DEP, 1); gl.uniform1i(U.LIT, 2); gl.uniform1i(U.SEA, 3);
    } else gl = null;
  }
  if (!gl) el.classList.add("rl-flat");
  const upload = (i, im, mip) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex[i]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    if (mip && gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); } };
  const img = (url) => new Promise((res) => { const im = new Image(); im.decoding = "async"; im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im)); im.onerror = () => res(null); im.src = url; });
  const big = gl && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 8192 && (devicePixelRatio || 1) >= 1.5;
  const ready = Promise.all([fetch(ART("places.json")).then((r) => (r.ok ? r.json() : null)).catch(() => null), gl ? img(ART(big ? "realm_6k.webp" : "realm_4k.webp")) : null, gl ? img(ART("realm_depth.webp")) : null, gl ? img(ART("realm_lights.webp")) : null])
    .then(([pj, im, dp, lt]) => {
      if (pj) { places.forEach((pl) => { const xy = pj.places[pl.p.id]; if (xy) { pl.x = xy[0]; pl.y = xy[1]; } }); if (pj.core) coreXY = pj.core; }
      if (gl && im) { IRW = im.naturalWidth; IRH = im.naturalHeight; upload(0, im, true); if (dp) upload(1, dp, true); if (lt) upload(2, lt, true); has = 1; }
      else if (gl) el.classList.add("rl-flat");
      V.cx = V.tcx = coreXY[0]; V.cy = V.tcy = 0.5; clampV(); V.cx = V.tcx; V.cy = V.tcy; V.z = V.tz; size();
      let first = false; try { first = !sessionStorage.getItem("prom.deck.opened"); sessionStorage.setItem("prom.deck.opened", "1"); } catch (e) { /* every time */ }
      if (first && !calm && !qs.get("now")) {
        const w = ctx.weather(), d = w && w.now ? wx.describe(w.now.code, w.now.isDay) : null, hr = clock.now().getHours(), name = (ctx.store.get("profile").name || "").split(" ")[0];
        const greet = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : hr < 22 ? "Good evening" : "Good night";
        intro.replaceChildren(h("p.rl-intro-k", "Prometheus"), h("h1.rl-intro-t", greet + (name ? ", " + name : "")), h("p.rl-intro-s", d ? `${Math.round(w.now.temp)}° · ${d.text}${w.days && w.days[0] ? ` · sunset ${fmtTime(w.days[0].sunset.slice(11, 16))}` : ""}` : `${n} places`));
        /* after the boot card (orrery.js boot, first visit of a session) the town rises: the card names the deck, the town greets */
        const go = () => { V.z = V.tz * 1.5; V.cy = Math.max(0, V.tcy - 0.12); V.cx = V.tcx - 0.03; el.classList.remove("opening"); void el.offsetWidth; el.classList.add("opening");
          setTimeout(() => el.classList.add("opened"), 2200); setTimeout(() => el.classList.remove("opening", "opened"), 3400); wake(); };
        el.classList.add("opening"); if (document.body.classList.contains("booting")) setTimeout(go, 1500); else go();
      }
      wake();
    });

  /* the live sky: the hour from today's sunrise and sunset, the weather from the deck's reading (Open-Meteo, NWS); ?sky=night|dawn|day|golden|dusk
     and ?wx=clear|cloud|rain|snow|fog|storm pin them for the proofs and for a look at any weather */
  const qs = new URLSearchParams(location.search), SKYQ = { night: 0.02, dawn: 0.255, day: 0.5, golden: 0.7, dusk: 0.76 }[qs.get("sky")], WXQ = qs.get("wx");
  const WXP = { clear: { cloud: 0, rain: 0, snow: 0, storm: 0, fog: 0 }, cloud: { cloud: 0.85, rain: 0, snow: 0, storm: 0, fog: 0 }, rain: { cloud: 0.9, rain: 0.8, snow: 0, storm: 0, fog: 0.1 },
    snow: { cloud: 0.8, rain: 0, snow: 0.85, storm: 0, fog: 0.15 }, fog: { cloud: 0.6, rain: 0, snow: 0, storm: 0, fog: 0.85 }, storm: { cloud: 1, rain: 1, snow: 0, storm: 1, fog: 0.1, wind: 0.7 } };
  const SK = { ph: 0.5, cloud: 0.1, rain: 0, snow: 0, storm: 0, fog: 0, wind: 0.1, flash: 0 }, SKT = { ...SK };
  function readSky() {
    const w = ctx.weather(), k = wx.skyOf(w), code = w && w.now ? w.now.code : null;
    Object.assign(SKT, { ph: SKYQ != null ? SKYQ : wx.phaseOf(w), cloud: k.cloud, rain: k.rain, snow: k.snow, storm: k.storm, fog: code === 45 || code === 48 ? 0.8 : 0, wind: k.wind }, WXQ ? WXP[WXQ] || {} : {});
  }
  /* the season painting is fetched only when its season comes (one of the two, after the town itself has loaded) */
  const SEAQ = qs.get("season"); let season = { kind: null, amt: 0, name: "" }, seaKind = null, seaAmt = 0, seaLoading = false, late = 0;
  function readSeason() {
    const w = ctx.weather(), lat = w && typeof w.lat === "number" ? w.lat : 35, now = clock.now();
    season = seasonOf(now, lat, w && w.now, SKT.snow, SEAQ); late = qs.get("late") != null ? Number(qs.get("late")) || 0 : lateOf(now);
    if (gl && season.kind && season.kind !== seaKind && !seaLoading) { const want = season.kind; seaLoading = true;
      img(ART(`realm_${want}.webp`)).then((im) => { seaLoading = false; if (dead || !im) return; upload(3, im, true); seaKind = want; seaAmt = calm || SEAQ ? (season.kind === want ? season.amt : 0) : seaAmt; wake(); }); }
  }
  readSky(); Object.assign(SK, SKT); const skyTimer = setInterval(() => { readSky(); readSeason(); wake(); }, 2e4);
  ready.then(() => { if (!dead) readSeason(); });
  const dprMax = Math.min(2, devicePixelRatio || 1); let dpr = dprMax;
  function size() { const w = stage.clientWidth, hh = stage.clientHeight; if (!w || !hh) return; cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); if (gl) gl.viewport(0, 0, cv.width, cv.height); clampV(); }
  const PCA = new Float32Array(MAXP * 3);
  places.forEach((pl, i) => { const c = hueRgb(pl.p.hue); PCA.set(c, i * 3); });
  let raf = 0, dead = false, seen = true, last = 0, slow = 0, par = [0, 0], ptx = 0, pty = 0, drift = 1;
  function frame(now) {
    raf = 0; if (dead) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now; const t = now / 1000;
    if (dt > 0.03) slow += dt; else slow = Math.max(0, slow - dt * 0.5);
    if (slow > 2) { if (q) q = 0; else if (dpr > 1) { dpr = Math.max(1, dpr - 0.5); size(); } slow = 0; }
    /* an establishing drift when nobody is touching it */
    if (!calm && sel < 0 && now - idleAt > 6000 && !ptrs.size) { const hw = halfW(V.tz);
      if (1 - 2 * hw > 0.01) { V.tcx += drift * dt * 0.011; if (V.tcx > 1 - hw) { V.tcx = 1 - hw; drift = -1; } else if (V.tcx < hw) { V.tcx = hw; drift = 1; } } }
    if (!ptrs.size && (Math.abs(V.vx) > 1e-6 || Math.abs(V.vy) > 1e-6)) { V.tcx += V.vx * dt; V.tcy += V.vy * dt; V.vx *= Math.pow(0.03, dt); V.vy *= Math.pow(0.03, dt); clampV(); }
    const k = calm ? 1 : 1 - Math.exp(-dt * (V.dive ? 6 : 3.4));
    V.z += (V.tz - V.z) * k; V.cx += (V.tcx - V.cx) * k; V.cy += (V.tcy - V.cy) * k;
    if (V.dive) V.dive = Math.min(1, V.dive + dt / 0.45);
    par[0] += (ptx + (V.cx - 0.5) * 2 - par[0]) * Math.min(1, dt * 3); par[1] += (pty + (V.cy - 0.5) * 2 - par[1]) * Math.min(1, dt * 3);
    energy *= Math.pow(0.2, dt);
    const w = stage.clientWidth, hh = stage.clientHeight, sc = IRW * base() * V.z, scy = IRH * base() * V.z;
    places.forEach((pl) => { pl.sx = (pl.x - V.cx) * sc + w / 2; pl.sy = (pl.y - V.cy) * scy + hh / 2; });
    if (gl && prog) {
      gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, calm ? 0 : t); gl.uniform2f(U.IR, IRW, IRH); gl.uniform3f(U.VIEW, V.cx, V.cy, base() * V.z * dpr);
      gl.uniform2f(U.PAR, calm ? 0 : par[0], calm ? 0 : par[1]); gl.uniform1f(U.Q, q); if (sel >= 0) { gl.uniform2f(U.SP, places[sel].x, places[sel].y); gl.uniform3fv(U.SC, PCA.subarray(sel * 3, sel * 3 + 3)); }
      const kk = Math.min(1, dt * 0.6); for (const key of ["cloud", "rain", "snow", "storm", "fog", "wind"]) SK[key] += (SKT[key] - SK[key]) * kk;
      SK.ph = SKT.ph; if (!calm && SK.storm > 0.4 && Math.random() < dt * 0.22) { SK.flash = 1; if (el.onflash) try { el.onflash(); } catch (e) { /* the sound is optional */ } } SK.flash *= Math.pow(0.0005, dt);
      const seaT = seaKind && seaKind === season.kind ? season.amt : 0; seaAmt += (seaT - seaAmt) * (calm ? 1 : Math.min(1, dt * 0.5));
      gl.uniform2f(U.SEAS, seaAmt, seaKind === "winter" ? 1 : 0); gl.uniform1f(U.LATE, late);
      gl.uniform1f(U.PH, SK.ph); gl.uniform4f(U.SKY, SK.cloud, calm ? 0 : SK.rain, calm ? 0 : SK.snow, SK.storm); gl.uniform1f(U.FOG, SK.fog); gl.uniform1f(U.WND, SK.wind); gl.uniform1f(U.FLASH, calm ? 0 : SK.flash);
      gl.uniform1f(U.SEL, sel); gl.uniform1f(U.DIVE, V.dive); gl.uniform1f(U.HAS, has); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    /* the spire's button and the labels follow the view; nearer to the centre wins when two would overlap */
    core.style.transform = `translate3d(${((coreXY[0] - V.cx) * sc + w / 2).toFixed(1)}px, ${((coreXY[1] - V.cy) * scy + hh / 2).toFixed(1)}px, 0) translate(-50%, -50%)`;
    core.classList.toggle("far", V.z > 1.6);
    const cardTop = sel >= 0 ? hh - card.offsetHeight - DOCK - 8 : hh - DOCK, order = places.map((pl, i) => i).sort((a, b) => Math.abs(places[a].sx - w / 2) - Math.abs(places[b].sx - w / 2)), placed = [];
    let offL = [], offR = [];
    for (const i of order) { const pl = places[i]; if (!pl.lw) pl.lw = pl.label.offsetWidth || 80; let show = pl.sx > 14 && pl.sx < w - 14 && pl.sy > TOP + 6 && pl.sy < cardTop && !(pl.sx - pl.lw / 2 < 190 && pl.sy < TOP + 64) && !(pl.sx + pl.lw / 2 > w - 150 && pl.sy < TOP + 64);   /* never under the weather or the Levels button */
      if (pl.sx < 14) offL.push(pl); else if (pl.sx > w - 14) offR.push(pl);
      if (show && i !== sel) for (const q2 of placed) if (Math.abs(q2[0] - pl.sx) < 64 && Math.abs(q2[1] - pl.sy) < 20) { show = false; break; }
      if (show) placed.push([pl.sx, pl.sy]);
      pl.label.style.transform = `translate3d(${pl.sx.toFixed(1)}px, ${pl.sy.toFixed(1)}px, 0) translate(-50%, -8px)`;
      /* a name near a side of the screen slides inward so it is never cut (owner: "oddessy is cut off"); its dot stays on the building */
      const nx = Math.round(Math.max(0, 8 - (pl.sx - pl.lw / 2)) + Math.min(0, w - 8 - (pl.sx + pl.lw / 2)));
      if (pl.nx !== nx) { pl.nx = nx; pl.label.style.setProperty("--nx", nx + "px"); }
      if (pl.on !== show) { pl.on = show; pl.label.classList.toggle("on", show); }
      pl.label.classList.toggle("sel", i === sel); }
    const edge = (b, list, side) => { const show = list.length > 0 && sel < 0; if (b.hidden === show) b.hidden = !show; if (!show) return; list.sort((a, c) => (side < 0 ? c.sx - a.sx : a.sx - c.sx));
      const t = side < 0 ? `‹ ${list[0].p.short || list[0].p.name.split(" · ")[0]}${list.length > 1 ? " +" + (list.length - 1) : ""}` : `${list[0].p.short || list[0].p.name.split(" · ")[0]}${list.length > 1 ? " +" + (list.length - 1) : ""} ›`;
      if (b.textContent !== t) { b.textContent = t; b.setAttribute("aria-label", `${list.length} more ${list.length === 1 ? "place" : "places"} to the ${side < 0 ? "left" : "right"}`); } };
    edge(edgeL, offL, -1); edge(edgeR, offR, 1);
    const moving = Math.abs(V.tz - V.z) > 1e-4 || Math.abs(V.tcx - V.cx) > 1e-5 || Math.abs(V.tcy - V.cy) > 1e-5 || V.dive > 0;
    if (seen && !document.hidden && (!calm || moving || Math.abs(SKT.cloud - SK.cloud) > 0.01 || Math.abs((seaKind === season.kind ? season.amt : 0) - seaAmt) > 0.01)) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !dead) { last = 0; raf = requestAnimationFrame(frame); } };

  /* touch: one finger pans (with a throw), two pinch around their middle, a wheel zooms at the pointer; a tap picks the place under it */
  const ptrs = new Map(); let downX = 0, downY = 0, moved = false, span = 0, lastMove = 0;
  const zoomAt = (px, py, f) => { const w = stage.clientWidth, hh = stage.clientHeight, z0 = V.tz, z1 = Math.max(zMin(), Math.min(4.5, z0 * f));
    const ix = V.tcx + (px - w / 2) / (IRW * base() * z0), iy = V.tcy + (py - hh / 2) / (IRH * base() * z0);
    V.tz = z1; V.tcx = ix - (px - w / 2) / (IRW * base() * z1); V.tcy = iy - (py - hh / 2) / (IRH * base() * z1); clampV(); wake(); };
  const rel = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener("pointerdown", (e) => { if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, rel(e)); if (ptrs.size === 1) { [downX, downY] = rel(e); moved = false; V.vx = V.vy = 0; } else { const [a, b] = [...ptrs.values()]; span = Math.hypot(a[0] - b[0], a[1] - b[1]); moved = true; } idleAt = performance.now(); wake(); });
  cv.addEventListener("pointermove", (e) => {
    if (!ptrs.has(e.pointerId)) { const [x, y] = rel(e); ptx = (x / stage.clientWidth - 0.5) * 0.6; pty = (y / stage.clientHeight - 0.5) * 0.6; return; }
    const prev = ptrs.get(e.pointerId), cur = rel(e); ptrs.set(e.pointerId, cur); const now = performance.now();
    if (ptrs.size === 1) { const dx = cur[0] - prev[0], dy = cur[1] - prev[1]; if (Math.hypot(cur[0] - downX, cur[1] - downY) > 7) moved = true;
      if (moved) { const sx = IRW * base() * V.tz, sy = IRH * base() * V.tz; V.tcx -= dx / sx; V.tcy -= dy / sy; V.cx = V.tcx; V.cy = V.tcy; clampV(); const dtm = Math.max(8, now - lastMove) / 1000; V.vx = (-dx / sx) / dtm * 0.6; V.vy = (-dy / sy) / dtm * 0.6; } }
    else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const s2 = Math.hypot(a[0] - b[0], a[1] - b[1]); if (span && s2) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, s2 / span); span = s2; }
    lastMove = now; idleAt = now; wake(); });
  const up = (e) => { if (!ptrs.has(e.pointerId)) return; const [x, y] = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size || moved) return; V.vx = V.vy = 0; pick(x, y); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", (e) => ptrs.delete(e.pointerId));
  cv.addEventListener("wheel", (e) => { e.preventDefault(); const [x, y] = rel(e); zoomAt(x, y, Math.exp(-e.deltaY * 0.0015)); idleAt = performance.now(); }, { passive: false });
  const onTilt = (e) => { if (e.gamma == null) return; ptx = Math.max(-1, Math.min(1, e.gamma / 35)) * 0.6; pty = Math.max(-1, Math.min(1, (e.beta - 45) / 35)) * 0.6; };
  addEventListener("deviceorientation", onTilt, { passive: true });
  function pick(x, y) {
    let best = -1, bd = 34; places.forEach((pl, i) => { const d = Math.hypot(pl.sx - x, pl.sy - y); if (d < bd) { bd = d; best = i; } });
    const cx = (coreXY[0] - V.cx) * IRW * base() * V.tz + stage.clientWidth / 2, cy = (coreXY[1] - V.cy) * IRH * base() * V.tz + stage.clientHeight / 2;
    if (best >= 0) { choose(best); return; }
    if (Math.hypot(cx - x, cy - y) < 30) { energy = 1; blip(); ctx.openSearch(); return; }
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
  function fit() { size(); }   /* 2026-11-24 (owner: "the main hub home be like a full screen town"): the town fills the screen; the header and the dock float over it */
  const onResize = () => { stage.style.height = ""; requestAnimationFrame(() => { fit(); size(); wake(); }); }; addEventListener("resize", onResize);
  const onShow = (e) => { if (e.persisted) { going = false; el.classList.remove("diving"); document.body.classList.remove("town-diving"); V.dive = 0; if (sel >= 0) focusOn(sel, 2.1); wake(); } }; addEventListener("pageshow", onShow);
  el.fit = () => requestAnimationFrame(() => { fit(); requestAnimationFrame(() => { fit(); size(); wake(); }); });
  el.ready = ready;
  el.sky = () => ({ ...SK, target: { ...SKT } });
  el.season = () => ({ ...season, shown: seaKind, amt: seaAmt, late });
  el.cleanup = () => { dead = true; document.body.classList.remove("town-diving"); clearInterval(skyTimer); cancelAnimationFrame(raf); if (io) io.disconnect(); document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis); removeEventListener("resize", onResize); removeEventListener("pageshow", onShow); removeEventListener("deviceorientation", onTilt);
    try { if (gl && !gl.isContextLost()) { const lc = gl.getExtension("WEBGL_lose_context"); if (lc) lc.loseContext(); } } catch (e) { /* already gone */ } };   // hand the GPU context back: a phone holds only a few
  size();
  return el;
}
