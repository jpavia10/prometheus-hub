# Prometheus Hub

Joseph’s desk. One page, cool midnight, a field you can point at. Search leads. The page keeps the clock, the next dates, the session, and a few lines on this device.

https://jpavia10.github.io/prometheus-hub/

Nothing here signs in. No passwords, tokens, ledgers, photos, or trades are stored in this repo.

## Build

GitHub Pages serves this folder as-is. It does not run a build. After editing `src/`, bundle `hub.js` and commit it:

```bash
npm install
npm run build
```

`npm run build` bundles `src/main.js` to `hub.js` with esbuild. Three.js `0.164.1` matches the morph-particles demo.

Locally:

```bash
npm install
npm run build
python3 -m http.server 8742
```

`.nojekyll` is included. Publish the root of **jpavia10/prometheus-hub**, branch **main**, folder **/ (root)**.

## What the desk keeps

- A clock, from the device clock. The word above the name is only the hour, still in the cool palette.
- Search first: `/` or Ctrl/Cmd+K. Arrows move, Enter opens, Esc closes, `?` lists shortcuts. `[` `]` or Alt+arrows move along the module row.
- Next dates, the NYSE session, car and home dates, since-you-were-away, and module status. Food and exercise stay in Apollo. Public card terms open from search, or from Money.
- Focus lines in `localStorage` (`prometheus-hub.focus.v1`). They stay in that browser. They are not synced.
- The backup includes every `prometheus.*` and `prometheus-hub.*` key. A restore can be undone.
- Modules open in the desk and on their own pages (`#kairos`, `#records`, and the rest).
- A particle field, adapted from [MisterPrada/morph-particles](https://github.com/MisterPrada/morph-particles). Pointing at a module that has a shape bends the field. Shapes are drawn here. The christmas models are not included.

## Map

Sylade is the alter ego, and not Fleet Command.

| | Where it goes |
| --- | --- |
| Sylade | `sylade.html` in this repo |
| Titan Reliquary | https://jpavia10.github.io/titan-reliquary-preview/ |
| Midas Ledger | https://jpavia10.github.io/midas-ledger/ |
| Hephaestus Hearth | https://jpavia10.github.io/hephaestus-hearth/ |
| Prometheus Hub Drive | https://drive.google.com/drive/folders/1ykx47zGga6Jbd4FrUzBWde2frT3_6cnP — AI folders and Shared. The folder stays in Drive. |
| Apollo Temple | Health, fitness, nutrition: `pillars/apollo/` (live at /pillars/apollo/) |
| Hermes Post | Mail triage: `pillars/hermes/` (live at /pillars/hermes/) |
| Kairos Meridian | Time, every deadline, focus clock: `pillars/kairos/` (live at /pillars/kairos/) |
| Icarus Stake | High-risk trading journal, never trades: `pillars/icarus/` (live at /pillars/icarus/) |
| Argus Album | Every photo the pillars use: `pillars/argus/` (live at /pillars/argus/) |
| Fleet Command | Paused (Joseph, 2026-10-28). Nothing reports to it. Not Sylade. https://jpavia10.github.io/fleet-command/ |

## Sylade

Public contacts, also on `sylade.html`:

- Email: sylade.ais@gmail.com
- GitHub: https://github.com/sylade-ais (profile name Sylade)
- Discord: https://discord.gg/YCam2NEkv9 (room name Sylade Fleet)

That Discord room is not the Fleet Command site. No other Sylade addresses are published here.

Change a module in `index.html` and, for Sylade, in `sylade.html`. Keep addresses `https`. Leave a seat without an outbound link until the page is real.

## Home screen

iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Install app. The icon is a thin square. The name is Prometheus Hub.
