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

  // 2) Look for "headings: ..." or "sections: ..."
  const listMatch = /\b(?:headings?|sections?)\s*:\s*([^\n.]+)/i.exec(shape);
  if (listMatch) {
    const parts = listMatch[1].split(/[,;|]/);
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
      record('row-count', false, `Expected JSON array, got ${typeof data}`);
      return { ok: false, task, results };
    }

    // Check 3: array length equals count when count > 0
    const expectedCount = typeof task.count === 'number' ? task.count : 0;
    if (expectedCount > 0) {
      const okCount = data.length === expectedCount;
      record(
        'row-count',
        okCount,
        okCount
          ? `Array length is ${data.length} (matches count ${expectedCount})`
          : `Array length is ${data.length}, expected ${expectedCount}`
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
    }
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
