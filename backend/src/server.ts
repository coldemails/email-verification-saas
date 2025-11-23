import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import verifyRoutes from './routes/verifyRoutes';
import { initializeSocketIO } from './config/socket';
import { apiLimiter } from '../src/middleware/rateLimiter';
import adminRoutes from './routes/adminRoutes'; // ← ADD THIS
import promoRoutes from "./routes/promoRoutes";




dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const httpServer = createServer(app);

// Initialize Socket.io with Redis adapter
let io: any;
(async () => {
  io = await initializeSocketIO(httpServer);
})();

export { io };

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply general rate limiting to all API routes
app.use(apiLimiter as any);
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
app.use('/api/admin', adminRoutes); // ← ADD THIS
app.use("/api/promo", promoRoutes);  // ← THIS SHOULD BE HERE


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