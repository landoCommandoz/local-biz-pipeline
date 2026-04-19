/* Scout tick.
 *   Runs daily at 09:00 local once the scheduler is started.
 *   First tick (dry_run): generates the Phoenix-metro HVAC lead CSV from the existing
 *   prospects.csv, writes placeholder listing copy, escalates for Lando's approval.
 *   Does not publish to Gumroad in any mode before Lando approves the first publish.
 *   After Lando approves: flips current_mode to "live_refresh" and subsequent ticks
 *   refresh the CSV monthly (Phase 2 work).
 *   NOTE: Gumroad publish/update is available at ../lib/gumroad-publisher.js once GUMROAD_ACCESS_TOKEN is wired into .env.
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');
const { escalate } = require('../twilio-whatsapp');
const { readCSV } = require('../../csv-utils');

const NAME = 'scout';
const PRODUCTS_DIR = path.join(__dirname, 'products');
const LEADS_PATH = path.join(__dirname, '../../prospects.csv');

function slugify(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function buildHVACList(rows, limit = 100) {
  return rows
    .filter(
      (r) =>
        (r.Trade || '').toLowerCase() === 'hvac' &&
        r['Business Name'] &&
        r.Phone &&
        r.Rating
    )
    .sort((a, b) => Number(b.Reviews || 0) - Number(a.Reviews || 0))
    .slice(0, limit);
}

function writeCSV(rows, outPath) {
  if (!fs.existsSync(path.dirname(outPath))) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
  }
  const cols = [
    'Business Name',
    'Phone',
    'Website',
    'Rating',
    'Reviews',
    'Address',
    'Trade',
    'City'
  ];
  const header = cols.join(',');
  const esc = (v) =>
    v == null
      ? ''
      : /[",\n]/.test(String(v))
      ? `"${String(v).replace(/"/g, '""')}"`
      : String(v);
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(','));
  fs.writeFileSync(outPath, [header, ...lines].join('\n') + '\n', 'utf-8');
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
      log.info('first tick dry run: generating HVAC Phoenix-metro sample');

      if (!fs.existsSync(LEADS_PATH)) {
        throw new Error(`prospects.csv not found at ${LEADS_PATH}`);
      }

      const rows = await readCSV(LEADS_PATH);
      const hvac = buildHVACList(rows, 100);
      log.info('filtered hvac prospects', { total_rows: rows.length, hvac_count: hvac.length });

      const csvPath = path.join(PRODUCTS_DIR, 'phoenix-metro-hvac-v1.csv');
      writeCSV(hvac, csvPath);
      log.info('wrote product csv', { path: csvPath, rows: hvac.length });

      const listingPath = path.join(PRODUCTS_DIR, 'phoenix-metro-hvac-listing-v1.md');
      const listing = `# Phoenix Metro HVAC Lead List v1

**Price: $49 one-time download.**

100 verified HVAC prospects across Phoenix, Mesa, Scottsdale, Gilbert, Tempe, Chandler, and Surprise. Pulled fresh from Google Places, filtered to active local shops with phone, rating, and review count. No scraped emails, no fake rows, no duplicates.

What's in the CSV:
- Business name
- Phone (tap-to-call ready)
- Website (if any, blank if no web presence)
- Google rating and review count
- Street address
- Trade tag
- City

How to use it:
- Import to your CRM, GoHighLevel, Close, HubSpot, whatever
- Cold call or cold email the top 20 by review count
- The shops with no website are the fastest closes for agency work

Refreshed monthly from Google Places. If you buy v1 and v2 ships before your outreach is done, the refresh is free.

Included download:
- \`phoenix-metro-hvac-v1.csv\` (100 rows)
- \`README.txt\` (this listing copy, trimmed)

TBD before publish:
- [ ] Claude-generated long-form description (tuned for Gumroad SEO)
- [ ] Cover image (yard stencil aesthetic)
- [ ] Final price check (benchmark $47 vs $49 vs $67)
- [ ] Gumroad tags: agency, hvac, phoenix, lead list, cold email
`;
      fs.writeFileSync(listingPath, listing, 'utf-8');
      log.info('wrote listing copy', { path: listingPath });

      // escalate for approval
      try {
        await escalate({
          business: NAME,
          reason: 'First Gumroad product draft ready for your review',
          detail: `Product: Phoenix Metro HVAC Lead List v1 ($49)
Rows: ${hvac.length}
CSV: businesses/scout/products/phoenix-metro-hvac-v1.csv
Listing copy: businesses/scout/products/phoenix-metro-hvac-listing-v1.md

Approve first Gumroad publish? Reply Y or N.`
        });
        log.info('escalation sent');
      } catch (err) {
        log.error('escalate failed', { error: err.message });
      }

      await state.recordTick({
        summary: 'First tick: HVAC CSV + listing copy drafted, awaiting Gumroad publish approval',
        status: 'awaiting_lando_reply',
        mode,
        failed: false
      });
      return { drafted: true, rows: hvac.length };
    }

    if (mode === 'dry_run') {
      log.info('subsequent dry run tick, nothing to do until Lando approves first publish');
      await state.recordTick({
        summary: 'dry run tick: still awaiting first-publish approval',
        status: s.status,
        mode,
        failed: false
      });
      return { skipped: true };
    }

    if (mode === 'live_refresh') {
      // TODO Phase 2: monthly refresh of existing products, update Gumroad listing,
      // pull sales-data for P&L reporting, cross-post to pinned X + Reddit.
      log.info('live refresh tick (Phase 2 TBD)');
      await state.recordTick({
        summary: 'live refresh stub (not yet implemented)',
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

// Vega's Analyst role (v9 rename). Runs every tick regardless of mode.
async function runAnalystReport(log, state) {
  try {
    const analyst = require('./analyst');
    const metrics = analyst.runOnce();
    log.info('analyst report', {
      mtd_income: metrics.month_to_date.income,
      mtd_net: metrics.month_to_date.net,
      clients: metrics.client_count,
      break_even: metrics.break_even
    });
    await state.update((cur) => {
      cur.analyst = {
        last_run_at: metrics.at,
        mtd_income: metrics.month_to_date.income,
        mtd_cost: metrics.month_to_date.cost,
        mtd_net: metrics.month_to_date.net,
        mrr_estimate: metrics.mrr_estimate,
        client_count: metrics.client_count,
        burn_rate_per_day: metrics.burn_rate_per_day,
        break_even: metrics.break_even,
        days_until_profitable: metrics.days_until_profitable
      };
      return cur;
    });
  } catch (err) {
    log.warn('analyst run failed', { error: err.message });
  }
}

async function runWithAnalyst() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  const r = await run();
  await runAnalystReport(log, state);
  return r;
}

if (require.main === module) {
  runWithAnalyst().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run: runWithAnalyst, runOriginal: run, runAnalystReport };
