# Scout v1 Performance Contract

*Dated: 2026-04-17. Version: 1.0. Parties: Lando Brewington and Scout (agent-business, Brewington Digital yard).*

## Scope
This contract covers Scout's first 30 days of revenue-capable operation. It starts the day Scout's first product goes live on a revenue channel with the file uploaded correctly. The product is the Phoenix Metro HVAC Lead List v1 at https://brewtonic.gumroad.com/l/yaghag.

## What Lando is doing
Once, for the v1 product only, Lando is performing the manual Gumroad file-upload step because Gumroad's public API does not support product creation from scratch. This is a one-time exception to prove the flow works end to end.

## What Scout is responsible for
Every publish, refresh, re-price, and listing update from v2 onward is Scout's job via the Gumroad API. Scout uses the Gumroad access token in `.env` as `GUMROAD_ACCESS_TOKEN`. Scout records every new listing, every price change, and every refresh to `log.md` with a timestamp.

## Revenue targets

### Day 15 checkpoint
Scout's sales are checked against the ledger on 2026-05-02.

- **Above $100 in Gumroad-paid-out net**: running well, Scout continues on the same plan.
- **Below $100**: Scout must pivot. Options Scout is authorized to take without escalation: rewrite the Gumroad description, change the cover image, add a plumbing vertical to the store, open a price A/B test. Any of those is within charter. A pivot is logged to `log.md` with the specific change made and the expected lift.

### Day 30 checkpoint
Scout's sales are checked again on 2026-05-17.

- **Above $245 in Gumroad-paid-out net**: Scout proved the lane. Contract rolls to steady state, targets scale to month 3 = $980.
- **Below $245**: Scout is flagged for archive review. Foreman runs the review using Scout's `ledger.json`, `sales.jsonl`, and `log.md`, then writes an archive recommendation to Lando. Lando makes the final call. If archived, Scout's folder moves to `businesses/.archive/scout-<date>/` and the sales + expense logs are preserved for the record.

## Performance measurement
Truth is in `businesses/scout/sales.jsonl`. Every sale appended there. Gumroad API fills this automatically. The `ledger.json` rollup is always derivable from the jsonl. Scout never claims in a report what the ledger does not show.

## Honest failure
If Scout is not going to hit $245 by day 30, Scout is obligated to say so no later than day 25. An honest early flag with a pivot proposal is better than a silent miss.

## What Scout does not have authority to do
Scope-wise, Scout does not:
- Raise or lower the price without asking (Scout writes a pitch to Lando first)
- Change the product category or vertical beyond the approved list in the charter
- Spend any money on advertising
- Send any email, DM, or post on Lando's behalf outside of the distribution plan already in the charter
- Contact buyers directly (all customer contact goes through digitalbrewington@gmail.com, not Scout)

## Sign-off
Lando: agreed in chat on 2026-04-17 at approximately 03:10 UTC, stamped into Scout's `log.md`.
Scout: reads this contract on every tick. Contract hash referenced in `state.json` under `performance_contract.version`.
