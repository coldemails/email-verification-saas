import express from 'express';
import { adminAuth } from '../middleware/adminAuth';
import {
  getDashboardStats,
  getUsers,
  updateUserCredits,
  toggleUserStatus,
  getTransactions,
  createPromoCode,
  getPromoCodes,
  togglePromoCode,
  getAdminLogs,
} from '../controllers/adminController';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:userId/credits', updateUserCredits);
router.patch('/users/:userId/toggle-status', toggleUserStatus);

// Transactions
router.get('/transactions', getTransactions);

// Promo codes
router.get('/promo-codes', getPromoCodes);
router.post('/promo-codes', createPromoCode);
router.patch('/promo-codes/:id/toggle', togglePromoCode);

// Admin logs
router.get('/logs', getAdminLogs);

export default router;