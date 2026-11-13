<!-- doc-status: current; normative: yes (for work on the Athenaeum pillar) -->
# Athenaeum: design brief

The first pillar rebuilt under `docs/CHARTER.md` (its sections 5, 8.1 and 11). Written by Claude, 2026-11-13. What is built is in
`pillars/athenaeum/`; what is proven is in `STATUS.md`; this page is why it is the way it is.

## 1. Mission

Keep every idea whole, with everything it became, and show how the ideas relate. An idea is never edited: a refinement is appended
with its date. A second layer, the Chronicle, holds history as cause, event and consequence.

## 2. What already existed and had to survive (all of it does)

Capture (title, text, tags) · the vault list with search inside refinements · append-only refinements · archive · resurfacing after
30 days with "seen" · the reading and history shelf with its form · export · import that merges and never replaces · the two
one-time seeds (11 ideas, 40 history entries). Same storage keys, same record shape. New fields are additive only: `origin: "typed"`
on ideas captured here, `by: "you"` on refinements appended here, `links: [ids]` for ties made by hand, and an `id` for any old record
that lacked one.

## 3. Three concepts, compared

| | A. The Firmament | B. The Loom | C. The Codex |
|---|---|---|---|
| Idea | Ideas are stars in a 3D sky; what they share pulls them into constellations; refinements orbit as moons | Each idea is a thread running down through time; refinements are knots; related threads braid | A reading room: index, split view, backlinks, command-first |
| Usefulness | Relations at a glance; a place to wander and find what connects | Best at "how did this idea change" | Fastest for reading and writing |
| Originality | High: nothing else in Prometheus looks or moves like it | Medium | Low: the nearest to existing note tools |
| Visual potential | Very high | Medium with 11 ideas over 7 weeks | Low |
| Ease of use | Needs a list beside it for speed and for screen readers | Good | Very good |
| Feasibility | Raw WebGL, no library; proven in this build | Easy | Easy |
| Long-term | Scales to hundreds (tested with 300) | Gets long | Scales best |
| Cost | Highest | Medium | Lowest |

**Chosen: A, carrying B and C inside it.** The sky is the place and the signature. The Loom's one strength, time, became the slider
that replays the sky from the first spark to today, and the lineage spine inside each idea. The Codex's strength, reading, became the
sheet an idea opens into, and the Index is the fast list for work, for keyboards and for a device that cannot start WebGL.

## 4. The experience

- **Sky.** Every kept idea is a star. Position comes from the ideas themselves: shared tags and shared words (a TF-IDF comparison done
  on the device, `js/model.js`) pull related ideas together; each tie keeps its reason and the codex shows it ("shares AI, reliability
  · both speak of audit, blind"). Constellations are named by the tag their members share. Brightness follows the idea's strength;
  each refinement is a moon. Drag turns, pinch zooms, a tap flies to a star.
- **An idea, whole (the codex).** The words as kept, in a serif voice; strength; where it came from (typed here, or imported and from
  what); the lineage as a spine, each entry marked "from the import" or "you"; append a refinement; what it connects to and why; a
  link made by hand; pillars the idea names; archive with undo.
- **Time.** The slider shows the sky on any past day; the play button replays how it formed. Arrival does a short replay once a
  session.
- **Chronicle.** The 40 history entries sit on one spiral arm that winds in toward the present, around the ideas. A rail of cards
  rides along it; an entry opens as cause, event, consequence, with the source's own words and a link, marked as compiled by an AI
  contributor and not the owner's writing.
- **Index, Shelf, search, backup.** A sortable list; the reading shelf; one search over ideas, chronicle and shelf that lights the
  matching stars; export, and an import that shows what would change before anything does.

## 5. Identity

- Metaphor: an observatory over one's own thinking. Atmosphere: night, starlight, quiet awe.
- Colour: starlight gold `#ffc552` and violet `#b9a2ff` (the pillar's hub accents), amber for history, one hue per constellation.
- Type: Outfit for the frame (shared); a serif for anything that was kept (titles, the idea's words, history).
- Shared with every pillar: the tab rail with its sliding light, the dock (previous, core, next), buttons, toasts, the sound switch.
- Its own: the full-bleed sky, the codex sheet with three heights, the time bar, the chronicle rail.
- Motion: the camera eases to wherever it is sent; ignition rings when a star appears; light travelling along ties; moons orbiting.
  With reduced motion: no drift, no arrival replay, no pulses; flights still ease.
- Phone: one hand; a record rises as a sheet and the frame steps back. Desktop: the record is a panel on the right and the sky
  shifts left to stay centred in what is free.

## 6. Data, integrity, provenance

- Owns `prometheus.athenaeum.ideas`, `.shelf`, `.ideasSeedV1`, `.histSeedV1` (see `pillars/athenaeum/pillar.json`).
- Nothing leaves the browser. Relations are computed locally. No AI is called.
- The 11 seeded ideas are marked Imported with their stated source, and the codex says plainly that their words are a summary made
  from the owner's conversations and not text he typed here.
- Export then import restores every idea byte for byte (proof ATH-6). Before this build a file exported by the page could not be
  imported by it (the importer read a different shape) and imported ideas lost their ids; both are fixed in `vault.js`.

## 7. Relationships

- Publishes to the shared event log (`kit/bus.js`, `PB.events`): `idea.captured`, `idea.refined`, `idea.archived`, `shelf.added`,
  `import.merged`. The hub shows the latest on its ticker.
- Through its manifest the hub's command key finds an idea by title or text and opens that record, and "idea: ..." typed on the hub
  opens the capture form with the words filled in; the pillar still does the keeping.
- An idea that names another pillar links to it.

## 8. Evidence

`proofs/unit/athenaeum.test.mjs` (9) and browser proofs ATH-1 to ATH-7 and CORE-5 in `proofs/run.py`.
**The independent review the charter requires has not happened.** A second agent was started on 2026-11-13 and stopped by a usage limit
before it reported. Until a reviewer other than the builder scores this pillar, it is not accepted under the charter's section 12.

## 9. Known limits and what was not verified

- Never run on a real phone. Every frame here was drawn by a software renderer; smoothness on the owner's device is unmeasured.
- Not tried with a screen reader. The sky's labels are real buttons and the Index is a plain list, but that is not a test.
- "Shared words" is word matching, not understanding: two ideas about the same thing in different words will not be tied until
  they share a tag or are linked by hand.
- The Chronicle's dates are the first year written in each entry; ranges and "c." are not drawn.

## 10. Next for this pillar

Trails (a saved path through ideas that can be replayed) · ideas that cite a chronicle entry or a shelf item · sources with their own
provenance class · relations to records in other pillars once those have manifests · an optional local model for "same meaning,
different words", marked as machine-suggested.
