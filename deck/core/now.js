/* The one line on the arrival view: next event, next deadline, and whether the NYSE is open. */
import { clock, today, addDays } from "./dates.js";
import { rows } from "./feeds.js";
import { nyseSession } from "./session.js";

const EVENT = new Set(["event", "appointment"]);
const DEADLINE = new Set(["deadline", "school", "tax"]);

function upcoming(now) {
  const t = today();
  const mins = now.getHours() * 60 + now.getMinutes();
  return rows(t, addDays(t, 400)).filter((r) => {
    if (r.done || r.date < t) return false;
    if (r.date > t || !r.time) return true;
    const [hh, mm] = r.time.split(":").map(Number);
    return hh * 60 + mm >= mins;
  });
}

/** The three facts the arrival line reads. Titles only: no amounts. */
export function nowFacts(now = clock.now()) {
  const list = upcoming(now);
  return {
    event: list.find((r) => EVENT.has(r.tone) && !r.fixed) || null,
    deadline: list.find((r) => DEADLINE.has(r.tone)) || null,
    session: nyseSession(now),
  };
}
