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
  // The directory: every known sender as a ruled ledger row, grouped by the class the data files it
  // under (b.k). Counts are read from the data at render. Tapping a row loads that biller above.
  const ORDER = ["credit_card", "power", "gas", "water", "internet", "mobile", "insurance", "car_loan", "student_loan", "streaming", "subscription"];
  const classes = ORDER.filter((k) => BILLERS.some((b) => b.k === k));
  const dirHTML = `<div class="glass" style="margin-top:14px"><h2>The directory — senders by class</h2>
    <p class="note">The full biller directory as a ledger: sender, the domains its mail really comes from, and how many statement subjects are on file. Tap a row to load its exact search above.</p>
    ${classes.map((k) => {
      const rows = BILLERS.map((b, i) => ({ b, i })).filter((x) => x.b.k === k);
      return `<div class="dir-group"><div class="dir-head"><span>${esc(k.replace(/_/g, " "))}</span><span class="dir-count">${rows.length} known</span></div>
      ${rows.map(({ b, i }) => `<button class="dir-row" type="button" data-bi="${i}"><span class="dir-name">${esc(b.b)}</span><span class="dir-dom mono">${esc(b.d.join(" · "))}</span><span class="dir-n">${b.d.length} domain${b.d.length === 1 ? "" : "s"} · ${(b.s || []).length} subject${(b.s || []).length === 1 ? "" : "s"}</span></button>`).join("")}</div>`;
    }).join("")}</div>`;
  const lanesGlass = root.querySelectorAll(".glass")[1];
  if (lanesGlass) lanesGlass.insertAdjacentHTML("beforebegin", dirHTML); else root.insertAdjacentHTML("beforeend", dirHTML);

  const sel = root.querySelector("#hl-biller"), q = root.querySelector("#hl-q"), a = root.querySelector("#hl-open");
  const sync = () => { const query = billerQuery(BILLERS[Number(sel.value)]); q.textContent = query; a.href = open(query); };
  sel.addEventListener("change", sync); sync();
  root.querySelectorAll("[data-bi]").forEach((btn) => (btn.onclick = () => { sel.value = btn.dataset.bi; sync(); sel.scrollIntoView({ block: "nearest", behavior: "smooth" }); }));
  root.querySelector("#hl-copy").onclick = async () => { try { await navigator.clipboard.writeText(q.textContent); } catch (_) { /* clipboard unavailable */ } };
})();
