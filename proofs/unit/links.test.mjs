import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");

function createStorage(seed = {}) {
  const m = new Map(Object.entries(seed).map(([k, v]) => [String(k), String(v)]));
  return {
    get length() { return m.size; },
    key(i) { return Array.from(m.keys())[i] ?? null; },
    getItem(k) { return m.has(k) ? m.get(k) : null; },
    setItem(k, v) { m.set(String(k), String(v)); },
    removeItem(k) { m.delete(String(k)); },
    clear() { m.clear(); },
  };
}

function installGlobalStorage(localSeed = {}, sessionSeed = {}) {
  if (!globalThis.localStorage) {
    globalThis.localStorage = createStorage();
  } else {
    globalThis.localStorage.clear();
  }
  for (const [k, v] of Object.entries(localSeed)) globalThis.localStorage.setItem(k, String(v));

  if (!globalThis.sessionStorage) {
    globalThis.sessionStorage = createStorage();
  } else {
    globalThis.sessionStorage.clear();
  }
  for (const [k, v] of Object.entries(sessionSeed)) globalThis.sessionStorage.setItem(k, String(v));
}

/** Minimal DOM implementation capable of running kit/kit.js, foundry/app.js, and hearth/app.js in Node VM. */
function createMiniDom(pathname = "/pillars/foundry/") {
  class MiniClassList {
    constructor(el) { this.el = el; }
    _set() { return new Set(String(this.el._attrs.class || "").split(/\s+/).filter(Boolean)); }
    _save(s) { const v = [...s].join(" "); if (v) this.el._attrs.class = v; else delete this.el._attrs.class; }
    add(...names) { const s = this._set(); for (const n of names) if (n) s.add(n); this._save(s); }
    remove(...names) { const s = this._set(); for (const n of names) s.delete(n); this._save(s); }
    toggle(n, force) {
      const s = this._set();
      const on = force !== undefined ? !!force : !s.has(n);
      if (on) s.add(n); else s.delete(n);
      this._save(s);
      return on;
    }
    contains(n) { return this._set().has(n); }
  }

  class MiniText {
    constructor(text) { this.nodeType = 3; this._text = String(text ?? ""); this.parentNode = null; }
    get textContent() { return this._text; }
    set textContent(v) { this._text = String(v ?? ""); }
  }

  function matchesSimple(el, sel) {
    if (!el || el.nodeType !== 1) return false;
    let rest = sel.trim();
    const attrMatches = [];
    rest = rest.replace(/\[([^\]]+)\]/g, (_, body) => {
      const m = body.match(/^([^=\s]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s]*)))?$/);
      if (m) attrMatches.push({ key: m[1], val: m[2] ?? m[3] ?? m[4] ?? null });
      return "";
    });
    let idMatch = null;
    rest = rest.replace(/#([A-Za-z0-9_-]+)/g, (_, id) => { idMatch = id; return ""; });
    const clsMatches = [];
    rest = rest.replace(/\.([A-Za-z0-9_-]+)/g, (_, cls) => { clsMatches.push(cls); return ""; });
    const tagMatch = rest.trim().toLowerCase();
    if (tagMatch && tagMatch !== "*" && el.tagName.toLowerCase() !== tagMatch) return false;
    if (idMatch && el.id !== idMatch) return false;
    for (const c of clsMatches) if (!el.classList.contains(c)) return false;
    for (const a of attrMatches) {
      const has = el.hasAttribute(a.key);
      if (!has) return false;
      if (a.val !== null && el.getAttribute(a.key) !== a.val) return false;
    }
    return true;
  }

  function matchesSelector(el, sel) {
    return sel.split(",").some((part) => {
      const tokens = part.trim().split(/\s+/).filter(Boolean);
      if (!tokens.length) return false;
      const last = tokens[tokens.length - 1];
      if (!matchesSimple(el, last)) return false;
      let cur = el.parentNode;
      for (let i = tokens.length - 2; i >= 0; i--) {
        while (cur && !matchesSimple(cur, tokens[i])) cur = cur.parentNode;
        if (!cur) return false;
        cur = cur.parentNode;
      }
      return true;
    });
  }

  class MiniElement {
    constructor(tag) {
      this.nodeType = 1;
      this.tagName = String(tag || "div").toUpperCase();
      this.childNodes = [];
      this.parentNode = null;
      this._attrs = {};
      this._listeners = new Map();
      this.style = {};
      this.hidden = false;
      this._value = undefined;
      this._checked = undefined;
      this.classList = new MiniClassList(this);
      this.dataset = new Proxy({}, {
        get: (_, prop) => {
          const k = "data-" + String(prop).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          return this._attrs[k];
        },
        set: (_, prop, val) => {
          const k = "data-" + String(prop).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          this._attrs[k] = String(val);
          return true;
        },
        deleteProperty: (_, prop) => {
          const k = "data-" + String(prop).replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
          delete this._attrs[k];
          return true;
        },
      });
      if (this.tagName === "FORM") {
        return new Proxy(this, {
          get(target, prop, receiver) {
            if (prop in target) return Reflect.get(target, prop, receiver);
            const named = target.querySelector(`[name="${String(prop)}"]`);
            if (named) return named;
            return undefined;
          },
        });
      }
    }
    get id() { return this._attrs.id || ""; }
    set id(v) { this._attrs.id = String(v); }
    get className() { return this._attrs.class || ""; }
    set className(v) { if (v) this._attrs.class = String(v); else delete this._attrs.class; }
    get value() {
      if (this._value !== undefined) return this._value;
      if (this.tagName === "SELECT") {
        const opts = this.querySelectorAll("option");
        const sel = opts.find((o) => o.hasAttribute("selected")) || opts[0];
        return sel ? sel.value : "";
      }
      return this._attrs.value ?? "";
    }
    set value(v) { this._value = String(v ?? ""); this._attrs.value = this._value; }
    get checked() { return this._checked !== undefined ? this._checked : this.hasAttribute("checked"); }
    set checked(v) { this._checked = !!v; if (v) this._attrs.checked = ""; else delete this._attrs.checked; }
    get isConnected() { return true; }
    get children() { return this.childNodes.filter((n) => n.nodeType === 1); }
    get textContent() { return this.childNodes.map((n) => n.textContent).join(""); }
    set textContent(v) { this.childNodes = v === "" || v == null ? [] : [new MiniText(v)]; }
    get innerHTML() { return this.textContent; }
    set innerHTML(html) {
      this.childNodes = [];
      parseHtmlInto(String(html || ""), this);
    }
    setAttribute(k, v) {
      const key = String(k);
      this._attrs[key] = String(v);
      if (key === "value") this._value = String(v);
      if (key === "checked") this._checked = true;
    }
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; }
    hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k); }
    removeAttribute(k) { delete this._attrs[k]; }
    append(...nodes) {
      for (const n of nodes) {
        if (n == null) continue;
        const node = typeof n === "string" ? new MiniText(n) : n;
        node.parentNode = this;
        this.childNodes.push(node);
      }
    }
    prepend(...nodes) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        if (n == null) continue;
        const node = typeof n === "string" ? new MiniText(n) : n;
        node.parentNode = this;
        this.childNodes.unshift(node);
      }
    }
    appendChild(n) { this.append(n); return n; }
    replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
    remove() {
      if (this.parentNode) this.parentNode.childNodes = this.parentNode.childNodes.filter((c) => c !== this);
      this.parentNode = null;
    }
    addEventListener(type, fn) {
      if (!this._listeners.has(type)) this._listeners.set(type, []);
      this._listeners.get(type).push(fn);
    }
    dispatchEvent(ev) {
      if (!ev.target) ev.target = this;
      if (!ev.preventDefault) ev.preventDefault = () => {};
      const handler = this["on" + ev.type];
      if (typeof handler === "function") handler.call(this, ev);
      for (const fn of this._listeners.get(ev.type) || []) fn.call(this, ev);
      return true;
    }
    click() {
      this.dispatchEvent({ type: "click", target: this, preventDefault() {} });
    }
    reset() {
      for (const inp of this.querySelectorAll("input, textarea")) inp.value = "";
    }
    querySelectorAll(sel) {
      const out = [];
      const walk = (node) => {
        for (const c of node.children || []) {
          if (matchesSelector(c, sel)) out.push(c);
          walk(c);
        }
      };
      walk(this);
      return out;
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  }

  const VOID_TAGS = new Set(["input", "br", "hr", "img", "meta", "link"]);
  function parseHtmlInto(html, root) {
    const stack = [root];
    const re = /<(\/?)([A-Za-z0-9-]+)([^>]*)>|([^<]+)/g;
    let m;
    while ((m = re.exec(html))) {
      const top = stack[stack.length - 1];
      if (m[4]) {
        top.append(new MiniText(m[4]));
        continue;
      }
      const closing = m[1] === "/";
      const tag = m[2].toLowerCase();
      if (closing) {
        for (let i = stack.length - 1; i >= 1; i--) {
          if (stack[i].tagName.toLowerCase() === tag) { stack.length = i; break; }
        }
        continue;
      }
      const el = new MiniElement(tag);
      const attrStr = m[3] || "";
      const attrRe = /([A-Za-z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
      let am;
      while ((am = attrRe.exec(attrStr))) {
        if (am[1] === "/") continue;
        el.setAttribute(am[1], am[2] ?? am[3] ?? am[4] ?? "");
      }
      top.append(el);
      if (!VOID_TAGS.has(tag) && !attrStr.trim().endsWith("/")) stack.push(el);
    }
  }

  const documentElement = new MiniElement("html");
  const body = new MiniElement("body");
  const app = new MiniElement("main");
  app.id = "app";
  const exp = new MiniElement("button");
  exp.id = "export";
  const imp = new MiniElement("button");
  imp.id = "import";
  body.append(app, exp, imp);
  documentElement.append(body);

  const docListeners = new Map();
  const document = {
    documentElement,
    body,
    readyState: "complete",
    createElement: (tag) => new MiniElement(tag),
    createTextNode: (text) => new MiniText(text),
    getElementById: (id) => documentElement.querySelector(`#${id}`),
    querySelector: (sel) => documentElement.querySelector(sel),
    querySelectorAll: (sel) => documentElement.querySelectorAll(sel),
    addEventListener: (t, fn) => { if (!docListeners.has(t)) docListeners.set(t, []); docListeners.get(t).push(fn); },
  };
  return { document, pathname };
}

function runPillarEnv(scripts, { localSeed = {}, sessionSeed = {}, pathname = "/pillars/foundry/" } = {}) {
  const localStorage = createStorage(localSeed);
  const sessionStorage = createStorage(sessionSeed);
  const { document } = createMiniDom(pathname);
  const toasts = [];
  const winListeners = new Map();

  class CustomEvent {
    constructor(type, opts = {}) { this.type = type; this.detail = opts.detail; }
  }

  const context = {
    localStorage,
    sessionStorage,
    document,
    location: { pathname, search: "", hash: "", href: `http://localhost${pathname}` },
    history: { replaceState() {}, pushState() {} },
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: () => 1,
    CustomEvent,
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout,
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Set,
    Map,
    Error,
    encodeURIComponent,
    decodeURIComponent,
    alert: () => {},
    confirm: () => true,
    prompt: () => null,
    addEventListener: (t, fn) => { if (!winListeners.has(t)) winListeners.set(t, []); winListeners.get(t).push(fn); },
    dispatchEvent: (ev) => { for (const fn of winListeners.get(ev.type) || []) fn(ev); return true; },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  for (const rel of scripts) {
    const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
    vm.runInContext(code, context, { filename: rel });
    if (rel === "kit/kit.js" && context.PK) {
      const origToast = context.PK.toast;
      context.PK.toast = (msg, ms, undo) => { toasts.push(msg); return origToast(msg, ms, undo); };
    }
  }
  return { context, document, localStorage, sessionStorage, toasts };
}

test("PLinks.link() stores in prometheus.bus.links, assigns stable id & timestamp, deduplicates, and emits PB.events", async () => {
  installGlobalStorage();
  await import("../../kit/bus.js");
  await import("../../kit/links.js");

  const first = globalThis.PLinks.link({
    fromPillar: "athenaeum",
    fromId: "idea-1",
    toPillar: "foundry",
    toId: "proj-1",
    kind: "builds-from",
    label: "Solar Concentrator",
  });
  assert.ok(first.id && first.id.startsWith("lnk_"));
  assert.ok(/^\d{4}-\d{2}-\d{2}T/.test(first.at));
  assert.equal(first.kind, "builds-from");

  // Deduplicates identical { fromPillar, fromId, toPillar, toId, kind } without duplicate PB event
  const dup = globalThis.PLinks.link({
    fromPillar: "athenaeum",
    fromId: "idea-1",
    toPillar: "foundry",
    toId: "proj-1",
    kind: "builds-from",
    label: "Solar Concentrator",
  });
  assert.equal(dup.id, first.id);
  assert.equal(dup.at, first.at);
  assert.equal(globalThis.PLinks.list().length, 1);

  const stored = JSON.parse(globalThis.localStorage.getItem("prometheus.bus.links"));
  assert.equal(stored.length, 1);
  assert.equal(stored[0].id, first.id);

  // Distinct kind creates distinct link with a distinct stable id
  const altKind = globalThis.PLinks.link({
    fromPillar: "athenaeum",
    fromId: "idea-1",
    toPillar: "foundry",
    toId: "proj-1",
    kind: "references",
    label: "Background notes",
  });
  assert.notEqual(altKind.id, first.id);
  assert.equal(globalThis.PLinks.list().length, 2);

  const events = globalThis.PB.events.list().filter((e) => e.type === "link.created");
  assert.equal(events.length, 2);
  assert.equal(events[0].pillar, "athenaeum");
  assert.equal(events[0].ref, first.id);
  assert.equal(events[0].title, "Solar Concentrator");
});

test("PLinks unlink(), forRecord() (outbound + inbound), and forPillar()", async () => {
  installGlobalStorage();
  await import("../../kit/bus.js");
  await import("../../kit/links.js");

  const l1 = globalThis.PLinks.link({ fromPillar: "athenaeum", fromId: "i1", toPillar: "foundry", toId: "p1", kind: "builds-from" });
  const l2 = globalThis.PLinks.link({ fromPillar: "foundry", fromId: "p1", toPillar: "forge", toId: "a1", kind: "handoff-to" });
  const l3 = globalThis.PLinks.link({ fromPillar: "hearth", fromId: "decking-2x6x12", toPillar: "records", toId: "doc1", kind: "documented-by" });

  // Inbound + outbound for foundry/p1
  const forFoundryP1 = globalThis.PLinks.forRecord("foundry", "p1").map((x) => x.id);
  assert.deepEqual(forFoundryP1, [l1.id, l2.id]);

  // forPillar returns all links touching that pillar
  assert.deepEqual(globalThis.PLinks.forPillar("athenaeum").map((x) => x.id), [l1.id]);
  assert.deepEqual(globalThis.PLinks.forPillar("foundry").map((x) => x.id), [l1.id, l2.id]);
  assert.deepEqual(globalThis.PLinks.forPillar("records").map((x) => x.id), [l3.id]);

  assert.equal(globalThis.PLinks.unlink(l1.id), true);
  assert.equal(globalThis.PLinks.unlink("nonexistent"), false);
  assert.deepEqual(globalThis.PLinks.forRecord("foundry", "p1").map((x) => x.id), [l2.id]);
  assert.deepEqual(globalThis.PLinks.forPillar("athenaeum"), []);
});

test("PLinks.resolve() reads live title/status from all 6 authoritative stores without copying fields", async () => {
  installGlobalStorage({
    "prometheus.athenaeum.ideas": JSON.stringify([{ id: "idea-42", title: "Hydroponic Tower", archived: false }]),
    "prometheus.foundry.projects": JSON.stringify([{ id: "proj-7", title: "Tower v1", stage: 1 }]),
    "prometheus.forge.assignments": JSON.stringify([{ id: "asg-3", title: "CAD Valve", state: "out" }]),
    "prometheus.records.docs": JSON.stringify([{ id: "doc-9", title: "Pump Warranty", category: "warranty", due: "2099-01-01" }]),
    "prometheus.hearth.materials": JSON.stringify([{ id: "decking-2x6x12", name: "2x6x12 Deck Boards", status: "planned" }]),
    "prometheus.garage.services": JSON.stringify([{ id: "svc-oil", name: "Engine oil + filter", miles: 5000, months: 6 }]),
  });
  await import("../../kit/bus.js");
  await import("../../kit/links.js");

  const lAthFoundry = globalThis.PLinks.link({ fromPillar: "athenaeum", fromId: "idea-42", toPillar: "foundry", toId: "proj-7", kind: "builds-from" });
  const lFoundryForge = globalThis.PLinks.link({ fromPillar: "foundry", fromId: "proj-7", toPillar: "forge", toId: "asg-3", kind: "handoff-to" });
  const lHearthRec = globalThis.PLinks.link({ fromPillar: "hearth", fromId: "decking-2x6x12", toPillar: "records", toId: "doc-9", kind: "documented-by" });
  const lGarageRec = globalThis.PLinks.link({ fromPillar: "garage", fromId: "svc-oil", toPillar: "records", toId: "doc-9", kind: "receipt-in" });

  // Verify no authoritative fields were duplicated into prometheus.bus.links
  const rawStored = JSON.parse(globalThis.localStorage.getItem("prometheus.bus.links"));
  for (const row of rawStored) {
    assert.deepEqual(Object.keys(row).sort(), ["at", "fromId", "fromPillar", "id", "kind", "label", "toId", "toPillar"]);
    assert.equal(row.title, undefined);
    assert.equal(row.status, undefined);
  }

  // Initial resolution
  let r1 = globalThis.PLinks.resolve(lAthFoundry);
  assert.equal(r1.from.title, "Hydroponic Tower");
  assert.equal(r1.from.status, "active");
  assert.equal(r1.to.title, "Tower v1");
  assert.equal(r1.to.status, "Research");

  // Mutate authoritative stores and confirm live resolve() reflects updates immediately
  globalThis.localStorage.setItem("prometheus.athenaeum.ideas", JSON.stringify([{ id: "idea-42", title: "Hydroponic Tower Rev B", archived: true }]));
  globalThis.localStorage.setItem("prometheus.foundry.projects", JSON.stringify([{ id: "proj-7", title: "Tower v2", stage: 4 }]));
  globalThis.localStorage.setItem("prometheus.forge.assignments", JSON.stringify([{ id: "asg-3", title: "CAD Valve v2", state: "reviewed" }]));
  globalThis.localStorage.setItem("prometheus.records.docs", JSON.stringify([{ id: "doc-9", title: "Pump Extended Warranty", category: "warranty", due: "2020-01-01" }]));
  globalThis.localStorage.setItem("prometheus.hearth.materials", JSON.stringify([{ id: "decking-2x6x12", name: "2x6x12 Cedar Boards", status: "purchased" }]));
  globalThis.localStorage.setItem("prometheus.garage.services", JSON.stringify([{ id: "svc-oil", name: "Synthetic Oil + Filter", miles: 5000, months: 6, status: "due soon" }]));

  r1 = globalThis.PLinks.resolve(lAthFoundry);
  assert.equal(r1.from.title, "Hydroponic Tower Rev B");
  assert.equal(r1.from.status, "archived");
  assert.equal(r1.to.title, "Tower v2");
  assert.equal(r1.to.status, "Test");

  const r2 = globalThis.PLinks.resolve(lFoundryForge);
  assert.equal(r2.to.title, "CAD Valve v2");
  assert.equal(r2.to.status, "reviewed");

  const r3 = globalThis.PLinks.resolve(lHearthRec);
  assert.equal(r3.from.title, "2x6x12 Cedar Boards");
  assert.equal(r3.from.status, "purchased");
  assert.equal(r3.to.title, "Pump Extended Warranty");
  assert.equal(r3.to.status, "overdue");

  const r4 = globalThis.PLinks.resolve(lGarageRec);
  assert.equal(r4.from.title, "Synthetic Oil + Filter");
  assert.equal(r4.from.status, "due soon");

  // Delete target record and confirm missing status
  globalThis.localStorage.setItem("prometheus.records.docs", JSON.stringify([]));
  const rMissing = globalThis.PLinks.resolve(lHearthRec);
  assert.equal(rMissing.to.found, false);
  assert.equal(rMissing.to.title, null);
  assert.equal(rMissing.to.status, "missing");
});

test("Foundry creates athenaeum -> foundry builds-from links, renders live badges, and Send to Forge hands off cleanly", () => {
  const idea = { id: "inv-1", title: "Modular Conveyor Trailer", tags: ["invention"], created: "2026-11-10", strength: 91, archived: false };
  const env = runPillarEnv(
    ["kit/kit.js", "kit/bus.js", "kit/links.js", "pillars/foundry/app.js"],
    {
      pathname: "/pillars/foundry/",
      localSeed: {
        "prometheus.athenaeum.ideas": JSON.stringify([idea]),
        "prometheus.forge.assignments": JSON.stringify([{ id: "fg-1", title: "Modular Conveyor Trailer", state: "out" }]),
      },
    }
  );

  // Start build from #y-board button
  const boardBtn = env.document.querySelector("#y-board button");
  assert.ok(boardBtn, "Foundry #y-board start build button exists");
  boardBtn.click();

  const data = env.context.FOUNDRY.data();
  assert.equal(data.projects.length, 1);
  assert.equal(data.board.length, 0);
  const proj = data.projects[0];

  const projLinks = env.context.PLinks.forRecord("foundry", proj.id);
  assert.equal(projLinks.length, 1);
  assert.equal(projLinks[0].fromPillar, "athenaeum");
  assert.equal(projLinks[0].fromId, "inv-1");
  assert.equal(projLinks[0].toPillar, "foundry");
  assert.equal(projLinks[0].toId, proj.id);
  assert.equal(projLinks[0].kind, "builds-from");

  // Badge rendered inside #y-bench
  const badge = env.document.querySelector("#y-bench .link-badge");
  assert.ok(badge, "Resolved link badge renders on bench card");
  assert.ok(badge.textContent.includes("Modular Conveyor Trailer"));

  // Send to Forge stores sessionStorage handoff, links foundry -> forge, toasts, and navigates
  const sendBtn = env.document.querySelector('#y-bench [data-action="send-forge"]');
  assert.ok(sendBtn, "Send to Forge button renders on bench card");
  sendBtn.click();

  const handoff = JSON.parse(env.sessionStorage.getItem("prometheus.handoff"));
  assert.deepEqual(handoff, { pillar: "forge", title: "Modular Conveyor Trailer", foundryId: proj.id });
  assert.ok(env.toasts.some((m) => /forge/i.test(m)));
  assert.equal(env.context.location.href, "../forge/");

  const linksAfterSend = env.context.PLinks.forRecord("foundry", proj.id);
  assert.equal(linksAfterSend.length, 2);
  const forgeLink = linksAfterSend.find((l) => l.toPillar === "forge");
  assert.equal(forgeLink.fromPillar, "foundry");
  assert.equal(forgeLink.fromId, proj.id);
  assert.equal(forgeLink.toId, "fg-1");
  assert.equal(forgeLink.kind, "handoff-to");

  // Start build from #y-form with Athenaeum handoff ideaId
  const handEnv = runPillarEnv(
    ["kit/kit.js", "kit/bus.js", "kit/links.js", "pillars/foundry/app.js"],
    {
      pathname: "/pillars/foundry/",
      localSeed: {
        "prometheus.athenaeum.ideas": JSON.stringify([{ id: "inv-handoff", title: "Drone Ocean Collector", tags: ["invention"], archived: false }]),
      },
      sessionSeed: {
        "prometheus.handoff": JSON.stringify({ pillar: "foundry", title: "Drone Ocean Collector", text: "Build hull", ideaId: "inv-handoff" }),
      },
    }
  );
  const form = handEnv.document.querySelector("#y-form");
  assert.equal(form.dataset.ideaId, "inv-handoff");
  form.dispatchEvent({ type: "submit", target: form, preventDefault() {} });

  const handProjects = handEnv.context.FOUNDRY.data().projects;
  assert.equal(handProjects.length, 1);
  const handLinks = handEnv.context.PLinks.forRecord("foundry", handProjects[0].id);
  assert.equal(handLinks.length, 1);
  assert.equal(handLinks[0].fromPillar, "athenaeum");
  assert.equal(handLinks[0].fromId, "inv-handoff");
  assert.equal(handLinks[0].kind, "builds-from");
});

test("Hearth keeps existing structure intact, 1-tap links phases/materials to Records, and shows live badges", () => {
  const existingDoc = {
    id: "doc-existing-p1",
    title: "Phase 1 · 2nd-Floor Deck Refurbish — Permit",
    category: "home",
    due: "2020-01-01",
    where: "Kern Building Dept",
  };
  const env = runPillarEnv(
    ["kit/kit.js", "kit/bus.js", "kit/links.js", "pillars/hearth/app.js"],
    {
      pathname: "/pillars/hearth/",
      localSeed: {
        "prometheus.records.docs": JSON.stringify([existingDoc]),
      },
    }
  );

  // Preserve existing HEARTH structure and counts
  const hData = env.context.HEARTH.data();
  assert.ok(hData.rooms.length >= 10);
  assert.ok(hData.phases.length >= 5);
  assert.ok(hData.materials.length >= 10);

  // 1-tap Link on material creates doc in prometheus.records.docs + hearth -> records documented-by link
  const matBtn = env.document.querySelector('#h-mats-body [data-action="link-records"][data-item-id="decking-2x6x12"]');
  assert.ok(matBtn, "Material Link Warranty / Permit in Records button exists");
  matBtn.click();

  let docs = JSON.parse(env.localStorage.getItem("prometheus.records.docs"));
  assert.equal(docs.length, 2);
  const createdDoc = docs.find((d) => d.id !== existingDoc.id);
  assert.ok(createdDoc.title.includes("2x6x12 Deck Boards"));

  const matLinks = env.context.PLinks.forRecord("hearth", "decking-2x6x12");
  assert.equal(matLinks.length, 1);
  assert.equal(matLinks[0].fromPillar, "hearth");
  assert.equal(matLinks[0].fromId, "decking-2x6x12");
  assert.equal(matLinks[0].toPillar, "records");
  assert.equal(matLinks[0].toId, createdDoc.id);
  assert.equal(matLinks[0].kind, "documented-by");

  const matBadge = env.document.querySelector('#h-mats-body [data-links-for="decking-2x6x12"] .link-badge');
  assert.ok(matBadge, "Material row shows linked Records badge");
  assert.ok(matBadge.textContent.includes("2x6x12 Deck Boards"));

  // Re-clicking does not duplicate doc or link
  env.document.querySelector('#h-mats-body [data-action="link-records"][data-item-id="decking-2x6x12"]').click();
  docs = JSON.parse(env.localStorage.getItem("prometheus.records.docs"));
  assert.equal(docs.length, 2);
  assert.equal(env.context.PLinks.forRecord("hearth", "decking-2x6x12").length, 1);

  // 1-tap Link on Phase 1 reuses existing matching doc in prometheus.records.docs and shows live overdue status
  const phaseBtn = env.document.querySelector('#h-phases-list [data-action="link-records"][data-item-id="phase-1"]');
  assert.ok(phaseBtn, "Phase Link Warranty / Permit in Records button exists");
  phaseBtn.click();

  docs = JSON.parse(env.localStorage.getItem("prometheus.records.docs"));
  assert.equal(docs.length, 2, "Existing matching doc is reused rather than duplicated");
  const phaseLinks = env.context.PLinks.forRecord("hearth", "phase-1");
  assert.equal(phaseLinks.length, 1);
  assert.equal(phaseLinks[0].toId, existingDoc.id);
  assert.equal(phaseLinks[0].kind, "documented-by");

  const phaseBadge = env.document.querySelector('#h-phases-list [data-links-for="phase-1"] .link-badge');
  assert.ok(phaseBadge, "Phase card shows linked Records badge");
  assert.ok(phaseBadge.textContent.includes("overdue"), "Badge displays live resolved status from Records");

  // Price / Qty action on BOM row remains functional
  env.context.prompt = () => "10";
  const priceBtn = env.document.querySelector('#h-mats-body [data-action="price-qty"]');
  assert.ok(priceBtn, "Material Price / Qty button preserved");
  priceBtn.click();
  const updatedMat = env.context.HEARTH.data().materials.find((m) => m.id === "decking-2x6x12");
  assert.equal(updatedMat.qty, 10);
  assert.equal(updatedMat.unitCost, 10);
});

test("foundry/index.html and hearth/index.html load kit/links.js right after kit/bus.js", () => {
  for (const rel of ["pillars/foundry/index.html", "pillars/hearth/index.html"]) {
    const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
    const busIdx = html.indexOf('<script src="../../kit/bus.js"></script>');
    const linksIdx = html.indexOf('<script src="../../kit/links.js"></script>');
    assert.ok(busIdx >= 0, `${rel} includes kit/bus.js`);
    assert.ok(linksIdx > busIdx, `${rel} includes kit/links.js right after kit/bus.js`);
    assert.match(html, /<script src="\.\.\/\.\.\/kit\/bus\.js"><\/script>\s*<script src="\.\.\/\.\.\/kit\/links\.js"><\/script>/);
  }
});

test("PB.dumpAll(), PB.loadAll(), and backupAll() preserve prometheus.bus.links across backup/restore", async () => {
  installGlobalStorage({
    "prometheus.athenaeum.ideas": JSON.stringify([{ id: "i-bk", title: "Backup Idea", archived: false }]),
    "prometheus.foundry.projects": JSON.stringify([{ id: "p-bk", title: "Backup Build", stage: 2 }]),
  });
  await import("../../kit/bus.js");
  await import("../../kit/links.js");
  const { backupAll } = await import("../../deck/core/reach.js");

  const created = globalThis.PLinks.link({
    fromPillar: "athenaeum",
    fromId: "i-bk",
    toPillar: "foundry",
    toId: "p-bk",
    kind: "builds-from",
    label: "Backup Build",
  });

  const dump = globalThis.PB.dumpAll();
  assert.ok(Object.prototype.hasOwnProperty.call(dump.keys, "prometheus.bus.links"));

  const fullBackup = backupAll();
  assert.ok(Object.prototype.hasOwnProperty.call(fullBackup.keys, "prometheus.bus.links"));

  globalThis.localStorage.clear();
  assert.equal(globalThis.PLinks.list().length, 0);

  globalThis.PB.loadAll(dump);
  const restored = globalThis.PLinks.list();
  assert.equal(restored.length, 1);
  assert.equal(restored[0].id, created.id);
  const resolved = globalThis.PLinks.resolve(restored[0]);
  assert.equal(resolved.from.title, "Backup Idea");
  assert.equal(resolved.to.title, "Backup Build");
  assert.equal(resolved.to.status, "Design");
});
