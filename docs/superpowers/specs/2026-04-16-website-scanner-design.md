# Real-Time Website Scanner - Design Spec

## Overview
Visitors enter their URL on landing. A Netlify Function crawls their site + runs PageSpeed Insights (free). Real results display in the hero terminal. Honest scores. If their site is good, we tell them.

## Architecture
- Frontend: Scan input states layered inside existing Hero section
- Backend: Netlify Function (`netlify/functions/scan.js`)
- Data: Direct crawl (fetch + parse) + PageSpeed Insights API (free, no key)
- Google Places API available but not required to ship

## Hero Flow (4 States)
1. **Input** - "How much is your website losing you?" + URL input + Scan Now + Skip link
2. **Scanning** - Terminal runs `$ brewington --scan theirsite.com`, real results line by line
3. **Results** - Left: problem count + email input + text CTA. Right: report card with real scores
4. **Hero reveal** - Scan fades, original GOLD hero content appears. Auto-skip after 8s on state 1.

## Honesty Engine
- All scores from real API data
- Good site = green bars, encouraging language
- Don't need us = we say so
- Revenue leak only from actual gaps
- No fake numbers

## Lead Capture
- URL stored on scan submit
- Email captured on results CTA
- Console log for now, GHL integration Phase 2

## Files
- `index.html` - scan states in hero
- `css/hero.css` - scan styles, transitions
- `js/main.js` - scan logic, API call, state machine
- `netlify/functions/scan.js` - serverless crawl function
- `netlify.toml` - Netlify config

## Rules
- No em dashes in any visible copy
- No fake or guessed numbers
- No brightness flash on load
- Respect prefers-reduced-motion
