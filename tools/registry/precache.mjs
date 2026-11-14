#!/usr/bin/env node
/* Build the service-worker precache from pillars.json and each local pillar's index.html.
   sync.mjs writes sw-precache.js. validate.mjs and `node tools/registry/precache.mjs --check`
   fail when that file is stale or an HTML reference is missing. Titan and Midas are never listed. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
export const PRECACHE_FILE = "sw-precache.js";

const ASSET_EXT = /\.(?:js|mjs|css|json|webmanifest|woff2|png|svg|html)$/i;
const BLOCK_SEG = new Set(["titan", "midas", "fleet"]);
const SKIP_PREFIX = ["proofs/", "tools/", "artifacts/", "collaborators/", ".github/", "node_modules/", ".git/"];

function blocked(rel) {
  const norm = String(rel || "").replace(/^\.\//, "");
  if (!norm || norm === "." || norm === "./") return true;
  if (norm === "sw.js" || norm === PRECACHE_FILE) return true;
  if (SKIP_PREFIX.some((p) => norm.startsWith(p))) return true;
  if (norm.includes("titan-reliquary") || norm.includes("midas-ledger")) return true;
  return norm.split("/").some((part) => BLOCK_SEG.has(part));
}

function resolveFrom(fromFile, spec) {
  const clean = String(spec || "").split("#")[0].split("?")[0].trim();
  if (!clean || /^[a-z][a-z0-9+.-]*:/i.test(clean) || clean.startsWith("//") || clean.startsWith("/")) return null;
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean));
  if (!joined || joined === "." || joined.startsWith("..") || joined.startsWith("/")) return null;
  return joined;
}

function htmlRefs(html) {
  const refs = [];
  const tagRe = /<(script|link)\b([^>]*)>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    const kind = m[1].toLowerCase();
    const attrs = m[2];
    const attr = (name) => {
      const hit = new RegExp("\\b" + name + "\\s*=\\s*[\"']([^\"']+)[\"']", "i").exec(attrs);
      return hit ? hit[1] : "";
    };
    if (kind === "script") {
      const src = attr("src");
      if (src) refs.push(src);
    } else {
      const rel = attr("rel").toLowerCase().split(/\s+/);
      const href = attr("href");
      if (!href) continue;
      if (rel.some((r) => r === "stylesheet" || r === "modulepreload" || r === "preload" || r === "icon" || r === "manifest" || r === "apple-touch-icon")) refs.push(href);
    }
  }
  return refs;
}

function specs(src, re) {
  const out = [];
  re.lastIndex = 0;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

const FROM_RE = /\bfrom\s*["']([^"']+)["']/g;
const DYN_RE = /\bimport\s*\(\s*["']([^"']+)["']/g;
const SIDE_RE = /\bimport\s*["']([^"']+)["']/g;
const FETCH_RE = /\bfetch\(\s*["']([^"']+)["']/g;
const URL_RE = /\burl\(\s*["']?([^"')]+)["']?\s*\)/g;
const LIT_RE = /["']([^"'\n]{1,180})["']/g;

function looksLikeAsset(spec) {
  if (!spec || spec.length > 180 || /\s/.test(spec) || spec.includes("${") || spec.includes("://") || spec.startsWith("//") || spec.startsWith("/")) return false;
  if (!ASSET_EXT.test(spec)) return false;
  return spec.startsWith(".") || spec.includes("/");
}

export function buildPrecache(rootDir = DEFAULT_ROOT) {
  const errors = [];
  const reg = JSON.parse(fs.readFileSync(path.join(rootDir, "pillars.json"), "utf8"));
  const local = (reg.pillars || []).filter((p) => p && p.state === "live" && p.hostingType === "local" && p.route && !/^https?:/i.test(p.route));
  const seen = new Set(["./", "index.html", "manifest.webmanifest", "pillars.json"]);
  const urls = ["./", "index.html", "manifest.webmanifest", "pillars.json"];
  let bucket = null;

  const isFile = (rel) => {
    try { return fs.statSync(path.join(rootDir, rel)).isFile(); } catch { return false; }
  };

  function include(rel, pageDir) {
    if (!rel || seen.has(rel) || blocked(rel) || !isFile(rel)) return;
    seen.add(rel);
    (bucket || urls).push(rel);
    const ext = path.posix.extname(rel).toLowerCase();
    if (ext === ".js" || ext === ".mjs") walkJs(rel, pageDir);
    else if (ext === ".css") walkCss(rel);
    else if (ext === ".webmanifest") walkManifest(rel);
  }

  function addExisting(fromFile, spec, pageDir) {
    const pageFile = pageDir ? path.posix.join(pageDir, "index.html") : "index.html";
    const fileRel = resolveFrom(fromFile, spec);
    const pageRel = resolveFrom(pageFile, spec);
    const ordered = String(spec).startsWith(".") ? [fileRel, pageRel] : [pageRel, fileRel];
    for (const rel of ordered) {
      if (!rel || blocked(rel) || !ASSET_EXT.test(rel) || !isFile(rel)) continue;
      include(rel, pageDir);
      return;
    }
  }

  function walkJs(rel, pageDir) {
    let src;
    try { src = fs.readFileSync(path.join(rootDir, rel), "utf8"); } catch { return; }
    for (const spec of specs(src, FROM_RE)) addExisting(rel, spec, pageDir);
    for (const spec of specs(src, DYN_RE)) addExisting(rel, spec, pageDir);
    for (const spec of specs(src, SIDE_RE)) addExisting(rel, spec, pageDir);
    for (const spec of specs(src, FETCH_RE)) addExisting(rel, spec, pageDir);
    for (const spec of specs(src, LIT_RE)) if (looksLikeAsset(spec)) addExisting(rel, spec, pageDir);
  }

  function walkCss(rel) {
    let src;
    try { src = fs.readFileSync(path.join(rootDir, rel), "utf8"); } catch { return; }
    for (const spec of specs(src, URL_RE)) {
      const next = resolveFrom(rel, spec);
      if (next && ASSET_EXT.test(next)) include(next, path.posix.dirname(rel) === "." ? "" : path.posix.dirname(rel));
    }
  }

  function walkManifest(rel) {
    let json;
    try { json = JSON.parse(fs.readFileSync(path.join(rootDir, rel), "utf8")); } catch { return; }
    const icons = [...(json.icons || [])];
    for (const sc of json.shortcuts || []) icons.push(...(sc.icons || []));
    const pageDir = path.posix.dirname(rel) === "." ? "" : path.posix.dirname(rel);
    for (const icon of icons) if (icon && icon.src) {
      const next = resolveFrom(rel, icon.src);
      if (next) include(next, pageDir);
    }
  }

  function addHtml(htmlRel, pageDir) {
    let html;
    try { html = fs.readFileSync(path.join(rootDir, htmlRel), "utf8"); }
    catch { errors.push(`missing HTML '${htmlRel}'`); return; }
    for (const spec of htmlRefs(html)) {
      const resolved = resolveFrom(htmlRel, spec);
      if (!resolved || blocked(resolved) || !ASSET_EXT.test(resolved)) continue;
      if (!isFile(resolved)) { errors.push(`${htmlRel} references missing '${resolved}'`); continue; }
      include(resolved, pageDir);
    }
  }

  function withGroup(fn) {
    const group = [];
    const prev = bucket;
    bucket = group;
    fn();
    bucket = prev;
    group.sort();
    for (const rel of group) if (!urls.includes(rel)) urls.push(rel);
  }

  withGroup(() => {
    addHtml("index.html", "");
    if (isFile("manifest.webmanifest")) walkManifest("manifest.webmanifest");
  });

  for (const pillar of local) {
    const route = String(pillar.route).replace(/^\.\//, "");
    const dir = route.endsWith("/") ? route : route + "/";
    const indexRel = dir + "index.html";
    const pageDir = dir.replace(/\/$/, "");
    if (!seen.has(dir)) { seen.add(dir); urls.push(dir); }
    withGroup(() => {
      if (!isFile(indexRel)) { errors.push(`${pillar.id}: missing '${indexRel}'`); return; }
      if (!seen.has(indexRel)) { seen.add(indexRel); bucket.push(indexRel); }
      addHtml(indexRel, pageDir);
      if (pillar.manifestPath) {
        const man = String(pillar.manifestPath).replace(/^\.\//, "");
        if (blocked(man)) errors.push(`${pillar.id}: manifest '${man}' is outside the local shell`);
        else if (!isFile(man)) errors.push(`${pillar.id}: missing manifest '${man}'`);
        else include(man, pageDir);
      }
    });
  }

  return { urls, errors, local: local.length };
}

export function renderPrecache(urls) {
  const lines = urls.map((u) => {
    const rel = u === "./" ? "./" : "./" + String(u).replace(/^\.\//, "");
    return "  " + JSON.stringify(rel);
  });
  return `/* Generated by tools/registry/sync.mjs. Do not edit.\n   ${urls.length} urls. Regenerate: node tools/registry/precache.mjs\n   A stale file fails node tools/registry/precache.mjs --check and node tools/registry/validate.mjs. */\nself.PRECACHE = [\n${lines.join(",\n")},\n];\n`;
}

export function checkPrecache(rootDir = DEFAULT_ROOT, actualText) {
  const built = buildPrecache(rootDir);
  const errors = built.errors.slice();
  const expected = renderPrecache(built.urls);
  let actual = actualText;
  const file = path.join(rootDir, PRECACHE_FILE);
  if (actual == null) {
    if (!fs.existsSync(file)) errors.push(`${PRECACHE_FILE} is missing. Regenerate with node tools/registry/precache.mjs`);
    else actual = fs.readFileSync(file, "utf8");
  }
  if (actual != null && actual !== expected) errors.push(`${PRECACHE_FILE} is stale. Regenerate with node tools/registry/precache.mjs`);
  return { ok: errors.length === 0, errors, count: built.urls.length, urls: built.urls, local: built.local };
}

export function writePrecache(rootDir = DEFAULT_ROOT) {
  const built = buildPrecache(rootDir);
  const file = path.join(rootDir, PRECACHE_FILE);
  fs.writeFileSync(file, renderPrecache(built.urls), "utf8");
  return { file, count: built.urls.length, errors: built.errors, local: built.local };
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const root = process.cwd();
  if (process.argv.includes("--check")) {
    const res = checkPrecache(root);
    if (res.ok) {
      console.log("PRECACHE_OK", JSON.stringify({ count: res.count, local: res.local }));
      process.exit(0);
    }
    console.error("PRECACHE_STALE", res.errors.join("\n"));
    process.exit(1);
  }
  const wrote = writePrecache(root);
  console.log("PRECACHE_WROTE", JSON.stringify({ file: PRECACHE_FILE, count: wrote.count, local: wrote.local }));
  if (wrote.errors.length) {
    console.error(wrote.errors.join("\n"));
    process.exit(1);
  }
}
