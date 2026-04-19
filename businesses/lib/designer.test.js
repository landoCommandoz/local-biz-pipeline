/* Test for designer.js.
 *
 * Stubs the Anthropic SDK. Does not hit the API or touch real yard files.
 * Run: node businesses/lib/designer.test.js
 * Prints PASS or FAIL. Exits 0 on PASS, 1 on FAIL.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function fail(msg) {
  console.log('FAIL:', msg);
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) fail(msg);
}

function makeStubSDK(textToReturn) {
  function Ctor() {}
  Ctor.prototype.messages = {
    create: async () => ({
      id: 'stub',
      model: 'claude-stub',
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: textToReturn }],
      usage: { input_tokens: 100, output_tokens: 500 }
    })
  };
  return { Anthropic: Ctor };
}

async function main() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'designer-test-'));
  const briefPath = path.join(tmpRoot, 'brief.md');
  const outputPath = path.join(tmpRoot, 'out', 'index.html');

  fs.writeFileSync(briefPath, '# Brief\n\nMake a black page that says HELLO.\n', 'utf-8');

  const { designOnce } = require('./designer');

  // Case 1: happy path with a clean HTML response.
  const happyHtml =
    '<!doctype html>\n<html><head><title>t</title></head><body>HELLO</body></html>';
  let result = await designOnce({
    briefPath,
    outputPath,
    agent: 'builder-test',
    opts: { apiKey: 'test-key', SDK: makeStubSDK(happyHtml) }
  });
  assert(result.ok === true, 'expected ok=true, got ' + JSON.stringify(result));
  assert(fs.existsSync(outputPath), 'output file not written');
  const written = fs.readFileSync(outputPath, 'utf-8');
  assert(written === happyHtml, 'written HTML does not match response HTML');
  assert(result.bytes === Buffer.byteLength(happyHtml, 'utf-8'), 'bytes mismatch');
  assert(result.model === 'claude-stub', 'model not recorded');

  // Case 2: response wrapped in chatter. Designer must extract just the HTML.
  const wrappedResp =
    'Sure, here is the page:\n\n```html\n' +
    happyHtml +
    '\n```\n\nLet me know if you want changes.';
  const outputPath2 = path.join(tmpRoot, 'out2', 'index.html');
  result = await designOnce({
    briefPath,
    outputPath: outputPath2,
    agent: 'builder-test',
    opts: { apiKey: 'test-key', SDK: makeStubSDK(wrappedResp) }
  });
  assert(result.ok === true, 'wrapped case failed: ' + JSON.stringify(result));
  const written2 = fs.readFileSync(outputPath2, 'utf-8');
  assert(written2.startsWith('<!doctype html>'), 'extracted HTML missing doctype');
  assert(written2.endsWith('</html>'), 'extracted HTML missing closing tag');

  // Case 3: no HTML in response. Must NOT overwrite anything, returns ok=false.
  const outputPath3 = path.join(tmpRoot, 'out3', 'index.html');
  result = await designOnce({
    briefPath,
    outputPath: outputPath3,
    agent: 'builder-test',
    opts: { apiKey: 'test-key', SDK: makeStubSDK('I cannot help with that.') }
  });
  assert(result.ok === false, 'no-html case should fail');
  assert(result.reason === 'no html found in response', 'wrong reason: ' + result.reason);
  assert(!fs.existsSync(outputPath3), 'should not have written file on bad response');

  // Case 4: missing brief.
  result = await designOnce({
    briefPath: path.join(tmpRoot, 'does-not-exist.md'),
    outputPath: path.join(tmpRoot, 'out4', 'index.html'),
    agent: 'builder-test',
    opts: { apiKey: 'test-key', SDK: makeStubSDK(happyHtml) }
  });
  assert(result.ok === false, 'missing brief should fail');
  assert(result.reason === 'brief missing', 'wrong reason for missing brief');

  // Case 5: no API key. metered-anthropic returns a noop client; designer must
  // surface that as ok=false with a clear reason.
  const { _resetWarningForTests } = require('./metered-anthropic');
  _resetWarningForTests();
  delete process.env.ANTHROPIC_API_KEY;
  const outputPath5 = path.join(tmpRoot, 'out5', 'index.html');
  result = await designOnce({
    briefPath,
    outputPath: outputPath5,
    agent: 'builder-test'
  });
  assert(result.ok === false, 'no-api-key case should fail');
  assert(/noop/.test(result.reason), 'wrong reason for noop: ' + result.reason);
  assert(!fs.existsSync(outputPath5), 'should not write on noop');

  console.log('PASS: designer.js (5 cases)');
}

main().catch((err) => {
  console.log('FAIL: unexpected error', err);
  process.exit(1);
});
