#!/usr/bin/env python3
"""Build the Forge's one source of truth: docs/agents/forge.json.

Owner, 2026-11-19: "I checked the forge it seems dated ... that whole page needs reengineered because its never accurate when I check".
Why it was wrong: the page rebuilt the state in the browser from about 30 files in different formats, and three rules were off:
withdrawn tasks counted as open (Gemini showed 87 "out now"; 19 were real), a delivered task showed as done before anyone checked it,
and a score row whose AI column read "Gemini (4 Neon)" counted as a separate AI. Nothing said how old the numbers were.

Now this script reads every source once, puts every task in exactly one state, and writes one file the page only draws:
  todo       handed out and not delivered (late when its due date or lease has passed)
  queued     handed out for later (state next / later)
  delivered  the AI says it is done (completions ledger) and Claude has not checked it yet
  done       checked and closed in its queue
  withdrawn  taken back (replaced, not legit, blocked for good): never counted
Anything it cannot place goes into `warnings`, which the page shows.

Sources: the hub and pillar queues (this checkout), Midas's queue, Titan's research loop and projects (local paths or the raw GitHub URLs),
the Gemini agents' workboard, the completions ledger, Titan's and every pillar's score sheet, Titan's roles (probation).

usage: python3 tools/forge/build.py [--titan PATH_OR_URL] [--midas PATH_OR_URL] [--out docs/agents/forge.json] [--today YYYY-MM-DD]
Writes only when something changed, or when the last check is over 3 hours old (so the page can tell a stopped builder from a quiet day).
Prints "changed" or "unchanged" last. Exit 0 always unless the hub's own files cannot be read.
"""
import datetime as dt
from zoneinfo import ZoneInfo
import json
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW_TITAN = "https://raw.githubusercontent.com/jpavia10/titan-reliquary-preview/main/"
RAW_MIDAS = "https://raw.githubusercontent.com/jpavia10/midas-ledger/main/"
AIS = ["Gemini", "Grok", "Muse", "ChatGPT", "Gemini API", "Argon", "Hydrogen", "Claude"]
FLOOR = {"Gemini": 50, "Grok": 6, "Muse": 6, "ChatGPT": 2, "Gemini API": 1, "Argon": 1, "Hydrogen": 1}   # owner, 2026-11-16; Gemini 50 since 2026-11-21 ("Load the slave up"); Grok 6 = its probation cap
OPEN = {"now"}; LATER = {"next", "later", "always"}; CLOSED = {"done"}; GONE = {"withdrawn", "parked", "dropped", "cancelled"}
KIND = {"cite": "Cite catalogue facts", "catno": "Settle catalogue numbers", "verify": "Verify facts others wrote", "read-mint": "Read mint marks from photos",
        "story-check": "Fact-check stories", "plain-story": "Rewrite stories in plain English", "research": "Research open questions", "value": "Price coins with a dated source",
        "arbitrate": "Third reader on disagreements", "contradiction": "Settle contradictions", "fill": "Fill Phase 2 facts"}
WARN = []


def ai_name(x):
    """'Gemini (4 Neon)', 'gemini', 'model:gemini-api:...' and 'Gemini API' all land on one of AIS."""
    s = str(x or "").strip().lower().replace("model:", "")
    if not s: return None
    if s.startswith("gemini api") or s.startswith("gemini-api"): return "Gemini API"
    for a in AIS:
        if s.split()[0].split("-")[0].split("(")[0] == a.lower().split()[0]: return a
    return None


def read(src, rel, text=False):
    """src: a local directory or a URL base. Returns parsed JSON / text, or None."""
    if not src: return None
    try:
        if re.match(r"https?://", src):
            with urllib.request.urlopen(src.rstrip("/") + "/" + rel, timeout=25) as r: body = r.read().decode("utf-8")
        else:
            with open(os.path.join(src, rel), encoding="utf-8") as f: body = f.read()
        return body if text else json.loads(body)
    except Exception as e:
        return None


def ledger_map():
    j = read(ROOT, "docs/agents/completions.json") or {}
    m = {}
    for e in j.get("done", []):
        if isinstance(e, dict) and e.get("key"): m[e["key"]] = e
    return m, j.get("synced") or ""


def status_of(state, key, alias, reopened, led):
    st = str(state or "now").lower()
    if st in GONE: return "withdrawn", None
    if st in CLOSED: return "done", None
    e = led.get(key) or (led.get(alias) if alias else None)
    # 2026-11-20 (Gemini trial 4 #5): a delivery stamped the same day as a date-only reopen used to keep the task "delivered";
    # it now counts as before the reopen. A reopen with a time ("2026-11-20T18:00:00Z") is compared to the second.
    ts = str(e.get("ts", "")) if e else ""
    before = (ts < reopened) if (reopened and len(reopened) > 10) else (ts[:10] <= reopened if reopened else False)
    if e and not before:
        return ("delivered" if st in OPEN or st in LATER else "done"), e
    if st in OPEN: return "todo", None
    if st in LATER: return "queued", None
    WARN.append(f"{key}: unknown state '{state}' (counted as to do)")
    return "todo", None


def hub_tasks(led, sources):
    reg = read(ROOT, "pillars.json")
    if reg is None: sys.exit("cannot read pillars.json")
    lst = reg if isinstance(reg, list) else reg.get("pillars", [])
    places = [p for p in lst if p.get("id") == "hub" or (p.get("home") and p.get("state") != "paused" and p.get("id") != "presence")]
    out, ok, names = [], 0, []
    for p in places:
        name = (p.get("name") or p["id"]).split(" · ")[0]; names.append(name)
        rel = "docs/agents/queues.json" if p["id"] == "hub" else p["home"].rstrip("/") + "/docs/agents/queues.json"
        q = read(ROOT, rel)
        if not q: WARN.append(f"{name}: queue {rel} unreadable"); continue
        ok += 1; out += queue_tasks(q, name, p["id"], "hub", led, f"https://github.com/jpavia10/prometheus-hub/blob/main/{'' if p['id'] == 'hub' else p['home'].rstrip('/') + '/'}docs/agents/")
    return out, ok, len(places), names


def queue_tasks(q, where, pid, src, led, page):
    out = []
    for a in q.get("agents", []):
        who = ai_name(a.get("name") or a.get("id"))
        if not who: WARN.append(f"{where}: unknown AI '{a.get('id')}'"); continue
        for t in a.get("tasks", []):
            st, e = status_of(t.get("state"), t.get("id"), None, t.get("reopened", ""), led)
            dl = t.get("deliver") or {}
            out.append({"ai": who, "src": src, "where": where, "pid": pid, "id": t.get("id"), "title": t.get("title", ""), "status": st, "due": t.get("due", ""),
                        "items": t.get("count") or 0, "closed": t.get("closed", ""), "review": t.get("review", ""),
                        "reopened": (t.get("reopened", "") if st == "todo" else ""),   # 2026-11-20: a sent-back task is marked as such on the Forge
                        "delivered": ({"what": e.get("what", ""), "by": e.get("by", ""), "ts": e.get("ts", "")} if e else None),
                        "detail": {"why": t.get("why", ""), "steps": t.get("steps", []), "make": dl.get("file", ""), "folder": dl.get("folder", ""), "shape": dl.get("shape", ""),
                                   "done": t.get("done_when", ""), "checks": t.get("checks", []), "link": f"{page}QUEUE_{(a.get('id') or '').lower()}.md"}})
    return out


def titan_loop(titan, today):
    out, ok = [], 0
    for k in ["gemini", "grok", "muse", "chatgpt", "gemini-api"]:
        j = read(titan, f"docs/agents/homework/{k}.json")
        if j is None: WARN.append(f"Titan loop: {k}.json unreadable"); continue
        ok += 1
        for a in j.get("assignments", []):
            lease = str(a.get("lease_until") or "")[:10]; n = len(a.get("items") or [])
            st = "todo" if a.get("status") == "open" else "done" if a.get("status") in ("done", "answered", "closed") else "withdrawn"
            out.append({"ai": ai_name(k), "src": "titan", "where": "Titan", "pid": "titan", "id": a.get("id"), "title": f"{KIND.get(a.get('kind'), a.get('kind'))} · {n} {'item' if n == 1 else 'items'}",
                        "status": st, "due": lease, "items": n, "closed": str(a.get("closed") or "")[:10], "review": "", "delivered": None,
                        "detail": {"why": "Generated by Titan's research loop from a gap in the collection data.", "make": f"changes_{k}_{{YYYYMMDD-HHMM}}.jsonl (the answer sheet, filled)",
                                   "folder": "Titan Reliquary/collection-incoming (AI change files)/", "sheet": f"https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/agents/homework/sheets/{a.get('id')}.jsonl",
                                   "link": f"https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/agents/QUEUE_{k}.md"}})
    return out, ok


def titan_projects(titan, led):
    q = read(titan, "docs/agents/queues.json")
    if not q: WARN.append("Titan projects: queues.json unreadable"); return [], False
    out = []
    for a in q.get("agents", []):
        who = ai_name(a.get("id"))
        if not who: continue
        for t in a.get("tasks", []):
            key = f"T-{a['id']}-{t.get('n')}"; alias = (re.search(r"run_id '([A-Za-z0-9._:-]+)'", t.get("what", "")) or [None, None])[1]
            st, e = status_of(t.get("state"), key, alias, t.get("reopened", ""), led)
            out.append({"ai": who, "src": "tproj", "where": "Titan", "pid": "titan", "id": key, "alias": alias or "", "title": t.get("title", ""), "status": st, "due": t.get("due", ""),
                        "items": 0, "closed": t.get("closed", ""), "reopened": (t.get("reopened", "") if st == "todo" else ""),   # trial 4 #8
                        "review": t.get("review", ""), "delivered": ({"what": e.get("what", ""), "by": e.get("by", ""), "ts": e.get("ts", "")} if e else None),
                        "detail": {"what": t.get("what", ""), "done": t.get("done_when", ""), "link": f"https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/agents/QUEUE_{a['id']}.md"}})
    return out, True


def workboard():
    md = read(ROOT, "docs/antigravity/WORKBOARD.md", text=True)
    if md is None: return [], False
    out = []
    for line in md.split("\n"):
        m = re.match(r"^\|\s*`(AGY-\d+)`\s*\|", line)
        if not m: continue
        c = [x.strip() for x in line.split("|")]; status = (c[5] if len(c) > 5 else "").upper()
        # 2026-11-20 (Gemini trial 4 #6, #7): "DONE (2026-11-18)" is done, withdrawn/cancelled rows leave the workload, and a row with
        # two owners ("Argon / Hydrogen") counts once, under its first owner the Forge knows, with the others kept as co-owners.
        st = ("withdrawn" if any(k in status for k in ("WITHDRAWN", "CANCEL", "DROPPED", "PARKED")) else "done" if status.startswith("DONE")
              else "queued" if "WAIT" in status else "todo")
        owners = [x.strip() for x in (c[4] if len(c) > 4 else "").split("/") if x.strip()]
        known = [ai_name(x) for x in owners if ai_name(x)]
        for who in (known[:1] or owners[:1]):
            out.append({"ai": who, "co": [x for x in known[1:]], "src": "board", "where": "Workboard", "pid": "board", "id": m.group(1), "title": c[3], "status": st, "due": "", "items": 0,
                        "closed": "", "review": "", "delivered": None, "detail": {"what": ("Done when: " + c[7]) if len(c) > 7 and c[7] else "",
                        "link": "https://github.com/jpavia10/prometheus-hub/blob/main/docs/antigravity/WORKBOARD.md"}})
    return out, True


def titan_scores(titan):
    md = read(titan, "collaborators/CONTRIBUTOR_SCORES.md", text=True)
    if md is None: WARN.append("Titan scorecard unreadable"); return []
    out, who = [], None
    for line in md.split("\n"):
        sec = re.match(r"^## (.+?)\s*(\((.*)\))?\s*$", line)
        if sec: who = sec.group(1).strip() if sec.group(1).strip() in AIS else None; continue
        if not who or not re.match(r"^\|\s*\d+\s*\|", line): continue
        m = re.search(r"\*\*(\d+(?:\.\d+)?)\s*/\s*10\*\*", line)
        if not m: continue
        c = [x.strip() for x in line.split("|")]
        out.append({"ai": who, "n": int(c[1]), "date": c[2], "what": c[3].replace("`", "")[:160], "score": float(m.group(1)), "where": "Titan"})
    return out


def hub_scores(names_rel):
    out, pending = [], []
    for name, rel in names_rel:
        md = read(ROOT, rel, text=True)
        if md is None: continue
        for line in md.split("\n"):
            if not re.match(r"^\|\s*\d+\s*\|", line): continue
            c = [x.strip() for x in line.split("|")]
            if len(c) < 13: continue
            who = ai_name(c[3])
            if not who: WARN.append(f"{name} scores row {c[1]}: unknown AI '{c[3]}'"); continue
            row = {"ai": who, "n": int(c[1]), "date": c[2], "what": c[4].replace("`", "")[:160], "task": c[5], "where": name}
            if re.match(r"^\d+(\.\d+)?$", c[11]): out.append({**row, "score": float(c[11])})
            else: pending.append({**row, "note": c[11]})
    return out, pending


def main(argv):
    arg = lambda k, d: argv[argv.index(k) + 1] if k in argv else d
    titan = arg("--titan", RAW_TITAN); midas = arg("--midas", RAW_MIDAS); out_path = os.path.join(ROOT, arg("--out", "docs/agents/forge.json"))
    # trial 4 #4: GitHub's runners are on UTC, so after 4 pm Pacific "today" was already tomorrow and same-day tasks showed as late.
    today = arg("--today", dt.datetime.now(ZoneInfo("America/Los_Angeles")).date().isoformat()); now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    led, synced = ledger_map()
    tasks, q_ok, q_all, names = hub_tasks(led, None)
    mq = read(midas, "docs/agents/queues.json")
    if mq: tasks += queue_tasks(mq, "Midas Ledger", "midas", "hub", led, "https://github.com/jpavia10/midas-ledger/blob/main/docs/agents/"); q_ok += 1
    else: WARN.append("Midas Ledger: queue unreadable")
    q_all += 1
    tl, tl_ok = titan_loop(titan, today); tasks += tl
    tp, tp_ok = titan_projects(titan, led); tasks += tp
    wb, wb_ok = workboard(); tasks += wb
    for t in tasks:                                               # late is a flag on todo, not a separate state
        t["late"] = t["status"] == "todo" and bool(t["due"]) and t["due"] < today
    seen = {}
    for t in tasks:
        k = (t["src"], t["where"], t["ai"], t["id"])
        if k in seen: WARN.append(f"duplicate task {t['id']} for {t['ai']} in {t['where']}")
        seen[k] = 1
    ts = titan_scores(titan)
    reg = read(ROOT, "pillars.json"); lst = reg if isinstance(reg, list) else reg.get("pillars", [])
    rels = [((p.get("name") or p["id"]).split(" · ")[0], "collaborators/CONTRIBUTOR_SCORES.md" if p["id"] == "hub" else p["home"].rstrip("/") + "/collaborators/CONTRIBUTOR_SCORES.md")
            for p in lst if p.get("id") == "hub" or (p.get("home") and p.get("state") != "paused" and p.get("id") != "presence")]
    hs, pending = hub_scores(rels)
    roles = read(titan, "docs/agents/roles.json") or {}
    prob = {ai_name(k): bool(v.get("probation")) for k, v in (roles.get("agents") or {}).items() if ai_name(k)}
    week = (dt.date.fromisoformat(today) + dt.timedelta(days=7)).isoformat(); ago7 = (dt.date.fromisoformat(today) - dt.timedelta(days=7)).isoformat()
    per = {}
    for a in AIS:
        mine = [t for t in tasks if t["ai"] == a]
        todo = [t for t in mine if t["status"] == "todo"]
        sc = [s for s in ts + hs if s["ai"] == a]; sc.sort(key=lambda s: s["date"])
        last10 = sc[-10:]
        per[a] = {"todo": len(todo), "late": sum(t["late"] for t in todo), "due7": sum(1 for t in todo if t["due"] and today <= t["due"] <= week),
                  "delivered": sum(t["status"] == "delivered" for t in mine), "queued": sum(t["status"] == "queued" for t in mine),
                  "done7": sum(1 for t in mine if t["status"] == "done" and t.get("closed", "") >= ago7), "withdrawn": sum(t["status"] == "withdrawn" for t in mine),
                  "items": sum(t["items"] for t in todo), "floor": FLOOR.get(a, 0), "by": {s: sum(1 for t in todo if t["src"] == s) for s in ("hub", "titan", "tproj", "board")},
                  "probation": prob.get(a, False),
                  "scores": {"n": len(sc), "avg": round(sum(s["score"] for s in sc) / len(sc), 2) if sc else None, "last10": round(sum(s["score"] for s in last10) / len(last10), 2) if last10 else None,
                             "last": sc[-1] if sc else None}}
    places = {}
    for t in tasks:
        if t["status"] not in ("todo", "delivered"): continue
        p = places.setdefault(t["where"], {"todo": 0, "delivered": 0, "by": {}})
        p[t["status"]] += 1
        if t["status"] == "todo": p["by"][t["ai"]] = p["by"].get(t["ai"], 0) + 1
    for n in names + ["Midas Ledger", "Titan", "Workboard"]: places.setdefault(n, {"todo": 0, "delivered": 0, "by": {}})
    body = {"version": 2, "today": today,
            "sources": {"queues": {"read": q_ok, "of": q_all}, "titan_loop": {"read": tl_ok, "of": 5}, "titan_projects": tp_ok, "workboard": wb_ok,
                        "ledger": {"entries": len(led), "synced": synced}, "titan_scores": len(ts), "hub_scores": len(hs), "pending_scores": len(pending)},
            "totals": {"todo": sum(t["status"] == "todo" for t in tasks), "late": sum(t["late"] for t in tasks), "due7": sum(p["due7"] for p in per.values()),
                       "delivered": sum(t["status"] == "delivered" for t in tasks), "queued": sum(t["status"] == "queued" for t in tasks), "withdrawn": sum(t["status"] == "withdrawn" for t in tasks)},
            "per": per, "places": places, "tasks": tasks, "scores": ts, "hub_scores": hs, "pending_scores": pending, "warnings": sorted(set(WARN))}
    old = None
    try: old = json.load(open(out_path))
    except Exception: pass
    strip = lambda d: {k: v for k, v in (d or {}).items() if k not in ("built", "checked")}
    changed = strip(old) != body
    stale = not old or not old.get("checked") or (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(old["checked"].replace("Z", "+00:00"))).total_seconds() > 3 * 3600
    if changed or stale:
        doc = {"built": now if changed else old.get("built", now), "checked": now, **body}
        with open(out_path, "w", encoding="utf-8") as f: json.dump(doc, f, ensure_ascii=False, indent=1); f.write("\n")
    t = body["totals"]
    print(f"forge: {t['todo']} to do ({t['late']} late), {t['delivered']} delivered awaiting a check, {t['queued']} queued, {t['withdrawn']} withdrawn; "
          f"queues {q_ok}/{q_all}, Titan loop {tl_ok}/5, {len(ts)} Titan scores, {len(hs)} hub scores, {len(WARN)} warnings")
    print("changed" if changed or stale else "unchanged")


if __name__ == "__main__":
    main(sys.argv[1:])
