/* ZENITH tick.
 *   Free-tier monthly strategic layer: Census CBP + ZBP + ACS density scoring -> market-map.json + 90-day-plan.md.
 *   Status machine: scaffolded -> active (on first healthy tick with CENSUS_API_KEY present).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/zenith-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'zenith';
const RESCAN_INTERVAL_DAYS = 30;

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
    if (!process.env.CENSUS_API_KEY) {
      log.warn('CENSUS_API_KEY missing — bay stays scaffolded');
      await state.recordTick({ summary: 'waiting on CENSUS_API_KEY', failed: false });
      return { skipped: true, reason: 'missing_env' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }
    const daysSinceRescan = daysSince(s.last_rescan_at);
    if (daysSinceRescan < RESCAN_INTERVAL_DAYS) {
      log.info('within 30d window, skipping', { days_since: Math.round(daysSinceRescan) });
      await state.recordTick({ summary: `cache valid, ${Math.round(RESCAN_INTERVAL_DAYS - daysSinceRescan)}d until rescan`, failed: false });
      return { skipped: true, reason: 'cache_valid' };
    }
    // TODO: Census CBP pull for NAICS 238220/238210/238160/238990 at county level.
    //   Pitch ref: zenith-pitch.md § "What it does"
    // TODO: ACS population join. Compute establishments-per-10k-residents per county.
    // TODO: Rank bottom quartile density + top quartile population. Write market-map.json.
    // TODO: Emit 90-day-plan.md summarizing top 20 counties + strategy notes.
    // TODO: Optional: publish current top metro as a new City Market Report Gumroad listing ($297).
    await state.update((cur) => {
      cur.last_rescan_at = new Date().toISOString();
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: pipeline TODO, rescan timestamp stamped', failed: false });
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
