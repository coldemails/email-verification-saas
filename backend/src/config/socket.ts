import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';

// This will be initialized by server.ts
let io: SocketServer | null = null;

export const initializeSocketIO = (httpServer: any): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('join-job', (jobId: string) => {
      socket.join(`job-${jobId}`);
      console.log(`📝 Socket ${socket.id} joined job room: ${jobId}`);
    });

    socket.on('leave-job', (jobId: string) => {
      socket.leave(`job-${jobId}`);
      console.log(`👋 Socket ${socket.id} left job room: ${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initializeSocketIO first.');
  }
  return io;
};

export { io };