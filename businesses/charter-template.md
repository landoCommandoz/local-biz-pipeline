# <business name> Charter

*Version: <semver>. Last updated: <date>.*

## Mission
<One sentence. What does this business exist to do?>

## Product
<What does it sell? What does the customer receive? What is the price?>

## Distribution
<How does the product reach a buyer without Lando posting anything new? Inbound channels, existing pinned posts, scheduled automations, partner relationships.>

## Authority (can do without asking)
- <action 1>
- <action 2>
- <action 3>

## Out of scope (must escalate)
- <action that changes pricing>
- <action that spends over the budget>
- <action that uses a new platform or channel not listed under Distribution>
- <action that would email, DM, or call more than <N> prospects in a rolling 24 hours>
- <anything that touches Lando's personal brand in a way the charter does not already describe>

## Budget (rolling 30-day)
- Hard cap on infrastructure cost: $<amount>
- Hard cap on advertising cost: $<amount>
- Hard cap on any single transaction: $<amount>

## Revenue targets
- Month 1: $<amount>
- Month 3: $<amount>
- Steady state: $<amount> / month

## Tools available
<List the scripts and APIs this business can call.>

## Escalation rules
Ping Lando via WhatsApp (twilio-whatsapp.js) when:
- A warm reply comes in that requires a human voice
- Monthly cost is on track to exceed the budget cap
- The same action has failed three ticks in a row
- A platform policy change affects the business (e.g., Gumroad delists, Gmail deliverability tanks, Netlify billing change)
- Revenue target missed by more than 50 percent at month end

Never ping for:
- Routine tick completion
- Successful sends
- Normal state updates

## Stop conditions
The business stops ticking and waits for Lando to decide when:
- It has been escalated to Lando and the escalation is unanswered for more than 48 hours
- Its budget cap is hit for the month
- A platform has suspended an account it depends on
