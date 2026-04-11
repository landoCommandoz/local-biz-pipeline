require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const express = require('express');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const path = require('path');
const { readCSV, writeCSV } = require('./csv-utils');
const { generateEmail, validateEmail } = require('./emailbuilder');

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = 'whatsapp:+14155238886';
const TO_NUMBER = process.env.TWILIO_WHATSAPP_TO || 'whatsapp:+18016805090';
const TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const PENDING_FILE = path.join(__dirname, 'pending-batch.json');

const client = (TWILIO_SID && TWILIO_TOKEN && TWILIO_SID.startsWith('AC'))
  ? twilio(TWILIO_SID, TWILIO_TOKEN)
  : null;
const app = express();
app.use(express.urlencoded({ extended: false }));

const TWIML_EMPTY = '<Response></Response>';

function sendTwiml(res) {
  res.set('Content-Type', 'text/xml');
  res.send(TWIML_EMPTY);
}

// ── PENDING PERSISTENCE ─────────────────────────────────────────────
// Stores one lead at a time: { businessName, city, liveUrl, state, changeRequest, createdAt }
// state: "awaiting_approval" | "awaiting_change_confirm"

function loadPending() {
  try {
    if (fs.existsSync(PENDING_FILE)) {
      return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf-8'));
    }
  } catch (_) { /* ignore */ }
  return null;
}

function savePending(pending) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), 'utf-8');
}

function clearPending() {
  try { fs.unlinkSync(PENDING_FILE); } catch (_) { /* ignore */ }
}

// ── CSV HELPERS ─────────────────────────────────────────────────────

function getLeadsAndColumns() {
  const rows = readCSV('leads.csv');
  if (rows.length === 0) return { rows: [], columns: [] };
  const columns = Object.keys(rows[0]);
  if (!columns.includes('approval_status')) columns.push('approval_status');
  return { rows, columns };
}

function saveLeadCSV(rows, columns) {
  writeCSV('leads.csv', rows, columns);
}

function parseCity(address) {
  const parts = (address || '').split(',').map(s => s.trim());
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 3];
    if (candidate && !/^\d/.test(candidate)) return candidate;
  }
  return 'your area';
}

// ── EMAIL HELPERS ───────────────────────────────────────────────────

function generateAndSaveEmail(row) {
  const { subject, body } = generateEmail(row);
  const issues = validateEmail(subject, body, row.business_name);
  for (const issue of issues) {
    console.warn(`  FLAG: [${issue.cat}] ${issue.desc}`);
  }

  const emailRow = {
    business_name: row.business_name,
    email_subject: subject,
    email_body: body,
    live_url: row.live_url || row.local_file
  };

  const emailColumns = ['business_name', 'email_subject', 'email_body', 'live_url'];
  let existingEmails = [];
  try { existingEmails = readCSV('emails.csv'); } catch (_) { /* file may not exist */ }

  existingEmails.push(emailRow);
  writeCSV('emails.csv', existingEmails, emailColumns);

  console.log(`  EMAIL SAVED: ${row.business_name} - "${subject}"`);
}

async function sendOutreachEmail(row) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.warn(`  SEND SKIP: GMAIL_USER or GMAIL_APP_PASSWORD not set`);
    return false;
  }

  if (!row.email) {
    console.warn(`  SEND SKIP: no email address for ${row.business_name}`);
    return false;
  }

  const emails = readCSV('emails.csv');
  const emailRow = emails.find(e => e.business_name === row.business_name && (!e.sent_at || !e.sent_at.trim()));
  if (!emailRow) {
    console.warn(`  SEND SKIP: no unsent email in emails.csv for ${row.business_name}`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass }
  });

  await transporter.sendMail({
    from: `Landon <${gmailUser}>`,
    to: row.email,
    subject: emailRow.email_subject,
    text: emailRow.email_body.replace(/\|\|/g, '\r\n')
  });

  const emailColumns = Object.keys(emails[0]);
  if (!emailColumns.includes('sent_at')) emailColumns.push('sent_at');
  emailRow.sent_at = new Date().toISOString();
  writeCSV('emails.csv', emails, emailColumns);

  console.log(`  SENT: ${row.business_name} -> ${row.email}`);
  return true;
}

// ── WHATSAPP ────────────────────────────────────────────────────────

async function sendWhatsAppMessage(body) {
  if (!client) {
    console.warn('  WhatsApp SKIP: Twilio not configured');
    return null;
  }
  const message = await client.messages.create({
    body,
    from: FROM_NUMBER,
    to: TO_NUMBER
  });
  console.log(`  WhatsApp sent: ${message.sid}`);
  return message.sid;
}

// ── PER-LEAD ACTIONS ────────────────────────────────────────────────

async function approveLead(pending) {
  const { rows, columns } = getLeadsAndColumns();
  const row = rows.find(r => r.business_name === pending.businessName);

  if (!row) {
    console.warn(`  SKIP: ${pending.businessName} not found in leads.csv`);
    clearPending();
    return;
  }

  if (row.approval_status === 'approved') {
    console.log(`  ALREADY APPROVED: ${pending.businessName} (skipping)`);
    clearPending();
    return;
  }

  row.approval_status = 'approved';
  generateAndSaveEmail(row);
  saveLeadCSV(rows, columns);

  clearPending();
  console.log(`  APPROVED (held for SHIP): ${pending.businessName}`);
}

function skipLead(pending) {
  const { rows, columns } = getLeadsAndColumns();
  const row = rows.find(r => r.business_name === pending.businessName);

  if (row && row.approval_status !== 'approved') {
    row.approval_status = 'skipped';
    saveLeadCSV(rows, columns);
  }

  clearPending();
  console.log(`  SKIPPED: ${pending.businessName}`);
}

// ── SHIP ALL ────────────────────────────────────────────────────────

async function shipAll() {
  const { rows } = getLeadsAndColumns();
  const emails = readCSV('emails.csv');
  const emailColumns = Object.keys(emails[0]);
  if (!emailColumns.includes('sent_at')) emailColumns.push('sent_at');

  // Find approved leads with unsent emails
  const approvedNames = new Set(
    rows.filter(r => r.approval_status === 'approved').map(r => r.business_name)
  );

  const alreadyShipped = new Set();
  const toShip = [];

  for (const emailRow of emails) {
    if (emailRow.sent_at && emailRow.sent_at.trim()) {
      alreadyShipped.add(emailRow.business_name);
      continue;
    }
    if (!approvedNames.has(emailRow.business_name)) continue;
    if (alreadyShipped.has(emailRow.business_name)) continue;
    toShip.push(emailRow);
    alreadyShipped.add(emailRow.business_name);
  }

  if (toShip.length === 0) {
    console.log('  SHIP: No held emails to send');
    await sendWhatsAppMessage('No held emails to ship.');
    return 0;
  }

  console.log(`  SHIP: Sending ${toShip.length} held emails...`);

  const emailLookup = {};
  for (const r of rows) {
    if (r.email) emailLookup[r.business_name] = r.email;
  }

  let shipped = 0;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn('  SHIP ABORT: GMAIL_USER or GMAIL_APP_PASSWORD not set');
    await sendWhatsAppMessage('Cannot ship: Gmail credentials not configured.');
    return 0;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass }
  });

  for (const emailRow of toShip) {
    const to = emailLookup[emailRow.business_name];
    if (!to) {
      console.log(`  SHIP SKIP: ${emailRow.business_name} — no email address`);
      continue;
    }

    try {
      await transporter.sendMail({
        from: `Landon <${gmailUser}>`,
        to,
        subject: emailRow.email_subject,
        text: emailRow.email_body.replace(/\|\|/g, '\r\n')
      });

      emailRow.sent_at = new Date().toISOString();
      alreadyShipped.add(emailRow.business_name);
      shipped++;
      console.log(`  SHIPPED: ${emailRow.business_name} -> ${to}`);
    } catch (err) {
      console.error(`  SHIP FAILED: ${emailRow.business_name} — ${err.message}`);
    }
  }

  writeCSV('emails.csv', emails, emailColumns);
  await sendWhatsAppMessage(`Shipped ${shipped} emails.`);
  console.log(`  SHIP COMPLETE: ${shipped} emails sent`);
  return shipped;
}

// ── WEBHOOK ─────────────────────────────────────────────────────────

app.post('/webhook', async (req, res) => {
  const rawBody = (req.body.Body || '').trim();
  const upperBody = rawBody.toUpperCase();
  const from = req.body.From;

  console.log(`WEBHOOK: Received "${rawBody}" from ${from}`);

  if (from !== TO_NUMBER) {
    console.log(`  IGNORED: message from unknown number ${from}`);
    return sendTwiml(res);
  }

  // SHIP command works anytime — no pending lead required
  if (upperBody === 'SHIP') {
    sendTwiml(res);
    await shipAll();
    return;
  }

  const pending = loadPending();
  if (!pending) {
    console.log('  IGNORED: no pending lead');
    return sendTwiml(res);
  }

  const name = pending.businessName;

  // State: awaiting initial approval
  if (pending.state === 'awaiting_approval') {
    if (upperBody === 'YES') {
      sendTwiml(res);
      await approveLead(pending);
      await sendWhatsAppMessage(`Approved ${name}. Email held for SHIP.`);
    } else if (upperBody === 'NO') {
      skipLead(pending);
      sendTwiml(res);
      await sendWhatsAppMessage(`Skipped ${name}.`);
    } else {
      // Treat as change request
      pending.state = 'awaiting_change_confirm';
      pending.changeRequest = rawBody;
      savePending(pending);
      console.log(`  CHANGE_REQUESTED: ${name} - "${rawBody}"`);

      sendTwiml(res);
      await sendWhatsAppMessage(
        `Got it. Changes noted for ${name}:\n'${rawBody}'\nReply YES to send email now anyway\nReply HOLD to keep it pending`
      );
    }
    return;
  }

  // State: awaiting confirmation after change request
  if (pending.state === 'awaiting_change_confirm') {
    if (upperBody === 'YES') {
      sendTwiml(res);
      await approveLead(pending);
      await sendWhatsAppMessage(`Approved ${name} (change noted: '${pending.changeRequest}'). Email held for SHIP.`);
    } else if (upperBody === 'HOLD') {
      console.log(`  HOLD: ${name} kept pending with change request`);
      sendTwiml(res);
      await sendWhatsAppMessage(`${name} kept pending. Change request saved.`);
    } else if (upperBody === 'NO') {
      skipLead(pending);
      sendTwiml(res);
      await sendWhatsAppMessage(`Skipped ${name}.`);
    } else {
      // Update the change request with new text
      pending.changeRequest = rawBody;
      savePending(pending);
      console.log(`  CHANGE_UPDATED: ${name} - "${rawBody}"`);
      sendTwiml(res);
      await sendWhatsAppMessage(
        `Updated changes for ${name}:\n'${rawBody}'\nReply YES to send email now anyway\nReply HOLD to keep it pending`
      );
    }
    return;
  }

  sendTwiml(res);
});

app.get('/health', (_req, res) => {
  const pending = loadPending();

  // Count held emails (approved but unsent)
  let held = 0;
  try {
    const { rows } = getLeadsAndColumns();
    const approvedNames = new Set(
      rows.filter(r => r.approval_status === 'approved').map(r => r.business_name)
    );
    const emails = readCSV('emails.csv');
    const seen = new Set();
    for (const e of emails) {
      if (e.sent_at && e.sent_at.trim()) { seen.add(e.business_name); continue; }
      if (approvedNames.has(e.business_name) && !seen.has(e.business_name)) {
        held++;
        seen.add(e.business_name);
      }
    }
  } catch (_) { /* ignore */ }

  res.json({
    status: 'ok',
    pending: pending ? pending.businessName : null,
    state: pending ? pending.state : null,
    changeRequest: pending ? pending.changeRequest || null : null,
    held
  });
});

// ── SEND APPROVAL FOR ONE LEAD ──────────────────────────────────────
// Called by pipeline.js per lead after deploy

async function sendApproval(row) {
  const name = row.business_name;
  const city = parseCity(row.address);
  const url = row.live_url || row.local_file;

  const pending = {
    businessName: name,
    city,
    liveUrl: url,
    state: 'awaiting_approval',
    changeRequest: null,
    createdAt: new Date().toISOString()
  };
  savePending(pending);

  const body = [
    'New site ready.',
    `Business: ${name}`,
    `City: ${city}`,
    `Preview: ${url}`,
    '',
    'Reply YES to send email',
    'Reply NO to skip',
    'Reply with any other text to request changes'
  ].join('\n');

  await sendWhatsAppMessage(body);
  console.log(`  APPROVAL SENT: ${name}`);
}

// ── MAIN (standalone mode) ──────────────────────────────────────────

async function main() {
  if (!TWILIO_SID || !TWILIO_TOKEN) {
    console.error('Error: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env');
    process.exit(1);
  }

  const { rows } = getLeadsAndColumns();

  if (rows.length === 0) {
    console.log('No leads found. Run the earlier scripts first.');
    return;
  }

  const needsApproval = rows.filter(r => r.local_file && !r.approval_status);

  if (needsApproval.length === 0) {
    // Check if there's a pending lead from a previous run
    const pending = loadPending();
    if (pending) {
      console.log(`Resuming pending lead: ${pending.businessName} (state: ${pending.state})`);
    } else {
      console.log('No leads need approval. All leads already have an approval_status.');
      return;
    }
  }

  // Start the webhook server
  const server = app.listen(3001, () => {
    console.log('Webhook server listening on port 3001');
    const codespaceName = process.env.CODESPACE_NAME;
    if (codespaceName) {
      const publicUrl = `https://${codespaceName}-3001.app.github.dev/webhook`;
      console.log(`\nTWILIO INBOUND URL:\n${publicUrl}\n`);
    } else {
      console.log('\nWARN: CODESPACE_NAME not set');
      console.log('Configure Twilio webhook URL to POST to http://<your-host>:3001/webhook\n');
    }
  });

  // If resuming a pending lead, just start the server (no new WhatsApp)
  const existingPending = loadPending();
  if (existingPending) {
    console.log(`Waiting for reply on: ${existingPending.businessName} (state: ${existingPending.state})`);
    return;
  }

  // Send approval for each lead one at a time
  for (const row of needsApproval) {
    await sendApproval(row);

    // Wait for this lead to be resolved before sending next
    await new Promise((resolve) => {
      const check = setInterval(() => {
        const p = loadPending();
        if (!p || p.businessName !== row.business_name) {
          clearInterval(check);
          resolve();
        }
      }, 2000);

      // 24-hour timeout per lead
      setTimeout(() => {
        clearInterval(check);
        const p = loadPending();
        if (p && p.businessName === row.business_name) {
          console.log(`  TIMEOUT: ${row.business_name} — auto-skipping`);
          skipLead(p);
        }
        resolve();
      }, TIMEOUT_MS);
    });
  }

  console.log('\nAll leads processed. Shutting down.');
  server.close();
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { sendWhatsAppMessage, sendApproval, main };
