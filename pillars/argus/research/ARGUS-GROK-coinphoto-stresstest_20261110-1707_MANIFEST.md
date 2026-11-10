# ARGUS-GROK-coinphoto-stresstest_20261110-1707 — manifest

File: `ARGUS-GROK-coinphoto-stresstest_20261110-1707.md` (Drive: Argus Album / incoming (AI drop files); repo: `pillars/argus/research/` on PR #8).
Task: WS-ARGUS Deliverable 2, a stress test of the current coin-photo standard (small denominations, worn dates).

## Verified counts (read back from the Drive copy)
- Findings: **12** (F1–F12). Severity: High 5 (F1, F2, F5, F6, F9), Med 6 (F3, F4, F7, F8, F10, F11), Low 1 (F12). Each finding has what breaks, an example or evidence, and a fix.
- Standard layers reviewed: 4 (S1 Argus 20 rules, S2 Titan master-v1 + 31-gate QC, S3 Titan PHOTO_FOLDERS/PHASE2_INTAKE/P1/P2 briefs, S4 Argus naming regex + strip).
- Size table: 8 coins, 13–30.61 mm. All numbers derived from the S2 constants and official diameters.
- Naming test: 14 standard-pattern names. Current Argus regex 2/14 pass; proposed regex 14/14 pass, with 5/5 negatives rejected (script run on the box).
- Distinct source URLs cited: 18 (table in §6 of the memo).

## Boundaries kept
- Read the standard docs only. No LEDGER, no answer keys, no `_locked` folder, no collection specimen files. The only IDs used are the docs' own placeholders (C042, EU-CH-008, T002, A026).
- No change files and no Titan repo edits. The memo proposes changes for Claude/Sebastian to decide.
- No Joseph financial or personal data.
- A synthetic render test was tried and discarded as not representative (memo F3). No numbers from it are reported.

## Enablement
F9 and F11 can be fixed today in docs alone: the "crop per flip before downsizing" rule and the regex. F5/F6 add the raking-light legibility shot and partial-date notation, which turns "unreadable" worn dates into readable evidence instead of RESHOOT/mismatch churn.
