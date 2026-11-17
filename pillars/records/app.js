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
    { title: "Registration and title renewal", category: "vehicle", issuer: "DMV", due: "2026-06-30", where: "Glovebox", serial: "VEHICLE-SAMPLE", notes: "Example vehicle record. Replace it with your own." },
    { title: "Violet TK Enrollment / Shot Record Packet", category: "school", issuer: "El Tejon / District", due: "2026-08-01", where: "Binder + Drive", serial: "TK-IMMUN-26", notes: "Flags urgent inside 7 days" }
  ];

  const getRecordsMath = () => (typeof window !== "undefined" && window.RECORDS) || (typeof globalThis !== "undefined" && globalThis.RECORDS);
  const getPB = () => (typeof window !== "undefined" && window.PB) || (typeof globalThis !== "undefined" && globalThis.PB) || null;

  function exportShieldSummary(todayOpt, docsOpt) {
    const opts = (todayOpt && typeof todayOpt === "object" && !Array.isArray(todayOpt))
      ? todayOpt
      : { today: todayOpt, docs: docsOpt };
    const t = opts.today || day();
    const docs = Array.isArray(opts.docs) ? opts.docs : S.list("docs");
    const recMath = getRecordsMath();
    const overdueItems = [];
    const urgentItems = [];
    const soonItems = [];
    let okCount = 0;
    let noneCount = 0;
    for (const d of docs) {
      const c = recMath.classify(d, t);
      if (c.flag === "overdue") overdueItems.push({ d, c });
      else if (c.flag === "urgent") urgentItems.push({ d, c });
      else if (c.flag === "soon") soonItems.push({ d, c });
      else if (c.flag === "ok") okCount++;
      else noneCount++;
    }
    const byDays = (a, b) => a.c.days - b.c.days;
    overdueItems.sort(byDays);
    urgentItems.sort(byDays);
    soonItems.sort(byDays);
    const fmtItem = ({ d, c }) =>
      `  - ${d.title} [${d.category || "other"}]${d.serial ? ` (#${d.serial})` : ""} — due ${d.due} (${c.days < 0 ? `${Math.abs(c.days)}d overdue` : `${c.days}d`})${d.where ? ` · loc: ${d.where}` : ""}`;
    const lines = [
      `RECORDS SHIELD SUMMARY — ${t}`,
      `Total Documents: ${docs.length}`,
      `Overdue: ${overdueItems.length} | 7-Day School Shield (Urgent): ${urgentItems.length} | 30-Day Renewals: ${soonItems.length}`,
    ];
    if (overdueItems.length) lines.push("OVERDUE:", ...overdueItems.map(fmtItem));
    if (urgentItems.length) lines.push("7-DAY URGENT SCHOOL SHIELD:", ...urgentItems.map(fmtItem));
    if (soonItems.length) lines.push("30-DAY RENEWALS:", ...soonItems.map(fmtItem));
    if (!overdueItems.length && !urgentItems.length && !soonItems.length) {
      lines.push("Status: Clear — no overdue items, 7-day school deadlines, or 30-day renewals.");
    }
    const summary = lines.join("\n");
    return {
      today: t,
      total: docs.length,
      overdue: overdueItems.length,
      urgentSchool: urgentItems.length,
      urgent: urgentItems.length,
      renewals30: soonItems.length,
      soon: soonItems.length,
      within30: urgentItems.length + soonItems.length,
      ok: okCount,
      undated: noneCount,
      counts: {
        overdue: overdueItems.length,
        urgentSchool: urgentItems.length,
        renewals30: soonItems.length,
        within30: urgentItems.length + soonItems.length,
        ok: okCount,
        none: noneCount,
      },
      items: {
        overdue: overdueItems.map(({ d, c }) => ({ ...d, flag: c.flag, days: c.days })),
        urgentSchool: urgentItems.map(({ d, c }) => ({ ...d, flag: c.flag, days: c.days })),
        renewals30: soonItems.map(({ d, c }) => ({ ...d, flag: c.flag, days: c.days })),
      },
      summary,
      text: summary,
    };
  }

  const RECORDS_APP_API = {
    data: () => ({ today: day(), docs: S.list("docs"), shield: exportShieldSummary() }),
    exportShieldSummary,
  };
  if (typeof window !== "undefined") window.RECORDS_APP = RECORDS_APP_API;
  if (typeof globalThis !== "undefined") globalThis.RECORDS_APP = RECORDS_APP_API;

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12 docket-panel"><h2>Action Docket — Urgent Shield &amp; 30-Day Renewal Radar</h2><div id="r-plate"></div><div id="r-alerts"></div></div>
      <div class="glass span-6 tpl-panel">
        <h2>2026 Templates &amp; 1-Tap Test Seed</h2>
        <div class="row-actions" id="r-tpls" style="flex-wrap:wrap;gap:6px;margin-top:8px"></div>
        <div class="row-actions" style="margin-top:10px">
          <button class="btn small" id="r-seed-demo" type="button">Seed Sample Warranty + 5-Day TK Alert</button>
          <button class="btn quiet small" id="r-export-shield" type="button">Export Shield Summary</button>
        </div>
      </div>
      <div class="glass span-6 index-panel"><h2>Vault Index — Serial &amp; Title Search</h2>
        <form class="form"><label class="f wide">Search title, serial, issuer, location<input id="r-q" type="search" placeholder="Serial, issuer, or place"></label></form>
        <div class="stat-s" id="r-count" style="margin-top:8px"></div>
      </div>
      <div class="glass span-12 slip-panel"><h2>New Entry — Register a Document or Warranty</h2>
        <form class="form" id="r-form">
          <label class="f wide">Title<input name="title" required maxlength="120"></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <label class="f">Issuer / Brand<input name="issuer" maxlength="80"></label>
          <label class="f">Serial / Policy #<input name="serial" maxlength="60" placeholder="SN-…, Policy #"></label>
          <label class="f">Document date<input name="date" type="date"></label>
          <label class="f">Renewal / due date<input name="due" type="date"></label>
          <label class="f wide">Original location<input name="where" maxlength="160" placeholder="Drive Sebastian/…, drawer 2…"></label>
          <label class="f wide">Notes<input name="notes" maxlength="200"></label>
          <label class="f wide">Retention preset (REC-GEM-04 — IRS/FTB rules)<select id="r-preset"><option value="">No preset</option></select></label>
          <button class="btn" type="submit">Register</button>
        </form>
      </div>
      <div class="glass span-12 register-panel"><h2>The Register — Documents &amp; Serials, by Drawer</h2><div id="r-list"></div></div>
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

  $("#r-export-shield").onclick = () => {
    const res = exportShieldSummary();
    download(`records_shield_${res.today}.json`, res);
    toast(`Shield: ${res.overdue} overdue · ${res.urgentSchool} 7d school · ${res.renewals30} 30d renewals`);
  };

  function paint() {
    const t = day(), docs = S.list("docs"), recMath = getRecordsMath(), pb = getPB();
    const alerts = [];
    const tally = { overdue: 0, urgent: 0, soon: 0 };
    for (const d of docs) {
      if (pb && pb.deadlines && d.due) pb.deadlines.publish({ title: (d.category === "school" ? "School: " : "Renewal: ") + d.title, date: d.due, source: "records", kind: d.category === "school" ? "school" : "renewal", ref: d.id });
      const c = recMath.classify(d, t);
      if (c.flag === "overdue" || c.flag === "urgent" || c.flag === "soon") { alerts.push({ d, c }); tally[c.flag]++; }
    }

    /* The register plate: the office's own counts, read straight off the classifications above. */
    const cell = (n, k, cls) => `<div class="plate-cell ${cls || ""}"><span class="plate-v">${n}</span><span class="plate-k">${k}</span></div>`;
    $("#r-plate").innerHTML =
      cell(docs.length, "On file") +
      cell(tally.overdue, "Overdue", tally.overdue ? "is-bad" : "") +
      cell(tally.urgent, "7-day school shield", tally.urgent ? "is-bad" : "") +
      cell(tally.soon, "Renewals ≤ 30 days", tally.soon ? "is-warn" : "");

    const stampFor = (c) => c.flag === "overdue" ? "Overdue" : c.flag === "urgent" ? "School shield" : "Renewal";
    $("#r-alerts").innerHTML = alerts.length
      ? alerts.sort((a, b) => a.c.days - b.c.days).map(({ d, c }) => `<div class="docket-row f-${c.flag}"><span class="stamp ${c.flag === "soon" ? "warn" : "bad"}">${stampFor(c)} · ${c.days}d</span><span class="docket-main"><b>${esc(d.title)}</b>${d.serial ? ` · <code>${esc(d.serial)}</code>` : ""}</span><b class="docket-due">due ${d.due}</b></div>`).join("")
      : `<p class="empty">No school packets inside 7 days or renewals inside 30 days.</p>`;

    const q = ($("#r-q").value || "").toLowerCase();
    const byDue = (a, b) => (a.due || "9999").localeCompare(b.due || "9999") || String(a.title).localeCompare(String(b.title));
    const shown = docs.filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q)).sort(byDue);
    $("#r-count").textContent = `Showing ${shown.length} of ${docs.length} registered documents.`;

    /* Folio numbers: an entry's fixed place in the bound register — its position in the
       full register sorted by due date, assigned before any search filter is applied. */
    const folio = new Map([...docs].sort(byDue).map((d, i) => [d.id, i + 1]));
    const pad3 = (n) => String(n).padStart(3, "0");

    const el = $("#r-list"); el.innerHTML = shown.length ? "" : `<p class="empty">No matching records.</p>`;
    if (shown.length) el.append(h("div.led-head", null,
      h("span", null, "Folio · Filed"),
      h("span", null, "Document"),
      h("span", null, "Original lives"),
      h("span.led-head-due", null, "Due · Status"),
      h("span", null, "")
    ));
    const extraCats = [...new Set(shown.map((d) => d.category || "other"))].filter((c) => !CATS.includes(c));
    for (const cat of [...CATS, ...extraCats]) {
      const group = shown.filter((d) => (d.category || "other") === cat);
      if (!group.length) continue;
      el.append(h("div.drawer-h", null,
        h("span.drawer-tab", null, cat),
        h("span.drawer-count", null, `${group.length} on file`)
      ));
      for (const d of group) {
        const c = recMath.classify(d, t);
        const stamp = c.flag === "overdue" ? h("span.stamp.bad", null, "Overdue")
          : c.flag === "urgent" ? h("span.stamp.bad", null, "School shield")
          : c.flag === "soon" ? h("span.stamp.warn", null, "Renewal")
          : c.flag === "none" ? h("span.stamp.dim", null, "No date filed") : "";
        const daysLine = c.flag === "none" ? "no due date"
          : c.days < 0 ? `${Math.abs(c.days)}d overdue`
          : c.days === 0 ? "due today" : `in ${c.days}d`;
        const sub = [d.issuer || "", d.serial ? "#" + d.serial : ""].filter(Boolean).join(" · ");
        el.append(h("div.led-row.f-" + c.flag, null,
          h("div.led-folio", null,
            h("span.led-no", null, "№ " + pad3(folio.get(d.id) || 0)),
            d.date ? h("span.led-date", null, d.date) : ""
          ),
          h("div.led-main", null,
            h("div.led-title", null, h("b", null, d.title), stamp),
            sub ? h("div.led-sub", null, sub) : "",
            /* REC-GEM-04 (2026-11-17): retention verdict per doc — keep-until label,
               shred eligibility, and the rule's source link. */
            (() => { const ss = recMath.shredStatus ? recMath.shredStatus(d, t) : null; if (!ss) return "";
              return h("div.led-sub", null, `${ss.canShred ? "Safe to shred — " : ""}${ss.keepUntilLabel}`,
                ss.rule ? h("a", { href: ss.rule.url, target: "_blank", rel: "noopener", class: "stat-s" }, ` ${ss.rule.source} ↗`) : null); })()
          ),
          h("div.led-meta", null,
            h("div.led-loc", null, d.where || "—"),
            h("div.led-due", null,
              h("span.led-due-date", null, d.due || "—"),
              h("span.led-days", null, daysLine)
            ),
            h("button.btn.quiet.small", { type: "button", onclick: () => { if (pb && pb.deadlines) pb.deadlines.unpublish("records", d.id); S.remove("docs", d.id); paint(); toast("Removed"); } }, "Remove")
          )
        ));
      }
    }
  }

  /* REC-GEM-04 (2026-11-17): retention preset selector — choosing a rule pre-fills the
     register form with the rule's document class; permanent rules stamp the notes so
     the never-shred class is visible at filing time. */
  const presetSel = $("#r-preset");
  if (presetSel && window.RECORDS_RETENTION) {
    for (const r of window.RECORDS_RETENTION) {
      const o = document.createElement("option");
      o.value = String(r.n); o.textContent = `${r.document} — keep ${r.keep}`;
      presetSel.append(o);
    }
    presetSel.addEventListener("change", () => {
      const r = (window.RECORDS_RETENTION || []).find((x) => String(x.n) === presetSel.value);
      const f = $("#r-form"); if (!r || !f) return;
      f.title.value = r.document;
      f.notes.value = r.keep_years === "permanent" ? "Retention: PERMANENT (never shred) — " + r.source : `Retention: keep ${r.keep} — ${r.source}`;
      toast(`Preset: keep ${r.keep}`);
    });
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
