
### [2026-11-09] Sebastian (acting integrator, follow-up): door copy applied to the desk
- At Joseph's word after he saw no visible change from the merge: the verified HUB-MUS-01 copy is now ON the desk. index.html door rows carry the one-line purposes; every door sheet (Titan, Midas, Hearth, Apollo, Hermes, Kairos, Icarus, Argus, Drive, Fleet) gained its Today lines; the Drive card and the Sylade panel carry their door lines; sylade.html lede set to the Sylade purpose; pillars.json "what" fields aligned to the same copy. Re-rendered + Drive READMEs re-synced.

### [2026-11-09] Sebastian: revamp tranche 1 begins — shared data layer
- Joseph assigned the revamp build to Sebastian (whole brief scope, on the live hub theme). Added kit/bus.js: the cross-capability bus on the kit storage conventions — deadlines bus (publish dedupes by source+ref; upcoming/overdue windows), money-events bus (sales/fuel/payments with kind+since totals), shared meta (away mode), and a versioned full-deck backup (prometheus-backup v2: dump/load every prometheus.* key). Unit-tested headless (dedupe, windows, overdue, totals, backup round-trip — all pass). No page loads it yet; wiring lands with the Time tranche.

### [2026-11-09] Sebastian: revamp tranche 1 — Time on the bus
- Kairos now publishes the 58 researched fixed dates (KAI-GEM-02: 33 federal holidays, 19 tax deadlines, 6 clock changes, 2026-2028) to the shared deadlines bus from pillars/kairos/fixed-dates.js, and its Now/Week/Today views read the merged bus — so deadlines from any capability will surface in Time. Joseph's own events publish/unpublish to the bus too. Tested: dataset shape + idempotent publish (58 after two passes), Veterans Day 2026-11-11 lands in the 7-day window. Homework deadlines.json flow untouched.
