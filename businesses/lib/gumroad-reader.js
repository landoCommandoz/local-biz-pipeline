/* Gumroad sales reader.
 *
 * Pulls sales from the Gumroad API (https://api.gumroad.com/v2/sales) into
 * two places:
 *   - businesses/scout/sales.jsonl   (one line per sale, buyer email hashed)
 *   - businesses/paymaster/ledger.json  (summary entry appended to .entries[])
 *
 * Keeps a cursor at businesses/paymaster/gumroad-cursor.json so re-runs only
 * fetch new sales.
 *
 * Design notes:
 *   - No new npm packages. Uses native fetch (Node 18+).
 *   - No scheduler, no retry loops. The weekly tick calls pollSales() later.
 *   - Safe to import. Does nothing until pollSales() is called.
 *   - Injectable fetch for the test harness (opts.fetchImpl).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BUSINESSES_DIR = path.resolve(__dirname, '..');
const CURSOR_PATH = path.join(BUSINESSES_DIR, 'paymaster', 'gumroad-cursor.json');
const LEDGER_PATH = path.join(BUSINESSES_DIR, 'paymaster', 'ledger.json');
const SALES_PATH = path.join(BUSINESSES_DIR, 'scout', 'sales.jsonl');

const GUMROAD_API = 'https://api.gumroad.com/v2/sales';

function hashEmail(email) {
  if (!email) return null;
  return crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex');
}

function readJSON(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJSON(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf-8');
}

function appendJSONL(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf-8');
}

function readCursor() {
  if (!fs.existsSync(CURSOR_PATH)) {
    const seed = { last_seen: null };
    writeJSON(CURSOR_PATH, seed);
    return seed;
  }
  return readJSON(CURSOR_PATH, { last_seen: null });
}

function parseSaleTimestamp(sale) {
  // Gumroad returns ISO strings in `created_at` or sometimes `timestamp`.
  const raw = sale.created_at || sale.timestamp || sale.sale_timestamp || null;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function priceUsd(sale) {
  // Gumroad `price` is in cents. Fall back to `amount_cents` or `amount`.
  if (typeof sale.price === 'number') return Math.round(sale.price) / 100;
  if (typeof sale.amount_cents === 'number') return Math.round(sale.amount_cents) / 100;
  if (typeof sale.amount === 'number') return Number(sale.amount);
  return 0;
}

async function pollSales(opts = {}) {
  const token = opts.accessToken || process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, reason: 'GUMROAD_ACCESS_TOKEN missing, add to .env' };
  }

  const fetchImpl = opts.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) {
    return { ok: false, reason: 'fetch not available, requires Node 18+' };
  }

  const cursor = readCursor();
  const lastSeen = cursor.last_seen ? new Date(cursor.last_seen).getTime() : 0;

  const url = new URL(GUMROAD_API);
  url.searchParams.set('access_token', token);
  if (opts.productId) url.searchParams.set('product_id', opts.productId);
  if (cursor.last_seen) url.searchParams.set('after', cursor.last_seen.slice(0, 10));

  let payload;
  try {
    const res = await fetchImpl(url.toString());
    if (!res.ok) {
      return { ok: false, reason: `gumroad api status ${res.status}` };
    }
    payload = await res.json();
  } catch (err) {
    return { ok: false, reason: `gumroad fetch failed: ${err.message}` };
  }

  if (!payload || payload.success === false) {
    return { ok: false, reason: 'gumroad api returned success=false' };
  }

  const sales = Array.isArray(payload.sales) ? payload.sales : [];
  const fresh = sales
    .map((sale) => {
      const ts = parseSaleTimestamp(sale);
      return { sale, ts };
    })
    .filter(({ ts }) => ts && new Date(ts).getTime() > lastSeen)
    .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  if (fresh.length === 0) {
    return { ok: true, new_sales: 0 };
  }

  // Append to scout/sales.jsonl
  let latestTs = cursor.last_seen;
  for (const { sale, ts } of fresh) {
    const amount = priceUsd(sale);
    const record = {
      ts,
      product_id: sale.product_id || sale.product_permalink || null,
      price_usd: amount,
      buyer_email_hash: hashEmail(sale.email || sale.purchaser_email),
      source: 'gumroad'
    };
    appendJSONL(SALES_PATH, record);
    if (!latestTs || new Date(ts).getTime() > new Date(latestTs).getTime()) {
      latestTs = ts;
    }
  }

  // Append summary entries to paymaster/ledger.json under .entries[]
  // Read, mutate, write. Does not clobber existing top-level fields.
  const ledger = readJSON(LEDGER_PATH, {});
  if (!Array.isArray(ledger.entries)) ledger.entries = [];
  for (const { sale, ts } of fresh) {
    ledger.entries.push({
      ts,
      type: 'income',
      agent: 'scout',
      amount: priceUsd(sale) || 49,
      source: 'gumroad-sale',
      product_id: sale.product_id || sale.product_permalink || null
    });
  }
  writeJSON(LEDGER_PATH, ledger);

  // Update cursor last.
  writeJSON(CURSOR_PATH, { last_seen: latestTs });

  return { ok: true, new_sales: fresh.length };
}

module.exports = {
  pollSales,
  hashEmail,
  // exported for tests
  _paths: { CURSOR_PATH, LEDGER_PATH, SALES_PATH }
};
