/* The core: a live orrery. Every pillar orbits the fire in 3D; the whole system is one moving thing you can spin with a finger
   (inertia, then it settles on the nearest pillar with a tick), tap a pillar and the system swings it to the front and the deck warps
   in. One switch morphs the orbit into a hex grid for speed. Drawn every frame: positions in script (spring and stagger), light on
   a canvas (rings, beams, dust, halos, reticle, shockwaves), the fire in a shader. Badges and readouts are real data only. */
import { h, icon, sheet, money, plural, seg } from "../core/ui.js";
import { recentEvents } from "../core/reach.js";
import { clock, today, diffDays, fmtDay, fmtTime, addDays } from "../core/dates.js";
import { PILLARS } from "../pillars.js";
import { pillarStats, titan } from "../core/legacy.js";
import { rows as feedRows } from "../core/feeds.js";
import { warp, tick, blip, bootSound, buzz } from "../core/fx.js";

const TAU = Math.PI * 2;
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const lerp = (a, b, k) => a + (b - a) * k, clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), smooth = (k) => k * k * (3 - 2 * k);
const wrap = (a) => { a = (a + Math.PI) % TAU; return (a < 0 ? a + TAU : a) - Math.PI; };
const back = (k) => { const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
const S = { yaw: 0.26, vel: 0.5, pitch: 0, zoom: 1, born: false };                                    // survives a redraw of the view
const SYNAPSES = [
  ["selling", "money", "105,240,195"],
  ["kairos", "kin", "185,155,255"],
  ["hermes", "privacy", "140,185,255"],
  ["argus", "hearth", "255,175,115"],
  ["odyssey", "bastion", "130,230,175"],
  ["aether", "bastion", "125,240,210"],
  ["foundry", "athenaeum", "255,205,120"],
  ["continuity", "privacy", "200,245,140"],
  ["mythos", "piano", "235,150,255"],
];

/* hex grid: the core in the middle, six around it, twelve outside */
const CELLS = (() => { const out = []; for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) { const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)); if (d <= 3 && d > 0) out.push({ d, x: Math.sqrt(3) * (q + r / 2), y: 1.5 * r }); }
  const ang = (c) => (Math.atan2(c.y, c.x) + Math.PI * 2.5) % TAU; return [...out.filter((c) => c.d === 1).sort((a, b) => ang(a) - ang(b)), ...out.filter((c) => c.d === 2).sort((a, b) => ang(a) - ang(b)), ...out.filter((c) => c.d === 3).sort((a, b) => ang(a) - ang(b))]; })();   // a third ring only when there are more than 18 pillars

function badgeFor(p, stats, t, tn) {
  if (p.id === "titan" && tn && tn.total) return "$" + (tn.total >= 1000 ? (tn.total / 1000).toFixed(1) + "k" : Math.round(tn.total));
  const st = stats[p.id]; if (!st) return null;
  if (st.next) { const n = diffDays(t, st.next.date); return n === 0 ? "today" : n + "d"; }
  return st.records ? String(st.records) : null;
}
function factsFor(p, stats, tn) {
  const st = stats[p.id] || {}; const out = [];
  if (p.id === "titan" && tn) out.push(`${money(tn.total)} · ${tn.flips} specimens · ${tn.countries} countries`);
  if (st.next) out.push(`Next: ${st.next.title}, ${fmtDay(st.next.date)}`);
  if (st.records) out.push(`${plural(st.records, "entry", "entries")} on this device`);
  return out;
}
function brief(p, stats, tn, enter) {
  const lines = factsFor(p, stats, tn); if (!lines.length) lines.push(p.ext ? "Lives on its own site; its data stays there." : "Nothing entered on this device yet.");
  sheet({ title: p.name, body: (close) => h("div.stack.brief", { style: { "--c": `hsl(${p.hue} 100% 68%)` } }, h("p.lead", p.what), h("div.items", lines.map((l) => h("div.item", h("span.pip"), h("span.item-main", h("b", l))))),
    h("div.row.end", h("button.btn.ghost", { type: "button", onclick: close }, "Stay"), h("button.btn.enter", { type: "button", autofocus: true, onclick: () => { close(); setTimeout(enter, 200); } }, icon("right", 18), "Enter"))) });
}
function scramble(el, text) {
  if (still()) { el.textContent = text; return; } const glyphs = "▚▞▙▟◢◣◤◥/<>+=*"; const t0 = performance.now(), dur = 340; el.dataset.to = text;
  const step = (n) => { if (el.dataset.to !== text) return; const k = Math.min(1, (n - t0) / dur), cut = Math.floor(k * text.length); el.textContent = text.slice(0, cut) + Array.from({ length: Math.min(8, text.length - cut) }, () => glyphs[(Math.random() * glyphs.length) | 0]).join(""); if (k < 1 && el.isConnected) requestAnimationFrame(step); else el.textContent = text; };
  requestAnimationFrame(step);
}

/* the fire: a small shader of its own */
const FIRE = `precision mediump float; uniform vec2 r; uniform float t; uniform float e;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f); return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){ vec2 p = (gl_FragCoord.xy * 2. - r) / min(r.x, r.y); float d = length(p); float R = .46; vec3 col = vec3(0.);
  if (d < R) { float z = sqrt(R * R - d * d); vec3 n = vec3(p, z) / R; vec2 uv = vec2(atan(n.x, n.z) + t * .16, asin(clamp(n.y, -1., 1.)));
    float f = fbm(uv * 3. + fbm(uv * 5. - t * .22) * 1.7), g = fbm(uv * 9. + t * .35); float heat = smoothstep(.22, .95, f * .78 + g * .34);
    vec3 fire = mix(vec3(.85, .14, .02), vec3(1., .66, .16), heat); fire = mix(fire, vec3(1., .97, .86), smoothstep(.72, 1., heat));
    float limb = pow(z / R, .5); col = fire * (.5 + .8 * limb) * (1. + e * .9) + vec3(1., .5, .16) * pow(1. - z / R, 3.) * 1.3; }
  float o = max(d - R, 0.); float rays = fbm(vec2(atan(p.y, p.x) * 2.6, d * 3.6 - t * .55)); float c = exp(-o * 6.5) * step(R, d);
  col += vec3(1., .46, .13) * c * (.5 + rays) * (1. + e * 1.2) + vec3(.35, .65, 1.) * exp(-o * 2.4) * .13 * step(R, d) + vec3(1., .3, .8) * exp(-o * 3.6) * .1 * step(R, d);
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0., 1.)); }`;
function fire(canvas) {
  let gl; try { gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: "high-performance" }); } catch (e) { gl = null; } if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }")); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FIRE)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null; gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const ur = gl.getUniformLocation(pr, "r"), ut = gl.getUniformLocation(pr, "t"), ue = gl.getUniformLocation(pr, "e"); gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(ur, canvas.width, canvas.height);
  return (t, e) => { gl.uniform1f(ut, t); gl.uniform1f(ue, e); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
}

export function reactor(ctx) {
  const t = today(); const stats = pillarStats(t); let tn = null; const calm = still();
  const W = innerWidth >= 1080 ? Math.min(600, Math.max(460, Math.round(innerWidth * 0.42))) : Math.min(innerWidth, 460);
  const H = Math.round(W * 0.96), cx = W / 2, cy = H / 2, M = 44;
  let mode = calm ? "grid" : ls("prom.deck.layout") || "orbit"; let mix = mode === "grid" ? 1 : 0; let birth = S.born || calm ? 1 : 0; S.born = true;
  const used = CELLS.slice(0, PILLARS.length), mx = Math.max(...used.map((c) => Math.abs(c.x))), my = Math.max(...used.map((c) => Math.abs(c.y))), gs = Math.min((W - 14) / (2 * mx + Math.sqrt(3)), (H - 8) / (2 * my + 2)), hw = Math.sqrt(3) * gs, hh = 2 * gs;
  const R1 = W * 0.22, R2 = W * 0.335, R3 = W * 0.43, PITCH = 0.8, D = 1000;
  const ringOf = (i) => i < 6
    ? { R: R1, a0: Math.PI / 12 + (i * TAU) / 6, tilt: 0.16, roll: 0.1 }
    : i < 18
      ? { R: R2, a0: ((i - 6) * TAU) / 12, tilt: -0.07, roll: -0.06 }
      : { R: R3, a0: ((i - 18) * TAU) / Math.max(6, PILLARS.length - 18), tilt: 0.11, roll: -0.11 };
  let leanX = 0, leanY = 0, lx = 0, ly = 0;
  const proj = (R, a, tilt, roll, yo = 0) => { const zr = R * S.zoom, P = PITCH + tilt + S.pitch + ly * 0.14, x0 = zr * Math.sin(a), z0 = zr * Math.cos(a); let y = yo * Math.cos(P) + z0 * Math.sin(P); const z = -yo * Math.sin(P) + z0 * Math.cos(P); const ro = roll + lx * 0.1; const x = x0 * Math.cos(ro) - y * Math.sin(ro); y = x0 * Math.sin(ro) + y * Math.cos(ro); const sc = D / (D - z); return [x * sc, y * sc, z, sc]; };

  /* the pieces */
  const fx = h("canvas.rx-fx", { "aria-hidden": "true" }); const dpr = Math.min(2, devicePixelRatio || 1); fx.width = (W + M * 2) * dpr; fx.height = (H + M * 2) * dpr; const g = fx.getContext("2d");
  const coreSize = Math.round(W * 0.52); const cd = Math.min(1.5, dpr); const coreCv = h("canvas.rx-core", { width: Math.round(coreSize * cd), height: Math.round(coreSize * cd), style: { width: coreSize + "px", height: coreSize + "px", left: cx - coreSize / 2 + "px", top: cy - coreSize / 2 + "px" }, "aria-hidden": "true" });
  const drawFire = calm ? null : fire(coreCv); if (!drawFire) coreCv.classList.add("flat");
  let energy = 0; const now0 = clock.now(); const coreBtn = h("button.rx-corebtn", { type: "button", "aria-label": "Command: search or add", style: { left: cx + "px", top: cy + "px" }, onclick: () => { energy = 1; blip(); wake(); ctx.openSearch(); } },
    h("b.num", fmtTime(`${now0.getHours()}:${String(now0.getMinutes()).padStart(2, "0")}`).replace(/ ?[AP]M/i, "")), h("span", "Command"));
  const stage = h("div.rx-stage", { style: { width: W + "px", height: H + "px" } }, fx, coreCv, coreBtn);
  let moved = false;
  const nodes = PILLARS.map((p, i) => { const badge = h("i.hex-badge", { hidden: true }); let held = false, timer = null;
    const a = h("a.hex-in", { href: p.route, "aria-label": `${p.name}: ${p.what}`, draggable: "false", oncontextmenu: (e) => e.preventDefault(),
      onpointerdown: () => { held = false; timer = setTimeout(() => { if (moved) return; held = true; buzz(18); brief(p, stats, tn, () => go(i)); }, 480); }, onpointerup: () => clearTimeout(timer), onpointerleave: () => clearTimeout(timer), onpointercancel: () => clearTimeout(timer),
      onclick: (e) => { e.preventDefault(); clearTimeout(timer); if (held || moved) return; tick(); enter(i); } }, icon(p.icon, Math.round(gs * 0.5)), h("span.hex-name", p.short), badge);
    const el = h("div.hex", { style: { width: hw.toFixed(1) + "px", height: hh.toFixed(1) + "px", "--c": `hsl(${p.hue} 100% 68%)` }, dataset: { pillar: p.id } }, a); stage.append(el);
    return { p, el, badge, ring: ringOf(i), grid: [CELLS[i].x * gs, CELLS[i].y * gs], rgb: `hsl(${p.hue} 100% 66%)`, x: 0, y: 0, sc: 1, z: 0, al: 1 }; });
  const halo = nodes.map((n) => { const c = document.createElement("canvas"); c.width = c.height = 96; const k = c.getContext("2d"); const gr = k.createRadialGradient(48, 48, 2, 48, 48, 48); gr.addColorStop(0, `hsla(${n.p.hue}, 100%, 70%, .55)`); gr.addColorStop(0.4, `hsla(${n.p.hue}, 100%, 60%, .16)`); gr.addColorStop(1, `hsla(${n.p.hue}, 100%, 60%, 0)`); k.fillStyle = gr; k.fillRect(0, 0, 96, 96); return c; });
  const dust = Array.from({ length: calm ? 0 : 190 }, (_, i) => ({ R: W * (0.13 + Math.random() * 0.43), a: Math.random() * TAU, v: 0.05 + Math.random() * 0.22, tilt: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 26, s: 0.8 + Math.random() * 1.7, c: i % 3 }));
  const waves = [];

  /* the readout under the system */
  const nameEl = h("b.rx-name", ""), whatEl = h("small.rx-what", ""); const enterBtn = h("button.btn.enter.rx-enter", { type: "button", onclick: () => { tick(); go(focus); } }, "Enter", icon("right", 18));
  const read = h("div.rx-read", { "aria-live": "polite" }, h("span.rx-text", nameEl, whatEl), enterBtn);
  let focus = -1; const setFocus = (i, loud) => { if (i === focus) return; focus = i; const n = nodes[i]; nodes.forEach((x, j) => x.el.classList.toggle("focus", j === i)); read.style.setProperty("--c", n.rgb);
    const [head, tail] = n.p.name.split(" · "); scramble(nameEl, head); const f = factsFor(n.p, stats, tn); whatEl.textContent = f[0] || (tail ? tail + ": " : "") + n.p.what; if (loud) tick(); };
  const paintBadges = () => { for (const n of nodes) { const v = badgeFor(n.p, stats, t, tn); if (v) { n.badge.textContent = v; n.badge.hidden = false; } } };
  paintBadges(); titan().then((d) => { tn = d; if (!d) return; paintBadges(); const tl = document.getElementById("titan-live"); if (tl) tl.replaceWith(titanTile(d)); if (focus >= 0 && nodes[focus].p.id === "titan") whatEl.textContent = factsFor(nodes[focus].p, stats, tn)[0]; });

  /* entering a pillar: swing it to the front, then warp from where it sits */
  let fly = null, flyCb = null; const frontYaw = (i) => S.yaw + wrap(-nodes[i].ring.a0 - S.yaw);
  function go(i) { const b = nodes[i].el.getBoundingClientRect(), sb = stage.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; waves.push({ x: x - sb.left, y: y - sb.top, t: 0, c: nodes[i].rgb }); energy = 1; wake(); warp(x, y, nodes[i].rgb, () => { location.href = nodes[i].p.route; }); setTimeout(() => { dead = true; }, 300); }   // the page is leaving: stop drawing so the way out is free
  function enter(i) { if (mode === "grid" || calm || i === focus) return go(i); fly = frontYaw(i); S.vel = 0; let done = false; flyCb = () => { if (!done) { done = true; go(i); } }; const cb = flyCb; setTimeout(() => { if (flyCb === cb) { fly = null; flyCb = null; cb(); } }, 900); wake(); }

  /* the finger: a sideways drag spins the system; up and down still scrolls the page */
  let drag = null, lastTouch = 0, lastX = 0, lastT = 0;
  stage.addEventListener("pointerdown", (e) => { if (mode !== "orbit" || fly != null) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: S.yaw }; moved = false; lastX = e.clientX; lastT = performance.now(); S.vel = 0; wake(); });
  const onMove = (e) => { if (e.pointerType === "mouse" && !drag) { leanX = (e.clientX / innerWidth - 0.5) * 2; leanY = (e.clientY / innerHeight - 0.5) * 2; }
    if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x; if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { moved = true; try { stage.setPointerCapture(e.pointerId); } catch (err) { /* fine */ } }
    if (!moved) return; S.yaw = drag.yaw + dx * 0.0085; const n = performance.now(); if (n > lastT) S.vel = lerp(S.vel, ((e.clientX - lastX) * 0.0085) / ((n - lastT) / 1000), 0.5); lastX = e.clientX; lastT = n; lastTouch = n; };
  const onUp = (e) => { if (!drag || e.pointerId !== drag.id) return; drag = null; lastTouch = performance.now(); setTimeout(() => { moved = false; }, 60); };
  const onTilt = (e) => { if (e.gamma == null) return; leanX = clamp(e.gamma / 30, -1, 1); leanY = clamp((e.beta - 45) / 36, -1, 1); };
  addEventListener("pointermove", onMove, { passive: true }); addEventListener("pointerup", onUp); addEventListener("pointercancel", onUp); if (!calm) addEventListener("deviceorientation", onTilt, { passive: true });

  /* one frame */
  let raf = 0, last = 0, time = 0, seen = true, slow = 0, dead = false;
  function frame(now) {
    raf = 0; if (dead) return; const real = Math.min(0.25, last ? (now - last) / 1000 : 0.016), dt = Math.min(0.05, real); last = now; time += dt;   // entrances follow the real clock even on a slow frame if (dt > 0.03) slow++; else slow = Math.max(0, slow - 1); if (slow > 50 && dust.length > 80) dust.length = 80;
    if (!document.body.classList.contains("booting")) birth = Math.min(1, birth + real / 1.7);
    const goal = mode === "grid" ? 1 : 0; mix = Math.abs(goal - mix) < 0.002 ? goal : mix + (goal - mix) * Math.min(1, real * 4.2); lx += (leanX - lx) * Math.min(1, dt * 4); ly += (leanY - ly) * Math.min(1, dt * 4); energy *= Math.pow(0.08, dt);
    if (mode === "orbit" && !drag) {
      if (fly != null) { const d = fly - S.yaw; S.yaw += d * Math.min(1, dt * 8.5); if (Math.abs(d) < 0.012) { S.yaw = fly; fly = null; const cb = flyCb; flyCb = null; if (cb) cb(); } }
      else { S.yaw += S.vel * dt; S.vel *= Math.pow(0.1, dt); const idle = now - lastTouch > 3200;
        if (idle) S.vel += (0.11 - S.vel) * Math.min(1, dt * 0.9); else if (Math.abs(S.vel) < 0.5 && focus >= 0) { S.vel *= Math.pow(0.02, dt); S.yaw += (frontYaw(focus) - S.yaw) * Math.min(1, dt * 6.5); } } }
    let best = 0, bv = -2; nodes.forEach((n, i) => { const v = Math.cos(n.ring.a0 + S.yaw); if (v > bv) { bv = v; best = i; } }); if (fly == null) setFocus(best, !!drag || now - lastTouch < 1500);
    const km = smooth(mix);
    nodes.forEach((n, i) => { const bi = clamp(birth * 1.9 - (i / nodes.length) * 0.9), mi = smooth(clamp(mix * 1.5 - (i / nodes.length) * 0.5)); const o = proj(n.ring.R, n.ring.a0 + S.yaw - (1 - bi) * 2.6 + mi * (1 - mi) * 3.2, n.ring.tilt, n.ring.roll);
      const fz = clamp((o[2] / R2 + 1) / 2); const osc = (0.5 + 0.36 * fz) * (i === focus ? 1.22 : 1) * o[3]; const bb = bi <= 0 ? 0 : back(bi);
      n.x = lerp(o[0], n.grid[0], mi) * bb; n.y = lerp(o[1], n.grid[1], mi) * bb; n.sc = lerp(osc, 1, mi) * clamp(bb, 0, 1.15); n.z = lerp(o[2], 0, mi); n.al = lerp(0.42 + 0.58 * fz, 1, mi) * clamp(bi * 3);
      n.el.style.transform = `translate3d(${(cx + n.x - hw / 2).toFixed(1)}px,${(cy + n.y - hh / 2).toFixed(1)}px,0) scale(${n.sc.toFixed(3)})`; n.el.style.opacity = n.al.toFixed(2); n.el.style.zIndex = String(500 + Math.round(n.z) + (i === focus && mi < 0.5 ? 400 : 0)); });
    const cs = lerp(1, 0.5, km) * (0.3 + 0.7 * clamp(birth * 2.2)) * (1 + energy * 0.12); coreCv.style.transform = `scale(${cs.toFixed(3)})`; if (drawFire) drawFire(time, energy + (1 - clamp(birth * 1.4)) * 1.5);

    /* light */
    const idxMap = new Map(nodes.map((n, idx) => [n.p.id, idx]));
    const orbitA = (1 - km) * clamp(birth * 1.6 - 0.3);
    if (orbitA > 0.01) for (const [R, tilt, roll, col] of [[R1, 0.16, 0.1, "255,170,100"], [R2, -0.07, -0.06, "110,220,255"], [R3, 0.11, -0.11, "190,150,255"]]) {
      for (const front of [false, true]) { g.beginPath(); let pen = false; for (let k = 0; k <= 72; k++) { const q = proj(R, (k / 72) * TAU + S.yaw, tilt, roll); if (q[2] > 0 === front) { if (pen) g.lineTo(q[0], q[1]); else { g.moveTo(q[0], q[1]); pen = true; } } else pen = false; }
        g.strokeStyle = `rgba(${col},${(front ? 0.8 : 0.3) * orbitA})`; g.lineWidth = front ? 1.6 : 1; g.stroke(); g.strokeStyle = `rgba(${col},${(front ? 0.16 : 0.06) * orbitA})`; g.lineWidth = 6; g.stroke(); }
      for (let k = 0; k < 36; k++) { const q = proj(R * 1.07, (k / 36) * TAU + S.yaw, tilt, roll), q2 = proj(R * (k % 3 ? 1.09 : 1.12), (k / 36) * TAU + S.yaw, tilt, roll); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q2[0], q2[1]); g.strokeStyle = `rgba(${col},${(q[2] > 0 ? 0.42 : 0.12) * orbitA})`; g.lineWidth = 1; g.stroke(); } }
    /* animated quadratic Bezier inter-pillar synapses */
    SYNAPSES.forEach(([aId, bId, col], si) => {
      const ia = idxMap.get(aId), ib = idxMap.get(bId);
      if (ia == null || ib == null) return;
      const a = nodes[ia], b = nodes[ib];
      if (a.al < 0.08 || b.al < 0.08) return;
      const mx0 = (a.x + b.x) * 0.38, my0 = (a.y + b.y) * 0.38 - 18;
      g.strokeStyle = `rgba(${col},${0.16 * birth * (1 - km * 0.5)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(mx0, my0, b.x, b.y); g.stroke();
      const u = (time * 0.42 + si * 0.19) % 1, iu = 1 - u;
      const px = iu * iu * a.x + 2 * iu * u * mx0 + u * u * b.x, py = iu * iu * a.y + 2 * iu * u * my0 + u * u * b.y;
      g.fillStyle = `rgba(${col},${0.9 * birth})`; g.beginPath(); g.arc(px, py, 1.9, 0, TAU); g.fill();
    });
    const cols = ["255,255,255", "255,180,110", "120,225,255"]; for (let c = 0; c < 3; c++) { g.fillStyle = `rgb(${cols[c]})`; for (const d of dust) { if (d.c !== c) continue; d.a += d.v * dt; const q = proj(d.R, d.a + S.yaw * 0.6, d.tilt, 0, d.y); g.globalAlpha = (0.12 + 0.5 * clamp((q[2] / (W * 0.5) + 1) / 2)) * clamp(birth * 1.4) * (1 - km * 0.55); const sz = d.s * q[3]; g.fillRect(q[0], q[1], sz, sz); } } g.globalAlpha = 1;
    nodes.forEach((n, i) => { if (n.al < 0.03) return; const pulse = (time * 0.55 + i * 0.137) % 1; g.strokeStyle = n.rgb; g.globalAlpha = n.al * (i < 6 ? 0.34 : 0.16) * (1 - km * 0.3); g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(n.x, n.y); g.stroke();
      g.globalAlpha = n.al * 0.95; g.fillStyle = "#fff"; g.beginPath(); g.arc(n.x * pulse, n.y * pulse, 1.5 + (i < 6 ? 0.6 : 0), 0, TAU); g.fill();
      const hs = (i === focus && km < 0.5 ? 190 : 118) * n.sc * (1 + 0.08 * Math.sin(time * 2 + i)); g.globalAlpha = n.al * (i === focus ? 0.95 : 0.6); g.drawImage(halo[i], n.x - hs / 2, n.y - hs / 2, hs, hs);
      const stP = stats[n.p.id]; const dueSoon = stP && stP.next && diffDays(t, stP.next.date) <= 3;
      if (dueSoon && birth > 0.7) { g.strokeStyle = "rgba(255,155,95,.68)"; g.lineWidth = 1.4; g.globalAlpha = 0.55 + 0.35 * Math.sin(time * 3.8 + i); g.beginPath(); g.arc(n.x, n.y, hh * 0.52 * n.sc, 0, TAU); g.stroke(); } });
    if (focus >= 0 && km < 0.5 && birth > 0.9) { const n = nodes[focus], rr = hh * 0.62 * n.sc; g.globalAlpha = 1 - km * 2; g.strokeStyle = n.rgb; g.lineWidth = 1.6; for (let k = 0; k < 3; k++) { const a = time * 1.3 + (k * TAU) / 3; g.beginPath(); g.arc(n.x, n.y, rr, a, a + 1.1); g.stroke(); } g.lineWidth = 1; g.globalAlpha *= 0.5; g.beginPath(); g.arc(n.x, n.y, rr + 6, -time * 0.8, -time * 0.8 + 4.4); g.stroke(); }
    for (let k = waves.length - 1; k >= 0; k--) { const w = waves[k]; w.t += dt; const a = 1 - w.t / 0.7; if (a <= 0) { waves.splice(k, 1); continue; } g.globalAlpha = a; g.strokeStyle = w.c; g.lineWidth = 2.5 * a + 0.5; g.beginPath(); g.arc(w.x - cx, w.y - cy, 16 + w.t * 330, 0, TAU); g.stroke(); }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    if (seen && !document.hidden && !calm) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !dead) { last = 0; raf = requestAnimationFrame(frame); } };
  const modeSeg = calm ? null : seg([["orbit", "Orbit"], ["grid", "Grid"]], mode, (v) => { mode = v; ls("prom.deck.layout", v); tick(); el.dataset.mode = v; wake(); }, "Layout");
  const zoomCtl = calm ? null : h("div.rx-zoom", h("button.btn.ghost.small", { type: "button", "aria-label": "Zoom out", onclick: () => { S.zoom = clamp(S.zoom - 0.12, 0.8, 1.28); wake(); } }, "−"), h("button.btn.ghost.small", { type: "button", "aria-label": "Reset orbit view", onclick: () => { S.zoom = 1; S.pitch = 0; wake(); } }, "1×"), h("button.btn.ghost.small", { type: "button", "aria-label": "Zoom in", onclick: () => { S.zoom = clamp(S.zoom + 0.12, 0.8, 1.28); wake(); } }, "+"));
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => { seen = es[0].isIntersecting; if (seen) wake(); }) : null; if (io) io.observe(stage);
  const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener("visibilitychange", onVis);

  /* the ticker: one line of what is true right now */
  const facts = []; const soon = feedRows(t, addDays(t, 30)).filter((r) => !r.done); const fixedNext = soon.find((r) => r.fixed), mine = soon.filter((r) => !r.fixed);
  facts.push(`${PILLARS.length} pillars online`);
  for (const e of recentEvents(2)) facts.push(e.say.length > 70 ? e.say.slice(0, 69) + "…" : e.say);                 // what last happened inside the pillars (the shared event log)
  if (mine[0]) facts.push(`next: ${mine[0].title} · ${diffDays(t, mine[0].date) === 0 ? "today" : "in " + plural(diffDays(t, mine[0].date), "day")}`);
  if (fixedNext) facts.push(`${fixedNext.title} in ${plural(diffDays(t, fixedNext.date), "day")}`);
  const held = Object.values(stats).reduce((n, x) => n + x.records, 0); if (held) facts.push(`${plural(held, "entry", "entries")} across the pillars on this device`);
  const w = ctx.weather(); if (w && w.now) facts.push(`${Math.round(w.now.temp)}° outside${(w.alerts || []).length ? " · " + w.alerts[0].event : ""}`);
  const line = () => facts.map((f) => h("span", f)); const tickerEl = h("div.ticker", { "aria-label": facts.join(". ") }, h("div.ticker-run", { "aria-hidden": "true" }, line(), line()));
  titan().then((d) => { if (d && d.total && tickerEl.isConnected) { facts.push(`Titan ${money(d.total)} · ${d.flips} specimens`); tickerEl.firstChild.replaceChildren(...line(), ...line()); } });

  const el = h("section.reactor.live", { "aria-label": "The pillars", dataset: { mode } }, stage, h("div.rx-hud", read, h("div.rx-controls", modeSeg, zoomCtl)), tickerEl);
  el.cleanup = () => { dead = true; cancelAnimationFrame(raf); if (io) io.disconnect(); document.removeEventListener("visibilitychange", onVis); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp); removeEventListener("deviceorientation", onTilt); };
  frame(performance.now());
  return el;
}

/** Titan on the hub: its real total and its newest coins, straight from its published ledger. */
export function titanTile(d) {
  if (!d) return h("span", { id: "titan-live", hidden: true });
  return h("a.tile.titan", { id: "titan-live", href: d.url, "aria-label": "Titan Reliquary" }, h("span.tile-head", h("span", "Titan Reliquary"), h("small", `${d.flips} specimens`)),
    h("span.tile-main", h("span", h("b.num.big", money(d.total, 0)), h("small", `${Number(d.ag).toFixed(2)} oz silver · ${Number(d.au).toFixed(4)} oz gold`))),
    h("span.coins", d.newest.map((c) => h("img", { src: c.img, alt: "", loading: "lazy", decoding: "async", width: 96, height: 96 }))), h("small.quiet", "newest arrivals"));
}

/** The boot: once a session. A line ignites, the systems count in, the core lights. Tap to skip. */
export function boot(force) {
  let seen = false; try { seen = !!sessionStorage.getItem("prom.deck.boot"); sessionStorage.setItem("prom.deck.boot", "1"); } catch (e) { /* play it */ }
  if ((seen && !force) || still() || (clock.pinned && clock.pinned() && !force)) return;
  const rows = [["CORE", "IGNITION"], ["PILLARS", PILLARS.length + " / " + PILLARS.length], ["SKY", "LIVE"], ["DATA", "ON DEVICE"]];
  const el = h("div.boot", { onclick: () => end() }, h("div.boot-line"), h("div.boot-box", h("b", "PROMETHEUS"), ...rows.map(([k, v], i) => h("p", { style: { "--i": i } }, h("span", k), h("i"), h("em", v)))));
  document.body.append(el); document.body.classList.add("booting"); bootSound(); let over = false;
  function end() { if (over) return; over = true; el.classList.add("out"); document.body.classList.remove("booting"); setTimeout(() => el.remove(), 520); }
  setTimeout(end, 1900);
}
