/* Observatory (Claude, 2026-11-13): the subjects your ideas keep returning to, and what is happening in them. Subjects start from the
   commonest tags in Athenaeum; you can add or drop any. Headlines arrive only when you press Scan: each subject word is sent to the
   public Hacker News search (hn.algolia.com) and nothing else leaves the device. Every headline is marked unverified; your own notes
   are kept apart and marked verified, opinion or question. window.OBSERVATORY = { data, scan } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("observatory"), app = $("#app"), SKIP = new Set(["ideas", "worldview", "philosophy", "software", "systems", "method", "frameworks", "meta", "legacy", "writing", "manifesto"]);
  const API = new URLSearchParams(location.search).get("hn") || "https://hn.algolia.com/api/v1/search_by_date";
  const fromIdeas = () => { let l = []; try { l = JSON.parse(localStorage.getItem("prometheus.athenaeum.ideas") || "[]"); } catch (e) { l = []; } if (!l.length) l = window.ATHENAEUM_IDEAS || [];
    const tally = new Map(); for (const i of l) for (const t of new Set((i.tags || []).map((x) => String(x).toLowerCase().trim()))) if (t && !SKIP.has(t)) tally.set(t, (tally.get(t) || 0) + 1);
    return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => ({ id: "t-" + t, name: t.replace(/-/g, " ").replace(/\bai\b/g, "AI"), q: t.replace(/-/g, " "), ideas: n, from: "athenaeum" })); };
  const subjects = () => S.get("subjects", null) || fromIdeas();
  const signals = () => S.get("signals", []);
  window.OBSERVATORY = { data: () => ({ subjects: subjects(), signals: signals(), notes: S.list("notes"), scanned: S.get("scanned", null), state: st }), scan };
  let st = "idle";
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12"><h2>Signals</h2><p class="sub" id="o-state"></p><button class="btn" id="o-scan" type="button">Scan now</button>
        <p class="note" style="margin-top:8px">Scanning sends each subject's words to the public Hacker News search at hn.algolia.com. Nothing else leaves this device. Headlines are other people's claims: unverified until you note them.</p><div id="o-signals"></div></div>
      <div class="glass span-12"><h2>Subjects</h2><div id="o-subjects"></div>
        <form class="form" id="o-add"><label class="f wide">Add a subject<input name="name" required maxlength="60" placeholder="battery chemistry, desalination…"></label><button class="btn quiet" type="submit">Watch it</button></form></div>
      <div class="glass span-12"><h2>Your observations</h2>
        <form class="form" id="o-note"><label class="f">Subject<select name="subject"></select></label><label class="f">Kind<select name="kind"><option value="verified">verified fact</option><option value="opinion">opinion</option><option value="question">open question</option></select></label>
          <label class="f wide">The note<input name="text" required maxlength="240"></label><label class="f wide">Source link<input name="url" type="url" maxlength="300" placeholder="https://…"></label><button class="btn" type="submit">Keep it</button></form><div id="o-notes"></div></div>
    </section>`;
  async function scan() {
    if (st === "scanning") return; st = "scanning"; paint(); const subs = subjects(), got = []; let ok = 0;
    for (const s of subs) { try { const r = await fetch(`${API}?query=${encodeURIComponent(s.q || s.name)}&tags=story&hitsPerPage=6`); if (!r.ok) throw new Error(r.status); const j = await r.json(); ok++;
      for (const x of j.hits || []) if (x.title) got.push({ subject: s.id, title: x.title, url: x.url || `https://news.ycombinator.com/item?id=${x.objectID}`, at: x.created_at, points: x.points || 0, source: "Hacker News" }); } catch (e) { /* this subject failed */ } }
    if (ok) { S.set("signals", got.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 80)); S.set("scanned", new Date().toISOString()); if (window.PB && PB.events) PB.events.publish({ type: "scan.done", pillar: "observatory", title: `${got.length} signals on ${ok} subjects` }); }
    st = ok ? "idle" : "failed"; paint(); toast(ok ? `${got.length} signals on ${ok} of ${subs.length} subjects` : "The news search could not be reached");
  }
  const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 6e4); return m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago"; };
  function paint() {
    const subs = subjects(), sig = signals(), sc = S.get("scanned", null), name = (id) => (subs.find((s) => s.id === id) || {}).name || "—";
    $("#o-state").textContent = st === "scanning" ? "Scanning…" : st === "failed" ? "The news search could not be reached from here. Nothing was changed." : sc ? `${sig.length} signals from the last scan, ${ago(sc)}.` : "No scan yet.";
    $("#o-scan").disabled = st === "scanning";
    $("#o-signals").replaceChildren(...sig.slice(0, 24).map((x) => h("div.kv", null, h("span", null, h("a", { href: x.url, target: "_blank", rel: "noopener" }, x.title), h("br"), h("span.stat-s", null, `${name(x.subject)} · ${x.source}, unverified · ${ago(x.at)}${x.points ? " · " + x.points + " points" : ""}`)))));
    $("#o-subjects").replaceChildren(...subs.map((s) => h("div.kv", null, h("span", null, h("b", null, s.name), h("br"), h("span.stat-s", null, s.from === "athenaeum" ? `from ${s.ideas} of your ideas` : "added by you")),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.set("subjects", subs.filter((x) => x.id !== s.id)); paint(); } }, "Drop"))));
    const sel = $("#o-note").subject; sel.replaceChildren(...subs.map((s) => h("option", { value: s.id }, s.name)));
    const notes = S.list("notes").sort((a, b) => String(b.at).localeCompare(String(a.at)));
    $("#o-notes").replaceChildren(...(notes.length ? notes.map((n) => h("div.kv", null, h("span", null, n.text, h("br"), h("span.stat-s", null, `${name(n.subject)} · ${n.kind}${n.url ? " · " : ""}`, n.url ? h("a", { href: n.url, target: "_blank", rel: "noopener" }, "source") : null)),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("notes", n.id); paint(); } }, "Remove"))) : [h("p.empty", null, "Nothing noted yet.")]));
  }
  $("#o-scan").addEventListener("click", scan);
  $("#o-add").addEventListener("submit", (e) => { e.preventDefault(); const v = e.target.name.value.trim(); if (!v) return; S.set("subjects", [...subjects(), { id: "u-" + Date.now().toString(36), name: v, q: v, from: "you" }]); e.target.reset(); paint(); });
  $("#o-note").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; S.add("notes", { subject: f.subject.value, kind: f.kind.value, text: f.text.value.trim(), url: f.url.value.trim() }); f.text.value = ""; f.url.value = ""; toast("Kept"); paint(); });
  $("#export").onclick = () => download(`observatory_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  paint();
})();
