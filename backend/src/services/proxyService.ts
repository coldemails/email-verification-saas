import axios from "axios";
import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// KEY NAMES FOR REDIS
const REDIS_PROXY_POOL = "proxy_pool"; // list of proxies
const REDIS_PROXY_FAIL_COUNT = "proxy_fail_count"; // proxy → failCount
const REDIS_PROXY_LAST_OK = "proxy_last_ok"; // proxy → timestamp

// Fail threshold before marking proxy dead
const MAX_FAILS = 5;

// Proxy format in .env
// PROXY_LIST="user:pass@ip:port,user:pass@ip:port"
const RAW_PROXY_LIST = process.env.PROXY_LIST || "";

// Convert raw .env proxy list → normalized list
function parseProxyList() {
  if (!RAW_PROXY_LIST) return [];
  return RAW_PROXY_LIST.split(",").map((p) => p.trim());
}

class ProxyService {
  private proxyPool: string[] = [];
  private index: number = 0;

  constructor() {
    this.loadProxyPool();
  }

  /** Load proxies from ENV into memory + Redis */
  async loadProxyPool() {
    const proxies = parseProxyList();
    if (proxies.length === 0) {
      console.log("⚠️ No proxies found in PROXY_LIST env!");
      return;
    }

    this.proxyPool = proxies;

    // save to redis for persistence
    await redis.del(REDIS_PROXY_POOL);
    await redis.lpush(REDIS_PROXY_POOL, ...proxies);

    console.log("🔄 Proxy pool loaded:", proxies.length, "proxies");
  }

  /** Round-robin rotation */
  async getNextProxy(): Promise<string | null> {
    if (this.proxyPool.length === 0) return null;

    // cycle index
    this.index = (this.index + 1) % this.proxyPool.length;
    const proxy = this.proxyPool[this.index];

    return proxy;
  }

  /** Mark proxy as failed */
  async markProxyFailed(proxy: string) {
    const fails = await redis.hincrby(REDIS_PROXY_FAIL_COUNT, proxy, 1);

    console.log(`❌ Proxy failed (${fails} fails): ${proxy}`);

    if (fails >= MAX_FAILS) {
      console.log("⛔ Proxy marked as DEAD:", proxy);
      this.removeProxy(proxy);
    }
  }

  /** Mark proxy as healthy */
  async markProxySuccessful(proxy: string) {
    await redis.hset(REDIS_PROXY_LAST_OK, proxy, Date.now());
    await redis.hset(REDIS_PROXY_FAIL_COUNT, proxy, 0);

    console.log(`✅ Proxy OK: ${proxy}`);
  }

  /** Remove proxy from pool (in-memory + Redis) */
  async removeProxy(proxy: string) {
    // Remove from in-memory pool
    this.proxyPool = this.proxyPool.filter((p) => p !== proxy);

    // Remove from Redis list
    const proxies = await redis.lrange(REDIS_PROXY_POOL, 0, -1);
    const updated = proxies.filter((p) => p !== proxy);

    await redis.del(REDIS_PROXY_POOL);
    if (updated.length > 0) {
      await redis.lpush(REDIS_PROXY_POOL, ...updated);
    }

    console.log("🧹 Removed dead proxy:", proxy);
  }

  /** Health check of proxy using a fast HTTP request */
  async checkProxyHealth(proxy: string): Promise<boolean> {
    try {
      const [creds, hostPort] = proxy.split("@");
      const [user, pass] = creds.split(":");
      const [ip, port] = hostPort.split(":");

      await axios.get("https://api.ipify.org?format=json", {
        proxy: {
          host: ip,
          port: Number(port),
          auth: {
            username: user,
            password: pass,
          },
        },
        timeout: 5000,
      });

      return true;
    } catch (err) {
      return false;
    }
  }

  /** Return a proxy guaranteed to be alive (with failover) */
  async getHealthyProxy(): Promise<string | null> {
    for (let i = 0; i < this.proxyPool.length; i++) {
      const proxy = await this.getNextProxy();
      if (!proxy) return null;

      const isHealthy = await this.checkProxyHealth(proxy);

      if (isHealthy) {
        await this.markProxySuccessful(proxy);
        return proxy;
      } else {
        await this.markProxyFailed(proxy);
      }
    }

    console.log("❌ No healthy proxies available!");
    return null;
  }
}

export const proxyService = new ProxyService();
