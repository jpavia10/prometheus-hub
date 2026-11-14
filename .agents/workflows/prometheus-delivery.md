---
description: Repeatable 6-stage delivery workflow for Prometheus Hub upgrades (Argon orchestrates & reviews; Hydrogen implements, tests, screenshots & commits).
---

# Prometheus Delivery Workflow

Follow all rules in `AGENTS.md` and `docs/CHARTER.md`. Execute stages sequentially for every substantial feature or pillar upgrade:

## Stage 1 — Discovery & Baseline Check
1. Inspect git state (`git status -sb`, `git log -1`, remote sync with `origin/main`).
2. Read the target pillar's code, `pillars/<id>/pillar.json` manifest, `pillars.json` registry entry, and existing unit/CDP tests.
3. Confirm protected boundaries (`titan`, `midas`, `fleet`, `sylade`, `icarus`, `continuity`).

## Stage 2 — Concrete Specification
1. Select or create the task ID in `docs/antigravity/WORKBOARD.md`.
2. Define exact user-visible outcome, touched modules, storage keys / IndexedDB schema, event names (`PB.events`), search fields, and acceptance tests.

## Stage 3 — Implementation (Hydrogen)
1. Implement production code without placeholder stubs or duplicate logic.
2. Keep `pillars.json`, `deck/pillars.js`, `deck/core/reach.js`, and `pillars/<id>/pillar.json` synchronized.
3. Bump `BUILD` in `deck/app.js` and `CACHE` in `sw.js` when preparing a release build.

## Stage 4 — Automated Verification
1. Validate registry & manifests: `node tools/registry/validate.mjs`.
2. Run syntax & JSON checks across all `.js`, `.mjs`, `.json`, and `.webmanifest` files.
3. Run unit proofs: `node --test proofs/unit/*.test.mjs`.
4. Run headless browser CDP verification across all `30` routes (`1440x900` & `390x844`) plus interactive suites for the modified feature.

## Stage 5 — Visual Screenshot Evidence
1. Capture PNG screenshots via headless Chrome CDP (`1440x900` desktop and `390x844` mobile) under `artifacts/screenshots/<build>/`.
2. Inspect layout, hierarchy, overflow (`scrollWidth <= innerWidth`), contrast, and live canvas rendering.

## Stage 6 — Argon Review & Delivery Contract
1. Score major transformations against the 100-point Charter rubric (`docs/CHARTER.md` §12) and record findings (e.g., `docs/pillars/<id>/REVIEW.md`).
2. Update `DEPLOY_STAMP.txt`, `STATUS.md`, `SHARED_LOG.md`, and `docs/antigravity/WORKBOARD.md`.
3. Commit cleanly, verify `git status`, export archive if requested, push to remote when authenticated, and emit the structured Final Execution Contract report.
