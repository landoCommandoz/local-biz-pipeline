/* Per-agent logger.
 *   Writes JSON lines to <agent>/log.jsonl (machine-readable, pino-driven).
 *   Appends human-readable markdown to <agent>/log.md (so Lando + I can scroll it).
 *   Safe to import. Does nothing until a method is called.
 */
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const BUSINESSES_DIR = path.resolve(__dirname, '..');

function createLogger(agentName, opts = {}) {
  const dir = path.join(BUSINESSES_DIR, agentName);
  if (!fs.existsSync(dir)) {
    throw new Error(`[logger] agent dir not found: ${dir}`);
  }
  const jsonlPath = path.join(dir, 'log.jsonl');
  const mdPath = path.join(dir, 'log.md');

  const stream = fs.createWriteStream(jsonlPath, { flags: 'a' });
  const base = pino(
    {
      level: opts.level || process.env.LOG_LEVEL || 'info',
      base: { agent: agentName }
    },
    stream
  );

  function appendMd(level, msg, meta) {
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const metaStr =
      meta && typeof meta === 'object' && Object.keys(meta).length
        ? ' :: ' + JSON.stringify(meta)
        : '';
    fs.appendFileSync(mdPath, `${ts} :: ${level} :: ${msg}${metaStr}\n`);
  }

  return {
    info: (msg, meta) => {
      base.info(meta || {}, msg);
      appendMd('INFO', msg, meta);
    },
    warn: (msg, meta) => {
      base.warn(meta || {}, msg);
      appendMd('WARN', msg, meta);
    },
    error: (msg, meta) => {
      base.error(meta || {}, msg);
      appendMd('ERROR', msg, meta);
    },
    debug: (msg, meta) => {
      base.debug(meta || {}, msg);
    }
  };
}

module.exports = { createLogger };
