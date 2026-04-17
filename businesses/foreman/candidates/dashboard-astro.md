# Candidate: Astro

*Brief targeted: dashboard. Phase: 1. Researched: 2026-04-17. Foreman recommendation: PASS.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Renders a static shell with hydrated "island" components per bay, which maps cleanly to one-bay-per-island.

### 2. Monthly cost all-in
- Infrastructure: $0 (already on Netlify, Astro builds static output)
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: static output, no SSR adapter, polling from the browser.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 2 hours/month at $50/hr = $100/month. Islands cleanly isolate each bay but require a build step.
Assumptions: one site rebuild per bay change; Netlify auto-builds handle it.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
3. Adding a bay means creating a new `.astro` file and rebuilding. The bay-generator can write the file and Netlify builds on commit, but there is a build pipeline in the loop now.
Evidence for the score: Astro requires `astro build` before the dashboard reflects the new bay.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES with a bay-generator that writes `.astro` files and commits.

### 8. One-line kill criteria
If the build step blocks a bay appearing for more than an hour after Foreman hires, kill.

---

## Source
- Repo / listing URL: https://github.com/withastro/astro
- License: MIT
- Last commit: astro@6.1.7 released Apr 15, 2026
- Stars / downloads / sales: 58.5k stars
- Active maintainer: yes, Cloudflare acquired the team Jan 2026, still MIT and OSS

## What it does
Astro is a content-driven web framework that ships static HTML by default with "islands" of client-side interactivity. Each page is a .astro file, mixing HTML, server-side expressions, and optional client-side JS.

For a dashboard, Astro's islands model maps to one island per bay. But the core of Astro is its build-time rendering, which is a mismatch for "poll every 30 seconds."

## Fit with Brewington ecosystem
- **Plugs into:** Netlify deploy pipeline (already wired)
- **Replaces:** the hand-rolled dashboard
- **Depends on:** Node build toolchain (already present for generator.js / deployer.js)
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm init astro` in a new `businesses/dashboard/` folder
2. Write one `.astro` page per bay
3. Add Netlify build config for the folder

## Risks and trade-offs
- Build step in the loop means bays update on deploy, not in realtime. A polling island can still fetch /api/state, but the ceremony is heavier than HTMX's hx-get.
- Framework churn risk: the Cloudflare acquisition is new (Jan 2026); license is still MIT but governance shifted.
- Overkill for what the brief asks (a dashboard that shows 3 to 10 bays, not a content site).

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT)
- [x] Last commit date confirmed (Apr 15, 2026)
- [x] Star count confirmed via live visit (58.5k)
- [x] At least one independent review or discussion found and linked (alexbobes.com astro 2026 deep dive)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
PASS. Strong framework, wrong tool for a live-polling dashboard. Build-step ceremony is more overhead than either HTMX + Alpine or Lit for this exact use case.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
