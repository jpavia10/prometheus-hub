<!-- doc-status: current; normative: no -->
# Athenaeum — Independent Charter Review (Argon, Build d16)

- **Reviewer:** Argon (independent Charter audit after code inspection + live CDP desktop & mobile capture)
- **Target:** `pillars/athenaeum/` (`index.html`, `pillar.json`, `js/app.js`, `js/model.js`, `js/sky.js`, `vault.js`)
- **Charter Rubric:** `docs/CHARTER.md` Section 12 (`100` points total)

## 1. Score Summary — `91 / 100` (Excellent, Accepted for Baseline; Real Phone Check Still Pending)

| Dimension | Max | Score | Verified Assessment |
|---|---:|---:|---|
| Visual distinction and craftsmanship | 20 | **18** | Raw WebGL 3D star sky (`sky.js`: FBM nebula pass, diffraction-spike point sprites, glowing tie pulses, orbiting refinement moons, spiral Chronicle arm) plus glass codex sheet. `-2`: desktop WebGL software rasterizers throttle octave counts; physical mobile OLED contrast unverified on handset. |
| Functional completeness and usefulness | 20 | **19** | All `70` seeded ideas + `339` refinements, append-only lineage, manual links, archive with undo, `30`-day resurfacing (`pickResurface`), Chronicle, Index, Shelf, merge-only import preview (`#import-go`), and Hub handoff (`?/#new` via `prometheus.handoff`). |
| Interaction and workflow quality | 15 | **14** | Orbit drag, pinch zoom, accessible DOM star labels over WebGL projections, 3-height bottom/side codex sheet, timeline replay slider (`#t` / play), keyboard shortcuts (`Arrows`, `+/-`, `/`, `N`, `Esc`), and flat fallback (`body.ath-flat`) when WebGL is disabled or reduced motion applies. `-1`: mobile `chronicle` rail drag still benefits from hardware touch testing. |
| Originality and product imagination | 15 | **14** | Spatial semantic sky + spiral history arm (`The Firmament` carrying `Loom` timeline & `Codex` reader) rather than a generic card table. |
| Architecture and maintainability | 10 | **9** | Pure DOM-free semantic layout engine (`js/model.js`: TF-IDF cosine + tag affinity + cluster union-find), separate WebGL renderer (`js/sky.js`), separate controller (`js/app.js`), and declared manifest (`pillars/athenaeum/pillar.json`). |
| Reliability and data integrity | 10 | **9** | Non-destructive append-only refinements, non-destructive merge import (`MERGE.mergeIdeas`), provenance badges distinguishing owner notes from imported summaries, plus inclusion in `d16` device backup (`deck/core/reach.js`). |
| Performance, mobile, and accessibility | 10 | **8** | `mobileScrollW <= 390px` verified in Chromium CDP (`390x844`), zero JS/console errors, offscreen pause on `index`/`shelf` modes, keyboard controls, and `aria-selected`/`role="dialog"` semantics. `-2`: real physical Android phone verification (`Part X §27`) not yet completed in hardware. |
| **Total** | **100** | **91** | **Strong / Accepted at d16 baseline** |

## 2. Verified Evidence & Code Integrity Notes
1. **Model Purity (`pillars/athenaeum/js/model.js`):** Verified `terms()`, `vectors()`, `relate()`, `skeleton()`, and `clusters()` compute TF-IDF + normalized tag weights purely in memory without mutating idea bodies or transmitting data over the network.
2. **Merge & Backup (`pillars/athenaeum/js/app.js` + `deck/core/reach.js`):** Merge import previews `added`, `updated`, `same`, and `newShelf` counts before writing (`#import-go`), preserving existing entries; `prometheus.athenaeum.*` keys are included in `backupAll()`.
3. **Screenshots:** Captured in `artifacts/screenshots/d16/athenaeum-desktop.png` (`1440x900`) and `artifacts/screenshots/d16/athenaeum-mobile.png` (`390x844`).

## 3. Open Follow-Up
- Run live hardware swipe/pinch FPS telemetry on a physical Android device once pushed to GitHub Pages and record handset findings here.
