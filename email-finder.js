require('dotenv').config({ path: __dirname + '/.env' });

const fetch = require('node-fetch');
const { readCSV, writeCSV } = require('./csv-utils');

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const BLACKLISTED_DOMAINS = [
  'wixpress.com',
  'sentry.io',
  'sentry-next',
  'amazonaws.com',
  'cloudflare.com',
  'squarespace.com',
  'mailchimp.com',
  'sendgrid.net',
];

function isBlacklistedEmail(email) {
  const lower = (email || '').toLowerCase();
  return BLACKLISTED_DOMAINS.some(d => lower.includes(d));
}

// ── METHOD 1: scrape website for emails ──────────────────────────────
async function scrapeWebsiteForEmail(url) {
  try {
    const res = await fetch(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EmailFinder/1.0)' },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract mailto: links first (higher confidence)
    const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/gi);
    if (mailtoMatches) {
      const email = mailtoMatches[0].replace(/^mailto:/i, '').toLowerCase();
      if (!isBlacklistedEmail(email)) return email;
    }

    // Fall back to any email pattern in the HTML
    const emailMatches = html.match(EMAIL_RE);
    if (emailMatches) {
      // Filter out common non-personal addresses, image files, and blacklisted domains
      const valid = emailMatches.filter(e =>
        !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.svg') &&
        !isBlacklistedEmail(e)
      );
      if (valid.length > 0) return valid[0].toLowerCase();
    }
  } catch (err) {
    // Network errors, timeouts, etc. — fall through to next method
  }
  return null;
}

// ── METHOD 2: Hunter.io domain search ────────────────────────────────
async function hunterDomainSearch(domain) {
  if (!HUNTER_API_KEY) return null;
  try {
    const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}`;
    const res = await fetch(url, { timeout: 10000 });
    if (!res.ok) return null;
    const data = await res.json();

    const emails = (data.data && data.data.emails) || [];
    if (emails.length === 0) return null;

    // Sort by confidence descending and take the best non-blacklisted one
    emails.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    const best = emails.find(e => !isBlacklistedEmail(e.value));
    return best ? best.value.toLowerCase() : null;
  } catch (err) {
    // API errors — fall through
  }
  return null;
}

function extractDomain(websiteUrl) {
  try {
    const hostname = new URL(websiteUrl).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────
async function main() {
  const rows = readCSV('leads.csv');
  if (rows.length === 0) {
    console.log('No leads found in leads.csv');
    return;
  }

  console.log(`Processing ${rows.length} lead(s)...\n`);

  const columns = Object.keys(rows[0]);
  if (!columns.includes('pipeline_status')) columns.push('pipeline_status');

  let found = 0;
  let skipped = 0;
  let invalidDomain = 0;

  for (const row of rows) {
    const name = row.business_name || '(unknown)';

    // Already has an email — check if it's blacklisted
    if (row.email && row.email.trim()) {
      if (isBlacklistedEmail(row.email)) {
        console.log(`  INVALID_DOMAIN: ${name} — ${row.email} (blacklisted)`);
        row.email = '';
        row.pipeline_status = 'email_skip';
        invalidDomain++;
        continue;
      }
      console.log(`  EXISTS : ${name} — ${row.email}`);
      continue;
    }

    const website = (row.website || '').trim();

    // METHOD 1: website scrape
    if (website) {
      const email = await scrapeWebsiteForEmail(website);
      if (email) {
        row.email = email;
        console.log(`  FOUND  : ${name} — ${email} (source: website)`);
        found++;
        continue;
      }
    }

    // METHOD 2: Hunter.io
    if (website) {
      const domain = extractDomain(website);
      if (domain) {
        const email = await hunterDomainSearch(domain);
        if (email) {
          row.email = email;
          console.log(`  FOUND  : ${name} — ${email} (source: hunter)`);
          found++;
          continue;
        }
      }
    }

    // METHOD 3: skip
    console.log(`  SKIP   : ${name} — no website or email found`);
    skipped++;
  }

  // Write updated rows back, preserving all columns
  writeCSV('leads.csv', rows, columns);

  console.log(`\nDone. Found: ${found}, Skipped: ${skipped}, Invalid domain: ${invalidDomain}`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { scrapeWebsiteForEmail, hunterDomainSearch, extractDomain, isBlacklistedEmail };
