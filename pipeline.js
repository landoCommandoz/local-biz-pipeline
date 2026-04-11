require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { readCSV, writeCSV } = require('./csv-utils');
const { scrapeWebsiteForEmail, hunterDomainSearch, extractDomain } = require('./email-finder');
const { slugify, detectNiche, downloadPhoto, buildPrompt, parseCity, SITES_DIR } = require('./generator');
const { createOrGetSite, deploySite } = require('./deployer');
const { generateEmail, validateEmail } = require('./emailbuilder');

const DEPLOY_DELAY_MS = 45000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveLead(rows, columns) {
  writeCSV('leads.csv', rows, columns);
}

function saveEmail(row) {
  const emailRow = {
    business_name: row.business_name,
    email_subject: row._email_subject,
    email_body: row._email_body,
    live_url: row.live_url || row.local_file
  };

  const emailColumns = ['business_name', 'email_subject', 'email_body', 'live_url'];
  let existingEmails = [];
  try { existingEmails = readCSV('emails.csv'); } catch (_) { /* file may not exist */ }
  existingEmails.push(emailRow);
  writeCSV('emails.csv', existingEmails, emailColumns);
}

// ── STEP 1: EMAIL LOOKUP ────────────────────────────────────────────
async function stepEmail(row) {
  const website = (row.website || '').trim();
  if (!website) return false;

  let email = await scrapeWebsiteForEmail(website);

  if (!email) {
    const domain = extractDomain(website);
    if (domain) email = await hunterDomainSearch(domain);
  }

  if (email) {
    row.email = email;
    return true;
  }

  return false;
}

// ── STEP 2: SITE GENERATION ─────────────────────────────────────────
async function stepGenerate(row, client) {
  const slug = slugify(row.business_name);
  const city = parseCity(row.address);
  const niche = detectNiche(row.category);

  // Download photos locally
  let photoUrls = [];
  try { if (row.photos) photoUrls = JSON.parse(row.photos); } catch (_) { /* ignore */ }

  const localPhotoPaths = [];
  if (photoUrls.length > 0) {
    console.log(`  Downloading ${photoUrls.length} photos...`);
    for (let i = 0; i < photoUrls.length; i++) {
      const localFile = await downloadPhoto(photoUrls[i], SITES_DIR, slug, i);
      if (localFile) {
        localPhotoPaths.push(localFile);
        console.log(`    SAVED: ${localFile}`);
      }
    }
  }

  const prompt = buildPrompt(row, niche, localPhotoPaths, city);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }]
  });

  let html = message.content[0].text;

  // Strip markdown fences if present
  html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

  // Strip em dashes
  html = html.replace(/\u2014/g, '-').replace(/&mdash;/g, '-');

  const filename = `${slug}.html`;
  const filePath = path.join(SITES_DIR, filename);

  fs.writeFileSync(filePath, html, 'utf-8');

  // Validate HTML structure
  const trimmed = html.trim();
  const isComplete = trimmed.startsWith('<!') || trimmed.startsWith('<html');
  const hasClosingTag = trimmed.endsWith('</html>');
  const hasHead = /<head[\s>]/i.test(trimmed);
  const hasBody = /<body[\s>]/i.test(trimmed);

  if (!isComplete || !hasClosingTag || !hasHead || !hasBody) {
    const reasons = [];
    if (!isComplete) reasons.push('missing doctype/html open');
    if (!hasClosingTag) reasons.push('missing </html> (likely truncated)');
    if (!hasHead) reasons.push('missing <head>');
    if (!hasBody) reasons.push('missing <body>');
    fs.unlinkSync(filePath);
    throw new Error(`Invalid HTML: ${reasons.join(', ')}`);
  }

  row.local_file = `sites/${filename}`;
  console.log(`  SAVED: ${filePath}`);
}

// ── STEP 3: DEPLOYMENT ──────────────────────────────────────────────
async function stepDeploy(row) {
  const filePath = path.resolve(__dirname, row.local_file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const siteName = slugify(row.business_name);
  const site = await createOrGetSite(siteName, row.address);
  await deploySite(site.id, filePath);

  row.live_url = site.ssl_url || `https://${site.name}.netlify.app`;
  console.log(`  LIVE: ${row.live_url}`);
}

// ── STEP 4: EMAIL BUILDING ──────────────────────────────────────────
function stepEmailBuild(row) {
  const { subject, body } = generateEmail(row);
  const issues = validateEmail(subject, body, row.business_name);
  for (const issue of issues) {
    console.warn(`  FLAG: [${issue.cat}] ${issue.desc}`);
  }

  // Stash for saving — prefixed with _ to avoid CSV column pollution
  row._email_subject = subject;
  row._email_body = body;

  saveEmail(row);
  console.log(`  EMAIL SAVED: "${subject}"`);
}

// ── STEP 5: WHATSAPP APPROVAL ───────────────────────────────────────
async function stepApprove(row) {
  console.log('\n[5] Sending WhatsApp approval...');

  // Lazy-require approver to avoid module-scope Twilio client creation
  const approver = require('./approver');
  try {
    await approver.sendApproval(row);
  } catch (err) {
    console.warn(`  APPROVAL ERROR: ${err.message}`);
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────
async function main() {
  const rows = readCSV('leads.csv');
  if (rows.length === 0) {
    console.log('No leads found in leads.csv. Run scraper.js first.');
    return;
  }

  const columns = Object.keys(rows[0]);
  if (!columns.includes('local_file')) columns.push('local_file');
  if (!columns.includes('live_url')) columns.push('live_url');
  if (!columns.includes('pipeline_status')) columns.push('pipeline_status');
  if (!columns.includes('approval_status')) columns.push('approval_status');

  // Filter: leads with no local_file and no email are new pipeline candidates
  const candidates = rows.filter(r => !r.local_file && !r.email);

  if (candidates.length === 0) {
    console.log('No new leads to process (all have local_file or email already).');
    return;
  }

  console.log(`Found ${candidates.length} lead(s) to process.\n`);

  // Create Anthropic client once for all generation steps
  let client = null;
  if (process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic();
  }

  if (!fs.existsSync(SITES_DIR)) {
    fs.mkdirSync(SITES_DIR, { recursive: true });
  }

  const results = [];
  let needsDeploy = false;

  for (const row of candidates) {
    const name = row.business_name || '(unknown)';
    console.log(`\n${'='.repeat(60)}`);
    console.log(`PIPELINE: ${name}`);
    console.log(`${'='.repeat(60)}`);

    // STEP 1: Email lookup
    console.log('\n[1] Finding email...');
    try {
      const found = await stepEmail(row);
      if (!found) {
        row.pipeline_status = 'email_skip';
        saveLead(rows, columns);
        console.log(`  RESULT: No email found`);
        console.log(`\n>> SKIPPED: ${name} (no email)\n`);
        results.push({ name, status: 'SKIPPED' });
        continue;
      }
      console.log(`  FOUND: ${row.email}`);
      saveLead(rows, columns);
    } catch (err) {
      row.pipeline_status = 'email_skip';
      saveLead(rows, columns);
      console.warn(`  ERROR: ${err.message}`);
      console.log(`\n>> SKIPPED: ${name} (email lookup failed)\n`);
      results.push({ name, status: 'SKIPPED' });
      continue;
    }

    // STEP 2: Site generation
    console.log('\n[2] Generating site...');
    if (!client) {
      console.warn('  SKIP: ANTHROPIC_API_KEY not set');
      results.push({ name, status: 'SKIPPED' });
      continue;
    }
    try {
      await stepGenerate(row, client);
      saveLead(rows, columns);
    } catch (err) {
      console.warn(`  ERROR: ${err.message} - skipping lead`);
      results.push({ name, status: 'SKIPPED' });
      continue;
    }

    // STEP 3: Deploy
    console.log('\n[3] Deploying to Netlify...');
    if (!process.env.NETLIFY_API_KEY) {
      console.warn('  SKIP: NETLIFY_API_KEY not set');
      results.push({ name, status: 'SKIPPED' });
      continue;
    }
    try {
      await stepDeploy(row);
      saveLead(rows, columns);
      needsDeploy = true;
    } catch (err) {
      console.warn(`  ERROR: ${err.message} - skipping lead`);
      results.push({ name, status: 'SKIPPED' });
      continue;
    }

    // STEP 4: Email building
    console.log('\n[4] Building outreach email...');
    try {
      stepEmailBuild(row);
    } catch (err) {
      console.warn(`  ERROR: ${err.message}`);
    }

    // STEP 5: WhatsApp approval (per lead)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const { runQA } = require('./agentQA');
      await runQA({ businessName: row.business_name, liveUrl: row.live_url, localHtmlPath: row.local_file });
    }

    row.pipeline_status = 'complete';
    saveLead(rows, columns);

    console.log(`\n>> COMPLETE: ${name}\n`);
    results.push({ name, status: 'COMPLETE' });

    // Delay between deploys to avoid Netlify rate limiting
    if (needsDeploy && candidates.indexOf(row) < candidates.length - 1) {
      console.log(`  Waiting ${DEPLOY_DELAY_MS / 1000}s before next lead (rate limit)...`);
      await sleep(DEPLOY_DELAY_MS);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('PIPELINE SUMMARY');
  console.log(`${'='.repeat(60)}`);
  for (const r of results) {
    console.log(`  ${r.status.padEnd(8)} : ${r.name}`);
  }
  const completeCount = results.filter(r => r.status === 'COMPLETE').length;
  const skipCount = results.filter(r => r.status === 'SKIPPED').length;
  console.log(`\nTotal: ${completeCount} complete, ${skipCount} skipped`);
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
