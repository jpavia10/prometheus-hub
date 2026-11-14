/* Garage v2: 2025 Sorento Hybrid maintenance + fuel + Money Bus fuel expense publishing + Frazier Park Trip Cost Estimator. */
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

  const odo = () => S.get("odometer", 0);
  const lastFor = (name) => S.list("history").filter((x) => x.service === name).sort((a, b) => b.date.localeCompare(a.date))[0] || null;
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
    const fuelEntries = Array.isArray(opts.fuel) ? opts.fuel : S.list("fuel");
    const g = getGarageMath();
    const fs = g.fuelStats ? g.fuelStats(fuelEntries) : { mpg: null, costPerMile: null };
    const usedLogged = fs.costPerMile != null && fs.mpg != null;
    const mpg = usedLogged ? fs.mpg : 34; // Sorento HEV AWD ~34 MPG combined EPA reference when <2 fills logged
    const costPerMile = usedLogged ? fs.costPerMile : (gasPrice / mpg);
    const gallons = mpg > 0 ? miles / mpg : 0;
    const cost = miles * costPerMile;
    return { miles, gasPrice, mpg, costPerMile, gallons, cost, estCost: cost, source: usedLogged ? "logged" : "epa" };
  }

  function nextDueServices(nowOpt) {
    const now = {
      date: (nowOpt && nowOpt.date) || day(),
      odometer: (nowOpt && nowOpt.odometer != null) ? Number(nowOpt.odometer) : odo(),
    };
    const g = getGarageMath();
    const svcs = S.get("services", []);
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
    const fuel = S.list("fuel");
    return {
      odometer: odo(),
      services: S.get("services", []),
      history: S.list("history"),
      fuel,
      paperwork: S.list("paperwork"),
      fuelStats: g.fuelStats ? g.fuelStats(fuel) : null,
      nextDue: nextDueServices(),
    };
  }

  const GARAGE_API = Object.assign(getGarageMath(), { data, estimateTrip, nextDueServices });
  if (typeof window !== "undefined") window.GARAGE = GARAGE_API;
  if (typeof globalThis !== "undefined") globalThis.GARAGE = GARAGE_API;

  app.innerHTML = `
    <section class="grid">
      <div class="glass span-6"><h2>2025 Sorento Hybrid · Odometer &amp; Economy</h2>
        <form class="form" id="g-odo">
          <label class="f">Current odometer (mi)<input name="odometer" type="number" min="0" step="1"></label>
          <label class="f">As of<input name="date" type="date"></label>
          <button class="btn" type="submit">Update</button>
        </form>
        <div id="g-fuel-sum" style="margin-top:10px"></div>
      </div>

      <div class="glass lit span-6"><h2>Frazier Park Trip Cost Estimator</h2>
        <form class="form" id="g-trip">
          <label class="f">Corridor preset<select id="g-route">
            <option value="84">Frazier Park &harr; Bakersfield (84 mi RT)</option>
            <option value="116">Frazier Park &harr; LA / Sylmar (116 mi RT)</option>
            <option value="28">Frazier Park &harr; Pine Mtn Club (28 mi RT)</option>
            <option value="custom">Custom round-trip miles</option>
          </select></label>
          <label class="f">Round-trip miles<input id="g-trip-mi" type="number" min="1" value="84"></label>
          <label class="f">Gas price ($/gal, fallback)<input id="g-gas-price" type="number" step="0.01" min="1" value="4.65"></label>
        </form>
        <div id="g-trip-out" style="margin-top:8px"></div>
      </div>

      <div class="glass span-12"><h2>Maintenance (Severe Mountain Schedule)</h2><div id="g-services"></div>
        <p class="note">${KIA ? `Intervals from Kia's 2025 Sorento Hybrid Owner's Manual (severe-usage schedule Condition G for Frazier Park).` : "Starter intervals."} Logging a service resets both clocks and republishes the due date.</p>
        ${KIA ? `<div class="row-actions" style="margin-bottom:10px"><button class="btn quiet small" id="g-kia-severe" type="button">Load Kia severe schedule</button><button class="btn quiet small" id="g-kia-normal" type="button">Load Kia normal schedule</button></div>` : ""}
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

      <div class="glass span-6"><h2>1-Tap Sorento Resale Dossier</h2>
        <p class="sub">Compile odometer, verified MPG &amp; cost-per-mile, completed service receipts, and open factory intervals into a clean buyer-ready dossier.</p>
        <div class="row-actions" style="margin-top:8px">
          <button class="btn" id="g-dossier-btn" type="button">Export Resale Dossier (.txt)</button>
        </div>
        <pre id="g-dossier-preview" style="margin-top:10px;padding:10px;border-radius:10px;background:rgba(5,8,16,0.65);border:1px solid rgba(255,255,255,0.08);font-size:11.5px;white-space:pre-wrap;max-height:175px;overflow:auto"></pre>
      </div>
    </section>`;

  function paintTrip() {
    const est = estimateTrip();
    $("#g-trip-out").innerHTML = `<div class="kv"><span>Estimated fuel for ${num(est.miles)} mi</span><b>${money(est.cost)}</b></div>
      <div class="stat-s">${est.source === "logged" ? `Using your logged ${num(est.mpg, 1)} MPG (${money(est.costPerMile, 3)}/mi)` : `Using ${est.mpg} MPG Sorento HEV EPA estimate @ ${money(est.gasPrice)}/gal (${money(est.costPerMile, 3)}/mi)`}</div>`;
  }

  function paint() {
    const now = { date: day(), odometer: odo() };
    const pb = getPB();
    const g = getGarageMath();
    $("#g-odo").odometer.value = odo() || ""; $("#g-odo").date.value = day();
    const svcs = S.get("services", []);
    $("#g-services").innerHTML = svcs.map((it) => {
      const st = g.dueStatus(it, lastFor(it.name), now);
      if (pb && pb.deadlines && st.dueDate && st.state !== "unknown") pb.deadlines.publish({ title: "Sorento: " + it.name, date: st.dueDate, source: "garage", kind: "service", ref: it.id });
      const nextDueDate = computeNextDueDate(it, st, now.date);
      const cls = st.state === "overdue" ? "over" : st.state === "due soon" ? "soon" : "";
      const detail = st.state === "unknown"
        ? (nextDueDate ? `no service logged yet · est. next ${nextDueDate}` : "no service logged yet")
        : `due ${st.dueDate || ""}${st.dueMiles ? ` / ${num(st.dueMiles)} mi` : ""} · ${st.milesLeft != null ? num(st.milesLeft) + " mi left" : ""}${st.daysLeft != null ? ` · ${st.daysLeft} days` : ""}`;
      return `<div class="kv"><span>${esc(it.name)} <span class="pill ${cls}">${st.state}</span><br><span class="stat-s">${detail} · every ${it.miles ? num(it.miles) + " mi" : ""}${it.miles && it.months ? " / " : ""}${it.months ? it.months + " mo" : ""}</span></span>
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
      const title = "Sorento: " + it.name;
      const bus = getPB();
      if (bus && bus.deadlines) bus.deadlines.publish({ title, date: nextDueDate, source: "garage", kind: "service", ref: it.id });
      if (bus && bus.events) bus.events.publish({ type: "deadline:garage", pillar: "garage", title });
      toast(`Synced "${it.name}" (${nextDueDate}) to Kairos`);
    }));

    $("#g-services").querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => {
      const it = svcs.find((x) => x.id === b.dataset.edit); if (!it) return;
      const mi = prompt("Every how many miles? (blank = none)", it.miles || ""); if (mi === null) return;
      const mo = prompt("Every how many months? (blank = none)", it.months || ""); if (mo === null) return;
      it.miles = mi ? +mi : null; it.months = mo ? +mo : null; S.set("services", svcs); paint();
    }));

    $("#g-log-sel").innerHTML = svcs.map((it) => `<option>${esc(it.name)}</option>`).join("");
    const hist = S.list("history").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
    $("#g-history").innerHTML = hist.map((x) => `<div class="kv"><span>${x.date} · ${esc(x.service)} @ ${num(x.odometer)} mi</span><b>${x.cost ? money(x.cost) : ""}</b></div>`).join("") || `<p class="empty">No services logged yet.</p>`;

    const fills = S.list("fuel").sort((a, b) => b.odometer - a.odometer);
    const fs = GARAGE.fuelStats(S.list("fuel"));
    $("#g-fuel-sum").innerHTML = fs.mpg
      ? `<div class="kv"><span>Fuel economy (logged span)</span><b>${num(fs.mpg, 1)} MPG · ${money(fs.costPerMile, 3)}/mi · ${money(fs.totalCost)} over ${num(fs.miles)} mi</b></div>`
      : `<div class="stat-s">Log two fills to unlock measured MPG and $/mi.</div>`;
    $("#g-fills").innerHTML = fills.slice(0, 10).map((x) => `<div class="kv"><span>${x.date} · ${num(x.odometer)} mi · ${num(x.gallons, 2)} gal${x.busLogged ? " · on bus" : ""}</span><b>${money(x.cost)}</b></div>`).join("") || `<p class="empty">No fills logged yet.</p>`;
    paintTrip();
  }

  $("#g-route").addEventListener("change", (e) => { if (e.target.value !== "custom") { $("#g-trip-mi").value = e.target.value; paintTrip(); } });
  $("#g-trip-mi").addEventListener("input", () => { $("#g-route").value = "custom"; paintTrip(); });
  $("#g-gas-price").addEventListener("input", paintTrip);

  const loadKia = (which) => { if (!KIA || !confirm(`Replace the service list with Kia's ${which} schedule? Logged history stays.`)) return; S.set("services", kiaSet(which)); toast(`Kia ${which} schedule loaded`); paint(); };
  if (KIA) { $("#g-kia-severe").onclick = () => loadKia("severe"); $("#g-kia-normal").onclick = () => loadKia("normal"); }

  $("#g-odo").addEventListener("submit", (e) => { e.preventDefault(); S.set("odometer", +e.target.odometer.value || 0); toast("Odometer updated"); paint(); });
  $("#g-addsvc").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const svcs = S.get("services", []);
    svcs.push({ id: Math.random().toString(36).slice(2, 8), name: f.name.value.trim(), miles: f.miles.value ? +f.miles.value : null, months: f.months.value ? +f.months.value : null });
    S.set("services", svcs); f.reset(); paint(); });
  $("#g-log").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    S.add("history", { service: f.service.value, date: f.date.value, odometer: +f.odometer.value || 0, cost: +f.cost.value || 0, notes: f.notes.value.trim() });
    if (+f.odometer.value > odo()) S.set("odometer", +f.odometer.value);
    if (window.PB && +f.cost.value > 0) PB.money.add({ kind: "service", amount: -Math.abs(+f.cost.value), date: f.date.value, source: "garage", label: "Sorento: " + f.service.value });
    toast("Service logged"); paint(); });
  $("#g-fuel").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target;
    const cost = +f.cost.value || 0;
    const rec = { date: f.date.value, odometer: +f.odometer.value || 0, gallons: +f.gallons.value || 0, cost, busLogged: !!f.toBus.checked };
    S.add("fuel", rec);
    if (+f.odometer.value > odo()) S.set("odometer", +f.odometer.value);
    if (window.PB && rec.busLogged && cost > 0) PB.money.add({ kind: "fuel", amount: -Math.abs(cost), date: f.date.value, source: "garage", label: `Sorento Fuel · ${num(rec.gallons, 1)} gal` });
    f.reset(); f.date.value = day(); toast("Fill logged"); paint(); });

  $("#g-log").date.value = day(); $("#g-fuel").date.value = day();
  function paintPaperworkAndDossier() {
    const t = day();
    const docs = S.list("paperwork");
    const box = $("#g-paper-list"); if (box) {
      box.innerHTML = "";
      docs.forEach((p) => {
        if (window.PB && p.due) PB.deadlines.publish({ title: `Sorento: ${p.title}`, date: p.due, source: "garage", kind: p.kind || "vehicle", ref: "pap_" + p.id });
        const daysLeft = Math.round((new Date(p.due + "T12:00:00") - new Date(t + "T12:00:00")) / 864e5);
        box.append(h("div.kv", null,
          h("span", null, h("b", { className: daysLeft <= 14 ? "warn" : "" }, p.title), ` · ${p.kind || "doc"} · due ${p.due} (${daysLeft}d)`),
          h("button.btn.quiet.small", { type: "button", onclick: () => { if (window.PB) PB.deadlines.unpublish("garage", "pap_" + p.id); S.remove("paperwork", p.id); paintPaperworkAndDossier(); } }, "Done")
        ));
      });
      if (!docs.length) box.innerHTML = `<p class="empty">No CA DMV / winter compliance items tracked yet.</p>`;
    }
    const hist = S.list("history").sort((a, b) => (b.odometer || 0) - (a.odometer || 0));
    const fs = GARAGE.fuelStats(S.list("fuel"));
    const dossier = [
      `VEHICLE MAINTENANCE & COMPLIANCE DOSSIER — ${t}`,
      `Vehicle: 2025 Kia Sorento Hybrid (HEV)`,
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
    S.add("paperwork", { title: f.title.value.trim(), due: f.due.value, kind: f.kind.value });
    f.reset(); toast("Paperwork deadline tracked"); paintPaperworkAndDossier();
  });
  $("#g-dossier-btn").onclick = () => download(`sorento_resale_dossier_${day()}.txt`, paintPaperworkAndDossier());
  paintPaperworkAndDossier();

  $("#export").onclick = () => download(`garage_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); paintPaperworkAndDossier(); } catch (e) { toast(e.message); } };
  paint();
})();
