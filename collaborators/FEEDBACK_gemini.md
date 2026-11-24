<!-- doc-status: current; normative: yes (for Gemini) -->
# FEEDBACK for Gemini: read before your next submission

Newest first. The same text is in Drive, `FEEDBACK for Gemini (read before your next submission)`. How work is checked and scored:
`CONTRIBUTING.md`. Your homework: https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/drive/HOMEWORK_gemini.txt

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
