const cron = require('node-cron');
const RateAlert = require('../models/RateAlert');
const fixerService = require('../services/fixerService');

/**
 * Periodically scans all active alerts, groups them by base currency (so we
 * only hit Fixer once per base, not once per alert), and flips any alert
 * whose target condition has been met to "triggered".
 *
 * In a production version this is also where you'd push a websocket event
 * or queue an email/push notification job - the trigger detection is kept
 * separate from delivery so it's easy to plug that in later.
 */
async function checkAlerts() {
  const activeAlerts = await RateAlert.find({ status: 'active' });
  if (activeAlerts.length === 0) return;

  const bases = [...new Set(activeAlerts.map((a) => a.from))];
  const rateTables = {};

  await Promise.all(
    bases.map(async (base) => {
      try {
        const { rates } = await fixerService.getLatestRates(base);
        rateTables[base] = rates;
      } catch (err) {
        console.error(`[alertChecker] failed to fetch rates for ${base}:`, err.message);
      }
    })
  );

  const triggeredIds = [];

  for (const alert of activeAlerts) {
    const rate = rateTables[alert.from]?.[alert.to];
    if (rate == null) continue;

    const hit =
      (alert.direction === 'above' && rate >= alert.targetRate) ||
      (alert.direction === 'below' && rate <= alert.targetRate);

    if (hit) {
      alert.status = 'triggered';
      alert.triggeredAt = new Date();
      alert.triggeredRate = rate;
      triggeredIds.push(alert._id);
      await alert.save();
    }
  }

  if (triggeredIds.length > 0) {
    console.log(`[alertChecker] triggered ${triggeredIds.length} alert(s):`, triggeredIds.join(', '));
  }
}

function startAlertCron() {
  const schedule = process.env.ALERT_CRON_SCHEDULE || '*/15 * * * *';
  cron.schedule(schedule, () => {
    checkAlerts().catch((err) => console.error('[alertChecker] run failed:', err));
  });
  console.log(`[alertChecker] scheduled with cron pattern "${schedule}"`);
}

module.exports = { startAlertCron, checkAlerts };
