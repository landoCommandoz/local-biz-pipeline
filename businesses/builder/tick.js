/* Builder tick.
 *   Runs every 4h once the scheduler is started.
 *   First tick (dry_run): picks one untouched prospect that passes the /sites/ blocklist,
 *   drafts the Email 1 body, WOULD run generator + deployer + outreach but does NOT until Lando
 *   flips mode to "live_send". Escalates with the draft plan and asks for approval.
 *   In "live_send" mode: runs the full pipeline for one prospect per tick, capped at 10 sends
 *   per rolling 24h per charter.
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');
const { escalate } = require('../twilio-whatsapp');
const { readCSV } = require('../../csv-utils');

const NAME = 'builder';
const PROSPECTS_PATH = path.join(__dirname, '../../prospects.csv');
const LEADS_PATH = path.join(__dirname, '../../leads.csv');
const OUTREACH_LOG_PATH = path.join(__dirname, '../../outreach-log.json');
const SITES_DIR = path.join(__dirname, '../../sites');

function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function loadBuiltSiteSlugs() {
  const out = new Set();
  for (const dir of [SITES_DIR, path.join(__dirname, '../../prospectai/sites')]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.html')) out.add(f.replace(/\.html$/, ''));
    }
  }
  return out;
}

function loadOutreachLog() {
  if (!fs.existsSync(OUTREACH_LOG_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(OUTREACH_LOG_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

async function pickNextProspect() {
  const rows = await readCSV(PROSPECTS_PATH);
  const blockedSlugs = loadBuiltSiteSlugs();
  const log = loadOutreachLog();
  const touched = new Set(log.map((e) => slugify(e.business)));

  return rows.find((r) => {
    const slug = slugify(r['Business Name']);
    if (blockedSlugs.has(slug)) return false; // built-site rule
    if (touched.has(slug)) return false; // already in outreach sequence
    return true;
  });
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

    const mode = s.current_mode || 'dry_run';

    if (mode === 'dry_run' && s.status === 'awaiting_first_tick') {
      log.info('first tick dry run: picking candidate prospect');

      const prospect = await pickNextProspect();
      if (!prospect) {
        log.warn('no untouched prospect available');
        await state.recordTick({
          summary: 'first tick: no prospect found (all touched or blocked)',
          status: 'awaiting_lando_reply',
          mode,
          failed: false
        });
        try {
          await escalate({
            business: NAME,
            reason: 'No untouched prospect available for first tick',
            detail:
              'Every row in prospects.csv is either already in outreach or has a built site. Need fresh prospects (run prospector.js) or a new city x trade.'
          });
        } catch {}
        return { no_prospect: true };
      }

      const bizName = prospect['Business Name'];
      const slug = slugify(bizName);
      log.info('picked prospect', {
        business: bizName,
        city: prospect.City,
        trade: prospect.Trade,
        rating: prospect.Rating
      });

      const plan = {
        prospect: bizName,
        city: prospect.City,
        trade: prospect.Trade,
        rating: prospect.Rating,
        reviews: prospect.Reviews,
        slug,
        original_site: prospect.Website || '(none)',
        steps: [
          'generator.js builds a rebuilt preview HTML into sites/',
          `deployer.js deploys to ${slug}.netlify.app`,
          'agentQA.js audits the deployed preview for placeholders',
          'outreach.js sends Email 1 with preview URL embedded'
        ],
        note:
          'Dry run only. No HTML generated, no site deployed, no email sent until Lando flips current_mode to "live_send".'
      };

      // escalate
      try {
        await escalate({
          business: NAME,
          reason: 'First prospect picked, approve live-send mode?',
          detail: `Prospect: ${bizName} (${prospect.Trade}, ${prospect.City}, rating ${prospect.Rating}/${prospect.Reviews} reviews)
Original site: ${prospect.Website || '(none)'}
Planned slug: ${slug}.netlify.app

Steps on live_send:
  1. generator.js builds preview
  2. deployer.js deploys to Netlify
  3. agentQA.js audits deployment
  4. outreach.js sends Email 1 with preview URL

Approve live_send mode? Reply Y to flip mode to live_send, or N to hold.`
        });
        log.info('escalation sent');
      } catch (err) {
        log.error('escalate failed', { error: err.message });
      }

      await state.recordTick({
        summary: `First tick: picked ${bizName}, awaiting live_send approval`,
        status: 'awaiting_lando_reply',
        mode,
        failed: false
      });
      return { plan };
    }

    if (mode === 'dry_run') {
      log.info('subsequent dry run tick, nothing to do until Lando approves live_send');
      await state.recordTick({
        summary: 'dry run tick: still awaiting live_send approval',
        status: s.status,
        mode,
        failed: false
      });
      return { skipped: true };
    }

    if (mode === 'live_send') {
      // TODO Phase 2: actually invoke generator + deployer + agentQA + outreach.
      // Respect the 10-sends-per-24h cap. Escalate on warm reply.
      log.info('live send tick (Phase 2 implementation TBD)');
      await state.recordTick({
        summary: 'live send stub (not yet implemented)',
        status: s.status,
        mode,
        failed: false
      });
      return { stub: true };
    }

    log.warn('unknown mode, skipping', { mode });
    return { skipped: true };
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
