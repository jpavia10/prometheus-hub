/* Selling Pipeline v2: shipping-only Marketplace ledger + dynamic November 2026 fee schedule loader (data/fees-nov2026.json) + Batch Net Summary + Money Bus payouts. */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("selling");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.line(Math.round(n * 0.5), -0.8, 0.4, 0.8, 0.4), ...G.line(Math.round(n * 0.5), -0.8, -0.4, 0.8, -0.4)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const items = () => S.list("items");

  const BASE_PRESETS = [
    { label: "Facebook Marketplace (shipped) — 10% ($0.80 min)", pct: 10, fixed: 0 },
    { label: "Mercari — 10%", pct: 10, fixed: 0 },
    { label: "eBay Most Categories — 13.6% + $0.40", pct: 13.6, fixed: 0.4 },
    { label: "Poshmark ($15+) — 20%", pct: 20, fixed: 0 },
  ];
  let presets = [...BASE_PRESETS];

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-6"><h2>Pipeline</h2><div id="s-sum"></div></div>
      <div class="glass span-6"><h2>Batch Net Summary</h2><div id="s-batches"></div></div>
      <div class="glass span-12"><h2>Stage an item</h2>
        <form class="form" id="s-form">
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Item title as it will list"></label>
          <label class="f">Batch<input name="batch" maxlength="30" placeholder="MLT-004"></label>
          <label class="f">List price $<input name="price" type="number" step="0.01" min="0" required></label>
          <label class="f">Fee %<input name="feePct" type="number" step="0.05" min="0" value="10"></label>
          <label class="f">Per-order fee $<input name="feeFixed" type="number" step="0.01" min="0" value="0"></label>
          <label class="f">Platform preset (Nov 2026)<select id="s-fee-preset"></select></label>
          <label class="f">Est. shipping $<input name="shipEst" type="number" step="0.01" min="0" value="0"></label>
          <label class="f">Packaging $<input name="packaging" type="number" step="0.01" min="0" value="0"></label>
          <div class="wide note" id="s-preview"></div>
          <button class="btn" type="submit">Stage it</button>
        </form>
        <p class="note" id="s-fee-note">Fee presets load live from <code>data/fees-nov2026.json</code>. Shipping-only: no local pickup stage by design.</p>
      </div>
      <div class="glass span-12"><h2>Items</h2><div id="s-list"></div></div>
    </section>`;

  function fillPresets() {
    const sel = $("#s-fee-preset");
    sel.innerHTML = `<option value="">Custom fee</option>` + presets.map((p, i) => `<option value="${i}">${esc(p.label)}</option>`).join("");
  }

  function updatePreview() {
    const f = $("#s-form");
    const price = +f.price.value || 0;
    const feePct = +f.feePct.value || 0;
    const feeFixed = +f.feeFixed.value || 0;
    const ship = +f.shipEst.value || 0;
    const pack = +f.packaging.value || 0;
    const estFee = Math.round(((price + ship) * (feePct / 100) + feeFixed) * 100) / 100;
    const net = Math.round((price - estFee - ship - pack) * 100) / 100;
    $("#s-preview").innerHTML = price > 0 ? `Projected fee: <b>${money(estFee)}</b> · Projected net payout: <b class="${net >= 0 ? "up" : "down"}">${money(net)}</b>` : "";
  }

  function paint() {
    const list = items(), sum = SELLING.summarize(list);
    $("#s-sum").innerHTML = SELLING.STAGES.map((s) => `<div class="kv"><span>${s}</span><b>${sum.counts[s] || 0}</b></div>`).join("")
      + `<div class="kv"><span>Predicted net (listed + sold)</span><b>${money(sum.predictedNet)}</b></div>`
      + `<div class="kv"><span>Realized net (shipped + closed)</span><b>${money(sum.realizedNet)}</b></div>`
      + (window.PB ? `<div class="kv"><span>Money bus sales total</span><b>${money(Math.max(0, PB.money.total("sale")))}</b></div>` : "");

    const byBatch = {};
    for (const it of list) {
      const k = (it.batch || "Unbatched").trim() || "Unbatched";
      if (!byBatch[k]) byBatch[k] = { count: 0, gross: 0, net: 0 };
      const r = it.soldPrice != null
        ? SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging })
        : SELLING.net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging });
      byBatch[k].count++;
      byBatch[k].gross += +(it.soldPrice != null ? it.soldPrice : it.price) || 0;
      byBatch[k].net += r.net - (+it.feeFixed || 0);
    }
    const batchRows = Object.entries(byBatch);
    $("#s-batches").innerHTML = batchRows.length
      ? batchRows.map(([k, v]) => `<div class="kv"><span><b>${esc(k)}</b> (${v.count} items · gross ${money(v.gross)})</span><b>${money(v.net)} net</b></div>`).join("")
      : `<p class="empty">Group items with a Batch code (e.g. MLT-004) to roll up batch P&amp;L.</p>`;

    const el = $("#s-list");
    if (!list.length) { el.innerHTML = `<p class="empty">Nothing staged yet.</p>`; return; }
    el.innerHTML = "";
    for (const it of list) {
      const pred = SELLING.net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging });
      const predNet = pred.net - (+it.feeFixed || 0);
      const real = it.soldPrice != null ? SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }) : null;
      const row = h("div.item", null,
        h("h3", null, `${it.title} `, h("span.stage", null, it.stage)),
        h("div.stat-s", null, `${it.batch ? it.batch + " · " : ""}list ${money(it.price)} · est net ${money(predNet)}${real ? ` · actual net ${money(real.net)}` : ""}${it.tracking ? ` · tracking ${it.tracking}` : ""}${it.busRecorded ? " · payout on bus" : ""}`),
        h("div.row-actions", { style: "margin-top:6px" },
          ...SELLING.STAGES.filter((s) => s !== it.stage).map((s) => h("button.btn.quiet.small", { type: "button", onclick: () => advance(it, s) }, `→ ${s}`)),
          it.stage === "shipped" || it.stage === "closed" ? (it.busRecorded ? null : h("button.btn.small", { type: "button", onclick: () => recordPayout(it) }, "Record payout to bus")) : null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { if (confirm("Remove " + it.title + "?")) { S.remove("items", it.id); paint(); } } }, "Remove")
        )
      );
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

  $("#s-fee-preset").addEventListener("change", (e) => {
    const p = presets[+e.target.value];
    if (!p) return;
    $("#s-form").feePct.value = p.pct;
    $("#s-form").feeFixed.value = p.fixed;
    updatePreview();
  });
  ["price", "feePct", "feeFixed", "shipEst", "packaging"].forEach((k) => $("#s-form")[k].addEventListener("input", updatePreview));
  $("#s-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("items", { title: f.title.value.trim(), batch: f.batch.value.trim(), price: +f.price.value || 0, feePct: +f.feePct.value || 0, feeFixed: +f.feeFixed.value || 0, shipEst: +f.shipEst.value || 0, packaging: +f.packaging.value || 0, stage: "staged" });
    f.reset(); f.feePct.value = 10; f.feeFixed.value = 0; updatePreview(); toast("Staged"); paint();
  });

  $("#export").onclick = () => download(`selling_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };

  fillPresets();
  fetch("./data/fees-nov2026.json").then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j || !j.fees) return;
    const loaded = [];
    const eb = j.fees.ebay;
    if (eb && Array.isArray(eb.categories)) {
      const ord = (eb.per_order_fee && eb.per_order_fee.order_total_gt_10) || 0.4;
      for (const c of eb.categories.slice(0, 6)) {
        const m = String(c.rate || "").match(/([\d.]+)%/);
        if (m) loaded.push({ label: `eBay · ${c.cat.slice(0, 32)} (${m[1]}% + $${ord})`, pct: +m[1], fixed: ord });
      }
    }
    presets = [...loaded, ...BASE_PRESETS.filter((b) => !b.label.startsWith("eBay Most"))];
    fillPresets();
    $("#s-fee-note").textContent = `Loaded live fee schedule pack (${j.pack || "Nov 2026"}, checked ${j.asOf || "2026-11-10"}). Percentage remains editable per item.`;
  }).catch(() => {});

  paint();
})();
