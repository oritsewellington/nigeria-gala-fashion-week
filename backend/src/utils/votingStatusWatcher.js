const Settings = require('../models/Settings');
const { emitVotingStatusChange } = require('../sockets');

let lastKnownStatus = null;
let intervalHandle = null;

/**
 * Polls the computed voting status every `intervalMs` and emits a
 * socket event only when it actually changes (upcoming -> live -> ended).
 * This is cheap (one query) and keeps every connected client's
 * countdown/button state in sync without them needing to poll.
 */
const startVotingStatusWatcher = (intervalMs = 15000) => {
  intervalHandle = setInterval(async () => {
    try {
      const settings = await Settings.getSettings();
      const currentStatus = settings.getVotingStatus();

      if (lastKnownStatus !== null && currentStatus !== lastKnownStatus) {
        console.log(`[VotingStatus] Changed: ${lastKnownStatus} -> ${currentStatus}`);
        emitVotingStatusChange(currentStatus);
      }

      lastKnownStatus = currentStatus;
    } catch (err) {
      console.error('[VotingStatus] Watcher error:', err.message);
    }
  }, intervalMs);
};

const stopVotingStatusWatcher = () => {
  if (intervalHandle) clearInterval(intervalHandle);
};

module.exports = { startVotingStatusWatcher, stopVotingStatusWatcher };
