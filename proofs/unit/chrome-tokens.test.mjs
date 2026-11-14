import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

/* Hub chrome tokens are the custom properties on :root in the deck and the kit.
   Each pillar's own hue lives on body[data-pillar] and is not part of this set. */
const CHROME = ["deck/deck.css", "kit/prometheus.css"];

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function rootBlocks(css) {
  const blocks = [];
  const re = /:root\s*\{/g;
  let m;
  while ((m = re.exec(css))) {
    let i = m.index + m[0].length;
    let depth = 1;
    let body = "";
    while (i < css.length && depth > 0) {
      const ch = css[i++];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      if (depth > 0) body += ch;
    }
    blocks.push(body);
  }
  return blocks;
}

function declarations(block) {
  const out = [];
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block))) out.push([m[1], m[2].trim()]);
  return out;
}

export function hueOfRgb(r, g, b) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const d = max - min;
  const l = (max + min) / 2;
  if (d < 1e-6) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === R) h = ((G - B) / d) % 6;
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

function hexToRgb(raw) {
  let h = raw.slice(1);
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("");
  else if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function colorsIn(value) {
  const found = [];
  const hex = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;
  let m;
  while ((m = hex.exec(value))) {
    const rgb = hexToRgb(m[0]);
    if (rgb) found.push({ src: m[0], rgb });
  }
  const fn = /(?:rgba?|hsla?)\(\s*([^)]+)\)/gi;
  while ((m = fn.exec(value))) {
    const name = m[0].slice(0, m[0].indexOf("(")).toLowerCase();
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    if (name.startsWith("rgb")) {
      const nums = parts.slice(0, 3).map(Number);
      if (nums.length === 3 && nums.every((n) => Number.isFinite(n))) found.push({ src: m[0], rgb: nums });
    } else {
      const hue = parseFloat(parts[0]);
      const sat = parseFloat(String(parts[1]).replace("%", "")) / 100;
      if (Number.isFinite(hue) && Number.isFinite(sat)) found.push({ src: m[0], hsl: { h: ((hue % 360) + 360) % 360, s: sat } });
    }
  }
  return found;
}

function chromeTokens() {
  const tokens = [];
  for (const rel of CHROME) {
    const css = stripComments(readFileSync(path.join(ROOT, rel), "utf8"));
    for (const block of rootBlocks(css)) {
      for (const [name, value] of declarations(block)) tokens.push({ file: rel, name, value, colors: colorsIn(value) });
    }
  }
  return tokens;
}

/** Amber through gold. Achromatic ink and glass are not a hue. */
export function isAmberHue(color) {
  if (color.hsl) return color.hsl.s >= 0.12 && color.hsl.h >= 20 && color.hsl.h <= 60;
  const { h, s } = hueOfRgb(...color.rgb);
  return s >= 0.12 && h >= 20 && h <= 60;
}

test("the hue check flags amber and gold and lets pearl, cyan and lavender through", () => {
  assert.equal(isAmberHue({ rgb: hexToRgb("#ff9d5c") }), true);
  assert.equal(isAmberHue({ rgb: hexToRgb("#ffd27a") }), true);
  assert.equal(isAmberHue({ rgb: hexToRgb("#f0d29a") }), true);
  assert.equal(isAmberHue({ rgb: hexToRgb("#ffb26e") }), true);
  assert.equal(isAmberHue({ rgb: hexToRgb("#9fd4e6") }), false);
  assert.equal(isAmberHue({ rgb: hexToRgb("#c9b8ea") }), false);
  assert.equal(isAmberHue({ rgb: hexToRgb("#f4f7fb") }), false);
  assert.equal(isAmberHue({ rgb: hexToRgb("#05070e") }), false);
  assert.equal(isAmberHue({ rgb: hexToRgb("#f2a7a7") }), false);
  assert.equal(isAmberHue({ hsl: { h: 40, s: 0.8 } }), true);
  assert.equal(isAmberHue({ hsl: { h: 40, s: 0.02 } }), false);
});

test("no hub chrome colour token has a hue from 20 to 60 degrees", () => {
  const bad = [];
  for (const token of chromeTokens()) {
    for (const color of token.colors) {
      if (isAmberHue(color)) bad.push(`${token.file} ${token.name} = ${color.src}`);
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(chromeTokens().some((t) => t.name === "--cyan"), "the chrome set includes --cyan");
  assert.ok(chromeTokens().some((t) => t.name === "--lavender"), "the chrome set includes --lavender");
  assert.ok(chromeTokens().some((t) => t.name === "--pearl"), "the chrome set includes --pearl");
});
