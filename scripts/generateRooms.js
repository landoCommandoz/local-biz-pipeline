#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACCESS = process.env.KLING_ACCESS_KEY;
const SECRET = process.env.KLING_SECRET_KEY;
if (!ACCESS || !SECRET) {
  console.error('Missing KLING_ACCESS_KEY or KLING_SECRET_KEY in .env');
  process.exit(1);
}

const API = 'https://api.klingai.com';
const ROOT = path.join(__dirname, '..');
const ROOMS_DIR = path.join(ROOT, 'businesses', 'public', 'assets', 'rooms');
const VIDEOS_DIR = path.join(ROOT, 'businesses', 'public', 'assets', 'videos');
const CMD_HTML = path.join(ROOT, 'businesses', 'public', 'command-center.html');
const INDEX_HTML = path.join(ROOT, 'businesses', 'public', 'index.html');

if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

// [outputName, sourceImage, prompt]
// NOTE: source images that don't exist are marked MISSING — fix before running.
const ROOMS = [
  ['jax', 'jax.jpg',
    'The robot slowly types at the desk, head bobs, orange screens flicker, lamp sways, dust particles float, everything else stays still'],
  ['hank', 'hank.jpg',
    'The robot paces slowly, teal radar screens sweep, map pins blink, antenna light pulses, everything else stays still'],
  ['vega', 'vega.jpg',
    'The robot gestures at floating charts, bar graphs animate upward, revenue arrow pulses green, data scrolls on screens, everything else stays still'],
  ['brix', 'brix.jpg',
    'The robot crawls along floor checking cables, server lights blink in sequence, purple screens flicker, cables pulse with orange energy, sparks drift upward, everything else stays still'],
  ['doss', 'doss.jpg',
    'The armored robot slowly rotates scanning, camera feeds cycle on screens, world map checkmarks pulse one by one, vault hatch glows green, everything else stays still'],
  ['vault', 'vault.png',
    'The robot counts gold coins moving them one by one, vault door handle rotates slightly, financial charts tick upward, lamp swings gently, everything else stays still'],
  ['signalscout', 'signalscout.png',
    'The robot adjusts broadcast console dials, radar circles sweep continuously, target pins blink on city map, antenna light blinks rhythmically, everything else stays still'],
  ['forge', 'forge.jpg',
    'The robot raises paintbrush and makes a stroke on canvas, paint splatters appear on floor, mockup screens fade between layouts, color swatches glow, everything else stays still'],
  ['max', 'max.jpg',
    'The rocket slowly lifts off from launchpad with smoke and sparks, green progress bars fill one by one, website URLs get green checkmarks in sequence, everything else stays still'],
  ['echo', 'echo.jpg',
    'The robot presses switchboard buttons, teal delivery confirmations appear on screens, detective board string connects cards, telephone light blinks, everything else stays still'],
  ['iris', 'iris.jpg',
    'The robot moves magnifying glass across the website screen, audit screens cycle between mobile and desktop, checklist gets checkmarks added, purple underglow pulses, everything else stays still'],
  ['rex', 'rex.jpg',
    'The robot slowly droops asleep then snaps awake, typewriter keys press one at a time, corkboard papers rustle, lamp flickers, everything else stays still'],
  ['nova', 'nova.jpg',
    'The robot frantically presses buttons, sparks fly in bursts, PASS FAIL results flash rapidly, papers scatter on floor, blue electric arcs crawl across floor, everything else stays still'],
  ['pixel', 'pixel.jpg',
    'The robot pans camera left and right, TikTok screens loop with motion, ring light pulses bright and dim, editing waveforms animate, everything else stays still'],
  ['zenith', 'zenith.jpg',
    'The robot moves chess pieces across war room table, gold timeline screens scroll forward, expansion markers light up one by one outward on world map, everything else stays still'],
  ['atlas', 'atlas.jpg',
    'The robot traces routes on floor map with one finger, lantern flickers, USA wall map pins light up west to east, map scrolls partially unroll, everything else stays still'],
  ['neo', 'neo.jpg',
    'The robot rotates slowly as data cables pulse with flowing purple energy, neural network nodes light up and connect on back wall, data streams flow down walls, brain dome pulses brighter and dimmer, everything else stays still'],
];

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;

// Scene prompts for rooms whose source images don't exist yet.
// Style prefix matches the existing isometric pixel-art command-center aesthetic.
const STYLE = 'isometric pixel art game asset, 1:1 1024x1024, corner-view isometric room showing two back walls and the floor, dark stone walls with glowing neon trim, small cute robot character, cinematic lighting, detailed command center workstation, no text labels';
const SCENE_PROMPTS = {
  max: 'rocket on launchpad in center of room, green progress bars lining the walls, main screen listing website URLs with green checkmarks, launch control panels, deployment/liftoff aesthetic, orange warning lights',
  rex: 'small robot slumped at a wooden writing desk with a vintage typewriter, corkboard wall covered in pinned papers and index cards, dim desk lamp, cozy writer den, amber and cream palette, stacks of paper, coffee mug',
  pixel: 'small robot videographer with camera on tripod, glowing ring light, multiple tall vertical phone screens playing short videos, editing timeline with audio waveforms, teal and magenta neon palette, content creator studio',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function signJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { iss: ACCESS, exp: now + 1800, nbf: now - 5 };
  const enc = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const sig = crypto.createHmac('sha256', SECRET).update(signingInput).digest('base64url');
  return `${signingInput}.${sig}`;
}

async function klingPost(body) {
  const res = await fetch(`${API}/v1/videos/image2video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signJWT()}` },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function klingGet(taskId) {
  const res = await fetch(`${API}/v1/videos/image2video/${taskId}`, {
    headers: { Authorization: `Bearer ${signJWT()}` },
  });
  return res.json();
}

async function submit(imagePath, prompt) {
  const imageB64 = fs.readFileSync(imagePath).toString('base64');
  const j = await klingPost({
    model_name: 'kling-v1-6',
    image: imageB64,
    prompt,
    duration: '5',
    mode: 'std',
    cfg_scale: 0.5,
  });
  if (j.code !== 0) throw new Error(`submit: ${JSON.stringify(j)}`);
  return j.data.task_id;
}

async function pollUntilDone(taskId, label) {
  const deadline = Date.now() + 15 * 60 * 1000; // 15 min cap
  let last = '';
  while (Date.now() < deadline) {
    await sleep(10000);
    const j = await klingGet(taskId);
    const status = j?.data?.task_status || 'unknown';
    if (status !== last) { process.stdout.write(` ${status}`); last = status; }
    if (status === 'succeed') {
      const url = j?.data?.task_result?.videos?.[0]?.url;
      if (!url) throw new Error('succeed but no video url');
      return url;
    }
    if (status === 'failed') throw new Error(j?.data?.task_status_msg || 'failed');
  }
  throw new Error('poll timeout');
}

async function downloadTo(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
}

async function generateSourceImage(name, imgPath) {
  if (!REPLICATE_TOKEN) throw new Error('REPLICATE_API_TOKEN missing');
  const scene = SCENE_PROMPTS[name];
  if (!scene) throw new Error(`no scene prompt for ${name}`);
  const fullPrompt = `${STYLE}. Scene: ${scene}.`;
  process.stdout.write(`[${name}] source-image flux-schnell…`);
  const start = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait',
    },
    body: JSON.stringify({ input: { prompt: fullPrompt, aspect_ratio: '1:1', output_format: 'jpg', output_quality: 90, num_outputs: 1 } }),
  });
  const j = await start.json();
  const url = Array.isArray(j.output) ? j.output[0] : j.output;
  if (!url) throw new Error(`flux output missing: ${JSON.stringify(j)}`);
  const img = await fetch(url);
  fs.writeFileSync(imgPath, Buffer.from(await img.arrayBuffer()));
  process.stdout.write(' OK\n');
}

async function generateOne([name, file, prompt]) {
  const out = path.join(VIDEOS_DIR, `${name}.mp4`);
  if (fs.existsSync(out)) { console.log(`[${name}] skip (exists)`); return { name, ok: true, skipped: true }; }
  const img = path.join(ROOMS_DIR, file);
  if (!fs.existsSync(img)) {
    try { await generateSourceImage(name, img); }
    catch (e) { console.log(`[${name}] SKIP — source-image failed: ${e.message}`); return { name, ok: false, reason: 'source-image-failed' }; }
  }
  try {
    process.stdout.write(`[${name}] submit…`);
    const taskId = await submit(img, prompt);
    process.stdout.write(` task=${taskId}`);
    const url = await pollUntilDone(taskId, name);
    process.stdout.write(' download…');
    await downloadTo(url, out);
    console.log(' OK');
    return { name, ok: true };
  } catch (e) {
    console.log(`\n[${name}] FAIL: ${e.message}`);
    return { name, ok: false, reason: e.message };
  }
}

function updateHtmlToVideos(results) {
  // Map generated output filenames back to their source image paths for <img> → <video> swap.
  const nameByImage = Object.fromEntries(ROOMS.map(([n, f]) => [f, n]));
  const generated = new Set(results.filter(r => r.ok).map(r => r.name));
  let html = fs.readFileSync(CMD_HTML, 'utf8');
  let swaps = 0;
  // Swap <img src="assets/rooms/X" ...> → <video autoplay muted loop playsinline poster="assets/rooms/X"><source src="assets/videos/NAME.mp4"></video>
  html = html.replace(/<img([^>]*?)src="assets\/rooms\/([^"]+)"([^>]*?)>/g, (full, pre, file, post) => {
    const name = nameByImage[file];
    if (!name || !generated.has(name)) return full;
    // Preserve class and style
    const attrs = (pre + post).trim();
    swaps++;
    return `<video ${attrs} autoplay muted loop playsinline poster="assets/rooms/${file}"><source src="assets/videos/${name}.mp4" type="video/mp4"></video>`;
  });
  fs.writeFileSync(CMD_HTML, html);
  fs.copyFileSync(CMD_HTML, INDEX_HTML);
  console.log(`HTML updated: ${swaps} <img> → <video> swaps. Synced to index.html.`);
}

async function main() {
  console.log(`Rooms to generate: ${ROOMS.length}`);
  const missing = ROOMS.filter(([, f]) => !fs.existsSync(path.join(ROOMS_DIR, f)));
  if (missing.length) {
    console.log(`${missing.length} source images missing — will auto-generate via Replicate flux-schnell:`);
    missing.forEach(([n, f]) => console.log(`  ${n} → ${f}${SCENE_PROMPTS[n] ? '' : ' (no scene prompt — will fail)'}`));
  }
  const results = [];
  for (let i = 0; i < ROOMS.length; i++) {
    console.log(`\n[${i + 1}/${ROOMS.length}]`);
    results.push(await generateOne(ROOMS[i]));
    if (i < ROOMS.length - 1) await sleep(5000);
  }
  console.log('\n\n=== Summary ===');
  const ok = results.filter(r => r.ok && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const failed = results.filter(r => !r.ok);
  console.log(`Generated: ${ok}  Skipped: ${skipped}  Failed: ${failed.length}`);
  failed.forEach(r => console.log(`  ${r.name}: ${r.reason}`));
  if (ok + skipped > 0) updateHtmlToVideos(results);
}

main().catch(e => { console.error(e); process.exit(1); });
