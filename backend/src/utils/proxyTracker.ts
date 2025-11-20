// src/utils/proxyTracker.ts

import prisma from './prisma';
import redis from '../config/redis';

const r = redis.redisClient; // shortcuts

export async function trackProxyUsage(ipAddress: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const redisKey = `proxy:${ipAddress}:${today}`;
  
  try {
    // Increment Redis counter (fast in-memory tracking)
    const currentCount = await r.incr(redisKey);
    
    // Set expiry to end of day if new key
    if (currentCount === 1) {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const expirySeconds = Math.floor((endOfDay.getTime() - Date.now()) / 1000);
      await r.expire(redisKey, expirySeconds);
    }
    
    // Default quota
    const quota = 1000;

    if (currentCount > quota) {
      console.warn(`⚠️ IP ${ipAddress} exceeded daily quota (${currentCount}/${quota})`);
      
      await prisma.proxyUsage.update({
        where: { ipAddress },
        data: { status: 'rate_limited' }
      });
      
      return false; // Block request
    }
    
    // Update DB every 10 requests
    if (currentCount % 10 === 0 || currentCount === 1) {
      await prisma.proxyUsage.upsert({
        where: { ipAddress },
        update: {
          requestCount: currentCount,
          lastUsed: new Date(),
          status: currentCount > quota ? 'rate_limited' : 'active'
        },
        create: {
          ipAddress,
          requestCount: currentCount,
          lastUsed: new Date(),
          dailyQuota: quota,
          status: 'active'
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Proxy tracking error:', error);
    return true; // fail open
  }
}

export async function getProxyStats() {
  try {
    const proxies = await prisma.proxyUsage.findMany({
      orderBy: { requestCount: 'desc' }
    });
    
    const today = new Date().toISOString().split('T')[0];

    const enriched = await Promise.all(
      proxies.map(async (proxy) => {
        const redisKey = `proxy:${proxy.ipAddress}:${today}`;
        const todayCount = await r.get(redisKey);
        const currentCount = parseInt(todayCount || '0');
        
        return {
          ...proxy,
          todayCount: currentCount,
          quotaUsage: ((currentCount / proxy.dailyQuota) * 100).toFixed(1),
          remainingQuota: Math.max(0, proxy.dailyQuota - currentCount)
        };
      })
    );

    const summary = {
      totalProxies: enriched.length,
      activeProxies: enriched.filter(p => p.status === 'active').length,
      rateLimited: enriched.filter(p => p.status === 'rate_limited').length,
      totalRequestsToday: enriched.reduce((sum, p) => sum + p.todayCount, 0),
      avgQuotaUsage: enriched.length
        ? (enriched.reduce((sum, p) => sum + parseFloat(p.quotaUsage), 0) / enriched.length).toFixed(1)
        : 0
    };
    
    return { proxies: enriched, summary };
  } catch (error) {
    console.error('Error fetching proxy stats:', error);
    throw error;
  }
}

export async function resetProxyQuota(ipAddress: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const redisKey = `proxy:${ipAddress}:${today}`;
  
  await r.del(redisKey);

  await prisma.proxyUsage.update({
    where: { ipAddress },
    data: { 
      requestCount: 0,
      status: 'active'
    }
  });
}

export async function updateProxyQuota(ipAddress: string, newQuota: number): Promise<void> {
  await prisma.proxyUsage.update({
    where: { ipAddress },
    data: { dailyQuota: newQuota }
  });
}
