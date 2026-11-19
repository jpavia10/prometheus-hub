/**
 * proofs/unit/check-delivery.test.mjs
 *
 * Unit proof suite for tools/kit/check_delivery.mjs (12 cases: 6 pass, 6 fail one named check).
 *
 * Run:
 *   node --test proofs/unit/check-delivery.test.mjs
 *
 * Verified output (node --test proofs/unit/check-delivery.test.mjs):
 *   TAP version 13
 *   # Subtest: PASS 1: valid JSON delivery auto-matched in docs/agents/queues.json
 *   ok 1 - PASS 1: valid JSON delivery auto-matched in docs/agents/queues.json
 *   # Subtest: PASS 2: valid JSON delivery auto-matched in pillars/&#42;/docs/agents/queues.json
 *   ok 2 - PASS 2: valid JSON delivery auto-matched in pillars/&#42;/docs/agents/queues.json
 *   # Subtest: PASS 3: valid JSON delivery with explicit task id argument
 *   ok 3 - PASS 3: valid JSON delivery with explicit task id argument
 *   # Subtest: PASS 4: boundary quote length (exact 300 chars) and /research/ URL path
 *   ok 4 - PASS 4: boundary quote length (exact 300 chars) and /research/ URL path
 *   # Subtest: PASS 5: valid JSON delivery for task with count = 0 (open row count)
 *   ok 5 - PASS 5: valid JSON delivery for task with count = 0 (open row count)
 *   # Subtest: PASS 6: valid Markdown delivery with all required headings present
 *   ok 6 - PASS 6: valid Markdown delivery with all required headings present
 *   # Subtest: FAIL 1 [row-count]: array length does not equal task count
 *   ok 7 - FAIL 1 [row-count]: array length does not equal task count
 *   # Subtest: FAIL 2 [field-names]: object contains an extra/missing field
 *   ok 8 - FAIL 2 [field-names]: object contains an extra/missing field
 *   # Subtest: FAIL 3 [field-types]: invalid URL (search page) and invalid calendar date
 *   ok 9 - FAIL 3 [field-types]: invalid URL (search page) and invalid calendar date
 *   # Subtest: FAIL 4 [no-duplicate-rows]: two rows match after lowercasing/trimming text fields except n
 *   ok 10 - FAIL 4 [no-duplicate-rows]: two rows match after lowercasing/trimming text fields except n
 *   # Subtest: FAIL 5 [quote-length]: quote field exceeds 300 characters
 *   ok 11 - FAIL 5 [quote-length]: quote field exceeds 300 characters
 *   # Subtest: FAIL 6 [md-headings]: Markdown file is missing a heading named in task shape
 *   ok 12 - FAIL 6 [md-headings]: Markdown file is missing a heading named in task shape
 *   1..12
 *   # tests 12
 *   # suites 0
 *   # pass 12
 *   # fail 0
 *   # cancelled 0
 *   # skipped 0
 *   # todo 0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(REPO_ROOT, 'tools', 'kit', 'check_delivery.mjs');
const FIXTURES_DIR = path.join(REPO_ROOT, 'proofs', 'fixtures', 'check-delivery');
const FIXTURE_REPO = path.join(FIXTURES_DIR, 'repo');
const DELIVERIES_DIR = path.join(FIXTURES_DIR, 'deliveries');

function runChecker(relativeFile, taskId = null) {
  const target = path.join(DELIVERIES_DIR, relativeFile);
  const args = [SCRIPT, target];
  if (taskId) args.push(taskId);

  try {
    const stdout = execFileSync(process.execPath, args, {
      encoding: 'utf8',
      env: { ...process.env, PROMETHEUS_ROOT: FIXTURE_REPO },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      exitCode: typeof err.status === 'number' ? err.status : 1,
      stdout: err.stdout ? String(err.stdout) : '',
      stderr: err.stderr ? String(err.stderr) : '',
    };
  }
}

function parseCheckLines(stdout) {
  return stdout
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const m = /^(PASS|FAIL)\s+\[([^\]]+)\]\s+(.*)$/.exec(line);
      assert.ok(m, `Expected PASS/FAIL formatted line, got: ${line}`);
      return { status: m[1], check: m[2], reason: m[3] };
    });
}

// ---------- 6 PASS CASES ----------

test('PASS 1: valid JSON delivery auto-matched in docs/agents/queues.json', () => {
  const res = runChecker('hub_gemini_sample_20261119-0930.json');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 7);
  assert.ok(lines.every((l) => l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'filename-pattern' && l.reason.includes('HUB-TST-01')));
});

test('PASS 2: valid JSON delivery auto-matched in pillars/*/docs/agents/queues.json', () => {
  const res = runChecker('garage_gemini_specs_20261119-0930.json');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 7);
  assert.ok(lines.every((l) => l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'filename-pattern' && l.reason.includes('GAR-TST-01')));
});

test('PASS 3: valid JSON delivery with explicit task id argument', () => {
  const res = runChecker('hub_gemini_sample_20261119-0935.json', 'HUB-TST-01');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 7);
  assert.ok(lines.every((l) => l.status === 'PASS'));
});

test('PASS 4: boundary quote length (exact 300 chars) and /research/ URL path', () => {
  const res = runChecker('hub_gemini_sample_20261119-0940.json');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 7);
  assert.ok(lines.every((l) => l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'quote-length' && l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'field-types' && l.status === 'PASS'));
});

test('PASS 5: valid JSON delivery for task with count = 0 (open row count)', () => {
  const res = runChecker('hub_gemini_open_20261119-0930.json');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 7);
  assert.ok(lines.every((l) => l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'row-count' && l.status === 'PASS'));
});

test('PASS 6: valid Markdown delivery with all required headings present', () => {
  const res = runChecker('hub_gemini_notes_20261119-0930.md');
  assert.equal(res.exitCode, 0, res.stdout + res.stderr);
  const lines = parseCheckLines(res.stdout);
  assert.equal(lines.length, 2);
  assert.ok(lines.every((l) => l.status === 'PASS'));
  assert.ok(lines.some((l) => l.check === 'md-headings' && l.status === 'PASS'));
});

// ---------- 6 FAIL CASES (each failing one named check) ----------

test('FAIL 1 [row-count]: array length does not equal task count', () => {
  const res = runChecker('fail-count/hub_gemini_sample_20261119-1001.json');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['row-count']
  );
});

test('FAIL 2 [field-names]: object contains an extra/missing field', () => {
  const res = runChecker('fail-fields/hub_gemini_sample_20261119-1002.json');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['field-names']
  );
});

test('FAIL 3 [field-types]: invalid URL (search page) and invalid calendar date', () => {
  const res = runChecker('fail-types/hub_gemini_sample_20261119-1003.json');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['field-types']
  );
  assert.match(failed[0].reason, /search page/i);
});

test('FAIL 4 [no-duplicate-rows]: two rows match after lowercasing/trimming text fields except n', () => {
  const res = runChecker('fail-dupe/hub_gemini_sample_20261119-1004.json');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['no-duplicate-rows']
  );
});

test('FAIL 5 [quote-length]: quote field exceeds 300 characters', () => {
  const res = runChecker('fail-quote/hub_gemini_sample_20261119-1005.json');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['quote-length']
  );
  assert.match(failed[0].reason, /301/);
});

test('FAIL 6 [md-headings]: Markdown file is missing a heading named in task shape', () => {
  const res = runChecker('fail-md/hub_gemini_notes_20261119-1006.md');
  assert.equal(res.exitCode, 1);
  const lines = parseCheckLines(res.stdout);
  const failed = lines.filter((l) => l.status === 'FAIL');
  assert.deepEqual(
    failed.map((l) => l.check),
    ['md-headings']
  );
  assert.match(failed[0].reason, /Sources/);
});
