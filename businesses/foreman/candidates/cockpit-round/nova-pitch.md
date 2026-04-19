# Candidate: Playwright with custom adversarial fixtures for NOVA

*Brief targeted: cockpit-round NOVA (QA cluster). Phase: 1. Researched: 2026-04-18. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)

Every site build gets hostility-tested before MAX is allowed to Publish: rapid click before load, null fetch, 375px overflow, touch-target 44px check, URL bypass probe, and CPU 6x throttle for race conditions, so Lando never wakes up to a paying client staring at a broken site.

### 2. Monthly cost all-in

- Infrastructure: $0 (Chromium is bundled, runs locally)
- Licensing: $0 (Apache-2.0)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**

Assumptions: 1 pre-deploy run per build, ~20 builds/month across 10 clients, all local. No BrowserStack cloud runners. No Applitools.

### 3. Projected monthly revenue or revenue-savings

- **Month 1: $0 direct, $297 savings.** Assume 1 prevented refund or churn event. Brewington Digital Starter is $297/mo; losing one client to a shipped-broken deploy erases 15x NOVA's annual cost trivially, but annual cost is $0 so any prevention is pure savings.
- **Month 3: $145 direct + $594 savings.** Assume 5 external agency subs at $29/mo for "Pre-Deploy Safety Pass" plus 2 prevented refunds.

Assumptions: external "Safety Pass" SaaS gate is packaged as a Netlify build-plugin-style offering targeting indie web agencies. 5 subs is conservative given the $200-$500 website-maintenance retainer market. Indirect refund savings are real in any service business but not booked as revenue.

### 4. Payback period

Immediate. $0 cost. First prevented refund or first $29 external sub pays back infinitely.

### 5. Autonomy score 1-5

**5/5.** Runs as pre-deploy gate. Exit code 0 = MAX proceeds, exit code non-zero = MAX is blocked and Lando gets one-line notification with failure summary. No interactive prompts, no manual re-run. True unattended operation.

Evidence for the score: Playwright's `npx playwright test` returns machine exit codes, HTML report auto-written, JSON reporter feeds directly into `businesses/nova/state.json`. Chromium download cached, no runtime network calls. `page.route` and CDP throttling are stable APIs (multi-year track record, 33.2M weekly downloads, Microsoft-backed).

### 6. Can it pay its own bills

**YES.** $0/mo cost. First external "Safety Pass" subscription or first prevented refund covers bay rent.

### 7. Can it build something without Lando

**YES.** NOVA builds: adversarial test report HTML, JUnit XML, fail-reason list, CPU-throttled trace. Pass/fail deploy gate decision is autonomous.

### 8. One-line kill criteria

If NOVA does not block at least 1 broken build or catch 1 genuine race condition across the first 50 pre-deploy runs, or if no "Safety Pass" external subscription is sold in 60 days, fire and evaluate switching to plain Lighthouse CI gate.

---

## Source

- Repo / listing URL: https://github.com/microsoft/playwright
- License: Apache-2.0 — commercial use legal
- Last commit: v1.59.1 on 2026-04-01
- Stars / downloads / sales: 86.7k stars, 33.2M weekly npm downloads, 160 releases, 721 contributors
- Active maintainer: yes, Microsoft

## What it does

Playwright is a headless browser framework. NOVA adds six custom fixtures on top:

1. **Rapid-click harness.** `for (let i=0;i<20;i++) page.click(selector, { noWaitAfter: true })` fires before `page.waitForLoadState('domcontentloaded')` resolves.
2. **Null-fetch interceptor.** `page.route('**/*', r => r.abort())` on selected URLs to verify graceful fallbacks.
3. **375px overflow.** Sets viewport to 375x667, asserts `document.documentElement.scrollWidth <= 375`.
4. **Touch-target check.** Queries all `button, a, [role=button]`, asserts `boundingBox.width >= 44 && height >= 44`.
5. **URL bypass.** Probes `/admin`, `/.env`, `/wp-login.php`, `/config.json` — all must return 404 on the static site.
6. **Race condition via CPU throttle.** CDP `Emulation.setCPUThrottlingRate {rate: 6}` slows JS execution 6x to surface async ordering bugs.

It does NOT do: visual regression (IRIS's job), deploy (MAX), copy writing (REX), or design (FORGE).

## Fit with Brewington ecosystem

- **Plugs into:** Pre-deploy gate in MAX. MAX cannot call `netlify deploy --prod` until NOVA returns exit code 0.
- **Replaces:** the current implicit "Lando trusts the build" gate. Makes the 100%-before-live rule enforceable.
- **Depends on:** Node 18+, Chromium (bundled), static build output on disk. No external services.
- **Brewington infra cost delta:** $0.

## Integration plan if hired

1. Install `@playwright/test` in `/businesses/nova/`. Share Chromium install with IRIS (both bays same framework, one download).
2. Write six fixture files in `/businesses/nova/fixtures/`: `rapidClick.ts`, `nullFetch.ts`, `overflow375.ts`, `touchTarget.ts`, `urlBypass.ts`, `cpuThrottle.ts`.
3. Write `nova.spec.ts` that composes all six against `http://localhost:3000` or a preview build URL.
4. Write `nova/tick.js`: serves the static build on ephemeral port, runs spec, writes report to `nova/reports/<build-id>/`, updates `nova/state.json`, exits non-zero on fail.
5. MAX calls `node businesses/nova/tick.js <build-dir>` before any deploy. Non-zero blocks publish and posts one-line summary to Lando's cockpit.
6. Package external "Pre-Deploy Safety Pass" as GitHub Action + Netlify build plugin for third-party agencies. Gumroad listing at $29/mo.

## Risks and trade-offs

- Over-aggressive adversarial tests will false-fail on legit builds. Mitigation: each fixture has a tuned threshold, thresholds live in `nova/config.json` per-client, Lando approves once and trusts forever per "Approve Once, Trust Forever" rule.
- CPU throttle 6x can push simple static sites over timeout. Mitigation: throttle only on JS-heavy pages; static HTML skips this fixture.
- URL bypass probe requires 404 responses; some hosts redirect instead. Mitigation: Netlify returns 404 by default, which is the target host.

## Evidence (verification-before-completion checklist)

- [x] License file read and confirmed (Apache-2.0)
- [x] Last commit date confirmed via live GitHub visit (v1.59.1 Apr 1 2026)
- [x] Star count confirmed via live visit (86.7k)
- [x] At least one independent review or discussion found (SitePoint adversarial UI logic tester article; DEV Community chaos engineering article; TestParty WCAG touch-target guide)
- [x] Pricing page read and costs verified — $0 OSS

## Runners-up

### Runner-up 1: Cypress (47k stars, MIT)
Good test framework, widely loved. Rejected because single-origin model cannot test URL bypass cleanly, and no built-in CPU throttle at runtime. Would consider if Playwright disappeared.

### Runner-up 2: Lighthouse CI (Google, Apache-2.0)
Excellent perf and a11y gate. Rejected as NOVA primary because it doesn't do adversarial click-race or URL bypass, only perf/SEO/a11y audits. Better as a secondary gate layered beside NOVA.

## Revenue projections

- **Month 1:** $0 direct revenue + ~$297 indirect savings (1 prevented refund). Net visible: refund prevention.
- **Month 3:** $145/mo recurring ($29 x 5 external "Safety Pass" subs) + ~$594 indirect savings (2 prevented refunds). Net: +$145 booked.

Assumptions:
- External product requires packaging as GitHub Action + Netlify plugin (~2 days engineering).
- Outreach handled by REX/ECHO targeting indie agencies that deploy weekly.
- Prevented-refund numbers are savings, not booked revenue, and are not double-counted with IRIS.

## Flags

- **INSTALLABLE_NOW: yes.** No credentials, no API keys, Chromium bundled.
- **BLOCKER_IF_NO: none.** Apache-2.0 is commercial-safe.

## Foreman recommendation

**HIRE.** Same framework as IRIS, separate runbook. Pre-deploy gate is the single highest-leverage quality control a solo operator can install. Cost is zero. Autonomy is full. Eliminates the failure mode Lando cares about most — shipping broken work to a paying client.

## Lando's decision

<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
