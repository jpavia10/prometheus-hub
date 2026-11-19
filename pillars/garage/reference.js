/* Garage reference panels (Claude, 2026-11-19): the manuals, NHTSA's bulletins, tires and chain controls, and the mileage
   baseline with this week's gas price, from window.GARAGE_REF (reference-data.js; Gemini 4 Neon GAR-GEM-08 to 11).
   "Check live" asks fueleconomy.gov from the phone: it answers GAR-GEM-11's open CORS question and is kept in
   prometheus.garage.epaLive. Nothing here writes to the service or fuel logs. */
(function () {
  const R = window.GARAGE_REF, PK = window.PK; if (!R || !PK || !PK.ref) return;
  const { h, store, money } = PK; const S = store("garage");
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  function baseline(grid) {
    const panel = h("div.glass.lit.span-12.g-base", null, h("h2", null, "Mileage baseline and gas price"),
      h("p.sub", null, "The EPA rating for the Sorento Hybrid next to what your fill-ups say, and this week's California price for a full tank."));
    const body = h("div"); panel.append(body); grid.append(panel);
    const ca = R.eia.last4.find((s) => /SCA/.test(s.series_id)), us = R.eia.last4.find((s) => /NUS/.test(s.series_id));
    const tankRow = R.specs.find((r) => /Sorento/.test(r.vehicle) && r.item === "fuel tank capacity");
    const tank = tankRow ? parseFloat(tankRow.value) : null;
    function paint() {
      const fs = window.GARAGE && window.GARAGE.fuelStats ? window.GARAGE.fuelStats(S.list("fuel")) : { mpg: null };
      const live = S.get("epaLive", null);
      const tile = (k, v, s) => h("div.stat-cell", null, h("span.stat-k", null, k), h("b", null, v), s ? h("span.stat-s", null, s) : null);
      const veh = R.epa.vehicles.map((v) => tile(`EPA · ${v.model.replace("Sorento Hybrid ", "")}`, `${v.comb08} MPG`, `${v.city08} city · ${v.highway08} hwy · $${v.fuelCost08.toLocaleString()}/yr`));
      const mine = fs.mpg ? tile("Your fill-ups", `${fs.mpg.toFixed(1)} MPG`, `${R.epa.vehicles.map((v) => `${fs.mpg >= v.comb08 ? "+" : ""}${(fs.mpg - v.comb08).toFixed(1)} vs ${v.drive.split("-")[0]}`).join(" · ")}`)
        : tile("Your fill-ups", "—", "log two fills to compare");
      const latest = ca && ca.values[0], lastUS = us && us.values[0];
      const trend = ca ? ca.values.slice().reverse().map((v, i) => ({ x: i, y: v.value })) : [];
      const cv = h("canvas.g-gas", { "aria-hidden": "true" });
      body.replaceChildren(
        h("div.stat-strip", null, ...veh, mine),
        h("div.g-gas-row", null,
          h("div", null, h("span.stat-k", null, `California regular · week of ${latest ? latest.period : "?"}`), h("b.g-gas-big", null, latest ? `$${latest.value.toFixed(3)}` : "—"),
            h("span.stat-s", null, lastUS ? `U.S. $${lastUS.value.toFixed(3)} · ${tank ? `full ${tank} gal tank ${money(tank * latest.value)}` : ""}` : "")),
          cv),
        h("div.g-live", null,
          h("button.btn.quiet.small", { type: "button", onclick: check }, "Check live"),
          h("span.stat-s", null, live ? live.text : `EIA weekly prices through ${latest ? latest.period : "?"} (EIA release ${ca ? ca.release_date : "?"}); EPA ratings from fueleconomy.gov ids ${R.epa.vehicles.map((v) => v.id).join(" and ")}.`)));
      if (PK.spark && trend.length > 1) try { PK.spark(cv, trend, { color: "#ffb86b" }); } catch (_) { /* spark is decoration */ }
    }
    async function check() {
      const out = body.querySelector(".g-live .stat-s"); out.textContent = "Asking fueleconomy.gov…";
      const v = R.epa.vehicles[0];
      try {
        const r = await fetch(`https://www.fueleconomy.gov/ws/rest/vehicle/${v.id}`, { headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json(); const same = Number(j.comb08) === v.comb08 && Number(j.city08) === v.city08 && Number(j.highway08) === v.highway08;
        const text = `fueleconomy.gov answered the phone directly (CORS allowed): id ${v.id} is ${j.city08}/${j.highway08}/${j.comb08} MPG, ${same ? "same as the stored numbers" : "DIFFERENT from the stored numbers"}.`;
        S.set("epaLive", { at: new Date().toISOString(), cors: true, same, text }); out.textContent = text;
      } catch (e) {
        const text = `fueleconomy.gov did not answer this page directly (${e.message}; most likely no CORS header). The stored ratings stay.`;
        S.set("epaLive", { at: new Date().toISOString(), cors: false, text }); out.textContent = text;
      }
    }
    paint(); window.addEventListener("pk:store", (e) => { if (e.detail && e.detail.pillar === "garage" && /fuel/.test(e.detail.k)) paint(); });
  }

  function start() {
    const grid = document.querySelector("#app section.grid"); if (!grid) return;
    baseline(grid);
    PK.ref(PK.refPanel(grid, { title: "From the owner's manuals", sub: "Oil, fluids, capacities, pressures and torques, each with its manual page and the manual's own line." }), {
      rows: R.specs, group: (r) => (/Kia/.test(r.vehicle) ? "Sorento Hybrid" : "MT-07"),
      title: (r) => r.item.charAt(0).toUpperCase() + r.item.slice(1), value: (r) => r.value,
      meta: (r) => [/Kia/.test(r.vehicle) ? "2025 Sorento Hybrid" : "2021 MT-07", `p. ${r.page}`], url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini GAR-GEM-08 (2026-11-19): 30 rows from Kia's and Yamaha's own owner's manuals.",
    });
    PK.ref(PK.refPanel(grid, { title: "Service bulletins", sub: "What Kia has told dealers about the 2025 Sorento Hybrid (NHTSA manufacturer communications). Not recalls: a dealer applies these when the symptom shows." }), {
      rows: R.tsbs, group: (r) => (r.hybrid === "yes" ? "Hybrid system" : clean(r.component.split(",")[0]).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())),
      title: (r) => r.symptom, meta: (r) => [r.date, r.bulletin_no, clean(r.component).toLowerCase(), `NHTSA ${r.nhtsa_id}`], url: (r) => r.url, quote: (r) => r.quote,
      note: `${R.tsb_total.symptom} Gemini GAR-GEM-09, 2026-11-19.`,
    });
    PK.ref(PK.refPanel(grid, { title: "Tires and chain controls", sub: "Factory sizes, what Caltrans R1, R2 and R3 mean on the Grapevine, and three all-weather tires that carry the snowflake mark." }), {
      rows: R.tires, group: (r) => ({ oe: "Factory", caltrans: "Chain controls", replacement: "All-weather" }[r.kind] || r.kind),
      title: (r) => r.subject, value: (r) => r.size || "", detail: (r) => r.details, url: (r) => r.url, quote: (r) => r.quote,
      note: "Gemini GAR-GEM-10, 2026-11-19.",
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
