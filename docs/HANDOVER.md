<!-- doc-status: current; normative: yes -->
# Handover to the next agent (written 2026-11-13 by Claude, at the end of its usage)

You are taking over as lead engineer and designer for Joseph's Prometheus (this repository) and Titan Reliquary. Read in this order:
1. `docs/CHARTER.md` (the owner's charter, normative; its section 16 protections are absolute).
2. `CLAUDE.md` here ("The charter governs" and "Where things stand").
3. `docs/assessment/2026-11-13-transformation-assessment.md` (what exists, gaps, roadmap).
4. `docs/pillars/athenaeum/BRIEF.md` and `docs/architecture/MANIFEST.md` (the one pillar rebuilt so far and the shared pieces it uses).

## State
- **d9: every kit pillar opens on its own signature picture** (`kit/stage.js` engine + `pillars/<id>/stage.js`, proof STAGE-1). Sylade still on the old desk styles.
- **Live build d9 (was d8)** (`BUILD` in `deck/app.js`); Athenaeum holds the owner's 70 ideas (seed `ideasSeedV3`, pushed from his account 2026-11-13), main = `claude/deck`. 22 browser proofs and 26 unit proofs pass, also against the live site.
- **Athenaeum** (`pillars/athenaeum/`) is rebuilt: a WebGL 3D sky of the owner's ideas, codex, time replay, chronicle, index, shelf, backup.
  Built and proven, **not accepted**: the charter's independent review never ran (the reviewer agent hit a usage limit before reporting).
- **Titan is paused by the owner** ("leave it for now ... frustrated by your titan work overall"). Do not continue its new front (`next.html`) or
  change the app until he says. Fleet stays paused. Midas internals, Sylade's scope and Icarus's limits: see the charter.

## What the owner wants, in his words
- "The over the top futuristic dopamine loaded theme and transitions"; "advanced motion and gui not a 1990s basic shit".
- "you strip away my pillars so its irrelevant": never hide, drop or thin out a pillar or a feature. Real data only, no demo screens.
- "Continue with whatever but 70 is low i want over 100 beyond limits."
- One pillar at a time ("Don't let Fable interpret this as permission to start rebuilding 18 pillars at once").
- He reads on his phone. Lead with what he can open; keep messages short and plain.
- Privacy: he will make this repository private later; still add no new personal details. Note: Pages on a private repository
  needs a paid GitHub plan (stated from memory, unverified): tell him before he switches.

## Do next, in order
1. **Run the independent review of Athenaeum** with a second agent, blind, scoring with the charter's section 12 table; have it drive
   the page (phone 390x844 and desktop, live and `?still=1`), check data integrity, read the code, and list defects. Fix what it finds,
   then record the score in `docs/pillars/athenaeum/REVIEW.md` and say so in `STATUS.md`.
2. Ask the owner how Athenaeum feels on his phone (nothing has ever run on a real device; smoothness is unmeasured) and act on it.
3. Add evidence screenshots (phone and desktop) to `docs/pillars/athenaeum/img/`.
4. Foundations still missing: one generated registry replacing `pillars.json`, `deck/pillars.js` and the list in `kit/kit.js`; one
   backup of everything (`PB.dumpAll`/`loadAll` exist in `kit/bus.js` but no screen calls them); manifests for the other pillars.
5. Next pillar only after the owner has seen Athenaeum. Follow the charter's process: three concepts, pick, build, independent review.

## Decisions still with the owner
- May the hub's Kairos and Payoff consoles become the Kairos and Money pillars (each exists twice today)?
- Forge (AI work pillar): it is what Fleet was, and Fleet is paused.
- Next pillar after Athenaeum (Piano was the alternative).

## How to work here
- Local: `cd /home/user/prometheus-hub && nohup python3 -m http.server 8377 >/dev/null 2>&1 &` (it dies when the worker restarts).
- Proofs: `python3 proofs/run.py http://localhost:8377/ --mock-weather --out proofs/results.json` and `node --test proofs/unit/*.test.mjs`.
  The test browser draws WebGL in software: slow, so judge motion from code and captured frames. Athenaeum test hooks: `?still=1`,
  `?today=YYYY-MM-DD`, `window.__ath`. Hub hooks: `?now=ISO`, `window.__deck`.
- Deploy: bump `BUILD` in `deck/app.js` and the cache name in `sw.js`; commit on `claude/deck`; merge `origin/main` into it; fast-forward
  `main`; push both; then update `DEPLOY_STAMP.txt` on `main` through the GitHub connector (fetch its current blob sha first), which
  starts the Pages build; confirm the `proofs-live` run for that commit succeeds before saying "live". Never force-push. No pull requests
  unless asked. Never print or commit tokens or API keys.
- Known open item: in the test browser the animated page change from the hub into a pillar is sometimes dropped (cause not found).
- After every change: a 2-3 line entry in `SHARED_LOG.md`, and keep `STATUS.md` honest (proved, built-not-reviewed, or not done).
