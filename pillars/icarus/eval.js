/* Tiny safe formula interpreter (Sebastian, 2026-11-10) for the Icarus rule checks.
   Grammar ONLY: numbers, strings, identifiers, + - * /, comparisons, && ||, ternary,
   parentheses, and abs/len/trim/lower/contains. No eval, no property access, no assignment —
   a formula can only read the trade record it is handed. window.RULE_EVAL = { evaluate }. */
(function () {
  "use strict";
  function tokenize(src) {
    const out = []; let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) { let j = i; while (j < src.length && /[0-9.]/.test(src[j])) j++; out.push({ t: "num", v: parseFloat(src.slice(i, j)) }); i = j; continue; }
      if (c === '"') { let j = i + 1, s = ""; while (j < src.length && src[j] !== '"') { if (src[j] === "\\") { s += src[j + 1]; j += 2; } else { s += src[j]; j++; } } out.push({ t: "str", v: s }); i = j + 1; continue; }
      if (/[A-Za-z_]/.test(c)) { let j = i; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++; out.push({ t: "id", v: src.slice(i, j) }); i = j; continue; }
      const two = src.slice(i, i + 2);
      if (["&&", "||", "==", "!=", "<=", ">="].includes(two)) { out.push({ t: "op", v: two }); i += 2; continue; }
      if ("+-*/<>?:(),".includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
      throw new Error("bad char " + c);
    }
    return out;
  }
  function parse(toks) {
    let p = 0;
    const peek = () => toks[p], eat = (v) => { if (peek() && peek().v === v) { p++; return true; } return false; };
    function expr() { const c = or(); if (eat("?")) { const a = expr(); if (!eat(":")) throw new Error("ternary :"); const b = expr(); return { k: "?:", c, a, b }; } return c; }
    function or() { let l = and(); while (eat("||")) l = { k: "||", l, r: and() }; return l; }
    function and() { let l = cmp(); while (eat("&&")) l = { k: "&&", l, r: cmp() }; return l; }
    function cmp() { const l = add(); const t = peek(); if (t && ["==", "!=", "<=", ">=", "<", ">"].includes(t.v)) { p++; return { k: "cmp", op: t.v, l, r: add() }; } return l; }
    function add() { let l = mul(); for (;;) { if (eat("+")) l = { k: "+", l, r: mul() }; else if (eat("-")) l = { k: "-", l, r: mul() }; else return l; } }
    function mul() { let l = un(); for (;;) { if (eat("*")) l = { k: "*", l, r: un() }; else if (eat("/")) l = { k: "/", l, r: un() }; else return l; } }
    function un() { if (eat("-")) return { k: "neg", x: un() }; return prim(); }
    function prim() {
      const t = toks[p++]; if (!t) throw new Error("eof");
      if (t.t === "num" || t.t === "str") return { k: "lit", v: t.v };
      if (t.t === "op" && t.v === "(") { const e = expr(); if (!eat(")")) throw new Error(")"); return e; }
      if (t.t === "id") {
        if (peek() && peek().v === "(") { p++; const args = []; if (!(peek() && peek().v === ")")) { args.push(expr()); while (eat(",")) args.push(expr()); } if (!eat(")")) throw new Error("fn )"); return { k: "fn", name: t.v, args }; }
        return { k: "id", v: t.v };
      }
      throw new Error("unexpected " + t.v);
    }
    const ast = expr(); if (p !== toks.length) throw new Error("trailing tokens");
    return ast;
  }
  const FNS = {
    abs: (x) => (x == null ? null : Math.abs(x)),
    len: (x) => (x == null ? 0 : String(x).length),
    trim: (x) => (x == null ? "" : String(x).trim()),
    lower: (x) => (x == null ? "" : String(x).toLowerCase()),
    contains: (x, sub) => (x == null ? false : String(x).includes(String(sub))),
  };
  function ev(node, env) {
    switch (node.k) {
      case "lit": return node.v;
      case "id": return node.v === "null" ? null : (env[node.v] === undefined ? null : env[node.v]);
      case "neg": { const v = ev(node.x, env); return v == null ? null : -v; }
      case "fn": { const f = FNS[node.name]; if (!f) throw new Error("fn " + node.name); return f(...node.args.map((a) => ev(a, env))); }
      case "?:": return ev(node.c, env) ? ev(node.a, env) : ev(node.b, env);
      case "||": return ev(node.l, env) || ev(node.r, env);
      case "&&": return ev(node.l, env) && ev(node.r, env);
      case "+": case "-": case "*": case "/": { const l = ev(node.l, env), r = ev(node.r, env); if (l == null || r == null) return null; return node.k === "+" ? l + r : node.k === "-" ? l - r : node.k === "*" ? l * r : l / r; }
      case "cmp": { const l = ev(node.l, env), r = ev(node.r, env);
        if (node.op === "==") return l === r || (l == null && r == null);
        if (node.op === "!=") return !(l === r || (l == null && r == null));
        if (l == null || r == null) return false;
        return node.op === "<" ? l < r : node.op === "<=" ? l <= r : node.op === ">" ? l > r : l >= r; }
    }
    throw new Error("node " + node.k);
  }
  function evaluate(formula, env) { return !!ev(parse(tokenize(formula)), env || {}); }
  const RE = { evaluate };
  if (typeof window !== "undefined") window.RULE_EVAL = RE;
  if (typeof globalThis !== "undefined") globalThis.RULE_EVAL = RE;
})();
