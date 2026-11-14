/* System: where the data lives and how it leaves. One deck file in and out, one file per capability, the home point, the sky,
   and the honest list of what is on the deck. Nothing here talks to a server. */
import { put, h, icon, toast, ask, download, pickFile, chip, bars, plural } from "../core/ui.js";
import { backupAll, previewRestore, restoreAll, snapshotIndexedDB, restoreIndexedDB, rollbackRestore } from "../core/reach.js";
import { today, addDays, fmtDay } from "../core/dates.js";
import { pillarStats, busMoneySales } from "../core/legacy.js";
import { PILLARS } from "../pillars.js";
import { focusStats } from "../models/time.js";
import { locationSheet, skySheet } from "./parts.js";
import * as wx from "../core/weather.js";
import { PILLAR_DOMAINS, domainOf } from "./orrery.js";

export function render(root, route, ctx) {
  const { store } = ctx; const p = store.get("profile"); const t = today(); const sky = ctx.sky();
  const bytes = (() => { try { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("prom.deck.")) n += k.length + (localStorage.getItem(k) || "").length; } return n; } catch (e) { return 0; } })();
  const name = h("input", { type: "text", value: p.name || "", maxlength: 30, placeholder: "How the deck greets you", onchange: (e) => store.update("profile", (x) => { x.name = e.target.value.trim(); }) });

  const hasRollback = (() => { try { return !!sessionStorage.getItem("prometheus.backup.rollback"); } catch (e) { return false; } })();

  put(root, 
    h("section.hero.small", h("p.kicker", "System"), h("h1.headline", "Your data stays on this device")),
    countsPanel(store, t),
    stormTile(ctx, store.get("profile"), t),
    homesteadTile(t),
    commandAtlas(t),
    h("section.panel", h("header.panel-head", h("h2", "Everything on this device"), chip("all local pillars + argus idb")),
      h("p.quiet", "One integrity-checked archive covering every local pillar's localStorage stores, shared buses, deck settings, and Argus IndexedDB photo blobs. External Titan Reliquary and Midas Ledger maintain separate backups on their own origins and are excluded."),
      h("div.row", h("button.btn", { type: "button", id: "backup-all", onclick: async () => { await snapshotIndexedDB(); const b = backupAll(); download(`prometheus-everything-${t}.json`, b); toast(`Saved ${b.count} stores and ${b.idbCount || 0} Argus photo blobs.`); } }, icon("download", 18), "Back up everything"),
        h("button.btn.ghost", { type: "button", id: "restore-all", onclick: async () => { const f = await pickFile(); if (!f) return; let file, pr; try { file = JSON.parse(await f.text()); pr = previewRestore(file); } catch (e) { return toast(e.message || "That file could not be read."); }
          if (!pr.add.length && !pr.change.length && !pr.idbCount) return toast("Nothing to restore: this device already holds the same.");
          const ok = await ask("Restore from this backup?", `${pr.add.length} new, ${pr.change.length} changed stores (${pr.pillars.join(", ") || "deck"}), and ${pr.idbCount || 0} Argus photo blobs. ${pr.same.length} stores unchanged. External (${(pr.excludedExternal || []).join(", ")}) untouched.`, "Restore");
          if (ok) { restoreAll(file); await restoreIndexedDB(file); toast("Restored with rollback snapshot. Reloading."); setTimeout(() => location.reload(), 600); } } }, "Restore from a file"),
        hasRollback ? h("button.btn.ghost.small", { type: "button", id: "rollback-restore", onclick: () => { const n = rollbackRestore(); toast(`Rolled back ${n} stores. Reloading.`); setTimeout(() => location.reload(), 400); } }, "Rollback restore") : null)),
    h("section.panel", h("header.panel-head", h("h2", "The deck file"), p.demo ? chip("demo data", "warn") : p.seed ? chip(p.seed.label || "loaded") : chip("this device only")),
      h("p.quiet", "One file holds everything on the deck. Keep a copy in your Drive; load it on another device to pick up where you left off."),
      h("div.row", h("button.btn", { type: "button", onclick: () => { download(`prometheus-deck-${t}.json`, store.exportDeck()); toast("Deck file saved to your downloads."); } }, icon("download", 18), "Export the deck"),
        h("button.btn.ghost", { type: "button", onclick: () => ctx.loadSeedFile() }, icon("upload", 18), "Load a file")),
      store.canUndo() ? h("button.btn.ghost.small", { type: "button", onclick: () => { store.undoImport(); toast("Put back the way it was before the last load."); } }, "Undo the last load") : null),
    h("section.panel", h("header.panel-head", h("h2", "On the deck")),
      h("div.items", ctx.caps.map((c) => h("div.item.tone-" + (c.tone === "mint" ? "bill" : "deadline"), h("span.pip"), h("span.item-main", h("b", c.name), h("small", c.line || "")),
        h("span.item-tags", h("button.btn.ghost.small", { type: "button", "aria-label": `Export ${c.name}`, onclick: () => download(`prometheus-${c.id}-${t}.json`, store.exportSlice(c.id)) }, icon("download", 14), "Export"))))),
      h("p.quiet", "A capability appears here only when it is finished and proven. The rest of the plan, with a verdict for each, is on the ", h("a", { href: "./STATUS.md" }, "status page"), ".")),
    h("section.panel", h("header.panel-head", h("h2", "Home and sky")),
      h("div.items",
        h("a.item", { href: "#", onclick: (e) => { e.preventDefault(); locationSheet(ctx); } }, icon("picture", 18), h("span.item-main", h("b", p.place ? p.place.label : "Set the home point"), h("small", p.place ? `${p.place.lat}, ${p.place.lon} · drives the storm watch and the sky` : "Turns on the storm watch and the live sky")), h("span.item-tags", icon("right", 16))),
        h("div.item", icon("cloud", 18), h("span.item-main", h("b", "Sky"), h("small", sky ? `Live, quality tier ${sky.tier()} of 3 (steps down by itself on a slow device)` : "Still gradient: this device has no WebGL, or motion is reduced")))),
      h("label.field", h("span.field-label", "Name"), name)),
    p.demo ? h("section.panel", h("header.panel-head", h("h2", "Demo")), h("p.quiet", "Everything on the deck is invented sample data built around today's date."), h("div.row", h("button.btn.ghost.danger", { type: "button", onclick: () => ctx.leaveDemo() }, "Remove the sample data")))
      : h("section.panel", h("header.panel-head", h("h2", "Sample")), h("p.quiet", "See every instrument with invented data. It replaces what is on this device, so export first."), h("div.row", h("button.btn.ghost", { type: "button", id: "load-sample", onclick: async () => { if (store.pristine() || await ask("Load the sample?", "The sample deck replaces the data on this device. Export your deck first if you want it back.", "Load sample", "danger")) ctx.startDemo(); } }, icon("play", 16), "Load sample"))),
    h("section.panel", h("header.panel-head", h("h2", "Danger")),
      h("p.quiet", `${(bytes / 1024).toFixed(1)} KB of deck data on this device.`),
      h("div.row", h("button.btn.ghost.danger", { type: "button", onclick: async () => { if (await ask("Erase the deck on this device?", "Every event, plan and setting is removed from this browser. A deck file you exported is not touched.", "Erase", "danger")) { store.wipe(); toast("Erased."); ctx.go("#/"); } } }, icon("trash", 16), "Erase this device"))),
    h("footer.foot", h("span.quiet", `Prometheus deck · build ${ctx.build}`), h("a.link", { href: "https://jpavia10.github.io/titan-reliquary-preview/", rel: "noopener" }, "Titan Reliquary")));
  void pickFile;
}

function readJson(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }

function countsPanel(store, t) {
  const eco = pillarStats(t);
  const total = Object.values(eco).reduce((s, x) => s + (x.records || 0), 0);
  const openDeadlines = (() => { try { return JSON.parse(localStorage.getItem("prometheus.bus.deadlines") || "[]").filter((r) => r && !r.done && r.source !== "kairos-fixed" && r.date >= t).length; } catch { return 0; } })();
  const sales30d = busMoneySales().rows.filter((r) => !r.date || r.date >= addDays(t, -30)).length;
  const active = PILLARS.filter((p) => !p.ext).length;
  const streak = focusStats(store.get("time"), t).streak || 0;
  const stat = (href, k, v, label) => h("a.eco-stat", { href, "aria-label": label || `${k} ${v}` }, h("span.eco-k", k), h("b.eco-v", v));
  return h("section.panel.eco-hud", { "aria-label": "Counts" },
    h("header.panel-head", h("h2", "Counts")),
    h("div.eco-grid",
      stat("#/system", "Active pillars", `${active} / ${PILLARS.length}`),
      stat("#/system", "Local records", String(total)),
      stat("#/time", "Open deadlines", String(openDeadlines)),
      stat("#/money", "Sales in 30 days", String(sales30d), `${sales30d} sales recorded on the money bus in 30 days`),
      stat("#/time/focus", "Focus streak", `${streak}d`)));
}

function stormTile(ctx, profile, t) {
  void t;
  const w = ctx.weather(); const alerts = (w && w.alerts) || [];
  if (w && w.now) {
    const d = wx.describe(w.now.code, w.now.isDay); const hrs = w.hours || [];
    return h("button.tile.sky", { type: "button", id: "sky-watch", onclick: () => skySheet(ctx), "aria-label": "Storm watch: open the full reading" },
      h("span.tile-head", h("span", "Storm watch")),
      h("span.tile-main", icon(d.icon, 30), h("span", h("b.num.big", Math.round(w.now.temp) + "°"), h("small", d.text))),
      h("span.tile-line" + (alerts.length ? ".warn" : ""), wx.headline(w)),
      bars(hrs.slice(0, 24).map((x) => x.pop || 0), { w: 150, h: 26, tone: alerts.length ? "ember" : "ice", max: 100 }),
      h("small.quiet", `gusts to ${Math.round(Math.max(0, ...hrs.map((x) => x.gust || 0)))} mph${w.stale ? " · last known reading" : profile.place ? " · " + profile.place.label : ""}`));
  }
  return h("button.tile.sky.invite", { type: "button", id: "sky-watch", onclick: () => (profile.place ? ctx.reloadWeather(true) : locationSheet(ctx)) },
    h("span.tile-head", h("span", "Storm watch"), h("small", profile.place ? "retry" : "on this device")),
    h("span.tile-main", icon("cloud", 30), h("span", h("b", profile.place ? "No reading yet" : "Set a location"), h("small", profile.place ? "The weather service did not answer. Tap to try again." : "Add a place. Nothing is saved until you do."))));
}

function homesteadTile(t) {
  const eco = pillarStats(t);
  const homeCount = (eco.hearth ? eco.hearth.records : 0) + (eco.aether ? eco.aether.records : 0) + (eco.garage ? eco.garage.records : 0) + (eco.bastion ? eco.bastion.records : 0);
  const odo = readJson("prometheus.garage.odometer", 0);
  const vehicle = readJson("prometheus.garage.vehicle", null);
  const vehicleName = vehicle && String(vehicle.name || "").trim();
  return h("a.tile.homestead", { href: "pillars/hearth/", "aria-label": "Homestead" },
    h("span.tile-head", h("span", "Homestead"), h("small", "Hearth · Aether · Garage")),
    h("span.tile-main", icon("house", 30), h("span", h("b.num.big", String(homeCount)), h("small", homeCount ? "logged assets and checks" : "nothing logged yet"))),
    h("span.tile-line", odo ? `${vehicleName || "Vehicle"} @ ${Number(odo).toLocaleString()} mi` : "Pass prep, power budget, and remodel phases."),
    h("small.quiet", "Open Hearth"));
}

function commandAtlas(t) {
  const ecoStats = pillarStats(t);
  let atlasDom = "all";
  const atlasCount = chip(`${PILLARS.length} / ${PILLARS.length}`);
  const atlasSearch = h("input.atlas-search", { type: "search", placeholder: "Filter pillars by name or domain", "aria-label": "Filter pillars" });
  const atlasGrid = h("div.atlas-grid");
  const domBtns = PILLAR_DOMAINS.map((d) => h("button.atlas-tab" + (d.id === "all" ? ".on" : ""), {
    type: "button",
    onclick: () => { atlasDom = d.id; domBtns.forEach((b, i) => b.classList.toggle("on", PILLAR_DOMAINS[i].id === d.id)); paint(); }
  }, d.short));
  const paint = () => {
    const q = atlasSearch.value.trim().toLowerCase();
    const list = PILLARS.filter((p) => {
      const dom = domainOf(p.id);
      if (atlasDom !== "all" && dom !== atlasDom) return false;
      if (!q) return true;
      return (p.name + " " + p.what + " " + dom + " " + p.id).toLowerCase().includes(q);
    });
    atlasCount.textContent = `${list.length} / ${PILLARS.length}`;
    atlasGrid.replaceChildren(...list.map((p) => {
      const dom = domainOf(p.id);
      const dMeta = PILLAR_DOMAINS.find((x) => x.id === dom);
      const st = ecoStats[p.id];
      const badgeText = p.ext ? "External site" : st && st.next ? `Next: ${fmtDay(st.next.date)}` : st && st.records ? plural(st.records, "entry", "entries") : "Ready";
      return h("a.atlas-card", { href: p.route, style: { "--p-hue": p.hue }, dataset: { pillar: p.id, domain: dom } },
        h("span.atlas-ico", icon(p.icon, 20)),
        h("span.atlas-body",
          h("span.atlas-top", h("b", p.name), h("span.atlas-dom", dMeta ? dMeta.short : dom)),
          h("span.atlas-what", p.what),
          h("span.atlas-foot", h("small", badgeText), h("small.atlas-go", p.ext ? "Open external" : "Enter"))));
    }));
  };
  atlasSearch.addEventListener("input", paint);
  paint();
  return h("section.panel.atlas-panel", { id: "pillar-atlas", "aria-label": "Pillars" },
    h("header.panel-head", h("h2", "Pillars"), atlasCount),
    h("div.atlas-toolbar", atlasSearch, h("div.atlas-tabs", { role: "group", "aria-label": "Domains" }, ...domBtns)),
    atlasGrid);
}
