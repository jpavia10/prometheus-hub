#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { checkPrecache } from "./precache.mjs";

const DEFAULT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

function parseDeckPillars(src) {
  const out = [];
  const re = /P\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*"([^"]+)"(?:\s*,\s*\{([^}]*)\})?\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      id: m[1],
      name: m[2],
      short: m[3],
      what: m[4],
      route: m[5],
      hue: Number(m[6]),
      icon: m[7],
      ext: /\bext\s*:\s*true\b/.test(m[8] || ""),
    });
  }
  return out;
}

function parseReachManifests(src) {
  const m = src.match(/export\s+const\s+MANIFESTS\s*=\s*\[([\s\S]*?)\];/);
  if (!m) return [];
  return Array.from(m[1].matchAll(/"([^"]+)"/g), (x) => x[1]);
}

function parseKitIcons(src) {
  const m = src.match(/var\s+ICON\s*=\s*\{([\s\S]*?)\};/);
  if (!m) return new Set();
  const keys = new Set();
  for (const km of m[1].matchAll(/([a-zA-Z0-9_]+)\s*:\s*"[^"]+"/g)) keys.add(km[1]);
  return keys;
}

export function validateRegistry({ rootDir = DEFAULT_ROOT, precacheText } = {}) {
  const errors = [];
  const readText = (rel) => fs.readFileSync(path.join(rootDir, rel), "utf8");
  const exists = (rel) => fs.existsSync(path.join(rootDir, rel));

  let reg;
  try {
    reg = JSON.parse(readText("pillars.json"));
  } catch (e) {
    return { ok: false, errors: [`pillars.json invalid JSON: ${e.message}`], stats: null };
  }

  if (!Array.isArray(reg.pillars)) errors.push("pillars.json: missing top-level pillars array");
  if (!Array.isArray(reg.capabilities)) errors.push("pillars.json: missing capabilities array");
  if (!Array.isArray(reg.external)) errors.push("pillars.json: missing external array");
  if (!Array.isArray(reg.ais)) errors.push("pillars.json: missing ais array");
  if ((reg.schemaVersion || 0) < 4) errors.push(`pillars.json: expected schemaVersion >= 4, got ${reg.schemaVersion}`);

  const aiIds = new Set((reg.ais || []).map((a) => a.id));
  for (const reqAi of ["grok", "gemini", "muse", "chatgpt", "argon", "hydrogen"]) {
    if (!aiIds.has(reqAi)) errors.push(`pillars.json: ais missing '${reqAi}'`);
  }

  const seenIds = new Set();
  const seenRoutes = new Set();
  const byId = new Map();

  for (const p of reg.pillars || []) {
    if (!p.id) { errors.push("pillars.json: entry missing id"); continue; }
    if (seenIds.has(p.id)) errors.push(`pillars.json: duplicate pillar id '${p.id}'`);
    seenIds.add(p.id);
    byId.set(p.id, p);

    for (const req of ["name", "shortName", "what", "state", "hostingType", "dataOwner", "protectionLevel"]) {
      if (p[req] == null || p[req] === "") errors.push(`pillars.json[${p.id}]: missing field '${req}'`);
    }
    if (p.state === "live" && p.hostingType !== "desk") {
      if (!p.route) errors.push(`pillars.json[${p.id}]: live destination missing route`);
      if (p.route && seenRoutes.has(p.route)) errors.push(`pillars.json[${p.id}]: duplicate route '${p.route}'`);
      if (p.route) seenRoutes.add(p.route);
    }
  }

  const fleet = byId.get("fleet");
  if (!fleet || fleet.state !== "paused" || fleet.protectionLevel !== "paused") {
    errors.push("pillars.json[fleet]: must have state='paused' and protectionLevel='paused'");
  }

  const active = (reg.pillars || []).filter((p) => p.state === "live" && p.hostingType !== "desk");
  const localActive = active.filter((p) => p.hostingType === "local");
  const extActive = active.filter((p) => p.hostingType === "external");

  if (active.length !== 27) errors.push(`Expected 27 active Hub destinations in pillars.json, found ${active.length}`);
  if (localActive.length !== 25) errors.push(`Expected 25 active local pillars in pillars.json, found ${localActive.length}`);
  if (extActive.length !== 2) errors.push(`Expected 2 active external pillars in pillars.json, found ${extActive.length}`);

  for (const extId of ["titan", "midas"]) {
    const e = byId.get(extId);
    if (!e || e.hostingType !== "external") errors.push(`Protected external pillar '${extId}' must have hostingType='external'`);
  }

  const deckPillars = parseDeckPillars(readText("deck/pillars.js"));
  const deckById = new Map(deckPillars.map((d) => [d.id, d]));
  if (deckPillars.length !== 27) errors.push(`deck/pillars.js: expected 27 PILLARS, found ${deckPillars.length}`);
  if (deckById.has("fleet")) errors.push("deck/pillars.js: paused pillar 'fleet' must NOT appear in PILLARS");

  for (const d of deckPillars) {
    const r = byId.get(d.id);
    if (!r) { errors.push(`deck/pillars.js['${d.id}']: missing from pillars.json`); continue; }
    if (r.state !== "live") errors.push(`deck/pillars.js['${d.id}']: pillar state in pillars.json is '${r.state}', expected 'live'`);
    if (d.route !== r.route) errors.push(`Route drift on '${d.id}': deck='${d.route}' vs registry='${r.route}'`);
    if (d.ext !== (r.hostingType === "external")) errors.push(`Hosting drift on '${d.id}': deck ext=${d.ext} vs registry hostingType='${r.hostingType}'`);
  }
  for (const r of active) {
    if (!deckById.has(r.id)) errors.push(`pillars.json['${r.id}']: active destination missing from deck/pillars.js`);
  }

  const manifests = parseReachManifests(readText("deck/core/reach.js"));
  const manifestSet = new Set(manifests);
  if (manifests.length !== manifestSet.size) errors.push("deck/core/reach.js: duplicate entries in MANIFESTS");

  const kitIcons = parseKitIcons(readText("kit/kit.js"));

  for (const r of extActive) {
    if (r.manifestPath && manifestSet.has(r.manifestPath)) errors.push(`External pillar '${r.id}' must not be in deck/core/reach.js MANIFESTS`);
  }

  for (const r of localActive) {
    const dirRel = r.route.replace(/\/$/, "");
    const htmlRel = `${dirRel}/index.html`;
    if (!exists(htmlRel)) errors.push(`Local pillar '${r.id}': missing HTML '${htmlRel}'`);
    else {
      const html = readText(htmlRel);
      const dm = html.match(/data-pillar="([^"]+)"/);
      if (!dm) errors.push(`Local pillar '${r.id}': '${htmlRel}' missing data-pillar attribute`);
      else if (!kitIcons.has(dm[1])) errors.push(`Local pillar '${r.id}': data-pillar='${dm[1]}' missing from kit/kit.js ICON map`);
    }

    if (!r.manifestPath || !exists(r.manifestPath)) {
      errors.push(`Local pillar '${r.id}': missing manifest file '${r.manifestPath}'`);
    } else {
      if (!manifestSet.has(r.manifestPath)) errors.push(`Local pillar '${r.id}': '${r.manifestPath}' missing from deck/core/reach.js MANIFESTS`);
      try {
        const man = JSON.parse(readText(r.manifestPath));
        if (man.manifest !== 1) errors.push(`${r.manifestPath}: manifest version must be 1`);
        if (!man.id || !man.name || !man.mission || !man.signature) errors.push(`${r.manifestPath}: missing core metadata fields`);
        if (man.route !== r.route) errors.push(`${r.manifestPath}: route '${man.route}' != '${r.route}'`);
        if (!Array.isArray(man.owns) || !Array.isArray(man.publishes) || !Array.isArray(man.search) || !Array.isArray(man.commands)) {
          errors.push(`${r.manifestPath}: owns/publishes/search/commands must be arrays`);
        }
        for (const s of man.search || []) {
          if (!s.key || !s.title || s.open == null) errors.push(`${r.manifestPath}: search entry missing key/title/open`);
        }
        for (const c of man.commands || []) {
          if (!c.id || !c.label || c.open == null) errors.push(`${r.manifestPath}: command entry missing id/label/open`);
        }
      } catch (e) {
        errors.push(`${r.manifestPath}: invalid JSON (${e.message})`);
      }
    }

    const sigPath = r.signatureComponent;
    if (!sigPath || !exists(sigPath)) errors.push(`Local pillar '${r.id}': missing signature visual '${sigPath}'`);
  }

  for (const mPath of manifests) {
    if (!localActive.some((r) => r.manifestPath === mPath)) errors.push(`deck/core/reach.js MANIFESTS has unregistered path '${mPath}'`);
  }

  const capIds = new Set((reg.capabilities || []).map((c) => c.id));
  if (!capIds.has("arrival")) errors.push("pillars.json capabilities missing 'arrival'");
  for (const r of localActive) {
    if (!capIds.has(r.id)) errors.push(`pillars.json capabilities missing active local pillar '${r.id}'`);
  }
  if ((reg.capabilities || []).length !== capIds.size) errors.push("pillars.json capabilities contains duplicate IDs");

  if (exists("index.html")) {
    try {
      const pc = checkPrecache(rootDir, precacheText);
      for (const e of pc.errors) errors.push(e);
    } catch (e) {
      errors.push(`precache check failed: ${e.message}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: {
      totalRegistryEntries: (reg.pillars || []).length,
      activeDestinations: active.length,
      localPillars: localActive.length,
      externalPillars: extActive.length,
      manifests: manifests.length,
      capabilities: (reg.capabilities || []).length,
    },
  };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const res = validateRegistry({ rootDir: process.cwd() });
  if (res.ok) {
    console.log("REGISTRY_OK", JSON.stringify(res.stats));
    process.exit(0);
  } else {
    console.error("REGISTRY_FAILED", res.errors.join("\n"));
    process.exit(1);
  }
}
