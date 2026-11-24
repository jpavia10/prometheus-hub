#!/usr/bin/env python3
"""Rules for tools/kin/lineage_intake.py: a good delivery passes and drafts its log and candidates; each kind of fault rejects."""
import json, os, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lineage_intake as K  # noqa: E402

ROW = {"n": 1, "kind": "search", "question": "Q1", "search": "Ellis Island database, sounds-like Termenas, arrivals 1911-1913, age 17-21: 3 results",
       "result": "candidate", "record": "", "repository": "Statue of Liberty-Ellis Island Foundation", "reference": "", "url": "https://heritage.statueofliberty.org/",
       "transcription": "", "source_class": "derivative", "info_class": "undetermined", "evidence": "indirect", "identity": "three Josef Terminas, none yet compared",
       "citation": "", "conflicts": "C9"}
REC = dict(ROW, n=2, kind="record", result="found", record="List or Manifest of Alien Passengers, S.S. Example", reference="T715 roll 1, image 2, list 3, line 4",
           url="https://example.org/image/2", transcription="Termenas Juozas 19 m s laborer yes Lithuanian Russia Telsze", source_class="original", info_class="primary",
           evidence="direct", identity="age 19 (born 1893), Telsze (Telšiai), arrived 23 Aug 1912: three identifiers match", citation="\"List or Manifest ...\", NARA T715 roll 1, image 2.")
SUM = {"n": 3, "kind": "summary", "question": "Q1", "search": "", "result": "", "record": "", "repository": "", "reference": "", "url": "", "transcription": "",
       "source_class": "", "info_class": "", "evidence": "", "identity": "C9 settled: the Example", "citation": "", "conflicts": "C9"}
NAME = "kin_gemini_lineage-arrival-1912_20261201-0900.json"


def run(rows, name=NAME):
    d = tempfile.mkdtemp(); p = os.path.join(d, name); json.dump(rows, open(p, "w")); out = os.path.join(d, "out")
    return K.main([p, "--out", out]), out


def main():
    bad = []
    rc, out = run([ROW, REC, SUM])
    if rc != 0: bad.append("a good delivery was rejected")
    dr = json.load(open(os.path.join(out, NAME.replace(".json", ".draft.json"))))
    if dr["task"] != "KIN-GEM-07" or len(dr["log"]) != 1 or len(dr["candidates"]) != 1 or not dr["summary"]: bad.append(f"draft wrong: {dr['task']}, {len(dr['log'])} log, {len(dr['candidates'])} candidates")
    if not dr["log"][0]["id"].startswith("L") or int(dr["log"][0]["id"][1:]) <= 2: bad.append("log ids must continue after the seed's (L1, L2)")
    cases = {
        "a record without its transcription": [ROW, dict(REC, transcription=""), SUM],
        "no summary last": [ROW, REC],
        "an unknown question": [dict(ROW, question="Q99"), REC, SUM],
        "a wrong evidence word": [ROW, dict(REC, evidence="strong"), SUM],
        "a missing field": [{k: v for k, v in ROW.items() if k != "identity"}, REC, SUM],
        "a found record without a URL": [ROW, dict(REC, url=""), SUM],
    }
    for what, rows in cases.items():
        if run(rows)[0] == 0: bad.append(f"{what} was accepted")
    if run([ROW, REC, SUM], "kin_gemini_something-else_20261201-0900.json")[0] == 0: bad.append("a file matching no task was accepted")
    probs, warns = K.check([ROW, dict(REC, transcription="Termenas Juozas ... Telsze"), SUM], {"fields": []}, {"Q1"})
    if probs or not any("ellipsis" in w for w in warns): bad.append("a shortened transcription is not warned")
    if bad: print("FAIL\n" + "\n".join(bad)); return 1
    print("OK"); return 0


if __name__ == "__main__":
    sys.exit(main())
