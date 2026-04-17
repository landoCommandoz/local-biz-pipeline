/* Paymaster tick.
 *   First tick (init): creates ledger.json and budgets.json with starting caps.
 *   Weekly cadence (Sunday 23:00): reallocates budgets per charter rule.
 *   Monthly cadence (1st of month 09:00): refreshes 24/7 deploy research.
 *   Per-tick (invoked by each other agent when they finish): logs that agent's
 *   token use to the ledger.
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'paymaster';
const LEDGER_PATH = path.join(__dirname, 'ledger.json');
const BUDGETS_PATH = path.join(__dirname, 'budgets.json');
const DEPLOY_PLAN_PATH = path.join(__dirname, '24-7-deploy-plan.md');

const STARTING_CAPS = {
  foreman: { daily: 200000, notes: 'research-heavy hunts' },
  scout: { daily: 30000, notes: 'CSV + listing copy, low frequency' },
  builder: { daily: 80000, notes: 'generator per tick, moderate' },
  paymaster: { daily: 15000, notes: 'digest + monthly research' }
};

function writeIfMissing(p, content) {
  if (fs.existsSync(p)) return false;
  fs.writeFileSync(p, content, 'utf-8');
  return true;
}

async function init(log, state) {
  log.info('init tick: seeding ledger and budgets');

  const ledger = {
    opened_at: new Date().toISOString(),
    currency: 'USD_and_anthropic_tokens',
    per_agent: Object.keys(STARTING_CAPS).reduce((acc, name) => {
      acc[name] = {
        tokens_in_total: 0,
        tokens_out_total: 0,
        dollar_cost_total: 0,
        dollar_earned_total: 0,
        last_tick_recorded: null,
        ticks: []
      };
      return acc;
    }, {}),
    notes: [
      'Token counts are written here by each agent when it finishes a tick.',
      'Dollar cost is derived from Anthropic pricing: tokens_in + tokens_out tracked separately.',
      'Dollar earned is attributed per agent based on where the sale came from.'
    ]
  };
  writeIfMissing(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n');
  log.info('ledger seeded', { path: LEDGER_PATH });

  const budgets = {
    week_of: new Date().toISOString().slice(0, 10),
    rules_version: '0.1',
    caps: STARTING_CAPS,
    target_tokens_per_dollar: 250000,
    notes: [
      'Starting caps are charter defaults. Reallocated Sunday 23:00 by reallocate() using tokens-per-dollar-earned from the past 7 days.'
    ]
  };
  writeIfMissing(BUDGETS_PATH, JSON.stringify(budgets, null, 2) + '\n');
  log.info('budgets seeded', { path: BUDGETS_PATH });

  const plan = `# 24/7 Deploy Plan

*Version: 0.1. Draft. Updated monthly by paymaster's research tick.*

## Goal
Run every agent on its declared cadence 24/7 once Lando moves the yard off the dev codespace port to a production host.

## Research candidates (to be evaluated)
- Netlify Scheduled Functions (cron-style, free tier limits apply)
- Netlify Background Functions (longer-running, different limits)
- Netlify Blobs for persistent state across invocations
- Fly.io or Railway for an always-on Node process running the Croner scheduler in-process
- A cheap VPS (Hetzner, DigitalOcean) with pm2 supervising scheduler.js
- Cloudflare Workers + Cron Triggers

## Evaluation criteria
- Cold-start impact on tick latency
- Free-tier ceiling (ticks / month, compute-seconds)
- Persistence model (how do state.json and ledger.json survive?)
- Deploy ergonomics (git push vs manual)
- Monthly all-in cost at Brewington scale

## Current recommendation
TBD. First monthly research pass runs the first time paymaster ticks in research mode.

## Change log
- 2026-04-17: seeded by paymaster init tick.
`;
  writeIfMissing(DEPLOY_PLAN_PATH, plan);
  log.info('deploy plan seeded', { path: DEPLOY_PLAN_PATH });

  await state.update((s) => {
    s.status = 'ready';
    s.current_mode = 'live_meter';
    s.ledger_exists = true;
    s.budgets_exists = true;
    s.deploy_plan_exists = true;
    s.last_tick_at = new Date().toISOString();
    s.last_tick_summary = 'Init: ledger, budgets, and deploy plan seeded with starting caps.';
    s.failures_in_row = 0;
    return s;
  });

  return { init: true };
}

async function recordAgentTick({ agent, tokens_in = 0, tokens_out = 0, dollar_cost = 0, dollar_earned = 0, summary = '' }) {
  if (!fs.existsSync(LEDGER_PATH)) return { skipped: true, reason: 'ledger not yet initialized' };
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
  if (!ledger.per_agent[agent]) {
    ledger.per_agent[agent] = {
      tokens_in_total: 0,
      tokens_out_total: 0,
      dollar_cost_total: 0,
      dollar_earned_total: 0,
      last_tick_recorded: null,
      ticks: []
    };
  }
  const entry = ledger.per_agent[agent];
  entry.tokens_in_total += tokens_in;
  entry.tokens_out_total += tokens_out;
  entry.dollar_cost_total += dollar_cost;
  entry.dollar_earned_total += dollar_earned;
  entry.last_tick_recorded = new Date().toISOString();
  entry.ticks.push({
    at: entry.last_tick_recorded,
    tokens_in,
    tokens_out,
    dollar_cost,
    dollar_earned,
    summary
  });
  if (entry.ticks.length > 200) entry.ticks = entry.ticks.slice(-200);
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n', 'utf-8');
  return { recorded: true };
}

async function run(opts = {}) {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start', { opts });

  try {
    const s = state.read();

    if (s.paused) {
      log.info('paused, skipping');
      return { skipped: true, reason: 'paused' };
    }

    if (opts.mode === 'init' || s.status === 'awaiting_first_tick') {
      return await init(log, state);
    }

    if (opts.mode === 'record' && opts.payload) {
      return await recordAgentTick(opts.payload);
    }

    if (opts.mode === 'weekly_digest') {
      // TODO Phase 2: compute tokens-per-dollar-earned over last 7d per agent,
      // reallocate budgets per charter rule, send WhatsApp digest.
      log.info('weekly digest stub (Phase 2 TBD)');
      await state.recordTick({
        summary: 'weekly digest stub',
        status: s.status,
        mode: s.current_mode,
        failed: false
      });
      return { stub: true, mode: 'weekly_digest' };
    }

    if (opts.mode === 'monthly_research') {
      // TODO Phase 2: re-research Netlify pricing, invocation limits, persistent state options.
      log.info('monthly research stub (Phase 2 TBD)');
      await state.recordTick({
        summary: 'monthly research stub',
        status: s.status,
        mode: s.current_mode,
        failed: false
      });
      return { stub: true, mode: 'monthly_research' };
    }

    // default: no-op heartbeat
    log.info('heartbeat tick');
    await state.recordTick({
      summary: 'heartbeat',
      status: s.status,
      mode: s.current_mode,
      failed: false
    });
    return { heartbeat: true };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try {
      await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true });
    } catch {}
    throw err;
  }
}

if (require.main === module) {
  const mode = process.argv[2] || undefined;
  run(mode ? { mode } : {}).then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run, recordAgentTick };
