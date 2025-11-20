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

// Correct imports
import prisma from '../utils/prisma';
import verificationQueue from '../config/queue';

// New utils for proxy tracking
import { trackProxyUsage, getProxyStats, resetProxyQuota, updateProxyQuota } from '../utils/proxyTracker';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// ---------------------------------------
// Dashboard stats
// ---------------------------------------
router.get('/stats', getDashboardStats);

// ---------------------------------------
// User management
// ---------------------------------------
router.get('/users', getUsers);
router.patch('/users/:userId/credits', updateUserCredits);
router.patch('/users/:userId/toggle-status', toggleUserStatus);

// ---------------------------------------
// Transactions
// ---------------------------------------
router.get('/transactions', getTransactions);

// ---------------------------------------
// Promo codes
// ---------------------------------------
router.get('/promo-codes', getPromoCodes);
router.post('/promo-codes', createPromoCode);
router.patch('/promo-codes/:id/toggle', togglePromoCode);

// ---------------------------------------
// Admin logs
// ---------------------------------------
router.get('/logs', getAdminLogs);

// ---------------------------------------
// Worker Stats Endpoint
// ---------------------------------------
router.get('/worker-stats', async (req, res) => {
  try {
    const queue = verificationQueue;

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const recentJobs = await prisma.verificationJob.findMany({
      where: {
        createdAt: { gte: new Date(oneHourAgo) }
      },
      select: {
        status: true,
        processedEmails: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const completedJobs = recentJobs.filter(j => j.status === 'COMPLETED');
    const totalProcessed = completedJobs.reduce(
      (sum, j) => sum + (j.processedEmails || 0),
      0
    );

    const avgSpeed = completedJobs.length > 0
      ? Math.round(totalProcessed / completedJobs.length)
      : 0;

    res.json({
      queue: { waiting, active, completed, failed, delayed },
      performance: {
        jobsLastHour: recentJobs.length,
        completedLastHour: completedJobs.length,
        avgEmailsPerJob: avgSpeed,
        estimatedSpeed: `${Math.round(avgSpeed * 60)} emails/hour`
      }
    });

  } catch (error) {
    console.error("Error fetching worker stats:", error);
    res.status(500).json({ error: "Failed to fetch worker stats" });
  }
});

// ---------------------------------------
// 🔥 NEW: Proxy Usage Admin Endpoints
// ---------------------------------------

// Get all proxy usage stats
router.get('/proxy-stats', async (req, res) => {
  try {
    const stats = await getProxyStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching proxy stats:', error);
    res.status(500).json({ error: 'Failed to fetch proxy stats' });
  }
});

// Reset proxy quota
router.post('/proxy-reset/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;

    await resetProxyQuota(ipAddress);

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: 'RESET_PROXY_QUOTA',
        details: `Reset quota for IP: ${ipAddress}`
      }
    });

    res.json({ message: 'Proxy quota reset successfully' });
  } catch (error) {
    console.error('Error resetting proxy quota:', error);
    res.status(500).json({ error: 'Failed to reset proxy quota' });
  }
});

// Update proxy quota
router.patch('/proxy-quota/:ipAddress', async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const { dailyQuota } = req.body;

    if (!dailyQuota || dailyQuota < 0) {
      return res.status(400).json({ error: 'Invalid quota value' });
    }

    await updateProxyQuota(ipAddress, dailyQuota);

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: 'UPDATE_PROXY_QUOTA',
        details: `Updated quota for IP ${ipAddress} to ${dailyQuota}`
      }
    });

    res.json({ message: 'Proxy quota updated successfully' });
    
  } catch (error) {
    console.error('Error updating proxy quota:', error);
    res.status(500).json({ error: 'Failed to update proxy quota' });
  }
});

export default router;
