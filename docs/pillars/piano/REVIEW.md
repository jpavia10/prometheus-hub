# Charter §12 Review — Piano Interactive Harmonic Studio (`pillars/piano/`)

**Sprint:** `AGY-010`  
**Owner:** `@piano`  
**Reviewed Against:** `docs/CHARTER.md` (§5 Piano Standards, §10 Reliability & Mobile/A11y, §12 Scoring Rubric, §18 Truth Mandate)  
**Baseline:** `54 / 100` -> **Post-Sprint Score: `89 / 100` (`Strong`, +35 pts)**

---

## 1. Score Breakdown (Charter §12 — 100 Points)

| Category | Max | Score | Summary & Deduction Rationale |
|---|---:|---:|---|
| Visual distinction and craftsmanship | 20 | 18 | Real staggered 24-key 2-octave ivory/ebony piano (`#p-kbd` in `pillars/piano/app.css`), harmonic role-color pill system (`--p-r/3/5/7/9/13`), role-colored Grand Staff canvas (`#p-staff`), and LED bossa matrix (`#p-seq-grid`). **-2:** Secondary tabs (Ear, Standards, Practice Log) retain standard `.pk-v2` glass forms rather than bespoke studio hardware gauges. |
| Functional completeness and usefulness | 20 | 18 | Full `Shell`, `1st Inv`, `Rootless A (3-5-7-9)`, and `Rootless B (7-9-3-5)` voicings across all 12 keys and 10 qualities (`pillars/piano/music.js#invertChord`), DP `voiceLead(prog)` optimizer inside MIDI `55..79`, interactive `ii–V–I–vi` progression ribbon, 9-rung BPM ladder (`#p-rungs`), 40 searchable standards (`#p-std-filter`), ear/interval quiz, note drill, and session log. **-2:** Sequencer toggles between Standard and Sparse patterns without individual per-step toggle editing; mic take monitors envelope without pitch detection. |
| Interaction and workflow quality | 15 | 14 | Single-click voicing preview and bar auditioning synchronize audio, staff notation, ribbon highlight, and keyboard pills simultaneously. QWERTY playback (`A S D F G H J K` / `W E T Y U`) works across `document` and blocks cleanly inside inputs, selects, and open modals (`pillars/piano/app.js`). **-1:** QWERTY mapping covers a 13-semitone range with an octave shift toggle (`#p-oct-shift`) rather than simultaneous left/right two-hand keyboard zones. |
| Originality and product imagination | 15 | 13 | Cohesive Bill Evans–style rootless A/B and DP semitone-optimal bossa comping workbench paired directly with role pills on staggered piano keys. **-2:** Web Audio electric-piano synth uses a fixed warm harmonic envelope with no user tremolo or brightness shaping control. |
| Architecture and maintainability | 10 | 9 | Clean separation between pure music-theory module (`pillars/piano/music.js` preserving `NAMES`, `QUALITIES`, `chord`, `progression`, `PATTERN`) and DOM studio controller (`pillars/piano/app.js`), plus `PB.events.publish` telemetry (`piano.session`, `piano.rung`). **-1:** `app.js` (`773` lines) combines staff rendering, synth, UI wiring, and drills in a single module rather than splitting canvas/audio helpers. |
| Reliability and data integrity | 10 | 9 | Backward-compatible `localStorage` keys (`prometheus.piano.*`), guarded `PB.events.publish` with graceful fallback, DP fallback safety for rootless `dim7`/`6`/`m7` qualities without `undefined`/`NaN` bass notes (`bass: [...base.bass]`), zero console/page/network errors in Chromium headless checks. **-1:** Standard chart parser skips/interpolates uncommon exotic slash/altered symbols rather than full jazz-chord AST parsing. |
| Performance, mobile behavior, and accessibility | 10 | 8 | Verified zero horizontal overflow (`scrollWidth = 390`) and bounded vertical scroll (`scrollHeight <= 2283` < `2600`) across all 6 `.pk-tabs` mobile views on `390x844`; all 24 keys fit inside `#p-kbd` bounding box; `prefers-reduced-motion` honored; ARIA `aria-pressed` states and semantic buttons preserved. **-2:** Not yet tested on physical multi-touch phone hardware or with an active screen-reader audit across custom `<canvas>` staff updates. |
| **Total** | **100** | **89** | **Strong (+35 vs `54/100` baseline, earns `>= 85/100` Sprint bar)** |

---

## 2. Verification Evidence (Observed Tool Output)

- **Syntax Checks (`node --check`):** Passed exit code `0` on `pillars/piano/music.js`, `pillars/piano/app.js`, and `proofs/unit/piano.test.mjs`.
- **Unit Suite (`node --test proofs/unit/piano.test.mjs`):** `4 / 4` tests passing (`68.73ms`), verifying:
  - `NAMES`, `QUALITIES`, `chord()`, `progression()`, and `PATTERN` backward compatibility.
  - `invertChord(ch, 0..3)` clean role/note/MIDI/bass arrays across all `12` keys × `10` qualities × `4` modes (`480` checks).
  - `voiceLead(prog)` exact global L1 minimum semitone distance vs exhaustive brute-force search inside MIDI `55..79` across all `12` keys (`7,680` permutations per key checked).
  - UI & event contract assertions (`#p-seq-grid`, `#p-staff`, `#p-rungs`, `#p-kbd`, Voicing controls, QWERTY map, `PB.events.publish` for `piano.session` and `piano.rung`, `@media (max-width: 600px)`).
- **Registry Guard (`node --test proofs/unit/registry.test.mjs`):** `4 / 4` tests passing (unmodified manifest invariants intact).
- **Live Browser Verification (Headless Chrome CDP against local HTTP server):**
  - `390x844` Mobile: `6` `.pk-tabs` tabs present, `.pk-dock .pk-core` present, `1` visible `.glass` per tab, `scrollWidth === 390` on all 6 tabs, `scrollHeight` measured at `2283 / 1253 / 1101 / 1748 / 1582 / 1403` (all `< 2600`). `#p-seq-grid` children `= 51` (`> 16`), `#p-rungs` children `= 9`, `#p-kbd .p-key` `= 24` (`14` white, `10` black).
  - `1440x900` Desktop: All `24` required DOM IDs present; `outOfBoundsCount = 0` across all 24 keys; `#p-v-2` lights `[64(3), 67(5), 71(7), 74(9)]` for `Cmaj7`; `#p-v-3` lights `[71(7), 74(9), 76(3), 79(5)]`; `#p-play-vl` sets `aria-pressed="true"` and displays `Bar 1 · Dm9 (ii)`; `#p-oct-shift` toggles `C4–B5` <-> `C3–B4`; QWERTY `'a'` triggers `Key: C4` while `'s'` inside `#p-log input[name="focus"]` is suppressed; `#p-std-filter` filters `40 -> 27` (`Jobim`); `#p-log` and `#p-rep` emit `piano.session` and `piano.rung` to `prometheus.bus.events` with `0` console errors, `0` uncaught exceptions, and `0` failed requests.

---

## 3. Open Follow-Ups (Post-Sprint Backlog)
1. **Per-step custom clave editing & tone control:** Allow clicking sequencer cells directly to customize comp patterns and expose a Rhodes warm/bright filter knob.
2. **Physical device & screen-reader QA:** Test rapid multi-finger touch chords on real mobile Safari/Chrome devices and verify live-region announcements alongside `<canvas>` notation.
3. **Extended chord chart parser:** Expand `chartChord()` in `pillars/piano/app.js` for slash basses and altered upper tensions (`7b9`, `7#11`).
