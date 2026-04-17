require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const TEST_MODE = process.env.TEST_MODE === 'true';

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Log management ──────────────────────────────────────────────

const LOG_FILE = 'outreach-log.json';

function loadLog() {
  if (!fs.existsSync(LOG_FILE)) return [];
  return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
}

function saveLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

function getProspectEntry(log, businessName) {
  return log.find(e => e.business === businessName);
}

// ── CSV reader ──────────────────────────────────────────────────

function readProspectsCSV() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream('prospects.csv')
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

// ── Email scraping (deeper: tries /contact, /about pages too) ──

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow'
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractEmail(html) {
  if (!html) return null;

  // mailto: links first
  const mailtoMatch = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i);
  if (mailtoMatch) return mailtoMatch[1].toLowerCase();

  // Common contact patterns
  const contactPatterns = /(?:contact|info|hello|admin|support|office|service|sales)@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi;
  const contactMatch = html.match(contactPatterns);
  if (contactMatch) return contactMatch[0].toLowerCase();

  // Broad fallback
  const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const allEmails = html.match(emailPattern);
  if (allEmails) {
    const filtered = allEmails.filter(e => {
      const lower = e.toLowerCase();
      return !lower.includes('wixpress') && !lower.includes('sentry') &&
             !lower.includes('schema.org') && !lower.includes('example.com') &&
             !lower.includes('wordpress') && !lower.includes('gravatar') &&
             !lower.includes('.png') && !lower.includes('.jpg') &&
             !lower.includes('.svg') && !lower.endsWith('.css') &&
             !lower.endsWith('.js') && !lower.includes('noreply') &&
             !lower.includes('no-reply') && !lower.includes('unsubscribe') &&
             !lower.includes('google.com') && !lower.includes('facebook.com') &&
             !lower.includes('cloudflare');
    });
    if (filtered.length > 0) return filtered[0].toLowerCase();
  }
  return null;
}

async function scrapeEmailFromWebsite(url) {
  if (!url || url.trim() === '') return null;

  // Try homepage first
  let html = await fetchPage(url);
  let email = extractEmail(html);
  if (email) return email;

  // Try common contact/about pages
  const base = url.replace(/\/+$/, '');
  const subpages = ['/contact', '/contact-us', '/about', '/about-us'];
  for (const page of subpages) {
    html = await fetchPage(base + page);
    email = extractEmail(html);
    if (email) return email;
  }

  return null;
}

// ── Name helpers ────────────────────────────────────────────────

function stripSuffix(name) {
  return name.replace(/,?\s*\b(LLC|Inc\.?|Co\.?|Corp\.?|Ltd\.?)\s*$/i, '').trim();
}

function firstName(name) {
  return stripSuffix(name).split(' ')[0];
}

// ── Email templates per stage ───────────────────────────────────

function buildSubject(business, stage) {
  switch (stage) {
    case 1: return `${business.name} - quick question about missed calls`;
    case 2: return `Re: ${business.name} - quick question about missed calls`;
    case 3: return `Re: ${business.name} - quick question about missed calls`;
    case 4: return `Closing the loop - ${business.name}`;
  }
}

function buildEmailBody(business, stage) {
  const clean = stripSuffix(business.name);

  switch (stage) {
    case 1:
      return `Hi ${clean} Team,

I pulled up your Google listing today and noticed you are sitting at ${business.rating} stars in ${business.city}.

I work with ${business.trade} companies across Arizona and the ones in that rating range almost always have the same problem.

Missed calls.

A customer calls, nobody picks up, and they book with whoever answered first. That job is gone.

Here is what we do about it.

Brewington Digital sets up a system that answers every call your team misses, sends the customer an automatic text within 60 seconds, and books the appointment on the spot.

We also handle your website, automate your review requests after every job, and send you a monthly report showing exactly what the system did for your business.

Everything included. $297 a month. No contracts.

Want to hear exactly what your customers would hear when they call?

Call this number right now: 602-962-5592

That is our live system. It answers 24 hours a day, 7 days a week. Thirty seconds on that call will show you more than anything I could write in an email.

If it sounds like something worth talking about, just reply here and I will show you what it looks like set up for ${business.name} specifically.

Landon Brewington
Brewington Digital
602-609-4756
brewingtondigital.carrd.co`;

    case 2:
      return `${clean} Team,

Following up on my last email. I know you are busy running a business, not checking emails from strangers.

Quick version: your Google listing is at ${business.rating} stars with ${business.reviews} reviews in ${business.city}. That puts you behind most of your competitors in the area. The main thing costing you jobs right now is probably missed calls that never get returned.

I can send over a quick breakdown of what I see for ${business.name} online. No charge, no commitment. Just a second set of eyes on your online presence.

Worth it?

Landon Brewington
Brewington Digital
602-609-4756`;

    case 3:
      return `${clean} Team,

Last thing. I took a few minutes and pulled up how ${business.name} compares to the top ${business.trade} companies in ${business.city}.

Here is what I found:
- Your rating is ${business.rating} stars with ${business.reviews} reviews
- Most of the top competitors in ${business.city} have 100+ reviews and 4.5+ ratings
- Your online presence is not matching the quality of work you are actually doing

Not saying this to make you feel bad. Saying it because these are all things that can change in 60-90 days with the right setup.

If you ever want to talk about it, I am here. Text works too: 602-609-4756.

Landon
Brewington Digital`;

    case 4:
      return `${clean} Team,

I have reached out a few times and I know you are busy, so I will stop here.

If you ever want a second opinion on how ${business.name} shows up online, my info is below. No expiration on that.

Good luck this season.

Landon Brewington
Brewington Digital
602-609-4756
brewingtondigital.carrd.co`;
  }
}

// ── Sequence timing ─────────────────────────────────────────────
// Email 1: Day 0
// Email 2: Day 4
// Email 3: Day 9
// Email 4: Day 16

const STAGE_DELAYS_MS = {
  2: 4 * 24 * 60 * 60 * 1000,   // 4 days after Email 1
  3: 9 * 24 * 60 * 60 * 1000,   // 9 days after Email 1
  4: 16 * 24 * 60 * 60 * 1000   // 16 days after Email 1
};

function getNextStage(entry) {
  const currentStage = entry.stage || 1;
  if (currentStage >= 4) return null; // sequence complete

  const nextStage = currentStage + 1;
  const firstSent = new Date(entry.firstSentAt || entry.timestamp);
  const requiredDelay = STAGE_DELAYS_MS[nextStage];
  const elapsed = Date.now() - firstSent.getTime();

  if (elapsed >= requiredDelay) return nextStage;
  return null; // not time yet
}

// ── Built-site blocklist ────────────────────────────────────────
// Rule: never send outreach to a business whose site is already built in /sites/ or /prospectai/sites/

function slugifyBusiness(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function loadBuiltSiteSlugs() {
  const slugs = new Set();
  for (const dir of ['sites', 'prospectai/sites']) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.html')) slugs.add(f.replace(/\.html$/, ''));
    }
  }
  return slugs;
}

const BUILT_SITE_SLUGS = loadBuiltSiteSlugs();

function hasBuiltSite(businessName) {
  return BUILT_SITE_SLUGS.has(slugifyBusiness(businessName));
}

// ── Send logic ──────────────────────────────────────────────────

async function sendEmail(toEmail, business, stage) {
  if (hasBuiltSite(business)) {
    console.log(`  ${business} - BUILT_SITE_SKIP (site already live, skipping ${stage === 1 ? 'Email 1' : `Email ${stage}`})`);
    return { skipped: true };
  }
  const mailOptions = {
    from: GMAIL_USER,
    to: toEmail,
    subject: buildSubject(business, stage),
    text: buildEmailBody(business, stage)
  };
  await transporter.sendMail(mailOptions);
  return { skipped: false };
}

// ── Main ────────────────────────────────────────────────────────

async function main() {
  const mode = process.argv[2] || 'new'; // 'new', 'followup', 'rescrape', 'status'

  if (TEST_MODE) console.log('*** TEST MODE - no emails will be sent ***\n');

  if (mode === 'status') {
    return printStatus();
  }

  const log = loadLog();
  const allProspects = await readProspectsCSV();

  if (mode === 'rescrape') {
    return await rescrapeSkipped(log, allProspects);
  }

  if (mode === 'followup') {
    return await runFollowups(log, allProspects);
  }

  if (mode === 'send-ready') {
    return await sendReadyProspects(log, allProspects);
  }

  // Default: send Email 1 to new prospects
  return await sendNewOutreach(log, allProspects);
}

// ── Mode: send Email 1 to new prospects ─────────────────────────

async function sendNewOutreach(log, allProspects) {
  console.log('=== NEW OUTREACH (Email 1) ===\n');

  const alreadyContacted = new Set(log.map(e => e.business));
  const newProspects = allProspects.filter(r => !alreadyContacted.has(r['Business Name']));

  if (newProspects.length === 0) {
    console.log('No new prospects to contact. All have been processed.');
    return;
  }

  console.log(`${newProspects.length} new prospects to process.\n`);
  let sent = 0, skipped = 0;

  for (let i = 0; i < newProspects.length; i++) {
    const row = newProspects[i];
    const business = csvRowToBusiness(row);
    const email = await scrapeEmailFromWebsite(business.website);

    if (!email) {
      console.log(`[${i + 1}/${newProspects.length}] ${business.name} - no email found - SKIPPED`);
      log.push({
        timestamp: new Date().toISOString(),
        business: business.name,
        city: business.city,
        trade: business.trade,
        rating: business.rating,
        reviews: business.reviews,
        email: null,
        status: 'SKIPPED',
        stage: 0
      });
      skipped++;
      continue;
    }

    if (TEST_MODE) {
      printTestPreview(business, email, 1);
      log.push({
        timestamp: new Date().toISOString(),
        firstSentAt: new Date().toISOString(),
        business: business.name,
        city: business.city,
        trade: business.trade,
        rating: business.rating,
        reviews: business.reviews,
        email,
        status: 'TEST_PREVIEW',
        stage: 1
      });
      sent++;
    } else {
      try {
        await sendEmail(email, business, 1);
        console.log(`[${i + 1}/${newProspects.length}] ${business.name} - ${email} - SENT (Email 1)`);
        log.push({
          timestamp: new Date().toISOString(),
          firstSentAt: new Date().toISOString(),
          business: business.name,
          city: business.city,
          trade: business.trade,
          rating: business.rating,
          reviews: business.reviews,
          email,
          status: 'SENT',
          stage: 1
        });
        sent++;
        if (i < newProspects.length - 1) {
          console.log('   Waiting 45s before next email...');
          await sleep(45000);
        }
      } catch (err) {
        console.log(`[${i + 1}/${newProspects.length}] ${business.name} - FAILED (${err.message})`);
        log.push({
          timestamp: new Date().toISOString(),
          business: business.name,
          city: business.city,
          trade: business.trade,
          rating: business.rating,
          reviews: business.reviews,
          email,
          status: 'FAILED',
          stage: 1,
          error: err.message
        });
      }
    }
  }

  saveLog(log);
  console.log(`\n=== SUMMARY: ${sent} sent, ${skipped} skipped ===`);
}

// ── Mode: follow-up on existing prospects ───────────────────────

async function runFollowups(log, allProspects) {
  console.log('=== FOLLOW-UP SEQUENCE ===\n');

  const sentEntries = log.filter(e => e.status === 'SENT' && (e.stage || 1) < 4);
  const prospectMap = Object.fromEntries(allProspects.map(r => [r['Business Name'], r]));

  if (sentEntries.length === 0) {
    console.log('No prospects due for follow-up.');
    return;
  }

  let followed = 0, notReady = 0;

  for (const entry of sentEntries) {
    const nextStage = getNextStage(entry);
    if (!nextStage) {
      const currentStage = entry.stage || 1;
      if (currentStage >= 4) {
        console.log(`  ${entry.business} - sequence complete`);
      } else {
        const firstSent = new Date(entry.firstSentAt || entry.timestamp);
        const daysElapsed = Math.floor((Date.now() - firstSent.getTime()) / (24 * 60 * 60 * 1000));
        const nextDelay = Object.entries(STAGE_DELAYS_MS).find(([s]) => parseInt(s) === currentStage + 1);
        const daysNeeded = nextDelay ? Math.floor(nextDelay[1] / (24 * 60 * 60 * 1000)) : '?';
        console.log(`  ${entry.business} - not ready (day ${daysElapsed}/${daysNeeded})`);
      }
      notReady++;
      continue;
    }

    const row = prospectMap[entry.business];
    const business = row ? csvRowToBusiness(row) : {
      name: entry.business,
      city: entry.city,
      trade: entry.trade,
      rating: entry.rating,
      reviews: entry.reviews || '?'
    };

    if (TEST_MODE) {
      printTestPreview(business, entry.email, nextStage);
      entry.stage = nextStage;
      entry.lastFollowup = new Date().toISOString();
      followed++;
    } else {
      try {
        await sendEmail(entry.email, business, nextStage);
        console.log(`  ${entry.business} - ${entry.email} - SENT (Email ${nextStage})`);
        entry.stage = nextStage;
        entry.lastFollowup = new Date().toISOString();
        entry.status = 'SENT';
        followed++;

        if (followed < sentEntries.length) {
          console.log('   Waiting 45s before next email...');
          await sleep(45000);
        }
      } catch (err) {
        console.log(`  ${entry.business} - FAILED Email ${nextStage} (${err.message})`);
      }
    }
  }

  saveLog(log);
  console.log(`\n=== SUMMARY: ${followed} follow-ups sent, ${notReady} not ready ===`);
}

// ── Mode: send Email 1 to READY (re-scraped) prospects ──────────

async function sendReadyProspects(log, allProspects) {
  console.log('=== SENDING EMAIL 1 TO RE-SCRAPED PROSPECTS ===\n');

  const readyEntries = log.filter(e => e.status === 'READY');
  const prospectMap = Object.fromEntries(allProspects.map(r => [r['Business Name'], r]));

  if (readyEntries.length === 0) {
    console.log('No READY prospects to send to.');
    return;
  }

  let sent = 0;

  for (let i = 0; i < readyEntries.length; i++) {
    const entry = readyEntries[i];
    const row = prospectMap[entry.business];
    const business = row ? csvRowToBusiness(row) : {
      name: entry.business,
      city: entry.city,
      trade: entry.trade,
      rating: entry.rating,
      reviews: entry.reviews || '?'
    };

    if (TEST_MODE) {
      printTestPreview(business, entry.email, 1);
      entry.status = 'TEST_PREVIEW';
      entry.stage = 1;
      entry.firstSentAt = new Date().toISOString();
      sent++;
    } else {
      try {
        await sendEmail(entry.email, business, 1);
        console.log(`[${i + 1}/${readyEntries.length}] ${entry.business} - ${entry.email} - SENT (Email 1)`);
        entry.status = 'SENT';
        entry.stage = 1;
        entry.firstSentAt = new Date().toISOString();
        entry.timestamp = new Date().toISOString();
        sent++;
        if (i < readyEntries.length - 1) {
          console.log('   Waiting 45s before next email...');
          await sleep(45000);
        }
      } catch (err) {
        console.log(`[${i + 1}/${readyEntries.length}] ${entry.business} - FAILED (${err.message})`);
      }
    }
  }

  saveLog(log);
  console.log(`\n=== SUMMARY: ${sent} emails sent to re-scraped prospects ===`);
}

// ── Mode: rescrape skipped prospects ────────────────────────────

async function rescrapeSkipped(log, allProspects) {
  console.log('=== RE-SCRAPING SKIPPED PROSPECTS ===\n');

  const skippedEntries = log.filter(e => e.status === 'SKIPPED');
  const prospectMap = Object.fromEntries(allProspects.map(r => [r['Business Name'], r]));

  if (skippedEntries.length === 0) {
    console.log('No skipped prospects to re-scrape.');
    return;
  }

  let found = 0;

  for (let i = 0; i < skippedEntries.length; i++) {
    const entry = skippedEntries[i];
    const row = prospectMap[entry.business];
    const website = row ? row['Website'] : '';

    console.log(`[${i + 1}/${skippedEntries.length}] ${entry.business} - scraping...`);
    const email = await scrapeEmailFromWebsite(website);

    if (email) {
      console.log(`   FOUND: ${email}`);
      entry.email = email;
      entry.status = 'READY';
      entry.rescrapedAt = new Date().toISOString();
      found++;
    } else {
      console.log(`   Still no email found`);
    }
  }

  saveLog(log);
  console.log(`\n=== SUMMARY: Found ${found} new emails out of ${skippedEntries.length} re-scraped ===`);
}

// ── Mode: print status ──────────────────────────────────────────

function printStatus() {
  const log = loadLog();

  const sent = log.filter(e => e.status === 'SENT');
  const skipped = log.filter(e => e.status === 'SKIPPED');
  const ready = log.filter(e => e.status === 'READY');
  const complete = sent.filter(e => (e.stage || 1) >= 4);
  const inSequence = sent.filter(e => (e.stage || 1) < 4);

  console.log('=== OUTREACH PIPELINE STATUS ===\n');
  console.log(`Total prospects:     ${log.length}`);
  console.log(`In sequence:         ${inSequence.length}`);
  console.log(`Sequence complete:   ${complete.length}`);
  console.log(`Ready (email found): ${ready.length}`);
  console.log(`Skipped (no email):  ${skipped.length}`);

  if (inSequence.length > 0) {
    console.log('\n--- Active Sequences ---');
    for (const entry of inSequence) {
      const stage = entry.stage || 1;
      const firstSent = new Date(entry.firstSentAt || entry.timestamp);
      const daysElapsed = Math.floor((Date.now() - firstSent.getTime()) / (24 * 60 * 60 * 1000));
      const nextStage = getNextStage(entry);
      const dueText = nextStage ? `Email ${nextStage} DUE NOW` : `next not due yet`;
      console.log(`  ${entry.business} (${entry.trade}, ${entry.city}) - Stage ${stage}/4 - Day ${daysElapsed} - ${dueText}`);
    }
  }

  if (ready.length > 0) {
    console.log('\n--- Ready to Send (re-scraped) ---');
    for (const entry of ready) {
      console.log(`  ${entry.business} - ${entry.email}`);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function csvRowToBusiness(row) {
  return {
    name: row['Business Name'],
    phone: row['Phone'],
    website: row['Website'],
    rating: row['Rating'],
    reviews: row['Reviews'],
    address: row['Address'],
    trade: row['Trade'],
    city: row['City']
  };
}

function printTestPreview(business, email, stage) {
  const subject = buildSubject(business, stage);
  const body = buildEmailBody(business, stage);
  console.log(`\n  ${business.name} - ${email} - TEST PREVIEW (Email ${stage})`);
  console.log('  ' + '-'.repeat(56));
  console.log(`  TO:      ${email}`);
  console.log(`  SUBJECT: ${subject}`);
  console.log('  ' + '-'.repeat(56));
  body.split('\n').forEach(line => console.log(`  ${line}`));
  console.log('  ' + '-'.repeat(56));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
