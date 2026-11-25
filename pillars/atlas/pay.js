/* Atlas pay arithmetic (Claude, 2026-11-25). Pure functions, so the unit test can check every date: window.ATLAS_PAY.
   A payday that falls on a weekend or a bank holiday is paid on the business day before (most employers pay early; "after" is offered
   for the ones that pay late). Bank holidays are the eleven on the Federal Reserve's holiday schedule (frbservices.org; the days ACH payments do not settle):
   New Year's Day, Martin Luther King Jr. Day, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day,
   Columbus Day, Veterans Day, Thanksgiving, Christmas. A holiday on a Sunday is observed the Monday after; one on a Saturday is not
   moved (the Federal Reserve stays open the Friday before), and a Saturday payday moves to Friday anyway. */
(function () {
  "use strict";
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const isDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const utc = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const fromUtc = (t) => { const x = new Date(t); return iso(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()); };
  const addDays = (s, n) => fromUtc(utc(s) + n * 864e5);
  const diffDays = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
  const weekday = (s) => new Date(utc(s)).getUTCDay();            // 0 Sunday .. 6 Saturday
  const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  /** The n-th weekday (0 Sun .. 6 Sat) of a month; n = -1 is the last one. */
  function nth(y, m, wd, n) {
    if (n > 0) { const first = weekday(iso(y, m, 1)); return iso(y, m, 1 + ((wd - first + 7) % 7) + (n - 1) * 7); }
    const L = lastDay(y, m), lw = weekday(iso(y, m, L)); return iso(y, m, L - ((lw - wd + 7) % 7));
  }
  const cache = {};
  /** The Federal Reserve bank holidays of a year, as observed: { "YYYY-MM-DD": name }. */
  function holidays(y) {
    if (cache[y]) return cache[y];
    const fixed = [[1, 1, "New Year's Day"], [6, 19, "Juneteenth"], [7, 4, "Independence Day"], [11, 11, "Veterans Day"], [12, 25, "Christmas Day"]];
    const out = {};
    for (const [m, d, name] of fixed) { const s = iso(y, m, d); out[weekday(s) === 0 ? addDays(s, 1) : s] = name; }
    out[nth(y, 1, 1, 3)] = "Martin Luther King Jr. Day"; out[nth(y, 2, 1, 3)] = "Washington's Birthday"; out[nth(y, 5, 1, -1)] = "Memorial Day";
    out[nth(y, 9, 1, 1)] = "Labor Day"; out[nth(y, 10, 1, 2)] = "Columbus Day"; out[nth(y, 11, 4, 4)] = "Thanksgiving Day";
    return (cache[y] = out);
  }
  const holiday = (s) => holidays(+s.slice(0, 4))[s] || null;
  const business = (s) => { const w = weekday(s); return w !== 0 && w !== 6 && !holiday(s); };
  /** The day the money actually lands for a scheduled payday, and why it moved. */
  function settle(s, early = true) {
    let d = s, n = 0; while (!business(d) && n < 10) { d = addDays(d, early ? -1 : 1); n++; }
    const why = d === s ? "" : holiday(s) ? holiday(s) : weekday(s) === 6 ? "a Saturday" : weekday(s) === 0 ? "a Sunday" : holiday(addDays(s, early ? -1 : 1)) || "a bank holiday";
    return { date: d, scheduled: s, moved: d !== s, why };
  }
  const PER_YEAR = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
  /** Scheduled paydays (before any weekend move) from `from` to `to`, inclusive. */
  function scheduled(pay, from, to) {
    if (!pay || !isDay(from) || !isDay(to) || !PER_YEAR[pay.every]) return [];
    const out = [];
    if (pay.every === "weekly" || pay.every === "biweekly") {
      if (!isDay(pay.anchor)) return [];
      const step = pay.every === "weekly" ? 7 : 14, k = Math.ceil(diffDays(pay.anchor, from) / step);
      for (let d = addDays(pay.anchor, k * step); d <= to; d = addDays(d, step)) out.push(d);
      return out;
    }
    const days = pay.every === "semimonthly" ? (Array.isArray(pay.days) && pay.days.length === 2 ? pay.days : [15, "last"]) : [pay.day || "last"];
    let y = +from.slice(0, 4), m = +from.slice(5, 7);
    for (let i = 0; i < 40; i++) {
      const L = lastDay(y, m);
      for (const v of days) { const d = v === "last" ? L : Math.min(L, Math.max(1, +v || 1)); const s = iso(y, m, d); if (s >= from && s <= to) out.push(s); }
      if (iso(y, m, L) >= to) break;
      m += 1; if (m > 12) { m = 1; y += 1; }
    }
    return out.sort();
  }
  /** The real paydays (moved off weekends and holidays) from `from` for `days` days: [{ date, scheduled, moved, why, net }]. */
  function paydays(pay, from, days = 120) {
    if (!pay) return [];
    const early = pay.move !== "after", to = addDays(from, days);
    const seen = new Set(), out = [];
    for (const s of scheduled(pay, addDays(from, -7), addDays(to, 7))) {
      const r = settle(s, early); if (r.date < from || r.date > to || seen.has(r.date)) continue;
      seen.add(r.date); out.push({ ...r, net: num(pay.net) });
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }
  const num = (v) => (v === "" || v == null || !Number.isFinite(+v) ? null : +v);
  /** Take-home per month from the typical net and how often it comes. */
  const perMonth = (pay) => (pay && num(pay.net) != null && PER_YEAR[pay.every] ? Math.round(num(pay.net) * PER_YEAR[pay.every] / 12 * 100) / 100 : null);
  /** Months in the next year that hold three paydays (on a two-week schedule, twice a year). */
  function threePayMonths(pay, from) {
    const by = {}; for (const p of paydays(pay, from, 365)) { const k = p.date.slice(0, 7); by[k] = (by[k] || 0) + 1; }
    return Object.keys(by).filter((k) => by[k] >= 3).sort();
  }
  /** Year-to-date from the stubs: gross, net, taxes withheld, pre-tax, and the share of gross withheld for tax. */
  function ytd(stubs, year) {
    const t = { n: 0, gross: 0, net: 0, tax: 0, pretax: 0 };
    for (const s of stubs || []) {
      if (!isDay(s.date) || s.date.slice(0, 4) !== String(year)) continue;
      t.n++; t.gross += num(s.gross) || 0; t.net += num(s.net) || 0; t.pretax += num(s.pretax) || 0;
      t.tax += (num(s.fed) || 0) + (num(s.state) || 0) + (num(s.fica) || 0);
    }
    for (const k of ["gross", "net", "tax", "pretax"]) t[k] = Math.round(t[k] * 100) / 100;
    t.taxRate = t.gross > 0 ? t.tax / t.gross : null;
    return t;
  }
  /** One stub's withholding share and how far its net is from the usual one. */
  function stubCheck(s, usual) {
    const g = num(s.gross), n = num(s.net), tax = (num(s.fed) || 0) + (num(s.state) || 0) + (num(s.fica) || 0);
    const off = usual != null && n != null && usual > 0 ? (n - usual) / usual : null;
    const unexplained = g != null && n != null ? Math.round((g - n - tax - (num(s.pretax) || 0)) * 100) / 100 : null;
    return { taxRate: g > 0 ? tax / g : null, off, flag: off != null && Math.abs(off) > 0.02, unexplained };
  }
  /** Time off on a date: the balance as of a day, plus the accrual for each payday after it, never over the cap. */
  function ptoOn(pto, pay, date) {
    if (!pto || num(pto.hours) == null || !isDay(pto.asof) || !isDay(date) || date < pto.asof) return null;
    const n = pay ? paydays(pay, addDays(pto.asof, 1), diffDays(pto.asof, date) - 1).length : 0;
    let h = num(pto.hours) + n * (num(pto.accrue) || 0);
    if (num(pto.cap) != null) h = Math.min(h, num(pto.cap));
    return Math.round(h * 100) / 100;
  }
  window.ATLAS_PAY = { holidays, holiday, business, settle, scheduled, paydays, perMonth, threePayMonths, ytd, stubCheck, ptoOn, addDays, diffDays, PER_YEAR };
})();
