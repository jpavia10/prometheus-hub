/* The deck's feel: its interface sounds (off until the owner turns them on: nothing ever plays by itself), a short buzz on Android, and
   the warp that carries you from the core into a pillar. The sounds themselves are designed in voice.js (rebuilt 2026-11-25: the owner
   called the old beeps terrible); this file keeps the switch, the one audio context and where the finger was. */
import { SOUNDS, chain, loadHall, voice } from "./voice.js";
const KEY = "prom.deck.sound"; let ac = null, ch = null, lastX = 0.5, lastTick = 0, step = 0, lastBlip = 0;
export const soundOn = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
export function setSound(on) { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) { /* this visit only */ } if (on) play("chime", 0); }
function ctx() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" }); } catch (e) { ac = null; return null; }
    ch = chain(ac, ac.destination); loadHall(ac, ch.conv); }
  if (ac.state === "suspended") ac.resume().catch(() => {});
  return ac;
}
/* sounds sit left or right by where the finger touched */
if (typeof addEventListener === "function") addEventListener("pointerdown", (e) => { if (typeof innerWidth === "number" && innerWidth > 0) lastX = e.clientX / innerWidth; }, { capture: true, passive: true });
function play(name, pan = (lastX - 0.5) * 1.1, o) {
  if (!soundOn()) return; const a = ctx(); if (!a) return;
  try { SOUNDS[name](a, voice(a, ch, pan), a.currentTime + 0.005, o); } catch (e) { /* a browser without a node type: stay silent */ }
}
export const buzz = (ms = 12) => { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); } catch (e) { /* no motor */ } };   // only after a touch: browsers refuse it before one
export const tick = () => { const now = performance.now(); if (now - lastTick > 40) { lastTick = now; play("tick"); } buzz(8); };   // no machine-gun taps
export const blip = () => { const now = performance.now(); if (now - lastBlip > 2600) step = 0; lastBlip = now; play("blip", undefined, { step: step++ }); };
export const bootSound = () => play("boot", 0);
export const warpSound = () => play("warp", 0);

const still = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeRaf = null;
let activeTimer = null;
let warping = false;
let warpToken = 0;

/** Whether a warp transition is currently in progress. */
export const isWarping = () => warping;

/** Warp out from a point on the screen in a colour, then run `then` (the navigation). The deck is pulled into the point; stars streak past. */
export function warp(x, y, color, then) {
  unwarp();
  if (still()) return typeof then === "function" ? then() : undefined;
  warpSound(); buzz(22);
  const cv = document.createElement("canvas"); cv.className = "warp";
  const dpr = Math.min(2, (typeof devicePixelRatio !== "undefined" && devicePixelRatio) || 1);
  const W = typeof innerWidth !== "undefined" ? innerWidth : 0;
  const H = typeof innerHeight !== "undefined" ? innerHeight : 0;
  cv.width = W * dpr; cv.height = H * dpr; document.body.append(cv);
  const g = cv.getContext ? cv.getContext("2d") : null; if (g) g.scale(dpr, dpr);
  const stars = Array.from({ length: 150 }, () => ({ a: Math.random() * Math.PI * 2, r: 6 + Math.random() * 60, v: 0.5 + Math.random() * 1.6, w: 0.6 + Math.random() * 1.6 }));
  const deck = document.getElementById("deck");
  if (deck) { deck.style.setProperty("--wx", x + "px"); deck.style.setProperty("--wy", y + "px"); }
  document.body.classList.add("warping"); document.body.style.setProperty("--warp", color);
  const token = ++warpToken; warping = true;
  const t0 = performance.now(), dur = 640; let done = false;
  const finish = () => {
    if (done || token !== warpToken) return;
    done = true;
    if (activeRaf !== null) { cancelAnimationFrame(activeRaf); activeRaf = null; }
    if (activeTimer !== null) { clearTimeout(activeTimer); activeTimer = null; }
    warping = false;
    if (typeof then === "function") then();
  };
  const frame = (t) => {
    if (done || token !== warpToken) return;
    const k = Math.min(1, (t - t0) / dur), e = k * k * k;
    if (g) {
      g.clearRect(0, 0, W, H); g.lineCap = "round";
      for (const s of stars) { const r1 = s.r + e * s.v * Math.max(W, H) * 1.15, r0 = Math.max(s.r, r1 - (10 + e * 260) * s.v); g.strokeStyle = s.w > 1.5 ? color : "rgba(235,245,255,.95)"; g.globalAlpha = Math.min(1, 0.25 + k * 1.1); g.lineWidth = s.w * (0.6 + e * 1.8);
        g.beginPath(); g.moveTo(x + Math.cos(s.a) * r0, y + Math.sin(s.a) * r0); g.lineTo(x + Math.cos(s.a) * r1, y + Math.sin(s.a) * r1); g.stroke(); }
      if (k > 0.78) { g.globalAlpha = (k - 0.78) / 0.22; g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); }
    }
    if (k < 1) {
      const nextRaf = requestAnimationFrame(frame);
      if (!done && token === warpToken) activeRaf = nextRaf;
      else cancelAnimationFrame(nextRaf);
    } else finish();
  };
  const firstRaf = requestAnimationFrame(frame);
  if (!done && token === warpToken) activeRaf = firstRaf;
  else cancelAnimationFrame(firstRaf);
  const timerId = setTimeout(finish, dur + 400);
  if (!done && token === warpToken) activeTimer = timerId;
  else clearTimeout(timerId);
}
/** Coming back (the page is restored from the browser's cache, or a transition was cancelled): put the deck back. */
export function unwarp() {
  warpToken++;
  warping = false;
  if (activeRaf !== null) { cancelAnimationFrame(activeRaf); activeRaf = null; }
  if (activeTimer !== null) { clearTimeout(activeTimer); activeTimer = null; }
  if (typeof document !== "undefined") {
    if (document.body && document.body.classList) document.body.classList.remove("warping");
    if (document.querySelectorAll) document.querySelectorAll("canvas.warp").forEach((c) => c.remove());
  }
}
if (typeof addEventListener === "function") {
  addEventListener("pageshow", unwarp);
  addEventListener("pagehide", unwarp);
}
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") unwarp(); });
}
