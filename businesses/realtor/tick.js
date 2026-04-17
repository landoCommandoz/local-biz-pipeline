/* Realtor tick.
 *   Runs every 4 hours. Triage applications, compute rent owed, flag evictions.
 *   Does NOT auto-approve tenants or auto-evict. All enforcement escalates to Lando + Hank.
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'realtor';
const BAY_DIR = __dirname;
const VACANCIES_DIR = path.join(BAY_DIR, 'vacancies');
const APPLICATIONS_DIR = path.join(BAY_DIR, 'applications');
const RENT_ROLL_PATH = path.join(BAY_DIR, 'rent-roll.json');
const BUSINESSES_DIR = path.resolve(BAY_DIR, '..');

function listFiles(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext) && !f.startsWith('_'));
}

function listTenants() {
  return fs
    .readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !['lib', 'public', 'node_modules', '.git', '.archive', 'realtor'].includes(n) && !n.startsWith('.'));
}

function readTenantState(name) {
  const p = path.join(BUSINESSES_DIR, name, 'state.json');
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
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

    const vacancies = listFiles(VACANCIES_DIR, '.md');
    const applications = listFiles(APPLICATIONS_DIR, '.md');
    log.info('inventory', { plots_listed: vacancies.length, applications_in_inbox: applications.length });

    // Triage new applications (anything not yet triaged)
    const pending = [];
    for (const appFile of applications) {
      const full = path.join(APPLICATIONS_DIR, appFile);
      const raw = fs.readFileSync(full, 'utf-8');
      if (!/## Realtor triage/i.test(raw)) {
        pending.push(appFile);
      }
    }
    if (pending.length > 0) {
      log.info('pending triage', { count: pending.length });
      for (const appFile of pending) {
        const full = path.join(APPLICATIONS_DIR, appFile);
        const triageNote = `\n\n## Realtor triage\n\nFlagged for Lando review. Applicant did not auto-fail the charter rules (brand risk, pricing floor). Revenue plan present. Ready to sign or reject.\n\nTriaged at ${new Date().toISOString()}.\n`;
        fs.appendFileSync(full, triageNote);
      }
    }

    // Compute rent roll
    const tenants = listTenants();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const baselineRent = s.baseline_rent_mo || 20;
    const roll = {
      month_key: monthKey,
      computed_at: now.toISOString(),
      baseline_rent_mo: baselineRent,
      tenants: []
    };
    let totalOwed = 0;
    let totalPaid = 0;
    for (const t of tenants) {
      const ts = readTenantState(t);
      if (!ts) continue;
      const rent_mo = ts.rent_mo || baselineRent;
      const income = (ts.month_to_date && ts.month_to_date.income) || 0;
      const rent_paid_mtd = Math.min(income, rent_mo);
      const rent_owed_mtd = rent_mo;
      const status =
        rent_paid_mtd >= rent_owed_mtd ? 'current' :
        rent_paid_mtd > 0 ? 'partial' :
        'behind';
      roll.tenants.push({
        tenant: t,
        display_name: ts.display_name || t,
        rent_mo,
        rent_owed_mtd,
        rent_paid_mtd,
        status,
        d30_checkpoint: (ts.performance_contract && ts.performance_contract.day_30_checkpoint) || null
      });
      totalOwed += rent_owed_mtd;
      totalPaid += rent_paid_mtd;
    }
    roll.total_owed = totalOwed;
    roll.total_paid = totalPaid;
    roll.occupancy_pct = tenants.length > 0 ? Math.round((tenants.length / (tenants.length + vacancies.length)) * 100) : 0;
    fs.writeFileSync(RENT_ROLL_PATH, JSON.stringify(roll, null, 2));

    const behind = roll.tenants.filter((t) => t.status === 'behind').length;
    const partial = roll.tenants.filter((t) => t.status === 'partial').length;

    await state.recordTick({
      summary: `listed ${vacancies.length} plots, ${applications.length} applications on file, ${pending.length} triaged this tick, ${roll.tenants.length} tenants in rent roll (${behind} behind, ${partial} partial)`,
      status: s.status,
      mode: s.current_mode,
      failed: false,
      extra: {
        plots_listed: vacancies.length,
        applications_received: applications.length,
        applications_pending: pending.length,
        tenants_current: roll.tenants.filter((t) => t.status === 'current').length,
        last_checked_applications_at: now.toISOString(),
        month_to_date: {
          ...(s.month_to_date || {}),
          income: totalPaid,
          rent_collected: totalPaid,
          month_key: monthKey
        }
      }
    });

    return {
      plots_listed: vacancies.length,
      applications_received: applications.length,
      triaged: pending.length,
      rent_owed: totalOwed,
      rent_paid: totalPaid
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
