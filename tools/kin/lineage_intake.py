#!/usr/bin/env python3
"""Kin lineage intake (Claude, 2026-11-24): checks an outside AI's genealogy delivery against its task's contract and drafts
what Claude reviews before anything reaches pillars/kin/lineage/data.js. Nothing is merged by this tool: a record becomes an
assertion only after Claude has read its image (pillars/kin/docs/LINEAGE_METHOD.md, section 8).

usage: python3 tools/kin/lineage_intake.py FILE.json [--out DIR]

Checks (a problem rejects the file; a warning goes to the score notes):
  - a JSON array of objects with every field the task names (pillars/kin/docs/agents/queues.json, matched by file name)
  - kind is search / record / lead / summary, and the last row is the summary
  - result, source_class, info_class and evidence use the method's words
  - every question id is one the seed asks (Q1, Q2 ...)
  - a record row has a reference, a citation, a transcription and an identity argument; a found record has its URL
  - a derivative or index is never labelled original (warning), a transcription with an ellipsis looks shortened (warning)
Writes DIR/<file>.draft.json: the search rows as research-log entries, the record rows as candidate assertions, the summary.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(ROOT, "pillars", "kin", "lineage", "data.js")
QUEUE = os.path.join(ROOT, "pillars", "kin", "docs", "agents", "queues.json")
KINDS = {"search", "record", "lead", "summary"}
RESULTS = {"found", "not found", "candidate", "needs sign-in", "paid"}
SOURCE = {"original", "derivative", "authored"}
INFO = {"primary", "secondary", "undetermined"}
EVID = {"direct", "indirect", "negative"}


def seed():
    """The seed as data: data.js is a script that sets window.KIN_LINEAGE, so node evaluates it."""
    js = "global.window={};require(process.argv[1]);process.stdout.write(JSON.stringify(window.KIN_LINEAGE))"
    return json.loads(subprocess.run(["node", "-e", js, SEED], capture_output=True, text=True, check=True).stdout)


def task_for(name, queue):
    """The task whose deliver.file pattern ({YYYYMMDD-HHMM}) matches this file name."""
    for a in queue["agents"]:
        for t in a["tasks"]:
            pat = (t.get("deliver") or {}).get("file") or ""
            if not pat: continue
            rx = "^" + re.escape(pat).replace(re.escape("{YYYYMMDD-HHMM}"), r"\d{8}-\d{4}") + "$"
            if re.match(rx, name): return t
    return None


def check(rows, task, questions):
    probs, warns = [], []
    if not isinstance(rows, list) or not rows: return ["not a non-empty JSON array"], warns
    fields = [f["name"] for f in task["fields"]] if task else []
    for i, r in enumerate(rows, 1):
        if not isinstance(r, dict): probs.append(f"row {i}: not an object"); continue
        miss = [f for f in fields if f not in r]
        if miss: probs.append(f"row {i}: missing {', '.join(miss)}")
        k = r.get("kind")
        if k not in KINDS: probs.append(f"row {i}: kind '{k}' is not search, record, lead or summary")
        if k == "summary": continue
        if r.get("result") not in RESULTS: probs.append(f"row {i}: result '{r.get('result')}' is not one of {sorted(RESULTS)}")
        q = str(r.get("question") or "")
        for qid in re.findall(r"Q\d+", q) or [q]:
            if qid not in questions: probs.append(f"row {i}: question '{qid}' is not one the seed asks")
        if k == "record":
            for f in ("reference", "citation", "transcription", "identity"):
                if not str(r.get(f) or "").strip(): probs.append(f"row {i}: a record without its {f}")
            if r.get("source_class") not in SOURCE: probs.append(f"row {i}: source_class '{r.get('source_class')}'")
            if r.get("info_class") not in INFO: probs.append(f"row {i}: info_class '{r.get('info_class')}'")
            if r.get("evidence") not in EVID: probs.append(f"row {i}: evidence '{r.get('evidence')}'")
            if r.get("result") == "found" and not str(r.get("url") or "").startswith("http"): probs.append(f"row {i}: a found record without the URL of its image")
            if r.get("source_class") == "original" and re.search(r"\bindex\b|\babstract\b|\btranscript\b", str(r.get("record", "")) + " " + str(r.get("citation", "")), re.I):
                warns.append(f"row {i}: labelled original, but its record or citation says index, abstract or transcript")
            if re.search(r"\.\.\.|…", str(r.get("transcription") or "")): warns.append(f"row {i}: the transcription has an ellipsis; is it shortened?")
        if k == "search" and not str(r.get("search") or "").strip(): probs.append(f"row {i}: a search row that does not say what was searched")
    if rows and isinstance(rows[-1], dict) and rows[-1].get("kind") != "summary": probs.append("the last row is not the summary")
    if sum(1 for r in rows if isinstance(r, dict) and r.get("kind") == "summary") > 1: warns.append("more than one summary row")
    return probs, warns


def draft(rows, task, who, date, start):
    log, cands, summ, n = [], [], None, start
    for r in rows:
        if not isinstance(r, dict): continue
        if r.get("kind") == "summary": summ = r; continue
        if r.get("kind") == "search":
            n += 1; log.append({"id": f"L{n}", "date": date, "by": who, "q": r.get("question"), "where": r.get("repository") or "", "terms": r.get("search"), "result": r.get("result"), "note": r.get("identity") or ""})
        if r.get("kind") in ("record", "lead"):
            cands.append({k: r.get(k) for k in ("question", "kind", "result", "record", "repository", "reference", "url", "citation", "transcription", "source_class", "info_class", "evidence", "identity", "conflicts")})
    return {"task": task["id"] if task else None, "log": log, "candidates": cands, "summary": summ,
            "next": "Claude reads every candidate's image against its transcription before writing an assertion into data.js."}


def main(argv):
    if not argv or argv[0].startswith("-"): print(__doc__); return 2
    path = argv[0]; out = argv[argv.index("--out") + 1] if "--out" in argv else None
    name = os.path.basename(path)
    try: rows = json.load(open(path, encoding="utf-8"))
    except Exception as e: print(f"REJECT {name}: not valid JSON ({e})"); return 1
    L = seed(); task = task_for(name, json.load(open(QUEUE, encoding="utf-8")))
    probs, warns = check(rows, task, {q["id"] for q in L["questions"]})
    if not task: probs.insert(0, "the file name matches no Kin task's deliver.file")
    for w in warns: print("warn  " + w)
    for p in probs: print("FAIL  " + p)
    m = re.search(r"_(\d{4})(\d{2})(\d{2})-\d{4}\.json$", name); date = "-".join(m.groups()) if m else ""
    who = name.split("_")[1].capitalize() if name.count("_") >= 2 else "unknown"
    start = max([int(x["id"][1:]) for x in L.get("log", []) if re.match(r"^L\d+$", x["id"])] or [0])
    d = draft(rows if isinstance(rows, list) else [], task, who, date, start)
    if out:
        os.makedirs(out, exist_ok=True); dst = os.path.join(out, name.replace(".json", ".draft.json"))
        json.dump(d, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1); print("draft " + dst)
    kinds = {}
    for r in rows if isinstance(rows, list) else []:
        if isinstance(r, dict): kinds[r.get("kind")] = kinds.get(r.get("kind"), 0) + 1
    print(("REJECT " if probs else "OK ") + f"{name}: task {task['id'] if task else '?'}, {len(rows) if isinstance(rows, list) else 0} rows {kinds}, {len(d['log'])} searches, {len(d['candidates'])} records or leads, {len(warns)} warnings")
    return 1 if probs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
