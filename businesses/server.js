require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.COMMAND_PORT || 3000;
const BUSINESSES_DIR = __dirname;

function readJSON(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return fallback; }
}

function readText(p, fallback = '') {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return fallback; }
}

function listBusinesses() {
  return fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(n => !n.startsWith('.') && n !== 'node_modules' && n !== 'public' && n !== 'lib');
}

function extractMission(charterMd) {
  const m = charterMd.match(/## Mission\s*\n+([^\n#]+(?:\n(?!#)[^\n]+)*)/);
  return m ? m[1].trim().split('\n').join(' ') : '';
}

function extractProduct(charterMd) {
  const m = charterMd.match(/## Product\s*\n+([^\n#]+(?:\n(?!#)[^\n]+)*)/);
  if (!m) return '';
  const first = m[1].trim().split(/\n\s*\n/)[0];
  return first.length > 240 ? first.slice(0, 237) + '...' : first;
}

function readBusiness(name) {
  const dir = path.join(BUSINESSES_DIR, name);
  const charterMd = readText(path.join(dir, 'charter.md'));
  const state = readJSON(path.join(dir, 'state.json'), {});
  const logMd = readText(path.join(dir, 'log.md'));
  const recentLog = logMd.split('\n').filter(Boolean).slice(-6);
  return {
    name,
    display_name: state.display_name || null,
    charter_version: state.charter_version || '?',
    status: state.status || 'unknown',
    mode: state.current_mode || 'idle',
    mission: extractMission(charterMd),
    product: extractProduct(charterMd),
    last_tick_at: state.last_tick_at,
    last_tick_summary: state.last_tick_summary,
    last_escalation_at: state.last_escalation_at,
    last_escalation_reason: state.last_escalation_reason,
    failures_in_row: state.failures_in_row || 0,
    month_to_date: state.month_to_date || { income: 0, cost: 0 },
    recent_log: recentLog,
    business_pitch: state.business_pitch || null,
    self_funding_plan: state.self_funding_plan || null,
    hired_roster: Array.isArray(state.hired_roster) ? state.hired_roster : []
  };
}

app.get('/api/portfolio', (req, res) => {
  try {
    const { readCSV } = require('../csv-utils');
    const leadsPath = path.join(__dirname, '..', 'leads.csv');
    const manifestPath = path.join(__dirname, 'scout', 'portfolio-manifest.json');
    const shotsDir = path.join(__dirname, '..', 'screenshots');
    const slugify = n => (n || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

    const rows = readCSV(leadsPath);
    const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) : null;
    const manifestIndex = new Map();
    if (manifest && Array.isArray(manifest.items)) {
      manifest.items.forEach(m => manifestIndex.set(m.slug, m));
    }

    const items = rows
      .filter(r => r.live_url && r.live_url.trim() && r.local_file)
      .map(r => {
        const slug = slugify(r.business_name);
        const mobileRel = `/screenshots/${slug}-mobile.png`;
        const desktopRel = `/screenshots/${slug}-desktop.png`;
        const mobileExists = fs.existsSync(path.join(shotsDir, `${slug}-mobile.png`));
        const desktopExists = fs.existsSync(path.join(shotsDir, `${slug}-desktop.png`));
        const cityGuess = (r.address || '').split(',')[1]?.trim() || '';
        const stateGuess = ((r.address || '').split(',')[2] || '').trim().slice(0, 2);
        return {
          slug,
          business: r.business_name,
          trade: (r.category || '').toLowerCase(),
          city: cityGuess,
          state: stateGuess,
          rating: Number(r.rating) || null,
          reviews: Number(r.review_count) || null,
          live_url: r.live_url.trim(),
          original_site: r.website || null,
          desktop: desktopExists ? desktopRel : null,
          mobile: mobileExists ? mobileRel : null,
          has_shot: desktopExists || mobileExists
        };
      });

    const trades = [...new Set(items.map(i => i.trade).filter(Boolean))].sort();
    const cities = [...new Set(items.map(i => i.city).filter(Boolean))].sort();

    res.json({
      time: new Date().toISOString(),
      total: items.length,
      captured: items.filter(i => i.has_shot).length,
      pending: items.filter(i => !i.has_shot).length,
      scrape_status: manifest ? 'complete' : 'running_or_not_started',
      trades,
      cities,
      items
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/screenshots', express.static(path.join(__dirname, '..', 'screenshots')));

// ================================================================
// REAL ESTATE: vacancies, applications, rent-roll
// ================================================================
function readDirMarkdowns(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => {
      const full = path.join(dir, f);
      let stat;
      try { stat = fs.statSync(full); } catch { stat = null; }
      const raw = readText(full, '');
      const first = raw.split('\n').find((l) => l.startsWith('# '));
      const title = first ? first.replace(/^#\s+/, '').trim() : f;
      const statusMatch = raw.match(/\*\*Status:\*\*\s*([a-z-]+)/i);
      const rentMatch = raw.match(/\*\*Baseline rent:\*\*\s*\$(\d+)/);
      return {
        slug: f.replace(/\.md$/, ''),
        title,
        status: statusMatch ? statusMatch[1] : null,
        rent_mo: rentMatch ? Number(rentMatch[1]) : null,
        triaged: /## Realtor triage/i.test(raw),
        listed_at: stat ? stat.mtime.toISOString() : null,
        body: raw
      };
    });
}

app.get('/api/realestate', (req, res) => {
  try {
    const vacanciesDir = path.join(BUSINESSES_DIR, 'realtor', 'vacancies');
    const applicationsDir = path.join(BUSINESSES_DIR, 'realtor', 'applications');
    const rentRollPath = path.join(BUSINESSES_DIR, 'realtor', 'rent-roll.json');
    const vacancies = readDirMarkdowns(vacanciesDir);
    const applications = readDirMarkdowns(applicationsDir);
    const rent_roll = readJSON(rentRollPath, null);
    res.json({
      time: new Date().toISOString(),
      baseline_rent_mo: 20,
      vacancies,
      applications,
      rent_roll,
      tenants_total: rent_roll && Array.isArray(rent_roll.tenants) ? rent_roll.tenants.length : 0,
      vacancies_total: vacancies.length,
      applications_total: applications.length,
      occupancy_pct: rent_roll ? rent_roll.occupancy_pct : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/state', (req, res) => {
  const pnl = readJSON(path.join(BUSINESSES_DIR, 'pnl.json'), {});
  const names = listBusinesses();
  const businesses = names.map(readBusiness);
  const totalIncome = businesses.reduce((s, b) => s + (b.month_to_date.income || 0), 0);
  const totalCost = businesses.reduce((s, b) => s + (b.month_to_date.cost || 0), 0);
  // aggregate hires across all agents' hired_roster[] -> top-level hires[]
  const hires = [];
  for (const n of names) {
    const raw = readJSON(path.join(BUSINESSES_DIR, n, 'state.json'), {});
    const roster = Array.isArray(raw.hired_roster) ? raw.hired_roster : [];
    for (const h of roster) hires.push({ ...h, hired_by: n });
  }
  res.json({
    time: new Date().toISOString(),
    overall: {
      income_total: pnl.overall?.income_total || 0,
      cost_total: pnl.overall?.cost_total || 0,
      surplus_to_lando: pnl.overall?.surplus_to_lando || 0,
      mtd_income: totalIncome,
      mtd_cost: totalCost,
      mtd_net: totalIncome - totalCost
    },
    businesses,
    hires
  });
});

// Merged activity feed across all agents' log.md files (last N lines, chronologically).
// Each line that starts with a date header gets tagged with the agent. Blank lines skipped.
app.get('/api/activity', (req, res) => {
  try {
    const names = listBusinesses();
    const entries = [];
    const dateRe = /^(20\d\d-\d\d-\d\d[T ]?\d\d[:.]?\d\d)/;
    for (const name of names) {
      const logPath = path.join(BUSINESSES_DIR, name, 'log.md');
      const txt = readText(logPath, '');
      const lines = txt.split('\n');
      let currentTs = null;
      for (const ln of lines) {
        if (!ln.trim()) continue;
        const m = ln.match(dateRe);
        if (m) currentTs = m[1];
        // grab meaningful lines: not the bare header, but any bullet / info line
        if (ln.startsWith('## ')) continue;
        entries.push({
          agent: name,
          ts: currentTs || '',
          text: ln.replace(/^[-*]\s*/, '').replace(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}\s::\s\w+\s::\s*/, '').trim()
        });
      }
    }
    // newest first; if ts missing, push to bottom
    entries.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
    const limit = Math.min(Number(req.query.limit) || 80, 400);
    res.json({
      time: new Date().toISOString(),
      entries: entries.slice(0, limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(BUSINESSES_DIR, 'public')));

app.get('/agents.json', (req, res) => res.sendFile(path.join(BUSINESSES_DIR, '..', 'agents.json')));
app.get('/businesses/realtor/rent-roll.json', (req, res) => res.sendFile(path.join(BUSINESSES_DIR, 'realtor', 'rent-roll.json')));
app.get('/businesses/pnl.json', (req, res) => res.sendFile(path.join(BUSINESSES_DIR, 'pnl.json')));

const sseClients = new Set();
function sseBroadcast(eventName, payload) {
  const data = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) { try { res.write(data); } catch {} }
}

app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();
  res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, time: new Date().toISOString() })}\n\n`);
  sseClients.add(res);
  const keep = setInterval(() => { try { res.write(`: ping\n\n`); } catch {} }, 15000);
  req.on('close', () => { clearInterval(keep); sseClients.delete(res); });
});

const names = listBusinesses();
for (const name of names) {
  const dir = path.join(BUSINESSES_DIR, name);
  const watchPaths = ['state.json', 'log.md', 'ledger.json', 'sales.jsonl', 'expenses.jsonl'];
  for (const rel of watchPaths) {
    const p = path.join(dir, rel);
    try {
      fs.watch(p, { persistent: false }, () => {
        sseBroadcast('change', { agent: name, file: rel, time: new Date().toISOString() });
      });
    } catch {}
  }
}
try {
  fs.watch(path.join(BUSINESSES_DIR, 'foreman', 'candidates'), { persistent: false }, (_ev, file) => {
    sseBroadcast('hire', { agent: 'foreman', file, time: new Date().toISOString() });
  });
} catch {}

// Watch realtor real-estate inboxes for live dashboard updates
for (const sub of ['vacancies', 'applications']) {
  const p = path.join(BUSINESSES_DIR, 'realtor', sub);
  try {
    fs.watch(p, { persistent: false }, (_ev, file) => {
      sseBroadcast('realestate', { kind: sub, file, time: new Date().toISOString() });
    });
  } catch {}
}
try {
  fs.watch(path.join(BUSINESSES_DIR, 'realtor', 'rent-roll.json'), { persistent: false }, () => {
    sseBroadcast('realestate', { kind: 'rent-roll', time: new Date().toISOString() });
  });
} catch {}

app.listen(PORT, () => {
  console.log(`[command] Brewington Command Station running on http://localhost:${PORT}`);
  console.log(`[command] SSE stream at /api/stream, watching ${names.length} agents`);
});
