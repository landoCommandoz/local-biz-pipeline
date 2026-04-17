# Candidate: Plop.js

*Brief targeted: bay-generator. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HIRE.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
When Foreman onboards a new hire, plop reads the new charter.md and state.json and writes a new bay HTML block (plus charter, state, tick scaffolds) in one command.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: local dev dependency, invoked on demand.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 3 hours/month at $50/hr = $150/month. Onboarding a new bay drops from 60-90 min of copy-paste to a single CLI command.
Assumptions: 2 new hires per month at roughly 75 min saved each.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. Once generators are defined, Foreman runs them without Lando. One touchpoint when the template needs an update.
Evidence for the score: Plop is a CLI; prompts can be scripted via `plop --opts` or a programmatic API (node-plop).

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES. Foreman executes `plop new-bay` non-interactively.

### 8. One-line kill criteria
If authoring a new template takes longer than writing the generated files by hand after 3 templates, kill.

---

## Source
- Repo / listing URL: https://github.com/plopjs/plop
- License: MIT
- Last commit: v4.0.5 ~mid-February 2026
- Stars / downloads / sales: ~6.3k stars
- Active maintainer: yes, plopjs org

## What it does
Plop is a micro-generator framework. You define generators in `plopfile.js` (name, prompts, actions) and templates in handlebars files. Running `plop <generator>` prompts for values (or takes --args) and writes the output files. `node-plop` is the programmatic API behind the CLI.

Handlebars is the template engine. You can add custom helpers. Actions include `add` (create file), `modify` (append/replace in existing file), and `append` (a specialization).

## Fit with Brewington ecosystem
- **Plugs into:** Foreman's onboarding flow: after Lando approves a candidate, Foreman reads the candidate's slug + brief and invokes `plop new-bay --name=<slug>`
- **Replaces:** hand-copy-paste of an existing bay block
- **Depends on:** Node; `npm install --save-dev plop` or run via `npx plop`
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install --save-dev plop`
2. Write `plopfile.js` with a `new-bay` generator: adds `businesses/<name>/charter.md`, `state.json`, `tick.js`, and appends a bay HTML block to the dashboard
3. Invoke from Foreman's tick after Lando approves a hire

## Risks and trade-offs
- Handlebars is logic-light. Complex conditional bay blocks may need a second pass or a custom helper.
- Plop's modify action is regex-based; appending to the dashboard HTML needs a stable anchor comment (e.g., `<!-- bay:insertion -->`).
- One more dev dependency. Tiny cost.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT)
- [x] Last commit date confirmed (v4.0.5 ~mid-Feb 2026)
- [x] Star count confirmed via live visit (~6.3k)
- [x] At least one independent review or discussion found and linked (blogs.perficient.com Plop intro; xkoji.dev; dev.to replacing-plop-with-claude-skill)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HIRE. Purpose-built for the job. Handlebars is enough for the bay template surface we have. node-plop gives us a programmatic path so Foreman can generate bays without an interactive prompt.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
