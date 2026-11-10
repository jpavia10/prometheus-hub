/* Records urgency logic (Sebastian, 2026-11-10): pure date classification. No DOM.
   School items are urgent at 7 days (a TK deadline inside a week must not be missable);
   everything else flags soon at 30. window.RECORDS = { classify, daysUntil } */
(function () {
  "use strict";
  const daysUntil = (date, today) => Math.round((new Date(date + "T12:00:00") - new Date(today + "T12:00:00")) / 864e5);
  function classify(doc, today) {
    if (!doc.due) return { flag: "none", days: null };
    const d = daysUntil(doc.due, today);
    if (d < 0) return { flag: "overdue", days: d };
    if (doc.category === "school" && d <= 7) return { flag: "urgent", days: d };
    if (d <= 30) return { flag: "soon", days: d };
    return { flag: "ok", days: d };
  }
  const R = { classify, daysUntil };
  if (typeof window !== "undefined") window.RECORDS = R;
  if (typeof globalThis !== "undefined") globalThis.RECORDS = R;
})();
