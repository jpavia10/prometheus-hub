# Prometheus Hub

Joseph's local-first command deck and ecosystem. Midnight atmosphere, live WebGL sky & aurora shader, interactive 3D orrery, universal command search (`/` / `Ctrl+K`), shared deadline/money/event buses, and whole-device backup (including Argus IndexedDB photo blobs).

Live URL: https://jpavia10.github.io/prometheus-hub/

Nothing here talks to a backend account or stores secrets in the repository. Personal data stays in browser `localStorage` and `IndexedDB` until explicitly exported.

## Architecture & Running Locally

GitHub Pages serves this repository directly as **static HTML, CSS, and native ES modules** — there is **no npm, bundler, or build step**.

```bash
# 1. Start a local static server from the repository root
python3 -m http.server 8377

# 2. Validate the canonical pillar registry & all 25 local manifests
node tools/registry/validate.mjs

# 3. Run unit proofs
node --test proofs/unit/*.test.mjs

# 4. Run full browser proof suite (with local static server running)
python3 proofs/run.py http://127.0.0.1:8377/ --mock-weather --out proofs/results.json
```

`.nojekyll` is included. Publish the root of **jpavia10/prometheus-hub**, branch **main**, folder **`/ (root)`**.

## Core Systems

- **Operating System:** [AGENTS.md](AGENTS.md), [.agents/workflows/prometheus-delivery.md](.agents/workflows/prometheus-delivery.md), and [docs/antigravity/WORKBOARD.md](docs/antigravity/WORKBOARD.md).
- **Hub (`deck/`):** `index.html` boots `deck/app.js` — Command Bridge rail (`BUILD D16 · 27 PILLARS`), 3-mode Orrery (`3D Orbit`, `Hex Matrix`, `Synapse Web`), WebGL sky/aurora shader (`deck/core/atmo.js`), 27-pillar Command Atlas (`deck/views/picture.js`), universal search & whole-device backup (`deck/core/reach.js`), shared buses (`kit/bus.js`), and offline cache (`sw.js`).
- **Shared Pillar Cockpit Kit (`kit/`):** 1280px adaptive bento layout, simultaneous `All Panels` toggle (`#pk-cockpit-btn`), global `⌘K`/`Ctrl+K` palette, signature stage canvas (`kit/stage.js`), and interactive background particle field (`kit/kit.js`).

## Ecosystem Map (`27` Active Destinations + Paused `Fleet Command`)

Canonical registry: [pillars.json](pillars.json) (validated against `deck/pillars.js`, `deck/core/reach.js`, and `kit/kit.js`).

### Local Pillars (`25`, under `pillars/<id>/`)
| Pillar | Route | Role |
|---|---|---|
| Kairos Meridian | `pillars/kairos/` | Calendar, deadlines, focus timer, and `.ics` round-trip |
| Hephaestus Hearth | `pillars/hearth/` | House renovations, rooms, assets, and measured floor plans |
| Garage | `pillars/garage/` | Vehicle maintenance, service timeline, and paperwork |
| Apollo Temple | `pillars/apollo/` | Health, fitness, training load, and nutrition logging |
| Money · Payoff Simulator | `pillars/money/` | Client-side debt payoff curves, APR trap lab & issuer library |
| Selling Pipeline | `pillars/selling/` | Items from listing to shipped, marketplace fees & windfalls |
| Records · Paper Killer | `pillars/records/` | Document vault, renewal alerts, and metadata extraction |
| Icarus Stake | `pillars/icarus/` | Analytical trading journal & rule checks (never executes trades) |
| Hermes Post | `pillars/hermes/` | Mail triage, urgency queue, and response tracking |
| Bossa Piano Studio | `pillars/piano/` | 16-step sequencer, chord/voicing studio, practice & bossa path |
| Bastion · Mountain Prep | `pillars/bastion/` | Preparedness, storm alerts, supplies, and scenarios |
| Athenaeum · Idea Vault | `pillars/athenaeum/` | WebGL 3D idea sky, TF-IDF constellations, Chronicle & vault |
| Odyssey · Trips & Away Mode | `pillars/odyssey/` | Trips, away-mode checklist & shared home alerts |
| Privacy · CA DROP | `pillars/privacy/` | Data broker removals, opt-out status & digital footprint |
| Argus Album | `pillars/argus/` | EXIF scrubbing, dHash dedup, 20-rule QC & IndexedDB vault |
| Ludus Arcade | `pillars/games/` | 16-game personal library, co-op plans & backlog telemetry |
| Forge | `pillars/forge/` | AI work floor (Grok, Gemini, Muse, ChatGPT, Argon, Hydrogen, Claude) |
| Foundry | `pillars/foundry/` | Inventions progressing from idea to verified build |
| Observatory | `pillars/observatory/` | Source-separated topic monitoring and evidence notes |
| Kin | `pillars/kin/` | Family logistics, school paperwork & schedules |
| Sylade · Presence | `pillars/sylade/` | Public presence page (scoped strictly to public presence) |
| Aether · Field Lab | `pillars/aether/` | Weather, wildfire/AQI, solar/lunar ephemeris & pass readiness |
| Polis · Civic & Legal Watch | `pillars/polis/` | CA & Kern County policy tracking, permits & ballot measures |
| Mythos · Creative Studio | `pillars/mythos/` | Worldbuilding, fiction drafts, lyrics & lore graphs |
| Continuity · Sovereign Vault | `pillars/continuity/` | RAM-only WebCrypto (`PBKDF2` + `AES-GCM`) emergency vault |

### External Protected Pillars & Paused Systems
- **Titan Reliquary** (`https://jpavia10.github.io/titan-reliquary-preview/`) — separate repo, protected (`locked_link_only`).
- **Midas Ledger** (`https://jpavia10.github.io/midas-ledger/`) — separate repo, protected (`link_only`).
- **Fleet Command** (`https://jpavia10.github.io/fleet-command/`) — paused (`state: "paused"`, excluded from active Hub destinations).
