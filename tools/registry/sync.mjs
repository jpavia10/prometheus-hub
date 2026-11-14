#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { writePrecache } from "./precache.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

const DOMAIN = {
  money: "finance", midas: "finance", titan: "finance", selling: "finance", icarus: "finance",
  hearth: "homestead", garage: "homestead", bastion: "homestead", aether: "homestead", odyssey: "homestead", records: "homestead", argus: "homestead", kin: "homestead",
  kairos: "mind", apollo: "mind", athenaeum: "mind", piano: "mind", mythos: "mind", foundry: "mind", forge: "mind", observatory: "mind", games: "mind", presence: "mind",
  polis: "civic", privacy: "civic", continuity: "civic", hermes: "civic",
};

const PROTECT = {
  titan: "locked_link_only",
  midas: "link_only",
  presence: "presence_only",
  icarus: "journal_only",
  continuity: "ram_crypto_only",
  hermes: "private_local",
  privacy: "private_local",
  kin: "private_local",
  money: "sample_local",
  fleet: "paused",
};

const DEPS = {
  aether: ["bastion", "hearth"],
  argus: ["hearth", "titan"],
  bastion: ["aether", "odyssey", "continuity"],
  continuity: ["privacy", "bastion"],
  forge: ["foundry"],
  foundry: ["athenaeum", "forge"],
  garage: ["records", "odyssey", "money"],
  hearth: ["argus", "records", "aether"],
  hermes: ["privacy", "polis"],
  icarus: ["observatory"],
  kairos: ["kin", "apollo", "odyssey", "garage"],
  kin: ["kairos", "records", "odyssey"],
  money: ["selling", "garage"],
  mythos: ["piano", "presence"],
  observatory: ["athenaeum", "icarus"],
  odyssey: ["bastion", "garage", "kairos", "kin"],
  piano: ["mythos", "games"],
  polis: ["hermes", "privacy"],
  presence: ["mythos"],
  privacy: ["hermes", "continuity", "polis"],
  records: ["garage", "hearth", "kin"],
  selling: ["money"],
};

const regPath = path.join(ROOT, "pillars.json");
const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));
const deckSrc = fs.readFileSync(path.join(ROOT, "deck/pillars.js"), "utf8");
const re = /P\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*"([^"]+)"(?:\s*,\s*\{([^}]*)\})?\s*\)/g;
const deck = [];
for (let m; (m = re.exec(deckSrc)) !== null;) {
  deck.push({
    id: m[1], name: m[2], short: m[3], what: m[4], route: m[5],
    hue: Number(m[6]), icon: m[7], ext: /\bext\s*:\s*true\b/.test(m[8] || ""),
  });
}

const oldById = new Map((reg.pillars || []).map((p) => [p.id, p]));
const capById = new Map((reg.capabilities || []).map((c) => [c.id, c]));

reg.ais = (reg.ais || []).filter((a) => !["argon", "hydrogen"].includes(a.id));
reg.ais.push(
  { id: "argon", name: "Argon", also: "Orchestrator", role: "planner_reviewer", drive_folder: "Argon" },
  { id: "hydrogen", name: "Hydrogen", also: "Executor", role: "implementer_verifier", drive_folder: "Hydrogen" }
);

const newPillars = [];
const oldHub = oldById.get("hub") || {};
newPillars.push({
  ...oldHub,
  id: "hub",
  name: oldHub.name || "Prometheus Hub",
  shortName: "Hub",
  what: oldHub.what || "The desk: every pillar opens from here.",
  route: "./",
  category: "core",
  state: "live",
  hostingType: "desk",
  dataOwner: "hub",
  manifestPath: null,
  visualIdentity: { hue: 210, icon: "core", look: "prometheus" },
  signatureComponent: "deck/views/orrery.js",
  searchEnabled: true,
  eventPublishingEnabled: true,
  protectionLevel: "standard",
  dependencies: [],
});

for (const d of deck) {
  const prev = oldById.get(d.id) || {};
  const cap = capById.get(d.id) || {};
  const dir = d.route.replace(/\/$/, "");
  const manifestPath = d.ext ? null : `${dir}/pillar.json`;
  const man = manifestPath ? JSON.parse(fs.readFileSync(path.join(ROOT, manifestPath), "utf8")) : null;
  const sigComp = d.ext ? null : (d.id === "athenaeum" ? "pillars/athenaeum/js/sky.js" : `${dir}/stage.js`);
  const dataOwner = cap.dataOwner || ({
    kairos: "time", apollo: "body", hermes: "mail", icarus: "trading", argus: "photos", hearth: "house",
  }[d.id] || d.id);

  const entry = {
    ...prev,
    id: d.id,
    name: d.name,
    shortName: d.short,
    what: d.what,
    repo: prev.repo != null ? prev.repo : (d.ext ? `jpavia10/${d.id}` : ""),
    home: d.ext ? "" : (prev.home || dir),
    route: d.route,
    live: prev.live || (d.ext ? d.route : `https://jpavia10.github.io/prometheus-hub/${d.route}`),
    category: DOMAIN[d.id] || "mind",
    state: "live",
    look: d.id === "titan" ? "titan (own themes, the exception)" : "prometheus",
    hostingType: d.ext ? "external" : "local",
    dataOwner,
    manifestPath,
    visualIdentity: { hue: d.hue, icon: d.icon, look: d.id === "titan" ? "titan" : "prometheus" },
    signatureComponent: sigComp,
    searchEnabled: !!(man && Array.isArray(man.search) && man.search.length > 0),
    eventPublishingEnabled: !!(man && Array.isArray(man.publishes) && man.publishes.length > 0),
    protectionLevel: PROTECT[d.id] || "standard",
    dependencies: DEPS[d.id] || [],
  };
  if (PROTECT[d.id] === "private_local" || PROTECT[d.id] === "ram_crypto_only" || prev.private) entry.private = true;
  newPillars.push(entry);
}

const oldFleet = oldById.get("fleet") || {};
newPillars.push({
  ...oldFleet,
  id: "fleet",
  name: oldFleet.name || "Fleet Command",
  shortName: "Fleet",
  what: oldFleet.what || "Paused fleet dashboard. No AI reports to it.",
  repo: oldFleet.repo || "jpavia10/fleet-command",
  home: "",
  route: oldFleet.live || "https://jpavia10.github.io/fleet-command/",
  live: oldFleet.live || "https://jpavia10.github.io/fleet-command/",
  category: "civic",
  state: "paused",
  look: "",
  paused: true,
  hostingType: "external",
  dataOwner: "fleet",
  manifestPath: null,
  visualIdentity: { hue: 215, icon: "compass", look: "paused" },
  signatureComponent: null,
  searchEnabled: false,
  eventPublishingEnabled: false,
  protectionLevel: "paused",
  dependencies: [],
});

if (!reg.capabilities.some((c) => c.id === "games")) {
  const insertAt = reg.capabilities.findIndex((c) => c.id === "forge");
  const gamesCap = {
    id: "games",
    name: "Ludus Arcade",
    kind: "capability",
    what: "Games: the library in your own words, and the next session.",
    route: "pillars/games/",
    state: "live",
    dataOwner: "games",
  };
  if (insertAt >= 0) reg.capabilities.splice(insertAt, 0, gamesCap);
  else reg.capabilities.push(gamesCap);
}

reg.schemaVersion = 4;
reg.updated = "2026-11-13";
reg.about = "Canonical Prometheus Hub registry (schema v4, validated by tools/registry/validate.mjs): hub desk + 25 active local pillars + 2 external protected pillars (titan, midas) + paused fleet.";
reg.pillars = newPillars;
fs.writeFileSync(regPath, JSON.stringify(reg, null, 1) + "\n", "utf8");
console.log("SYNCED pillars.json entries=" + newPillars.length);
const precache = writePrecache(ROOT);
console.log("SYNCED precache count=" + precache.count + (precache.errors.length ? " ERRORS " + precache.errors.join("; ") : ""));
