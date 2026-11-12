<!-- doc-status: current; normative: yes -->
# Prometheus Hub: integrator notes (Claude)

The desk: every pillar opens from here. Part of Prometheus (`jpavia10/prometheus-hub`, `pillars.json`). Live: https://jpavia10.github.io/prometheus-hub/.

- **Ownership:** Claude integrates (reviews and merges every pull request and every Drive drop file). Grok, Gemini, Muse and ChatGPT contribute through homework (`docs/agents/queues.json`), Drive `Prometheus Hub/Pillars/Prometheus Hub/incoming (AI drop files)/` and pull requests on `{ai}/...` branches.
- **Homework:** edit `docs/agents/queues.json` here, then in the hub run `python3 tools/kit/render.py --root /home/user` (every repo cloned side by side) and copy the changed `docs/agents/drive/*.txt` into their Drive docs. Every task names its count, its file, its checks and what makes it not done (owner, 2026-11-05: "Clear measurable objectives not just big idea with poor Implementation").
- **Scoring:** every outside file gets a row in `collaborators/CONTRIBUTOR_SCORES.md` and a note in Drive `Prometheus Hub/{AI folder}/FEEDBACK — {name} (every pillar)`.
- **Log:** a 2-3 line entry in `collaborators/SHARED_LOG.md` after every change.
- **Deploying:** GitHub Pages may not rebuild for pushes made by the Claude GitHub app (it did not on Titan); after pushing `main`, check the Pages run and, if none started, update a file through the GitHub connector.
- **Look:** the Prometheus look shared by every pillar except Titan.

## The hub's own job: the kit

- `pillars.json` is the list of every pillar. A new pillar: add it there, run `python3 tools/kit/scaffold.py --root /home/user {id}` (creates the standard files, never overwrites), give it tasks in its `docs/agents/queues.json`, run `python3 tools/kit/render.py --root /home/user`, then make its Drive folder (`Prometheus Hub/Pillars/{Pillar}/` with the doc `README — {Pillar}` from `docs/agents/drive/{id}/README.txt` and the folder `incoming (AI drop files)/`).
- `python3 tools/kit/render.py --check` fails when a rendered page is out of date.
- The layout and Claude's routine: `docs/PROMETHEUS_LAYOUT.md`. The rules every AI follows: `AI_START_HERE.md`.
- The desk reads `data/board.json` (rendered) for each door's state and open homework.

## Where things stand (2026-11-12, build d5): the hub holds every pillar

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
- **Consoles from d1** (`#/time` Kairos console, `#/money` Payoff console; engines in `deck/core/` and `deck/models/`) stay as hub
  consoles. The Kairos and Money pillar pages are back at their addresses. Which one each pillar becomes is the owner's decision.
- **Proofs:** `python3 proofs/run.py <url> [--mock-weather]` (CORE-1..4 plus the d1 proofs), `node --test proofs/unit/*.test.mjs`,
  and `.github/workflows/proofs.yml` runs them against the live site after each deployment. `STATUS.md` is the honest list.
- **Privacy:** public repository. No personal details in code; the owner's presets load from his private Drive file.
- **Deploy:** push `main`, then update `DEPLOY_STAMP.txt` through the GitHub connector and confirm the Pages build and the proofs-live run.
- **Titan is paused by the owner** (same day: "leave it for now"). Do not continue Titan's new front until he says.
