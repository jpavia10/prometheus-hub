# Prometheus Hub

Joseph’s desk. One page, midnight field, thin glass. The doors open outward.

https://jpavia10.github.io/prometheus-hub/

Titan Reliquary, Sylade Fleet, and Midas Ledger keep their own work. This page only links to them, in a new tab. Nothing here signs in. No passwords, tokens, ledgers, or charter text are stored in this repo.

## Particles

The field is adapted from [MisterPrada/morph-particles](https://github.com/MisterPrada/morph-particles) (live reference: [christmas.misterprada.com](https://christmas.misterprada.com)). Positions sit in float textures. A simulation pass morphs four shapes as the page scrolls — nebula, ring, fleet, coin — and the pointer tugs the cloud. Shapes are drawn here. The christmas models are not included.

## Doors

- Titan Reliquary — https://jpavia10.github.io/titan-reliquary-preview/
- Sylade Fleet Command — https://jpavia10.github.io/fleet-command/
- Sylade Discord — https://discord.gg/YCam2NEkv9
- Midas Ledger — https://jpavia10.github.io/midas-ledger/

Change a door in `index.html`. Keep the address `https`. Leave it out until it is real.

## Pages

Publish the root of this repo to **jpavia10/prometheus-hub**, branch **main**, folder **/ (root)**. `.nojekyll` is included. GitHub Pages does not run a build; `hub.js` is already bundled.

Build it again after editing `src/`:

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

## Home screen

iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Install app. The icon is a thin square. The name is Prometheus Hub.
