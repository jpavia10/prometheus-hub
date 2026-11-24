<!-- doc-status: current; normative: yes (for Gemini) -->
# FEEDBACK for Gemini: read before your next submission

Newest first. The same text is in Drive, `FEEDBACK for Gemini (read before your next submission)`. How work is checked and scored:
`CONTRIBUTING.md`. Your homework: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_gemini.txt

## 2026-11-24, night: Odyssey run 7 wired (the six newer trips: stops, days, picks, landmarks, city cards; row 196)

**What you did right.** The six trips now open on their own photos: 26 of your 31 picks are in Odyssey, each opened at full size and cropped where a stranger or a mirror crept into the frame. Your day logs are in for all six (27 days), and the times, flights and evidence ids made every pick easy to check. Your stops file found what the first pass missed (Malibu on Mar 4, Santa Monica on Mar 5, the Narrows and Canyon Overlook as separate days, Biscayne Bay). Your 10 city cards are in (49 cards now), each with its population source.

**What to fix.**
1. Check the place against the picture, not only the label on the folder or a guess from the trip. The Mar 6 2015 harbour is Rainbow Harbor in Long Beach (the Grand Romance riverboat and the Landmark Square tower are in the frame, and your own day log says they came by Metro Rail, which reaches Long Beach, not Marina del Rey). The Sep 15 2022 yard's GPS (41.773, -83.613) is 4.5 km north of the Ohio line, in Lambertville, Michigan, not Toledo or Sylvania.
2. Name animals and things only as far as the picture shows: the Lummus Park lizard is a spiny-tailed iguana (banded, spiny tail, grey), not a green iguana.
3. Skip blurred frames (the night runway at DTW, the Feb 3 2020 runway) and frames filled by strangers; Claude dropped them.
4. Landmarks are places the trip went: Marina del Rey was not visited, and an airport or a state beach strip is not a landmark of a trip. Lake Mead was already listed. Give a page about the landmark itself, not a jobs page (Zion's link was "work with us") or an unrelated press release (the Natural History Museum's).

Your new Odyssey tasks: ODY-GEM-29 (more picks for the five trips that open on three or fewer photos) and ODY-GEM-30 (cards for the 13 new stops). ODY-GEM-28 is withdrawn: every trip has its photos now.

## 2026-11-24, evening: kin_gemini_ancestry-wave4-breakthroughs_20261124.json (score 7, row 201)

**What you did right.** The two birth dates for Joseph Pavia (12 February 1897 on his 1942 draft card, 2 December 1897 in the Michigan death index) are now ranked in the tree, the draft card first because he gave it himself. Francis's dates agree with Muse's independent cemetery find. Run 7 is now in the pillars: 365 of your rows across 17 pillars as sourced reference panels (each with its page and quote), Hermes shows every biller's real numbers when a message names it, and Athenaeum's 40 events show their place on a map.

**What to fix.**
1. Never mark a link 100%. Every source in this file is an Ancestry link only a signed-in account opens; give the record itself (collection, page or certificate number, and what the line says).
2. Tell Joseph before you change his Ancestry tree. Propose additions in a file; he decides.
3. Muse's audit of your waves 1-4 found three patterns to stop: names filled into a blank parent field, caveats dropped between passes, photo-tier and record-tier claims at the same confidence. Its findings are conflicts C15-C17 in the tree; KIN-GEM-35 to 40 are the records that settle them.
4. Apollo: your 120 FDC ids are kept as candidates (pillars/apollo/data/fdc-candidates.json), not attached, because Apollo attaches an id only with the matching SR values; APO-GEM-16 asks for them. Four ids differ by more than 15% in calories from the food and are probably another preparation.

## 2026-11-24, later: run 7 scored file by file, the Maltese Pavias, wave 4

**What was excellent**

- **Malta.** The 1950 census page you saved is exactly what you transcribed: Joseph Pavia, 52, and Grace M., 40, both born in Malta and
  naturalized, with Caroline, Charles and Francis. With the 1926 marriage (Lucretia Calleja) and the 1942 draft card ("Lagrigia"), it
  settles who Grace was (C13, probable) and gives the tree its first Maltese generation: Paul Pavia and Caroline; Costantino Calleja and
  Carmela Cassar. 14 people added; the census page is in the tree as a record image. Score 7 (row 198), and the find itself is a 10.
- **Line 5a.** Claude re-read Joseph Termenas's 1935 death certificate at full size: "Della Matukaitis", as you said. The tree had
  "Delia"; corrected.
- **Run 7: 41 of 51 files pass every check**, at their counts, with honest negatives where a source is silent (rows 194-197: 9, 8, 8, 9).

**What to fix**

1. **No living person's address, no people-search sites, no account email. Third time.** The wave-4 report gives a living relative's
   present-day address from FamilyTreeNow, cites Whitepages, and writes the account email into the Deep Expansion report and its JSON.
   None of it was imported, and it cost the sheet score (0 of 2). Leave them out of every file, even a report.
2. **A find cites the record's own page.** Five Kin files cite a search-results page on rows that say "found" (arrival, Barbara,
   censuses, Della, naturalization). Search pages are right only for "not found" rows.
3. **Audit what is live, on a WebGL browser.** Three of the four "still there" accessibility items were false positives (the
   Observatory's star dots read as a white background; a plain span held to a tap-target rule), the realm labels were measured on the
   no-WebGL fallback grid, and the painting-focus moves do not match the current build. Before an audit, open the page in a browser
   with WebGL, at the build named in the task, and say which build and browser you used.
4. **Percentages.** Compiled colonial links (WikiTree, the Jamestowne Society) stay under 90; "100% identity" for Grace waits for her
   1943 petition. Your figures are kept beside Claude's in the tree.
5. **Mark work done in `forge-completions.json`** (CONTRIBUTING.md, step 5). Run 7 wrote DONE_ files only, so the Forge still shows 0
   delivered.
6. **The whole count**: `odyssey_gemini_ph-entry` has 12 rows of the 20 asked.

**Next**: the homework list is unchanged (50 tasks). The Kin campaign now also asks: Grace's petition 188070 and Joseph's (the Maltese
village and the ship, Q33, KIN-GEM-29), Arthur Seconder's Barnardo's file (Q34, KIN-GEM-32), and for the 898-file archive a provenance
line per portrait (who labelled it and why it is that person) before any image goes in the tree (KIN-GEM-23 to 26).

## 2026-11-24: run 7 (52 of 52), the Ancestry waves 2-4, the 397-file harvest

**What was excellent**

- **You found a real bug in our checker** and proved it: `check_delivery.mjs` rejected an explicit `null` on number, date and text
  fields (`typeof null` is `'object'`). Fixed the same day, with a unit test, crediting you. Score 10 (row 193).
- **The Ancestry hint sweep is the breakthrough of the Kin work.** The 1950 census index of Barbara J. Rimsha with her mother Della E.
  Rimsha and the SSDI birth date 24 Mar 1933 settled C10: Barbara is Joseph Termenas's daughter (probable until the image is read).
  Francis Pavia's 1939-2018 dates and VA burial, his parents Joseph and Grace and his siblings, Joy's obituary text, the Culberson,
  Tippens and Bryant lines: all in the tree now (80 people, 12 generations, back to 1638).
- **The certainty scale** (90-100 / 70-89 / 40-69 / under 40) is now the tree's own: every link shows a percentage.
- **Naming the false links online** (the "Sir John Llewellyn" line, Thomas Tabb Giles, "Cheesesquire" Kirkland): exactly right.
- **The run-7 report** listed every file with its id and its DONE marker: easy to check. Keep that.

**What to fix**

1. **Percentages above the evidence.** 97% for "Bob Seconder is Robert H. Seconder" rests on a rare surname and a brother's obituary;
   nothing ties that Robert to Laurie. Compiled trees and indexes alone never reach 90. Claude set lower figures where the basis was
   thinner and keeps yours beside them ("G 95"). KIN-GEM-19 to 22 repeat the rule.
2. **No addresses of living people and no people-search sites.** The pedigree document gave a living relative's street address from a
   utility filing and cited Whitepages and FastBackgroundCheck. Leave them out, even when found (`CONTRIBUTING.md` section 5).
3. **Portraits need provenance.** Two of the three FamilySearch "portraits" were not portraits of anyone in the tree (the DAR logo; an
   elderly woman filed under a man's name) and the third cannot be James Altonia Kirkland, born 1781 (C12). Every image needs who
   labelled it and why it is that person (the album tasks KIN-GEM-23 to 26 have a field for it).
4. **Deliver data as the task's JSON**, not only as a Google Doc. The waves came as documents; the next round is JSON per task.

**Your next homework**: 50 tasks. The Kin campaign leads: every Ancestry hint on every line (KIN-GEM-15 to 18), a certainty-scored
pedigree per line as far back as the records go (19 to 22), a 300-image family album (23 to 26), the tree's change log (27), the 1950
households (28), Grace Pavia (29), Della after 1935 (30), the 1912 crossing (31), Laurie's father (32), the Sanders line (33) and the
southern records (34). Then the painted town for every hour and weather (HUB-GEM-22) and one task in every pillar.

## Earlier

The full history of feedback (runs 1-6) is in the Drive doc.
