/* Selling math (Sebastian, 2026-11-09): pure net-proceeds calculations. No DOM, no storage.
   net = price - marketplace fee - shipping - packaging. The fee defaults to 10% in the UI and is
   always an editable assumption, never a hidden constant. window.SELLING = { net, summarize } */
(function () {
  "use strict";
  const cents = (n) => Math.round(n * 100) / 100;
  function net(o) {
    const fee = o.fee != null ? o.fee : cents((o.price || 0) * (o.feePct != null ? o.feePct : 10) / 100);
    return { fee, net: cents((o.price || 0) - fee - (o.shipping || 0) - (o.packaging || 0)) };
  }
  const STAGES = ["staged", "listed", "sold", "shipped", "closed"];
  function summarize(items) {
    const out = { counts: {}, predictedNet: 0, realizedNet: 0 };
    for (const s of STAGES) out.counts[s] = 0;
    for (const it of items) {
      out.counts[it.stage] = (out.counts[it.stage] || 0) + 1;
      if (it.stage === "listed" || it.stage === "sold") out.predictedNet = cents(out.predictedNet + net({ price: it.price, feePct: it.feePct, shipping: it.shipEst, packaging: it.packaging }).net);
      if (it.stage === "shipped" || it.stage === "closed") out.realizedNet = cents(out.realizedNet + net({ price: it.soldPrice != null ? it.soldPrice : it.price, fee: it.feeActual, shipping: it.shipActual, packaging: it.packaging }).net);
    }
    return out;
  }
  const SELLING = { net, summarize, STAGES, cents };
  if (typeof window !== "undefined") window.SELLING = SELLING;
  if (typeof globalThis !== "undefined") globalThis.SELLING = SELLING;
})();
