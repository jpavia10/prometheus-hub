<!-- doc-status: current; normative: yes -->
# The Prometheus layout (Claude, 2026-11-05)

Owner, 2026-11-05: "make the file structure of the prometheus project and another file structure for each of the pillars so it mimics the titans ai collab layout ... Predictable homework assignments. I can ask do you have homework and it checks each folder for each pillar ... Separate the ais and make sure theres a readme and all necessary instruction files. Compartmentalization will create file redundancy but its better for long term development."

## One pillar = one repo + one Drive folder, always the same shape

| | GitHub repo | Drive `Prometheus Hub/Pillars/{Pillar}/` |
|---|---|---|
| What it is | `README.md` | `README — {Pillar}` |
| Rules for AIs | `AI_START_HERE.md` (+ the hub's for every pillar) | in the README doc |
| Claude's notes | `CLAUDE.md` | |
| Homework source | `docs/agents/queues.json` | |
| Homework pages | `docs/agents/QUEUE_{grok,gemini,muse,chatgpt}.md` | a section per AI in `README — {Pillar}` |
| Where AIs save | (pull requests for code) | `incoming (AI drop files)/` |
| Log + scores | `collaborators/SHARED_LOG.md`, `collaborators/CONTRIBUTOR_SCORES.md` | |

Seats without a repo: `jpavia10/prometheus-hub/pillars/{id}/` holds the same files until the repo exists; moving them is a copy.

## The hub on top

| | |
|---|---|
| `pillars.json` | every pillar: repo, live link, state, look, private or not |
| `tools/kit/render.py` | reads every pillar's `queues.json`, writes each pillar's `QUEUE_{ai}.md`, `HOMEWORK.md` (the board), `data/board.json` (the desk shows it) and the Drive texts in `docs/agents/drive/` |
| `docs/agents/drive/HOMEWORK_{ai}.txt` | each AI's one page for every pillar = Drive `Prometheus Hub/{AI folder}/HOMEWORK — {Name} (every pillar)` |
| `docs/agents/drive/{pillar}/README.txt` | = Drive `Prometheus Hub/Pillars/{Pillar}/README — {Pillar}` (what it is + each AI's list) |
| `AI_START_HERE.md` | the rules for every pillar |

Titan Reliquary is the exception: its own loop (`tools/agents/homework.py` there), own Drive folder, own themes. The hub only counts its open homework.

## Claude's routine (each session that touches a pillar)

1. Read Drive `Prometheus Hub/Pillars/*/incoming (AI drop files)/` for new files; check each against its task's checks; score it in that pillar's `CONTRIBUTOR_SCORES.md`; write the result in `FEEDBACK — {AI}`; trash what was merged or rejected (rejected: leave `{name}.REJECTED.txt` with the reason).
2. Edit the pillar's `docs/agents/queues.json` (close done tasks: `"state": "done"`; add the next ones; every AI keeps at least 3 open tasks across the pillars).
3. `python3 tools/kit/render.py --root /home/user` (all repos cloned side by side), commit each repo.
4. Copy every changed `docs/agents/drive/*.txt` into its Drive doc.
