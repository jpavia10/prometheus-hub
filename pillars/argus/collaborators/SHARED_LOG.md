# Argus Album: shared log

Newest first. Every contributor (Claude and every AI) adds a dated 2-3 line entry after a change.

### [2026-11-10] Grok: coin-photo standard stress test (WS-ARGUS)
- Added `research/ARGUS-GROK-coinphoto-stresstest_20261110-1707.md` + manifest: 12 findings (5 High) on Argus 20 rules + Titan master-v1/QC + P1/P2 briefs at small denominations and worn dates (size normalisation, size-blind px/mm floor, worn-date vs mismatch rule, 4000 px fallback under the floor, naming regex 2/14). Proposals only; no Titan files touched.

### [2026-11-10] Grok: HEIF/AVIF/video metadata table (WS-ARGUS, Prometheus reset)
- Added `research/ARGUS-GROK-exif-heif-video_20261110-1702.json` (131 rows, same schema as the 40-row JPEG table) + manifest: ISO BMFF, QuickTime Keys/UserData, 3GPP, Apple udta, HEIF items/properties/groups, AVIF, Android Motion Photo, C2PA. Every tag_id string-matched to its cited source. Data only; `exif.js`/`tags.js` untouched (integration notes in the manifest). Drive copy in the pillar incoming folder.

### [2026-11-09] Sebastian (acting integrator, for Claude): non-Titan homework merge
- ARG-GEM-01..05 + ARG-MUS-01 delivered to the pillar's Drive incoming, reconciled by Gemini into the pillar MERGED_MASTER + SPEC, and verified against the original drops by Sebastian (counts; Muse's spec-check merged in full). Tasks closed in docs/agents/queues.json; board re-rendered from the hub.

### [2026-11-05] Claude: the Prometheus layout
- This pillar got the standard files (AI_START_HERE, CLAUDE, homework in docs/agents/, this log, the scorecard) and its Drive folder `Prometheus Hub/Pillars/Argus Album/`. Homework for every AI is in docs/agents/QUEUE_*.md.
