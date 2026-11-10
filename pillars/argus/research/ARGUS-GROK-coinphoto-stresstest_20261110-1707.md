# Coin-photo standard: stress test at small denominations and worn dates

**ARGUS-GROK-coinphoto-stresstest_20261110-1707** · WS-ARGUS Deliverable 2 · Prometheus one-day reset, 2026-11-10 · Grok

This memo tests the current coin-photo standard against two hard cases: **small coins** (13–18 mm) and **worn dates**. It is a review only. It changes no files and makes no Titan collection edits. It contains no Joseph data. The only IDs it uses are the placeholder examples printed in the standard docs themselves (`C042`, `EU-CH-008`, `T002`, `A026`). No LEDGER, answer key, or `_locked` folder was opened.

## 1. What "the current standard" is (sources read)

The standard comes in four layers. Each one was read in full:

| Layer | Document | What it sets |
|---|---|---|
| S1 | Argus `argus_gemini_coinphoto_20261108-2355.json` (merged into `MERGED_MASTER_argus_album_20261109.json`): https://drive.google.com/file/d/1VN5p_X5P8XjgOX1vHhKwo2jT6VEdXsHB/view | 20 capture rules from Goodman, PCGS TrueView, NGC, and FADGI. Covers lens, lights high and near the lens axis, ISO ≤ 400, a frame-filling shot of ≥ 8 MP, no transformative retouching. |
| S2 | Titan `photos/README.md`, "master standard + QC gate" (`master-v1`): https://drive.google.com/file/d/1EC3J1ycLcU7F-U9KhLEyBewYf8Q35rg2/view | 2600 px canvas. Flip warped to 2400 px = 50.8 mm (**47.244 px/mm**). Coin crop is 1200 px with the coin at **86 %** of the frame. Thumb 400 px. 31 QC gates, including `source_px_per_mm` ≥ 25 to pass (≥ 15 flags), sharpness measured with the coin resized to 600 px, `glare_pct` ≤ 0.6 %, `diameter_delta_pct` ±5/±8 %, and "no label, no master". |
| S3 | Titan repo `docs/PHOTO_FOLDERS.md`, `docs/PHASE2_INTAKE.md`, `tools/photos/P1_AGENT_BRIEF.md`, `tools/photos/P2_AGENT_BRIEF.md`: https://github.com/jpavia10/titan-reliquary-preview/tree/main/docs | Phases 1, 1.5 and 2. Names `{SER}_{year}_{denomSlug}_{role}.jpg`. Round cut-outs of 1200 px and 2x2 crops of 1600 px. "Never guess a date … write unreadable". A `mismatch` is not registered. Files over about 7 MB must be re-saved at a 4000 px long edge. |
| S4 | Argus `SPEC_argus_album_merged_20261109.md`: https://drive.google.com/file/d/1kO-Y37v4DJd-XPRofWy4TtNCwAmPtw9m/view | Naming-compliance regex `^([ACBS]\d{3}|NOID)_.*_(obv|rev|page|slab)\.jpe?g$`. GPS stripped by canvas re-encode (`toBlob`). |

## 2. The arithmetic the standard implies, by coin size

Coin diameters come from official specs: US Mint (https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications), the European Commission (https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en), and PCGS CoinFacts for the trime and the gold dollar. Every other number is derived from the S2 constants.

| Coin (diameter) | Master px across coin (47.244 px/mm) | Source px at the 25 px/mm pass floor | Upscale source → 1200 crop (coin = 1032 px) | Upscale source → 600 px sharpness view | Thumb px/mm (coin = 344 px) |
|---|---|---|---|---|---|
| US gold dollar T1 (13 mm) | 614 | 325 | **3.18×** | 1.85× | 26.5 |
| US 3¢ silver (14 mm) | 661 | 350 | **2.95×** | 1.71× | 24.6 |
| Euro 1 cent (16.25 mm) | 768 | 406 | 2.54× | 1.48× | 21.2 |
| US dime (17.91 mm) | 846 | 448 | 2.30× | 1.34× | 19.2 |
| US cent (19.05 mm) | 900 | 476 | 2.17× | 1.26× | 18.1 |
| US nickel (21.21 mm) | 1002 | 530 | 1.95× | 1.13× | 16.2 |
| US quarter (24.26 mm) | 1146 | 606 | 1.70× | 0.99× | 14.2 |
| US half dollar (30.61 mm) | 1446 | 765 | 1.35× | 0.78× | 11.2 |

The pattern: S2 normalises every coin to the same size on screen. The smaller the coin, the more of its displayed detail is interpolated rather than captured, and every coin looks the same size.

## 3. Findings: what breaks

Severity: **High** means it produces wrong facts or blocks good photos. **Med** means systematic noise or REVIEW churn. **Low** means friction.

### F1 · High · Physical size, the best ID cue on a worn coin, is erased
- **What breaks:** The 86 % crop and the 400 px thumbs make a 13 mm gold dollar and a 30.6 mm half dollar the same size. When the date and legend are worn away, diameter is often what tells the denomination. Example: a dateless Buffalo nickel is still a nickel (21.21 mm), not a cent (19.05 mm).
- **Evidence:** S2 coin crop is "86 % of the frame". The table above shows that at the 25 px/mm floor a 14 mm coin's 1200 px crop is a 2.95× interpolation.
- **Fix:** Put a `measured_diameter_mm` badge on every tile and coin view (S2 already computes it). Add a true-scale compare view at a fixed px/mm. Cap the crop at the native source resolution (no upscaling) and pad with #1A1A1A instead.

### F2 · High · The resolution floor ignores coin size
- **What breaks:** `source_px_per_mm` ≥ 25 passes and ≥ 15 only flags, whatever the coin. The finest features (mint-mark letters, date digits) shrink with the coin. At the floors, a 0.5 mm feature (an illustrative size, not a measured one) gets 12.5 px at pass and 7.5 px at flag, before JPEG.
- **Fix:** Add a size-aware gate: **coin diameter ≥ 600 source px**. That matches the 600 px sharpness view, so nothing is upsampled. It means ≥ 42.9 px/mm for a 14 mm coin, ≥ 33.5 for a dime, and leaves 25 px/mm adequate from 24 mm up.

### F3 · Med (hypothesis, needs a real test) · The sharpness gate is biased against small coins and worn surfaces
- **What breaks:** S2 measures Laplacian variance "coin at 600 px". Every coin under about 24 mm shot near the floor is **upsampled** before measuring (1.13–1.85× in the table), and interpolation removes high-frequency energy. Larger coins are downsampled, which concentrates it. Laplacian variance also measures how much fine surface detail there is. A crisply focused, worn-smooth coin has little left to measure, so it can score like a blurred one and be sent to RESHOOT as "blurry".
- **Status:** I tried a synthetic height-field render on the box. It was not representative: the toy wear model created artificial plateau edges. I discarded it and report no numbers from it.
- **Fix to test:** Re-shoot one public-domain small coin and one worn coin at 25, 40 and 60 px/mm and run `photo_pipeline.py qc-test`. If the bias holds, measure sharpness at native resolution on the **rim band and the flip's cardboard edge**. Those stay crisp on worn coins and have a fixed physical contrast.

### F4 · Med · The glare gate is area-based, so small bright coins fail more
- **What breaks:** `glare_pct` is clipped highlight as a percentage of the coin's area. A specular hotspot of roughly fixed physical size (set by the light source and geometry) covers a larger share of a smaller coin. That share scales with 1/d², so it is **2.9× larger on a dime than on a half dollar**. Small proof-like or lustrous silver coins will trip RESHOOT more often.
- **Fix:** Measure glare over the design or device mask, or use an absolute threshold in mm². Add a capture tip in the reshoot text: diffuse the light or move it, per S1 rule 3's "reflection just off the edge of the coin".

### F5 · High · No rule for worn coins: the lighting rules work against legibility
- **What breaks:** S1 rules 3 and 10 prescribe **high-angle** light close to the lens axis. That light is chosen for luster and colour on high-grade coins (Goodman: "lighting is best when the lighting is at as high an angle to the coin as is possible"). Worn dates are very shallow relief, and shallow relief reads through shadow under **low, raking** light. OpenRTI describes raking light that "reaches the surface at 15° and shows relief through its shadows" (https://openrti.org/about-rti). Reflectance Transformation Imaging is "very successful in improving details of badly preserved coins, sometimes illegible for the first sight" (Numismatic Letters 2016, https://doi.org/10.1515/nl-2016-0010). The standard has no worn-coin shot at all.
- **Fix:** Add a **date-legibility shot**, using the existing optional role `detail-01` from PHOTO_FOLDERS: raking light at 10–20°, from 2–4 azimuths, for any coin whose date was read as `unreadable` or partial. Use RTI (an LP sphere plus about 24–48 shots) only for coins that stay illegible.

### F6 · High · Worn and weak dates collide with the "mismatch" rule
- **Public examples:**
  - **Buffalo nickels (1913–1938):** the date was the highest point of the obverse and wore off quickly (Numismatic News, https://www.numismaticnews.net/archive/date-wear-defines-1925-d-buffalo-nickels). NGC notes "the tendency of these coins to become dateless" (https://www.ngccoin.com/news/article/7012/).
  - **Standing Liberty quarters to 1924:** the raised date left "hundreds of thousands … likely millions" essentially dateless. The Mint recessed the date in 1925 (PCGS, https://www.pcgs.com/news/recessed-date-standing-liberty-quarters).
  - **Mercury dime 1920–25:** the last digit was pushed against the rim and "subject to being weakly struck" (NGC, same article). A weak **strike** looks like **wear** in a photo.
- **What breaks:** The P2 brief says that if the coin you see contradicts the record, it is a `mismatch` and is not registered. A partly worn digit that is **misread** (for example a worn 4 read as 1) creates a false mismatch and blocks a good photo. The brief also has no way to record a **partial** date.
- **Fix:** (a) Only a positively read conflicting digit is a mismatch. An unreadable digit is not. (b) Add partial-date notation (`192?`, `19?4`) and a `date_legibility` field (full / partial / none) with the lighting used. (c) For worn and weakly struck dates, send them to the existing blind double read (DOUBLE_READ.md) before anything is written.

### F7 · Med · The diameter gate can't separate neighbouring small denominations, and steers the rim fit
- **What breaks:** A dime recorded as a cent is off by **−6.0 %** (17.91 vs 19.05 mm). That lands in the ±5–8 % band, which is only REVIEW, not a flag. Worse, S2's rim fit is "guided by the spec diameter (±5 %)". If the Phase 1 record has the wrong denomination, the search starts from the wrong prior and can lock onto a wrong circle, such as the flip window. A cent recorded as a nickel is −10.2 % and is flagged; euro 1c vs 2c is −13.3 % and is flagged.
- **Fix:** Run the rim fit **unguided first**, then compare. Turn a large `diameter_delta_pct` into a "denomination check" owner question instead of a quiet REVIEW.

### F8 · Med · Non-round small denominations break the round model
- **What breaks:** The euro 20 cent has the "Spanish flower" notched shape (European Commission, same URL as §2). `coin_fit_residual_pct` ≤ 0.45, `coin_ellipse_ratio` and the P1/P2 round cut-outs all assume a circle. The notches inflate the fit residual, so every notched coin goes to REVIEW, and the round crop clips the notch tips or adds background.
- **Fix:** Add a `shape` class (round, notched, polygonal, holed) that picks the fit model and skips the residual gate for non-round coins. Never clip outside the true silhouette (the P1 brief already says "include the ENTIRE coin out to its outside edge").

### F9 · High · The ">7 MB, re-save at 4000 px" fallback can push a scan under the resolution floor
- **What breaks:** The P2 brief and PHASE2_INTAKE tell the owner to re-save large scans at a 4000 px long edge. If the scan is a **full scanner bed** of flips (A4, 297 mm long), that is **13.5 px/mm**, below S2's 15 px/mm flag floor, so it fails and goes to RESHOOT. The math also explains why the files are big: 1200 dpi is 47.24 px/mm (exactly the master scale), and a full A4 bed at that resolution is about **139 MP**.
- **Fix:** Crop each flip **before** downsizing. One 50.8 mm flip at 4000 px is 78.7 px/mm. State the rule as "≥ 2400 px per flip side", not "4000 px long edge".

### F10 · Med · Two standard layers conflict: shoot raw vs. "no label, no master"
- **What breaks:** S1 rule 15 (NGC) says to photograph the coin out of the holder to avoid glare. S2 refuses any master without the handwritten flip label, so masters are always shot through the 2x2 window. The window's plastic film adds haze and glare, and that costs the most on small coins (see F4).
- **Fix:** Keep the label shot as the master and allow an out-of-flip `detail-NN` shot linked to it. The label still proves identity, and the detail shot carries legibility.

### F11 · Med · Argus' naming regex rejects Titan's own standard names
- **What breaks:** I tested 14 names built from the patterns in S2/S3 against the S4 regex. **2 of 14 pass.** It rejects:
  - master names `EU-CH-008_1969_1Franc_obv.jpg`
  - site cut-outs `C042_obv.webp`, `C042_obv_2x2.webp`, `C042_obv_t2.webp`
  - tokens `T002_…`
  - reshoots `_v2` and `_angle2`
  - the `label` role
  - album scans `A026_p03_20261010.jpg`
  
  Argus Screen 4's "Naming Rule Compliance Rate" would show close to 0 % on a correctly named library.
- **Fix:** This regex passes all 14 and still rejects `C001_front.jpg` (an Inbox pairing name), `random.jpg`, `.png`, and `X042_obv.jpg`:
  `^(?:(?:[ACBST]\d{3}|NOID|(?:AF|AS|EU|NA|OC|SA)-[A-Z]{2}-\d{3})(?:_[^/]+?)?_(?:obv|rev|label|edge|detail-\d{2}|page|slab)(?:_(?:t|v|angle)\d+)?(?:_2x2)?|A\d{3}_p\d{2}_\d{8})\.(?:jpe?g|webp)$`

### F12 · Low · An extra lossy generation, and HEIC blindness, at the privacy gate
- **What breaks:**
  - S4 strips GPS by decoding and re-encoding through canvas `toBlob` at JPEG 0.92. On a master already saved at q95 with no EXIF, this adds another generation of loss on the finest digit edges, which matters most for small and worn coins.
  - The shipped inspector (`pillars/argus/exif.js`) rejects HEIC/AVIF. iPhone HEIC drops would not be inspected at all (see Deliverable 1, `ARGUS-GROK-exif-heif-video_20261110-1702.json`).
  - The merged spec reads only the first 128 KiB for metadata. ISO BMFF files can carry metadata boxes later in the file.
- **Fix:** For S2 masters, **verify** there is no metadata instead of re-encoding. Re-encode only when a metadata block is actually found. Extend the inspector per the D1 manifest.

## 4. Proposed public test set (no private coins)

Use these to run each fix through `photo_pipeline.py qc-test` / `crop_coin.py check`:

1. US dime (17.91 mm), lustrous: F2, F3, F4.
2. Euro 1 cent (16.25 mm) and 2 cent (18.75 mm): F7.
3. Euro 20 cent, notched: F8.
4. A dateless Buffalo nickel and a 1924 vs. 1925 Standing Liberty quarter (worn): F5, F6.
5. A 1920s Mercury dime with a weak final digit: F6, strike vs. wear.
6. One full-bed flatbed scan of 8+ flips, re-saved at 4000 px: F9.
7. The 14 file names in F11.

## 5. Summary of changes proposed (for Claude, Titan integrator, and Sebastian, Argus)

| # | Change | Where | Effort |
|---|---|---|---|
| F1 | Diameter badge + true-scale view; never upscale the crop | Titan app / photomaster | S |
| F2 | Gate: coin ≥ 600 source px | photomaster QC | S |
| F3 | Re-test sharpness; measure on rim + cardboard edge at native resolution | photomaster QC | M |
| F4 | Glare on the design mask or in mm² | photomaster QC | S |
| F5 | Raking-light `detail-01` legibility shot; RTI escalation | S1 rules + PHOTO_FOLDERS | S |
| F6 | Unreadable ≠ mismatch; partial-date notation; `date_legibility` | P1/P2 briefs, FIELDS | S |
| F7 | Unguided rim fit; diameter → denomination question | photomaster QC | M |
| F8 | `shape` class | photomaster + crop_coin | M |
| F9 | Crop per flip before downsizing; "≥ 2400 px per flip side" | PHASE2_INTAKE, P2 brief | S |
| F10 | Label master + out-of-flip detail | S1/S2 | S |
| F11 | Replace the Argus naming regex | Argus spec Screen 4 | S |
| F12 | Verify-then-strip; HEIC/BMFF inspector | Argus | M |

## 6. Sources

| URL | What was taken |
|---|---|
| https://drive.google.com/file/d/1VN5p_X5P8XjgOX1vHhKwo2jT6VEdXsHB/view | S1: the 20 rules (rules 3, 10, 15, 18 and 20 quoted or paraphrased above) |
| https://drive.google.com/file/d/1EC3J1ycLcU7F-U9KhLEyBewYf8Q35rg2/view | S2: master-v1 constants and the QC gate thresholds |
| https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/PHOTO_FOLDERS.md | S3: naming, roles (`label`, `edge`, `detail-NN`), the master-v1 note |
| https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/PHASE2_INTAKE.md | S3: the 7 MB / 4000 px fallback, 1200 px / 1600 px WebP, `_t2` |
| https://github.com/jpavia10/titan-reliquary-preview/blob/main/tools/photos/P1_AGENT_BRIEF.md | S3: whole-rim rule, "never guess a date", mismatch/unusable |
| https://github.com/jpavia10/titan-reliquary-preview/blob/main/tools/photos/P2_AGENT_BRIEF.md | S3: P2 mismatch rule, the over-7 MB rule, the 2x2 crop |
| https://github.com/jpavia10/titan-reliquary-preview/blob/main/docs/protocols/DOUBLE_READ.md | the blind double-read used in F6(c) |
| https://drive.google.com/file/d/1kO-Y37v4DJd-XPRofWy4TtNCwAmPtw9m/view | S4: naming regex, `toBlob` strip, 128 KiB read |
| https://www.usmint.gov/learn/coin-and-medal-programs/coin-specifications | diameters: cent 19.05, nickel 21.21, dime 17.91, quarter 24.26, half 30.61 mm |
| https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en | euro 1c 16.25 mm, 2c 18.75 mm, 20c "Spanish flower" shape |
| https://www.pcgs.com/coinfacts/category/two-three-cents/three-cent-silver/type-1-small-star/680 and https://www.pcgs.com/coinfacts/category/gold-coins/gold-dollar/51 | 3¢ silver 14 mm; gold dollar Type 1 13 mm |
| https://www.pcgs.com/news/recessed-date-standing-liberty-quarters | SLQ raised date to 1924, millions dateless, recessed in 1925 |
| https://www.ngccoin.com/news/article/7012/ | Buffalo nickels becoming dateless; Mercury dime 1920–25 weak final digit |
| https://www.numismaticnews.net/archive/date-wear-defines-1925-d-buffalo-nickels | Buffalo date was the highest point and wore off quickly |
| https://openrti.org/about-rti | raking light at 15° shows relief through shadows; RTI enhanced views must be flagged |
| https://doi.org/10.1515/nl-2016-0010 | RTI improves details of badly preserved coins |
