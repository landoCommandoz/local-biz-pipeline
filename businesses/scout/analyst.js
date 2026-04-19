/**
 * Vega as Analyst — yard-wide business metrics aggregator.
 *
 * Every Vega tick, scan all bay state.jsons, sum MTD income / cost / net,
 * count clients, compute burn rate and break-even status. Write the summary
 * to metrics.json where the HUD and yard reports can read it.
 */
const fs = require('fs');
const path = require('path');

const BUSINESSES_DIR = path.resolve(__dirname, '..');
const METRICS_PATH = path.join(__dirname, 'metrics.json');
const SKIP = new Set(['lib', 'public', 'node_modules', '.git', '.archive', 'yard-dist']);

function listBays() {
  return fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !SKIP.has(n));
}

function readState(bay) {
  const p = path.join(BUSINESSES_DIR, bay, 'state.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function computeMetrics() {
  const bays = listBays().map((bay) => ({ bay, state: readState(bay) })).filter((r) => r.state);

  let income = 0, cost = 0, clients = 0;
  const perBay = [];
  for (const { bay, state } of bays) {
    const mtdIn = Number((state.month_to_date && state.month_to_date.income) || 0);
    const mtdCost = Number((state.month_to_date && state.month_to_date.cost) || 0);
    const tenants = Number(state.tenants_current || 0);
    const conversions = Number((state.month_to_date && state.month_to_date.conversions) || 0);
    income += mtdIn;
    cost += mtdCost;
    clients += Math.max(tenants, conversions);
    perBay.push({
      bay,
      display_name: state.display_name || bay,
      income: mtdIn,
      cost: mtdCost,
      tenants,
      conversions
    });
  }

  const net = income - cost;
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemainingInMonth = daysInMonth - dayOfMonth;
  const burnPerDay = dayOfMonth > 0 ? cost / dayOfMonth : 0;
  const breakEven = income >= cost;
  const shortfall = breakEven ? 0 : (cost - income);
  const daysToProfit = breakEven ? 0 :
    (burnPerDay > 0 ? Math.ceil(shortfall / burnPerDay) : null);

  return {
    at: now.toISOString(),
    month_to_date: { income, cost, net },
    mrr_estimate: income,
    client_count: clients,
    burn_rate_per_day: Math.round(burnPerDay * 100) / 100,
    day_of_month: dayOfMonth,
    days_remaining_in_month: daysRemainingInMonth,
    break_even: breakEven,
    shortfall_to_break_even: Math.round(shortfall * 100) / 100,
    days_until_profitable: daysToProfit,
    per_bay: perBay
  };
}

function runOnce() {
  const m = computeMetrics();
  fs.writeFileSync(METRICS_PATH, JSON.stringify(m, null, 2) + '\n', 'utf-8');
  return m;
}

module.exports = { runOnce, computeMetrics, METRICS_PATH };

if (require.main === module) {
  const m = runOnce();
  console.log(JSON.stringify(m, null, 2));
}
