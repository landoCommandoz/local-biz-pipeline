/**
 * Headless-Chrome screenshot harness for the Itch bundle.
 * Starts a local static server, loads each layout variant, captures PNG.
 *
 * Usage: node scripts/screenshot-bundle.js
 * Output: businesses/vault/bundles/isometric-city-v1.0.0/screenshots/*.png
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUNDLE_DIR = path.resolve(__dirname, '..', 'businesses', 'vault', 'bundles', 'isometric-city-v1.0.0');
const OUT_DIR = path.join(BUNDLE_DIR, 'screenshots');
const PORT = 4500;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.json': 'application/json; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = (req.url || '/').split('?')[0];
        const filePath = path.join(BUNDLE_DIR, urlPath === '/' ? 'index.html' : urlPath);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          res.writeHead(404); res.end('not found'); return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500); res.end(String(err.message));
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function screenshotLayout(browser, name) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 2 });
  const url = `http://127.0.0.1:${PORT}/?layout=${name}`;
  console.log('  loading', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Wait for the scene's hidden loader to go away (signals sprites rendered)
  await page.waitForFunction(() => {
    const el = document.getElementById('loading');
    return el && el.classList.contains('hidden');
  }, { timeout: 20000 }).catch(() => console.log('  (loading never hid, screenshotting anyway)'));
  await new Promise((r) => setTimeout(r, 1500));
  const outPath = path.join(OUT_DIR, `scene-${name}.png`);
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('  ->', path.relative(process.cwd(), outPath));
  await page.close();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('starting local server on', PORT);
  const server = await startServer();

  console.log('launching headless chrome');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    for (const name of ['default', 'dense', 'suburb']) {
      console.log('layout:', name);
      await screenshotLayout(browser, name);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('done. files:');
  for (const f of fs.readdirSync(OUT_DIR)) {
    const sz = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(`  ${f}  (${Math.round(sz / 1024)} KB)`);
  }
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});
