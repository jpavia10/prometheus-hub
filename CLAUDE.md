<!-- doc-status: current; normative: yes -->
# Prometheus Hub: integrator & orchestration notes (`AGENTS.md` + `CLAUDE.md`)

> **Antigravity Operating Sync (2026-11-13, Build d16):** Current operating rules are in `AGENTS.md`, `.agents/workflows/prometheus-delivery.md`, and `docs/antigravity/WORKBOARD.md` (Orchestrator **Argon** + Executor **Hydrogen**). Current ecosystem: **`27` active Hub destinations** (`25` local pillars under `pillars/<id>/`, each with its own `pillar.json` manifest and signature stage/sky, plus protected external `titan` and `midas`), with `fleet` paused. Registry & manifest parity is enforced by `node tools/registry/validate.mjs`; unified backup covers `localStorage` + Argus IndexedDB photo blobs. Historical `d7`–`d12` notes below are preserved for provenance.

**New here? Read `AGENTS.md` and `docs/HANDOVER.md` first:** state, the owner's direction in his words, and what to do next.

The desk: every pillar opens from here. Part of Prometheus (`jpavia10/prometheus-hub`, `pillars.json`). Live: https://jpavia10.github.io/prometheus-hub/.

- **Ownership:** Claude integrates (reviews and merges every pull request and every Drive drop file). Grok, Gemini, Muse and ChatGPT contribute through homework (`docs/agents/queues.json`), Drive `Prometheus Hub/Pillars/Prometheus Hub/incoming (AI drop files)/` and pull requests on `{ai}/...` branches.
- **Homework:** edit `docs/agents/queues.json` here, then in the hub run `python3 tools/kit/render.py --root /home/user` (every repo cloned side by side) and copy the changed `docs/agents/drive/*.txt` into their Drive docs. Every task names its count, its file, its checks and what makes it not done (owner, 2026-11-05: "Clear measurable objectives not just big idea with poor Implementation").
- **Scoring:** every outside file gets a row in `collaborators/CONTRIBUTOR_SCORES.md` and a note in Drive `Prometheus Hub/{AI folder}/FEEDBACK — {name} (every pillar)`.
- **Log:** a 2-3 line entry in `collaborators/SHARED_LOG.md` after every change.
- **Deploying:** GitHub Pages may not rebuild for pushes made by the Claude GitHub app (it did not on Titan); after pushing `main`, check the Pages run and, if none started, update a file through the GitHub connector.
- **Look:** the Prometheus look shared by every pillar except Titan.

## The charter governs (owner, 2026-11-12)

`docs/CHARTER.md` is the owner's Master Evolution Charter, kept word for word, and it is normative: read it before any design or
build work. In short: Prometheus is a personal digital ecosystem, not a dashboard; assess before building; prove the new standard
in **one** pillar before touching the rest ("Don't let Fable interpret this as permission to start rebuilding 18 pillars at once");
every pillar becomes a distinct place with a signature interaction; score work with its section 12 table and have a second agent
review it. Its section 16 protections are absolute: Titan is not modified, Midas internals are not modified, Fleet stays paused,
Sylade stays presence-only, Icarus never trades or advises, nothing is fabricated, authoritative records are never silently changed,
no mandatory backend or account. When an improvement conflicts with a protection: stop and explain.
- **First deliverable, done:** `docs/assessment/2026-11-13-transformation-assessment.md` (audit, map, gaps, design and architecture
  assessment, pillar proposals, concept, roadmap, first demonstration). Recommended next move there: small foundations (a manifest
  per pillar and one registry, an event log, one backup, a proof per pillar), then Athenaeum as the first finished place, starting
  from three rendered concepts.
- **Waiting on the owner:** Athenaeum or Piano first; whether the two hub consoles become the Kairos and Money pillars; Forge
  (it is what Fleet was, and Fleet is paused); removing personal details from this public repository and its history.

## The hub's own job: the kit

- `pillars.json` is the list of every pillar. A new pillar: add it there, run `python3 tools/kit/scaffold.py --root /home/user {id}` (creates the standard files, never overwrites), give it tasks in its `docs/agents/queues.json`, run `python3 tools/kit/render.py --root /home/user`, then make its Drive folder (`Prometheus Hub/Pillars/{Pillar}/` with the doc `README — {Pillar}` from `docs/agents/drive/{id}/README.txt` and the folder `incoming (AI drop files)/`).
- `python3 tools/kit/render.py --check` fails when a rendered page is out of date.
- The layout and Claude's routine: `docs/PROMETHEUS_LAYOUT.md`. The rules every AI follows: `AI_START_HERE.md`.
- The desk reads `data/board.json` (rendered) for each door's state and open homework.

## Where things stand (2026-11-13, build d7): the hub holds every pillar

Read this first. Owner, 2026-11-12, after d1 hid 14 pillars behind a two-capability app with demo data: "you strip away my pillars so
its irrelevant ... The over the top futuristic dopamine loaded theme and transitions are what im seeking ... bring the project
together and we can develop them one by one later." **Standing direction: never hide or drop a pillar; the hub is the shell, loud and
futuristic; real data only; individual pillars are developed later, one at a time, when he says.**
- **The hub** (`index.html` boots `deck/app.js`, native ES modules, no build): the core is `deck/views/orrery.js` (d3: a live 3D
  orrery of all 18 pillars from `deck/pillars.js` around a shader fire; drag to spin, tap to swing-and-warp, orbit/grid morph, boot,
  ticker, briefs; every position is computed per frame in script, light is drawn on a canvas) on top of `deck/views/picture.js`
  (day ring, runway, countdowns, tiles). Owner, 2026-11-12: "I want advanced motion and gui not a 1990s basic shit": design the hub
  around motion first; never ship a static grid of boxes as the main screen.
  Effects: `deck/core/fx.js` (warp, synthesized sound behind one switch, haptics). Look: `deck/deck.css` (tokens at the top, "d2: the core" at the end).
- **Real data in:** `deck/core/legacy.js` reads the pillars' own storage (`prometheus.<pillar>.*`), the shared deadline bus
  (`prometheus.bus.deadlines`, `kit/bus.js`) and Titan's published ledger; `deck/core/feeds.js` merges them with the fixed dates.
- **The default pillar shell (d5):** the block "pillar shell v2" at the end of `kit/kit.js` (crest, automatic sections for pages that are one
  stack of panels, the sliding tab light, the dock, the ripple) and of `kit/prometheus.css` (written against `body.pk-v2`). Owner on
  the Piano page: "its junk": raise the default here, in the kit, so all 14 pillars rise together; a pillar's own `app.css` stays tiny.
- **One theme for all pillar pages:** the block "deck theme" at the end of `kit/prometheus.css` (colours per pillar, glass, warp page
  changes). Change the look there, not page by page. Titan, Midas and Hearth are separate repositories and were not touched.
- **d12 (2026-11-14):** the core shows "Since you were here" from `PB.events` (publish an event from any pillar action worth seeing;
  add its words to `SAY` in `deck/core/reach.js`); System has "Back up everything" (`backupAll` / `previewRestore` / `restoreAll`).
  Sylade is `pillars/sylade/`; the old desk files are gone.
- **d11 (2026-11-13): Hearth lives here now** (`pillars/hearth/`; owner: "Hearth doesnt need an independent repo"). Scope stays the owner's three
  things: renovation projects, assets per room, a plan that gets accurate as it is measured; no price research, code lookups or upkeep
  calendars unless he asks. The deck's stage store keeps its old key `hearth.deck.stages.v1`. The old repo `jpavia10/hephaestus-hearth`
  carries a moved notice; do not work there.
- **d10 (2026-11-13): new pillars Forge, Foundry, Observatory, Kin** (owner chose all four; for Forge he lifted the Fleet pause: "Work on
  all of them"). Forge only reads the AI queues and Titan's score sheet and never contacts an AI. Observatory sends subject words to
  hn.algolia.com only when Scan is pressed (declared in its manifest). Kin keeps names on the device only.
- **d9 (2026-11-13): each kit pillar has a signature picture at the top** (owner: "Run through each pillar and revamp"): the engine is
  `kit/stage.js` (canvas, loop, pause off screen, reduced motion, redraw on save via the `pk:store` event from the kit store); each pillar's
  picture is its own `pillars/<id>/stage.js`, reading only its own records and shipped data. Change a pillar's picture there; never move
  pillar logic into the stage. Bastion exposes `window.BASTION_SCENARIOS` for it.
- **d7 (2026-11-13): Athenaeum is the first pillar rebuilt under the charter** (owner: "Continue with whatever but 70 is low i want over 100
  beyond limits"). `pillars/athenaeum/`: ideas as stars in a raw-WebGL 3D sky (`js/sky.js`), relations and layout worked out on the device
  (`js/model.js`, pure, unit-tested), the app (`js/app.js`); same stored records, every old feature kept. Read `docs/pillars/athenaeum/BRIEF.md`
  before touching it. Shared foundations it uses: the event log `PB.events` in `kit/bus.js`, its manifest `pillars/athenaeum/pillar.json`, the
  hub's reach through manifests `deck/core/reach.js` (`docs/architecture/MANIFEST.md`). **Not done: the independent review (the second agent
  hit a usage limit), any real-phone test, the generated registry, one backup.** Next pillar only after the owner has seen this one.
- **d6 (2026-11-13):** no new features. Pillar accent colours in the "deck theme" block must stay hex (`kit/kit.js` appends an alpha
  pair to `--accent` for charts; the d2 `hsl()` values broke the Money chart on the live site for a day). Proof PILLAR-2 opens every
  pillar page, taps every section and fails on any script error; keep it passing. Open: the browser sometimes drops the animated
  page change from the hub to a pillar in the test browser (cause not found; the proofs report it).
- **Consoles from d1** (`#/time` Kairos console, `#/money` Payoff console; engines in `deck/core/` and `deck/models/`) stay as hub
  consoles. The Kairos and Money pillar pages are back at their addresses. Which one each pillar becomes is the owner's decision.
- **Proofs:** `python3 proofs/run.py <url> [--mock-weather]` (CORE-1..4 plus the d1 proofs), `node --test proofs/unit/*.test.mjs`,
  and `.github/workflows/proofs.yml` runs them against the live site after each deployment. `STATUS.md` is the honest list.
- **Privacy:** public repository. No personal details in code; the owner's presets load from his private Drive file.
- **Deploy:** push `main`, then update `DEPLOY_STAMP.txt` through the GitHub connector and confirm the Pages build and the proofs-live run.
- **Titan is paused by the owner** (same day: "leave it for now"). Do not continue Titan's new front until he says.
