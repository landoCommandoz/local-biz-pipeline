/* Per-agent state manager.
 *   Atomic reads and writes to <agent>/state.json via write-file-atomic.
 *   Safe to import. Does nothing until a method is called.
 */
const fs = require('fs');
const path = require('path');
const writeFileAtomic = require('write-file-atomic');

const BUSINESSES_DIR = path.resolve(__dirname, '..');

function stateFor(agentName) {
  const dir = path.join(BUSINESSES_DIR, agentName);
  const statePath = path.join(dir, 'state.json');
  if (!fs.existsSync(dir)) {
    throw new Error(`[state] agent dir not found: ${dir}`);
  }

  function readSync() {
    try {
      return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    } catch (err) {
      throw new Error(`[state] failed to read ${statePath}: ${err.message}`);
    }
  }

  async function writeAtomic(next) {
    const json = JSON.stringify(next, null, 2) + '\n';
    await writeFileAtomic(statePath, json, 'utf-8');
    return next;
  }

  return {
    path: statePath,

    read: readSync,

    write: writeAtomic,

    // Convenience: read, mutate, write. Mutator may return a new object or
    // mutate the passed one and return nothing.
    update: async (mutator) => {
      const current = readSync();
      const result = await mutator(current);
      const next = result === undefined ? current : result;
      return writeAtomic(next);
    },

    // Convenience: stamp the standard tick fields and save.
    recordTick: async ({ summary, status, mode, failed }) => {
      const current = readSync();
      current.last_tick_at = new Date().toISOString();
      if (summary !== undefined) current.last_tick_summary = summary;
      if (status !== undefined) current.status = status;
      if (mode !== undefined) current.current_mode = mode;
      if (failed) {
        current.failures_in_row = (current.failures_in_row || 0) + 1;
      } else {
        current.failures_in_row = 0;
      }
      return writeAtomic(current);
    }
  };
}

module.exports = { stateFor };
