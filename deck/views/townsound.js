/* The town's sound (owner's briefing c4, 2026-11-25: "Rain and wind you can hear"). Real field recordings, not synthesis: rain light and
   heavy, wind and a storm's howl, birds by day, crickets on warm nights, an owl now and then after dark, thunder after the lightning the
   town shows (audio/town/, from Titan's ambience set: CC0 or the Pixabay Content License, see audio/town/CREDITS.md). Each layer follows
   the live sky the town already reads (realm.js el.sky(): rain, snow, wind, storm, the hour) and the season; a layer is fetched only
   when it is first heard, and nothing plays until he turns the sound on (the speaker on the town; remembered on this device). Browsers
   start audio only after a touch, so with the sound on the first tap anywhere starts it. Leaving the town or hiding the page silences it. */
const KEY = "prom.deck.townSound";
const SRC = (f, ext) => new URL(`../../audio/town/${f}.${ext}`, import.meta.url).href;
const LOOPS = ["rainLight", "rainHeavy", "wind", "windHowl", "birds", "crickets"];
/* the one-shot files hold several takes; [start, length] in seconds (audio/town/CREDITS.md) */
const TAKES = { thunder: [[0, 15], [15.5, 15], [31, 15]], owl: [[0, 3.4], [3.9, 3.2]] };
export const townSoundOn = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** What each layer should be at, 0..1, from the sky ({ ph, rain, snow, wind, storm }), the temperature (°F or null) and the season name.
    Pure, so the proofs can check the mix for any weather. */
export function mixFor(sky, tempF = null, seasonName = "") {
  const el = Math.sin((sky.ph - 0.25) * Math.PI * 2), day = smooth(-0.08, 0.22, el), night = 1 - day, dawn = Math.exp(-Math.pow((sky.ph - 0.27) / 0.035, 2));
  const rain = clamp(sky.rain || 0), snow = clamp(sky.snow || 0), wind = clamp(sky.wind || 0), storm = clamp(sky.storm || 0);
  const heavy = Math.max(smooth(0.55, 0.9, rain), storm);
  const cold = seasonName === "Winter" || seasonName === "Snow on the ground", warm = tempF == null ? (seasonName === "Summer" ? 1 : seasonName === "Spring" ? 0.4 : seasonName === "Autumn" ? 0.3 : 0) : smooth(50, 64, tempF);
  const quiet = 1 - snow * 0.7;                                      // snow hushes the town
  return {
    rainLight: rain * (1 - heavy) * 0.9,
    rainHeavy: rain * heavy,
    wind: (0.16 + wind * 0.7) * quiet * (1 - heavy * 0.4),
    windHowl: Math.max(smooth(0.5, 0.9, wind), storm * 0.7) * 0.75,
    birds: day * (1 - rain * 0.9) * (1 - snow) * (cold ? 0.35 : seasonName === "Spring" ? 1 : 0.75) * (1 + dawn * 0.6) * 0.8,
    crickets: night * warm * (1 - rain) * (1 - snow) * 0.7,
    owl: night * (1 - rain) * 0.5,                                   // how often an owl calls (one-shot)
    thunder: storm,                                                   // the lightning brings it (realm.js el.onflash)
  };
}

/** The engine for one visit to the town. sky() and info() are read twice a second; returns { toggle, on, state, mix, flash, cleanup }. */
export function townSound(sky, info) {
  let ac = null, master = null, on = townSoundOn(), started = false, dead = false, timer = 0, owlAt = 0, lastFlash = 0;
  const layers = {}, buffers = {}, loading = {};
  const ext = (() => { try { const a = document.createElement("audio"); return a.canPlayType('audio/webm; codecs="opus"') ? "webm" : "m4a"; } catch (e) { return "m4a"; } })();
  let target = {};
  function context() {
    if (ac || dead) return ac;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return null; }
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination); return ac;
  }
  function load(name) {
    if (buffers[name] || loading[name]) return loading[name] || Promise.resolve(buffers[name]);
    loading[name] = fetch(SRC(name, ext)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(name + " " + r.status))))
      .then((b) => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).then((buf) => { buffers[name] = buf; delete loading[name]; return buf; })
      .catch((e) => { delete loading[name]; console.warn("[town sound]", String(e).slice(0, 120)); return null; });
    return loading[name];
  }
  function layer(name) {
    if (layers[name]) return layers[name];
    const g = ac.createGain(); g.gain.value = 0; g.connect(master); const L = layers[name] = { g, src: null, want: 0 };
    load(name).then((buf) => { if (!buf || dead || !ac) return; const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(g);
      s.start(ac.currentTime + 0.05, Math.random() * buf.duration); L.src = s; });
    return L;
  }
  function shot(name, gain, delay = 0) {
    if (!ac || !on || ac.state !== "running") return;
    load(name).then((buf) => { if (!buf || dead || !ac) return; const take = TAKES[name][Math.floor(Math.random() * TAKES[name].length)];
      const s = ac.createBufferSource(), g = ac.createGain(), t = ac.currentTime + delay; s.buffer = buf; g.gain.value = gain; s.connect(g).connect(master);
      s.start(t, take[0], take[1]); });
  }
  function update() {
    if (dead) return;
    const k = sky(), i = info() || {}; target = mixFor(k, i.temp, i.season);
    if (!ac || !started) return;
    const now = ac.currentTime;
    for (const name of LOOPS) { const want = target[name] || 0; if (want < 0.01 && !layers[name]) continue; const L = layer(name); if (Math.abs(L.want - want) > 0.005) { L.want = want; L.g.gain.setTargetAtTime(want, now, 1.6); } }
    if (target.owl > 0.2 && performance.now() > owlAt) { if (owlAt) shot("owl", 0.35 * target.owl); owlAt = performance.now() + 45000 + Math.random() * 105000; }
    /* thunder with no lightning to follow (reduced motion shows none): now and then while the storm lasts */
    if (target.thunder > 0.4 && performance.now() - lastFlash > 26000 && Math.random() < 0.03) flash();
  }
  function flash() { lastFlash = performance.now(); if (target.thunder > 0.2 || (sky().storm || 0) > 0.2) shot("thunder", 0.5 + Math.random() * 0.4, 0.6 + Math.random() * 3.4); }
  function start() {
    if (!on || dead) return; if (!context()) return;
    const go = () => { if (dead || !on) return; started = true; master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0.6, ac.currentTime, 0.9); update(); };
    if (ac.state === "suspended") ac.resume().then(go).catch(() => {}); else go();
  }
  /* with the sound on, the first touch anywhere starts it (browsers allow audio only after one) */
  const kick = () => { if (on && (!ac || ac.state !== "running" || !started)) start(); };
  const KICKS = ["pointerdown", "touchend", "click", "keydown"];   // older iPhones unlock audio only on touchend or click
  for (const ev of KICKS) addEventListener(ev, kick, { passive: true });
  const onVis = () => { if (!ac) return; if (document.hidden) ac.suspend().catch(() => {}); else if (on && started) ac.resume().catch(() => {}); };
  document.addEventListener("visibilitychange", onVis);
  timer = setInterval(update, 500); update();
  if (on) start();
  function toggle(force) {
    on = typeof force === "boolean" ? force : !on; try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* this visit only */ }
    if (on) start(); else if (ac && master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.25); started = false; setTimeout(() => { if (!on && ac) ac.suspend().catch(() => {}); }, 900); }
    return on;
  }
  return {
    toggle, on: () => on, flash,
    mix: () => ({ ...target }),
    state: () => ({ on, running: !!(ac && ac.state === "running" && started), ext, playing: Object.keys(layers).filter((n) => layers[n].want > 0.01 && layers[n].src), loaded: Object.keys(buffers) }),
    cleanup() { dead = true; clearInterval(timer); for (const ev of KICKS) removeEventListener(ev, kick); document.removeEventListener("visibilitychange", onVis);
      if (ac) { try { master.gain.setTargetAtTime(0, ac.currentTime, 0.15); } catch (e) { /* closing */ } const a = ac; ac = null; setTimeout(() => a.close().catch(() => {}), 500); } },
  };
}
