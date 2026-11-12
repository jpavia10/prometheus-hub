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

## Where things stand (2026-11-12): the deck replaced the desk

Read this first. The old desk (index.html + hub.js + pillar pages on kit/) is retired as the product; `archive/pre-deck-2026-11-12` has it.
- **The product is `deck/`**: one page (`index.html` boots `deck/app.js`), native ES modules, no build step. One store (`deck/core/store.js`, localStorage `prom.deck.*`, versioned export/import), pure models (`deck/models/*.js`: slice, feed, search), views (`deck/views/*.js`), look in `deck/deck.css` (tokens at the top). The arrival view is `deck/views/picture.js` (the day ring). The sky is `deck/core/atmo.js` (WebGL, time of day + weather from `deck/core/weather.js`).
- **Rule: a capability is listed in `deck/caps.js` only when its proof passes** (`proofs/run.py`, `STATUS.md`). Live now: Time, Money. Next: Garage, House, then the STATUS order.
- **Privacy:** the repository is public. The owner's presets (loan, home point, house project, vehicle) live in a private deck file in his Drive that he loads on the device; the site ships invented demo data (`deck/data/demo.js`). Never commit personal details.
- **Proof hooks:** `?now=2026-11-20T09:00` pins the clock, `?demo=1` loads the demo deck on a clean device, `window.__deck` exposes the store.
- **Deploy:** push `main`, then update `DEPLOY_STAMP.txt` through the GitHub connector (Pages does not build for the Claude app's pushes) and confirm the "pages build and deployment" run.
- Old files still in the tree because `sylade.html` uses them: `styles.css`, `hub.js`, `desk-*.js`, `src/`. Remove them when Presence is rebuilt. `pillars/kairos/` and `pillars/money/` now redirect into the deck; the other old pillar pages are unlinked until rebuilt.
