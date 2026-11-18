#!/usr/bin/env python3
"""Copy the Forge completions ledger from Drive into the repo, so Forge shows finished work without anyone folding it in.

Owner, 2026-11-18: "whenever an assignment is completed it automatically shows updated status on the forge. At this point it
seems like it needs to be waiting to be folded in by an auditor." Every AI appends one entry to the Drive file
`forge-completions.json` when it finishes a task (docs/agents/COMPLETIONS.md). Browsers cannot read Drive files cross-origin, so
Forge reads the in-repo mirror docs/agents/completions.json; this script refreshes that mirror and .github/workflows/ledger.yml
runs it every 10 minutes and commits when something changed (the bot's push redeploys Pages by itself).

Rules:
- The mirror only grows: entries are merged by (key, by, ts), so a Drive save that drops older lines loses nothing here.
- Every entry is checked and cleaned: key and by are short plain ids, what is plain text (at most 400 characters, control
  characters removed, dollar amounts masked because the site is public), ts is ISO 8601 UTC. Bad entries are skipped and
  counted, never fatal.
- If Drive cannot be read or the file is not ledger JSON, the mirror stays as it is and the run says why (exit 0, so a
  Drive hiccup does not mail a failure every 10 minutes).

Usage: sync_ledger.py MIRROR [--source URL_OR_PATH]   (default source: the Drive file, id below)
Exit 0 always; prints "changed" or "unchanged" on the last line for the workflow.
"""
import datetime as dt
import json
import re
import sys
import urllib.request

DRIVE_ID = "1QEaQylVPtfbAczGDBkt4GAwIVGyY372W"
DEFAULT_SOURCE = f"https://drive.google.com/uc?export=download&id={DRIVE_ID}"
KEY = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$")
BY = re.compile(r"^[a-z0-9][a-z0-9 ._:-]{0,39}$")
MONEY = re.compile(r"\$\s?\d[\d,]*(?:\.\d+)?(?:\s?[kKmM]\b)?")
CTRL = re.compile(r"[\x00-\x1f\x7f]")


def note(msg):
    print(f"::notice::{msg}" if "GITHUB_ACTIONS" in __import__("os").environ else msg)


def read_source(src):
    if re.match(r"^https?://", src):
        req = urllib.request.Request(src, headers={"User-Agent": "prometheus-forge-ledger-sync"})
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ValueError("ledger is over 2 MB")
        return raw.decode("utf-8-sig")
    with open(src, encoding="utf-8-sig") as f:
        return f.read()


def parse_ts(v):
    s = str(v or "").strip()
    try:
        t = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    t = t.astimezone(dt.timezone.utc)
    if t > dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=1) or t.year < 2026:
        return None
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def clean(e):
    if not isinstance(e, dict):
        return None
    key = str(e.get("key", "")).strip()
    by = str(e.get("by", "")).strip().lower()
    ts = parse_ts(e.get("ts"))
    what = CTRL.sub(" ", str(e.get("what", ""))).strip()
    what = MONEY.sub("$…", what)
    if len(what) > 400:
        what = what[:399].rstrip() + "…"
    if not KEY.match(key) or not BY.match(by) or not ts:
        return None
    return {"key": key, "by": by, "what": what, "ts": ts}


def main(argv):
    if not argv:
        print(__doc__)
        return 0
    mirror_path = argv[0]
    src = argv[argv.index("--source") + 1] if "--source" in argv else DEFAULT_SOURCE
    try:
        with open(mirror_path, encoding="utf-8") as f:
            mirror = json.load(f)
    except FileNotFoundError:
        mirror = {"version": 1, "done": []}
    try:
        drive = json.loads(read_source(src))
        if not isinstance(drive, dict) or not isinstance(drive.get("done"), list):
            raise ValueError("no 'done' list")
    except Exception as err:  # Drive down, not shared, HTML interstitial, bad JSON: keep the mirror
        note(f"ledger not read ({type(err).__name__}: {err}); mirror unchanged")
        print("unchanged")
        return 0

    merged, skipped = {}, 0
    for e in list(mirror.get("done", [])) + drive["done"]:
        c = clean(e)
        if not c:
            skipped += 1
            continue
        merged[(c["key"], c["by"], c["ts"])] = c  # a later copy of the same line (Drive) wins for the text
    rows = sorted(merged.values(), key=lambda c: (c["ts"], c["key"], c["by"]))

    out = dict(mirror)
    for k in ("about", "version"):
        if k in drive:
            out[k] = drive[k]
    out["done"] = rows
    out["updated"] = rows[-1]["ts"] if rows else mirror.get("updated", "")
    if out == mirror:
        note(f"{len(rows)} entries, nothing new" + (f"; {skipped} malformed skipped" if skipped else ""))
        print("unchanged")
        return 0
    out["synced"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(mirror_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
        f.write("\n")
    new = len(rows) - len([e for e in mirror.get("done", []) if clean(e)])
    note(f"{len(rows)} entries ({new:+d})" + (f"; {skipped} malformed skipped" if skipped else ""))
    print("changed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
