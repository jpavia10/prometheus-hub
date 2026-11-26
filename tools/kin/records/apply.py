#!/usr/bin/env python3
"""Kin staged-record review (Claude, 2026-11-26).

pillars/kin/docs/staged-records.json is the ledger: one entry per record page Gemini staged in the Kin Drive folder,
read by Claude, with what the page is, who it concerns, and the verdict:
  "source"     the page supports a Kin source (its id in "src"): the catalog marks it in-kin
  "set-aside"  nothing on it for the family, or too weak: the catalog marks it dropped; "note" says why
This script copies the verdicts into pillars/kin/album/catalog.js (the state column) and prints the counts.
Run: python3 tools/kin/records/apply.py [--check]
"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
LEDGER = os.path.join(ROOT, "pillars/kin/docs/staged-records.json")
CAT = os.path.join(ROOT, "pillars/kin/album/catalog.js")
led = json.load(open(LEDGER))
state = {}
for e in led["pages"]:
    assert e["verdict"] in ("source", "set-aside"), e
    assert e["verdict"] != "source" or e.get("src"), ("a source verdict needs src", e["name"])
    state[e["id"]] = "in-kin" if e["verdict"] == "source" else "dropped"
src = open(CAT).read()
seen, changed = set(), 0
def fix(m):
    global changed
    row = json.loads(m.group(1))
    if row[1] in state:
        seen.add(row[1])
        if row[5] != state[row[1]]:
            row[5] = state[row[1]]; changed += 1
        return "    " + json.dumps(row, ensure_ascii=False, separators=(", ", ": ")) + m.group(2)
    return m.group(0)
out = re.sub(r"^    (\[.*\])(,?)$", fix, src, flags=re.M)
missing = set(state) - seen
if missing: sys.exit("ledger ids not in the catalog: %s" % sorted(missing))
rows = [json.loads(x) for x in re.findall(r"^    (\[.*\]),?$", out, flags=re.M)]
left = sum(1 for r in rows if r[2] == "records" and not r[5])
print("reviewed %d record pages (%d sources, %d set aside); %d record pages left; catalog rows changed: %d" % (
    len(state), sum(1 for v in state.values() if v == "in-kin"), sum(1 for v in state.values() if v == "dropped"), left, changed))
if "--check" in sys.argv:
    sys.exit(1 if changed else 0)
open(CAT, "w").write(out)
