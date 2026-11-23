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
let artList = null, stripMap = null;
/* the strip's painted cards: one sprite of every world (tools/art/strip.py); ids missing from it keep their icon */
function strip_() { return stripMap || (stripMap = fetch("art/worlds/strip.json").then((r) => (r.ok ? r.json() : null)).catch(() => null)); }
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
uniform vec2 R;uniform float T;uniform vec3 A;uniform vec3 B;uniform vec2 P;uniform float S;
uniform sampler2D W;uniform sampler2D D;uniform sampler2D L;uniform float HAS;uniform vec2 IR;
uniform sampler2D W2;uniform sampler2D D2;uniform sampler2D L2;uniform float HAS2;uniform vec2 IR2;
uniform float MIX;uniform float DIVE;uniform float Q;
const vec3 PEARL=vec3(.96,.97,1.);
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 sky(vec2 p,vec3 acc,float z){
  p/=z;vec2 c=vec2(0.,.17)+P*.025;float d=length(p-c);float hz=-.16;
  vec3 col=mix(vec3(.010,.013,.030),vec3(.028,.036,.075),smoothstep(-.6,.7,p.y));
  vec2 q=p*1.5+vec2(T*.012,-T*.007)+P*.04;float neb=fbm(q*1.3+fbm(q*2.1+T*.025));
  col+=acc*pow(neb,2.4)*.62+mix(PEARL,vec3(.62,.72,1.),.5)*pow(neb,4.2)*.22;
  vec2 sg=floor(gl_FragCoord.xy/(2.+S));float st=step(.9965,h1(sg));col+=st*vec3(.85,.9,1.)*(.45+.55*sin(T*1.7+h1(sg+3.)*40.))*smoothstep(-.1,.45,p.y);
  float ang=atan(p.y-c.y,p.x-c.x);float rays=pow(fbm(vec2(ang*2.6,T*.07))*1.25,3.2)*smoothstep(1.3,0.,d);
  col+=mix(acc,PEARL,.4)*rays*.42;col+=mix(acc,PEARL,.62)*(.010/(d*d+.012));col+=acc*.16*exp(-d*3.2);
  if(p.y<hz){float fy=hz-p.y;col=mix(col,vec3(.008,.010,.022),smoothstep(0.,.05,fy)*.9);
    float ripple=fbm(vec2(p.x*7.,fy*28.-T*.5));col+=mix(acc,PEARL,.45)*.16*exp(-abs(p.x-c.x)*(4.+fy*9.))*exp(-fy*2.6)*(.6+.8*ripple);
    col+=acc*.035*fbm(vec2(p.x*3.,fy*9.+T*.1))*exp(-fy*4.);}
  col+=mix(acc,PEARL,.3)*.30*exp(-abs(p.y-hz)*55.)*smoothstep(1.,.05,abs(p.x));
  return col;
}
/* a painting with live layers: a slow dolly that swells the near planes more than the far ones, parallax by depth (finger or tilt),
   flickering lights and short light shafts from the lights map; z is the camera push (transitions and the dive) */
vec3 art(sampler2D w,sampler2D d,sampler2D l,vec2 ir,vec3 acc,float z,vec2 p,vec2 uv,out float dep){
  float sc=max(R.x/ir.x,R.y/ir.y);vec2 sz=ir*sc;vec2 tuv=(gl_FragCoord.xy-(R-sz)*.5)/sz;tuv.y=1.-tuv.y;
  vec2 cc=vec2(.5,.46);dep=texture2D(d,tuv).r;
  float br=.016+.014*sin(T*.075);float zz=z*(1.+br*(.35+dep));tuv=cc+(tuv-cc)/zz;
  vec2 off=P*(dep-.35)*.034+vec2(sin(T*.11),cos(T*.09))*.004*dep;vec2 u=tuv+off;
  vec3 col=texture2D(w,u).rgb;float li=texture2D(l,u).r;
  float fl=.82+.12*sin(T*2.1+u.y*9.)+.06*sin(T*5.3+u.x*13.);
  col+=li*fl*mix(acc,PEARL,.55)*.38+li*li*.18;
  if(Q>.5){vec2 stp=(vec2(.5,.2)-u)*.055;float ray=texture2D(l,u+stp).r*.8+texture2D(l,u+stp*2.).r*.55+texture2D(l,u+stp*3.).r*.3;
    col+=mix(acc,PEARL,.6)*ray*.075*(.75+.25*sin(T*.6+u.x*3.));}
  col+=acc*.05*smoothstep(.5,0.,abs(p.y+.16))*fbm(p*3.+T*.05);
  col*=1.-.48*smoothstep(.68,.3,uv.y);
  return col;
}
void main(){
  vec2 uv=gl_FragCoord.xy/R;vec2 p=(gl_FragCoord.xy-.5*R)/R.y;
  float m=MIX;float zc=1.+(1.-m)*.075+DIVE*.6;float dc=.5;vec3 col;
  if(HAS>.5)col=art(W,D,L,IR,A,zc,p,uv,dc);else col=sky(p,A,zc);
  /*FLY*/  if(m<.999){
    float zp=1.+m*.18+DIVE*.6;float dp;vec3 prv;
    if(HAS2>.5)prv=art(W2,D2,L2,IR2,B,zp,p,uv,dp);else prv=sky(p,B,zp);
    /* the next world resolves from the far planes forward, through a soft drifting edge with a little light on it */
    float n=fbm(uv*vec2(5.,8.)+T*.15);float e=m*1.4-.2+((1.-dc)-.5)*.6*HAS+(n-.5)*.36;
    float k=smoothstep(.42,.58,e);float rim=1.-abs(k*2.-1.);
    col=mix(prv,col,k)+mix(A,PEARL,.5)*rim*.16*(1.-m);
  }
  /*YLF*/
  col*=smoothstep(1.35,.28,length(p*vec2(.95,.72))*(1.+DIVE*.5));
  col+=mix(A,PEARL,.7)*DIVE*DIVE*.35*exp(-length(p)*2.2);
  col+=(h1(gl_FragCoord.xy+fract(T)*91.)-.5)*.018;
  gl_FragColor=vec4(pow(col,vec3(.97)),1.);
}`;

/* two programs: the steady one (no second world: some GPUs pay for a branch even when it is not taken) and the flight one, used only during a flight */
const FS_STEADY = FS.replace(/\/\*FLY\*\/[\s\S]*?\/\*YLF\*\//, "");

function world() {
  const cv = h("canvas.menu-world", { "aria-hidden": "true" }); const fx = h("canvas.menu-dust", { "aria-hidden": "true" });
  const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
  /* a = this world's light, b = the one it is leaving; mix runs 0 -> 1 across a flight between worlds; dive is the push into a world on Enter */
  const st = { a: [0.5, 0.6, 1], b: [0.5, 0.6, 1], px: 0, py: 0, tx: 0, ty: 0, has: 0, has2: 0, ir: [9, 16], ir2: [9, 16], mix: 1, dive: 0, diving: false,
    on: true, dead: false, hue: 210, want: null, q: 1, slow: 0 };
  let prog = null, U = {}, cur = [], prv = [], P1 = null, P2 = null;
  const NAMES = ["R", "T", "A", "B", "P", "S", "W", "D", "L", "HAS", "IR", "W2", "D2", "L2", "HAS2", "IR2", "MIX", "DIVE", "Q"];
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
    const v = sh(gl.VERTEX_SHADER, VS);
    const make = (src) => { const f = sh(gl.FRAGMENT_SHADER, src); if (!v || !f) return null; const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.bindAttribLocation(pr, 0, "a"); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null; const u = {}; for (const n of NAMES) u[n] = gl.getUniformLocation(pr, n);
      gl.useProgram(pr); ["W", "D", "L", "W2", "D2", "L2"].forEach((n, i) => u[n] && gl.uniform1i(u[n], i)); return { pr, u }; };
    P1 = make(FS_STEADY); P2 = make(FS) || P1;
    if (P1) {
      prog = P1.pr; U = P1.u; gl.useProgram(prog);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const mk = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
      cur = [mk(), mk(), mk()]; prv = [mk(), mk(), mk()];
    }
  }
  if (!prog) cv.classList.add("flat");
  const bindAll = () => { if (!gl || !prog) return; [...cur, ...prv].forEach((t, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); }); };
  const upload = (t, im) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); };
  bindAll();
  /* dust in depth: far motes small and slow, a few near ones large, soft and quick to follow the finger (they sit in front of the painting) */
  const g2 = fx.getContext("2d");
  const dots = Array.from({ length: 72 }, (_, i) => { const near = i < 9; return { x: Math.random(), y: Math.random(), z: near ? 1.6 + Math.random() * 1.2 : 0.3 + Math.random() * 0.7, s: near ? 2.4 + Math.random() * 2.2 : 0.6 + Math.random() * 1.8, w: Math.random() * 6.28, near }; });
  const spr = document.createElement("canvas"); spr.width = spr.height = 32;
  function sprite(hue) { const k = spr.getContext("2d"); k.clearRect(0, 0, 32, 32); const gr = k.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.25, `hsla(${hue},100%,78%,.55)`); gr.addColorStop(1, `hsla(${hue},100%,60%,0)`); k.fillStyle = gr; k.fillRect(0, 0, 32, 32); }
  sprite(210);
  const dprW = Math.min(1, devicePixelRatio || 1), dprF = Math.min(1.5, devicePixelRatio || 1);
  function size() { const w = innerWidth, hh = innerHeight; cv.width = Math.round(w * dprW * 0.85); cv.height = Math.round(hh * dprW * 0.85); fx.width = Math.round(w * dprF); fx.height = Math.round(hh * dprF); if (gl && prog) gl.viewport(0, 0, cv.width, cv.height); }
  size(); addEventListener("resize", size);
  const t0 = performance.now(); let last = t0, raf = 0, diveDone = null;
  function frame(now) {
    raf = 0; if (st.dead) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; const T = (now - t0) / 1000;
    /* governor: a phone that cannot hold ~35 fps for two seconds drops the light shafts */
    if (dt > 0.028) st.slow = Math.min(3, st.slow + dt); else st.slow = Math.max(0, st.slow - dt * 0.5); if (st.slow > 2 && st.q) st.q = 0;
    if (st.mix < 1) st.mix = Math.min(1, st.mix + dt / 1.25);
    if (st.diving) { st.dive = Math.min(1, st.dive + dt / 0.55); if (st.dive >= 1 && diveDone) { const f = diveDone; diveDone = null; f(); } }
    st.px += (st.tx - st.px) * Math.min(1, dt * 3); st.py += (st.ty - st.py) * Math.min(1, dt * 3);
    if (gl && prog) {
      const use = st.mix < 1 ? P2 : P1; if (use.pr !== prog) { prog = use.pr; U = use.u; gl.useProgram(prog); }
      gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, T); gl.uniform3fv(U.A, st.a); gl.uniform3fv(U.B, st.b);
      gl.uniform2f(U.P, st.px, st.py); gl.uniform1f(U.S, cv.width > 900 ? 1 : 0); gl.uniform1f(U.HAS, st.has); gl.uniform2f(U.IR, st.ir[0], st.ir[1]);
      gl.uniform1f(U.HAS2, st.has2); gl.uniform2f(U.IR2, st.ir2[0], st.ir2[1]); gl.uniform1f(U.MIX, st.mix * st.mix * (3 - 2 * st.mix)); gl.uniform1f(U.DIVE, st.dive * st.dive); gl.uniform1f(U.Q, st.q);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    const W = fx.width, H = fx.height; g2.clearRect(0, 0, W, H); g2.globalCompositeOperation = "lighter";
    const rush = 1 + st.dive * 9 + (1 - st.mix) * 2.5;
    for (const p of dots) { p.y -= dt * 0.018 * p.z * rush; p.x += Math.sin(T * 0.4 + p.w) * dt * 0.006 * p.z; if (p.y < -0.08) { p.y = 1.08; p.x = Math.random(); }
      const x = (p.x + st.px * 0.03 * p.z) * W, y = (p.y + st.py * 0.02 * p.z) * H, r = p.s * p.z * dprF * (p.near ? 2.6 : 3.2), a = (p.near ? 0.22 : 0.35) + (p.near ? 0.18 : 0.5) * Math.sin(T * 1.3 + p.w) ** 2;
      g2.globalAlpha = a * Math.min(1, (1 - p.y) * 3) * Math.min(1, p.y * 4); g2.drawImage(spr, x - r, y - r, r * 2, r * 2); }
    g2.globalAlpha = 1; g2.globalCompositeOperation = "source-over";
    if ((st.on && !still() && !document.hidden) || st.mix < 1 || st.diving) raf = requestAnimationFrame(frame);
  }
  const wake = () => { if (!raf && !st.dead) raf = requestAnimationFrame(frame); };
  const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener("visibilitychange", onVis);
  const onMove = (e) => { const x = e.touches ? e.touches[0].clientX : e.clientX, y = e.touches ? e.touches[0].clientY : e.clientY; st.tx = (x / innerWidth - 0.5) * 2; st.ty = (y / innerHeight - 0.5) * 2; };
  addEventListener("pointermove", onMove, { passive: true });
  const onTilt = (e) => { if (e.gamma == null) return; st.tx = Math.max(-1, Math.min(1, e.gamma / 30)); st.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); };
  addEventListener("deviceorientation", onTilt, { passive: true });
  /* decoded paintings, kept so a flight back is instant; the neighbours are fetched ahead */
  const cache = new Map();
  const img = (url) => new Promise((res) => { const im = new Image(); im.decoding = "async"; im.onload = () => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(() => res(im)); im.onerror = () => res(null); im.src = url; });
  function paintings(id) {
    if (!cache.has(id)) cache.set(id, Promise.all([img(`art/worlds/world_${id}.webp`), img(`art/worlds/world_${id}_depth.webp`), img(`art/worlds/world_${id}_lights.webp`)]).then((a) => (a[0] ? a : null)));
    return cache.get(id);
  }
  /* the flight: what is on screen becomes the world being left (its textures move to the second set), the new one comes in from the far planes */
  function fly(p, ims) {
    if (gl && prog) {
      if (st.mix >= 0.5) { [cur, prv] = [prv, cur]; st.has2 = st.has; st.ir2 = st.ir; st.b = st.a; }
      if (ims) { ims.forEach((im, i) => upload(cur[i], im)); st.ir = [ims[0].naturalWidth, ims[0].naturalHeight]; st.has = 1; } else st.has = 0;
      bindAll();
    } else { st.b = st.a; st.has = 0; }
    st.a = rgbOf(p.hue, 0.86, 0.6); st.mix = still() ? 1 : 0; wake();
  }
  return {
    els: [cv, fx],
    show(p, art) {
      st.want = p.id; st.hue = p.hue; sprite(p.hue);
      if (!art) { fly(p, null); return; }
      paintings(p.id).then((ims) => { if (st.want === p.id && !st.dead) fly(p, ims); });
    },
    preload(ids) { for (const id of ids) paintings(id); },
    undive() { st.diving = false; st.dive = 0; diveDone = null; wake(); },
    dive(then) { if (still() || !gl || !prog) { then(); return; } diveDone = then; st.diving = true; st.dive = 0; wake(); },
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

/** Today: the next 24 h first, then the next real deadlines across every pillar (county, state and federal dates, bills, what the pillars
    publish) with the days left; holidays only fill (2026-11-19: it used to show holidays and nothing else). Shared with the realm's card. */
export function todayRowsFor(now, t, max = 3, skip = []) {
  const skipT = new Set(skip.filter(Boolean));                                      /* titles already said elsewhere on the screen */
  const soon = within(24, now).filter((r) => !r.done && !skipT.has(r.title)).slice(0, max); const seenK = new Set(soon.map((r) => r.key));
  const left = (d) => { const n = Math.round((new Date(d + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5); return n <= 0 ? "today" : n === 1 ? "tomorrow" : `${n} d`; };
  const short = (d) => `${monName(Number(d.slice(5, 7)), 1)} ${Number(d.slice(8))}`;
  const cd = countdowns(max + 3 + skipT.size, t).filter((r) => !seenK.has(r.key) && !skipT.has(r.title)).slice(0, Math.max(0, max - soon.length));
  const rows = [...soon.map((r) => h("a.mn-trow", { href: r.go || `#/time/day/${r.date}` }, h("i.mn-dot" + ((r.weight || 0) >= 2 ? ".hard" : "")), h("b", r.title), h("small", untilText(r, now)))),
    ...cd.map((r) => { const l = left(r.date), hot = r.tone !== "holiday" && /^(today|tomorrow|[1-7] d)$/.test(l);
      return h("a.mn-trow", { href: r.go || "#/time/agenda", title: [r.title, r.agency].filter(Boolean).join(" · ") }, h("i.mn-dot" + (r.tone === "holiday" ? ".calm" : hot ? ".hard" : "")), h("b", r.title), h("small", `${short(r.date)} · ${l}`)); })];
  return { rows, soon };
}

export function menu(ctx, opts = {}) {
  const t = today(), now = clock.now(); const st = pillarStats(t); const list = PILLARS.filter((p) => !p.paused);
  let at = Math.max(0, list.findIndex((p) => p.id === ls(AT))); let hasArt = new Set();
  const W = world(); const sky = document.getElementById("sky"); (sky && sky.parentNode ? sky.after(...W.els) : document.body.prepend(...W.els)); document.body.classList.add("menu-on");

  const { rows: todayRows, soon } = todayRowsFor(now, t);
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
  const orbitBtn = h("button.mn-mode", { type: "button", onclick: () => { tick(); ls("prom.deck.home", "orbit"); unpin(); opts.rerender && opts.rerender(); } }, icon("picture", 15), h("span", "Realm"));
  const more = h("button.mn-more", { type: "button", onclick: () => { const v = document.getElementById("view"); const b = document.getElementById("briefing"); if (v && b) v.scrollTo({ top: b.offsetTop - 70, behavior: still() ? "auto" : "smooth" }); } }, h("span", "Briefing"), icon("down", 14));
  const stage = h("div.mn-stage", prev, crest, next);
  const el = h("section.menu", { "aria-label": "Prometheus: the pillars" }, h("h1.pk-sr", "Prometheus Hub"), today_, stage, card, h("div.mn-foot", orbitBtn, h("span.mn-count"), more), strip);

  function paint(dir) {
    const p = list[at]; const dom = domainOf(p.id); const dm = PILLAR_DOMAINS.find((d) => d.id === dom);
    el.style.setProperty("--h", p.hue); document.documentElement.style.setProperty("--menu-h", p.hue);
    const parts = p.name.split(" · ");
    kick.textContent = `${dm ? dm.label : "Prometheus"}`; title.textContent = parts[0]; title.style.setProperty("--len", Math.max(8, parts[0].length)); sub.textContent = TAG[p.id] || parts[1] || "";
    what.textContent = p.what; const setLive = (m) => { const L = liveLine(p, st, t, m); live.replaceChildren(h("i.mn-dot" + (L.hot ? ".hard" : "")), h("b", L.k), h("span", L.v)); };
    setLive(null); manifest(p).then((m) => { if (list[at] !== p || !m) return; if (m.mission) what.textContent = m.mission; setLive(m); });
    enter.querySelector("span").textContent = p.ext ? "Open" : "Enter";
    el.querySelector(".mn-count").textContent = `${String(at + 1).padStart(2, "0")} / ${list.length}`;
    crest.replaceChildren(emblem(p)); for (const x of [crest, card]) { x.classList.remove("in-l", "in-r"); void x.offsetWidth; x.classList.add(dir < 0 ? "in-l" : "in-r"); }
    strip.querySelectorAll(".mn-lvl").forEach((b, i) => { b.classList.toggle("on", i === at); b.setAttribute("aria-selected", String(i === at)); });
    const on = strip.children[at]; if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: still() ? "auto" : "smooth" });
    el.classList.toggle("art", hasArt.has(p.id)); W.show(p, hasArt.has(p.id)); ls(AT, p.id);
    W.preload([list[(at + 1) % list.length], list[(at - 1 + list.length) % list.length]].filter((x) => hasArt.has(x.id)).map((x) => x.id));
  }
  function pick(i, sound) { const d = i > at ? 1 : -1; at = (i + list.length) % list.length; if (sound) tick(); paint(d); }
  function step(d) { pick((at + d + list.length) % list.length, true); }
  function go(e) {
    const p = list[at]; blip(); const r = (e && e.currentTarget ? e.currentTarget : enter).getBoundingClientRect();
    el.classList.add("diving");
    W.dive(() => warp(r.left + r.width / 2, r.top + r.height / 2, hsl(p.hue, 100, 66), () => {
      try { sessionStorage.setItem("pk:dive", JSON.stringify({ id: p.id, t: Date.now() })); } catch (e) { /* private mode */ }   /* the pillar's living painting starts pushed in (kit/world.js) */
      location.href = p.route; }));
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

  strip_().then((m) => { if (!m || !m.ids) return; strip.style.setProperty("--n", m.ids.length);
    strip.querySelectorAll(".mn-lvl").forEach((b) => { const k = m.ids.indexOf(b.dataset.pillar); if (k < 0) return; b.classList.add("painted"); b.prepend(h("span.mn-lvl-art", { "aria-hidden": "true", style: { "--sx": k } })); });
    const on = strip.children[at]; if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" }); });
  paint(1); arts().then((s) => { hasArt = s; if (s.has(list[at].id)) { el.classList.add("art"); W.show(list[at], true); }
    W.preload([list[(at + 1) % list.length], list[(at - 1 + list.length) % list.length]].filter((x) => s.has(x.id)).map((x) => x.id)); });
  /* back from a pillar through the browser's page cache: the world comes back out of the dive */
  const onShow = (e) => { if (e.persisted) { el.classList.remove("diving"); W.undive(); } }; addEventListener("pageshow", onShow);
  el.cleanup = () => { W.kill(); removeEventListener("pageshow", onShow); removeEventListener("keydown", onKey); if (view) view.removeEventListener("scroll", onScroll); document.body.classList.remove("menu-on", "menu-off"); };
  return el;
}
