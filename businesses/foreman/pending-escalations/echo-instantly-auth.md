# ESCALATION: ECHO needs Instantly.ai authorization

*Filed 2026-04-18 by HANK. Severity: soft-block (fallback exists). Owner: Lando.*

**One-line summary:** ECHO's top-tier outreach stack requires Instantly.ai Growth ($47/mo) + OAuth for sender mailboxes. Lando has not pre-authorized. Fallback (Resend $20/mo + sales plugin) is live if rejected, at cost of ~30-40% worse deliverability and no AI reply handling.

- Decision needed: approve Instantly.ai $47/mo or take the Resend fallback.
- Revenue impact if Instantly approved: $891 Month 1 MRR projection holds.
- Revenue impact if Instantly rejected: projection drops to ~$500-600 Month 1 MRR (same volume, ~2% reply rate instead of 3%).
- Related pitch: `businesses/foreman/candidates/cockpit-round/echo-pitch.md`.
