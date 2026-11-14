/* The public hub must not ship the owner's loan quote. Fails if those figures appear in the
   files the home and Money pages serve. A bare 20000 is the principal; 1200000 (the interest divisor) does not count. */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const ROOTS = ["deck", "kit", "pillars/money"];
const NEEDLES = ["952.19", "941.47", "11.99", "20,000", "$20k"];

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
}

test("deck, kit, and Money do not ship the private loan quote", () => {
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
