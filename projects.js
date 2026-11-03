/* Prometheus Hub — the only list of projects.
   Append an object to add a card. Leave links empty until a real URL exists.
   Never put passwords, tokens, charter text, or other secrets in this file.

   {
     id: "short-id",          // becomes the card's anchor
     name: "Visible name",
     kicker: "What it is",
     tier: "primary",         // "primary" (top) or "bench" (quieter)
     status: "live",          // "live" | "slot" | "empty"
     summary: "One sentence.",
     note: "Optional boundary. Omit if you have nothing to fence off.",
     links: [
       { label: "Open", href: "https://..." }
     ]
   }
*/
window.PROMETHEUS_PROJECTS = [
  {
    id: "titan-reliquary",
    name: "Titan Reliquary",
    kicker: "Coin vault",
    tier: "primary",
    status: "live",
    summary: "The live coin house. The collection stays there; this desk only opens the door.",
    note: "Ownership stays with Titan Reliquary. Prometheus Hub only links.",
    links: [
      { label: "Open preview", href: "https://jpavia10.github.io/titan-reliquary-preview/" },
      { label: "Repository", href: "https://github.com/jpavia10/titan-reliquary-preview" }
    ]
  },
  {
    id: "sylade-fleet",
    name: "Sylade Fleet",
    kicker: "Agent-run social",
    tier: "primary",
    status: "live",
    summary: "Shared AI identity across Gmail, GitHub, and Discord.",
    note: "Fleet Command is the bridge. The charter lives in Drive as SYLADE_CHARTER. No credentials are stored in this repo.",
    links: [
      { label: "Discord", href: "https://discord.gg/YCam2NEkv9" },
      { label: "Fleet Command", href: "https://jpavia10.github.io/fleet-command/" }
    ]
  },
  {
    id: "finances",
    name: "Finances",
    kicker: "Midas Ledger",
    tier: "primary",
    status: "live",
    summary: "Password-locked ledger. Open it in its own app — balances stay there.",
    note: "This desk does not copy Midas Ledger. The password stays in that app.",
    links: [
      { label: "Open Midas Ledger", href: "https://jpavia10.github.io/midas-ledger/" },
      { label: "Repository", href: "https://github.com/jpavia10/midas-ledger" }
    ]
  },
  {
    id: "hephaestus",
    name: "Hephaestus",
    kicker: "Renovations",
    tier: "bench",
    status: "slot",
    summary: "Rooms, repairs, and the work of the house.",
    links: []
  },
  {
    id: "icarus-stake",
    name: "Icarus Stake",
    kicker: "Trading",
    tier: "bench",
    status: "slot",
    summary: "Positions and market notes, once that specialist has an address.",
    links: []
  },
  {
    id: "mail",
    name: "Mail",
    kicker: "Inbox",
    tier: "bench",
    status: "slot",
    summary: "A mail surface can be linked later. This page cannot read a mailbox.",
    links: []
  },
  {
    id: "calendar",
    name: "Calendar",
    kicker: "Schedule",
    tier: "bench",
    status: "slot",
    summary: "Days and appointments, once there is a calendar to open.",
    links: []
  },
  {
    id: "health",
    name: "Health",
    kicker: "Care",
    tier: "bench",
    status: "slot",
    summary: "A slot for a health surface. Nothing is recorded here.",
    links: []
  },
  {
    id: "add-project",
    name: "Add a project",
    kicker: "Open slot",
    tier: "bench",
    status: "empty",
    summary: "Copy any object in the list. Give it a name, one sentence, and links only when they are real.",
    links: []
  }
];
