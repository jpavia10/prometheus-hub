# The town's sound: sources and licences

The hub home's ambience (`deck/views/townsound.js`, 2026-11-25). Eight files copied unchanged from Titan Reliquary's ambience set
(`jpavia10/titan-reliquary-preview`, `audio/ambience/`, whose CREDITS.md has the full record). They are re-encoded excerpts of field
recordings published in the **Moodist** project (https://github.com/remvze/moodist, `public/sounds/`), each under one of two licences
that Moodist does not itemise per file:

- **CC0 1.0** (public domain dedication): https://creativecommons.org/publicdomain/zero/1.0/
- **Pixabay Content License**: https://pixabay.com/service/license-summary/ (free use, no attribution required; the files may not be
  redistributed as a standalone sound collection, so this folder is never offered as a sound pack)

Processing (Titan's `tools/ambience/encode.py`): the most stationary 10-40 s region, tail crossfaded into the head for a seamless loop,
about -20 LUFS, Opus in WebM (the browser's first choice) and AAC in M4A (Safari). One-shot files hold several takes; the takes are
listed in `townsound.js` (`TAKES`).

| file | kind | upstream | used for |
|---|---|---|---|
| `rainLight` | loop, 40 s | `rain/light-rain.mp3` | rain |
| `rainHeavy` | loop, 19.4 s | `rain/heavy-rain.mp3` | heavy rain and storms |
| `wind` | loop, 40 s | `nature/wind.mp3` | the wind, always a little |
| `windHowl` | loop, 40 s | `nature/howling-wind.mp3` | gales and storms |
| `birds` | loop, 40 s | `animals/birds.mp3` | daytime, louder at dawn and in spring, hushed in rain and snow |
| `crickets` | loop, 40 s | `animals/crickets.mp3` | warm nights (by the temperature, else the season) |
| `owl` | 2 takes | `animals/owl.mp3` | now and then after dark, dry nights |
| `thunder` | 3 takes | `rain/thunder.mp3` | 0.6-4 s after the lightning the town shows |

Measured in the build container (not auditioned by ear): every loop is steady within a few dB (rain broadband, centroid 3.4-5.1 kHz;
wind under 1 kHz; birds and crickets 2-6 kHz) and its seam is inaudible by level. Titan's "night village" bed was left out: its
middle band could hold voices.
