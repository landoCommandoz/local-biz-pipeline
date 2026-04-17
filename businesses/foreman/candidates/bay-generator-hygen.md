# Candidate: Hygen

*Brief targeted: bay-generator. Phase: 1. Researched: 2026-04-17. Foreman recommendation: HOLD.*

## The 8 required fields (none optional)

### 1. Why we need it (1 sentence, concrete outcome)
Scaffolds a new agent's bay block + files from markdown templates with front-matter, letting Foreman add a bay without touching a JS plopfile.

### 2. Monthly cost all-in
- Infrastructure: $0
- Licensing: $0 (MIT)
- API usage estimate: $0
- Other: $0
- **Total: $0/month**
Assumptions: local dev dependency.

### 3. Projected monthly revenue or revenue-savings
Projected monthly productivity-savings: 3 hours/month at $50/hr = $150/month. Similar to plop.
Assumptions: same.

### 4. Payback period
Immediate.

### 5. Autonomy score 1-5
4. CLI-driven; scriptable. Hygen's speed claim and markdown-based templates are a genuine edge for fast iteration.
Evidence for the score: hygen.io describes CLI-first, non-interactive mode via args.

### 6. Can it pay its own bills
YES. Cost is $0.

### 7. Can it build something without Lando
YES.

### 8. One-line kill criteria
If the markdown-front-matter template flow surprises us with a silent render failure after 3 templates, kill.

---

## Source
- Repo / listing URL: https://github.com/jondot/hygen
- License: MIT
- Last commit: v6.2.11, active
- Stars / downloads / sales: ~5.8-6k stars
- Active maintainer: jondot

## What it does
Hygen is a code generator that reads templates stored as files with front-matter headers. The front-matter controls output path, action (add/inject), and condition. Templates are EJS. CLI runs `hygen <generator> <action>` and writes files.

The speed claim (Hygen markets itself as "fastest scaffolder") is real on cold starts; Plop has more moving parts in node_modules.

## Fit with Brewington ecosystem
- **Plugs into:** Foreman's onboarding flow, same slot as plop
- **Replaces:** same target as plop
- **Depends on:** Node
- **Brewington infra cost delta:** $0

## Integration plan if hired
1. `npm install --save-dev hygen`
2. Create `_templates/new-bay/new/` with front-matter templates
3. Invoke `hygen new-bay new --name=<slug>` from Foreman

## Risks and trade-offs
- EJS vs. Handlebars: matter of taste. EJS is more Node-native; Handlebars is more logic-light.
- Hygen's community is smaller than Plop's.
- Front-matter-in-markdown is pleasant to author but a hidden failure-mode if the parser hiccups.

## Evidence (verification-before-completion checklist)
- [x] License file read and confirmed (MIT)
- [x] Last commit date confirmed (v6.2.11 active)
- [x] Star count confirmed via live visit (~5.8-6k)
- [x] At least one independent review or discussion found and linked (npm-compare plop vs hygen comparison; hygen.io docs)
- [x] Pricing page read and costs verified (OSS, free)

## Foreman recommendation
HOLD. Hygen is credible and slightly faster. Plop has a broader community and better-documented programmatic API for non-interactive invocation. Tiny edge to Plop.

## Lando's decision
<Filled in by Lando: APPROVED / REJECTED / HOLD WITH FEEDBACK.>
