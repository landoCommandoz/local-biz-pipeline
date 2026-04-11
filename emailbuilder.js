require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const path = require('path');
const { readCSV, writeCSV } = require('./csv-utils');

const ERROR_LOG = path.join(__dirname, 'email-errors.log');

// ---------------------------------------------------------------------------
// NICHE INTELLIGENCE
// ---------------------------------------------------------------------------

const NICHES = {
  plumber: {
    hook: (city) => `I was searching for a plumber in ${city} and your name came up, but there was no website.`,
    bridge: 'So I built one for you.'
  },
  plumbing: {
    hook: (city) => `I was searching for a plumber in ${city} and your name came up, but there was no website.`,
    bridge: 'So I built one for you.'
  },
  hvac: {
    hook: () => 'Between seasons is when HVAC companies either grow or disappear online.',
    bridge: 'I figured I\'d just build one and show you.'
  },
  'heating and air': {
    hook: () => 'Between seasons is when HVAC companies either grow or disappear online.',
    bridge: 'I figured I\'d just build one and show you.'
  },
  landscaper: {
    hook: (city) => `Spring is coming and most people looking for lawn care in ${city} are already searching online.`,
    bridge: 'So I went ahead and put one together.'
  },
  landscaping: {
    hook: (city) => `Spring is coming and most people looking for lawn care in ${city} are already searching online.`,
    bridge: 'So I went ahead and put one together.'
  },
  'lawn care': {
    hook: (city) => `Spring is coming and most people looking for lawn care in ${city} are already searching online.`,
    bridge: 'So I went ahead and put one together.'
  },
  cleaning: {
    hook: (city) => `People searching for cleaning services in ${city} skip businesses with no web presence entirely.`,
    bridge: 'So I built one for you.'
  },
  'cleaning service': {
    hook: (city) => `People searching for cleaning services in ${city} skip businesses with no web presence entirely.`,
    bridge: 'So I built one for you.'
  },
  maid: {
    hook: (city) => `People searching for cleaning services in ${city} skip businesses with no web presence entirely.`,
    bridge: 'So I built one for you.'
  },
  'mobile mechanic': {
    hook: (city) => `When someone's car breaks down in ${city} the first thing they do is search their phone.`,
    bridge: 'I figured I\'d just build one and show you.'
  },
  mechanic: {
    hook: () => 'Most people choose a mechanic before they ever call one.',
    bridge: 'So I built one for you.'
  },
  'auto repair': {
    hook: () => 'Most people choose a mechanic before they ever call one.',
    bridge: 'So I built one for you.'
  },
  'auto shop': {
    hook: () => 'Most people choose a mechanic before they ever call one.',
    bridge: 'So I built one for you.'
  },
  salon: {
    hook: (city) => `Instagram is great for showing your work but people searching for a salon in ${city} on Google won't find you.`,
    bridge: 'So I went ahead and put one together.'
  },
  hair: {
    hook: (city) => `Instagram is great for showing your work but people searching for a salon in ${city} on Google won't find you.`,
    bridge: 'So I went ahead and put one together.'
  },
  nail: {
    hook: (city) => `Instagram is great for showing your work but people searching for a salon in ${city} on Google won't find you.`,
    bridge: 'So I went ahead and put one together.'
  },
  barber: {
    hook: (city) => `Instagram is great for showing your work but people searching for a barber in ${city} on Google won't find you.`,
    bridge: 'So I went ahead and put one together.'
  },
  restaurant: {
    hook: (city) => `People searching for food in ${city} want to see a menu before they decide.`,
    bridge: 'I figured I\'d just build one and show you.'
  },
  food: {
    hook: (city) => `People searching for food in ${city} want to see a menu before they decide.`,
    bridge: 'I figured I\'d just build one and show you.'
  },
  contractor: {
    hook: (city) => `Homeowners in ${city} spend weeks researching contractors before making a single call.`,
    bridge: 'So I built one for you.'
  },
  'general contractor': {
    hook: (city) => `Homeowners in ${city} spend weeks researching contractors before making a single call.`,
    bridge: 'So I built one for you.'
  },
  handyman: {
    hook: (city) => `Homeowners in ${city} spend weeks researching contractors before making a single call.`,
    bridge: 'So I built one for you.'
  },
  electrician: {
    hook: () => 'When something goes wrong electrically people want to see a real business before they call.',
    bridge: 'So I built one for you.'
  },
  electrical: {
    hook: () => 'When something goes wrong electrically people want to see a real business before they call.',
    bridge: 'So I built one for you.'
  }
};

const DEFAULT_NICHE = {
  hook: () => 'Most people check online before they call a local business.',
  bridge: 'So I built one for you.'
};

// ---------------------------------------------------------------------------
// ERROR LOG
// ---------------------------------------------------------------------------

function readErrorLog() {
  try {
    if (fs.existsSync(ERROR_LOG)) {
      return fs.readFileSync(ERROR_LOG, 'utf-8');
    }
  } catch (_) { /* ignore */ }
  return '';
}

function appendErrorLog(category, description) {
  const now = new Date();
  const ts = now.toISOString().replace('T', ' ').slice(0, 16);
  const line = `[${ts}] ${category}: ${description}\n`;
  try {
    fs.appendFileSync(ERROR_LOG, line, 'utf-8');
  } catch (_) { /* ignore */ }
}

// ---------------------------------------------------------------------------
// PARSING
// ---------------------------------------------------------------------------

function parseCategory(raw) {
  // Take last comma-separated token, lowercase, trim
  return (raw || 'services').split(',').pop().trim().toLowerCase() || 'services';
}

function parseCity(address) {
  // "165 Gregson Ave S, Salt Lake City, UT 84115, USA" -> "Salt Lake City"
  const parts = (address || '').split(',').map(s => s.trim());
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 3];
    if (candidate && !/^\d/.test(candidate)) return candidate;
  }
  return 'your area';
}

function matchNiche(category) {
  const lower = category.toLowerCase();
  // Try exact match first
  if (NICHES[lower]) return NICHES[lower];
  // Try partial match
  for (const [key, niche] of Object.entries(NICHES)) {
    if (lower.includes(key) || key.includes(lower)) return niche;
  }
  return DEFAULT_NICHE;
}

// ---------------------------------------------------------------------------
// VALIDATION
// ---------------------------------------------------------------------------

const BANNED_WORDS = [
  'solutions', 'leverage', 'premier', 'cutting-edge', 'state-of-the-art',
  'synergy', 'great business', 'love what you', 'impressive',
  'limited time', 'act now', 'don\'t miss out',
  'professional services'
];

function validateEmail(subject, body, businessName) {
  const issues = [];
  const full = subject + ' ' + body;

  // Em dashes
  if (full.includes('\u2014') || full.includes('&mdash;')) {
    issues.push({ cat: 'FORMATTING', desc: `Em dash found in email for ${businessName}` });
  }

  // Banned words
  const lower = full.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      issues.push({ cat: 'TONE', desc: `Banned phrase "${word}" found in email for ${businessName}` });
    }
  }

  // Subject line checks
  if (subject.includes('\u2014') || subject.includes('"') || subject.includes("'")) {
    issues.push({ cat: 'FORMATTING', desc: `Subject contains quotes or em dash for ${businessName}` });
  }
  if (/[.!?]$/.test(subject)) {
    issues.push({ cat: 'FORMATTING', desc: `Subject ends with punctuation for ${businessName}` });
  }

  // Body line count (6 lines max including sign off, blank lines don't count)
  const contentLines = body.split(/\|\||\n/).filter(l => l.trim().length > 0);
  if (contentLines.length > 6) {
    issues.push({ cat: 'FORMATTING', desc: `Body exceeds 6 content lines (${contentLines.length}) for ${businessName}` });
  }

  // Last name check
  if (lower.includes('brewington')) {
    issues.push({ cat: 'TONE', desc: `Last name "Brewington" found in email for ${businessName}` });
  }

  // Price in subject
  if (subject.includes('$')) {
    issues.push({ cat: 'CTA', desc: `Price mentioned in subject line for ${businessName}` });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// EMAIL GENERATION
// ---------------------------------------------------------------------------

function generateEmail(row) {
  const name = row.business_name;
  const url = row.live_url;
  const category = parseCategory(row.category);
  const city = parseCity(row.address);
  const niche = category.split(/\s+/).pop();

  const subject = `${name} is losing customers right now`;

  const body = [
    `Someone in ${city} searched for ${niche} help last night and called whoever showed up first.`,
    'You weren\'t there. \uD83D\uDCF5',
    `So I built you a website. Take a look: ${url}`,
    'Here\'s what it does for you:',
    '\uD83D\uDCCD Shows up on Google when locals search for your service',
    '\uD83D\uDCAC Answers customer questions 24/7 with a built-in chat assistant',
    '\u2B50 Displays your reviews and builds trust before they ever call',
    'All of it runs itself. You do nothing.',
    '$99/month. I handle everything including updates, changes, and the chat agent. Cancel anytime.',
    'The site comes down in 7 days if I don\'t hear from you. \uD83D\uDCC5',
    'Just reply to this email if you want to keep it.',
    'Landon'
  ].join('||');

  return { subject, body };
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  // Read error log from previous runs
  const priorErrors = readErrorLog();
  if (priorErrors) {
    console.log(`Loaded ${priorErrors.split('\n').filter(Boolean).length} prior error entries from email-errors.log`);
  }

  const rows = readCSV('leads.csv');

  if (rows.length === 0) {
    console.log('No leads found. Run the earlier scripts first.');
    return;
  }

  const emails = [];

  for (const row of rows) {
    if (!row.live_url) {
      console.log(`SKIP: ${row.business_name} (no live_url, run deployer.js)`);
      continue;
    }

    try {
      const { subject, body } = generateEmail(row);

      // Validate before writing
      const issues = validateEmail(subject, body, row.business_name);
      for (const issue of issues) {
        appendErrorLog(issue.cat, issue.desc);
        console.warn(`  FLAG: [${issue.cat}] ${issue.desc}`);
      }

      emails.push({
        business_name: row.business_name,
        email_subject: subject,
        email_body: body,
        live_url: row.live_url
      });

      console.log(`EMAIL: ${row.business_name} - "${subject}"`);
    } catch (err) {
      appendErrorLog('OTHER', `${row.business_name}: ${err.message}`);
      console.warn(`ERROR: ${row.business_name} - ${err.message} - skipping`);
    }
  }

  if (emails.length === 0) {
    console.log('No emails to generate. Ensure deployer.js has run first.');
    return;
  }

  const columns = ['business_name', 'email_subject', 'email_body', 'live_url'];
  writeCSV('emails.csv', emails, columns);
  console.log(`\nWrote ${emails.length} emails to emails.csv`);
}

// Run main only when executed directly
if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { generateEmail, validateEmail, parseCategory, parseCity };
