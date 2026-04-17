/* Metered Anthropic SDK wrapper.
 *   Every messages.create call from a client returned by getClient(agentName)
 *   appends a usage row to businesses/paymaster/usage.jsonl so Doss can
 *   compute tokens-per-dollar-earned per agent.
 *
 *   Falls back to a no-op client if ANTHROPIC_API_KEY is missing so agent
 *   dev work does not crash. The warning logs once per process.
 *
 *   No em dashes. Use "model", "agent", "automation".
 */
const fs = require('fs');
const path = require('path');

const BUSINESSES_DIR = path.resolve(__dirname, '..');
const USAGE_PATH = path.join(BUSINESSES_DIR, 'paymaster', 'usage.jsonl');

let _warnedMissingKey = false;
let _SDKRef = null;

function _loadSDK() {
  if (_SDKRef) return _SDKRef;
  // Lazy require so tests can stub via SDK option and missing deps do not
  // explode at import time.
  // eslint-disable-next-line global-require
  _SDKRef = require('@anthropic-ai/sdk');
  return _SDKRef;
}

function _ensureUsageFile() {
  const dir = path.dirname(USAGE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USAGE_PATH)) fs.writeFileSync(USAGE_PATH, '', 'utf-8');
}

function _appendUsage(row) {
  try {
    _ensureUsageFile();
    fs.appendFileSync(USAGE_PATH, JSON.stringify(row) + '\n', 'utf-8');
  } catch (err) {
    // Never let a metering failure break the caller. Swallow and continue.
    if (process.env.DEBUG_METER) {
      // eslint-disable-next-line no-console
      console.error('[metered-anthropic] failed to append usage:', err.message);
    }
  }
}

function _recordCall({ agent, model, response, error, startedAt, params }) {
  const usage = response && response.usage ? response.usage : {};
  const row = {
    at: new Date().toISOString(),
    started_at: startedAt,
    agent: agent || 'unknown',
    model: (response && response.model) || (params && params.model) || model || null,
    input_tokens:
      typeof usage.input_tokens === 'number' ? usage.input_tokens : 0,
    output_tokens:
      typeof usage.output_tokens === 'number' ? usage.output_tokens : 0,
    cache_creation_input_tokens:
      typeof usage.cache_creation_input_tokens === 'number'
        ? usage.cache_creation_input_tokens
        : 0,
    cache_read_input_tokens:
      typeof usage.cache_read_input_tokens === 'number'
        ? usage.cache_read_input_tokens
        : 0,
    stop_reason: (response && response.stop_reason) || null,
    ok: !error,
    error: error ? String(error.message || error) : null
  };
  _appendUsage(row);
  return row;
}

function _noopClient(agentName) {
  if (!_warnedMissingKey) {
    _warnedMissingKey = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[metered-anthropic] ANTHROPIC_API_KEY missing. Returning no-op client for agent: ' +
        (agentName || 'unknown')
    );
  }
  return {
    _noop: true,
    messages: {
      create: async (params) => {
        const response = {
          id: 'noop',
          model: (params && params.model) || 'noop',
          stop_reason: 'noop',
          content: [],
          usage: { input_tokens: 0, output_tokens: 0 }
        };
        _recordCall({
          agent: agentName,
          model: response.model,
          response,
          error: null,
          startedAt: new Date().toISOString(),
          params
        });
        return response;
      }
    }
  };
}

/* Wrap an already-constructed Anthropic SDK instance. Exposed so tests can
 * pass their own fake SDK instance through the same metering path without
 * needing an API key. */
function wrapInstance(rawClient, agentName) {
  if (!rawClient || !rawClient.messages || typeof rawClient.messages.create !== 'function') {
    throw new Error('[metered-anthropic] wrapInstance: invalid client');
  }
  const originalCreate = rawClient.messages.create.bind(rawClient.messages);
  rawClient.messages.create = async function meteredCreate(params) {
    const startedAt = new Date().toISOString();
    try {
      const response = await originalCreate(params);
      _recordCall({
        agent: agentName,
        model: params && params.model,
        response,
        error: null,
        startedAt,
        params
      });
      return response;
    } catch (err) {
      _recordCall({
        agent: agentName,
        model: params && params.model,
        response: null,
        error: err,
        startedAt,
        params
      });
      throw err;
    }
  };
  return rawClient;
}

/* Main export. Returns an instrumented Anthropic SDK client for agentName.
 *   opts.apiKey     optional override, defaults to process.env.ANTHROPIC_API_KEY
 *   opts.SDK        optional SDK constructor override (used by tests)
 */
function getClient(agentName, opts = {}) {
  const apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return _noopClient(agentName);

  const SDK = opts.SDK || _loadSDK();
  // The SDK default export is a class; supports { default } or the module itself.
  const Ctor = SDK.default || SDK.Anthropic || SDK;
  const raw = new Ctor({ apiKey });
  return wrapInstance(raw, agentName);
}

module.exports = {
  getClient,
  wrapInstance,
  _usagePath: USAGE_PATH,
  _resetWarningForTests: () => {
    _warnedMissingKey = false;
  }
};
