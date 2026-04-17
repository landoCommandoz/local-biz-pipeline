const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function screenshotSite(url, slug) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const mobilePath = path.join(SCREENSHOTS_DIR, `${slug}-mobile.png`);
  const desktopPath = path.join(SCREENSHOTS_DIR, `${slug}-desktop.png`);

  try {
    const page = await browser.newPage();

    // Mobile: 390px wide
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`  SCREENSHOT: ${slug}-mobile.png`);

    // Desktop: 1440px wide
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`  SCREENSHOT: ${slug}-desktop.png`);
  } finally {
    await browser.close();
  }

  return { mobile: mobilePath, desktop: desktopPath };
}

if (require.main === module) {
  const url = process.argv[2];
  const slug = process.argv[3];
  if (!url || !slug) {
    console.error('Usage: node screenshotter.js <url> <slug>');
    process.exit(1);
  }
  screenshotSite(url, slug)
    .then(paths => console.log(`Done.`, paths))
    .catch(err => { console.error('Fatal:', err.message); process.exit(1); });
}

module.exports = { screenshotSite };
