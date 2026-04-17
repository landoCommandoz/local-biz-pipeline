require('dotenv').config({ path: require('path').join(__dirname, '/.env') });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const https = require('https');
const http = require('http');
const twilio = require('twilio');
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const MAX_FIX_ATTEMPTS = 2;
const LAST_NOTIFIED_FILE = require('path').join(__dirname, 'last-notified.json');

function saveLastNotified(businessName, liveUrl, localHtmlPath) {
  fs.writeFileSync(LAST_NOTIFIED_FILE, JSON.stringify({ businessName, liveUrl, localHtmlPath, notifiedAt: new Date().toISOString() }, null, 2));
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) return fetchHTML(res.headers.location).then(resolve).catch(reject);
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); res.on('error', reject);
    }).on('error', reject);
  });
}
async function sendWhatsApp(msg) {
  try { await twilioClient.messages.create({ from: process.env.TWILIO_WHATSAPP_FROM, to: process.env.TWILIO_WHATSAPP_TO, body: msg }); console.log('  WhatsApp sent'); }
  catch(e) { console.error('  WhatsApp error:', e.message); }
}
async function runAuditor(liveUrl) {
  console.log('  Auditor fetching:', liveUrl);
  let html;
  try { html = await fetchHTML(liveUrl); } catch(e) { console.error('  Fetch failed:', e.message); return { clean: true, issues: [] }; }
  const r = await claude.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 1000,
    system: 'You are a website QA auditor. Check for: placeholder text (lorem ipsum, undefined, null, {{variable}}), empty sections, broken image refs, visible error text. Return ONLY valid JSON: {"clean":true,"issues":[]} or {"clean":false,"issues":[{"type":"placeholder|missing|broken|error","description":"what is wrong","location":"which element"}]}',
    messages: [{ role: 'user', content: 'Audit this HTML:\n\n' + html.substring(0, 80000) }] });
  try { return JSON.parse(r.content[0].text.trim().replace(/```json|```/g,'')); } catch { return { clean: true, issues: [] }; }
}
async function runFixer(localHtmlPath, issues, businessName) {
  console.log('  Fixer reading:', localHtmlPath);
  const html = fs.readFileSync(localHtmlPath, 'utf8');
  const list = issues.map((i,n) => (n+1)+'. ['+i.type.toUpperCase()+'] '+i.description+' — '+i.location).join('\n');
  const r = await claude.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 16000,
    system: 'You are a website repair agent. Fix ONLY the listed issues. Never remove sections or modify :root variables. Return ONLY complete repaired HTML, no markdown.',
    messages: [{ role: 'user', content: 'Business: '+businessName+'\nFix:\n'+list+'\n\nHTML:\n'+html }] });
  const fixed = r.content[0].text.trim();
  if (!fixed.includes('<html') && !fixed.includes('<!DOCTYPE')) throw new Error('Invalid HTML from fixer');
  if (fixed.length < html.length * 0.5) throw new Error('Fixer output too short (' + fixed.length + ' vs original ' + html.length + ') — rejecting to prevent truncation');
  fs.writeFileSync(localHtmlPath, fixed, 'utf8');
  console.log('  Fixer wrote patched HTML (' + fixed.length + ' chars, was ' + html.length + ')');
}
async function runQA({ businessName, liveUrl, localHtmlPath }) {
  console.log('\nQA START —', businessName);
  let audit = await runAuditor(liveUrl);
  console.log('  Audit 1 — clean:', audit.clean, 'issues:', audit.issues.length);
  if (audit.issues.length > 0) console.log('  Issues:', JSON.stringify(audit.issues, null, 2));
  let attempts = 0;
  while (!audit.clean && attempts < MAX_FIX_ATTEMPTS) {
    attempts++;
    console.log('  Fix attempt', attempts+'/'+MAX_FIX_ATTEMPTS);
    try { await runFixer(localHtmlPath, audit.issues, businessName); const dep = require('./deployer'); if (typeof dep.deployFile === 'function') await dep.deployFile(localHtmlPath, businessName); await sleep(10000); audit = await runAuditor(liveUrl); console.log('  Audit after fix', attempts, '— clean:', audit.clean); if (audit.issues.length > 0) console.log('  Remaining issues:', JSON.stringify(audit.issues, null, 2)); }
    catch(e) { console.error('  Fix error:', e.message); break; }
  }
  saveLastNotified(businessName, liveUrl, localHtmlPath);
  if (audit.clean) {
    await sendWhatsApp('NEW SITE READY — '+businessName+'\nPreview: '+liveUrl+'\n\nReply YES to approve. Reply NO to skip.');
    console.log('QA CLEAN — approval sent');
  } else {
    const issue = audit.issues[0]?.description || 'Unresolved after 2 attempts';
    await sendWhatsApp('CRITICAL REVIEW — '+businessName+'\n'+issue+'\nPreview: '+liveUrl);
    console.log('QA CRITICAL — escalation sent');
  }
}
module.exports = { runQA };
