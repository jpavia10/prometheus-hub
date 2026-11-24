<!-- doc-status: current; normative: yes -->
# Kin · the family tree in three dimensions

`pillars/kin/tree/` (owner, 2026-11-24: "redesign the entire project from the ground up. I want it to be a worldclass aaa flagship
interactive design with 3d graphics and motion. Clickable with media and data integrated."). The research record is unchanged
(`pillars/kin/lineage/data.js`, method `LINEAGE_METHOD.md`); this is the way into it. The plain tree, the fan and the source
list stay on the Kin page under the door.

## The idea: roots in time

You stand at the centre of the present, a sheet of light at 2026. Each generation back is one ring further out, and **depth is
time**: a person sits at the year they were born, and a lifeline rises from there to the year they died (to the surface if
living). A child's birth is a **bridge** of light to both parents' lifelines at that same year, so every bridge shows how old
the parents were, and light runs along the bridges down to you. Rings at every fifty years mark the eras. Your father's side
fills the left half, your mother's the right; inside each half a person's room is what is known above them (a weighted fan),
so a well-researched line spreads out and an unknown one still has its place. The far generations sit closer together so the
tree holds together on a phone.

How a person is drawn says how they are known: a medallion (their photograph where one is verified, otherwise their initials)
ringed in the colour of their status (gold proven, cyan probable, violet possible, green from the family, rose named by you,
slate dashed for a parent not yet known). A link that is not settled (Barbara to Joseph Termenas, C10) is dashed. Lifelines
whose end is an estimate fade out instead of stopping.

## What a tap opens

- **A person**: the camera flies to them from outside the tree (their ancestors below, their descendants above), their line
  to you lights up and everyone else dims, their records fan out under their name as cards, and the dossier opens (a sheet
  on a phone, a side panel on a wide screen): who they are to you, life dates and places, the summary, every record and
  picture, every name form, each event with the assertions behind it and their three classifications, family to jump to,
  the conflicts and their arguments, open questions, the proof standard's five elements. A parent not yet known shows what
  can already be said and a form to name them (kept on the device, in the GEDCOM export).
- **A record** (a card, a thumbnail, the gallery): full screen, pinch and pan, double tap, swipe to the next, with what it
  says, its citation and the people it names.
- **Time**: the slider (or play) moves through the centuries. A gold plane marks the year, the lifelines of everyone alive
  then glow, their names show, and the caption says what happened that year in the family and in the world.
- **Places**: a dotted night globe with every place in the records; each person's own journey in date order and each line's
  move from a parent's birthplace to a child's, coloured by side; the time slider brings them in year by year. A tap on a
  place lists what happened there; a name takes you back to the tree.
- **Records**: every image in date order as a turning gallery.
- **Research**: how far back the names go (of 254 places in seven generations), what only you can answer, every conflict
  with its argument, the research questions, the research log, the standard; GEDCOM 7 export.

## Media rules

A face on a medallion only when the photograph is verified to be that person (`L.media` in data.js: `face` crop, full `img`,
`src`). A picture attached to a profile online is not proof: the FamilySearch "portraits" Gemini saved on 24 Nov 2026 were the
DAR logo, an elderly woman under a man's name, and a man too young to be James Altonia Kirkland (born 1781; C12). They stay in
the records as what they are. Record images live in `pillars/kin/lineage/docs/` (webp, thumbnails in `t/`).

## Build

Three.js from the kit (`kit/vendor/three`), no post-processing: one draw call for every line (a screen-space ribbon shader
with a soft core and a glow, `gfx.js`), canvas-painted medallions, additive halos, drifting dust, the surface and the year
plane as shaders. HTML labels for crisp type, placed by projection with collision and occlusion. Files: `core.js` (model and
layout), `gfx.js` (drawing), `globe.js` (Places), `main.js` (scene, camera, interaction, panels), `tree.css`. Reduced motion:
no fly-ins, no auto-turn, no intro. `window.KIN3D` is the proof handle; proof KIN-3D in `proofs/run.py`.
