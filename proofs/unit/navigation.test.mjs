import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

function createStyleBag() {
  const map = new Map();
  return {
    setProperty(k, v) { map.set(k, String(v)); },
    getPropertyValue(k) { return map.get(k) || ""; },
  };
}

function createClassList() {
  const set = new Set();
  return {
    add(...cls) { for (const c of cls) set.add(c); },
    remove(...cls) { for (const c of cls) set.delete(c); },
    contains(c) { return set.has(c); },
    _all() { return Array.from(set); },
  };
}

function installNavigationEnv() {
  const origSetTimeout = globalThis.setTimeout;
  const origClearTimeout = globalThis.clearTimeout;
  const windowListeners = new Map();
  const docListeners = new Map();
  const activeRafs = new Map();
  const activeTimers = new Map();
  const cancelledRafs = [];
  const cancelledTimers = [];
  let rafSeq = 1;
  let nowMs = 1000;
  let hasDeck = true;
  let reduceMotion = false;
  const canvasNodes = [];

  const deckEl = {
    id: "deck",
    style: createStyleBag(),
  };

  const body = {
    classList: createClassList(),
    style: createStyleBag(),
    append(node) { canvasNodes.push(node); },
  };

  const mockCtx = {
    scale() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fillRect() {},
    lineCap: "butt",
    strokeStyle: "",
    fillStyle: "",
    globalAlpha: 1,
    lineWidth: 1,
  };

  const documentMock = {
    body,
    visibilityState: "visible",
    createElement(tag) {
      assert.equal(tag, "canvas");
      const node = {
        tagName: "CANVAS",
        className: "",
        width: 0,
        height: 0,
        getContext(kind) { return kind === "2d" ? mockCtx : null; },
        remove() {
          const idx = canvasNodes.indexOf(node);
          if (idx >= 0) canvasNodes.splice(idx, 1);
        },
      };
      return node;
    },
    getElementById(id) {
      return hasDeck && id === "deck" ? deckEl : null;
    },
    querySelectorAll(sel) {
      if (sel === "canvas.warp") return canvasNodes.filter((n) => n.className.split(/\s+/).includes("warp"));
      return [];
    },
    addEventListener(type, fn) {
      if (!docListeners.has(type)) docListeners.set(type, new Set());
      docListeners.get(type).add(fn);
    },
    removeEventListener(type, fn) {
      if (docListeners.has(type)) docListeners.get(type).delete(fn);
    },
  };

  globalThis.document = documentMock;
  globalThis.window = {
    document: documentMock,
    innerWidth: 390,
    innerHeight: 844,
    devicePixelRatio: 2,
    addEventListener(type, fn) {
      if (!windowListeners.has(type)) windowListeners.set(type, new Set());
      windowListeners.get(type).add(fn);
    },
  };
  globalThis.addEventListener = globalThis.window.addEventListener;
  globalThis.innerWidth = 390;
  globalThis.innerHeight = 844;
  globalThis.devicePixelRatio = 2;
  globalThis.matchMedia = (q) => ({ matches: reduceMotion && q.includes("prefers-reduced-motion: reduce") });
  globalThis.performance = { now: () => nowMs };

  globalThis.requestAnimationFrame = (fn) => {
    const id = rafSeq++;
    activeRafs.set(id, fn);
    return id;
  };
  globalThis.cancelAnimationFrame = (id) => {
    if (activeRafs.has(id)) {
      activeRafs.delete(id);
      cancelledRafs.push(id);
    }
  };
  globalThis.setTimeout = (fn, ms) => {
    let entry;
    const handle = origSetTimeout(() => {
      if (entry && !entry.cancelled) {
        activeTimers.delete(handle);
        fn();
      }
    }, ms);
    entry = { fn, ms, cancelled: false, handle };
    activeTimers.set(handle, entry);
    return handle;
  };
  globalThis.clearTimeout = (handle) => {
    const entry = activeTimers.get(handle);
    if (entry) {
      entry.cancelled = true;
      activeTimers.delete(handle);
      cancelledTimers.push(handle);
    }
    origClearTimeout(handle);
  };

  return {
    deckEl,
    body,
    activeRafs,
    activeTimers,
    cancelledRafs,
    cancelledTimers,
    setNow(t) { nowMs = t; },
    setHasDeck(v) { hasDeck = v; },
    setReduceMotion(v) { reduceMotion = v; },
    setVisibility(v) { documentMock.visibilityState = v; },
    dispatchWindow(type) {
      for (const fn of windowListeners.get(type) || []) fn({ type });
    },
    dispatchDocument(type) {
      for (const fn of docListeners.get(type) || []) fn({ type });
    },
    stepRaf(t) {
      nowMs = t;
      const entries = Array.from(activeRafs.entries());
      for (const [id, fn] of entries) {
        activeRafs.delete(id);
        fn(t);
      }
    },
    firePendingWarpTimers() {
      for (const [handle, entry] of Array.from(activeTimers.entries())) {
        if (entry.ms >= 1000) {
          activeTimers.delete(handle);
          origClearTimeout(handle);
          if (!entry.cancelled) entry.fn();
        }
      }
    },
    restore() {
      for (const handle of activeTimers.keys()) origClearTimeout(handle);
      activeTimers.clear();
      activeRafs.clear();
      globalThis.setTimeout = origSetTimeout;
      globalThis.clearTimeout = origClearTimeout;
    },
  };
}

const env = installNavigationEnv();
const fx = await import("../../deck/core/fx.js");
test.after(() => env.restore());

test("rapid 20-hop warp()/unwarp() cycles leave zero leaked canvas.warp nodes and clean isWarping() state", () => {
  assert.equal(fx.isWarping(), false);
  const fired = [];
  const staleRafs = [];
  const staleTimers = [];

  for (let hop = 0; hop < 20; hop++) {
    env.setNow(1000 + hop * 50);
    fx.warp(80 + hop, 140 + hop, "#ff9d5c", () => fired.push(hop));
    assert.equal(fx.isWarping(), true, `hop ${hop} enters warping state`);
    assert.equal(env.body.classList.contains("warping"), true);
    assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 1);
    assert.equal(env.deckEl.style.getPropertyValue("--wx"), `${80 + hop}px`);
    assert.equal(env.deckEl.style.getPropertyValue("--wy"), `${140 + hop}px`);

    // Capture the scheduled callbacks before unwarp cancels them
    staleRafs.push(...env.activeRafs.values());
    staleTimers.push(...Array.from(env.activeTimers.values()).filter((e) => e.ms >= 1000).map((e) => e.fn));

    // Advance one partial animation frame mid-flight on alternating hops
    if (hop % 2 === 0) env.stepRaf(1000 + hop * 50 + 180);

    fx.unwarp();
    assert.equal(fx.isWarping(), false, `hop ${hop} exits warping cleanly`);
    assert.equal(env.body.classList.contains("warping"), false);
    assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);
    assert.equal(env.activeRafs.size, 0, `hop ${hop} cancels rAF`);
    assert.equal(Array.from(env.activeTimers.values()).filter((e) => e.ms >= 1000).length, 0, `hop ${hop} cancels timer`);
  }

  // Even if a stale rAF or timer callback were manually invoked later, token guards prevent execution
  for (const fn of staleRafs) fn(99999);
  for (const fn of staleTimers) fn();
  assert.deepEqual(fired, []);
});

test("overlapping 20-hop warp() calls cancel prior active frame/timer and never stack canvas.warp", () => {
  const priorCancelledRafs = env.cancelledRafs.length;
  const priorCancelledTimers = env.cancelledTimers.length;
  const fired = [];

  for (let hop = 0; hop < 20; hop++) {
    env.setNow(2000 + hop * 20);
    fx.warp(50 + hop, 90 + hop, "#4de8ff", () => fired.push(hop));
    assert.equal(fx.isWarping(), true);
    assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 1, "at most one canvas.warp exists");
    assert.equal(env.activeRafs.size, 1, "only one active warp rAF at a time");
    assert.equal(Array.from(env.activeTimers.values()).filter((e) => e.ms >= 1000).length, 1, "only one active warp timer at a time");
  }

  assert.ok(env.cancelledRafs.length - priorCancelledRafs >= 19, "prior active rAFs were cancelled");
  assert.ok(env.cancelledTimers.length - priorCancelledTimers >= 19, "prior active timers were cancelled");

  // Complete only the final (19th) hop via animation progress
  env.stepRaf(2000 + 19 * 20 + 700);
  assert.deepEqual(fired, [19], "only the final active hop fires navigation");
  assert.equal(fx.isWarping(), false);
  assert.equal(env.activeRafs.size, 0);
  assert.equal(Array.from(env.activeTimers.values()).filter((e) => e.ms >= 1000).length, 0);

  // Pagehide cleans up transition whiteout after navigation
  env.dispatchWindow("pagehide");
  assert.equal(env.body.classList.contains("warping"), false);
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);
});

test("pagehide, pageshow, visibilitychange, null #deck, reduced-motion, and fallback timer recover cleanly", () => {
  let navCount = 0;

  // 1. pagehide recovery
  env.setNow(5000);
  fx.warp(120, 220, "#b9a2ff", () => { navCount++; });
  assert.equal(fx.isWarping(), true);
  env.dispatchWindow("pagehide");
  assert.equal(fx.isWarping(), false);
  assert.equal(env.body.classList.contains("warping"), false);
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);

  // 2. pageshow recovery (bfcache restore)
  env.setNow(6000);
  fx.warp(120, 220, "#b9a2ff", () => { navCount++; });
  assert.equal(fx.isWarping(), true);
  env.dispatchWindow("pageshow");
  assert.equal(fx.isWarping(), false);
  assert.equal(env.body.classList.contains("warping"), false);
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);

  // 3. visibilitychange only unwarps when document.visibilityState === "visible"
  env.setNow(7000);
  fx.warp(120, 220, "#57efc0", () => { navCount++; });
  env.setVisibility("hidden");
  env.dispatchDocument("visibilitychange");
  assert.equal(fx.isWarping(), true, "hidden transition does not cancel active warp");
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 1);

  env.setVisibility("visible");
  env.dispatchDocument("visibilitychange");
  assert.equal(fx.isWarping(), false, "returning to visible unwarps cleanly");
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);
  assert.equal(navCount, 0, "cancelled warps never invoke navigation callback");

  // 4. Null-safe #deck check
  env.setHasDeck(false);
  env.setNow(8000);
  assert.doesNotThrow(() => fx.warp(10, 20, "#fff", () => { navCount++; }));
  assert.equal(fx.isWarping(), true);
  fx.unwarp();
  assert.equal(fx.isWarping(), false);
  env.setHasDeck(true);

  // 5. Fallback timer completes warp and cancels active rAF when rAF stalls
  env.setNow(9000);
  fx.warp(30, 40, "#ffd27a", () => { navCount++; });
  assert.equal(env.activeRafs.size, 1);
  env.firePendingWarpTimers();
  assert.equal(navCount, 1);
  assert.equal(fx.isWarping(), false);
  assert.equal(env.activeRafs.size, 0);
  fx.unwarp();

  // 6. Reduced motion short-circuits immediately without canvas.warp
  env.setReduceMotion(true);
  fx.warp(30, 40, "#ffd27a", () => { navCount++; });
  assert.equal(navCount, 2);
  assert.equal(fx.isWarping(), false);
  assert.equal(globalThis.document.querySelectorAll("canvas.warp").length, 0);
  env.setReduceMotion(false);
});

test("kit/prometheus.css wraps @view-transition and smooth fade keyframes in prefers-reduced-motion: no-preference", () => {
  const css = readFileSync(path.join(ROOT, "kit/prometheus.css"), "utf8");
  const match = css.match(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{([\s\S]*?\r?\n)\}/);
  assert.ok(match, "expected @media (prefers-reduced-motion: no-preference) block in kit/prometheus.css");
  const block = match[1];
  assert.match(block, /@view-transition\s*\{\s*navigation:\s*auto;\s*\}/);
  assert.match(block, /::view-transition-old\(root\)/);
  assert.match(block, /::view-transition-new\(root\)/);
  assert.match(block, /@keyframes\s+pk-leave\s*\{\s*from\s*\{\s*opacity:\s*1;?\s*\}\s*to\s*\{\s*opacity:\s*0;?\s*\}\s*\}/);
  assert.match(block, /@keyframes\s+pk-arrive\s*\{\s*from\s*\{\s*opacity:\s*0;?\s*\}\s*to\s*\{\s*opacity:\s*1;?\s*\}\s*\}/);
  assert.doesNotMatch(block, /blur\(|scale\(2\.2\)/, "cross-document fade keyframes avoid heavy blur/scale");
});

test("pillars/athenaeum/app.css hides .pk-cockpit-btn, prevents Chronicle clipping, and clears .ath-spark from .ath-time", () => {
  const css = readFileSync(path.join(ROOT, "pillars/athenaeum/app.css"), "utf8");
  assert.match(css, /body\.ath\.pk-v2\s+\.ath-modes\s+\.pk-cockpit-btn\s*\{\s*display:\s*none\s*!important;\s*\}/);
  assert.match(css, /body\.ath\.pk-v2\s+\.ath-modes\s+\.tab\s*\{[^}]*padding:\s*0\s+10px;[^}]*font-size:\s*12\.5px;/);
  assert.match(css, /\.ath-time\s*\{[^}]*right:\s*82px;/);
  assert.match(css, /\.ath-time\s*\{[^}]*grid-template-columns:\s*38px\s+minmax\(0,\s*1fr\);/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*\.ath-time\s*\{[^}]*right:\s*82px;/);
});

test("deck/views/orrery.js and deck/deck.css enforce 390x844 mobile Orrery clearance and zero overflow", () => {
  const orreryJs = readFileSync(path.join(ROOT, "deck/views/orrery.js"), "utf8");
  const deckCss = readFileSync(path.join(ROOT, "deck/deck.css"), "utf8");

  assert.match(orreryJs, /const phone = innerWidth <= 600;/);
  assert.match(orreryJs, /phone \? Math\.round\(W \* 0\.54\)/);
  const mobileW = Math.min(390, 460);
  const mobileH = Math.round(mobileW * 0.54);
  assert.equal(mobileH, 211);
  assert.ok(mobileH <= 220 && mobileH >= 180, "the phone stage leaves room for the now line and one card above the dock");
  const desktopW = Math.min(560, Math.max(420, Math.round(1440 * 0.36)));
  assert.equal(desktopW, 518);

  const mobileMedia = deckCss.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mobileMedia, "expected @media (max-width: 600px) block in deck/deck.css");
  const mobileCss = mobileMedia[1];
  assert.match(mobileCss, /\.reactor\.live\s*\{[^}]*overflow-x:\s*clip;/);
  assert.match(mobileCss, /\.rx-hud\s*\{[^}]*max-width:\s*100%;/);
  assert.match(mobileCss, /\.rx-controls\s*\{[^}]*max-width:\s*100%;/);
  assert.match(mobileCss, /\.rx-hud\s+\.seg\s+button\s*\{[^}]*padding:\s*0\s+10px;/);
});
