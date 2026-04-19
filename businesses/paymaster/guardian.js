/**
 * Doss as Guardian — security and compliance scanner.
 *
 * Runs on Doss's tick:
 *  - Scans source files for exposed API keys (patterns matching known formats)
 *  - Confirms .env is gitignored
 *  - Confirms no .env file is tracked in git
 *  - Rolls up failures_in_row across all bays, flags any with >= 3
 *  - Writes a JSON report to guardian-report.json
 *
 * Never modifies code. Observes only. Escalation is a file-write, not a call.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BUSINESSES_DIR = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(__dirname, 'guardian-report.json');
const GITIGNORE_PATH = path.join(REPO_ROOT, '.gitignore');

// Regex patterns for common API key formats. Only literal keys (32+ chars of
// the right shape). Matches anywhere in source files.
const KEY_PATTERNS = [
  { name: 'replicate', re: /\br8_[A-Za-z0-9]{35,}\b/g },
  { name: 'anthropic', re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { name: 'openai', re: /\bsk-[A-Za-z0-9_-]{40,}\b/g },
  { name: 'butler_itch', re: /\bms[a-zA-Z0-9]{37,}\b/g },
  { name: 'twilio_sid', re: /\bAC[a-f0-9]{32}\b/g },
  { name: 'twilio_token', re: /\b[a-f0-9]{32}\b(?=.*twilio|.*Twilio|.*TWILIO)/g },
  { name: 'slack_bot', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { name: 'github_pat', re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/g },
  { name: 'aws_access', re: /\bAKIA[0-9A-Z]{16}\b/g }
];

const SCAN_EXTS = new Set(['.js', '.mjs', '.ts', '.json', '.md', '.txt', '.sh', '.yml', '.yaml']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.archive', 'yard-dist', 'sites', 'prospectai', 'kenney', 'bundles']);
const SKIP_FILES = new Set(['.env', '.env.local', '.env.example', 'package-lock.json']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full, out); continue; }
    if (SKIP_FILES.has(entry.name)) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SCAN_EXTS.has(ext)) continue;
    out.push(full);
  }
  return out;
}

function scanFileForKeys(file) {
  const findings = [];
  let content;
  try { content = fs.readFileSync(file, 'utf-8'); } catch { return findings; }
  for (const { name, re } of KEY_PATTERNS) {
    const matches = content.match(re);
    if (matches && matches.length) {
      findings.push({
        file: path.relative(REPO_ROOT, file),
        key_type: name,
        match_count: matches.length,
        first_preview: matches[0].slice(0, 8) + '...' + matches[0].slice(-4)
      });
    }
  }
  return findings;
}

function scanForExposedKeys() {
  const files = walk(REPO_ROOT);
  let findings = [];
  for (const f of files) findings = findings.concat(scanFileForKeys(f));
  return findings;
}

function checkGitignoreCoversEnv() {
  if (!fs.existsSync(GITIGNORE_PATH)) return { covers: false, reason: 'no .gitignore at repo root' };
  const content = fs.readFileSync(GITIGNORE_PATH, 'utf-8');
  const covers = /^\.env\s*$/m.test(content) || /^\.env$/m.test(content);
  return { covers, reason: covers ? null : '.env not explicitly ignored' };
}

function checkEnvTracked() {
  try {
    const out = execFileSync('git', ['ls-files', '.env'], { cwd: REPO_ROOT, encoding: 'utf-8' });
    const tracked = out.trim().length > 0;
    return { tracked, detail: tracked ? '.env IS tracked (CRITICAL)' : null };
  } catch {
    return { tracked: null, detail: 'git not available or not a repo' };
  }
}

function scanBayFailures() {
  const dirs = fs.readdirSync(BUSINESSES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !n.startsWith('.') && !['lib', 'public', 'node_modules'].includes(n));
  const hot = [];
  for (const bay of dirs) {
    const p = path.join(BUSINESSES_DIR, bay, 'state.json');
    try {
      const s = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if ((s.failures_in_row || 0) >= 3) {
        hot.push({ bay, failures_in_row: s.failures_in_row, last_tick: s.last_tick_at });
      }
    } catch {}
  }
  return hot;
}

function runOnce() {
  const findings = scanForExposedKeys();
  const gi = checkGitignoreCoversEnv();
  const tracked = checkEnvTracked();
  const bayHotspots = scanBayFailures();
  const threats = findings.length + (gi.covers ? 0 : 1) + (tracked.tracked ? 1 : 0) + bayHotspots.length;
  const clean = threats === 0;

  const report = {
    at: new Date().toISOString(),
    systems_clean: clean,
    threat_count: threats,
    findings_summary: {
      exposed_keys: findings.length,
      gitignore_env_missing: !gi.covers,
      env_file_tracked: !!tracked.tracked,
      bays_in_failure_streak: bayHotspots.length
    },
    exposed_keys: findings,
    gitignore_status: gi,
    env_tracked_status: tracked,
    bay_hotspots: bayHotspots
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');
  return report;
}

module.exports = { runOnce, scanForExposedKeys, checkGitignoreCoversEnv, checkEnvTracked, scanBayFailures, REPORT_PATH };

if (require.main === module) {
  const r = runOnce();
  console.log(JSON.stringify(r, null, 2));
}
