require('dotenv').config({ path: __dirname + '/../.env' });
const twilio = require('twilio');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  TWILIO_WHATSAPP_TO
} = process.env;

let client = null;
function getClient() {
  if (client) return client;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('twilio-whatsapp: TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing from .env');
  }
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
}

async function escalate({ business, reason, detail, link }) {
  const parts = [
    `[${business}] ESCALATION`,
    reason ? `Reason: ${reason}` : null,
    detail ? `Detail: ${detail}` : null,
    link ? `Link: ${link}` : null,
    'Reply when you want this business to continue.'
  ].filter(Boolean);
  const body = parts.join('\n');
  await getClient().messages.create({
    from: TWILIO_WHATSAPP_FROM,
    to: TWILIO_WHATSAPP_TO,
    body
  });
  return body;
}

async function report({ business, status, income, cost, note }) {
  const parts = [
    `[${business}] ${status || 'UPDATE'}`,
    income != null ? `Income: $${income}` : null,
    cost != null ? `Cost: $${cost}` : null,
    note ? note : null
  ].filter(Boolean);
  const body = parts.join('\n');
  await getClient().messages.create({
    from: TWILIO_WHATSAPP_FROM,
    to: TWILIO_WHATSAPP_TO,
    body
  });
  return body;
}

async function awaitReply({ windowMinutes = 30, since } = {}) {
  const startedAt = since || new Date(Date.now() - 60_000);
  const deadline = Date.now() + windowMinutes * 60_000;
  while (Date.now() < deadline) {
    const messages = await getClient().messages.list({
      from: TWILIO_WHATSAPP_TO,
      to: TWILIO_WHATSAPP_FROM,
      dateSentAfter: startedAt,
      limit: 5
    });
    if (messages.length > 0) {
      const latest = messages[0];
      return { body: (latest.body || '').trim(), sid: latest.sid, receivedAt: latest.dateSent };
    }
    await new Promise(r => setTimeout(r, 10_000));
  }
  return null;
}

module.exports = { escalate, report, awaitReply };
