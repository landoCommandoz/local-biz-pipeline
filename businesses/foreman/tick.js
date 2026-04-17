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
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');
const watchdog = require('../lib/watchdog');
const { escalate } = require('../twilio-whatsapp');

const NAME = 'foreman';
const APPLICATIONS_DIR = path.join(__dirname, '..', 'realtor', 'applications');

// Candidate tenant pitch templates. Each tick, Hank picks one at random (if it
// has not been drafted already this week) and drops it in Brix's inbox. These
// are SEED pitches, not final. Lando + Brix decide which get approved. New
// templates can be appended at any time without code changes.
const TENANT_IDEAS = [
  { slug: 'verse-smiths', biz: 'Verse Smiths', mech: 'Ghostwrite wedding toasts, eulogies, and vow drafts at $75 flat per piece. Intake via a simple Tally form.', target: 450, kill: 'Under 3 paid drafts by day 30.', fit: 'Reflects Brewington tone: personal, local, plain-spoken.' },
  { slug: 'signal-scribe', biz: 'Signal Scribe', mech: 'Weekly paid newsletter at $6/mo covering small-town auto-shop stories in the southwest. First 50 readers are seeded from Lando network.', target: 180, kill: 'Under 30 paying subs by day 30.', fit: 'Shares the HOTR voice without crowding its brand.' },
  { slug: 'lot-lifter', biz: 'Lot Lifter', mech: 'Flat-rate $40 listing photo tune-ups for used-car Facebook Marketplace sellers. Volume play with fast turnaround.', target: 400, kill: 'Under 10 paid tune-ups by day 30.', fit: 'Auto-world adjacent, matches Brewington people.' },
  { slug: 'block-builder', biz: 'Block Builder', mech: 'One-off $120 landing-page builds for local contractors off Builder\'s existing prospect list. Zero recurring, pure volume.', target: 480, kill: 'Zero builds sold by day 30.', fit: 'Complements Jax without cannibalizing his $297/mo plan.' },
  { slug: 'feed-foreman', biz: 'Feed Foreman', mech: 'Short-form video clips summarizing the yard\'s week for Lando-branded YouTube Shorts and TikTok. Monetized via creator fund and channel memberships.', target: 200, kill: 'Under 500 total views across all platforms by day 30.', fit: 'Turns the yard into a slow-burn content property.' },
  { slug: 'deal-digger', biz: 'Deal Digger', mech: 'Curated weekly drop of Phoenix-area estate and garage sale listings as a $7/mo subscription newsletter.', target: 140, kill: 'Under 20 subs by day 30.', fit: 'Local, concrete, useful.' },
  { slug: 'reply-ranch', biz: 'Reply Ranch', mech: 'Managed cold reply service for other indie outreach ops. $99/mo per seat, one seat per client, Gmail inbox monitor + daily digest.', target: 300, kill: 'Zero paid seats by day 30.', fit: 'Adjacent to Builder, does not compete.' }
];

// Hank drafts one tenant pitch per tick, if today has no drafts yet. Writes
// the markdown into realtor/applications/ where Brix will triage on his next
// tick. This is how the yard keeps "actively building" even when no human
// applicant shows up.
function scoutTenantPitch(log) {
  try {
    if (!fs.existsSync(APPLICATIONS_DIR)) {
      log.warn('realtor/applications dir missing, skipping scout');
      return null;
    }
    const today = new Date().toISOString().slice(0, 10);
    const todays = fs
      .readdirSync(APPLICATIONS_DIR)
      .filter((f) => f.startsWith(`hank-${today}`));
    if (todays.length >= 1) {
      log.info('scout already dropped one pitch today, skipping');
      return null;
    }
    const existing = new Set(
      fs
        .readdirSync(APPLICATIONS_DIR)
        .map((f) => f.replace(/^hank-\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''))
    );
    const fresh = TENANT_IDEAS.filter((t) => !existing.has(t.slug));
    if (fresh.length === 0) {
      log.info('all tenant ideas have been drafted already, skipping');
      return null;
    }
    const pick = fresh[Math.floor(Math.random() * fresh.length)];
    const filename = `hank-${today}-${pick.slug}.md`;
    const fullPath = path.join(APPLICATIONS_DIR, filename);
    const body = `# Application: ${pick.biz}

**Targeting plot:** any vacant plot
**Proposed bay slug:** ${pick.slug}
**Submitted at:** ${new Date().toISOString()}
**Submitted by:** Hank (yard foreman, scouting on behalf of a prospective tenant)

## Business name
${pick.biz}

## Revenue mechanic
${pick.mech}

## 30-day target
$${pick.target} net of the $20 rent.

## Kill criteria
${pick.kill}

## Brand-fit note
${pick.fit}

## Notes from Hank
This is a scout pitch. The actual tenant does not yet exist as a bay. If Lando greenlights, Brix coordinates the plop scaffold with Hank and Doss wires the ledger. If Lando rejects, the application gets filed under rejected/ and the slug stays reserved for 30 days before it can be re-pitched.
`;
    fs.writeFileSync(fullPath, body);
    log.info('scout dropped tenant pitch', { slug: pick.slug, file: filename });
    return { slug: pick.slug, file: filename };
  } catch (err) {
    log.error('scout failed', { error: err.message });
    return null;
  }
}

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

    // 5. Scout tenant pitch: draft one candidate application per tick (if not
    // already drafted today). This keeps Brix's inbox organically filling.
    const pitch = scoutTenantPitch(log);

    await state.recordTick({
      summary: `routine tick: ${readyNow.length} hires ready to install, ${watchRes.length} watchdog findings${pitch ? ', dropped pitch ' + pitch.slug : ''}`,
      status: s.status,
      mode: s.current_mode,
      failed: false
    });
    log.info('tick complete');
    return {
      ready_to_install: readyNow.length,
      watchdog_findings: watchRes.length,
      tenant_pitch: pitch
    };
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
