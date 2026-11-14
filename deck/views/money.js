/* Money: the payoff machine. Plan (where the debt stands, by schedule), What-if (extra and windfalls, live), Bills and subscriptions,
   and the Library (minimum-payment trap, issuer rules, promo traps, hardship directory, the worked cases).
   A simulator on labelled presets: no account, no real balance, no credential ever lives here. */
import { put, h, $, icon, sheet, toast, field, seg, chip, dial, spark, money, moneyC, pct, monthsText, plural, download, ask, countUp } from "../core/ui.js";
import { today, fmtDay, monName, addMonths, diffDays, isDay, relDay } from "../core/dates.js";
import { simulate, position, compare, windfallPreview, minimumTrap, deferredExample, paymentFor, impliedApr, dueDate, burn, billDates, monthlyCost, cycleText, CYCLES, milestone, toCents } from "../models/money.js";
import { WORDS, closerLine, fill } from "../data/money-words.js";

const TABS = [["plan", "Plan"], ["whatif", "What-if"], ["bills", "Bills"], ["library", "Library"]];
const my = (s) => { const [y, m] = (s || "").split("-").map(Number); return s ? `${monName(m, 1)} ${y}` : "—"; };
let libTab = "trap"; const data = {};
const load = async (name) => data[name] || (data[name] = await fetch(`./deck/data/${name}.json`).then((r) => r.json()));

export function render(root, route, ctx) {
  const { store } = ctx; const t = today(); const tab = TABS.some((x) => x[0] === route.tab) ? route.tab : "plan"; const m = store.get("money");
  put(root, h("nav.tabs", { "aria-label": "Money views" }, TABS.map(([id, name]) => h("a" + (id === tab ? ".on" : ""), { href: `#/money/${id}`, "aria-current": id === tab ? "page" : null }, name))));
  const body = h("section.money-body"); put(root, body);
  if (tab === "plan") plan(body, ctx, m, t); else if (tab === "whatif") whatif(body, ctx, m, t); else if (tab === "bills") bills(body, ctx, m, t); else library(body, ctx, m);
  put(root, h("div.row.tools", h("button.btn.ghost.small", { type: "button", onclick: () => download(`prometheus-money-${t}.json`, store.exportSlice("money")) }, icon("download", 16), "Export Money"), h("button.btn.ghost.small", { type: "button", onclick: () => ctx.loadSeedFile() }, icon("upload", 16), "Import")),
    h("p.quiet.fine", "A simulator on presets you type or load. It never connects to a bank and never holds a real balance; the encrypted book lives in ", h("a", { href: "https://jpavia10.github.io/midas-ledger/", rel: "noopener" }, "Midas Ledger"), "."));
}

/* ------------------------------------------------------------------ plan ------------------------------------------------------------------ */
function samplePlan(t) { const first = addMonths(t.slice(0, 8) + "05", -6); return { label: "Sample consolidation", sample: true, start: first, strategy: "avalanche", order: [], budget: null, extra: 0, debts: [{ id: "d" + Date.now().toString(36), name: "Sample consolidation loan", kind: "loan", balance: 12000, apr: 9.99, min: Math.ceil(paymentFor(12000, 9.99, 24) * 100) / 100 }] }; }

function plan(body, ctx, m, t) {
  const { store } = ctx;
  if (!m.plan || !m.plan.debts.length) {
    put(body, h("div.empty.scene", icon("money", 36), h("h2", "No payoff plan on this device"), h("p", "Start from a labelled sample and edit every number, or add your first debt."),
      h("div.row.center", h("button.btn", { type: "button", onclick: () => store.update("money", (x) => { x.plan = samplePlan(t); }) }, "Start with a sample"), h("button.btn.ghost", { type: "button", onclick: () => debtSheet(ctx, null) }, icon("plus", 16), "Add a debt"))));
    return;
  }
  const pos = position(m.plan, m.events, t); const ms = milestone(pos.pct); const pctEl = h("span.num.dial-pct"); countUp(pctEl, pos.pct * 100, (v) => v.toFixed(v >= 99.95 ? 0 : 1) + "%");
  const curve = pos.run.curve.map((c) => c / 100);
  put(body, h("section.panel.payoff.glow-mint",
    h("header.panel-head", h("h2", "Payoff plan"), m.plan.sample ? chip("sample") : null, h("button.icon-btn.small", { type: "button", "aria-label": "Edit the plan", onclick: () => planSheet(ctx) }, icon("edit", 16))),
    h("div.dial-box", dial({ value: pos.pct, width: 300, tone: "mint", label: "Share of the starting debt paid, by schedule" }), h("div.dial-center", pctEl, h("small", "paid, by schedule"))),
    h("div.stats3",
      h("div", h("small", "Debt-free"), h("b.num", pos.done ? "Done" : pos.freeMonth ? my(pos.freeMonth) : "never"), h("small", pos.done ? "" : monthsText(pos.monthsLeft) + " left")),
      h("div", h("small", "Next due"), h("b.num", pos.next ? moneyC(pos.next.amountC) : "—"), h("small", pos.next ? fmtDay(pos.next.date, "md") + " · " + relDay(pos.next.date, t) : "")),
      h("div", h("small", "Interest left"), h("b.num", moneyC(pos.interestLeftC)), h("small", `of ${moneyC(pos.totalInterestC, 0)}`))),
    h("div.curve", spark(curve, { w: 320, h: 70, tone: "mint", marks: [pos.k], min: 0, label: "Balance by month" }), h("div.curve-axis", h("small", my(dueDate(m.plan, 1))), h("small.num", `${moneyC(pos.nowC)} by schedule today`), h("small", pos.freeMonth ? my(pos.freeMonth) : ""))),
    ms.hit ? h("p.voice", WORDS.pct[ms.hit]) : pos.k > 0 ? h("p.voice", WORDS.first) : null,
    pos.run.stalled ? h("div.banner.level-3", icon("alert", 18), h("span", h("b", "This plan never ends"), h("small", "The payments do not cover the interest. Raise a payment or the budget."))) : null));

  /* strategies */
  if (pos.run.debts.length > 1) {
    const cmp = compare(m.plan, m.events); const worst = Math.max(...Object.values(cmp).map((c) => (isFinite(c.interestC) ? c.interestC : 0))) || 1;
    put(body, h("section.panel", h("header.panel-head", h("h2", "Three ways, same debts")),
      h("div.lanes", [["avalanche", "Avalanche", "highest rate first"], ["snowball", "Snowball", "smallest balance first"], ["minimum", "Minimums only", "no extra, ever"]].map(([k, name, sub]) => { const c = cmp[k];
        return h("button.lane" + (m.plan.strategy === k ? ".on" : ""), { type: "button", disabled: k === "minimum", "aria-pressed": String(m.plan.strategy === k), onclick: () => store.update("money", (x) => { x.plan.strategy = k; }) },
          h("span.lane-name", h("b", name), h("small", sub)), h("span.lane-bar", h("i", { style: { width: Math.max(4, (c.interestC / worst) * 100) + "%" } })), h("span.lane-nums.num", h("b", c.stalled ? "never" : monthsText(c.months)), h("small", moneyC(c.interestC) + " interest"), h("small", c.freeMonth ? my(c.freeMonth) : ""))); })),
      h("p.quiet", "Tap a strategy to run the plan that way. Minimums-only is the comparison: what the same debts cost with no plan.")));
  } else {
    const d = pos.run.debts[0]; const n = pos.run.months.length; const text = paymentFor(d.balance, d.apr, n); const imp = impliedApr(d.balance, d.min, n);
    put(body, h("section.panel", h("header.panel-head", h("h2", "The loan, two ways")),
      h("div.stats3", h("div", h("small", "You pay"), h("b.num", money(d.min)), h("small", `${n} payments`)), h("div", h("small", "Textbook"), h("b.num", money(text)), h("small", `${d.apr}% · ${n} mo`)), h("div", h("small", "Implied rate"), h("b.num", imp.toFixed(2) + "%"), h("small", "from your payment"))),
      h("p.quiet", Math.abs(text - d.min) < 0.02 ? "The payment matches the textbook amortization for this rate and term." : d.min > text ? `The payment is ${money(d.min - text)} a month above the textbook figure for this rate and term, so the last payment is smaller and the loan can end early.` : "The payment is below the textbook figure for this term: the loan runs longer than the term.")));
  }

  /* debts */
  put(body, h("section.panel", h("header.panel-head", h("h2", plural(m.plan.debts.length, "debt")), h("button.btn.ghost.small", { type: "button", onclick: () => debtSheet(ctx, null) }, icon("plus", 14), "Add")),
    h("div.items", m.plan.debts.map((d) => { const i = pos.run.debts.findIndex((x) => x.id === d.id); const nowC = i >= 0 ? (pos.k ? pos.run.months[Math.min(pos.k, pos.run.months.length) - 1].rows[i][2] : toCents(d.balance)) : 0; const pm = pos.run.payoffMonth[d.id];
      return h("a.item.tone-bill", { href: "#", onclick: (e) => { e.preventDefault(); debtSheet(ctx, d.id); } }, h("span.pip"), h("span.item-main", h("b", d.name), h("small", `${money(d.balance)} at ${d.apr}% · ${money(d.min)} a month${pm ? " · paid off " + my(dueDate(m.plan, pm)) : ""}`)), h("span.item-tags", h("span.amt.num", moneyC(nowC)), h("small.quiet", "by schedule"))); }))));

  /* windfalls logged */
  if (m.events.length) put(body, h("section.panel", h("header.panel-head", h("h2", "Extra money applied"), h("b.num", moneyC(pos.windfallC))),
    h("div.items", [...m.events].sort((a, b) => b.date.localeCompare(a.date)).map((e) => h("div.item.tone-event", h("span.pip"), h("span.item-main", h("b", e.label || "Windfall"), h("small", `${fmtDay(e.date)}${e.kind ? " · " + e.kind : ""}`)), h("span.item-tags", h("span.amt.num", money(e.amount)), h("button.icon-btn.small", { type: "button", "aria-label": "Remove " + (e.label || "windfall"), onclick: () => { const copy = { ...e }; store.update("money", (x) => { x.events = x.events.filter((y) => y.id !== e.id); if (e.busId) (x.dismissedBus = x.dismissedBus || []).push(e.busId); }); toast("Removed.", { undo: () => store.update("money", (x) => { x.events.push(copy); if (e.busId && x.dismissedBus) x.dismissedBus = x.dismissedBus.filter((b) => b !== e.busId); }) }); } }, icon("x", 14))))))));
}

function planSheet(ctx) {
  const { store } = ctx; const m = store.get("money"); const p = m.plan;
  const label = h("input", { type: "text", value: p.label || "", maxlength: 60 }), start = h("input", { type: "date", value: p.start }), budget = h("input", { type: "number", min: 0, step: "0.01", inputmode: "decimal", value: p.budget != null ? p.budget : "", placeholder: "the payments, added up" });
  let strategy = p.strategy;
  sheet({ title: "The plan", body: (close) => h("form.stack", { onsubmit: (e) => { e.preventDefault(); if (!isDay(start.value)) return; store.update("money", (x) => { x.plan.label = label.value.trim(); x.plan.start = start.value; x.plan.budget = budget.value === "" ? null : Number(budget.value); x.plan.strategy = strategy; if (x.plan.sample && label.value.trim() !== "Sample consolidation") x.plan.sample = false; }); close(); toast("Plan saved."); } },
    field("Name", label), field("First payment due", start, "The plan counts a payment as made once its due day has passed (by schedule)."),
    field("Monthly budget for all debts (optional)", budget, "Leave empty to pay exactly each debt's payment. A larger budget sends the rest to the strategy's target."),
    p.debts.length > 1 ? field("Strategy", seg([["avalanche", "Avalanche"], ["snowball", "Snowball"], ["custom", "Listed order"]], strategy, (v) => { strategy = v; }, "Strategy")) : null,
    h("div.row.end", h("button.btn.ghost.danger", { type: "button", onclick: async () => { if (await ask("Remove the plan?", "The debts and the extra money logged against it are removed from this device.", "Remove", "danger")) { const copy = JSON.parse(JSON.stringify({ plan: m.plan, events: m.events })); store.update("money", (x) => { x.plan = null; x.events = []; }); close(); toast("Plan removed.", { undo: () => store.update("money", (x) => { x.plan = copy.plan; x.events = copy.events; }) }); } } }, "Remove plan"), h("button.btn", { type: "submit" }, "Save"))) });
}
function debtSheet(ctx, id) {
  const { store } = ctx; const m = store.get("money"); const d = id ? m.plan.debts.find((x) => x.id === id) : null;
  const name = h("input", { type: "text", value: d ? d.name : "", maxlength: 60, required: true, autofocus: !d }), bal = h("input", { type: "number", min: 0, step: "0.01", inputmode: "decimal", value: d ? d.balance : "", required: true }), apr = h("input", { type: "number", min: 0, max: 99, step: "0.001", inputmode: "decimal", value: d ? d.apr : "", required: true }), min = h("input", { type: "number", min: 0, step: "0.01", inputmode: "decimal", value: d ? d.min : "", required: true });
  const hint = h("span.field-hint"); const upd = () => { const b = Number(bal.value), a = Number(apr.value), p = Number(min.value); if (b > 0 && p > 0) { const r = simulate({ debts: [{ id: "x", name: "x", balance: b, apr: a, min: p }], strategy: "minimum" }); hint.textContent = r.stalled ? "At this payment the balance never falls: interest is larger than the payment." : `Alone, this pays off in ${monthsText(r.monthsToFree)} with ${moneyC(r.totalInterestC)} of interest.`; } else hint.textContent = ""; };
  [bal, apr, min].forEach((x) => x.addEventListener("input", upd)); upd();
  sheet({ title: d ? "Edit debt" : "Add a debt", body: (close) => h("form.stack", { onsubmit: (e) => { e.preventDefault(); const rec = { name: name.value.trim(), balance: Number(bal.value), apr: Number(apr.value), min: Number(min.value) }; if (!rec.name || !(rec.balance > 0) || !(rec.min > 0) || isNaN(rec.apr)) { toast("A name, a balance and a payment are needed.", { tone: "warn" }); return; }
      store.update("money", (x) => { if (!x.plan) x.plan = { label: "My plan", sample: false, start: today().slice(0, 8) + "01" > today() ? today() : addMonths(today().slice(0, 8) + "01", 1), strategy: "avalanche", order: [], budget: null, extra: 0, debts: [] };
        if (d) Object.assign(x.plan.debts.find((y) => y.id === d.id), rec); else x.plan.debts.push({ id: "d" + Date.now().toString(36), kind: "loan", ...rec }); });
      close(); toast(d ? "Saved." : WORDS.newDebt); } },
    h("p.quiet", "Type the starting figures of the preset. This is a model you control, not a link to an account."),
    field("Name", name), h("div.grid2", field("Starting balance ($)", bal), field("APR (%)", apr)), field("Monthly payment ($)", min, hint),
    h("div.row.end", d ? h("button.btn.ghost.danger", { type: "button", onclick: () => { const copy = { ...d }; store.update("money", (x) => { x.plan.debts = x.plan.debts.filter((y) => y.id !== d.id); }); close(); toast("Debt removed.", { undo: () => store.update("money", (x) => x.plan.debts.push(copy)) }); } }, "Remove") : null, h("button.btn", { type: "submit" }, "Save"))) });
}

/* ------------------------------------------------------------------ what-if ------------------------------------------------------------------ */
function whatif(body, ctx, m, t) {
  const { store } = ctx;
  if (!m.plan || !m.plan.debts.length) { put(body, h("div.empty.scene", icon("money", 36), h("h2", "What-if needs a plan"), h("a.btn", { href: "#/money" }, "Set up the plan"))); return; }
  const base = position(m.plan, m.events, t);
  const extra = h("input", { type: "range", min: 0, max: 1000, step: 25, value: m.plan.extra || 0, "aria-label": "Extra per month" }), extraN = h("output.num.big"), wind = h("input", { type: "number", min: 0, step: "1", inputmode: "decimal", placeholder: "0", "aria-label": "One-time windfall in dollars" });
  const out = h("div.whatif-out", { "aria-live": "polite" }), alloc = h("div.alloc");
  const calc = () => {
    const ex = Number(extra.value) || 0, w = Number(wind.value) || 0; extraN.textContent = money(ex, 0) + " / month";
    const p2 = { ...m.plan, extra: ex }; const ev2 = w > 0 ? [...m.events, { date: t, amount: w }] : m.events; const now = position({ ...m.plan, extra: 0 }, m.events, t), then = position(p2, ev2, t);
    const moved = now.run.months.length - then.run.months.length, saved = now.totalInterestC - then.totalInterestC;
    out.replaceChildren(h("div.vs", h("div", h("small", "As it stands"), h("b.num", now.freeMonth ? my(now.freeMonth) : "never"), h("small", monthsText(now.monthsLeft) + " left")), h("div.arrow", icon("right", 22)),
      h("div.then", h("small", "With this"), h("b.num", then.freeMonth ? my(then.freeMonth) : "never"), h("small", monthsText(then.monthsLeft) + " left"))),
      h("div.stats3", h("div", h("small", "Sooner by"), h("b.num", plural(Math.max(0, moved), "month"))), h("div", h("small", "Interest saved"), h("b.num", moneyC(Math.max(0, saved)))), h("div", h("small", "Total interest"), h("b.num", moneyC(then.totalInterestC)))),
      moved > 0 ? h("p.voice", closerLine(moved)) : h("p.quiet", "Move the slider or type a windfall: the debt-free date answers at once."));
    if (w > 0) { const pv = windfallPreview({ ...m.plan, extra: ex }, m.events, w, t);
      alloc.replaceChildren(h("h3", `Where ${money(w, 0)} lands`), ...Object.entries(pv).map(([s2, r]) => h("div.item", h("span.item-main", h("b", { avalanche: "Avalanche", snowball: "Snowball", custom: "Listed order" }[s2]), h("small", Object.entries(r.lands).map(([n, c]) => `${moneyC(c)} to ${n}`).join(" · ") || "nothing left to pay")), h("span.item-tags", h("span.num", `${plural(r.monthsSaved, "month")} sooner`), h("small.quiet", moneyC(r.interestSavedC) + " saved"))))); }
    else alloc.replaceChildren();
  };
  extra.addEventListener("input", calc); wind.addEventListener("input", calc);
  const label = h("input", { type: "text", placeholder: "What was it? (sold the old mower)", maxlength: 80 });
  put(body, h("section.panel.glow-mint", h("header.panel-head", h("h2", "What if"), chip(base.freeMonth ? "now: " + my(base.freeMonth) : "now: never")),
    h("div.stack", h("div.slider", h("div.row.between", h("span", "Extra every month"), extraN), extra), field("A one-time windfall ($)", wind), out, alloc,
      h("div.row.end", h("button.btn.ghost", { type: "button", onclick: () => { store.update("money", (x) => { x.plan.extra = Number(extra.value) || 0; }); toast(`The plan now carries ${money(Number(extra.value) || 0, 0)} extra a month.`); } }, "Make the extra my plan"),
        h("button.btn", { type: "button", onclick: () => { const w = Number(wind.value) || 0; if (!(w > 0)) { toast("Type the windfall amount first.", { tone: "warn" }); wind.focus(); return; }
          sheet({ title: "Log this windfall", body: (close) => h("div.stack", h("p.lead", `${money(w)} goes against the plan with today's date. It can be removed later.`), field("Label", label),
            h("div.row.end", h("button.btn", { type: "button", onclick: () => { const before = position(m.plan, m.events, t).run.months.length; store.update("money", (x) => x.events.push({ id: "m" + Date.now().toString(36), date: t, amount: w, kind: "windfall", label: label.value.trim() || "Windfall", applied: true }));
              const after = position(store.get("money").plan, store.get("money").events, t).run.months.length; close(); toast(closerLine(before - after) || "Logged against the plan."); ctx.go("#/money"); } }, "Log it"))) }); } }, "Log the windfall")))));
  calc();
}

/* ------------------------------------------------------------------ bills and subscriptions ------------------------------------------------------------------ */
function bills(body, ctx, m, t) {
  const { store } = ctx; const b = burn(m.bills || []); const horizon = addMonths(t, 13);
  const next = (x) => billDates(x, t, horizon)[0] || null;
  const list = [...(m.bills || [])].map((x) => ({ x, next: next(x) })).sort((a, c) => (a.next || "9").localeCompare(c.next || "9"));
  put(body, h("section.panel", h("header.panel-head", h("h2", "Recurring charges"), h("button.btn.ghost.small", { type: "button", onclick: () => billSheet(ctx, null) }, icon("plus", 14), "Add")),
    list.length ? [h("div.stats3", h("div", h("small", "Every month"), h("b.num", money(b.monthly))), h("div", h("small", "Every year"), h("b.num", money(b.yearly, 0))), h("div", h("small", "Subscriptions"), h("b.num", money(b.subsMonthly)), h("small", "a month"))),
      h("div.items", list.map(({ x, next: n }) => h("a.item.tone-" + (x.kind === "sub" ? "sub" : "bill"), { href: "#", onclick: (e) => { e.preventDefault(); billSheet(ctx, x.id); } }, h("span.pip"), h("span.item-main", h("b", x.name), h("small", `${cycleText(x.every)}${n ? " · next " + fmtDay(n) : ""}${x.note ? " · " + x.note : ""}`)), h("span.item-tags", h("span.amt.num", money(x.amount)), x.autopay ? chip("autopay") : null, n ? h("span.until.num", relDay(n, t)) : null))))]
      : h("div.empty", icon("bell", 30), h("p", "No recurring charges listed. Add the bills and subscriptions you pay: each next-due date shows on the picture and in Time."))));
  if (b.subs.length) put(body, h("section.panel", h("header.panel-head", h("h2", "Subscription audit"), h("b.num", money(b.subsMonthly * 12, 0) + " a year")),
    h("p.quiet", "Recurring charges are quiet debt. Sorted by what each costs in a year."),
    h("div.items", b.subs.map((x) => { const idle = x.lastUsed ? diffDays(x.lastUsed, t) : null; return h("a.item.tone-sub", { href: "#", onclick: (e) => { e.preventDefault(); billSheet(ctx, x.id); } }, h("span.pip"), h("span.item-main", h("b", x.name), h("small", x.lastUsed ? `last used ${relDay(x.lastUsed, t)}` : "last use not noted")), h("span.item-tags", h("span.amt.num", money(x.yearly, 0) + "/yr"), idle != null && idle > 60 ? chip(`unused ${idle} days`, "warn") : null)); }))));
}
function billSheet(ctx, id) {
  const { store } = ctx; const m = store.get("money"); const b = id ? m.bills.find((x) => x.id === id) : null; const t = today();
  const name = h("input", { type: "text", value: b ? b.name : "", maxlength: 60, required: true, autofocus: !b }), amt = h("input", { type: "number", min: 0, step: "0.01", inputmode: "decimal", value: b ? b.amount : "", required: true }), anchor = h("input", { type: "date", value: b ? (billDates(b, t, addMonths(t, 13))[0] || b.anchor) : t, required: true });
  const every = h("select", null, ...CYCLES.map((c) => h("option", { value: c, selected: (b ? b.every : "month") === c }, cycleText(c)))), note = h("input", { type: "text", value: b ? b.note || "" : "", maxlength: 120 }), used = h("input", { type: "date", value: b && b.lastUsed ? b.lastUsed : "" });
  let kind = b ? b.kind : "bill", auto = b ? !!b.autopay : false;
  sheet({ title: b ? "Edit charge" : "Add a recurring charge", body: (close) => h("form.stack", { onsubmit: (e) => { e.preventDefault(); const rec = { name: name.value.trim(), amount: Number(amt.value), every: every.value, anchor: anchor.value, kind, autopay: auto, note: note.value.trim(), lastUsed: used.value || null };
      if (!rec.name || !(rec.amount >= 0) || !isDay(rec.anchor)) { toast("A name, an amount and a due date are needed.", { tone: "warn" }); return; }
      store.update("money", (x) => { if (b) Object.assign(x.bills.find((y) => y.id === b.id), rec); else x.bills.push({ id: "b" + Date.now().toString(36), ...rec }); }); close(); toast(b ? "Saved." : `Added. Next due ${fmtDay(rec.anchor)} is on the picture.`); } },
    field("Kind", seg([["bill", "Bill"], ["sub", "Subscription"]], kind, (v) => { kind = v; }, "Kind")), field("Name", name), h("div.grid2", field("Amount ($)", amt), field("How often", every)), field("Next due", anchor),
    h("label.check", h("input", { type: "checkbox", checked: auto, onchange: (e) => { auto = e.target.checked; } }), h("span", "On autopay")), field("Last used (subscriptions)", used), field("Note", note),
    h("div.row.end", b ? h("button.btn.ghost.danger", { type: "button", onclick: () => { const copy = { ...b }; store.update("money", (x) => { x.bills = x.bills.filter((y) => y.id !== b.id); }); close(); toast("Removed.", { undo: () => store.update("money", (x) => x.bills.push(copy)) }); } }, "Remove") : null, h("button.btn", { type: "submit" }, "Save"))) });
}

/* ------------------------------------------------------------------ library ------------------------------------------------------------------ */
function library(body, ctx, m) {
  const tabs = [["trap", "Minimum trap"], ["issuers", "Issuers"], ["promos", "Promo traps"], ["hardship", "Hardship"], ["cases", "Worked cases"]];
  const box = h("div.lib"); const draw = async () => { box.replaceChildren(h("p.quiet", "Loading…")); try { const el = await ({ trap, issuers, promos, hardship, cases })[libTab](ctx, m); box.replaceChildren(el); } catch (e) { box.replaceChildren(h("div.empty", icon("alert", 28), h("p", "This part of the library needs a connection the first time it opens."))); } };
  put(body, h("div.subtabs", seg(tabs, libTab, (v) => { libTab = v; draw(); }, "Library")), box); draw();
}
async function trap() {
  const iss = await load("issuers"); const flat = iss.flatMap((i) => i.minimums.map((mm) => ({ issuer: i.issuer, ...mm, method: i.method })));
  const pick = h("select", { "aria-label": "Issuer" }, ...flat.map((f, i) => h("option", { value: i }, f.issuer))), bal = h("input", { type: "number", min: 1, step: "1", value: 5000, inputmode: "decimal" }), apr = h("input", { type: "number", min: 0, max: 99, step: "0.01", value: 24.99, inputmode: "decimal" });
  const out = h("div.stack");
  const calc = () => { const f = flat[Number(pick.value)]; const b = Number(bal.value), a = Number(apr.value); if (!(b > 0)) { out.replaceChildren(); return; }
    const r = minimumTrap({ balance: b, apr: a, formula: f.formula }); const fixed = r.first[0] ? simulate({ debts: [{ id: "x", name: "x", balance: b, apr: a, min: r.first[0] / 100 }], strategy: "minimum" }) : null;
    out.replaceChildren(h("p.formula", h("small", f.product), h("code", "minimum = " + f.formula), h("small", "B balance · I interest · F fees. Interest: " + f.method + ".")),
      h("div.stats3", h("div", h("small", "Paying only the minimum"), h("b.num", r.stalled ? "never ends" : monthsText(r.months)), h("small", r.stalled ? "" : "to pay it off")), h("div", h("small", "Interest paid"), h("b.num", moneyC(r.interestC)), h("small", `on ${money(b, 0)} borrowed`)), h("div", h("small", "First minimum"), h("b.num", r.first[0] ? moneyC(r.first[0]) : "—"), h("small", "then it shrinks"))),
      spark(r.curve.map((c) => c / 100), { w: 320, h: 60, tone: "ember", min: 0, label: "Balance while paying only the minimum" }),
      fixed && !fixed.stalled ? h("p.voice", `Keep paying the first minimum (${moneyC(r.first[0])}) every month instead of letting it shrink: done in ${monthsText(fixed.monthsToFree)}, ${moneyC(fixed.totalInterestC)} of interest. The shrinking minimum costs ${moneyC(Math.max(0, r.interestC - fixed.totalInterestC))} more.`) : null);
  };
  [pick, bal, apr].forEach((x) => x.addEventListener("input", calc)); calc();
  return h("section.panel.glow-ember", h("header.panel-head", h("h2", "What the minimum really costs")), h("div.stack", field("Issuer's formula", pick), h("div.grid2", field("Balance ($)", bal), field("APR (%)", apr)), out,
    h("p.quiet", "Formulas are each issuer's published rule for one named product, read from its cardholder agreement (research MID-GEM-04, November 2026). No new charges and no fees are assumed.")));
}
async function issuers() {
  const iss = await load("issuers");
  return h("section.panel", h("header.panel-head", h("h2", "25 issuers: minimums and interest")), h("div.items", iss.map((i) => h("div.item.block", h("span.item-main", h("b", i.issuer), h("small", `Interest: ${i.method}${i.grace != null ? ` · grace ${i.grace} days` : ""}`), ...i.minimums.map((mm) => h("code", `${mm.product}: ${mm.formula}`)))))));
}
async function promos() {
  const o = await load("offers"); const amt = h("input", { type: "number", value: 2400, min: 1, inputmode: "decimal" }), mo = h("input", { type: "number", value: 12, min: 1, max: 60, inputmode: "numeric" }), apr = h("input", { type: "number", value: 29.99, min: 0, step: "0.01", inputmode: "decimal" }), pay = h("input", { type: "number", value: 150, min: 0, step: "1", inputmode: "decimal" }); const out = h("div.stack");
  const calc = () => { const r = deferredExample({ amount: Number(amt.value), apr: Number(apr.value), months: Number(mo.value), payment: Number(pay.value) });
    out.replaceChildren(h("div.vs", h("div", h("small", "Deferred interest"), h("b.num" + (r.deferredChargeC ? ".bad" : ""), moneyC(r.deferredChargeC)), h("small", r.deferredChargeC ? "charged the day the promo ends" : "nothing: paid in full in time")), h("div.arrow", "vs"), h("div.then", h("small", "True 0%"), h("b.num", moneyC(0)), h("small", r.leftC ? `interest starts only on the ${moneyC(r.leftC)} left` : "nothing left"))),
      h("p.voice", r.deferredChargeC ? `Leave ${moneyC(r.leftC)} unpaid when the promo ends and a deferred-interest plan bills all ${moneyC(r.deferredChargeC)} of interest back to day one. Paying ${money(r.payInFullEvery)} a month clears it in time.` : "Paid in full inside the promo: both kinds cost nothing. The trap is only in the last dollar.")); };
  [amt, mo, apr, pay].forEach((x) => x.addEventListener("input", calc)); calc();
  const label = { zero_intro_bt: "0% intro on transfers", zero_intro_purchase_bt: "0% intro, purchases and transfers", low_intro_bt: "low intro on transfers", low_intro_purchase_bt: "low intro, purchases and transfers" };
  return h("div.stack", h("section.panel.glow-ember", h("header.panel-head", h("h2", "Deferred interest vs true 0%")), h("div.stack", h("div.grid2", field("Purchase ($)", amt), field("Promo months", mo)), h("div.grid2", field("APR after promo (%)", apr), field("You pay a month ($)", pay)), out)),
    h("section.panel", h("header.panel-head", h("h2", `${o.promos.length} intro-rate card offers`), chip("read " + o.as_of)), h("p.quiet", "Card intro APRs like these are true 0% or low-rate promos: interest is not charged back. “No interest if paid in full” store and medical financing is the deferred kind."),
      h("div.items", o.promos.map((p) => h("div.item.block", h("span.item-main", h("b", `${p.issuer} · ${p.product}`), h("small", `${label[p.type] || p.type} · ${p.months} ${p.months_unit || "months"}${p.go_to_apr_range ? ` · then ${p.go_to_apr_range}%` : ""}${p.fee ? ` · fee ${p.fee}` : ""}`), p.url ? h("a.src", { href: p.url, target: "_blank", rel: "noopener noreferrer" }, "issuer page", icon("out", 12)) : null))))));
}
async function hardship() {
  const o = await load("offers"); const q = h("input", { type: "search", placeholder: "Search 23 lenders", "aria-label": "Search hardship programs" }); const list = h("div.items");
  const draw = () => { const s2 = q.value.trim().toLowerCase(); const rows = o.hardship.filter((r) => !s2 || (r.lender + " " + r.program + " " + r.offers).toLowerCase().includes(s2));
    list.replaceChildren(...(rows.length ? rows.map((r) => h("details.item.block", h("summary", h("b", r.lender), h("small", r.program)), h("p", h("b", "Offers: "), r.offers), r.qualifies ? h("p", h("b", "Who qualifies: "), r.qualifies) : null, h("p", h("b", "How to ask: "), r.how_to_ask), r.account_effect ? h("p", h("b", "Effect on the account: "), r.account_effect) : null, r.url ? h("a.src", { href: r.url, target: "_blank", rel: "noopener noreferrer" }, "lender page", icon("out", 12)) : null)) : [h("p.quiet", "No lender matches.")])); };
  q.addEventListener("input", draw); draw();
  return h("section.panel", h("header.panel-head", h("h2", "Hardship programs"), chip("read " + o.as_of)), h("div.stack", q, list, o.hardship_missing && o.hardship_missing.length ? h("p.quiet", "Not found on the lender's own pages: " + o.hardship_missing.map((x) => x.lender).join(", ") + ".") : null));
}
async function cases(ctx) {
  const cs = await load("payoff-cases"); const out = h("div.stack"); let cur = 0;
  const pick = h("select", { "aria-label": "Worked case" }, ...cs.map((c, i) => h("option", { value: i }, `Case ${c.case}: ${c.method}, ${c.debts.length} debts, ${money(c.budget, 0)} a month`)));
  const calc = () => { const c = cs[cur]; const r = simulate({ debts: c.debts.map((d) => ({ ...d, id: d.name })), budget: c.budget, strategy: c.method }); let n = 0, bad = 0;
    c.months.forEach((mo, mi) => mo.forEach((row, di) => row.forEach((v, k) => { n++; if (!r.months[mi] || r.months[mi].rows[di][k] !== toCents(v)) bad++; })));
    const same = bad === 0 && r.months.length === c.months.length && r.totalInterestC === toCents(c.total_interest);
    out.replaceChildren(h("div.banner." + (same ? "ok" : "level-3"), icon(same ? "check" : "alert", 18), h("span", h("b", same ? "Matches the worked answer to the cent" : `${bad} figures differ`), h("small.num", `${n.toLocaleString("en-US")} figures compared: every month's interest, payment and balance for every debt`))),
      h("div.stats3", h("div", h("small", "Months"), h("b.num", String(r.months.length)), h("small", "worked: " + c.months.length)), h("div", h("small", "Total interest"), h("b.num", moneyC(r.totalInterestC)), h("small", "worked: " + money(c.total_interest))), h("div", h("small", "Method"), h("b", c.method), h("small", money(c.budget, 0) + " budget"))),
      h("div.items", c.debts.map((d) => h("div.item", h("span.item-main", h("b", d.name), h("small", `${money(d.balance)} at ${d.apr}% · minimum ${money(d.min)}`)), h("span.item-tags", h("span.num", "paid off month " + r.payoffMonth[d.name]), h("small.quiet", "worked: " + c.payoff_month[d.name]))))),
      h("div.row.end", h("button.btn.ghost", { type: "button", onclick: async () => { if (await ask("Load this case into the simulator?", "It replaces the plan on this device with the worked case, labelled as a sample.", "Load case")) { ctx.store.update("money", (x) => { x.plan = { label: `Worked case ${c.case}`, sample: true, start: addMonths(today().slice(0, 8) + "01", 1), strategy: c.method, order: c.debts.map((d) => d.name), budget: c.budget, extra: 0, debts: c.debts.map((d) => ({ ...d, id: d.name, kind: "card" })) }; x.events = []; }); ctx.go("#/money"); } } }, "Load into the simulator"))); };
  pick.addEventListener("change", () => { cur = Number(pick.value); calc(); }); calc();
  return h("section.panel", h("header.panel-head", h("h2", "12 worked cases")), h("div.stack", h("p.quiet", "The engine's proof: twelve payoff plans worked by hand in the research (MID-GEM-01), re-run here in your browser and compared figure by figure."), pick, out));
}
export { pct, $ };
