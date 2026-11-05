#!/usr/bin/env python3
"""Give a pillar the standard Prometheus files (Claude, 2026-11-05). Creates only what is missing, never overwrites.

    python3 tools/kit/scaffold.py [--root /home/user] [pillar-id ...]     default: every pillar in pillars.json (not Titan, not paused)
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
HUB = os.path.dirname(os.path.dirname(HERE))
START = "https://github.com/jpavia10/prometheus-hub/blob/main/AI_START_HERE.md"


def files_for(p, reg):
    name, pid = p["name"], p["id"]
    drive = f"Prometheus Hub/Pillars/{name}/"
    repo = p.get("repo") or f"jpavia10/prometheus-hub (folder {p['home']}/ until it has its own repo)"
    private = p.get("private")
    out = {}
    out["AI_START_HERE.md"] = f"""<!-- doc-status: current; normative: yes -->
# {name}: start here (any AI)

{p['what']}

1. **Read the rules for every pillar first:** {START} (where everything is, how files are named, how they are checked).
2. **Your homework here:** `docs/agents/QUEUE_{{your id}}.md` in this repo, or Drive `{drive}WORK QUEUE — {{your name}}`. Your homework in every pillar on one page: Drive `Prometheus Hub/{{your folder}}/HOMEWORK — {{your name}} (every pillar)`.
3. **Save what you make** in Drive `{drive}incoming (AI drop files)/` as `{pid}_{{ai}}_{{what}}_{{YYYYMMDD-HHMM}}.{{ext}}`. Code: a branch `{{ai}}/{{what}}` and a pull request on `{repo}`.
4. **Look:** the Prometheus look (cool midnight, depth, light; no neon, no Titan gold).
""" + (f"5. **Private pillar.** No real balances, account numbers, message text or positions anywhere but the pillar's own encrypted or on-device store. Homework here uses made-up data or public research only.\n" if private else "")
    out["CLAUDE.md"] = f"""<!-- doc-status: current; normative: yes -->
# {name}: integrator notes (Claude)

{p['what']} Part of Prometheus (`jpavia10/prometheus-hub`, `pillars.json`). Live: {p.get('live') or 'not yet'}.

- **Ownership:** Claude integrates (reviews and merges every pull request and every Drive drop file). Grok, Gemini, Muse and ChatGPT contribute through homework (`docs/agents/queues.json`), Drive `{drive}incoming (AI drop files)/` and pull requests on `{{ai}}/...` branches.
- **Homework:** edit `docs/agents/queues.json` here, then in the hub run `python3 tools/kit/render.py --root /home/user` (every repo cloned side by side) and copy the changed `docs/agents/drive/*.txt` into their Drive docs. Every task names its count, its file, its checks and what makes it not done (owner, 2026-11-05: "Clear measurable objectives not just big idea with poor Implementation").
- **Scoring:** every outside file gets a row in `collaborators/CONTRIBUTOR_SCORES.md` and a note in Drive `Prometheus Hub/{{AI folder}}/FEEDBACK — {{name}} (every pillar)`.
- **Log:** a 2-3 line entry in `collaborators/SHARED_LOG.md` after every change.
- **Deploying:** GitHub Pages may not rebuild for pushes made by the Claude GitHub app (it did not on Titan); after pushing `main`, check the Pages run and, if none started, update a file through the GitHub connector.
- **Look:** the Prometheus look shared by every pillar except Titan.
""" + ("- **Privacy:** this pillar holds private data. Nothing private in the repo, Drive docs or homework; AIs work on made-up data.\n" if private else "")
    out["collaborators/SHARED_LOG.md"] = f"""# {name}: shared log

Newest first. Every contributor (Claude and every AI) adds a dated 2-3 line entry after a change.

### [2026-11-05] Claude: the Prometheus layout
- This pillar got the standard files (AI_START_HERE, CLAUDE, homework in docs/agents/, this log, the scorecard) and its Drive folder `{drive}`. Homework for every AI is in docs/agents/QUEUE_*.md.
"""
    out["collaborators/CONTRIBUTOR_SCORES.md"] = f"""# {name}: contributor scores

Every outside file, scored by Claude (same rubric as Titan Reliquary): **place** 0-2 (saved where and as the task says), **accepted** 0-2 (passes the task's checks), **accurate** 0-2 (sources open and say what the file says), **complete** 0-2 (the whole count), **on the sheet** 0-2 (nothing outside the task). 10 is the best.

| # | Date | AI | File | Task | Place | Accepted | Accurate | Complete | On sheet | Score | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
"""
    if p.get("home"):        # a seat: its README lives here too
        out["README.md"] = f"""# {name}

{p['what']}

A seat on the Prometheus desk: no page yet. Its files live here in `jpavia10/prometheus-hub/{p['home']}/` until it gets its own repo. First step: the spec sheet (homework `{pid.upper()[:3]}-GEM-01`), then a second reader, then Claude builds version 1.

Drive: `{drive}` · Homework: `docs/agents/QUEUE_*.md`
"""
    return out


def main(argv):
    root = argv[argv.index("--root") + 1] if "--root" in argv else os.path.dirname(HUB)
    want = [a for a in argv if not a.startswith("--") and a != root]
    reg = json.load(open(os.path.join(HUB, "pillars.json")))
    made = 0
    for p in reg["pillars"]:
        if p.get("own_loop") or p.get("paused") or (want and p["id"] not in want):
            continue
        base = HUB if p["id"] == "hub" else (os.path.join(HUB, p["home"]) if p.get("home") else os.path.join(root, p["repo"].split("/")[1]))
        if not os.path.isdir(base):
            print("missing:", base); continue
        for rel, text in files_for(p, reg).items():
            f = os.path.join(base, rel)
            if os.path.exists(f):
                continue
            os.makedirs(os.path.dirname(f), exist_ok=True)
            open(f, "w", encoding="utf-8").write(text)
            made += 1
            print("made", os.path.relpath(f, root))
    print(made, "files made")


if __name__ == "__main__":
    main(sys.argv[1:])
