require('dotenv').config({ path: __dirname + '/.env' });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const { readCSV, writeCSV } = require('./csv-utils');

const SITES_DIR = path.join(__dirname, 'sites');

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function cleanTruncatedText(text) {
  // If text ends with normal sentence punctuation, it's fine
  if (/[.!?]$/.test(text.trim())) return text.trim();
  // Try to cut back to the last full sentence
  const sentenceEnd = text.search(/[.!?][^.!?]*$/);
  if (sentenceEnd !== -1 && sentenceEnd > text.length * 0.4) {
    return text.slice(0, sentenceEnd + 1);
  }
  // No full sentence boundary found (or it would lose too much text) — trim to last word and add ellipsis
  const trimmed = text.replace(/\s+\S*$/, '');
  return trimmed + '...';
}

function splitBusinessName(name) {
  // Split on common separators: &, and, |, -
  const separators = [' & ', ' and ', ' | ', ' - '];
  for (const sep of separators) {
    const idx = name.indexOf(sep);
    if (idx > 0) {
      return {
        headline: name.slice(0, idx).trim(),
        subheadline: sep.trim() + ' ' + name.slice(idx + sep.length).trim()
      };
    }
  }
  // If the name is very long (>25 chars), try splitting at the midpoint space
  if (name.length > 25) {
    const mid = Math.floor(name.length / 2);
    const spaceAfter = name.indexOf(' ', mid);
    const spaceBefore = name.lastIndexOf(' ', mid);
    const splitAt = spaceAfter !== -1 ? spaceAfter : spaceBefore;
    if (splitAt > 0) {
      return {
        headline: name.slice(0, splitAt).trim(),
        subheadline: name.slice(splitAt).trim()
      };
    }
  }
  return { headline: name, subheadline: null };
}

function parseCity(address) {
  const parts = (address || '').split(',').map(s => s.trim());
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 3];
    if (candidate && !/^\d/.test(candidate)) return candidate;
  }
  return 'the local area';
}

// ---------------------------------------------------------------------------
// NICHE ROUTING
// ---------------------------------------------------------------------------

const NICHES = {
  mechanic: {
    keywords: ['mechanic', 'auto', 'repair'],
    color: { accent: '#D94A4A', light: '#EF6A6A', glow: 'rgba(217,74,74,0.15)', border: 'rgba(217,74,74,0.3)' },
    emoji: '\uD83D\uDD29',
    heroHeadline: (name) => name.toUpperCase(),
    ctaText: 'CALL NOW',
    aboutVoice: (name, category, city, phone) =>
      `We're ${name}. We come to you. Doesn't matter if it's your driveway, a parking lot, or the side of the road. ${city} is our shop. ${phone ? `Call ${phone} and we'll be there.` : 'Reach out and we will be there.'}`,
    serviceStyle: 'No-nonsense. Direct. "Engine won\'t start at 2am. We come to you." Short, punchy, zero fluff.',
    suggestedServices: ['Engine Diagnostics', 'Brake Repair', 'Oil Changes', 'Battery and Electrical', 'Transmission Work', 'Pre-Purchase Inspections']
  },
  handyman: {
    keywords: ['handyman', 'contractor', 'general contractor', 'remodel'],
    color: { accent: '#5B7BAF', light: '#7D9BCF', glow: 'rgba(91,123,175,0.15)', border: 'rgba(91,123,175,0.3)' },
    emoji: '\uD83D\uDD28',
    heroHeadline: (name) => name.toUpperCase(),
    ctaText: 'CALL NOW',
    aboutVoice: (name, category, city, phone) =>
      `We're ${name}, and we handle repairs, remodels, and everything in between across ${city}. We answer our phone, we show up when we say we will, and we clean up after ourselves. ${phone ? `Give us a call at ${phone} and let's figure out what you need.` : 'Fill out the form below and we will get back to you.'}`,
    serviceStyle: 'Confident tradesperson. "That bathroom you keep putting off. Let\'s get it done." Real language, not brochure copy.',
    suggestedServices: ['Home Repairs', 'Bathroom Remodels', 'Deck and Fence', 'Painting', 'Doors and Windows', 'Odd Jobs']
  },
  cleaning: {
    keywords: ['pressure', 'washing', 'window', 'clean', 'power wash'],
    color: { accent: '#4ABFBF', light: '#6DD9D9', glow: 'rgba(74,191,191,0.15)', border: 'rgba(74,191,191,0.3)' },
    emoji: '\u2728',
    heroHeadline: (name) => name.toUpperCase(),
    ctaText: 'GET A FREE QUOTE',
    aboutVoice: (name, category, city, phone) =>
      `${name} keeps properties looking their best across ${city} and the surrounding area. Driveways, siding, windows, gutters. If it's dirty, we make it look new. ${phone ? `Call ${phone} for a free estimate.` : 'Send us a message for a free estimate.'}`,
    serviceStyle: 'Before/after energy. "Your driveway hasn\'t looked this good since the day it was poured." Visual, satisfying, results-focused.',
    suggestedServices: ['Pressure Washing', 'Window Cleaning', 'Gutter Cleaning', 'Roof Washing', 'Deck Restoration', 'Commercial Exterior']
  },
  fencing: {
    keywords: ['fence', 'fencing'],
    color: { accent: '#8B7355', light: '#A8906E', glow: 'rgba(139,115,85,0.15)', border: 'rgba(139,115,85,0.3)' },
    emoji: '\uD83C\uDFE1',
    heroHeadline: (name) => name.toUpperCase(),
    ctaText: 'GET A FREE QUOTE',
    aboutVoice: (name, category, city, phone) =>
      `${name} builds fences across ${city}. Wood, vinyl, chain link, iron. We measure it, we build it, we make sure it's straight. ${phone ? `Call ${phone} to get started.` : 'Send us a message to get started.'}`,
    serviceStyle: 'Straightforward craftsman. "Cedar privacy fence. 6 foot. Installed in a day." Practical, no poetry.',
    suggestedServices: ['Wood Privacy Fencing', 'Chain Link', 'Vinyl Fencing', 'Iron and Metal', 'Gate Installation', 'Fence Repair']
  },
  junk: {
    keywords: ['junk', 'haul', 'removal', 'dump', 'trash'],
    color: { accent: '#D9A54A', light: '#EFC06A', glow: 'rgba(217,165,74,0.15)', border: 'rgba(217,165,74,0.3)' },
    emoji: '\uD83D\uDE9A',
    heroHeadline: (name) => name.toUpperCase(),
    ctaText: 'CALL NOW',
    aboutVoice: (name, category, city, phone) =>
      `${name} hauls away whatever you don't want. Furniture, appliances, yard waste, construction debris. We serve ${city} and everywhere nearby. ${phone ? `Call ${phone} and point at what goes.` : 'Tell us what needs to go.'}`,
    serviceStyle: 'Casual, action-oriented. "Point at it. We load it. It\'s gone." Fast, easy, no hassle.',
    suggestedServices: ['Furniture Removal', 'Appliance Hauling', 'Yard Waste Cleanup', 'Construction Debris', 'Garage Cleanouts', 'Estate Cleanouts']
  }
};

const DEFAULT_NICHE = {
  keywords: [],
  color: { accent: '#c9a84c', light: '#e8c96a', glow: 'rgba(201,168,76,0.15)', border: 'rgba(201,168,76,0.3)' },
  emoji: '\u2B50',
  heroHeadline: (name) => name.toUpperCase(),
  ctaText: 'CALL NOW',
  aboutVoice: (name, category, city, phone) =>
    `${name} provides ${category} services across ${city} and the surrounding area. We're local, we're reliable, and we pick up the phone. ${phone ? `Call ${phone} to get started.` : 'Reach out through the form below.'}`,
  serviceStyle: 'Friendly tradesperson. Direct, warm, no corporate language. Short sentences that sound like a real person.',
  suggestedServices: []
};

function detectNiche(category) {
  const lower = (category || '').toLowerCase();
  for (const [key, niche] of Object.entries(NICHES)) {
    for (const kw of niche.keywords) {
      if (lower.includes(kw)) return { key, ...niche };
    }
  }
  return { key: 'default', ...DEFAULT_NICHE };
}

// ---------------------------------------------------------------------------
// PHOTO DOWNLOADER
// ---------------------------------------------------------------------------

async function downloadPhoto(url, destDir, slug, index) {
  try {
    // Validate URL returns 200 before downloading full body
    const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!head.ok) throw new Error(`HEAD check failed: HTTP ${head.status}`);

    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg';
    const filename = `${slug}-photo-${index + 1}.${ext}`;
    const filePath = path.join(destDir, filename);
    fs.writeFileSync(filePath, buffer);
    return filename;
  } catch (err) {
    console.warn(`    PHOTO SKIP: failed to download photo ${index + 1}: ${err.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// PROMPT BUILDER
// ---------------------------------------------------------------------------

function buildPrompt(row, niche, localPhotoPaths, city) {
  let reviews = [];
  try { if (row.reviews_json) reviews = JSON.parse(row.reviews_json); } catch (_) { /* ignore */ }

  let hours = [];
  try { if (row.hours_json) hours = JSON.parse(row.hours_json); } catch (_) { /* ignore */ }

  const rating = row.rating ? parseFloat(row.rating) : 0;
  const reviewCount = row.review_count ? parseInt(row.review_count, 10) : 0;

  const photosStr = localPhotoPaths.length > 0
    ? localPhotoPaths.join(', ')
    : 'No photos provided. Do not use any img tags or placeholder images.';

  const reviewsStr = reviews.length > 0
    ? reviews.map(r => {
        let text = cleanTruncatedText((r.text || '').replace(/"/g, "'"));
        return `- ${r.author || 'Customer'} (${r.rating || 5} stars): "${text}"`;
      }).join('\n')
    : 'No reviews provided. Do not fabricate any testimonials.';

  const hoursStr = hours.length > 0
    ? hours.join(', ')
    : 'No hours provided. Use "Contact us for current hours."';

  return `You are the world's best web designer for local service businesses.
Build a single-page HTML website that looks like it cost $50,000.
Dark. Cinematic. Premium. Every pixel intentional.

BUSINESS DATA:
Name: ${row.business_name}
Niche: ${niche.key}
City: ${city}
Phone: ${row.phone || 'None'}
Address: ${row.address}
Rating: ${rating > 0 ? `${rating} stars (${reviewCount} Google reviews)` : 'No rating'}
Hours: ${hoursStr}
Reviews:
${reviewsStr}
Photos: ${photosStr}

DESIGN SYSTEM:
==============

CSS VARIABLES (declare in :root, never hardcode hex elsewhere):
--bg: #0a0a0a
--bg2: #111114
--bg3: #16161a
--card: rgba(255,255,255,0.03)
--accent: [ONE color by niche:
  hvac=#00aaff, plumber=#00d4d4, electrician=#f5c518,
  roofing=#e85d04, landscaper=#2d6a4f, mechanic=#e63946,
  handyman=#4a90d9, cleaning=#00b894, pest control=#a8e063,
  salon=#c9a96e, fencing=#b87333, junk removal=#ffb703,
  default=#00aaff]
--accent-muted: [--accent at 20% opacity]
--accent-glow: [--accent at 40% opacity]
--text: #f0f0f0
--muted: #888896
--border: rgba(255,255,255,0.07)
--shadow: 0 24px 64px rgba(0,0,0,0.6)
--radius: 12px

FONTS (load via Google Fonts link in head):
Headlines: Bebas Neue
Body: DM Sans weights 300 400 500
Never use system fonts. Never use Inter or Roboto.

LOADING ANIMATION:
Full screen loader (#0a0a0a background, accent-colored spinner)
that fades out after 800ms revealing the site underneath.
Feels intentional, not slow.

FAVICON:
Generate inline SVG favicon using first letter of business name
in --accent color on dark background. Inject via JS into head.

SCROLL PROGRESS BAR:
Fixed to very top of viewport. 3px tall. --accent color.
Width updates on scroll via JS. z-index 9999.

STICKY HEADER:
Fixed top after scrolling 100px. Starts transparent, becomes
rgba(10,10,10,0.95) with backdrop-filter blur(20px) on scroll.
Contains: business name left (small, --accent), phone number
right as clickable button. Smooth transition in/out.

URGENCY BANNER:
Thin bar above sticky header (when header is not yet sticky,
sits at very top). Text: "Preview site, expires in 7 days.
Reply to keep it live." Background: --accent at 15% opacity.
Border bottom: 1px solid --accent-muted. Small text, centered.

HERO SECTION (100dvh):
Full bleed first photo as background.
Overlay: linear-gradient(135deg, rgba(0,0,0,0.85) 0%,
rgba(0,0,0,0.4) 100%)
Radial glow behind headline: radial-gradient(ellipse at center,
var(--accent-glow) 0%, transparent 70%) positioned behind text.

Business name: split first word on its own line in --text,
rest on next line in --accent. Font size clamp(56px,10vw,120px).
Bebas Neue. Letter spacing 0.04em.
Each letter animates in individually on load (staggered 30ms).

Subheading: ONE punchy line written for THIS niche and city.
Not "professional services." Sound like a human who knows
this trade cold. clamp(16px,2.5vw,22px). DM Sans 300. --muted.
Fades up 400ms after headline.

Two CTAs side by side:
Primary: filled --accent, "CALL NOW", links to tel:${row.phone || '#contact'}
Secondary: outlined --border, "SEE OUR WORK", smooth scrolls
to gallery section. Both minimum 44px height.
CTAs fade up 600ms after headline.

Diagonal cut at bottom of hero into next section (CSS clip-path).

SERVICES SECTION:
Background: --bg2.
Section label above title: small caps "WHAT WE DO" in --accent.
Title: "Built for ${city}" or similar. Bebas Neue. Massive.

Generate EXACTLY 6 services for THIS specific niche.
${niche.key.toUpperCase()} only gets ${niche.key} services. Never cross-contaminate niches. Research real services.

Each service card:
- Large emoji icon (relevant to service, 2.5rem)
- Service name: Bebas Neue, --text, 1.4rem
- Description: 2 sentences, owner voice, specific to niche
- Left border: 3px solid --accent
- Background: --card, backdrop-filter blur(8px)
- Border: 1px solid --border
- Border radius: --radius
- Hover: translateY(-4px), box-shadow var(--shadow),
  left border brightens to full --accent
- Grid: 3 columns desktop, 2 tablet, 1 mobile

${localPhotoPaths.length > 0 ? `PHOTO GALLERY:
Background: --bg.
Title: "Our Work" Bebas Neue clamp(48px,8vw,96px).
Diagonal cut top from services section.

CSS Grid masonry-style: first photo spans 2 columns and 2 rows,
remaining photos fill grid. Creates visual hierarchy.
Each photo: object-fit cover, border-radius --radius,
cursor pointer for lightbox.
Hover: scale(1.03), brightness(1.1), smooth 300ms transition.
Caption overlay on hover: slides up from bottom with job
description generated by you based on niche.
Use EXACTLY these photo filenames: ${localPhotoPaths.join(', ')}

LIGHTBOX:
Click any photo opens full screen lightbox.
Dark overlay, photo centered, close button top right.
Left/right arrows to navigate between photos.
ESC key closes. Click outside closes.
Smooth fade in/out animation.` : 'NO PHOTO GALLERY. Skip this section entirely. Do not use any img tags.'}

${reviews.length > 0 ? `PULL QUOTE SECTION:
Full bleed section between gallery and reviews.
Take the single best line from the review data provided.
Display it massive: clamp(32px,5vw,64px) Bebas Neue --text.
Opening quote mark in --accent at 200px, decorative.
Reviewer name below in --muted small caps.
Background: --bg3 with subtle noise texture overlay.

REVIEWS SECTION:
Background: --bg2.
Rating badge: ${rating} in clamp(80px,12vw,120px) Bebas Neue
--accent. Stars below in --accent. ${reviewCount} review count in --muted.
Animate rating number counting up from 0 when scrolled into view.

Up to 3 review cards in a row (stack on mobile):
Glass morphism: background rgba(255,255,255,0.04),
border 1px solid rgba(255,255,255,0.08),
backdrop-filter blur(12px), border-radius --radius.
Stars in --accent. Review text italic --muted.
Reviewer name bold --text.
Use the exact review data provided above. Do not fabricate reviews.` : 'NO REVIEWS SECTION. Skip entirely. Do not fabricate any testimonials or pull quotes.'}

ABOUT SECTION:
Background: --bg.
Diagonal cut top.
Split layout desktop: photo 45% left, text 55% right.
Stack on mobile.

${localPhotoPaths.length > 1 ? `Photo: use "${localPhotoPaths[1]}", rounded, subtle --accent glow box-shadow.` : localPhotoPaths.length > 0 ? `Photo: use "${localPhotoPaths[0]}", rounded, subtle --accent glow box-shadow.` : 'No photo available for about section. Use a decorative accent block instead.'}
Headline above photo column: NOT "About Us."
Write something punchy and specific:
"${city}'s Most Trusted ${niche.key.charAt(0).toUpperCase() + niche.key.slice(1)} Crew" or similar.
Bebas Neue, clamp(40px,6vw,80px).

Body text: 3-4 sentences. Owner voice. Mention ${city}, ${niche.key},
one specific reliability claim. No corporate language.
No "we are committed to excellence." Sound real.

Trust signals below body text:
- Years serving ${city} (estimate based on review count)
- ${reviewCount} Google reviews as social proof
- "Licensed and insured" badge
- "Serving ${city} and surrounding areas"

GOOGLE MAPS EMBED:
Embed actual Google Maps iframe centered on business address: "${row.address}".
Border radius --radius. Border 1px solid --border.
Height 300px. Width 100%. Lazy loaded.

CONTACT SECTION:
Background: --bg2.
Two columns desktop, stack mobile.

Left column:
Phone number massive (clamp(32px,5vw,56px)) in --accent,
clickable tel link. "Call or text anytime" below in --muted.
Address with map pin emoji.
Hours as clean list, today's hours highlighted in --accent
(use JS Date to detect current day).

Right column:
Contact form with Netlify Forms:
data-netlify="true" name="contact" action="/thank-you"
Fields: Name, Email, Message (textarea).
Submit button: full width, --accent background, Bebas Neue,
"SEND MESSAGE" tracking 0.1em.
All inputs: dark background --bg, border --border,
focus border --accent, border-radius --radius.

SEO AND META:
In <head> include:
- <title>${row.business_name} | ${niche.key} in ${city}</title>
- <meta name="description" content="[write compelling
  2-sentence description specific to ${niche.key} and ${city}]">
- Open Graph tags: og:title, og:description, og:image
  (use first photo URL), og:type=website
- Local business schema markup as JSON-LD script:
  @type LocalBusiness, name, telephone, address,
  geo coordinates (estimate from city), openingHours,
  aggregateRating with ratingValue ${rating} and reviewCount ${reviewCount}

FOOTER:
Background: #050505.
Business name centered in --accent. Bebas Neue.
Phone: ${row.phone || 'None'}. Address: ${row.address}. Copyright with auto year via JS.
Thin --accent line at very top of footer.

ANIMATIONS (all use Intersection Observer):
- Each section fades up as it enters viewport
- Stagger child elements 100ms apart
- All transitions: cubic-bezier(0.4,0,0.2,1) 300ms
- Rating number counts up when reviews section enters viewport
- No animation runs until element is in view
- Reduced motion: respect prefers-reduced-motion media query

FLOATING LEAD WIDGET:
Fixed bottom right corner. Small pill button:
"Built by Aurigen" with small logo mark (styled A in --accent).
On click: opens mailto:Landonbrewington12@gmail.com with
subject "I want a site like ${row.business_name}" prefilled.
Subtle pulse animation to draw attention.
Can be dismissed with X button (stores in sessionStorage).

MOBILE STANDARDS:
- Viewport meta: width=device-width, initial-scale=1.0
- All font sizes use clamp()
- No fixed pixel widths on any container
- Touch targets minimum 44px
- No horizontal scroll under any circumstance
- Test mentally at 375px, 430px, 768px, 1440px

CODE STANDARDS:
- Single HTML file only
- All CSS in one <style> block
- All JS in one <script> block at bottom of body
- Image paths use EXACTLY the filenames in the photos data
- Em dashes forbidden (U+2014 and &mdash;)
- No filler: "committed to excellence" "team of professionals"
  "contact us today" "we strive to" are all banned
- Every line of copy sounds like a real human wrote it for
  this specific business

QUALITY GATE:
Before outputting HTML ask yourself these 4 questions:
1. Would a business owner pay $10,000 for this?
2. Would a designer screenshot this as portfolio work?
3. Does every section feel intentional and premium?
4. Does the copy sound like it was written for THIS business
   specifically or could it be any business?

If any answer is no, rewrite that section until it is yes.

Output ONLY raw HTML starting with <!DOCTYPE html>
No explanation. No preamble. No markdown fences.`;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set. Add it to pipeline/local-biz/.env');
    process.exit(1);
  }

  const client = new Anthropic();
  const rows = readCSV('leads.csv');

  if (rows.length === 0) {
    console.log('No leads found. Run scraper.js first.');
    return;
  }

  if (!fs.existsSync(SITES_DIR)) {
    fs.mkdirSync(SITES_DIR, { recursive: true });
  }

  const columns = Object.keys(rows[0]);
  if (!columns.includes('local_file')) columns.push('local_file');

  let generated = 0;

  for (const row of rows) {
    if (row.local_file) {
      console.log(`SKIP: ${row.business_name} (already generated)`);
      continue;
    }

    const slug = slugify(row.business_name);
    const city = parseCity(row.address);
    const niche = detectNiche(row.category);

    console.log(`Generating: ${row.business_name} [niche: ${niche.key}]...`);

    // Download photos locally
    let photoUrls = [];
    try { if (row.photos) photoUrls = JSON.parse(row.photos); } catch (_) { /* ignore */ }

    const localPhotoPaths = [];
    if (photoUrls.length > 0) {
      console.log(`  Downloading ${photoUrls.length} photos...`);
      for (let i = 0; i < photoUrls.length; i++) {
        const localFile = await downloadPhoto(photoUrls[i], SITES_DIR, slug, i);
        if (localFile) {
          localPhotoPaths.push(localFile);
          console.log(`    SAVED: ${localFile}`);
        }
      }
    }

    // Build prompt and generate
    try {
      const prompt = buildPrompt(row, niche, localPhotoPaths, city);

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      let html = message.content[0].text;

      // Strip markdown fences if present
      html = html.replace(/^```html?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

      // Strip em dashes — don't rely on Claude following the prompt rule
      html = html.replace(/\u2014/g, '-').replace(/&mdash;/g, '-');

      const filename = `${slug}.html`;
      const filePath = path.join(SITES_DIR, filename);

      fs.writeFileSync(filePath, html, 'utf-8');

      // Validate HTML structure — must be a complete document
      const trimmed = html.trim();
      const isComplete = trimmed.startsWith('<!') || trimmed.startsWith('<html');
      const hasClosingTag = trimmed.endsWith('</html>');
      const hasHead = /<head[\s>]/i.test(trimmed);
      const hasBody = /<body[\s>]/i.test(trimmed);

      if (!isComplete || !hasClosingTag || !hasHead || !hasBody) {
        const reasons = [];
        if (!isComplete) reasons.push('missing doctype/html open');
        if (!hasClosingTag) reasons.push('missing </html> (likely truncated)');
        if (!hasHead) reasons.push('missing <head>');
        if (!hasBody) reasons.push('missing <body>');
        console.warn(`  INVALID HTML: ${row.business_name} — ${reasons.join(', ')} — skipping`);
        fs.unlinkSync(filePath);
        continue;
      }

      row.local_file = `sites/${filename}`;
      generated++;

      console.log(`  SAVED: ${filePath}`);
    } catch (err) {
      console.warn(`  ERROR: ${row.business_name} - ${err.message} - skipping`);
    }
  }

  writeCSV('leads.csv', rows, columns);
  console.log(`\nGenerated ${generated} sites. leads.csv updated.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { slugify, detectNiche, downloadPhoto, buildPrompt, parseCity, SITES_DIR };
