/* PIXEL tick.
 *   Free-tier short-form video pipeline: Etsy RSS -> FFmpeg slideshow -> TikTok publish.
 *   Status machine:
 *     installing         -> no-op until TIKTOK_ACCESS_TOKEN is present; prints what's missing.
 *     awaiting_approval  -> TikTok dev app filed, posts held as PRIVATE until Lando flips tiktok_app_approved.
 *     active             -> 2 posts/day max; OAuth refresh automated 7d before 60d expiry.
 *     paused             -> Lando froze the bay.
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/pixel-pitch-free.md
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'pixel';
const DAILY_POST_CAP = 2;
const OAUTH_REFRESH_WINDOW_DAYS = 7;
const OAUTH_TOTAL_LIFESPAN_DAYS = 60;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(iso) {
  if (!iso) return null;
  return (new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
}

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    const s = state.read();

    if (s.bay_status === 'paused') {
      log.info('paused, skipping');
      await state.recordTick({ summary: 'paused', failed: false });
      return { skipped: true, reason: 'paused' };
    }

    if (!process.env.TIKTOK_ACCESS_TOKEN) {
      log.warn('TIKTOK_ACCESS_TOKEN missing — bay stays installing. See TIKTOK-DEV-APP-CHECKLIST.md');
      await state.recordTick({
        summary: 'waiting on TIKTOK_ACCESS_TOKEN',
        failed: false
      });
      return { skipped: true, reason: 'missing_env', env: 'TIKTOK_ACCESS_TOKEN' };
    }

    if (!s.etsy_shop_slug) {
      log.warn('etsy_shop_slug unset — cannot fetch RSS. Lando must populate state.json.etsy_shop_slug.');
      await state.recordTick({
        summary: 'waiting on etsy_shop_slug',
        failed: false
      });
      return { skipped: true, reason: 'missing_state', field: 'etsy_shop_slug' };
    }

    // Flip installing -> awaiting_approval once the token is loaded
    if (s.bay_status === 'installing') {
      await state.update((cur) => {
        cur.bay_status = 'awaiting_approval';
        return cur;
      });
      log.info('flipped bay_status installing -> awaiting_approval');
    }

    // Flip awaiting_approval -> active once Lando confirms approval
    const sNow = state.read();
    if (sNow.bay_status === 'awaiting_approval' && sNow.tiktok_app_approved === true) {
      await state.update((cur) => {
        cur.bay_status = 'active';
        return cur;
      });
      log.info('flipped bay_status awaiting_approval -> active (Lando confirmed TikTok approval)');
    }

    // OAuth refresh guard
    const daysLeft = daysUntil(state.read().oauth_refresh_expires_at);
    if (daysLeft !== null && daysLeft <= OAUTH_REFRESH_WINDOW_DAYS && daysLeft > 0) {
      log.warn('OAuth token approaching expiry', { days_left: Math.round(daysLeft) });
      // TODO: attempt refresh via POST https://open.tiktokapis.com/v2/oauth/token/
      //   with grant_type=refresh_token. If that fails, escalate to Lando for re-consent.
    }
    if (daysLeft !== null && daysLeft <= 0) {
      log.error('OAuth token expired — escalating for re-consent');
      // TODO: escalate via twilio-whatsapp.js
      await state.recordTick({ summary: 'OAuth expired', failed: true });
      return { skipped: true, reason: 'oauth_expired' };
    }

    // Reset daily counter
    const today = todayKey();
    if (state.read().post_day_key !== today) {
      await state.update((cur) => {
        cur.post_day_key = today;
        cur.posts_today = 0;
        return cur;
      });
    }

    const sCheck = state.read();
    const postsRemainingToday = Math.max(0, DAILY_POST_CAP - (sCheck.posts_today || 0));

    log.info('post budget computed', {
      status: sCheck.bay_status,
      posts_today: sCheck.posts_today,
      posts_remaining_today: postsRemainingToday,
      visibility: sCheck.tiktok_app_approved ? 'public' : 'private'
    });

    // TODO: RSS layer — rss-parser fetch https://www.etsy.com/shop/<slug>/rss.
    //   Pitch ref: businesses/foreman/candidates/cockpit-round/pixel-pitch-free.md § "Fetch layer"
    //   Dedupe by listing_url against last 30 published posts.
    // TODO: FFmpeg compose layer — run ./compose/template.sh with picked listing.
    //   Pitch ref: § "Composition layer"
    //   Output to ./compose/out/<listing-slug>.mp4.
    // TODO: TikTok publish layer — POST to Content Posting API.
    //   Pitch ref: § "Publish layer"
    //   visibility = tiktok_app_approved ? 'PUBLIC' : 'PRIVATE'. HARD GUARD.
    //   Increment posts_today / posts_month. Log posted URL.

    await state.recordTick({
      summary: `scaffold tick: ${sCheck.bay_status}, budget=${postsRemainingToday}, pipeline TODO`,
      failed: false
    });
    return { scaffolded: true, posts_remaining_today: postsRemainingToday };
  } catch (err) {
    log.error('tick failed', { error: err.message });
    try {
      await state.recordTick({ summary: `FAILED: ${err.message}`, failed: true });
    } catch {}
    throw err;
  }
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { run };
