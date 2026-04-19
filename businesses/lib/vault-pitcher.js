/* Vault pitch drafter.
 *
 * Given a Kenney pack slug and a product angle, call Claude Sonnet to draft
 * a structured pitch markdown file. Lando reviews before Vault proceeds to
 * bundle-assembly + publish.
 *
 * Pitch output is 100% deterministic-structure markdown Lando can skim in
 * 30 seconds. No em dashes. Never "AI" as standalone.
 */

const fs = require('fs');
const path = require('path');
const { getClient } = require('./metered-anthropic');

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 2500;

const SYSTEM_PROMPT = `You are Vault, Archivist of Brewington Yard. Your job is to draft commercial pitches for digital asset bundles that Vault will port, repackage, and sell on Itch.io.

VOICE:
- Honest. Skeptical of hype. Short paragraphs.
- Target reader is Lando, the landlord. He scans in 30 seconds.
- Your audience for the actual product (once shipped) is indie devs on Itch.io who buy $15-29 starter bundles to skip setup work.
- No marketing fluff. Numbers with stated assumptions. If you do not know something, write UNKNOWN.

HARD RULES (any violation is a failed pitch):
- No em dashes anywhere (use commas, periods, colons).
- Never use "AI" as a standalone word. Use "automation", "agent", "model", or "illustration model".
- Output valid Markdown. No preamble. No explanation before or after the markdown.
- Pitch must have EVERY section listed in the user message. Skipping a section is a failed pitch.

STRUCTURE every pitch follows:
# Pitch NNNN: <short product title>
**Scout target:** <pack slug or URL>
**Pack size:** <asset count, file size>
**License:** <license>

## Product angle
<1-2 paragraphs, concrete product concept>

## Price
<single number in dollars, e.g. $19>

## Target audience
<1 sentence, specific platform and buyer type>

## Projected sales in month 1
<honest range, based on Itch comparables, with assumptions listed>

## Build effort
<low/medium/high, plus rough hour estimate>

## Risks
<bullet list of 2-3 specific risks, each 1 sentence>

## Next steps
<numbered list of 3-5 concrete actions from here to live listing>

---
*Drafted by Vault on <YYYY-MM-DD>. Status: awaiting Lando review.*`;

function listPackContents(packDir) {
  if (!fs.existsSync(packDir)) return null;
  const stats = fs.statSync(packDir);
  if (!stats.isDirectory()) return null;

  let pngCount = 0;
  let totalBytes = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        if (entry.name.toLowerCase().endsWith('.png')) pngCount += 1;
        totalBytes += fs.statSync(full).size;
      }
    }
  };
  walk(packDir);

  let license = 'CC0';
  const licensePath = path.join(packDir, 'License.txt');
  if (fs.existsSync(licensePath)) {
    const txt = fs.readFileSync(licensePath, 'utf-8');
    const m = txt.match(/(CC0|MIT|Apache|BSD|ISC)/i);
    if (m) license = m[1].toUpperCase();
  }

  return {
    png_count: pngCount,
    total_bytes: totalBytes,
    total_mb: Math.round((totalBytes / 1024 / 1024) * 10) / 10,
    license
  };
}

function nextPitchNumber(pitchesDir) {
  if (!fs.existsSync(pitchesDir)) return 1;
  const existing = fs.readdirSync(pitchesDir)
    .map((f) => f.match(/^(\d+)-/))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10))
    .filter((n) => !isNaN(n));
  if (existing.length === 0) return 1;
  return Math.max(...existing) + 1;
}

function extractMarkdown(text) {
  if (!text || typeof text !== 'string') return null;
  const start = text.indexOf('# Pitch');
  if (start < 0) return text.trim();
  return text.slice(start).trim();
}

function collectText(response) {
  if (!response || !Array.isArray(response.content)) return '';
  return response.content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('');
}

async function draftPitch({ packSlug, angle, kenneyRoot, pitchesDir, opts = {} }) {
  if (!packSlug || !angle) {
    return { ok: false, reason: 'missing packSlug or angle' };
  }
  const packDir = path.join(kenneyRoot, packSlug);
  const pack = listPackContents(packDir);
  if (!pack) {
    return { ok: false, reason: `pack directory missing: ${packDir}` };
  }

  const nextNum = nextPitchNumber(pitchesDir);
  const paddedNum = String(nextNum).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  const userPrompt = `Draft pitch number ${paddedNum} for the following asset pack.

Pack slug: ${packSlug}
Product angle: ${angle}
Local path: businesses/public/assets/kenney/${packSlug}/
PNG sprite count: ${pack.png_count}
Total size: ${pack.total_mb} MB
License: ${pack.license}
Date: ${today}

Draft the full pitch markdown now. Start with "# Pitch ${paddedNum}:" and end with the "Drafted by Vault" line. Nothing else.`;

  const client = opts.client || getClient('vault', opts);

  let response;
  try {
    response = await client.messages.create({
      model: opts.model || MODEL,
      max_tokens: opts.maxTokens || MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    });
  } catch (err) {
    return {
      ok: false,
      reason: 'api call failed',
      error: String(err && err.message ? err.message : err)
    };
  }

  if (client._noop) {
    return { ok: false, reason: 'no api key (metered-anthropic noop)' };
  }

  const text = collectText(response);
  const md = extractMarkdown(text);

  if (!md || !md.startsWith('# Pitch')) {
    return {
      ok: false,
      reason: 'response missing pitch markdown',
      preview: text.slice(0, 300)
    };
  }

  const outPath = path.join(pitchesDir, `${paddedNum}-${packSlug}-${angle}.md`);
  fs.mkdirSync(pitchesDir, { recursive: true });
  fs.writeFileSync(outPath, md + '\n', 'utf-8');

  return {
    ok: true,
    pitch_number: nextNum,
    pitch_path: outPath,
    pack_slug: packSlug,
    angle,
    png_count: pack.png_count,
    model: response.model
  };
}

module.exports = { draftPitch, listPackContents, nextPitchNumber, SYSTEM_PROMPT };
