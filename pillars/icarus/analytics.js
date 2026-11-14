/* Icarus live portfolio analytics + 30 rule formulas + 50 metric reference (uses unified S.list("trades") store). */
(function () {
  "use strict";
  const root = document.getElementById("icarus-analytics");
  if (!root || !window.RULE_EVAL || !window.RULE_CHECKS || !window.ICARUS) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function computeLiveMetrics() {
    const closed = window.ICARUS.getTrades().filter((t) => window.ICARUS.pl(t) != null);
    const bk = window.ICARUS.getBankroll();
    if (!closed.length) return "<p class='empty'>Log or load trades to compute live metrics alongside the 50 reference formulas.</p>";
    const pnls = closed.map(window.ICARUS.pl);
    const wins = pnls.filter((x) => x > 0), losses = pnls.filter((x) => x < 0);
    const net = pnls.reduce((a, b) => a + b, 0);
    const W = wins.length / pnls.length;
    const AW = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const AL = losses.length ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
    const b = AL > 0 ? AW / AL : 0;
    const kelly = b > 0 ? W - (1 - W) / b : 0;
    let eq = bk, peak = bk, maxDD = 0;
    for (const p of pnls) { eq += p; peak = Math.max(peak, eq); maxDD = Math.max(maxDD, peak - eq); }
    const mean = net / pnls.length;
    const sd = pnls.length > 1 ? Math.sqrt(pnls.reduce((s, p) => s + (p - mean) ** 2, 0) / (pnls.length - 1)) : 0;
    const sharpe = sd > 0 ? mean / sd : 0;
    const downDev = Math.sqrt(pnls.reduce((s, p) => s + Math.min(0, p) ** 2, 0) / pnls.length);
    const sortino = downDev > 0 ? mean / downDev : 0;
    const totalFees = closed.reduce((s, t) => s + (+t.fees || 0), 0);
    const rows = [
      ["Net P/L", "$" + net.toFixed(2)],
      ["Win Rate", (W * 100).toFixed(1) + "%"],
      ["Payoff Ratio (b)", b.toFixed(2)],
      ["Breakeven Win Rate", b > 0 ? (100 / (1 + b)).toFixed(1) + "%" : "—"],
      ["Kelly Fraction", (kelly * 100).toFixed(2) + "%"],
      ["Sharpe per trade", sharpe.toFixed(3)],
      ["Sortino per trade", sortino.toFixed(3)],
      ["Max Drawdown ($ / %)", `$${maxDD.toFixed(2)} (${((maxDD / peak) * 100).toFixed(2)}%)`],
      ["Fees Total", "$" + totalFees.toFixed(2)],
      ["Return on Bankroll", ((net / bk) * 100).toFixed(2) + "%"],
    ];
    return `<div class="scroll-x"><table class="t"><thead><tr><th>Live Metric (${closed.length} trades)</th><th class="n">Computed Value</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n"><b>${esc(v)}</b></td></tr>`).join("")}</tbody></table></div>`;
  }

  function render() {
    root.innerHTML = `<div class="glass">
      <h2>Live Portfolio Metrics & Reference Library</h2>
      <div id="ia-live" style="margin-bottom:12px">${computeLiveMetrics()}</div>
      <details><summary>All 30 Discipline Check Formulas (${window.RULE_CHECKS.length})</summary>
        ${window.RULE_CHECKS.map((r) => `<div class="bill"><div class="bill-when">${r.n}. ${esc(r.name)}</div><p style="margin:2px 0">${esc(r.catches)}</p><div class="mono">${esc(r.formula)}</div></div>`).join("")}
      </details>
      <details style="margin-top:8px"><summary>All 50 Quantitative Metrics Reference (${(window.METRICS || []).length})</summary>
        ${(window.METRICS || []).map((m) => `<div class="bill"><div class="bill-when">${esc(m.metric)} · sample: ${m.value}</div><p style="margin:2px 0">${esc(m.formula)}</p></div>`).join("")}
      </details>
    </div>`;
  }

  window.addEventListener("icarus:updated", render);
  render();
})();
