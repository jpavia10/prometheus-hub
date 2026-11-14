/* Prometheus: the deck. One page, one store, every capability a view of the same data.
   Boot: define the slices, read the fixed dates, start the sky, draw the shell, route.
   Proof hooks (documented in proofs/README.md): ?now=2026-11-20T09:00 pins the clock, ?demo=1 loads the demo deck on a clean device. */
import { store } from "./core/store.js";
import { clock, today, fmtDay, fmtTime, quickAdd } from "./core/dates.js";
import { h, $, icon, sheet, toast, pickFile, reduced, ask, sheetOpen, setQuiet } from "./core/ui.js";
import { CAPS, SLICES, cap } from "./caps.js";
import { PILLARS, pillar } from "./pillars.js";
import { setFixed, searchAll } from "./core/feeds.js";
import { syncBridges, mirrorDeckToPillars } from "./core/legacy.js";
import { loadManifests, searchRecords, commands, handOff } from "./core/reach.js";
import { startSky } from "./core/atmo.js";
import * as wx from "./core/weather.js";
import { makeEvent, kindOf } from "./models/time.js";
import { demoDeck } from "./data/demo.js";
import { soundOn, setSound, tick } from "./core/fx.js";

export const BUILD = "d17";
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
store.on(() => {                                                                  // any change: mirror to pillars, then redraw unless typing
  mirrorDeckToPillars(store);
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
  const navLink = (label, href, on) => h("a.rail-link" + (on ? ".on" : ""), { href, "aria-current": on ? "page" : null }, label);
  $("#rail").replaceChildren(
    h("a.brand", { href: "#/", "aria-label": "Prometheus: the picture" },
      h("span.brand-mark", { "aria-hidden": "true" }),
      h("span.brand-day", here === "picture" ? "Prometheus" : here === "system" ? "System" : (cap(here) || {}).name || ""),
      h("span.rail-build", `BUILD ${BUILD.toUpperCase()} · ${PILLARS.length} PILLARS`)),
    h("nav.rail-nav", { "aria-label": "Command stations" },
      navLink("Core", "#/", here === "picture"),
      navLink("Time", "#/time", here === "time"),
      navLink("Money", "#/money", here === "money"),
      navLink("Athenaeum", "./pillars/athenaeum/", false),
      navLink("Hearth", "./pillars/hearth/", false),
      navLink("System", "#/system", here === "system")),
    h("div.rail-right",
      h("button.chip.rail-search", { type: "button", "aria-label": "Search or capture (/)" , onclick: () => { tick(); openSearch(); } }, icon("search", 13), h("span", "Search · Capture"), h("kbd", "/")),
      p.demo
        ? h("button.chip.demo", { type: "button", onclick: demoSheet }, "Demo · Active")
        : store.pristine()
          ? h("button.chip.preset-btn", { type: "button", onclick: () => { tick(); startDemo(); toast("Loaded sample mountain & payoff telemetry"); } }, "Load Sample")
          : null,
      d ? h("a.sky-chip", { href: "#/", onclick: (e) => { e.preventDefault(); go("#/"); setTimeout(() => { const el = $("#sky-watch"); if (el) el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" }); }, 120); }, "aria-label": `${Math.round(w.now.temp)} degrees, ${d.text}` }, icon(d.icon, 18), h("span.num", Math.round(w.now.temp) + "°")) : null,
      h("button.icon-btn", { type: "button", "aria-label": soundOn() ? "Sound is on: turn it off" : "Sound is off: turn it on", "aria-pressed": String(soundOn()), onclick: () => { setSound(!soundOn()); drawRail(); } }, icon(soundOn() ? "speaker" : "mute"))));
}
function drawDock() {
  const cur = state.route ? state.route.cap : parse(location.hash).cap;
  const item = (id, name, ic, href) => h("a.dock-item" + (cur === id ? ".on" : ""), { href, "aria-current": cur === id ? "page" : null, dataset: { cap: id } }, icon(ic, 22), h("span", name));
  const orb = h("button.dock-orb", { type: "button", id: "open-search", "aria-label": "Search or add (press /)", onclick: () => { tick(); openSearch(); } }, icon("plus", 24));
  const items = [
    item("picture", "Core", "picture", "#/"),
    item("time", "Time", "time", "#/time"),
    orb,
    item("money", "Money", "money", "#/money"),
    item("system", "System", "system", "#/system"),
  ];
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
  const pick = (it) => {
    if (!it) return;
    // A result that leaves this document must not close the sheet with history.back(): the sheet pushed an entry, and going back cancels the navigation.
    if (it.leave) { if (it.run) it.run(); sh.close(true); location.href = it.leave; return; }
    if (it.run) it.run();
    if (it.go) { sh.close(); setTimeout(() => go(it.go), 20); }
    else if (!it.keep) sh.close();
  };
  const draw = () => {
    const q = input.value.trim(); items = [];
    const nlRead = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } };
    const nlWrite = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
    const nlEvent = (type, pillarName, title) => {
      try {
        if (window.PB && PB.events) { PB.events.publish({ type, pillar: pillarName, title }); return; }
        const ev = nlRead("prometheus.bus.events", []);
        ev.push({ v: 1, id: Date.now().toString(36), at: new Date().toISOString(), type, pillar: pillarName, title });
        nlWrite("prometheus.bus.events", ev.slice(-400));
      } catch (_) {}
    };
    const tday = today();

    /* 1. Apollo biometrics: weight 182 sleep 7.5 protein 160 steps 8500 */
    if (/^(?=.*\b(?:weight|sleep|protein|steps|water|train)\b\s*[:=]?\s*\d)/i.test(q)) {
      const patch = {};
      for (const k of ["weight", "sleep", "protein", "steps", "water", "train"]) {
        const m = q.match(new RegExp("\\b" + k + "\\b\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?)", "i"));
        if (m) patch[k] = Number(m[1]);
      }
      const summary = Object.entries(patch).map(([k, v]) => `${k} ${v}`).join(" · ");
      if (summary) items.push({
        title: `Apollo log: ${summary}`,
        sub: `Save to today's biometrics (${fmtDay(tday)})`,
        tone: "add", icon: "plus",
        run: () => {
          const daysMap = nlRead("prometheus.apollo.days", {});
          daysMap[tday] = { ...(daysMap[tday] || {}), ...patch };
          nlWrite("prometheus.apollo.days", daysMap);
          nlEvent("apollo.day.logged", "apollo", summary);
          toast(`Apollo logged: ${summary}`); render(false);
        }
      });
    }

    /* "idea: …" is Athenaeum's manifest command, added with the other commands below.
       It hands the words to the pillar and opens the capture form. Writing the record here skipped that handoff, so search never left the hub. */

    /* 3. Garage fuel: fuel 11.4gal $48.20 14320mi */
    const fuelM = q.match(/^fuel\s+(.+)$/i);
    if (fuelM) {
      const rest = fuelM[1];
      const galM = rest.match(/(\d+(?:\.\d+)?)\s*(?:gal|g\b)?/i);
      const costM = rest.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
      const odoM = rest.match(/(\d{3,7})\s*(?:mi|miles)?\b/i);
      const gal = galM ? Number(galM[1]) : 0, cost = costM ? Number(costM[1]) : 0, odo = odoM ? Number(odoM[1]) : nlRead("prometheus.garage.odometer", 0);
      if (gal > 0 && cost > 0) {
        items.push({
          title: `Garage fuel: ${gal} gal · $${cost.toFixed(2)}${odo ? ` @ ${odo.toLocaleString()} mi` : ""}`,
          sub: "Save to 2025 Sorento fuel log + Money Bus",
          tone: "add", icon: "plus",
          run: () => {
            const fills = nlRead("prometheus.garage.fuel", []);
            fills.push({ id: "q_" + Date.now().toString(36), date: tday, odometer: odo, gallons: gal, cost, busLogged: true });
            nlWrite("prometheus.garage.fuel", fills);
            if (odo > (nlRead("prometheus.garage.odometer", 0) || 0)) nlWrite("prometheus.garage.odometer", odo);
            const mb = nlRead("prometheus.bus.money", []);
            mb.push({ id: "qm_" + Date.now().toString(36), kind: "fuel", amount: -Math.abs(cost), date: tday, source: "garage", label: `Sorento Fuel · ${gal} gal` });
            nlWrite("prometheus.bus.money", mb);
            nlEvent("fuel.logged", "garage", `${gal} gal $${cost.toFixed(2)}`);
            toast(`Garage fuel logged ($${cost.toFixed(2)})`); render(false);
          }
        });
      }
    }

    /* 4. Selling payout: sold <item> $<net> */
    const soldM = q.match(/^sold\s+(.+?)\s+\$?(\d+(?:\.\d{1,2})?)$/i);
    if (soldM) {
      const itemTitle = soldM[1].trim(), net = Number(soldM[2]);
      if (itemTitle && net > 0) {
        items.push({
          title: `Sold: ${itemTitle} ($${net.toFixed(2)})`,
          sub: "Log in Selling Pipeline + credit Money Bus",
          tone: "add", icon: "plus",
          run: () => {
            const list = nlRead("prometheus.selling.items", []);
            list.push({ id: "q_" + Date.now().toString(36), date: tday, title: itemTitle, batch: "QUICK", price: net, soldPrice: net, feePct: 0, feeFixed: 0, shipEst: 0, packaging: 0, stage: "sold", busRecorded: true });
            nlWrite("prometheus.selling.items", list);
            const mb = nlRead("prometheus.bus.money", []);
            mb.push({ id: "qs_" + Date.now().toString(36), type: "sale", kind: "sale", amount: net, date: tday, source: "selling", note: itemTitle, label: itemTitle });
            nlWrite("prometheus.bus.money", mb);
            nlEvent("sale.logged", "selling", `${itemTitle} · $${net.toFixed(2)}`);
            toast(`Sale logged: ${itemTitle} (+$${net.toFixed(2)})`); render(false);
          }
        });
      }
    }

    /* 5. Watch item: watch: <ticker or subject> */
    const watchM = q.match(/^watch:\s*(.+)$/i);
    if (watchM && watchM[1].trim()) {
      const wVal = watchM[1].trim();
      const isSym = /^\$?[A-Za-z]{1,5}$/.test(wVal);
      const sym = wVal.replace(/^\$/, "").toUpperCase();
      items.push({
        title: isSym ? `Watch ticker: $${sym}` : `Watch subject: ${wVal}`,
        sub: isSym ? "Add to Icarus watchlist (read-only journal)" : "Add to Observatory & Polis watch",
        tone: "add", icon: "plus",
        run: () => {
          if (isSym) {
            const wl = nlRead("prometheus.icarus.watchlist", []);
            wl.unshift({ id: "q_" + Date.now().toString(36), date: tday, sym, status: "watching", notes: "Hub quick capture" });
            nlWrite("prometheus.icarus.watchlist", wl);
            nlEvent("watch.added", "icarus", `$${sym}`);
            toast(`Watching $${sym} in Icarus`);
          } else {
            const notes = nlRead("prometheus.observatory.notes", []);
            notes.unshift({ id: "q_" + Date.now().toString(36), date: tday, text: wVal, subject: "watchlist", kind: "watch", url: "" });
            nlWrite("prometheus.observatory.notes", notes);
            nlEvent("watch.added", "observatory", wVal);
            toast(`Added to Observatory watch: ${wVal}`);
          }
          render(false);
        }
      });
    }

    const add = quickAdd(q);
    if (add) { const k = kindOf(add.title); items.push({ title: `Add: ${k.title}`, sub: `${fmtDay(add.date, "long")}${add.time ? " · " + fmtTime(add.time) : ""}${add.rule ? " · repeats" : ""}${k.kind !== "event" ? " · " + k.kind : ""}`, tone: "add", icon: "plus",
      run: () => { store.update("time", (t) => t.events.push(makeEvent({ ...add, title: k.title }, { kind: k.kind, src: "quick" }))); toast(`Added: ${k.title}, ${fmtDay(add.date)}${add.time ? " " + fmtTime(add.time) : ""}`); }, go: `#/time/day/${add.date}` }); }
    for (const c of commands(q)) if (c.hand) items.push({ title: c.title, sub: c.sub, icon: (pillar(c.pillar) || {}).icon || "plus", tone: "add", leave: c.href, run: () => handOff(c.hand) });
    for (const r of searchAll(q)) items.push({ ...r, icon: (cap(r.cap) || {}).icon || "search" });
    for (const r of searchRecords(q)) items.push({ title: r.title, sub: r.sub, icon: (pillar(r.pillar) || {}).icon || "search", tone: "nav", leave: r.href });
    for (const c of commands(q)) if (!c.hand) items.push({ title: c.title, sub: c.sub, icon: (pillar(c.pillar) || {}).icon || "plus", tone: "nav", leave: c.href });
    if (!q) items.push({ title: "New event", sub: "The full form: repeats, place, notes, countdown", icon: "calendar", tone: "nav", keep: true, run: async () => { sh.close(); const m = await import("./views/time.js"); setTimeout(() => m.eventSheet(ctx, null, null, today()), 240); } });
    for (const p of PILLARS) if (q && (p.name + " " + p.what).toLowerCase().includes(q.toLowerCase())) items.push({ title: p.name, sub: p.what, icon: p.icon, tone: "nav", leave: p.route });
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
  syncBridges(store);
  addEventListener("storage", () => { syncBridges(store); render(true); });
  addEventListener("focus", () => { syncBridges(store); });
  document.addEventListener("pointermove", (e) => {
    const t = e.target && e.target.closest ? e.target.closest(".panel, .tile, .rx-read") : null;
    if (!t) return; const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", ((e.clientX - r.left) / Math.max(1, r.width) * 100).toFixed(1) + "%");
    t.style.setProperty("--my", ((e.clientY - r.top) / Math.max(1, r.height) * 100).toFixed(1) + "%");
  }, { passive: true });
  state.weather = wx.cached(store.get("profile").place); applySky(); await reach;
  await render(false);
  document.documentElement.classList.add("ready");
  reloadWeather(false);
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("./sw.js").catch(() => {});
}
window.__deck = { store, clock, ctx, state, BUILD, reach: { searchRecords, commands } };                               // for the proofs and for the curious
boot();
