/* Test for gumroad-publisher.
 *   Stubs global.fetch so zero real calls leave the machine.
 *   Covers: publish-success, publish-missing-key, update-success,
 *   update-missing-key. Prints PASS / FAIL and exits non-zero on any miss.
 *
 *   Run: node businesses/lib/gumroad-publisher.test.js
 */
const path = require('path');
const Module = require('module');

// Stub the shared logger so tests never write to the real scout/log.md or
// log.jsonl. The publisher module pulls logger via ./logger so we intercept
// that exact require path.
const loggerPath = path.resolve(__dirname, 'logger.js');
const origLoad = Module._load;
Module._load = function patched(request, parent, ...rest) {
  const resolved = (() => {
    try {
      return Module._resolveFilename(request, parent);
    } catch {
      return null;
    }
  })();
  if (resolved === loggerPath) {
    return {
      createLogger: () => ({
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {}
      })
    };
  }
  return origLoad.call(this, request, parent, ...rest);
};

const results = [];
function record(name, passed, detail) {
  results.push({ name, passed, detail: detail || '' });
  const tag = passed ? 'PASS' : 'FAIL';
  console.log(`${tag} :: ${name}${detail ? ' :: ' + detail : ''}`);
}

function installFakeFetch(handler) {
  global.fetch = async (url, init) => {
    const out = await handler(url, init);
    return {
      ok: out.ok !== false,
      status: out.status || 200,
      json: async () => out.json || {}
    };
  };
}

async function testPublishSuccess() {
  process.env.GUMROAD_ACCESS_TOKEN = 'test-token';
  delete require.cache[path.join(__dirname, 'gumroad-publisher.js')];
  const { publishListing } = require('./gumroad-publisher');

  let capturedUrl, capturedMethod, capturedBody;
  installFakeFetch(async (url, init) => {
    capturedUrl = url;
    capturedMethod = init.method;
    capturedBody = init.body;
    return {
      ok: true,
      status: 201,
      json: {
        success: true,
        product: {
          id: 'fake-prod-123',
          short_url: 'https://brewtonic.gumroad.com/l/faketest'
        }
      }
    };
  });

  const res = await publishListing({
    name: 'Test List',
    price_usd: 49,
    description: 'desc',
    short_url_slug: 'test-list',
    file_url: 'https://example.com/file.csv'
  });

  const urlOk = capturedUrl === 'https://api.gumroad.com/v2/products';
  const methodOk = capturedMethod === 'POST';
  const priceOk = capturedBody && capturedBody.includes('price=4900');
  const resultOk =
    res.ok === true &&
    res.product_id === 'fake-prod-123' &&
    res.short_url === 'https://brewtonic.gumroad.com/l/faketest';

  record(
    'publishListing success path',
    urlOk && methodOk && priceOk && resultOk,
    `url=${urlOk} method=${methodOk} priceCents=${priceOk} result=${resultOk}`
  );
}

async function testPublishMissingKey() {
  delete process.env.GUMROAD_ACCESS_TOKEN;
  delete require.cache[path.join(__dirname, 'gumroad-publisher.js')];
  const { publishListing } = require('./gumroad-publisher');

  let fetched = false;
  installFakeFetch(async () => {
    fetched = true;
    return { ok: true, json: {} };
  });

  const res = await publishListing({ name: 'x', price_usd: 1 });
  const passed =
    res.ok === false &&
    typeof res.reason === 'string' &&
    res.reason.includes('GUMROAD_ACCESS_TOKEN') &&
    fetched === false;

  record(
    'publishListing missing key soft-fails',
    passed,
    `ok=${res.ok} reason=${res.reason} fetched=${fetched}`
  );
}

async function testUpdateSuccess() {
  process.env.GUMROAD_ACCESS_TOKEN = 'test-token';
  delete require.cache[path.join(__dirname, 'gumroad-publisher.js')];
  const { updateListing } = require('./gumroad-publisher');

  let capturedUrl, capturedMethod, capturedBody;
  installFakeFetch(async (url, init) => {
    capturedUrl = url;
    capturedMethod = init.method;
    capturedBody = init.body;
    return {
      ok: true,
      status: 200,
      json: {
        success: true,
        product: {
          id: 'fake-prod-123',
          short_url: 'https://brewtonic.gumroad.com/l/faketest'
        }
      }
    };
  });

  const res = await updateListing('fake-prod-123', {
    description: 'updated desc',
    price_usd: 59
  });

  const urlOk =
    capturedUrl === 'https://api.gumroad.com/v2/products/fake-prod-123';
  const methodOk = capturedMethod === 'PUT';
  const priceOk = capturedBody && capturedBody.includes('price=5900');
  const descOk = capturedBody && capturedBody.includes('description=updated');
  const resultOk =
    res.ok === true && res.product_id === 'fake-prod-123';

  record(
    'updateListing success path',
    urlOk && methodOk && priceOk && descOk && resultOk,
    `url=${urlOk} method=${methodOk} priceCents=${priceOk} desc=${descOk} result=${resultOk}`
  );
}

async function testUpdateMissingKey() {
  delete process.env.GUMROAD_ACCESS_TOKEN;
  delete require.cache[path.join(__dirname, 'gumroad-publisher.js')];
  const { updateListing } = require('./gumroad-publisher');

  let fetched = false;
  installFakeFetch(async () => {
    fetched = true;
    return { ok: true, json: {} };
  });

  const res = await updateListing('fake-prod-123', { price_usd: 59 });
  const passed =
    res.ok === false &&
    typeof res.reason === 'string' &&
    res.reason.includes('GUMROAD_ACCESS_TOKEN') &&
    fetched === false;

  record(
    'updateListing missing key soft-fails',
    passed,
    `ok=${res.ok} reason=${res.reason} fetched=${fetched}`
  );
}

(async () => {
  await testPublishSuccess();
  await testPublishMissingKey();
  await testUpdateSuccess();
  await testUpdateMissingKey();

  const failed = results.filter((r) => !r.passed);
  console.log('');
  console.log(
    `SUMMARY :: ${results.length - failed.length}/${results.length} passed`
  );
  process.exit(failed.length ? 1 : 0);
})();
