# ECHO Free-Tier Re-Hunt (Phase 2)

*Researched 2026-04-18 by Hank under $0-startup-capital directive. Paid stack parked at businesses/foreman/parked/echo-instantly-paid.md. All candidates below must meet: no subscription, no deposit, no credit card to verify, free-forever tier, commercial use permitted, autonomy >= 3.*

## Mission
Replace Apify Google Maps Scraper + Instantly.ai Growth ($52/mo) with a $0 stack that still delivers scrape -> score -> warm -> send -> reply on the Mesa / Scottsdale / Gilbert AZ pool.

## Six-platform sweep

### 1. GitHub Advanced Search - self-hosted scrapers

**gosom/google-maps-scraper** (top pick)
- Repo: https://github.com/gosom/google-maps-scraper
- License: MIT
- Stars: 3,300+ as of Mar 2026
- Active: yes, recent activity, actively maintained
- Shape: Go binary, ships as CLI + Web UI + REST API + Docker image
- Extracts: name, address, phone, website URL, rating, review count, lat/lng, reviews, email, more
- Self-host: `docker run -v $PWD/gmapsdata:/gmapsdata -p 8080:8080 gosom/google-maps-scraper`
- Cost: $0. Commercial use permitted under MIT.
- Risk: self-managed proxies, CAPTCHA handling, rate limits. Acceptable at low volume (Mesa/Scottsdale/Gilbert = ~1,500 businesses, pull-once-per-month cadence).

**omkarcloud/google-maps-scraper** (runner-up)
- Repo: https://github.com/omkarcloud/google-maps-scraper
- License: MIT (desktop app) - note: hosted API is $16/mo, we use the open-source local tool only
- Stars: 2.5k as of Feb 2026
- Shape: desktop app (Windows/Mac) + Python framework (Botasaurus)
- Extracts: 50+ data points including emails, phones, social profiles
- Cost: $0 for self-hosted desktop/local runs. Commercial use permitted.
- Risk: heavier install than gosom; Botasaurus is Python, we'd script rather than use the GUI.

**Self-rolled Puppeteer** (fallback)
- Vanilla Puppeteer + Google Maps search page automation
- Free, but requires proxy management and CAPTCHA handling we'd build ourselves
- Only use if both gosom and omkarcloud fail on our AZ metros

### 2. Public APIs - no card, no auth

None relevant for Google Maps business listings. Google Places API requires a credit card even for "free" tier. Skip.

### 3. Free-forever creator/send tools

**Resend free tier** (top pick for send layer)
- Pricing page: https://resend.com/pricing
- Limit: 3,000 emails/month, 100 emails/day
- No credit card required. No expiry date. No paywall within 30 days.
- Includes: 1 custom domain, React Email support, delivery analytics
- Commercial use: permitted
- Fit: ECHO's AZ pool is ~1,500 prospects; 3,000/mo ceiling = 2 sends/prospect/mo (first touch + follow-up). Works for Month 1. Scales to a second touch for Month 2 prospects before we hit the cap.

**Brevo free tier** (runner-up send)
- Limit: 300 emails/day = ~9,000/mo, no credit card, no time limit
- Includes Brevo branding on free plan (bad look for cold outbound to local service businesses)
- Contact storage 100,000 contacts
- Commercial use: permitted
- Drawback: brand footer on free = lower reply rate. Acceptable fallback if Resend rejected or hit limit.

**Mailgun Flex free (rejected)**
- Free: 100 msgs/day without credit card
- Flex: only 3 months of free emails then pay-as-you-go (30-day-ish paywall on volume, violates rule 4)
- Skip. Not a stable free-forever.

**Gmail SMTP free (rejected for cold outbound)**
- 500/day web, ~100/day SMTP on personal Gmail
- Gmail's TOS explicitly disallows using personal Gmail for cold outreach
- Behavioral anti-spam triggers shutdowns well below the 500/day cap
- Account lockout risk is high; losing a Gmail account costs more than saving $16/mo Resend paid later
- Skip. Instantly's own blog flags this.

### 4. Reddit / Indie Hackers - solo operator cold email at $0

- Common pattern from devtoolpicks.com and builder forums: Resend (free 3K/mo) + own domain + nodemailer queue = proven zero-cost cold send stack for solo founders
- r/Entrepreneur threads repeatedly surface gosom + Resend as the "broke founder's outreach stack"
- Unify GTM "Cold Email in 2026" article: own-domain authenticated sends with DMARC/DKIM/SPF now match Gmail Workspace deliverability when volume stays under Gmail's bulk-sender threshold (5,000/day)
- Instantly's own 2026 benchmark: 83.1% global inbox placement is achievable on authenticated own-domain SMTP, not just on paid warmup

### 5. Bootstrap operator stories

- Mailforge deliverability benchmarks show own-domain SMTP with proper authentication can hit 85%+ inbox on cold sends if sender reputation is built via slow warmup (start at 10/day, ramp to 50/day over 14 days)
- ECHO loses Instantly's 94% inbox, but 83-85% on a warmed authenticated Resend domain is still viable
- Reply-rate hit from no auto-reply-handling: we lose ~20% throughput because replies need Lando batch review rather than instant auto-classification

### 6. npm registry - node libraries

- `nodemailer` (MIT, 4M+ weekly downloads) for SMTP send
- `resend` npm client (MIT) for Resend API
- `puppeteer` (Apache-2.0) + `puppeteer-extra-plugin-stealth` for any custom scraping fallback
- All $0, all self-hosted, all commercial-use OK

## Picked free stack

**Scrape:** gosom/google-maps-scraper (Docker, self-hosted, MIT)
**Send:** Resend free tier (3,000 emails/mo, 100/day, no card)
**Draft:** existing `sales` plugin `draft-outreach` + `email-sequence` skills (already installed, $0 incremental)
**Reply handling:** manual batch review by Lando, 30 min/day

## Free-tier specific caveats
- **Resend 3K/mo hard cap.** At 1,500 prospects x 2 sends = exactly 3,000/mo. No room for a third follow-up on the same prospects until Month 2. Consequence: fewer touches -> lower reply rate.
- **gosom rate limits self-managed.** Run harvest 1x/mo, not daily, to avoid Google IP bans on the local machine.
- **No warmup infrastructure.** Own-domain reputation must be built slowly. First 14 days: 10-50 sends/day ramp. Real send cadence doesn't start until day 15.
- **No Unibox / auto reply-handling.** Replies land in the Resend-connected inbox; Lando reviews batch daily. Adds ~20-30 min/day of Lando time vs fully-autonomous Instantly.

## Projected revenue on free limits

Baseline assumptions (reduced from paid):
- 1,500 scraped prospects (same as paid)
- 2 sends/prospect max under 3K/mo cap (vs Instantly's 3-4 sends typical)
- Inbox placement: ~83% (Resend authenticated own-domain) vs 94% (Instantly)
- Reply rate degradation: paid baseline 3% -> free estimate 1.8% (2-send sequence vs 4-send, 83% inbox vs 94%)
- Close rate on positive replies: 7% (unchanged; draft-outreach skill is identical)
- Warmup eats first 14 days of Month 1 (half the month at fractional volume)

Month 1 math: 1,500 x 1.8% reply x 7% close x 0.5 warmup factor = 0.94 closes. Round down to **1 close = $297 new MRR.**
Month 3 math (full warmup, second pool added, returning to 2-3% reply as domain matures): 2,000 prospects x 2.5% x 7% = 3.5 closes/mo. Cumulative M3 active MRR = $1,100-$1,500 (3-5 clients assuming zero churn).

## Unlock threshold for paid upgrade
ECHO revenue MTD >= $100 triggers "Instantly upgrade is available" alert. Per parked doc.

## Runners-up
1. **gosom + Brevo free (300/day = 9,000/mo)** - higher send ceiling than Resend but brand footer on free tier kills open rate on cold. Use only if Resend rejects us.
2. **omkarcloud local desktop + Resend** - swap scraper only. Identical send stack. Use if gosom ships a breaking change.

## Sources
- https://github.com/gosom/google-maps-scraper
- https://github.com/omkarcloud/google-maps-scraper
- https://resend.com/pricing
- https://www.brevo.com/pricing/
- https://help.mailgun.com/hc/en-us/articles/203068914
- https://instantly.ai/cold-email-benchmark-report-2026
- https://www.mailforge.ai/blog/domain-deliverability-benchmarks
- https://www.unifygtm.com/explore/cold-email-2026-domain-setup-deliverability-sequences
- https://devtoolpicks.com/blog/resend-vs-postmark-vs-mailgun-solo-developers-2026
