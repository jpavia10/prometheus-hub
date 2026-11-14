/* Continuity · Sovereign Vault: real WebCrypto PBKDF2-SHA256 (250k iter) + AES-256-GCM encrypted emergency binder + non-secret readiness checklist.
   Passphrases and decrypted plaintext are NEVER saved to localStorage/sessionStorage. window.CONTINUITY = { encryptText, decryptVault, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("continuity"), app = $("#app");
  const KDF_ITERATIONS = 250000;

  const DEFAULT_SECTIONS = [
    { id: "cs-1", name: "Vital Contacts & Kin Handoff", status: "partial", locator: "Printed card in red emergency binder + Kin pillar" },
    { id: "cs-2", name: "Medical Directives, Allergies & Rx", status: "ready", locator: "Fireproof pouch · Frazier Park hallway closet" },
    { id: "cs-3", name: "Property Deeds, Title & Hearth Keys", status: "partial", locator: "Safe deposit box + Kern County Recorder copy" },
    { id: "cs-4", name: "Tax Returns, CPA & Policy Locators", status: "missing", locator: "Records pillar + physical CPA folder" },
    { id: "cs-5", name: "Hardware Security Keys & Digital Estate", status: "partial", locator: "Offline YubiKey backup location (inside encrypted vault only)" },
    { id: "cs-6", name: "Mountain Evacuation & Pet Go-Bag Plan", status: "ready", locator: "Garage bin + Bastion pillar checklist" },
  ];

  if (!S.get("seededV1", false) && !S.list("sections").length) {
    S.set("sections", DEFAULT_SECTIONS);
    S.set("seededV1", true);
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
    </div>
    <section id="co-pane-vault" class="grid">
      <div class="glass span-12">
        <h2>Zero-Knowledge WebCrypto Vault</h2>
        <div class="vault-banner" id="co-vstate">Checking vault status...</div>
        <form class="form" id="co-unlock-form" autocomplete="off">
          <label class="f wide">Passphrase (min 8 chars · never saved)<input name="pass" type="password" minlength="8" required autocomplete="new-password" placeholder="Enter master passphrase to unlock or seal"></label>
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
    </section>
    <section id="co-pane-checklist" class="grid" hidden>
      <div class="glass span-12">
        <h2>Emergency Binder Readiness (Non-Secret Locators)</h2>
        <p class="sub">Do not put secrets or passwords here — record where sealed physical &amp; digital packets live so kin can act fast.</p>
        <div style="margin-bottom:10px">
          <button class="btn quiet small" id="co-drill" type="button">Schedule 6-Month Continuity Drill → Calendar</button>
        </div>
        <form class="form" id="co-sform">
          <label class="f">Category<input name="name" required maxlength="80" placeholder="Trust binder, spare vehicle key..."></label>
          <label class="f">Status<select name="status"><option value="ready">ready</option><option value="partial">partial</option><option value="missing">missing</option></select></label>
          <label class="f wide">Physical / Non-Secret Locator<input name="locator" required maxlength="160" placeholder="Fireproof safe shelf B, CPA phone..."></label>
          <button class="btn" type="submit">Add Locator</button>
        </form>
        <div id="co-sections" style="margin-top:12px"></div>
      </div>
    </section>`;

  function switchTab(next) {
    tab = next;
    app.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === next)));
    ["vault", "checklist"].forEach((k) => { $("#co-pane-" + k).hidden = k !== next; });
  }
  app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  function emitStore() {
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "continuity", k: "vault" } }));
  }

  const NEXT_ST = { missing: "partial", partial: "ready", ready: "missing" };
  const PILL = { ready: "pill", partial: "pill warn", missing: "pill hot" };

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

    $("#co-envelope").replaceChildren(vault
      ? h("div.mono-box", null, `Authenticated Envelope v${vault.v} · Salt(${vault.salt.slice(0, 12)}…) · IV(${vault.iv.slice(0, 10)}…) · Ciphertext(${vault.ct.length} b64 chars)`)
      : h("p.stat-s", null, "Nothing encrypted yet. Zero plaintext secrets exist in localStorage."));

    $("#co-sections").replaceChildren(...D.sections.map((s) => h("div.kv", null,
      h("span", null, h("b", null, s.name), " ", h("span." + (PILL[s.status] || "pill"), null, s.status), h("br"), h("span.stat-s", null, s.locator)),
      h("span", { style: "display:flex;gap:6px" },
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("sections", s.id, { status: NEXT_ST[s.status] || "ready" }); paint(); emitStore(); } }, "Cycle"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("sections", s.id); paint(); emitStore(); } }, "Remove"))
    )));
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
