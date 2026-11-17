/* Selling math (Sebastian, 2026-11-09): pure net-proceeds calculations. No DOM, no storage.
   net = price - marketplace fee - shipping - packaging. The fee defaults to 10% in the UI and is
   always an editable assumption, never a hidden constant. window.SELLING = { net, summarize, FEES, feeFor }
   SEL-GEM-04 (Sebastian, 2026-11-17, from Gemini's verified Nov 2026 fee drop
   selling_gemini_fees_20261116-2040.json + spec §E formulas): the FEES table carries each
   marketplace's published schedule as a rule — pct, per-order fixed fee (tiered on eBay),
   minimum fee (FB/OfferUp), Poshmark's under-$15 flat, and eBay's $7,500 cap with the
   reduced above-cap rate. Rules stay editable in the UI: a preset fills the form's fee
   fields, it never hides them (§H). */
(function () {
  "use strict";
  const cents = (n) => Math.round(n * 100) / 100;
  const FEES = {
    ebay: { label: "eBay — most categories", pct: 13.6, fixedTiers: [[10, 0.3], [Infinity, 0.4]], capUsd: 7500, aboveCapPct: 2.35, url: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822", asOf: "2026-11-16" },
    mercari: { label: "Mercari", pct: 10, fixed: 0, url: "https://www.mercari.com/us/help_center/topics/fees/", asOf: "2026-11-16", note: "10% of item price + buyer-paid shipping" },
    facebook: { label: "Facebook Marketplace (shipped)", pct: 10, fixed: 0, minFee: 0.8, url: "https://www.facebook.com/help/2309549845749429", asOf: "2026-11-16" },
    offerup: { label: "OfferUp (shipped — program retired fall 2025)", pct: 12.9, fixed: 0, minFee: 1.99, url: "https://help.offerup.com/hc/en-us/articles/360053959551", asOf: "2026-11-16", note: "RETIRED: OfferUp ended shipped sales in fall 2025 (new listings 2025-09-23, existing 2025-10-21) and is local-only now; this schedule survives only in leftover policy text — kept for historical sales, do not plan new listings on it. Flagged by second-read SEL-MUS-02." },
    poshmark: { label: "Poshmark", pct: 20, fixed: 0, under15Flat: 2.95, url: "https://poshmark.com/terms#fees", asOf: "2026-11-16" },
    swappa: { label: "Swappa", pct: 6.49, fixed: 0.49, url: "https://swappa.com/fees", asOf: "2026-11-16", note: "Swappa sale fee + PayPal goods-and-services fee, combined seller cost" },
  };
  function feeFor(rule, price) {
    const p = price || 0;
    if (rule.under15Flat != null && p < 15) return cents(rule.under15Flat);
    let fee = rule.capUsd != null && p > rule.capUsd
      ? rule.capUsd * rule.pct / 100 + (p - rule.capUsd) * (rule.aboveCapPct != null ? rule.aboveCapPct : rule.pct) / 100
      : p * (rule.pct || 0) / 100;
    if (rule.fixedTiers) { for (const [upTo, amt] of rule.fixedTiers) { if (p <= upTo) { fee += amt; break; } } }
    else fee += rule.fixed || 0;
    if (rule.minFee != null) fee = Math.max(rule.minFee, fee);
    return cents(fee);
  }
  function net(o) {
    const fee = o.fee != null ? o.fee
      : o.rule ? feeFor(o.rule, o.price || 0)
      : o.feeRule && FEES[o.feeRule] ? feeFor(FEES[o.feeRule], o.price || 0)
      : cents((o.price || 0) * (o.feePct != null ? o.feePct : 10) / 100);
    return { fee, net: cents((o.price || 0) - fee - (o.shipping || 0) - (o.packaging || 0)) };
  }
  const STAGES = ["staged", "listed", "sold", "shipped", "closed"];
  function summarize(items) {
    const out = { counts: {}, predictedNet: 0, realizedNet: 0 };
    for (const s of STAGES) out.counts[s] = 0;
    for (const it of items) {
      out.counts[it.stage] = (out.counts[it.stage] || 0) + 1;
      if (it.stage === "listed" || it.stage === "sold") out.predictedNet = cents(out.predictedNet + net({ price: it.price, feePct: it.feePct, feeRule: it.feeRule, shipping: it.shipEst, packaging: it.packaging }).net);
      if (it.stage === "shipped" || it.stage === "closed") out.realizedNet = cents(out.realizedNet + net({ price: it.soldPrice != null ? it.soldPrice : it.price, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }).net);
    }
    return out;
  }
  const SELLING = { net, summarize, STAGES, cents, FEES, feeFor };
  if (typeof window !== "undefined") window.SELLING = SELLING;
  if (typeof globalThis !== "undefined") globalThis.SELLING = SELLING;
})();
