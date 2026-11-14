/* Every pillar of Prometheus, by its own name. The hub's core draws one cell for each; pillars.json stays the registry the AIs read.
   ring 1 = the six around the core, ring 2 = the outer twelve. hue drives the cell's light. ext = lives in its own repository. */
const P = (id, name, short, what, route, hue, icon, more = {}) => ({ id, name, short, what, route, hue, icon, ...more });
export const PILLARS = [
  P("kairos", "Kairos Meridian", "Kairos", "Time: calendar, deadlines and the day.", "pillars/kairos/", 268, "hourglass"),
  P("midas", "Midas Ledger", "Midas", "Money: cash, debt and the way out.", "https://jpavia10.github.io/midas-ledger/", 46, "scale", { ext: true }),
  P("titan", "Titan Reliquary", "Titan", "Coin and precious-metals collection.", "https://jpavia10.github.io/titan-reliquary-preview/", 36, "coin", { ext: true }),
  P("hearth", "Hephaestus Hearth", "Hearth", "The house: renovations, what is in each room, and the plan.", "pillars/hearth/", 16, "anvil"),
  P("garage", "Garage", "Garage", "The car: service, fuel and paperwork.", "pillars/garage/", 200, "garage"),
  P("apollo", "Apollo Temple", "Apollo", "Health, fitness and nutrition.", "pillars/apollo/", 54, "sun"),
  P("money", "Money · payoff simulator", "Payoff", "The payoff simulator and the issuer library.", "pillars/money/", 152, "money"),
  P("selling", "Selling Pipeline", "Selling", "Items for sale, from listing to shipped.", "pillars/selling/", 28, "tag"),
  P("records", "Records · Paper Killer", "Records", "Paper turned into findable records.", "pillars/records/", 214, "file"),
  P("icarus", "Icarus Stake", "Icarus", "High-risk trading journal. It never trades.", "pillars/icarus/", 8, "wing"),
  P("hermes", "Hermes Post", "Hermes", "Mail and messages that need an answer.", "pillars/hermes/", 222, "mail"),
  P("piano", "Bossa Piano Studio", "Piano", "Practice, streaks and the bossa nova path.", "pillars/piano/", 318, "keys"),
  P("bastion", "Bastion · Mountain Prep", "Bastion", "Supplies and readiness on the mountain.", "pillars/bastion/", 104, "shield"),
  P("athenaeum", "Athenaeum · Idea Vault", "Athenaeum", "Ideas and history, kept and connected.", "pillars/athenaeum/", 40, "columns"),
  P("odyssey", "Odyssey · Trips & Away Mode", "Odyssey", "Trips, and what the house needs while away.", "pillars/odyssey/", 186, "compass"),
  P("privacy", "Privacy · CA DROP", "Privacy", "Shrinking the public footprint.", "pillars/privacy/", 244, "lock"),
  P("argus", "Argus Album", "Argus", "Every picture the pillars use, in one album.", "pillars/argus/", 166, "eye"),
  P("games", "Ludus Arcade", "Games", "Games: an example library, your notes, and the next session.", "pillars/games/", 330, "pad"),
  P("forge", "Forge", "Forge", "AI work: every task handed to Grok, Gemini, Muse and ChatGPT, and how each one scores.", "pillars/forge/", 18, "forge"),
  P("foundry", "Foundry", "Foundry", "Inventions: ideas turned into builds, stage by stage.", "pillars/foundry/", 192, "gear"),
  P("observatory", "Observatory", "Observatory", "What is happening in the subjects you think about, with sources.", "pillars/observatory/", 250, "scope"),
  P("kin", "Kin", "Kin", "Family: the kids' schedule, school paperwork and plans in one place.", "pillars/kin/", 340, "people"),
  P("presence", "Sylade · Presence", "Sylade", "The public presence page.", "pillars/sylade/", 292, "star"),
  P("aether", "Aether · Atmospheric & Field Lab", "Aether", "Weather, wildfire/AQI, solar & lunar ephemeris, and mountain pass readiness.", "pillars/aether/", 134, "aurora"),
  P("polis", "Polis · Civic & Legal Watch", "Polis", "CA & Kern policy tracking, ballot measures, HOA/permit rules & consumer protections.", "pillars/polis/", 228, "civic"),
  P("mythos", "Mythos · Creative & Lore Studio", "Mythos", "Worldbuilding, fiction drafts, guitar & lyric notebooks, moodboards and essays.", "pillars/mythos/", 304, "feather"),
  P("continuity", "Continuity · Sovereign Vault", "Continuity", "Zero-knowledge encrypted emergency instructions, digital inheritance & survival runbook.", "pillars/continuity/", 84, "vault"),
];
export const pillar = (id) => PILLARS.find((p) => p.id === id);
