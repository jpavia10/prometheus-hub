/* Records v2: document registry + renewal radar + 7-day School/TK Shield + 1-tap 2026 Deadline Templates (IRS, FTB, Kern Property Tax, DMV, TK School). */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("records");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.line(Math.round(n * 0.34), -0.5, -0.7, -0.5, 0.7), ...G.line(Math.round(n * 0.33), 0, -0.7, 0, 0.7), ...G.line(Math.round(n * 0.33), 0.5, -0.7, 0.5, 0.7)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CATS = ["school", "warranty", "vehicle", "home", "financial", "medical", "identity", "other"];

  const TEMPLATES_2026 = [
    { title: "IRS Federal Return / Extension (Form 1040 / 4868)", category: "financial", issuer: "IRS", due: "2026-04-15", where: "Drive / Taxes 2026", notes: "7-day tax shield check" },
    { title: "CA Franchise Tax Board (Form 540)", category: "financial", issuer: "CA FTB", due: "2026-04-15", where: "Drive / Taxes 2026", notes: "State parity deadline" },
    { title: "Kern County Property Tax — 1st Installment", category: "home", issuer: "Kern County Treasurer", due: "2026-12-10", where: "Drive / House", notes: "Delinquent after 5 PM" },
    { title: "TX -> CA DMV Registration & Title Renewal", category: "vehicle", issuer: "CA DMV", due: "2026-06-30", where: "Glovebox + Drive", notes: "2025 Sorento Hybrid smog/VIN verify" },
    { title: "Violet TK Enrollment / Shot Record Packet", category: "school", issuer: "El Tejon / District", due: "2026-08-01", where: "Binder + Drive", notes: "Flags urgent inside 7 days" },
  ];

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12">
        <h2>2026 Critical Templates (1-Tap Add)</h2>
        <p class="sub">Seeds real IRS, CA FTB, Kern County, TX&rarr;CA DMV, or TK school packets directly to your deadline radar (no fake amounts or IDs).</p>
        <div class="row-actions" id="r-tpls" style="flex-wrap:wrap;gap:8px;margin-top:8px"></div>
      </div>
      <div class="glass span-12"><h2>Register a document</h2>
        <form class="form" id="r-form">
          <label class="f wide">Title<input name="title" required maxlength="120"></label>
          <label class="f">Category<select name="category">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
          <label class="f">Issuer / from<input name="issuer" maxlength="80"></label>
          <label class="f">Document date<input name="date" type="date"></label>
          <label class="f">Renewal / due date<input name="due" type="date"></label>
          <label class="f wide">Where the original lives<input name="where" maxlength="160" placeholder="Drive Sebastian/…, file cabinet drawer 2, SSD /docs…"></label>
          <label class="f wide">Notes<input name="notes" maxlength="200"></label>
          <button class="btn" type="submit">Register</button>
        </form>
      </div>
      <div class="glass span-12"><h2>The registry</h2>
        <form class="form"><label class="f wide">Search title, issuer, category, location<input id="r-q" type="search"></label></form>
        <div id="r-list"></div>
      </div>
    </section>`;

  const tplBox = $("#r-tpls");
  TEMPLATES_2026.forEach((tpl) => {
    tplBox.append(h("button.btn.quiet.small", {
      type: "button",
      onclick: () => {
        if (S.list("docs").some((d) => d.title === tpl.title && d.due === tpl.due)) { toast("Already in registry"); return; }
        S.add("docs", { ...tpl, date: day() });
        toast("Added: " + tpl.title);
        paint();
      },
    }, "+ " + tpl.title.split("(")[0].trim()));
  });

  function paint() {
    const docs = S.list("docs");
    for (const d of docs) {
      if (window.PB && d.due) PB.deadlines.publish({ title: (d.category === "school" ? "School: " : "Renewal: ") + d.title, date: d.due, source: "records", kind: d.category === "school" ? "school" : "renewal", ref: d.id });
    }
    const q = ($("#r-q").value || "").toLowerCase();
    const shown = docs.filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q)).sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"));
    const el = $("#r-list"); el.innerHTML = shown.length ? "" : `<p class="empty">Nothing registered yet.</p>`;
    for (const d of shown) {
      const c = RECORDS.classify(d, day());
      const flag = c.flag === "urgent" ? `<span class="pill urgent">school · ${c.days}d</span>` : c.flag === "overdue" ? `<span class="pill over">overdue</span>` : c.flag === "soon" ? `<span class="pill soon">${c.days}d</span>` : c.flag === "ok" ? `<span class="pill">${c.days}d</span>` : "";
      el.append(h("div.kv", null,
        h("span", null, h("b", null, d.title), " ", h("span", { innerHTML: flag }), h("br"), h("span.stat-s", null, `${d.category}${d.issuer ? " · " + esc(d.issuer) : ""}${d.due ? " · due " + d.due : ""}${d.where ? " · at " + esc(d.where) : ""}${d.notes ? " · " + esc(d.notes) : ""}`)),
        h("button.btn.quiet.small", {
          type: "button",
          onclick: () => {
            const prev = S.list("docs");
            if (window.PB) PB.deadlines.unpublish("records", d.id);
            S.remove("docs", d.id); paint();
            toast("Removed", 6000, () => { S.set("docs", prev); paint(); });
          },
        }, "Remove")
      ));
    }
  }

  $("#r-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("docs", { title: f.title.value.trim(), category: f.category.value, issuer: f.issuer.value.trim(), date: f.date.value, due: f.due.value, where: f.where.value.trim(), notes: f.notes.value.trim() });
    f.reset(); toast("Registered"); paint();
  });
  $("#r-q").addEventListener("input", paint);
  $("#export").onclick = () => download(`records_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
