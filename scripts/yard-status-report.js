/**
 * Yard Status Report
 *
 * Scans every bay under businesses/ and produces an honest report:
 *  - Who has a real job vs who is just ticking
 *  - Who is blocked, and on what
 *  - Whether the dashboard role label matches the underlying tick logic
 *
 * Run: node scripts/yard-status-report.js
 * Writes: businesses/yard-status-report.md (fresh every run)
 * Prints: short summary to stdout
 */

const fs = require('fs');
const path = require('path');

const BUSINESSES_DIR = path.resolve(__dirname, '..', 'businesses');
const SKIP = new Set(['lib', 'public', 'node_modules', '.git', '.archive', 'yard-dist']);
const OUT_PATH = path.join(BUSINESSES_DIR, 'yard-status-report.md');

const V9_ROLES = {
  builder:     'The Builder',
  foreman:     'The Hustler',
  scout:       'The Analyst',
  realtor:     'The System Builder',
  paymaster:   'The Guardian',
  vault:       'The Treasurer',
  signalscout: 'The Researcher'
};

const ORIGINAL_ROLES = {
  builder:     'site-rebuild + outreach',
  foreman:     'recruiter (hires agents and tools)',
  scout:       'prospect lead refresh',
  realtor:     'rent roll + listings',
  paymaster:   'ledger + sales import',
  vault:       'Itch.io asset monetization',
  signalscout: 'Reddit draft-queue watcher'
};

function listBays() {
  return fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP.has(n));
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function hoursSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function assess(bay, state) {
  if (!state) {
    return { job: 'UNKNOWN', active: false, blocked: 'state.json missing or unreadable', activity: null };
  }
  const mode = state.current_mode || 'unknown';
  const status = state.status || 'unknown';
  const lastTick = state.last_tick_at;
  const freshness = hoursSince(lastTick);
  const blocked = (status === 'awaiting_lando_setup' || status === 'blocked_on_env')
    ? (state.last_escalation_reason || 'awaiting setup')
    : null;
  const failures = state.failures_in_row || 0;

  // Bay-specific job-reality signal
  let jobReality = 'TICKING (no real work yet)';
  let activity = null;

  switch (bay) {
    case 'builder':
      // Real if internal_build has shipped any concept OR outreach log has activity
      if (state.last_tick_summary && /internal build complete|concept|prospect/i.test(state.last_tick_summary)) {
        jobReality = 'ACTIVE (designer runs + internal builds)';
        activity = state.last_tick_summary;
      }
      break;
    case 'foreman':
      // Hustler run? Hank recruits? Check hustle-queue and hunts_log
      const queuePath = path.join(BUSINESSES_DIR, bay, 'hustle-queue.jsonl');
      const queueLines = fs.existsSync(queuePath)
        ? fs.readFileSync(queuePath, 'utf-8').split('\n').filter(Boolean).length
        : 0;
      const huntsLog = Array.isArray(state.hunts_log) ? state.hunts_log.length : 0;
      if (queueLines > 0 || huntsLog > 0) {
        jobReality = `ACTIVE (${huntsLog} hunts filed, ${queueLines} prospects in Hustler queue)`;
        activity = `Most recent hunt: ${(state.hunts_log && state.hunts_log[state.hunts_log.length-1] || {}).brief_slug || 'n/a'}`;
      }
      break;
    case 'scout':
      if (state.analyst && state.analyst.last_run_at) {
        const a = state.analyst;
        jobReality = `ACTIVE (Analyst: MRR $${a.mrr_estimate}, ${a.client_count} clients, burn $${a.burn_rate_per_day}/day)`;
        activity = `break_even=${a.break_even} · last report ${a.last_run_at}`;
      } else {
        jobReality = 'TICKING (Analyst module not run yet)';
        activity = state.last_tick_summary;
      }
      break;
    case 'realtor':
      const tenants = state.tenants_current || 0;
      if (state.system_builder && state.system_builder.last_run_at) {
        const sb = state.system_builder;
        jobReality = `ACTIVE (System Builder: ${sb.systems_online}/${sb.systems_online + sb.systems_offline} systems up, ${sb.avg_latency_ms}ms avg) + ${tenants} tenants`;
        activity = sb.all_green ? 'all systems green' : `offline: ${(sb.offline_systems||[]).join(', ')}`;
      } else if (tenants > 0) {
        jobReality = `ACTIVE (${tenants} tenants on rent roll, System Builder not run yet)`;
        activity = state.last_tick_summary;
      }
      break;
    case 'paymaster':
      if (state.guardian && state.guardian.last_run_at) {
        const g = state.guardian;
        if (g.systems_clean) jobReality = `ACTIVE (Guardian: ${g.threat_count} threats, vault locked)`;
        else jobReality = `ALERT (Guardian: ${g.threat_count} threats — ${g.exposed_keys_count} keys, gitignore=${!g.gitignore_env_missing})`;
        activity = `last scan ${g.last_run_at}`;
      } else {
        jobReality = 'TICKING (Guardian module not run yet)';
        activity = state.last_tick_summary;
      }
      break;
    case 'vault':
      const pitches = fs.existsSync(path.join(BUSINESSES_DIR, 'vault', 'pitches'))
        ? fs.readdirSync(path.join(BUSINESSES_DIR, 'vault', 'pitches')).filter((f) => f.endsWith('.md')).length
        : 0;
      const listings = state.listings_live || 0;
      if (pitches > 0 || listings > 0) {
        jobReality = `ACTIVE (${pitches} pitches drafted, ${listings} listings live)`;
        const itch = state.itch_projects && Object.values(state.itch_projects)[0];
        activity = itch ? `Itch listing: ${itch.url}` : state.last_tick_summary;
      }
      break;
    case 'signalscout':
      jobReality = 'BLOCKED (awaiting Reddit creds)';
      activity = state.last_tick_summary;
      break;
  }

  return {
    job: jobReality,
    mode,
    status,
    freshness_hours: Math.round(freshness * 10) / 10,
    blocked,
    failures,
    activity,
    income_mtd: (state.month_to_date && state.month_to_date.income) || 0,
    cost_mtd: (state.month_to_date && state.month_to_date.cost) || 0
  };
}

function roleMismatch(bay) {
  const v9 = V9_ROLES[bay];
  const original = ORIGINAL_ROLES[bay];
  if (!v9 || !original) return null;
  const matches = v9.toLowerCase().includes(original.split(/\s/)[0].toLowerCase());
  return matches ? null : { v9_label: v9, actual_tick_logic: original };
}

function formatReport(rows) {
  const now = new Date().toISOString();
  const lines = [];
  lines.push(`# Yard Status Report\n`);
  lines.push(`Generated: ${now}`);
  lines.push(`\n## Summary\n`);
  const active = rows.filter(r => r.job.startsWith('ACTIVE')).length;
  const ticking = rows.filter(r => r.job.startsWith('TICKING')).length;
  const blocked = rows.filter(r => r.job.startsWith('BLOCKED')).length;
  lines.push(`- **${active} / ${rows.length}** bays have real work running`);
  lines.push(`- **${ticking}** are ticking but not yet doing their v9 role`);
  lines.push(`- **${blocked}** are blocked on credentials or setup`);
  lines.push(`\n## Per-Bay Status\n`);
  for (const r of rows) {
    lines.push(`### ${r.display_name} (${r.bay})`);
    lines.push(`- **V9 role label:** ${r.v9_role}`);
    lines.push(`- **Actual tick logic:** ${r.original_role}`);
    if (r.role_mismatch) lines.push(`- **Role mismatch:** ⚠️  dashboard says "${r.role_mismatch.v9_label}", tick runs "${r.role_mismatch.actual_tick_logic}"`);
    lines.push(`- **Has a real job:** ${r.job}`);
    lines.push(`- **Mode / status:** \`${r.mode}\` / \`${r.status}\``);
    lines.push(`- **Last tick:** ${r.freshness_hours === Infinity ? 'never' : r.freshness_hours + 'h ago'}`);
    if (r.failures > 0) lines.push(`- **Failures in a row:** ${r.failures}`);
    if (r.blocked) lines.push(`- **Blocked on:** ${r.blocked}`);
    if (r.activity) lines.push(`- **Latest activity:** ${r.activity}`);
    lines.push(`- **MTD income:** $${r.income_mtd} · **MTD cost:** $${r.cost_mtd}`);
    lines.push('');
  }
  lines.push(`## What needs attention\n`);
  const needs = [];
  rows.forEach(r => {
    if (r.role_mismatch) needs.push(`- **${r.display_name}** — rewrite \`tick.js\` from "${r.role_mismatch.actual_tick_logic}" to "${r.role_mismatch.v9_label}" role`);
    if (r.blocked) needs.push(`- **${r.display_name}** — ${r.blocked}`);
    if (r.failures > 0) needs.push(`- **${r.display_name}** — ${r.failures} failures in a row, investigate`);
  });
  if (needs.length === 0) lines.push(`No urgent issues. All bays are running their v9 roles.`);
  else lines.push(...needs);
  lines.push('');
  return lines.join('\n');
}

function main() {
  const bays = listBays();
  const rows = [];
  for (const bay of bays) {
    const statePath = path.join(BUSINESSES_DIR, bay, 'state.json');
    const state = readJSON(statePath);
    const a = assess(bay, state);
    rows.push({
      bay,
      display_name: (state && state.display_name) || bay,
      v9_role: V9_ROLES[bay] || '(no v9 label)',
      original_role: ORIGINAL_ROLES[bay] || '(unknown)',
      role_mismatch: roleMismatch(bay),
      ...a
    });
  }
  const report = formatReport(rows);
  fs.writeFileSync(OUT_PATH, report, 'utf-8');
  // Print short stdout summary
  console.log('=== YARD STATUS ===');
  rows.forEach(r => {
    const tag = r.job.startsWith('ACTIVE') ? '✅' : r.job.startsWith('BLOCKED') ? '⛔' : '⏳';
    console.log(`${tag} ${r.display_name.padEnd(13)} ${V9_ROLES[r.bay] || ''} — ${r.job}`);
  });
  console.log('');
  console.log('Full report written to', path.relative(process.cwd(), OUT_PATH));
}

main();
