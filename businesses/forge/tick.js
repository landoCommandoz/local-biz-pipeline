/* FORGE tick.
 *   Event-driven rebuild. Called by the Blueprint rating dispatcher when a section rates < 8.
 *   Pipeline: read critique -> map to impeccable command -> call Claude Agent SDK with Opus 4.7 -> write rebuilt HTML.
 *   Status machine: scaffolded -> active (first healthy tick with ANTHROPIC_API_KEY present).
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/forge-pitch.md
 */
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'forge';
const OPUS_SPEND_CAP_MO = 25;

async function run(ratingInput) {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start', { rating: ratingInput ? 'provided' : '(none)' });

  try {
    const s = state.read();
    if (s.bay_status === 'paused') {
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      log.warn('ANTHROPIC_API_KEY missing — bay stays scaffolded');
      await state.recordTick({ summary: 'waiting on ANTHROPIC_API_KEY', failed: false });
      return { skipped: true, reason: 'missing_env' };
    }
    if ((s.opus_spend_mtd || 0) >= OPUS_SPEND_CAP_MO) {
      log.warn('Opus spend cap hit', { spend: s.opus_spend_mtd });
      await state.recordTick({ summary: 'spend cap hit', failed: false });
      return { skipped: true, reason: 'spend_cap' };
    }
    if (s.bay_status === 'scaffolded') {
      await state.update((cur) => { cur.bay_status = 'active'; return cur; });
      log.info('flipped bay_status scaffolded -> active');
    }

    if (!ratingInput) {
      log.info('no rating input — housekeeping tick');
      await state.update((cur) => {
        cur.ticks_today = (cur.ticks_today || 0) + 1;
        return cur;
      });
      await state.recordTick({ summary: 'housekeeping tick: no rating passed', failed: false });
      return { skipped: true, reason: 'no_rating' };
    }

    // TODO: Instantiate businesses/lib/forge.js with god-view palette pinned system prompt.
    //   Pitch ref: forge-pitch.md § "Integration plan if hired" step 3
    // TODO: Map critique text to impeccable command:
    //   - "grid broken" / "rigid layout" -> /distill
    //   - "generic card" / "bland" / "looks like every other site" -> /bolder
    //   - "typography off" / "hierarchy weak" -> /polish
    //   - "no movement" / "flat" -> /motion
    //   - "breaks on mobile" / "viewport issue" -> /responsive
    //   - default / ambiguous -> /polish
    // TODO: Call @anthropic-ai/claude-agent-sdk query() with:
    //   settingSources: ["project"], allowedTools: ["Skill", "Read", "Write"],
    //   model: "claude-opus-4-7", skill: ".claude/skills/impeccable/"
    // TODO: Write rebuilt HTML to concept-vNN+1.html in the Blueprint output dir.
    // TODO: Append expense row to businesses/builder/expenses.jsonl with path: "forge-opus-impeccable".

    await state.update((cur) => {
      cur.rebuilds_mtd = (cur.rebuilds_mtd || 0) + 1;
      cur.ticks_today = (cur.ticks_today || 0) + 1;
      return cur;
    });
    await state.recordTick({ summary: 'scaffold tick: rebuild pipeline TODO', failed: false });
    return { scaffolded: true };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try { await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true }); } catch {}
    throw err;
  }
}

if (require.main === module) {
  const ratingPath = process.argv[2];
  run(ratingPath).then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
}
module.exports = { run };
