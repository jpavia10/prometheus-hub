# Sprint AGY-010 Design Brief — Piano Interactive Harmonic Studio

**Pillar:** `pillars/piano/` (`Bossa Piano · Interactive Harmonic Studio`, Hue `318`, Magenta Rose `--accent: #ff70d4`)  
**Owner:** `@piano`  
**Target Standard:** `docs/CHARTER.md` (§5 Piano standards, §8.1 Design & Visual Brief, §10 Reliability & Mobile/A11y, §11 Seven-Phase Workflow, §12 100-Point Rubric)  
**Baseline:** `54 / 100` (`docs/assessment/2026-11-13-transformation-assessment.md`)

---

## 1. Mission & Musical Diagnosis

Baseline `pillars/piano/` (`54 / 100`) bundled Web Audio playback, a 2D staff canvas, a 9-rung BPM ladder, an ear trainer, 40 bossa standards, and a practice form, yet behaved like disconnected widgets rather than an instrument. Keys sat in a flat uniform row with no black-key stagger, voicings ignored voice leading across changes, and there was no cross-pillar `PB.events` telemetry for rung milestones.

AGY-010 upgrades Piano into a cohesive **Tactile Harmonic Instrument**: one continuous harmonic loop connecting **16-step bossa clave pulse** -> **voicing/inversion selection (`Shell`, `1st Inv`, `Rootless A`, `Rootless B`) & DP `ii–V–I–vi` voice leading** -> **role-coded Grand Staff (`#p-staff`)** -> **staggered 2-octave QWERTY keyboard (`#p-kbd`)** -> **BPM rung progression & `PB.events` logging**.

### Preserved Contracts
- Existing exports in `pillars/piano/music.js` remain 100% intact: `NAMES`, `QUALITIES` (all 10 qualities: `maj7`, `maj9`, `6`, `m7`, `m9`, `m7b5`, `7`, `9`, `13`, `dim7`), `chord(root, quality)`, `progression(key)`, `PATTERN`.
- Existing DOM element IDs remain intact: `#p-seq-grid` (`> 16` children; renders `51`), `#p-staff`, `#p-rungs` (`9` rungs), `#p-drill-btn`, `#p-drill-s`, `#p-bpm`, `#p-key`, `#p-play-prog`, `#p-clave`, `#p-stop`, `#p-kbd`, `#p-lib`, `#p-standards`, `#p-log`.
- Existing `localStorage` store keys owned by `pillars/piano/pillar.json` (`prometheus.piano.ladder_bpm`, `prometheus.piano.ladder_reps`, `prometheus.piano.ear`, `prometheus.piano.sessions`) remain compatible with Export/Import Backup.

---

## 2. Three Concept Directions Explored

### Concept 1: Tactile Harmonic Instrument *(Chosen)*
A nocturnal Rhodes-and-notation studio cockpit anchored in obsidian glass (`rgba(16, 22, 38, .66)`), brushed aluminum keybeds, and rose-magenta/harmonic-role pills (`R`, `3`, `5`, `7`, `9`, `13`).
- **Hero Stage:** Unified `Harmonic Studio` panel stacking the 16-step Bossa Clave Matrix (`Bass` + `Comp` + `Clave`), segmented Voicing & Inversion Studio (`Shell`, `1st Inv`, `Rootless A`, `Rootless B`, `Play Voice-Led ii–V–I–vi`), interactive 4-bar `ii–V–I–vi` ribbon with real-time MIDI span telemetry, Grand Staff canvas with role-colored noteheads and 2nd-interval lateral offsets, and a staggered 24-key 2-octave keyboard (`C4–B5` / `C3–B4` toggle) playable via pointer/touch or QWERTY (`A S D F G H J K` / `W E T Y U`).
- **Rhythm & Transfer:** Selecting a voicing, clicking a bar in the ribbon, clicking a chord card, or triggering a QWERTY key updates the staff, lit keyboard keys, role pills, and Rhodes synth together.

### Concept 2: Spectral Conservatory
An analytical academia-first trainer centered around real-time FFT/harmonic overtone graphs, Roman-numeral interval matrices, and multi-bar scrolling notation.
- **Strengths:** Deep visual pitch-class geometry and tuning feedback.
- **Why Rejected:** Over-indexes on diagnostic charts at the expense of direct finger-on-keys comping ergonomics; heavyweight analysis visuals crowd `390x844` mobile viewports and feel clinical rather than playable.

### Concept 3: Minimalist Metronome
An ultra-sparse monochrome BPM blinker with big tap-tempo numerals, plain text chord changes (`Dm9 — G13 — Cmaj9 — Am7`), and small toggle buttons.
- **Strengths:** Near-zero rendering cost and rapid readability at arm's length.
- **Why Rejected:** Sacrifices spatial piano geography (staggered black/white keys), harmonic voice-leading visualization, and tactile joy — essentially regressing toward the `54/100` utility-panel baseline.

### Concept Comparison (Charter §11 Rubric)

| Criterion | 1. Tactile Harmonic Instrument *(Chosen)* | 2. Spectral Conservatory | 3. Minimalist Metronome |
|---|---|---|---|
| **Visual Craft & Distinction** | Staggered ivory/ebony 2-octave bed + role pills + rose glow | Dense FFT plots & interval tables | Flat monochrome counters |
| **Musician Workflow Speed** | 1-tap voicing switch -> instant audio + staff + lit keys | Multi-step mode switching before sound | Fast tempo tap, weak harmony feedback |
| **Voice-Leading Clarity** | Shows `ii–V–I–vi` MIDI range & role movement (`3↔7`) directly on keys | Strong pitch-class graphs, weak hand shape mapping | Text-only chord symbols |
| **Mobile `390x844` Ergonomics** | 6 native `.pk-tabs` panels; full cockpit fits cleanly with `scrollWidth <= 390` | Canvas FFT overflows/cramps small screens | Fits easily, feels empty on desktop |
| **Offline / Zero-Dep Fidelity** | Pure Web Audio Rhodes + HTML5 Canvas + CSS grid (`0` deps) | Heavy AudioWorklet/FFT buffer math | Lightest CPU, lowest musical depth |

**Decision:** Adopt **Concept 1 — Tactile Harmonic Instrument**, keeping sub-millisecond direct manipulation across ear, eye, and fingers on both `1440x900` studio viewports and `390x844` mobile screens.

---

## 3. Charter §8.1 Specification & Technical Architecture

### Harmony Engine (`pillars/piano/music.js`)
- `invertChord(ch, invIndex)` normalizes mode `0..3` for all 12 `NAMES` and 10 `QUALITIES`, preserving `[...base.bass]` safely for the sequencer while returning `{ ...ch, voicingMode, invIndex, notes, roles, midi, tones, bass }`:
  - `0` (`Shell`): bass root + upper guide tones above middle C (`R, 3, 7` / full shell).
  - `1` (`1st Inv`): lowest upper voice shifted up an octave (`+12`), wrapping neatly if exceeding `88`.
  - `2` (`Rootless A`): canonical Bill Evans / bossa A-form (`3-5-7-9`, falling back gracefully on `dim7`/`6`/`m7` intervals) inside `55..79`.
  - `3` (`Rootless B`): upper-extension B-form (`7-9-3-5` / `6-9-3-5` for `6` chords, omitting doubled root) inside `55..79`.
- `voiceLead(prog)` runs dynamic programming (Viterbi shortest-path) across candidate `invIndex ∈ {0..3}` and `±12` octave transpositions constrained strictly to MIDI `55..79` (`G3..G5`), selecting the globally minimum L1 semitone distance path (`∑ |curr[i] - prev[i]|`, plus tie-break centering near `66` and subtle penalty on mode `0` jump when rootless `A/B` achieves smoother guide-tone motion).

### Visual Grammar & Role Palette (`pillars/piano/app.css`)
- **Role Color Coding:** `.p-role-pill` tokens (`--p-r: #ff70d4`, `--p-3: #63e6be`, `--p-5: #9db4ff`, `--p-7: #ffd166`, `--p-9: #ff9f6e`, `--p-13: #d8a6ff`) match on both active piano keys and the Grand Staff noteheads (`ROLE_COLOR` in `app.js`).
- **Staggered 2-Octave Keyboard (`#p-kbd`):** CSS relative bed with 14 flex white keys (`.p-key.p-key-w`) and 10 positioned black keys (`.p-key.p-key-b` with computed `--x` column percentage & `calc((100% / 14) * 0.64)` width). Does **not** use `.btn` so `kit/prometheus.css` pill overrides never crush key geometry.
- **Mobile & Accessibility:** `@media (max-width: 600px)` compacts `.p-seq-grid` (`36px repeat(16, minmax(0, 1fr))`), wraps `.p-prog-ribbon` into `2×2`, hides desktop QWERTY badges on phone screens, and bounds `#p-standards` (`max-height: 480px; overflow-y: auto`) so every tab renders `scrollWidth <= 390` and `scrollHeight < 2600`. `prefers-reduced-motion: reduce` disables key/cell transitions.

### Cross-Pillar Telemetry & Input Safety (`pillars/piano/app.js`)
- `PB.events.publish({ type: "piano.session", pillar: "piano", title })` emits when `#p-log` submits a practice entry.
- `PB.events.publish({ type: "piano.rung", pillar: "piano", title })` emits when advancing to the next BPM rung after 9 clean reps (`#p-rep`).
- Global QWERTY key handler (`A S D F G H J K` white keys, `W E T Y U` black keys) guards against modifiers, open dialogs/command palette (`.pk-palette-back:not([hidden]), dialog[open]`), and editable elements (`input, textarea, select, [contenteditable='true']`).

### Known Limits
- 16-step sequencer plays authentic preset Standard (`0,3,6,10,12`) and Sparse (`0,6,10`) patterns rather than per-step custom user editing.
- Web Audio uses an internal synthesized electric piano (no external sample pack or outbound WebMIDI hardware output).
- Mic take remains an amplitude-meter self-check (`getUserMedia`) without polyphonic pitch detection.
