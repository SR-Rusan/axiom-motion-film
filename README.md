# Axiom by Rusan — V3 Fast Reference-Led Motion Film

This V3 edit responds to the provided reference video:

`/Users/rusan/Downloads/download.mp4`

The reference was analyzed for pacing, visual rhythm, UI treatment, cursor behavior, and sound density. It informed the edit language without replacing Axiom’s own visual identity or content.

## Final master

`deliverables/axiom_by_rusan_v3_vertical.mp4`

- 1080 × 1920
- 9:16 vertical
- 30 FPS / 450 frames
- Exact 15.000-second container duration
- H.264 video / AAC audio

## V3 changes

- Replaced the slower chapter pacing with nine fast micro-shots.
- Added alternating upward/downward UI and card travel.
- Added deterministic mouse cursor paths and click rings.
- Added black CTA interaction states and emerald completion states.
- Created a new 128 BPM soundtrack with 17 mapped mouse-click transients, fast hats, kick/snare movement, and UI punctuation.
- Moved the Axiom story through practical automations, connected tools, Axiom Core, live workflow, AI search, direct advisory, and the bottleneck-to-system reveal.

## Run locally

```bash
npm install
npm run typecheck
npm run studio
```

Render again with:

```bash
npm run render
```

Open the showcase with:

```bash
python3 -m http.server 4173
```

Then visit <http://localhost:4173/>.
