# Brewington Digital Website Design Spec
**Date:** 2026-04-14
**Concept:** "The Signal"
**Deliverable:** Single `brewington-index.html` file, mobile-first, deploy-ready

## Rules
- Never use the word "AI" anywhere visible to the visitor
- Never use em dashes in any copy
- CTAs: `sms:602-609-4756` and `mailto:digitalbrewington@gmail.com`
- No phone call CTAs

## Visual System

| Element | Decision |
|---------|----------|
| Palette | Base `#06060a`, accent `#00e5ff` (electric cyan), text `#f2f0ed`, muted `rgba(255,255,255,0.4)`, border `rgba(255,255,255,0.06)` |
| Typography | `Syne` 800 for display, `DM Sans` 300/400 for body, `JetBrains Mono` 400 for data callouts |
| Motion | CSS-only scroll reveals via IntersectionObserver, cursor-tracking radial glow on desktop, film grain overlay |
| Layout | Full-bleed sections, asymmetric grids, oversized section numbers ("01"-"06"), no max-width until text content |
| Mobile | Mobile-first, single column, sticky CTA bar at bottom, 48px min touch targets |

## Page Sections (Scroll Sequence)

### S0: Hero (The Hook)
- Full viewport, film grain overlay, radial glow top-right
- H1: "Your Phone Rings. Nobody Answers. You Just Lost $500."
- Subtext: What Brewington does in one line (no jargon)
- Two CTAs: "Text Us Now" (sms:) + "Send an Email" (mailto:)
- Pulsing scroll indicator

### S1: The Problem ("01")
- Three stat cards: missed calls/week, revenue lost per missed call, business failure rate
- Short copy about the cost of not answering

### S2: The System ("02")
- Six feature cards (2x3 grid, stacked mobile):
  1. Smart Phone Answering
  2. Missed Call Text-Back
  3. Automated Appointment Booking
  4. Professional Website
  5. Automated Review Requests
  6. Monthly Performance Reports
- CSS-drawn icons, title, one-line description per card

### S3: Who This Is For ("03")
- Industry tags: HVAC, Plumbing, Electrical, Dental, Cleaning, Landscaping
- Paragraph targeting Mesa, Scottsdale, Gilbert business owners

### S4: Pricing ("04")
- Two cards: $297/mo Starter vs $497/mo Growth
- Feature checklists, no fake urgency
- CTA under each card

### S5: Objection Handling ("05")
- Accordion FAQ styled as conversation
- Skeptic-voice questions with honest answers
- Topics: trust, cancellation, ownership, timeline

### S6: Final CTA + Footer
- Full-bleed, glow effect returns
- "Stop Losing Customers to Your Voicemail."
- Text + Email buttons
- Footer: Brewington Digital, cities, copyright

## SEO
- Title: "Brewington Digital | Smart Automation for Local Businesses in Mesa, Scottsdale & Gilbert AZ"
- Meta targeting "local business automation Mesa AZ"
- LocalBusiness schema with areaServed for Mesa, Scottsdale, Gilbert
- H1 hero, H2 per section, semantic HTML
- City names appear naturally 2+ times in body

## Technical
- Single HTML, zero dependencies except Google Fonts CDN
- CSS custom properties for theming
- IntersectionObserver for scroll animations (~30 lines JS)
- Cursor-tracking glow (~15 lines JS)
- Film grain via CSS pseudo-element
- No images, no external assets
