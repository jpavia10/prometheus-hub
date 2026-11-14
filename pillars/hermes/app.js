/* Hermes Post v2: triage board + 15% bill-jump detector + local ephemeral phishing/biller classifier (never stores pasted email text)
   + 80-message classifier self-test + Unsubscribe -> Privacy handoff + Search & Lanes + 23 Phishing Lures. */
(function () {
  "use strict";
  const { $, h, money, day, toast, store, download, pickFile, tabs, field, G } = PK;
  const S = store("hermes");
  const app = $("#app");

  // Winged envelope glyph
  field({
    count: 900,
    at: [0.72, 0.36],
    scale: 0.26,
    glyph: (n) => [
      ...G.poly(Math.round(n * 0.36), [[-0.55, -0.32], [0.55, -0.32], [0.55, 0.36], [-0.55, 0.36], [-0.55, -0.32]]),
      ...G.poly(Math.round(n * 0.16), [[-0.55, -0.32], [0, 0.08], [0.55, -0.32]]),
      ...Array.from({ length: 5 }, (_, i) => [
        ...G.line(Math.round(n * 0.024), -0.55, -0.1 + i * 0.05, -1 + i * 0.04, -0.55 + i * 0.14),
        ...G.line(Math.round(n * 0.024), 0.55, -0.1 + i * 0.05, 1 - i * 0.04, -0.55 + i * 0.14),
      ]).flat(),
    ],
  });

  const KINDS = { reply: "Needs an answer", pay: "A bill to pay", wait: "Waiting on them", read: "Read later" };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  app.innerHTML = `
    <div class="tabs" role="tablist">
      <button class="tab" role="tab" id="t-board" aria-controls="p-board">Board</button>
      <button class="tab" role="tab" id="t-add" aria-controls="p-add">Add &amp; Classifier</button>
      <button class="tab" role="tab" id="t-search" aria-controls="p-search">Search &amp; Lanes</button>
      <button class="tab" role="tab" id="t-lures" aria-controls="p-lures">Phishing Lures</button>
      <button class="tab" role="tab" id="t-sylade" aria-controls="p-sylade">Done &amp; Sylade</button>
    </div>

    <section id="p-board" role="tabpanel" class="grid">
      <div class="glass lit span-4"><div class="stat-k">Needs an answer</div><div class="stat-v big" id="m-reply">0</div><div class="stat-s" id="m-reply-s"></div></div>
      <div class="glass span-4"><div class="stat-k">Bills due in 7 days</div><div class="stat-v big" id="m-pay">$0</div><div class="stat-s" id="m-pay-s"></div></div>
      <div class="glass span-4"><div class="stat-k">Waiting on others</div><div class="stat-v big" id="m-wait">0</div><div class="stat-s" id="m-wait-s"></div></div>
      <div class="span-12" id="m-alerts"></div>
      ${Object.entries(KINDS).map(([k, l]) => `<div class="glass span-6"><h2>${l}</h2><ul class="list" id="l-${k}"></ul></div>`).join("")}
    </section>

    <section id="p-add" role="tabpanel" class="grid">
      <div class="glass span-6">
        <h2>Log something to the board</h2>
        <form class="form" id="m-form">
          <label class="f">From<input name="from" required maxlength="80" placeholder="PG&amp;E, Chase, a friend"></label>
          <label class="f wide">About<input name="about" required maxlength="160" placeholder="One line: what it is, never the body"></label>
          <label class="f">Kind<select name="kind">${Object.entries(KINDS).map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select></label>
          <label class="f">Due<input name="due" type="date"></label>
          <label class="f">Amount $ (bills)<input name="amount" type="number" step="0.01" min="0"></label>
          <label class="f">Box<select name="box"><option>Joseph's Gmail</option><option>Sylade's Gmail</option><option>Text</option><option>Paper mail</option><option>Other</option></select></label>
          <button class="btn" type="submit">Add to board</button>
        </form>
        <p class="note">Use "Unsubscribe &rarr; Privacy" on promo/broker senders to queue them into Privacy's opt-out intake.</p>
      </div>

      <div class="glass lit span-6">
        <div class="row-actions" style="justify-content:space-between">
          <h2>Local Phishing &amp; Biller Screener</h2>
          <button class="btn quiet small" id="hc-bench" type="button">Run 80-Message Self-Test</button>
        </div>
        <p class="sub">Runs purely in RAM against 97 known billers + 23 2026 phishing lures. Nothing pasted here is ever saved.</p>
        <form class="form" id="hc-form">
          <label class="f wide">Sender email or domain<input id="hc-sender" placeholder="alerts@example.com or billing@example.com"></label>
          <label class="f wide">Subject line or snippet<textarea id="hc-subj" rows="2" placeholder="Paste subject line e.g. 'URGENT: scan QR code within 2h to prevent disconnection'"></textarea></label>
          <button class="btn small" type="submit">Screen message</button>
        </form>
        <div id="hc-out" style="margin-top:10px"></div>
      </div>
    </section>

    <section id="p-search" role="tabpanel" class="grid">
      <div class="span-12" id="hermes-lanes"></div>
      <div class="span-12" id="hermes-builder"></div>
    </section>

    <section id="p-lures" role="tabpanel" class="grid">
      <div class="span-12" id="hermes-lures"></div>
    </section>

    <section id="p-sylade" role="tabpanel" class="grid">
      <div class="glass span-12"><h2>Done Archive</h2><ul class="list" id="l-done"></ul></div>
      <div class="glass span-6">
        <h2>Sylade Public Addresses</h2>
        <ul class="list">
          <li><span>Email</span><a class="meta" href="mailto:sylade.ais@gmail.com">sylade.ais@gmail.com</a></li>
          <li><span>GitHub</span><a class="meta" href="https://github.com/sylade-ais" target="_blank" rel="noopener noreferrer">sylade-ais</a></li>
          <li><span>Discord</span><a class="meta" href="https://discord.gg/YCam2NEkv9" target="_blank" rel="noopener noreferrer">Sylade Fleet</a></li>
        </ul>
      </div>
      <div class="glass span-6">
        <h2>Manual-First Privacy Guarantee</h2>
        <p class="note">No OAuth token, IMAP credential, or raw email text is stored in Hermes. Search builders open in your signed-in Gmail tab.</p>
      </div>
    </section>
  `;

  // Extract registered domain heuristic from sender string
  function extractDomain(raw) {
    const m = String(raw || "").toLowerCase().match(/@([a-z0-9.-]+\.[a-z]{2,})|\b([a-z0-9.-]+\.[a-z]{2,})\b/);
    return m ? (m[1] || m[2]) : "";
  }

  function domainMatches(host, allowed) {
    return host === allowed || host.endsWith("." + allowed);
  }

  // Local heuristic classifier (0..100 risk score)
  function classifyMessage(sender, subject) {
    const sLower = String(sender || "").toLowerCase();
    const text = (sLower + " " + String(subject || "")).toLowerCase();
    const host = extractDomain(sLower);
    const billers = window.BILLERS || [];
    const lures = window.PHISHING_LURES || [];

    const matchedBiller = billers.find((b) => {
      const bName = b.b.toLowerCase().split(/[/(]/)[0].trim();
      return (bName.length >= 3 && text.includes(bName)) || b.d.some((d) => domainMatches(host, d.toLowerCase()));
    });

    let score = 0;
    const signals = [];

    if (matchedBiller) {
      const trusted = matchedBiller.d.some((d) => domainMatches(host, d.toLowerCase()));
      if (host && !trusted) {
        score += 50;
        signals.push(`Sender domain "${host}" spoofs ${matchedBiller.b} (trusted: ${matchedBiller.d.join(", ")})`);
      } else if (trusted) {
        score -= 10;
        signals.push(`Sender domain matches known biller: ${matchedBiller.b}`);
      }
    } else if (/verify|secure|update|support|login|billing|alert|unlock/.test(host)) {
      score += 35;
      signals.push(`Suspicious keyword in unverified sender domain "${host}"`);
    }

    const checks = [
      { re: /\b(qr\s*code|scan\s+(the\s+)?(code|barcode))\b/, pts: 35, msg: "Lure #1 pattern: QR/barcode in overdue bill" },
      { re: /\b(gift\s*card|prepaid\s*card|wire\s*transfer|crypto|bitcoin)\b/, pts: 45, msg: "Lure #4 pattern: irreversible payment demand" },
      { re: /\b(immediate\s+disconnection|shutoff|suspended\s+today|within\s+\d+\s+hour|final\s+notice)\b/, pts: 30, msg: "Coercive urgency / shutoff threat" },
      { re: /\.html?\b|attachment.*sso|sign.?in.*adobe|shared.*dropbox.*login/, pts: 30, msg: "Lure #6/7 pattern: trusted-service / HTML / SSO bait" },
      { re: /bit\.ly|tinyurl\.com|t\.co|ngrok|\.xyz\b|\.top\b|\.click\b/, pts: 30, msg: "Shortened link or high-risk TLD" },
      { re: /@gmail\.com|@yahoo\.com|@outlook\.com/, pts: matchedBiller ? 40 : 15, msg: "Free webmail sender claiming institutional action" },
    ];
    for (const c of checks) {
      if (c.re.test(text)) { score += c.pts; signals.push(c.msg); }
    }

    // Match top cited lures by keyword overlap
    const matchedLures = lures.filter((l) => {
      const bKey = l.biller.toLowerCase().split(" ")[0];
      return text.includes(bKey) || (l.pattern.toLowerCase().includes("qr") && /qr|barcode/.test(text));
    }).slice(0, 3);

    score = Math.max(0, Math.min(100, score));
    const verdict = score >= 50 ? "HIGH RISK · Spoof / Phish" : score >= 25 ? "CAUTION · Verify Manually" : "LIKELY CLEAN";
    return { score, verdict, host, matchedBiller, signals, matchedLures };
  }

  function runSelfTest80() {
    const t0 = performance.now();
    const cases = [];
    // 40 malicious lures
    const phishDomains = ["chase-verify-alerts.xyz", "pge-billing-pay.top", "ameren-shutoff.click", "paypal-support@gmail.com", "docusign-sso.xyz"];
    const phishTexts = [
      "Immediate disconnection unless you pay via QR code today",
      "Urgent: verify Chase account via prepaid card within 2 hours",
      "Your PG&E service will shutoff — pay with gift card or wire transfer",
      "Unexpected Adobe Sign approval notice.html SSO login",
      "Dropbox shared file login bit.ly/verify-now",
      "IRS final notice — click tinyurl.com link now",
      "American Express suspended today verify immediately",
      "AT&T overdue bill scan the barcode QR code to pay",
    ];
    for (let i = 0; i < 40; i++) {
      cases.push({ label: 1, res: classifyMessage("alerts@" + phishDomains[i % phishDomains.length], phishTexts[i % phishTexts.length]) });
    }
    // 40 legitimate billers from window.BILLERS
    const cleanList = (window.BILLERS || []).slice(0, 40);
    for (let i = 0; i < 40; i++) {
      const b = cleanList[i % cleanList.length] || { d: ["chase.com"], s: ["Your statement is ready"] };
      cases.push({ label: 0, res: classifyMessage("noreply@" + (b.d[0] || "chase.com"), (b.s && b.s[0]) || "Monthly statement is ready") });
    }
    let tp = 0, fp = 0, tn = 0, fn = 0;
    for (const c of cases) {
      const pred = c.res.score >= 30 ? 1 : 0;
      if (c.label === 1 && pred === 1) tp++;
      else if (c.label === 0 && pred === 1) fp++;
      else if (c.label === 0 && pred === 0) tn++;
      else fn++;
    }
    const ms = Math.max(0.1, performance.now() - t0).toFixed(1);
    const acc = (((tp + tn) / cases.length) * 100).toFixed(1);
    $("#hc-out").innerHTML = `<div class="bill risk-low"><div class="bill-when">80-Message Benchmark Complete (${ms} ms)</div>
      <div class="stat-s">Accuracy: <b>${acc}%</b> (${tp + tn}/80) · True Pos: ${tp}/40 · True Neg: ${tn}/40 · False Pos: ${fp} · False Neg: ${fn}</div></div>`;
  }

  function queuePrivacyOptOut(m) {
    try {
      const k = "prometheus.privacy.intake";
      const cur = JSON.parse(localStorage.getItem(k) || "[]");
      cur.unshift({ id: "hm-" + Date.now().toString(36), sender: m.from, box: m.box, note: m.about, addedAt: day() });
      localStorage.setItem(k, JSON.stringify(cur.slice(0, 100)));
      if (window.PB && PB.events) PB.events.publish({ type: "privacy.intake", pillar: "hermes", title: "Opt-out queued: " + m.from });
      toast(`Sent "${m.from}" to Privacy queue`);
    } catch (_) { toast("Could not queue to Privacy."); }
  }

  function sendPaidToBus(m) {
    if (window.PB && m.amount) {
      PB.money.add({ kind: "bill", amount: -Math.abs(+m.amount), date: day(), source: "hermes", label: `${m.from} · ${m.about}` });
    }
    S.update("mail", m.id, { done: day(), paidLogged: true });
    toast("Marked done & logged to money bus");
    paint();
  }

  const daysTo = (iso) => (iso ? Math.round((new Date(iso + "T12:00:00") - new Date(day() + "T12:00:00")) / 864e5) : null);
  const when = (n) => (n == null ? "" : n < 0 ? `${-n} day${n === -1 ? "" : "s"} late` : n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`);

  // Compute average historical bill per normalized sender
  function billAverages(all) {
    const map = {};
    for (const m of all) {
      if (m.kind !== "pay" || !(m.amount > 0)) continue;
      const key = String(m.from || "").trim().toLowerCase();
      if (!key) continue;
      (map[key] = map[key] || []).push(+m.amount);
    }
    const avg = {};
    for (const [k, vals] of Object.entries(map)) {
      if (vals.length >= 2) avg[k] = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    return avg;
  }

  function itemEl(m, avgMap) {
    const n = daysTo(m.due);
    const key = String(m.from || "").trim().toLowerCase();
    const avg = m.kind === "pay" && m.amount > 0 ? avgMap[key] : null;
    const isJump = avg != null && +m.amount >= avg * 1.15;
    const jumpPct = isJump ? Math.round(((+m.amount - avg) / avg) * 100) : 0;
    return h("li", null,
      h("span", null,
        h("b", null, m.from), " · ", m.about, " ",
        isJump ? h("span.badge-jump", null, `↑ +${jumpPct}% vs avg ${money(avg)}`) : null,
        h("div.meta", null, [m.box, m.amount ? money(+m.amount) : "", m.due ? `by ${m.due} (${when(n)})` : ""].filter(Boolean).join(" · "))
      ),
      h("span.acts", null,
        m.kind === "pay" && m.amount > 0 ? h("button.btn.quiet.small", { type: "button", title: "Mark done & record payment on bus", onclick: () => sendPaidToBus(m) }, "Pay") : null,
        h("button.btn.quiet.small", { type: "button", title: "Queue sender into Privacy opt-outs", onclick: () => queuePrivacyOptOut(m) }, "Opt-out"),
        h("button.btn.quiet.small", { type: "button", onclick: () => { S.update("mail", m.id, { done: day() }); paint(); } }, "Done"),
        h("button.btn.quiet.small", { type: "button", "aria-label": "Delete", onclick: () => { if (confirm("Delete it?")) { S.remove("mail", m.id); paint(); } } }, "×")
      )
    );
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
    const all = S.list("mail");
    const open = all.filter((m) => !m.done).sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
    const avgMap = billAverages(all);

    const jumps = open.filter((m) => m.kind === "pay" && m.amount > 0 && avgMap[String(m.from || "").trim().toLowerCase()] && +m.amount >= avgMap[String(m.from || "").trim().toLowerCase()] * 1.15);
    $("#m-alerts").innerHTML = jumps.length
      ? `<div class="glass risk-med"><b>Bill Jump Alert (${jumps.length}):</b> ${jumps.map((j) => `${esc(j.from)} is ${money(j.amount)} (avg ${money(avgMap[String(j.from || "").trim().toLowerCase()])})`).join(" · ")}</div>`
      : "";

    for (const k of Object.keys(KINDS)) {
      const l = $("#l-" + k); l.innerHTML = "";
      const its = open.filter((m) => m.kind === k);
      if (!its.length) l.append(h("li.empty", null, "Nothing here."));
      its.forEach((m) => l.append(itemEl(m, avgMap)));
    }

    const reply = open.filter((m) => m.kind === "reply"), late = reply.filter((m) => m.due && daysTo(m.due) < 0);
    $("#m-reply").textContent = reply.length;
    $("#m-reply-s").textContent = late.length ? `${late.length} overdue` : reply.length ? "none late" : "Zero replies pending.";

    const bills = open.filter((m) => m.kind === "pay" && m.due && daysTo(m.due) <= 7), tot = bills.reduce((a, m) => a + (+m.amount || 0), 0);
    $("#m-pay").textContent = money(tot, 0);
    $("#m-pay-s").textContent = bills.length ? `${bills.length} bill(s) due` : "None due this week.";

    const wait = open.filter((m) => m.kind === "wait");
    $("#m-wait").textContent = wait.length;
    $("#m-wait-s").textContent = wait.length ? `oldest ${wait.map((m) => (m.at || "").slice(0, 10)).sort()[0]}` : "Nobody owes a reply.";

    const done = all.filter((m) => m.done).sort((a, b) => String(b.done).localeCompare(String(a.done)));
    const dl = $("#l-done"); dl.innerHTML = "";
    if (!done.length) dl.append(h("li.empty", null, "Nothing archived yet."));
    done.slice(0, 100).forEach((m) => dl.append(h("li", null, h("span", null, `${m.from} · ${m.about}`), h("span.meta", null, `done ${m.done}`))));
  }

  $("#m-form").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target;
    S.add("mail", { from: f.from.value.trim(), about: f.about.value.trim(), kind: f.kind.value, due: f.due.value, amount: f.amount.value ? +f.amount.value : null, box: f.box.value });
    f.from.value = f.about.value = f.amount.value = f.due.value = "";
    toast("Added to board");
    paint();
  });

  $("#hc-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const res = classifyMessage($("#hc-sender").value, $("#hc-subj").value);
    const cls = res.score >= 50 ? "risk-high" : res.score >= 25 ? "risk-med" : "risk-low";
    $("#hc-out").innerHTML = `<div class="bill ${cls}"><div class="bill-when">${esc(res.verdict)} (Risk ${res.score}/100)</div>
      ${res.signals.map((s) => `<div class="stat-s">&bull; ${esc(s)}</div>`).join("") || '<div class="stat-s">No red-flag heuristic matched. Still verify links independently.</div>'}
      ${res.matchedLures.length ? `<div class="stat-s" style="margin-top:4px"><b>Related 2026 Lure(s):</b> ${res.matchedLures.map((l) => esc(l.biller + ": " + l.tell)).join(" | ")}</div>` : ""}
    </div>`;
  });
  $("#hc-bench").onclick = runSelfTest80;

  $("#export").onclick = () => download(`hermes_${day()}.json`, S.dump());
  $("#import").onclick = async () => { const f = await pickFile(); if (!f) return; try { S.load(JSON.parse(await f.text())); toast("Imported"); paint(); } catch (e) { toast(e.message); } };

  tabs(app);
  paint();
})();
