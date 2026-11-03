# Prometheus Hub

Joseph’s flagship desk. The shell is the same night-museum family as [Titan Reliquary Preview](https://jpavia10.github.io/titan-reliquary-preview/): Fraunces wordmark, gold on near-black, and a bottom wing dock. The room itself is the desk, not a coin board and not a copied vault.

Titan Reliquary is the primary extension. Ownership stays there. This page only links to the live preview and its repo. Sylade Fleet and Midas Ledger are the other two doors that already exist. Bench names wait in `projects.js` until they have an address.

Nothing here signs in or stores a secret. Sylade’s charter stays in Drive as `SYLADE_CHARTER`.

## Open

https://jpavia10.github.io/prometheus-hub/

The first open of a session plays a fifteen-second fire. Tap, click, or Esc skips it. Reduced motion shows a still title and an Enter button instead of the film. A home-screen cold open is a new session, so it gets the full show. `?nosplash` skips. `?splash=1` forces it.

iPhone: Safari → Share → Add to Home Screen. Android: Chrome → Install app. The icon is the gold P. The name is Prometheus Hub.

Locally:

```bash
python3 -m http.server 8742
```

## Wings

- **Desk** — the hearth. Titan sits in the fire. Sylade and Midas flank it.
- **Extensions** — the three live houses, plus the unlit slots.
- **Ops** — what this desk is, what it refuses to keep, and how to add a name.

## Add a project

Append an object to `projects.js`. Use a real `https` link or leave `links` empty. Do not put passwords, tokens, or charter text in this file.

## Pages

Publish the root of this repo to **jpavia10/prometheus-hub**, branch **main**, folder **/ (root)**. There is no build step. `.nojekyll` is included.
