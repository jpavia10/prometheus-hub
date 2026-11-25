/* Aegis arithmetic (Claude, 2026-11-25). Pure functions so the unit test can check them: window.AEGIS_COVER.
   A premium is billed every month, quarter, half year or year; a policy runs a term (6 or 12 months) and renews on the same day each
   term. Coverage is checked against what the other pillars know: Hearth's contents worth against the home or renters policy's
   personal-property limit, the largest deductible against the cash Midas keeps as its floor. */
(function () {
  "use strict";
  const PER_YEAR = { month: 12, quarter: 4, half: 2, year: 1 };
  const num = (v) => (v === "" || v == null || !Number.isFinite(+v) ? null : +v);
  const isDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const pad = (n) => String(n).padStart(2, "0");
  const utc = (s) => { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const diffDays = (a, b) => Math.round((utc(b) - utc(a)) / 864e5);
  /** A date moved by whole months, the day kept (or the month's last day when it has fewer). */
  function addMonths(s, n) {
    let [y, m, d] = s.split("-").map(Number); m += n; y += Math.floor((m - 1) / 12); m = ((m - 1) % 12 + 12) % 12 + 1;
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate(); return `${y}-${pad(m)}-${pad(Math.min(d, last))}`;
  }
  /** What a policy costs a year and a month. */
  function cost(p) {
    const prem = num(p && p.premium), k = PER_YEAR[(p && p.every) || "year"] || 1;
    if (prem == null) return { year: null, month: null };
    const year = Math.round(prem * k * 100) / 100; return { year, month: Math.round(year / 12 * 100) / 100 };
  }
  /** The next renewal on or after `today`: the stored renewal date rolled forward a term at a time. */
  function nextRenewal(p, today) {
    if (!p || !isDay(p.renews) || !isDay(today)) return null;
    const term = +p.term === 6 ? 6 : 12; let d = p.renews, n = 0;
    while (d < today && n < 60) { d = addMonths(d, term); n++; }
    return { date: d, days: diffDays(today, d), term, rolled: n };
  }
  const HOME = ["home", "renters", "condo"];
  /** Everything at once: totals, the next renewal, the contents check and the deductible check. */
  function review(policies, { today, hearth = null, midas = null, claims = [] } = {}) {
    const list = (policies || []).map((p) => ({ p, c: cost(p), r: nextRenewal(p, today) }));
    const month = Math.round(list.reduce((s, x) => s + (x.c.month || 0), 0) * 100) / 100, year = Math.round(list.reduce((s, x) => s + (x.c.year || 0), 0) * 100) / 100;
    const soon = list.filter((x) => x.r).sort((a, b) => a.r.date.localeCompare(b.r.date));
    const home = list.find((x) => HOME.includes(x.p.kind));
    const limit = home ? num(home.p.contents) : null, worth = hearth && num(hearth.contentsValue) != null ? num(hearth.contentsValue) : null;
    const contents = { policy: home ? home.p : null, limit, worth, ratio: limit && worth != null ? worth / limit : null, gap: limit != null && worth != null && worth > limit ? Math.round((worth - limit) * 100) / 100 : 0 };
    const deds = list.map((x) => ({ p: x.p, d: num(x.p.deductible) })).filter((x) => x.d != null).sort((a, b) => b.d - a.d);
    const floor = midas && num(midas.floor) != null ? num(midas.floor) : null;
    const deductible = { max: deds[0] ? deds[0].d : null, policy: deds[0] ? deds[0].p : null, floor, short: deds[0] && floor != null && deds[0].d > floor ? Math.round((deds[0].d - floor) * 100) / 100 : 0 };
    const open = (claims || []).filter((c) => c.status === "open" || c.status === "filed");
    return { list, month, year, next: soon[0] || null, soon, contents, deductible, openClaims: open.length };
  }
  /** Warranties the other pillars hold: Hearth's items with an end date and Records' warranty papers, soonest first. */
  function warranties(assets, docs, today) {
    const out = [];
    for (const a of assets || []) if (isDay(a.warranty)) out.push({ name: a.name, end: a.warranty, from: "Hearth", room: a.room || "", days: diffDays(today, a.warranty) });
    for (const d of docs || []) if (d.category === "warranty" && isDay(d.due)) out.push({ name: d.title, end: d.due, from: "Records", room: "", days: diffDays(today, d.due) });
    return out.sort((a, b) => a.end.localeCompare(b.end));
  }
  window.AEGIS_COVER = { PER_YEAR, cost, nextRenewal, review, warranties, addMonths, diffDays };
})();
