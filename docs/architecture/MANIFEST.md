<!-- doc-status: current; normative: yes -->
# Pillar manifests, the event log, and handing words over

Stage 2 of `docs/CHARTER.md`, started 2026-11-13 with one pillar (Athenaeum). The rest get manifests as each is rebuilt.

**Manifest** (`pillars/<id>/pillar.json`, read by `deck/core/reach.js`; add the path to `MANIFESTS` there):
`manifest: 1`, `id`, `name`, `state`, `route` (from the hub root), `mission`, `signature`, `owns` (storage keys), `publishes` (event
types), `search` (a list of `{ key, kind, title, text: [fields, "list.field"], skip, open: "#.../{id}" }`) and `commands`
(`{ id, label, open, words, takesText }`). The hub reads the named storage keys directly and never loads the pillar's code. Every
result opens the record in its own pillar, which stays the authority.

**Event log** (`kit/bus.js`, `PB.events.publish({ type, pillar, ref, title })`, `PB.events.list({ since })`): what happened, newest
last, capped at 400, each `{ v: 1, id, at, type, pillar, ref, title }`. A log, not a store: an event only points at a record.

**Handing words over**: a command with `takesText` matches "word: text" in the hub's command key. The hub leaves
`{ pillar, command, text }` in `sessionStorage["prometheus.handoff"]` and opens the pillar, which reads it once and still does the
keeping itself. The hub never writes a pillar's records.

Not done yet: one generated registry replacing `pillars.json`, `deck/pillars.js` and the list in `kit/kit.js`; one backup of everything.
