/* Hand-rolled monitoring + alerting.
 *   Reads every agent's state.json, detects issues (failures in a row, stuck
 *   awaiting-reply, unprofitable burn), and escalates via twilio-whatsapp.
 *   Safe to import. Runs only when check() or run() is called.
 */
const fs = require('fs');
const path = require('path');
const { escalate } = require('../twilio-whatsapp');

const BUSINESSES_DIR = path.resolve(__dirname, '..');
const SKIP = new Set(['lib', 'public', 'node_modules', '.git', '.archive']);

function listAgents() {
  return fs
    .readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP.has(n));
}

function readState(agent) {
  const p = path.join(BUSINESSES_DIR, agent, 'state.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function check() {
  const findings = [];
  const agents = listAgents();

  for (const agent of agents) {
    const state = readState(agent);
    if (!state) continue;

    // 1. failures_in_row over threshold
    if ((state.failures_in_row || 0) >= 3) {
      findings.push({
        agent,
        severity: 'HIGH',
        code: 'failing_repeatedly',
        reason: `failures_in_row = ${state.failures_in_row}`,
        detail: state.last_tick_summary || ''
      });
    }

    // 2. stuck on awaiting_lando_reply for more than 48h
    if (
      (state.status === 'awaiting_lando_reply' ||
        state.status === 'awaiting_approval' ||
        state.status === 'awaiting_gumroad_approval') &&
      state.last_escalation_at
    ) {
      const ageMs = Date.now() - new Date(state.last_escalation_at).getTime();
      const hours = ageMs / 3600000;
      if (hours > 48) {
        findings.push({
          agent,
          severity: 'MEDIUM',
          code: 'stuck_awaiting_reply',
          reason: `awaiting Lando reply for ${Math.round(hours)}h`,
          detail: state.last_escalation_reason || ''
        });
      }
    }

    // 3. budget burn without revenue
    const mtd = state.month_to_date || {};
    if ((mtd.cost || 0) > 20 && (mtd.income || 0) === 0) {
      findings.push({
        agent,
        severity: 'HIGH',
        code: 'burning_without_revenue',
        reason: `mtd cost $${mtd.cost} with $0 income`,
        detail: 'unprofitable, 30-day rule watch'
      });
    }

    // 4. stale tick (no tick in 48h while status is running/ticking)
    if (
      (state.status === 'running' || state.status === 'ticking') &&
      state.last_tick_at
    ) {
      const ageMs = Date.now() - new Date(state.last_tick_at).getTime();
      const hours = ageMs / 3600000;
      if (hours > 48) {
        findings.push({
          agent,
          severity: 'MEDIUM',
          code: 'stale_tick',
          reason: `no tick in ${Math.round(hours)}h while status=${state.status}`,
          detail: ''
        });
      }
    }
  }

  return findings;
}

async function run(opts = {}) {
  const findings = check();
  if (findings.length === 0) {
    return { ok: true, findings: [] };
  }
  if (opts.escalate !== false) {
    const detail = findings
      .map((f) => `${f.agent} [${f.severity}] ${f.code}: ${f.reason}`)
      .join('\n');
    try {
      await escalate({
        business: 'watchdog',
        reason: `${findings.length} issue(s) detected across the yard`,
        detail
      });
    } catch (err) {
      console.warn('[watchdog] escalate failed:', err.message);
    }
  }
  return { ok: false, findings };
}

module.exports = { check, run, listAgents, readState };
