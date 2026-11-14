<!-- doc-status: current; normative: yes -->
# Pillar manifests, the event log, the canonical registry, and unified backup

Architecture Stage 2 of `docs/CHARTER.md`. Initially started with Athenaeum, now active across **all `25` local pillars** (`MANIFESTS` in `deck/core/reach.js`) and validated automatically by `tools/registry/validate.mjs`.

## 1. Canonical Registry (`pillars.json`)
`pillars.json` (`schemaVersion: 4`) is the single authoritative list of the ecosystem:
- `25` active local pillars (`pillars/<id>/`)
- `2` active external protected pillars (`titan`, `midas`)
- `1` desktop Hub entry (`hub`)
- `1` paused entry (`fleet`, excluded from `deck/pillars.js` active destinations and `MANIFESTS`)

Run `node tools/registry/validate.mjs` to fail CI/checks on duplicate IDs, route collisions, missing HTML/manifest/stage files, active `fleet` leaks, or external pillar boundary violations.

## 2. Pillar Manifests (`pillars/<id>/pillar.json`)
Every local pillar ships a manifest (`manifest: 1`, `id`, `name`, `state`, `route`, `mission`, `signature`, `owns`, `publishes`, `search`, `commands`) read by `deck/core/reach.js`. The Hub reads declared `localStorage` keys strictly read-only without importing pillar code; every search result opens the authoritative record inside its own pillar.

## 3. Shared Event Log (`kit/bus.js` + `deck/core/reach.js`)
`PB.events.publish({ type, pillar, ref, title })` appends concise event pointers (max `400`, `{ v: 1, id, at, type, pillar, ref, title }`) without leaking private bodies, financial totals, or secret strings. `SAY` in `deck/core/reach.js` formats events across all active local pillars.

## 4. Whole-Device Backup & Restore (`deck/core/reach.js` + `kit/bus.js`)
- Covers all `prometheus.*`, `prometheus-hub.*`, `prom.deck.*`, and `hearth.*` `localStorage` keys **plus** Argus IndexedDB photo payloads (`prometheus-argus/photos`, preserved with `blobDataUrl` and metadata).
- Computes an integrity checksum (`integrity`), records a session rollback snapshot (`prometheus.backup.rollback`) before writing, never deletes keys absent from the backup file, and explicitly lists external protected sites in `excludedExternal: ["titan", "midas"]`.
