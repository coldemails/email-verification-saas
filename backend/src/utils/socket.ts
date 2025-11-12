// backend/src/utils/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join room for specific job updates
    socket.on('join-job', (jobId: string) => {
      socket.join(`job-${jobId}`);
      console.log(`🔔 Socket ${socket.id} joined job room: ${jobId}`);
    });

    // Leave job room
    socket.on('leave-job', (jobId: string) => {
      socket.leave(`job-${jobId}`);
      console.log(`🔕 Socket ${socket.id} left job room: ${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized! Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit job progress update to specific job room
 */
export const emitJobProgress = (
  jobId: string,
  progress: {
    jobId: string;
    status: string;
    processedEmails: number;
    totalEmails: number;
    validEmails: number;
    invalidEmails: number;
    riskyEmails: number;
    unknownEmails: number;
    percentComplete: number;
  }
) => {
  if (io) {
    io.to(`job-${jobId}`).emit('job-progress', progress);
    console.log(`📊 Progress emitted for job ${jobId}: ${progress.percentComplete}%`);
  }
};

/**
 * Emit job completion
 */
export const emitJobComplete = (
  jobId: string,
  data: {
    jobId: string;
    status: string;
    totalEmails: number;
    validEmails: number;
    invalidEmails: number;
    riskyEmails: number;
    unknownEmails: number;
    completedAt: Date;
  }
) => {
  if (io) {
    io.to(`job-${jobId}`).emit('job-complete', data);
    console.log(`✅ Job completion emitted for job ${jobId}`);
  }
};

/**
 * Emit job error
 */
export const emitJobError = (
  jobId: string,
  error: {
    jobId: string;
    message: string;
    timestamp: Date;
  }
) => {
  if (io) {
    io.to(`job-${jobId}`).emit('job-error', error);
    console.log(`❌ Job error emitted for job ${jobId}: ${error.message}`);
  }
};