/* Yard scheduler.
 *   Uses Croner to run each agent's tick.js on its declared cadence.
 *   Usage:
 *     node scheduler.js plan   -> prints the schedule, does not start jobs
 *     node scheduler.js run    -> starts the scheduler, blocks until Ctrl+C
 *     require('./scheduler').start()  -> start in-process
 */
const path = require('path');
const fs = require('fs');
const { Cron } = require('croner');

const BUSINESSES_DIR = __dirname;
const SKIP = new Set(['lib', 'public', 'node_modules', '.git', '.archive']);

// Cadences per agent. Cron syntax: sec min hour dom month dow (we use 5-field: min hour dom month dow)
// These mirror the cadences declared in each agent's charter.
const CADENCE = {
  foreman: { cron: '0 */6 * * *', name: 'every 6 hours' },
  scout: { cron: '0 9 * * *', name: 'daily at 09:00 local' },
  builder: { cron: '0 */4 * * *', name: 'every 4 hours' },
  paymaster: { cron: '0 23 * * 0', name: 'Sunday at 23:00 (weekly digest)' },
  realtor: { cron: '0 */4 * * *', name: 'every 4 hours' }
};

function listAgents() {
  return fs
    .readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP.has(n));
}

function buildSchedule() {
  const jobs = [];
  for (const agent of listAgents()) {
    const tickPath = path.join(BUSINESSES_DIR, agent, 'tick.js');
    const cadence = CADENCE[agent];
    if (!cadence) {
      jobs.push({ agent, status: 'skip', reason: 'no cadence defined for this agent' });
      continue;
    }
    if (!fs.existsSync(tickPath)) {
      jobs.push({ agent, status: 'skip', reason: 'tick.js missing', cadence });
      continue;
    }
    jobs.push({ agent, status: 'ready', cadence, tickPath });
  }
  return jobs;
}

function plan() {
  const jobs = buildSchedule();
  console.log('[scheduler] Planned cadences:');
  for (const j of jobs) {
    if (j.status === 'ready') {
      console.log(`  OK    ${j.agent.padEnd(12)} ${j.cadence.name}  (${j.cadence.cron})`);
    } else {
      console.log(`  SKIP  ${j.agent.padEnd(12)} ${j.reason}`);
    }
  }
  return jobs;
}

function start() {
  const jobs = buildSchedule();
  const crons = [];
  for (const j of jobs) {
    if (j.status !== 'ready') continue;
    const cron = new Cron(j.cadence.cron, async () => {
      try {
        delete require.cache[require.resolve(j.tickPath)];
        const tick = require(j.tickPath);
        if (typeof tick.run === 'function') {
          await tick.run();
        } else {
          console.warn(`[scheduler] ${j.agent}: tick.js has no run() export`);
        }
      } catch (err) {
        console.error(`[scheduler] ${j.agent} tick failed:`, err.message);
      }
    });
    crons.push({ agent: j.agent, cron });
  }
  console.log(`[scheduler] ${crons.length} agent(s) scheduled, blocking until Ctrl+C.`);
  return crons;
}

if (require.main === module) {
  const mode = process.argv[2] || 'plan';
  if (mode === 'plan') {
    plan();
  } else if (mode === 'run') {
    start();
  } else {
    console.error('Usage: node scheduler.js [plan|run]');
    process.exit(1);
  }
}

module.exports = { buildSchedule, plan, start, listAgents };
