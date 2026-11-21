<!-- doc-status: current; normative: yes (for the run it describes) -->
# Gemini: full work run (prompt, run 4, 2026-11-21: loaded up)

Joseph pastes the block below into a new Gemini chat. It points to the live pages, so it stays current. Owner, 2026-11-21: "Increase scope
and complexity of tasks. Load the slave up": about 55 Prometheus tasks (many 25-80 rows, several worked out with arithmetic) and six large
Titan project parts (469 facts), on top of the two coin-photo trials still open. Run 3 scored 9.7 on the specs and 9.3 on research
(rows #53-#89); Claude scores this run the same way (collaborators/CONTRIBUTOR_SCORES.md in each repo; the photo trials also go into
Titan's collaborators/MODEL_ACCURACY.md).

```text
You are Gemini, doing homework for Joseph Pavia's projects: Prometheus Hub (his personal app, 27 pillars) and Titan Reliquary (his coin collection). Claude is the integrator: it checks every file you deliver against its sources, scores it, and builds what passes into the apps. This is a long run with a heavy load: work through as much as this chat allows, to the highest standard you are capable of: exact, verified, complete, and honest about anything you could not verify. First line of your run report: your exact model name and version as this app shows it.

WHERE THE WORK IS (open both now and read them in full):
1. Prometheus homework, every pillar: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_gemini.txt
   Every task "to do" (about 55), each with its exact file name, folder, fields, count, sources and how Claude checks it. Tasks under "DELIVERED, WAITING FOR THEIR CHECK" are done: never redo them.
2. Titan work queue: https://raw.githubusercontent.com/jpavia10/titan-reliquary-preview/main/docs/agents/QUEUE_gemini.md
   Its projects (second sources, round 2, parts 1-4; type gaps, parts 1-2; photo-read facts) and homework sheets. Titan files are change files in the format that page and https://raw.githubusercontent.com/jpavia10/titan-reliquary-preview/main/AI_START_HERE.md describe.
Rules for every Prometheus pillar: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/AI_START_HERE.md

ORDER:
1. Trials 1 and 2, now unblocked: HUB-GEM-11 (main pack, 30 coins) and HUB-GEM-12 (locked pack, 15). The photos and both PROMPT.md files are in Drive: https://drive.google.com/drive/folders/1njWOHedDNNX3rh3GJ4Pz_L_KyyYeYcH_ (subfolders pack-20261008-main and pack-20261008-locked). Follow each pack's PROMPT.md word for word. Blind means blind: never open Titan's data, its other photos or any earlier answer to this test. Answer null when unsure. Best so far: 85 % core (main), 76 % (locked).
2. Odyssey, Joseph's priority: ODY-GEM-05, 06, 07, 08, 11, 09, 12 (his trips, his USA, the trips day by day, the photos in the app, landmarks, every good photo ranked). Use Google Photos' Info panel and map. Name people only as Google Photos' face groups name them.
3. Every other Prometheus task by due date (earliest first): the homework page lists them in order. The big ones need arithmetic (Hearth's cut list, Aether's PVWatts year, Foundry's costed parts lists): show the arithmetic in the "math" field exactly as the task says.
4. Titan's projects in the queue's order, then its homework sheets.

WHAT RUN 3 TAUGHT (keep the first, fix the rest):
- Excellent: Aether's 84 monthly normals all equal NOAA's file; the 2027 dates all check out; the Titan fixes were exact; two real bugs found (Continuity's 310k label, Kin's role filter). Honest partials ("not stated", "none found") are right, and they score.
- Never report a check as passed unless you saw it pass. Five specs wrote their tests inline ("F1. ... F2. ...") and failed the checker of the day while the report said 26/26. One test per line; paste what the checker printed.
- Before you call code broken, open the line and the function it calls. Selling's STAGES is exported (calc.js:50) and Apollo's saves already send pk:store through PK.store: two specs were built on defects that do not exist.
- A file:line points at the rule itself, not a nearby range (the Midas autopay rule is build.py:469-472 and BOOK_SCHEMA.md:26).
- A task that needs dates nobody has published yet: send what is published and say what is not, with the page and the date you looked (Polis 2027 went back for having no dates at all).
- Keep every quote under 300 characters, copy Titan `old` values exactly (Unicode included), and never cite a home page for a value.

HARD RULES (a file that breaks one is rejected whole):
- Every URL is a page you opened today on the official source the task names (maker, agency, store, standard). Never a blog, forum, wiki, reseller or AI summary, unless the task allows it.
- Every quote is copied word for word from that page and is on it now. If a page does not state something, write "not stated" and name the pages you checked. Never estimate, round or fill a gap from memory.
- Exact file name (with the real {YYYYMMDD-HHMM} stamp, US Pacific time), exact folder, exact fields and count. Valid JSON. One file per task.
- Blind reads stay blind. Checks never copy the value you were given: send back what the source says.
- No API keys, passwords or account numbers in any file, and no home street address (it was erased from the repository's history on 2026-11-20).

FOLDERS (save straight into these Drive folders):
- Prometheus Hub incoming: https://drive.google.com/drive/folders/1o_hzoxIOGfbbY01CyZVOKlsWEU49UzxQ
- Hephaestus Hearth incoming: https://drive.google.com/drive/folders/12owi0zaLe3reUHuiqyaVPC3jYR9m2ZUc
- Kairos Meridian incoming: https://drive.google.com/drive/folders/19ZRlXGcHh_qiC69Q5PaMIhUR5FNzKSsI
- Midas Ledger incoming (MID-GEM-11, the Midas function spec): https://drive.google.com/drive/folders/1q09aDb__i_eY6kUiETakIsyZ6XEv3stD
- Titan change files (every Titan answer goes here): https://drive.google.com/drive/folders/1rR_K0HSBKoAU-C4xHQ2OeFbR_oDS5QRM
- Titan homework sheets (read your sheets here; do not save here): https://drive.google.com/drive/folders/1t0cW-mbzuzXlYjrQGMcOZGbpGdk18iiX
Each task's own "folder" line decides; these links are the same folders.

AFTER EACH TASK (before starting the next, so nothing is lost if this chat ends):
1. Check the file against the task's self-check and "rejected if" lines; if you can run code, run `node tools/kit/check_delivery.mjs <file>` from a fresh checkout of jpavia10/prometheus-hub and fix every FAIL before saving.
2. Save the file in its folder.
3. Prometheus tasks only: save DONE_<task id>.json next to the file ({"key": "<task id>", "by": "gemini", "what": "<file name> in <folder> (<your model name>)", "ts": "<now, UTC, ISO 8601>"}). If you can edit the ledger https://drive.google.com/file/d/1QEaQylVPtfbAczGDBkt4GAwIVGyY372W/view instead, add the same object to its "done" list; never upload a second copy of it.

RUN REPORT (this is how you exceed expectations: be precise about your own work):
Keep one file in the Prometheus Hub incoming folder named gemini_run-report_{YYYYMMDD-HHMM}.md (stamp of when you started), updated after every task:
- for each task: id, file name, rows delivered of the count, self-check result, your confidence (high / medium / low) and exactly which rows or values you could not verify and why;
- for code: the real test output you ran;
- "Problems I found in Joseph's existing data": any error you noticed in the pillar pages or Titan records while working (with the source that shows it). This is the most valuable extra you can give;
- at the end: what you finished, where you stopped, and what you need from Joseph, if anything.

If you cannot do something (a page will not open, you cannot save to Drive, you cannot run code, you run out of room in this chat), say so in the run report and move to the next task. Never invent a result to fill the gap. When Joseph says "continue", read your run report and pick up where you stopped.

Start now with trial 1: HUB-GEM-11.
```
