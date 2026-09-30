let ioInstance = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');

  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    // Clients join a room per category so we only broadcast relevant updates
    socket.on('join:category', (categorySlug) => {
      if (categorySlug) socket.join(`category:${categorySlug}`);
    });

    socket.on('leave:category', (categorySlug) => {
      if (categorySlug) socket.leave(`category:${categorySlug}`);
    });

    // Dashboard clients join this room for live tx/stat feeds
    socket.on('join:dashboard', () => {
      socket.join('dashboard');
    });
  });

  console.log('[Socket.IO] Initialized');
  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
};

/**
 * Emits a vote update to everyone watching that category's leaderboard,
 * plus the dashboard room for live stat ticking.
 */
const emitVoteUpdate = ({ categorySlug, contestantId, voteCount, categoryTotals }) => {
  if (!ioInstance) return;
  ioInstance.to(`category:${categorySlug}`).emit('vote:updated', {
    contestantId,
    voteCount,
    categoryTotals,
  });
  ioInstance.to('dashboard').emit('transaction:new', { contestantId, voteCount });
};

const emitVotingStatusChange = (status) => {
  if (!ioInstance) return;
  ioInstance.emit('event:statusChanged', { status });
};

/**
 * Broadcasts to EVERY connected client (no room) so the homepage live
 * stats bar can bump its counter without polling. Kept deliberately
 * tiny (just the vote increment) - no revenue/money data goes out here.
 */
const emitPublicStatsUpdate = ({ voteIncrement }) => {
  if (!ioInstance) return;
  ioInstance.emit('stats:updated', { voteIncrement });
};

module.exports = { initSocket, getIO, emitVoteUpdate, emitVotingStatusChange, emitPublicStatsUpdate };
