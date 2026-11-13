/* Prometheus: the deck. One page, one store, every capability a view of the same data.
   Boot: define the slices, read the fixed dates, start the sky, draw the shell, route.
   Proof hooks (documented in proofs/README.md): ?now=2026-11-20T09:00 pins the clock, ?demo=1 loads the demo deck on a clean device. */
import { store } from "./core/store.js";
import { clock, today, fmtDay, fmtTime, quickAdd } from "./core/dates.js";
import { h, $, icon, sheet, toast, pickFile, reduced, ask, sheetOpen, setQuiet } from "./core/ui.js";
import { CAPS, SLICES, cap } from "./caps.js";
import { PILLARS, pillar } from "./pillars.js";
import { setFixed, searchAll } from "./core/feeds.js";
import { loadManifests, searchRecords, commands, handOff } from "./core/reach.js";
import { startSky } from "./core/atmo.js";
import * as wx from "./core/weather.js";
import { makeEvent, kindOf } from "./models/time.js";
import { demoDeck } from "./data/demo.js";
import { soundOn, setSound, tick } from "./core/fx.js";

export const BUILD = "d11";
const params = new URLSearchParams(location.search);
if (params.get("now")) clock.set(params.get("now"));
for (const sl of SLICES) store.define(sl.id, sl.model.slice);

const root = $("#deck");
const state = { route: null, view: null, cleanup: null, sky: null, weather: null, dirty: false, fixed: [] };
export const ctx = {
  store, go, toast, refresh: () => render(true), weather: () => state.weather, reloadWeather, sky: () => state.sky,
  openSearch, loadSeedFile, startDemo, leaveDemo, caps: CAPS, build: BUILD,
};

/* ------------------------------------------------------------------ routing ------------------------------------------------------------------ */
function parse(hash) { const p = (hash || "").replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent); return { cap: p[0] || "picture", tab: p[1] || "", arg: p[2] || "", key: p.join("/") }; }
export function go(hash) { if (location.hash === hash) render(true); else location.hash = hash; }
addEventListener("hashchange", () => render(false));
addEventListener("pageshow", (e) => { if (e.persisted) render(true); });               // back from a pillar out of the browser's cache: rebuild the live view

async function render(same) {
  const r = parse(location.hash); const known = r.cap === "picture" || r.cap === "system" || cap(r.cap);
  if (!known) { location.replace("#/"); return; }
  const load = r.cap === "picture" ? import("./views/picture.js") : r.cap === "system" ? import("./views/system.js") : cap(r.cap).view();
  const mod = await load; const prev = state.route; const swap = () => {
    if (state.cleanup) { try { state.cleanup(); } catch (e) { console.error(e); } state.cleanup = null; }
    const main = $("#view"); const keep = same && prev && prev.key === r.key ? main.scrollTop : 0;
    const fresh = !same || !prev || prev.key !== r.key;                              // a new place animates in; a redraw of the same place does not
    const box = h("div.view-inner" + (fresh ? ".enter" : ""), { dataset: { cap: r.cap } }); main.replaceChildren(box); main.dataset.cap = r.cap; document.body.dataset.cap = r.cap;
    setQuiet(!fresh); try { state.cleanup = mod.render(box, r, ctx) || null; } finally { setQuiet(false); } main.scrollTop = keep; state.route = r; state.dirty = false; drawDock(); drawRail();
    document.title = r.cap === "picture" ? "Prometheus" : `${r.cap === "system" ? "System" : cap(r.cap).name} · Prometheus`;
  };
  const moving = !same && prev && prev.cap !== r.cap;
  if (moving && document.startViewTransition && !reduced()) { document.documentElement.classList.add("vt-inpage"); const vt = document.startViewTransition(swap); const done = () => document.documentElement.classList.remove("vt-inpage"); vt.finished.then(done, done); vt.ready.catch(() => {}); vt.finished.catch(() => {}); vt.updateCallbackDone.catch(() => {}); } else swap();   // a newer change may skip an older transition: that is fine
}
store.on(() => {                                                                  // any change: redraw the view, unless a sheet or a field has the floor
  const a = document.activeElement; const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $("#view").contains(a);
  if (sheetOpen() || typing) { state.dirty = true; return; }
  render(true);
});
document.addEventListener("focusout", () => setTimeout(() => { if (state.dirty && !sheetOpen() && !(document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) render(true); }, 60));
export function settle() { if (state.dirty && !sheetOpen()) render(true); }
addEventListener("popstate", () => setTimeout(settle, 30));

/* ------------------------------------------------------------------ shell ------------------------------------------------------------------ */
function drawShell() {
  root.replaceChildren(
    h("header.rail", { id: "rail" }),
    h("main", { id: "view", tabindex: "-1" }),
    h("nav.dock", { id: "dock", "aria-label": "Deck" }));
}
function drawRail() {
  const p = store.get("profile"); const w = state.weather; const here = (state.route || parse(location.hash)).cap; const d = w && w.now ? wx.describe(w.now.code, w.now.isDay) : null;
  $("#rail").replaceChildren(
    h("a.brand", { href: "#/", "aria-label": "Prometheus: the picture" }, h("span.brand-mark", { "aria-hidden": "true" }), h("span.brand-day", here === "picture" ? "Prometheus" : here === "system" ? "System" : (cap(here) || {}).name || "")),
    h("div.rail-right",
      p.demo ? h("button.chip.demo", { type: "button", onclick: demoSheet }, "Demo") : null,
      d ? h("a.sky-chip", { href: "#/", onclick: (e) => { e.preventDefault(); go("#/"); setTimeout(() => { const el = $("#sky-watch"); if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" }); }, 120); }, "aria-label": `${Math.round(w.now.temp)} degrees, ${d.text}` }, icon(d.icon, 18), h("span.num", Math.round(w.now.temp) + "°")) : null,
      h("button.icon-btn", { type: "button", "aria-label": soundOn() ? "Sound is on: turn it off" : "Sound is off: turn it on", "aria-pressed": String(soundOn()), onclick: () => { setSound(!soundOn()); drawRail(); } }, icon(soundOn() ? "speaker" : "mute"))));
}
function drawDock() {
  const cur = state.route ? state.route.cap : parse(location.hash).cap;
  const item = (id, name, ic, href) => h("a.dock-item" + (cur === id ? ".on" : ""), { href, "aria-current": cur === id ? "page" : null, dataset: { cap: id } }, icon(ic, 22), h("span", name));
  const orb = h("button.dock-orb", { type: "button", id: "open-search", "aria-label": "Search or add (press /)", onclick: () => { tick(); openSearch(); } }, icon("plus", 24));
  const items = [item("picture", "Core", "picture", "#/"), orb, item("system", "System", "system", "#/system")];   // the pillars live on the core; the dock stays out of their way
  $("#dock").replaceChildren(h("div.dock-bar", items));
}
setInterval(() => { if ($("#rail")) drawRail(); const r = state.route; if (r && r.cap === "picture" && !sheetOpen() && !document.hidden) { const m = clock.now().getMinutes(); if (m !== state.minute) { state.minute = m; render(true); } } }, 15000);

/* ------------------------------------------------------------------ sky + weather ------------------------------------------------------------------ */
function applySky() { if (!state.sky) return; state.sky.set({ phase: wx.phaseOf(state.weather), ...wx.skyOf(state.weather) }); document.documentElement.dataset.day = (() => { const ph = wx.phaseOf(state.weather); return ph > 0.27 && ph < 0.73 ? "day" : ph >= 0.23 && ph <= 0.27 ? "dawn" : ph >= 0.73 && ph <= 0.79 ? "dusk" : "night"; })(); }
async function reloadWeather(force) {
  const place = store.get("profile").place; state.weather = wx.cached(place); applySky();
  const fresh = await wx.load(place, { force }); if (fresh) { state.weather = fresh; applySky(); drawRail(); if (state.route && state.route.cap === "picture" && !sheetOpen()) render(true); }
  return state.weather;
}
setInterval(() => { applySky(); if (!document.hidden) reloadWeather(false); }, 10 * 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) { applySky(); reloadWeather(false); } });

/* ------------------------------------------------------------------ search and quick add (one input reaches anything) ------------------------------------------------------------------ */
function openSearch() {
  if (sheetOpen()) return;
  const input = h("input.search-input", { type: "search", placeholder: "A pillar, an idea, a date, or: dentist Tue 3pm", autocomplete: "off", autocapitalize: "off", spellcheck: "false", enterkeyhint: "go", autofocus: true, "aria-label": "Search the deck or add an event" });
  const list = h("div.results", { role: "listbox", "aria-label": "Results" }); let items = []; let sel = 0;
  const sh = sheet({ title: "Search · Add", tone: "search", body: h("div.stack", input, list) });
  const pick = (it) => { if (!it) return; if (it.run) it.run(); if (it.go) { sh.close(); setTimeout(() => go(it.go), 20); } else if (!it.keep) sh.close(); };
  const draw = () => {
    const q = input.value.trim(); items = [];
    const add = quickAdd(q);
    if (add) { const k = kindOf(add.title); items.push({ title: `Add: ${k.title}`, sub: `${fmtDay(add.date, "long")}${add.time ? " · " + fmtTime(add.time) : ""}${add.rule ? " · repeats" : ""}${k.kind !== "event" ? " · " + k.kind : ""}`, tone: "add", icon: "plus",
      run: () => { store.update("time", (t) => t.events.push(makeEvent({ ...add, title: k.title }, { kind: k.kind, src: "quick" }))); toast(`Added: ${k.title}, ${fmtDay(add.date)}${add.time ? " " + fmtTime(add.time) : ""}`); }, go: `#/time/day/${add.date}` }); }
    for (const c of commands(q)) if (c.hand) items.push({ title: c.title, sub: c.sub, icon: (pillar(c.pillar) || {}).icon || "plus", tone: "add", run: () => { handOff(c.hand); location.href = c.href; } });
    for (const r of searchAll(q)) items.push({ ...r, icon: (cap(r.cap) || {}).icon || "search" });
    for (const r of searchRecords(q)) items.push({ title: r.title, sub: r.sub, icon: (pillar(r.pillar) || {}).icon || "search", tone: "nav", run: () => { location.href = r.href; } });
    for (const c of commands(q)) if (!c.hand) items.push({ title: c.title, sub: c.sub, icon: (pillar(c.pillar) || {}).icon || "plus", tone: "nav", run: () => { location.href = c.href; } });
    if (!q) items.push({ title: "New event", sub: "The full form: repeats, place, notes, countdown", icon: "calendar", tone: "nav", keep: true, run: async () => { sh.close(); const m = await import("./views/time.js"); setTimeout(() => m.eventSheet(ctx, null, null, today()), 240); } });
    for (const p of PILLARS) if (q && (p.name + " " + p.what).toLowerCase().includes(q.toLowerCase())) items.push({ title: p.name, sub: p.what, icon: p.icon, tone: "nav", run: () => { location.href = p.route; } });
    const nav = [["The core", "#/", "picture"], ...CAPS.map((c) => [c.name, "#/" + c.id, c.icon]), ["Time · week", "#/time/week", "calendar"], ["Time · month", "#/time/month", "grid"], ["Time · agenda", "#/time/agenda", "list"], ["Time · risk", "#/time/risk", "risk"], ["Time · focus clock", "#/time/focus", "flame"],
      ["Money · what-if", "#/money/whatif", "money"], ["Money · bills and subscriptions", "#/money/bills", "money"], ["Money · library", "#/money/library", "money"], ["System · your data, export, import", "#/system", "system"]];
    for (const [name, href, ic] of nav) if (!q || name.toLowerCase().includes(q.toLowerCase())) items.push({ title: name, sub: "Go", go: href, icon: ic, tone: "nav" });
    if (!items.length) items.push({ title: "Nothing matches", sub: "Try a name, a date, an issuer, or type an event with a day: “smog check dec 5”.", keep: true, icon: "search", tone: "none" });
    sel = Math.min(sel, items.length - 1);
    list.replaceChildren(...items.slice(0, 30).map((it, i) => h("button.result" + (i === sel ? ".sel" : "") + (it.tone ? "." + it.tone : ""), { type: "button", role: "option", "aria-selected": String(i === sel), onclick: () => pick(it) }, icon(it.icon, 18), h("span.result-text", h("b", it.title), h("small", it.sub || "")))));
  };
  input.addEventListener("input", () => { sel = 0; draw(); });
  input.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); } else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); } else if (e.key === "Enter") { e.preventDefault(); pick(items[sel]); } });
  draw();
}
document.addEventListener("keydown", (e) => { const a = document.activeElement; const typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
  if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "/" || e.key === "k")) { e.preventDefault(); openSearch(); } });

/* ------------------------------------------------------------------ seed, demo, first run ------------------------------------------------------------------ */
/** Read a deck, capability or seed file and load it (after showing what it holds). Returns true when something was loaded. */
export async function loadSeedFile() {
  const f = await pickFile(".json,application/json,text/plain"); if (!f) return false;
  let obj; try { obj = JSON.parse(f.text); } catch (e) { toast("That file is not JSON, so nothing was loaded.", { tone: "warn" }); return false; }
  const info = store.inspect(obj); if (!info.ok) { toast(info.error, { tone: "warn" }); return false; }
  const known = info.slices.filter((x) => x.known).map((x) => x.slice), unknown = info.slices.filter((x) => !x.known).map((x) => x.slice);
  const what = info.kind === "seed" ? `your presets${info.label ? ` (“${info.label}”)` : ""}` : info.kind === "deck" ? "a full deck backup" : `the ${info.label} capability`;
  const yes = await ask("Load this file?", `${f.name} holds ${what}: ${known.join(", ") || "nothing this deck knows"}. It replaces those parts on this device; everything else stays.${unknown.length ? ` Parts this deck does not have yet are kept in the file: ${unknown.join(", ")}.` : ""}`, "Load it");
  if (!yes) return false;
  try { const done = store.importFile(obj);
    if (info.kind !== "capability") store.update("profile", (p) => { p.demo = false; p.seed = { label: info.label || f.name, loaded: new Date().toISOString(), kind: info.kind }; });
    toast(`Loaded ${done.length} ${done.length === 1 ? "part" : "parts"} from ${f.name}.`, { undo: () => { store.undoImport(); toast("Put back the way it was."); } });
    reloadWeather(true); go("#/"); return true;
  } catch (e) { toast(String(e.message || e), { tone: "warn" }); return false; }
}
export function startDemo() { store.importFile(demoDeck(today(), state.fixed)); reloadWeather(true); go("#/"); }
export async function leaveDemo() { if (await ask("Leave the demo?", "The sample data is removed from this device. Your own data starts empty, or load your deck file.", "Remove sample data", "danger")) { store.wipe(); state.weather = null; applySky(); go("#/"); } }
function demoSheet() {
  sheet({ title: "Demo data", body: (close) => h("div.stack", h("p.lead", "Everything on the deck right now is invented sample data, built around today's date so every instrument has something to show."),
    h("div.row", h("button.btn", { type: "button", onclick: async () => { close(); await loadSeedFile(); } }, icon("upload", 18), "Load my deck file"), h("button.btn.ghost", { type: "button", onclick: () => { close(); leaveDemo(); } }, "Leave the demo"))) });
}

/* ------------------------------------------------------------------ boot ------------------------------------------------------------------ */
async function boot() {
  drawShell(); const reach = loadManifests().catch(() => []);
  try { state.sky = startSky($("#sky")); } catch (e) { console.warn("[sky]", e); }
  if (!state.sky) document.documentElement.classList.add("no-sky");
  try { const r = await fetch("./deck/data/fixed-dates.json"); state.fixed = await r.json(); setFixed(state.fixed); } catch (e) { console.warn("fixed dates unavailable offline on a first visit", e); }
  if (params.get("demo") === "1" && store.pristine()) store.importFile(demoDeck(today(), state.fixed));
  state.weather = wx.cached(store.get("profile").place); applySky(); await reach;
  await render(false);
  document.documentElement.classList.add("ready");
  reloadWeather(false);
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js").catch(() => {});
}
window.__deck = { store, clock, ctx, state, BUILD, reach: { searchRecords, commands } };                               // for the proofs and for the curious
boot();
