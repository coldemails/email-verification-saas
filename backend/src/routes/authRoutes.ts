import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter'; // ← ADD THIS
import { register, login, getMe, forgotPassword, resetPassword, changePassword } from '../controllers/authController';
import { testEmailDebug } from '../controllers/authController';


const router = Router();


// Apply rate limiters
router.post('/register', registerLimiter as any, register);
router.post('/login', authLimiter as any, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', authenticate, changePassword); // 🆕 ADD THIS
router.get('/test-email-debug', testEmailDebug);


// Protected routes
router.get('/me', authenticate, getMe);

export default router;