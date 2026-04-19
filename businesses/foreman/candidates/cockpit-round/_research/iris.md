# IRIS Research — Visual QA / Headless Browser

*Cluster: qa. Researched: 2026-04-18. Foreman: HANK.*

## Brief recap

IRIS does visual audits on deployed client sites at 390px mobile and 1440px desktop. Catches copy violations (no "AI", no em dashes), broken CTAs, layout issues, missing images. Runs after every MAX deploy. Must protect Brewington Digital Starter ($297/mo) and Growth ($497/mo) clients from shipping broken sites.

## Six-platform sweep

### 1. GitHub Advanced Search

**Playwright (microsoft/playwright)**
- 86.7k stars, Apache-2.0 license, last release v1.59.1 on 2026-04-01
- 160 releases, 721 contributors, active maintenance confirmed via live GitHub visit
- Built-in `toHaveScreenshot()` and `toMatchSnapshot()` — no plugins required
- Source: https://github.com/microsoft/playwright

**BackstopJS (garris/BackstopJS)**
- 6,260 stars, MIT license
- Last release 6.3.25 roughly 2 years ago; Snyk reports "healthy" but users flag sparse commits
- Source: https://github.com/garris/BackstopJS
- Concern: deprecated inflight@1.0.6 dep, unresolved since 2024

**axe-core (dequelabs/axe-core)**
- 3 billion+ lifetime npm downloads, MPL-2.0 (commercial use legal)
- Backed by Deque Systems, active maintenance, catches 57% of WCAG issues automatically
- Source: https://github.com/dequelabs/axe-core

### 2. Claude Code plugin registry and skills marketplace

- `browser` skill (plugin:browser) available: "Web browser automation with AI-optimized snapshots for claude-flow agents"
- No dedicated visual-regression or a11y-QA skill found in marketplace
- Smithery has `mobile-testing-playwright` skill for mobile viewport testing
- Source: https://smithery.ai/skills/ramunasnognys/mobile-testing-playwright

### 3. Apify Actor Store

- Multiple "website screenshot" actors exist (paid per run ~$0.10-$0.50)
- Not a fit: Apify is SaaS-metered, kills autonomy, creates vendor lock-in
- Rejected for IRIS primary skill

### 4. RapidAPI + Percy/Chromatic/BrowserStack/Applitools

- **Percy**: $0.003-$0.006 per snapshot on contracts, free tier 5,000 snapshots/month, $199/mo paid entry
- **Chromatic**: $0.002-$0.004 per snapshot at volume, $149/mo paid entry, free tier 5,000 snapshots for open source
- **Applitools**: starts $699-$969/month. Enterprise only. Rejected: kills payback math.
- All three require dashboards and team review workflows IRIS does not need yet.

### 5. Product Hunt + Gumroad + Indie Hackers

- Simply Stated Website Audit (Gumroad): 50-point audit, evidence of paid audit-as-product market
- Landing Page Roasts (Gumroad): free audit lead magnet, paid upsells
- My Web Audit SaaS: monthly audit reports, white-label for agencies
- Source: https://www.mywebaudit.com/pricing
- Signal: audit-as-a-service is a proven product category with $99-$399/mo retainers

### 6. Reddit revenue threads

- r/SEO and r/SideProject: "Andrés Builds" gives $800 audits free for Reddit leads, upsells maintenance
- r/webdev thread: website maintenance retainers $200-$500/mo are standard for small-biz agencies
- Source: https://www.gravitatedesign.com/blog/website-maintenance-cost-guide/
- Signal: IRIS output (visual audit report with screenshots + fail list) is a saleable artifact

## Shortlist (3-5 candidates)

### 1. Playwright + toHaveScreenshot + axe-core stack (WINNER)

- **Revenue evidence (35%):** Playwright 33.2M weekly npm downloads, used by Microsoft, Google, open source adopters. Adjacent revenue: agencies charge $200-$500/mo for site QA retainers (audit-as-a-service market is proven). IRIS can generate saleable audit PDFs for external prospects. Score: 28/35
- **Fit with pipeline (25%):** Native headless Chromium at any viewport; reads DOM to scan copy for "AI"/em-dashes; axe-core layers on a11y scan. MAX deploys -> IRIS runs -> report. Score: 25/25
- **Autonomy (20%):** 4/5. Runs unattended via CLI, emits pass/fail + HTML report. Only escalates when diffs exceed threshold or copy violations found. Score: 16/20
- **Install complexity (10%):** `npm i -D @playwright/test axe-core @axe-core/playwright`, one line. Score: 10/10
- **Licensing (10%):** Apache-2.0 + MPL-2.0, both commercial-use legal. Score: 10/10
- **TOTAL: 89/100**

### 2. BackstopJS

- Revenue evidence: 6.2k stars, MIT, but maintenance concerns (last meaningful release 2+ years ago). Score: 18/35
- Fit: purpose-built for visual regression, good HTML diff reports. Score: 22/25
- Autonomy: 4/5. Score: 16/20
- Install: `npm i -g backstopjs`, needs config file. Score: 8/10
- Licensing: MIT. Score: 10/10
- **TOTAL: 74/100.** Runner-up but dependency rot risk.

### 3. Percy (BrowserStack)

- Revenue evidence: paid SaaS, $0.003-$0.006/snapshot. IRIS would burn $30-$60/mo at 10 clients x 2 viewports x daily. Score: 10/35 (cost eats margin)
- Fit: excellent dashboard, AI diffing. Score: 23/25
- Autonomy: 3/5 (requires BrowserStack account, API key management). Score: 12/20
- Install: SDK + API key + dashboard setup. Score: 6/10
- Licensing: proprietary SaaS. Score: 8/10
- **TOTAL: 59/100.** Rejected: cost-per-snapshot kills $297/mo Starter margins.

### 4. Lighthouse CI

- Revenue evidence: Google-backed, free, widely used in CI. Score: 20/35
- Fit: 70% overlap with IRIS mission, but focuses on perf/SEO, not visual regression or copy. Score: 15/25
- Autonomy: 4/5. Score: 16/20
- Install: easy. Score: 9/10
- Licensing: Apache-2.0. Score: 10/10
- **TOTAL: 70/100.** Better as NOVA companion than IRIS primary.

### 5. Chromatic

- Revenue evidence: VC-backed, strong adoption. $149/mo paid entry. Score: 12/35
- Fit: Storybook-first; Brewington sites are static HTML, no Storybook. Score: 10/25
- Rejected: fit too weak.

## Monetization angle for IRIS

Lando sells "Brewington Digital QA Report" as $49 one-off or $29/mo add-on to external prospects whose sites IRIS has scanned. Headless browser + axe-core emits a credible PDF report. This is real. Evidence: Simply Stated and My Web Audit run similar products profitably. Month-1 target: 3 paid reports x $49 = $147. Month-3 at scale: 10 retainers x $29 = $290.

## Recommendation

**HIRE Playwright + axe-core stack.** Kills three birds: visual regression (toHaveScreenshot), copy scan (DOM text regex), a11y scan (axe-core injection). Zero monthly cost. Apache-2.0 + MPL-2.0 commercial-safe. Covers $20 rent and generates add-on revenue.

## Sources

- https://github.com/microsoft/playwright
- https://www.npmjs.com/package/playwright
- https://playwright.dev/docs/test-snapshots
- https://github.com/garris/BackstopJS
- https://github.com/dequelabs/axe-core
- https://www.deque.com/axe/axe-core/
- https://percy.io/blog/open-source-visual-regression-testing-tools
- https://www.chromatic.com/compare/percy
- https://www.mywebaudit.com/pricing
- https://www.gravitatedesign.com/blog/website-maintenance-cost-guide/
- https://simplystatedmedia.gumroad.com/l/simplystatedwebsiteaudit
