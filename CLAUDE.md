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
