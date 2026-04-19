/**
 * Brix as System Builder — external-service health probe.
 *
 * Checks core Brewington infrastructure each tick:
 *  - Stripe API reachability
 *  - Netlify API reachability
 *  - Twilio API reachability
 *  - GoHighLevel API reachability
 *  - Local port 3000 (godview server)
 *  - Local Overpass mirror used by Hank's Hustler
 *
 * Reports latency + status. Writes systems-status.json and flags in state.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REPORT_PATH = path.join(__dirname, 'systems-status.json');
const TIMEOUT_MS = 8000;

const SYSTEMS = [
  { name: 'stripe',   url: 'https://api.stripe.com/v1', expect_status_any: [401, 404] },
  { name: 'netlify',  url: 'https://api.netlify.com/api/v1/user', expect_status: 401 },
  { name: 'twilio',   url: 'https://api.twilio.com',     expect_status: 302 },
  { name: 'ghl',      url: 'https://services.leadconnectorhq.com/', expect_status_any: [200, 301, 302, 404] },
  { name: 'itch',     url: 'https://itch.io',            expect_status: 200 },
  { name: 'overpass', url: 'https://overpass-api.de/api/status', expect_status: 200 },
  { name: 'godview',  url: 'http://localhost:3000/',      expect_status: 200 }
];

function probe({ url, expect_status, expect_status_any }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: TIMEOUT_MS }, (res) => {
      const latency = Date.now() - started;
      res.resume(); // drain
      res.on('end', () => resolve({
        ok: expect_status_any
          ? expect_status_any.includes(res.statusCode)
          : (expect_status === undefined || res.statusCode === expect_status || (res.statusCode >= 200 && res.statusCode < 400)),
        status: res.statusCode,
        latency_ms: latency
      }));
    });
    req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message, latency_ms: Date.now() - started }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout', latency_ms: TIMEOUT_MS }); });
  });
}

async function runOnce() {
  const results = [];
  for (const sys of SYSTEMS) {
    const r = await probe(sys);
    results.push({ system: sys.name, url: sys.url, ...r });
  }
  const ok_count = results.filter((r) => r.ok).length;
  const avg_latency = results.filter((r) => r.latency_ms).reduce((s, r) => s + r.latency_ms, 0) / Math.max(1, results.length);

  const report = {
    at: new Date().toISOString(),
    systems_checked: results.length,
    systems_online: ok_count,
    systems_offline: results.length - ok_count,
    avg_latency_ms: Math.round(avg_latency),
    all_green: ok_count === results.length,
    checks: results
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');
  return report;
}

module.exports = { runOnce, SYSTEMS, REPORT_PATH };

if (require.main === module) {
  runOnce().then((r) => console.log(JSON.stringify(r, null, 2)));
}
