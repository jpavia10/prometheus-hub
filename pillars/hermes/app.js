/* Hermes Post v1 (Claude, 2026-11-05): one triage board for what came in. Reply, pay, wait or read; due dates; bills totalled for the
   week. No inbox is read yet: Gmail comes once the spec (HER-GEM-01) is checked and Joseph creates the one Google sign-in it needs.
   Entries stay in this browser. */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("hermes");
  const app = $("#app");

  // a winged envelope
  field({ count: 900, at: [0.72, 0.36], scale: 0.26, glyph: (n) => [
    ...G.poly(Math.round(n * 0.36), [[-0.55, -0.32], [0.55, -0.32], [0.55, 0.36], [-0.55, 0.36], [-0.55, -0.32]]),
    ...G.poly(Math.round(n * 0.16), [[-0.55, -0.32], [0, 0.08], [0.55, -0.32]]),
    ...Array.from({ length: 5 }, (_, i) => [...G.line(Math.round(n * 0.024), -0.55, -0.1 + i * 0.05, -1 + i * 0.04, -0.55 + i * 0.14), ...G.line(Math.round(n * 0.024), 0.55, -0.1 + i * 0.05, 1 - i * 0.04, -0.55 + i * 0.14)]).flat()] });

  const KINDS = { reply: "Needs an answer", pay: "A bill to pay", wait: "Waiting on them", read: "Read later" };
  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-board" aria-controls="p-board">Board</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Add</button>
      <button class="tab" role="tab" id="t-done" aria-controls="p-done">Done</button>
      <button class="tab" role="tab" id="t-sylade" aria-controls="p-sylade">Sylade</button>
    </div>
    <section id="p-board" role="tabpanel" class="grid">
      <div class="glass lit span-4"><div class="stat-k">Needs an answer</div><div class="stat-v big" id="m-reply">0</div><div class="stat-s" id="m-reply-s"></div></div>
      <div class="glass span-4"><div class="stat-k">Bills due in 7 days</div><div class="stat-v big" id="m-pay">$0</div><div class="stat-s" id="m-pay-s"></div></div>
      <div class="glass span-4"><div class="stat-k">Waiting on others</div><div class="stat-v big" id="m-wait">0</div><div class="stat-s" id="m-wait-s"></div></div>
      ${Object.entries(KINDS).map(([k, l]) => `<div class="glass span-6"><h2>${l}</h2><ul class="list" id="l-${k}"></ul></div>`).join("")}
    </section>
    <section id="p-add" role="tabpanel" class="grid"><div class="glass span-12"><h2>Something came in</h2>
      <form class="form" id="m-form"><label class="f">From<input name="from" required maxlength="80" placeholder="Lender, landlord, a friend"></label>
        <label class="f wide">About<input name="about" required maxlength="160" placeholder="One line: what it is, not the message itself"></label>
        <label class="f">It is<select name="kind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label>
        <label class="f">By<input name="due" type="date"></label><label class="f">Amount (bills)<input name="amount" type="number" step="0.01" min="0"></label>
        <label class="f">Where<select name="box"><option>Joseph's Gmail</option><option>Sylade's Gmail</option><option>Text</option><option>Paper mail</option><option>Other</option></select></label>
        <button class="btn" type="submit">Add to the board</button></form>
      <p class="note">Write a one-line label, never the message text. Bills you add here can go into Midas Ledger's book.</p></div></section>
    <section id="p-done" role="tabpanel" class="grid"><div class="glass span-12"><h2>Done</h2><ul class="list" id="l-done"></ul></div></section>
    <section id="p-sylade" role="tabpanel" class="grid">
      <div class="glass span-6"><h2>Sylade, the alter ego</h2><ul class="list">
        <li><span>Email</span><a class="meta" href="mailto:sylade.ais@gmail.com">sylade.ais@gmail.com</a></li>
        <li><span>GitHub</span><a class="meta" href="https://github.com/sylade-ais" target="_blank" rel="noopener noreferrer">sylade-ais</a></li>
        <li><span>Discord</span><a class="meta" href="https://discord.gg/YCam2NEkv9" target="_blank" rel="noopener noreferrer">Sylade Fleet</a></li></ul>
        <p class="note">The public addresses on the Sylade page of the desk. Mail that comes there goes on this board with "Sylade's Gmail".</p></div>
      <div class="glass span-6"><h2>Reading the inbox itself</h2><p class="note">Not connected yet. To read Gmail in the browser, the page needs a Google sign-in Joseph creates once (a Google Cloud OAuth client for this address). Gemini's spec lists the exact steps; Grok checks them; then Claude wires it so only counts and labels ever show, never the message text.</p></div>
    </section>`;

  const daysTo = (iso) => (iso ? Math.round((new Date(iso + "T12:00:00") - new Date(day() + "T12:00:00")) / 864e5) : null);
  const when = (n) => (n == null ? "" : n < 0 ? `${-n} day${n === -1 ? "" : "s"} late` : n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);
  function item(m) {
    const n = daysTo(m.due);
    return h("li", null, h("span", null, h("b", null, m.from), " · ", m.about, h("div.meta", null, [m.box, m.amount ? money(+m.amount) : "", m.due ? `by ${m.due} (${when(n)})` : ""].filter(Boolean).join(" · "))),
      h("span.acts", null, h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("mail", m.id, { done: day() }); paint(); } }, "Done"),
        h("button.btn.quiet.small", { type: "button", "aria-label": "Delete", onclick: () => { if (confirm("Delete it?")) { S.remove("mail", m.id); paint(); } } }, "×")));
  }
  function syncBus() {
    if (!window.PB) return;
    for (const m of S.list("mail")) {
      if (m.done || !m.due) PB.deadlines.unpublish("hermes", m.id);
      else PB.deadlines.publish({ title: (KINDS[m.kind] || "Mail") + " · " + m.from, date: m.due, source: "hermes", kind: m.kind, ref: m.id });
    }
  }
  function paint() {
    syncBus();
    const all = S.list("mail"), open = all.filter((m) => !m.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
    for (const k of Object.keys(KINDS)) { const l = $("#l-" + k); l.innerHTML = ""; const its = open.filter((m) => m.kind === k); if (!its.length) l.append(h("li.empty", null, "Nothing here.")); its.forEach((m) => l.append(item(m))); }
    const reply = open.filter((m) => m.kind === "reply"), late = reply.filter((m) => m.due && daysTo(m.due) < 0);
    $("#m-reply").textContent = reply.length; $("#m-reply-s").textContent = late.length ? `${late.length} past the day you set` : reply.length ? "none late" : "Inbox zero on answers.";
    const bills = open.filter((m) => m.kind === "pay" && m.due && daysTo(m.due) <= 7), tot = bills.reduce((a, m) => a + (+m.amount || 0), 0);
    $("#m-pay").textContent = money(tot, 0); $("#m-pay-s").textContent = bills.length ? `${bills.length} bill${bills.length === 1 ? "" : "s"}${bills.some((m) => daysTo(m.due) < 0) ? ", some late" : ""}` : "None due this week.";
    const wait = open.filter((m) => m.kind === "wait"); $("#m-wait").textContent = wait.length; $("#m-wait-s").textContent = wait.length ? `oldest added ${wait.map((m) => m.at.slice(0, 10)).sort()[0]}` : "Nobody owes you a reply.";
    const done = all.filter((m) => m.done).sort((a, b) => b.done.localeCompare(a.done)); const l = $("#l-done"); l.innerHTML = "";
    if (!done.length) l.append(h("li.empty", null, "Nothing done yet."));
    done.slice(0, 100).forEach((m) => l.append(h("li", null, h("span", null, `${m.from} · ${m.about}`), h("span.meta", null, `done ${m.done}`))));
  }
  $("#m-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("mail", { from: f.from.value.trim(), about: f.about.value.trim(), kind: f.kind.value, due: f.due.value, amount: f.amount.value ? +f.amount.value : null, box: f.box.value });
    f.from.value = f.about.value = f.amount.value = f.due.value = ""; toast("On the board"); paint(); });
  $("#export").onclick = () => download(`hermes_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };
  tabs(app);
  paint();
})();
