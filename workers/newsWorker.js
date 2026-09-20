const { fetchAllDueSources } = require('../services/newsFetcher');

let workerIntervalId = null;
let isExecuting = false;

const TICK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes for due sources

/**
 * Execute worker tick with execution lock
 */
const runWorkerTick = async () => {
  if (isExecuting) {
    console.log('[NewsWorker] Previous fetch tick is still active. Skipping concurrent run.');
    return;
  }

  isExecuting = true;
  try {
    const results = await fetchAllDueSources();
    if (results.length > 0) {
      console.log(`[NewsWorker] Completed scheduled fetch cycle. Sources processed: ${results.length}`);
    }
  } catch (error) {
    console.error('[NewsWorker] Scheduled fetch cycle encountered an error:', error);
  } finally {
    isExecuting = false;
  }
};

/**
 * Start the background news ingestion worker
 */
const startNewsWorker = () => {
  if (workerIntervalId) {
    console.log('[NewsWorker] Worker is already running.');
    return;
  }

  console.log('[NewsWorker] 🚀 Background News Ingestion Scheduler initialized (Tick: 5m)');
  // Run initial tick after 10 seconds of startup
  setTimeout(() => {
    runWorkerTick();
  }, 10000);

  workerIntervalId = setInterval(runWorkerTick, TICK_INTERVAL_MS);
};

/**
 * Stop the worker gracefully
 */
const stopNewsWorker = () => {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.log('[NewsWorker] Worker stopped.');
  }
};

module.exports = {
  startNewsWorker,
  stopNewsWorker,
  runWorkerTick
};
