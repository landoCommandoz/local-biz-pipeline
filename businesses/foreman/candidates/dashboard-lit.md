# Candidate: Lit (web components)

*Brief targeted: dashboard. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HOLD.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Gives each agent bay a real component boundary (a `<foreman-bay>` tag) with scoped styles, so adding a new bay is one tag instead of a DOM surgery.

### 2. Monthly cost all-in
- Infrastructure: $0 (one CDN tag or bundled ~5 kb)
- Licensing: $0 (BSD-3)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: client-side rendering against the existing /api/state endpoint, no SSR.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 3 hours/month at $50/hr = $150/month. Each bay as a web component isolates style and behavior, shrinking regressions.
Assumptions: two new bays per month, web-component encapsulation saves about 45 minutes of style-debug per new bay.

### 4. Payback period
Immediate. Cost is $0.

### 5. Autonomy score 1-5
3. Web components are a standard but the templating is JS-tagged template literals, which requires the bay-generator to emit JavaScript (not just HTML). One more failure mode than HTMX + Alpine. Still above the autoreject line.
Evidence for the score: Lit components are class-based with render() methods returning html\`...\` template literals; generation needs a templating pass.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES, once the bay-generator knows how to emit a Lit component file.

### 8. One-line kill criteria
If the bay-generator cannot reliably emit working Lit components from a charter + state pair within 30 days of install, kill and fall back to HTMX + Alpine.

---

## Source
- Repo / listing URL: https://github.com/lit/lit
- License: BSD-3-Clause
- Last commit: active in 2026 (recent releases)
- Stars / downloads / sales: ~21.3k stars
- Active maintainer: yes, Google-backed

## What it does
Lit is a ~5kb library for authoring native web components. You define a class extending LitElement, declare reactive properties, and return a template from render(). The browser renders the component anywhere the custom tag appears. Scoped CSS per component. No virtual DOM.

It does not ship a dashboard template. It gives you the primitive to build one.

## Fit with Brewington ecosystem
- **Plugs into:** server.js /api/state; each `<foreman-bay>` fetches its slice
- **Replaces:** the same hand-rolled `index.html`
- **Depends on:** modern browser (all targets), no Node runtime dependency for the dashboard
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. Vendor lit core into `businesses/public/vendor/`
2. Author `<foreman-bay>`, `<scout-bay>`, `<builder-bay>` components
3. Bay generator writes a new `*-bay.js` file per hire

## Risks and trade-offs
- More ceremony than HTMX + Alpine. Component files instead of HTML snippets.
- Slower path to "alive, distinct rooms" if Lando wants heavy per-room visual character, because each room is JS-driven.
- BSD-3 is permissive but slightly more restrictive than MIT in attribution language.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (BSD-3-Clause, lit/lit/blob/main/LICENSE)
- [x] Last commit date confirmed (active 2026 releases)
- [x] Star count confirmed via live visit (~21.3k)
- [x] At least one independent review or discussion found and linked (lit.dev docs, webcomponents.org element page)
- [x] Pricing page read and costs verified (free OSS)

## Foreman recommendation
HOLD. Lit is a credible choice but HTMX + Alpine covers the same ground with less ceremony and matches the "single-file dashboard" status quo better. If the dashboard grows past 5+ distinct bays with heavy per-bay UI, revisit Lit.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
