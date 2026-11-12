/* The words of the way out (MID-MUS-01, Muse, 2026-11-09; Drive midas_muse_milestones_20261109-0725.md): 24 milestone lines and the
   screen lines the simulator uses. No line carries a digit; where a number belongs the line takes {amount}, {months} or {name}. */
export const WORDS = {
  first: "The first payment is logged, and the plan is moving.",
  pct: { 5: "One twentieth of the starting debt is paid.", 10: "One tenth of the starting debt is paid.", 25: "One quarter of the starting debt is paid.", 33: "One third of the starting debt is paid.", 50: "One half of the starting debt is paid.",
    66: "Two thirds of the starting debt is paid.", 75: "Three quarters of the starting debt is paid.", 90: "Nine tenths of the starting debt is paid.", 100: "All of the starting debt is paid." },
  cardPaid: ["{name} is paid off, and that payment moves to the next card.", "A second card is paid off, and the list is shorter.", "Another card is paid off, and the list is shorter."],
  closer: { 1: "The debt-free date moves one month closer.", 3: "The debt-free date moves three months closer.", 6: "The debt-free date moves six months closer.", 12: "The debt-free date moves twelve months closer." },
  streak: { 1: "One month in a row on plan.", 3: "Three months in a row on plan.", 6: "Six months in a row on plan.", 12: "Twelve months in a row on plan." },
  over: "A month over plan, and the next month starts clean.", under: "A month under plan, and that is fine.", newDebt: "A new debt is added, and the plan makes room for it.",
  screen: { freeMonth: "The month the plan ends if you keep paying {amount} a month.", monthsLeft: "{months} months left at your monthly budget.", interestLeft: "{amount} of interest left to pay on the plan.",
    paidDown: "{amount} paid down since the starting line this device saw.", balance: "The balance left on {name}.", apr: "The yearly rate that sets the interest on {name}.", minimum: "The smallest payment {name} asks for this month." },
};
/** The line for a debt-free date that moved n months closer (the largest step it reached). */
export const closerLine = (n) => { let k = null; for (const s of [1, 3, 6, 12]) if (n >= s) k = s; return k ? WORDS.closer[k] : ""; };
export const fill = (line, vars) => line.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
