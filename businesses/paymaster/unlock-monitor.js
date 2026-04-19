/* Doss's unlock-threshold monitor (Phase 3).
 *   Called from paymaster tick.js on every heartbeat.
 *   For each of ECHO / ATLAS / PIXEL, compares state.attributed_revenue_mtd
 *   to state.paid_unlock_threshold. When crossed AND not already alerted this
 *   calendar month, emits a one-shot escalation via twilio-whatsapp.
 *
 *   This NEVER auto-installs the paid upgrade. Alert only. Lando confirms,
 *   then Hank runs the install manually from the parked pitch file.
 */
const fs = require('fs');
const path = require('path');

const BUSINESSES_DIR = path.resolve(__dirname, '..');

const WATCHED = [
  {
    bay: 'echo',
    upgrade_name: 'Instantly paid',
    parked_pitch: 'businesses/foreman/parked/echo-instantly-paid.md'
  },
  {
    bay: 'atlas',
    upgrade_name: 'DataForSEO paid',
    parked_pitch: 'businesses/foreman/parked/atlas-dataforseo-paid.md'
  },
  {
    bay: 'pixel',
    upgrade_name: 'upload-post.com paid',
    parked_pitch: 'businesses/foreman/parked/pixel-uploadpost-paid.md'
  }
];

function readBayState(bay) {
  const p = path.join(BUSINESSES_DIR, bay, 'state.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

async function checkUnlocks({ log, state: paymasterState, escalate }) {
  const events = [];
  const alertsThisMonthPrev = paymasterState.read().unlock_monitor?.alerts_by_month?.[monthKey()] || {};
  const alertsThisMonth = { ...alertsThisMonthPrev };

  for (const w of WATCHED) {
    const bayState = readBayState(w.bay);
    if (!bayState) {
      log.debug?.('unlock-monitor: bay state missing', { bay: w.bay });
      continue;
    }
    const attributed = Number(bayState.attributed_revenue_mtd || 0);
    const threshold = Number(bayState.paid_unlock_threshold || 0);
    if (!threshold) continue;

    const crossed = attributed >= threshold;
    const alreadyAlertedThisMonth = !!alertsThisMonth[w.bay];

    if (crossed && !alreadyAlertedThisMonth) {
      const payload = {
        business: 'paymaster',
        reason: `${w.upgrade_name} upgrade threshold hit for ${w.bay.toUpperCase()}`,
        detail: `${w.bay.toUpperCase()} attributed MTD: $${attributed} >= threshold $${threshold}.

Parked pitch: ${w.parked_pitch}

ALERT ONLY — no auto-install. Reply Y to unpark, N to hold.`
      };
      try {
        if (typeof escalate === 'function') {
          await escalate(payload);
        }
        log.info('unlock threshold crossed — alert emitted', {
          bay: w.bay,
          attributed_mtd: attributed,
          threshold
        });
        alertsThisMonth[w.bay] = {
          alerted_at: new Date().toISOString(),
          attributed_at_alert: attributed,
          threshold
        };
        events.push({ bay: w.bay, fired: true, attributed, threshold });
      } catch (err) {
        log.warn('unlock alert escalation failed', { bay: w.bay, error: err.message });
      }
    } else if (crossed && alreadyAlertedThisMonth) {
      events.push({ bay: w.bay, fired: false, reason: 'already_alerted_this_month' });
    } else {
      events.push({
        bay: w.bay,
        fired: false,
        reason: 'below_threshold',
        attributed,
        threshold,
        remaining: Math.max(0, threshold - attributed)
      });
    }
  }

  if (events.some((e) => e.fired)) {
    await paymasterState.update((cur) => {
      cur.unlock_monitor = cur.unlock_monitor || { alerts_by_month: {} };
      cur.unlock_monitor.alerts_by_month = cur.unlock_monitor.alerts_by_month || {};
      cur.unlock_monitor.alerts_by_month[monthKey()] = alertsThisMonth;
      cur.unlock_monitor.last_check_at = new Date().toISOString();
      return cur;
    });
  } else {
    await paymasterState.update((cur) => {
      cur.unlock_monitor = cur.unlock_monitor || { alerts_by_month: {} };
      cur.unlock_monitor.last_check_at = new Date().toISOString();
      return cur;
    });
  }

  return { checked: WATCHED.length, events };
}

module.exports = { checkUnlocks, WATCHED };
