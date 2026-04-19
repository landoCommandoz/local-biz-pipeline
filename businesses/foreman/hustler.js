/**
 * Hank as Hustler — prospect sourcing module.
 *
 * Finds local service businesses with weak (or no) websites via public data
 * sources. Scores each candidate by website quality signals. Appends the
 * top-scored candidates to hustle-queue.jsonl, where Jax's outreach pipeline
 * can pick them up as targets for rebuild + cold email.
 *
 * v1 sources:
 *  - OpenStreetMap Overpass API (free, no auth) for POI discovery
 *  - Direct HTTP fetch for website scoring (no auth)
 *
 * Scoring (higher = hotter target):
 *  +100  no website on record at all
 *  +80   website returns 4xx/5xx
 *  +60   website serves HTTP (not HTTPS)
 *  +40   no mobile viewport meta tag
 *  +30   page size under 10 KB (probably placeholder)
 *  +20   contains "under construction" / "coming soon"
 *
 * Each hustle run is scoped to one (city, trade) pair. Rotation handled by
 * caller so we do not hammer Overpass or starve a single area.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BAY_DIR = __dirname;
const QUEUE_PATH = path.join(BAY_DIR, 'hustle-queue.jsonl');
const DEFAULT_TIMEOUT_MS = 15000;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.osm.ch/api/interpreter'
];

/**
 * Map of human-readable trades to OpenStreetMap tag queries.
 * Extend as needed.
 */
const TRADE_TAGS = {
  hvac: '["craft"="hvac"]',
  plumber: '["craft"="plumber"]',
  electrician: '["craft"="electrician"]',
  auto_body: '["shop"="car_repair"]',
  detailer: '["shop"="car"]',
  roofer: '["craft"="roofer"]',
  landscaper: '["landuse"="landscape"]',
  painter: '["craft"="painter"]',
  cleaner: '["office"="company"]["name"~"clean",i]'
};

function httpGet(url, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, body }));
    });
    req.on('error', () => resolve({ ok: false, status: 0, body: '', error: true }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, body: '', timeout: true }); });
  });
}

function overpassQuery(city, trade) {
  const tradeTag = TRADE_TAGS[trade];
  if (!tradeTag) throw new Error(`unknown trade: ${trade}`);
  // Note: Overpass accepts an area name search. For city-state disambiguation,
  // extend with a state filter when needed.
  return `
[out:json][timeout:25];
area["name"="${city}"]["admin_level"~"^[68]$"]->.a;
(
  node${tradeTag}(area.a);
  way${tradeTag}(area.a);
);
out center tags 60;
`.trim();
}

async function fetchPOIs(city, trade) {
  const q = overpassQuery(city, trade);
  let lastRes = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const url = `${endpoint}?data=${encodeURIComponent(q)}`;
    const res = await httpGet(url, 25000);
    if (res.ok) { lastRes = res; break; }
    lastRes = res;
  }
  const res = lastRes;
  if (!res.ok) return { ok: false, reason: `all overpass mirrors failed, last status ${res.status}`, pois: [] };
  try {
    const data = JSON.parse(res.body);
    const elements = data.elements || [];
    const pois = elements
      .filter((el) => el.tags && el.tags.name)
      .map((el) => ({
        osm_id: `${el.type}/${el.id}`,
        name: el.tags.name,
        website: el.tags.website || el.tags['contact:website'] || null,
        phone: el.tags.phone || el.tags['contact:phone'] || null,
        address: [el.tags['addr:housenumber'], el.tags['addr:street'], el.tags['addr:city']].filter(Boolean).join(' '),
        lat: el.lat || (el.center && el.center.lat),
        lon: el.lon || (el.center && el.center.lon),
        raw_tags: el.tags
      }));
    return { ok: true, pois };
  } catch (err) {
    return { ok: false, reason: `overpass parse failed: ${err.message}`, pois: [] };
  }
}

async function scoreWebsite(url) {
  if (!url) return { score: 100, reason: 'no website on record' };

  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `http://${normalized}`;

  const startedHttp = normalized.startsWith('http://');
  const res = await httpGet(normalized);
  let score = 0;
  const reasons = [];

  if (!res.ok) {
    score += 80;
    reasons.push(`website returns ${res.status || 'unreachable'}`);
    return { score, reason: reasons.join(' | ') };
  }
  if (startedHttp && !res.status) {
    // redirected or unreachable on http
  }

  if (startedHttp) {
    score += 60;
    reasons.push('http (not https)');
  }

  const body = (res.body || '').toLowerCase();
  const bodySize = body.length;

  if (!/viewport/.test(body)) {
    score += 40;
    reasons.push('no mobile viewport meta');
  }
  if (bodySize < 10000) {
    score += 30;
    reasons.push(`page under 10KB (${bodySize} bytes)`);
  }
  if (/under construction|coming soon|site is being updated/i.test(body)) {
    score += 20;
    reasons.push('under construction copy detected');
  }

  return { score, reason: reasons.length ? reasons.join(' | ') : 'website healthy, deprioritize' };
}

function ensureQueue() {
  if (!fs.existsSync(QUEUE_PATH)) fs.writeFileSync(QUEUE_PATH, '', 'utf-8');
}

function queueAppend(rows) {
  ensureQueue();
  const lines = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
  fs.appendFileSync(QUEUE_PATH, lines, 'utf-8');
}

function queueReadAll() {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  return fs.readFileSync(QUEUE_PATH, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

/**
 * Run one hustle cycle: fetch POIs in target area, score each, write top N
 * to the queue. Returns a summary object for the caller to log.
 */
async function hustleOnce({ city, trade, maxResults = 10, scoreThreshold = 40 } = {}) {
  if (!city || !trade) return { ok: false, reason: 'missing city or trade' };

  const existing = queueReadAll();
  const seen = new Set(existing.map((r) => r.osm_id));

  const { ok, pois, reason } = await fetchPOIs(city, trade);
  if (!ok) return { ok: false, reason, prospects_found: 0 };

  const scored = [];
  for (const poi of pois) {
    if (seen.has(poi.osm_id)) continue;
    const s = await scoreWebsite(poi.website);
    if (s.score >= scoreThreshold) {
      scored.push({
        at: new Date().toISOString(),
        city,
        trade,
        ...poi,
        score: s.score,
        score_reason: s.reason
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxResults);
  if (top.length > 0) queueAppend(top);

  return {
    ok: true,
    city,
    trade,
    pois_scanned: pois.length,
    new_candidates_scored: scored.length,
    added_to_queue: top.length,
    queue_depth_after: existing.length + top.length,
    top_pick: top[0] || null
  };
}

module.exports = {
  hustleOnce,
  fetchPOIs,
  scoreWebsite,
  queueReadAll,
  TRADE_TAGS,
  QUEUE_PATH
};

// CLI: node hustler.js <city> <trade>
if (require.main === module) {
  const [, , city = 'Phoenix', trade = 'hvac'] = process.argv;
  hustleOnce({ city, trade }).then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  });
}
