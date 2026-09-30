import { io } from 'socket.io-client';

// In dev, Vite proxies /socket.io to the backend (see vite.config.js).
// In production, set VITE_SOCKET_URL to the deployed API origin.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
});
