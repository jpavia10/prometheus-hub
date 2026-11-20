/* The guard's private-word list (2026-11-20): a home street name reached three public pillars and was erased from git
   history. The guard stores only hashes; this proof checks it fires on the word in any case and stays quiet on ordinary text.
   The test builds the word from character codes so this file does not carry it either. */
import test from "node:test";
import assert from "node:assert/strict";
import { privateWords, PRIVATE_SHA256 } from "../../tools/guard/money.mjs";

const word = String.fromCharCode(97, 110, 97, 99, 97, 112, 97);

test("the list holds hashes, not words", () => {
  for (const h of PRIVATE_SHA256) assert.match(h, /^[0-9a-f]{64}$/);
});

test("a private word is caught in any case and inside a sentence", () => {
  assert.equal(privateWords(`Hold mail for 7 ${word.toUpperCase()} Trail`), 1);
  assert.equal(privateWords(`"${word[0].toUpperCase() + word.slice(1)}"`), 1);
});

test("ordinary text passes", () => {
  assert.equal(privateWords("Schedule USPS Hold Mail for your PO box and street address"), 0);
  assert.equal(privateWords(""), 0);
});
