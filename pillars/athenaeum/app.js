/* Athenaeum (Sebastian, 2026-11-10): idea vault with dated refinement chains + resurfacing,
   and a reading/history shelf. Ideas are never edited in place — refinements append. */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("athenaeum");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.4), 0.5), ...G.ring(Math.round(n * 0.3), 0.9), ...G.ring(Math.round(n * 0.3), 0.16)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12" id="a-resurface-wrap"><h2>Resurfaced — still worth your attention</h2><div id="a-resurface"></div></div>
      <div class="glass span-12"><h2>Capture a spark</h2>
        <form class="form" id="a-form"><label class="f wide">Title<input name="title" required maxlength="120"></label>
        <label class="f wide">The idea<textarea class="ta" name="body" required maxlength="2000"></textarea></label>
        <label class="f wide">Tags (comma separated)<input name="tags" maxlength="120" placeholder="debt, history, house"></label>
        <button class="btn" type="submit">Keep it</button></form></div>
      <div class="glass span-12"><h2>The vault</h2>
        <form class="form"><label class="f wide">Search ideas and refinements<input id="a-q" type="search"></label></form>
        <div id="a-list"></div></div>
      <div class="glass span-12"><h2>Reading & history shelf</h2>
        <form class="form" id="a-shelf-form"><label class="f wide">Title<input name="title" required maxlength="140"></label>
        <label class="f">Author / source<input name="author" maxlength="80"></label>
        <label class="f">Kind<select name="kind"><option>book</option><option>article</option><option>history</option><option>video</option><option>other</option></select></label>
        <label class="f">Status<select name="status"><option>want</option><option>reading</option><option>done</option></select></label>
        <label class="f wide">Cause → event → consequence (for history)<input name="chain" maxlength="240" placeholder="Cause … → Event … → Consequence …"></label>
        <button class="btn" type="submit">Shelve it</button></form>
        <div id="a-shelf" style="margin-top:10px"></div></div>
    </section>`;
  function paint() {
    const ideas = S.list("ideas");
    const res = VAULT.pickResurface(ideas, day());
    $("#a-resurface-wrap").hidden = !res.length;
    $("#a-resurface").innerHTML = res.map((i) => `<div class="kv"><span><b>${esc(i.title)}</b> · sparked ${i.created} · ${i.chain.length} refinement${i.chain.length === 1 ? "" : "s"}</span><button class="btn quiet small" data-res="${i.id}" type="button">Seen — resurface later</button></div>`).join("");
    $("#a-resurface").querySelectorAll("[data-res]").forEach((b) => (b.onclick = () => { const it = ideas.find((x) => x.id === b.dataset.res); if (it) { it.lastResurfaced = day(); S.set("ideas", ideas); paint(); } }));
    const q = $("#a-q").value;
    const shown = VAULT.search(ideas.filter((i) => !i.archived), q).sort((a, b) => b.created.localeCompare(a.created));
    const el = $("#a-list"); el.innerHTML = shown.length ? "" : `<p class="empty">No ideas yet — the first spark goes above.</p>`;
    for (const i of shown) {
      el.append(h("div.idea", null,
        h("h3", null, i.title),
        h("div", null, i.body),
        h("div", { style: "margin-top:4px" }, ...(i.tags || []).map((t) => h("span.tag", null, t)), h("span.stat-s", null, ` sparked ${i.created}${i.source ? " · via " + i.source : ""}${i.strength ? " · strength " + i.strength + "/5" : ""}`)),
        h("div.chain", null, ...i.chain.map((c) => h("div", null, h("span.when", null, c.date + " — "), c.text))),
        h("div.row-actions", { style: "margin-top:6px" },
          h("button.btn.quiet.small", { type: "button", onclick: () => { const t = prompt("Refinement (appended with today's date — the original stays untouched):"); if (t) { i.chain.push({ date: day(), text: t }); i.lastResurfaced = day(); S.set("ideas", ideas); paint(); } } }, "Add refinement"),
          h("button.btn.quiet.small", { type: "button", onclick: () => { i.archived = true; S.set("ideas", ideas); paint(); } }, "Archive"))));
    }
    const shelf = S.list("shelf").sort((a, b) => b.at.localeCompare(a.at));
    $("#a-shelf").innerHTML = shelf.map((b) => `<div class="kv"><span><b>${esc(b.title)}</b>${b.author ? " — " + esc(b.author) : ""}<br><span class="stat-s">${b.kind} · ${b.status}${b.chain ? " · " + esc(b.chain) : ""}</span></span></div>`).join("") || `<p class="empty">Shelf is empty.</p>`;
  }
  $("#a-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("ideas", { title: f.title.value.trim(), body: f.body.value.trim(), tags: f.tags.value.split(",").map((t) => t.trim()).filter(Boolean), created: day(), chain: [], lastResurfaced: null, archived: false });
    f.reset(); toast("Kept"); paint(); });
  $("#a-shelf-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("shelf", { title: f.title.value.trim(), author: f.author.value.trim(), kind: f.kind.value, status: f.status.value, chain: f.chain.value.trim() }); f.reset(); paint(); });
  $("#a-q").addEventListener("input", paint);
  $("#export").onclick = () => download(`athenaeum_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try {
      const incoming = JSON.parse(await f.text());
      const ideas = Array.isArray(incoming) ? incoming : (incoming.ideas || []);
      const shelf = Array.isArray(incoming) ? [] : (incoming.shelf || []);
      const merged = ATH_MERGE.mergeIdeas(S.list("ideas"), ideas);
      S.set("ideas", merged.all);
      if (shelf.length) { const cur = S.list("shelf"); const seen = new Set(cur.map((b) => b.title.toLowerCase())); for (const b of shelf) if (!seen.has(b.title.toLowerCase())) cur.push(b); S.set("shelf", cur); }
      toast(`Merged: ${merged.added} new idea(s), ${merged.updated} updated`); paint();
    } catch (e) { toast(e.message); } };
  paint();
})();

/* Athenaeum import merge (Sebastian, 2026-11-10): imports MERGE, never replace.
   Ideas match by normalized title; a match appends only the chain entries it lacks
   (by date+text) and adopts source/strength when the stored idea has none.
   window.ATH_MERGE = { mergeIdeas } — pure, unit-tested. */
(function () {
  "use strict";
  const norm = (t) => String(t || "").toLowerCase().replace(/\s+/g, " ").trim();
  function mergeIdeas(existing, incoming) {
    const all = existing.map((i) => ({ ...i, chain: [...(i.chain || [])] }));
    const byTitle = new Map(all.map((i) => [norm(i.title), i]));
    let added = 0, updated = 0;
    for (const inc of incoming || []) {
      if (!inc || !inc.title) continue;
      const key = norm(inc.title);
      const cur = byTitle.get(key);
      if (!cur) { const ni = { title: inc.title, body: inc.body || "", tags: inc.tags || [], created: inc.created || new Date().toISOString().slice(0, 10), chain: inc.chain || [], lastResurfaced: null, archived: false, ...(inc.source ? { source: inc.source } : {}), ...(inc.strength ? { strength: inc.strength } : {}) }; all.push(ni); byTitle.set(key, ni); added++; continue; }
      let changed = false;
      const have = new Set(cur.chain.map((c) => c.date + "|" + c.text));
      for (const c of inc.chain || []) if (!have.has(c.date + "|" + c.text)) { cur.chain.push(c); changed = true; }
      if (!cur.source && inc.source) { cur.source = inc.source; changed = true; }
      if (!cur.strength && inc.strength) { cur.strength = inc.strength; changed = true; }
      cur.chain.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      if (changed) updated++;
    }
    return { all, added, updated };
  }
  const M = { mergeIdeas };
  if (typeof window !== "undefined") window.ATH_MERGE = M;
  if (typeof globalThis !== "undefined") globalThis.ATH_MERGE = M;
})();
