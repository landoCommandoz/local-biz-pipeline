/* Vault tick.
 *   Modes:
 *   - dry_run: scout + draft pitches, no publish.
 *   - live: same plus butler publish of the latest approved pitch.
 *
 *   First-tick state.status="awaiting_first_tick" triggers a setup escalation
 *   unless mode is already dry_run or live (set by Lando).
 *
 *   dry_run scout logic: rotate through a list of local Kenney packs, draft
 *   one pitch per tick into pitches/, stop when every pack has a pitch.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');
const { draftPitch } = require('../lib/vault-pitcher');

const NAME = 'vault';
const BAY_DIR = __dirname;
const PITCHES_DIR = path.join(BAY_DIR, 'pitches');
const KENNEY_ROOT = path.resolve(BAY_DIR, '..', 'public', 'assets', 'kenney');

// Ordered list of pack + angle combos to pitch. Vault picks the first one that
// does NOT yet have a pitch filed. Once a pitch lands, the next tick advances.
// Hand-seeded for the MVP. Later Vault can generate its own candidate list via
// scanning kenney.nl/starter-kits.
const PITCH_QUEUE = [
  { pack: 'isometric-tiles-city', angle: 'port-threejs' },
  { pack: 'isometric-tiles-buildings', angle: 'port-threejs' },
  { pack: 'isometric-tiles-landscape', angle: 'port-threejs' },
  { pack: 'fantasy-town-kit', angle: 'port-threejs' },
  { pack: 'blocky-characters', angle: 'sprite-sheet-bundle' },
  { pack: 'pirate-kit', angle: 'port-threejs' },
  { pack: 'city-kit-commercial', angle: 'port-threejs' },
  { pack: 'modular-space-kit', angle: 'port-threejs' }
];

function existingPitches() {
  if (!fs.existsSync(PITCHES_DIR)) return [];
  return fs.readdirSync(PITCHES_DIR).filter((f) => f.endsWith('.md'));
}

function pickNextPitchTarget() {
  const filed = existingPitches();
  for (const target of PITCH_QUEUE) {
    const tag = `${target.pack}-${target.angle}`;
    const alreadyPitched = filed.some((f) => f.includes(tag));
    if (!alreadyPitched) {
      const packDir = path.join(KENNEY_ROOT, target.pack);
      if (fs.existsSync(packDir)) return target;
    }
  }
  return null;
}

function ensureDirs() {
  if (!fs.existsSync(PITCHES_DIR)) fs.mkdirSync(PITCHES_DIR, { recursive: true });
}

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    ensureDirs();
    const s = state.read();
    if (s.paused) {
      log.info('paused, skipping');
      return { skipped: true, reason: 'paused' };
    }

    const mode = s.current_mode || 'dry_run';
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasButlerKey = !!process.env.BUTLER_API_KEY;

    log.info('tick context', {
      mode,
      hasAnthropicKey,
      hasButlerKey,
      pitches_filed: existingPitches().length
    });

    if (!hasAnthropicKey) {
      log.warn('no ANTHROPIC_API_KEY, cannot draft pitches');
      await state.recordTick({
        summary: 'blocked: ANTHROPIC_API_KEY missing, cannot draft pitches',
        status: 'blocked_on_env',
        mode,
        failed: false
      });
      return { blocked: true, reason: 'no_anthropic_key' };
    }

    if (mode === 'dry_run' || mode === 'live') {
      const target = pickNextPitchTarget();
      if (!target) {
        log.info('every pack in queue already has a pitch, idle');
        await state.recordTick({
          summary: `idle: ${existingPitches().length} pitches filed, queue exhausted`,
          status: s.status,
          mode,
          failed: false
        });
        return { idle: true, pitches_filed: existingPitches().length };
      }

      log.info('scout pick', target);
      const result = await draftPitch({
        packSlug: target.pack,
        angle: target.angle,
        kenneyRoot: KENNEY_ROOT,
        pitchesDir: PITCHES_DIR
      });

      if (!result.ok) {
        log.error('pitch failed', result);
        await state.recordTick({
          summary: `pitch failed for ${target.pack}: ${result.reason}`,
          status: s.status,
          mode,
          failed: true
        });
        return result;
      }

      log.info('pitch filed', {
        path: result.pitch_path,
        pack: result.pack_slug,
        angle: result.angle,
        png_count: result.png_count
      });

      await state.update((cur) => {
        cur.pitches_drafted = (cur.pitches_drafted || 0) + 1;
        cur.pools_scanned = (cur.pools_scanned || 0) + 1;
        cur.last_scout_at = new Date().toISOString();
        if (cur.status === 'awaiting_lando_setup' || cur.status === 'awaiting_first_tick') {
          cur.status = 'scouting';
        }
        return cur;
      });

      await state.recordTick({
        summary: `pitch ${result.pitch_number} filed: ${target.pack} via ${target.angle}`,
        status: 'scouting',
        mode,
        failed: false
      });

      if (mode === 'live' && !hasButlerKey) {
        log.warn('live mode, pitch filed, but BUTLER_API_KEY missing for publish step');
      }

      return { ok: true, ...result };
    }

    log.warn('unknown mode, skipping', { mode });
    return { skipped: true, reason: 'unknown_mode' };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try {
      await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true });
    } catch {}
    throw err;
  }
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run, pickNextPitchTarget, PITCH_QUEUE };
