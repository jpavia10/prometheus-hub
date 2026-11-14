import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../../", import.meta.url);
const readRepo = (rel) => readFileSync(new URL(rel, ROOT), "utf8");

const VOID_TAGS = new Set(["input", "br", "hr", "img", "meta", "link"]);

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&harr;/g, "↔")
    .replace(/&mdash;/g, "—")
    .replace(/&ge;/g, "≥");
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const k = m[1];
    const v = m[2] ?? m[3] ?? m[4] ?? "";
    attrs[k] = decodeEntities(v);
  }
  return attrs;
}

function parseSelectorPart(sel) {
  const part = { tag: null, id: null, classes: [], attrs: [] };
  let rest = sel.trim();
  const tagM = rest.match(/^([a-zA-Z0-9_-]+)/);
  if (tagM) {
    part.tag = tagM[1].toUpperCase();
    rest = rest.slice(tagM[0].length);
  }
  while (rest.length) {
    if (rest[0] === "#") {
      const m = rest.match(/^#([a-zA-Z0-9_-]+)/);
      if (!m) break;
      part.id = m[1];
      rest = rest.slice(m[0].length);
    } else if (rest[0] === ".") {
      const m = rest.match(/^\.([a-zA-Z0-9_-]+)/);
      if (!m) break;
      part.classes.push(m[1]);
      rest = rest.slice(m[0].length);
    } else if (rest[0] === "[") {
      const m = rest.match(/^\[([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]]*)))?\]/);
      if (!m) break;
      part.attrs.push({ name: m[1], val: m[2] ?? m[3] ?? m[4] ?? null });
      rest = rest.slice(m[0].length);
    } else {
      break;
    }
  }
  return part;
}

function matchesSimple(el, spec) {
  if (!el || el.nodeType !== 1) return false;
  if (spec.tag && el.tagName !== spec.tag) return false;
  if (spec.id && el.id !== spec.id) return false;
  for (const c of spec.classes) if (!el.classList.contains(c)) return false;
  for (const a of spec.attrs) {
    if (!(a.name in el._attrs)) return false;
    if (a.val !== null && el._attrs[a.name] !== a.val) return false;
  }
  return true;
}

function createMiniDom() {
  class MiniNode {
    constructor(nodeType) {
      this.nodeType = nodeType;
      this.parentNode = null;
      this.childNodes = [];
    }
    get textContent() {
      if (this.nodeType === 3) return this._text;
      return this.childNodes.map((c) => c.textContent).join("");
    }
    set textContent(v) {
      if (this.nodeType === 3) {
        this._text = String(v ?? "");
        return;
      }
      this.childNodes = [];
      if (v !== "" && v != null) this.append(doc.createTextNode(String(v)));
    }
  }

  class MiniText extends MiniNode {
    constructor(text) {
      super(3);
      this._text = String(text ?? "");
    }
  }

  class MiniElement extends MiniNode {
    constructor(tagName) {
      super(1);
      this.tagName = String(tagName || "div").toUpperCase();
      this._attrs = {};
      this._listeners = new Map();
      this._value = "";
      this._checked = false;
      this.style = {};
      this.hidden = false;
      this.disabled = false;
      this.onclick = null;
      this.onchange = null;
      this.onsubmit = null;
      const self = this;
      this.classList = {
        add(...names) {
          const cur = new Set(String(self.className || "").split(/\s+/).filter(Boolean));
          for (const n of names) if (n) cur.add(n);
          self.className = [...cur].join(" ");
        },
        remove(...names) {
          const rm = new Set(names);
          const cur = String(self.className || "").split(/\s+/).filter((n) => n && !rm.has(n));
          self.className = cur.join(" ");
        },
        toggle(name, force) {
          const has = this.contains(name);
          const next = force !== undefined ? Boolean(force) : !has;
          if (next) this.add(name);
          else this.remove(name);
          return next;
        },
        contains(name) {
          return String(self.className || "").split(/\s+/).includes(name);
        },
      };
      this.dataset = new Proxy({}, {
        get(_, prop) {
          const attr = "data-" + String(prop).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return self._attrs[attr];
        },
        set(_, prop, val) {
          const attr = "data-" + String(prop).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          self.setAttribute(attr, String(val));
          return true;
        },
      });
    }
    get id() { return this._attrs.id || ""; }
    set id(v) { this.setAttribute("id", v); }
    get className() { return this._attrs.class || ""; }
    set className(v) { this.setAttribute("class", v); }
    get name() { return this._attrs.name || ""; }
    set name(v) { this.setAttribute("name", v); }
    get value() {
      if (this.tagName === "SELECT" && !this._value) {
        const firstOpt = this.querySelector("option");
        if (firstOpt) return firstOpt._attrs.value ?? firstOpt.textContent;
      }
      return this._value;
    }
    set value(v) { this._value = String(v ?? ""); }
    get checked() { return this._checked; }
    set checked(v) { this._checked = Boolean(v); }
    get clientWidth() { return 300; }
    get clientHeight() { return 220; }
    setAttribute(k, v) {
      const val = String(v);
      this._attrs[k] = val;
      if (k === "value") this._value = val;
      if (k === "checked") this._checked = true;
      if (k === "disabled") this.disabled = true;
      if (k === "hidden") this.hidden = true;
      if (k === "name") this._syncFormRef();
    }
    getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }
    removeAttribute(k) { delete this._attrs[k]; }
    _syncFormRef() {
      let p = this.parentNode;
      while (p && p.tagName !== "FORM") p = p.parentNode;
      if (p && this._attrs.name && !(this._attrs.name in p)) p[this._attrs.name] = this;
      else if (p && this._attrs.name) p[this._attrs.name] = this;
    }
    append(...nodes) {
      for (const n of nodes) {
        if (n == null) continue;
        const node = typeof n === "string" ? new MiniText(n) : n;
        node.parentNode = this;
        this.childNodes.push(node);
        if (node.nodeType === 1) node._syncSubtreeFormRefs();
      }
    }
    _syncSubtreeFormRefs() {
      if (this._attrs.name) this._syncFormRef();
      for (const c of this.childNodes) if (c.nodeType === 1) c._syncSubtreeFormRefs();
    }
    replaceChildren(...nodes) {
      this.childNodes = [];
      this.append(...nodes);
    }
    remove() {
      if (!this.parentNode) return;
      this.parentNode.childNodes = this.parentNode.childNodes.filter((c) => c !== this);
      this.parentNode = null;
    }
    get isConnected() {
      let p = this;
      while (p) {
        if (p === doc.documentElement) return true;
        p = p.parentNode;
      }
      return false;
    }
    addEventListener(type, fn) {
      if (!this._listeners.has(type)) this._listeners.set(type, []);
      this._listeners.get(type).push(fn);
    }
    dispatchEvent(ev) {
      if (!ev.target) ev.target = this;
      if (ev.type === "click" && typeof this.onclick === "function") this.onclick(ev);
      if (ev.type === "submit" && typeof this.onsubmit === "function") this.onsubmit(ev);
      if (ev.type === "change" && typeof this.onchange === "function") this.onchange(ev);
      for (const fn of this._listeners.get(ev.type) || []) fn.call(this, ev);
      return true;
    }
    click() {
      if (this.disabled) return;
      this.dispatchEvent({ type: "click", target: this, preventDefault() {} });
    }
    reset() {
      for (const el of this.querySelectorAll("input, select, textarea")) {
        if (el._attrs.type === "checkbox") el.checked = "checked" in el._attrs;
        else el.value = el._attrs.value || "";
      }
    }
    get children() { return this.childNodes.filter((c) => c.nodeType === 1); }
    set innerHTML(html) {
      this.childNodes = [];
      if (!html) return;
      const stack = [this];
      const tok = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9_-]+)\s*>|<([a-zA-Z0-9_-]+)((?:\s+[^<>]*?)?)\s*(\/?)>|([^<]+)/g;
      let m;
      while ((m = tok.exec(String(html))) !== null) {
        if (m[1]) {
          const closeTag = m[1].toUpperCase();
          for (let i = stack.length - 1; i > 0; i--) {
            if (stack[i].tagName === closeTag) {
              stack.length = i;
              break;
            }
          }
        } else if (m[2]) {
          const tag = m[2].toLowerCase();
          const attrs = parseAttrs(m[3] || "");
          const el = new MiniElement(tag);
          for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
          stack[stack.length - 1].append(el);
          if (!m[4] && !VOID_TAGS.has(tag)) stack.push(el);
        } else if (m[5]) {
          const txt = decodeEntities(m[5]);
          if (txt.length) stack[stack.length - 1].append(new MiniText(txt));
        }
      }
    }
    get innerHTML() {
      return this.childNodes.map((c) => (c.nodeType === 3 ? c._text : `<${c.tagName.toLowerCase()}>${c.innerHTML}</${c.tagName.toLowerCase()}>`)).join("");
    }
    querySelectorAll(selector) {
      const groups = String(selector).split(",").map((g) => g.trim()).filter(Boolean).map((g) => g.split(/\s+/).map(parseSelectorPart));
      const out = [];
      const walk = (node, ancestors) => {
        for (const c of node.childNodes) {
          if (c.nodeType !== 1) continue;
          for (const chain of groups) {
            if (matchesSimple(c, chain[chain.length - 1])) {
              let ok = true;
              let idx = chain.length - 2;
              for (let a = ancestors.length - 1; a >= 0 && idx >= 0; a--) {
                if (matchesSimple(ancestors[a], chain[idx])) idx--;
              }
              if (idx >= 0) ok = false;
              if (ok) { out.push(c); break; }
            }
          }
          walk(c, [...ancestors, c]);
        }
      };
      walk(this, []);
      return out;
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    }
    getContext() {
      return {
        setTransform() {}, clearRect() {}, beginPath() {}, closePath() {},
        moveTo() {}, lineTo() {}, stroke() {}, fill() {}, fillText() {},
        fillRect() {}, arc() {}, setLineDash() {}, createLinearGradient: () => ({ addColorStop() {} }),
      };
    }
  }

  const doc = {
    documentElement: new MiniElement("html"),
    body: new MiniElement("body"),
    createElement: (tag) => new MiniElement(tag),
    createTextNode: (t) => new MiniText(t),
    querySelector: (s) => doc.documentElement.querySelector(s),
    querySelectorAll: (s) => doc.documentElement.querySelectorAll(s),
    getElementById: (id) => doc.documentElement.querySelector("#" + id),
    addEventListener() {},
  };
  doc.documentElement.append(doc.body);
  const app = new MiniElement("main");
  app.id = "app";
  const exp = new MiniElement("button");
  exp.id = "export";
  const imp = new MiniElement("button");
  imp.id = "import";
  doc.body.append(app, exp, imp);
  return doc;
}

function createStorage(seed = {}) {
  const m = new Map(Object.entries(seed).map(([k, v]) => [k, String(v)]));
  return {
    get length() { return m.size; },
    key: (i) => Array.from(m.keys())[i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(String(k), String(v)); },
    removeItem: (k) => { m.delete(String(k)); },
    clear: () => { m.clear(); },
    _dump: () => Object.fromEntries(m.entries()),
  };
}

function bootPillarEnv({ scripts, seedLocal = {}, seedSession = {}, fetchImpl, todayStr }) {
  const doc = createMiniDom();
  const ls = createStorage(seedLocal);
  const ss = createStorage(seedSession);
  const toasts = [];
  const fixedNow = todayStr ? new Date(todayStr + "T12:00:00") : null;
  const dayFn = (d) => {
    const dt = d || fixedNow || new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  };

  const sandbox = {
    console,
    Math,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Map,
    Set,
    JSON,
    Promise,
    Error,
    TypeError,
    SyntaxError,
    RegExp,
    AbortController,
    URLSearchParams,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout,
    clearTimeout,
    document: doc,
    localStorage: ls,
    sessionStorage: ss,
    location: { search: "", pathname: "/pillars/test/", hash: "" },
    devicePixelRatio: 1,
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
    CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
    dispatchEvent() {},
    addEventListener() {},
    confirm: () => true,
    prompt: () => null,
    fetch: fetchImpl || (async () => { throw new Error("fetch not mocked"); }),
    PK: {
      $: (s, r = doc) => r.querySelector(s),
      $$: (s, r = doc) => r.querySelectorAll(s),
      h(tag, attrs, ...kids) {
        const [name, ...cls] = tag.split(".");
        const e = doc.createElement(name || "div");
        if (cls.length) e.className = cls.join(" ");
        if (attrs) {
          for (const [k, v] of Object.entries(attrs)) {
            if (v == null || v === false) continue;
            if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
            else if (k === "html") e.innerHTML = v;
            else if (k === "text") e.textContent = v;
            else e.setAttribute(k, v === true ? "" : v);
          }
        }
        for (const k of kids.flat()) {
          if (k != null && k !== false) e.append(k.nodeType ? k : doc.createTextNode(String(k)));
        }
        return e;
      },
      money: (n, d = 2) => (n == null || isNaN(n) ? "—" : (n < 0 ? "−$" : "$") + Math.abs(n).toFixed(d)),
      num: (n, d) => (n == null || isNaN(n) ? "—" : d == null ? String(n) : Number(n).toFixed(d)),
      day: dayFn,
      toast: (msg) => { toasts.push(String(msg)); },
      store(pillar) {
        const key = (k) => `prometheus.${pillar}.${k}`;
        const read = (k, dflt) => { try { const v = ls.getItem(key(k)); return v == null ? dflt : JSON.parse(v); } catch (_) { return dflt; } };
        const write = (k, v) => { ls.setItem(key(k), JSON.stringify(v)); return true; };
        let seq = 0;
        const uid = () => "id_" + (++seq).toString(36);
        return {
          get: read,
          set: write,
          list: (k) => read(k, []),
          add(k, rec) { const l = read(k, []); const r = { id: uid(), at: "2026-11-13T12:00:00.000Z", ...rec }; l.push(r); write(k, l); return r; },
          update(k, id, patch) { write(k, read(k, []).map((r) => (r.id === id ? { ...r, ...patch } : r))); },
          remove(k, id) { write(k, read(k, []).filter((r) => r.id !== id)); },
          dump: () => ({ pillar, data: {} }),
          load() {},
        };
      },
      download() {},
      pickFile: async () => null,
      tabs() {},
      spark() {},
      field() {},
      G: { ring: () => [], line: () => [], poly: () => [] },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  for (const rel of scripts) {
    vm.runInContext(readRepo(rel), sandbox, { filename: rel });
  }
  return { env: sandbox, doc, ls, ss, toasts };
}

test("observatory: scan() hardens HTTP 500, malformed JSON, HTML, offline & timeout while preserving cached signals, and valid scan sorts + publishes PB.events", async () => {
  const cachedSignals = [
    { subject: "t-ai", title: "Cached Prior Signal", url: "https://example.com/cached", at: "2026-11-12T10:00:00Z", points: 42, source: "Hacker News", kind: "unverified-signal" },
  ];
  let fetchHandler = async () => ({ ok: true, status: 500, json: async () => ({ error: "boom" }) });

  const { env, doc, ls } = bootPillarEnv({
    scripts: ["kit/bus.js", "pillars/observatory/app.js"],
    seedLocal: {
      "prometheus.observatory.subjects": JSON.stringify([{ id: "t-ai", name: "AI", q: "AI", from: "you" }]),
      "prometheus.observatory.signals": JSON.stringify(cachedSignals),
      "prometheus.observatory.scanned": JSON.stringify("2026-11-12T10:00:00Z"),
    },
    fetchImpl: (...args) => fetchHandler(...args),
  });

  // 1. HTTP 500 preserves cached signals & reports failed state
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);
  assert.equal(env.OBSERVATORY.data().scanned, "2026-11-12T10:00:00Z");
  assert.equal(env.PB.events.list().length, 0);
  assert.match(doc.getElementById("o-state").textContent, /Scan failed/i);
  assert.match(doc.getElementById("o-state").textContent, /preserved/i);

  // 2. Malformed JSON syntax error preserves cached signals
  fetchHandler = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => { throw new SyntaxError("Unexpected token <"); },
  });
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);

  // 3. Valid JSON missing `hits` array preserves cached signals
  fetchHandler = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ status: "ok", items: [] }),
  });
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);

  // 4. HTML response content-type rejected cleanly
  fetchHandler = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => "text/html; charset=utf-8" },
    json: async () => ({ hits: [{ title: "Should not trust HTML" }] }),
  });
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);

  // 5. Network offline rejection preserves cached signals
  fetchHandler = async () => { throw new TypeError("Failed to fetch"); };
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);

  // 6. AbortController timeout aborts slow request and preserves cached signals
  let sawAbortSignal = false;
  fetchHandler = (_url, opts) => new Promise((_resolve, reject) => {
    assert.ok(opts && opts.signal, "fetch receives AbortSignal");
    opts.signal.addEventListener("abort", () => {
      sawAbortSignal = true;
      const err = new Error("Aborted");
      err.name = "AbortError";
      reject(err);
    });
  });
  await env.OBSERVATORY.scan({ timeoutMs: 25 });
  assert.equal(sawAbortSignal, true);
  assert.equal(env.OBSERVATORY.data().state, "failed");
  assert.deepEqual(env.OBSERVATORY.data().signals, cachedSignals);
  assert.match(doc.getElementById("o-state").textContent, /timed out/i);

  // 7. Valid HN response updates signals sorted newest-first & publishes PB.events
  fetchHandler = async (url, opts) => {
    assert.ok(opts && opts.signal);
    assert.match(url, /query=AI/);
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({
        hits: [
          { objectID: "1", title: "Older Story", url: "https://example.com/old", created_at: "2026-11-13T08:00:00Z", points: 12 },
          { objectID: "2", title: "Newest Story", url: "", created_at: "2026-11-13T18:00:00Z", points: 99 },
          { objectID: "3", title: "Middle Story", url: "https://example.com/mid", created_at: "2026-11-13T12:00:00Z", points: 25 },
        ],
      }),
    };
  };
  await env.OBSERVATORY.scan();
  assert.equal(env.OBSERVATORY.data().state, "idle");
  assert.deepEqual(env.OBSERVATORY.data().signals.map((s) => s.title), ["Newest Story", "Middle Story", "Older Story"]);
  assert.equal(env.OBSERVATORY.data().signals[0].url, "https://news.ycombinator.com/item?id=2");
  const evs = env.PB.events.list();
  assert.equal(evs.length, 1);
  assert.equal(evs[0].type, "scan.done");
  assert.equal(evs[0].pillar, "observatory");
  assert.equal(JSON.parse(ls.getItem("prometheus.observatory.signals")).length, 3);

  // 8. classifySignal + filterView + filter toggle bar UI
  assert.equal(env.OBSERVATORY.classifySignal(env.OBSERVATORY.data().signals[0]), "unverified-signal");
  assert.equal(env.OBSERVATORY.classifySignal({ kind: "verified", text: "Benchmarked locally" }), "verified-fact");
  assert.equal(env.OBSERVATORY.classifySignal({ kind: "opinion", text: "Worth exploring" }), "opinion");
  assert.equal(env.OBSERVATORY.classifySignal({ kind: "question", text: "Does it scale?" }), "question");

  ls.setItem("prometheus.observatory.notes", JSON.stringify([
    { id: "n1", subject: "t-ai", kind: "verified", text: "Verified benchmark note", at: "2026-11-13T19:00:00Z" },
    { id: "n2", subject: "t-ai", kind: "opinion", text: "Opinion note", at: "2026-11-13T17:00:00Z" },
    { id: "n3", subject: "t-ai", kind: "question", text: "Open question note", at: "2026-11-13T16:00:00Z" },
  ]));

  const filterBar = doc.getElementById("o-filter");
  assert.ok(filterBar, "filter toggle bar rendered");
  assert.deepEqual(filterBar.querySelectorAll("button").map((b) => b.textContent), ["All", "Unverified Signals", "Verified Notes"]);

  const onlyUnverified = env.OBSERVATORY.filterView("unverified");
  assert.equal(onlyUnverified.signals.length, 3);
  assert.equal(onlyUnverified.notes.length, 0);
  assert.equal(doc.getElementById("o-signals").querySelectorAll(".kv").length, 3);
  assert.equal(doc.getElementById("o-notes").querySelectorAll(".kv").length, 0);

  // Clicking Verified Notes button filters to verified-fact notes only
  filterBar.querySelector('[data-filter="verified"]').click();
  const onlyVerified = env.OBSERVATORY.filterView();
  assert.equal(onlyVerified.mode, "verified");
  assert.equal(onlyVerified.signals.length, 0);
  assert.equal(onlyVerified.notes.length, 1);
  assert.equal(onlyVerified.notes[0].id, "n1");
  assert.equal(doc.getElementById("o-signals").querySelectorAll(".kv").length, 0);
  assert.equal(doc.getElementById("o-notes").querySelectorAll(".kv").length, 1);

  filterBar.querySelector('[data-filter="all"]').click();
  assert.equal(doc.getElementById("o-signals").querySelectorAll(".kv").length, 3);
  assert.equal(doc.getElementById("o-notes").querySelectorAll(".kv").length, 3);
});

test("garage: preserves DOM IDs & calc math, estimates trips (EPA + logged MPG), computes nextDueServices & Sync to Kairos publishes PB deadline + event", () => {
  const { env, doc, toasts } = bootPillarEnv({
    scripts: ["kit/bus.js", "pillars/garage/calc.js", "pillars/garage/app.js"],
    todayStr: "2026-11-13",
    seedLocal: {
      "prometheus.garage.odometer": JSON.stringify(15100),
      "prometheus.garage.services": JSON.stringify([
        { id: "svc-oil", name: "Engine oil + filter", miles: 5000, months: 6 },
        { id: "svc-tire", name: "Tire rotation", miles: 8000, months: 12 },
        { id: "svc-plugs", name: "Spark plugs", miles: 48000, months: null },
      ]),
      "prometheus.garage.history": JSON.stringify([
        { id: "h1", service: "Engine oil + filter", date: "2026-05-01", odometer: 10000, cost: 85 },
        { id: "h2", service: "Tire rotation", date: "2026-09-01", odometer: 14000, cost: 35 },
      ]),
    },
  });

  // Preserved DOM IDs
  for (const id of ["g-paper-form", "g-dossier-preview", "g-odo", "g-trip", "g-trip-mi", "g-gas-price", "g-services", "g-addsvc", "g-log", "g-fuel"]) {
    assert.ok(doc.getElementById(id), `Expected #${id} to exist`);
  }

  // Preserves calc.js math + adds depth API
  assert.equal(typeof env.GARAGE.fuelStats, "function");
  assert.equal(typeof env.GARAGE.dueStatus, "function");
  assert.equal(typeof env.GARAGE.data, "function");
  assert.equal(typeof env.GARAGE.estimateTrip, "function");
  assert.equal(typeof env.GARAGE.nextDueServices, "function");

  // EPA fallback trip cost (<2 fills logged -> 34 MPG)
  const epaEst = env.GARAGE.estimateTrip(84, 4.65);
  assert.equal(epaEst.source, "epa");
  assert.equal(epaEst.mpg, 34);
  assert.ok(Math.abs(epaEst.cost - (84 * (4.65 / 34))) < 1e-6);

  // Logged fuel span trip cost (>=2 fills logged)
  const loggedEst = env.GARAGE.estimateTrip({
    miles: 100,
    gasPrice: 5.00,
    fuel: [
      { date: "2026-11-01", odometer: 10000, gallons: 10, cost: 45 },
      { date: "2026-11-10", odometer: 10360, gallons: 9, cost: 45 },
    ],
  });
  assert.equal(loggedEst.source, "logged");
  assert.equal(loggedEst.mpg, 360 / 9);
  assert.ok(Math.abs(loggedEst.costPerMile - (90 / 360)) < 1e-6);
  assert.ok(Math.abs(loggedEst.cost - 25) < 1e-6);

  // nextDueServices sorts overdue first & supplies nextDueDate
  const due = env.GARAGE.nextDueServices({ date: "2026-11-13", odometer: 15100 });
  assert.equal(due.length, 3);
  assert.equal(due[0].id, "svc-oil");
  assert.equal(due[0].state, "overdue");
  assert.equal(due[0].nextDueDate, "2026-11-01");
  assert.equal(due[1].id, "svc-tire");
  assert.equal(due[1].state, "ok");
  assert.equal(due[1].nextDueDate, "2027-09-01");
  assert.equal(due[2].id, "svc-plugs");
  assert.equal(due[2].state, "unknown");
  assert.equal(due[2].nextDueDate, null);

  // Sync to Kairos button publishes deadline + deadline:garage event
  const syncBtns = doc.getElementById("g-services").querySelectorAll("[data-sync]");
  assert.equal(syncBtns.length, 3);
  const tireSyncBtn = syncBtns.find((b) => b.dataset.sync === "svc-tire");
  assert.ok(tireSyncBtn, "Sync to Kairos button exists on tire row");
  assert.equal(tireSyncBtn.textContent, "Sync to Kairos");
  tireSyncBtn.click();

  const dl = env.PB.deadlines.list().find((d) => d.source === "garage" && d.ref === "svc-tire");
  assert.ok(dl, "deadline published to PB.deadlines");
  assert.equal(dl.date, "2027-09-01");
  assert.equal(dl.kind, "service");
  assert.equal(dl.title, "Sorento: Tire rotation");

  const ev = env.PB.events.list().find((e) => e.type === "deadline:garage");
  assert.ok(ev, "deadline:garage event published to PB.events");
  assert.equal(ev.pillar, "garage");
  assert.match(ev.title, /Tire rotation/);
  assert.ok(toasts.some((t) => /Synced/i.test(t)));
});

test("apollo: preserves required DOM IDs and computeReview() computes 7d vs 30d delta averages across all 6 metrics", () => {
  const { env, doc } = bootPillarEnv({
    scripts: ["kit/bus.js", "pillars/apollo/app.js"],
    todayStr: "2026-11-13",
  });

  for (const id of ["a-radar", "a-form", "apollo-data", "apollo-biomarkers", "a-review"]) {
    assert.ok(doc.getElementById(id), `Expected #${id} to exist`);
  }
  assert.equal(typeof env.APOLLO.data, "function");
  assert.equal(typeof env.APOLLO.computeReview, "function");

  // Build 14 days ending 2026-11-13:
  // Days 1-7 (Nov 00..06 -> Oct 31..Nov 06): older baseline
  // Days 8-14 (Nov 07..Nov 13): recent 7d window
  const daysMap = {};
  const older = ["2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];
  const recent = ["2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"];
  for (const d of older) {
    daysMap[d] = { weight: 190, sleep: 6.5, steps: 6000, train: 20, protein: 130, calories: 2400 };
  }
  for (const d of recent) {
    daysMap[d] = { weight: 186, sleep: 7.5, steps: 10000, train: 40, protein: 160, calories: 2100 };
  }

  const rev = env.APOLLO.computeReview(daysMap, "2026-11-13");
  assert.equal(rev.asOf, "2026-11-13");
  assert.equal(rev.daysCount, 14);
  assert.equal(rev.latestWeight, 186);
  assert.equal(rev.proteinAnchor, Math.round(186 * 0.8));

  // 7d avg is recent values; 30d avg is midpoint across 14 days; delta = 7d - 30d
  assert.equal(rev.weight.avg7, 186);
  assert.equal(rev.weight.avg30, 188);
  assert.equal(rev.weight.delta, -2);

  assert.equal(rev.sleep.avg7, 7.5);
  assert.equal(rev.sleep.avg30, 7);
  assert.equal(rev.sleep.delta, 0.5);

  assert.equal(rev.steps.avg7, 10000);
  assert.equal(rev.steps.avg30, 8000);
  assert.equal(rev.steps.delta, 2000);

  assert.equal(rev.train.avg7, 40);
  assert.equal(rev.train.avg30, 30);
  assert.equal(rev.train.delta, 10);

  assert.equal(rev.protein.avg7, 160);
  assert.equal(rev.protein.avg30, 145);
  assert.equal(rev.protein.delta, 15);

  assert.equal(rev.calories.avg7, 2100);
  assert.equal(rev.calories.avg30, 2250);
  assert.equal(rev.calories.delta, -150);

  // Empty map returns nulls cleanly
  const emptyRev = env.APOLLO.computeReview({}, "2026-11-13");
  assert.equal(emptyRev.weight.avg7, null);
  assert.equal(emptyRev.weight.avg30, null);
  assert.equal(emptyRev.weight.delta, null);
  assert.equal(emptyRev.proteinAnchor, null);
});

test("records: preserves required DOM IDs and exportShieldSummary() returns overdue, 7d urgent school shield, 30d renewal counts & text summary", () => {
  const { env, doc } = bootPillarEnv({
    scripts: ["kit/bus.js", "pillars/records/calc.js", "pillars/records/app.js"],
    todayStr: "2026-11-13",
    seedLocal: {
      "prometheus.records.docs": JSON.stringify([
        { id: "d1", title: "Expired Smog Check", category: "vehicle", due: "2026-11-10", serial: "SMOG-01", where: "Glovebox" },
        { id: "d2", title: "TK Immunization Packet", category: "school", due: "2026-11-18", serial: "TK-01", where: "Kitchen Binder" },
        { id: "d3", title: "Homeowners Insurance Renewal", category: "home", due: "2026-12-05", serial: "POL-99", where: "Drive" },
        { id: "d4", title: "Passport Renewal", category: "identity", due: "2027-06-01", serial: "PP-123", where: "Safe" },
        { id: "d5", title: "Birth Certificate", category: "identity", due: "", serial: "BC-01", where: "Safe" },
      ]),
    },
  });

  for (const id of ["r-seed-demo", "r-alerts", "r-form", "r-list", "r-q"]) {
    assert.ok(doc.getElementById(id), `Expected #${id} to exist`);
  }
  assert.equal(typeof env.RECORDS_APP.data, "function");
  assert.equal(typeof env.RECORDS_APP.exportShieldSummary, "function");

  const sh = env.RECORDS_APP.exportShieldSummary();
  assert.equal(sh.today, "2026-11-13");
  assert.equal(sh.total, 5);
  assert.equal(sh.overdue, 1);
  assert.equal(sh.urgentSchool, 1);
  assert.equal(sh.renewals30, 1);
  assert.equal(sh.within30, 2);
  assert.equal(sh.ok, 1);
  assert.equal(sh.undated, 1);
  assert.match(sh.summary, /RECORDS SHIELD SUMMARY — 2026-11-13/);
  assert.match(sh.summary, /Overdue: 1 \| 7-Day School Shield \(Urgent\): 1 \| 30-Day Renewals: 1/);
  assert.match(sh.summary, /Expired Smog Check/);
  assert.match(sh.summary, /TK Immunization Packet/);
  assert.match(sh.summary, /Homeowners Insurance Renewal/);

  // Seed demo button works and updates counts cleanly
  doc.getElementById("r-seed-demo").click();
  const afterSeed = env.RECORDS_APP.exportShieldSummary();
  assert.equal(afterSeed.total, 7);
  assert.equal(afterSeed.urgentSchool, 2);
  assert.equal(afterSeed.renewals30, 2);
});
