require('dotenv').config({ path: __dirname + '/.env' });

const nodemailer = require('nodemailer');
const { readCSV, writeCSV } = require('./csv-utils');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

async function main() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Error: GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env');
    process.exit(1);
  }

  // Read emails.csv
  const emails = readCSV('emails.csv');
  if (emails.length === 0) {
    console.log('No emails found in emails.csv. Run emailbuilder.js or approve leads first.');
    return;
  }

  // Read leads.csv and build business_name -> email lookup
  const leads = readCSV('leads.csv');
  const emailLookup = {};
  for (const lead of leads) {
    if (lead.email) {
      emailLookup[lead.business_name] = lead.email;
    }
  }

  // Track columns for emails.csv update
  const emailColumns = Object.keys(emails[0]);
  if (!emailColumns.includes('sent_at')) emailColumns.push('sent_at');

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  // Track which businesses have already been sent to (by sent_at or during this run)
  const alreadySent = new Set();
  for (const row of emails) {
    if (row.sent_at && row.sent_at.trim()) alreadySent.add(row.business_name);
  }

  for (const row of emails) {
    // Hard guard: never send if sent_at is populated
    if (row.sent_at && row.sent_at.trim()) {
      console.log(`ALREADY SENT: ${row.business_name} (${row.sent_at})`);
      continue;
    }

    // Hard guard: never double-send to the same business
    if (alreadySent.has(row.business_name)) {
      console.log(`DUPLICATE SKIP: ${row.business_name} (already sent in this batch)`);
      skipped++;
      continue;
    }

    const recipientEmail = emailLookup[row.business_name];
    if (!recipientEmail) {
      console.log(`SKIPPED: ${row.business_name} — no email address in leads.csv`);
      skipped++;
      continue;
    }

    try {
      await transporter.sendMail({
        from: `Landon <${GMAIL_USER}>`,
        to: recipientEmail,
        subject: row.email_subject,
        text: row.email_body.replace(/\|\|/g, '\r\n')
      });

      row.sent_at = new Date().toISOString();
      alreadySent.add(row.business_name);
      sent++;
      console.log(`SENT: ${row.business_name} → ${recipientEmail}`);
    } catch (err) {
      failed++;
      console.error(`FAILED: ${row.business_name} → ${recipientEmail} — ${err.message}`);
    }
  }

  // Save updated emails.csv with sent_at timestamps
  writeCSV('emails.csv', emails, emailColumns);

  console.log(`\nDone. Sent: ${sent} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
