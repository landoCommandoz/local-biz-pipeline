/* Test for gumroad-reader.js.
 *
 * Does NOT hit the real Gumroad API. Uses a stub fetchImpl that returns a
 * canned payload. Redirects the module's file paths to a temp directory so
 * the real businesses/ files are never touched.
 *
 * Run: node businesses/lib/gumroad-reader.test.js
 * Prints PASS or FAIL. Exits 0 on PASS, 1 on FAIL.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function fail(msg) {
  console.log('FAIL:', msg);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

async function main() {
  // 1. Build a temp yard with the three dirs the reader expects.
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gumroad-reader-test-'));
  const businessesDir = path.join(tmpRoot, 'businesses');
  const paymasterDir = path.join(businessesDir, 'paymaster');
  const scoutDir = path.join(businessesDir, 'scout');
  const libDir = path.join(businessesDir, 'lib');
  fs.mkdirSync(paymasterDir, { recursive: true });
  fs.mkdirSync(scoutDir, { recursive: true });
  fs.mkdirSync(libDir, { recursive: true });

  // Seed a minimal ledger.json that matches the real project shape.
  const ledgerPath = path.join(paymasterDir, 'ledger.json');
  fs.writeFileSync(
    ledgerPath,
    JSON.stringify({
      since: '2026-04-17T00:00:00.000Z',
      income_total: 0,
      expense_total: 0,
      net: 0
    }, null, 2),
    'utf-8'
  );

  // Copy the reader source into the temp lib dir so BUSINESSES_DIR resolves
  // to the temp businesses/ (the module computes it from __dirname/..).
  const readerSrc = fs.readFileSync(path.join(__dirname, 'gumroad-reader.js'), 'utf-8');
  const tmpReaderPath = path.join(libDir, 'gumroad-reader.js');
  fs.writeFileSync(tmpReaderPath, readerSrc, 'utf-8');

  // Load the copy (fresh require cache).
  delete require.cache[require.resolve(tmpReaderPath)];
  const reader = require(tmpReaderPath);

  // 2. Stub the Gumroad API.
  const buyer1 = 'alice@example.com';
  const buyer2 = 'bob@example.com';
  const t1 = '2026-04-17T10:00:00.000Z';
  const t2 = '2026-04-17T11:30:00.000Z';

  const stubPayload = {
    success: true,
    sales: [
      {
        id: 'sale_1',
        product_id: 'yaghag',
        product_permalink: 'yaghag',
        price: 4900,
        email: buyer1,
        created_at: t1
      },
      {
        id: 'sale_2',
        product_id: 'yaghag',
        product_permalink: 'yaghag',
        price: 4900,
        email: buyer2,
        created_at: t2
      }
    ]
  };

  let fetchCalls = 0;
  const fetchImpl = async (url) => {
    fetchCalls += 1;
    assert(String(url).startsWith('https://api.gumroad.com/v2/sales'), 'reader should hit gumroad sales endpoint');
    assert(String(url).includes('access_token=test-token'), 'reader should pass access_token in query');
    return {
      ok: true,
      status: 200,
      json: async () => stubPayload
    };
  };

  // 3. Run pollSales.
  const result = await reader.pollSales({
    accessToken: 'test-token',
    fetchImpl
  });

  assert(result.ok === true, `expected ok=true, got ${JSON.stringify(result)}`);
  assert(result.new_sales === 2, `expected 2 new sales, got ${result.new_sales}`);
  assert(fetchCalls === 1, `expected 1 fetch call, got ${fetchCalls}`);

  // 4. Verify sales.jsonl.
  const salesPath = path.join(scoutDir, 'sales.jsonl');
  assert(fs.existsSync(salesPath), 'sales.jsonl should exist');
  const salesLines = fs.readFileSync(salesPath, 'utf-8').trim().split('\n').filter(Boolean);
  assert(salesLines.length === 2, `expected 2 lines in sales.jsonl, got ${salesLines.length}`);
  const salesRows = salesLines.map((l) => JSON.parse(l));

  const expectedHash1 = crypto.createHash('sha256').update(buyer1.toLowerCase()).digest('hex');
  const expectedHash2 = crypto.createHash('sha256').update(buyer2.toLowerCase()).digest('hex');

  assert(salesRows[0].buyer_email_hash === expectedHash1, 'sale 1 email should be sha256 hashed');
  assert(salesRows[1].buyer_email_hash === expectedHash2, 'sale 2 email should be sha256 hashed');
  assert(salesRows[0].price_usd === 49, `expected price_usd 49, got ${salesRows[0].price_usd}`);
  assert(salesRows[0].source === 'gumroad', 'source should be gumroad');
  assert(salesRows[0].product_id === 'yaghag', 'product_id should be yaghag');
  assert(salesRows[0].ts === t1, 'ts should match created_at');
  // Plaintext email must not be stored.
  const rawSales = fs.readFileSync(salesPath, 'utf-8');
  assert(!rawSales.includes(buyer1), 'plaintext email 1 must not appear in sales.jsonl');
  assert(!rawSales.includes(buyer2), 'plaintext email 2 must not appear in sales.jsonl');

  // 5. Verify ledger.json has two new income entries.
  const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
  assert(Array.isArray(ledger.entries), 'ledger.entries should be an array');
  assert(ledger.entries.length === 2, `expected 2 ledger entries, got ${ledger.entries.length}`);
  for (const e of ledger.entries) {
    assert(e.type === 'income', 'ledger entry type should be income');
    assert(e.agent === 'scout', 'ledger entry agent should be scout');
    assert(e.amount === 49, `ledger entry amount should be 49, got ${e.amount}`);
    assert(e.source === 'gumroad-sale', 'ledger entry source should be gumroad-sale');
    assert(e.product_id === 'yaghag', 'ledger entry product_id should be yaghag');
  }
  // Make sure we did not clobber existing ledger fields.
  assert(ledger.since === '2026-04-17T00:00:00.000Z', 'existing ledger.since should be preserved');

  // 6. Verify cursor advanced.
  const cursorPath = path.join(paymasterDir, 'gumroad-cursor.json');
  assert(fs.existsSync(cursorPath), 'cursor file should exist');
  const cursor = JSON.parse(fs.readFileSync(cursorPath, 'utf-8'));
  assert(cursor.last_seen === t2, `cursor should advance to latest sale, got ${cursor.last_seen}`);

  // 7. Running again should find zero new sales (cursor filter works).
  const result2 = await reader.pollSales({
    accessToken: 'test-token',
    fetchImpl
  });
  assert(result2.ok === true, 'second run should be ok');
  assert(result2.new_sales === 0, `second run should see 0 new sales, got ${result2.new_sales}`);

  // 8. Missing token returns a soft failure, does not throw.
  const oldEnv = process.env.GUMROAD_ACCESS_TOKEN;
  delete process.env.GUMROAD_ACCESS_TOKEN;
  const noToken = await reader.pollSales({ fetchImpl });
  assert(noToken.ok === false, 'missing token should return ok=false');
  assert(/GUMROAD_ACCESS_TOKEN/.test(noToken.reason), 'reason should mention env var');
  if (oldEnv !== undefined) process.env.GUMROAD_ACCESS_TOKEN = oldEnv;

  // Cleanup.
  fs.rmSync(tmpRoot, { recursive: true, force: true });

  console.log('PASS: gumroad-reader');
  process.exit(0);
}

main().catch((err) => {
  fail(`unexpected error: ${err && err.stack ? err.stack : err}`);
});
