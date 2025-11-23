import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalJobs,
      completedJobs,
      totalEmailsVerified,
      totalRevenue,
      pendingJobs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.verificationJob.count(),
      prisma.verificationJob.count({ where: { status: 'COMPLETED' } }),
      prisma.verificationJob.aggregate({
        _sum: { processedEmails: true }
      }),
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.verificationJob.count({ where: { status: 'PENDING' } }),
    ]);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSignups = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Get today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayRevenue = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: todayStart }
      },
      _sum: { amount: true }
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        recentSignups,
        totalJobs,
        completedJobs,
        pendingJobs,
        totalEmailsVerified: totalEmailsVerified._sum.processedEmails || 0,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        todayRevenue: Number(todayRevenue._sum.amount || 0),
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get all users with pagination
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              verificationJobs: true,
              transactions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user credits
export const updateUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { credits, action } = req.body; // action: 'add' or 'set'
const adminId = (req as any).admin.id;


    if (!credits || credits < 0) {
      return res.status(400).json({ error: 'Invalid credits amount' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newCredits = action === 'add' 
      ? user.credits + credits 
      : credits;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: newCredits }
      }),
      prisma.adminLog.create({
        data: {
          adminId,
          action: 'CREDITS_MODIFIED',
          targetId: userId,
          details: JSON.stringify({ 
            oldCredits: user.credits, 
            newCredits, 
            action 
          })
        }
      })
    ]);

    res.json({ 
      success: true, 
      message: 'Credits updated successfully',
      newCredits 
    });
  } catch (error) {
    console.error('Error updating credits:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
};

// Ban/unban user
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).admin.id;


    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: 'Cannot ban admin users' });
    }

    const newStatus = !user.isActive;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { isActive: newStatus }
      }),
      prisma.adminLog.create({
        data: {
          adminId,
          action: newStatus ? 'USER_UNBANNED' : 'USER_BANNED',
          targetId: userId,
          details: JSON.stringify({ email: user.email })
        }
      })
    ]);

    res.json({ 
      success: true, 
      message: `User ${newStatus ? 'unbanned' : 'banned'} successfully`,
      isActive: newStatus
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Get all transactions
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count()
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create promo code
export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const { code, credits, discountType, discountValue, maxUses, expiresAt } = req.body;
    const adminId = (req as any).admin.id;

    if (!code || !credits) {
      return res.status(400).json({ error: 'Code and credits are required' });
    }

    const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Promo code already exists' });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        credits,
        discountType: discountType || 'FIXED',
        discountValue: discountValue || 0,
        maxUses: maxUses || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'PROMO_CREATED',
        targetId: promoCode.id,
        details: JSON.stringify({ code: promoCode.code, credits })
      }
    });

    res.json({ success: true, promoCode });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
};

// Get all promo codes
export const getPromoCodes = async (req: Request, res: Response) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      include: {
        _count: {
          select: { usages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
};

// Toggle promo code status
export const togglePromoCode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).admin.id;

    const promoCode = await prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: { isActive: !promoCode.isActive }
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: updated.isActive ? 'PROMO_ACTIVATED' : 'PROMO_DEACTIVATED',
        targetId: id,
        details: JSON.stringify({ code: promoCode.code })
      }
    });

    res.json({ success: true, promoCode: updated });
  } catch (error) {
    console.error('Error toggling promo code:', error);
    res.status(500).json({ error: 'Failed to toggle promo code' });
  }
};

// Get admin logs
export const getAdminLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.adminLog.count()
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
};