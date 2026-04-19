/* REX tick.
 *   REX is request-driven (called by JAX/Scout/Realtor/ECHO via businesses/lib/rex.js),
 *   not pull-driven. This tick is a health + housekeeping pass: check spend cap,
 *   rotate daily counters, maybe build the Gumroad copy pack when ≥40 tested combos exist.
 *   Status machine: scaffolded -> active (first healthy tick with ANTHROPIC_API_KEY present).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/rex-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'rex';
const CLAUDE_SPEND_CAP_MO = 15;
const COPY_PACK_MIN_COMBOS = 40;

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
      log.warn('Claude spend cap hit', { spend: s.claude_spend_mtd });
      await state.recordTick({ summary: 'spend cap hit', failed: false });
      return { skipped: true, reason: 'spend_cap' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }
    // TODO: Instantiate businesses/lib/rex.js with locked system prompt (hard rules pack).
    //   Pitch ref: rex-pitch.md § "Integration plan if hired" step 1-2
    // TODO: Expose draftCopy({ brief, section, tone, outputPath }) for JAX/Scout/Realtor/ECHO.
    // TODO: Brand-review pass after every generation. Retry once on violation.
    // TODO: Append successful combos to gumroad/copy-pack.jsonl. When ≥40, publish Gumroad listing.
    //   Pitch ref: § "Revenue projections" for pricing ($29 one-time, 10% Gumroad fee)

    const combosCount = (state.read().tested_combos || []).length;
    if (combosCount >= COPY_PACK_MIN_COMBOS && !state.read().gumroad_pack_published_at) {
      log.info('≥40 tested combos accumulated — Gumroad pack ready to ship', { combos: combosCount });
      // TODO: publish copy pack to Gumroad via Scout's gumroad-publisher helper.
    }

    await state.update((cur) => {
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: rex wrapper TODO', failed: false });
    return { scaffolded: true, combos: combosCount };
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
