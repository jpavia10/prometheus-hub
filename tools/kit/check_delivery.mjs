#!/usr/bin/env node
/**
 * tools/kit/check_delivery.mjs
 *
 * Checks whether a Prometheus Hub homework delivery file matches its task
 * specification before it is saved.
 *
 * Usage:
 *   node tools/kit/check_delivery.mjs <file> [<task id>]
 *
 * Environment / optional flags:
 *   PROMETHEUS_ROOT=<dir> or --root <dir>  Override repository root for queue discovery.
 *
 * Zero external dependencies. Reads only the repository queues.json files and the given file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * Convert a task's deliver.file pattern into an anchored RegExp.
 * `{YYYYMMDD-HHMM}` matches 8 digits, a dash, and 4 digits.
 * If deliver.file contains trailing notes after whitespace (e.g. "foo_{YYYYMMDD-HHMM}.zip (or ...)"),
 * only the first whitespace-delimited filename token is used.
 */
export function extractFilePattern(deliverFile) {
  if (typeof deliverFile !== 'string') return '';
  return deliverFile.trim().split(/\s+/)[0] || '';
}

export function patternToRegex(pattern) {
  const token = '__TS_PLACEHOLDER__';
  const withPlaceholder = pattern.replace(/\{YYYYMMDD-HHMM\}/g, token);
  const escaped = withPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(new RegExp(token, 'g'), '\\d{8}-\\d{4}');
  return new RegExp(`^${regexStr}$`);
}

/**
 * Discover and load all tasks from:
 *   - <repoRoot>/docs/agents/queues.json
 *   - <repoRoot>/pillars/<pillar>/docs/agents/queues.json
 */
export function loadAllTasks(repoRoot = DEFAULT_REPO_ROOT) {
  const queuePaths = [];
  const rootQueue = path.join(repoRoot, 'docs', 'agents', 'queues.json');
  if (fs.existsSync(rootQueue)) {
    queuePaths.push(rootQueue);
  }

  const pillarsDir = path.join(repoRoot, 'pillars');
  if (fs.existsSync(pillarsDir) && fs.statSync(pillarsDir).isDirectory()) {
    const entries = fs.readdirSync(pillarsDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pQueue = path.join(pillarsDir, entry.name, 'docs', 'agents', 'queues.json');
      if (fs.existsSync(pQueue)) {
        queuePaths.push(pQueue);
      }
    }
  }

  const tasks = [];
  for (const qPath of queuePaths) {
    const raw = fs.readFileSync(qPath, 'utf8');
    const parsed = JSON.parse(raw);
    const pillar = parsed.pillar || 'unknown';

    if (Array.isArray(parsed.agents)) {
      for (const agent of parsed.agents) {
        if (!Array.isArray(agent.tasks)) continue;
        for (const task of agent.tasks) {
          tasks.push({
            ...task,
            _queueFile: qPath,
            _pillar: pillar,
            _agent: agent.id || agent.name || 'unknown',
          });
        }
      }
    } else if (Array.isArray(parsed.tasks)) {
      for (const task of parsed.tasks) {
        tasks.push({
          ...task,
          _queueFile: qPath,
          _pillar: pillar,
          _agent: 'unknown',
        });
      }
    }
  }
  return tasks;
}

/**
 * Validate YYYY-MM-DD calendar date.
 */
export function isValidIsoDate(val) {
  if (typeof val !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() + 1 === month &&
    dt.getUTCDate() === day
  );
}

/**
 * Validate URL per FOR-GEM-04:
 * - https protocol
 * - has a path other than '/'
 * - not a search page: no 'search' segment/param, no 'q=' or 's=' query
 */
export function validateUrl(val) {
  if (typeof val !== 'string') {
    return { ok: false, reason: 'not a string' };
  }
  let u;
  try {
    u = new URL(val);
  } catch {
    return { ok: false, reason: `invalid URL "${val}"` };
  }
  if (u.protocol !== 'https:') {
    return { ok: false, reason: `protocol must be https (got "${u.protocol}")` };
  }
  const trimmedPath = u.pathname.replace(/\/+$/, '');
  if (!trimmedPath || trimmedPath === '') {
    return { ok: false, reason: 'URL path must not be root "/"' };
  }
  if (/(?:^|[/._-])search(?:$|[/._-])/i.test(u.pathname)) {
    return { ok: false, reason: 'URL appears to be a search page (path contains "search")' };
  }
  if (
    u.searchParams.has('q') ||
    u.searchParams.has('s') ||
    u.searchParams.has('search') ||
    /(?:^|[?&])(q|s|search)=/i.test(u.search)
  ) {
    return { ok: false, reason: 'URL appears to be a search page (search/q=/s= query)' };
  }
  return { ok: true };
}

/**
 * Validate a single field value against its declared type.
 */
export function checkFieldType(val, rawType) {
  const typeStr = String(rawType || '').trim().toLowerCase();
  if (!typeStr) return { ok: true };
  /* an explicit null is how a delivery says "not stated" for a number, date, text or boolean (FEEDBACK for Gemini asks for it);
     typeof null is 'object', so it used to fail every scalar check. A URL is never null. (Gemini found it, run 7, 2026-11-24.) */
  if (val === null && !(typeStr === 'url' || typeStr.startsWith('url '))) return { ok: true };

  if (typeStr === 'integer' || typeStr === 'int') {
    if (typeof val === 'number' && Number.isInteger(val)) return { ok: true };
    return { ok: false, reason: `expected integer, got ${JSON.stringify(val)}` };
  }

  if (typeStr === 'number' || typeStr === 'float' || typeStr === 'decimal') {
    if (typeof val === 'number' && Number.isFinite(val)) return { ok: true };
    return { ok: false, reason: `expected number, got ${JSON.stringify(val)}` };
  }

  const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(typeStr);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (typeof val === 'number' && Number.isInteger(val) && val >= min && val <= max) {
      return { ok: true };
    }
    return { ok: false, reason: `expected integer in ${min}-${max}, got ${JSON.stringify(val)}` };
  }

  if (typeStr === 'date' || typeStr.startsWith('date ') || typeStr.includes('yyyy-mm-dd')) {
    if (isValidIsoDate(val)) return { ok: true };
    return { ok: false, reason: `expected date YYYY-MM-DD, got ${JSON.stringify(val)}` };
  }

  if (typeStr === 'url' || typeStr.startsWith('url ')) {
    return validateUrl(val);
  }

  if (typeStr === 'boolean' || typeStr === 'bool') {
    if (typeof val === 'boolean') return { ok: true };
    return { ok: false, reason: `expected boolean, got ${JSON.stringify(val)}` };
  }

  if (typeStr === 'text' || typeStr === 'string') {
    if (typeof val === 'string') return { ok: true };
    return { ok: false, reason: `expected text string, got ${typeof val}` };
  }

  return { ok: true };
}

/** Top-level key names of an object shape string such as "{station: {id, name}, columns: [...], months: [12 objects]}". */
export function objectShapeKeys(shape) {
  const keys = [];
  let depth = 0, tok = '';
  for (const ch of String(shape || '')) {
    if (ch === '{' || ch === '[') { depth++; tok = ''; continue; }
    if (ch === '}' || ch === ']') { depth--; tok = ''; continue; }
    if (depth !== 1) continue;
    if (ch === ',') { tok = ''; continue; }
    if (ch === ':') { const k = tok.trim(); if (/^\w+$/.test(k)) keys.push(k); tok = ''; continue; }
    tok += ch;
  }
  return keys;
}

/**
 * Extract required Markdown headings named in a task's deliver.shape string.
 * Supports:
 *   - Explicit ATX headings in shape (e.g. "## Summary, ## Findings, ## Sources")
 *   - "headings: Summary, Findings, Sources" or "sections: ..."
 */
export function extractRequiredHeadings(shape) {
  if (typeof shape !== 'string' || !shape.trim()) return [];
  const headings = [];

  // 1) Look for explicit markdown headings (# Title, ## Title, etc.)
  const hashMatches = shape.match(/(?:^|[,;|\n`"'(\s])(#{1,6}\s+[^,;\n|`"')]+)/g);
  if (hashMatches && hashMatches.length > 0) {
    for (const raw of hashMatches) {
      const cleaned = raw
        .replace(/^[\s,;|\n`"'(]+/, '')
        .replace(/^#{1,6}\s+/, '')
        .replace(/[`"').]+$/, '')
        .trim();
      if (cleaned) headings.push(cleaned);
    }
    return headings;
  }

  // 2) Look for "headings: ..." or "sections: ..." (also "these headings, in this order: A | B", 2026-11-20:
  //    the function-spec tasks use that form and the checker used to find no headings in it, so 25 specs passed it)
  const listMatch = /\b(?:headings?|sections?)\b[^:\n]{0,40}:\s*([^\n.]+)/i.exec(shape);
  if (listMatch) {
    const parts = listMatch[1].includes('|') ? listMatch[1].split('|') : listMatch[1].split(/[,;]/);
    for (const part of parts) {
      const cleaned = part.replace(/^[`"'\s]+|[`"'\s.]+$/g, '').trim();
      if (cleaned) headings.push(cleaned);
    }
  }

  return headings;
}

/**
 * Parse all ATX headings (# through ######) from a Markdown file.
 */
export function parseMarkdownHeadings(content) {
  const found = [];
  const regex = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    found.push(m[1].trim());
  }
  return found;
}

/**
 * Markdown sections: heading text -> body lines (until the next heading of any level).
 */
export function markdownSections(content) {
  const out = new Map();
  let cur = null;
  for (const line of String(content).split(/\r?\n/)) {
    const m = /^\s*#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) { cur = m[1].trim().toLowerCase(); out.set(cur, []); continue; }
    if (cur !== null) out.get(cur).push(line);
  }
  return out;
}

/**
 * Top-level list items of a section, each with its continuation lines ("- x", "* x", "1. x", "F7. x").
 */
export function listItems(lines) {
  const items = [];
  for (const raw of lines) {
    /* 2026-11-20: a section written as one paragraph ("F1. Given ... F2. Given ...") counts each lettered item, as a list would.
       Only letter+number markers split ("F7. "), never plain numbers, so prices and versions inside a line stay whole. */
    const parts = /\b[A-Z]\d+[.):]\s/.test(raw.replace(/^\s*[A-Z]\d+[.):]\s/, '')) ? raw.split(/\s+(?=[A-Z]\d+[.):]\s)/) : [raw];
    for (const line of parts) {
      if (/^(?:[-*+]|\d+[.)]|[A-Z]\d+[.):])\s+/.test(line)) items.push(line);
      else if (items.length && line.trim() && !/^\s*\|/.test(line)) items[items.length - 1] += ' ' + line.trim();
    }
  }
  return items;
}

/** "8+ user stories" -> 8; "12+" -> 12; anything else -> 0. */
export function minCount(type) {
  const m = /(\d+)\s*\+/.exec(String(type || ''));
  return m ? Number(m[1]) : 0;
}

const STORY = /\bAs Joseph\b[\s\S]*\bI want\b[\s\S]*\bso that\b/i;
const GWT = /\bGiven\b[\s\S]*\bwhen\b[\s\S]*\bthen\b/i;   // the task's own example writes "Given ..., when ..., then ..."

/**
 * Count the items of one field's section the way Claude checks them: user stories must read
 * "As Joseph, when ..., I want ..., so that ..."; acceptance tests must be Given / When / Then.
 */
export function countSectionItems(lines, field) {
  const items = listItems(lines);
  const t = `${field.type || ''} ${field.rule || ''}`;
  if (/user stor/i.test(t)) return { n: items.filter((x) => STORY.test(x)).length, what: "'As Joseph ..., I want ..., so that ...' stories" };
  if (/Given\s*\/\s*When\s*\/\s*Then/i.test(t)) return { n: items.filter((x) => GWT.test(x)).length, what: 'Given/When/Then tests' };
  return { n: items.length, what: 'items' };
}

/**
 * Every "path:line" or "path:a-b" reference must name a file that exists (relative to the repo root,
 * or to the task's pillar folder for a bare name like app.js:142) and a line inside it.
 */
export function checkCodeRefs(content, repoRoot, pillarDir) {
  const re = /((?:[\w.-]+\/)*[\w.-]+\.(?:js|mjs|css|html|json|py))[`']?\s*:\s*L?(\d+)(?:\s*[-\u2013]\s*L?(\d+))?/g;
  const bad = [];
  let n = 0;
  const lineCount = new Map();
  let m;
  while ((m = re.exec(content)) !== null) {
    const rel = m[1];
    if (/^https?:/i.test(rel)) continue;
    n++;
    const cands = rel.includes('/') ? [path.join(repoRoot, rel), pillarDir && path.join(pillarDir, rel)] : [pillarDir && path.join(pillarDir, rel), path.join(repoRoot, rel)];
    const hit = cands.find((p) => p && fs.existsSync(p) && fs.statSync(p).isFile());
    const ref = `${rel}:${m[2]}${m[3] ? '-' + m[3] : ''}`;
    if (!hit) { bad.push(`${ref} (no such file)`); continue; }
    if (!lineCount.has(hit)) { const txt = fs.readFileSync(hit, 'utf8'); lineCount.set(hit, txt.split('\n').length - (txt.endsWith('\n') ? 1 : 0)); }
    const total = lineCount.get(hit);
    const hi = Number(m[3] || m[2]);
    if (hi > total || Number(m[2]) < 1) bad.push(`${ref} (the file has ${total} line${total === 1 ? "" : "s"})`);
  }
  return { n, bad };
}

/**
 * Run all applicable checks on a delivery file.
 * Returns { ok: boolean, task: object | null, results: Array<{ check: string, status: 'PASS'|'FAIL', reason: string }> }
 */
export function checkDelivery(filePath, { taskId = null, repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const results = [];
  const record = (check, passed, reason) => {
    results.push({ check, status: passed ? 'PASS' : 'FAIL', reason });
  };

  if (!filePath || !fs.existsSync(filePath)) {
    record('file-exists', false, `File not found: ${filePath}`);
    return { ok: false, task: null, results };
  }

  const basename = path.basename(filePath);
  const ext = path.extname(basename).toLowerCase();
  const tasks = loadAllTasks(repoRoot);

  let task = null;
  if (taskId) {
    task = tasks.find((t) => String(t.id || '').toLowerCase() === String(taskId).toLowerCase()) || null;
    if (!task) {
      record('task-lookup', false, `Task ID "${taskId}" not found across queues.json files`);
      return { ok: false, task: null, results };
    }
  } else {
    task =
      tasks.find((t) => {
        const pat = extractFilePattern(t?.deliver?.file);
        if (!pat) return false;
        return patternToRegex(pat).test(basename);
      }) || null;

    if (!task) {
      record(
        'filename-pattern',
        false,
        `File "${basename}" does not match any task deliver.file pattern across queues.json`
      );
      return { ok: false, task: null, results };
    }
  }

  // Check 1: filename matches deliver.file pattern
  const pattern = extractFilePattern(task?.deliver?.file);
  if (!pattern) {
    record('filename-pattern', false, `Task ${task.id} has no deliver.file pattern`);
  } else {
    const matches = patternToRegex(pattern).test(basename);
    record(
      'filename-pattern',
      matches,
      matches
        ? `File "${basename}" matches "${pattern}" (${task.id})`
        : `File "${basename}" does not match "${pattern}" (${task.id})`
    );
  }

  const rawContent = fs.readFileSync(filePath, 'utf8');

  if (ext === '.json') {
    // Check 2: .json file parses
    let data;
    try {
      data = JSON.parse(rawContent);
      record('json-parse', true, 'Valid JSON');
    } catch (err) {
      record('json-parse', false, `Invalid JSON: ${err.message}`);
      return { ok: false, task, results };
    }

    if (!Array.isArray(data)) {
      // Check 3b (2026-11-21): a task whose shape is one object ("{station: {...}, months: [12 objects]}")
      // gets that object: every top-level key the shape names is there, and each "key: [N objects]" has N rows.
      const shape = String(task?.deliver?.shape || '').trim();
      if (data && typeof data === 'object' && shape.startsWith('{')) {
        const keys = objectShapeKeys(shape);
        const missing = keys.filter((k) => !Object.prototype.hasOwnProperty.call(data, k));
        record('object-keys', missing.length === 0, missing.length === 0 ? `Object has every key the shape names (${keys.join(', ')})` : `Missing keys: ${missing.join(', ')}`);
        for (const m of shape.matchAll(/(\w+)\s*:\s*\[\s*(\d+)\s+objects?\s*\]/g)) {
          const arr = data[m[1]], want = Number(m[2]);
          const okLen = Array.isArray(arr) && arr.length === want;
          record('row-count', okLen, okLen ? `${m[1]} has ${want} rows (matches the shape)` : `${m[1]} has ${Array.isArray(arr) ? arr.length : 'no'} rows, expected ${want}`);
        }
        return { ok: results.every((r) => r.status === 'PASS'), task, results };
      }
      record('row-count', false, `Expected JSON array, got ${typeof data}`);
      return { ok: false, task, results };
    }

    // Check 3: array length equals count when count > 0
    const expectedCount = typeof task.count === 'number' ? task.count : 0;
    if (expectedCount > 0) {
      // 2026-11-23: a shape that says "60+ objects" makes the count a floor (ODY-GEM-09 sent 65 landmarks and was failed for it)
      const atLeast = new RegExp(`\\b${expectedCount}\\+`).test(String(task?.deliver?.shape || ''));
      const okCount = atLeast ? data.length >= expectedCount : data.length === expectedCount;
      record(
        'row-count',
        okCount,
        okCount
          ? `Array length is ${data.length} (${atLeast ? 'at least' : 'matches'} count ${expectedCount})`
          : `Array length is ${data.length}, expected ${atLeast ? 'at least ' : ''}${expectedCount}`
      );
    } else {
      record('row-count', true, `No positive count requirement (array has ${data.length} rows)`);
    }

    // Check 4: every object has exactly the field names in fields, no more, no fewer
    const fields = Array.isArray(task.fields) ? task.fields : [];
    if (fields.length > 0) {
      const expectedNames = fields.map((f) => f.name);
      const expectedSet = new Set(expectedNames);
      const fieldErrors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (typeof row !== 'object' || row === null || Array.isArray(row)) {
          fieldErrors.push(`row ${i + 1}: not a JSON object`);
          continue;
        }
        const keys = Object.keys(row);
        const keySet = new Set(keys);
        const missing = expectedNames.filter((k) => !keySet.has(k));
        const extra = keys.filter((k) => !expectedSet.has(k));
        if (missing.length > 0 || extra.length > 0) {
          const parts = [];
          if (missing.length > 0) parts.push(`missing [${missing.join(', ')}]`);
          if (extra.length > 0) parts.push(`extra [${extra.join(', ')}]`);
          fieldErrors.push(`row ${i + 1}: ${parts.join(', ')}`);
        }
      }

      record(
        'field-names',
        fieldErrors.length === 0,
        fieldErrors.length === 0
          ? `All ${data.length} rows have exact fields: ${expectedNames.join(', ')}`
          : `${fieldErrors.length} row(s) failed field check: ${fieldErrors.slice(0, 5).join('; ')}`
      );
    } else {
      record('field-names', true, 'Task defines no fields list (skipped)');
    }

    // Check 5: type checks (integer, number, date YYYY-MM-DD, URL)
    if (fields.length > 0) {
      const typeErrors = [];
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (typeof row !== 'object' || row === null || Array.isArray(row)) continue;
        for (const field of fields) {
          if (!Object.prototype.hasOwnProperty.call(row, field.name)) continue;
          const check = checkFieldType(row[field.name], field.type);
          if (!check.ok) {
            typeErrors.push(`row ${i + 1}.${field.name}: ${check.reason}`);
          }
        }
      }
      record(
        'field-types',
        typeErrors.length === 0,
        typeErrors.length === 0
          ? `All ${data.length} rows passed type checks`
          : `${typeErrors.length} type error(s): ${typeErrors.slice(0, 5).join('; ')}`
      );
    } else {
      record('field-types', true, 'Task defines no fields list (skipped)');
    }

    // Check 6: no two rows equal after lower-casing and trimming every text field except n
    const seen = new Map();
    const dupes = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (typeof row !== 'object' || row === null || Array.isArray(row)) continue;
      const normalized = {};
      for (const key of Object.keys(row).sort()) {
        if (key === 'n') continue;
        const val = row[key];
        normalized[key] = typeof val === 'string' ? val.trim().toLowerCase() : val;
      }
      const sig = JSON.stringify(normalized);
      if (seen.has(sig)) {
        dupes.push(`rows ${seen.get(sig)} and ${i + 1}`);
      } else {
        seen.set(sig, i + 1);
      }
    }
    record(
      'no-duplicate-rows',
      dupes.length === 0,
      dupes.length === 0
        ? `All ${data.length} rows are unique (ignoring n, case, and outer whitespace)`
        : `Duplicate row(s) found: ${dupes.slice(0, 5).join('; ')}`
    );

    // Check 7: any field named quote is 300 characters or fewer
    const quoteErrors = [];
    let quoteCount = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (typeof row !== 'object' || row === null || Array.isArray(row)) continue;
      if (Object.prototype.hasOwnProperty.call(row, 'quote') && row.quote !== null && row.quote !== undefined) {
        quoteCount++;
        if (typeof row.quote !== 'string') {
          quoteErrors.push(`row ${i + 1}: quote is not a string`);
        } else if (row.quote.length > 300) {
          quoteErrors.push(`row ${i + 1}: quote is ${row.quote.length} chars (max 300)`);
        }
      }
    }
    record(
      'quote-length',
      quoteErrors.length === 0,
      quoteErrors.length === 0
        ? quoteCount > 0
          ? `All ${quoteCount} quote field(s) are 300 characters or fewer`
          : 'No quote field present'
        : `${quoteErrors.length} quote violation(s): ${quoteErrors.slice(0, 5).join('; ')}`
    );
  } else if (ext === '.md') {
    // Check 8: for .md files, every heading the task's shape names is present
    const requiredHeadings = extractRequiredHeadings(task?.deliver?.shape || '');
    if (requiredHeadings.length === 0) {
      record('md-headings', true, 'No required headings named in task shape');
    } else {
      const present = parseMarkdownHeadings(rawContent).map((h) => h.toLowerCase());
      const presentSet = new Set(present);
      const missing = requiredHeadings.filter((h) => !presentSet.has(h.toLowerCase()));
      record(
        'md-headings',
        missing.length === 0,
        missing.length === 0
          ? `All ${requiredHeadings.length} required heading(s) present: ${requiredHeadings.join(', ')}`
          : `Missing required heading(s): ${missing.join(', ')}`
      );
      // Check 9 (2026-11-20): "in this order" means in this order
      if (/in this order/i.test(task?.deliver?.shape || '') && missing.length === 0) {
        const want = requiredHeadings.map((h) => h.toLowerCase());
        const got = present.filter((h) => want.includes(h));
        const inOrder = got.length === want.length && got.every((h, i) => h === want[i]);
        record('md-heading-order', inOrder, inOrder ? 'Headings are in the order the task gives' : `Headings out of order: ${got.join(' | ')}`);
      }
    }
    // Check 10 (2026-11-20): each field whose name is a heading has its count ("8+ user stories", "12+") and its table
    const fields = Array.isArray(task?.fields) ? task.fields : [];
    const secs = markdownSections(rawContent);
    const short = [];
    let counted = 0;
    for (const field of fields) {
      const body = secs.get(String(field.name || '').toLowerCase());
      if (!body) continue;
      const need = minCount(field.type);
      if (need) {
        counted++;
        const { n, what } = countSectionItems(body, field);
        if (n < need) short.push(`${field.name}: ${n} ${what}, needs ${need}+`);
      }
      if (/^table$/i.test(String(field.type || '').trim())) {
        counted++;
        const cols = String(field.rule || '').split('|').length;
        const head = body.find((l) => /^\s*\|.*\|\s*$/.test(l));
        const sep = body.some((l) => /^\s*\|?\s*:?-{3,}/.test(l));
        const have = head ? head.trim().replace(/^\||\|$/g, '').split('|').length : 0;
        if (!head || !sep) short.push(`${field.name}: no Markdown table`);
        else if (cols > 1 && have < cols) short.push(`${field.name}: table has ${have} columns, needs ${cols}`);
      }
    }
    if (counted) record('md-counts', short.length === 0, short.length === 0 ? `Every counted section has its count (${counted} checked)` : short.join('; '));
    // Check 11 (2026-11-20): every file:line reference exists in the code (run it in a fresh checkout of the repo)
    const pillarDir = task?._queueFile ? path.resolve(path.dirname(task._queueFile), '..', '..') : null;
    const refs = checkCodeRefs(rawContent, repoRoot, pillarDir);
    if (refs.n) record('md-code-refs', refs.bad.length === 0, refs.bad.length === 0 ? `All ${refs.n} file:line references are inside their files` : `${refs.bad.length} of ${refs.n} file:line references are wrong: ${refs.bad.slice(0, 5).join('; ')}`);
  }

  const ok = results.every((r) => r.status === 'PASS');
  return { ok, task, results };
}

function parseCliArgs(argv) {
  const positional = [];
  let repoRoot = process.env.PROMETHEUS_ROOT || DEFAULT_REPO_ROOT;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root' && i + 1 < argv.length) {
      repoRoot = path.resolve(argv[++i]);
    } else {
      positional.push(arg);
    }
  }

  return {
    filePath: positional[0] || null,
    taskId: positional[1] || null,
    repoRoot,
  };
}

function main() {
  const { filePath, taskId, repoRoot } = parseCliArgs(process.argv.slice(2));
  if (!filePath) {
    console.error('Usage: node tools/kit/check_delivery.mjs <file> [<task id>]');
    process.exit(1);
  }

  const outcome = checkDelivery(filePath, { taskId, repoRoot });
  for (const r of outcome.results) {
    console.log(`${r.status} [${r.check}] ${r.reason}`);
  }
  process.exit(outcome.ok ? 0 : 1);
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
  main();
}
