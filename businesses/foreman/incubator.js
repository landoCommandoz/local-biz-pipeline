/**
 * Hank as Incubator — skill-to-revenue pitch drafter.
 *
 * Hank's third capability (after recruiting bays + hustling prospects):
 * scan the Brewington Yard's installed Claude skills and third-party
 * packages with monetization potential, then have Sonnet draft a concrete,
 * shippable product pitch for each one.
 *
 * Each pitch answers: what product, where sold, what price, who buys it,
 * first-7-day plan, kill criteria.
 *
 * Reviewed pitches become actual incubated mini-bays (Phase 2: spawner).
 * v1 scope = scan + pitch + file. Lando reviews, picks winners.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { getClient } = require('../lib/metered-anthropic');

const BAY_DIR = __dirname;
const PITCHES_DIR = path.join(BAY_DIR, 'incubator-pitches');
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2500;

// Seed set of Brewington-installed skills with obvious monetization angles.
// Each entry: slug (used for filename), name (shown in pitch), description,
// angle_hint (prime Sonnet to think commercial).
const SKILL_CATALOG = [
  {
    slug: 'searchfit-seo-audit',
    name: 'SEO Audit Suite (searchfit-seo)',
    description: 'Runs a full SEO audit on a website or codebase. Technical SEO, content gaps, keyword research, competitor comparison, prioritized action plan.',
    angle_hint: 'Already a recognized paid service. Think one-time audit product + retainer upsell.'
  },
  {
    slug: 'ai-visibility',
    name: 'AI Visibility Check (searchfit-seo:ai-visibility)',
    description: 'Analyze and improve how a brand appears in AI-generated responses from ChatGPT, Claude, Gemini, Perplexity. Finds gaps, suggests fixes.',
    angle_hint: 'Brand-new category in 2026. Every founder wants to know if ChatGPT mentions them.'
  },
  {
    slug: 'competitive-intelligence',
    name: 'Competitive Intelligence Battlecard (sales:competitive-intelligence)',
    description: 'Research competitors and build an interactive HTML battlecard. Outputs a clickable comparison matrix.',
    angle_hint: 'Sales teams pay $30-100 per battlecard today. This ships one in 10 minutes.'
  },
  {
    slug: 'call-prep',
    name: 'Sales Call Prep Assistant (sales:call-prep)',
    description: 'Prepare for a sales call with account context, attendee research, and suggested agenda.',
    angle_hint: 'Recurring use case. Think $9/call one-off or $29/month subscription.'
  },
  {
    slug: 'campaign-plan',
    name: 'Marketing Campaign Planner (marketing:campaign-plan)',
    description: 'Generates a full campaign brief: objectives, audience, messaging, channels, week-by-week content calendar, success metrics.',
    angle_hint: 'Agencies charge $500+ for a campaign plan. This is $49 Gumroad.'
  },
  {
    slug: 'email-sequence',
    name: 'Email Sequence Builder (marketing:email-sequence)',
    description: 'Designs and drafts multi-email sequences with full copy, timing, branching, exit conditions, and performance benchmarks.',
    angle_hint: 'Copywriters charge $500 per sequence. This drafts a full 7-email flow in minutes.'
  },
  {
    slug: 'firecrawl-skill-gen',
    name: 'Skill Generator (firecrawl:skill-gen)',
    description: 'Generate a complete Claude Agent Skill from any documentation URL using Firecrawl web scraping.',
    angle_hint: 'Devs building on Claude Code want to skill-ify their favorite tools. Sell packs of pre-generated skills.'
  },
  {
    slug: 'broken-links',
    name: 'Broken Link Fixer (searchfit-seo:broken-links)',
    description: 'Find and fix broken links on a website or in a codebase. Audit reports plus suggested fixes.',
    angle_hint: 'Simple utility. Website owners pay small fees to make this go away.'
  },
  {
    slug: 'schema-markup',
    name: 'JSON-LD Schema Generator (searchfit-seo:schema-markup)',
    description: 'Generate JSON-LD structured data / schema markup for web pages to improve rich snippets and search appearance.',
    angle_hint: 'Every local biz needs LocalBusiness schema. Charge $19 per page or $49 for site-wide.'
  },
  {
    slug: 'keyword-clustering',
    name: 'Keyword Clustering Tool (searchfit-seo:keyword-clustering)',
    description: 'Cluster and organize keywords into topical groups for content planning. Outputs content maps.',
    angle_hint: 'SEO consultants charge $500+ for keyword cluster workshops. Package as $39 tool.'
  }
];

const SYSTEM_PROMPT = `You are the Incubator, a specialized scout inside Brewington Yard. Your job: given an installed Claude skill or capability, pitch a SPECIFIC, SHIPPABLE, MONETIZABLE product that turns that skill into revenue.

Your audience is Lando, the landlord, who scans in 30 seconds. He will pick winners to incubate into real bays.

VOICE:
- Commercial. Skeptical of hype.
- Specific numbers. Stated assumptions.
- If you are guessing, write UNKNOWN.
- Target buyers are indie developers, small business owners, marketing consultants, or creators on Gumroad / Whop / Itch / Stripe Checkout.

HARD RULES (any violation = failed pitch):
- No em dashes. Use commas, periods, colons.
- Never "AI" as a standalone word. Use "automation", "agent", "model", "machine learning".
- Output valid Markdown. No preamble. No post-text. Start with "# Incubator Pitch NNNN:" and end with the "Drafted by Incubator" footer.

Every pitch MUST include these sections in order:

# Incubator Pitch NNNN: <product name>
**Skill:** <skill name>
**Shipping platform:** <Gumroad, Whop, Itch, Stripe Checkout, etc>
**Price point:** $NN (single number)

## Product concept
<2-3 sentences. Concrete product, not a platform.>

## Who buys this
<1-2 sentences. Specific persona and why they cannot ignore this.>

## Why it is undervalued today
<1 paragraph. What is the current price for this outcome manually? Why is this better or cheaper?>

## First 7-day shipping plan
<Day 1: action. Day 2: action. Day 3: action. Day 4-7: action. Each day is 1 sentence.>

## Projected month 1 revenue
<Honest range with assumptions. Comparables if relevant.>

## Kill criteria
<Specific, measurable, 30-day. What outcome kills this experiment?>

## Why Brewington ships this well
<1-2 sentences. Why the yard is positioned to do this vs someone else.>

---
*Drafted by Incubator on <YYYY-MM-DD>. Status: awaiting Lando review.*`;

function nextPitchNumber() {
  if (!fs.existsSync(PITCHES_DIR)) return 1;
  const existing = fs.readdirSync(PITCHES_DIR)
    .map((f) => f.match(/^(\d+)-/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10))
    .filter((n) => !isNaN(n));
  return existing.length ? Math.max(...existing) + 1 : 1;
}

function pickNextSkill() {
  if (!fs.existsSync(PITCHES_DIR)) fs.mkdirSync(PITCHES_DIR, { recursive: true });
  const filed = fs.readdirSync(PITCHES_DIR).filter((f) => f.endsWith('.md'));
  for (const skill of SKILL_CATALOG) {
    const alreadyPitched = filed.some((f) => f.includes(skill.slug));
    if (!alreadyPitched) return skill;
  }
  return null;
}

function extractMarkdown(text) {
  if (!text) return null;
  const start = text.indexOf('# Incubator Pitch');
  return start < 0 ? text.trim() : text.slice(start).trim();
}

function collectText(response) {
  if (!response || !Array.isArray(response.content)) return '';
  return response.content.filter((b) => b && b.type === 'text').map((b) => b.text).join('');
}

async function incubateOnce(opts = {}) {
  const skill = opts.skill || pickNextSkill();
  if (!skill) return { ok: false, reason: 'catalog exhausted, all skills pitched' };

  const num = nextPitchNumber();
  const paddedNum = String(num).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  const userPrompt = `Draft pitch ${paddedNum} for the following installed skill.

Skill name: ${skill.name}
Skill description: ${skill.description}
Commercial angle hint: ${skill.angle_hint}
Date: ${today}

Draft the full pitch markdown now. Start with "# Incubator Pitch ${paddedNum}:" and end with the "Drafted by Incubator" footer. Nothing else.`;

  const client = opts.client || getClient('foreman', opts);
  let response;
  try {
    response = await client.messages.create({
      model: opts.model || MODEL,
      max_tokens: opts.maxTokens || MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });
  } catch (err) {
    return { ok: false, reason: 'api call failed', error: String(err && err.message) };
  }

  if (client._noop) return { ok: false, reason: 'no api key (noop client)' };

  const text = collectText(response);
  const md = extractMarkdown(text);
  if (!md || !md.startsWith('# Incubator Pitch')) {
    return { ok: false, reason: 'response missing pitch markdown', preview: text.slice(0, 300) };
  }

  fs.mkdirSync(PITCHES_DIR, { recursive: true });
  const outPath = path.join(PITCHES_DIR, `${paddedNum}-${skill.slug}.md`);
  fs.writeFileSync(outPath, md + '\n', 'utf-8');

  return {
    ok: true,
    pitch_number: num,
    pitch_path: outPath,
    skill_slug: skill.slug,
    skill_name: skill.name,
    model: response.model
  };
}

module.exports = { incubateOnce, SKILL_CATALOG, pickNextSkill, PITCHES_DIR };

if (require.main === module) {
  incubateOnce().then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  });
}
