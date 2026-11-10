/* Hermes billers + triage lanes (Sebastian, 2026-11-10): pick a biller and get the exact Gmail
   search that finds its statements; five triage lanes prebuilt from the operator research.
   Manual-first throughout — Hermes builds the search, you run it in your own Gmail. */
(function () {
  "use strict";
  const root = document.getElementById("hermes-lanes"); if (!root || !window.BILLERS) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const open = (q) => "https://mail.google.com/mail/u/0/#search/" + encodeURIComponent(q);
  const billerQuery = (b) => {
    const from = b.d.length ? `from:(${b.d.join(" OR ")})` : "";
    const subj = (b.s || []).slice(0, 2).map((w) => `subject:"${w}"`).join(" OR ");
    return [from, subj ? `(${subj})` : ""].filter(Boolean).join(" OR ");
  };
  const LANES = [
    { name: "Bills & statements", q: 'subject:(statement OR "payment due" OR "amount due" OR "your bill") -label:read', why: "Everything asking for money, unread first." },
    { name: "Receipts & orders", q: 'subject:(receipt OR "order confirmation" OR "your order" OR shipped OR "tracking")', why: "Proof of purchase, in one pile." },
    { name: "Security & account alerts", q: 'subject:(security OR "sign-in" OR "verification" OR "password" OR alert) from:(google.com OR apple.com OR microsoft.com OR chase.com OR americanexpress.com)', why: "The lane to read before all others." },
    { name: "Travel", q: 'subject:(itinerary OR "booking confirmation" OR "flight" OR "check-in") has:attachment', why: "Trips, with their documents attached." },
    { name: "Newsletters (bulk-clear candidates)", q: "label:promotions OR category:promotions older_than:90d", why: "Old bulk mail — review before any bulk action; Hermes never deletes." },
  ];
  root.innerHTML = `<div class="glass" style="margin-top:14px"><h2>Find a bill — 60 known billers</h2>
    <form class="form"><label class="f wide">Biller<select id="hl-biller">${BILLERS.map((b, i) => `<option value="${i}">${esc(b.b)} (${esc(b.k.replace(/_/g, " "))})</option>`).join("")}</select></label></form>
    <div class="bill" style="margin-top:8px"><div class="bill-when">Exact Gmail search</div><div class="mono" id="hl-q"></div>
    <div class="row-actions"><a class="btn small" id="hl-open" target="_blank" rel="noopener">Open in Gmail</a>
    <button class="btn quiet small" id="hl-copy" type="button">Copy search</button></div>
    <p class="note">Checks both the biller's real sender domains and its statement subject lines, so a renamed alert still surfaces. Hermes never opens your mailbox — you run the search.</p></div></div>
  <div class="glass" style="margin-top:14px"><h2>Triage lanes</h2>
    ${LANES.map((l) => `<div class="bill"><div class="bill-when">${esc(l.name)}</div><p style="margin:2px 0">${esc(l.why)}</p><div class="mono">${esc(l.q)}</div><div class="row-actions"><a class="btn quiet small" target="_blank" rel="noopener" href="${open(l.q)}">Open lane in Gmail</a></div></div>`).join("")}
    <p class="note">Lanes are saved searches, not automation: nothing is labeled, archived, or deleted by Hermes. That stays your call, in Gmail, after you see the pile.</p></div>`;
  const sel = root.querySelector("#hl-biller"), q = root.querySelector("#hl-q"), a = root.querySelector("#hl-open");
  const sync = () => { const query = billerQuery(BILLERS[Number(sel.value)]); q.textContent = query; a.href = open(query); };
  sel.addEventListener("change", sync); sync();
  root.querySelector("#hl-copy").onclick = async () => { try { await navigator.clipboard.writeText(q.textContent); } catch (_) { /* clipboard unavailable */ } };
})();
