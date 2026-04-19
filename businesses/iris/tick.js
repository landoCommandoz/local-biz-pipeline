/* IRIS tick.
 *   Visual regression + copy scan + axe-core a11y on every deployed client URL.
 *   Driven by MAX post-deploy event OR scheduled sweep (daily) across rent-roll URLs.
 *   Status machine: scaffolded -> active (first healthy tick; no env required, Chromium bundled).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/iris-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'iris';

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
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }

    // TODO: Read client URLs from rent-roll or from MAX's last-deploy event.
    //   Pitch ref: iris-pitch.md § "Integration plan if hired" step 3
    // TODO: For each URL, run Playwright spec at 390px + 1440px.
    //   - toHaveScreenshot() against baseline
    //   - page.textContent('body') scan for /\bAI\b/i and /\u2014/
    //   - inject axe-core, assert violations.critical.length === 0
    // TODO: Write report HTML + screenshots to iris/reports/<client>-<date>/.
    // TODO: Return exit code: 0 = pass, non-zero = block publish + escalate to MAX/Lando.

    await state.update((cur) => {
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: audit pipeline TODO', failed: false });
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
