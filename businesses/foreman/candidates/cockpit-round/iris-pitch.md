# Candidate: Playwright + axe-core stack for IRIS

*Brief targeted: cockpit-round IRIS (QA cluster). Phase: 1. Researched: 2026-04-18. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)

Every site MAX deploys gets screenshotted at 390px and 1440px, DOM-scanned for the words "AI" and em dashes, and a11y-scanned via axe-core, blocking Publish if any check fails so no broken or policy-violating site ever reaches a paying Starter or Growth client.

### 2. Monthly cost all-in

- Infrastructure: $0 (runs on existing codespace / Lando's machine)
- Licensing: $0 (Apache-2.0 and MPL-2.0, commercial use legal)
- API usage estimate: $0 (no SaaS dependency; all local headless Chromium)
- Other: $0
- **Total: $0/month**

Assumptions: 10 clients, 2 viewports, 1 audit per deploy, ~20 deploys/month. Entire workload runs locally on Chromium bundled with Playwright. No Percy, no Chromatic, no Applitools.

### 3. Projected monthly revenue or revenue-savings

- **Month 1:** $147. Assume 3 external prospects buy the "Brewington Digital QA Report" one-off at $49. Report is a PDF of IRIS's findings plus a11y scan summary. Evidence: Simply Stated (Gumroad) and My Web Audit sell the same artifact at similar price points.
- **Month 3:** $290/mo recurring. Assume 10 retainers at $29/mo for monthly IRIS sweep of an external site. Aligns with the $200-$500/mo website-maintenance retainer band documented for small-agency clients.
- Plus **refund prevention on own clients:** 1 prevented churn at $297 Starter = $297 indirect savings/mo.

Assumptions: external-audit upsell gated on IRIS producing clean HTML report with screenshots. Requires 3-5 outbound mentions per week by REX/ECHO. No assumption IRIS generates traffic on its own.

### 4. Payback period

Immediate. $0 monthly cost means payback is achieved on the first prevented refund or first $49 report sold. Realistic: week 1.

### 5. Autonomy score 1-5

**4/5.** Runs unattended on Netlify post-deploy hook or local cron. Emits pass/fail exit code plus HTML diff report. Escalates to Lando only when (a) visual diff exceeds threshold, (b) copy violation detected, or (c) a11y score drops below 90. No prompting, no manual re-runs.

Evidence for the score: Playwright has `playwright test --reporter=html` with machine-readable JSON output. 33.2M weekly npm downloads. Microsoft ships it in VS Code as first-class tool. axe-core is MPL-2.0 with `@axe-core/playwright` fixture that injects one line per page. Both designed for CI unattended execution.

### 6. Can it pay its own bills

**YES.** $0/mo cost means any external report sold or refund prevented covers bills infinitely. Bay also auto-covers $20 rent to Lando via Brix on first month external revenue.

### 7. Can it build something without Lando

**YES.** IRIS builds: audit report HTML, screenshot diff images, copy-violation list, a11y findings JSON, pass/fail manifest. No Lando input required post-install.

### 8. One-line kill criteria

If IRIS does not catch at least 1 copy violation or 1 visual regression across the first 20 deploys, or if no external QA report sells in 60 days, fire and evaluate paid alternative (likely Percy free tier + axe-core).

---

## Source

- Repo / listing URL: https://github.com/microsoft/playwright and https://github.com/dequelabs/axe-core
- License: Apache-2.0 (Playwright), MPL-2.0 (axe-core) — both commercial use legal
- Last commit: Playwright v1.59.1 on 2026-04-01; axe-core active (recent commits within days per npm)
- Stars / downloads / sales: Playwright 86.7k stars + 33.2M weekly npm downloads; axe-core 3 billion+ lifetime downloads, 13M+ GitHub projects
- Active maintainer: yes. Playwright: Microsoft, 721 contributors. axe-core: Deque Systems.

## What it does

Playwright is a headless browser framework with built-in `toHaveScreenshot()` for visual regression, `page.setViewportSize()` for responsive snapshots, and DOM access via `page.textContent()` / `page.evaluate()` for copy scanning. `@axe-core/playwright` injects axe-core into any page and returns a JSON list of WCAG violations. Together: IRIS loads a deployed URL, snapshots mobile and desktop, scans text for banned phrases ("AI", em dash U+2014), runs axe-core, emits HTML report.

It does NOT do: adversarial chaos testing (that's NOVA), deploy (that's MAX), write copy (that's REX), or design changes (that's FORGE).

## Fit with Brewington ecosystem

- **Plugs into:** MAX deploy hook (post-deploy). Reports route to god-view at port 3000. Findings feed back to REX if copy violations found.
- **Replaces:** manual Lando eyeball checks at 390px and 1440px. Replaces the trust-me-it-looks-fine approval gate.
- **Depends on:** Node 18+, Chromium (Playwright bundles it), local disk for baseline screenshots, no API keys.
- **Brewington infra cost delta:** $0. Runs on existing codespace.

## Integration plan if hired

1. Install `@playwright/test`, `@axe-core/playwright`, `axe-core` in `/businesses/iris/`. Create `playwright.config.ts` pinning 390px mobile and 1440px desktop projects.
2. Write `audit.spec.ts`: navigate to deployed URL, `toHaveScreenshot` at both viewports, `page.textContent('body')` and regex scan for /\bAI\b/i and /\u2014/ (em dash), inject axe-core, assert violations.critical.length === 0.
3. Add `iris/tick.js` that pulls latest deployed client URLs from rent-roll, runs the spec, writes HTML report to `/businesses/iris/reports/<client>-<date>/`, updates `iris/state.json` with last-run pass/fail per client.
4. Wire MAX deploy-complete event to trigger IRIS run. On IRIS fail, flip listing status back to Draft and notify Lando.
5. Build public-facing "Brewington QA Report" Gumroad listing at $49 one-off and $29/mo retainer, fulfilled by IRIS running against external URL input.

## Risks and trade-offs

- Baseline-screenshot drift: first run after any intentional design change will false-positive. Mitigation: `--update-snapshots` flag on planned redesigns, gated by Lando approval.
- Copy-scan regex false-positives on legitimate uses of "AI" in domain names or technical context. Mitigation: allowlist per client, default deny. Per Lando rule "No AI / No Em Dashes" this is the correct default.
- axe-core catches only 57% of WCAG issues. Mitigation: IRIS is not a compliance product, it's a floor-check. Human review still required for AA certification.

## Evidence (verification-before-completion checklist)

- [x] License file read and confirmed (Apache-2.0 for Playwright; MPL-2.0 for axe-core)
- [x] Last commit date confirmed via live GitHub visit (v1.59.1 Apr 1 2026)
- [x] Star count confirmed via live visit (86.7k Playwright)
- [x] At least one independent review or discussion found and linked (Percy blog comparing tools; Bug0 2026 guide)
- [x] Pricing page read and costs verified — both tools free under OSS licenses

## Runners-up

### Runner-up 1: BackstopJS (MIT, 6.2k stars)
Purpose-built for visual regression with best-in-class HTML diff reports. Rejected because maintenance has slowed (last meaningful release ~2 years ago) and deprecated deps. Would hire if Playwright disappeared.

### Runner-up 2: Percy free tier (5,000 snapshots/mo)
Best-in-class dashboard and AI diffing. Rejected because paid tier at 10 clients daily = $30-$60/mo, which eats Starter margins. Keep in pocket if client count passes 25.

## Revenue projections

- **Month 1:** $147 (3 one-off QA Reports at $49). Zero infra cost. Net: +$147.
- **Month 3:** $290 recurring (10 retainers at $29/mo) + $147 one-offs = ~$437/mo. Net: +$437.

Assumptions:
- External audit offer requires 3-5 outbound mentions per week (REX-authored, ECHO-delivered).
- Retainer conversion: 30% of one-off buyers upgrade to monthly.
- IRIS own-client refund prevention not counted as direct revenue but is a second-order win of ~$297/prevented-churn.

## Flags

- **INSTALLABLE_NOW: yes.** No credentials, no API keys, no paid accounts. Just `npm i` and baseline screenshots.
- **BLOCKER_IF_NO: none.** Apache-2.0 and MPL-2.0 are unambiguously commercial-safe.

## Foreman recommendation

**HIRE.** Free, battle-tested, covers visual + copy + a11y in one framework, autonomy 4/5, pays rent on first outside sale. This is the lowest-risk hire in the QA cluster. Playwright's ubiquity also means REX/NEO can reuse the same framework later without retraining.

## Lando's decision

<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
