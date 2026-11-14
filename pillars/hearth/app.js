/* Hephaestus Hearth: 5-phase Renovation Tracker + 8-stage Deck Rev 7 + 11 Rooms + 13 BOM SKUs + 5 Field Requests + Planned vs Actual Costs + Frazier Park Maintenance + 124 Checkpoints.
   Preserves window.HEARTH = { DECK, data } for stage.js and cross-pillar hooks. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("hearth"), app = $("#app"), CHECKS = window.HEARTH_CHECKS || [], CATS = window.HEARTH_CATEGORIES || [];

  // House / gable blueprint constellation behind Hearth
  field({
    count: 900,
    at: [0.74, 0.38],
    scale: 0.28,
    glyph: (n) => [
      ...G.poly(Math.round(n * 0.45), [[-0.55, 0.4], [-0.55, -0.05], [0, -0.52], [0.55, -0.05], [0.55, 0.4], [-0.55, 0.4]]),
      ...G.poly(Math.round(n * 0.35), [[-0.85, 0.4], [-0.55, 0.4], [-0.55, 0.1], [-0.85, 0.1], [-0.85, 0.4]]),
      ...G.line(Math.round(n * 0.2), -0.2, 0.4, -0.2, 0.05),
    ],
  });

  const DECK = {
    key: "hearth.deck.stages.v1",
    widthFt: 23,
    depthFt: 10,
    courses: 21,
    stages: [
      { id: "paint-left", name: "Paint left side: soffits, roof fascia, window trim, wall" },
      { id: "joists-orange", name: "Sand, prime and paint the exposed joists (orange zone, right of door, near house)" },
      { id: "flashing-right", name: "Replace flashing over the installed board and wall: simple L, trim over it; trim, prime/paint, caulk, install" },
      { id: "flashing-left", name: "Mirror the flashing and trim sequence on the left" },
      { id: "demo-repair", name: "Demo the boards near the house; repair joists: wood filler, butyl joist tape, primer" },
      { id: "first-board", name: "Install the first 11-ft board on the left (on the ledger, sliding under siding and door)" },
      { id: "courses", name: "Lay the remaining courses: 21 total, 2x6x12 staggered butt joints (12+11 / 5+12+6), every joint on framing" },
      { id: "railing", name: "Railing: 4x6 posts, 29-inch 2x4 balusters, cap rails; 2x8 bottom rail already in on the right" },
    ],
  };

  // Seed data transcribed directly from Drive Renovation Tracker JSONs (never invented numbers/prices; costs start null)
  const SEED_ROOMS = [
    { id: "deck2f", name: "2nd-Floor Deck", type: "outdoor", floor: 2, w: 23, l: 10, phase: 1, status: "in-progress", notes: "21 courses 2x6x12 staggered (12+11 / 5+12+6), 29\" 2x4 balusters, 4x6 posts P1/P5 + 2 equidistant, orange joist zone right of door." },
    { id: "garage", name: "Garage", type: "garage", floor: 1, w: null, l: null, phase: 2, status: "not-started", notes: "Front siding, flashing, and trim repair; measure trim lengths before Phase 2 gate." },
    { id: "deck1f", name: "1st-Floor Deck", type: "outdoor", floor: 1, w: null, l: null, phase: 4, status: "not-started", notes: "Full railing replacement (4x6 posts + 29\" 2x4 balusters + cap rails); left-side stairs clear of outward door." },
    { id: "master-bed", name: "Master Bedroom", type: "bedrooms", floor: 2, w: null, l: null, phase: 5, status: "not-started", notes: "Placeholder side deck off master bedroom." },
    { id: "violets-bath", name: "Violet's Bathroom", type: "bathrooms", floor: 2, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "master-bath", name: "Master Bathroom", type: "bathrooms", floor: 2, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "kitchen", name: "Kitchen", type: "kitchen", floor: 1, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "laundry", name: "Laundry Room", type: "laundry", floor: 1, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "mudroom", name: "Mudroom", type: "living areas", floor: 1, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "studio", name: "Studio", type: "living areas", floor: 1, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
    { id: "living", name: "Living Areas", type: "living areas", floor: 1, w: null, l: null, phase: null, status: "unscheduled", notes: "" },
  ];

  const SEED_PHASES = [
    { id: 1, title: "Phase 1 · 2nd-Floor Deck Refurbish", room: "deck2f", status: "in-progress", summary: "Paint left soffit/trim -> exposed orange joist prep -> L-flashing & 1x4 trim -> demo & butyl tape -> 21 deck courses -> 4x6 posts & 29\" balusters." },
    { id: 2, title: "Phase 2 · Garage Front Siding / Flashing / Trim", room: "garage", status: "not-started", summary: "Inspect front sheathing/flashing, remove damaged trim, flash/seal, prime & paint matching 1x4 trim." },
    { id: 3, title: "Phase 3 · Support Beams, Footings & Stairs", room: "deck1f", status: "not-started", summary: "Mark footing pads clear of outward-swinging 1st-floor door, pour concrete piers w/ rebar, set 4x4/6x6 posts & stringers." },
    { id: 4, title: "Phase 4 · 1st-Floor Deck Railing & Stair Integration", room: "deck1f", status: "not-started", summary: "Rebuild perimeter 4x6 posts, 29\" 2x4 balusters & cap rails; detach/relocate left stair stringer clearance." },
    { id: 5, title: "Phase 5 · Master-Bedroom Side Deck (Placeholder)", room: "master-bed", status: "not-started", summary: "Design & structural scoping once Phases 1–4 clear." },
  ];

  const SEED_MATERIALS = [
    { id: "decking-2x6x12", name: "2x6x12 Deck Boards", phase: 1, category: "lumber", unit: "board", qty: 42, unitCost: null, status: "planned" },
    { id: "trim-1x4", name: "1x4 Exterior Trim Boards", phase: 1, category: "lumber", unit: "board", qty: null, unitCost: null, status: "planned" },
    { id: "flashing-l", name: "Simple L-Flashing", phase: 1, category: "flashing", unit: "ft", qty: 24, unitCost: null, status: "planned" },
    { id: "joist-tape", name: "Butyl Joist Tape", phase: 1, category: "sealant", unit: "roll", qty: null, unitCost: null, status: "planned" },
    { id: "post-4x6", name: "4x6 Railing Posts (P1–P5)", phase: 1, category: "lumber", unit: "post", qty: 4, unitCost: null, status: "planned" },
    { id: "post-4x4", name: "4x4 Stair / Beam Posts", phase: 3, category: "lumber", unit: "post", qty: null, unitCost: null, status: "planned" },
    { id: "concrete", name: "Footing Concrete Mix (80 lb)", phase: 3, category: "concrete", unit: "bag", qty: null, unitCost: null, status: "planned" },
    { id: "rebar", name: "Footing Rebar #4", phase: 3, category: "concrete", unit: "stick", qty: null, unitCost: null, status: "planned" },
    { id: "screws-ext", name: "Exterior Coated Deck Screws", phase: 1, category: "fasteners", unit: "box", qty: null, unitCost: null, status: "planned" },
    { id: "wood-filler", name: "Exterior Wood Filler", phase: 1, category: "sealant", unit: "tub", qty: null, unitCost: null, status: "planned" },
    { id: "primer", name: "Exterior Oil / Bonding Primer", phase: 1, category: "finish", unit: "gallon", qty: null, unitCost: null, status: "planned" },
    { id: "paint", name: "Exterior Trim & Soffit Paint", phase: 1, category: "finish", unit: "gallon", qty: null, unitCost: null, status: "planned" },
    { id: "caulk", name: "Polyurethane Exterior Caulk", phase: 1, category: "sealant", unit: "tube", qty: null, unitCost: null, status: "planned" },
  ];

  const SEED_REQUESTS = [
    { id: "req-01", phase: 1, room: "deck2f", title: "Verify actual joist count and datum on 2nd-floor deck", logged: "2026-09-25", status: "open", answer: "" },
    { id: "req-02", phase: 1, room: "deck2f", title: "Measure actual railing lengths between posts (2nd-floor deck)", logged: "2026-09-25", status: "open", answer: "" },
    { id: "req-03", phase: 1, room: "deck2f", title: "Verify guard height in field (2nd-floor deck)", logged: "2026-09-25", status: "open", answer: "" },
    { id: "req-04", phase: 2, room: "garage", title: "Measure garage trim board lengths (front siding/flashing/trim repair)", logged: "2026-09-25", status: "open", answer: "" },
    { id: "req-05", phase: 3, room: "", title: "Locate and mark stair footing locations (Phase 3)", logged: "2026-09-25", status: "open", answer: "" },
  ];

  // Frazier Park mountain home seasonal recurring maintenance deadlines
  const SEASONAL_MAINT = [
    { id: "fp-pine", title: "Frazier Park: Roof, gutter & defensible-space pine-needle clear", date: "2026-05-15", cadence: "Annual spring" },
    { id: "fp-deck-seal", title: "Deck UV seal & flashing caulk inspection", date: "2026-08-20", cadence: "Annual summer" },
    { id: "fp-hvac", title: "HVAC furnace filter & heat-pump check", date: "2026-10-01", cadence: "Quarterly / pre-winter" },
    { id: "fp-freeze", title: "Exterior hose bibbs & crawlspace pipe freeze wrap (4,600 ft)", date: "2026-11-01", cadence: "Annual pre-frost" },
    { id: "fp-co", title: "Smoke & CO detector battery swap", date: "2026-11-02", cadence: "Semi-annual DST" },
    { id: "fp-snow", title: "Snow-load overhang & garage apron seal check", date: "2026-12-10", cadence: "Annual winter" },
  ];

  if (!S.get("seeded.v2")) {
    if (!S.list("rooms").length) S.set("rooms", SEED_ROOMS);
    if (!S.list("materials").length) S.set("materials", SEED_MATERIALS);
    if (!S.list("requests").length) S.set("requests", SEED_REQUESTS);
    if (!S.get("phases")) S.set("phases", SEED_PHASES);
    if (!S.get("maint")) S.set("maint", SEASONAL_MAINT);
    S.set("seeded.v2", true);
  }

  const deckState = () => { try { return JSON.parse(localStorage.getItem(DECK.key) || "{}"); } catch (_) { return {}; } };
  const saveDeck = (s) => {
    try {
      localStorage.setItem(DECK.key, JSON.stringify(s));
      window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "hearth", k: "deck" } }));
    } catch (_) { toast("Browser could not save deck state."); }
  };
  const publishDeck = (s, st) => {
    if (window.PB && st.date) PB.deadlines.publish({ title: "Deck: " + s.name, date: st.date, source: "hearth-deck", kind: "project", ref: s.id, done: !!st.done });
  };

  function argusPhotoCountForHearth() {
    try {
      const meta = JSON.parse(localStorage.getItem("prometheus.argus.idbMeta") || "null");
      if (meta && Array.isArray(meta.items)) {
        return meta.items.filter((p) => String(p.pillar || "").toLowerCase() === "hearth" || String(p.tag || "").toLowerCase().includes("deck") || String(p.note || "").toLowerCase().includes("hearth")).length;
      }
    } catch (_) { /* ignore */ }
    return 0;
  }

  function phaseGateStatus(phaseNum) {
    const reqs = S.list("requests").filter((r) => +r.phase === +phaseNum);
    const openReqs = reqs.filter((r) => r.status !== "resolved");
    const mats = S.list("materials").filter((m) => +m.phase === +phaseNum);
    const unpriced = mats.filter((m) => m.unitCost == null || m.qty == null);
    const photos = argusPhotoCountForHearth() + (S.get("photosConfirmed." + phaseNum) ? 1 : 0);
    const missing = [];
    if (openReqs.length) missing.push(`${openReqs.length} field req`);
    if (photos <= 0) missing.push("before photos");
    if (unpriced.length) missing.push(`${unpriced.length} BOM prices`);
    return { ready: missing.length === 0, missing, openReqs: openReqs.length, unpriced: unpriced.length, photos };
  }

  const ROOM_TYPES = ["kitchen", "bathrooms", "bedrooms", "living areas", "laundry", "garage", "basement", "outdoor", "house systems", "whole house"];
  const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function readRecordsDocs() {
    try {
      const raw = localStorage.getItem("prometheus.records.docs");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function ensureRecordAndLink({ itemId, itemTitle, docTitle, category, where, notes }) {
    const docs = readRecordsDocs();
    const norm = (v) => String(v || "").trim().toLowerCase();
    let doc = docs.find((d) => d && (
      d.hearthRef === itemId ||
      norm(d.title) === norm(docTitle) ||
      (itemTitle && norm(d.title).includes(norm(itemTitle)))
    ));
    if (!doc) {
      doc = {
        id: "rec_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        at: new Date().toISOString(),
        title: docTitle,
        category: category || "warranty",
        issuer: "Hephaestus Hearth",
        serial: "",
        date: day(),
        due: "",
        where: where || "Hearth",
        notes: notes || "",
        hearthRef: itemId,
      };
      docs.push(doc);
      try {
        localStorage.setItem("prometheus.records.docs", JSON.stringify(docs));
        window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "records", k: "docs" } }));
      } catch (_) { /* storage optional */ }
    }
    let linked = null;
    if (typeof window !== "undefined" && window.PLinks) {
      linked = window.PLinks.link({
        fromPillar: "hearth",
        fromId: itemId,
        toPillar: "records",
        toId: doc.id,
        kind: "documented-by",
        label: doc.title,
      });
    }
    toast("Linked in Records: " + doc.title);
    paint();
    return { doc, link: linked };
  }

  function renderRecordBadges(itemId, altId) {
    if (typeof window === "undefined" || !window.PLinks) return null;
    const raw = [
      ...window.PLinks.forRecord("hearth", itemId),
      ...(altId != null ? window.PLinks.forRecord("hearth", altId) : []),
    ];
    const seen = new Set();
    const links = raw.filter((lk) => {
      if (!lk || seen.has(lk.id)) return false;
      seen.add(lk.id);
      return true;
    });
    if (!links.length) return null;
    return h("div.row-actions", { "data-links-for": itemId, style: "margin-top:6px;gap:6px;flex-wrap:wrap" },
      ...links.map((lk) => {
        const res = window.PLinks.resolve(lk);
        const outbound = lk.fromPillar === "hearth" && (String(lk.fromId) === String(itemId) || (altId != null && String(lk.fromId) === String(altId)));
        const peer = outbound ? res.to : res.from;
        const rawTitle = peer.title || lk.label || peer.id;
        const shortTitle = rawTitle.length > 42 ? rawTitle.slice(0, 41).trim() + "…" : rawTitle;
        const st = peer.status || "filed";
        return h("a.chip.link-badge", {
          href: `../${encodeURIComponent(peer.pillar)}/`,
          "data-link-id": lk.id,
          "data-kind": lk.kind,
          "data-peer": peer.pillar,
          style: "text-decoration:none;max-width:100%;overflow:hidden;text-overflow:ellipsis",
          title: `${lk.kind}: ${peer.pillar} · ${rawTitle} (${st})`,
        }, `${peer.pillar}: ${shortTitle} (${st})`);
      })
    );
  }

  let inspectedRoomId = null;
  window.HEARTH = {
    DECK,
    inspectRoom: (id) => { inspectedRoomId = id; paintInspector(); },
    data: () => ({
      deck: deckState(),
      rooms: S.list("rooms"),
      projects: S.list("projects"),
      assets: S.list("assets"),
      requests: S.list("requests"),
      materials: S.list("materials"),
      phases: S.get("phases", SEED_PHASES),
      checked: S.get("checked", {}),
      checks: CHECKS,
    }),
  };

  for (const s of DECK.stages) { const st = deckState()[s.id]; if (st && st.date) publishDeck(s, st); }
  if (window.PB) {
    for (const m of S.get("maint", SEASONAL_MAINT)) {
      PB.deadlines.publish({ title: m.title, date: m.date, source: "hearth", kind: "maintenance", ref: m.id, done: !!m.done });
    }
  }

  app.innerHTML = `
    <div id="h-inspector" class="note" style="margin-bottom:10px"></div>
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-phases" aria-controls="p-phases">Phases & Deck</button>
      <button class="tab" role="tab" id="t-reqs" aria-controls="p-reqs">Field Requests</button>
      <button class="tab" role="tab" id="t-mats" aria-controls="p-mats">Materials & Costs</button>
      <button class="tab" role="tab" id="t-rooms" aria-controls="p-rooms">Rooms & Maint</button>
      <button class="tab" role="tab" id="t-checks" aria-controls="p-checks">Room Checklists</button>
    </div>

    <section id="p-phases" role="tabpanel" class="grid">
      <div class="glass lit span-12">
        <h2>Phase-Gate Readiness (P1–P5)</h2>
        <p class="sub">Rule: a phase is clear to start only after open field measurements verify, before-photos exist in Argus, and BOM SKUs have prices.</p>
        <div id="h-phases-list"></div>
      </div>
      <div class="glass span-12">
        <h2>2nd-Floor Deck Refurbish · Blueprint Rev 7</h2>
        <div id="h-deck"></div>
      </div>
      <div class="glass span-12">
        <h2>General Renovation Log</h2>
        <div id="h-projects"></div>
        <form class="form" id="h-proj">
          <label class="f wide">Project<input name="title" required maxlength="120" placeholder="Bathroom vanity swap, soffit patch…"></label>
          <label class="f">Room<select name="room"></select></label>
          <label class="f">Started<input name="start" type="date"></label>
          <label class="f">Done<input name="done" type="date"></label>
          <label class="f">Actual Cost $<input name="cost" type="number" min="0" step="1"></label>
          <button class="btn" type="submit">Record project</button>
        </form>
      </div>
    </section>

    <section id="p-reqs" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Field Verification Requests</h2>
        <p class="sub">Measure in field and resolve to unlock Phase Gates and enrich the architectural blueprint.</p>
        <div id="h-reqs-list"></div>
        <form class="form" id="h-req-form" style="margin-top:12px">
          <label class="f wide">New Field Request<input name="title" required maxlength="160" placeholder="Check ledger flashing depth under slider door"></label>
          <label class="f">Phase<select name="phase"><option value="1">Phase 1</option><option value="2">Phase 2</option><option value="3">Phase 3</option><option value="4">Phase 4</option><option value="5">Phase 5</option></select></label>
          <label class="f">Room<select name="room"></select></label>
          <button class="btn quiet" type="submit">Log Request</button>
        </form>
      </div>
    </section>

    <section id="p-mats" role="tabpanel" class="grid">
      <div class="glass span-4"><div class="stat-k">Planned BOM Estimate</div><div class="stat-v big" id="h-cost-plan">—</div><div class="stat-s" id="h-cost-plan-s"></div></div>
      <div class="glass span-4"><div class="stat-k">Actual Spent</div><div class="stat-v big" id="h-cost-act">—</div><div class="stat-s" id="h-cost-act-s">Projects + receipts</div></div>
      <div class="glass span-4"><div class="stat-k">SKUs Priced</div><div class="stat-v big" id="h-cost-sku">0 / 13</div><div class="stat-s">No invented guesses</div></div>
      <div class="glass span-12">
        <div class="row-actions" style="justify-content:space-between">
          <h2>Materials Bill of Materials (BOM)</h2>
          <form class="row-actions">
            <label class="f">Phase <select id="h-mat-phase"><option value="all">All</option><option value="1">P1</option><option value="2">P2</option><option value="3">P3</option><option value="4">P4</option></select></label>
            <label class="f">Category <select id="h-mat-cat"><option value="all">All</option><option>lumber</option><option>flashing</option><option>sealant</option><option>concrete</option><option>fasteners</option><option>finish</option></select></label>
          </form>
        </div>
        <div class="scroll-x"><table class="t"><thead><tr><th>Phase</th><th>SKU</th><th>Cat</th><th class="n">Qty</th><th class="n">Unit $</th><th class="n">Line $</th><th>Status</th><th></th></tr></thead><tbody id="h-mats-body"></tbody></table></div>
      </div>
    </section>

    <section id="p-rooms" role="tabpanel" class="grid">
      <div class="glass span-7">
        <h2>Rooms & Blueprint Dimensions (11 Seeded)</h2>
        <div id="h-rooms"></div>
        <form class="form" id="h-room" style="margin-top:10px">
          <label class="f">Room<input name="name" required maxlength="40" placeholder="Workshop"></label>
          <label class="f">Type<select name="type">${ROOM_TYPES.map((t) => `<option>${t}</option>`).join("")}</select></label>
          <label class="f">Floor<input name="floor" type="number" min="0" max="5" value="1"></label>
          <label class="f">Width ft<input name="w" type="number" min="0" step="0.1"></label>
          <label class="f">Length ft<input name="l" type="number" min="0" step="0.1"></label>
          <button class="btn quiet" type="submit">Add room</button>
        </form>
      </div>
      <div class="glass span-5">
        <h2>Frazier Park Seasonal Maintenance</h2>
        <p class="sub">Mountain deadlines published to Chronos & Hub Orrery.</p>
        <div id="h-maint"></div>
      </div>
      <div class="glass span-12">
        <h2>Room Assets & Warranties</h2>
        <div id="h-assets"></div>
        <form class="form" id="h-asset" style="margin-top:10px">
          <label class="f wide">Item<input name="name" required maxlength="80" placeholder="Heat Pump / Tankless Water Heater"></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c.category}</option>`).join("")}<option>other</option></select></label>
          <label class="f">Room<select name="room"></select></label>
          <label class="f">Model<input name="model" maxlength="60"></label>
          <label class="f">Serial<input name="serial" maxlength="60"></label>
          <label class="f">Warranty until<input name="warranty" type="date"></label>
          <label class="f wide">Receipt location<input name="receipt" maxlength="120" placeholder="Drive folder, drawer"></label>
          <button class="btn quiet" type="submit">Add item</button>
        </form>
      </div>
    </section>

    <section id="p-checks" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Code & Trade Checklists (${CHECKS.length} Cited Checkpoints)</h2>
        <form class="form"><label class="f">Room type<select id="h-ctype">${[...new Set(CHECKS.map((c) => c.room))].map((r) => `<option>${r}</option>`).join("")}</select></label></form>
        <div id="h-checks"></div>
      </div>
    </section>
  `;

  function paintInspector() {
    const el = $("#h-inspector");
    if (!inspectedRoomId) { el.innerHTML = "Tip: Click any measured room or the 2nd-floor deck in the stage canvas above to inspect its phase & field requests."; return; }
    const rm = S.list("rooms").find((r) => r.id === inspectedRoomId);
    if (!rm) { el.innerHTML = ""; return; }
    const reqs = S.list("requests").filter((r) => r.room === rm.id);
    const open = reqs.filter((r) => r.status !== "resolved").length;
    el.innerHTML = `<b>Selected room: ${esc(rm.name)}</b> · ${rm.w && rm.l ? `${rm.w} × ${rm.l} ft` : "unmeasured"} · ${rm.phase ? `Phase ${rm.phase}` : "unscheduled"} · ${open} open field request(s) ${rm.notes ? `— ${esc(rm.notes)}` : ""}`;
  }

  function paint() {
    const D = window.HEARTH.data();
    const roomName = (id) => (D.rooms.find((r) => r.id === id) || {}).name || "Whole house";
    paintInspector();

    // 1. Phases + Phase-Gate badges
    const phBox = $("#h-phases-list");
    phBox.replaceChildren(...D.phases.map((p) => {
      const gate = phaseGateStatus(p.id);
      const rm = roomName(p.room);
      const photoKey = "photosConfirmed." + p.id;
      const phaseItemId = "phase-" + p.id;
      return h("div.phase-card", { "data-phase-id": p.id },
        h("div.kv", { style: "border-bottom:none;padding:0 0 4px" },
          h("span", null, h("b", null, p.title), " ", h("span.meta", null, `(${rm})`)),
          h("span.pill." + (gate.ready ? "gate-ok" : "gate-hold"), null, gate.ready ? "Gate Clear" : "Hold: " + gate.missing.join(" · "))
        ),
        h("p.stat-s", { style: "margin:4px 0 8px" }, p.summary),
        h("div.row-actions", null,
          h("select", {
            "aria-label": `Status for ${p.title}`,
            onchange: (e) => {
              const all = S.get("phases", SEED_PHASES).map((x) => x.id === p.id ? { ...x, status: e.target.value } : x);
              S.set("phases", all); paint();
            },
          }, ...["not-started", "in-progress", "completed"].map((st) => h("option", { value: st, ...(p.status === st ? { selected: "" } : {}) }, st))),
          h("label.sub", null,
            h("input", {
              type: "checkbox",
              ...(S.get(photoKey) || argusPhotoCountForHearth() > 0 ? { checked: "" } : {}),
              onchange: (e) => { S.set(photoKey, !!e.target.checked); paint(); },
            }),
            ` Before-photos verified (${argusPhotoCountForHearth()} in Argus)`
          ),
          h("button.btn.quiet.small", {
            type: "button",
            "data-action": "link-records",
            "data-item-id": phaseItemId,
            onclick: () => ensureRecordAndLink({
              itemId: phaseItemId,
              itemTitle: p.title,
              docTitle: `Warranty / Permit · ${p.title}`,
              category: "home",
              where: `Hearth Phase ${p.id} (${rm})`,
              notes: p.summary,
            }),
          }, "Link Warranty / Permit in Records")
        ),
        renderRecordBadges(phaseItemId, String(p.id))
      );
    }));

    // 2. Deck Blueprint Rev 7 Checklist
    const doneDeck = DECK.stages.filter((s) => (D.deck[s.id] || {}).done).length;
    $("#h-deck").replaceChildren(
      h("div", { style: "padding:4px 0 12px" },
        h("div.kv", null,
          h("span", null, h("b", null, "2nd-Floor Deck Stages"), h("br"), h("span.stat-s", null, `${DECK.widthFt} × ${DECK.depthFt} ft · ${DECK.courses} courses · staggered 12+11 / 5+12+6`)),
          h("b", null, `${doneDeck} / ${DECK.stages.length}`)
        ),
        h("div.bar-mini", null, h("i", { style: `width:${(doneDeck / DECK.stages.length) * 100}%` })),
        ...DECK.stages.map((s, i) => {
          const st = D.deck[s.id] || {};
          return h("div.kv", null,
            h("label", null, h("input", {
              type: "checkbox",
              ...(st.done ? { checked: "" } : {}),
              onchange: (e) => {
                const all = deckState(); all[s.id] = { ...(all[s.id] || {}), done: e.target.checked };
                saveDeck(all); publishDeck(s, all[s.id]);
                if (window.PB && e.target.checked) PB.events.publish({ type: "deck.stage", pillar: "hearth", ref: s.id, title: s.name });
                paint();
              },
            }), ` ${i + 1}. ${s.name}`),
            h("input", {
              type: "date", value: st.date || "", "aria-label": `Target date stage ${i + 1}`, style: "max-width:145px",
              onchange: (e) => { const all = deckState(); all[s.id] = { ...(all[s.id] || {}), date: e.target.value }; saveDeck(all); publishDeck(s, all[s.id]); },
            })
          );
        })
      )
    );

    // 3. General projects + room dropdowns
    $("#h-projects").replaceChildren(...D.projects.sort((a, b) => String(b.start || "").localeCompare(String(a.start || ""))).map((p) =>
      h("div.kv", null,
        h("span", null, h("b", null, p.title), h("br"), h("span.stat-s", null, `${roomName(p.room)}${p.start ? " · from " + p.start : ""}${p.done ? " · done " + p.done : " · underway"}${p.cost ? " · " + usd(p.cost) : ""}`)),
        p.done ? null : h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("projects", p.id, { done: day() }); paint(); } }, "Done today")
      )
    ));
    const roomOpts = () => [h("option", { value: "" }, "Whole house"), ...D.rooms.map((r) => h("option", { value: r.id }, r.name))];
    $("#h-proj").room.replaceChildren(...roomOpts());
    $("#h-asset").room.replaceChildren(...roomOpts());
    $("#h-req-form").room.replaceChildren(...roomOpts());

    // 4. Field Requests
    $("#h-reqs-list").replaceChildren(...(D.requests.length ? D.requests.map((req) =>
      h("div.kv", null,
        h("span", null,
          h("span.badge-phase", null, `P${req.phase}`), " ", h("b", null, req.title),
          h("div.stat-s", null, `${roomName(req.room)} · logged ${req.logged} · ${req.status === "resolved" ? `Resolved: ${req.answer || "verified"}` : "OPEN field measurement"}`)
        ),
        req.status === "resolved"
          ? h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("requests", req.id, { status: "open" }); paint(); } }, "Reopen")
          : h("button.btn.small", {
            type: "button",
            onclick: () => {
              const ans = prompt(`Field measurement / note for "${req.title}":`, req.answer || "Verified in field");
              if (ans == null) return;
              S.update("requests", req.id, { status: "resolved", answer: ans.trim(), resolvedAt: day() });
              if (req.room) {
                const rm = D.rooms.find((r) => r.id === req.room);
                if (rm) S.update("rooms", rm.id, { notes: (rm.notes ? rm.notes + " | " : "") + ans.trim() });
              }
              toast("Request resolved");
              paint();
            },
          }, "Verify & Resolve")
      )
    ) : [h("p.empty", null, "No field requests.")]));

    // 5. Materials BOM + Costs (Planned vs Actual)
    const pFilt = $("#h-mat-phase").value, cFilt = $("#h-mat-cat").value;
    const allMats = D.materials;
    const visMats = allMats.filter((m) => (pFilt === "all" || String(m.phase) === pFilt) && (cFilt === "all" || m.category === cFilt));
    const pricedCount = allMats.filter((m) => m.unitCost != null && m.qty != null).length;
    const plannedTotal = allMats.reduce((s, m) => s + ((m.qty && m.unitCost) ? m.qty * m.unitCost : 0), 0);
    const actualSpent = D.projects.reduce((s, p) => s + (+p.cost || 0), 0) + allMats.reduce((s, m) => s + (+m.actualPaid || 0), 0);
    $("#h-cost-sku").textContent = `${pricedCount} / ${allMats.length}`;
    $("#h-cost-plan").textContent = pricedCount ? usd(plannedTotal) : "Unpriced";
    $("#h-cost-plan-s").textContent = `${allMats.length - pricedCount} SKU(s) still awaiting store quote`;
    $("#h-cost-act").textContent = actualSpent ? usd(actualSpent) : "$0";

    const mb = $("#h-mats-body");
    mb.replaceChildren(...visMats.map((m) => {
      const lineTotal = (m.qty != null && m.unitCost != null) ? usd(m.qty * m.unitCost) : "—";
      return h("tr", { "data-material-id": m.id },
        h("td", null, h("span.badge-phase", null, `P${m.phase}`)),
        h("td", null,
          h("b", null, m.name), " ", h("span.meta", null, `(${m.unit})`),
          renderRecordBadges(String(m.id))
        ),
        h("td", null, m.category),
        h("td.n", null, m.qty ?? "—"),
        h("td.n", null, m.unitCost != null ? "$" + Number(m.unitCost).toFixed(2) : "—"),
        h("td.n", null, lineTotal),
        h("td", null, m.status),
        h("td", null,
          h("span.row-actions", null,
            h("button.btn.quiet.small", {
              type: "button",
              "data-action": "price-qty",
              onclick: () => {
                const qStr = prompt(`Quantity (${m.unit}s) for ${m.name}:`, m.qty ?? "");
                if (qStr === null) return;
                const cStr = prompt(`Unit cost ($) for ${m.name}:`, m.unitCost ?? "");
                if (cStr === null) return;
                const aStr = prompt(`Actual receipt spent ($) if purchased (blank if not bought yet):`, m.actualPaid ?? "");
                if (aStr === null) return;
                S.update("materials", m.id, {
                  qty: qStr.trim() === "" ? null : +qStr,
                  unitCost: cStr.trim() === "" ? null : +cStr,
                  actualPaid: aStr.trim() === "" ? null : +aStr,
                  status: aStr.trim() !== "" ? "purchased" : (cStr.trim() !== "" ? "quoted" : "planned"),
                });
                paint();
              },
            }, "Price / Qty"),
            h("button.btn.quiet.small", {
              type: "button",
              "data-action": "link-records",
              "data-item-id": m.id,
              onclick: () => ensureRecordAndLink({
                itemId: String(m.id),
                itemTitle: m.name,
                docTitle: `Warranty / Permit · ${m.name}`,
                category: "warranty",
                where: `Hearth BOM (Phase ${m.phase})`,
                notes: `${m.category} (${m.unit}) for Hearth Phase ${m.phase}`,
              }),
            }, "Link Warranty / Permit in Records")
          )
        )
      );
    }));

    // 6. Rooms (click "Measure" to set W x L so canvas draws it)
    $("#h-rooms").replaceChildren(...(D.rooms.length ? D.rooms.map((r) => {
      const a = D.assets.filter((x) => x.room === r.id).length;
      const p = D.projects.filter((x) => x.room === r.id).length;
      return h("div.kv", null,
        h("span", null,
          r.phase ? h("span.badge-phase", null, `P${r.phase}`) : null, " ",
          h("b", null, r.name),
          h("div.stat-s", null, `${r.type} · fl ${r.floor}${r.w && r.l ? ` · ${r.w} × ${r.l} ft (${Math.round(r.w * r.l)} ft²)` : " · unmeasured"} · ${a} items · ${p} proj`)
        ),
        h("span.row-actions", null,
          h("button.btn.quiet.small", {
            type: "button",
            onclick: () => {
              const wv = prompt(`Width (ft) for ${r.name}:`, r.w ?? ""); if (wv === null) return;
              const lv = prompt(`Length (ft) for ${r.name}:`, r.l ?? ""); if (lv === null) return;
              S.update("rooms", r.id, { w: +wv || null, l: +lv || null }); paint();
            },
          }, "Measure"),
          h("button.btn.quiet.small", {
            type: "button",
            onclick: () => { if (confirm("Remove " + r.name + "?")) { S.remove("rooms", r.id); paint(); } },
          }, "×")
        )
      );
    }) : [h("p.empty", null, "No rooms yet.")]));

    // 7. Frazier Park Seasonal Maintenance
    const maints = S.get("maint", SEASONAL_MAINT);
    $("#h-maint").replaceChildren(...maints.map((m) =>
      h("div.kv", null,
        h("label", null,
          h("input", {
            type: "checkbox", ...(m.done ? { checked: "" } : {}),
            onchange: (e) => {
              const next = S.get("maint", SEASONAL_MAINT).map((x) => x.id === m.id ? { ...x, done: e.target.checked } : x);
              S.set("maint", next);
              if (window.PB) PB.deadlines.publish({ title: m.title, date: m.date, source: "hearth", kind: "maintenance", ref: m.id, done: !!e.target.checked });
              paint();
            },
          }),
          " ", h("b", null, m.title), h("div.stat-s", null, `${m.date} · ${m.cadence}`)
        )
      )
    ));

    // 8. Assets
    const today = day();
    $("#h-assets").replaceChildren(...(D.assets.length ? D.assets.map((x) => {
      const left = x.warranty ? Math.round((new Date(x.warranty + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5) : null;
      return h("div.kv", null,
        h("span", null, h("b", null, x.name), h("div.stat-s", null, `${x.category} · ${roomName(x.room)}${x.model ? " · " + x.model : ""}${x.serial ? " · SN " + x.serial : ""}${x.receipt ? " · " + x.receipt : ""}`)),
        left == null ? null : h("span.pill" + (left < 60 ? ".hot" : ""), null, left < 0 ? "warranty over" : `${left} d left`)
      );
    }) : [h("p.empty", null, "No home appliances or gear recorded yet.")]));

    // 9. Room Checklists
    const ctype = $("#h-ctype").value;
    const list = CHECKS.filter((c) => c.room === ctype).sort((a, b) => a.order - b.order);
    $("#h-checks").replaceChildren(...list.map((c) =>
      h("div.kv", null,
        h("label", null,
          h("input", {
            type: "checkbox", ...(D.checked[c.id] ? { checked: "" } : {}),
            onchange: (e) => { const m = S.get("checked", {}); if (e.target.checked) m[c.id] = day(); else delete m[c.id]; S.set("checked", m); },
          }),
          " ", h("b", null, c.title),
          h("div.stat-s", null, `${c.phase} · ${c.trade} · ${c.check} `, c.url ? h("a", { href: c.url, target: "_blank", rel: "noopener" }, c.cite || "source") : (c.cite || ""))
        )
      )
    ));
  }

  $("#h-ctype").addEventListener("change", paint);
  $("#h-mat-phase").addEventListener("change", paint);
  $("#h-mat-cat").addEventListener("change", paint);

  $("#h-proj").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("projects", { title: f.title.value.trim(), room: f.room.value, start: f.start.value, done: f.done.value, cost: +f.cost.value || 0 });
    f.reset(); toast("Project recorded"); paint();
  });
  $("#h-req-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("requests", { title: f.title.value.trim(), phase: +f.phase.value, room: f.room.value, logged: day(), status: "open", answer: "" });
    f.reset(); toast("Field request logged"); paint();
  });
  $("#h-room").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("rooms", { name: f.name.value.trim(), type: f.type.value, floor: +f.floor.value || 1, w: +f.w.value || null, l: +f.l.value || null, phase: null, status: "unscheduled" });
    f.reset(); toast("Room added"); paint();
  });
  $("#h-asset").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    const a = S.add("assets", { name: f.name.value.trim(), category: f.category.value, room: f.room.value, model: f.model.value.trim(), serial: f.serial.value.trim(), warranty: f.warranty.value, receipt: f.receipt.value.trim() });
    if (window.PB && a.warranty) PB.deadlines.publish({ title: "Warranty ends: " + a.name, date: a.warranty, source: "hearth", kind: "warranty", ref: a.id });
    f.reset(); toast("Asset added"); paint();
  });

  $("#export").onclick = () => { const d = S.dump(); d.data["deck.stages.v1"] = deckState(); download(`hearth_${day()}.json`, d); };
  $("#import").onclick = async () => {
    const f = await pickFile(); if (!f) return;
    try {
      const obj = JSON.parse(await f.text());
      const deck = obj && obj.data && obj.data["deck.stages.v1"];
      if (deck) { delete obj.data["deck.stages.v1"]; saveDeck({ ...deckState(), ...deck }); }
      S.load(obj); toast("Imported"); paint();
    } catch (e) { toast(e.message); }
  };

  tabs(app, () => requestAnimationFrame(paint));
  paint();
})();
