/* Atlas pay arithmetic and Aegis cover arithmetic (2026-11-25). Dates checked by hand against a calendar and the Federal Reserve's
   holiday schedule: 2027-01-01 is a Friday holiday; 2027-02-15 is Washington's Birthday (third Monday); 2027-07-04 is a Sunday, observed
   Monday the 5th; 2027-06-19 and 2027-12-25 are Saturdays and are not moved. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL("../../" + rel, import.meta.url), "utf8");
const load = (rel, name) => { const w = {}; new Function("window", "globalThis", read(rel))(w, w); return w[name]; };
const P = load("pillars/atlas/pay.js", "ATLAS_PAY");
const C = load("pillars/aegis/cover.js", "AEGIS_COVER");

test("bank holidays follow the Federal Reserve's observance", () => {
  const h = P.holidays(2027);
  assert.equal(h["2027-01-01"], "New Year's Day");
  assert.equal(h["2027-01-18"], "Martin Luther King Jr. Day");
  assert.equal(h["2027-02-15"], "Washington's Birthday");
  assert.equal(h["2027-05-31"], "Memorial Day");
  assert.equal(h["2027-07-05"], "Independence Day");              // the 4th is a Sunday
  assert.equal(h["2027-09-06"], "Labor Day");
  assert.equal(h["2027-10-11"], "Columbus Day");
  assert.equal(h["2027-11-25"], "Thanksgiving Day");
  assert.equal(h["2027-06-19"], "Juneteenth");                    // a Saturday: listed, but a Saturday pay moves anyway
  assert.equal(Object.keys(h).length, 11);
  assert.equal(P.holidays(2026)["2026-11-26"], "Thanksgiving Day");
});

test("a payday on a weekend or holiday lands the business day before (or after, when asked)", () => {
  assert.deepEqual(P.settle("2027-01-01"), { date: "2026-12-31", scheduled: "2027-01-01", moved: true, why: "New Year's Day" });
  assert.equal(P.settle("2027-01-31").date, "2027-01-29");        // Sunday -> Friday
  assert.equal(P.settle("2027-02-15").date, "2027-02-12");        // Monday holiday -> Friday
  assert.equal(P.settle("2027-02-15", false).date, "2027-02-16"); // paid after
  assert.equal(P.settle("2027-07-05").date, "2027-07-02");        // observed Monday -> Friday before
  assert.equal(P.settle("2027-03-10").moved, false);
});

test("schedules: two-week, twice a month, monthly", () => {
  const bi = { every: "biweekly", anchor: "2026-12-04", net: 2000 };
  assert.deepEqual(P.paydays(bi, "2026-12-05", 41).map((p) => p.date), ["2026-12-18", "2026-12-31", "2027-01-15"]);
  const semi = { every: "semimonthly", days: [15, "last"], net: 1800 };
  assert.deepEqual(P.paydays(semi, "2027-01-20", 40).map((p) => p.date), ["2027-01-29", "2027-02-12", "2027-02-26"]);
  assert.deepEqual(P.paydays({ every: "monthly", day: 31 }, "2027-02-01", 60).map((p) => p.date), ["2027-02-26", "2027-03-31"]);
  assert.deepEqual(P.paydays({ every: "weekly", anchor: "2027-03-05" }, "2027-03-06", 14).map((p) => p.date), ["2027-03-12", "2027-03-19"]);
  assert.equal(P.perMonth(bi), 4333.33);
  assert.equal(P.perMonth(semi), 3600);
  assert.deepEqual(P.threePayMonths(bi, "2026-12-01"), ["2026-12", "2027-07"]);
});

test("stubs and time off", () => {
  const stubs = [{ date: "2027-01-15", gross: 3000, fed: 300, state: 120, fica: 229.5, pretax: 150, net: 2200.5 }, { date: "2026-12-31", gross: 3000, net: 2200 }];
  const y = P.ytd(stubs, "2027");
  assert.deepEqual([y.n, y.gross, y.net, y.tax], [1, 3000, 2200.5, 649.5]);
  assert.equal(Math.round(y.taxRate * 1000), 217);
  const c = P.stubCheck(stubs[0], 2100);
  assert.equal(c.flag, true); assert.equal(c.unexplained, 0);
  const pay = { every: "biweekly", anchor: "2026-12-04" };
  assert.equal(P.ptoOn({ hours: 40, asof: "2026-12-05", accrue: 4 }, pay, "2027-01-16"), 52);   // Dec 18, Dec 31, Jan 15
  assert.equal(P.ptoOn({ hours: 40, asof: "2026-12-05", accrue: 4, cap: 48 }, pay, "2027-01-16"), 48);
  assert.equal(P.ptoOn({ hours: 40, asof: "2026-12-05" }, pay, "2026-12-01"), null);
});

test("Aegis: premiums, renewals rolled forward, contents and deductible checks", () => {
  const pols = [
    { id: "h", kind: "home", premium: 1440, every: "year", deductible: 2500, renews: "2026-03-15", term: 12, contents: 3000 },
    { id: "a", kind: "auto", premium: 98.5, every: "month", deductible: 500, renews: "2026-11-02", term: 6 },
    { id: "u", kind: "umbrella", premium: 90, every: "quarter", renews: "2027-01-31" },
  ];
  assert.deepEqual(C.cost(pols[2]), { year: 360, month: 30 });
  assert.equal(C.nextRenewal(pols[1], "2026-12-28").date, "2027-05-02");
  assert.equal(C.addMonths("2026-08-31", 6), "2027-02-28");
  const R = C.review(pols, { today: "2026-12-28", hearth: { contentsValue: 3600 }, midas: { floor: 2000 }, claims: [{ status: "open" }, { status: "paid" }] });
  assert.equal(R.month, 248.5); assert.equal(R.year, 2982);
  assert.equal(R.next.p.id, "u"); assert.equal(R.next.r.days, 34);
  assert.equal(R.contents.gap, 600); assert.equal(R.contents.limit, 3000);
  assert.equal(R.deductible.max, 2500); assert.equal(R.deductible.short, 500);
  assert.equal(R.openClaims, 1);
  const W = C.warranties([{ name: "Washer", warranty: "2027-02-01" }, { name: "Sofa" }], [{ title: "TV warranty", category: "warranty", due: "2027-01-10" }, { title: "Deed", category: "home", due: "2027-01-01" }], "2026-12-28");
  assert.deepEqual(W.map((w) => [w.name, w.from, w.days]), [["TV warranty", "Records", 13], ["Washer", "Hearth", 35]]);
});
