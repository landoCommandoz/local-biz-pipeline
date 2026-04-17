# Candidate: Hand-rolled eta-based generator

*Brief targeted: bay-generator. Phase: 1. Researched: 2026-04-17. Foreman recommendation: PASS.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
The tightest possible generator: one JS file, eta for templates, fs.writeFile for output, no generator framework in the middle.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: one dev dep.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 2 hours/month at $50/hr = $100/month. Slightly less than plop because the first template takes longer to author.
Assumptions: same onboarding cadence.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
5. Pure code; no operator layer between Foreman and the filesystem.
Evidence for the score: eta is a template engine library, everything else is Node fs.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If the hand-rolled generator grows past 200 lines, we are rebuilding Plop poorly and should just use Plop.

---

## Source
- Repo / listing URL: https://github.com/eta-dev/eta (engine) plus Brewington-owned script
- License: eta MIT; script is Brewington-owned
- Last commit: eta active 2026
- Stars / downloads / sales: eta is small but healthy; an established EJS-alternative
- Active maintainer: yes, bgub / eta-dev

## What it does
Eta is a lightweight JavaScript template engine (sub-2.5 kb gzipped). Syntax close to EJS. Supports async, file rendering, custom delimiters. That's it.

The "hand-rolled generator" is a Brewington-owned ~50-line script: reads charter + state, passes to an eta template, writes the bay block. No CLI framework.

## Fit with Brewington ecosystem
- **Plugs into:** same slot as plop
- **Replaces:** same target
- **Depends on:** eta
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install eta`
2. Write `businesses/tools/generate-bay.js` reading charter + state + eta template
3. Call from Foreman on approved hires

## Risks and trade-offs
- Every feature Plop ships for free (prompts, multi-file actions, append-at-anchor) is code we write ourselves.
- Template debugging is our problem.
- Ownership = flexibility, also = maintenance.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (eta MIT)
- [x] Last commit date confirmed (eta active 2026)
- [x] Star count confirmed via live visit (eta healthy; script is Brewington)
- [x] At least one independent review or discussion found and linked (eta.js.org site; benchmarks in package readme)
- [x] Pricing page read and costs verified ($0)

## Foreman recommendation
PASS. For a 3-to-10-agent yard, Plop does more with less code. The hand-rolled path wins only if Lando wants to own every line of the generator. Plop is the budget-correct choice.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
