/* Icarus Stake v1 (Claude, 2026-11-05): a high-risk trading journal. It never trades, holds no broker keys and gives no signals.
   Rules + every trade + what keeping or breaking the rules cost, all in this browser. */
(function () {
  "use strict";
  const { $, h, money, num, day, toast, store, download, pickFile, tabs, spark, field, G } = PK;
  const S = store("icarus");
  const app = $("#app");

  // one wing: a fan of feathers
  field({ count: 900, at: [0.74, 0.36], scale: 0.3, glyph: (n) => Array.from({ length: 9 }, (_, i) => {
    const a = -0.25 - i * 0.13, L = 1.05 - i * 0.07; return G.line(Math.round(n / 9), -0.55, 0.45, -0.55 + Math.cos(a) * L * 1.5, 0.45 + Math.sin(a) * L);
  }).flat() });

  const DEFAULT_RULES = ["Risk at most 1 % of the bankroll on one trade.", "Every trade has a stop before it is entered.", "No more than 3 trades a day.", "No revenge trade after a loss.", "Write the reason before the entry."];
  if (!S.get("rules")) S.set("rules", DEFAULT_RULES.map((t, i) => ({ id: "r" + i, text: t })));
  if (S.get("bankroll") == null) S.set("bankroll", 0);

  app.innerHTML = `
    <p class="note disclaimer">This journal does not connect to a broker, does not place trades and does not give advice. It only records what you did.</p>
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-sum" aria-controls="p-sum">Summary</button>
      <button class="tab" role="tab" id="t-log" aria-controls="p-log">Log a trade</button>
      <button class="tab" role="tab" id="t-all" aria-controls="p-all">Every trade</button>
      <button class="tab" role="tab" id="t-rules" aria-controls="p-rules">Rules</button>
    </div>
    <section id="p-sum" role="tabpanel" class="grid">
      <div class="glass lit span-8"><div class="stat-k">Net result (closed trades)</div><div class="stat-v big" id="i-net">—</div><div class="stat-s" id="i-net-s"></div>
        <canvas class="spark" id="i-curve" style="margin-top:12px"></canvas></div>
      <div class="glass span-4"><h2>The rules test</h2><div class="stat-k">Rules kept</div><div class="stat-v" id="i-kept">—</div><div class="stat-s" id="i-kept-s"></div>
        <div class="stat-k" style="margin-top:12px">Rules broken</div><div class="stat-v" id="i-broke">—</div><div class="stat-s" id="i-broke-s"></div></div>
      <div class="glass span-3"><div class="stat-k">Win rate</div><div class="stat-v" id="i-win">—</div><div class="stat-s" id="i-win-s"></div></div>
      <div class="glass span-3"><div class="stat-k">Expectancy</div><div class="stat-v" id="i-exp">—</div><div class="stat-s">average result per trade</div></div>
      <div class="glass span-3"><div class="stat-k">Profit factor</div><div class="stat-v" id="i-pf">—</div><div class="stat-s">gross wins ÷ gross losses</div></div>
      <div class="glass span-3"><div class="stat-k">Worst drawdown</div><div class="stat-v down" id="i-dd">—</div><div class="stat-s">peak to low of the curve</div></div>
      <div class="glass span-12"><h2>Open trades</h2><ul class="list" id="i-open"></ul></div>
    </section>
    <section id="p-log" role="tabpanel" class="grid"><div class="glass span-12"><h2>A trade</h2>
      <form class="form" id="i-form">
        <label class="f">Day<input name="date" type="date" required></label>
        <label class="f">Symbol<input name="sym" required maxlength="16" placeholder="BTC, TSLA"></label>
        <label class="f">Side<select name="side"><option value="long">Long</option><option value="short">Short</option></select></label>
        <label class="f">Quantity<input name="qty" type="number" step="any" min="0" required></label>
        <label class="f">Entry<input name="entry" type="number" step="any" min="0" required></label>
        <label class="f">Stop<input name="stop" type="number" step="any" min="0"></label>
        <label class="f">Exit (blank = open)<input name="exit" type="number" step="any" min="0"></label>
        <label class="f">Fees<input name="fees" type="number" step="any" min="0" value="0"></label>
        <label class="f">Rules kept?<select name="kept"><option value="yes">Yes, all of them</option><option value="no">No, I broke one</option></select></label>
        <label class="f wide">Why I took it<textarea name="why" maxlength="600" placeholder="The reason, written before the entry"></textarea></label>
        <div class="wide note" id="i-risk"></div>
        <button class="btn" type="submit">Save the trade</button></form></div></section>
    <section id="p-all" role="tabpanel" class="grid"><div class="glass span-12"><h2>Every trade</h2><div class="scroll-x"><table class="t"><thead><tr><th>Day</th><th>Trade</th><th class="n">Entry</th><th class="n">Exit</th><th class="n">Result</th><th>Rules</th><th></th></tr></thead><tbody id="i-rows"></tbody></table></div></div></section>
    <section id="p-rules" role="tabpanel" class="grid">
      <div class="glass span-6"><h2>Bankroll</h2><form class="form" id="i-bank"><label class="f wide">Money set aside for this, and only this<input name="b" type="number" step="any" min="0"></label><button class="btn small" type="submit">Save</button></form>
        <p class="note" id="i-bank-s"></p></div>
      <div class="glass span-6"><h2>Your rules</h2><ul class="list" id="i-rules"></ul>
        <form class="form" id="i-rule" style="margin-top:10px"><label class="f wide">A new rule<input name="t" maxlength="160" required></label><button class="btn small" type="submit">Add</button></form></div>
    </section>`;

  const pl = (t) => (t.exit === "" || t.exit == null ? null : ((+t.exit - +t.entry) * +t.qty * (t.side === "short" ? -1 : 1)) - (+t.fees || 0));
  const riskOf = (t) => (t.stop ? Math.abs(+t.entry - +t.stop) * +t.qty : null);

  function paint() {
    const trades = S.list("trades").sort((a, b) => (a.date + a.at).localeCompare(b.date + b.at));
    const closed = trades.filter((t) => pl(t) != null), res = closed.map(pl);
    const net = res.reduce((a, b) => a + b, 0), wins = res.filter((x) => x > 0), losses = res.filter((x) => x < 0);
    $("#i-net").textContent = closed.length ? money(net) : "—"; $("#i-net").className = "stat-v big " + (net > 0 ? "up" : net < 0 ? "down" : "");
    const bank = +S.get("bankroll", 0);
    $("#i-net-s").textContent = closed.length ? `${closed.length} closed trade${closed.length === 1 ? "" : "s"}${bank ? ` · ${num(net / bank * 100, 1)} % of the bankroll` : ""}` : "No closed trades yet.";
    let eq = 0, peak = 0, dd = 0; const curve = [{ x: 0, y: 0 }];
    res.forEach((r, i) => { eq += r; peak = Math.max(peak, eq); dd = Math.min(dd, eq - peak); curve.push({ x: i + 1, y: eq }); });
    spark($("#i-curve"), closed.length ? curve : [], { zero: 0, empty: "The curve starts with your first closed trade." });
    $("#i-win").textContent = closed.length ? num(wins.length / closed.length * 100, 0) + " %" : "—";
    $("#i-win-s").textContent = closed.length ? `${wins.length} won · ${losses.length} lost` : "";
    $("#i-exp").textContent = closed.length ? money(net / closed.length) : "—";
    const gl = -losses.reduce((a, b) => a + b, 0); $("#i-pf").textContent = closed.length ? (gl ? num(wins.reduce((a, b) => a + b, 0) / gl, 2) : wins.length ? "∞" : "—") : "—";
    $("#i-dd").textContent = closed.length ? money(dd) : "—";
    const kept = closed.filter((t) => t.kept === "yes"), broke = closed.filter((t) => t.kept !== "yes"), sum = (l) => l.reduce((a, t) => a + pl(t), 0);
    $("#i-kept").textContent = kept.length ? money(sum(kept)) : "—"; $("#i-kept").className = "stat-v " + (sum(kept) >= 0 ? "up" : "down");
    $("#i-kept-s").textContent = `${kept.length} trade${kept.length === 1 ? "" : "s"}`;
    $("#i-broke").textContent = broke.length ? money(sum(broke)) : "—"; $("#i-broke").className = "stat-v " + (sum(broke) >= 0 ? "up" : "down");
    $("#i-broke-s").textContent = broke.length ? `${broke.length} trade${broke.length === 1 ? "" : "s"} · breaking the rules ${sum(broke) < 0 ? "cost" : "made"} ${money(Math.abs(sum(broke)))}` : "None broken. Keep it that way.";
    const open = trades.filter((t) => pl(t) == null);
    $("#i-open").innerHTML = "";
    if (!open.length) $("#i-open").append(h("li.empty", null, "No open trades."));
    open.forEach((t) => { const r = riskOf(t);
      $("#i-open").append(h("li", null, h("span", null, `${t.side === "short" ? "Short" : "Long"} ${t.qty} ${t.sym} at ${t.entry}`),
        h("span.meta", null, r != null ? `risk to stop ${money(r)}${bank ? ` (${num(r / bank * 100, 2)} %)` : ""}` : "no stop set"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { const x = prompt(`Exit price for ${t.sym}?`); if (x && !isNaN(+x)) { S.update("trades", t.id, { exit: +x }); paint(); } } }, "Close"))); });
    $("#i-rows").innerHTML = trades.slice().reverse().map((t) => { const r = pl(t);
      return `<tr><td>${t.date}</td><td>${t.side === "short" ? "Short" : "Long"} ${esc(t.qty)} ${esc(t.sym)}${t.why ? `<div class="meta">${esc(t.why)}</div>` : ""}</td><td class="n">${esc(t.entry)}</td><td class="n">${t.exit === "" || t.exit == null ? "open" : esc(t.exit)}</td>
        <td class="n ${r > 0 ? "up" : r < 0 ? "down" : ""}">${r == null ? "—" : money(r)}</td><td>${t.kept === "yes" ? "kept" : '<span class="warn">broken</span>'}</td><td><button class="btn quiet small" data-del="${t.id}">Delete</button></td></tr>`; }).join("")
      || `<tr><td colspan="7" class="empty">No trades yet.</td></tr>`;
    $("#i-rows").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { if (confirm("Delete this trade?")) { S.remove("trades", b.dataset.del); paint(); } }));
    $("#i-rules").innerHTML = "";
    S.get("rules", []).forEach((r, i) => $("#i-rules").append(h("li", null, h("span", null, `${i + 1}. ${r.text}`),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("rules", S.get("rules", []).filter((x) => x.id !== r.id)); paint(); } }, "Remove"))));
    $("#i-bank").b.value = bank || "";
    $("#i-bank-s").textContent = bank ? `1 % of it is ${money(bank / 100)}: the most rule 1 lets one trade lose.` : "Set it so the journal can check rule 1 on every trade.";
    riskHint();
  }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  const F = $("#i-form"); F.date.value = day();
  function riskHint() {
    const t = { entry: F.entry.value, stop: F.stop.value, qty: F.qty.value }, r = riskOf(t), bank = +S.get("bankroll", 0), el = $("#i-risk");
    if (!F.entry.value || !F.qty.value) { el.textContent = ""; return; }
    if (r == null) { el.innerHTML = '<span class="warn">No stop: the rules say every trade has one.</span>'; return; }
    const pct = bank ? (r / bank) * 100 : null;
    el.innerHTML = `Risk to the stop: <b>${money(r)}</b>${pct != null ? ` = ${num(pct, 2)} % of the bankroll` : ""}${pct != null && pct > 1 ? ' <span class="warn">over the 1 % rule</span>' : ""}`;
  }
  ["entry", "stop", "qty"].forEach((n) => F[n].addEventListener("input", riskHint));
  F.addEventListener("submit", (e) => { e.preventDefault();
    S.add("trades", { date: F.date.value, sym: F.sym.value.trim().toUpperCase(), side: F.side.value, qty: +F.qty.value, entry: +F.entry.value, stop: F.stop.value ? +F.stop.value : null,
      exit: F.exit.value === "" ? "" : +F.exit.value, fees: +F.fees.value || 0, kept: F.kept.value, why: F.why.value.trim() });
    ["sym", "qty", "entry", "stop", "exit", "why"].forEach((n) => (F[n].value = "")); toast("Saved"); paint(); });
  $("#i-bank").addEventListener("submit", (e) => { e.preventDefault(); S.set("bankroll", +e.target.b.value || 0); toast("Saved"); paint(); });
  $("#i-rule").addEventListener("submit", (e) => { e.preventDefault(); S.set("rules", [...S.get("rules", []), { id: "r" + Date.now(), text: e.target.t.value.trim() }]); e.target.t.value = ""; paint(); });
  $("#export").onclick = () => download(`icarus_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  tabs(app, () => requestAnimationFrame(paint));
  paint();
})();
