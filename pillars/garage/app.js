/* Garage v2: hybrid SUV maintenance + fuel + Money Bus fuel expense publishing + the mountain community Trip Cost Estimator. */
(function () {
  "use strict";
  const { $, h, money, num, day, toast, store, download, pickFile, field, G } = PK;
  const S = store("garage");
  const app = $("#app");
  field({ count: 800, at: [0.74, 0.34], scale: 0.22, glyph: (n) => [...G.ring(Math.round(n * 0.55), 1), ...G.line(Math.round(n * 0.45), -0.7, 0.7, 0.7, -0.7)] });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KIA = window.GARAGE_SCHEDULE || null;
  const withIds = (arr) => arr.map((x) => ({ id: Math.random().toString(36).slice(2, 8), ...x }));
  const kiaSet = (which) => KIA ? withIds(which === "normal" ? KIA.garage_services_normal : KIA.garage_services_severe_frazier) : null;

  /* Two vehicles (Sebastian, 2026-11-14): the Sorento keeps the original flat keys, so every
     existing profile is untouched; the MT-07 lives under mt07.* keys with its own factory seed. */
  const MT07 = window.MT07_SCHEDULE || null;
  // The showroom (showroom.js) is a module, so it runs after this file: queue calls until it is ready.
  const g3d = (fn) => (window.G3D ? fn(window.G3D) : window.addEventListener("g3d:ready", () => fn(window.G3D), { once: true }));
  const VEHICLES = [
    { key: "sorento", prefix: "", label: "2025 Sorento Hybrid" },
    { key: "mt07", prefix: "mt07.", label: "2021 Yamaha MT-07" },
  ];
  const veh = () => VEHICLES.find((v) => v.key === S.get("activeVehicle", "sorento")) || VEHICLES[0];
  const K = (base) => veh().prefix + base;
  /* Spec-plate figures (presentation only): the factory dimensions and power outputs — Sorento 4,815 × 1,900 × 1,695 mm,
     WB 2,815, 227 hp combined; MT-07 2,085 × 795 × 1,095 mm, WB 1,400, 72.4 hp (54 kW). The showroom models
     (models/models.json lengthM) are scaled to the same lengths: if a figure is ever corrected here, correct it there too. */
  const PLATES = {
    sorento: { bay: "Bay 01", power: "1.6L turbo hybrid · 227 hp combined", dims: [["Length", "4,815 mm"], ["Width", "1,900 mm"], ["Height", "1,695 mm"], ["Wheelbase", "2,815 mm"]], src: "Kia factory dimensions · severe mountain schedule on file" },
    mt07: { bay: "Bay 02", power: "689cc CP2 twin · 72.4 hp (54 kW)", dims: [["Length", "2,085 mm"], ["Width", "795 mm"], ["Height", "1,095 mm"], ["Wheelbase", "1,400 mm"]], src: "Yamaha factory dimensions · owner's manual BAT-28199-10" },
  };
  const mt07Set = () => MT07 ? withIds(MT07.services.map((x) => ({ name: x.name, miles: x.miles, months: x.months }))) : null;
  if (!S.get("mt07.services")) { const s = mt07Set(); if (s) S.set("mt07.services", s); }
  if (!S.get("mt07.vehicle")) S.set("mt07.vehicle", { name: "2021 Yamaha MT-07" });

  if (!S.get("services")) S.set("services", kiaSet("severe") || withIds([
    { name: "Engine oil + filter", miles: 5000, months: 6 },
    { name: "Tire rotation", miles: 8000, months: 12 },
    { name: "Cabin air filter", miles: 16000, months: 24 },
    { name: "Engine air filter", miles: 24000, months: 36 },
    { name: "Brake fluid", miles: 48000, months: 48 },
    { name: "Spark plugs", miles: 48000, months: null },
  ]));

  if (KIA && S.get("services") && !S.get("factoryV2")) {
    const FACTORY = [{"name": "Engine oil + filter", "miles": 5000, "months": 6}, {"name": "Tire rotation", "miles": 8000, "months": 12}, {"name": "Cabin (climate control) air filter - replace", "miles": 16000, "months": 24}, {"name": "Engine air filter - replace", "miles": 24000, "months": 36}, {"name": "Brake fluid - replace", "miles": 48000, "months": 48}, {"name": "Spark plugs", "miles": 48000, "months": null}, {"name": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)", "miles": 120000, "months": 120}, {"name": "Inverter coolant HEV (first at 120k mi / 120 mo, then 24k/24)", "miles": 120000, "months": 120}, {"name": "HSG belt - inspect", "miles": 5000, "months": 6}, {"name": "HSG belt - replace", "miles": 30000, "months": 24}, {"name": "Automatic transmission fluid - replace", "miles": 56000, "months": null}, {"name": "Rear differential oil - replace (AWD)", "miles": 72000, "months": null}, {"name": "Transfer case oil - replace (AWD)", "miles": 72000, "months": null}, {"name": "Multi-point inspection (brakes, suspension, steering, drive/prop shaft", "miles": 8000, "months": 12}];
    const ALIAS = {"Engine oil + filter": "Engine oil + filter", "Tire rotation": "Tire rotation", "Cabin air filter": "Cabin (climate control) air filter - replace", "Engine air filter": "Engine air filter - replace", "Brake fluid": "Brake fluid - replace", "Spark plugs": "Spark plugs", "Engine coolant": "Engine coolant (first at 120k mi / 120 mo, then 24k/24)", "Hybrid system / HSG belt inspection": "HSG belt - inspect"};
    const serviced = new Set(S.list("history").map((x) => x.service));
    const byName = Object.fromEntries(FACTORY.map((f) => [f.name, f]));
    const used = new Set();
    const svcs = S.get("services", []).map((it) => {
      const f = byName[ALIAS[it.name] || it.name]; if (!f) return it;
      used.add(f.name);
      return serviced.has(it.name) ? { ...it, miles: f.miles, months: f.months } : { ...it, name: f.name, miles: f.miles, months: f.months };
    });
    for (const f of FACTORY) if (!used.has(f.name) && !svcs.some((x) => x.name === f.name)) svcs.push({ id: Math.random().toString(36).slice(2, 8), ...f });
    S.set("services", svcs); S.set("factoryV2", 1);
  }

  const odo = () => S.get(K("odometer"), 0);
  const vehicleName = () => { const v = S.get(K("vehicle"), null); const n = v && String(v.name || "").trim(); return n || "Vehicle"; };
  const lastFor = (name) => S.list(K("history")).filter((x) => x.service === name).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  const fallbackAddMonths = (ds, m) => { const d = new Date(ds + "T12:00:00"); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };
  const getGarageMath = () => (typeof window !== "undefined" && window.GARAGE) || (typeof globalThis !== "undefined" && globalThis.GARAGE) || {};
  const getPB = () => (typeof window !== "undefined" && window.PB) || (typeof globalThis !== "undefined" && globalThis.PB) || null;

  function computeNextDueDate(it, st, baseDate) {
    if (st && st.dueDate) return st.dueDate;
    const g = getGarageMath();
    const addMo = g.addMonths || fallbackAddMonths;
    if (it && it.months) return addMo(baseDate, it.months);
    if (st && st.milesLeft != null && st.milesLeft <= 0) return baseDate;
    return null;
  }

  function estimateTrip(milesOrOpts, gasPriceOpt, fuelOpt) {
    const opts = (milesOrOpts && typeof milesOrOpts === "object")
      ? milesOrOpts
      : { miles: milesOrOpts, gasPrice: gasPriceOpt, fuel: fuelOpt };
    const miEl = $("#g-trip-mi"), gasEl = $("#g-gas-price");
    const milesRaw = opts.miles !== undefined ? opts.miles : (miEl ? +miEl.value : 0);
    const gasRaw = opts.gasPrice !== undefined ? opts.gasPrice : (gasEl ? +gasEl.value : 4.65);
    const miles = Math.max(0, Number(milesRaw) || 0);
    const gasPrice = Math.max(0, Number(gasRaw) || 4.65);
    const fuelEntries = Array.isArray(opts.fuel) ? opts.fuel : S.list(K("fuel"));
    const g = getGarageMath();
    const fs = g.fuelStats ? g.fuelStats(fuelEntries) : { mpg: null, costPerMile: null };
    const usedLogged = fs.costPerMile != null && fs.mpg != null;
    const fbMpg = veh().key === "mt07" ? null : 34; // Sorento: hybrid SUV AWD ~34 MPG combined EPA reference when <2 fills logged. MT-07: no honest factory figure — logged fills only.
    const mpg = usedLogged ? fs.mpg : fbMpg;
    const costPerMile = usedLogged ? fs.costPerMile : (mpg ? gasPrice / mpg : null);
    const gallons = mpg > 0 ? miles / mpg : 0;
    const cost = miles * costPerMile;
    return { miles, gasPrice, mpg, costPerMile, gallons, cost: cost || 0, estCost: cost || 0, source: usedLogged ? "logged" : "epa" };
  }

  function nextDueServices(nowOpt) {
    const now = {
      date: (nowOpt && nowOpt.date) || day(),
      odometer: (nowOpt && nowOpt.odometer != null) ? Number(nowOpt.odometer) : odo(),
    };
    const g = getGarageMath();
    const svcs = S.get(K("services"), []);
    const rank = { overdue: 0, "due soon": 1, ok: 2, unknown: 3 };
    return svcs.map((it) => {
      const last = lastFor(it.name);
      const st = g.dueStatus ? g.dueStatus(it, last, now) : { state: "unknown", dueDate: null, dueMiles: null };
      const nextDueDate = computeNextDueDate(it, st, now.date);
      return { id: it.id, name: it.name, miles: it.miles, months: it.months, last, ...st, nextDueDate };
    }).sort((a, b) => {
      const ra = rank[a.state] ?? 4, rb = rank[b.state] ?? 4;
      if (ra !== rb) return ra - rb;
      const da = a.daysLeft ?? 1e9, db = b.daysLeft ?? 1e9;
      if (da !== db) return da - db;
      return (a.milesLeft ?? 1e9) - (b.milesLeft ?? 1e9);
    });
  }

  function data() {
    const g = getGarageMath();
    const fuel = S.list(K("fuel"));
    return {
      odometer: odo(),
      services: S.get(K("services"), []),
      history: S.list(K("history")),
      fuel,
      paperwork: S.list(K("paperwork")),
      fuelStats: g.fuelStats ? g.fuelStats(fuel) : null,
      nextDue: nextDueServices(),
    };
  }

  const GARAGE_API = Object.assign(getGarageMath(), { data, estimateTrip, nextDueServices });
  if (typeof window !== "undefined") window.GARAGE = GARAGE_API;
  if (typeof globalThis !== "undefined") globalThis.GARAGE = GARAGE_API;

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-12 bay-panel"><h2>Vehicles — the bays</h2>
        <div class="row-actions" id="g-vehicles" style="margin-bottom:8px"></div>
        <div id="g-plate"></div>
        <p class="note">Each vehicle keeps its own odometer, service list, fuel log and paperwork on this device. The Sorento's records are exactly where they always were.</p>
      </div>
      <div class="glass span-12 showroom"><h2>Vehicles in 3D — showroom</h2>
        <div class="stage-frame"><canvas id="g-3d" aria-label="Interactive 3D model of the active vehicle"></canvas></div>
        <p class="note" id="g-3d-cap" style="margin-top:8px"></p>
      </div>
      <div class="glass span-6"><h2>Odometer &amp; economy</h2>
        <div id="g-odo-plate"></div>
        <form class="form" id="g-odo">
          <label class="f">Name on this device<input name="vehicle" maxlength="40" placeholder="Vehicle"></label>
          <label class="f">Current odometer (mi)<input name="odometer" type="number" min="0" step="1"></label>
          <label class="f">As of<input name="date" type="date"></label>
          <button class="btn" type="submit">Update</button>
        </form>
        <div id="g-fuel-sum" style="margin-top:10px"></div>
      </div>

      <div class="glass lit span-6"><h2>Trip cost</h2>
        <form class="form" id="g-trip">
          <label class="f">Distance preset<select id="g-route">
            <option value="84">Round trip · 84 mi</option>
            <option value="116">Round trip · 116 mi</option>
            <option value="28">Round trip · 28 mi</option>
            <option value="custom">Custom round-trip miles</option>
          </select></label>
          <label class="f">Round-trip miles<input id="g-trip-mi" type="number" min="1" value="84"></label>
          <label class="f">Gas price ($/gal, fallback)<input id="g-gas-price" type="number" step="0.01" min="1" value="4.65"></label>
        </form>
        <div id="g-trip-out" style="margin-top:8px"></div>
      </div>

      <div class="glass span-12 board-panel"><h2 id="g-maint-title">Maintenance</h2><div id="g-services"></div>
        <p class="note" id="g-maint-note"></p>
        <div id="g-specs" style="margin-bottom:10px"></div>
        ${KIA ? `<div class="row-actions" id="g-kia-btns" style="margin-bottom:10px"><button class="btn quiet small" id="g-kia-severe" type="button">Load Kia severe schedule</button><button class="btn quiet small" id="g-kia-normal" type="button">Load Kia normal schedule</button></div>` : ""}
        <div class="row-actions" id="g-mt07-btns" style="margin-bottom:10px" hidden><button class="btn quiet small" id="g-mt07-load" type="button">Reload Yamaha factory schedule</button></div>
        <form class="form" id="g-addsvc">
          <label class="f wide">New service<input name="name" required maxlength="80"></label>
          <label class="f">Every (miles)<input name="miles" type="number" min="0"></label>
          <label class="f">Every (months)<input name="months" type="number" min="0"></label>
          <button class="btn" type="submit">Add</button>
        </form>
      </div>

      <div class="glass span-6"><h2>Log a service</h2>
        <form class="form" id="g-log">
          <label class="f wide">Service<select name="service" id="g-log-sel"></select></label>
          <label class="f">Date<input name="date" type="date" required></label>
          <label class="f">Odometer<input name="odometer" type="number" min="0" required></label>
          <label class="f">Cost $<input name="cost" type="number" step="0.01" min="0"></label>
          <label class="f wide">Notes<input name="notes" maxlength="160"></label>
          <button class="btn" type="submit">Log it</button>
        </form>
        <div id="g-history" style="margin-top:10px"></div>
      </div>

      <div class="glass span-6"><h2>Fuel Log (Optional Money Bus Sync)</h2>
        <form class="form" id="g-fuel">
          <label class="f">Date<input name="date" type="date" required></label>
          <label class="f">Odometer<input name="odometer" type="number" min="0" required></label>
          <label class="f">Gallons<input name="gallons" type="number" step="0.001" min="0" required></label>
          <label class="f">Total cost $<input name="cost" type="number" step="0.01" min="0" required></label>
          <label class="f wide"><input type="checkbox" name="toBus" checked> Publish fuel cost to shared Money Bus</label>
          <button class="btn" type="submit">Add fill</button>
        </form>
        <div id="g-fills" style="margin-top:10px"></div>
      </div>

      <div class="glass lit span-6"><h2>CA DMV, Insurance &amp; Winter Paperwork Radar</h2>
        <p class="sub">Track TX&rarr;CA DMV registration, smog, auto insurance renewal, and Big Bear winter tire/chain inspection. Auto-publishes due dates to Kairos.</p>
        <form class="form" id="g-paper-form">
          <label class="f wide">Compliance / Paperwork Item<input name="title" required maxlength="90" placeholder="CA DMV Registration, Auto Policy Renewal, Tire Chain Check"></label>
          <label class="f">Due Date<input name="due" type="date" required></label>
          <label class="f">Type<select name="kind"><option value="dmv">CA DMV / Title</option><option value="insurance">Insurance</option><option value="winter">Mountain / Winter Prep</option><option value="warranty">Warranty</option></select></label>
          <button class="btn small" type="submit">Track &amp; Sync</button>
        </form>
        <div id="g-paper-list" style="margin-top:10px"></div>
      </div>

      <div class="glass span-6"><h2>Resale dossier</h2>
        <p class="sub">Compile odometer, verified MPG &amp; cost-per-mile, completed service receipts, and open factory intervals into a clean buyer-ready dossier.</p>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn" id="g-dossier-btn" type="button">Export Resale Dossier (.txt)</button>
        </div>
        <pre id="g-dossier-preview" style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(5,8,16,0.65);border:1px solid rgba(255,255,255,0.08);font-size:11.5px;white-space:pre-wrap;max-height:175px;overflow:auto"></pre>
      </div>
    </section>`;

  function paintTrip() {
    const est = estimateTrip();
    if (est.mpg == null) { $("#g-trip-out").innerHTML = `<div class="stat-s">Log two fuel fills on the MT-07 to compute its real trip cost — Yamaha publishes no EPA figure to fall back on.</div>`; return; }
    $("#g-trip-out").innerHTML = `<div class="trip-read"><span class="stat-k">Estimated fuel · ${num(est.miles)} mi</span><b class="trip-cost">${money(est.cost)}</b></div>
      <div class="stat-s">${est.source === "logged" ? `Using your logged ${num(est.mpg, 1)} MPG (${money(est.costPerMile, 3)}/mi)` : `Using ${est.mpg} MPG hybrid SUV EPA estimate @ ${money(est.gasPrice)}/gal (${money(est.costPerMile, 3)}/mi)`}</div>`;
  }

  function paint() {
    const now = { date: day(), odometer: odo() };
    const pb = getPB();
    const g = getGarageMath();
    const vNow = veh();
    g3d((G) => G.setVehicle(vNow.key));
    $("#g-vehicles").innerHTML = VEHICLES.map((v) => `<button class="btn ${v.key === vNow.key ? "" : "quiet"} small" data-veh="${v.key}" type="button">${esc(v.label)}${v.key === vNow.key ? " · active" : ""}</button>`).join("");
    $("#g-vehicles").querySelectorAll("[data-veh]").forEach((b) => (b.onclick = () => { S.set("activeVehicle", b.dataset.veh); paint(); paintPaperworkAndDossier(); }));
    const plate = PLATES[vNow.key] || PLATES.sorento;
    $("#g-plate").innerHTML = `<div class="plate">
      <div class="plate-id"><span class="plate-bay">${plate.bay} · in the bay</span><span class="plate-name">${esc(vNow.label)}</span><span class="plate-power">${esc(plate.power)}</span></div>
      ${plate.dims.map(([k, v]) => `<div class="plate-cell"><span class="plate-k">${k}</span><span class="plate-v">${v}</span></div>`).join("")}
      <div class="plate-cell hot"><span class="plate-k">Odometer</span><span class="plate-v">${num(odo())} mi</span></div>
      <div class="plate-src">${esc(plate.src)}</div>
    </div>`;
    $("#g-odo-plate").innerHTML = `<div class="odo-read"><span class="odo-v">${num(odo())}</span><span class="odo-u">mi on the clock</span></div><div class="odo-name">${esc(vehicleName())} · this device's record</div>`;
    const isBike = vNow.key === "mt07";
    $("#g-maint-title").textContent = isBike ? "Maintenance (Yamaha Factory Schedule)" : "Maintenance (Severe Mountain Schedule)";
    $("#g-maint-note").textContent = isBike
      ? "Intervals from the 2021 MT-07 owner's manual (BAT-28199-10) periodic charts — US chart. Logging a service resets both clocks and republishes the due date."
      : "Intervals from the hybrid SUV maintenance table (severe mountain-road schedule, or the normal table). Logging a service resets both clocks and republishes the due date.";
    const kb = $("#g-kia-btns"); if (kb) kb.hidden = isBike;
    const mb = $("#g-mt07-btns"); if (mb) mb.hidden = !isBike;
    $("#g-specs").innerHTML = isBike && MT07 ? `<div class="spec-sheet">${MT07.specs.map((s) => { const i = s.indexOf(":"); const k = i > 0 ? s.slice(0, i) : "Spec"; const v = i > 0 ? s.slice(i + 1).trim() : s; return `<div class="spec-row"><span class="spec-k">${esc(k)}</span><span class="spec-v">${esc(v)}</span></div>`; }).join("")}</div>` : "";
    $("#g-odo").odometer.value = odo() || ""; $("#g-odo").date.value = day(); $("#g-odo").vehicle.value = S.get(K("vehicle"), null)?.name || "";
    const svcs = S.get(K("services"), []);
    $("#g-services").innerHTML = svcs.map((it) => {
      const st = g.dueStatus(it, lastFor(it.name), now);
      if (pb && pb.deadlines && st.dueDate && st.state !== "unknown") pb.deadlines.publish({ title: vehicleName() + ": " + it.name, date: st.dueDate, source: "garage", kind: "service", ref: it.id });
      const nextDueDate = computeNextDueDate(it, st, now.date);
      const cls = st.state === "overdue" ? "over" : st.state === "due soon" ? "soon" : "";
      const detail = st.state === "unknown"
        ? (nextDueDate ? `no service logged yet · est. next ${nextDueDate}` : "no service logged yet")
        : `due ${st.dueDate || ""}${st.dueMiles ? ` / ${num(st.dueMiles)} mi` : ""} · ${st.milesLeft != null ? num(st.milesLeft) + " mi left" : ""}${st.daysLeft != null ? ` · ${st.daysLeft} days` : ""}`;
      const interval = (it.miles || it.months) ? `every ${it.miles ? num(it.miles) + " mi" : ""}${it.miles && it.months ? " / " : ""}${it.months ? it.months + " mo" : ""}` : "—";
      return `<div class="kv svc ${cls}"><span class="svc-main"><span class="svc-name">${esc(it.name)}</span> <span class="pill ${cls}">${st.state}</span><br><span class="stat-s">${detail}</span></span>
        <span class="svc-int">${interval}</span>
        <span class="row-actions"><button class="btn quiet small" data-sync="${esc(it.id)}" type="button">Sync to Kairos</button><button class="btn quiet small" data-edit="${esc(it.id)}" type="button">Edit interval</button></span></div>`;
    }).join("") || `<p class="empty">No services defined.</p>`;

    $("#g-services").querySelectorAll("[data-sync]").forEach((b) => (b.onclick = () => {
      const it = svcs.find((x) => x.id === b.dataset.sync); if (!it) return;
      const st = g.dueStatus(it, lastFor(it.name), now);
      const nextDueDate = computeNextDueDate(it, st, now.date);
      if (!nextDueDate) {
        toast("No due date yet — log this service or set a month interval first");
        return;
      }
      const title = vehicleName() + ": " + it.name;
      const bus = getPB();
      if (bus && bus.deadlines) bus.deadlines.publish({ title, date: nextDueDate, source: "garage", kind: "service", ref: it.id });
      if (bus && bus.events) bus.events.publish({ type: "deadline:garage", pillar: "garage", title });
      toast(`Synced "${it.name}" (${nextDueDate}) to Kairos`);
    }));

    $("#g-services").querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => {
      const it = svcs.find((x) => x.id === b.dataset.edit); if (!it) return;
      const mi = prompt("Every how many miles? (blank = none)", it.miles || ""); if (mi === null) return;
      const mo = prompt("Every how many months? (blank = none)", it.months || ""); if (mo === null) return;
      it.miles = mi ? +mi : null; it.months = mo ? +mo : null; S.set(K("services"), svcs); paint();
    }));

    $("#g-log-sel").innerHTML = svcs.map((it) => `<option>${esc(it.name)}</option>`).join("");
    const hist = S.list(K("history")).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    $("#g-history").innerHTML = hist.map((x) => `<div class="kv"><span>${x.date} · ${esc(x.service)} @ ${num(x.odometer)} mi</span><b>${x.cost ? money(x.cost) : ""}</b></div>`).join("") || `<p class="empty">No services logged yet.</p>`;

    const fills = S.list(K("fuel")).sort((a, b) => b.odometer - a.odometer);
    const fs = GARAGE.fuelStats(S.list(K("fuel")));
    $("#g-fuel-sum").innerHTML = fs.mpg
      ? `<div class="stat-strip"><div class="stat-cell"><span class="stat-k">Fuel economy · logged span</span><b>${num(fs.mpg, 1)} MPG</b></div><div class="stat-cell"><span class="stat-k">Cost / mile</span><b>${money(fs.costPerMile, 3)}</b></div><div class="stat-cell"><span class="stat-k">Fuel spend</span><b>${money(fs.totalCost)}</b></div><div class="stat-cell"><span class="stat-k">Logged span</span><b>${num(fs.miles)} mi</b></div></div>`
      : `<div class="stat-s">Log two fills to unlock measured MPG and $/mi.</div>`;
    $("#g-fills").innerHTML = fills.slice(0, 10).map((x) => `<div class="kv"><span>${x.date} · ${num(x.odometer)} mi · ${num(x.gallons, 2)} gal${x.busLogged ? " · on bus" : ""}</span><b>${money(x.cost)}</b></div>`).join("") || `<p class="empty">No fills logged yet.</p>`;
    paintTrip();
  }

  $("#g-route").addEventListener("change", (e) => { if (e.target.value !== "custom") { $("#g-trip-mi").value = e.target.value; paintTrip(); } });
  $("#g-trip-mi").addEventListener("input", () => { $("#g-route").value = "custom"; paintTrip(); });
  $("#g-gas-price").addEventListener("input", paintTrip);

  const loadKia = (which) => { if (!KIA || !confirm(`Replace the service list with Kia's ${which} schedule? Logged history stays.`)) return; S.set(K("services"), kiaSet(which)); toast(`Kia ${which} schedule loaded`); paint(); };
  if (KIA) { $("#g-kia-severe").onclick = () => loadKia("severe"); $("#g-kia-normal").onclick = () => loadKia("normal"); }
  const loadMt07 = () => { const s = mt07Set(); if (!s || !confirm("Replace the MT-07 service list with Yamaha's factory schedule? Logged history stays.")) return; S.set("mt07.services", s); toast("Yamaha factory schedule loaded"); paint(); };
  const lm = $("#g-mt07-load"); if (lm) lm.onclick = loadMt07;

  $("#g-odo").addEventListener("submit", (e) => { e.preventDefault(); S.set(K("odometer"), +e.target.odometer.value || 0); S.set(K("vehicle"), { name: e.target.vehicle.value.trim() }); toast("Odometer updated"); paint(); });
  $("#g-addsvc").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const svcs = S.get(K("services"), []);
    svcs.push({ id: Math.random().toString(36).slice(2, 8), name: f.name.value.trim(), miles: f.miles.value ? +f.miles.value : null, months: f.months.value ? +f.months.value : null });
    S.set(K("services"), svcs); f.reset(); paint(); });
  $("#g-log").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add(K("history"), { service: f.service.value, date: f.date.value, odometer: +f.odometer.value || 0, cost: +f.cost.value || 0, notes: f.notes.value.trim() });
    if (+f.odometer.value > odo()) S.set(K("odometer"), +f.odometer.value);
    if (window.PB && +f.cost.value > 0) PB.money.add({ kind: "service", amount: -Math.abs(+f.cost.value), date: f.date.value, source: "garage", label: vehicleName() + ": " + f.service.value });
    toast("Service logged"); paint(); });
  $("#g-fuel").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    const cost = +f.cost.value || 0;
    const rec = { date: f.date.value, odometer: +f.odometer.value || 0, gallons: +f.gallons.value || 0, cost, busLogged: !!f.toBus.checked };
    S.add(K("fuel"), rec);
    if (+f.odometer.value > odo()) S.set(K("odometer"), +f.odometer.value);
    if (window.PB && rec.busLogged && cost > 0) PB.money.add({ kind: "fuel", amount: -Math.abs(cost), date: f.date.value, source: "garage", label: `${vehicleName()} fuel · ${num(rec.gallons, 1)} gal` });
    f.reset(); f.date.value = day(); toast("Fill logged"); paint(); });

  $("#g-log").date.value = day(); $("#g-fuel").date.value = day();
  function paintPaperworkAndDossier() {
    const t = day();
    const docs = S.list(K("paperwork"));
    const box = $("#g-paper-list"); if (box) {
      box.innerHTML = "";
      docs.forEach((p) => {
        if (window.PB && p.due) PB.deadlines.publish({ title: `${vehicleName()}: ${p.title}`, date: p.due, source: "garage", kind: p.kind || "vehicle", ref: "pap_" + p.id });
        const daysLeft = Math.round((new Date(p.due + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5);
        box.append(h("div.kv", null,
          h("span", null, h("b", { className: daysLeft <= 14 ? "warn" : "" }, p.title), ` · ${p.kind || "doc"} · due ${p.due} (${daysLeft}d)`),
          h("button.btn.quiet.small", { type: "button", onclick: () => { if (window.PB) PB.deadlines.unpublish("garage", "pap_" + p.id); S.remove(K("paperwork"), p.id); paintPaperworkAndDossier(); } }, "Done")
        ));
      });
      if (!docs.length) box.innerHTML = `<p class="empty">No CA DMV / winter compliance items tracked yet.</p>`;
    }
    const hist = S.list(K("history")).sort((a, b) => (b.odometer || 0) - (a.odometer || 0));
    const fs = GARAGE.fuelStats(S.list(K("fuel")));
    const dossier = [
      `VEHICLE MAINTENANCE & COMPLIANCE DOSSIER — ${t}`,
      `Vehicle: ${vehicleName()}`,
      `Current Odometer: ${num(odo())} mi`,
      `Verified Fuel Span: ${fs.mpg ? `${num(fs.mpg, 1)} MPG (${money(fs.costPerMile, 3)}/mi over ${num(fs.miles)} mi)` : "Collecting baseline fills"}`,
      `Completed Services (${hist.length}):`,
      ...(hist.length ? hist.map((x) => `  - ${x.date} @ ${num(x.odometer)} mi: ${x.service}${x.cost ? ` (${money(x.cost)})` : ""}${x.notes ? ` — ${x.notes}` : ""}`) : ["  - No logged services yet"]),
      `Compliance & Paperwork (${docs.length}):`,
      ...(docs.length ? docs.map((d) => `  - [${d.kind}] ${d.title} (due ${d.due})`) : ["  - None active"])
    ].join("\n");
    const pre = $("#g-dossier-preview"); if (pre) pre.textContent = dossier;
    return dossier;
  }
  $("#g-paper-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add(K("paperwork"), { title: f.title.value.trim(), due: f.due.value, kind: f.kind.value });
    f.reset(); toast("Paperwork deadline tracked"); paintPaperworkAndDossier();
  });
  $("#g-dossier-btn").onclick = () => download(`vehicle_dossier_${day()}.txt`, paintPaperworkAndDossier());
  paintPaperworkAndDossier();

  $("#export").onclick = () => download(`garage_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); paintPaperworkAndDossier(); } catch (e) { toast(e.message); } };
  g3d((G) => G.attach($("#g-3d"), $("#g-3d-cap")));
  paint();
})();
