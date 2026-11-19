/* Foundry build states (Sebastian, 2026-11-14): every invention on the drawing board, given a real build state.
   Method: each of the 11 invention-tagged Athenaeum ideas was cross-checked on 2026-11-14 against the hub itself
   (all 25 local pillars in pillars.json) and Sebastian's shipped history (MEMORY.md — Titan, the hub, Fleet
   Command, Midas, the sell-off). Result, stated plainly: none of the 11 has been built — no pillar, product,
   prototype, or active project corresponds to any of them — so every state is "concept", and each record cites
   what was checked. Where a partial overlap exists (Apollo's tracking for the health manager; the Titan
   pipeline's independent-verification practice for the compute architecture), the record says exactly what is
   real and what is not. This file is reference data: it never writes to the projects store, and starting a
   build from the board works exactly as before. Records match board ideas by shipped id, then by title
   (altTitle carries the Athenaeum seed's shortened title where it differs from the canon). */
window.FOUNDRY_BUILD_STATES = [
 {
  "id": "imp20261113-23",
  "title": "Modular self-expanding conveyor system on trailers",
  "state": "concept",
  "evidence": "No build exists. Checked 2026-11-14 against all 25 hub pillars and the shipped history in MEMORY.md: nothing corresponds. Its only record is this May 2025 Athenaeum thread."
 },
 {
  "id": "imp20261113-24",
  "title": "Automated ocean-cleanup freighter with drone collectors",
  "state": "concept",
  "evidence": "No build exists (checked against the hub's 25 pillars and MEMORY.md, 2026-11-14). His own words in the thread: a long-held dream he would 'prefer to not fight that battle' to lead."
 },
 {
  "id": "imp20261113-33",
  "title": "Paid idle-device compute network",
  "state": "concept",
  "evidence": "Never built: no pillar, product, or project in the hub or in MEMORY.md's shipped history runs a paid device-compute network (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-38",
  "title": "Atmospheric alchemy — self-replicating nanobots with a CO2-ratio kill switch",
  "state": "concept",
  "evidence": "Speculative by design — self-replicating nanobots are beyond any build recorded in the hub or MEMORY.md (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-41",
  "title": "Mach 20 airbase-sized aircraft with a plasma sheath",
  "state": "concept",
  "evidence": "A design-speculation thread from Sep 2024; no aircraft work exists anywhere in the hub or MEMORY.md (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-45",
  "title": "Engineered biology as factories — mycelium and insects",
  "state": "concept",
  "evidence": "No build exists: nothing among the hub's 25 pillars or MEMORY.md's shipped history corresponds (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-48",
  "title": "An AI health manager so persistent I can't ignore it",
  "state": "concept",
  "evidence": "The agent was never built. The hub's Apollo pillar covers health tracking only — logs and 7-day/30-day reviews; the persistent manager that acts on him does not exist, and MEMORY.md records that Joseph keeps health self-managed.",
  "altTitle": "An AI health manager persistent enough to keep"
 },
 {
  "id": "imp20261113-55",
  "title": "AI compute architecture: fragment distribution plus parallel redundant verification",
  "state": "concept",
  "evidence": "The architecture itself was never built. Its verification half is real fleet practice — the Titan pipeline runs independent AI reads with adjudication (MEMORY.md) — but no fragment-distribution compute system exists."
 },
 {
  "id": "imp20261113-58",
  "title": "Field-manipulation spacecraft and a solar array for deep-space mining",
  "state": "concept",
  "evidence": "Speculative propulsion thread; no build exists in the hub or MEMORY.md's shipped history (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-63",
  "title": "Double-dip farmland: infill pivot circles plus wind turbines in the corners",
  "state": "concept",
  "evidence": "No build exists: no farming operation, and nothing in the hub's 25 pillars or MEMORY.md corresponds (checked 2026-11-14)."
 },
 {
  "id": "imp20261113-69",
  "title": "Hyperfuturistic street sweeper, designed 10,000 years out",
  "state": "concept",
  "evidence": "By its own framing a design exercise '10,000 years out' with 'no starting capital'; no build exists (checked against the hub and MEMORY.md, 2026-11-14)."
 }
];
