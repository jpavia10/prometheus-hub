# Prometheus Hub

Joseph’s desk. One page, cool midnight, a field you can point at. The doors open outward. The room itself keeps the clock, the day, and a few lines on this device.

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

- A clock and a day arc, from the device clock. The word above the time is only the hour, still in the cool palette.
- Focus lines in `localStorage` (`prometheus-hub.focus.v1`). They stay in that browser. They are not synced.
- Desk rounds: a short daily checklist you write yourself, reset each morning with a streak (`prometheus-hub.rounds.v1`).
- The deck layer (`desk-deck.js`): `/` or Ctrl/Cmd+K opens one search over every door, the records this device keeps and upcoming fixed dates; group chips and a filter over the wings (remembered in `prometheus-hub.deck.v1`); every sheet has Prev/Next (also ← →), what this device keeps for that wing, and a copyable deep link (`#money`, `#records`, …); the last door opened comes back as a Resume chip.
- The deck backup includes every `prometheus.*` and `prometheus-hub.*` key.
- In-hub sheets for every wing. Live wings open outward from the sheet. Reserved seats have no site yet.
- A particle field, adapted from [MisterPrada/morph-particles](https://github.com/MisterPrada/morph-particles). Scroll moves nebula → twin → three houses → day arc. Pointing at a wing bends the field into that wing’s shape. Shapes are drawn here. The christmas models are not included.

## Map

Sylade is the alter ego, not a wing and not Fleet Command.

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

Change a door in `index.html` and, for Sylade, in `sylade.html`. Keep addresses `https`. Leave a seat without an outbound link until the page is real.

## Home screen

iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Install app. The icon is a thin square. The name is Prometheus Hub.
