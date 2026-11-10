/* Hermes query builder (Sebastian, 2026-11-09): the 67 researched Gmail operators as a working
   builder — tap operators to assemble a search, copy it, or open it in Gmail. Manual-first:
   no account connection, nothing is read from the mailbox. */
(function () {
  "use strict";
  const { $, toast } = PK;
  const root = document.getElementById("hermes-builder"); if (!root) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Gmail search builder — 67 operators</h2>
    <form class="form"><label class="f wide">Filter operators<input id="hb-q" type="search" placeholder="from, before, has, larger…"></label>
    <label class="f wide">Your search<input id="hb-out" type="text" placeholder="Tap an operator below, then fill in its value"></label></form>
    <div class="row-actions" style="margin-top:8px"><button class="btn small" id="hb-copy" type="button">Copy search</button>
    <a class="btn quiet small" id="hb-open" href="https://mail.google.com/mail/u/0/#search/" target="_blank" rel="noopener">Open in Gmail</a>
    <button class="btn quiet small" id="hb-clear" type="button">Clear</button></div>
    <div id="hb-list" style="margin-top:10px"></div>
    <p class="note">Operators and examples from Google's search-operator reference, as researched. Hermes never connects to the mailbox — this builds the search; Gmail runs it.</p></div>`;
  const out = $("#hb-out");
  const sync = () => { $("#hb-open").href = "https://mail.google.com/mail/u/0/#search/" + encodeURIComponent(out.value.trim()); };
  function paint() {
    const q = ($("#hb-q").value || "").toLowerCase();
    const rows = HERMES_OPERATORS.filter((o) => !q || (o.op + " " + o.does).toLowerCase().includes(q));
    $("#hb-list").innerHTML = rows.map((o) => `<div class="kv"><span><button class="btn quiet small" data-op="${esc(o.example)}" type="button">${esc(o.op)}</button> ${esc(o.does)}</span><b>${esc(o.example)}</b></div>`).join("") || `<p class="empty">No operator matches.</p>`;
    $("#hb-list").querySelectorAll("[data-op]").forEach((b) => (b.onclick = () => { out.value = (out.value ? out.value + " " : "") + b.dataset.op; out.focus(); sync(); }));
  }
  out.addEventListener("input", sync);
  $("#hb-copy").onclick = async () => { try { await navigator.clipboard.writeText(out.value); toast("Copied"); } catch (_) { out.select(); document.execCommand("copy"); toast("Copied"); } };
  $("#hb-clear").onclick = () => { out.value = ""; sync(); };
  paint(); sync();
})();
