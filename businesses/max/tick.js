/* MAX tick.
 *   Event-driven deploy + scheduled Care Report generation.
 *   Pipeline: receive approved build -> copy to /tmp -> NOVA gate -> netlify deploy --prod -> IRIS handoff.
 *   Status machine: scaffolded -> active (first healthy tick with NETLIFY_AUTH_TOKEN present).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/max-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'max';

async function run(approvedBuildDir, clientSlug) {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start', { build: approvedBuildDir || '(none)', client: clientSlug || '(none)' });

  try {
    const s = state.read();
    if (s.bay_status === 'paused') {
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }
    if (!process.env.NETLIFY_AUTH_TOKEN) {
      log.warn('NETLIFY_AUTH_TOKEN missing — bay stays scaffolded');
      await state.recordTick({ summary: 'waiting on NETLIFY_AUTH_TOKEN', failed: false });
      return { skipped: true, reason: 'missing_env' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }

    if (!approvedBuildDir) {
      // Housekeeping path: Care Report generation + UptimeRobot status sync
      // TODO: For each Care + Uptime client, generate monthly report if due.
      //   Pitch ref: max-pitch.md § "Revenue tier specification"
      log.info('no build dir — housekeeping (Care Reports + monitor sync)');
      await state.update((cur) => {
        cur.ticks_today = (cur.ticks_today || 0) + 1;
        return cur;
      });
      await state.recordTick({ summary: 'housekeeping tick: care reports + monitors TODO', failed: false });
      return { housekeeping: true };
    }

    // TODO: Copy approvedBuildDir to /tmp/max-deploy-<slug>.
    // TODO: Call NOVA gate: `node businesses/nova/tick.js /tmp/max-deploy-<slug>`.
    //   Pitch ref: max-pitch.md § "Integration plan if hired" step 2-3 + NOVA coordination
    //   If exit != 0: abort deploy, log block reason, escalate.
    // TODO: Run `netlify deploy --prod --dir /tmp/max-deploy-<slug>` via child_process.
    //   Capture returned URL. Update client record.
    //   Decrement state.netlify_credits_est.
    // TODO: Call IRIS post-deploy with the returned URL for visual + copy + a11y audit.
    // TODO: If client has Care + Uptime active, register the URL with UptimeRobot.

    await state.update((cur) => {
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: `scaffold tick: deploy TODO for ${clientSlug}`, failed: false });
    return { scaffolded: true, build: approvedBuildDir };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try { await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true }); } catch {}
    throw err;
  }
}

if (require.main === module) {
  const [, , buildDir, slug] = process.argv;
  run(buildDir, slug).then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}
module.exports = { run };
