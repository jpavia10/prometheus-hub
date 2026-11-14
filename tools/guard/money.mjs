#!/usr/bin/env node
/* Fails when a shipped file carries a dollar amount, an APR, a card- or account-like number,
   or an email address, unless that file is on the reference allow-list below.
   Shipped means the static site: deck/, kit/, pillars/, and the root shell.
   Reference datasets (issuer tables, worked cases, the Icarus sample, Apollo foods, fee
   schedules, lure corpora, the public presence card) are listed on purpose. A view is not. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const SKIP = new Set([".git", "node_modules", "proofs", "docs", "artifacts", ".github", "tools", "collaborators"]);
const TEXT = new Set([".js", ".mjs", ".html", ".json", ".css", ".webmanifest", ".svg", ".md", ".txt"]);

/** path prefix (posix, relative) and why it may contain the patterns. */
export const ALLOW = [
  ["deck/data/issuers.json", "issuer minimum-payment reference"],
  ["deck/data/offers.json", "published promo terms"],
  ["deck/data/payoff-cases.json", "worked payoff cases"],
  ["deck/data/money-words.js", "payoff copy templates"],
  ["deck/data/demo.js", "invented demo deck, not an account"],
  ["pillars/money/offers.js", "offer reference"],
  ["pillars/money/issuers.js", "issuer reference"],
  ["pillars/money/cases.js", "worked cases"],
  ["pillars/money/engine.js", "amortization engine over those cases"],
  ["pillars/money/app.js", "simulator chrome only: windfall chips and the empty-trap line"],
  ["pillars/icarus/", "sample journal, rule formulas, and market-day reference"],
  ["pillars/apollo/foods.js", "food reference"],
  ["pillars/apollo/lookup.js", "nutrition lookup reference"],
  ["pillars/apollo/exercises.js", "exercise reference"],
  ["pillars/apollo/data/", "food and exercise reference"],
  ["pillars/selling/", "published marketplace fee schedule"],
  ["pillars/hermes/lures.js", "phishing-lure reference"],
  ["pillars/hermes/phishing-lures.js", "phishing-lure reference"],
  ["pillars/hermes/operators.js", "mail-search examples"],
  ["pillars/hermes/docs/", "queue examples"],
  ["pillars/athenaeum/history-seed.js", "world-history shelf, including historical prices"],
  ["pillars/athenaeum/data/", "chronicle reference"],
  ["pillars/bastion/data/", "public-agency contacts in the readiness reference"],
  ["pillars/sylade/", "public presence address, not a private inbox"],
];

const ALLOW_EMAIL = new Set([
  "sylade.ais@gmail.com", // public presence address
  "paypal-support@gmail.com", // Hermes lookalike example, not a contact
]);

/* $952.19, $1,000, $20. A lone $0 or $1 (a regex backreference) is not an amount. */
const DOLLAR = /\$\s*(?:\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+\.\d{2}|\d{2,})(?!\d)/;
/* 11.99%, apr: 11.99, "apr": 11.99. The month abbreviation apr: 4 does not match. */
const APR = /\b\d{1,2}\.\d{2}\s*%|\bapr\s*[:=]\s*\d+\.\d+|"apr"\s*:\s*\d+|\bAPR\b[^%\n]{0,24}\d+(?:\.\d+)?/;
const CARD = /\b(?:\d{4}[- ]?){3}\d{4,7}\b|\b\d{13,19}\b/;
const ACCOUNT = /\b(?:account|acct|card)\s*(?:number|no\.?|#)?\s*[:#]?\s*\d{6,}\b/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function relPosix(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

export function allowed(rel) {
  return ALLOW.some(([prefix]) => rel === prefix || rel.startsWith(prefix));
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (dir === ROOT && SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (TEXT.has(path.extname(name).toLowerCase())) {
      const rel = relPosix(p);
      if (rel.endsWith(".md") || rel.endsWith(".txt")) {
        if (!rel.startsWith("pillars/")) continue;
      }
      out.push(p);
    }
  }
}

function emails(line) {
  const hits = [];
  for (const m of line.matchAll(EMAIL)) {
    const addr = m[0];
    if (ALLOW_EMAIL.has(addr.toLowerCase())) continue;
    if (/@example\.com$/i.test(addr)) continue;
    hits.push(addr);
  }
  return hits;
}

export function scanFile(rel, text) {
  if (allowed(rel)) return [];
  const hits = [];
  const lines = text.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const found = [];
    if (DOLLAR.test(line)) found.push("dollar");
    if (APR.test(line)) found.push("apr");
    if (CARD.test(line)) found.push("card");
    if (ACCOUNT.test(line)) found.push("account");
    if (emails(line).length) found.push("email");
    if (found.length) hits.push({ file: rel, line: i + 1, kind: found.join("+"), text: line.trim().slice(0, 160) });
  }
  return hits;
}

export function scanTree(root = ROOT) {
  const files = [];
  walk(root, files);
  const hits = [];
  for (const file of files) {
    let text = "";
    try { text = readFileSync(file, "utf8"); } catch (e) { continue; }
    hits.push(...scanFile(relPosix(file), text));
  }
  return hits;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const hits = scanTree();
  if (!hits.length) {
    console.log("GUARD_OK");
    process.exit(0);
  }
  for (const h of hits) console.error(`${h.file}:${h.line}: ${h.kind}: ${h.text}`);
  console.error(`GUARD_FAIL ${hits.length}`);
  process.exit(1);
}
