import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL("../../" + rel, import.meta.url), "utf8");
const loadWindow = (rel, name) => {
  const w = {};
  new Function("window", "globalThis", read(rel))(w, w);
  return w[name];
};
const round4 = (n) => Math.round(n * 10000) / 10000;
const fmt = (n) => round4(n).toFixed(4);

function sample(xs) {
  const n = xs.length;
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const ss = xs.reduce((a, b) => a + (b - mean) ** 2, 0);
  return { mean, std: Math.sqrt(ss / (n - 1)), pop: Math.sqrt(ss / n) };
}
function downside(xs) {
  return Math.sqrt(xs.reduce((a, b) => a + Math.min(0, b) ** 2, 0) / xs.length);
}
function ulcer(pnls, start) {
  let eq = start, peak = start;
  const dds = [];
  for (const p of pnls) {
    eq += p;
    if (eq > peak) peak = eq;
    dds.push((100 * (eq - peak)) / peak);
  }
  return Math.sqrt(dds.reduce((s, d) => s + d * d, 0) / dds.length);
}

function tradesFromQueue() {
  const q = JSON.parse(read("pillars/icarus/docs/agents/queues.json"));
  const task = q.agents.flatMap((a) => a.tasks).find((t) => t.id === "ICA-GEM-02");
  const step = task.steps.find((s) => s.startsWith("The 20 trades"));
  const bank = Number(step.match(/Bankroll at the start:\s*([\d,]+\.\d+)/)[1].replace(/,/g, ""));
  const chunk = step.slice(step.indexOf("t1 "), step.indexOf("Bankroll"));
  const trades = chunk.split(";").map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = s.match(/^(t\d+)\s+\S+\s+\S+\s+(long|short)\s+(\d+)\s+@([\d.]+)\s+exit\s+([\d.]+)\s+stop\s+[\d.]+\s+fees\s+([\d.]+)\s+kept\s+(?:yes|no)\.?$/);
    if (!m) throw new Error("unparsed trade: " + s);
    const qty = +m[3], entry = +m[4], exit = +m[5], fees = +m[6];
    const gross = (m[2] === "long" ? exit - entry : entry - exit) * qty;
    return { id: m[1], gross, net: gross - fees };
  });
  return { bank, trades };
}

test("Sharpe, Sortino and Ulcer notes match a fresh pass over the ICA-GEM-02 trades", () => {
  const { bank, trades } = tradesFromQueue();
  assert.equal(trades.length, 20);
  assert.equal(bank, 10000);
  const net = trades.map((t) => t.net);
  const gross = trades.map((t) => t.gross);
  const nStats = sample(net);
  const gStats = sample(gross);
  assert.ok(Math.abs(gStats.std - nStats.std) < 1e-9, "a flat fee leaves the sample standard deviation unchanged");
  const sharpeNet = nStats.mean / nStats.std;
  const sharpeGross = gStats.mean / gStats.std;
  const sharpePop = nStats.mean / nStats.pop;
  const sortinoNet = nStats.mean / downside(net);
  const sortinoGross = gStats.mean / downside(gross);
  const downN1 = Math.sqrt(net.reduce((a, b) => a + Math.min(0, b) ** 2, 0) / (net.length - 1));
  const losers = sample(net.filter((p) => p < 0));
  let eq = bank;
  const rets = net.map((p) => { const r = p / eq; eq += p; return r; });
  const retStats = sample(rets);
  const ulcerNet = ulcer(net, bank);
  const ulcerGross = ulcer(gross, bank);

  const metrics = loadWindow("pillars/icarus/metrics.js", "METRICS");
  assert.equal(metrics.length, 50);
  const by = Object.fromEntries(metrics.map((m) => [m.metric, m]));
  assert.equal(by["standard deviation of P/L"].value, round4(nStats.std));
  assert.equal(by["Sharpe per trade"].value, round4(sharpeNet));
  assert.equal(by["Sortino per trade"].value, round4(sortinoNet));
  assert.equal(by["ulcer index"].value, round4(ulcerNet));

  const sharpe = by["Sharpe per trade"].formula;
  assert.ok(sharpe.includes(`-0.0500 / ${fmt(nStats.std)}`), sharpe);
  assert.ok(sharpe.includes(`net Sharpe = ${fmt(sharpeNet)}`), sharpe);
  assert.ok(sharpe.includes(`population Sharpe ddof=0 = ${fmt(sharpePop)}`), sharpe);
  assert.ok(sharpe.includes(`on percentage equity returns = ${fmt(retStats.mean / retStats.pop)}`), sharpe);
  assert.ok(sharpe.includes(`0.9500 / ${fmt(gStats.std)} = ${fmt(sharpeGross)}`), sharpe);
  assert.equal(sharpe.includes("58.6519"), false);
  assert.equal(sharpe.includes("0.0162"), false);
  assert.equal(sharpe.includes("sample std = -0.0009"), false);

  const sortino = by["Sortino per trade"].formula;
  assert.ok(sortino.includes(`-0.0500 / ${fmt(downside(net))} = ${fmt(sortinoNet)}`), sortino);
  assert.ok(sortino.includes(`using N-1 denominator = ${fmt(nStats.mean / downN1)}`), sortino);
  assert.ok(sortino.includes(`using sample std of losing trades only = ${fmt(nStats.mean / losers.std)}`), sortino);
  assert.ok(sortino.includes(`0.9500 / ${fmt(downside(gross))} = ${fmt(sortinoGross)}`), sortino);
  assert.equal(sortino.includes("38.8034"), false);
  assert.equal(sortino.includes("38.0716"), false);
  assert.equal(sortino.includes("0.0250"), false);

  const ui = by["ulcer index"].formula;
  assert.ok(ui.includes(`= ${fmt(ulcerNet)} across the N=20`), ui);
  assert.ok(ui.includes(`gross of fees = ${fmt(ulcerGross)}`), ui);
  assert.equal(ui.includes("0.7429"), false);
  assert.ok(by["Martin ratio"].formula.includes(fmt(ulcerGross)), "gross ulcer agrees with the Martin ratio note");
});
