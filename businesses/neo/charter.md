# neo Charter

*Version: 0.1. Last updated: 2026-04-18.*

## Mission
NEO auto-labels every reply to ECHO's outbound as hot/warm/cold/decline, identifies which subject-line and opening-line angles convert best per trade (HVAC vs plumbing vs electrical vs roofing), and pushes a ranked "use these angles next" config into ECHO weekly, so ECHO's reply-to-meeting rate climbs from a baseline 2% toward 3–4% over 90 days.

## Product
- **Internal: `angle-config.json` + `angle-performance.md`** — ECHO reads on each campaign-planning tick.
- **External: "Local Service Cold Email Angle Kit"** — $49–$99 Gumroad listing once 500+ labeled replies are accumulated.

## Distribution
- ECHO reads `angle-config.json` directly on each outbound tick.
- Gumroad pack promoted via Brewington Digital creator page.

## Authority (can do without asking)
- Read ECHO's reply log for the previous 7 days
- Embed each reply locally via Transformers.js + Xenova/all-MiniLM-L6-v2 (384-dim)
- Auto-label using regex + keyword rules (unsubscribe, OOO, explicit interest, explicit decline)
- Call Claude Sonnet for the ~10% ambiguous replies (hard cap $5/mo in state)
- Retrain the logistic regression classifier incrementally
- Compute per-trade angle performance and write `angle-performance.md` + `angle-config.json`
- Push the angle-config into ECHO's next campaign

## Out of scope (must escalate)
- Any Claude spend over $5/month
- Generating outbound copy (REX's job)
- Identifying or picking prospects (ECHO's job)
- Making send decisions (ECHO's job; NEO only scores)

## Budget (rolling 30-day)
- Infrastructure: $0
- Claude API: $5/mo hard cap (stored in state.json.claude_spend_cap_mo)
- Advertising: $0

## Revenue targets
- Month 1: $297 attributed (1 additional ECHO Starter close via angle lift)
- Month 3: $1,136 attributed + direct ($891 attributed + $245 Gumroad pack)
- Steady state: $1,500+ attributed

## Tools available
- `../foreman/candidates/cockpit-round/neo-pitch.md` — reference pitch
- `@huggingface/transformers` (Apache-2.0, already installed)
- `ml-logistic-regression` (MIT, already installed)
- `ANTHROPIC_API_KEY` (already in `.env`) for disambiguation
- ECHO's reply log at `businesses/echo/replies.jsonl` (TBD path, confirm with ECHO)
- `../lib/logger.js`, `../lib/state.js`
- `../twilio-whatsapp.js` — escalation only

## Escalation rules
Ping Lando when:
- Claude spend MTD approaches $4 (80% of cap)
- Classifier precision drops below 0.70 for 2 consecutive retrains
- ECHO produces zero replies for 3 weeks in a row (no training signal)
- 10+ consecutive heuristic false-positives found on Lando's monthly spot-review

Never ping for: weekly retrains, routine embeddings, cache updates.

## Stop conditions
- Claude spend exceeds $5/mo cap (hard stop until next calendar month)
- ECHO bay shuts down (no input data)
- 60 days with classifier precision below 0.70 (kill criteria)

## Notes
- First run downloads ~22MB Xenova ONNX weights. Cached in `node_modules/@huggingface/transformers/.cache/`.
- Cold start: needs ~100 labeled replies for useful precision. Expect week 4–6 before trained head contributes.
- $20/mo rent to Brix. No paid upgrade path (this is already the canonical free-tier stack).
