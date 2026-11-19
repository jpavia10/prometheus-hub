/* Selling Pipeline v3: shipping-only Marketplace ledger + Nov 2026 fee schedule + 1-tap FB Marketplace Shipping-Only copy generator + Predicted vs Actual ledger + 7d Stale Relist Radar + Shipping Supplies low-stock tracker. */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("selling");
  const app = $("#app");
  field({ count: 900, at: [0.76, 0.32], scale: 0.24, glyph: (n) => [...G.line(Math.round(n * 0.5), -0.8, 0.4, 0.8, 0.4), ...G.line(Math.round(n * 0.5), -0.8, -0.4, 0.8, -0.4)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const items = () => S.list("items");

  /* Real draft pipeline seed (Sebastian, 2026-11-14): Joseph's 2026-10-14 Marketplace draft
     batch (MLT-001..004) as staged ledger lines at the FLOOR of each draft ask band, with the
     blocker in the title. Seeds once, only into an empty pipeline; the flag keeps a later
     delete-everything from resurrecting drafts. Prices are draft bands — see the goal panel. */
  const PIPE = window.SELLING_PIPELINE || null;
  if (PIPE && !S.get("pipelineSeedV1")) {
    if (!items().length) {
      for (const s of PIPE.skus) S.add("items", { date: "2026-10-14", title: s.seedTitle, batch: s.sku, price: s.low, feePct: 10, feeFixed: 0, shipEst: 0, packaging: 0, stage: "staged" });
    }
    S.set("pipelineSeedV1", 1);
  }

  /* SEL-GEM-04 (2026-11-17): presets now derive from SELLING.FEES (calc.js) — the six
     verified Nov 2026 schedules with their piecewise rules and source URLs. Picking a
     preset fills the editable fee fields with the headline rate AND arms the rule
     (min fee / under-$15 flat / $7,500 cap) for the preview and the staged item. */
  const BASE_PRESETS = Object.entries(SELLING.FEES).map(([key, r]) => ({
    rule: key, pct: r.pct, fixed: r.fixed || 0, url: r.url,
    label: `${r.label} — ${key === "poshmark" ? "$2.95 under $15, else 20%" : key === "ebay" ? "13.6% + $0.40 ($0.30 ≤ $10), 2.35% over $7,500" : key === "facebook" ? "10% ($0.80 min)" : key === "offerup" ? "12.9% ($1.99 min)" : key === "swappa" ? "6.49% + $0.49" : "10%"}`,
  }));
  let presets = [...BASE_PRESETS];
  const daysBetween = (d1, d2) => Math.round((new Date(d2 + "T12:00:00") - new Date(d1 + "T12:00:00")) / 864e5);

  app.innerHTML = `
    <section class="grid">
      <div class="glass lit span-12"><h2>The $20,000 Payoff — Draft Pipeline</h2><div id="s-goal"></div></div>
      <div class="glass span-4"><h2>Pipeline Totals</h2><div id="s-sum"></div></div>
      <div class="glass span-4"><h2>Predicted vs Actual Drift</h2><div id="s-drift"></div></div>
      <div class="glass lit span-4"><h2>7-Day Stale Relist Radar</h2><div id="s-stale"></div></div>

      <div class="glass span-6"><h2>Stage an Item</h2>
        <form class="form" id="s-form">
          <label class="f wide">Title<input name="title" required maxlength="120" placeholder="Sony A6000 Kit, Garmin Watch…"></label>
          <label class="f">Batch<input name="batch" maxlength="30" placeholder="MLT-004"></label>
          <label class="f">List price $<input name="price" type="number" step="0.01" min="0" required></label>
          <label class="f">Fee %<input name="feePct" type="number" step="0.05" min="0" value="10"></label>
          <label class="f">Per-order fee $<input name="feeFixed" type="number" step="0.01" min="0" value="0"></label>
          <label class="f wide">Platform preset (Nov 2026)<select id="s-fee-preset"></select></label>
          <label class="f">Est. shipping $<input name="shipEst" type="number" step="0.01" min="0" value="0"></label>
          <label class="f">Packaging $<input name="packaging" type="number" step="0.01" min="0" value="0"></label>
          <div class="wide note" id="s-preview"></div>
          <button class="btn" type="submit">Stage it</button>
        </form>
        <p class="note" id="s-fee-note">Shipping-only pipeline: zero local-pickup risk.</p>
      </div>

      <div class="glass span-6"><h2>FB Marketplace "Shipping-Only" Copy Generator</h2>
        <p class="sub">Click "FB Copy" on any item below or preview here to copy clean buyer-ready text.</p>
        <textarea id="s-copy-box" rows="6" readonly style="width:100%;margin-bottom:8px"></textarea>
        <div class="row-actions"><button class="btn small" id="s-copy-btn" type="button">Copy Listing Text</button></div>
      </div>

      <div class="glass span-6"><h2>Batch Net Summary</h2><div id="s-batches"></div></div>
      <div class="glass span-6"><h2>Shipping Supplies Low-Stock Watch</h2>
        <form class="form" id="s-sup-form">
          <label class="f">Supply item<input name="name" required maxlength="50" placeholder="Bubble mailers #2, 12x9 boxes"></label>
          <label class="f">On hand<input name="qty" type="number" min="0" value="12" required></label>
          <label class="f">Reorder min<input name="min" type="number" min="1" value="5" required></label>
          <button class="btn small" type="submit">Save supply</button>
        </form>
        <div id="s-sup-list" style="margin-top:8px"></div>
      </div>

      <div class="glass span-12"><h2>Inventory Pipeline</h2><div id="s-list"></div></div>
    </section>`;

  function buildFbCopy(title, price) {
    return `${title} — $${Number(price || 0).toFixed(2)}\n\n• Clean, tested & ready to ship in protective packaging\n• SHIPPING ONLY (Tracked USPS/UPS within 1 business day — no local meetup)\n• Checkout directly via Buy Now / Platform Pay for buyer protection\n• Smoke-free mountain home · bundle offers welcome`;
  }
  $("#s-copy-box").value = buildFbCopy("Featured Item", 75);
  $("#s-copy-btn").onclick = async () => {
    try { await navigator.clipboard.writeText($("#s-copy-box").value); toast("Copied shipping-only listing copy!"); }
    catch (_) { $("#s-copy-box").select(); document.execCommand("copy"); toast("Copied text!"); }
  };

  function fillPresets() {
    $("#s-fee-preset").innerHTML = `<option value="">Custom fee</option>` + presets.map((p, i) => `<option value="${i}">${esc(p.label)}</option>`).join("");
  }
  function updatePreview() {
    const f = $("#s-form"), price = +f.price.value || 0, feePct = +f.feePct.value || 0, feeFixed = +f.feeFixed.value || 0, ship = +f.shipEst.value || 0, pack = +f.packaging.value || 0;
    const ruleKey = f.dataset.rule || "";
    const estFee = ruleKey && SELLING.FEES[ruleKey] ? SELLING.feeFor(SELLING.FEES[ruleKey], price) : Math.round(((price + ship) * (feePct / 100) + feeFixed) * 100) / 100;
    const net = Math.round((price - estFee - ship - pack) * 100) / 100;
    if (!(price > 0)) { $("#s-preview").innerHTML = ""; return; }
    const rows = Object.entries(SELLING.FEES).map(([k, r]) => {
      const fee = SELLING.feeFor(r, price), n = Math.round((price - fee - ship - pack) * 100) / 100;
      return `<tr${k === ruleKey ? " class=\"sel\"" : ""}><td><a href="${r.url}" target="_blank" rel="noopener">${esc(r.label)}</a></td><td>${money(fee)}</td><td class="${n >= 0 ? "up" : "down"}">${money(n)}</td></tr>`;
    }).join("");
    $("#s-preview").innerHTML = `Projected fee: <b>${money(estFee)}</b> · Projected net: <b class="${net >= 0 ? "up" : "down"}">${money(net)}</b>
      <table class="fee-cmp"><thead><tr><th>Platform (Nov 2026 schedule)</th><th>Fee</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function paint() {
    const t = day(), list = items(), sum = SELLING.summarize(list);
    // $20K payoff goal panel: draft truth from pipeline-data.js, independent of ledger stages.
    if (PIPE) {
      const g = PIPE.goal;
      const pct = (v) => Math.round((v / g.monthlyPayment) * 100);
      const gp = (v) => (v / g.target) * 100;            // position on the $20,000 gauge
      const gz = (v) => Math.min(100, (v / 1000) * 100); // position on the magnified first-$1,000 strip
      $("#s-goal").innerHTML =
        `<div class="goal-head">`
        + `<div class="goal-fig hero"><span class="stat-k">Still to go after this batch</span><b>${money(g.target - g.draftHigh, 0)}–${money(g.target - g.draftLow, 0)}</b></div>`
        + `<div class="goal-fig"><span class="stat-k">Payoff target</span><b>${money(g.target, 0)}</b></div>`
        + `<div class="goal-fig"><span class="stat-k">Draft pipeline · batch 2026-10-14</span><b>${money(g.draftLow, 0)}–${money(g.draftHigh, 0)}+</b></div>`
        + `</div>`
        + `<div class="gauge"><div class="gauge-track">`
        + `<div class="gauge-band" style="left:${gp(g.draftLow)}%;width:${Math.max(0.6, gp(g.draftHigh) - gp(g.draftLow))}%"></div>`
        + `<div class="gauge-mark start" style="left:${gp(g.monthlyPayment)}%" data-lbl="one payment · ${money(g.monthlyPayment, 0)}"></div>`
        + `</div><div class="gauge-scale"><span>$0</span><span>${money(g.target * 0.25, 0)}</span><span>${money(g.target * 0.5, 0)}</span><span>${money(g.target * 0.75, 0)}</span><span>${money(g.target, 0)}</span></div></div>`
        + `<div class="gauge-zoom"><span class="stat-k">The first $1,000 — magnified ×20</span>`
        + `<div class="gauge"><div class="gauge-track">`
        + `<div class="gauge-band" style="left:${gz(g.draftLow)}%;width:${gz(g.draftHigh) - gz(g.draftLow)}%"></div>`
        + `<div class="gauge-mark end" style="left:${gz(g.monthlyPayment)}%" data-lbl="one payment"></div>`
        + `</div><div class="gauge-scale"><span>$0</span><span>$500</span><span>$1,000</span></div></div></div>`
        + `<p class="gauge-note">Drawn at true linear scale: the whole first batch is the sliver at the far left of the top gauge. No fake fullness — the board's job is watching the sliver grow.</p>`
        + `<div class="pace"><div class="pace-lbl">Pace — one ${esc(g.paymentLabel)} is <b>${money(g.monthlyPayment)}</b>; this batch covers <b>≈ ${pct(g.draftLow)}–${pct(g.draftHigh)}% of one payment</b></div>`
        + `<div class="pace-track"><div class="pace-band" style="left:${pct(g.draftLow)}%;width:${pct(g.draftHigh) - pct(g.draftLow)}%"></div></div></div>`
        + `<div class="mlt-grid">`
        + PIPE.skus.map((s) => `<div class="mlt-card${s.state === "parked" ? " parked" : ""}"><div class="mlt-top"><span class="mlt-sku">${esc(s.sku)}</span><span class="mlt-state">${esc(s.state.toUpperCase())}</span></div><div class="mlt-title">${esc(s.title)}</div><div class="mlt-band">${esc(s.band)}</div><p class="mlt-blocker"><b>${s.state === "parked" ? "Why parked" : "Blocker"}</b>${esc(s.blocker)}</p></div>`).join("")
        + `</div>`
        + `<p class="note">${esc(g.source)} Channel: ${esc(g.channel)}. Nothing here is listed or published — drafts finalize only after photos and facts.</p>`;
    } else {
      $("#s-goal").innerHTML = `<p class="empty">No draft pipeline loaded.</p>`;
    }
    $("#s-sum").innerHTML = SELLING.STAGES.map((s) => `<div class="kv"><span>${s}</span><b>${sum.counts[s] || 0}</b></div>`).join("")
      + `<div class="kv"><span>Predicted net (listed + sold)</span><b>${money(sum.predictedNet)}</b></div>`
      + `<div class="kv"><span>Realized net (shipped + closed)</span><b>${money(sum.realizedNet)}</b></div>`
      + (window.PB ? `<div class="kv"><span>Money bus sales total</span><b>${money(Math.max(0, PB.money.total("sale")))}</b></div>` : "");

    // Predicted vs Actual accuracy ledger
    const completed = list.filter((it) => it.soldPrice != null);
    let predSum = 0, realSum = 0;
    const dRows = completed.slice(0, 6).map((it) => {
      const p = it.feeRule ? SELLING.net({ price: it.price, feeRule: it.feeRule, shipping: it.shipEst, packaging: it.packaging }).net : SELLING.net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging }).net - (+it.feeFixed || 0);
      const r = SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }).net;
      predSum += p; realSum += r;
      const diff = r - p;
      return `<div class="kv"><span>${esc(it.title)}</span><b>${money(r)} <small class="${diff >= 0 ? "up" : "down"}">(${diff >= 0 ? "+" : ""}${money(diff)})</small></b></div>`;
    });
    $("#s-drift").innerHTML = completed.length
      ? dRows.join("") + `<div class="kv"><span>Net estimation accuracy (${completed.length} closed)</span><b class="${realSum - predSum >= 0 ? "up" : "down"}">${realSum - predSum >= 0 ? "+" : ""}${money(realSum - predSum)}</b></div>`
      : `<p class="empty">Mark an item sold/shipped to audit estimated vs actual net proceeds.</p>`;

    // 7-day Stale Relist Radar
    const stale = list.filter((it) => it.stage === "listed" && daysBetween(it.listedDate || it.date || (it.at || t).slice(0, 10), t) >= 7);
    const sEl = $("#s-stale"); sEl.innerHTML = "";
    if (!stale.length) sEl.innerHTML = `<p class="empty">Zero listed items &ge;7 days old.</p>`;
    else stale.forEach((it) => {
      const age = daysBetween(it.listedDate || it.date || (it.at || t).slice(0, 10), t);
      sEl.append(h("div.kv", null, h("span", null, h("b.warn", null, `${age}d`), " · ", it.title), h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("items", it.id, { listedDate: t }); toast("Relist timer reset"); paint(); } }, "Relisted")));
    });

    // Supplies watch
    const sups = S.list("supplies"), supEl = $("#s-sup-list"); supEl.innerHTML = "";
    if (!sups.length) supEl.innerHTML = `<p class="empty">No shipping supplies tracked yet.</p>`;
    else sups.forEach((sp) => {
      const low = (+sp.qty || 0) <= (+sp.min || 5);
      supEl.append(h("div.kv", null,
        h("span", null, h("b", { className: low ? "down" : "" }, sp.name), low ? " [LOW STOCK]" : ""),
        h("span.row-actions", null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("supplies", sp.id, { qty: Math.max(0, (+sp.qty || 0) - 1) }); paint(); } }, "-1"),
          h("b", null, String(sp.qty)),
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("supplies", sp.id, { qty: (+sp.qty || 0) + 1 }); paint(); } }, "+1"),
          h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("supplies", sp.id); paint(); } }, "×")
        )
      ));
    });

    // Batch summary
    const byBatch = {};
    for (const it of list) {
      const k = (it.batch || "Unbatched").trim() || "Unbatched";
      if (!byBatch[k]) byBatch[k] = { count: 0, gross: 0, net: 0 };
      const r = it.soldPrice != null ? SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }) : SELLING.net({ price: it.price, feePct: it.feePct, feeRule: it.feeRule, shipping: it.shipEst, packaging: it.packaging });
      byBatch[k].count++; byBatch[k].gross += +(it.soldPrice != null ? it.soldPrice : it.price) || 0; byBatch[k].net += r.net - (+it.feeFixed || 0);
    }
    const batchRows = Object.entries(byBatch).map(([k, v]) => `<div class="kv"><span><b>${esc(k)}</b> (${v.count} items · ${money(v.gross)})</span><b>${money(v.net)} net</b></div>`);
    const bTotals = Object.values(byBatch).reduce((a, v) => ({ count: a.count + v.count, gross: a.gross + v.gross, net: a.net + v.net }), { count: 0, gross: 0, net: 0 });
    $("#s-batches").innerHTML = batchRows.length
      ? batchRows.join("") + `<div class="ledger-total"><span>All batches · ${bTotals.count} items · ${money(bTotals.gross)}</span><span class="ledger-net">${money(bTotals.net)} net</span></div>`
      : `<p class="empty">No batches yet.</p>`;

    const el = $("#s-list"); if (!list.length) { el.innerHTML = `<p class="empty">Nothing staged yet.</p>`; return; }
    el.innerHTML = "";
    for (const it of list) {
      const pred = it.feeRule ? SELLING.net({ price: it.price, feeRule: it.feeRule, shipping: it.shipEst, packaging: it.packaging }).net : SELLING.net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging }).net - (+it.feeFixed || 0);
      const real = it.soldPrice != null ? SELLING.net({ price: it.soldPrice, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }) : null;
      el.append(h("div.item", null,
        h("h3", null, h("span.t", null, it.title), h("span.stage st-" + it.stage, null, it.stage)),
        h("div.stat-s", null, `${it.batch ? it.batch + " · " : ""}list ${money(it.price)} · est net ${money(pred)}${real ? ` · actual ${money(real.net)}` : ""}${it.tracking ? ` · ${it.tracking}` : ""}${it.busRecorded ? " · on bus" : ""}`),
        h("div.row-actions", { style: "margin-top:6px" },
          h("button.btn.quiet.small", { type: "button", onclick: () => { $("#s-copy-box").value = buildFbCopy(it.title, it.price); toast("Generated FB copy above"); } }, "FB Copy"),
          ...SELLING.STAGES.filter((s) => s !== it.stage).map((s) => h("button.btn.quiet.small", { type: "button", onclick: () => advance(it, s) }, `→ ${s}`)),
          it.stage === "shipped" || it.stage === "closed" ? (it.busRecorded ? null : h("button.btn.small", { type: "button", onclick: () => recordPayout(it) }, "Payout -> Bus")) : null,
          h("button.btn.quiet.small", { type: "button", onclick: () => { if (confirm("Remove " + it.title + "?")) { S.remove("items", it.id); paint(); } } }, "Remove")
        )
      ));
    }
  }

  function advance(it, stage) {
    const patch = { stage };
    if (stage === "listed") patch.listedDate = day();
    if (stage === "sold") {
      const sp = prompt("Sold price $", it.price); if (sp == null) return; patch.soldPrice = +sp || 0;
      const sb = prompt("Ship-by date (YYYY-MM-DD)", day()); if (sb) { patch.shipBy = sb; if (window.PB) PB.deadlines.publish({ title: "Ship: " + it.title, date: sb, source: "selling", kind: "ship", ref: it.id }); }
    }
    if (stage === "shipped") {
      const tr = prompt("Tracking number (or blank)"); if (tr) patch.tracking = tr;
      const fa = prompt("Actual marketplace fee $", ""); if (fa) patch.feeActual = +fa || 0;
      const sa = prompt("Actual shipping $", it.shipEst || ""); if (sa) patch.shipActual = +sa || 0;
      if (window.PB) PB.deadlines.unpublish("selling", it.id);
    }
    S.update("items", it.id, patch); paint();
  }

  function recordPayout(it) {
    const r = SELLING.net({ price: it.soldPrice != null ? it.soldPrice : it.price, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging });
    if (window.PB) PB.money.add({ kind: "sale", type: "sale", amount: r.net, label: it.title, source: "selling" });
    S.update("items", it.id, { busRecorded: true }); toast("Payout recorded: " + money(r.net)); paint();
  }

  $("#s-fee-preset").addEventListener("change", (e) => { const p = presets[+e.target.value]; const f = $("#s-form"); if (!p) { delete f.dataset.rule; updatePreview(); return; } f.feePct.value = p.pct; f.feeFixed.value = p.fixed; if (p.rule) f.dataset.rule = p.rule; else delete f.dataset.rule; updatePreview(); });
  ["price", "feePct", "feeFixed", "shipEst", "packaging"].forEach((k) => $("#s-form")[k].addEventListener("input", updatePreview));
  $("#s-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("items", { date: day(), title: f.title.value.trim(), batch: f.batch.value.trim(), price: +f.price.value || 0, feePct: +f.feePct.value || 0, feeFixed: +f.feeFixed.value || 0, feeRule: f.dataset.rule || undefined, shipEst: +f.shipEst.value || 0, packaging: +f.packaging.value || 0, stage: "staged" });
    f.reset(); f.feePct.value = 10; f.feeFixed.value = 0; delete f.dataset.rule; updatePreview(); toast("Staged"); paint();
  });
  $("#s-sup-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("supplies", { name: f.name.value.trim(), qty: +f.qty.value || 0, min: +f.min.value || 5 });
    f.reset(); toast("Supply added"); paint();
  });

  $("#export").onclick = () => download(`selling_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };

  fillPresets();
  fetch("./data/fees-nov2026.json").then((r) => (r.ok ? r.json() : null)).then((j) => {
    if (!j || !j.fees) return;
    const loaded = [], eb = j.fees.ebay;
    if (eb && Array.isArray(eb.categories)) {
      const ord = (eb.per_order_fee && eb.per_order_fee.order_total_gt_10) || 0.4;
      for (const c of eb.categories.slice(0, 6)) { const m = String(c.rate || "").match(/([\d.]+)%/); if (m) loaded.push({ label: `eBay · ${c.cat.slice(0, 32)} (${m[1]}% + $${ord})`, pct: +m[1], fixed: ord }); }
    }
    presets = [...loaded, ...BASE_PRESETS.filter((b) => !b.label.startsWith("eBay Most"))]; fillPresets();
  }).catch(() => {});
  paint();
})();
