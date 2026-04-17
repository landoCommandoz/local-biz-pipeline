# AURIGEN: Complete Business Blueprint
## Automated Local Business AI Agency — Built for Solo Operation
### Operator: Landon Brewington (Lando), Utah — iPad + GitHub Codespaces + Claude Code

---

# PART 1: BUSINESS ARCHITECTURE

## The Product

Lando sells **one thing** to local service businesses: *"We make your phone ring and make sure you never miss a call again."*

The package includes:
- Professional website (built by Claude Code, deployed to Netlify)
- AI phone receptionist (answers every call 24/7, books appointments, qualifies leads)
- Missed-call text-back (instant SMS when a call goes unanswered)
- Automated review requests (text sent after every completed job)
- Monthly reporting dashboard (calls answered, leads captured, reviews collected)
- All under Lando's white-label brand — client never sees GoHighLevel or Claude

## Pricing Tiers

| Tier | Monthly | Setup Fee | Target |
|------|---------|-----------|--------|
| Starter | $297/mo | $0 (free website) | Solopreneurs, small crews |
| Growth | $497/mo | $0 (free website) | Established businesses, 5+ employees |
| Pro | $797/mo | $0 (free website) | Multi-location, high call volume |

**Why $0 setup:** Eliminates the #1 objection ("I don't have $2,000 for a website"). The website costs Lando ~$0.50/mo on Netlify. It's the hook that locks in recurring revenue.

## Stranger → Paying Client: The Complete Journey

```
PHASE 1: DISCOVERY (Automated)
  scraper.js → Google Places API → finds HVAC/plumbing/dental businesses
  in Mesa, Scottsdale, Gilbert, Chandler, Tempe AZ
  ↓
  Filters: has Google listing, has phone number, website is bad or missing
  ↓
  Writes to leads.csv with business_name, phone, address, website, rating,
  review_count, photos, category

PHASE 2: SCORING (Automated)
  screenshotter.js → takes mobile + desktop screenshots of existing site
  scorer.js → Claude Vision scores site 0-100 on visual quality rubric
  ↓
  Score ≤ 60 = qualified prospect (their site is bad enough to need help)
  Score > 60 = skip (their site is decent — they're not in pain)

PHASE 3: SITE GENERATION (Automated)
  email-finder.js → scrapes website + Hunter API for owner/manager email
  generator.js → Claude Sonnet builds a complete replacement website
    - Downloads Google Places photos
    - Generates HTML with real business name, address, phone, reviews
    - Includes CTA buttons, service descriptions, trust signals
  deployer.js → deploys to Netlify as {business-name}.netlify.app
  emailbuilder.js → generates personalized cold email with demo link

PHASE 4: APPROVAL (Lando's Only Job)
  approver.js → sends WhatsApp message to Lando with:
    - Business name, city, score, live demo URL
    - "Reply YES to send, SKIP to pass, or type changes"
  ↓
  Lando reviews on iPad (30 seconds per lead)
  ↓
  YES → sender.js sends cold email from Landonbrewington12@gmail.com
  SKIP → lead marked as skipped, moves to next
  CHANGE REQUEST → Claude Code regenerates site with feedback, re-sends for approval

PHASE 5: CLOSING (Semi-Automated)
  Business owner opens email → sees their own business with a new website
  ↓
  They click the demo link → sees a real, working site with their photos,
  their phone number, their address, their reviews
  ↓
  Email includes: "This is yours, free. I also set up an AI receptionist
  that answers your phone 24/7 so you never miss a call on a job site.
  $297/month, cancel anytime. Reply to get started."
  ↓
  Interested prospect replies → Lando hops on a 10-minute call or texts back
  ↓
  Lando sends GHL SaaS sign-up link (Stripe-powered, auto-creates account)

PHASE 6: ONBOARDING (Automated after Lando triggers it)
  Client pays via Stripe → GHL SaaS Mode auto-creates sub-account
  ↓
  GHL Snapshot loads: pre-built pipeline, workflows, Voice AI, calendars,
  review automation, missed-call text-back, reporting dashboard
  ↓
  Lando runs onboarding script:
    1. Points client's website domain to Netlify (or keeps .netlify.app)
    2. Configures GHL Voice AI with client's business name, services, hours
    3. Ports or forwards client's phone number to GHL number
    4. Tests: calls the number, verifies AI answers correctly
    5. Sends client a "Welcome" text with their dashboard login
  ↓
  Total onboarding time: 30-60 minutes per client

PHASE 7: RETENTION (Automated)
  GHL runs daily:
    - Voice AI answers calls, books appointments, sends confirmations
    - Missed-call text-back fires within 60 seconds
    - After job completion: automated review request via SMS
    - Monthly: reporting email to client showing calls, leads, reviews
  ↓
  Lando checks GHL agency dashboard once per week (15 minutes)
  Handles any support requests via text (typically 0-2 per client per month)
```

## What Lando Does vs What Is Automated

| Task | Who | Time |
|------|-----|------|
| Scraping new leads | AUTOMATED (scraper.js) | 0 min |
| Scoring websites | AUTOMATED (scorer.js + Claude Vision) | 0 min |
| Building demo websites | AUTOMATED (generator.js + Claude Code) | 0 min |
| Deploying to Netlify | AUTOMATED (deployer.js) | 0 min |
| Finding business emails | AUTOMATED (email-finder.js + Hunter API) | 0 min |
| Building outreach emails | AUTOMATED (emailbuilder.js) | 0 min |
| Reviewing/approving leads | **LANDO** (WhatsApp — YES/SKIP) | 30 sec/lead |
| Closing calls with prospects | **LANDO** (phone/text) | 10-15 min/prospect |
| Onboarding new clients | **LANDO** (GHL setup script) | 30-60 min/client |
| Answering client phones | AUTOMATED (GHL Voice AI) | 0 min |
| Missed-call text-back | AUTOMATED (GHL workflow) | 0 min |
| Review request automation | AUTOMATED (GHL workflow) | 0 min |
| Monthly reporting | AUTOMATED (GHL email) | 0 min |
| Weekly dashboard check | **LANDO** | 15 min/week |
| Client support | **LANDO** (text/email) | ~30 min/week total |

**Lando's weekly time commitment at 10 clients: ~2-3 hours.**

## Failure Points and Prevention

| Failure Point | Risk | Prevention |
|---------------|------|------------|
| Claude Code generates broken HTML | Website looks bad, loses credibility | agentQA.js already validates HTML structure; add visual QA via screenshot comparison |
| Email lands in spam | Prospect never sees the demo | Use custom domain email (not Gmail); warm up domain; keep emails short and personalized |
| Prospect calls back and nobody answers | Lost sale | Forward Lando's sales line through GHL Voice AI too — it handles inquiry calls |
| GHL Voice AI gives wrong info | Client gets angry, churns | Pre-test every Voice AI config with 5 test calls before going live; build per-vertical scripts |
| Client expects immediate results | Churns at month 2 | Set expectations in onboarding: "Results build over 30-60 days"; show weekly micro-wins in dashboard |
| Netlify deploys break | Sites go down | Use Netlify's atomic deploys (they're immutable); if Netlify has outage, sites cached at CDN |
| Lando gets overwhelmed at 15+ clients | Quality drops, churn spikes | Hire a part-time VA at $500/mo to handle onboarding and support at 15+ clients |

---

# PART 2: TECHNICAL ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                  LANDO'S iPAD                         │
│                                                       │
│   WhatsApp ← approver.js (YES/SKIP/CHANGE)           │
│   GHL Dashboard (weekly check)                        │
│   GitHub Codespaces (Claude Code)                     │
└──────────┬────────────────────────────────────────────┘
           │
┌──────────▼────────────────────────────────────────────┐
│             LOCAL-BIZ-PIPELINE (Node.js)               │
│                                                        │
│  scraper.js ──→ leads.csv                              │
│  email-finder.js ──→ adds email column                 │
│  screenshotter.js + scorer.js ──→ score column         │
│  generator.js ──→ sites/*.html + photos                │
│  deployer.js ──→ Netlify deploy → live_url             │
│  emailbuilder.js ──→ emails.csv                        │
│  approver.js ──→ WhatsApp → Lando → sender.js          │
│  pipeline.js ──→ orchestrates all of the above          │
│                                                        │
│  NEW: ghl-onboarder.js ──→ GHL API sub-account setup   │
│  NEW: ghl-config.js ──→ Voice AI + workflow config      │
│  NEW: client-manager.js ──→ client lifecycle tracking    │
└──────────┬────────────────────────────────────────────┘
           │
    ┌──────┴──────┐ ┌──────────────┐ ┌──────────────┐
    │  Netlify    │ │ GoHighLevel  │ │  Twilio      │
    │  (hosting)  │ │ (CRM/AI/SMS) │ │  (WhatsApp)  │
    └─────────────┘ └──────────────┘ └──────────────┘
```

## Current Repo File Structure (What Exists)

```
local-biz-pipeline/
├── .env                    # API keys (Google Places, Anthropic, Netlify, Twilio, Gmail, Hunter)
├── package.json            # Dependencies: anthropic, puppeteer, sharp, twilio, express, nodemailer
├── scraper.js              # Google Places text search → leads.csv (MAX_LEADS=20)
├── screenshotter.js        # Puppeteer screenshots → screenshots/ dir
├── generator.js            # Claude Sonnet → HTML websites with real photos/data
├── deployer.js             # Netlify API → deploy HTML to {name}.netlify.app
├── email-finder.js         # Scrapes websites + Hunter API → finds business emails
├── emailbuilder.js         # Claude generates personalized cold emails
├── approver.js             # Twilio WhatsApp → sends approval to Lando → waits for reply
├── sender.js               # Nodemailer Gmail → sends approved emails
├── pipeline.js             # Orchestrator: email → generate → deploy → email → approve
├── agentQA.js              # Claude-powered QA checker for generated sites
├── rebuild.js              # Regenerates a site with change requests
├── csv-utils.js            # CSV read/write utilities
├── leads.csv               # 175KB — all scraped leads (HVAC/plumbing in AZ)
├── emails.csv              # Generated outreach emails
├── pending-batch.json      # Current WhatsApp approval state
├── sites/                  # 30+ generated HTML sites with photos (~22MB)
├── screenshots/            # Mobile + desktop screenshots for scoring
└── prospectai/             # Separate sub-project with its own scraper, scorer, deployer
    ├── scraper.js          # Google Places scraper (prospectai version)
    ├── scorer.js           # Claude Vision website scorer (0-100 rubric)
    ├── generator.js        # Site generator (prospectai version)
    ├── deployer.js         # Netlify deployer (prospectai version)
    ├── approver.js         # WhatsApp approval flow (prospectai version)
    ├── proposer.js         # Generates business proposals
    ├── emailer.js          # Email sender
    ├── index.js            # Orchestrator
    ├── framer-injector.mjs # Framer integration experiment
    ├── prospects.csv       # Prospect data with pipeline_status tracking
    ├── approval-queue.json # Approval queue state
    ├── sites/              # Generated sites
    └── screenshots/        # Screenshots for scoring
```

## What Needs to Be Built (New Files)

### 1. `ghl-onboarder.js` — GHL Sub-Account Setup via API

**Purpose:** When a client pays through the GHL SaaS signup link, this script configures their sub-account.

**API calls needed:**
- `POST /locations` — Create sub-account with snapshot
- `PUT /locations/{locationId}` — Update business info (name, phone, address, timezone)
- `POST /locations/{locationId}/customFields` — Set custom field values (services, hours)

**Key config:**
```javascript
const GHL_API_KEY = process.env.GHL_API_KEY;       // Agency API key
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const SNAPSHOT_IDS = {
  hvac: 'snapshot_id_for_hvac_template',
  plumbing: 'snapshot_id_for_plumbing_template',
  dental: 'snapshot_id_for_dental_template',
  cleaning: 'snapshot_id_for_cleaning_template',
  landscaping: 'snapshot_id_for_landscaping_template',
  electrical: 'snapshot_id_for_electrical_template',
  general: 'snapshot_id_for_general_service_template'
};
```

### 2. `ghl-config.js` — Voice AI Configuration Per Client

**Purpose:** Configure the GHL Voice AI agent for each client's specific business.

**What it sets:**
- Agent name (e.g., "Sarah from Semper Fi Heating")
- Greeting ("Thanks for calling Semper Fi Heating and Cooling. How can I help you today?")
- Qualification questions per vertical:
  - HVAC: "Is this for heating, cooling, or both? Is this an emergency? What's the make and model of your unit?"
  - Plumbing: "Is this an emergency? What type of issue — leak, clog, water heater, or something else?"
  - Dental: "Is this for a routine cleaning, an emergency, or a new patient appointment?"
- Booking calendar connection
- Transfer rules (when to escalate to human)
- Business hours and after-hours handling

### 3. `clients.json` — Client Registry

**Purpose:** Track all active clients, their GHL sub-account IDs, Netlify site IDs, and subscription status.

```json
[
  {
    "business_name": "Semper Fi Heating and Cooling",
    "ghl_location_id": "loc_abc123",
    "netlify_site_id": "site_xyz789",
    "netlify_url": "https://semper-fi-heating-and-cooling.netlify.app",
    "tier": "growth",
    "monthly_rate": 497,
    "onboarded_at": "2026-04-15T00:00:00Z",
    "vertical": "hvac",
    "phone": "(480) 555-1234",
    "owner_email": "john@semperfihvac.com",
    "status": "active"
  }
]
```

### 4. `client-manager.js` — Client Lifecycle Operations

**Purpose:** Commands Lando can run via Claude Code:
- `node client-manager.js onboard "Semper Fi Heating" hvac` — runs full onboarding
- `node client-manager.js status` — shows all clients, MRR, churn risk
- `node client-manager.js report "Semper Fi Heating"` — generates monthly report
- `node client-manager.js offboard "Business Name"` — clean teardown

### 5. Updated `.env` additions

```bash
# GoHighLevel
GHL_API_KEY=your_agency_api_key_here
GHL_AGENCY_ID=your_agency_id_here

# Stripe (for SaaS Mode — configured in GHL)
STRIPE_SECRET_KEY=sk_live_...
```

## API Integrations Map

| API | Used By | Purpose | Cost |
|-----|---------|---------|------|
| Google Places API | scraper.js | Find local businesses | ~$17/1000 requests |
| Anthropic Claude API | generator.js, scorer.js, emailbuilder.js, agentQA.js | Generate sites, score sites, write emails, QA | Included in $200/mo Max |
| Netlify API | deployer.js | Deploy static sites | Free tier (100 sites) |
| Hunter.io API | email-finder.js | Find business owner emails | Free 25/mo, $49/mo for 500 |
| Twilio WhatsApp API | approver.js | Send/receive approval messages | ~$0.005/msg |
| Gmail SMTP | sender.js | Send outreach emails | Free (limit 500/day) |
| GoHighLevel API | ghl-onboarder.js, ghl-config.js | Create sub-accounts, configure Voice AI | Included in $497/mo |
| Stripe API | Via GHL SaaS Mode | Process client payments | 2.9% + $0.30 per charge |

## Website Delivery Flow

```
1. generator.js receives lead data (name, address, phone, rating, photos, category)
2. Claude Sonnet generates a complete single-page HTML website:
   - Hero with business name, phone, CTA
   - Services section tailored to vertical (HVAC: AC repair, furnace, duct cleaning)
   - About section using Google Reviews data
   - Photo gallery from Google Places photos (downloaded locally)
   - Contact form / click-to-call button
   - Footer with address, hours, license info
   - Mobile-responsive, modern design
   - All assets inlined (no external dependencies)
3. agentQA.js validates HTML structure
4. deployer.js pushes to Netlify via Deploy API
5. Site is live at https://{business-slug}.netlify.app within 30 seconds
6. After client signs up: point their custom domain via Netlify DNS settings
```

## CLAUDE.md for the Operation

This file should live at the project root and instruct Claude Code on how to operate:

```markdown
# CLAUDE.md — Aurigen Pipeline Operations

## What This Project Does
Automated lead generation and client delivery system for a local business
AI agency. Scrapes Google Maps for HVAC/plumbing/dental businesses in
Phoenix metro AZ, builds them free demo websites, and converts them into
$297-$497/month recurring clients on GoHighLevel.

## Architecture
- scraper.js: Google Places API → leads.csv
- generator.js: Claude → HTML websites in sites/
- deployer.js: Netlify API → live URLs
- pipeline.js: orchestrates the full flow
- approver.js: WhatsApp approval via Twilio
- sender.js: sends outreach emails via Gmail

## Commands
- `node scraper.js` — scrape new leads (20 at a time)
- `node pipeline.js` — run full pipeline on new leads
- `node approver.js` — start WhatsApp approval server
- `node sender.js` — send approved emails
- `node client-manager.js onboard "Name" vertical` — onboard new client
- `node client-manager.js status` — show all client status + MRR

## Rules
- NEVER modify .env or expose API keys
- NEVER send emails without Lando's WhatsApp approval
- NEVER delete leads.csv or emails.csv — always append
- Generated HTML must be complete (doctype through </html>)
- All photos must be downloaded locally, not hotlinked
- Netlify site names must be slugified business names
- One lead at a time through WhatsApp approval
```

---

# PART 3: CLIENT ACQUISITION SYSTEM

## How Lando Finds Businesses (Automated)

**scraper.js** already does this. Current queries target:
- "HVAC repair Mesa AZ"
- "plumber Scottsdale AZ"
- "air conditioning Gilbert AZ"
- Similar queries for Chandler, Tempe, Phoenix

**Enhancement needed:** Add queries for dental, cleaning, landscaping, electrical:
```javascript
const QUERIES = [
  // HVAC
  'HVAC repair Mesa AZ', 'air conditioning Scottsdale AZ',
  'heating and cooling Gilbert AZ', 'AC repair Chandler AZ',
  // Plumbing
  'plumber Mesa AZ', 'plumbing repair Scottsdale AZ',
  'emergency plumber Gilbert AZ',
  // Dental
  'dentist Mesa AZ', 'dental office Scottsdale AZ',
  'family dentist Gilbert AZ',
  // Cleaning
  'house cleaning Mesa AZ', 'cleaning service Scottsdale AZ',
  // Landscaping
  'landscaping Mesa AZ', 'lawn care Scottsdale AZ',
  // Electrical
  'electrician Mesa AZ', 'electrical contractor Scottsdale AZ'
];
```

## What Triggers a WhatsApp Notification

After pipeline.js runs for a lead, **approver.js** sends a WhatsApp message:

```
🏠 NEW LEAD: Semper Fi Heating and Cooling
📍 Mesa, AZ | ⭐ 4.2 (87 reviews)
📊 Site Score: 34/100 (critical)
🌐 Demo: https://semper-fi-heating-and-cooling.netlify.app
📧 Email: john@semperfihvac.com

Reply:
  YES → send email
  SKIP → pass
  Or type changes: "make the hero blue"
```

## What Lando Approves or Skips

Lando looks at:
1. **Is this a real business?** (Not a franchise HQ or closed location)
2. **Does the demo site look good?** (Quick glance — 5 seconds)
3. **Is the email correct?** (Not info@ or noreply@)

Decision takes 15-30 seconds. Lando replies YES, SKIP, or types a change request.

## What Happens After YES

1. **sender.js** sends the cold email from Lando's Gmail
2. Email includes:
   - Subject line personalized to the business (from emailbuilder.js)
   - Demo site link
   - Simple pitch: "I built this for you — it's free. I also offer AI phone answering. $297/mo."
   - No attachments, no spam triggers
3. Lead status updated to "sent" in leads.csv + emails.csv
4. If prospect replies → notification comes to Lando's Gmail on iPad
5. Lando responds via text or a quick phone call

## How the Client Signs Up and Pays

1. Lando sends a **GHL SaaS signup link** (Stripe checkout page branded under Lando's white-label)
2. Client enters credit card → Stripe charges $297 or $497
3. GHL SaaS Mode **automatically creates a sub-account** loaded with the correct vertical Snapshot
4. Lando receives notification of new signup
5. Lando runs onboarding (30-60 min)

## Onboarding Sequence (Lando's Checklist)

```
□ 1. Verify GHL sub-account was created correctly
□ 2. Update business info in GHL (name, phone, address, hours, services)
□ 3. Configure Voice AI agent:
     - Set greeting with business name
     - Set qualification questions for their vertical
     - Connect to booking calendar
     - Set business hours and after-hours message
□ 4. Set up phone number:
     - Option A: Forward client's existing number to GHL number
     - Option B: Get new GHL number and update their Google listing
□ 5. Test Voice AI: Call the number 3 times with different scenarios
□ 6. Configure missed-call text-back workflow
□ 7. Configure review request automation
□ 8. Point website to custom domain (if client has one) or keep .netlify.app
□ 9. Send welcome text to client:
     "Welcome to [Brand]! Your AI receptionist is live.
      Here's your dashboard login: [link]
      Your AI answers calls 24/7. Text me anytime with questions."
□ 10. Add client to clients.json
```

---

# PART 4: GOHIGHLEVEL SETUP

## GHL Features to Activate Per Client

| Feature | Config | Vertical Variation |
|---------|--------|--------------------|
| **Voice AI Agent** | Custom greeting, qualification script, booking calendar | HVAC: emergency detection, service type. Dental: new vs existing patient. Plumbing: emergency triage |
| **Missed-Call Text-Back** | Fires within 60 seconds: "Hi, this is {business}. We missed your call — how can we help?" | Same across verticals, personalized with business name |
| **Appointment Booking** | GHL calendar connected to Voice AI; sends confirmation SMS + email | HVAC: 2-hour service windows. Dental: 30-min slots. Plumbing: same-day emergency + scheduled |
| **Review Automation** | After job completion, trigger SMS: "Thanks for choosing {business}! Would you leave us a review? {google_review_link}" | Same across verticals |
| **Pipeline** | New Lead → Contacted → Appointment Set → Job Complete → Review Requested | Same structure, vertical-specific stage names |
| **Reporting Dashboard** | Monthly email: calls answered, leads captured, appointments booked, reviews collected | Same across verticals |
| **Web Chat Widget** | Optional: embed on client's website for text-based inquiries | Same across verticals |

## Voice AI Script Templates

### HVAC Voice AI Script
```
GREETING: "Thanks for calling {business_name}, this is Sarah, your virtual 
assistant. How can I help you today?"

QUALIFICATION:
1. "Are you calling about heating, cooling, or plumbing service?"
2. "Is this an emergency, or would you like to schedule a visit?"
3. "Can I get your name and a good callback number?"
4. "What's the address where you need service?"

IF EMERGENCY: "I'm going to get a technician to call you back within 
15 minutes. Can you confirm your phone number?"
→ Send urgent notification to client's phone

IF SCHEDULING: "I have availability {next_available}. Would that work 
for you?"
→ Book on GHL calendar → Send confirmation SMS

IF GENERAL QUESTION: Answer from knowledge base (services, hours, 
service area, pricing ranges)

TRANSFER RULES: Transfer to human if caller requests it 3+ times, 
or if the issue involves a gas leak, flooding, or safety concern.
```

### Dental Voice AI Script
```
GREETING: "Thank you for calling {business_name}. This is Sarah. 
Are you an existing patient or would you like to schedule your first visit?"

IF NEW PATIENT: "Welcome! I'd love to help you get started. Can I get 
your name, phone number, and whether you have dental insurance?"
→ Book new patient appointment (60-min slot)

IF EXISTING PATIENT: "Welcome back! Are you calling to schedule a 
cleaning, follow up on a procedure, or something else?"
→ Route based on need

IF EMERGENCY: "I'm sorry to hear that. Let me check for our next 
available emergency slot. Can you describe what's happening?"
→ Book emergency slot or escalate to office manager
```

## Snapshot (Template) Structure — Deploys in Under 1 Hour

Each vertical gets one Snapshot containing:

```
SNAPSHOT: HVAC Service Business
├── Pipeline: "Customer Journey"
│   ├── Stage: New Lead
│   ├── Stage: Contacted
│   ├── Stage: Appointment Scheduled
│   ├── Stage: Job Completed
│   └── Stage: Review Requested
│
├── Workflows:
│   ├── "Missed Call Text-Back" (trigger: missed call → SMS in 60 sec)
│   ├── "New Lead Notification" (trigger: new contact → SMS to owner)
│   ├── "Appointment Confirmation" (trigger: appointment booked → SMS + email)
│   ├── "Appointment Reminder" (trigger: 24hr before → SMS)
│   ├── "Review Request" (trigger: moved to Job Completed → wait 2hr → SMS)
│   └── "Monthly Report" (trigger: 1st of month → email summary to owner)
│
├── Voice AI Agent: "HVAC Receptionist" (pre-configured script)
│
├── Calendar: "Service Calendar" (2-hour blocks, M-F 8am-5pm)
│
├── Custom Fields:
│   ├── Service Type (dropdown: AC Repair, Heating, Plumbing, Maintenance)
│   ├── Emergency (yes/no)
│   ├── Equipment Make/Model (text)
│   └── Service Address (text)
│
├── Tags: new-lead, appointment-set, job-complete, review-sent, review-received
│
└── Reporting: Monthly email template with merge fields
```

**Deployment process:**
1. Create sub-account via API with snapshot_id
2. API loads all workflows, pipelines, calendars, custom fields
3. Lando manually updates: business name, phone, hours, Voice AI greeting
4. Total time: 30-60 minutes including testing

## SaaS Mode Client Billing

```
GHL SaaS Configurator Setup:
├── Plan: "Starter" — $297/month via Stripe
│   └── Includes: CRM, Pipeline, Voice AI, Missed-Call Text-Back, 
│       Review Automation, Reporting, 500 SMS/mo, 100 AI call minutes/mo
│
├── Plan: "Growth" — $497/month via Stripe
│   └── Includes: Everything in Starter + 1500 SMS/mo, 300 AI call 
│       minutes/mo, Web Chat Widget, Priority Support
│
├── Plan: "Pro" — $797/month via Stripe
│   └── Includes: Everything in Growth + Unlimited SMS, Unlimited AI 
│       call minutes, Multi-location support, Dedicated onboarding call
│
├── Rebilling: 20% markup on overages
│   └── SMS overage: $0.015/msg (Lando pays $0.0125, keeps $0.0025)
│   └── AI minutes overage: $0.12/min (Lando pays $0.10, keeps $0.02)
│
└── Stripe handles all billing, invoicing, failed payments, cancellations
```

## Client Dashboard

What the client sees when they log into their white-labeled GHL portal:
- **Overview:** Calls answered today, leads this week, appointments scheduled, reviews collected
- **Contacts:** All their leads with conversation history
- **Calendar:** Upcoming appointments
- **Reviews:** Review requests sent, reviews received, Google rating trend
- **Reports:** Monthly PDF with key metrics
- **Settings:** Business hours, team member access (optional)

---

# PART 5: THE 90-DAY PLAN

## WEEK 1-2: BUILD THE MACHINE

### Day 1-2: GHL Setup
- [ ] Sign up for GoHighLevel Agency Pro ($497/mo) at gohighlevel.com
- [ ] Connect Stripe account to GHL for SaaS billing
- [ ] Set up white-label branding (Lando's logo, colors, custom domain)
- [ ] Create first Snapshot: "HVAC Service Business"
  - Build pipeline, workflows, Voice AI script, calendars
  - Test every workflow trigger end-to-end

### Day 3-4: GHL Voice AI Configuration
- [ ] Create HVAC Voice AI agent in GHL Agent Studio
- [ ] Write and test the qualification script
- [ ] Connect to booking calendar
- [ ] Test with 10 real phone calls (different scenarios)
- [ ] Create Dental Voice AI agent (same process)
- [ ] Create Plumbing Voice AI agent (same process)

### Day 5-7: Connect Pipeline to GHL
- [ ] Add GHL_API_KEY to .env
- [ ] Build ghl-onboarder.js (sub-account creation via API)
- [ ] Build ghl-config.js (Voice AI configuration per client)
- [ ] Build client-manager.js (lifecycle tracking)
- [ ] Add clients.json structure
- [ ] Test: create test sub-account, load snapshot, verify everything works

### Day 8-10: Sales Infrastructure
- [ ] Set up GHL SaaS signup page with Stripe checkout
- [ ] Create 3 pricing plans (Starter $297, Growth $497, Pro $797)
- [ ] Build a simple sales page (can be a GHL funnel or a Claude Code site)
- [ ] Write email templates for different response scenarios
- [ ] Create an onboarding checklist document
- [ ] Set up a dedicated business email (not Gmail — use custom domain)

### Day 11-14: Pipeline Optimization
- [ ] Run scraper.js for all target verticals (HVAC, plumbing, dental, cleaning, landscaping, electrical)
- [ ] Run scorer.js on all leads to identify worst websites (score ≤ 40)
- [ ] Generate demo sites for top 20 lowest-scoring businesses
- [ ] Deploy all 20 demo sites to Netlify
- [ ] Generate outreach emails for all 20
- [ ] QA every site on mobile and desktop

**Week 1-2 Output:** Complete system operational. 20 demo sites ready. GHL configured with 3 vertical Snapshots. SaaS billing live.

## WEEK 3-4: FIRST CLIENTS

### Day 15-17: Launch Outreach
- [ ] Review all 20 leads via WhatsApp approval (YES/SKIP)
- [ ] Send first batch of 10-15 cold emails
- [ ] Monitor for replies (check Gmail 3x/day)
- [ ] Follow up on any opens/clicks within 24 hours

### Day 18-21: Follow Up + Second Batch
- [ ] Send follow-up email to non-responders (Day 3 after first email)
- [ ] Generate 20 more demo sites for next batch
- [ ] Send second batch of cold emails
- [ ] Call any warm leads who opened/clicked but didn't reply
- [ ] **Target: 2-3 sales conversations by end of week 3**

### Day 22-28: Close First Clients
- [ ] Close first client → run full onboarding
- [ ] Document every step of onboarding (for efficiency next time)
- [ ] Close second client → onboard faster this time
- [ ] Generate 20 more demo sites (keep the pipeline flowing)
- [ ] Start third batch of outreach
- [ ] **Target: 2-3 paying clients by end of week 4**

**Week 3-4 Output:** 2-3 paying clients. $594-$1,491/mo revenue. Onboarding process refined.

## MONTH 2: SCALE TO 5 CLIENTS

### Week 5-6: Increase Volume
- [ ] Send 20 cold emails per week (with WhatsApp approval)
- [ ] Expand to new zip codes: Tempe, Chandler, Phoenix, Surprise, Peoria
- [ ] Add new verticals: electrical, landscaping
- [ ] Follow up with all warm leads from month 1
- [ ] Refine email copy based on response rates
- [ ] **Target: 2 more clients (total 4-5)**

### Week 7-8: Optimize Retention
- [ ] Check all client dashboards — are calls being answered? Reviews coming in?
- [ ] Send each client a personal "first month results" text message
- [ ] Fix any Voice AI issues that surfaced in real calls
- [ ] Create a "case study" from first client's results (calls answered, reviews collected)
- [ ] Use case study in future outreach emails
- [ ] **Target: 0 churn, 5 total clients**

**Month 2 Output:** 5 paying clients. $1,485-$2,485/mo revenue. System running smoothly.

## MONTH 3: SCALE TO 10+ CLIENTS

### Week 9-10: Accelerate Acquisition
- [ ] Increase to 30 cold emails per week
- [ ] Expand to Tucson, Flagstaff, or other AZ metros
- [ ] Test a new acquisition channel: cold text via GHL (higher response rate than email)
- [ ] Test a third channel: Facebook group posts in local business owner groups
- [ ] Hire referral: offer existing clients $100 credit for each referral that signs up
- [ ] **Target: 3 more clients**

### Week 11-12: Systems + Preparation for Scale
- [ ] Automate monthly reporting (GHL workflow sends automatically)
- [ ] Build a client onboarding video (screen record once, send to all new clients)
- [ ] Document all processes in a runbook
- [ ] Evaluate: do I need a VA? (If support tickets > 5/week, hire at $500/mo)
- [ ] **Target: 2 more clients (total 10)**

**Month 3 Output:** 10 paying clients. $2,970-$4,970/mo revenue. Business is profitable.

## Lando's Daily Actions (15-30 Minutes)

| Time | Action | Tool |
|------|--------|------|
| Morning | Check WhatsApp for pending approvals (YES/SKIP) | iPad WhatsApp |
| Morning | Check Gmail for prospect replies | iPad Gmail |
| Midday | Reply to any warm leads (text or call) | iPad Phone/Text |
| Evening | Check GHL dashboard for client issues | iPad Browser |
| Weekly | Review all client metrics, flag any churn risks | iPad Browser |
| As needed | Onboard new clients (30-60 min each) | GitHub Codespaces + GHL |

---

# PART 6: RISK FLAGS

## Top 5 Things Most Likely to Break or Block This

### Risk 1: Cold Email Deliverability
**What breaks:** Gmail sends go to spam. Prospects never see the demo.
**Prevention:**
- Buy a custom domain (e.g., aurigen.io) and set up Google Workspace ($6/mo)
- Warm up the domain for 2 weeks before sending outreach (use Instantly or Warmbox)
- Keep emails under 150 words, no images, no attachments
- Personalize every email with business name + specific website feedback
- Send max 15/day from one account to avoid spam filters
**If it happens anyway:** Switch to cold text via GHL (SMS has 98% open rate vs 20% for email)

### Risk 2: Voice AI Quality on Real Calls
**What breaks:** AI gives wrong info, sounds robotic, frustrates callers, client gets angry and churns.
**Prevention:**
- Test every Voice AI config with 5+ test calls before going live
- Use GHL's call recording — review first 10 real calls per client
- Build a "knowledge base" document for each client (services, pricing, hours, FAQ) and upload to Voice AI
- Set conservative transfer rules: escalate to human after 2 failed understanding attempts
**If it happens anyway:** Immediately review the call recording, adjust the script, apologize to client, credit one month

### Risk 3: Client Churn at Month 2-3
**What breaks:** Client doesn't see immediate ROI, cancels subscription.
**Prevention:**
- Set expectations at signup: "You'll see results building over 30-60 days"
- Send weekly win texts: "Your AI answered 12 calls this week. 3 new appointments booked."
- Month 1 report should highlight every micro-win (calls answered, texts sent, reviews collected)
- Offer a 15-minute "strategy call" at day 30 to review results and plan next steps
- Never let a client go silent — if dashboard shows low activity, reach out proactively
**If it happens anyway:** Ask why. Common reasons: not enough call volume (→ help with Google listing optimization), AI giving wrong info (→ fix the script), financial pressure (→ offer to downgrade to Starter tier instead of canceling)

### Risk 4: GHL Platform Outage
**What breaks:** Voice AI goes down, missed-call text-back stops, clients can't access dashboard.
**Prevention:**
- GHL has 99.9% uptime SLA but outages happen. Monitor status.gohighlevel.com
- Have a backup plan: set up a Twilio forwarding number that routes to client's personal cell during outages
- Communicate proactively: "We're aware of a brief service interruption. Calls are being forwarded to you directly."
**If it happens anyway:** The website on Netlify is separate infrastructure — it stays up. Send text to affected clients, credit account if outage > 4 hours

### Risk 5: Lando Gets Overwhelmed
**What breaks:** At 15+ clients, support requests, onboarding, and outreach exceed Lando's capacity. Quality drops.
**Prevention:**
- Automate everything possible BEFORE scaling (reporting, review requests, missed-call text-back)
- Build an onboarding video so clients can self-serve the basics
- Create FAQ document that handles 80% of support questions
- At 15 clients: hire a part-time VA ($500/mo) for onboarding and tier-1 support
- At 25 clients: hire a second VA or promote first VA to account manager
**Trigger to hire:** If Lando spends more than 1 hour/day on client support for 2 consecutive weeks

---

# PART 7: THE NUMBERS

## Monthly Cost Breakdown

| Cost | Amount | Notes |
|------|--------|-------|
| GoHighLevel Agency Pro | $497/mo | Includes SaaS Mode, white label, unlimited sub-accounts |
| Claude Max | $200/mo | Powers site generation, scoring, email writing |
| Netlify | $0-$19/mo | Free tier handles 100 sites; Pro $19/mo for custom domains |
| Twilio (WhatsApp) | ~$15/mo | Approval messages to Lando |
| Hunter.io | $49/mo | 500 email lookups/month |
| Google Workspace (custom email) | $6/mo | Professional outreach domain |
| Google Places API | ~$20/mo | Lead scraping (~1,000 requests/mo) |
| Domain name | ~$1/mo | amortized annual cost |
| **Total Fixed Costs** | **~$788/mo** | |

## Revenue Scenarios

### At 5 Clients
| Metric | Starter ($297) | Growth ($497) | Mix (3×$297 + 2×$497) |
|--------|----------------|---------------|------------------------|
| Monthly Revenue | $1,485 | $2,485 | $1,885 |
| Fixed Costs | $788 | $788 | $788 |
| GHL Usage (~$30/client) | $150 | $150 | $150 |
| **Net Profit** | **$547** | **$1,547** | **$947** |

### At 10 Clients
| Metric | Starter ($297) | Growth ($497) | Mix (5×$297 + 5×$497) |
|--------|----------------|---------------|------------------------|
| Monthly Revenue | $2,970 | $4,970 | $3,970 |
| Fixed Costs | $788 | $788 | $788 |
| GHL Usage (~$30/client) | $300 | $300 | $300 |
| **Net Profit** | **$1,882** | **$3,882** | **$2,882** |

### At 20 Clients
| Metric | Starter ($297) | Growth ($497) | Mix (10×$297 + 10×$497) |
|--------|----------------|---------------|--------------------------|
| Monthly Revenue | $5,940 | $9,940 | $7,940 |
| Fixed Costs | $788 | $788 | $788 |
| GHL Usage (~$30/client) | $600 | $600 | $600 |
| VA (part-time) | $500 | $500 | $500 |
| **Net Profit** | **$4,052** | **$8,052** | **$6,052** |

### At 50 Clients
| Metric | Mix (25×$297 + 25×$497) |
|--------|--------------------------|
| Monthly Revenue | $19,850 |
| Fixed Costs | $788 |
| GHL Usage (~$30/client) | $1,500 |
| VA (2× part-time) | $1,000 |
| **Net Profit** | **$16,562** |

## Milestone Timeline

| Milestone | Target Date | Clients | Net Monthly |
|-----------|-------------|---------|-------------|
| Break even | Week 4 (May 10) | 3 | ~$100/mo |
| $1,000/mo net | Week 6 (May 24) | 5 | ~$947/mo |
| $3,000/mo net | Month 3 (July) | 10 | ~$2,882/mo |
| $5,000/mo net | Month 5 (Sept) | 15 | ~$4,467/mo |
| $10,000/mo net | Month 8 (Dec) | 25 | ~$9,232/mo |
| $20,000/mo net | Month 14 (June 2027) | 50 | ~$16,562/mo |

## Key Metric: Client Acquisition Cost

| Channel | Cost per Lead | Conversion Rate | Cost per Client |
|---------|---------------|-----------------|-----------------|
| Cold email (pipeline) | ~$0.50 (API + hosting) | 2-5% reply, 10-20% close | $25-$250 |
| Cold text (GHL) | ~$0.10 (SMS cost) | 5-10% reply, 10-20% close | $5-$100 |
| Referral | $100 credit | 30-50% close | $200-$333 |
| Facebook groups | $0 | 1-3% reply, 10-20% close | $0 (time only) |

**The pipeline's unfair advantage:** The cost to generate a personalized demo website + cold email is under $1. No human agency can produce a bespoke demo site for a prospect at this cost.

---

# PART 8: WHAT MAKES THIS DEFENSIBLE

## Why Can't a Competitor Copy This in a Month

They can copy the *idea*. They cannot copy:

1. **The scored lead database.** Lando has already scraped, scored, and categorized every HVAC, plumbing, and dental business in Mesa, Scottsdale, and Gilbert AZ. That's 175KB of leads.csv with website scores, emails, photos, and ratings. A competitor starts from zero.

2. **The generated demo sites.** There are already 30+ custom-built HTML websites in the sites/ directory, each with real business photos, real addresses, real phone numbers. Each one took Claude ~2 minutes to generate. The portfolio compounds — every generated site is a sales tool forever.

3. **The operational muscle memory.** By month 3, Lando has refined: which email subject lines get replies, which Voice AI scripts work for HVAC vs dental, which businesses are most likely to buy, which onboarding steps can be skipped. This operational knowledge doesn't transfer.

4. **The client lock-in.** Once a client is on GHL with Voice AI answering their phone, their number forwarded, their reviews automated, and their website live — switching costs are enormous. They'd have to change their phone number, rebuild their website, and find a new CRM. Churn is structurally low.

## What Moat Does Lando Build Over Time

- **Month 3:** 10 clients × 10 reviews collected each = 100 reviews attributed to Lando's system. That's 100 proof points for case studies
- **Month 6:** First "anchor client" who's been around 6 months — their Google ranking improved, their review count doubled, they can testify on video
- **Month 9:** Data on which industries churn least (likely HVAC — high call volume, clear ROI), which Voice AI scripts have the highest booking rate, which email subject lines convert best
- **Month 12:** A 50-client agency with $16K+/mo net income, a VA team, and a flywheel that self-reinforces: more clients → more data → better AI → less churn → more referrals

## What Data Advantage Accumulates

Every client generates:
- Call recordings (what questions real customers ask → improves Voice AI scripts)
- Review text (what customers praise → improves website copy generation)
- Booking patterns (when customers book → optimizes calendar availability)
- Churn signals (which metrics predict cancellation → enables proactive retention)

By month 12, Lando knows more about what makes HVAC/plumbing/dental customers call, book, and leave reviews than any traditional agency in Arizona. That data advantage compounds.

## Lando's Unfair Advantage Right Now

1. **He already built the pipeline.** scraper.js, generator.js, deployer.js, approver.js — they work TODAY. Most people who want to do this are still watching YouTube tutorials
2. **He already has the leads.** 175KB of leads.csv. Scored. With emails. With photos. Ready to generate demo sites
3. **He already has demo sites.** 30+ live websites for real AZ businesses sitting on Netlify right now
4. **He operates from an iPad.** His cost structure is nearly zero — no office, no employees, no equipment. A competitor running this from a traditional setup has 10x the overhead
5. **He has Claude Code.** The combination of Claude Max + GitHub Codespaces + GoHighLevel SaaS Mode creates a one-person agency that outproduces a 5-person traditional agency at 1/10th the cost

**The bottom line:** Lando doesn't compete with agencies. He competes with the $0 alternative — the business owner who currently answers their own phone (and misses half the calls). That's the real competition. And that competition loses every time.

---

*Blueprint compiled April 12, 2026. Execute Week 1 now.*
