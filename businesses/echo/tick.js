/* ECHO tick.
 *   Free-tier cold-outbound loop: gosom harvest -> weakness score -> sales-plugin draft -> Resend send.
 *   Status machine:
 *     installing    -> no-op until RESEND_API_KEY is present; prints what's missing.
 *     warming       -> day-by-day ramp 10->50/day over 14 days from warmup_start.
 *     normal        -> 100/day hard cap; 3000/mo hard cap.
 *     paused        -> Lando or an escalation froze the bay.
 *   This file is the skeleton. Real harvest/draft/send hooks are TODO blocks pointing at the pitch file.
 *   Pitch reference: businesses/foreman/candidates/cockpit-round/echo-pitch-free.md
 */
const fs = require('fs');
const path = require('path');
const { createLogger } = require('../lib/logger');
const { stateFor } = require('../lib/state');

const NAME = 'echo';
const SEND_DOMAIN = 'brewingtondigital-outbound.com';
const DAILY_CAP = 100;
const MONTHLY_CAP = 3000;
const WARMUP_DAYS = 14;
const WARMUP_START_DAILY = 10;
const WARMUP_END_DAILY = 50;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function warmupDailyTarget(daysIntoWarmup) {
  if (daysIntoWarmup < 0) return 0;
  if (daysIntoWarmup >= WARMUP_DAYS) return WARMUP_END_DAILY;
  const ratio = daysIntoWarmup / (WARMUP_DAYS - 1);
  return Math.round(WARMUP_START_DAILY + ratio * (WARMUP_END_DAILY - WARMUP_START_DAILY));
}

function currentDailyCeiling(state) {
  if (state.bay_status === 'warming' && state.resend_warmup_start) {
    const start = new Date(state.resend_warmup_start).getTime();
    const days = Math.floor((Date.now() - start) / (24 * 60 * 60 * 1000));
    return Math.min(warmupDailyTarget(days), DAILY_CAP);
  }
  return DAILY_CAP;
}

async function run() {
  const log = createLogger(NAME);
  const state = stateFor(NAME);
  log.info('tick start');

  try {
    const s = state.read();

    if (s.bay_status === 'paused') {
      log.info('paused, skipping');
      await state.recordTick({ summary: 'paused', mode: s.bay_status, failed: false });
      return { skipped: true, reason: 'paused' };
    }

    if (!process.env.RESEND_API_KEY) {
      log.warn('RESEND_API_KEY missing — bay stays installing. See RESEND-SIGNUP-CHECKLIST.md');
      await state.recordTick({
        summary: 'waiting on RESEND_API_KEY',
        mode: s.bay_status,
        failed: false
      });
      return { skipped: true, reason: 'missing_env', env: 'RESEND_API_KEY' };
    }

    // Reset daily counter if day rolled over
    const today = todayKey();
    const month = monthKey();
    let patch = {};
    if (s.send_day_key !== today) {
      patch.send_day_key = today;
      patch.emails_sent_today = 0;
    }
    if (s.send_month_key !== month) {
      patch.send_month_key = month;
      patch.emails_sent_month = 0;
    }

    // First-ever healthy tick flips installing -> warming and stamps warmup start
    if (s.bay_status === 'installing') {
      patch.bay_status = 'warming';
      patch.resend_warmup_start = new Date().toISOString();
      log.info('flipped bay_status installing -> warming', { warmup_start: patch.resend_warmup_start });
    }

    if (Object.keys(patch).length) {
      await state.update((cur) => Object.assign(cur, patch));
    }
    const sNow = state.read();

    // Warmup graduation: 14 days since warmup_start and bay is still warming
    if (sNow.bay_status === 'warming' && sNow.resend_warmup_start) {
      const daysIn = Math.floor(
        (Date.now() - new Date(sNow.resend_warmup_start).getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysIn >= WARMUP_DAYS) {
        await state.update((cur) => {
          cur.bay_status = 'normal';
          return cur;
        });
        log.info('warmup complete — bay_status flipped to normal', { days_in: daysIn });
      }
    }

    const ceiling = currentDailyCeiling(state.read());
    const sCheck = state.read();
    const remainingToday = Math.max(0, ceiling - (sCheck.emails_sent_today || 0));
    const remainingMonth = Math.max(0, MONTHLY_CAP - (sCheck.emails_sent_month || 0));
    const sendBudget = Math.min(remainingToday, remainingMonth);

    log.info('send budget computed', {
      ceiling,
      remaining_today: remainingToday,
      remaining_month: remainingMonth,
      budget: sendBudget
    });

    // TODO: harvest layer. Invoke gosom scraper via child_process when harvest/ is empty.
    //   Pitch ref: businesses/foreman/candidates/cockpit-round/echo-pitch-free.md § "Harvest layer"
    // TODO: score layer. Weakness score = no_website*40 + few_reviews*30 + low_rating*15 + no_hours*15.
    // TODO: draft layer. Invoke sales plugin draft-outreach + email-sequence skills per prospect.
    // TODO: send layer. Resend SDK POST. Respect sendBudget. Increment counters atomically.

    await state.recordTick({
      summary: `scaffold tick: budget=${sendBudget}, pipeline TODO`,
      mode: state.read().bay_status,
      failed: false
    });
    return { scaffolded: true, send_budget: sendBudget };
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
