<!-- doc-status: current; normative: yes (for the run it describes) -->
# ChatGPT: trial 1, blind second reads (prompt, 2026-11-26)

ChatGPT has been parked since 2026-10-10 because every task needed Joseph to paste it. On 2026-11-26 Joseph said "I think chat gpt
can help a lot". The fit: second reads. Gemini does most of the work. Its sources are government, maker and archive pages that
Claude's container cannot open, and Muse's slots are full, so 39 checked files wait for someone to open their pages. ChatGPT
can browse, and it is not in Gemini's family, so it can be an independent second reader. This trial measures how well it does that
before any real load goes to it (the same way Gemini was tried on 2026-11-20).

Joseph's part is one paste. At the end, if ChatGPT cannot save to Drive itself, there is one drag: the file it gives into the folder
below. Claude scores the result in collaborators/CONTRIBUTOR_SCORES.md. If it scores 8 or better, the 39 waiting files go to ChatGPT
in batches with the same prompt shape.

```text
You are ChatGPT, doing one trial task for Joseph Pavia's personal app, Prometheus Hub. Claude is the integrator. It checks what you
deliver against the pages and scores it. First line of your reply: your exact model name as this app shows it.

THE TASK (HUB-GPT-02): a blind second read of 45 rows that another AI (Gemini) researched. Open the sheet:
https://raw.githubusercontent.com/jpavia10/prometheus-hub/main/docs/agents/review/chatgpt-trial-1.json
(if that link is blocked: https://github.com/jpavia10/prometheus-hub/blob/main/docs/agents/review/chatgpt-trial-1.json)

For each of its 45 rows:
1. Open "page" with your browser. Find what "about" names on that page.
2. For every field under "read", write what the page says, in the page's own words. If the page does not say, write "not stated".
3. If the row has "quote_to_find", Ctrl+F it on the page: "yes" only if every word is there in that order, "partly" if some is, "no" if not.
4. If the page will not open, or opens something else, write exactly what happened in "opened" and go to the next row.

HARD RULES (a file that breaks one is rejected whole):
- Only what the page you opened today says. Never from memory, never from another site, never a guess. Gemini's answers are not in
  the sheet on purpose: do not go looking for them.
- Every "quote" is copied word for word from the page and is 300 characters at most. Ctrl+F must find it.
- No API keys, passwords, account numbers or home addresses in the file.

DELIVER one JSON file named hub_chatgpt_second-read-trial1_{YYYYMMDD-HHMM}.json (the time you finish, US Pacific): a JSON array
of 45 objects, k 1 to 45, each with exactly these fields:
  k (number, from the sheet), task (text, from the sheet), row (number, from the sheet),
  opened ("yes" or what happened), page_says ("field: value | field: value" for the fields under "read"),
  quote_on_page ("yes", "partly", "no", or "n/a" when the row has no quote_to_find), quote (word for word, at most 300 characters).
Save it to this Google Drive folder if you can: https://drive.google.com/drive/folders/1o_hzoxIOGfbbY01CyZVOKlsWEU49UzxQ
If you cannot save to Drive, give the file as a download and say so in one line.

After the file: a short report with how many rows you could open, which you could not and why, and any row where you think the
sheet itself is wrong (the page is about something else, the row names the wrong thing). Never report a row as read unless you
opened its page.

Start now with row 1.
```
