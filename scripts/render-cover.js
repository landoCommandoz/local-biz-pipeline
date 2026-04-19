/**
 * Render an Itch-recommended cover image (630×500, rendered at 2x for retina).
 * Uses the bundle's default layout captured at a tighter zoom.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUNDLE_DIR = path.resolve(__dirname, '..', 'businesses', 'vault', 'bundles', 'isometric-city-v1.0.0');
const OUT_COVER = path.join(BUNDLE_DIR, 'screenshots', 'cover-630x500.png');
const OUT_COVER_PUBLIC = path.resolve(__dirname, '..', 'businesses', 'public', 'vault-screenshots', 'cover-630x500.png');
const PORT = 4501;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png', '.json': 'application/json; charset=utf-8',
  '.css':  'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = (req.url || '/').split('?')[0];
        const filePath = path.join(BUNDLE_DIR, urlPath === '/' ? 'index.html' : urlPath);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) { res.writeHead(500); res.end(String(err.message)); }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  // Itch cover recommended 630x500. Render at 2x for retina, downscaled by Itch.
  await page.setViewport({ width: 630, height: 500, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${PORT}/?layout=dense`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => {
    const el = document.getElementById('loading');
    return el && el.classList.contains('hidden');
  }, { timeout: 20000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2000));
  // Hide the HUD so the cover is clean
  await page.evaluate(() => {
    const hud = document.getElementById('hud');
    const ctl = document.getElementById('controls');
    if (hud) hud.style.display = 'none';
    if (ctl) ctl.style.display = 'none';
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: OUT_COVER, type: 'png' });
  fs.copyFileSync(OUT_COVER, OUT_COVER_PUBLIC);
  console.log('cover written:', OUT_COVER);
  console.log('cover public:', OUT_COVER_PUBLIC);
  await browser.close();
  server.close();
}

main().catch((err) => { console.error('FAIL:', err.message); process.exit(1); });
