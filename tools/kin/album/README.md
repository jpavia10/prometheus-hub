# Kin album build (Claude, 2026-11-25)

How `pillars/kin/lineage/album.js`, `pillars/kin/album/catalog.js` and the `fam-*` / `face-*` pictures in `pillars/kin/lineage/docs/` were made.

- `verdicts.md`: what each of the 166 unique family images in the Kin Drive folder shows, read by eye, and whether it was kept (index = position in `drive-family-images.json`).
- `manifest.py`: the album itself: chapters, captions, years, people links, the 11 set aside and why, the face boxes.
- `build.py`: converts the downloaded Drive images (webp, 1600 px and 480 px thumbs), cuts the faces, writes `album.js` and `catalog.js`. Its paths point at the session scratchpad where the Drive downloads were; to rerun, download the images again and set `KM` and `have.json` (Drive index to local file).

For a small fix (a caption, a name from KIN-GEM-45), edit `pillars/kin/lineage/album.js` by hand and the matching line in `manifest.py`.
