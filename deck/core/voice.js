/* The deck's voice: its interface sounds, rebuilt (owner, 2026-11-25: "The sound design is terrible also. It should be 1000 percent
   better"). The old set was bare oscillators: a triangle beep for a tap, a sawtooth sweep for the warp. This one is designed the way
   instrument sounds are:
   - a tap is a glass touch: a 3 ms filtered-noise transient, an inharmonic glass body (f and 2.76 f) with a few cents of random pitch so
     no two taps are the same, and a hint of wooden knock under it;
   - a choice is a small FM bell, and successive choices climb an E major pentatonic, so moving through places plays a phrase instead of
     one note over and over (it starts again after a pause);
   - the opening is a breath of air opening up (stereo noise through a rising filter) under a soft A major chord, then a three-bell spark;
   - the warp into a pillar is a real whoosh (two decorrelated noise bands sweeping up, left and right), a low thump as you land and a
     high bell in the room;
   - everything runs through one small room: a recorded impulse response (Central Hall, University of York, OpenAIR, CC BY 4.0; see
     audio/ir/CREDITS.md) with a synthetic room until it loads, a high-pass before the reverb so it never muddies, a gentle shelf on the
     top end and a limiter, and each sound is placed left or right by where the finger touched.
   Every sound is a function of (context, destination, time), so the proofs render them offline and measure them. Nothing plays unless
   the owner has turned the sound on. */

const IR_URL = (ext) => new URL(`../../audio/ir/hall.${ext}`, import.meta.url).href;
const E5 = 659.255;
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const cents = (c) => Math.pow(2, c / 1200);

/* ---------------------------------------------------------------- building blocks ---------------------------------------------------------------- */
const noiseCache = new WeakMap();
function noise(a) {
  let b = noiseCache.get(a); if (b) return b;
  b = a.createBuffer(2, Math.round(a.sampleRate * 1.5), a.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }   // two channels, decorrelated
  noiseCache.set(a, b); return b;
}
/** One sine (or other) partial with an attack and an exponential decay. */
function partial(a, dest, f, t, amp, attack, decay, type = "sine", glide = 0) {
  const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * glide), t + attack + decay);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  o.connect(g).connect(dest); o.start(t); o.stop(t + attack + decay + 0.05);
}
/** A small FM bell: the modulator's depth falls faster than the tone, so it strikes bright and rings pure. */
function bell(a, dest, f, t, amp, decay, ratio = 3.5, index = 1.8) {
  const c = a.createOscillator(), m = a.createOscillator(), mg = a.createGain(), g = a.createGain();
  c.frequency.setValueAtTime(f, t); m.frequency.setValueAtTime(f * ratio, t);
  mg.gain.setValueAtTime(f * index, t); mg.gain.exponentialRampToValueAtTime(f * index * 0.04, t + decay * 0.35);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  m.connect(mg).connect(c.frequency); c.connect(g).connect(dest);
  c.start(t); m.start(t); c.stop(t + decay + 0.05); m.stop(t + decay + 0.05);
  partial(a, dest, f * 2.76, t, amp * 0.18, 0.002, decay * 0.22);                       // a glassy upper partial, short
}
/** A noise burst through a filter. */
function hiss(a, dest, t, amp, dur, type, freq, q = 0.8, ch = 0) {
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noise(a);
  f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.0015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest); s.start(t, ch * 0.6 + Math.random() * 0.4); s.stop(t + dur + 0.02); return f;
}
/** A band of noise sweeping from f0 to f1 with a swell, panned. */
function sweep(a, dest, t, dur, f0, f1, amp, peakAt, pan, offset) {
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = noise(a);
  f.type = "bandpass"; f.Q.value = 1.1; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.85);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + peakAt); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = s.connect(f).connect(g);
  if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
  node.connect(dest); s.start(t, offset); s.stop(t + dur + 0.02);
}

/* ---------------------------------------------------------------- the sounds ---------------------------------------------------------------- */
/* each: (context, { dry, wet }, time, opts) where dry and wet are the two sends of one voice */
export const SOUNDS = {
  /** A tap: a glass touch. */
  tick(a, v, t) {
    const f = 2240 * cents((Math.random() - 0.5) * 70);
    hiss(a, v.dry, t, 0.20, 0.014, "bandpass", 4600, 0.9);
    partial(a, v.dry, f, t, 0.095, 0.0015, 0.075);
    partial(a, v.dry, f * 2.76, t, 0.026, 0.001, 0.032);
    partial(a, v.dry, 380 * cents((Math.random() - 0.5) * 40), t, 0.060, 0.0025, 0.035);   // the knock under it
    partial(a, v.wet, f, t, 0.040, 0.0015, 0.06);
  },
  /** A choice: an FM bell, stepping up the pentatonic phrase. */
  blip(a, v, t, o = {}) {
    const s = PENTA[(o.step || 0) % PENTA.length], f = E5 * Math.pow(2, s / 12);
    hiss(a, v.dry, t, 0.06, 0.010, "highpass", 5200, 0.7);
    bell(a, v.dry, f, t, 0.095, 0.95);
    bell(a, v.dry, f * 1.5, t + 0.06, 0.05, 0.75);                                        // the fifth above, a breath later
    bell(a, v.wet, f, t, 0.06, 0.9);
  },
  /** The sound being turned on: a rising third, then the fifth. */
  chime(a, v, t) {
    bell(a, v.dry, E5, t, 0.075, 0.9); bell(a, v.dry, E5 * Math.pow(2, 4 / 12), t + 0.09, 0.066, 0.9); bell(a, v.dry, E5 * 1.5, t + 0.18, 0.058, 1.2);
    bell(a, v.wet, E5 * 1.5, t + 0.18, 0.03, 1.2);
  },
  /** The deck waking: air opening up under a soft chord, then a three-bell spark. */
  boot(a, v, t) {
    const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(2400, t + 1.5); lp.Q.value = 0.5; lp.connect(v.dry);
    const pw = a.createGain(); pw.gain.value = 0.5; lp.connect(pw).connect(v.wet);
    for (const [f, amp] of [[110, 0.020], [164.81, 0.016], [220, 0.015], [277.18, 0.011], [329.63, 0.009], [440, 0.005]])
      for (const d of [-6, 6]) partial(a, lp, f * cents(d), t, amp, 0.9, 1.9);
    sweep(a, v.dry, t, 2.4, 260, 3400, 0.05, 0.95, -0.55, 0.1); sweep(a, v.dry, t, 2.4, 300, 3000, 0.05, 1.05, 0.55, 0.7);
    [880, 1318.51, 1760].forEach((f, i) => { bell(a, v.dry, f, t + 1.05 + i * 0.085, 0.030 - i * 0.004, 1.7, 3.5, 1.4); bell(a, v.wet, f, t + 1.05 + i * 0.085, 0.024, 1.7); });
  },
  /** Into a pillar: a whoosh left and right, a thump as you land, a bell in the room. */
  warp(a, v, t) {
    sweep(a, v.dry, t, 0.78, 240, 4200, 0.17, 0.52, -0.7, 0.05); sweep(a, v.dry, t, 0.78, 280, 3800, 0.17, 0.5, 0.7, 0.75);
    sweep(a, v.wet, t, 0.8, 300, 4000, 0.08, 0.52, 0, 0.4);
    partial(a, v.dry, 330, t, 0.010, 0.5, 0.15, "sine", 3);                                // a faint rise under the air
    partial(a, v.dry, 105, t + 0.6, 0.20, 0.004, 0.26, "sine", 0.45);                       // the landing
    hiss(a, v.dry, t + 0.6, 0.06, 0.07, "lowpass", 900, 0.6);
    bell(a, v.dry, 1760, t + 0.62, 0.022, 1.2); bell(a, v.wet, 1760, t + 0.62, 0.03, 1.3);
  },
};

/* ---------------------------------------------------------------- the room ---------------------------------------------------------------- */
/** A small synthetic room (stereo, 1.4 s): early reflections, then a tail that darkens as it decays. */
export function roomIR(a, secs = 1.4) {
  const n = Math.round(a.sampleRate * secs), b = a.createBuffer(2, n, a.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c); let lp = 0;
    for (let i = 0; i < n; i++) { const t = i / a.sampleRate, w = Math.random() * 2 - 1; const k = Math.min(0.92, 0.25 + t * 0.9); lp = lp * k + w * (1 - k);
      d[i] = (lp * 2.2) * Math.exp(-t / 0.32) * Math.min(1, t / 0.004); }
    for (const [ms, g] of [[11, 0.5], [17, 0.35], [23, 0.28], [31, 0.2]]) { const i = Math.round(((ms + c * 3) / 1000) * a.sampleRate); if (i < n) d[i] += g * (c ? -1 : 1); }
  }
  return b;
}
/** The chain every sound goes through: dry and a reverb send, a shelf, a limiter. Returns { out, wet, conv }. */
export function chain(a, dest) {
  const comp = a.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.002; comp.release.value = 0.2;
  const shelf = a.createBiquadFilter(); shelf.type = "highshelf"; shelf.frequency.value = 7800; shelf.gain.value = -2.5;
  const out = a.createGain(); out.gain.value = 0.9; out.connect(shelf).connect(comp).connect(dest);
  const conv = a.createConvolver(); conv.buffer = roomIR(a);
  const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 380;
  const wet = a.createGain(); wet.gain.value = 0.55; wet.connect(hp).connect(conv).connect(out);
  return { out, wet, conv };
}
/** Swaps the synthetic room for the recorded hall once it has loaded (Opus, else AAC for Safari). */
export function loadHall(a, conv) {
  let ext = "m4a"; try { const t = document.createElement("audio"); if (t.canPlayType('audio/webm; codecs="opus"')) ext = "webm"; } catch (e) { /* m4a */ }
  return fetch(IR_URL(ext)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("ir " + r.status))))
    .then((b) => new Promise((res, rej) => a.decodeAudioData(b, res, rej)))
    .then((buf) => { const n = Math.min(buf.length, Math.round(a.sampleRate * 1.6)), cut = a.createBuffer(buf.numberOfChannels, n, a.sampleRate);   // the first 1.6 s, faded
      for (let c = 0; c < buf.numberOfChannels; c++) { const s = buf.getChannelData(c), d = cut.getChannelData(c); for (let i = 0; i < n; i++) d[i] = s[i] * Math.min(1, (n - i) / (a.sampleRate * 0.4)); }
      conv.buffer = cut; return true; }).catch(() => false);
}
/** One voice: a dry path (panned) and a wet path into the room. */
export function voice(a, ch, pan = 0) {
  const dry = a.createGain(); let d = dry;
  if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = Math.max(-0.8, Math.min(0.8, pan)); dry.connect(p); d = p; }
  d.connect(ch.out); const wet = a.createGain(); wet.connect(ch.wet); return { dry, wet };
}
