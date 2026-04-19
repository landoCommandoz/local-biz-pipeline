/**
 * Brewington Yard — Pre-Launch Readiness Check
 *
 * Runs a go/no-go audit across every layer of the yard:
 *   - Env vars (required vs optional)
 *   - Bay directories and state.json presence
 *   - Scheduler config matches bay dirs
 *   - Every bay's tick runs clean end-to-end
 *   - External services reachable (Stripe/Netlify/Twilio/GHL/Itch/Overpass/godview)
 *   - Bay setup status (who's blocked on what)
 *   - Escalation path (Twilio/WhatsApp)
 *   - Disk space
 *   - API endpoints reachable via port 3000
 *   - Dashboard /api/state returns expected shape
 *
 * Usage: node scripts/readiness-check.js
 * Writes: businesses/readiness-report.md
 * Exit code: 0 if GO, 1 if NO-GO
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const http = require('http');

const REPO_ROOT = path.resolve(__dirname, '..');
const BUSINESSES_DIR = path.join(REPO_ROOT, 'businesses');
const REPORT_PATH = path.join(BUSINESSES_DIR, 'readiness-report.md');
const SCHEDULER_PATH = path.join(BUSINESSES_DIR, 'scheduler.js');
const SKIP_BAY = new Set(['lib', 'public', 'node_modules', '.git', '.archive', 'yard-dist']);

const REQUIRED_ENV = [
  { key: 'ANTHROPIC_API_KEY', why: 'Jax designer + Vault pitcher + any LLM work' },
  { key: 'BUTLER_API_KEY',    why: 'Vault publishes to Itch.io' },
  { key: 'REPLICATE_API_TOKEN', why: 'Flux image generation (if/when used)' }
];
const OPTIONAL_ENV = [
  { key: 'REDDIT_CLIENT_ID',    why: 'SignalScout polls Reddit' },
  { key: 'REDDIT_CLIENT_SECRET', why: 'SignalScout polls Reddit' },
  { key: 'TWILIO_ACCOUNT_SID',  why: 'WhatsApp escalation from any bay' },
  { key: 'TWILIO_AUTH_TOKEN',   why: 'WhatsApp escalation' },
  { key: 'GMAIL_APP_PASSWORD',  why: 'Jax outreach email' },
  { key: 'STRIPE_API_KEY',      why: 'Vault tracks Stripe revenue' },
  { key: 'NETLIFY_AUTH_TOKEN',  why: 'Jax deploys preview sites' },
  { key: 'GHL_API_KEY',         why: 'Brix monitors GHL status' },
  { key: 'GUMROAD_ACCESS_TOKEN', why: 'Vega imports Gumroad sales' }
];

function listBays() {
  return fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP_BAY.has(n));
}

function readState(bay) {
  const p = path.join(BUSINESSES_DIR, bay, 'state.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

// ---------- Individual checks ----------

function checkEnvVars() {
  const required_missing = REQUIRED_ENV.filter((e) => !process.env[e.key]);
  const optional_missing = OPTIONAL_ENV.filter((e) => !process.env[e.key]);
  return {
    ok: required_missing.length === 0,
    severity: required_missing.length > 0 ? 'blocker' : (optional_missing.length > 0 ? 'warn' : 'green'),
    detail: required_missing.length === 0
      ? `all ${REQUIRED_ENV.length} required env vars present`
      : `${required_missing.length} required env vars missing`,
    gaps: [
      ...required_missing.map((e) => `REQUIRED missing: ${e.key} — ${e.why}`),
      ...optional_missing.map((e) => `OPTIONAL missing: ${e.key} — ${e.why}`)
    ]
  };
}

function checkBayDirs() {
  const bays = listBays();
  const missing = [];
  for (const bay of bays) {
    const d = path.join(BUSINESSES_DIR, bay);
    if (!fs.existsSync(path.join(d, 'charter.md'))) missing.push(`${bay}: no charter.md`);
    if (!fs.existsSync(path.join(d, 'state.json'))) missing.push(`${bay}: no state.json`);
    if (!fs.existsSync(path.join(d, 'tick.js'))) missing.push(`${bay}: no tick.js`);
  }
  return {
    ok: missing.length === 0,
    severity: missing.length > 0 ? 'blocker' : 'green',
    detail: `${bays.length} bays checked, ${missing.length} structural issues`,
    gaps: missing,
    data: { bays }
  };
}

function checkSchedulerCadences() {
  if (!fs.existsSync(SCHEDULER_PATH)) {
    return { ok: false, severity: 'blocker', detail: 'scheduler.js missing', gaps: ['scheduler.js not found'] };
  }
  const src = fs.readFileSync(SCHEDULER_PATH, 'utf-8');
  const cadenceBlock = src.match(/const CADENCE\s*=\s*\{([\s\S]*?)\};/);
  if (!cadenceBlock) return { ok: false, severity: 'blocker', detail: 'CADENCE block not found', gaps: [] };
  const bays = listBays();
  const registered = [];
  const missing = [];
  for (const bay of bays) {
    const re = new RegExp(`\\b${bay}\\s*:`, 'm');
    if (re.test(cadenceBlock[1])) registered.push(bay);
    else missing.push(bay);
  }
  return {
    ok: missing.length === 0,
    severity: missing.length > 0 ? 'warn' : 'green',
    detail: `${registered.length}/${bays.length} bays registered in scheduler CADENCE`,
    gaps: missing.map((b) => `bay ${b} not in scheduler.js CADENCE`)
  };
}

function checkEachBayTick() {
  const bays = listBays();
  const results = [];
  for (const bay of bays) {
    const tickPath = path.join(BUSINESSES_DIR, bay, 'tick.js');
    if (!fs.existsSync(tickPath)) { results.push({ bay, ok: false, detail: 'no tick.js' }); continue; }
    // Builder's tick runs the designer (Claude API call, 60-120s). Other bays
    // are sub-second plumbing. Give builder 3 minutes, others 30s.
    const timeout = bay === 'builder' ? 180000 : 30000;
    const r = spawnSync('node', [tickPath], {
      cwd: REPO_ROOT, encoding: 'utf-8', timeout
    });
    results.push({
      bay,
      ok: r.status === 0,
      detail: r.status === 0 ? 'exited 0' : `exited ${r.status}${r.signal ? ' ('+r.signal+')' : ''}`,
      stderr_tail: (r.stderr || '').trim().split('\n').slice(-3).join(' | ')
    });
  }
  const failed = results.filter((r) => !r.ok);
  return {
    ok: failed.length === 0,
    severity: failed.length > 0 ? 'blocker' : 'green',
    detail: `${results.length - failed.length}/${results.length} bay ticks exited cleanly`,
    gaps: failed.map((r) => `${r.bay} tick failed: ${r.detail} ${r.stderr_tail || ''}`),
    data: results
  };
}

async function checkExternalServices() {
  try {
    const sysb = require(path.join(BUSINESSES_DIR, 'realtor', 'system-builder.js'));
    const report = await sysb.runOnce();
    const offline = report.checks.filter((c) => !c.ok);
    return {
      ok: offline.length === 0,
      severity: offline.length > 0 ? 'warn' : 'green',
      detail: `${report.systems_online}/${report.systems_checked} external services reachable (avg ${report.avg_latency_ms}ms)`,
      gaps: offline.map((c) => `${c.system} (${c.url}) — status ${c.status} ${c.error || ''}`)
    };
  } catch (err) {
    return { ok: false, severity: 'warn', detail: 'system-builder failed', gaps: [err.message] };
  }
}

function checkBayStatus() {
  const bays = listBays();
  const blocked = [];
  for (const bay of bays) {
    const s = readState(bay);
    if (!s) continue;
    if (s.status === 'awaiting_lando_setup' || s.status === 'blocked_on_env') {
      blocked.push(`${s.display_name || bay}: ${s.last_escalation_reason || s.status}`);
    }
  }
  return {
    ok: blocked.length === 0,
    severity: blocked.length > 0 ? 'warn' : 'green',
    detail: `${bays.length - blocked.length}/${bays.length} bays cleared setup`,
    gaps: blocked
  };
}

function checkEscalationPath() {
  const p = path.join(BUSINESSES_DIR, 'twilio-whatsapp.js');
  const hasFile = fs.existsSync(p);
  const hasCreds = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
  const ok = hasFile && hasCreds;
  return {
    ok,
    severity: ok ? 'green' : 'warn',
    detail: ok ? 'escalation path ready' : `twilio lib ${hasFile ? 'present' : 'missing'}, creds ${hasCreds ? 'set' : 'missing'}`,
    gaps: [
      !hasFile ? 'businesses/twilio-whatsapp.js not found' : null,
      !hasCreds ? 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing' : null
    ].filter(Boolean)
  };
}

function checkDiskSpace() {
  try {
    const out = execFileSync('df', ['-h', REPO_ROOT], { encoding: 'utf-8' });
    const line = out.trim().split('\n').slice(-1)[0];
    const cols = line.split(/\s+/);
    const usePct = cols[4];
    const avail = cols[3];
    const pctNum = parseInt(usePct, 10) || 0;
    return {
      ok: pctNum < 90,
      severity: pctNum >= 90 ? 'blocker' : (pctNum >= 75 ? 'warn' : 'green'),
      detail: `disk ${usePct} used, ${avail} free`,
      gaps: pctNum >= 90 ? [`disk at ${usePct}, clear space before 24/7`] : []
    };
  } catch { return { ok: true, severity: 'warn', detail: 'df unavailable', gaps: [] }; }
}

async function httpHead(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      res.resume();
      res.on('end', () => resolve({ ok: res.statusCode < 400, status: res.statusCode }));
    });
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0 }); });
  });
}

async function checkApiEndpoints() {
  const endpoints = ['/', '/api/state', '/api/realestate', '/api/activity'];
  const results = [];
  for (const ep of endpoints) {
    const r = await httpHead('http://localhost:3000' + ep);
    results.push({ endpoint: ep, ...r });
  }
  const failed = results.filter((r) => !r.ok);
  return {
    ok: failed.length === 0,
    severity: failed.length > 0 ? 'blocker' : 'green',
    detail: `${results.length - failed.length}/${results.length} port-3000 endpoints responding`,
    gaps: failed.map((r) => `${r.endpoint} returned ${r.status}`)
  };
}

async function checkDashboardShape() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/state', { timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          const d = JSON.parse(body);
          const expected = ['time', 'overall', 'businesses'];
          const missing = expected.filter((k) => !(k in d));
          const bayCount = (d.businesses || []).length;
          resolve({
            ok: missing.length === 0 && bayCount > 0,
            severity: (missing.length === 0 && bayCount > 0) ? 'green' : 'warn',
            detail: `/api/state: ${bayCount} bays, keys=${Object.keys(d).join(',')}`,
            gaps: missing.map((k) => `/api/state missing key: ${k}`)
          });
        } catch {
          resolve({ ok: false, severity: 'blocker', detail: 'invalid JSON from /api/state', gaps: [] });
        }
      });
    });
    req.on('error', () => resolve({ ok: false, severity: 'blocker', detail: '/api/state unreachable', gaps: [] }));
  });
}

// ---------- Runner ----------

const CHECKS = [
  { name: 'env vars',              fn: checkEnvVars },
  { name: 'bay directory structure', fn: checkBayDirs },
  { name: 'scheduler cadence config', fn: checkSchedulerCadences },
  { name: 'each bay tick runs',    fn: checkEachBayTick },
  { name: 'external services',     fn: checkExternalServices },
  { name: 'bay setup status',      fn: checkBayStatus },
  { name: 'escalation path',       fn: checkEscalationPath },
  { name: 'disk space',            fn: checkDiskSpace },
  { name: 'port 3000 endpoints',   fn: checkApiEndpoints },
  { name: 'dashboard data shape',  fn: checkDashboardShape }
];

function severitySymbol(s) { return s === 'green' ? '✅' : s === 'warn' ? '🟡' : s === 'blocker' ? '⛔' : '❓'; }

async function run() {
  const results = [];
  for (const { name, fn } of CHECKS) {
    process.stdout.write(`  running: ${name.padEnd(32)}`);
    try {
      const r = await fn();
      results.push({ check: name, ...r });
      console.log(`${severitySymbol(r.severity)} ${r.detail}`);
    } catch (err) {
      results.push({ check: name, ok: false, severity: 'blocker', detail: `threw: ${err.message}`, gaps: [] });
      console.log(`⛔ threw: ${err.message}`);
    }
  }

  const blockers = results.filter((r) => r.severity === 'blocker');
  const warns   = results.filter((r) => r.severity === 'warn');
  const greens  = results.filter((r) => r.severity === 'green');

  const go = blockers.length === 0;
  const report = buildReport({ results, blockers, warns, greens, go });
  fs.writeFileSync(REPORT_PATH, report, 'utf-8');

  console.log('');
  console.log(go ? '✅ GO — yard is ready for 24/7' : '⛔ NO-GO — blockers must be cleared');
  console.log(`   ${blockers.length} blockers · ${warns.length} warnings · ${greens.length} green`);
  console.log(`   full report: ${path.relative(process.cwd(), REPORT_PATH)}`);
  process.exit(go ? 0 : 1);
}

function buildReport({ results, blockers, warns, greens, go }) {
  const lines = [];
  lines.push(`# Brewington Yard — Pre-Launch Readiness Report`);
  lines.push(``);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(``);
  lines.push(`## Verdict`);
  lines.push(``);
  lines.push(go ? `✅ **GO** — yard is ready for 24/7 autonomous operation.` : `⛔ **NO-GO** — ${blockers.length} blocker${blockers.length === 1 ? '' : 's'} must be cleared before going 24/7.`);
  lines.push(``);
  lines.push(`- ${blockers.length} blockers`);
  lines.push(`- ${warns.length} warnings`);
  lines.push(`- ${greens.length} green`);
  lines.push(``);

  if (blockers.length > 0) {
    lines.push(`## Blockers (must fix)`);
    lines.push(``);
    for (const r of blockers) {
      lines.push(`### ⛔ ${r.check}`);
      lines.push(`${r.detail}`);
      lines.push(``);
      if (r.gaps && r.gaps.length) for (const g of r.gaps) lines.push(`- ${g}`);
      lines.push(``);
    }
  }
  if (warns.length > 0) {
    lines.push(`## Warnings (launch is safe, but fix soon)`);
    lines.push(``);
    for (const r of warns) {
      lines.push(`### 🟡 ${r.check}`);
      lines.push(`${r.detail}`);
      lines.push(``);
      if (r.gaps && r.gaps.length) for (const g of r.gaps) lines.push(`- ${g}`);
      lines.push(``);
    }
  }
  lines.push(`## All checks`);
  lines.push(``);
  for (const r of results) {
    lines.push(`- ${severitySymbol(r.severity)} **${r.check}** — ${r.detail}`);
  }
  lines.push(``);
  return lines.join('\n');
}

run().catch((err) => { console.error('readiness check fatal:', err); process.exit(2); });
