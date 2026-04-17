/* Scrape the 35 live Netlify sites we deployed for local businesses.
 *   Purpose: portfolio screenshots and template reference assets.
 *   Absolutely no outreach. No emails. No contact with the original businesses.
 */
require('dotenv').config({ path: __dirname + '/../../.env' });
const fs = require('fs');
const path = require('path');
const { readCSV } = require('../../csv-utils');
const { screenshotSite } = require('../../screenshotter');

const LEADS_PATH = path.join(__dirname, '../../leads.csv');
const OUT_DIR = path.join(__dirname, '../../screenshots');
const MANIFEST = path.join(__dirname, 'portfolio-manifest.json');

function slugify(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = readCSV(LEADS_PATH);
  const targets = rows
    .filter(r => r.live_url && r.live_url.trim() && r.local_file)
    .map(r => ({
      business: r.business_name,
      slug: slugify(r.business_name),
      url: r.live_url.trim(),
      trade: r.category,
      city: (r.address || '').split(',')[1]?.trim() || '',
      rating: r.rating,
      reviews: r.review_count,
      local_file: r.local_file
    }));

  console.log(`[portfolio] targets: ${targets.length} live sites`);

  const manifest = [];
  let ok = 0;
  let failed = 0;

  for (const t of targets) {
    const mobilePath = path.join(OUT_DIR, `${t.slug}-mobile.png`);
    const desktopPath = path.join(OUT_DIR, `${t.slug}-desktop.png`);
    const already = fs.existsSync(mobilePath) && fs.existsSync(desktopPath);
    if (already) {
      console.log(`[portfolio] skip ${t.slug} (screenshots already on disk)`);
      manifest.push({ ...t, mobile: `screenshots/${t.slug}-mobile.png`, desktop: `screenshots/${t.slug}-desktop.png`, status: 'cached' });
      ok++;
      continue;
    }
    try {
      console.log(`[portfolio] shoot ${t.slug} -> ${t.url}`);
      await screenshotSite(t.url, t.slug);
      manifest.push({ ...t, mobile: `screenshots/${t.slug}-mobile.png`, desktop: `screenshots/${t.slug}-desktop.png`, status: 'captured' });
      ok++;
    } catch (err) {
      console.warn(`[portfolio] FAIL ${t.slug}: ${err.message}`);
      manifest.push({ ...t, status: 'failed', error: err.message });
      failed++;
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify({
    captured_at: new Date().toISOString(),
    total: targets.length,
    ok,
    failed,
    rule: 'These live sites belong to local businesses we already contacted. Never re-email any of them. Use only for portfolio showcase and template extraction.',
    items: manifest
  }, null, 2));

  console.log(`[portfolio] done. ok=${ok} failed=${failed}. manifest=${MANIFEST}`);
}

run().catch(err => { console.error(`[portfolio] fatal: ${err.message}`); process.exit(1); });
