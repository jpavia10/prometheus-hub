/* The town's sound. First set 2026-11-25 (owner's briefing c4: "Rain and wind you can hear"); rebuilt the same day (owner: "The sound
   design is terrible also. It should be 1000 percent better"). Real field recordings, placed in the painting:
   - the water has a place: the river and the lake, the two falls, the water round the spire, the dock. Each is mono and sits where it is
     in the painting; as the camera pans and zooms it moves left and right, comes closer (louder, brighter) and falls away (quieter,
     duller), so looking at the falls is hearing them;
   - the weather is all around: rain (light, heavy, and in the leaves), wind that gusts instead of holding still, the howl of a gale,
     thunder after the lightning the town shows;
   - the life follows the clock and the season: birds by day (more at dawn and in spring), crows on autumn and winter mornings, a
     woodpecker on spring and summer mornings, crickets and frogs on warm nights, an owl after dark, a dog far off in the evening,
     chimes on Hearth's porch when there is a breeze, a boat creaking at the dock;
   - the clock tower strikes the hours from 8 to 21 and once at the half hour (a cast bell, synthesized partial by partial: hum, prime,
     tierce, quint, nominal and above, each pair beating as real bells do), and on July 4th and New Year's Eve there are fireworks;
   - everything outdoors goes through a recorded outdoor space (Koli National Park in summer, its snowfield in winter: OpenAIR, CC BY 4.0).
   Files: audio/town/ (CC0 or the Pixabay Content License; credits in audio/town/CREDITS.md), fetched only when first heard. Nothing plays
   until he turns the sound on (the speaker on the town; remembered on this device); with it on, the first touch starts it. Leaving the town
   or hiding the page silences it. */
import { clock } from "../core/dates.js";

const KEY = "prom.deck.townSound";
const SRC = (f, ext) => new URL(`../../audio/town/${f}.${ext}`, import.meta.url).href;
const IR = (f, ext) => new URL(`../../audio/ir/${f}.${ext}`, import.meta.url).href;
/* the beds: all around, stereo */
const BEDS = ["rainLight", "rainHeavy", "leaves", "wind", "windTrees", "windHowl", "birds", "crickets"];
/* placed in the painting (x, y as fractions of it), mono; `lp` darkens one that should sound soft */
export const PLACES = {
  river:     { at: [[0.462, 0.61], [0.43, 0.70], [0.47, 0.82], [0.58, 0.84], [0.69, 0.80], [0.78, 0.83]], gain: 0.4 },
  waterfall: { at: [[0.374, 0.52], [0.335, 0.86]], gain: 0.5 },
  fountain:  { at: [[0.50, 0.70]], gain: 0.3 },
  lapping:   { at: [[0.83, 0.87]], gain: 0.5, lp: 1600 },
  frogs:     { at: [[0.70, 0.73], [0.60, 0.80], [0.40, 0.74]], gain: 0.42 },
  chimes:    { at: [[0.82, 0.44]], gain: 0.4 },
};
const SPOTS = { forest: [[0.14, 0.48], [0.22, 0.40], [0.12, 0.62], [0.76, 0.30], [0.90, 0.34], [0.96, 0.58]], dock: [[0.83, 0.87]], tower: [[0.532, 0.21]],
  houses: [[0.93, 0.52], [0.86, 0.40], [0.24, 0.46], [0.97, 0.45]], sky: [[0.35, 0.08], [0.5, 0.05], [0.65, 0.09], [0.45, 0.12]] };
let TAKES = { thunder: [[0, 15], [15.5, 15], [31, 15]], owl: [[0, 3.4], [3.9, 3.2]] };
let takesP = null;                                                  // the takes table is fetched with the first sound, never before the speaker is on
const takesReady = () => takesP || (takesP = fetch(SRC("takes", "json")).then((r) => (r.ok ? r.json() : null)).then((t) => { if (t) TAKES = { ...TAKES, ...t }; }).catch(() => { takesP = null; }));

export const townSoundOn = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];

/** What each layer should be at, 0..1, from the sky ({ ph, rain, snow, wind, storm }), the temperature (°F or null), the season name and
    the local hour (0..24). One-shots are rates (how often they come), not levels. Pure, so the proofs can check the mix for any weather. */
export function mixFor(sky, tempF = null, seasonName = "", hour = 12) {
  const el = Math.sin((sky.ph - 0.25) * Math.PI * 2), day = smooth(-0.08, 0.22, el), night = 1 - day, dawn = Math.exp(-Math.pow((sky.ph - 0.27) / 0.035, 2));
  const rain = clamp(sky.rain || 0), snow = clamp(sky.snow || 0), wind = clamp(sky.wind || 0), storm = clamp(sky.storm || 0);
  const heavy = Math.max(smooth(0.55, 0.9, rain), storm);
  const cold = seasonName === "Winter" || seasonName === "Snow on the ground", spring = seasonName === "Spring", autumn = seasonName === "Autumn";
  const warm = tempF == null ? (seasonName === "Summer" ? 1 : spring ? 0.4 : autumn ? 0.3 : 0) : smooth(50, 64, tempF);
  const quiet = 1 - snow * 0.7;                                      // snow hushes the town
  const morning = smooth(5.5, 7, hour) * (1 - smooth(10, 12, hour)), evening = smooth(17.5, 19, hour) * (1 - smooth(21.5, 23, hour));
  const dry = (1 - rain * 0.9) * (1 - snow);
  return {
    rainLight: rain * (1 - heavy) * 0.9,
    rainHeavy: rain * heavy,
    leaves: rain * 0.55 * (1 - heavy * 0.3),
    wind: (0.14 + wind * 0.65) * quiet * (1 - heavy * 0.4),
    windTrees: (0.05 * day + smooth(0.15, 0.7, wind) * 0.6) * quiet,
    windHowl: Math.max(smooth(0.5, 0.9, wind), storm * 0.7) * 0.75,
    birds: day * dry * (cold ? 0.35 : spring ? 1 : 0.75) * (1 + dawn * 0.6) * 0.8,
    crickets: night * warm * (1 - rain) * (1 - snow) * 0.7,
    /* placed */
    river: 1 - snow * 0.25, waterfall: 1, fountain: 1 - snow * 0.4, lapping: 1 - snow * 0.5,
    frogs: night * warm * (spring ? 1 : 0.7) * (1 - rain * 0.6) * (1 - snow),
    chimes: smooth(0.12, 0.55, wind) * (1 - storm * 0.6) * (1 - snow * 0.3),
    /* one-shots: how often (0 never, 1 the most) */
    owl: night * (1 - rain) * 0.5,
    crows: day * dry * (cold || autumn ? 1 : 0.35) * (0.4 + morning * 0.6),
    woodpecker: day * dry * (spring ? 1 : seasonName === "Summer" ? 0.6 : 0) * (0.3 + morning * 0.7),
    dog: (evening * 0.8 + morning * 0.4) * (1 - rain * 0.7),
    creak: 1 - snow * 0.6,
    bells: hour >= 8 && hour < 22 ? 1 : 0,
    thunder: storm,                                                   // the lightning brings it (realm.js el.onflash)
  };
}

/** Where a sound placed at (x, y) in the painting lands for a camera at view { cx, cy, hw, hh } (hw, hh: half the visible width and height,
    as fractions of the painting): { gain 0..~1.5, pan -0.9..0.9, cutoff Hz }. Closer and nearer the middle of the screen is louder and
    brighter; zooming in brings everything closer. Pure, for the proofs. */
export function placeFor(points, view) {
  const v = view && view.hw > 0 ? view : { cx: 0.5, cy: 0.5, hw: 0.5, hh: 0.5 };
  let best = null;
  for (const [x, y] of points) { const dx = (x - v.cx) / v.hw, dy = (y - v.cy) / v.hh, d = Math.hypot(dx, dy * 0.85); if (!best || d < best.d) best = { d, dx }; }
  const near = Math.max(0.5, Math.min(1.25, 0.25 / v.hw));            // zoomed in = closer
  return { gain: near / (1 + 0.55 * best.d * best.d), pan: Math.max(-0.9, Math.min(0.9, best.dx * 0.7)), cutoff: 700 + 17000 / (1 + 1.1 * best.d * best.d), d: best.d };
}

/** A cast tower bell, partial by partial (prime about B-flat 3). Renders into any context, so the proofs can measure it offline. */
export function strikeBell(a, dest, t, amp = 0.5, prime = 233) {
  const P = [[0.5, 0.32, 6.5], [1, 0.34, 4.2], [1.2, 0.38, 3.6], [1.5, 0.2, 2.6], [2, 0.85, 3.4], [2.5, 0.3, 2.2], [2.67, 0.24, 1.9], [3, 0.2, 1.6], [4, 0.14, 1.2], [5.33, 0.08, 0.8]];   // the nominal (2) leads, as the ear hears a bell
  for (const [r, a0, dec] of P) for (const beat of [-0.35, 0.35]) {          // each partial a close pair: the slow beat of a real bell
    const o = a.createOscillator(), g = a.createGain(), f = prime * r * (1 + (Math.random() - 0.5) * 0.002) + beat;
    o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp * a0 * 0.34, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    o.connect(g).connect(dest); o.start(t); o.stop(t + dec + 0.05);
  }
  const n = a.createBuffer(1, Math.round(a.sampleRate * 0.05), a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (a.sampleRate * 0.008));
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = n; f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = 0.9; g.gain.value = amp * 0.5;
  s.connect(f).connect(g).connect(dest); s.start(t);                         // the clapper
}

/** The engine for one visit to the town. sky() and info() are read twice a second (info: { temp, season, view }); returns
    { toggle, on, state, mix, flash, strike, cleanup }. */
export function townSound(sky, info) {
  let ac = null, master = null, verb = null, wetIn = null, on = townSoundOn(), started = false, dead = false, timer = 0, lastFlash = 0;
  let gust = 0, gustTo = 0, gustAt = 0, struck = "", fireAt = 0;
  const due = {};                                                   // when each one-shot may come next (performance.now ms)
  const layers = {}, buffers = {}, loading = {};
  const ext = (() => { try { const a = document.createElement("audio"); return a.canPlayType('audio/webm; codecs="opus"') ? "webm" : "m4a"; } catch (e) { return "m4a"; } })();
  let target = {}, view = null;
  function context() {
    if (ac || dead) return ac;
    try { ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "playback", sampleRate: 32000 }); }   // 32 kHz: a third less memory for a dozen beds
    catch (e) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e2) { ac = null; return null; } }
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.3;
    master = ac.createGain(); master.gain.value = 0; master.connect(comp).connect(ac.destination);
    verb = ac.createConvolver(); wetIn = ac.createGain(); wetIn.gain.value = 0.35; const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 220;
    wetIn.connect(hp).connect(verb).connect(master); room();
    return ac;
  }
  let roomName = "";
  function room() {                                                 // the outdoors he is standing in: the summer forest, or the snowfield
    const want = /Winter|Snow/.test((info() || {}).season || "") ? "snow" : "forest"; if (!ac || want === roomName) return; roomName = want;
    fetch(IR(want, ext)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("ir")))).then((b) => new Promise((res, rej) => ac.decodeAudioData(b, res, rej)))
      .then((buf) => { if (!dead && verb) verb.buffer = buf; }).catch(() => { roomName = ""; });
  }
  function load(name) {
    if (buffers[name] || loading[name]) return loading[name] || Promise.resolve(buffers[name]);
    loading[name] = fetch(SRC(name, ext)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(name + " " + r.status))))
      .then((b) => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).then((buf) => { buffers[name] = buf; delete loading[name]; return buf; })
      .catch((e) => { delete loading[name]; console.warn("[town sound]", String(e).slice(0, 120)); return null; });
    return loading[name];
  }
  /* a looping layer: bed (stereo, straight to the mix) or placed (mono: filter, pan, and a little of the outdoors) */
  function layer(name) {
    if (layers[name]) return layers[name];
    const placed = !!PLACES[name], g = ac.createGain(); g.gain.value = 0;
    const L = layers[name] = { g, src: null, want: 0, quietSince: 0, placed };
    if (placed) {
      const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = PLACES[name].lp || 12000; f.Q.value = 0.5;
      const p = ac.createStereoPanner ? ac.createStereoPanner() : null; const send = ac.createGain(); send.gain.value = 0.25;
      g.connect(f); if (p) { f.connect(p).connect(master); } else f.connect(master); f.connect(send).connect(wetIn); L.f = f; L.p = p;
    } else g.connect(master);
    load(name).then((buf) => { if (!buf || dead || !ac || layers[name] !== L) return; const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(g);
      s.start(ac.currentTime + 0.05, Math.random() * buf.duration); L.src = s; });
    return L;
  }
  function drop(name) { const L = layers[name]; if (!L) return; try { if (L.src) L.src.stop(); } catch (e) { /* stopped */ } L.g.disconnect(); delete layers[name]; delete buffers[name]; }
  /* a one-shot, placed at a point in the painting (or anywhere, for thunder) */
  function shot(name, gain, at, delay = 0, rate = 1) {
    if (!ac || !on || ac.state !== "running") return;
    takesReady().then(() => load(name)).then((buf) => { if (!buf || dead || !ac || !TAKES[name]) return; const take = pick(TAKES[name]);
      const s = ac.createBufferSource(), g = ac.createGain(), t = ac.currentTime + delay; s.buffer = buf; s.playbackRate.value = rate;
      let out = g, pl = null;
      if (at) { pl = placeFor([at], view); const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = Math.min(16000, pl.cutoff); g.connect(f); out = f; }
      g.gain.value = gain * (pl ? Math.min(1.2, pl.gain) : 1);
      if (pl && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pl.pan; out.connect(p).connect(master); } else out.connect(master);
      const send = ac.createGain(); send.gain.value = at ? 0.45 : 0.15; out.connect(send).connect(wetIn);
      s.connect(g); s.start(t, take[0], take[1] / rate); });
  }
  /** The clock tower: n strokes, 2.3 s apart. */
  function strike(n = 1) {
    if (!ac || !on || ac.state !== "running") return;
    const pl = placeFor(SPOTS.tower, view), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = "lowpass"; f.frequency.value = Math.min(9000, pl.cutoff + 1500);
    g.gain.value = 0.34 * Math.min(1.25, 0.45 + pl.gain); g.connect(f);
    if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pl.pan; f.connect(p).connect(master); } else f.connect(master);
    const send = ac.createGain(); send.gain.value = 0.7; f.connect(send).connect(wetIn);
    for (let i = 0; i < n; i++) strikeBell(ac, g, ac.currentTime + 0.1 + i * 2.3, 0.5);
  }
  const every = (name, rate, lo, hi, fire) => {                     // a one-shot that comes now and then, more often the higher its rate
    const now = performance.now(); if (rate < 0.08) { due[name] = 0; return; }
    if (!due[name]) { due[name] = now + rnd(lo, hi) * 1000 * 0.5 / rate; return; }
    if (now >= due[name]) { fire(); due[name] = now + rnd(lo, hi) * 1000 / Math.max(0.25, rate); }
  };
  function update() {
    if (dead) return;
    const k = sky(), i = info() || {}, d = clock.now(), hour = d.getHours() + d.getMinutes() / 60;
    target = mixFor(k, i.temp, i.season, hour); view = i.view || view;
    if (!ac || !started) return;
    const now = ac.currentTime, ms = performance.now();
    /* the wind gusts: a new gust every few seconds when there is wind, rising over two seconds and falling away */
    if (ms > gustAt) { gustTo = Math.random() < 0.6 ? rnd(0.15, 0.5) * smooth(0.1, 0.6, k.wind || 0) : 0; gustAt = ms + rnd(2500, 9000); }
    gust += (gustTo - gust) * 0.25;
    for (const name of BEDS) {
      let want = target[name] || 0; if (name === "wind" || name === "windTrees") want *= 1 + gust;
      if (want < 0.01 && !layers[name]) continue; const L = layer(name);
      if (Math.abs(L.want - want) > 0.005) { L.want = want; L.g.gain.setTargetAtTime(want, now, name.startsWith("wind") ? 0.9 : 1.6); }
      L.quietSince = want < 0.005 ? L.quietSince || ms : 0; if (L.quietSince && ms - L.quietSince > 90000) drop(name);   // silent a minute and a half: let it go
    }
    for (const [name, P] of Object.entries(PLACES)) {
      const pl = placeFor(P.at, view), want = (target[name] || 0) * P.gain * pl.gain;
      if (want < 0.012 && !layers[name]) continue; const L = layer(name);
      if (Math.abs(L.want - want) > 0.004) { L.want = want; L.g.gain.setTargetAtTime(want, now, 0.35); }
      if (L.p) L.p.pan.setTargetAtTime(pl.pan, now, 0.25);
      L.f.frequency.setTargetAtTime(Math.min(P.lp || 16000, pl.cutoff), now, 0.3);
      L.quietSince = want < 0.004 ? L.quietSince || ms : 0; if (L.quietSince && ms - L.quietSince > 90000) drop(name);
    }
    every("owl", target.owl, 45, 150, () => shot("owl", 0.42, pick(SPOTS.forest)));
    every("crows", target.crows, 50, 140, () => shot("crows", 0.32, pick(SPOTS.forest.concat(SPOTS.sky)), 0, rnd(0.94, 1.04)));
    every("woodpecker", target.woodpecker, 60, 170, () => shot("woodpecker", 0.3, pick(SPOTS.forest)));
    every("dog", target.dog, 90, 240, () => shot("dog", 0.16, pick(SPOTS.houses), 0, rnd(0.95, 1.03)));
    every("creak", target.creak, 10, 28, () => shot("creak", 0.4, SPOTS.dock[0], 0, rnd(0.9, 1.08)));
    /* the clock tower, on the hour and the half (once each) */
    const mm = d.getMinutes(), key = `${d.toDateString()} ${d.getHours()}:${mm < 30 ? 0 : 30}`;
    if (target.bells && (mm === 0 || mm === 30) && d.getSeconds() < 40 && struck !== key) { struck = key; strike(mm === 0 ? (d.getHours() % 12 || 12) : 1); }
    /* fireworks: the Fourth of July from nine, New Year's Eve at midnight */
    const md = (d.getMonth() + 1) * 100 + d.getDate(), fire = (md === 704 && hour >= 21 && hour < 23.5) || (md === 1231 && hour >= 23.83) || (md === 101 && hour < 0.6);
    if (fire && ms > fireAt) { shot("fireworks", 0.5, pick(SPOTS.sky), rnd(0, 0.4)); fireAt = ms + rnd(1500, 6500); }
    /* thunder with no lightning to follow (reduced motion shows none): now and then while the storm lasts */
    if (target.thunder > 0.4 && ms - lastFlash > 26000 && Math.random() < 0.03) flash();
    room();
  }
  function flash() { lastFlash = performance.now(); if (target.thunder > 0.2 || (sky().storm || 0) > 0.2) shot("thunder", 0.5 + Math.random() * 0.4, null, 0.6 + Math.random() * 3.4); }
  function start() {
    if (!on || dead) return; if (!context()) return;
    const go = () => { if (dead || !on) return; started = true; master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0.62, ac.currentTime, 0.9); update(); };
    if (ac.state === "suspended") ac.resume().then(go).catch(() => {}); else go();
  }
  /* with the sound on, the first touch anywhere starts it (browsers allow audio only after one) */
  const kick = () => { if (on && (!ac || ac.state !== "running" || !started)) start(); };
  const KICKS = ["pointerdown", "touchend", "click", "keydown"];   // older iPhones unlock audio only on touchend or click
  for (const ev of KICKS) addEventListener(ev, kick, { passive: true });
  const onVis = () => { if (!ac) return; if (document.hidden) ac.suspend().catch(() => {}); else if (on && started) ac.resume().catch(() => {}); };
  document.addEventListener("visibilitychange", onVis);
  timer = setInterval(update, 250); update();
  if (on) start();
  function toggle(force) {
    on = typeof force === "boolean" ? force : !on; try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* this visit only */ }
    if (on) start(); else if (ac && master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.25); started = false; setTimeout(() => { if (!on && ac) ac.suspend().catch(() => {}); }, 900); }
    return on;
  }
  return {
    toggle, on: () => on, flash, strike,
    mix: () => ({ ...target }),
    state: () => ({ on, running: !!(ac && ac.state === "running" && started), ext, rate: ac ? ac.sampleRate : 0, room: roomName,
      playing: Object.keys(layers).filter((n) => layers[n].want > 0.01 && layers[n].src), loaded: Object.keys(buffers),
      placed: Object.fromEntries(Object.keys(PLACES).filter((n) => layers[n]).map((n) => [n, { gain: +layers[n].want.toFixed(3), pan: layers[n].p ? +layers[n].p.pan.value.toFixed(2) : 0 }])) }),
    cleanup() { dead = true; clearInterval(timer); for (const ev of KICKS) removeEventListener(ev, kick); document.removeEventListener("visibilitychange", onVis);
      if (ac) { try { master.gain.setTargetAtTime(0, ac.currentTime, 0.15); } catch (e) { /* closing */ } const a = ac; ac = null; setTimeout(() => a.close().catch(() => {}), 500); } },
  };
}
