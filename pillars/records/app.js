/* Records v3: 7-day School/TK Shield & 30-day renewal alert banner + instant Serial/Model vault search + 1-tap sample Warranty+TK seed + 2026 Deadline Templates. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("records");
  const app = $("#app");
  field({ count: 900, at: [0.76, 0.32], scale: 0.24, glyph: (n) => [...G.line(Math.round(n * 0.34), -0.5, -0.7, -0.5, 0.7), ...G.line(Math.round(n * 0.33), 0, -0.7, 0, 0.7), ...G.line(Math.round(n * 0.33), 0.5, -0.7, 0.5, 0.7)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CATS = ["school", "warranty", "vehicle", "home", "financial", "medical", "identity", "other"];
  const addDays = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  const TEMPLATES_2026 = [
    { title: "IRS Federal Return / Extension (Form 1040 / 4868)", category: "financial", issuer: "IRS", due: "2026-04-15", where: "Drive / Taxes 2026", serial: "1040-2026", notes: "7-day tax shield check" },
    { title: "CA Franchise Tax Board (Form 540)", category: "financial", issuer: "CA FTB", due: "2026-04-15", where: "Drive / Taxes 2026", serial: "540-2026", notes: "State parity deadline" },
    { title: "Kern County Property Tax — 1st Installment", category: "home", issuer: "Kern County Treasurer", due: "2026-12-10", where: "Drive / House", serial: "KERN-PROP-26", notes: "Delinquent after 5 PM" },
    { title: "TX -> CA DMV Registration & Title Renewal", category: "vehicle", issuer: "CA DMV", due: "2026-06-30", where: "Glovebox + Drive", serial: "SORENTO-2025", notes: "2025 Sorento Hybrid smog/VIN verify" },
    { title: "Violet TK Enrollment / Shot Record Packet", category: "school", issuer: "El Tejon / District", due: "2026-08-01", where: "Binder + Drive", serial: "TK-IMMUN-26", notes: "Flags urgent inside 7 days" }
  ];

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12"><h2>Urgent Shield &amp; 30-Day Renewal Radar</h2><div id="r-alerts"></div></div>
      <div class="glass span-6">
        <h2>2026 Templates &amp; 1-Tap Test Seed</h2>
        <div class="row-actions" id="r-tpls" style="flex-wrap:wrap;gap:6px;margin-top:8px"></div>
        <div class="row-actions" style="margin-top:10px">
          <button class="btn small" id="r-seed-demo" type="button">Seed Sample Warranty + 5-Day TK Alert</button>
        </div>
      </div>
      <div class="glass span-6"><h2>Instant Serial &amp; Vault Search</h2>
        <form class="form"><label class="f wide">Search title, serial #, issuer, location<input id="r-q" type="search" placeholder="SN-…, Yamaha, Sorento, TK…"></label></form>
        <div class="stat-s" id="r-count" style="margin-top:8px"></div>
      </div>
      <div class="glass span-6"><h2>Register a Document or Warranty</h2>
        <form class="form" id="r-form">
          <label class="f wide">Title<input name="title" required maxlength="120"></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <label class="f">Issuer / Brand<input name="issuer" maxlength="80"></label>
          <label class="f">Serial / Policy #<input name="serial" maxlength="60" placeholder="SN-…, Policy #"></label>
          <label class="f">Document date<input name="date" type="date"></label>
          <label class="f">Renewal / due date<input name="due" type="date"></label>
          <label class="f wide">Original location<input name="where" maxlength="160" placeholder="Drive Sebastian/…, drawer 2…"></label>
          <label class="f wide">Notes<input name="notes" maxlength="200"></label>
          <button class="btn" type="submit">Register</button>
        </form>
      </div>
      <div class="glass span-6"><h2>Document &amp; Serial Registry</h2><div id="r-list"></div></div>
    </section>`;

  TEMPLATES_2026.forEach((tpl) => {
    $("#r-tpls").append(h("button.btn.quiet.small", {
      type: "button",
      onclick: () => {
        if (S.list("docs").some((d) => d.title === tpl.title && d.due === tpl.due)) { toast("Already registered"); return; }
        S.add("docs", { ...tpl, date: day() }); toast("Added " + tpl.title); paint();
      }
    }, "+ " + tpl.title.split("(")[0].trim()));
  });

  $("#r-seed-demo").onclick = () => {
    const t = day();
    S.add("docs", { title: "Sample Appliance Extended Warranty (Synthetic)", category: "warranty", issuer: "Sample Mfg", serial: "SN-SAMPLE-2026", date: t, due: addDays(t, 22), where: "Receipt Binder #1", notes: "Covers compressor & labor" });
    S.add("docs", { title: "TK Immunization & Physical Form (Sample Alert)", category: "school", issuer: "Sample District", serial: "TK-SAMPLE-01", date: t, due: addDays(t, 5), where: "Kitchen Folder", notes: "Inside 7-day School Shield" });
    toast("Seeded Warranty + 5-day TK alert!"); paint();
  };

  function paint() {
    const t = day(), docs = S.list("docs");
    const alerts = [];
    for (const d of docs) {
      if (window.PB && d.due) PB.deadlines.publish({ title: (d.category === "school" ? "School: " : "Renewal: ") + d.title, date: d.due, source: "records", kind: d.category === "school" ? "school" : "renewal", ref: d.id });
      const c = RECORDS.classify(d, t);
      if (c.flag === "overdue" || c.flag === "urgent" || c.flag === "soon") alerts.push({ d, c });
    }
    $("#r-alerts").innerHTML = alerts.length
      ? alerts.sort((a, b) => a.c.days - b.c.days).map(({ d, c }) => `<div class="kv"><span><b class="${c.flag === "overdue" || c.flag === "urgent" ? "down" : "warn"}">${c.flag.toUpperCase()} (${c.days}d)</b> · ${esc(d.title)}${d.serial ? ` · <code>${esc(d.serial)}</code>` : ""}</span><b>due ${d.due}</b></div>`).join("")
      : `<p class="empty">No school packets inside 7 days or renewals inside 30 days.</p>`;

    const q = ($("#r-q").value || "").toLowerCase();
    const shown = docs.filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q)).sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    $("#r-count").textContent = `Showing ${shown.length} of ${docs.length} registered documents.`;
    const el = $("#r-list"); el.innerHTML = shown.length ? "" : `<p class="empty">No matching records.</p>`;
    for (const d of shown) {
      const c = RECORDS.classify(d, t);
      const badge = c.flag === "urgent" ? `[SCHOOL ${c.days}d]` : c.flag === "overdue" ? "[OVERDUE]" : c.flag === "soon" ? `[${c.days}d]` : c.flag === "ok" ? `${c.days}d` : "";
      el.append(h("div.kv", null,
        h("span", null, h("b", null, d.title), badge ? ` ${badge}` : "", h("br"), h("span.stat-s", null, `${d.category}${d.serial ? " · #" + esc(d.serial) : ""}${d.issuer ? " · " + esc(d.issuer) : ""}${d.due ? " · due " + d.due : ""}${d.where ? " · " + esc(d.where) : ""}`)),
        h("button.btn.quiet.small", { type: "button", onclick: () => { if (window.PB) PB.deadlines.unpublish("records", d.id); S.remove("docs", d.id); paint(); toast("Removed"); } }, "Remove")
      ));
    }
  }

  $("#r-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("docs", { title: f.title.value.trim(), category: f.category.value, issuer: f.issuer.value.trim(), serial: f.serial.value.trim(), date: f.date.value, due: f.due.value, where: f.where.value.trim(), notes: f.notes.value.trim() });
    f.reset(); toast("Registered"); paint();
  });
  $("#r-q").addEventListener("input", paint);
  $("#export").onclick = () => download(`records_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
