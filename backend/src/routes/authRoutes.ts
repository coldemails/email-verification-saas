import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter'; // ← ADD THIS


const router = Router();


// Apply rate limiters
router.post('/register', registerLimiter as any, register);
router.post('/login', authLimiter as any, login);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;