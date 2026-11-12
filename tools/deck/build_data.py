#!/usr/bin/env python3
"""Build the deck's data files (deck/data/*.json) from the research already in this repo and the worked payoff ledgers.

    python3 tools/deck/build_data.py [--payoff PATH_TO_midas_gemini_payoff-cases.json]

Sources: pillars/kairos/fixed-dates.js (KAI-GEM-02 + Grok's 2027 re-check), pillars/money/issuers.js (MID-GEM-04/05),
pillars/money/offers.js (MID-GEM-06/07 re-read by Grok 2026-11-10), the payoff ledgers (MID-GEM-01, Drive; kept in
deck/data/payoff-cases.json once built). Only public research data: nothing personal passes through here."""
import json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "deck", "data")


def js_value(path):
    s = open(os.path.join(ROOT, path), encoding="utf-8").read()
    i = min(x for x in (s.find("= ["), s.find("= {")) if x >= 0)
    return json.loads(s[i + 2:].strip().rstrip(";").strip())


def dump(name, obj):
    p = os.path.join(OUT, name)
    json.dump(obj, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{name}: {os.path.getsize(p):,} bytes")


def main(argv):
    os.makedirs(OUT, exist_ok=True)
    fixed = js_value("pillars/kairos/fixed-dates.js")
    assert len(fixed) == 58, len(fixed)
    dump("fixed-dates.json", [{"date": r["date"], "name": r["name"], "kind": r["kind"], "url": r.get("url", "")} for r in sorted(fixed, key=lambda r: r["date"])])

    iss = js_value("pillars/money/issuers.js")
    assert len(iss) == 25
    dump("issuers.json", [{"issuer": i["issuer"], "method": i["interest"]["method"], "daily": i["interest"].get("daily"), "grace": i["interest"].get("grace_days"),
                           "minimums": [{"product": m["product"], "formula": m["formula"], "floor": m.get("floor_usd")} for m in i["minimums"]]} for i in iss])

    off = js_value("pillars/money/offers.js")
    dump("offers.json", {"as_of": off["as_of"],
                         "promos": [{k: r.get(k) for k in ("issuer", "product", "type", "months", "months_unit", "bt_window", "go_to_apr_range", "fee", "url", "quote")} for r in off["balance_transfer"]],
                         "hardship": [{k: r.get(k) for k in ("lender", "program", "offers", "qualifies", "how_to_ask", "account_effect", "url", "quote")} for r in off["hardship"]],
                         "hardship_missing": off.get("hardship_missing", [])})

    if "--payoff" in argv:
        cases = json.load(open(argv[argv.index("--payoff") + 1], encoding="utf-8"))
        assert len(cases) == 12
        slim = []
        for c in cases:
            names = [d["name"] for d in c["debts"]]
            slim.append({"case": c["case"], "method": c["method"], "budget": c["budget"], "debts": c["debts"], "payoff_month": c["payoff_month"], "total_interest": c["total_interest"],
                         # per month, per debt (in the debts' order): [interest, paid, balance]
                         "months": [[[m["interest"].get(n, 0), m["paid"].get(n, 0), m["balance"].get(n, 0)] for n in names] for m in c["months"]]})
        dump("payoff-cases.json", slim)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
