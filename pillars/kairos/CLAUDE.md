<!-- doc-status: current; normative: yes -->
# Kairos Meridian: integrator notes (Claude)

Time: calendar, deadlines, the day. Part of Prometheus (`jpavia10/prometheus-hub`, `pillars.json`). Live: not yet.

- **Ownership:** Claude integrates (reviews and merges every pull request and every Drive drop file). Grok, Gemini, Muse and ChatGPT contribute through homework (`docs/agents/queues.json`), Drive `Prometheus Hub/Pillars/Kairos Meridian/incoming (AI drop files)/` and pull requests on `{ai}/...` branches.
- **Homework:** edit `docs/agents/queues.json` here, then in the hub run `python3 tools/kit/render.py --root /home/user` (every repo cloned side by side) and copy the changed `docs/agents/drive/*.txt` into their Drive docs. Every task names its count, its file, its checks and what makes it not done (owner, 2026-11-05: "Clear measurable objectives not just big idea with poor Implementation").
- **Scoring:** every outside file gets a row in `collaborators/CONTRIBUTOR_SCORES.md` and a note in Drive `Prometheus Hub/{AI folder}/FEEDBACK — {name} (every pillar)`.
- **Log:** a 2-3 line entry in `collaborators/SHARED_LOG.md` after every change.
- **Deploying:** GitHub Pages may not rebuild for pushes made by the Claude GitHub app (it did not on Titan); after pushing `main`, check the Pages run and, if none started, update a file through the GitHub connector.
- **Look:** the Prometheus look shared by every pillar except Titan.
