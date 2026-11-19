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

Each of the 25 local manifests also declares three arrays. A pillar is complete only when all three are present and well formed:

- `records`: the stored lists worth finding. Each entry is `{ key, kind, title }`. Every `search` key is listed here, and a pillar that `owns` storage keys declares at least one record. Sylade owns none, so its `records` array is empty on purpose.
- `commands`: actions the hub may offer. Each entry is `{ id, label, open }` (`open` may be `""`, `words` is optional). Every local pillar declares at least one. Sylade's command only opens the presence page.
- `events`: event types the pillar publishes. Each entry is `{ type, pillar }` and `pillar` is that manifest's `id`. Every string in `publishes` appears here. A pillar that publishes nothing (Sylade) declares an empty `events` array.

`node tools/registry/validate.mjs` prints `25/25 complete` when all 25 local manifests pass this check.

## 3. Shared Event Log (`kit/bus.js` + `deck/core/reach.js`)
`PB.events.publish({ type, pillar, ref, title })` appends concise event pointers (max `400`) without leaking private bodies, financial totals, or secret strings. Every stored event carries the envelope `{ type, pillar, at, v }` with `v` equal to `1`, plus `id`, `ref`, and `title`.

Rows saved before that envelope existed are migrated in place the next time `kit/bus.js` loads or `PB.events.list()` / `publish()` runs. A row is migrated only when `type`, `pillar`, `at`, or `v` is missing. `type` falls back to `kind`, then `"event"`. `pillar` falls back to `source`, then `"hub"`. `at` falls back to a `YYYY-MM-DD` date at noon UTC, then the epoch. `v` becomes `1`. Rows that already have the envelope are not rewritten.

`dumpAll` and `loadAll` copy each `localStorage` string unchanged, so a backup still restores byte for byte (BACKUP-1). `SAY` in `deck/core/reach.js` formats events across all active local pillars.

## 4. Whole-Device Backup & Restore (`deck/core/reach.js` + `kit/bus.js`)
- Covers all `prometheus.*`, `prometheus-hub.*`, `prom.deck.*`, and `hearth.*` `localStorage` keys **plus** Argus IndexedDB photo payloads (`prometheus-argus/photos`, preserved with `blobDataUrl` and metadata).
- Computes an integrity checksum (`integrity`), records a session rollback snapshot (`prometheus.backup.rollback`) before writing, never deletes keys absent from the backup file, and explicitly lists external protected sites in `excludedExternal: ["titan", "midas"]`.
