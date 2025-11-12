import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import verifyRoutes from './routes/verifyRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io
export const io = new Server(httpServer, {
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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Email Verification API',
    version: '1.0.0',
    status: 'running',
    socketio: 'enabled'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/verify', verifyRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    socketio: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Start server (use httpServer instead of app)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io enabled and ready`);
});

export default app;