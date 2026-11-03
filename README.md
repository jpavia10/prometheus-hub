# Prometheus Hub

Joseph’s flagship desk. One screen that opens the specialists that already own the work — Titan Reliquary, Sylade Fleet, and Midas Ledger — and keeps named slots for the next ones.

Prometheus Hub does not sign in, store secrets, or re-implement those apps. The coin vault stays with Titan Reliquary. Sylade’s charter stays in Drive as `SYLADE_CHARTER`. The ledger stays inside Midas Ledger.

## Open on a phone

When this repo is published with GitHub Pages, the installable app is:

**https://jpavia10.github.io/prometheus-hub/**

iPhone: open that URL in Safari, tap Share, then **Add to Home Screen**. The icon is the gold P, and the home-screen name is Prometheus Hub. It opens standalone, without Safari’s toolbar.

Android: open the URL in Chrome, then menu → **Install app** or **Add to Home screen**.

The manifest, 192 and 512 icons, Apple touch icon, `theme-color`, and a small service worker are what make that install real. There is no splash screen and no intro.

## Open locally

```bash
python3 -m http.server 8742
```

Visit http://127.0.0.1:8742 — or open `index.html` directly. The project list is a plain script, so the links render from disk. The service worker registers on http://localhost and https only.

## Themes

Tap the **P** or **Theme**. Four looks, saved on this device only (`prometheus_theme_v1`):

- Classic
- Starship Bridge
- Orbit
- Tactical Terminal

`?theme=bridge`, `?theme=orbit`, `?theme=terminal`, or `?theme=classic` previews a look. Choosing one in the menu saves it. These are display themes only. They do not play an intro.

## Add a project

Edit `projects.js` and append an object:

```js
{
  id: "short-id",
  name: "Visible name",
  kicker: "What it is",
  tier: "bench",       // "primary" for Open now, "bench" for the quieter row
  status: "live",      // "live" with real links, "slot" when it is only a name
  summary: "One sentence.",
  note: "Optional. Use it when the boundary matters.",
  links: [
    { label: "Open", href: "https://example.com/" }
  ]
}
```

Leave `links` empty until a real `http` or `https` URL exists. Do not put passwords, tokens, or charter text in this repo.

Current bench slots, still unlinked: Hephaestus (renovations), Icarus Stake (trading), Mail, Calendar, and Health.

## GitHub Pages

The site is the files at the repository root. No build step. `.nojekyll` keeps GitHub Pages from filtering them.

1. Repository: **jpavia10/prometheus-hub** (public).
2. Settings → Pages → Deploy from branch **main**, folder **/ (root)**.
3. The phone URL is https://jpavia10.github.io/prometheus-hub/

Paths are relative, so the same files work on that project URL and on your machine. `jarvis-hub` is unused.
