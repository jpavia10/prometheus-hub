/* Observatory (Claude, 2026-11-13): the subjects your ideas keep returning to, and what is happening in them. Subjects start from the
   commonest tags in Athenaeum; you can add or drop any. Headlines arrive only when you press Scan: each subject word is sent to the
   public Hacker News search (hn.algolia.com) and nothing else leaves the device. Every headline is marked unverified; your own notes
   are kept apart and marked verified, opinion or question. window.OBSERVATORY = { data, scan, classifySignal, filterView } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("observatory"), app = $("#app"), SKIP = new Set(["ideas", "worldview", "philosophy", "software", "systems", "method", "frameworks", "meta", "legacy", "writing", "manifesto"]);
  const API = new URLSearchParams(location.search).get("hn") || "https://hn.algolia.com/api/v1/search_by_date";
  const SCAN_TIMEOUT_MS = 8000;
  const fromIdeas = () => { let l = []; try { l = JSON.parse(localStorage.getItem("prometheus.athenaeum.ideas") || "[]"); } catch (e) { l = []; } if (!l.length) l = window.ATHENAEUM_IDEAS || [];
    const tally = new Map(); for (const i of l) for (const t of new Set((i.tags || []).map((x) => String(x).toLowerCase().trim()))) if (t && !SKIP.has(t)) tally.set(t, (tally.get(t) || 0) + 1);
    return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => ({ id: "t-" + t, name: t.replace(/-/g, " ").replace(/\bai\b/g, "AI"), q: t.replace(/-/g, " "), ideas: n, from: "athenaeum" })); };
  const subjects = () => S.get("subjects", null) || fromIdeas();
  const signals = () => S.get("signals", []);

  let st = "idle";
  let lastError = "";
  let filterMode = "all";

  function classifySignal(item) {
    if (!item || typeof item !== "object") return "unverified-signal";
    const k = String(item.kind || "").toLowerCase().trim();
    if (k === "verified" || k === "verified-fact" || item.verified === true) return "verified-fact";
    if (k === "opinion") return "opinion";
    if (k === "question" || k === "open-question") return "question";
    return "unverified-signal";
  }

  function normalizeFilter(mode) {
    const m = String(mode || "all").toLowerCase().trim();
    if (m === "unverified" || m === "unverified-signals" || m === "unverified-signal" || m === "signals") return "unverified";
    if (m === "verified" || m === "verified-notes" || m === "verified-fact" || m === "notes") return "verified";
    return "all";
  }

  function getFiltered() {
    const allSig = signals();
    const allNotes = S.list("notes").sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
    if (filterMode === "unverified") {
      return { mode: filterMode, signals: allSig.filter((x) => classifySignal(x) === "unverified-signal"), notes: [] };
    }
    if (filterMode === "verified") {
      return { mode: filterMode, signals: allSig.filter((x) => classifySignal(x) === "verified-fact"), notes: allNotes.filter((n) => classifySignal(n) === "verified-fact") };
    }
    return { mode: filterMode, signals: allSig, notes: allNotes };
  }

  function filterView(mode) {
    if (mode !== undefined) {
      filterMode = normalizeFilter(mode);
      paint();
    }
    return getFiltered();
  }

  const API_OBJ = {
    data: () => ({ subjects: subjects(), signals: signals(), notes: S.list("notes"), scanned: S.get("scanned", null), state: st, error: lastError || null, filter: filterMode }),
    scan,
    classifySignal,
    filterView,
  };
  if (typeof window !== "undefined") window.OBSERVATORY = API_OBJ;
  if (typeof globalThis !== "undefined") globalThis.OBSERVATORY = API_OBJ;

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Signals</h2><p class="sub" id="o-state"></p><button class="btn" id="o-scan" type="button">Scan now</button>
        <p class="note" style="margin-top:8px">Scanning sends each subject's words to the public Hacker News search at hn.algolia.com. Nothing else leaves this device. Headlines are other people's claims: unverified until you note them.</p>
        <div id="o-filter" class="row-actions" role="group" aria-label="Filter signals and notes" style="margin:10px 0 8px"><button class="btn small" data-filter="all" type="button" aria-pressed="true">All</button><button class="btn quiet small" data-filter="unverified" type="button" aria-pressed="false">Unverified Signals</button><button class="btn quiet small" data-filter="verified" type="button" aria-pressed="false">Verified Notes</button></div>
        <div id="o-signals"></div></div>
      <div class="glass span-12"><h2>Subjects</h2><div id="o-subjects"></div>
        <form class="form" id="o-add"><label class="f wide">Add a subject<input name="name" required maxlength="60" placeholder="battery chemistry, desalination…"></label><button class="btn quiet" type="submit">Watch it</button></form></div>
      <div class="glass span-12"><h2>Your observations</h2>
        <form class="form" id="o-note"><label class="f">Subject<select name="subject"></select></label><label class="f">Kind<select name="kind"><option value="verified">verified fact</option><option value="opinion">opinion</option><option value="question">open question</option></select></label>
          <label class="f wide">The note<input name="text" required maxlength="240"></label><label class="f wide">Source link<input name="url" type="url" maxlength="300" placeholder="https://…"></label><button class="btn" type="submit">Keep it</button></form><div id="o-notes"></div></div>
    </section>`;

  async function fetchSubjectSignals(s, timeoutMs) {
    const ac = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ac ? setTimeout(() => ac.abort(), timeoutMs) : null;
    try {
      const url = `${API}?query=${encodeURIComponent(s.q || s.name)}&tags=story&hitsPerPage=6`;
      const r = await fetch(url, ac ? { signal: ac.signal } : undefined);
      if (!r || !r.ok) throw new Error(`HTTP ${r ? r.status : "error"}`);
      const ct = r.headers && typeof r.headers.get === "function" ? String(r.headers.get("content-type") || "") : "";
      if (ct && /html/i.test(ct) && !/json/i.test(ct)) throw new Error("Unexpected HTML response");
      const j = typeof r.json === "function" ? await r.json() : JSON.parse(await r.text());
      if (!Array.isArray(j && j.hits)) throw new Error("Malformed response: missing hits array");
      const items = [];
      for (const x of j.hits) {
        if (x && x.title) {
          items.push({
            subject: s.id,
            title: x.title,
            url: x.url || (x.objectID ? `https://news.ycombinator.com/item?id=${x.objectID}` : "#"),
            at: x.created_at || "",
            points: x.points || 0,
            source: "Hacker News",
            kind: "unverified-signal",
          });
        }
      }
      return items;
    } finally {
      if (timer != null) clearTimeout(timer);
    }
  }

  async function scan(opts) {
    if (st === "scanning") return;
    const timeoutMs = Number(opts && opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : SCAN_TIMEOUT_MS;
    st = "scanning";
    lastError = "";
    paint();
    const subs = subjects();
    if (!subs.length) {
      st = "idle";
      paint();
      toast("Add at least one subject to scan");
      return;
    }
    const got = [];
    let ok = 0;
    let errNote = "";
    try {
      for (const s of subs) {
        try {
          const items = await fetchSubjectSignals(s, timeoutMs);
          ok++;
          got.push(...items);
        } catch (e) {
          errNote = e && e.name === "AbortError" ? "request timed out (8s)" : (e && e.message) || "network error";
        }
      }
      if (ok > 0) {
        S.set("signals", got.sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))).slice(0, 80));
        S.set("scanned", new Date().toISOString());
        if (window.PB && PB.events) PB.events.publish({ type: "scan.done", pillar: "observatory", title: `${got.length} signals on ${ok} subjects` });
        st = "idle";
        lastError = "";
      } else {
        st = "failed";
        lastError = errNote || "news search unreachable";
      }
    } catch (e) {
      st = "failed";
      lastError = (e && e.message) || "scan failed";
    }
    paint();
    toast(ok > 0 ? `${got.length} signals on ${ok} of ${subs.length} subjects` : `Scan failed (${lastError}) — cached signals kept`);
  }

  const ago = (iso) => {
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return "unknown time";
    const m = Math.max(0, Math.round((Date.now() - t) / 6e4));
    return m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
  };

  function paint() {
    const subs = subjects(), sig = signals(), sc = S.get("scanned", null), name = (id) => (subs.find((s) => s.id === id) || {}).name || "—";
    $("#o-state").textContent = st === "scanning"
      ? "Scanning…"
      : st === "failed"
        ? `Scan failed (${lastError || "news search unreachable"}) — existing cached signals (${sig.length}) were preserved.`
        : sc ? `${sig.length} signals from the last scan, ${ago(sc)}.` : "No scan yet.";
    $("#o-scan").disabled = st === "scanning";
    $("#o-filter").querySelectorAll("[data-filter]").forEach((btn) => {
      const on = btn.dataset.filter === filterMode;
      btn.classList.toggle("quiet", !on);
      btn.setAttribute("aria-pressed", String(on));
    });
    const view = getFiltered();
    const sigEls = view.signals.slice(0, 24).map((x) => h("div.kv", null, h("span", null, h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.title), h("br"), h("span.stat-s", null, `${name(x.subject)} · ${x.source}, ${classifySignal(x)} · ${ago(x.at)}${x.points ? " · " + x.points + " points" : ""}`))));
    if (!sigEls.length) {
      const emptyMsg = filterMode === "verified"
        ? (S.list("notes").some((n) => classifySignal(n) === "verified-fact") ? "Unverified headlines hidden — see verified facts in Your observations." : "No verified notes yet.")
        : (st === "failed" ? "No cached signals yet; failed scan made no changes." : "No signals yet. Press Scan now.");
      sigEls.push(h("p.empty", null, emptyMsg));
    }
    $("#o-signals").replaceChildren(...sigEls);
    $("#o-subjects").replaceChildren(...subs.map((s) => h("div.kv", null, h("span", null, h("b", null, s.name), h("br"), h("span.stat-s", null, s.from === "athenaeum" ? `from ${s.ideas} of your ideas` : "added by you")),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("subjects", subs.filter((x) => x.id !== s.id)); paint(); } }, "Drop"))));
    const sel = $("#o-note").subject; sel.replaceChildren(...subs.map((s) => h("option", { value: s.id }, s.name)));
    const noteEls = view.notes.length
      ? view.notes.map((n) => h("div.kv", null, h("span", null, n.text, h("br"), h("span.stat-s", null, `${name(n.subject)} · ${classifySignal(n)}${n.url ? " · " : ""}`, n.url ? h("a", { href: n.url, target: "_blank", rel: "noopener" }, "source") : null)),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("notes", n.id); paint(); } }, "Remove")))
      : [h("p.empty", null, filterMode === "unverified" ? "Filtered to Unverified Signals — switch filter to All or Verified Notes to view observations." : filterMode === "verified" ? "No verified facts noted yet." : "Nothing noted yet.")];
    $("#o-notes").replaceChildren(...noteEls);
  }

  $("#o-scan").addEventListener("click", () => scan());
  $("#o-filter").querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => filterView(btn.dataset.filter));
  });
  $("#o-add").addEventListener("submit", (e) => { e.preventDefault(); const v = e.target.name.value.trim(); if (!v) return; S.set("subjects", [...subjects(), { id: "u-" + Date.now().toString(36), name: v, q: v, from: "you" }]); e.target.reset(); paint(); });
  try {
    const raw = sessionStorage.getItem("prometheus.handoff");
    if (raw) {
      const handoff = JSON.parse(raw);
      if (handoff && handoff.pillar === "observatory") {
        sessionStorage.removeItem("prometheus.handoff");
        $("#o-add").name.value = String(handoff.title || "").slice(0, 60);
        toast("Idea routed from Athenaeum — click Watch it to add subject");
      }
    }
  } catch (e) { /* sessionStorage optional */ }
  $("#o-note").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("notes", { subject: f.subject.value, kind: f.kind.value, text: f.text.value.trim(), url: f.url.value.trim() }); f.text.value = ""; f.url.value = ""; toast("Kept"); paint(); });
  $("#export").onclick = () => download(`observatory_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
