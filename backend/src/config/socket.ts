import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

let io: SocketServer | null = null;
let pubClient: any = null;
let subClient: any = null;

export const initializeSocketIO = async (httpServer: any): Promise<SocketServer> => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Setup Redis adapter for cross-process communication
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379');
  
  try {
    pubClient = createClient({ 
      socket: { host: redisHost, port: redisPort }
    });
    subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    
    console.log('✅ Socket.IO Redis adapter connected');
  } catch (error) {
    console.warn('⚠️  Redis adapter failed, Socket.IO will work in single-process mode:', error);
  }

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