/* The deck's feel: synthesized interface sounds (off until the owner turns them on: nothing ever plays by itself), a short buzz on
   Android, and the warp that carries you from the core into a pillar. No recordings, no files. */
const KEY = "prom.deck.sound"; let ac = null;
export const soundOn = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
export function setSound(on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* this visit only */ } if (on) { ctx(); tone(660, 0.08, "sine", 0.05); tone(990, 0.12, "sine", 0.04, 0.07); } }
function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === "suspended") ac.resume(); return ac; }
function tone(freq, dur, type = "sine", vol = 0.04, delay = 0, slide = 0) {
  if (!soundOn()) return; const a = ctx(); if (!a) return; const t = a.currentTime + delay; const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
}
export const buzz = (ms = 12) => { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); } catch (e) { /* no motor */ } };   // only after a touch: browsers refuse it before one
export const tick = () => { tone(1320, 0.05, "triangle", 0.03); buzz(8); };
export const blip = () => { tone(880, 0.07, "sine", 0.04); tone(1320, 0.09, "sine", 0.03, 0.05); };
export const bootSound = () => { tone(110, 0.9, "sawtooth", 0.03, 0, 4); tone(220, 0.7, "sine", 0.04, 0.25, 3); tone(1760, 0.25, "sine", 0.03, 0.95); };
export const warpSound = () => { tone(180, 0.7, "sawtooth", 0.035, 0, 9); tone(90, 0.75, "sine", 0.05, 0, 0.5); };

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Warp out from a point on the screen in a colour, then run `then` (the navigation). The deck is pulled into the point; stars streak past. */
export function warp(x, y, color, then) {
  if (still()) return then(); warpSound(); buzz(22);
  const cv = document.createElement("canvas"); cv.className = "warp"; const dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; document.body.append(cv);
  const g = cv.getContext("2d"); g.scale(dpr, dpr); const stars = Array.from({ length: 150 }, () => ({ a: Math.random() * Math.PI * 2, r: 6 + Math.random() * 60, v: 0.5 + Math.random() * 1.6, w: 0.6 + Math.random() * 1.6 }));
  const deck = document.getElementById("deck"); deck.style.setProperty("--wx", x + "px"); deck.style.setProperty("--wy", y + "px"); document.body.classList.add("warping"); document.body.style.setProperty("--warp", color);
  const t0 = performance.now(), dur = 640; let done = false;
  const frame = (t) => { const k = Math.min(1, (t - t0) / dur), e = k * k * k; g.clearRect(0, 0, W, H); g.lineCap = "round";
    for (const s of stars) { const r1 = s.r + e * s.v * Math.max(W, H) * 1.15, r0 = Math.max(s.r, r1 - (10 + e * 260) * s.v); g.strokeStyle = s.w > 1.5 ? color : "rgba(235,245,255,.95)"; g.globalAlpha = Math.min(1, 0.25 + k * 1.1); g.lineWidth = s.w * (0.6 + e * 1.8);
      g.beginPath(); g.moveTo(x + Math.cos(s.a) * r0, y + Math.sin(s.a) * r0); g.lineTo(x + Math.cos(s.a) * r1, y + Math.sin(s.a) * r1); g.stroke(); }
    if (k > 0.78) { g.globalAlpha = (k - 0.78) / 0.22; g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); }
    if (k < 1) requestAnimationFrame(frame); else if (!done) { done = true; then(); } };
  requestAnimationFrame(frame); setTimeout(() => { if (!done) { done = true; then(); } }, dur + 400);
}
/** Coming back (the page is restored from the browser's cache, or a transition was cancelled): put the deck back. */
export function unwarp() { document.body.classList.remove("warping"); document.querySelectorAll("canvas.warp").forEach((c) => c.remove()); }
addEventListener("pageshow", unwarp);
