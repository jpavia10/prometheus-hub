/* Aether · Atmospheric & Field Lab (Frazier Park 34.8228°N, 118.9448°W · 4,636 ft).
   window.AETHER = { SEASONS, APPLIANCES, computeBudget, data } */
(function () {
  "use strict";
  const { $, h, day, toast, store, download, pickFile } = PK;
  const S = store("aether"), app = $("#app");

  const SEASONS = {
    winter: { label: "Winter (Dec–Feb)", peakSunH: 4.2, daylight: "9h 55m", lowC: -3, highC: 11, snowLineFt: 4200 },
    spring: { label: "Spring (Mar–May)", peakSunH: 6.4, daylight: "13h 05m", lowC: 3, highC: 18, snowLineFt: 6200 },
    summer: { label: "Summer (Jun–Aug)", peakSunH: 7.8, daylight: "14h 24m", lowC: 11, highC: 29, snowLineFt: 9999 },
    autumn: { label: "Autumn (Sep–Nov)", peakSunH: 5.5, daylight: "11h 10m", lowC: 4, highC: 19, snowLineFt: 7400 },
  };

  const APPLIANCES = [
    { id: "starlink", name: "Starlink Standard", watts: 55, defaultH: 14, on: true, essential: true },
    { id: "fridge", name: "12V Compressor Fridge", watts: 45, defaultH: 10, on: true, essential: true },
    { id: "cpap", name: "CPAP / Medical Device", watts: 40, defaultH: 8, on: false, essential: true },
    { id: "router", name: "Laptop + Mesh Router", watts: 65, defaultH: 8, on: true, essential: false },
    { id: "leds", name: "LED Zone Lighting", watts: 20, defaultH: 5, on: true, essential: true },
    { id: "pump", name: "Well / Transfer Pump", watts: 350, defaultH: 0.8, on: false, essential: true },
    { id: "blanket", name: "Electric Blanket (Low)", watts: 75, defaultH: 4, on: false, essential: false },
  ];

  const DEFAULT_CORRIDORS = [
    { id: "tejon", corridor: "I-5 Tejon / Grapevine (4,144 ft)", status: "clear", aqi: 34, windMph: 14, note: "Nominal pass flow · carry winter chains Nov–Apr", updated: day() },
    { id: "frazier", corridor: "Frazier Mountain Park Rd / Cuddy Valley", status: "clear", aqi: 29, windMph: 11, note: "Dry pavement · frost watch overnight", updated: day() },
    { id: "pmc", corridor: "Mil Potrero Hwy · Pine Mountain Club (5,550 ft)", status: "advisory", aqi: 28, windMph: 18, note: "Gusts above 5,000 ft · shaded ice patches after storms", updated: day() },
  ];

  const getSolar = () => S.get("solar", { season: "autumn", arrayW: 400, bankWh: 2048, derate: 0.78, loads: {} });
  const getAlerts = () => {
    const cur = S.get("alerts", null);
    if (Array.isArray(cur) && cur.length) return cur;
    S.set("alerts", DEFAULT_CORRIDORS);
    return DEFAULT_CORRIDORS;
  };

  function computeBudget(cfg, catalog) {
    const season = SEASONS[cfg.season] || SEASONS.autumn;
    const derate = Math.max(0.4, Math.min(0.95, +cfg.derate || 0.78));
    const arrayW = Math.max(0, +cfg.arrayW || 0);
    const bankWh = Math.max(100, +cfg.bankWh || 2048);
    let loadWh = 0, peakW = 0;
    const rows = (catalog || APPLIANCES).map((a) => {
      const ov = (cfg.loads && cfg.loads[a.id]) || {};
      const on = typeof ov.on === "boolean" ? ov.on : !!a.on;
      const hours = ov.hours != null ? Math.max(0, Math.min(24, +ov.hours)) : a.defaultH;
      const wh = on ? Math.round(a.watts * hours) : 0;
      if (on) { loadWh += wh; peakW += a.watts; }
      return { ...a, on, hours, wh };
    });
    const yieldWh = Math.round(arrayW * season.peakSunH * derate);
    const netWh = yieldWh - loadWh;
    const autonomyH = loadWh > 0 ? Math.round((bankWh / (loadWh / 24)) * 10) / 10 : 999;
    const autonomyDays = loadWh > 0 ? Math.round((bankWh / loadWh) * 10) / 10 : 99;
    return { seasonKey: cfg.season || "autumn", season, arrayW, bankWh, derate, yieldWh, loadWh, netWh, peakW, autonomyH, autonomyDays, rows };
  }

  window.AETHER = {
    SEASONS,
    APPLIANCES,
    computeBudget,
    data: () => ({
      solar: getSolar(),
      budget: computeBudget(getSolar(), APPLIANCES),
      alerts: getAlerts(),
      outages: S.list("outages"),
      wx: S.get("wx", null),
    }),
  };

  let tab = "solar";
  app.innerHTML = `
    <div class="tabs" role="tablist" aria-label="Aether views">
      <button class="tab" type="button" role="tab" data-tab="solar" aria-selected="true">Solar &amp; Autonomy</button>
      <button class="tab" type="button" role="tab" data-tab="pass" aria-selected="false">Pass &amp; Telemetry</button>
      <button class="tab" type="button" role="tab" data-tab="psps" aria-selected="false">PSPS Outage Log</button>
    </div>
    <section id="ae-pane-solar" class="grid">
      <div class="glass span-6">
        <h2>Frazier Park Solar &amp; Power Station Budget</h2>
        <p class="sub">Peak sun hours at 34.82°N / 4,636 ft minus inverter/charge derating vs essential appliances.</p>
        <form class="form" id="ae-cfg">
          <label class="f">Season<select name="season">${Object.entries(SEASONS).map(([k, s]) => `<option value="${k}">${s.label} · ${s.peakSunH}h</option>`).join("")}</select></label>
          <label class="f">Solar Array (W)<input name="arrayW" type="number" min="0" max="20000" step="50" value="400"></label>
          <label class="f">Battery Bank (Wh)<input name="bankWh" type="number" min="200" max="50000" step="64" value="2048"></label>
          <label class="f">Panel Derate<input name="derate" type="number" min="0.4" max="0.95" step="0.02" value="0.78"></label>
          <button class="btn" type="submit">Update Sizing</button>
        </form>
        <div class="grid-2" id="ae-summary" style="margin-top:12px"></div>
      </div>
      <div class="glass lit span-6">
        <h2>24-Hour Solar Yield vs Load &amp; Battery SoC</h2>
        <p class="sub">Hourly PV bell curve against active critical loads (00:00–24:00 PST).</p>
        <canvas id="ae-curve" style="width:100%;height:240px;display:block;margin-top:8px"></canvas>
      </div>
      <div class="glass span-12">
        <h2>Appliance Load Schedule</h2>
        <p class="sub">Toggle devices and hours/day to size runtime and daily solar surplus or deficit.</p>
        <div id="ae-loads"></div>
      </div>
    </section>
    <section id="ae-pane-pass" class="grid" hidden>
      <div class="glass span-12">
        <h2>Mountain Corridor &amp; Ephemeris Telemetry</h2>
        <p class="sub" id="ae-wx-status">Stored baseline pass status (shared read-only to Bastion via prometheus.aether.alerts).</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <button class="btn" id="ae-fetch" type="button">Fetch Telemetry (Open-Meteo 34.82°N)</button>
          <button class="btn quiet" id="ae-sched" type="button">Publish Winter Chain &amp; PSPS Check → Calendar</button>
        </div>
        <div id="ae-alerts"></div>
        <form class="form" id="ae-alert-form" style="margin-top:14px">
          <label class="f">Corridor<select name="id"></select></label>
          <label class="f">Status<select name="status"><option value="clear">clear</option><option value="advisory">advisory</option><option value="watch">watch</option><option value="closed">closed</option></select></label>
          <label class="f">Wind (mph)<input name="windMph" type="number" min="0" max="150" value="14"></label>
          <label class="f wide">Field note<input name="note" maxlength="140" placeholder="Fog at 4,200 ft, chains R2 required..."></label>
          <button class="btn quiet" type="submit">Update Corridor</button>
        </form>
      </div>
    </section>
    <section id="ae-pane-psps" class="grid" hidden>
      <div class="glass span-12">
        <h2>SCE PSPS &amp; Grid Outage Log</h2>
        <form class="form" id="ae-outage-form">
          <label class="f">Date<input name="date" type="date" required></label>
          <label class="f">Duration (hrs)<input name="durationH" type="number" min="0.5" max="240" step="0.5" required value="6"></label>
          <label class="f">Cause<select name="cause"><option value="SCE PSPS">SCE PSPS</option><option value="Storm / Ice">Storm / Ice</option><option value="Equipment Fault">Equipment Fault</option><option value="Planned Maintenance">Planned Maintenance</option></select></label>
          <label class="f wide">Notes (battery % used, generator run, lessons)<input name="note" maxlength="160" required placeholder="Ran 2048Wh bank at 65% SoC overnight; Starlink stable"></label>
          <button class="btn" type="submit">Log Outage</button>
        </form>
        <div id="ae-outages" style="margin-top:12px"></div>
      </div>
    </section>`;

  function switchTab(next) {
    tab = next;
    app.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === next)));
    ["solar", "pass", "psps"].forEach((k) => { $("#ae-pane-" + k).hidden = k !== next; });
  }
  app.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  function emitStore() {
    window.dispatchEvent(new CustomEvent("pk:store", { detail: { pillar: "aether", k: "solar" } }));
  }

  function paint() {
    const D = window.AETHER.data(), B = D.budget;
    const f = $("#ae-cfg");
    f.season.value = B.seasonKey;
    f.arrayW.value = B.arrayW;
    f.bankWh.value = B.bankWh;
    f.derate.value = B.derate;

    const netCls = B.netWh >= 0 ? "pill" : B.netWh >= -400 ? "pill warn" : "pill hot";
    $("#ae-summary").replaceChildren(
      h("div.stat-box", null, h("span.stat-s", null, `Solar Yield (${B.season.peakSunH}h peak sun)`), h("b", null, `${B.yieldWh} Wh/day`), h("span.stat-s", null, `Daylight ${B.season.daylight} · snow line ~${B.season.snowLineFt} ft`)),
      h("div.stat-box", null, h("span.stat-s", null, "Daily Consumption"), h("b", null, `${B.loadWh} Wh/day`), h("span.stat-s", null, `Continuous active peak: ${B.peakW} W`)),
      h("div.stat-box", null, h("span.stat-s", null, "Zero-Sun Autonomy"), h("b", null, B.autonomyDays >= 99 ? "∞" : `${B.autonomyH} hrs`), h("span.stat-s", null, `${B.autonomyDays} days from ${B.bankWh} Wh bank`)),
      h("div.stat-box", null, h("span.stat-s", null, "Daily Net Solar Balance"), h("b", null, `${B.netWh >= 0 ? "+" : ""}${B.netWh} Wh/d`), h("span." + netCls, null, B.netWh >= 0 ? "Surplus" : "Deficit"))
    );

    $("#ae-loads").replaceChildren(...B.rows.map((r) => {
      const cb = h("input", { type: "checkbox", ...(r.on ? { checked: "" } : {}), onchange: () => saveLoad(r.id, cb.checked, +hrs.value) });
      const hrs = h("input.num-in", { type: "number", min: "0", max: "24", step: "0.5", value: String(r.hours), onchange: () => saveLoad(r.id, cb.checked, +hrs.value) });
      return h("div.check-row", null,
        h("label", null, cb, h("b", null, r.name), h("span.stat-s", null, `(${r.watts}W)`)),
        h("span", { style: "display:flex;align-items:center;gap:8px" }, hrs, h("span.stat-s", null, "h/d"), h("span.pill", null, `${r.wh} Wh`))
      );
    }));

    // 24h Solar vs Critical Load & SoC Canvas Curve
    const cv = document.getElementById("ae-curve");
    if (cv) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.max(240, cv.clientWidth || 460), H = cv.clientHeight || 240;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const padL = 40, padR = 14, padT = 22, padB = 26;
      const pvCurve = [], loadCurve = [], socCurve = [];
      let socWh = B.bankWh * 0.72;
      const avgLoadW = B.loadWh / 24;
      for (let hr = 0; hr < 24; hr++) {
        const sun = hr >= 6 && hr <= 18 ? Math.sin(((hr - 6) / 12) * Math.PI) : 0;
        const pvW = Math.round(B.arrayW * B.derate * sun * (B.season.peakSunH / 5.2));
        const ldW = Math.round(avgLoadW * (hr >= 7 && hr <= 22 ? 1.15 : 0.7));
        socWh = Math.max(0, Math.min(B.bankWh, socWh + pvW - ldW));
        pvCurve.push(pvW); loadCurve.push(ldW); socCurve.push((socWh / Math.max(1, B.bankWh)) * 100);
      }
      const maxW = Math.max(200, ...pvCurve, ...loadCurve);
      const X = (i) => padL + (i / 23) * (W - padL - padR);
      const YW = (v) => padT + (1 - v / maxW) * (H - padT - padB);
      const YS = (pct) => padT + (1 - pct / 100) * (H - padT - padB);
      g.strokeStyle = "rgba(255,255,255,0.08)"; g.lineWidth = 1;
      [0, 0.5, 1].forEach((f) => { const yy = padT + f * (H - padT - padB); g.beginPath(); g.moveTo(padL, yy); g.lineTo(W - padR, yy); g.stroke(); });
      g.beginPath(); pvCurve.forEach((v, i) => (i === 0 ? g.moveTo(X(i), YW(v)) : g.lineTo(X(i), YW(v))));
      g.strokeStyle = "#38d9a9"; g.lineWidth = 2.4; g.stroke();
      g.beginPath(); loadCurve.forEach((v, i) => (i === 0 ? g.moveTo(X(i), YW(v)) : g.lineTo(X(i), YW(v))));
      g.strokeStyle = "#ff8a3d"; g.lineWidth = 2; g.stroke();
      g.beginPath(); socCurve.forEach((v, i) => (i === 0 ? g.moveTo(X(i), YS(v)) : g.lineTo(X(i), YS(v))));
      g.strokeStyle = "#74c0fc"; g.lineWidth = 1.8; g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]);
      g.font = "10px system-ui, sans-serif";
      g.fillStyle = "#38d9a9"; g.fillText("Solar W", padL, 12);
      g.fillStyle = "#ff8a3d"; g.fillText("Load W", padL + 62, 12);
      g.fillStyle = "#74c0fc"; g.fillText("Battery SoC %", padL + 120, 12);
      g.fillStyle = "rgba(200,220,255,0.65)";
      [0, 6, 12, 18, 23].forEach((hr) => g.fillText(`${hr}:00`, X(hr) - 10, H - 8));
    }

    const wx = D.wx;
    $("#ae-wx-status").textContent = wx
      ? `Last Open-Meteo sample (${wx.at}): ${wx.tempF}°F · Wind ${wx.windMph} mph · Precip ${wx.precipMm} mm (Frazier Park 34.82°N).`
      : "Stored baseline corridor logs shared read-only to Bastion (prometheus.aether.alerts).";

    const pills = { clear: "pill", advisory: "pill warn", watch: "pill warn", closed: "pill hot" };
    $("#ae-alerts").replaceChildren(...D.alerts.map((a) => h("div.kv", null,
      h("span", null, h("b", null, a.corridor), h("br"), h("span.stat-s", null, `${a.note} · Wind ${a.windMph} mph · AQI ${a.aqi} · ${a.updated}`)),
      h("span." + (pills[a.status] || "pill"), null, a.status)
    )));
    $("#ae-alert-form").id.replaceChildren(...D.alerts.map((a) => h("option", { value: a.id }, a.corridor)));

    const outs = D.outages.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("#ae-outages").replaceChildren(...(outs.length ? outs.map((o) => h("div.kv", null,
      h("span", null, h("b", null, `${o.date} · ${o.cause} (${o.durationH}h)`), h("br"), h("span.stat-s", null, o.note)),
      h("button.btn.quiet.small", { type: "button", onclick: () => { S.remove("outages", o.id); paint(); emitStore(); } }, "Delete")
    )) : [h("p.empty", null, "No PSPS or grid outages logged yet.")]));
  }

  function saveLoad(id, on, hours) {
    const cfg = getSolar();
    cfg.loads = { ...(cfg.loads || {}), [id]: { on, hours: Math.max(0, Math.min(24, hours || 0)) } };
    S.set("solar", cfg);
    paint();
    emitStore();
  }

  $("#ae-cfg").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, cur = getSolar();
    S.set("solar", { ...cur, season: f.season.value, arrayW: +f.arrayW.value || 0, bankWh: +f.bankWh.value || 2048, derate: +f.derate.value || 0.78 });
    toast("Solar sizing updated");
    paint();
    emitStore();
  });

  $("#ae-alert-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, list = getAlerts();
    const next = list.map((a) => a.id === f.id.value ? { ...a, status: f.status.value, windMph: +f.windMph.value || 0, note: f.note.value.trim() || a.note, updated: day() } : a);
    S.set("alerts", next);
    if (window.PB && PB.events) PB.events.publish({ type: "aether.alert", pillar: "aether", ref: f.id.value, title: `${f.id.value}: ${f.status.value}` });
    f.note.value = "";
    toast("Corridor updated");
    paint();
    emitStore();
  });

  $("#ae-outage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const o = S.add("outages", { date: f.date.value, durationH: +f.durationH.value || 1, cause: f.cause.value, note: f.note.value.trim() });
    if (window.PB && PB.events) PB.events.publish({ type: "aether.outage", pillar: "aether", ref: o.id, title: `${o.cause} (${o.durationH}h)` });
    f.note.value = "";
    toast("Outage logged");
    paint();
    emitStore();
  });

  $("#ae-fetch").addEventListener("click", async () => {
    const btn = $("#ae-fetch");
    btn.disabled = true;
    try {
      const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.8228&longitude=-118.9448&current=temperature_2m,wind_speed_10m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph");
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json(), c = j.current || {};
      const wx = { tempF: Math.round(c.temperature_2m || 0), windMph: Math.round(c.wind_speed_10m || 0), precipMm: c.precipitation || 0, at: day() };
      S.set("wx", wx);
      const alerts = getAlerts().map((a, idx) => idx === 1 ? { ...a, windMph: wx.windMph, status: wx.windMph >= 35 ? "advisory" : a.status, updated: day() } : a);
      S.set("alerts", alerts);
      toast(`Synced Frazier Park (${wx.tempF}°F, ${wx.windMph} mph wind)`);
      paint();
      emitStore();
    } catch (e) {
      toast("Offline or Open-Meteo unreachable — local baseline preserved");
    } finally {
      btn.disabled = false;
    }
  });

  $("#ae-sched").addEventListener("click", () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const due = day(d);
    if (window.PB && PB.deadlines) {
      PB.deadlines.publish({ title: "Aether: Winter PSPS, chains & solar bank load check", date: due, source: "aether", kind: "readiness", ref: "psps-check" });
      toast(`Published readiness check for ${due} to shared calendar`);
    }
  });

  $("#export").onclick = () => download(`aether_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); emitStore(); } catch (e) { toast(e.message); } };

  window.addEventListener("pk:store", (e) => {
    if (e.detail && e.detail.pillar === "aether" && e.detail.k === "cycleSeason") {
      const keys = Object.keys(SEASONS), cfg = getSolar();
      const next = keys[(keys.indexOf(cfg.season) + 1) % keys.length];
      S.set("solar", { ...cfg, season: next });
      paint();
    }
  });

  paint();
})();
