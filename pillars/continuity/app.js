/* Continuity · Sovereign Vault: real WebCrypto PBKDF2-SHA256 (250k iter) + AES-256-GCM encrypted emergency binder + non-secret readiness checklist.
   Passphrases and decrypted plaintext are NEVER saved to localStorage/sessionStorage. window.CONTINUITY = { encryptText, decryptVault, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("continuity"), app = $("#app");
  const KDF_ITERATIONS = 250000;

  /* The binder (Sebastian, 2026-11-14): rebuilt from Joseph's real records — see binder-seed.js.
     The previously shipped template asserted "ready" for things no record backs (a fireproof
     pouch, a safe deposit box); those rows were fiction. Migration, run once (binderSeedV1):
     rows that exactly match the old template are dropped, user-added or user-edited rows are
     kept untouched, and real binder sections not already present are appended. */
  const OLD_TEMPLATE = [
    { id: "cs-1", name: "Vital Contacts & Kin Handoff", status: "partial", locator: "Printed card in red emergency binder + Kin pillar" },
    { id: "cs-2", name: "Medical Directives, Allergies and Rx", status: "ready", locator: "Fireproof pouch · hallway closet" },
    { id: "cs-3", name: "Property Deeds, Title & Hearth Keys", status: "partial", locator: "Safe deposit box + Kern County Recorder copy" },
    { id: "cs-4", name: "Tax Returns, CPA & Policy Locators", status: "missing", locator: "Records pillar + physical CPA folder" },
    { id: "cs-5", name: "Hardware Security Keys & Digital Estate", status: "partial", locator: "Offline YubiKey backup location (inside encrypted vault only)" },
    { id: "cs-6", name: "Mountain Evacuation & Pet Go-Bag Plan", status: "ready", locator: "Garage bin + Bastion pillar checklist" },
  ];

  if (!S.get("binderSeedV1", false)) {
    const isTpl = (s) => OLD_TEMPLATE.some((d) => d.id === s.id && d.name === s.name && d.status === s.status && d.locator === s.locator);
    const kept = S.list("sections").filter((s) => !isTpl(s));
    const have = new Set(kept.map((s) => s.id));
    const binder = (window.CONTINUITY_BINDER || []).filter((s) => !have.has(s.id));
    S.set("sections", [...kept, ...binder]);
    S.set("binderSeedV1", true);
  }

  const te = new TextEncoder(), td = new TextDecoder();
  const toB64 = (buf) => {
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  };
  const fromB64 = (str) => {
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  };

  async function deriveKey(passphrase, saltBytes, iterations, usages) {
    if (!passphrase || String(passphrase).length < 8) throw new Error("Passphrase must be at least 8 characters");
    const subtle = (globalThis.crypto || window.crypto).subtle;
    const baseKey = await subtle.importKey("raw", te.encode(String(passphrase)), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      usages
    );
  }

  async function encryptText(plainText, passphrase) {
    const rng = globalThis.crypto || window.crypto;
    const subtle = rng.subtle;
    const salt = rng.getRandomValues(new Uint8Array(16));
    const iv = rng.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt, KDF_ITERATIONS, ["encrypt"]);
    const ct = await subtle.encrypt({ name: "AES-GCM", iv }, key, te.encode(String(plainText || "")));
    return {
      v: 1,
      kdf: "PBKDF2-SHA256",
      iter: KDF_ITERATIONS,
      cipher: "AES-256-GCM",
      salt: toB64(salt),
      iv: toB64(iv),
      ct: toB64(ct),
      updatedAt: day(),
    };
  }

  async function decryptVault(envelope, passphrase) {
    if (!envelope || !envelope.salt || !envelope.iv || !envelope.ct) throw new Error("No encrypted vault present");
    const subtle = (globalThis.crypto || window.crypto).subtle;
    const salt = fromB64(envelope.salt);
    const iv = fromB64(envelope.iv);
    const ct = fromB64(envelope.ct);
    const key = await deriveKey(passphrase, salt, +envelope.iter || KDF_ITERATIONS, ["decrypt"]);
    try {
      const plain = await subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return td.decode(plain);
    } catch (e) {
      throw new Error("Wrong passphrase or tampered vault ciphertext");
    }
  }

  let unlockedText = null;

  window.CONTINUITY = {
    encryptText,
    decryptVault,
    data: () => {
      const sections = S.list("sections"), vault = S.get("vault", null);
      const ready = sections.filter((s) => s.status === "ready").length;
      const pct = sections.length ? Math.round((ready / sections.length) * 100) : 0;
      return {
        sections,
        pct,
        vault: vault ? { v: vault.v, kdf: vault.kdf, iter: vault.iter, cipher: vault.cipher, updatedAt: vault.updatedAt } : null,
        unlocked: unlockedText !== null,
      };
    },
  };

  let tab = "vault";
  app.innerHTML = `
    <div class="tabs" role="tablist" aria-label="Continuity views">
      <button class="tab" type="button" role="tab" data-tab="vault" aria-selected="true">Encrypted Sovereign Vault</button>
      <button class="tab" type="button" role="tab" data-tab="checklist" aria-selected="false">Binder Readiness Checklist</button>
      <button class="tab" type="button" role="tab" data-tab="accounts" aria-selected="false">Accounts After Death</button>
    </div>
    <section id="co-pane-vault" class="grid">
      <div class="glass span-7">
        <h2>Zero-Knowledge WebCrypto Vault</h2>
        <div class="vault-banner" id="co-vstate">Checking vault status...</div>
        <form class="form" id="co-unlock-form" autocomplete="off">
          <label class="f wide">Passphrase (min 8 chars · never saved)<input name="pass" id="co-pass" type="password" minlength="8" required autocomplete="new-password" placeholder="Enter master passphrase to unlock or seal"></label>
          <button class="btn" id="co-btn-unlock" type="submit">Unlock Vault</button>
          <button class="btn quiet" id="co-btn-lock" type="button" hidden>Lock &amp; Wipe Memory</button>
        </form>
        <div id="co-editor" style="margin-top:12px">
          <label class="f wide" for="co-plain">Runbook / Legacy Instructions (encrypted only when you click Encrypt &amp; Seal)</label>
          <textarea class="ta" id="co-plain" placeholder="Unlock an existing vault or compose legacy locator notes here, then Encrypt &amp; Seal with your passphrase..."></textarea>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
            <button class="btn" id="co-btn-seal" type="button">Encrypt &amp; Seal Vault</button>
            <button class="btn quiet" id="co-btn-dl" type="button">Download .vault.json</button>
            <button class="btn quiet" id="co-btn-load" type="button">Load .vault.json</button>
          </div>
        </div>
        <div id="co-envelope" style="margin-top:12px"></div>
      </div>
      <div class="glass lit span-5">
        <h2>Entropy Meter &amp; Recovery Sheet</h2>
        <p class="sub">Evaluates passphrase strength live in RAM + compiles a printable non-secret recovery sheet.</p>
        <div id="co-meter" class="kv"><span>Passphrase entropy</span><b>0 bits (Type above to check)</b></div>
        <div id="co-readiness" style="margin-top:8px"></div>
        <div class="row-actions" style="margin-top:12px">
          <button class="btn quiet small" id="co-print" type="button">Export Recovery Sheet (.txt)</button>
        </div>
      </div>
    </section>
    <section id="co-pane-checklist" class="grid" hidden>
      <div class="glass span-12 co-folio">
        <h2>Emergency Binder Readiness (Non-Secret Locators)</h2>
        <div class="co-titleblock">
          <div class="co-tb-main">
            <p class="sub">Do not put secrets or passwords here — record where sealed physical &amp; digital packets live so kin can act fast. What this binder does not hold is listed on the docket, in the open — a gap is never dressed as a record.</p>
          </div>
          <div class="co-tb-side">
            <div id="co-folio-summary" aria-label="Binder completeness by chapter"></div>
            <button class="btn quiet small" id="co-drill" type="button">Schedule 6-Month Continuity Drill → Calendar</button>
          </div>
        </div>
        <div id="co-docket"></div>
        <div id="co-sections"></div>
        <div class="co-amend">
          <h3 class="co-amend-h">Amend This Record</h3>
          <form class="form" id="co-sform">
            <label class="f">Category<input name="name" required maxlength="80" placeholder="Trust binder, spare vehicle key..."></label>
            <label class="f">Status<select name="status"><option value="ready">ready</option><option value="partial">partial</option><option value="missing">missing</option></select></label>
            <label class="f wide">Physical / Non-Secret Locator<input name="locator" required maxlength="160" placeholder="Fireproof safe shelf B, CPA phone..."></label>
            <button class="btn" type="submit">Add Locator</button>
          </form>
        </div>
      </div>
    </section>
    <section id="co-pane-accounts" class="grid" hidden>
      <div class="glass span-12">
        <h2>What happens to each account when its owner dies</h2>
        <p class="sub">25 services: what to set up now, what the family can do after, in the provider's own words with a link (CON-GEM-03, checked 8/10). Mark one when it is set up; nothing here stores a password.</p>
        <div id="co-acc-sum" class="kv" style="margin:6px 0 10px"></div>
        <label class="f wide" style="display:block;margin:0 0 10px">Search<input id="co-aq" type="search" placeholder="Google, bank, crypto, password manager…"></label>
        <div id="co-accounts"></div>
      </div>
    </section>`;

  function switchTab(next) {
    tab = next;
    app.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === next)));
    ["vault", "checklist", "accounts"].forEach((k) => { $("#co-pane-" + k).hidden = k !== next; });
  }
  app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  function emitStore() {
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "continuity", k: "vault" } }));
  }

  const NEXT_ST = { missing: "partial", partial: "ready", ready: "missing" };

  /* Folio presentation (design pass): chapters carry an honest seal — solid for recorded,
     half for partial, dashed and empty for not recorded — and the seal is always paired
     with its word, never color alone. Gap clauses inside a locator (the segments that say
     "not recorded yet") are set apart in the text itself; the words are never altered. */
  const STATUS_LABEL = { ready: "Recorded", partial: "Partially recorded", missing: "Not recorded" };
  const sealEl = (status) => h("span.co-seal", { "data-status": status, role: "img", "aria-label": STATUS_LABEL[status] || status },
    h("span.co-seal-disc", null, status === "ready" ? "✓" : ""));
  const locatorNodes = (locator) => {
    const out = [];
    String(locator || "").split(" · ").forEach((part, idx) => {
      if (idx) out.push(h("span.co-sep", { "aria-hidden": "true" }, " · "));
      out.push(/not recorded yet/i.test(part) ? h("span.co-gap", null, part) : part);
    });
    return out;
  };
  const gapText = (s) => {
    const gaps = String(s.locator || "").split(" · ").filter((part) => /not recorded yet/i.test(part));
    return gaps.length ? gaps.join(" · ") : String(s.locator || "");
  };

  /* CON-GEM-03 (2026-11-19): every service's legacy policy (window.CONTINUITY_POLICIES, legacy-policies.js); "set up" marks live in
     this pillar's store under "legacySetup" as { n: date }. */
  function paintAccounts() {
    const box = $("#co-accounts"); if (!box || !window.CONTINUITY_POLICIES) return;
    const done = S.get("legacySetup", {}), all = window.CONTINUITY_POLICIES, q = ($("#co-aq").value || "").toLowerCase();
    const rows = all.filter((r) => !q || (r.service + " " + r.feature + " " + r.set_up_now + " " + r.after_death).toLowerCase().includes(q));
    const n = all.filter((r) => done[r.n]).length;
    $("#co-acc-sum").replaceChildren(h("span", null, h("b", null, `${n} of ${all.length}`), " set up"), h("div.meter", { style: "flex:1;margin-left:12px" }, h("i", { style: `width:${Math.round((n / all.length) * 100)}%` })));
    box.replaceChildren(...rows.map((r) => h("div.kv", { style: "align-items:flex-start" },
      h("span", null, h("b", null, r.service), " ", h("span.pill", null, r.feature), r.unchecked ? h("span.pill.warn", null, " not second-read") : null, h("br"),
        h("span", null, h("b", null, "Now: "), r.set_up_now), h("br"),
        h("span.stat-s", null, h("b", null, "After: "), r.after_death),
        r.quote ? h("q.stat-s", { style: "display:block;margin:4px 0;font-style:italic" }, r.quote) : null,
        r.corrected ? h("span.stat-s", { style: "display:block;margin:2px 0;opacity:.75" }, r.corrected) : null,
        r.note ? h("span.stat-s", { style: "display:block" }, "Note: " + r.note) : null,
        h("a.stat-s", { href: r.url, target: "_blank", rel: "noopener" }, "provider's page ↗")),
      h("button.btn.small" + (done[r.n] ? "" : ".quiet"), { type: "button", "aria-pressed": String(!!done[r.n]), onclick: () => {
        const d = S.get("legacySetup", {}); if (d[r.n]) delete d[r.n]; else d[r.n] = day(); S.set("legacySetup", d); paintAccounts(); emitStore();
      } }, done[r.n] ? "Set up ✓" : "Mark set up"))));
  }
  if ($("#co-aq")) { $("#co-aq").addEventListener("input", paintAccounts); paintAccounts(); }

  function paint() {
    const vault = S.get("vault", null), D = window.CONTINUITY.data();
    const banner = $("#co-vstate");
    if (unlockedText !== null) {
      banner.textContent = `UNLOCKED IN RAM · Edit above and click "Encrypt & Seal Vault" to re-encrypt before locking.`;
      $("#co-plain").value = unlockedText;
      $("#co-btn-lock").hidden = false;
    } else if (vault) {
      banner.textContent = `SEALED ON DISK · ${vault.cipher} · ${vault.kdf} (${vault.iter.toLocaleString()} iterations) · Updated ${vault.updatedAt || "today"}`;
      $("#co-btn-lock").hidden = true;
    } else {
      banner.textContent = `NO VAULT YET · Compose legacy runbook notes below, enter a passphrase (min 8 chars), and click "Encrypt & Seal Vault".`;
      $("#co-btn-lock").hidden = true;
    }

    banner.dataset.state = unlockedText !== null ? "open" : vault ? "sealed" : "empty";

    $("#co-envelope").replaceChildren(vault
      ? h("div.mono-box", null, `Authenticated Envelope v${vault.v} · Salt(${vault.salt.slice(0, 12)}…) · IV(${vault.iv.slice(0, 10)}…) · Ciphertext(${vault.ct.length} b64 chars)`)
      : h("p.stat-s", null, "Nothing encrypted yet. Zero plaintext secrets exist in localStorage."));

    const secNo = (i) => "§ " + String(i + 1).padStart(2, "0");

    const sumEl = $("#co-folio-summary");
    if (sumEl) {
      const nR = D.sections.filter((s) => s.status === "ready").length;
      const nP = D.sections.filter((s) => s.status === "partial").length;
      const nM = D.sections.filter((s) => s.status === "missing").length;
      const totS = D.sections.length || 1;
      sumEl.replaceChildren(
        h("span.co-sum-line", null,
          h("b", null, String(nR)), " recorded · ", h("b", null, String(nP)), " partial · ", h("b", null, String(nM)), " not recorded"),
        h("span.co-meter3", { "aria-hidden": "true" },
          h("i.co-m3-r", { style: `width:${(nR / totS) * 100}%` }),
          h("i.co-m3-p", { style: `width:${(nP / totS) * 100}%` }),
          h("i.co-m3-m", { style: `width:${(nM / totS) * 100}%` })));
    }

    const docket = $("#co-docket");
    if (docket) {
      const open = D.sections.map((s, i) => ({ s, i })).filter(({ s }) => s.status !== "ready");
      docket.replaceChildren(
        h("div.co-docket-head", null,
          h("h3.co-docket-title", null, "Open Items Docket"),
          h("span.co-docket-note", null, open.length ? `${open.length} of ${D.sections.length} chapters are not fully recorded` : "Nothing outstanding")),
        ...(open.length
          ? open.map(({ s, i }) => h("a.co-docket-row", { href: "#co-ch-" + s.id, "data-status": s.status },
              h("span.co-docket-sec", null, secNo(i)),
              h("span.co-docket-main", null,
                h("b", null, s.name),
                h("span.co-docket-gap", null, gapText(s))),
              h("span.co-docket-state", null, STATUS_LABEL[s.status] || s.status)))
          : [h("p.co-docket-clear", null, "No open items — every chapter of this binder is recorded in full.")]));
    }

    $("#co-sections").replaceChildren(...D.sections.map((s, i) => h("article.co-chapter", { id: "co-ch-" + s.id, "data-status": s.status },
      h("div.co-ch-rail", null,
        h("span.co-sec", null, secNo(i)),
        sealEl(s.status)),
      h("div.co-ch-main", null,
        h("div.co-ch-head", null,
          h("h3.co-ch-name", null, s.name),
          h("span.co-ch-state", null, STATUS_LABEL[s.status] || s.status)),
        h("p.co-locator", null, locatorNodes(s.locator)),
        h("div.co-ch-actions", null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("sections", s.id, { status: NEXT_ST[s.status] || "ready" }); paint(); emitStore(); } }, "Cycle status"),
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("sections", s.id); paint(); emitStore(); } }, "Remove"))))));

    const ready = D.sections.filter((s) => s.status === "ready").length, tot = D.sections.length || 1;
    const rdBox = document.getElementById("co-readiness");
    if (rdBox) {
      rdBox.innerHTML = `<div class="kv"><span>Binder readiness</span><b>${ready} / ${D.sections.length} (${Math.round(ready / tot * 100)}%)</b></div>`
        + `<div class="kv"><span>Cipher &amp; KDF</span><b>AES-256-GCM / PBKDF2 ${Math.round(((S.get("vault", null) || {}).iter || KDF_ITERATIONS) / 1000)}k</b></div>`
        + `<div class="kv"><span>Open items on the docket</span><b>${D.sections.length - ready} of ${D.sections.length} chapters</b></div>`;
    }
  }

  const passIn = document.getElementById("co-pass");
  if (passIn) {
    passIn.addEventListener("input", () => {
      const p = passIn.value || "";
      let pool = 0;
      if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26;
      if (/\d/.test(p)) pool += 10; if (/[^A-Za-z0-9]/.test(p)) pool += 32;
      const bits = p.length && pool ? Math.round(p.length * Math.log2(pool)) : 0;
      const tier = bits >= 80 ? "Strong (centuries+)" : bits >= 56 ? "Moderate (use longer phrase)" : "Weak";
      $("#co-meter").innerHTML = `<span>Passphrase entropy (RAM only)</span><b>${bits} bits · ${tier}</b>`;
    });
  }
  const printBtn = document.getElementById("co-print");
  if (printBtn) {
    printBtn.onclick = () => {
      const vault = S.get("vault", null), secs = S.list("sections");
      const sheet = [
        `SOVEREIGN CONTINUITY RECOVERY SHEET — ${day()}`,
        `IMPORTANT: This sheet holds ZERO secrets or passphrases.`,
        ``,
        `1. VAULT ENVELOPE METADATA`,
        vault ? `Cipher: ${vault.cipher} | KDF: ${vault.kdf} (${vault.iter} iterations) | Salt: ${vault.salt} | Updated: ${vault.updatedAt}` : `Status: No vault sealed yet.`,
        ``,
        `2. NON-SECRET PHYSICAL & DIGITAL LOCATORS`,
        ...secs.map((s, i) => `${i + 1}. [${s.status.toUpperCase()}] ${s.name} -> ${s.locator}`),
        ``,
        `3. DECRYPTION INSTRUCTIONS`,
        `Open Prometheus Hub -> Continuity Sovereign Vault, load .vault.json (or local browser storage), enter master passphrase.`
      ].join("\n");
      download(`continuity_recovery_sheet_${day()}.txt`, sheet);
      toast("Downloaded non-secret recovery sheet");
    };
  }

  $("#co-unlock-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pass = e.target.pass.value, vault = S.get("vault", null);
    if (!vault) { toast("No sealed vault yet — compose below and press Encrypt & Seal Vault"); return; }
    try {
      unlockedText = await decryptVault(vault, pass);
      e.target.pass.value = "";
      toast("Vault decrypted into memory");
      paint();
      emitStore();
    } catch (err) {
      toast(err.message);
    }
  });

  $("#co-btn-seal").addEventListener("click", async () => {
    const pass = $("#co-unlock-form").pass.value;
    const text = $("#co-plain").value;
    if (!text.trim()) { toast("Write runbook notes to encrypt first"); return; }
    try {
      const env = await encryptText(text, pass);
      S.set("vault", env);
      unlockedText = null;
      $("#co-plain").value = "";
      $("#co-unlock-form").pass.value = "";
      if (window.PB && PB.events) PB.events.publish({ type: "continuity.sealed", pillar: "continuity", title: "Sovereign vault sealed" });
      toast("Encrypted with AES-256-GCM & locked");
      paint();
      emitStore();
    } catch (err) {
      toast(err.message);
    }
  });

  $("#co-btn-lock").addEventListener("click", () => {
    unlockedText = null;
    $("#co-plain").value = "";
    $("#co-unlock-form").pass.value = "";
    toast("Vault locked — plaintext wiped from DOM & memory");
    paint();
    emitStore();
  });

  $("#co-btn-dl").addEventListener("click", () => {
    const vault = S.get("vault", null);
    if (!vault) { toast("Encrypt & seal a vault before downloading"); return; }
    download(`continuity_${day()}.vault.json`, JSON.stringify(vault, null, 2));
  });

  $("#co-btn-load").addEventListener("click", async () => {
    const f = await pickFile();
    if (!f) return;
    try {
      const v = JSON.parse(await f.text());
      if (!v || !v.salt || !v.iv || !v.ct) throw new Error("Not a valid .vault.json envelope");
      S.set("vault", v);
      unlockedText = null;
      $("#co-plain").value = "";
      toast("Encrypted .vault.json loaded — enter passphrase to unlock");
      paint();
      emitStore();
    } catch (err) {
      toast(err.message);
    }
  });

  $("#co-sform").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    S.add("sections", { name: f.name.value.trim(), status: f.status.value, locator: f.locator.value.trim() });
    f.reset();
    toast("Locator added");
    paint();
    emitStore();
  });

  $("#co-drill").addEventListener("click", () => {
    const d = new Date();
    d.setDate(d.getDate() + 180);
    const due = day(d);
    if (window.PB && PB.deadlines) {
      PB.deadlines.publish({ title: "Continuity: Test Emergency Binder & Passphrase Recall", date: due, source: "continuity", kind: "vault", ref: "drill-180" });
      toast(`Published 6-month drill for ${due} to calendar`);
    }
  });

  $("#export").onclick = () => download(`continuity_meta_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); emitStore(); } catch (e) { toast(e.message); } };

  paint();
})();
