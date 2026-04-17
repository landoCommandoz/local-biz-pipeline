/* Test for metered-anthropic wrapper. Run:
 *   node businesses/lib/metered-anthropic.test.js
 *
 * Prints PASS or FAIL. Uses a stub SDK, does not hit the network.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

// Point the wrapper at a throwaway usage.jsonl by staging a temp paymaster
// dir. We do this by overriding the module's _usagePath via a small shim:
// easiest and cleanest is to run in-place and snapshot/restore usage.jsonl.

const meter = require('./metered-anthropic');

const USAGE_PATH = meter._usagePath;
const BACKUP_PATH = USAGE_PATH + '.testbackup';

const results = [];
function check(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
}

function snapshotUsage() {
  if (fs.existsSync(USAGE_PATH)) {
    fs.copyFileSync(USAGE_PATH, BACKUP_PATH);
    fs.unlinkSync(USAGE_PATH);
  }
}
function restoreUsage() {
  if (fs.existsSync(USAGE_PATH)) fs.unlinkSync(USAGE_PATH);
  if (fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(BACKUP_PATH, USAGE_PATH);
    fs.unlinkSync(BACKUP_PATH);
  }
}

function readUsageLines() {
  if (!fs.existsSync(USAGE_PATH)) return [];
  return fs
    .readFileSync(USAGE_PATH, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

class FakeAnthropic {
  constructor(opts) {
    this.apiKey = opts.apiKey;
    this.messages = {
      create: async (params) => {
        // Simulate SDK response shape.
        return {
          id: 'msg_fake_1',
          model: params.model,
          stop_reason: 'end_turn',
          content: [{ type: 'text', text: 'ok' }],
          usage: { input_tokens: 42, output_tokens: 17 }
        };
      }
    };
  }
}

class FailingAnthropic {
  constructor(opts) {
    this.apiKey = opts.apiKey;
    this.messages = {
      create: async () => {
        throw new Error('boom');
      }
    };
  }
}

async function run() {
  snapshotUsage();
  try {
    // ---- Test 1: getClient records usage with real API key path. ----
    const client = meter.getClient('test-agent', {
      apiKey: 'sk-test-123',
      SDK: FakeAnthropic
    });
    check('client has messages.create', typeof client.messages.create === 'function');

    const resp = await client.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 50,
      messages: [{ role: 'user', content: 'hi' }]
    });
    check('response returned from SDK', resp && resp.id === 'msg_fake_1');

    const lines = readUsageLines();
    check('usage.jsonl has one row', lines.length === 1, `len=${lines.length}`);
    const row = lines[0] || {};
    check('row.agent is test-agent', row.agent === 'test-agent', `agent=${row.agent}`);
    check(
      'row.model is claude-3-5-sonnet-latest',
      row.model === 'claude-3-5-sonnet-latest',
      `model=${row.model}`
    );
    check('row.input_tokens is 42', row.input_tokens === 42, `in=${row.input_tokens}`);
    check('row.output_tokens is 17', row.output_tokens === 17, `out=${row.output_tokens}`);
    check('row.at is an ISO timestamp', typeof row.at === 'string' && row.at.includes('T'));
    check('row.ok is true', row.ok === true);

    // ---- Test 2: error path also records. ----
    const failClient = meter.getClient('test-agent', {
      apiKey: 'sk-test-123',
      SDK: FailingAnthropic
    });
    let threw = false;
    try {
      await failClient.messages.create({ model: 'claude-3-haiku', messages: [] });
    } catch (err) {
      threw = err && err.message === 'boom';
    }
    check('error propagates to caller', threw);

    const lines2 = readUsageLines();
    check('usage.jsonl has two rows after error', lines2.length === 2, `len=${lines2.length}`);
    const row2 = lines2[1] || {};
    check('error row.ok is false', row2.ok === false);
    check('error row.error is boom', row2.error === 'boom', `err=${row2.error}`);
    check('error row.input_tokens is 0', row2.input_tokens === 0);

    // ---- Test 3: no-op fallback when key is missing. ----
    delete process.env.ANTHROPIC_API_KEY;
    meter._resetWarningForTests();
    const noop = meter.getClient('test-agent', {}); // no apiKey, no env
    check('no-op client is marked _noop', noop._noop === true);
    const noopResp = await noop.messages.create({ model: 'noop-model' });
    check(
      'no-op returns a response echoing params.model',
      noopResp && noopResp.model === 'noop-model',
      `model=${noopResp && noopResp.model}`
    );

    const lines3 = readUsageLines();
    check('no-op call still records usage', lines3.length === 3, `len=${lines3.length}`);
    check('no-op row agent is test-agent', lines3[2].agent === 'test-agent');
  } finally {
    restoreUsage();
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    // eslint-disable-next-line no-console
    console.log((r.ok ? 'ok   ' : 'FAIL ') + r.name + (r.detail ? '  (' + r.detail + ')' : ''));
  }
  if (failed.length === 0) {
    // eslint-disable-next-line no-console
    console.log('\nPASS (' + results.length + ' checks)');
    process.exit(0);
  } else {
    // eslint-disable-next-line no-console
    console.log('\nFAIL (' + failed.length + '/' + results.length + ' checks failed)');
    process.exit(1);
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.log('FAIL (unexpected error: ' + err.message + ')');
  process.exit(1);
});
