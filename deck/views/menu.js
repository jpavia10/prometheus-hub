/* The menu: Prometheus as a game's main menu (owner, 2026-11-16: "a AAA game menu"; the old home was "cheap, every pillar looks the
   same, empty, does not help my day"). One full-screen world behind everything; the pillars are levels you swipe through, one at a
   time, each with its own light and colour, what it is, and the one live thing it knows; Today on top says what is next across
   every pillar. The world is a painted image with live layers when its art exists (art/worlds/index.json lists them; Gemini paints
   them from docs/art/requests/artreq_20261116-0300_prometheus-worlds.json; Claude painted the first set through the Gemini API on 2026-11-19,
   tools/art/worlds.py) and a live painted sky in the pillar's colour until then. With a painting the crest steps back: the world is the level.
   The orbit and the whole briefing are kept: the orbit is one tap away, the briefing is right below. Nothing here invents a number. */
import { h, icon } from "../core/ui.js";
import { PILLARS } from "../pillars.js";
import { tick, blip, warp } from "../core/fx.js";
import { pillarStats } from "../core/legacy.js";
import { within, countdowns } from "../core/feeds.js";
import { clock, today, fmtDay, dowName, monName } from "../core/dates.js";
import { untilText } from "./parts.js";
import { domainOf, PILLAR_DOMAINS } from "./orrery.js";

const AT = "prom.deck.menu.at";
/** A ?home= in the address pins the mode (the proofs use it); choosing a mode by hand takes the pin away. */
export function unpin() { try { const u = new URL(location.href); if (u.searchParams.has("home")) { u.searchParams.delete("home"); history.replaceState(history.state, "", u); } } catch (e) { /* keep it */ } }
const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; };
const hsl = (hue, s = 92, l = 66) => `hsl(${hue} ${s}% ${l}%)`;
function rgbOf(hue, s = 0.85, l = 0.6) { const k = (n) => (n + hue / 30) % 12, a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [f(0), f(8), f(4)]; }

/* manifests: the mission line of each pillar, read once from its pillar.json (the registry the AIs read) */
const manifests = {};
function manifest(p) {
  if (p.ext) return Promise.resolve(null);
  return manifests[p.id] || (manifests[p.id] = fetch(p.route + "pillar.json").then((r) => (r.ok ? r.json() : null)).catch(() => null));
}
/* the short line under each title */
const TAG = { kairos: "Time", midas: "Money", titan: "The collection", hearth: "The house", garage: "The car", apollo: "Body", money: "Payoff", selling: "Sales", records: "Paper", icarus: "Trading journal",
  hermes: "Mail", piano: "Bossa nova", bastion: "Mountain prep", athenaeum: "Idea vault", odyssey: "Trips", privacy: "Footprint", argus: "Pictures", games: "Games", forge: "AI work",
  foundry: "Inventions", observatory: "Signals", kin: "Family", presence: "Presence", aether: "Sky & pass", polis: "Civic watch", mythos: "Stories", continuity: "Vault" };
let artList = null;
function arts() { return artList || (artList = fetch("art/worlds/index.json").then((r) => (r.ok ? r.json() : { worlds: [] })).then((j) => new Set(j.worlds || [])).catch(() => new Set())); }

/** The one live line a level shows: its next dated thing on the shared bus, or how much it keeps on this device. Never a made-up figure. */
function liveLine(p, st, t, m) {
  if (p.ext) return { k: "Its own site", v: p.id === "midas" ? "The encrypted book opens there" : "The collection opens there" };
  const s = st[p.id];
  if (s && s.next) return { k: s.next.date === t ? "Today" : "Next · " + fmtDay(s.next.date), v: s.next.title || "on the calendar", hot: s.next.date <= t };
  if (p.id === "kairos") { const c = countdowns(1, t)[0]; if (c) return { k: "Next · " + fmtDay(c.date), v: c.title }; }
  if (s && s.records) return { k: "On this device", v: s.records + (s.records === 1 ? " entry" : " entries") };
  const cmd = m && m.commands && m.commands[0]; if (cmd && cmd.label) return { k: "Start", v: cmd.label };
  return { k: "Ready", v: "Open it to begin" };
}

/* ---------- the world: one WebGL layer behind the deck, a painted sky in the level's colour, or its painted image with live layers ---------- */
const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform vec3 A;uniform vec3 B;uniform float K;uniform vec2 P;uniform float S;
uniform sampler2D W;uniform sampler2D D;uniform sampler2D L;uniform float HAS;uniform vec2 IR;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/R;vec2 p=(gl_FragCoord.xy-.5*R)/R.y;
  vec3 acc=mix(B,A,K);vec3 pearl=vec3(.96,.97,1.);vec3 col;
  vec2 c=vec2(0.,.17)+P*.025;float d=length(p-c);float hz=-.16;
  if(HAS>.5){
    float sc=max(R.x/IR.x,R.y/IR.y);vec2 sz=IR*sc;vec2 tuv=(gl_FragCoord.xy-(R-sz)*.5)/sz;tuv.y=1.-tuv.y;
    float dep=texture2D(D,tuv).r;vec2 off=P*(dep-.35)*.022+vec2(sin(T*.11),cos(T*.09))*.0025*dep;
    col=texture2D(W,tuv+off).rgb;float li=texture2D(L,tuv+off).r;
    float fl=.82+.12*sin(T*2.1+tuv.y*9.)+.06*sin(T*5.3+tuv.x*13.);
    col+=li*fl*mix(acc,pearl,.55)*.38+li*li*.18;
    col+=acc*.05*smoothstep(.5,0.,abs(p.y-hz))*fbm(p*3.+T*.05);
    col*=1.-.48*smoothstep(.68,.3,uv.y);
  } else {
    col=mix(vec3(.010,.013,.030),vec3(.028,.036,.075),smoothstep(-.6,.7,p.y));
    vec2 q=p*1.5+vec2(T*.012,-T*.007)+P*.04;float neb=fbm(q*1.3+fbm(q*2.1+T*.025));
    col+=acc*pow(neb,2.4)*.62+mix(pearl,vec3(.62,.72,1.),.5)*pow(neb,4.2)*.22;
    vec2 sg=floor(gl_FragCoord.xy/(2.+S));float st=step(.9965,h1(sg));col+=st*vec3(.85,.9,1.)*(.45+.55*sin(T*1.7+h1(sg+3.)*40.))*smoothstep(-.1,.45,p.y);
    float ang=atan(p.y-c.y,p.x-c.x);float rays=pow(fbm(vec2(ang*2.6,T*.07))*1.25,3.2)*smoothstep(1.3,0.,d);
    col+=mix(acc,pearl,.4)*rays*.42;
    col+=mix(acc,pearl,.62)*(.010/(d*d+.012));col+=acc*.16*exp(-d*3.2);
    if(p.y<hz){float fy=hz-p.y;col=mix(col,vec3(.008,.010,.022),smoothstep(0.,.05,fy)*.9);
      float ripple=fbm(vec2(p.x*7.,fy*28.-T*.5));col+=mix(acc,pearl,.45)*.16*exp(-abs(p.x-c.x)*(4.+fy*9.))*exp(-fy*2.6)*(.6+.8*ripple);
      col+=acc*.035*fbm(vec2(p.x*3.,fy*9.+T*.1))*exp(-fy*4.);}
    col+=mix(acc,pearl,.3)*.30*exp(-abs(p.y-hz)*55.)*smoothstep(1.,.05,abs(p.x));
  }
  col*=smoothstep(1.35,.28,length(p*vec2(.95,.72)));
  col+=(h1(gl_FragCoord.xy+fract(T)*91.)-.5)*.018;
  gl_FragColor=vec4(pow(col,vec3(.97)),1.);
}`;

function world() {
  const cv = h("canvas.menu-world", { "aria-hidden": "true" }); const fx = h("canvas.menu-dust", { "aria-hidden": "true" });
  const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
  const st = { a: [0.5, 0.6, 1], b: [0.5, 0.6, 1], k: 1, px: 0, py: 0, tx: 0, ty: 0, has: 0, ir: [9, 16], on: true, dead: false, hue: 210 };
  let prog = null, U = {}, tex = [];
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (v && f) { prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) prog = null; }
    if (prog) {
      gl.useProgram(prog); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ["R", "T", "A", "B", "K", "P", "S", "W", "D", "L", "HAS", "IR"]) U[n] = gl.getUniformLocation(prog, n);
      tex = [0, 1, 2].map((i) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; });
      gl.uniform1i(U.W, 0); gl.uniform1i(U.D, 1); gl.uniform1i(U.L, 2);
    }
  }
  if (!prog) cv.classList.add("flat");
  const g2 = fx.getContext("2d"); const dots = Array.from({ length: 64 }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, s: 0.6 + Math.random() * 1.8, w: Math.random() * 6.28 }));
  const spr = document.createElement("canvas"); spr.width = spr.height = 32;
  function sprite(hue) { const k = spr.getContext("2d"); k.clearRect(0, 0, 32, 32); const gr = k.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.25, `hsla(${hue},100%,78%,.55)`); gr.addColorStop(1, `hsla(${hue},100%,60%,0)`); k.fillStyle = gr; k.fillRect(0, 0, 32, 32); }
  sprite(210);
  const dprW = Math.min(1, devicePixelRatio || 1), dprF = Math.min(1.5, devicePixelRatio || 1);
  function size() { const w = innerWidth, hh = innerHeight; cv.width = Math.round(w * dprW * 0.85); cv.height = Math.round(hh * dprW * 0.85); fx.width = Math.round(w * dprF); fx.height = Math.round(hh * dprF); if (gl && prog) gl.viewport(0, 0, cv.width, cv.height); }
  size(); addEventListener("resize", size);
  const t0 = performance.now(); let last = t0, raf = 0;
  function frame(now) {
    raf = 0; if (st.dead) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; const T = (now - t0) / 1000;
    st.k = Math.min(1, st.k + dt * 1.6); st.px += (st.tx - st.px) * Math.min(1, dt * 3); st.py += (st.ty - st.py) * Math.min(1, dt * 3);
    if (gl && prog) {
      gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, T); gl.uniform3fv(U.A, st.a); gl.uniform3fv(U.B, st.b); gl.uniform1f(U.K, st.k * st.k * (3 - 2 * st.k));
      gl.uniform2f(U.P, st.px, st.py); gl.uniform1f(U.S, cv.width > 900 ? 1 : 0); gl.uniform1f(U.HAS, st.has); gl.uniform2f(U.IR, st.ir[0], st.ir[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const W = fx.width, H = fx.height; g2.clearRect(0, 0, W, H); g2.globalCompositeOperation = "lighter";
    for (const p of dots) { p.y -= dt * 0.018 * p.z; p.x += Math.sin(T * 0.4 + p.w) * dt * 0.006; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      const x = (p.x + st.px * 0.03 * p.z) * W, y = (p.y + st.py * 0.02 * p.z) * H, r = p.s * p.z * dprF * 3.2, a = 0.35 + 0.5 * Math.sin(T * 1.3 + p.w) ** 2;
      g2.globalAlpha = a * Math.min(1, (1 - p.y) * 3) * Math.min(1, p.y * 4); g2.drawImage(spr, x - r, y - r, r * 2, r * 2); }
    g2.globalAlpha = 1; g2.globalCompositeOperation = "source-over";
    if (st.on && !still() && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !st.dead) raf = requestAnimationFrame(frame); };
  const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener("visibilitychange", onVis);
  const onMove = (e) => { const x = e.touches ? e.touches[0].clientX : e.clientX, y = e.touches ? e.touches[0].clientY : e.clientY; st.tx = (x / innerWidth - 0.5) * 2; st.ty = (y / innerHeight - 0.5) * 2; };
  addEventListener("pointermove", onMove, { passive: true });
  const onTilt = (e) => { if (e.gamma == null) return; st.tx = Math.max(-1, Math.min(1, e.gamma / 30)); st.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); };
  addEventListener("deviceorientation", onTilt, { passive: true });
  function load(url, unit) { return new Promise((res) => { const im = new Image(); im.decoding = "async"; im.onload = () => { if (gl && prog) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex[unit]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); } res(im); }; im.onerror = () => res(null); im.src = url; }); }
  return {
    els: [cv, fx],
    show(p, art) {
      const c = rgbOf(p.hue, 0.86, 0.6); st.b = st.k >= 1 ? st.a : st.b.map((x, i) => x + (st.a[i] - x) * st.k); st.a = c; st.k = 0; st.hue = p.hue; sprite(p.hue);
      st.has = 0; const id = p.id;
      if (art) Promise.all([load(`art/worlds/world_${id}.webp`, 0), load(`art/worlds/world_${id}_depth.webp`, 1), load(`art/worlds/world_${id}_lights.webp`, 2)])
        .then(([w]) => { if (w && st.hue === p.hue) { st.ir = [w.naturalWidth, w.naturalHeight]; st.has = 1; wake(); } });
      wake();
    },
    run(on) { st.on = on; if (on) wake(); },
    kill() { st.dead = true; removeEventListener("resize", size); removeEventListener("pointermove", onMove); removeEventListener("deviceorientation", onTilt); document.removeEventListener("visibilitychange", onVis); cv.remove(); fx.remove(); },
  };
}

/* ---------- the emblem: the level's crest, large, in its own light ---------- */
function emblem(p) {
  const hex = "M50 3 L91 26.5 L91 73.5 L50 97 L9 73.5 L9 26.5 Z";
  const svg = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="mg-${p.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".55" stop-color="${hsl(p.hue, 90, 70)}"/><stop offset="1" stop-color="${hsl(p.hue, 80, 45)}"/></linearGradient></defs>
    <path d="${hex}" fill="rgba(6,9,18,.55)" stroke="url(#mg-${p.id})" stroke-width="2.2"/><path d="${hex}" fill="none" stroke="${hsl(p.hue, 95, 72)}" stroke-width="7" opacity=".16"/></svg>`;
  const el = h("div.mn-emblem", { style: { "--h": p.hue } }, h("i.mn-ring.r1"), h("i.mn-ring.r2"), h("i.mn-ring.r3"), h("span.mn-hex"), h("span.mn-ico", icon(p.icon, 46)));
  el.querySelector(".mn-hex").innerHTML = svg; return el;
}

export function menu(ctx, opts = {}) {
  const t = today(), now = clock.now(); const st = pillarStats(t); const list = PILLARS.filter((p) => !p.paused);
  let at = Math.max(0, list.findIndex((p) => p.id === ls(AT))); let hasArt = new Set();
  const W = world(); const sky = document.getElementById("sky"); (sky && sky.parentNode ? sky.after(...W.els) : document.body.prepend(...W.els)); document.body.classList.add("menu-on");

  /* Today: the next things across every pillar (the calendar, the bus, the bills), then the next big date */
  const soon = within(24, now).filter((r) => !r.done).slice(0, 2); const cd = countdowns(2, t);
  const todayRows = soon.length ? soon.map((r) => h("a.mn-trow", { href: r.go || `#/time/day/${r.date}` }, h("i.mn-dot" + ((r.weight || 0) >= 2 ? ".hard" : "")), h("b", r.title), h("small", untilText(r, now))))
    : cd.slice(0, 2).map((r) => h("a.mn-trow", { href: r.go || "#/time/agenda" }, h("i.mn-dot.calm"), h("b", r.title), h("small", fmtDay(r.date))));
  const today_ = h("a.mn-today", { href: "#/time", "aria-label": "Today across every pillar" },
    h("span.mn-tk", h("span", "Today"), h("small", `${dowName(t, 1)} · ${monName(Number(t.slice(5, 7)), 1)} ${Number(t.slice(8))}`), h("small.mn-clear", soon.length ? `${within(24, now).filter((r) => !r.done).length} in the next 24 h` : "clear for 24 h")),
    todayRows.length ? h("span.mn-trows", ...todayRows) : h("span.mn-trows", h("span.mn-trow", h("i.mn-dot.calm"), h("b", "Nothing dated yet"), h("small", "add one with +"))));

  /* the level card */
  const kick = h("p.mn-kick"), title = h("h2.mn-title"), sub = h("p.mn-sub"), what = h("p.mn-what"), live = h("p.mn-live"), crest = h("div.mn-crest");
  const enter = h("button.mn-enter", { type: "button", onclick: (e) => go(e) }, h("span", "Enter"), icon("right", 18));
  const prev = h("button.mn-arrow.prev", { type: "button", "aria-label": "Previous pillar", onclick: () => step(-1) }, icon("left", 22));
  const next = h("button.mn-arrow.next", { type: "button", "aria-label": "Next pillar", onclick: () => step(1) }, icon("right", 22));
  const card = h("div.mn-card", { "aria-live": "polite" }, kick, title, sub, what, live, h("div.mn-cta", enter));
  const strip = h("div.mn-strip", { role: "tablist", "aria-label": "Pillars" }, ...list.map((p, i) => h("button.mn-lvl", { type: "button", role: "tab", style: { "--h": p.hue }, dataset: { pillar: p.id }, "aria-label": p.name, onclick: () => { if (i === at) go(); else pick(i, true); } }, h("span.mn-lvl-ico", icon(p.icon, 18)), h("small", p.short))));
  const orbitBtn = h("button.mn-mode", { type: "button", onclick: () => { tick(); ls("prom.deck.home", "orbit"); unpin(); opts.rerender && opts.rerender(); } }, icon("picture", 15), h("span", "Orbit"));
  const more = h("button.mn-more", { type: "button", onclick: () => { const v = document.getElementById("view"); const b = document.getElementById("briefing"); if (v && b) v.scrollTo({ top: b.offsetTop - 70, behavior: still() ? "auto" : "smooth" }); } }, h("span", "Briefing"), icon("down", 14));
  const stage = h("div.mn-stage", prev, crest, next);
  const el = h("section.menu", { "aria-label": "Prometheus: the pillars" }, today_, stage, card, h("div.mn-foot", orbitBtn, h("span.mn-count"), more), strip);

  function paint(dir) {
    const p = list[at]; const dom = domainOf(p.id); const dm = PILLAR_DOMAINS.find((d) => d.id === dom);
    el.style.setProperty("--h", p.hue); document.documentElement.style.setProperty("--menu-h", p.hue);
    const parts = p.name.split(" · ");
    kick.textContent = `${dm ? dm.label : "Prometheus"}`; title.textContent = parts[0]; sub.textContent = TAG[p.id] || parts[1] || "";
    what.textContent = p.what; const setLive = (m) => { const L = liveLine(p, st, t, m); live.replaceChildren(h("i.mn-dot" + (L.hot ? ".hard" : "")), h("b", L.k), h("span", L.v)); };
    setLive(null); manifest(p).then((m) => { if (list[at] !== p || !m) return; if (m.mission) what.textContent = m.mission; setLive(m); });
    enter.querySelector("span").textContent = p.ext ? "Open" : "Enter";
    el.querySelector(".mn-count").textContent = `${String(at + 1).padStart(2, "0")} / ${list.length}`;
    crest.replaceChildren(emblem(p)); for (const x of [crest, card]) { x.classList.remove("in-l", "in-r"); void x.offsetWidth; x.classList.add(dir < 0 ? "in-l" : "in-r"); }
    strip.querySelectorAll(".mn-lvl").forEach((b, i) => { b.classList.toggle("on", i === at); b.setAttribute("aria-selected", String(i === at)); });
    const on = strip.children[at]; if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: still() ? "auto" : "smooth" });
    el.classList.toggle("art", hasArt.has(p.id)); W.show(p, hasArt.has(p.id)); ls(AT, p.id);
  }
  function pick(i, sound) { const d = i > at ? 1 : -1; at = (i + list.length) % list.length; if (sound) tick(); paint(d); }
  function step(d) { pick((at + d + list.length) % list.length, true); }
  function go(e) {
    const p = list[at]; blip(); const r = (e && e.currentTarget ? e.currentTarget : enter).getBoundingClientRect();
    warp(r.left + r.width / 2, r.top + r.height / 2, hsl(p.hue, 100, 66), () => { location.href = p.route; });
  }

  /* swipe the world, arrows on a keyboard */
  let sx = null, sy = null;
  stage.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1); });
  stage.addEventListener("touchstart", (e) => { const t0 = e.touches[0]; sx = t0.clientX; sy = t0.clientY; }, { passive: true });
  stage.addEventListener("touchend", (e) => { if (sx == null) return; const t1 = e.changedTouches[0]; const dx = t1.clientX - sx, dy = t1.clientY - sy; sx = null; if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.3) step(dx < 0 ? 1 : -1); }, { passive: true });
  const onKey = (e) => { if (e.target && /input|textarea|select/i.test(e.target.tagName)) return; if (document.querySelector(".sheet-wrap, dialog[open], #pk-lock")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); } else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } else if (e.key === "Enter" && document.activeElement === document.body) go(); };
  addEventListener("keydown", onKey);

  /* the world fades as the briefing scrolls in, and stops drawing when it is gone */
  const view = document.getElementById("view"); const onScroll = () => { const k = Math.max(0, Math.min(1, view.scrollTop / (innerHeight * 0.7))); for (const c of W.els) c.style.opacity = String(1 - k); document.body.classList.toggle("menu-off", k >= 0.99); W.run(k < 0.99); };
  if (view) view.addEventListener("scroll", onScroll, { passive: true });

  paint(1); arts().then((s) => { hasArt = s; if (s.has(list[at].id)) { el.classList.add("art"); W.show(list[at], true); } });
  el.cleanup = () => { W.kill(); removeEventListener("keydown", onKey); if (view) view.removeEventListener("scroll", onScroll); document.body.classList.remove("menu-on", "menu-off"); };
  return el;
}
