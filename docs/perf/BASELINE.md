# Lighthouse baseline

First measured run of `lighthouserc.json` on this checkout, 2026-11-19. Scores are the category values Lighthouse 13.6.0 wrote into the reports. One run per URL. Lab only.

- `@lhci/cli` 0.16.1, Lighthouse 13.6.0
- Headless Chrome 157 (`HeadlessChrome/157.0.0.0` in the reports)
- Mobile emulation, the Lighthouse default: width 412, height 823, device scale 1.75
- Server: `python3 -u -m http.server 8377 --bind 127.0.0.1`
- `CI=true lhci autorun` exited 0. Performance under 0.9 is a warning. Accessibility, best-practices, and the two installable audits are errors.

Lighthouse 12 removed the PWA category. `tools/lighthouse/config.mjs` adds `installable-manifest` and `service-worker`, which read Chrome's `Page.getInstallabilityErrors`. Both scored 1 on every URL. Each page registered `http://127.0.0.1:8377/sw.js`, state `activated`, scope `http://127.0.0.1:8377/`.

| Page | Fetched (UTC) | Performance | Accessibility | Best practices | installable-manifest | service-worker |
| --- | --- | --- | --- | --- | --- | --- |
| Hub `http://127.0.0.1:8377/` | 2026-11-19T18:55:12.086Z | 0.38 | 0.96 | 1 | 1 | 1 |
| Apollo `http://127.0.0.1:8377/pillars/apollo/` | 2026-11-19T18:55:50.531Z | 0.91 | 1 | 1 | 1 | 1 |
| Athenaeum `http://127.0.0.1:8377/pillars/athenaeum/` | 2026-11-19T18:56:01.938Z | 0.56 | 1 | 1 | 1 | 1 |
| Hearth `http://127.0.0.1:8377/pillars/hearth/` | 2026-11-19T18:56:22.851Z | 0.9 | 1 | 1 | 1 | 1 |

The hub's weighted accessibility miss is `target-size` (the home rows). The category score is still 0.96. Apollo, Athenaeum, and Hearth had no weighted accessibility failures. Best practices was 1 on all four.

Displayed metrics from the same reports:

| Page | First Contentful Paint | Largest Contentful Paint | Total blocking time | Cumulative layout shift | Speed index |
| --- | --- | --- | --- | --- | --- |
| Hub | 2.0 s | 5.6 s | 28,390 ms | 0 | 13.3 s |
| Apollo | 1.7 s | 3.3 s | 20 ms | 0 | 1.7 s |
| Athenaeum | 2.1 s | 3.6 s | 8,910 ms | 0 | 4.3 s |
| Hearth | 2.6 s | 3.1 s | 40 ms | 0 | 2.6 s |
