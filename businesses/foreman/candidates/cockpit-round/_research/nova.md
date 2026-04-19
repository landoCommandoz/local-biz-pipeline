# NOVA Research — Adversarial QA Tester

*Cluster: qa. Researched: 2026-04-18. Foreman: HANK.*

## Brief recap

NOVA runs adversarial tests on every site build before deploy. Rapid click before load, null fetch, edge cases, 375px layout overflow, touch target compliance (WCAG 2.5.5/2.5.8), URL bypass attempts. Pre-deploy gate that protects MAX from shipping broken sites to paying clients ($297-$497/mo).

## Six-platform sweep

### 1. GitHub Advanced Search

**Playwright (microsoft/playwright)**
- 86.7k stars, Apache-2.0, active (v1.59.1 on 2026-04-01)
- Supports CPU throttling via CDP, race-condition testing via `toHaveText` polling assertions, device emulation with touch support
- Source: https://github.com/microsoft/playwright

**Puppeteer (puppeteer/puppeteer)**
- 88k+ stars, Apache-2.0, Google-maintained
- Chromium-only; Playwright superset covers everything Puppeteer does plus Firefox/WebKit
- Rejected: Playwright strictly dominates.

**Cypress (cypress-io/cypress)**
- 47k+ stars, MIT
- Single-origin, no true multi-tab, slower CI. Rejected for adversarial workload.

### 2. Claude Code plugin registry and skills marketplace

- `browser` skill exists (plugin:browser)
- No dedicated adversarial-testing skill found
- `superpowers:systematic-debugging` exists but is for bug diagnosis not pre-deploy gates
- Confirms opportunity: NOVA builds custom adversarial fixtures on top of Playwright

### 3. Apify Actor Store

- Actor store is scraping-focused, no adversarial pre-deploy testing products
- Not a fit for NOVA

### 4. RapidAPI + Percy/Chromatic/BrowserStack/Applitools

- None of these do adversarial testing (rapid click, race conditions, chaos). They're baseline visual comparison.
- BrowserStack Automate has Playwright-compatible cloud runners at $129-$249/mo. Rejected: pays for cloud runners NOVA does not need. Free local Chromium is enough.

### 5. Product Hunt + Gumroad + Indie Hackers

- No "adversarial-testing-as-a-service" products at audit-report price point
- TestingPlus.me sells Playwright training courses (evidence of skill commercialization)
- SitePoint "Playwright + LLM: Building an Adversarial UI Logic Tester" article signals emerging niche
- Source: https://www.sitepoint.com/playwright-llm-building-an-adversarial-ui-logic-tester/

### 6. Reddit revenue threads

- r/QualityAssurance threads: freelance QA testers charge $30-$100/hr, retainers $500-$2500/mo
- r/webdev: "pre-launch QA" is a named line-item on many small agency invoices
- Signal: NOVA's output (pre-deploy test report with fail list) is a saleable artifact attached to MAX deploys

## Shortlist (3-5 candidates)

### 1. Playwright + custom adversarial fixtures (WINNER)

Custom fixtures:
- Rapid-click harness (fires 20 clicks in 50ms before DOM ready)
- Null-fetch interceptor (Playwright's `page.route` returns 500/empty)
- 375px overflow assertion (measures scrollWidth vs viewportWidth)
- Touch-target bounding-box check (all buttons/links >= 44x44px)
- URL bypass probe (hits `/admin`, `/.env`, `/wp-login.php` on static sites — all should 404)
- CPU 6x throttle via CDP for race-condition detection

Scoring:
- **Revenue evidence (35%):** 33.2M weekly downloads. Pre-deploy QA retainer market pays $500-$2500/mo. SitePoint and Bug0 articles document chaos/adversarial pattern commercialization. NOVA output bundled as "Brewington Pre-Deploy Report" add-on. Score: 28/35
- **Fit with pipeline (25%):** Gates every MAX deploy. Single framework covers all six adversarial vectors Lando named. Score: 25/25
- **Autonomy (20%):** 5/5. Pass/fail exit code, fully unattended. Escalates only when test fails. Score: 20/20
- **Install complexity (10%):** `npm i -D @playwright/test` + ~300 lines of fixture code. Score: 9/10
- **Licensing (10%):** Apache-2.0. Score: 10/10
- **TOTAL: 92/100**

### 2. Cypress

- Revenue: 47k stars, MIT, free. Score: 18/35
- Fit: single-origin limitation hurts URL bypass testing. No true CPU throttle. Score: 15/25
- Autonomy: 4/5. Score: 16/20
- Install: medium. Score: 8/10
- Licensing: MIT. Score: 10/10
- **TOTAL: 67/100.** Playwright dominates.

### 3. Lighthouse CI + axe-core (adversarial bolt-on)

- Revenue: Google-backed, free, widely adopted. Score: 22/35
- Fit: perf/a11y focused, not adversarial per se. Good pairing with Playwright, weak standalone. Score: 15/25
- Autonomy: 4/5. Score: 16/20
- Install: easy. Score: 9/10
- Licensing: Apache-2.0 + MPL-2.0. Score: 10/10
- **TOTAL: 72/100.** Use as NOVA supporting layer, not primary.

### 4. Artillery / k6

- Load testing, wrong mission. Rejected.

### 5. TestCafe

- 10k stars, MIT, but slower + smaller ecosystem than Playwright. Rejected.

## Monetization angle for NOVA

"Pre-Deploy Safety Pass" bundled into Starter/Growth packages as quality guarantee. Reduces refund risk. Indirect revenue = prevented churn. Assume 1 prevented refund/mo at $297 = $297/mo saved. Also sellable standalone at $29/mo to external agencies who deploy to Netlify. Month-3 at 5 external subs = $145.

## Recommendation

**HIRE Playwright with custom adversarial fixtures.** Same framework as IRIS (zero cognitive overhead), different runbook. Pre-deploy gate prevents the thing that actually kills small agencies: a broken site going live in front of a paying client. This is refund insurance, not a vanity test.

## Sources

- https://github.com/microsoft/playwright
- https://www.npmjs.com/package/playwright
- https://playwright.dev/docs/emulation
- https://playwright.dev/docs/test-snapshots
- https://www.sitepoint.com/playwright-llm-building-an-adversarial-ui-logic-tester/
- https://dev.to/aragossa/playwright-chaos-engineering-3-ways-to-break-your-ui-in-10-lines-of-code-2bkj
- https://www.webability.io/glossary/target-size
- https://testparty.ai/blog/wcag-target-size-guide
- https://dev.to/playwright/playwright-assertions-avoid-race-conditions-with-this-simple-fix-dm1
- https://www.gravitatedesign.com/blog/website-maintenance-cost-guide/
