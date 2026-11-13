/* Every pillar of Prometheus, by its own name. The hub's core draws one cell for each; pillars.json stays the registry the AIs read.
   ring 1 = the six around the core, ring 2 = the outer twelve. hue drives the cell's light. ext = lives in its own repository. */
const P = (id, name, short, what, route, hue, icon, more = {}) => ({ id, name, short, what, route, hue, icon, ...more });
export const PILLARS = [
  P("kairos", "Kairos Meridian", "Kairos", "Time: calendar, deadlines and the day.", "pillars/kairos/", 268, "hourglass"),
  P("midas", "Midas Ledger", "Midas", "Money: cash, debt and the way out.", "https://jpavia10.github.io/midas-ledger/", 46, "scale", { ext: true }),
  P("titan", "Titan Reliquary", "Titan", "Coin and precious-metals collection.", "https://jpavia10.github.io/titan-reliquary-preview/", 36, "coin", { ext: true }),
  P("hearth", "Hephaestus Hearth", "Hearth", "The house: projects, inventory and floor plan.", "https://jpavia10.github.io/hephaestus-hearth/", 16, "anvil", { ext: true }),
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
  P("games", "Ludus Arcade", "Games", "Games: the library in your own words, and the next session.", "pillars/games/", 330, "play"),
  P("presence", "Sylade · Presence", "Sylade", "The public presence page.", "sylade.html", 292, "star"),
];
export const pillar = (id) => PILLARS.find((p) => p.id === id);
