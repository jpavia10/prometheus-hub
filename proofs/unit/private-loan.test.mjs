/* The public home must not ship the owner's loan quote. Fails if those figures appear in the
   files the home serves (deck + kit). The Money pillar is exempt since 2026-11-14: Joseph lifted
   the hub privacy constraint and directed that the pillar carry his real Citi Flex Loan on his own
   device ("I dont care about privacy i can always add a passcode"), so pillars/money/real.js holds
   the figures deliberately. A bare 20000 is the principal; 1200000 (the interest divisor) does not count. */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const ROOTS = ["deck", "kit"];
const NEEDLES = ["952.19", "941.47", "11.99", "20,000", "$20k"];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
}

test("deck and kit do not ship the private loan quote", () => {
  const files = [];
  for (const rel of ROOTS) walk(path.join(ROOT, rel), files);
  const hits = [];
  for (const file of files) {
    let text = "";
    try { text = readFileSync(file, "utf8"); } catch (e) { continue; }
    const rel = path.relative(ROOT, file);
    for (const n of NEEDLES) if (text.toLowerCase().includes(n.toLowerCase())) hits.push(`${rel}: ${n}`);
    if (/(?<!\d)20000(?!\d)/.test(text)) hits.push(`${rel}: 20000`);
  }
  assert.deepEqual(hits, []);
});
