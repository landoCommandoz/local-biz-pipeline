/* Designer hire for Jax.
 *
 * Takes a brief markdown path and an output HTML path, calls metered Anthropic
 * to generate a complete HTML document, writes it atomically.
 *
 * Usage from tick.js:
 *   const { designOnce } = require('../lib/designer');
 *   const result = await designOnce({ briefPath, outputPath, agent: 'builder' });
 *
 * Contract:
 *   - Reads brief (required). If missing: returns { ok: false, reason: 'brief missing' }.
 *   - If brief references an existing file to extend, the brief itself includes that
 *     context. Designer does NOT auto-read the current output; the brief does.
 *   - Returns { ok, model, bytes, output_path, reason, error }.
 *   - Never throws: tick.js gets a structured result.
 *
 * Taste is in SYSTEM_PROMPT below. Brief is the per-project ask.
 */

const fs = require('fs');
const path = require('path');
const writeFileAtomic = require('write-file-atomic');
const { getClient } = require('./metered-anthropic');

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 24000;

const SYSTEM_PROMPT = `You are a senior front-end designer shipping production HTML for the Brewington Yard command deck.

HARD RULES (non-negotiable, any violation is a failed output):
- Output a complete standalone HTML document. Start with <!doctype html>. End with </html>.
- No markdown fences. No prose commentary. No explanation. HTML only.
- Never use em dashes (U+2014). Use commas, periods, or colons instead.
- Never use the word "AI" as a standalone word in visible copy. "automation", "agent", "model" are fine.
- No inline base64 images. No external images. SVG inline is encouraged.
- No new CDN imports beyond Google Fonts. No jQuery. No frameworks. Vanilla JS + CSS only.

AESTHETIC DEFAULT (unless the brief overrides):
- Command deck, not a game. Bloomberg terminal, flight dispatch, ops console energy.
- Dense data, tight type, sharp grid lines. Information over decoration.
- Monochrome with one accent. Avoid cartoon creatures, confetti, weather effects, decorative animations.
- Motion only when it communicates state (pulses for live, transitions for change). No ambient whimsy.
- Typography carries hierarchy. Use weight + scale, not emoji or illustration.

CODE QUALITY:
- Semantic HTML. aria-labels on interactive elements.
- CSS custom properties for color/type. No !important.
- Data wiring via fetch to /api/state, /api/realestate, /api/activity, /api/stream when the brief references live data.
- File size under budget specified in the brief.

When the brief contradicts the aesthetic default, follow the brief. When the brief is silent on aesthetic, follow the default.`;

function extractHtml(text) {
  if (!text || typeof text !== 'string') return null;
  const start = text.indexOf('<!doctype');
  const startAlt = text.indexOf('<!DOCTYPE');
  const s = start >= 0 ? start : startAlt;
  if (s < 0) return null;
  const endTag = '</html>';
  const e = text.lastIndexOf(endTag);
  if (e < 0) return null;
  return text.slice(s, e + endTag.length);
}

function collectText(response) {
  if (!response || !Array.isArray(response.content)) return '';
  return response.content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('');
}

async function designOnce({ briefPath, outputPath, agent, opts = {} } = {}) {
  if (!briefPath || !fs.existsSync(briefPath)) {
    return { ok: false, reason: 'brief missing', brief_path: briefPath || null };
  }
  if (!outputPath) {
    return { ok: false, reason: 'output path missing' };
  }

  const brief = fs.readFileSync(briefPath, 'utf-8');

  const client = opts.client || getClient(agent || 'builder', opts);

  let response;
  try {
    response = await client.messages.create({
      model: opts.model || MODEL,
      max_tokens: opts.maxTokens || MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `BRIEF:\n\n${brief}\n\nReturn the complete HTML document now. Nothing else.`
        }
      ]
    });
  } catch (err) {
    return {
      ok: false,
      reason: 'api call failed',
      error: String(err && err.message ? err.message : err)
    };
  }

  if (client._noop) {
    return {
      ok: false,
      reason: 'no api key (metered-anthropic noop client)',
      model: response && response.model
    };
  }

  const text = collectText(response);
  const html = extractHtml(text);

  if (!html) {
    return {
      ok: false,
      reason: 'no html found in response',
      model: response && response.model,
      stop_reason: response && response.stop_reason,
      preview: text.slice(0, 400)
    };
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await writeFileAtomic(outputPath, html, 'utf-8');

  return {
    ok: true,
    model: response.model,
    bytes: Buffer.byteLength(html, 'utf-8'),
    output_path: outputPath,
    stop_reason: response.stop_reason
  };
}

module.exports = { designOnce, SYSTEM_PROMPT, MODEL, extractHtml };
