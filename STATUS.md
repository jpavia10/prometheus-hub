<!-- doc-status: current; normative: no -->
# Prometheus: status

What is on the live deck and what is not. A capability is on the deck only when its proof passes in a real browser
(`python3 proofs/run.py <url>`; unit proofs `node --test proofs/unit/*.test.mjs`). Results of the last run: `proofs/results.json`.

Build **d13** · 2026-11-13 · live at https://jpavia10.github.io/prometheus-hub/

**Iteration 1 Overhaul (d13, 2026-11-13):**
- **Unified Registry, Manifests & Two-Way Bus Sync:** All 27 pillars unified across `deck/pillars.js` and `pillars.json` (25 in-repo `pillars/*/pillar.json` manifests + 2 protected external sites `titan-reliquary` & `fleet-command`); `sw.js` bumped to `d13`; `reach.backupAll()` captures IndexedDB metadata; two-way sync across Money & Time hub views and Kairos/Money pillars; Athenaeum -> Pillar idea handoff routing (`sessionStorage["prometheus.handoff"]`) into Foundry, Forge, Observatory, Hearth, Bastion, and Kin.
- **GPU & Motion Overhaul:** `deck/core/atmo.js` frame-paced atmospheric WebGL canvas; responsive 3D Orrery + Away-Mode card reordering (`deck/views/orrery.js`, `deck/views/picture.js`); cursor-tracked specular glass lighting (`deck/deck.css`, `kit/prometheus.css`, `kit/stage.js`).
- **5 Core Pillars Reconstructed:** **Argus** (64-bit dHash duplicate clustering, 20-rule coin QC, Obverse/Reverse pairing, Hearth split slider, IDB meta mirror), **Apollo** (macro portion scaling, weight-scaled MET burn, 40-biomarker table), **Icarus** (tabs inside `#app`, unified journal storage, 30 live `RULE_CHECKS`, 135-cell Risk-of-Ruin matrix, 34-event `ICARUS_MARKET_DAYS` calendar), **Hermes** (15%+ bill-jump alert, Pay->`PB.money`, Opt-out->`privacy.intake`, local 97-biller/23-lure classifier + 80-message benchmark), **Hearth** (Drive Renovation Tracker seed: 11 rooms, 5 phase-gated stages, 13 SKUs, `req-01..05` field verification, Planned vs Actual ledger, Frazier Park deadlines).
- **4 New First-Class Pillars Built:** **Aether** (`pillars/aether/`, Hue 134: Frazier Park solar ephemeris, portable power-station Wh autonomy & PSPS outage log), **Polis** (`pillars/polis/`, Hue 228: Kern/CA civic directory, ordinances, CSLB/DROP watchlist & ballot notes), **Mythos** (`pillars/mythos/`, Hue 304: worldbuilding canon, 5-act story beats, guitar/lyric/motif notebook & Sylade lore), **Continuity** (`pillars/continuity/`, Hue 84: client-side WebCrypto `PBKDF2-SHA256` 250k iter + `AES-256-GCM` Sovereign Vault with zero plaintext persistence + non-secret emergency binder checklist).
- **d13 Verification:** `node --check` passed across all 119 repo JS files (`0` failures); Python JSON parser validated all 56 JSON files (25 `pillar.json` manifests); `node --test proofs/unit/*.test.mjs` passed `26/26`; headless Chromium CDP verification passed `30/30` routes (`0` JS/runtime exceptions, `0` internal 404s, `<= 390px` mobile width across all 30 routes, `PK.stage` + `>= 3` readouts verified, live Continuity WebCrypto round-trip + wrong-passphrase rejection + Athenaeum->Foundry handoff + Hearth dataset verified). (`proofs/run.py` not executed directly because Python `playwright` package is absent in this environment.)

**d7: Athenaeum rebuilt as the first pillar under the charter** (`docs/pillars/athenaeum/BRIEF.md`). Proofs ATH-1 to ATH-7 and CORE-5 pass.
It has **not** had the independent review the charter requires and has never run on a real phone, so it is built and proven, not accepted.

**The charter (`docs/CHARTER.md`, owner, 2026-11-12) now governs.** Its first deliverable is done:
`docs/assessment/2026-11-13-transformation-assessment.md`. By the charter's own scoring the hub core is about 65 of 100 and the default
pillar about 54 (self-assessed; an independent review has not happened), both under its 70 line: "DONE" below means "the proof
passes", not "meets the charter". d6 adds no features: it fixes a chart error the d2 theme caused on the Money page and adds the
proof that would have caught it. Not verified anywhere: a real phone, a screen reader, a pillar holding months of data.

Owner, 2026-11-12: "Instead of making a demo you should have transformed what I have with the available data. Again you strip away my
pillars ... The over the top futuristic dopamine loaded theme and transitions are what im seeking ... bring the project together and
we can develop them one by one later." Build d2 is that correction: the hub is the shell that holds every pillar; the pillars keep
their pages and get developed one at a time.

## The hub

| Part | Verdict | Proof |
|---|---|---|
| The core | DONE | Since d3 a live orrery (owner: "advanced motion and gui not a 1990s basic shit"): the 18 pillars orbit a shader-drawn fire in 3D; a sideways drag spins the system with inertia and it settles on the nearest pillar; tapping a pillar swings it to the front and warps in; one switch morphs orbit to hex grid; panels below tilt into place with the scroll. CORE-1: all 18 present, no sample data on a clean device. CORE-4: a tap lands in the pillar. Hold a pillar for its brief. Boot once a session; sound behind one switch. |
| One theme everywhere | DONE | CORE-2: all 15 pillar pages in this repository answer and take the shared theme from `kit/prometheus.css` (each in its own colour), with an animated page change where the browser supports it. Titan, Midas and Hearth are on their own sites and keep their own look. |
| The default pillar shell | DONE | PILLAR-1 (owner on the Piano page: "its junk"): every kit pillar now gets, from `kit/kit.js` and `kit/prometheus.css` alone, a crest (its hub cell), sections made from its own panels with a light that slides between tabs, a dock (previous pillar, the core, next pillar), designed rows, buttons, fields and empty states. Piano went from 6,672 px of stacked cards to one section at a time. No pillar's own code changed. |
| Every pillar page runs clean | DONE | PILLAR-2 (d6): all 15 pillar pages opened in a real browser, every section tapped (47), no script error. It fails on the d5 code (Money: the chart could not use the theme's colour format). |
| Since you were here, one backup | DONE | SINCE-1, BACKUP-1 (d12). |
| Hearth inside the hub | DONE | d11: `pillars/hearth/` replaces the separate site on the hub; deck progress carries over (same storage). STAGE-1 (18), PILLAR-2 (21 pages). |
| Four new pillars: Forge, Foundry, Observatory, Kin | DONE | NEW-1 (d10): Forge reads Titan's 168 scored submissions and 43 queue tasks; Foundry starts a build from an Athenaeum invention and leaves Athenaeum untouched; Kin's custody patterns land on the right days. Observatory's headline scan needs the public Hacker News search, which the build machine cannot reach: untested end to end. |
| Every pillar's signature picture | DONE | STAGE-1 (d9): all 13 kit pillars open on their own live centrepiece drawn from their records and shipped reference data, with three readouts each, under the same sections as before. Not tried on a real phone. |
| Athenaeum | BUILT, NOT REVIEWED | ATH-1..7: the 11 kept ideas as stars in 3D with four constellations found from their own tags and words; an idea opens whole with lineage, provenance and reasons for each connection; capture and append-only refinement leave every other record byte-identical; the time slider shows the sky on a past day; the 40 history entries as cause, event, consequence with sources; export, wipe, import restores to the byte, with a preview first; search, resurfacing, archive with undo and the shelf all still work. |
| The hub reaches into a pillar | DONE (one pillar) | CORE-5: through Athenaeum's manifest the command key finds an idea by title or text and opens it, "idea: ..." hands the words to the pillar without writing its records, and the ticker shows the pillar's latest event. |
| Real data on the hub | DONE | CORE-3: a deadline any pillar publishes to the shared bus shows in the hub's feed and as a badge on that pillar's cell. Cells also show how much each pillar holds on this device; Titan's cell and tile read its published ledger. Fixed dates: the 58 researched ones. |
| Day ring, runway, countdowns, storm watch | DONE | DECK-1. They read the one feed (the bus, the fixed dates, the consoles below). |
| Kairos console, Payoff console | DONE | TIME-1..3, MONEY-1..2. New consoles built in d1; reachable from the hub's instruments and search. They do not replace the Kairos and Money pillar pages, which are back at their addresses. |
| System | DONE | DATA-1. |

## The pillars (each keeps its own page; none was rebuilt in d2)

Kairos Meridian, Midas Ledger, Titan Reliquary, Hephaestus Hearth, Garage, Apollo Temple, Money · payoff simulator, Selling Pipeline,
Records, Icarus Stake, Hermes Post, Bossa Piano Studio, Bastion, Athenaeum, Odyssey, Privacy, Argus Album, Sylade.
They are still mostly forms waiting for data; that is the next phase, one pillar at a time, in the owner's order.

## Known gaps in what is live

- Tested in a desktop browser at phone size only. Not yet tried on the owner's phone.
- Sound is synthesized interface sound only (ticks, the boot, the warp); no music or recordings.
- Two things answer to "time" and to "payoff" right now (the pillar page and the new console). Which one each pillar becomes is the owner's call when that pillar is developed.
- The hub shows what is on the device and what the pillars publish; it ships no sample data on the first screen (a sample deck exists only for the proofs and under System).
- `Gemini STATUS_CLEAN_SLATE_v2` marked everything DONE. That file is wrong and its package is not deployed.
