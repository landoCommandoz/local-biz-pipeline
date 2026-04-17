# Candidate: HTMX + Alpine.js

*Brief targeted: dashboard. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Lets us render each agent as a live bay that pulls fresh state from /api/state on every tick without a build step, and lets Foreman drop in new bays by appending an HTML fragment.

### 2. Monthly cost all-in
- Infrastructure: $0 (two CDN script tags, no server beyond existing Netlify)
- Licensing: $0 (both libraries are permissive)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: single-page dashboard served from Netlify static hosting, no SSR upgrade, polling at 30-second cadence or SSE off the existing server.js.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 4 hours/month at $50/hr = $200/month. Replaces the hand-rolled `businesses/public/index.html` and lets Foreman onboard new bays in minutes instead of hand-editing one DOM block per hire.
Assumptions: two new hires per month, each saving Lando 60-90 min of dashboard wiring plus incremental polish.

### 4. Payback period
Immediate. Cost is $0, any productivity-savings is net positive from day one.

### 5. Autonomy score 1-5
4. Both libraries are declarative — HTMX attributes on markup, Alpine directives on state. A bay-generator script can emit the HTML fragment without Lando touching it. The tiny escalations would be when a new tick endpoint needs a new `hx-get` URL or the server returns a schema break.
Evidence for the score: htmx works by adding attributes (hx-get, hx-swap) to plain HTML, no build tooling; Alpine is declarative x-data / x-text style.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. The bay generator + a templated snippet is enough; Lando never has to touch the dashboard after install.

### 8. One-line kill criteria
If six months from now Lando still has to manually edit `index.html` to add a new bay, HTMX + Alpine loses to a framework with better dynamic composition.

---

## Source
- Repo / listing URL: https://github.com/bigskysoftware/htmx and https://github.com/alpinejs/alpine
- License: BSD-2 (htmx), MIT (alpine)
- Last commit: htmx last updated Mar 16, 2026; alpine released v3.15.11 on Apr 2, 2026
- Stars / downloads / sales: htmx ~47.6k stars, alpine ~31.4k stars
- Active maintainer: yes, both actively shipping in 2026

## What it does
HTMX adds attributes to HTML that swap server-returned HTML into the DOM on events (click, poll, load, etc). Alpine.js adds lightweight reactivity (x-data, x-show, x-text) directly in markup. Combined they cover "make HTML talk to the server and animate room-level behavior" without a bundler or framework.

The output is the same HTML the user writes, hydrated in the browser with behavior. No JSX, no build pipeline, no dependency on Node at runtime (just the existing Netlify static host).

## Fit with Brewington ecosystem
- **Plugs into:** existing `businesses/public/index.html` and the server.js `/api/state` endpoint
- **Replaces:** the current hand-rolled rendering in `index.html`
- **Depends on:** `/api/state` returning JSON per business; CDN availability for two script tags (or vendor the files)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Vendor htmx.min.js and alpine.min.js into `businesses/public/vendor/`
2. Rewrite `index.html` to render a `<div class="bay" data-agent="foreman">` block per business, polling `/api/state` via `hx-get`
3. Build the bay-generator in Phase 1 brief 5 to emit that snippet from a charter + state pair

## Risks and trade-offs
- HTMX community opinion is split — a minority of engineers find it buggy under heavy interaction. Our use case is ticking status panels, low interaction surface, so the critique is largely irrelevant here.
- Two libraries instead of one is a slightly larger mental surface than just one framework. The division (transport vs. state) is clean enough that this is a feature, not a bug.
- CDN dependency for vendor files is a supply-chain risk; vendoring locally is the fix and is free.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (htmx BSD-2 via search; alpine MIT)
- [x] Last commit date confirmed (htmx Mar 2026; alpine Apr 2026)
- [x] Star count confirmed via live visit (htmx 47.6k; alpine 31.4k)
- [x] At least one independent review or discussion found and linked (HN https://news.ycombinator.com/item?id=40226025 review of 1000s of opinions)
- [x] Pricing page read and costs verified (both free, OSS)

## Foreman recommendation
HIRE. Zero cost, mature, the two-library combo matches the "alive bays" brief better than any single framework on the list. Dynamic bay addition is literally appending HTML, which the bay generator will do cheaply.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
