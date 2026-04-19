/* NEO tick.
 *   Weekly tick: read ECHO replies -> embed (local MiniLM) -> heuristic label -> Claude-disambiguate ambiguous ~10%
 *   -> retrain logistic regression -> emit angle-config.json + angle-performance.md.
 *   Status machine: scaffolded -> active (first healthy tick with ANTHROPIC_API_KEY present).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/neo-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'neo';
const RETRAIN_INTERVAL_DAYS = 7;
const CLAUDE_SPEND_CAP_MO = 5;

function daysSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000);
}

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    const s = state.read();
    if (s.bay_status === 'paused') {
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      log.warn('ANTHROPIC_API_KEY missing — bay stays scaffolded');
      await state.recordTick({ summary: 'waiting on ANTHROPIC_API_KEY', failed: false });
      return { skipped: true, reason: 'missing_env' };
    }
    if ((s.claude_spend_mtd || 0) >= CLAUDE_SPEND_CAP_MO) {
      log.warn('Claude spend cap hit — skipping this month', { spend: s.claude_spend_mtd });
      await state.recordTick({ summary: 'spend cap hit', failed: false });
      return { skipped: true, reason: 'spend_cap' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }
    const daysSinceRetrain = daysSince(s.last_retrain_at);
    if (daysSinceRetrain < RETRAIN_INTERVAL_DAYS) {
      log.info('within 7d window, skipping');
      await state.recordTick({ summary: `cache valid, ${Math.round(RETRAIN_INTERVAL_DAYS - daysSinceRetrain)}d until retrain`, failed: false });
      return { skipped: true, reason: 'cache_valid' };
    }
    // TODO: Read ECHO replies for past 7 days from businesses/echo/replies.jsonl.
    //   Pitch ref: neo-pitch.md § "What it does"
    // TODO: Embed each reply via @huggingface/transformers Xenova/all-MiniLM-L6-v2 (~50ms each).
    // TODO: Heuristic pass (regex + keyword rules): unsubscribe, OOO, explicit interest, explicit decline.
    // TODO: Claude disambiguation on remaining ~10% — respect CLAUDE_SPEND_CAP_MO.
    // TODO: Append labeled replies to labeled-replies.jsonl.
    // TODO: Retrain logistic regression (ml-logistic-regression npm).
    // TODO: Compute per-trade angle performance. Write angle-performance.md + angle-config.json.
    // TODO: Push angle-config into ECHO's next-campaign inbox (agreed path TBD with ECHO).
    await state.update((cur) => {
      cur.last_retrain_at = new Date().toISOString();
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: pipeline TODO', failed: false });
    return { scaffolded: true };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try { await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true }); } catch {}
    throw err;
  }
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}
module.exports = { run };
