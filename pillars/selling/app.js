/* Selling Pipeline (Sebastian, 2026-11-09): shipping-only Marketplace ledger.
   Stages: staged -> listed -> sold -> shipped -> closed. A payout is recorded to the money bus
   only when Joseph taps the button (never silently). Selling a item also publishes its ship-by
   date to the deadlines bus. All records live in this browser (kit store "selling"). */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("selling");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.line(Math.round(n * 0.5), -0.8, 0.4, 0.8, 0.4), ...G.line(Math.round(n * 0.5), -0.8, -0.4, 0.8, -0.4)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const items = () => S.list("items");

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Pipeline</h2><div id="s-sum"></div></div>
      <div class="glass span-12"><h2>Add an item</h2>
        <form class="form" id="s-form">
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Item title as it will list"></label>
          <label class="f">Batch<input name="batch" maxlength="30" placeholder="MLT-004"></label>
          <label class="f">List price $<input name="price" type="number" step="0.01" min="0" required></label>
          <label class="f">Fee % (assumption)<input name="feePct" type="number" step="0.1" min="0" value="10"></label>
          <label class="f">Platform preset<select id="s-fee-preset"><option value="">Custom</option><option value="10">Facebook Marketplace — 10%</option><option value="10">Mercari — 10%</option><option value="13.6">eBay — 13.6%</option><option value="20">Poshmark — 20% (sales $15+)</option></select></label>
          <label class="f">Est. shipping $<input name="shipEst" type="number" step="0.01" min="0" value="0"></label>
          <label class="f">Packaging $<input name="packaging" type="number" step="0.01" min="0" value="0"></label>
          <button class="btn" type="submit">Stage it</button>
        </form>
        <p class="note">Fee presets are the November 2026 published schedules (sourced in Grok's reset-day fee pass): Facebook Marketplace 10% ($0.80 min), Mercari 10%, eBay 13.6% in most categories, Poshmark 20% at $15+. The percentage stays an assumption you control. Shipping-only: there is no pickup stage, by design.</p>
      </div>
      <div class="glass span-12"><h2>Items</h2><div id="s-list"></div></div>
    </section>`;

  function paint() {
    const list = items(), sum = SELLING.summarize(list);
    $("#s-sum").innerHTML = SELLING.STAGES.map((s) => `<div class="kv"><span>${s}</span><b>${sum.counts[s] || 0}</b></div>`).join("")
      + `<div class="kv"><span>Predicted net (listed + sold)</span><b>${money(sum.predictedNet)}</b></div>`
      + `<div class="kv"><span>Realized net (shipped + closed)</span><b>${money(sum.realizedNet)}</b></div>`
      + (window.PB ? `<div class="kv"><span>Recorded on the money bus as sales</span><b>${money(Math.max(0, PB.money.total("sale")))}</b></div>` : "");
    const el = $("#s-list");
    if (!list.length) { el.innerHTML = `<p class="empty">Nothing staged yet. When Sebastian posts a Marketplace batch, its items land here to be worked through the pipeline.</p>`; return; }
    el.innerHTML = "";
    for (const it of list) {
      const pred = SELLING.net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging });
      const real = it.soldPrice != null ? SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }) : null;
      const row = h("div.item", null,
        h("h3", null, `${it.title} `, h("span.stage", null, it.stage)),
        h("div.stat-s", null, `${it.batch ? it.batch + " · " : ""}list ${money(it.price)} · predicted net ${money(pred.net)}${real ? ` · actual net ${money(real.net)}` : ""}${it.tracking ? ` · tracking ${it.tracking}` : ""}${it.busRecorded ? " · payout on the bus" : ""}`),
        h("div.row-actions", { style: "margin-top:6px" },
          ...SELLING.STAGES.filter((s) => s !== it.stage).map((s) => h("button.btn.quiet.small", { type: "button", onclick: () => advance(it, s) }, `→ ${s}`)),
          it.stage === "shipped" || it.stage === "closed" ? (it.busRecorded ? null : h("button.btn.small", { type: "button", onclick: () => recordPayout(it) }, "Record payout to bus")) : null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { if (confirm("Remove " + it.title + "?")) { S.remove("items", it.id); paint(); } } }, "Remove")));
      el.append(row);
    }
  }
  function advance(it, stage) {
    const patch = { stage };
    if (stage === "sold") {
      const sp = prompt("Sold price $", it.price); if (sp == null) return; patch.soldPrice = +sp || 0;
      const sb = prompt("Ship-by date (YYYY-MM-DD)", day()); if (sb) { patch.shipBy = sb; if (window.PB) PB.deadlines.publish({ title: "Ship: " + it.title, date: sb, source: "selling", kind: "ship", ref: it.id }); }
    }
    if (stage === "shipped") {
      const tr = prompt("Tracking number (or leave blank)"); if (tr) patch.tracking = tr;
      const fa = prompt("Actual marketplace fee $", ""); if (fa) patch.feeActual = +fa || 0;
      const sa = prompt("Actual shipping $", it.shipEst || ""); if (sa) patch.shipActual = +sa || 0;
      if (window.PB) PB.deadlines.unpublish("selling", it.id);
    }
    S.update("items", it.id, patch); paint();
  }
  function recordPayout(it) {
    const r = SELLING.net({ price: it.soldPrice != null ? it.soldPrice : it.price, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging });
    if (window.PB) PB.money.add({ kind: "sale", amount: r.net, label: it.title, source: "selling" });
    S.update("items", it.id, { busRecorded: true }); toast("Payout recorded: " + money(r.net)); paint();
  }
  const preset = $("#s-fee-preset");
  if (preset) preset.addEventListener("change", () => { if (preset.value) $("#s-form").feePct.value = preset.value; });
  $("#s-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("items", { title: f.title.value.trim(), batch: f.batch.value.trim(), price: +f.price.value || 0, feePct: +f.feePct.value || 0, shipEst: +f.shipEst.value || 0, packaging: +f.packaging.value || 0, stage: "staged" });
    f.reset(); f.feePct.value = 10; toast("Staged"); paint(); });
  $("#export").onclick = () => download(`selling_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
