# Prometheus Hub: shared log

Newest first. Every contributor (Claude and every AI) adds a dated 2-3 line entry after a change.

### [2026-11-16] The home is a game menu (Claude), shell cache d27
- Owner, 2026-11-16: the project is a 1/100 (cheap, every pillar the same, empty, does not help the day); the target is a AAA game menu. New `deck/views/menu.js`: a full-screen world in the level's colour (WebGL, painted sky until art exists), the 27 pillars as levels (swipe, arrows, the level strip), each with its crest, what it is (its manifest's mission), and one live line (its next dated thing on the bus, Kairos' next date, or its first command), Today on top, Enter warps in. The orbit is one tap away (Orbit / Menu, `?home=orbit|menu` pins it) and the whole briefing is right below. Nothing removed.
- Art: `docs/art/requests/artreq_20261116-0300_prometheus-worlds.json` (28 worlds: home + 27, portrait with depth and light layers) is in the Drive art queue for Gemini; `art/worlds/index.json` lists the worlds that have landed, and the menu layers them live (depth parallax, light, dust) when they do. Proof MENU-1 added; the orbit proofs pin `home=orbit`. Browser proofs 27/27.

### [2026-11-16] Phone fixes on the core (Claude), shell cache d26
- The passcode chip sat on the dock's Money and System buttons on every tab: the passcode now lives in System (set, lock now, turn off; setup has "Not now"). The top bar no longer runs off a 390 px screen (titles shrink, the demo chip reads "Demo"). The outer orbit rings pulled in on phones: no hex past the edge at 360, 390 or 430 px (was up to 6 px).
- Checks: registry OK, unit 62/62, money guard OK, browser proofs 26/26 (one earlier run had PILLAR-1 fail on Piano's section tap, then pass: an intermittent tap, queued as AGY-017).

### [2026-11-16] Intake: Grok's three second-reader checks (Claude)
- Grok's Nov 14 checks of Gemini's specs are filed: `pillars/{hermes,icarus,hearth}/research/`, tasks HER-GRK-01, ICA-GRK-01 and HEA-GRK-01 marked done with a review note, and the first score rows in those pillars' `collaborators/CONTRIBUTOR_SCORES.md`. Accepted and accurate stay pending until Claude spot-checks the "differ" lines, because the vendor hosts are blocked from the build session.
- `tools/kit/render.py` now renders Hearth's homework from `pillars/hearth/` (it was still reading the old hephaestus-hearth repo). The money guard lists the two research folders as public vendor-price references.

### [2026-11-14] Event envelope and device location
- Every bus event carries `{type, pillar, at, v}`, and older rows are migrated without changing a backup's bytes. All 25 local manifests declare records, commands, and events (`25/25 complete`). Bastion and Aether read the storm-sheet place and do not fetch when it is empty. The readiness file is `readiness.json`. Athenaeum personal titles, including the early-illness title, are example titles. Shell cache d21.

### [2026-11-14] Pre-merge checks and shipped defaults
- Checks run before a merge, the money guard rejects a planted amount in a view, and the hub no longer ships a town, an elevation, a vehicle model, or a collection total. Games and Athenaeum notes are examples. Cache d20. The live proofs-live quote is still run 43575963969.

### [2026-11-14] Build d19: cool hub chrome
- The core is pearl and cyan with a lavender halo. Primary buttons and the dock + are pearl glass with a cyan edge. Amber is gone from the hub chrome tokens. The app icon is the pearl flame. Shell cache d19.

### [2026-11-14] Proofs quote the live run
- CORE-1 reads its pillar count from `pillars.json`. The backup proof matches the stores `backupAll` covers and the refusal it actually throws. Hub search `idea:` opens Athenaeum with the words filled in, and proofs-live writes that run into `STATUS.md`, failures included.

### [2026-11-14] Privacy: home payoff quote removed
- The home payoff card shows only whether a plan is locked on this device, plus the progress ring, with no dollar amounts and no activate control. Money opens on an empty form next to a research worked example. The 30-day bus sales slot shows a count. Shell cache d18.

### [2026-11-10] Grok: home desk HUD instruments
- The session tile draws a thin ring and a live open/close countdown from the existing NYSE calendar. Next dates and car/home dates carry a days-out pill. The header greets Joseph in Pacific time, and module status uses soft cyan and lavender marks. Shell cache v14.

### [2026-11-10] Grok: command deck polish
- Search on the home desk opens with / or Ctrl/Cmd+K, closes with Esc, and moves with the arrow keys and Enter. Results include modules and their pages, with a plain empty state. Visible copy says modules. Shell cache v13.

### [2026-11-10] Grok: command deck on the home page
- Rebuilt the home desk around search, next dates, the NYSE session, car and home dates, since-you-were-away, and module status. Food and exercise stay in Apollo. Public card terms are search results. Outfit and the kit stay first. Shell cache v12.

### [2026-11-09] Sebastian (acting integrator, for Claude): non-Titan homework merge
- Verified Gemini's reconciliation of all 48 non-Titan drops against the originals (row counts on every dataset; Muse's five drops verbatim), then closed 53 tasks across the eight queues and re-rendered the board: Gemini and Muse show zero open in Midas, Hearth, Apollo, Hermes, Kairos, Icarus and Argus.
- Three manifest counts understate their drops (Hermes operators 67 not 42; Icarus market days 68 not 60; Kairos dates 58 not 57); the drops are complete and stand as the source of truth. Numeric scoring deferred to Claude — verification notes ride with the merge packet on Drive.

### [2026-11-05] Claude: the Prometheus layout
- This pillar got the standard files (AI_START_HERE, CLAUDE, homework in docs/agents/, this log, the scorecard) and its Drive folder `Prometheus Hub/Pillars/Prometheus Hub/`. Homework for every AI is in docs/agents/QUEUE_*.md.
