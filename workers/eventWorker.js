const { Op } = require('sequelize');
const { Event } = require('../models');

let workerIntervalId = null;

/**
 * Execute periodic event lifecycle maintenance
 */
const runEventLifecycleTick = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Mark completed events
    const [completedCount] = await Event.update(
      { status: 'completed' },
      {
        where: {
          status: { [Op.in]: ['published', 'registration_open', 'ongoing'] },
          end_date: { [Op.ne]: null, [Op.lt]: today }
        }
      }
    );

    // 2. Mark ongoing events
    const [ongoingCount] = await Event.update(
      { status: 'ongoing' },
      {
        where: {
          status: { [Op.in]: ['published', 'registration_open'] },
          start_date: { [Op.lte]: today },
          [Op.or]: [
            { end_date: null },
            { end_date: { [Op.gte]: today } }
          ]
        }
      }
    );

    // 3. Mark registration closed if past registration_end_date
    const [regClosedCount] = await Event.update(
      { status: 'registration_closed' },
      {
        where: {
          status: 'registration_open',
          registration_end_date: { [Op.ne]: null, [Op.lt]: today }
        }
      }
    );

    if (completedCount > 0 || ongoingCount > 0 || regClosedCount > 0) {
      console.log(`[EventWorker] Lifecycle Tick: ${completedCount} completed, ${ongoingCount} ongoing, ${regClosedCount} registration closed.`);
    }
  } catch (error) {
    console.error('[EventWorker] Error during event lifecycle tick:', error.message);
  }
};

/**
 * Start the background Event Worker
 */
const startEventWorker = () => {
  if (workerIntervalId) return;

  console.log('[EventWorker] 🚀 Background Spiritual Event Scheduler started (Tick: 10m)');
  // Initial tick
  setTimeout(runEventLifecycleTick, 15000);

  // Every 10 minutes
  workerIntervalId = setInterval(runEventLifecycleTick, 10 * 60 * 1000);
};

const stopEventWorker = () => {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.log('[EventWorker] Worker stopped.');
  }
};

module.exports = {
  startEventWorker,
  stopEventWorker,
  runEventLifecycleTick
};
