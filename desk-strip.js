/* Desk live layer (Sebastian, 2026-11-10; replaces the plain strip from tranche 2):
   the operating picture, computed from what the deck actually holds.
   - Away banner from the shared meta (Odyssey writes it).
   - Next 14 days from the deadlines bus, with the money bus alongside.
   - A live line inside every capability door, computed from that capability's own store.
   - Global search across every capability's records.
   - Full-deck backup / restore (kit/bus.js dumpAll/loadAll).
   Pure summarizers are exposed as window.DESK_LIVE for testing; DOM glue stays thin. */
(function () {
  "use strict";
  const read = (k, dflt) => { try { const v = localStorage.getItem(k); return v == null ? dflt : JSON.parse(v); } catch (_) { return dflt; } };
  const money = (n) => "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function doorLine(id, data) {
    const D = data.deadlines || [], by = (s) => D.filter((d) => d.source === s && !d.done).sort((a, b) => a.date.localeCompare(b.date))[0];
    switch (id) {
      case "selling": { const it = data.selling || []; if (!it.length) return null;
        return `${it.length} item${it.length === 1 ? "" : "s"} · ${it.filter((x) => x.stage === "listed").length} listed · ${it.filter((x) => x.stage === "staged").length} staged`; }
      case "garage": { const d = by("garage"); return d ? `Next: ${d.title.replace("Sorento: ", "")} · ${d.date}` : null; }
      case "records": { const docs = data.records || []; if (!docs.length) return null; const d = by("records");
        return `${docs.length} document${docs.length === 1 ? "" : "s"}${d ? " · next due " + d.date : ""}`; }
      case "athenaeum": { const i = data.ideas || []; return i.length ? `${i.length} idea${i.length === 1 ? "" : "s"} kept` : null; }
      case "bastion": { const it = data.bastion || []; if (!it.length) return null;
        const oz = it.reduce((s, x) => s + (x.weightOz || 0) * (x.qty || 1), 0); return `${it.length} items · ${(oz / 16).toFixed(1)} lb packed`; }
      case "piano": { const bpm = data.pianoBpm; return bpm ? `Ladder at ${bpm} BPM` : null; }
      case "kairos": { const d = (data.deadlines || []).filter((x) => !x.done).sort((a, b) => a.date.localeCompare(b.date))[0];
        return d ? `Next: ${d.title} · ${d.date}` : null; }
      case "money": { const s = data.salesTotal || 0; return s > 0 ? `${money(s)} of sales on the bus` : null; }
      case "odyssey": { const t = (data.trips || []).filter((x) => x.end >= data.today).sort((a, b) => a.start.localeCompare(b.start))[0];
        return t ? `Next: ${t.name} · ${t.start}` : null; }
      case "privacy": { const b = data.brokers || []; const done = b.filter((x) => x.state === "confirmed removed").length;
        return b.length ? `${done}/${b.length} brokers confirmed removed` : null; }
      default: return null;
    }
  }

  function buildIndex(data) {
    const out = [];
    const push = (cap, label, href) => { if (label) out.push({ cap, label: String(label), href }); };
    for (const i of data.selling || []) push("Selling", i.title, "pillars/selling/");
    for (const d of data.records || []) push("Records", d.title, "pillars/records/");
    for (const i of data.ideas || []) push("Athenaeum", i.title, "pillars/athenaeum/");
    for (const b of data.bastion || []) push("Bastion", b.name, "pillars/bastion/");
    for (const t of data.trips || []) push("Odyssey", t.name, "pillars/odyssey/");
    for (const b of data.brokers || []) push("Privacy", b.name, "pillars/privacy/");
    for (const e of data.events || []) push("Time", e.title, "pillars/kairos/");
    return out;
  }
  const search = (index, q) => { const s = String(q || "").toLowerCase(); if (!s) return []; return index.filter((x) => x.label.toLowerCase().includes(s)).slice(0, 8); };

  const DL = { doorLine, buildIndex, search };
  if (typeof window !== "undefined") window.DESK_LIVE = DL;
  if (typeof globalThis !== "undefined") globalThis.DESK_LIVE = DL;
  if (typeof document === "undefined" || !window.PB) return;

  // ----- DOM layer -----
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (window.KAIROS_FIXED) for (const f of KAIROS_FIXED)
    PB.deadlines.publish({ title: f.name, date: f.date, source: "kairos-fixed", kind: f.kind, ref: f.date + "|" + f.name });
  const data = {
    today: PB.today(),
    deadlines: PB.deadlines.list(),
    selling: read("prometheus.selling.items", []), records: read("prometheus.records.docs", []),
    ideas: read("prometheus.athenaeum.ideas", []), bastion: read("prometheus.bastion.items", []),
    trips: read("prometheus.odyssey.trips", []), brokers: read("prometheus.privacy.brokers", []),
    events: read("prometheus.kairos.events", []), pianoBpm: read("prometheus.piano.ladder_bpm", 0),
    salesTotal: Math.max(0, PB.money.total("sale")),
  };
  // live door lines
  for (const id of ["selling", "garage", "records", "athenaeum", "bastion", "piano", "kairos", "money", "odyssey", "privacy"]) {
    const row = document.getElementById(id); if (!row) continue;
    const line = doorLine(id, data); if (!line) continue;
    const st = row.querySelector(".row-status"); if (st) st.textContent = line;
  }
  // operating-picture band
  const el = document.getElementById("bus-strip"); if (!el) return;
  const overdue = PB.deadlines.overdue(), next = PB.deadlines.upcoming(14);
  const away = PB.meta.get("away", null);
  const awayOn = away && away.until >= data.today;
  el.hidden = false;
  el.innerHTML = `
    ${awayOn ? `<div class="op-away">Away — ${esc(away.name || "trip")} · back ${esc(away.until)} · ${next.filter((d) => d.date <= away.until).length} deadline(s) land while you're out</div>` : ""}
    <div class="bus-head"><span class="bus-k">Operating picture · next 14 days</span><a class="bus-link" href="pillars/kairos/">Open Time</a></div>
    ${overdue.length ? `<div class="bus-late">${overdue.length} overdue · oldest: ${esc(overdue[0].title)} (${esc(overdue[0].date)})</div>` : ""}
    <ul class="bus-list">${next.slice(0, 5).map((d) => `<li><span class="bus-when">${esc(d.date.slice(5))}</span><span class="bus-what">${esc(d.title)}</span><span class="bus-src">${esc(d.source)}</span></li>`).join("") || `<li><span class="bus-what">Nothing due in the next 14 days.</span></li>`}</ul>
    ${next.length > 5 ? `<div class="bus-more">+ ${next.length - 5} more in Time</div>` : ""}
    <div class="op-row"><span>Sales on the bus: <b>${money(data.salesTotal)}</b></span><span>${PB.deadlines.list().filter((d) => !d.done).length} open deadlines deck-wide</span></div>
    <form class="op-search" id="op-search-form"><input id="op-q" type="search" placeholder="Search everything — items, documents, ideas, trips…" aria-label="Search the deck"></form>
    <div id="op-results"></div>
    <div class="op-row"><button class="btn quiet small" id="op-backup" type="button">Download full deck backup</button>
    <label class="btn quiet small" for="op-restore-file">Restore backup</label><input id="op-restore-file" type="file" accept="application/json" hidden>
    <span class="bus-src">One file, every capability. Keep it somewhere safe.</span></div>`;
  const index = buildIndex(data);
  document.getElementById("op-q").addEventListener("input", (e) => {
    const hits = search(index, e.target.value);
    document.getElementById("op-results").innerHTML = hits.map((hgt) => `<div class="bus-list"><li><span class="bus-src">${esc(hgt.cap)}</span><a class="bus-link" href="${hgt.href}">${esc(hgt.label)}</a></li></div>`).join("");
  });
  document.getElementById("op-backup").onclick = () => {
    const blob = new Blob([JSON.stringify(PB.dumpAll(), null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "prometheus-backup-" + data.today + ".json";
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  };
  document.getElementById("op-restore-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const obj = JSON.parse(await f.text()); if (!confirm("Restore this backup? It replaces the deck's current data in this browser.")) return;
      PB.loadAll(obj); location.reload(); } catch (err) { alert("That file is not a Prometheus backup."); }
  });
})();
