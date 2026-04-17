# Brainstorm: Agent dashboard framework

*Brief: visual, alive bays, consumes /api/state. Replaces single-file businesses/public/index.html. Must support adding new bays dynamically. $0 cost.*

Divergent list (15 considered):

1. **HTMX + Alpine.js** — server renders HTML, Alpine handles room-level motion. No build step. MIT. Tiny.
2. **Lit (lit-html / web components)** — native web components, zero runtime beyond ~5kb. BSD-3. Google-maintained.
3. **Preact + htm** — React-like but 3kb, no JSX build. MIT. Still active.
4. **Svelte + SvelteKit static** — compiler-based, produces small JS. MIT. Mature.
5. **Astro** — islands architecture, ship HTML by default, hydrate rooms only when needed. MIT.
6. **Mitosis/Builder.io** — tempting but heavy for this job. MIT. Overkill.
7. **Tabler admin dashboard** — Bootstrap-based admin starter. MIT. Too corporate, loses yard vibe.
8. **Tremor (React)** — charts-focused, opinionated. Apache-2.0. Heavier than brief wants.
9. **Observable Plot** — charting only, not a dashboard framework. ISC. Misfit.
10. **D3.js** — raw SVG primitives, perfect for bespoke room illustrations. BSD-3.
11. **Three.js isometric scene** — true 3D rooms. MIT. Too heavy, GPU dependency, mobile drag.
12. **Phaser.js** — 2D game engine for pixel-art bays. MIT. Could carry the aesthetic but overkill for ticking status panels.
13. **excalidraw embed** — hand-drawn feel, but read-only renders. MIT. Doesn't consume dynamic state well.
14. **Vanilla JS + CSS Grid + SSE** — hand-rolled, no framework. Matches current pattern in public/index.html. MIT by default.
15. **Deck.gl** — map-focused. MIT. Wrong tool.

Shortlist (top 3 for full dossier):
- HTMX + Alpine.js (simple, matches existing single-file ethos, minimal build)
- Lit web components (dynamic bay creation is native strength, future-proof)
- Astro (islands are literally "bays", static by default, cheapest ops)

Dropped quickly:
- Tabler (loses yard aesthetic)
- Three.js (too heavy)
- Observable Plot / D3 alone (not a dashboard framework, just pieces)
- Tremor (React-heavy, opinionated away from bespoke rooms)
- Phaser (ticking status, not a game)
- Excalidraw (read-only)
- Deck.gl (wrong domain)
- Svelte (solid but adds a build step over HTMX)
- Preact/htm (solid but no clear edge over HTMX or Lit)
- Vanilla JS (already the status quo, the brief exists because the status quo is insufficient)
