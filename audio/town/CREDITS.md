# The town's sound: sources and licences

The hub home's ambience (`deck/views/townsound.js`, 2026-11-25; second set the same day). The first eight files were copied unchanged from Titan Reliquary's ambience set
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

## Second set (2026-11-25, owner: "The sound design is terrible also. It should be 1000 percent better")

Made by `tools/audio/town.py` straight from Moodist's `public/sounds/` (the same two licences as above, not itemised per file upstream):
the steadiest stretch of each recording, its tail crossfaded into its head, about -21 dBFS RMS with a look-ahead limiter at -1 dBFS;
the sounds placed in the painting are mono (the page pans them); one-shots are the cleanest takes, faded, listed in `takes.json`.
`creak` is Titan's own cut (its `audio/ambience/creak.*`, from `transport/sailboat.mp3`), copied unchanged.

| file | kind | upstream | used for |
|---|---|---|---|
| `river` | placed loop, 26 s, mono | `nature/river.mp3` | the river and the lake through the town |
| `waterfall` | placed loop, 18 s, mono | `nature/waterfall.mp3` | the two falls |
| `fountain` | placed loop, 20 s, mono | `nature/droplets.mp3` | the water round the spire |
| `lapping` | placed loop, 26 s, mono | `nature/waves.mp3` | water at the dock, filtered soft |
| `frogs` | placed loop, 26 s, mono | `animals/frog.mp3` | by the lake and the pond, warm nights |
| `chimes` | placed loop, 30 s, mono | `things/wind-chimes.mp3` | Hearth's porch, in a breeze |
| `leaves` | bed, 30 s | `rain/rain-on-leaves.mp3` | rain in the trees |
| `windTrees` | bed, 30 s | `nature/wind-in-trees.mp3` | wind through the forests (gusting) |
| `crows` | 5 takes | `animals/crows.mp3` | autumn and winter mornings |
| `woodpecker` | 3 takes | `animals/woodpecker.mp3` | spring and summer mornings |
| `dog` | 4 takes | `animals/dog-barking.mp3` | far off, evenings and mornings |
| `fireworks` | 5 takes | `urban/fireworks.mp3` | July 4th from nine, New Year's Eve at midnight |
| `creak` | 5 takes | Titan's cut of `transport/sailboat.mp3` | the boat at the dock |

The clock tower's bell is not a recording: it is synthesized partial by partial in `townsound.js` (`strikeBell`).
Measured in the build container (not auditioned by ear): loops steady within 0.2-3.3 dB a second (frogs vary, as frogs do), every seam
under 3.5 dB; crows' takes centre near 2.7 kHz, the dog's near 1.3 kHz, the fireworks' near 1.5 kHz.

