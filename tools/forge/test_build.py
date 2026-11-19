#!/usr/bin/env python3
"""The Forge builder's rules (tools/forge/build.py), each pinned to the bug it fixes. Run: python3 tools/forge/test_build.py"""
import json, os, subprocess, sys, unittest
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import build as B


class Names(unittest.TestCase):
    def test_one_ai_per_name(self):          # a score row written "Gemini (4 Neon)" counted as its own AI before 2026-11-19
        for raw, want in [("Gemini (4 Neon)", "Gemini"), ("gemini", "Gemini"), ("Gemini API", "Gemini API"), ("gemini-api", "Gemini API"), ("model:gemini-api:gemini-3.8-flash", "Gemini API"),
                          ("Grok", "Grok"), ("grok-bot", "Grok"), ("Muse", "Muse"), ("ChatGPT", "ChatGPT"), ("Claude", "Claude"), ("Hydrogen", "Hydrogen"), ("nobody", None), ("", None)]:
            self.assertEqual(B.ai_name(raw), want, raw)


class States(unittest.TestCase):
    def setUp(self): B.WARN.clear()
    def test_withdrawn_is_never_open(self):  # withdrawn tasks were counted as open (Gemini showed 87 out, 19 real)
        self.assertEqual(B.status_of("withdrawn", "X-1", None, "", {})[0], "withdrawn")
        self.assertEqual(B.status_of("parked", "X-1", None, "", {"X-1": {"ts": "2026-11-19"}})[0], "withdrawn")
    def test_delivered_is_not_done(self):    # the ledger flipped a task to "done" before anyone checked it
        self.assertEqual(B.status_of("now", "X-2", None, "", {"X-2": {"ts": "2026-11-19T10:00:00Z"}})[0], "delivered")
    def test_done_stays_done(self):
        self.assertEqual(B.status_of("done", "X-3", None, "", {"X-3": {"ts": "2026-11-19"}})[0], "done")
    def test_reopened_after_delivery_is_todo_again(self):
        self.assertEqual(B.status_of("now", "X-4", None, "2026-11-20", {"X-4": {"ts": "2026-11-19T10:00:00Z"}})[0], "todo")
    def test_alias_counts(self):             # Titan projects report their run_id in the ledger
        self.assertEqual(B.status_of("now", "T-gemini-7", "GT-AIFACTS-p1", "", {"GT-AIFACTS-p1": {"ts": "2026-11-19"}})[0], "delivered")
    def test_later_is_not_now(self):
        self.assertEqual(B.status_of("next", "X-5", None, "", {})[0], "queued")
    def test_unknown_state_is_reported(self):
        self.assertEqual(B.status_of("someday", "X-6", None, "", {})[0], "todo"); self.assertTrue(any("X-6" in w for w in B.WARN))


class Snapshot(unittest.TestCase):
    """The committed snapshot agrees with itself: totals equal the task list, and no withdrawn task is counted anywhere."""
    def test_totals_match_tasks(self):
        d = json.load(open(os.path.join(B.ROOT, "docs/agents/forge.json")))
        T = d["tasks"]
        self.assertEqual(d["totals"]["todo"], sum(t["status"] == "todo" for t in T))
        self.assertEqual(d["totals"]["delivered"], sum(t["status"] == "delivered" for t in T))
        self.assertEqual(sum(p["todo"] for p in d["per"].values()), d["totals"]["todo"])
        self.assertTrue(all(t["status"] in ("todo", "queued", "delivered", "done", "withdrawn") for t in T))
        self.assertTrue(all(not t["late"] or t["status"] == "todo" for t in T))
        self.assertTrue(all(t["ai"] in B.AIS for t in T), sorted({t["ai"] for t in T} - set(B.AIS)))
        for a, p in d["per"].items(): self.assertEqual(p["todo"], sum(1 for t in T if t["ai"] == a and t["status"] == "todo"), a)
        self.assertIn("built", d); self.assertIn("checked", d)


if __name__ == "__main__":
    unittest.main(verbosity=1)
