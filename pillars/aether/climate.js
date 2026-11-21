/* Aether: the mountain's year in numbers and its outage record (Claude, 2026-11-21).
   Normals: window.AETHER_NORMALS (climate-data.js, AET-GEM-08, every number checked against NOAA's CSV) as a month table with this month marked.
   PSPS record: window.AETHER_PSPS (AET-GEM-10) through PK.ref, marked "not second-read" until Muse's check. */
(function () {
  const { h } = window.PK;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const f1 = (x) => (x == null ? "–" : Number(x).toFixed(1));
  const f0 = (x) => (x == null ? "–" : String(Math.round(Number(x))));
  const place = (n, dflt) => (n ? n.replace(/,\s*CA US$/, "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : dflt);

  function normals(grid) {
    const N = window.AETHER_NORMALS; if (!N || !N.months) return;
    const st = N.station || {}, sn = st.nearest_snowfall_station || {};
    const snow = {}; (sn.monthly_snow_in || []).forEach((m) => { snow[m.month] = m.snow_in; });
    const today = new URLSearchParams(location.search).get("today"), now = (today ? new Date(today + "T12:00:00") : new Date()).getMonth() + 1;
    const sum = (k) => N.months.reduce((s, m) => s + (+m[k] || 0), 0);
    const rows = N.months.map((m) => h("tr" + (m.month === now ? ".ae-mnow" : ""), null,
      h("th", { scope: "row" }, MON[m.month - 1]), h("td", null, f0(m.tmax_f) + "°"), h("td", null, f0(m.tmin_f) + "°"),
      h("td", null, f1(m.prcp_in)), h("td", null, f1(snow[m.month])), h("td", null, f1(m.days_min_le_32)), h("td", null, f1(m.paint_ok_days))));
    const cur = N.months.find((m) => m.month === now);
    const panel = h("div.glass.span-12.ae-normals", null,
      h("h2", null, "The mountain's year: 1991-2020 normals"),
      h("p.sub", null, `NOAA's 30-year averages for ${place(st.name, "Sandberg")} (${st.dist_mi} mi, ${Number(st.elev_ft || 0).toLocaleString()} ft), the nearest station with temperature and rain; snow from ${place(sn.name, "Lebec")} (${sn.dist_mi} mi).`),
      cur ? h("p.ae-normals-now", null, `${MON[now - 1]} on average: highs near ${f0(cur.tmax_f)}°, lows near ${f0(cur.tmin_f)}°, ${f1(cur.prcp_in)} in of rain, ${f1(cur.days_min_le_32)} frost nights and ${f1(cur.paint_ok_days)} days that reach 50°.`) : null,
      h("div.ae-table-wrap", null, h("table.ae-table", null,
        h("thead", null, h("tr", null, ...["Month", "High", "Low", "Rain (in)", "Snow (in)", "Frost nights", "Days ≥ 50°"].map((t) => h("th", { scope: "col" }, t)))),
        h("tbody", null, ...rows),
        h("tfoot", null, h("tr", null, h("th", { scope: "row" }, "Year"), h("td", null, ""), h("td", null, ""), h("td", null, f1(sum("prcp_in"))), h("td", null, f1(sn.annual_snow_in)), h("td", null, f1(sum("days_min_le_32"))), h("td", null, f1(sum("paint_ok_days"))))))),
      h("p.stat-s", null, "Frost nights: low at or below 32°. Days ≥ 50°: the high reaches 50°, warm enough for most exterior paint and sealant. From Gemini (AET-GEM-08); all 84 numbers checked against NOAA's own file by Claude, 2026-11-21. ",
        st.csv_url ? h("a", { href: st.csv_url, rel: "noopener", target: "_blank" }, "NOAA data") : null));
    grid.appendChild(panel);
  }

  function psps(grid) {
    const rows = window.AETHER_PSPS; if (!rows || !window.PK.ref) return;
    const mount = window.PK.refPanel(grid, { title: "Shut-offs that reached the mountain, 2019-2026", sub: "Every SCE Public Safety Power Shutoff on the circuits that serve Frazier Park, Lebec, Gorman and the canyon, from SCE's own post-event reports; years with none are listed too." });
    window.PK.ref(mount, {
      rows, group: (r) => (String(r.off).slice(0, 4).match(/^\d{4}$/) ? String(r.off).slice(0, 4) : "none found"),
      title: (r) => `${r.event} · ${r.circuit}`,
      value: (r) => (r.off && r.off !== "none found" ? `Off ${r.off}, back ${r.on}` : "No de-energization found"),
      meta: (r) => [r.community, r.customers ? `${r.customers} customers` : "", r.page, "not second-read"].filter(Boolean),
      url: (r) => r.url, quote: (r) => r.quote,
      note: "From Gemini's AET-GEM-10 (2026-11-20). Not second-read yet: Muse checks it against the CPUC copies; until then treat each row as one reader's.",
    });
  }

  function start() {
    const solar = document.getElementById("ae-pane-solar"), ps = document.getElementById("ae-pane-psps");
    if (solar) normals(solar); if (ps) psps(ps);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
