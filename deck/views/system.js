/* System: where the data lives and how it leaves. One deck file in and out, one file per capability, the home point, the sky,
   and the honest list of what is on the deck. Nothing here talks to a server. */
import { put, h, icon, toast, ask, download, pickFile, chip } from "../core/ui.js";
import { today } from "../core/dates.js";
import { locationSheet } from "./parts.js";

export function render(root, route, ctx) {
  const { store } = ctx; const p = store.get("profile"); const t = today(); const sky = ctx.sky();
  const bytes = (() => { try { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("prom.deck.")) n += k.length + (localStorage.getItem(k) || "").length; } return n; } catch (e) { return 0; } })();
  const name = h("input", { type: "text", value: p.name || "", maxlength: 30, placeholder: "How the deck greets you", onchange: (e) => store.update("profile", (x) => { x.name = e.target.value.trim(); }) });

  put(root, 
    h("section.hero.small", h("p.kicker", "System"), h("h1.headline", "Your data stays on this device")),
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
      : h("section.panel", h("header.panel-head", h("h2", "Demo")), h("p.quiet", "See every instrument with invented data. It replaces what is on this device, so export first."), h("div.row", h("button.btn.ghost", { type: "button", onclick: async () => { if (store.pristine() || await ask("Load the demo?", "The sample deck replaces the data on this device. Export your deck first if you want it back.", "Load the demo", "danger")) ctx.startDemo(); } }, icon("play", 16), "Fly the demo"))),
    h("section.panel", h("header.panel-head", h("h2", "Danger")),
      h("p.quiet", `${(bytes / 1024).toFixed(1)} KB of deck data on this device.`),
      h("div.row", h("button.btn.ghost.danger", { type: "button", onclick: async () => { if (await ask("Erase the deck on this device?", "Every event, plan and setting is removed from this browser. A deck file you exported is not touched.", "Erase", "danger")) { store.wipe(); toast("Erased."); ctx.go("#/"); } } }, icon("trash", 16), "Erase this device"))),
    h("footer.foot", h("span.quiet", `Prometheus deck · build ${ctx.build}`), h("a.link", { href: "https://jpavia10.github.io/titan-reliquary-preview/", rel: "noopener" }, "Titan Reliquary")));
  void pickFile;
}
