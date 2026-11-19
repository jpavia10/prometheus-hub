# Icarus Stake: contributor scores

Every outside file, scored by Claude (same rubric as Titan Reliquary): **place** 0-2 (saved where and as the task says), **accepted** 0-2 (passes the task's checks), **accurate** 0-2 (sources open and say what the file says), **complete** 0-2 (the whole count), **on the sheet** 0-2 (nothing outside the task). 10 is the best.

| # | Date | AI | File | Task | Place | Accepted | Accurate | Complete | On sheet | Score | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-11-16 | Grok | `icarus_grok_spec-check_20261114-0755.md` | ICA-GRK-01 | 2 | pending | pending | 2 | 2 | 6 so far, 4 pending | 9 sources checked (6 asked), table shape right; splits each claim into the part the page says and the part it does not (Finnhub 30/s vs the 60/min not on the page; SEC no-CORS vs 10 req/s in a different FAQ). Good catch: "60% of total disk, not available disk" for IndexedDB. Accepted and accurate wait for Claude's spot-check of the 2 differ lines (CoinGecko 100/min, Massive $29); the source hosts are blocked from the build session. |
