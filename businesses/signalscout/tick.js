/* SignalScout tick.
 *   Every 2 hours, polls the approved subreddit list, matches posts against
 *   keyword map, drafts replies via Claude Sonnet, surfaces to queue.jsonl
 *   after copy-filter pass.
 *
 *   First tick is a DRY RUN: polls once, drafts 10, escalates for Lando
 *   eyeball. No scheduled ticks until mode flips to "live".
 *
 *   Requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in env. Missing on any
 *   tick -> escalate, do not error.
 *
 *   Never posts. Never DMs. Ever.
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'signalscout';
const BAY_DIR = __dirname;
const QUEUE_PATH = path.join(BAY_DIR, 'queue.jsonl');
const SUBREDDIT_MAP_PATH = path.join(BAY_DIR, 'subreddit-map.json');

function ensureFiles() {
  if (!fs.existsSync(QUEUE_PATH)) fs.writeFileSync(QUEUE_PATH, '', 'utf-8');
}

function queueDepth() {
  if (!fs.existsSync(QUEUE_PATH)) return 0;
  const raw = fs.readFileSync(QUEUE_PATH, 'utf-8');
  return raw.split('\n').filter((l) => l.trim().length > 0).length;
}

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    ensureFiles();
    const s = state.read();
    if (s.paused) {
      log.info('paused, skipping');
      return { skipped: true, reason: 'paused' };
    }

    const mode = s.current_mode || 'dry_run';
    const hasRedditCreds = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const depth = queueDepth();

    log.info('tick context', { mode, hasRedditCreds, hasAnthropicKey, queue_depth: depth });

    if (mode === 'dry_run' && s.status === 'awaiting_first_tick') {
      const summary = 'first tick: awaiting Reddit dev app creds from Lando';
      log.warn('blocked: needs Lando setup');
      await state.update((cur) => {
        cur.status = 'awaiting_lando_setup';
        cur.queue_depth = depth;
        cur.last_escalation_at = new Date().toISOString();
        cur.last_escalation_reason = 'need REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET in .env';
        return cur;
      });
      await state.recordTick({ summary, status: 'awaiting_lando_setup', mode, failed: false });
      return { escalated: true, reason: 'needs_setup' };
    }

    if (mode === 'dry_run') {
      log.info('dry_run tick: would poll subreddits and draft 10, no scheduled loop yet');
      await state.update((cur) => {
        cur.queue_depth = depth;
        return cur;
      });
      await state.recordTick({
        summary: `dry_run tick: queue_depth=${depth}, awaiting Lando eyeball before live`,
        status: s.status,
        mode,
        failed: false
      });
      return { dry_run: true, queue_depth: depth };
    }

    if (mode === 'live') {
      if (!hasRedditCreds) {
        log.warn('live mode but Reddit creds missing, blocking poll');
        await state.recordTick({
          summary: 'live mode but REDDIT_CLIENT_ID/SECRET missing, escalated',
          status: 'blocked_on_env',
          mode,
          failed: false
        });
        return { blocked: true, reason: 'missing_reddit_creds' };
      }
      // Phase 2 implementation: real poll + draft + queue.
      log.info('live tick stub: real Reddit poll + draft loop not yet implemented');
      await state.update((cur) => {
        cur.queue_depth = depth;
        return cur;
      });
      await state.recordTick({
        summary: `live tick stub (queue_depth=${depth})`,
        status: s.status,
        mode,
        failed: false
      });
      return { live_stub: true, queue_depth: depth };
    }

    log.warn('unknown mode, skipping', { mode });
    return { skipped: true, reason: 'unknown_mode' };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try {
      await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true });
    } catch {}
    throw err;
  }
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run };
