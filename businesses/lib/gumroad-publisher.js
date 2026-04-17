/* Gumroad publisher.
 *   Thin wrapper around the Gumroad v2 products API so Vega (scout) can create
 *   and update her own listings without hand-clicking the dashboard.
 *   Karpathy rule: two functions, no batching, no retry, no rate-limit logic.
 *   When Gumroad complains, that is when we add sophistication.
 *
 *   Requires env var GUMROAD_ACCESS_TOKEN. Missing key is a soft failure: the
 *   function returns { ok: false, reason } and logs a warning, never throws.
 *   This lets the rest of the tick keep running when the key is not wired yet.
 */
const { createLogger } = require('./logger');

const GUMROAD_API_BASE = 'https://api.gumroad.com/v2';

function getToken() {
  return process.env.GUMROAD_ACCESS_TOKEN || '';
}

function priceToCents(price_usd) {
  const n = Number(price_usd);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`invalid price_usd: ${price_usd}`);
  }
  return Math.round(n * 100);
}

async function publishListing({ name, price_usd, description, short_url_slug, file_url }) {
  const log = createLogger('scout');
  const token = getToken();
  if (!token) {
    const reason = 'GUMROAD_ACCESS_TOKEN missing, add to .env';
    log.warn('gumroad publish skipped', { reason });
    return { ok: false, reason };
  }

  if (!name || price_usd === undefined || price_usd === null) {
    const reason = 'publishListing requires name and price_usd';
    log.error('gumroad publish bad args', { reason });
    return { ok: false, reason };
  }

  const body = new URLSearchParams();
  body.set('access_token', token);
  body.set('name', String(name));
  body.set('price', String(priceToCents(price_usd)));
  if (description) body.set('description', String(description));
  if (short_url_slug) body.set('url', String(short_url_slug));
  if (file_url) body.set('file_url', String(file_url));

  try {
    const res = await fetch(`${GUMROAD_API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const reason = json.message || `HTTP ${res.status}`;
      log.error('gumroad publish failed', { reason, name });
      return { ok: false, reason };
    }
    const product = json.product || {};
    log.info('gumroad publish ok', {
      product_id: product.id,
      short_url: product.short_url,
      name
    });
    return {
      ok: true,
      product_id: product.id,
      short_url: product.short_url
    };
  } catch (err) {
    log.error('gumroad publish threw', { error: err.message, name });
    return { ok: false, reason: err.message };
  }
}

async function updateListing(product_id, { description, price_usd } = {}) {
  const log = createLogger('scout');
  const token = getToken();
  if (!token) {
    const reason = 'GUMROAD_ACCESS_TOKEN missing, add to .env';
    log.warn('gumroad update skipped', { reason });
    return { ok: false, reason };
  }

  if (!product_id) {
    const reason = 'updateListing requires product_id';
    log.error('gumroad update bad args', { reason });
    return { ok: false, reason };
  }

  const body = new URLSearchParams();
  body.set('access_token', token);
  if (description !== undefined) body.set('description', String(description));
  if (price_usd !== undefined && price_usd !== null) {
    body.set('price', String(priceToCents(price_usd)));
  }

  try {
    const res = await fetch(
      `${GUMROAD_API_BASE}/products/${encodeURIComponent(product_id)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const reason = json.message || `HTTP ${res.status}`;
      log.error('gumroad update failed', { reason, product_id });
      return { ok: false, reason };
    }
    const product = json.product || {};
    log.info('gumroad update ok', {
      product_id: product.id || product_id,
      short_url: product.short_url
    });
    return {
      ok: true,
      product_id: product.id || product_id,
      short_url: product.short_url
    };
  } catch (err) {
    log.error('gumroad update threw', { error: err.message, product_id });
    return { ok: false, reason: err.message };
  }
}

module.exports = { publishListing, updateListing };
