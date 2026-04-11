require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { readCSV, writeCSV } = require('./csv-utils');
const { slugify, detectNiche, downloadPhoto, buildPrompt, parseCity, SITES_DIR } = require('./generator');
const { createOrGetSite, deploySite } = require('./deployer');

const DEPLOY_DELAY_MS = 45000;
const SKIP_NAME = 'Lipovic Heating & Cooling';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function saveLead(rows, cols) { writeCSV('leads.csv', rows, cols); }

async function main() {
  const client = new Anthropic();
  const rows = readCSV('leads.csv');
  const cols = Object.keys(rows[0]);

  const toRebuild = rows.filter(r => r.local_file && r.live_url && r.business_name !== SKIP_NAME);

  console.log(`Rebuilding ${toRebuild.length} sites (skipping ${SKIP_NAME}).\n`);

  let rebuilt = 0;
  let failed = 0;

  for (let i = 0; i < toRebuild.length; i++) {
    const row = toRebuild[i];
    const name = row.business_name;
    const slug = slugify(name);

    console.log(`\n[${ i + 1}/${toRebuild.length}] ${name}`);

    try {
      // Delete old HTML
      const oldPath = path.resolve(__dirname, row.local_file);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      // Clear fields
      row.local_file = '';
      row.live_url = '';
      saveLead(rows, cols);

      // Find existing photos
      const localPhotoPaths = [];
      const files = fs.readdirSync(SITES_DIR);
      for (const f of files) {
        if (f.startsWith(slug + '-photo-')) localPhotoPaths.push(f);
      }
      console.log(`  Photos: ${localPhotoPaths.length} existing`);

      // If no local photos, try downloading
      if (localPhotoPaths.length === 0) {
        let photoUrls = [];
        try { if (row.photos) photoUrls = JSON.parse(row.photos); } catch (_) {}
        for (let j = 0; j < photoUrls.length; j++) {
          const f = await downloadPhoto(photoUrls[j], SITES_DIR, slug, j);
          if (f) localPhotoPaths.push(f);
        }
      }

      const city = parseCity(row.address);
      const niche = detectNiche(row.category);
      const prompt = buildPrompt(row, niche, localPhotoPaths, city);

      console.log(`  Generating [niche: ${niche.key}]...`);

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }]
      });

      let html = message.content[0].text;
      html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      html = html.replace(/\u2014/g, '-').replace(/&mdash;/g, '-');

      const filename = `${slug}.html`;
      const filePath = path.join(SITES_DIR, filename);
      fs.writeFileSync(filePath, html, 'utf-8');

      // Validate
      const trimmed = html.trim();
      const valid = (trimmed.startsWith('<!') || trimmed.startsWith('<html')) &&
                    trimmed.endsWith('</html>') &&
                    /<head[\s>]/i.test(trimmed) &&
                    /<body[\s>]/i.test(trimmed);

      if (!valid) {
        fs.unlinkSync(filePath);
        throw new Error('Invalid HTML structure');
      }

      row.local_file = `sites/${filename}`;
      saveLead(rows, cols);
      console.log(`  Generated: ${filename}`);

      // Deploy
      console.log(`  Deploying...`);
      const site = await createOrGetSite(slugify(name), row.address);
      await deploySite(site.id, filePath);
      row.live_url = site.ssl_url || `https://${site.name}.netlify.app`;
      saveLead(rows, cols);

      console.log(`  REBUILT: ${name} -> ${row.live_url}`);
      rebuilt++;

      // Rate limit delay
      if (i < toRebuild.length - 1) {
        console.log(`  Waiting ${DEPLOY_DELAY_MS / 1000}s...`);
        await sleep(DEPLOY_DELAY_MS);
      }
    } catch (err) {
      console.error(`  FAILED: ${name} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REBUILD COMPLETE: ${rebuilt} rebuilt, ${failed} failed`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
