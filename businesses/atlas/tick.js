/* ATLAS tick.
 *   Free-tier territory scoring: Census CBP (density) + BLS QCEW (size-class) + OSM Overpass (coverage inversion).
 *   Output: atlas-targets.json (ranked top-50 cities) refreshed weekly.
 *   Status machine:
 *     installing -> no-op until CENSUS_API_KEY is present; prints what's missing.
 *     active     -> weekly full rescan, daily cache maintenance, emits atlas-targets.json.
 *     paused     -> Lando froze the bay.
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/atlas-pitch-free.md
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'atlas';
const CENSUS_CACHE_DAYS = 30;
const BLS_CACHE_DAYS = 90;
const OSM_CACHE_DAYS = 7;
const RESCAN_INTERVAL_DAYS = 7;

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
      log.info('paused, skipping');
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }

    if (!process.env.CENSUS_API_KEY) {
      log.warn('CENSUS_API_KEY missing — bay stays installing. See CENSUS-SIGNUP-CHECKLIST.md');
      await state.recordTick({
        summary: 'waiting on CENSUS_API_KEY',
        failed: false
      });
      return { skipped: true, reason: 'missing_env', env: 'CENSUS_API_KEY' };
    }

    // First-ever healthy tick: installing -> active
    if (s.bay_status === 'installing') {
      await state.update((cur) => {
        cur.bay_status = 'active';
        return cur;
      });
      log.info('flipped bay_status installing -> active');
    }

    const daysSinceRescan = daysSince(s.last_full_rescan_at);
    const needsRescan = daysSinceRescan >= RESCAN_INTERVAL_DAYS;

    log.info('cache state', {
      census_age_days: Math.round(daysSince(s.census_cache_refreshed_at)),
      bls_age_days: Math.round(daysSince(s.bls_cache_refreshed_at)),
      osm_age_days: Math.round(daysSince(s.osm_cache_refreshed_at)),
      days_since_rescan: Math.round(daysSinceRescan),
      needs_rescan: needsRescan
    });

    if (!needsRescan) {
      log.info('within rescan window, skipping');
      await state.recordTick({
        summary: `cache valid, ${Math.round(RESCAN_INTERVAL_DAYS - daysSinceRescan)}d until rescan`,
        failed: false
      });
      return { skipped: true, reason: 'cache_valid' };
    }

    // TODO: Census CBP layer — fetch NAICS 238220/238210/238160/238140 by state x county.
    //   Pitch ref: businesses/foreman/candidates/cockpit-round/atlas-pitch-free.md § "Denominator layer"
    //   Cache to data/census-cbp-<year>.json; honor CENSUS_CACHE_DAYS.
    // TODO: BLS QCEW layer — download latest county-high-level CSV if cache >90d.
    //   Pitch ref: § "Size-class filter"
    //   Cache at data/bls-qcew-latest.csv; parse size_class == "1-4 employees".
    // TODO: OSM Overpass layer — query craft=plumber/electrician/hvac/roofer per metro.
    //   Pitch ref: § "Coverage inversion"
    //   Respect ≤1 req/min. Cache at data/osm/<metro-slug>.json per OSM_CACHE_DAYS.
    // TODO: Scoring. weak_web_ratio = 1 - (osm_listed / small_shops_qcew).
    //   territory_score = small_shops_qcew * weak_web_ratio.
    //   Emit top-50 to atlas-targets.json.

    await state.update((cur) => {
      cur.last_full_rescan_at = new Date().toISOString();
      return cur;
    });

    await state.recordTick({
      summary: 'scaffold tick: pipeline TODO, rescan timestamp stamped',
      failed: false
    });
    return { scaffolded: true };
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
