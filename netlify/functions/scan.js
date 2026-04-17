// Netlify Function: scan.js
// Receives a URL, runs a direct HTML crawl + PageSpeed Insights in parallel
// Returns a structured JSON object with all findings

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  let url = params.url || '';

  if (!url) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No URL provided' })
    };
  }

  // Normalize URL: add https if missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // Run crawl and PageSpeed in parallel, with independent error handling
  const [crawlResult, speedResult] = await Promise.all([
    crawlSite(url),
    runPageSpeed(url)
  ]);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      url,
      crawl: crawlResult,
      pagespeed: speedResult,
      timestamp: Date.now()
    })
  };
};

// ---- DIRECT CRAWL ----
async function crawlSite(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BrewingtonScanner/1.0; +https://brewingtondigital.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    clearTimeout(timeout);

    const finalUrl = res.url || url;
    const ssl = finalUrl.startsWith('https://');
    const html = await res.text();

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : null;

    // Meta description
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : null;

    // H1
    const h1Match = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/i);
    const h1Text = h1Match ? h1Match[0].replace(/<[^>]+>/g,'').trim() : null;

    // Mobile viewport
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

    // Phone number patterns
    const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/g;
    const phoneMatches = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').match(phoneRegex);
    const hasPhone = !!(phoneMatches && phoneMatches.length > 0);

    // Click-to-call tel: link
    const hasClickToCall = /href=["']tel:/i.test(html);

    // Schema markup (JSON-LD)
    const hasSchema = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);

    // Contact form
    const hasContactForm = /<form[\s\S]*?<\/form>/i.test(html) &&
      (/<input[^>]+type=["']?(?:text|email|tel)["']?/i.test(html) || /<textarea/i.test(html));

    // Image alt tags
    const imgMatches = html.match(/<img[^>]+>/gi) || [];
    const totalImgs = imgMatches.length;
    const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
    const altPct = totalImgs > 0 ? Math.round((imgsWithAlt / totalImgs) * 100) : null;

    return {
      ok: true,
      ssl,
      title: {
        present: !!titleText,
        text: titleText,
        length: titleText ? titleText.length : 0,
        good: titleText && titleText.length >= 30 && titleText.length <= 60
      },
      metaDesc: {
        present: !!metaDesc,
        text: metaDesc,
        length: metaDesc ? metaDesc.length : 0,
        good: metaDesc && metaDesc.length >= 120 && metaDesc.length <= 160
      },
      h1: { present: !!h1Text, text: h1Text ? h1Text.substring(0, 80) : null },
      viewport: { present: hasViewport },
      phone: { visible: hasPhone, clickToCall: hasClickToCall },
      schema: { present: hasSchema },
      contactForm: { present: hasContactForm },
      images: { total: totalImgs, withAlt: imgsWithAlt, altPct }
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Site took too long to respond (timeout)' };
    }
    return { ok: false, error: err.message || 'Could not reach site' };
  }
}

// ---- PAGESPEED INSIGHTS ----
async function runPageSpeed(url) {
  try {
    const psUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(psUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return { ok: false, error: `PageSpeed API returned ${res.status}` };
    }

    const data = await res.json();
    const cats = data.lighthouseResult && data.lighthouseResult.categories;
    const audits = data.lighthouseResult && data.lighthouseResult.audits;

    if (!cats) {
      return { ok: false, error: 'No Lighthouse data returned' };
    }

    // Scores are 0-1, multiply by 100
    const perf = cats.performance ? Math.round(cats.performance.score * 100) : null;
    const seo = cats.seo ? Math.round(cats.seo.score * 100) : null;
    const a11y = cats.accessibility ? Math.round(cats.accessibility.score * 100) : null;
    const bp = cats['best-practices'] ? Math.round(cats['best-practices'].score * 100) : null;

    // Key metrics from audits
    const fcp = audits && audits['first-contentful-paint']
      ? audits['first-contentful-paint'].displayValue : null;
    const lcp = audits && audits['largest-contentful-paint']
      ? audits['largest-contentful-paint'].displayValue : null;
    const tbt = audits && audits['total-blocking-time']
      ? audits['total-blocking-time'].displayValue : null;
    const cls = audits && audits['cumulative-layout-shift']
      ? audits['cumulative-layout-shift'].displayValue : null;
    const speed = audits && audits['speed-index']
      ? audits['speed-index'].displayValue : null;

    // Mobile-friendly check from audits
    const mobileOk = audits && audits['viewport']
      ? audits['viewport'].score === 1 : null;

    return {
      ok: true,
      scores: { performance: perf, seo, accessibility: a11y, bestPractices: bp },
      metrics: { fcp, lcp, tbt, cls, speed },
      mobile: { friendly: mobileOk }
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'PageSpeed timed out' };
    }
    return { ok: false, error: err.message || 'PageSpeed failed' };
  }
}
