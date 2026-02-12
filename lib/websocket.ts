import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectWebSocket(userId: string) {
  if (socket?.connected) {
    return socket;
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
  
  socket = io(WS_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    socket?.emit('register', userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
