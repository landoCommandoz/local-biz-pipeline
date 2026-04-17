/* Foreman tick.
 *   Runs on scheduled cadence (every 6h) once the scheduler is started.
 *   Does NOT auto-fire a hunt (hunts are trigger-only, dispatched from Claude).
 *   What it DOES do on a routine tick:
 *     - Read state
 *     - Check the approved_queue for items whose install_status is "ready_to_install" AND blocked_by is null, and note them (install itself is still done by Claude, not the tick)
 *     - Check if any agent has been stuck awaiting_lando_reply for > 48h (delegated to watchdog)
 *     - On Sundays at the 6h tick, run a performance review stub
 *   Safe to run. Sends zero emails. Makes zero API calls in dry_run mode.
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');
const watchdog = require('../lib/watchdog');
const { escalate } = require('../twilio-whatsapp');

const NAME = 'foreman';

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    const s = state.read();

    if (s.paused) {
      log.info('paused, skipping');
      return { skipped: true, reason: 'paused' };
    }

    // 1. Review the approved_queue
    const queue = Array.isArray(s.approved_queue) ? s.approved_queue : [];
    const readyNow = queue.filter(
      (q) => q.install_status === 'ready_to_install' && !q.blocked_by
    );
    const waiting = queue.filter((q) => q.install_status !== 'installed');
    log.info('approved queue review', {
      ready_now: readyNow.length,
      still_waiting: waiting.length
    });

    // 2. Delegate health check to watchdog (it walks all agents and escalates as needed)
    const watchRes = watchdog.check();
    if (watchRes.length > 0) {
      log.warn('watchdog found issues', { count: watchRes.length });
    }

    // 3. Sunday performance review stub
    const now = new Date();
    if (now.getDay() === 0) {
      log.info('sunday review stub (performance analysis TBD)');
    }

    // 4. If the hunt result is stale and Lando has not replied in > 48h, re-ping
    if (
      s.status === 'awaiting_lando_reply' &&
      s.last_escalation_at &&
      Date.now() - new Date(s.last_escalation_at).getTime() > 48 * 3600 * 1000
    ) {
      log.warn('stuck awaiting lando reply over 48h, pinging once');
      try {
        await escalate({
          business: NAME,
          reason: 'Reminder: batch still awaiting your A/P/H replies',
          detail: s.last_escalation_reason || ''
        });
      } catch (err) {
        log.error('escalate failed', { error: err.message });
      }
    }

    await state.recordTick({
      summary: `routine tick: ${readyNow.length} hires ready to install, ${watchRes.length} watchdog findings`,
      status: s.status,
      mode: s.current_mode,
      failed: false
    });
    log.info('tick complete');
    return { ready_to_install: readyNow.length, watchdog_findings: watchRes.length };
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
