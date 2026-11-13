/* Hephaestus Hearth (Claude, 2026-11-13; moved into the hub at the owner's word: "Hearth doesnt need an independent repo if its gonna stop
   you from working on it"). The owner's scope, three things only: renovation projects, the assets in each room, the plan of the house.
   The deck rebuild keeps its own stage store (localStorage "hearth.deck.stages.v1", written by the old Hearth site too) so progress carries
   over. Reference: 124 cited room checkpoints and 120 verified inventory categories (data/reference.js). window.HEARTH = { DECK, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("hearth"), app = $("#app"), CHECKS = window.HEARTH_CHECKS || [], CATS = window.HEARTH_CATEGORIES || [];
  const DECK = { key: "hearth.deck.stages.v1", widthFt: 23, depthFt: 10, courses: 21, stages: [
    { id: "paint-left", name: "Paint left side: soffits, roof fascia, window trim, wall" }, { id: "joists-orange", name: "Sand, prime and paint the exposed joists (orange zone, right of door, near house)" },
    { id: "flashing-right", name: "Replace flashing over the installed board and wall: simple L, trim over it; trim, prime/paint, caulk, install" }, { id: "flashing-left", name: "Mirror the flashing and trim sequence on the left" },
    { id: "demo-repair", name: "Demo the boards near the house; repair joists: wood filler, butyl joist tape, primer" }, { id: "first-board", name: "Install the first 11-ft board on the left (on the ledger, sliding under siding and door)" },
    { id: "courses", name: "Lay the remaining courses: 21 total, 2x6x12 staggered butt joints (12+11 / 5+12+6), every joint on framing" }, { id: "railing", name: "Railing: 4x6 posts, 29-inch 2x4 balusters, cap rails; 2x8 bottom rail already in on the right" } ] };
  const deckState = () => { try { return JSON.parse(localStorage.getItem(DECK.key) || "{}"); } catch (e) { return {}; } };
  const saveDeck = (s) => { try { localStorage.setItem(DECK.key, JSON.stringify(s)); window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "hearth", k: "deck" } })); } catch (e) { toast("This browser would not save."); } };
  const publishDeck = (s, st) => { if (window.PB && st.date) PB.deadlines.publish({ title: "Deck: " + s.name, date: st.date, source: "hearth-deck", kind: "project", ref: s.id, done: !!st.done }); };
  const ROOM_TYPES = ["kitchen", "bathrooms", "bedrooms", "living areas", "laundry", "garage", "basement", "outdoor", "house systems", "whole house"];
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  window.HEARTH = { DECK, data: () => ({ deck: deckState(), rooms: S.list("rooms"), projects: S.list("projects"), assets: S.list("assets"), checked: S.get("checked", {}), checks: CHECKS }) };
  for (const s of DECK.stages) { const st = deckState()[s.id]; if (st && st.date) publishDeck(s, st); }
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Projects</h2><div id="h-deck"></div><div id="h-projects"></div>
        <form class="form" id="h-proj"><label class="f wide">A renovation<input name="title" required maxlength="120" placeholder="Bathroom vanity swap, attic insulation…"></label><label class="f">Room<select name="room"></select></label>
          <label class="f">Started<input name="start" type="date"></label><label class="f">Done<input name="done" type="date"></label><label class="f">Cost $<input name="cost" type="number" min="0" step="1"></label><button class="btn" type="submit">Record it</button></form></div>
      <div class="glass span-12"><h2>Rooms and the plan</h2><p class="sub">Name each room and its measured size. The plan above draws only what you measure; positions are arranged until walls are placed.</p><div id="h-rooms"></div>
        <form class="form" id="h-room"><label class="f">Room<input name="name" required maxlength="40" placeholder="Kitchen"></label><label class="f">Type<select name="type">${ROOM_TYPES.map((t) => `<option>${t}</option>`).join("")}</select></label><label class="f">Floor<input name="floor" type="number" min="0" max="5" value="1"></label>
          <label class="f">Width ft<input name="w" type="number" min="0" step="0.1"></label><label class="f">Length ft<input name="l" type="number" min="0" step="0.1"></label><button class="btn quiet" type="submit">Add the room</button></form></div>
      <div class="glass span-12"><h2>What is in each room</h2><div id="h-assets"></div>
        <form class="form" id="h-asset"><label class="f wide">Item<input name="name" required maxlength="80" placeholder="Refrigerator"></label><label class="f">Category<select name="category">${CATS.map((c) => `<option>${c.category}</option>`).join("")}<option>other</option></select></label><label class="f">Room<select name="room"></select></label>
          <label class="f">Model<input name="model" maxlength="60"></label><label class="f">Serial<input name="serial" maxlength="60"></label><label class="f">Bought<input name="bought" type="date"></label><label class="f">Warranty until<input name="warranty" type="date"></label>
          <label class="f wide">Receipt lives<input name="receipt" maxlength="120" placeholder="Drive folder, drawer, email"></label><button class="btn quiet" type="submit">Add the item</button></form></div>
      <div class="glass span-12"><h2>Before you start: room checklists</h2><p class="sub">${CHECKS.length} checkpoints, each with its source. Pick a room type.</p><form class="form"><label class="f">Room type<select id="h-ctype">${[...new Set(CHECKS.map((c) => c.room))].map((r) => `<option>${r}</option>`).join("")}</select></label></form><div id="h-checks"></div></div>
    </section>`;
  function paint() {
    const D = window.HEARTH.data(), roomName = (id) => (D.rooms.find((r) => r.id === id) || {}).name || "";
    const done = DECK.stages.filter((s) => (D.deck[s.id] || {}).done).length;
    $("#h-deck").replaceChildren(h("div", { style: "padding:4px 0 12px" }, h("div.kv", null, h("span", null, h("b", null, "The deck rebuild"), h("br"), h("span.stat-s", null, `Second floor · about ${DECK.widthFt} × ${DECK.depthFt} ft · ${DECK.courses} courses of 2x6x12 · blueprint revision 7`)), h("b", null, `${done} / ${DECK.stages.length}`)),
      h("div.bar-mini", null, h("i", { style: `width:${done / DECK.stages.length * 100}%` })),
      ...DECK.stages.map((s, i) => { const st = D.deck[s.id] || {}; return h("div.kv", null, h("label", null, h("input", { type: "checkbox", ...(st.done ? { checked: "" } : {}), onchange: (e) => { const all = deckState(); all[s.id] = { ...(all[s.id] || {}), done: e.target.checked }; saveDeck(all); publishDeck(s, all[s.id]); if (window.PB && PB.events && e.target.checked) PB.events.publish({ type: "deck.stage", pillar: "hearth", ref: s.id, title: s.name }); paint(); } }), ` ${i + 1}. ${s.name}`),
        h("input", { type: "date", value: st.date || "", "aria-label": `Target date for stage ${i + 1}`, style: "max-width:150px", onchange: (e) => { const all = deckState(); all[s.id] = { ...(all[s.id] || {}), date: e.target.value }; saveDeck(all); publishDeck(s, all[s.id]); } })); })));
    $("#h-projects").replaceChildren(...D.projects.sort((a, b) => String(b.start || "").localeCompare(String(a.start || ""))).map((p) => h("div.kv", null, h("span", null, h("b", null, p.title), h("br"), h("span.stat-s", null, `${roomName(p.room) || "whole house"}${p.start ? " · from " + p.start : ""}${p.done ? " · done " + p.done : " · underway"}${p.cost ? " · " + usd(p.cost) : ""}`)),
      p.done ? null : h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("projects", p.id, { done: day() }); paint(); } }, "Done today"))));
    const opts = () => [h("option", { value: "" }, "whole house"), ...D.rooms.map((r) => h("option", { value: r.id }, r.name))];
    $("#h-proj").room.replaceChildren(...opts()); $("#h-asset").room.replaceChildren(...opts());
    $("#h-rooms").replaceChildren(...(D.rooms.length ? D.rooms.map((r) => { const a = D.assets.filter((x) => x.room === r.id).length, p = D.projects.filter((x) => x.room === r.id).length;
      return h("div.kv", null, h("span", null, h("b", null, r.name), h("br"), h("span.stat-s", null, `${r.type} · floor ${r.floor}${r.w && r.l ? ` · ${r.w} × ${r.l} ft (${Math.round(r.w * r.l)} sq ft)` : " · not measured yet"} · ${a} items · ${p} projects`)), h("button.btn.quiet.small", { type: "button", onclick: () => { if (confirm("Remove " + r.name + "? Its items and projects stay, filed under the whole house.")) { S.remove("rooms", r.id); paint(); } } }, "Remove")); }) : [h("p.empty", null, "No rooms yet. Add them with their sizes and the plan starts drawing.")]));
    const today = day();
    $("#h-assets").replaceChildren(...(D.assets.length ? D.assets.map((x) => { const left = x.warranty ? Math.round((new Date(x.warranty + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5) : null;
      return h("div.kv", null, h("span", null, h("b", null, x.name), h("br"), h("span.stat-s", null, `${x.category} · ${roomName(x.room) || "whole house"}${x.model ? " · " + x.model : ""}${x.serial ? " · SN " + x.serial : ""}${x.receipt ? " · receipt: " + x.receipt : ""}`)), left == null ? null : h("span.pill" + (left < 60 ? ".hot" : ""), null, left < 0 ? "warranty over" : `warranty ${left} d`)); }) : [h("p.empty", null, "Nothing recorded yet.")]));
    const type = $("#h-ctype").value, list = CHECKS.filter((c) => c.room === type).sort((a, b) => a.order - b.order);
    $("#h-checks").replaceChildren(...list.map((c) => h("div.kv", null, h("label", null, h("input", { type: "checkbox", ...(D.checked[c.id] ? { checked: "" } : {}), onchange: (e) => { const m = S.get("checked", {}); if (e.target.checked) m[c.id] = day(); else delete m[c.id]; S.set("checked", m); } }), " ", h("b", null, c.title), h("br"),
      h("span.stat-s", null, `${c.phase} · ${c.trade} · ${c.check} `, c.url ? h("a", { href: c.url, target: "_blank", rel: "noopener" }, c.cite || "source") : c.cite || "")))));
  }
  $("#h-ctype").addEventListener("change", paint);
  $("#h-proj").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("projects", { title: f.title.value.trim(), room: f.room.value, start: f.start.value, done: f.done.value, cost: +f.cost.value || 0 }); f.reset(); toast("Recorded"); paint(); });
  $("#h-room").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("rooms", { name: f.name.value.trim(), type: f.type.value, floor: +f.floor.value || 1, w: +f.w.value || null, l: +f.l.value || null }); f.reset(); toast("Room added"); paint(); });
  $("#h-asset").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const a = S.add("assets", { name: f.name.value.trim(), category: f.category.value, room: f.room.value, model: f.model.value.trim(), serial: f.serial.value.trim(), bought: f.bought.value, warranty: f.warranty.value, receipt: f.receipt.value.trim() });
    if (window.PB && a.warranty) PB.deadlines.publish({ title: "Warranty ends: " + a.name, date: a.warranty, source: "hearth", kind: "warranty", ref: a.id }); f.reset(); toast("Added"); paint(); });
  $("#export").onclick = () => { const d = S.dump(); d.data["deck.stages.v1"] = deckState(); download(`hearth_${day()}.json`, d); };
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { const obj = JSON.parse(await f.text()); const deck = obj && obj.data && obj.data["deck.stages.v1"]; if (deck) { delete obj.data["deck.stages.v1"]; saveDeck({ ...deckState(), ...deck }); } S.load(obj); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
