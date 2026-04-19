# Cockpit Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `businesses/public/index.html` as a curved wraparound cockpit-style god-view with 18 video-backed room tiles, live ticker, detail panels, and animated circuit background.

**Architecture:** Single self-contained HTML file at `businesses/public/cockpit.html` while in development, swapped to `index.html` on approval. 6×3 CSS grid wrapped in a `perspective` container with per-column `rotateY` and per-row `rotateX` transforms. Each tile hosts a `<video>` with `<img>` poster fallback. Background is two stacked layers: animated SVG circuit lines + radial CSS pulse + noise grain. Detail panel is a fixed 320px right-docked drawer. Live ticker subscribes to existing `/api/stream` SSE.

**Tech Stack:** Plain HTML/CSS/JS (no frameworks), CSS `transform-style: preserve-3d`, SVG `<animate>`/`<animateTransform>` for circuit lines, `EventSource` for SSE.

**Spec interpretation note:** 6-col grid has no true center column. Innermost pair (cols 3 & 4) uses ±8° per spec's "column 2 left/right: 8°" pattern; middle pair (cols 2 & 5) uses ±18°; outer pair (cols 1 & 6) uses ±28°. Flag during Task 2 rating if Lando wants a 7-col grid with a true 0° center instead.

---

## File Structure

**Create:**
- `businesses/public/cockpit.html` — new god-view, single file

**Modify (at end only):**
- `businesses/public/index.html` — replaced with cockpit.html contents on final approval
- `businesses/public/command-center.html` — renamed to `command-center.legacy.html` to preserve the sprite/corridor version

**Untouched:**
- `businesses/server.js` — existing routes (`/api/state`, `/api/activity`, `/api/stream`, `/api/portfolio`, `/api/realestate`) all consumed as-is
- `businesses/public/assets/rooms/*` — already renamed to short names (jax.jpg, hank.jpg, vault.png, etc.)
- `businesses/public/assets/videos/*` — populated by `scripts/generateRooms.js` running in parallel

**Verification pattern:** Each task ends with `curl -s http://localhost:3000/cockpit.html` + grep checks + "refresh and rate" pause for Lando.

---

## Agent Metadata (used across tasks)

```js
// Order = grid reading order, left-to-right, top-to-bottom, 6x3.
// [name, sourceImage, accentColor, role]
const AGENTS = [
  ['jax',         'jax.jpg',         '#f97316', 'Builder'],
  ['hank',        'hank.jpg',        '#2dd4c0', 'Foreman'],
  ['vega',        'vega.jpg',        '#22c55e', 'Scout'],
  ['brix',        'brix.jpg',        '#a855f7', 'Realtor'],
  ['doss',        'doss.jpg',        '#22c55e', 'Paymaster'],
  ['vault',       'vault.png',       '#c9a84c', 'Vault'],
  ['signalscout', 'signalscout.png', '#3b82f6', 'Signal Scout'],
  ['forge',       'forge.jpg',       '#f97316', 'Forge'],
  ['max',         'max.jpg',         '#22c55e', 'Launch'],
  ['echo',        'echo.jpg',        '#2dd4c0', 'Dispatcher'],
  ['iris',        'iris.jpg',        '#a855f7', 'Auditor'],
  ['rex',         'rex.jpg',         '#c9a84c', 'Writer'],
  ['nova',        'nova.jpg',        '#3b82f6', 'QA'],
  ['pixel',       'pixel.jpg',       '#a855f7', 'Creator'],
  ['zenith',      'zenith.jpg',      '#c9a84c', 'Strategy'],
  ['atlas',       'atlas.jpg',       '#3b82f6', 'Territory'],
  ['neo',         'neo.jpg',         '#a855f7', 'Neural'],
  ['hire',        null,              '#444444', 'Open Slot'],
];
```

---

### Task 1: Shell + cockpit frame

**Files:**
- Create: `businesses/public/cockpit.html`

- [ ] **Step 1: Write the shell file with Google Fonts, viewport, cockpit chrome, and grid placeholder**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Brewington Yard — Command Chair</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
  :root { --bg:#04040a; --gold:#c9a84c; --bone:#efe9d8; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; width: 100%; background: var(--bg); color: var(--bone); font-family: 'Share Tech Mono', monospace; overflow: hidden; }
  body { position: relative; }

  /* Cockpit chrome (sits above everything) */
  .cockpit-vignette { position: fixed; inset: 0; pointer-events: none; z-index: 50; box-shadow: inset 0 0 200px 80px rgba(0,0,0,0.85); }
  .cockpit-corners { position: fixed; inset: 0; pointer-events: none; z-index: 51; }
  .cockpit-corners::before, .cockpit-corners::after,
  .cockpit-corners > span::before, .cockpit-corners > span::after {
    content: ""; position: absolute; width: 32px; height: 32px; border: 2px solid var(--gold); opacity: 0.85;
  }
  .cockpit-corners::before { top: 16px; left: 16px; border-right: none; border-bottom: none; }
  .cockpit-corners::after { top: 16px; right: 16px; border-left: none; border-bottom: none; }
  .cockpit-corners > span::before { bottom: 16px; left: 16px; border-right: none; border-top: none; position: fixed; }
  .cockpit-corners > span::after { bottom: 16px; right: 16px; border-left: none; border-top: none; position: fixed; }

  .logo { position: fixed; top: 24px; left: 32px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; color: var(--gold); z-index: 52; }
  .clock { position: fixed; top: 24px; right: 32px; font-size: 12px; letter-spacing: 2px; color: var(--bone); opacity: 0.75; z-index: 52; text-align: right; }
  .clock time { display: block; font-size: 16px; color: var(--gold); }

  .ticker { position: fixed; left: 0; right: 0; bottom: 16px; height: 22px; overflow: hidden; z-index: 52; font-size: 11px; letter-spacing: 1.5px; color: rgba(239,233,216,0.7); border-top: 1px solid rgba(201,168,76,0.25); border-bottom: 1px solid rgba(201,168,76,0.25); background: rgba(4,4,10,0.6); }
  .ticker-track { display: inline-block; white-space: nowrap; padding-left: 100%; animation: tickerScroll 60s linear infinite; line-height: 22px; }
  @keyframes tickerScroll { from { transform: translateX(0);} to { transform: translateX(-100%);} }

  /* Stage (grid host, 3D scene) */
  .stage { position: fixed; inset: 0; display: grid; place-items: center; perspective: 1800px; perspective-origin: 50% 50%; z-index: 10; }
  .grid { display: grid; grid-template-columns: repeat(6, 200px); grid-template-rows: repeat(3, 200px); gap: 6px; transform-style: preserve-3d; }
  .room { background: #0a0a12; border: 1px solid rgba(201,168,76,0.15); }  /* placeholder, refined in Task 2+ */
</style>
</head>
<body>
  <div class="cockpit-vignette"></div>
  <div class="cockpit-corners"><span></span></div>
  <div class="logo">BREWINGTON YARD</div>
  <div class="clock"><span id="clock-date">—</span><time id="clock-time">—</time></div>

  <div class="stage">
    <div class="grid" id="grid"><!-- rooms injected in Task 2 --></div>
  </div>

  <div class="ticker"><span class="ticker-track" id="ticker-track">Standing by…</span></div>

<script>
  // Clock
  function tickClock() {
    const d = new Date();
    const time = d.toLocaleTimeString('en-US', { hour12: false });
    const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
    document.getElementById('clock-date').textContent = date;
    document.getElementById('clock-time').textContent = time;
  }
  tickClock(); setInterval(tickClock, 1000);
</script>
</body>
</html>
```

- [ ] **Step 2: Verify HTTP serving**

Run: `curl -s -o /dev/null -w "%{http_code} %{size_download}b\n" http://localhost:3000/cockpit.html`
Expected: `200 2500b` (±500b)

- [ ] **Step 3: Grep smoke check for required elements**

Run:
```bash
grep -cE "cockpit-vignette|cockpit-corners|class=\"logo\"|class=\"clock\"|class=\"ticker|class=\"stage\"|class=\"grid\"" businesses/public/cockpit.html
```
Expected: `>= 7`

- [ ] **Step 4: Pause — Lando rates cockpit frame**

Tell Lando: "Task 1 complete. `/cockpit.html` shows chrome only — logo TL, clock TR, gold corner brackets, vignette, ticker placeholder at bottom, empty stage in middle. Rate."

- [ ] **Step 5: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): shell + frame with logo, clock, corner brackets, ticker scaffold"
```

---

### Task 2: 18-room curved grid

**Design requirement:** Boxes must line up creatively AND evenly on the screen. The 6×3 grid must be perfectly centered horizontally and vertically in the viewport with balanced whitespace on all sides; the curved 3D transforms must feel symmetric (left half mirrors right). No cropped tiles, no lopsided gaps. On large screens leave cockpit-chrome clearance (≥64px from logo/clock top, ≥48px from ticker bottom).

**Files:**
- Modify: `businesses/public/cockpit.html` (inject grid renderer + transforms)

- [ ] **Step 1: Add AGENTS array, grid render, and per-column/row transforms**

Insert inside `<script>` **before** `tickClock()`:

```js
const AGENTS = [
  ['jax','jax.jpg','#f97316','Builder'],
  ['hank','hank.jpg','#2dd4c0','Foreman'],
  ['vega','vega.jpg','#22c55e','Scout'],
  ['brix','brix.jpg','#a855f7','Realtor'],
  ['doss','doss.jpg','#22c55e','Paymaster'],
  ['vault','vault.png','#c9a84c','Vault'],
  ['signalscout','signalscout.png','#3b82f6','Signal Scout'],
  ['forge','forge.jpg','#f97316','Forge'],
  ['max','max.jpg','#22c55e','Launch'],
  ['echo','echo.jpg','#2dd4c0','Dispatcher'],
  ['iris','iris.jpg','#a855f7','Auditor'],
  ['rex','rex.jpg','#c9a84c','Writer'],
  ['nova','nova.jpg','#3b82f6','QA'],
  ['pixel','pixel.jpg','#a855f7','Creator'],
  ['zenith','zenith.jpg','#c9a84c','Strategy'],
  ['atlas','atlas.jpg','#3b82f6','Territory'],
  ['neo','neo.jpg','#a855f7','Neural'],
  ['hire',null,'#444444','Open Slot'],
];

// Column rotations (col index 0..5): outer ±28°, middle ±18°, inner ±8°.
const COL_ROT = [-28, -18, -8, 8, 18, 28];
const ROW_ROT = [5, 0, -5]; // top tilts toward viewer, bottom away

const grid = document.getElementById('grid');
AGENTS.forEach((a, i) => {
  const [name, img, color, role] = a;
  const col = i % 6;
  const row = Math.floor(i / 6);
  const el = document.createElement('div');
  el.className = 'room';
  el.dataset.name = name;
  el.dataset.color = color;
  el.style.setProperty('--accent', color);
  el.style.transform = `rotateY(${COL_ROT[col]}deg) rotateX(${ROW_ROT[row]}deg)`;
  el.innerHTML = `
    <div class="room-media">${img ? `<img src="assets/rooms/${img}" alt="${name}" loading="lazy">` : `<div class="room-empty">+ HIRE</div>`}</div>
    <div class="room-label"><span>${name.toUpperCase()}</span></div>
  `;
  grid.appendChild(el);
});
```

Insert inside `<style>` (replace placeholder `.room` rule):

```css
.room {
  position: relative; width: 200px; height: 200px;
  background: #0a0a12; border-radius: 2px; overflow: hidden;
  transform-style: preserve-3d; transition: transform 300ms ease;
  cursor: pointer; /* click handler added in Task 6 */
}
.room-media, .room-media img, .room-media video { width: 100%; height: 100%; display: block; object-fit: cover; }
.room-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: rgba(239,233,216,0.35); letter-spacing: 3px; border: 1px dashed rgba(239,233,216,0.18); background: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 8px, transparent 8px 16px); }
.room-label { position: absolute; left: 0; right: 0; bottom: 0; padding: 6px 8px; font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 2.5px; color: var(--bone); text-align: center; background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0)); }
```

- [ ] **Step 2: Verify grid renders**

Run:
```bash
curl -s http://localhost:3000/cockpit.html | grep -c 'class="room"'
```
Expected: `0` (rooms built client-side) — so instead check JS:
```bash
grep -cE "AGENTS\.forEach|COL_ROT|ROW_ROT|rotateY|rotateX" businesses/public/cockpit.html
```
Expected: `>= 5`

- [ ] **Step 3: Pause — Lando rates curved layout**

Tell Lando: "Task 2 complete. 18 rooms arranged 6×3 with perspective curl. 17 agents + 1 HIRE slot bottom-right. Rate the curve depth — spec said innermost pair faces 0° but 6-col grid has no center. If you want a true 0° center, I'll shift to a 7-col grid with a centerpiece."

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): 6x3 curved grid with 18 rooms, per-column rotateY, per-row rotateX"
```

---

### Task 3: Video backgrounds with img fallback

**Files:**
- Modify: `businesses/public/cockpit.html`

- [ ] **Step 1: Replace `<img>` with `<video>` + `<img>` poster, using a media resolver**

Replace the `el.innerHTML = …` block in Task 2 with:

```js
function roomMedia(name, img) {
  if (!img) return `<div class="room-empty">+ HIRE</div>`;
  const video = `assets/videos/${name}.mp4`;
  // Try video with img poster fallback. If video fails to load, poster stays visible.
  return `
    <video autoplay muted loop playsinline preload="metadata" poster="assets/rooms/${img}" onerror="this.replaceWith(Object.assign(document.createElement('img'),{src:'assets/rooms/${img}',alt:'${name}',loading:'lazy'}))">
      <source src="${video}" type="video/mp4">
    </video>
  `;
}

el.innerHTML = `
  <div class="room-media">${roomMedia(name, img)}</div>
  <div class="room-label"><span>${name.toUpperCase()}</span></div>
`;
```

- [ ] **Step 2: Manually probe a sample video and a sample image**

Run:
```bash
curl -s -o /dev/null -w "jax.mp4 %{http_code} %{size_download}b\n" http://localhost:3000/assets/videos/jax.mp4
curl -s -o /dev/null -w "jax.jpg %{http_code} %{size_download}b\n" http://localhost:3000/assets/rooms/jax.jpg
```
Expected: image = `200 >0b`. Video may be `404` if generation hasn't finished — that's fine, poster fallback covers it.

- [ ] **Step 3: Pause — Lando rates media layer**

Tell Lando: "Task 3 complete. Each tile now uses `<video>` with the room image as a poster. Where videos exist they autoplay loop. Where they don't (gen still in flight or failed), the still image shows. Rate."

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): per-room video with image poster fallback"
```

---

### Task 4: Gap glows and per-room accent bleed

**Files:**
- Modify: `businesses/public/cockpit.html`

- [ ] **Step 1: Add accent-colored box-shadow and gap color bleed**

Replace `.room` rule, add `.room::after`:

```css
.room {
  position: relative; width: 200px; height: 200px;
  background: #0a0a12; border-radius: 2px; overflow: hidden;
  transform-style: preserve-3d; transition: transform 300ms ease, box-shadow 300ms ease;
  cursor: pointer;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.9),
    0 0 12px 2px color-mix(in srgb, var(--accent) 55%, transparent),
    0 0 28px 6px color-mix(in srgb, var(--accent) 22%, transparent);
}
.room:hover { transform: translateZ(20px) !important; box-shadow: 0 0 0 1px rgba(0,0,0,0.9), 0 0 24px 4px var(--accent), 0 0 60px 12px color-mix(in srgb, var(--accent) 35%, transparent); }
.grid { background: #000; padding: 6px; border-radius: 4px; } /* pure-black gap backing between rooms */
```

- [ ] **Step 2: Verify hover and glow don't break layout**

Run: `curl -s http://localhost:3000/cockpit.html | grep -c "color-mix"`
Expected: `>= 2`

- [ ] **Step 3: Pause — Lando rates gap glow**

Tell Lando: "Task 4 complete. Each room now bleeds its accent color into the 6px black gap; hover lifts the room toward the viewer. Rate glow intensity — say 'stronger' or 'subtler' if it's off."

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): accent-colored glow bleeding into black gaps, hover lift"
```

---

### Task 5: Animated circuit background + radial pulse + grain

**Files:**
- Modify: `businesses/public/cockpit.html`

- [ ] **Step 1: Add background layers**

Insert before `<div class="stage">`:

```html
<div class="bg-radial"></div>
<svg class="bg-circuits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="lineH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f97316" stop-opacity="0"/>
      <stop offset="0.3" stop-color="#f97316" stop-opacity="0.9"/>
      <stop offset="0.7" stop-color="#a855f7" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#22c55e" stop-opacity="0"/>
      <stop offset="0.4" stop-color="#2dd4c0" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <g opacity="0.12">
    <!-- Horizontal lines at varied y positions with staggered delays -->
    <rect x="-400" y="140" width="400" height="1.5" fill="url(#lineH)"><animate attributeName="x" from="-400" to="1920" dur="9s" repeatCount="indefinite"/></rect>
    <rect x="-400" y="360" width="400" height="1.5" fill="url(#lineH)"><animate attributeName="x" from="-400" to="1920" dur="12s" begin="2s" repeatCount="indefinite"/></rect>
    <rect x="-400" y="640" width="400" height="1.5" fill="url(#lineH)"><animate attributeName="x" from="-400" to="1920" dur="10s" begin="4s" repeatCount="indefinite"/></rect>
    <rect x="-400" y="880" width="400" height="1.5" fill="url(#lineH)"><animate attributeName="x" from="-400" to="1920" dur="11s" begin="1s" repeatCount="indefinite"/></rect>
    <!-- Vertical lines -->
    <rect x="220" y="-300" width="1.5" height="300" fill="url(#lineV)"><animate attributeName="y" from="-300" to="1080" dur="13s" repeatCount="indefinite"/></rect>
    <rect x="620" y="-300" width="1.5" height="300" fill="url(#lineV)"><animate attributeName="y" from="-300" to="1080" dur="10s" begin="3s" repeatCount="indefinite"/></rect>
    <rect x="1180" y="-300" width="1.5" height="300" fill="url(#lineV)"><animate attributeName="y" from="-300" to="1080" dur="14s" begin="5s" repeatCount="indefinite"/></rect>
    <rect x="1560" y="-300" width="1.5" height="300" fill="url(#lineV)"><animate attributeName="y" from="-300" to="1080" dur="12s" begin="2s" repeatCount="indefinite"/></rect>
  </g>
</svg>
<div class="bg-grain"></div>
```

Insert inside `<style>`:

```css
.bg-radial { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.04) 20%, transparent 50%); animation: radialPulse 4s ease-in-out infinite; }
@keyframes radialPulse { 0%,100% { opacity: 0.35; transform: scale(1);} 50% { opacity: 0.7; transform: scale(1.15);} }
.bg-circuits { position: fixed; inset: 0; z-index: 2; pointer-events: none; width: 100%; height: 100%; }
.bg-grain { position: fixed; inset: 0; z-index: 3; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
```

- [ ] **Step 2: Verify background layers render**

Run:
```bash
grep -cE "bg-radial|bg-circuits|bg-grain|radialPulse" businesses/public/cockpit.html
```
Expected: `>= 4`

- [ ] **Step 3: Pause — Lando rates background**

Tell Lando: "Task 5 complete. Deep-black background now has slow radial pulse from center, horizontal + vertical circuit lines flowing across, and a subtle grain overlay. Rate — especially line count and pulse speed."

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): animated circuit background, radial pulse, grain overlay"
```

---

### Task 6: Detail panel with click interaction

**Files:**
- Modify: `businesses/public/cockpit.html`

- [ ] **Step 1: Add detail panel HTML and CSS**

Insert before `</body>`:

```html
<aside class="detail-panel" id="detailPanel" aria-hidden="true">
  <button class="detail-close" id="detailClose" aria-label="Close">×</button>
  <div class="detail-head">
    <h2 id="detailName">—</h2>
    <div id="detailRole">—</div>
  </div>
  <p class="detail-mission" id="detailMission">Standing by for orders.</p>
  <div class="detail-stats" id="detailStats"></div>
  <div class="detail-log" id="detailLog"></div>
</aside>
<div class="detail-backdrop" id="detailBackdrop"></div>
```

Insert inside `<style>`:

```css
.detail-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0); transition: background 200ms ease; z-index: 99; pointer-events: none; }
.detail-backdrop.open { background: rgba(0,0,0,0.55); pointer-events: auto; }
.detail-panel { position: fixed; top: 0; right: -340px; width: 320px; height: 100%; background: rgba(10,10,18,0.96); border-left: 1px solid rgba(201,168,76,0.3); padding: 28px 22px 22px; z-index: 100; transition: right 320ms cubic-bezier(.2,.8,.2,1); overflow-y: auto; }
.detail-panel.open { right: 0; }
.detail-close { position: absolute; top: 14px; right: 14px; background: none; border: none; color: var(--bone); font-size: 24px; cursor: pointer; line-height: 1; opacity: 0.7; }
.detail-close:hover { opacity: 1; }
.detail-head h2 { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 3px; color: var(--accent, var(--gold)); line-height: 1; }
#detailRole { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: rgba(239,233,216,0.6); margin-top: 4px; }
.detail-mission { font-size: 12px; line-height: 1.6; color: rgba(239,233,216,0.85); margin: 18px 0; }
.detail-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
.detail-stats .stat { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 10px; border-radius: 2px; }
.detail-stats .stat-label { font-size: 9px; letter-spacing: 2px; color: rgba(239,233,216,0.5); text-transform: uppercase; }
.detail-stats .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: var(--bone); margin-top: 4px; }
.detail-log { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px; }
.detail-log .entry { font-size: 11px; line-height: 1.5; color: rgba(239,233,216,0.7); padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.detail-log .entry time { color: rgba(201,168,76,0.7); margin-right: 8px; }
```

- [ ] **Step 2: Add click handler + data loader**

Insert inside `<script>`:

```js
const panel = document.getElementById('detailPanel');
const backdrop = document.getElementById('detailBackdrop');
const closeBtn = document.getElementById('detailClose');

function openDetail(agent) {
  const [name, , color, role] = agent;
  panel.style.setProperty('--accent', color);
  document.getElementById('detailName').textContent = name.toUpperCase();
  document.getElementById('detailRole').textContent = role;
  document.getElementById('detailMission').textContent = `${name} is ${role.toLowerCase()} at the Brewington Yard.`;
  document.getElementById('detailStats').innerHTML = `
    <div class="stat"><div class="stat-label">Status</div><div class="stat-value" id="stat-status">—</div></div>
    <div class="stat"><div class="stat-label">Rent</div><div class="stat-value">$20/mo</div></div>
    <div class="stat"><div class="stat-label">Tasks Today</div><div class="stat-value" id="stat-tasks">—</div></div>
    <div class="stat"><div class="stat-label">Revenue</div><div class="stat-value" id="stat-rev">—</div></div>
  `;
  document.getElementById('detailLog').innerHTML = `<div class="entry"><time>—</time>Loading…</div>`;
  fetch(`/api/state`).then(r => r.json()).then(state => {
    const a = (state.agents || []).find(x => (x.name || '').toLowerCase() === name);
    if (!a) return;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? '—'; };
    set('stat-status', a.status || 'IDLE');
    set('stat-tasks', a.tasksToday ?? 0);
    set('stat-rev', a.revenue != null ? `$${a.revenue}` : '$0');
  }).catch(() => {});
  fetch(`/api/activity?agent=${encodeURIComponent(name)}&limit=6`).then(r => r.json()).then(d => {
    const entries = (d.entries || d || []).slice(0, 6);
    if (!entries.length) return;
    document.getElementById('detailLog').innerHTML = entries.map(e =>
      `<div class="entry"><time>${new Date(e.ts || e.time || Date.now()).toLocaleTimeString('en-US',{hour12:false})}</time>${(e.message || e.text || JSON.stringify(e)).slice(0,120)}</div>`
    ).join('');
  }).catch(() => {});
  panel.classList.add('open'); backdrop.classList.add('open'); panel.setAttribute('aria-hidden','false');
}
function closeDetail() { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }

grid.addEventListener('click', (e) => {
  const room = e.target.closest('.room');
  if (!room) return;
  const agent = AGENTS.find(a => a[0] === room.dataset.name);
  if (agent) openDetail(agent);
});
closeBtn.addEventListener('click', closeDetail);
backdrop.addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });
```

- [ ] **Step 3: Verify click behaviour via grep**

Run:
```bash
grep -cE "openDetail|closeDetail|detail-panel|/api/state|/api/activity" businesses/public/cockpit.html
```
Expected: `>= 5`

- [ ] **Step 4: Pause — Lando rates detail panel**

Tell Lando: "Task 6 complete. Click any room: 320px panel slides in from right with agent name in their accent color, role, mission, 4 stat boxes, last 6 activity log entries. Close via X, click outside, or Escape. Rate."

- [ ] **Step 5: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): right-docked detail panel with live agent state + activity log"
```

---

### Task 7: Live ticker connected to SSE stream

**Files:**
- Modify: `businesses/public/cockpit.html`

- [ ] **Step 1: Subscribe to `/api/stream` and rewrite ticker text on new events**

Insert inside `<script>`, before `tickClock()`:

```js
// Live ticker — rolling buffer of latest activity
const tickerEl = document.getElementById('ticker-track');
const TICKER_MAX = 20;
const tickerBuf = [];
function pushTicker(msg) {
  tickerBuf.push(msg);
  while (tickerBuf.length > TICKER_MAX) tickerBuf.shift();
  tickerEl.textContent = tickerBuf.join('   ◆   ') + '   ◆   ';
}
pushTicker('COCKPIT ONLINE');

try {
  const es = new EventSource('/api/stream');
  es.onmessage = (ev) => {
    try {
      const d = JSON.parse(ev.data);
      const who = (d.agent || d.name || 'SYS').toUpperCase();
      const what = d.message || d.event || d.status || JSON.stringify(d);
      pushTicker(`[${who}] ${String(what).slice(0, 80)}`);
    } catch { pushTicker(String(ev.data).slice(0, 120)); }
  };
  es.onerror = () => { /* silent — let ticker keep last buffer */ };
} catch { /* no-op if SSE unavailable */ }
```

- [ ] **Step 2: Probe the SSE stream manually**

Run: `timeout 3 curl -N -s http://localhost:3000/api/stream | head -5`
Expected: a handful of `data: {...}` lines or the headers. If empty within 3s, check server logs.

- [ ] **Step 3: Pause — Lando rates ticker**

Tell Lando: "Task 7 complete. Ticker at the bottom now scrolls live agent activity from `/api/stream`. Rate scroll speed, density, and whether message format reads well."

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html
git commit -m "feat(cockpit): live SSE ticker with rolling buffer"
```

---

### Task 8: Responsive scaling + promote to index

**Files:**
- Modify: `businesses/public/cockpit.html`
- Modify: `businesses/public/index.html` (replaced)
- Rename: `businesses/public/command-center.html` → `businesses/public/command-center.legacy.html`

- [ ] **Step 1: Add mobile/tablet breakpoints**

Insert inside `<style>`:

```css
@media (max-width: 1400px) { .grid { grid-template-columns: repeat(6, 170px); grid-template-rows: repeat(3, 170px); } }
@media (max-width: 1100px) { .grid { grid-template-columns: repeat(6, 140px); grid-template-rows: repeat(3, 140px); gap: 4px; } .room-label { font-size: 11px; } }
@media (max-width: 820px)  { .grid { grid-template-columns: repeat(6, 92px);  grid-template-rows: repeat(3, 92px);  gap: 3px; } .room-label { font-size: 9px; letter-spacing: 1.5px; } .logo { font-size: 14px; letter-spacing: 2px; } }
@media (max-width: 600px)  { .stage { perspective: 1200px; } .grid { grid-template-columns: repeat(6, 58px); grid-template-rows: repeat(3, 58px); } .detail-panel { width: 100%; right: -110%; } }
```

- [ ] **Step 2: Promote cockpit to index + archive legacy**

Run:
```bash
mv businesses/public/command-center.html businesses/public/command-center.legacy.html
cp businesses/public/cockpit.html businesses/public/index.html
curl -s -o /dev/null -w "root: %{http_code} (%{size_download}b)\n" http://localhost:3000/
```
Expected: `200 >8000b`

- [ ] **Step 3: Pause — Lando final rating on `/`**

Tell Lando: "Task 8 complete. Cockpit is live at `/`. Old sprite/corridor god-view archived as `command-center.legacy.html`. Refresh port 3000, test on mobile viewport in devtools. Final rating?"

- [ ] **Step 4: Commit**

```bash
git add businesses/public/cockpit.html businesses/public/index.html businesses/public/command-center.legacy.html
git commit -m "feat(cockpit): responsive breakpoints and promotion to index.html"
```

---

## Self-Review Checklist

**Spec coverage:**
- Curved 6×3 grid with per-col rotateY ±8/±18/±28°: Task 2 ✓
- Per-row rotateX ±5°: Task 2 ✓
- 6px black gap with color blending: Task 4 ✓
- Video with img fallback: Task 3 ✓
- Bebas Neue label bottom of room, no other overlay: Task 2 ✓
- Detail panel, 320px, slides from right, stats grid, 6 log entries, close X/outside/Escape: Task 6 ✓
- Background #04040a with animated SVG circuits, radial pulse 4s, grain: Task 5 ✓
- Cockpit frame: vignette, logo TL, clock TR, gold corner brackets, scrolling ticker bottom: Task 1 + Task 7 ✓
- 18 agent colors per spec: hardcoded in AGENTS array ✓
- Bebas Neue + Share Tech Mono loaded from Google Fonts: Task 1 ✓
- Single HTML file: all tasks edit cockpit.html only ✓

**Spec ambiguity flagged for Lando in Task 2 rating:** 6-col grid has no true center col; innermost pair is ±8°, not 0°. If he wants a 7-col grid with true center, we insert a center column (could be a `HIRE` slot or company emblem) and shift HIRE to col 7 of row 3.

**Placeholder scan:** All code blocks complete, all CSS/JS verbatim.

**Type consistency:** `AGENTS` array shape `[name, img, color, role]` used identically in render loop and `openDetail()`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-18-cockpit-command-center.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
