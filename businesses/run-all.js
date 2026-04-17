/* Pre-flight orchestrator.
 *   node businesses/run-all.js check  -> verifies the whole yard is wired correctly
 *   node businesses/run-all.js plan   -> check + scheduler plan + watchdog findings
 *   node businesses/run-all.js start  -> plan + start the scheduler (ticks the agents)
 *   Nothing actually RUNS in check or plan mode. Only `start` begins ticking.
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');

const BUSINESSES_DIR = __dirname;
const SKIP = new Set(['lib', 'public', 'node_modules', '.git', '.archive']);

const REQUIRED_ENV = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'TWILIO_WHATSAPP_TO',
  'ANTHROPIC_API_KEY'
];
const RECOMMENDED_ENV = [
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
  'NETLIFY_API_KEY'
];

function listAgents() {
  return fs
    .readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP.has(n));
}

function checkAgent(name) {
  const dir = path.join(BUSINESSES_DIR, name);
  const files = ['charter.md', 'state.json', 'tick.js'];
  const missing = files.filter((f) => !fs.existsSync(path.join(dir, f)));
  let state = null;
  if (!missing.includes('state.json')) {
    try {
      state = JSON.parse(fs.readFileSync(path.join(dir, 'state.json'), 'utf-8'));
    } catch (err) {
      return { name, ok: false, missing, error: `state.json unparseable: ${err.message}` };
    }
  }
  return {
    name,
    ok: missing.length === 0,
    missing,
    state_status: state ? state.status : null,
    state_mode: state ? state.current_mode : null
  };
}

function checkEnv() {
  const missing_required = REQUIRED_ENV.filter((k) => !process.env[k]);
  const missing_recommended = RECOMMENDED_ENV.filter((k) => !process.env[k]);
  return { missing_required, missing_recommended };
}

function checkLib() {
  const libs = ['lib/logger.js', 'lib/state.js', 'lib/watchdog.js', 'scheduler.js', 'twilio-whatsapp.js'];
  return libs.map((rel) => ({
    path: rel,
    ok: fs.existsSync(path.join(BUSINESSES_DIR, rel))
  }));
}

function banner(str) {
  const line = '='.repeat(str.length + 4);
  return `\n${line}\n  ${str}\n${line}`;
}

function printCheck() {
  console.log(banner('BREWINGTON YARD PRE-FLIGHT'));

  // env
  const env = checkEnv();
  console.log('\n[env]');
  if (env.missing_required.length === 0) {
    console.log('  OK  required env vars present (twilio + anthropic)');
  } else {
    console.log(`  FAIL missing required env: ${env.missing_required.join(', ')}`);
  }
  if (env.missing_recommended.length > 0) {
    console.log(`  WARN missing recommended env: ${env.missing_recommended.join(', ')}`);
  } else {
    console.log('  OK  recommended env vars present (gmail + netlify)');
  }

  // lib
  console.log('\n[lib]');
  const libs = checkLib();
  for (const l of libs) {
    console.log(`  ${l.ok ? 'OK  ' : 'FAIL'} ${l.path}`);
  }

  // agents
  console.log('\n[agents]');
  const agents = listAgents().map(checkAgent);
  for (const a of agents) {
    if (a.ok) {
      console.log(
        `  OK  ${a.name.padEnd(12)} status=${a.state_status} mode=${a.state_mode}`
      );
    } else if (a.error) {
      console.log(`  FAIL ${a.name.padEnd(12)} ${a.error}`);
    } else {
      console.log(
        `  FAIL ${a.name.padEnd(12)} missing: ${a.missing.join(', ')}`
      );
    }
  }

  // summary
  const envOk = env.missing_required.length === 0;
  const libOk = libs.every((l) => l.ok);
  const agentsOk = agents.every((a) => a.ok);
  const allOk = envOk && libOk && agentsOk;
  console.log(`\n[summary] ${allOk ? 'READY' : 'NOT READY'}`);
  if (!allOk) {
    console.log('  fix the FAIL lines above before running start');
  }
  return { allOk, env, libs, agents };
}

async function printPlan() {
  const result = printCheck();
  if (!result.allOk) return result;

  const scheduler = require('./scheduler');
  const watchdog = require('./lib/watchdog');

  console.log('\n[scheduler]');
  const jobs = scheduler.plan();
  console.log(`  ${jobs.filter((j) => j.status === 'ready').length} agents ready to tick`);

  console.log('\n[watchdog]');
  const findings = watchdog.check();
  if (findings.length === 0) {
    console.log('  OK  no issues detected');
  } else {
    for (const f of findings) {
      console.log(`  ${f.severity} ${f.agent}: ${f.reason}`);
    }
  }
  return { ...result, jobs, watchdog_findings: findings };
}

async function doStart() {
  const result = await printPlan();
  if (!result.allOk) {
    console.log('\nABORTING: fix the NOT READY items first.');
    process.exit(1);
  }
  const scheduler = require('./scheduler');
  console.log(banner('STARTING SCHEDULER - AGENTS WILL TICK'));
  scheduler.start();
  // keep process alive
}

const mode = process.argv[2] || 'check';
if (mode === 'check') {
  printCheck();
} else if (mode === 'plan') {
  printPlan();
} else if (mode === 'start') {
  doStart();
} else {
  console.error('Usage: node businesses/run-all.js [check|plan|start]');
  process.exit(1);
}
