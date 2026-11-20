#!/usr/bin/env node
/* Fails when a shipped file carries a dollar amount, an APR, a card- or account-like number,
   or an email address, unless that file is on the reference allow-list below.
   Shipped means the static site: deck/, kit/, pillars/, and the root shell.
   Reference datasets (issuer tables, worked cases, the Icarus sample, Apollo foods, fee
   schedules, lure corpora, the public presence card) are listed on purpose. A view is not. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

/* Private words (2026-11-20, owner): a home street name reached three public pillars through an AI drop and was erased from
   git history. The guard keeps only the SHA-256 of each lower-case word, so the guard itself publishes nothing, and it scans
   every text file in the repository (docs and collaborators too), allow-list or not. */
export const PRIVATE_SHA256 = new Set([
  "1542bcf466dd3989343d451e220f528e7d74a68c201d913dea38c596a23334bf",
]);
const sha = (w) => createHash("sha256").update(w).digest("hex");
export function privateWords(text) {
  const hits = new Set();
  for (const w of String(text).toLowerCase().match(/[a-z]{4,}/g) || []) if (PRIVATE_SHA256.has(sha(w))) hits.add(w.length);
  return hits.size;
}

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
  ["pillars/money/real.js", "Joseph's real consolidation book, public on the pillar at his direction 2026-11-14 (privacy revoked for the hub; the deck passcode gate is his chosen mitigation) — same policy as the narrowed private-loan unit test"],
  ["pillars/money/flex.js", "Citi Flex Plan published rules reference (MID-GEM-09, Gemini 20261116 drop, corrected at integration) — same class as issuers.js/offers.js reference data"],
  ["pillars/kairos/fixed-dates.js", "statutory deadline reference (KAI-GEM-10): Kern County / DMV penalty schedules carry fixed statutory costs ($10 installment cost, $15 redemption fee) — public fee schedules, not account data"],
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
  ["pillars/hermes/research/", "public vendor quotas and prices (second-reader checks)"],
  ["pillars/hearth/research/", "public scan-app prices (second-reader checks)"],
  ["pillars/games/gta6-facts.js", "GTA VI facts (2026-11-19): public store list prices quoted from the PlayStation and Xbox stores, not personal money"],
  ["pillars/records/tax-forms-2026.js", "Tax-form reference (2026-11-19): IRS and FTB thresholds quoted from the form instructions, not personal money"],
  ["pillars/odyssey/photos.js", "Odyssey trip photos (2026-11-19): the ids are camera timestamps (YYYYMMDDhhmmss), not card numbers"],
  ["pillars/polis/kern-rules.js", "Kern County ordinance reference (POL-GEM-04, 2026-11-19): statutory stop-work fines quoted from the county code, not money of Joseph's"],
  ["pillars/hearth/permits.js", "building-code reference (HEA-GEM-17): CRC R315's $1,000-of-work threshold for CO alarms"],
  ["pillars/continuity/legacy-policies.js", "provider legacy-policy reference (CON-GEM-03): a help-centre URL's article id matches the card pattern; no account numbers"],
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

/* Every text file in the repository, for the private-word list (not the money patterns). */
export function scanPrivate(root = ROOT) {
  const hits = [];
  (function walkAll(dir) {
    for (const name of readdirSync(dir)) {
      if (name === ".git" || name === "node_modules") continue;
      const p = path.join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) walkAll(p);
      else if (TEXT.has(path.extname(name).toLowerCase()) || /\.(py|yml|yaml|csv|tsv|jsonl)$/i.test(name)) {
        let text = "";
        try { text = readFileSync(p, "utf8"); } catch (e) { continue; }
        text.split(/\n/).forEach((line, i) => { if (privateWords(line)) hits.push({ file: relPosix(p), line: i + 1, kind: "private", text: "(a private word; the guard does not print it)" }); });
      }
    }
  })(root);
  return hits;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const hits = [...scanTree(), ...scanPrivate()];
  if (!hits.length) {
    console.log("GUARD_OK");
    process.exit(0);
  }
  for (const h of hits) console.error(`${h.file}:${h.line}: ${h.kind}: ${h.text}`);
  console.error(`GUARD_FAIL ${hits.length}`);
  process.exit(1);
}
