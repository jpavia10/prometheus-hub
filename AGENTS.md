# Prometheus Hub — Antigravity Operating Rules (Argon + Hydrogen)

> **Normative charter:** Read `docs/CHARTER.md` before making architecture or pillar design changes. `pillars.json` is the single canonical pillar registry (validated by `node tools/registry/validate.mjs`).

## 1. System Baseline & Scope
- **Architecture:** Zero-build static PWA on GitHub Pages (`main` branch, root `/`) using native ES modules (`index.html`, `deck/`, `kit/`, `pillars/<id>/`).
- **Ecosystem (`27` active Hub destinations):**
  - **`25` local pillars** under `pillars/<id>/`: `kairos`, `hearth`, `garage`, `apollo`, `money`, `selling`, `records`, `icarus`, `hermes`, `piano`, `bastion`, `athenaeum`, `odyssey`, `privacy`, `argus`, `games`, `forge`, `foundry`, `observatory`, `kin`, `sylade` (`id: "presence"`), `aether`, `polis`, `mythos`, and `continuity`.
  - **`2` external protected pillars:** `titan` (`jpavia10/titan-reliquary-preview`) and `midas` (`jpavia10/midas-ledger`).
  - **Desk:** `hub` (`./`).
  - **Paused (excluded from active Hub navigation):** `fleet` (`jpavia10/fleet-command`).
- **Local-First & Privacy Rules:** No mandatory backend or external account. Personal financial/family/health/message/passphrase data never leaves the browser except user-initiated external scans (`observatory` HN search when requested) or explicit exports.

## 2. Absolute Protected Boundaries
- **`titan` (`locked_link_only`):** Never edit Titan or merge its data into Hub storage/backups.
- **`midas` (`link_only`):** Never modify Midas protected internals or include Midas external origin storage in Hub backups.
- **`fleet` (`paused`):** Excluded from active Hub destinations; write nothing there.
- **`presence` / `sylade` (`presence_only`):** Keep public profile scope; do not add unrelated personal tools.
- **`icarus` (`journal_only`):** Analytical trading journal only; never execute trades or provide financial advice.
- **`continuity` (`ram_crypto_only`):** RAM-only WebCrypto (`PBKDF2-SHA256` + `AES-256-GCM`); never persist plaintext secrets or passphrases.
- **No Fabrication / No Silent Overwrites:** Preserve user data, sample seeds (`ideasSeedV3`, `histSeedV1`), and unrelated `localStorage`/IndexedDB keys on restore.

## 3. Roles & Division of Responsibility
- **Argon (Orchestrator, Architect, Reviewer):** Owns requirements, sprint planning (`docs/antigravity/WORKBOARD.md`), architecture decisions, acceptance criteria, and blind 100-point Charter review (`docs/CHARTER.md` §12). Never stops at a strategy document when implementation is actionable.
- **Hydrogen (Implementer & Verifier):** Writes working code, updates `pillars.json` / manifests / unit tests, captures desktop (`1440x900`) and mobile (`390x844`) screenshots under `artifacts/screenshots/`, runs all proofs, and records exact verified results.

## 4. Mandatory Definition of Done
No UI, registry, backup, or pillar task is complete until ALL checks run **after the final edit** with zero failures:
1. `node tools/registry/validate.mjs` passes with exit code `0`.
2. `node --check` passes on `100%` of `.js`/`.mjs` files, and JSON parsing passes on `100%` of `.json`/`.webmanifest` files.
3. `node --test proofs/unit/*.test.mjs` passes with `0` failures and `0` skipped tests.
4. Headless Chromium CDP verification passes all routes (`5` Hub routes + `25` pillars = `30/30`), `0` JS/console exceptions, `0` internal `404`s, `mobileScrollW <= 390px`, plus interactive feature assertions and PNG screenshots saved under `artifacts/screenshots/<build>/`.
5. `DEPLOY_STAMP.txt`, `STATUS.md`, `SHARED_LOG.md`, and `docs/antigravity/WORKBOARD.md` are updated honestly.
