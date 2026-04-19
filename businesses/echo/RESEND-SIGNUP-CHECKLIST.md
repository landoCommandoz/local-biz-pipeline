# Resend Free Tier — Signup + Domain Verification

Lando executes. Hank cannot automate auth signups.

## Why this file exists

ECHO's send layer uses Resend's free tier (3,000 emails/month, 100/day, no credit card, no expiry). ECHO cannot send until:
1. Resend account is active.
2. `brewingtondigital-outbound.com` domain is verified with DMARC/SPF/DKIM.
3. `RESEND_API_KEY` is pasted into `.env`.

Until then, `businesses/echo/tick.js` no-ops cleanly and logs `waiting on RESEND_API_KEY`.

## Step 1 — Create Resend account (5 min, no card)

- Go to https://resend.com/signup
- Email: `landonbrewington12@gmail.com`
- Password: your standard
- No credit card field — confirm the free tier shows 3,000/mo cap
- Verify the email

## Step 2 — Add the sending domain (5 min)

- In Resend dashboard → Domains → **Add Domain**
- Domain: `brewingtondigital-outbound.com`
- Region: choose the closest (US East likely)
- Resend will display 3 DNS records: one MX-style, one TXT for SPF, one TXT for DKIM. Add all three to whatever DNS provider owns `brewingtondigital-outbound.com` (likely Netlify DNS or the registrar).
- Wait 5–30 minutes for propagation. Resend polls and auto-flips the domain to **Verified**.

### DMARC (do not skip)

Add a fourth DNS TXT record at `_dmarc.brewingtondigital-outbound.com`:

```
v=DMARC1; p=none; rua=mailto:dmarc@brewingtondigital.com; adkim=s; aspf=s
```

`p=none` for first 30 days to monitor; escalate to `p=quarantine` after reputation is built.

## Step 3 — Generate the API key

- Resend dashboard → API Keys → **Create API Key**
- Name: `echo-production`
- Permission: **Sending access** (no domain-management rights)
- Copy the key immediately — it is shown only once.

## Step 4 — Paste into `.env`

In `/workspaces/local-biz-pipeline/.env`, add:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
ECHO_SEND_DOMAIN=brewingtondigital-outbound.com
```

Restart any long-running scheduler. Next tick (up to 24h later unless run manually) flips ECHO from `installing` → `warming`.

## Step 5 — Accept the 14-day warmup window

ECHO enforces a ramp: 10/day → 50/day over the first 14 days after `.env` has the key. Day 15+ opens the 100/day ceiling. This is non-negotiable; sending 100/day on day 1 will burn the domain reputation.

## What to do if you hit a snag

- **DNS propagation stalled**: wait 24 hours, then escalate to Hank (`businesses/foreman/log.md`). Hank can retest from gosom's perspective and re-flag.
- **Resend rejects the domain**: rare on clean domains. Escalate to Hank to pivot to the Brevo free runner-up (see echo-pitch-free.md § Runners-up).
- **You hit 100/day during warmup**: that means tick.js miscounted. Freeze the bay (`state.json.bay_status = "paused"`) and escalate.

## Done-check

- [ ] Resend account created and email verified
- [ ] `brewingtondigital-outbound.com` shows Verified in Resend Domains
- [ ] DMARC TXT record present at `_dmarc.brewingtondigital-outbound.com`
- [ ] `RESEND_API_KEY` in `.env`
- [ ] Manual tick run confirms ECHO flipped from `installing` to `warming`:
  ```bash
  node businesses/echo/tick.js
  ```
