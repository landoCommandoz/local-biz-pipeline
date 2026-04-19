/* NOVA tick.
 *   Adversarial pre-deploy gate. Event-driven (MAX calls before deploy) but also supports
 *   scheduled sweep across existing deployed URLs to catch regressions.
 *   Status machine: scaffolded -> active (first healthy tick; no env required).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/nova-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'nova';

async function run(buildDir) {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start', { build_dir: buildDir || '(none)' });

  try {
    const s = state.read();
    if (s.bay_status === 'paused') {
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }

    if (!buildDir) {
      log.info('no build dir supplied — housekeeping tick only');
      await state.update((cur) => {
        cur.ticks_today = (cur.ticks_today || 0) + 1;
        return cur;
      });
      await state.recordTick({ summary: 'housekeeping tick: no build passed', failed: false });
      return { skipped: true, reason: 'no_build_dir' };
    }

    // TODO: Serve buildDir on ephemeral port (http-server or express).
    //   Pitch ref: nova-pitch.md § "Integration plan if hired" step 4
    // TODO: Compose six fixtures against http://localhost:<port>/:
    //   - rapidClick.ts (20 clicks in a row before load)
    //   - nullFetch.ts (page.route abort -> verify graceful fallback)
    //   - overflow375.ts (viewport 375x667 -> scrollWidth <= 375)
    //   - touchTarget.ts (all buttons/links/[role=button] boundingBox >= 44x44)
    //   - urlBypass.ts (GET /admin, /.env, /wp-login.php, /config.json -> must 404)
    //   - cpuThrottle.ts (CDP setCPUThrottlingRate {rate: 6} -> async ordering)
    // TODO: Write JUnit XML + HTML report to nova/reports/<build-id>/.
    // TODO: Return exit code 0 (pass) or non-zero (block MAX publish + escalate).

    await state.update((cur) => {
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: adversarial pipeline TODO', failed: false });
    return { scaffolded: true, build_dir: buildDir };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try { await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true }); } catch {}
    throw err;
  }
}

if (require.main === module) {
  const buildDir = process.argv[2];
  run(buildDir).then((r) => process.exit(r.skipped ? 0 : 0)).catch((err) => { console.error(err); process.exit(1); });
}
module.exports = { run };
