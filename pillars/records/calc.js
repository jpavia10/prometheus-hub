/* Records urgency logic (Sebastian, 2026-11-10): pure date classification. No DOM.
   School items are urgent at 7 days (a TK deadline inside a week must not be missable);
   everything else flags soon at 30. window.RECORDS = { classify, daysUntil, shredStatus }
   REC-GEM-04 (2026-11-17): classify also accepts Gemini's spec vocabulary
   ({kind, expires}) and then returns the bare flag string, with per-kind windows
   (timekeeper 5d, school 7d, default 30d). shredStatus(doc, today) applies the
   retention rules (window.RECORDS_RETENTION when loaded): property-basis,
   marriage-dissolution, birth-certificate, and active-certification records are
   NEVER "safe to shred" (§H). */
(function () {
  "use strict";
  const daysUntil = (date, today) => Math.round((new Date(date + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5);
  const WINDOWS = { timekeeper: 5, school: 7 };
  function classify(doc, today) {
    const specShape = !!(doc && (doc.expires != null || doc.kind != null) && doc.due == null);
    const due = specShape ? doc.expires : doc && doc.due;
    const kind = specShape ? doc.kind : doc && doc.category;
    if (!due) return specShape ? "none" : { flag: "none", days: null };
    const d = daysUntil(due, today);
    let flag;
    if (d < 0) flag = "overdue";
    else if (kind === "school" && d <= 7) flag = "urgent";
    else if (d <= (WINDOWS[kind] != null ? WINDOWS[kind] : 30)) flag = "soon";
    else flag = "ok";
    return specShape ? flag : { flag, days: d };
  }
  const NEVER_SHRED = /property|basis|closing disclosure|deed|mortgage note|birth certificate|marriage|dissolution|certification/i;
  function matchRule(doc) {
    const rules = (typeof window !== "undefined" && window.RECORDS_RETENTION) || (typeof globalThis !== "undefined" && globalThis.RECORDS_RETENTION) || [];
    const title = String((doc && (doc.title || doc.document)) || "").toLowerCase();
    if (!title) return null;
    let best = null, bestScore = 0;
    for (const r of rules) {
      const words = String(r.document).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
      const score = words.filter((w) => title.includes(w)).length;
      if (score > bestScore) { bestScore = score; best = r; }
    }
    return bestScore >= 2 ? best : null;
  }
  function shredStatus(doc, today) {
    const title = String((doc && (doc.title || doc.document)) || "");
    const rule = matchRule(doc);
    if (NEVER_SHRED.test(title) || NEVER_SHRED.test(String((doc && doc.category) || "")) || (rule && rule.keep_years === "permanent")) {
      return { canShred: false, keepUntilLabel: "Keep permanently — never shred (property-basis / vital / dissolution class)", rule };
    }
    if (!rule) return { canShred: false, keepUntilLabel: "No retention rule matched — keep until classified", rule: null };
    if (rule.keep_years == null) return { canShred: false, keepUntilLabel: `Keep: ${rule.keep}`, rule };
    const base = doc && (doc.date || doc.due);
    if (!base) return { canShred: false, keepUntilLabel: `Keep ${rule.keep_years} years from ${rule.starts_from || "the document date"} (no date on file)`, rule };
    const until = new Date(base + "T12:00:00"); until.setFullYear(until.getFullYear() + Number(rule.keep_years));
    const untilIso = until.toISOString().slice(0, 10);
    return { canShred: daysUntil(untilIso, today) < 0, keepUntilLabel: `Keep until ${untilIso} (${rule.keep_years} yrs from ${rule.starts_from || "document date"})`, rule };
  }
  const R = { classify, daysUntil, shredStatus };
  if (typeof window !== "undefined") window.RECORDS = R;
  if (typeof globalThis !== "undefined") globalThis.RECORDS = R;
})();
