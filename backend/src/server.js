require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets');
const { startVotingStatusWatcher } = require('./utils/votingStatusWatcher');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION. Shutting down...', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

connectDB().then(() => {
  startVotingStatusWatcher();

  server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION. Shutting down...', err);
  server.close(() => process.exit(1));
});
