/* Hephaestus Hearth v2 (owner, 2026-11-25: "I want the hearth pillar to track each room. The renovations completion and value of assets
   in each room also. Appliances and furniture for example. It currently shows the deck stuff first but id like you to start from scratch
   and redesign it so its a home management with renovation details like the deck to supplement").
   The house, floor by floor, as the owner described it: Ground (garage, crawlspace, mudroom), First (large deck, foyer and hallway, laundry,
   office, studio, guest bedroom, guest bathroom), Second (large deck, living room, kitchen, Violet's room, master bedroom, Violet's bathroom,
   master bathroom, master bedroom's small deck), Top (the unfinished attic). Tabs: House (the cross-section, every room's renovation
   progress and contents value, the room you tap), Renovations (every project by room with its tasks; the deck job book under it as the
   supplement: stages, materials, field requests, specs, permit and research), Inventory (appliances, furniture and everything else, by room,
   with what each cost and is worth, warranties), Upkeep (seasonal maintenance and the cited code checklists).
   Shares on this device: "prometheus.hearth.summary" (contents value, items, renovation progress) for Midas's net worth and Aegis's coverage.
   Keeps window.HEARTH = { DECK, data, ... } for stage.js and the cross-pillar links (kit/links.js). */
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

  // Seasonal home maintenance deadlines. The place is whatever this device is used for.
  const SEASONAL_MAINT = [
    { id: "fp-pine", title: "Roof, gutter, and defensible-space clear", date: "2026-05-15", cadence: "Annual spring" },
    { id: "fp-deck-seal", title: "Deck UV seal & flashing caulk inspection", date: "2026-08-20", cadence: "Annual summer" },
    { id: "fp-hvac", title: "HVAC furnace filter & heat-pump check", date: "2026-10-01", cadence: "Quarterly / pre-winter" },
    { id: "fp-freeze", title: "Exterior hose bibbs and crawlspace pipe freeze wrap", date: "2026-11-01", cadence: "Annual pre-frost" },
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

  /* ---- the house (v2) ---- */
  const FLOORS = [
    { n: 3, id: "top", name: "Top", sub: "unfinished attic" },
    { n: 2, id: "second", name: "Second floor", sub: "living, kitchen, bedrooms" },
    { n: 1, id: "first", name: "First floor", sub: "entry, office, studio, guest" },
    { n: 0, id: "ground", name: "Ground level", sub: "garage, crawlspace, mudroom" },
  ];
  const HOUSE = [
    ["attic", "Attic", 3, "storage", "Unfinished"],
    ["deck2", "Large deck", 2, "outdoor", "23 × 10 ft, off the living room"], ["living", "Living room", 2, "living areas"], ["kitchen", "Kitchen", 2, "kitchen"],
    ["violet-room", "Violet's room", 2, "bedrooms"], ["master-bed", "Master bedroom", 2, "bedrooms"], ["violet-bath", "Violet's bathroom", 2, "bathrooms"],
    ["master-bath", "Master bathroom", 2, "bathrooms"], ["master-deck", "Master bedroom deck", 2, "outdoor", "small"],
    ["deck1", "Large deck", 1, "outdoor"], ["foyer", "Foyer and hallway", 1, "living areas"], ["laundry", "Laundry room", 1, "laundry"], ["office", "Office", 1, "living areas"],
    ["studio", "Studio", 1, "living areas"], ["guest-bed", "Guest bedroom", 1, "bedrooms"], ["guest-bath", "Guest bathroom", 1, "bathrooms"],
    ["garage", "Garage", 0, "garage"], ["crawlspace", "Crawlspace", 0, "house systems"], ["mudroom", "Mudroom", 0, "living areas"],
  ].map(([id, name, floor, type, note]) => ({ id, name, floor, type, notes: note || "", w: null, l: null }));
  const OLD_ID = { deck2f: "deck2", deck1f: "deck1", "violets-bath": "violet-bath" };
  if (!S.get("seeded.v3")) {
    const map = (id) => OLD_ID[id] || id;
    const old = S.list("rooms"), byId = new Map(old.map((r) => [map(r.id), r]));
    const rooms = HOUSE.map((r) => { const o = byId.get(r.id) || {}; return { ...r, w: o.w ?? r.w, l: o.l ?? r.l, notes: [r.notes, o.notes && o.notes !== r.notes ? o.notes : ""].filter(Boolean).join(" · ") }; });
    for (const o of old) if (!HOUSE.some((r) => r.id === map(o.id)) && !["living"].includes(o.id)) rooms.push({ ...o, id: map(o.id), floor: o.floor ?? 1 });   // rooms he added himself stay
    S.set("rooms", rooms);
    const phases = S.get("phases", SEED_PHASES).map((p) => ({ ...p, room: p.id === 5 ? "master-deck" : map(p.room) }));
    S.set("phases", phases);
    for (const k of ["requests", "assets", "projects"]) S.set(k, S.list(k).map((x) => ({ ...x, room: map(x.room) })));
    S.set("seeded.v3", true);
    try { localStorage.removeItem("prometheus.tab." + location.pathname); } catch (_) { /* the House tab opens first */ }
  }
  const roomList = () => S.list("rooms");
  const floorOf = (r) => FLOORS.find((f) => f.n === +r.floor) || FLOORS[2];
  const assetValue = (a) => (Number.isFinite(+a.value) && a.value !== "" && a.value != null ? +a.value : Number.isFinite(+a.paid) && a.paid !== "" && a.paid != null ? +a.paid : 0);
  /** A project's progress, 0..100: the deck's stages for the deck refurbish, its own tasks otherwise, else its status. */
  function progressOf(p) {
    if (+p.id === 1) { const st = deckState(); const done = DECK.stages.filter((x) => (st[x.id] || {}).done).length; return Math.round((done / DECK.stages.length) * 100); }
    const t = p.tasks || []; if (t.length) return Math.round((t.filter((x) => x.done).length / t.length) * 100);
    return p.status === "completed" ? 100 : p.status === "in-progress" ? 40 : 0;
  }
  /** Everything Hearth knows about one room. */
  function roomFacts(id) {
    const projects = S.get("phases", SEED_PHASES).filter((p) => p.room === id);
    const assets = S.list("assets").filter((a) => a.room === id);
    const pct = projects.length ? Math.round(projects.reduce((s, p) => s + progressOf(p), 0) / projects.length) : null;
    return { projects, assets, pct, value: assets.reduce((s, a) => s + assetValue(a), 0), open: projects.reduce((s, p) => s + (+p.id === 1 ? DECK.stages.filter((x) => !(deckState()[x.id] || {}).done).length : (p.tasks || []).filter((x) => !x.done).length), 0) };
  }
  function houseFacts() {
    const rooms = roomList(), phases = S.get("phases", SEED_PHASES), assets = S.list("assets");
    const pct = phases.length ? Math.round(phases.reduce((s, p) => s + progressOf(p), 0) / phases.length) : 0;
    const value = assets.reduce((s, a) => s + assetValue(a), 0);
    const open = rooms.reduce((s, r) => s + roomFacts(r.id).open, 0);
    const soon = assets.filter((a) => a.warranty).map((a) => ({ name: a.name, until: a.warranty })).filter((w) => w.until >= day()).sort((a, b) => a.until.localeCompare(b.until)).slice(0, 3);
    return { rooms: rooms.length, roomsWithItems: new Set(assets.map((a) => a.room)).size, items: assets.length, value, pct, open, projects: phases.length, soon };
  }
  function publishSummary() {
    const f = houseFacts();
    try { localStorage.setItem("prometheus.hearth.summary", JSON.stringify({ v: 1, at: new Date().toISOString(), contentsValue: Math.round(f.value * 100) / 100, items: f.items, rooms: f.roomsWithItems, roomsTotal: f.rooms, renoPct: f.pct, openTasks: f.open, warranties: f.soon })); } catch (_) { /* storage optional */ }
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
  const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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
  const SHORT = { "Violet's room": "Violet", "Master bedroom": "Master", "Violet's bathroom": "V. bath", "Master bathroom": "M. bath", "Master bedroom deck": "M. deck",
    "Foyer and hallway": "Foyer", "Guest bedroom": "Guest", "Guest bathroom": "G. bath", "Laundry room": "Laundry", "Living room": "Living", "Large deck": "Deck" };
  window.HEARTH = {
    DECK,
    /** The house for the drawing (stage.js): floors top first, each room's progress and contents, the next step. */
    house: () => {
      const facts = houseFacts(), st = deckState(), phases = S.get("phases", SEED_PHASES);
      const deckNext = DECK.stages.find((x) => !(st[x.id] || {}).done);
      let next = deckNext ? "deck: " + deckNext.name : "";
      if (!next) for (const p of phases) { const t = (p.tasks || []).find((x) => !x.done); if (t) { const rm = roomList().find((r) => r.id === p.room); next = `${rm ? rm.name : "house"}: ${t.title}`; break; } }
      return { facts, next, floors: FLOORS.map((F) => ({ ...F, rooms: roomList().filter((r) => +r.floor === F.n).map((r) => { const R = roomFacts(r.id); return { id: r.id, name: r.name, short: SHORT[r.name] || r.name, type: r.type, pct: R.pct, items: R.assets.length, value: R.value }; }) })) };
    },
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
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-house" aria-controls="p-house">House</button>
      <button class="tab" role="tab" id="t-phases" aria-controls="p-phases">Renovations</button>
      <button class="tab" role="tab" id="t-inv" aria-controls="p-inv">Inventory</button>
      <button class="tab" role="tab" id="t-upkeep" aria-controls="p-upkeep">Upkeep</button>
    </div>

    <section id="p-house" role="tabpanel" class="grid">
      <div class="glass lit span-12 h-totals" id="h-totals"></div>
      <div class="span-12" id="h-room-view" hidden></div>
      <div class="span-12 h-floors" id="h-floors"></div>
      <div class="glass span-12">
        <h2>Room sizes</h2>
        <p class="sub">Measure a room once and the drawing above uses it. Add a space the list is missing.</p>
        <div id="h-rooms"></div>
        <form class="form" id="h-room" style="margin-top:10px">
          <label class="f">Room<input name="name" required maxlength="40" placeholder="Workshop"></label>
          <label class="f">Type<select name="type">${ROOM_TYPES.map((t) => `<option>${t}</option>`).join("")}</select></label>
          <label class="f">Floor<select name="floor">${FLOORS.map((f) => `<option value="${f.n}">${f.name}</option>`).join("")}</select></label>
          <label class="f">Width ft<input name="w" type="number" min="0" step="0.1"></label>
          <label class="f">Length ft<input name="l" type="number" min="0" step="0.1"></label>
          <button class="btn quiet" type="submit">Add room</button>
        </form>
      </div>
    </section>

    <section id="p-phases" role="tabpanel" class="grid">
      <div class="glass lit span-12">
        <h2>Renovations, room by room</h2>
        <p class="sub">Each project belongs to a room. Its progress comes from its own tasks; the deck refurbish counts the deck's stages.</p>
        <div id="h-plate" class="h-plate"></div>
        <div id="h-phases-list"></div>
        <form class="form" id="h-proj" style="margin-top:12px">
          <label class="f wide">New project<input name="title" required maxlength="120" placeholder="Kitchen backsplash, guest bath vanity, attic insulation…"></label>
          <label class="f">Room<select name="room"></select></label>
          <label class="f">Budget $<input name="budget" type="number" min="0" step="1"></label>
          <label class="f">Target date<input name="due" type="date"></label>
          <button class="btn" type="submit">Add project</button>
        </form>
        <details class="h-log"><summary>Done-work log</summary><div id="h-projects"></div></details>
      </div>
      <details class="span-12 h-jobbook" id="h-jobbook">
        <summary><span class="kicker">Supplement</span><b>The deck job book</b><small>stages, materials and prices, field requests, specs, the permit, design loads and snow</small></summary>
        <div class="grid h-jobbook-grid">
      <div class="glass span-12 h-supp">
        <p class="kicker">Supplement · the deck job book</p>
        <h2>Second-floor deck refurbish · Blueprint Rev 7</h2>
        <div id="h-deck"></div>
        <div id="h-specs"></div>
        <div id="h-permit"></div>
      </div>
      <div class="glass span-12 h-supp">
        <h2>Field requests</h2>
        <p class="sub">Measurements to take on site before a phase starts.</p>
        <div id="h-reqs-list"></div>
        <form class="form" id="h-req-form" style="margin-top:12px">
          <label class="f wide">New field request<input name="title" required maxlength="160" placeholder="Check ledger flashing depth under slider door"></label>
          <label class="f">Phase<select name="phase"><option value="1">Phase 1</option><option value="2">Phase 2</option><option value="3">Phase 3</option><option value="4">Phase 4</option><option value="5">Phase 5</option></select></label>
          <label class="f">Room<select name="room"></select></label>
          <button class="btn quiet" type="submit">Log request</button>
        </form>
      </div>
      <div id="p-mats" class="span-12 grid h-supp-grid">
        <div class="glass span-4"><div class="stat-k">Planned materials</div><div class="stat-v big" id="h-cost-plan">—</div><div class="stat-s" id="h-cost-plan-s"></div></div>
        <div class="glass span-4"><div class="stat-k">Actual spent</div><div class="stat-v big" id="h-cost-act">—</div><div class="stat-s" id="h-cost-act-s">Projects + receipts</div></div>
        <div class="glass span-4"><div class="stat-k">Items priced</div><div class="stat-v big" id="h-cost-sku">0 / 13</div><div class="stat-s">No invented guesses</div></div>
        <div class="glass span-12">
          <div class="row-actions" style="justify-content:space-between">
            <h2>Deck materials</h2>
            <button class="btn quiet small" id="h-basis-btn" type="button">Sync capital basis → Records</button>
            <form class="row-actions">
              <label class="f">Phase <select id="h-mat-phase"><option value="all">All</option><option value="1">P1</option><option value="2">P2</option><option value="3">P3</option><option value="4">P4</option></select></label>
              <label class="f">Category <select id="h-mat-cat"><option value="all">All</option><option>lumber</option><option>flashing</option><option>sealant</option><option>concrete</option><option>fasteners</option><option>finish</option></select></label>
            </form>
          </div>
          <div class="scroll-x"><table class="t"><thead><tr><th>Phase</th><th>Item</th><th>Cat</th><th class="n">Qty</th><th class="n">Unit $</th><th class="n">Line $</th><th>Status</th><th></th></tr></thead><tbody id="h-mats-body"></tbody></table></div>
        </div>
      </div>
      <div id="p-checks" class="span-12 h-supp"><h2 class="h-supp-h">Deck research: loads, permit, snow</h2></div>
        </div>
      </details>
    </section>

    <section id="p-inv" role="tabpanel" class="grid">
      <div class="glass lit span-12" id="h-inv-top"></div>
      <div class="glass span-12">
        <div class="row-actions" style="justify-content:space-between"><h2>Everything in the house</h2>
          <form class="row-actions"><label class="f">Room <select id="h-inv-room"><option value="all">All rooms</option></select></label>
            <label class="f">Kind <select id="h-inv-kind"><option value="all">All</option><option>appliance</option><option>furniture</option><option>electronics</option><option>fixture</option><option>tools</option><option>decor</option><option>outdoor</option><option>other</option></select></label></form></div>
        <div id="h-assets"></div>
      </div>
      <div class="glass span-12">
        <h2>Add an item</h2>
        <form class="form" id="h-asset">
          <label class="f wide">Item<input name="name" required maxlength="80" placeholder="Refrigerator, sectional sofa, washer…"></label>
          <label class="f">Kind<select name="kind"><option>appliance</option><option>furniture</option><option>electronics</option><option>fixture</option><option>tools</option><option>decor</option><option>outdoor</option><option>other</option></select></label>
          <label class="f">Room<select name="room"></select></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c.category}</option>`).join("")}<option>other</option></select></label>
          <label class="f">Brand / model<input name="model" maxlength="60"></label>
          <label class="f">Serial<input name="serial" maxlength="60"></label>
          <label class="f">Bought<input name="purchased" type="date"></label>
          <label class="f">Paid $<input name="paid" type="number" min="0" step="1"></label>
          <label class="f">Worth now $<input name="value" type="number" min="0" step="1" placeholder="what it would cost to replace"></label>
          <label class="f">Warranty until<input name="warranty" type="date"></label>
          <label class="f wide">Receipt location<input name="receipt" maxlength="120" placeholder="Drive folder, drawer"></label>
          <button class="btn" type="submit">Add item</button>
        </form>
      </div>
    </section>

    <section id="p-upkeep" role="tabpanel" class="grid">
      <div class="glass span-12">
        <h2>Seasonal maintenance</h2>
        <p class="sub">Mountain-home deadlines; each one shows in the hub's Time.</p>
        <div id="h-maint"></div>
      </div>
      <div class="glass span-12">
        <h2>Code and trade checklists (${CHECKS.length} cited checkpoints)</h2>
        <form class="form"><label class="f">Room type<select id="h-ctype">${[...new Set(CHECKS.map((c) => c.room))].map((r) => `<option>${r}</option>`).join("")}</select></label></form>
        <div id="h-checks"></div>
      </div>
    </section>
  `;

  const stat = (k, v, tone) => h("div.h-stat" + (tone ? "." + tone : ""), null, h("small", null, k), h("b", null, v));
  /* one project card (Renovations and the room view): room, title, progress, tasks, status, the Records link */
  function projectCard(p, full) {
    const D = window.HEARTH.data(), rm = D.rooms.find((r) => r.id === p.room), pct = progressOf(p), phaseItemId = "phase-" + p.id;
    const gate = typeof p.id === "number" ? phaseGateStatus(p.id) : null, isDeck = +p.id === 1;
    const tasks = p.tasks || [];
    const save = (patch) => { S.set("phases", S.get("phases", SEED_PHASES).map((x) => (x.id === p.id ? { ...x, ...patch } : x))); paint(); };
    return h("div.phase-card.h-proj", { "data-phase-id": p.id },
      h("div.kv", { style: "border-bottom:none;padding:0 0 4px" },
        h("span", null, h("span.h-room-tag", null, rm ? `${rm.name} · ${floorOf(rm).name}` : "Whole house"), h("br"), h("b", null, p.title.replace(/^Phase \d+ · /, ""))),
        h("b.h-pct", null, pct + "%")),
      h("div.bar-mini", null, h("i", { style: `width:${pct}%` })),
      p.summary ? h("p.stat-s", { style: "margin:6px 0 8px" }, p.summary) : null,
      isDeck ? h("p.stat-s", null, `Progress counts the deck's ${DECK.stages.length} stages (the job book below).`) : null,
      !isDeck ? h("div.h-tasks", null,
        ...tasks.map((t) => h("label.h-task", null, h("input", { type: "checkbox", ...(t.done ? { checked: "" } : {}), onchange: (e) => save({ tasks: tasks.map((x) => (x.id === t.id ? { ...x, done: e.target.checked } : x)) }) }), " ", t.title)),
        full ? h("form.h-task-add", { onsubmit: (e) => { e.preventDefault(); const v = e.target.t.value.trim(); if (!v) return; save({ tasks: [...tasks, { id: "t" + Date.now().toString(36), title: v, done: false }], status: p.status === "not-started" ? "in-progress" : p.status }); } },
          h("input", { name: "t", maxlength: 120, placeholder: "Add a step (buy tile, demo, paint…)" }), h("button.btn.quiet.small", { type: "submit" }, "Add")) : null) : null,
      full ? h("div.row-actions", null,
        h("select", { "aria-label": `Status for ${p.title}`, onchange: (e) => save({ status: e.target.value }) },
          ...["not-started", "in-progress", "completed"].map((st) => h("option", { value: st, ...(p.status === st ? { selected: "" } : {}) }, st.replace("-", " ")))),
        gate ? h("span.pill." + (gate.ready ? "gate-ok" : "gate-hold"), null, gate.ready ? "Ready to start" : "Before starting: " + gate.missing.join(" · ")) : null,
        p.budget ? h("span.pill", null, `budget ${usd(p.budget)}`) : null, p.due ? h("span.pill", null, `target ${p.due}`) : null,
        h("button.btn.quiet.small", { type: "button", "data-action": "link-records", "data-item-id": phaseItemId,
          onclick: () => ensureRecordAndLink({ itemId: phaseItemId, itemTitle: p.title, docTitle: `Warranty / Permit · ${p.title}`, category: "home", where: `Hearth · ${rm ? rm.name : "house"}`, notes: p.summary || "" }) }, "Link warranty / permit in Records")) : null,
      full ? renderRecordBadges(phaseItemId, String(p.id)) : null);
  }
  function assetRow(x) {
    const D = window.HEARTH.data(), rm = D.rooms.find((r) => r.id === x.room), left = x.warranty ? Math.round((new Date(x.warranty + "T12:00:00") - new Date(day() + "T12:00:00")) / 864e5) : null;
    const v = assetValue(x);
    return h("div.kv.h-asset", { "data-asset": x.id },
      h("span", null, h("b", null, x.name), h("div.stat-s", null, [x.kind || x.category, rm ? rm.name : "", x.model, x.serial ? "SN " + x.serial : "", x.purchased ? "bought " + x.purchased : "", x.receipt].filter(Boolean).join(" · "))),
      h("span.h-asset-side", null, h("b", null, v ? usd(v) : "—"), x.paid && x.value && +x.paid !== +x.value ? h("small", null, `paid ${usd(x.paid)}`) : null,
        left == null ? null : h("span.pill" + (left < 60 ? ".hot" : ""), null, left < 0 ? "warranty over" : `warranty ${left} d`),
        h("button.btn.quiet.small", { type: "button", "aria-label": "Edit the value of " + x.name, onclick: () => { const nv = prompt(`What is ${x.name} worth now ($)?`, x.value ?? x.paid ?? ""); if (nv === null) return; S.update("assets", x.id, { value: nv === "" ? null : +nv }); paint(); } }, "Value"),
        h("button.btn.quiet.small", { type: "button", "aria-label": "Remove " + x.name, onclick: () => { if (confirm("Remove " + x.name + "?")) { S.remove("assets", x.id); paint(); } } }, "×")));
  }
  function paintInspector() {   // the room you tapped: in the drawing, or a room card
    const el = $("#h-room-view"); if (!el) return;
    const rm = inspectedRoomId && roomList().find((r) => r.id === inspectedRoomId);
    if (!rm) { el.hidden = true; el.replaceChildren(); return; }
    const F = roomFacts(rm.id), fl = floorOf(rm); el.hidden = false;
    el.replaceChildren(h("article.glass.lit.h-room", null,
      h("div.h-room-head", null,
        h("div", null, h("p.kicker", null, fl.name), h("h2", null, rm.name), h("p.sub", null, [rm.w && rm.l ? `${rm.w} × ${rm.l} ft (${Math.round(rm.w * rm.l)} ft²)` : "not measured yet", rm.notes].filter(Boolean).join(" · "))),
        h("button.btn.quiet.small", { type: "button", onclick: () => { inspectedRoomId = null; paintInspector(); } }, "Close")),
      h("div.h-stats", null, stat("Renovation", F.pct == null ? "none planned" : F.pct + "%", F.pct === 100 ? "good" : ""), stat("Open steps", String(F.open)), stat("Items", String(F.assets.length)), stat("Contents worth", usd(F.value))),
      h("h3", null, "Projects"), F.projects.length ? h("div", null, ...F.projects.map((p) => projectCard(p, false))) : h("p.h-none", null, "No project in this room yet."),
      h("button.btn.quiet.small", { type: "button", onclick: () => { $("#t-phases").click(); const f = $("#h-proj"); f.room.value = rm.id; f.title.focus(); } }, "+ Add a project here"),
      h("h3", null, "What is in it"), F.assets.length ? h("div", null, ...F.assets.map(assetRow)) : h("p.h-none", null, "Nothing recorded yet: appliances, furniture, electronics, fixtures."),
      h("button.btn.quiet.small", { type: "button", onclick: () => { $("#t-inv").click(); const f = $("#h-asset"); f.room.value = rm.id; f.name.focus(); } }, "+ Add an item here")));
    try { el.scrollIntoView({ block: "start", behavior: "smooth" }); } catch (_) { /* old browser */ }
  }
  /* the House tab: totals and every floor's rooms */
  function paintHouse() {
    const f = houseFacts(), box = $("#h-totals"), fl = $("#h-floors"); if (!box || !fl) return;
    box.replaceChildren(h("p.kicker", null, "The house"), h("div.h-stats", null,
      stat("Renovation done", f.pct + "%", f.pct === 100 ? "good" : ""), stat("Open steps", String(f.open)), stat("Items recorded", String(f.items)), stat("Contents worth", usd(f.value))),
      h("p.sub", null, f.soon.length ? "Next warranty to end: " + f.soon.map((w) => `${w.name} (${w.until})`).join(", ") + "." : "Tap a room in the drawing or below to see its projects and what is in it."));
    fl.replaceChildren(...FLOORS.map((F) => {
      const rooms = roomList().filter((r) => +r.floor === F.n);
      return h("section.glass.h-floor", { "data-floor": F.id }, h("div.h-floor-head", null, h("h2", null, F.name), h("span.stat-s", null, F.sub)),
        h("div.h-room-grid", null, ...rooms.map((r) => {
          const R = roomFacts(r.id);
          return h("button.h-room-card" + (r.type === "outdoor" ? ".outdoor" : "") + (inspectedRoomId === r.id ? ".on" : ""), { type: "button", "data-room": r.id, onclick: () => window.HEARTH.inspectRoom(r.id) },
            h("b", null, r.name), h("span.h-room-meta", null, `${R.assets.length} item${R.assets.length === 1 ? "" : "s"}${R.value ? " · " + usd(R.value) : ""}`),
            h("span.bar-mini", null, h("i", { style: `width:${R.pct || 0}%` })), h("span.h-room-pct", null, R.pct == null ? "no work planned" : `${R.pct}% renovated · ${R.projects.length} project${R.projects.length === 1 ? "" : "s"}`));
        })));
    }));
  }
  function paintInventory() {
    const top = $("#h-inv-top"), list = $("#h-assets"); if (!top || !list) return;
    const all = S.list("assets"), rooms = roomList(), selR = $("#h-inv-room"), selK = $("#h-inv-kind");
    const nOpt = selR.querySelectorAll ? selR.querySelectorAll("option").length : 0;
    if (nOpt !== rooms.length + 1) { const keep = selR.value; selR.replaceChildren(h("option", { value: "all" }, "All rooms"), ...rooms.map((r) => h("option", { value: r.id }, `${r.name} (${floorOf(r).name})`))); selR.value = keep || "all"; }
    const rv = selR.value || "all", kv = selK.value || "all";
    const vis = all.filter((a) => (rv === "all" || a.room === rv) && (kv === "all" || (a.kind || "other") === kv));
    const total = all.reduce((s, a) => s + assetValue(a), 0), paidT = all.reduce((s, a) => s + (+a.paid || 0), 0);
    const byKind = {}; for (const a of all) byKind[a.kind || "other"] = (byKind[a.kind || "other"] || 0) + assetValue(a);
    top.replaceChildren(h("p.kicker", null, "Inventory"), h("div.h-stats", null, stat("Items", String(all.length)), stat("Worth now", usd(total)), stat("Paid", usd(paidT)), stat("Rooms with items", String(new Set(all.map((a) => a.room)).size) + " of " + rooms.length)),
      Object.keys(byKind).length ? h("p.sub", null, Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${usd(v)}`).join(" · ")) : h("p.sub", null, "Record what is in each room: it totals for insurance (Aegis) and shows beside net worth in Midas."));
    const groups = rooms.map((r) => ({ r, items: vis.filter((a) => a.room === r.id) })).filter((g) => g.items.length);
    const loose = vis.filter((a) => !rooms.some((r) => r.id === a.room));
    list.replaceChildren(...(vis.length ? [...groups.map((g) => h("div.h-inv-group", null, h("h3", null, `${g.r.name} `, h("small", null, `${floorOf(g.r).name} · ${usd(g.items.reduce((s, a) => s + assetValue(a), 0))}`)), ...g.items.map(assetRow))),
      ...(loose.length ? [h("div.h-inv-group", null, h("h3", null, "No room"), ...loose.map(assetRow))] : [])] : [h("p.empty", null, "No items recorded yet.")]));
  }

  function paint() {
    const D = window.HEARTH.data();
    const roomName = (id) => (D.rooms.find((r) => r.id === id) || {}).name || "Whole house";
    paintInspector();

    // 0. The job plate: one ruled register line over the job book, read live from the same data
    const gatesClear = D.phases.filter((p) => phaseGateStatus(p.id).ready).length;
    const deckDoneN = DECK.stages.filter((s) => (D.deck[s.id] || {}).done).length;
    const openReqN = D.requests.filter((r) => r.status !== "resolved").length;
    $("#h-plate").textContent = `${D.phases.length} PROJECT${D.phases.length === 1 ? "" : "S"} IN ${new Set(D.phases.map((p) => p.room)).size} ROOMS · ${D.phases.filter((p) => progressOf(p) === 100).length} DONE · DECK ${deckDoneN} / ${DECK.stages.length} STAGES · ${openReqN} FIELD REQUEST${openReqN === 1 ? "" : "S"} OPEN`;

    // 1. Projects, room by room (the deck refurbish is project 1)
    paintHouse(); paintInventory(); publishSummary();
    const phBox = $("#h-phases-list");
    phBox.replaceChildren(...D.phases.slice().sort((a, b) => (floorOf(D.rooms.find((r) => r.id === b.room) || {}).n - floorOf(D.rooms.find((r) => r.id === a.room) || {}).n) || 0).map((p) => projectCard(p, true)));

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

    /* HEA-GEM-16 (2026-11-17): the TimberTech/Trex/IRC spec table (window.HEARTH_SPECS,
       specs.js) — searchable by part, product, or spec text; source PDFs linked. */
    const specBox = $("#h-specs");
    if (specBox && window.HEARTH_SPECS) {
      const q = (window.__hearthSpecQ || "").toLowerCase();
      const rows = window.HEARTH_SPECS.filter((r) => !q || (r.part + " " + r.product + " " + r.spec).toLowerCase().includes(q));
      specBox.replaceChildren(
        h("div", { style: "padding:10px 0 4px" },
          h("div.kv", null, h("b", null, "Deck Spec Library (TimberTech / Trex / IRC)"), h("span.stat-s", null, `${rows.length} / ${window.HEARTH_SPECS.length} specs`)),
          h("label.f", { style: "display:block;margin:6px 0" }, "Filter ", Object.assign(h("input", { type: "search", placeholder: "fastener, flashing, joist…", value: window.__hearthSpecQ || "" }), {})),
          ...rows.map((r) => h("div.kv", null,
            h("span", null, h("b", null, `${r.value} ${r.unit}`), ` — ${esc(r.spec)} `, h("span.stat-s", null, `${r.part} · ${esc(r.product)} · ${esc(r.page)}`), r.flag ? h("span.pill warn", null, " unverified") : null, r.corrected ? h("span.pill", null, " corrected") : null),
            h("a", { href: r.url, target: "_blank", rel: "noopener", class: "stat-s" }, "guide ↗")))
        )
      );
      const inp = specBox.querySelector("input[type=search]");
      if (inp) inp.oninput = () => { window.__hearthSpecQ = inp.value; paint(); const n = $("#h-specs input[type=search]"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } };
    }

    /* HEA-GEM-17 (2026-11-19): the Kern County permit check, run against this deck as Hearth records it (window.HEARTH_PERMITS,
       permits.js; Muse-checked 9/10). It tests the four-condition exemption and says what the guide does not cover. */
    const permitBox = $("#h-permit");
    if (permitBox && window.HEARTH_PERMITS) {
      const P = window.HEARTH_PERMITS, area = DECK.widthFt * DECK.depthFt;
      const conds = [
        { t: "Not over 200 sq ft", ok: area <= 200, why: `${DECK.widthFt} × ${DECK.depthFt} ft = ${area} sq ft` },
        { t: "Not more than 30 in above grade", ok: false, why: "a 2nd-floor deck" },
        { t: "Not attached to the house", ok: false, why: "first board sits on the house ledger" },
        { t: "Does not serve the required exit door", ok: null, why: "not recorded: is the deck door the house's required exit (R311.4)?" },
      ];
      const fails = conds.filter((c) => c.ok === false).length;
      const mark = (c) => h("span.pill" + (c.ok === true ? ".gate-ok" : c.ok === false ? ".fail" : ".gate-hold"), null, c.ok === true ? "meets" : c.ok === false ? "fails" : "unknown");
      const list = (arr) => h("ul", { style: "margin:4px 0 8px 18px;padding:0" }, ...arr.map((x) => h("li", { style: "margin:3px 0" }, x)));
      permitBox.replaceChildren(
        h("div", { style: "padding:12px 0 4px;border-top:1px solid var(--line);margin-top:10px" },
          h("div.kv", null, h("b", null, "Kern County permit check"), h("span.stat-s", null, P.exemption.cite)),
          h("p.sub", { style: "margin:4px 0 8px" }, P.exemption.rule),
          ...conds.map((c) => h("div.kv", null, h("span", null, h("b", null, c.t), h("br"), h("span.stat-s", null, c.why)), mark(c))),
          h("p", { style: "margin:10px 0 4px" }, h("b", null, fails ? `A new or rebuilt deck like this needs a permit: ${fails} of 4 exemption conditions fail.` : "This deck would be permit-exempt.")),
          h("p.stat-s", { style: "margin:0 0 8px" }, "Not in the guide: whether replacing boards and flashing on the existing frame counts as an ordinary repair. Ask Kern Building Inspection before the demo-and-repair stage."),
          h("details", null, h("summary", null, "The numbers an inspector checks"),
            ...P.numbers.map((n) => h("div.kv", null, h("span", null, h("b", null, n.k), h("br"), h("span.stat-s", null, n.cite + (n.note ? " · " + n.note : ""))), h("span", null, n.v)))),
          h("details", null, h("summary", null, "How to apply, fees and inspections"), list(P.apply), list(P.inspections)),
          h("details", null, h("summary", null, "Fire clearance by June 1"), h("p.sub", null, P.fire.rule + " ", h("a", { href: P.fire.url, target: "_blank", rel: "noopener" }, P.fire.cite + " ↗"))),
          h("details", null, h("summary", null, "Sources"), list(P.sources.map(([t, u]) => h("a", { href: u, target: "_blank", rel: "noopener" }, t + " ↗")))),
        )
      );
    }

    // 3. General projects + room dropdowns
    $("#h-projects").replaceChildren(...D.projects.sort((a, b) => String(b.start || "").localeCompare(String(a.start || ""))).map((p) =>
      h("div.kv", null,
        h("span", null, h("b", null, p.title), h("br"), h("span.stat-s", null, `${roomName(p.room)}${p.start ? " · from " + p.start : ""}${p.done ? " · done " + p.done : " · underway"}${p.cost ? " · " + usd(p.cost) : ""}`)),
        p.done ? null : h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("projects", p.id, { done: day() }); paint(); } }, "Done today")
      )
    ));
    const roomOpts = () => [h("option", { value: "" }, "Whole house"), ...FLOORS.flatMap((F) => D.rooms.filter((r) => +r.floor === F.n).map((r) => h("option", { value: r.id }, `${r.name} (${F.name})`)))];
    for (const sel of [$("#h-proj").room, $("#h-asset").room, $("#h-req-form").room]) { const keep = sel.value; sel.replaceChildren(...roomOpts()); if (keep) sel.value = keep; }   // a room picked from the room view survives the repaint

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

    /* HEA-GEM-16 basis sync (2026-11-17): write the cumulative capital-improvement
       materials total into Records' doc register (localStorage prometheus.records.docs)
       as one upserted property doc — Records' retention rules treat property-basis
       records as permanent. §H: no labor estimates are folded in; materials only. */
    const basisBtn = $("#h-basis-btn");
    if (basisBtn) basisBtn.onclick = () => {
      const total = Math.round(plannedTotal * 100) / 100;
      let docs = [];
      try { docs = JSON.parse(localStorage.getItem("prometheus.records.docs") || "[]"); } catch (_) { docs = []; }
      const rec = { id: "hearth-basis", title: "Capital improvements — Hearth BOM materials total (property basis)", category: "property", issuer: "Prometheus Hearth", serial: "", date: day(), due: "", where: "Hearth BOM", notes: `Cumulative planned materials total $${total.toFixed(2)} across ${allMats.length} BOM lines, synced from Hearth. Materials only — no labor. Keep permanently (property basis).` };
      const i = docs.findIndex((d) => d.id === "hearth-basis");
      if (i >= 0) docs[i] = { ...docs[i], ...rec }; else docs.push(rec);
      try { localStorage.setItem("prometheus.records.docs", JSON.stringify(docs)); toast(`Capital basis synced to Records: ${usd(total)}`); }
      catch (_) { toast("Records store unavailable in this browser"); }
    };

    const mb = $("#h-mats-body");
    mb.replaceChildren(...visMats.map((m) => {
      const lineTotal = (m.qty != null && m.unitCost != null) ? usd(m.qty * m.unitCost) : "—";
      return h("tr.st-" + (m.status || "planned"), { "data-material-id": m.id },
        h("td", null, h("span.badge-phase", null, `P${m.phase}`)),
        h("td", null,
          h("b", null, m.name), " ", h("span.meta", null, `(${m.unit})`),
          renderRecordBadges(String(m.id))
        ),
        h("td", null, m.category),
        h("td.n", null, m.qty ?? "—"),
        h("td.n", null, m.unitCost != null ? "$" + Number(m.unitCost).toFixed(2) : "—"),
        h("td.n", null, lineTotal),
        h("td", null, h("span.h-status", null, m.status)),
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
                const prevPaid = +m.actualPaid || 0;
                const newPaid = aStr.trim() === "" ? null : +aStr;
                S.update("materials", m.id, {
                  qty: qStr.trim() === "" ? null : +qStr,
                  unitCost: cStr.trim() === "" ? null : +cStr,
                  actualPaid: newPaid,
                  status: aStr.trim() !== "" ? "purchased" : (cStr.trim() !== "" ? "quoted" : "planned"),
                });
                /* HEA-GEM-16 §F.3: purchases post to the shared money bus by DELTA so
                   re-editing a receipt never double-posts (amount is negative = money out). */
                if (window.PB && newPaid != null && newPaid !== prevPaid) {
                  try { PB.money.publish({ kind: "expense", amount: -(newPaid - prevPaid), date: day(), source: "hearth", label: m.name, ref: "hearth-mat-" + m.id + "-" + Date.now() }); } catch (_) {}
                }
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
          h("b", null, r.name), " ",
          r.notes ? h("span.h-tag", null, r.notes) : null,
          h("div.stat-s", null, `${r.type} · ${floorOf(r).name}${r.w && r.l ? ` · ${r.w} × ${r.l} ft (${Math.round(r.w * r.l)} ft²)` : " · unmeasured"} · ${a} item${a === 1 ? "" : "s"} · ${p} project${p === 1 ? "" : "s"}`)
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
            "aria-label": "Remove " + r.name,
          }, "×")
        )
      );
    }) : [h("p.empty", null, "No rooms yet.")]));

    // 7. the mountain community Seasonal Maintenance
    const maints = S.get("maint", SEASONAL_MAINT);
    $("#h-maint").replaceChildren(...maints.map((m) =>
      h("div.kv", null,
        h("span.h-date", null,
          h("span.h-date-d", null, String(Number(m.date.slice(8, 10)))),
          h("span.h-date-m", null, MON[Number(m.date.slice(5, 7)) - 1] || "")
        ),
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
          h("div.stat-s", null, h("span.h-chkid", null, c.id), ` · ${c.phase} · ${c.trade} · ${c.check} `, c.url ? h("a", { href: c.url, target: "_blank", rel: "noopener" }, c.cite || "source") : (c.cite || ""))
        )
      )
    ));
  }

  $("#h-ctype").addEventListener("change", paint);
  $("#h-inv-room").addEventListener("change", paint);
  $("#h-inv-kind").addEventListener("change", paint);
  $("#h-mat-phase").addEventListener("change", paint);
  $("#h-mat-cat").addEventListener("change", paint);

  $("#h-proj").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target, all = S.get("phases", SEED_PHASES);
    all.push({ id: "p" + Date.now().toString(36), title: f.title.value.trim(), room: f.room.value, status: "not-started", summary: "", tasks: [], budget: +f.budget.value || null, due: f.due.value || "" });
    S.set("phases", all);
    if (window.PB && f.due.value) PB.deadlines.publish({ title: "Hearth: " + f.title.value.trim(), date: f.due.value, source: "hearth", kind: "project", ref: all[all.length - 1].id });
    f.reset(); toast("Project added: add its steps on the card"); paint();
  });
  $("#h-req-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("requests", { title: f.title.value.trim(), phase: +f.phase.value, room: f.room.value, logged: day(), status: "open", answer: "" });
    f.reset(); toast("Field request logged"); paint();
  });
  $("#h-room").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("rooms", { name: f.name.value.trim(), type: f.type.value, floor: f.floor.value === "" ? 1 : +f.floor.value, w: +f.w.value || null, l: +f.l.value || null, notes: "" });
    f.reset(); toast("Room added"); paint();
  });
  $("#h-asset").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    const num = (v) => (v === "" ? null : +v);
    const a = S.add("assets", { name: f.name.value.trim(), kind: f.kind.value, category: f.category.value, room: f.room.value, model: f.model.value.trim(), serial: f.serial.value.trim(), purchased: f.purchased.value, paid: num(f.paid.value), value: num(f.value.value), warranty: f.warranty.value, receipt: f.receipt.value.trim() });
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
