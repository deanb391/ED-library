// lib/redis.ts — Singleton Redis client for leaderboard & streak caching

import Redis from "ioredis";

let redis: Redis | null = null;
let isOffline = false;
let offlineTimer: NodeJS.Timeout | null = null;

export function getRedis(): Redis | null {
  if (isOffline) {
    return null;
  }

  if (!redis) {
    let url = process.env.REDIS_URL || "redis://localhost:6379";
    
    // Upstash requires rediss:// (TLS) externally
    if (url.includes("upstash.io") && url.startsWith("redis://")) {
      url = url.replace("redis://", "rediss://");
    }

    try {
      redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy(times) {
          // If we fail to connect, trigger offline mode immediately
          isOffline = true;
          triggerOfflineCooldown();
          return null; // stop retrying
        },
        lazyConnect: true,
      });

      redis.on("error", (err) => {
        // If connection is closed or refused, mark as offline to avoid lagging requests
        if (!isOffline) {
          console.warn("[Redis] Client error (bypassing):", err.message);
          isOffline = true;
          triggerOfflineCooldown();
        }
      });
    } catch (err) {
      console.warn("[Redis] Failed to initialize client:", (err as Error).message);
      isOffline = true;
      triggerOfflineCooldown();
      return null;
    }
  }

  return redis;
}

function triggerOfflineCooldown() {
  if (offlineTimer) clearTimeout(offlineTimer);
  // Retry connecting to Redis after 2 minutes
  offlineTimer = setTimeout(() => {
    isOffline = false;
    redis = null; // force re-initialization
  }, 120000);
}

/**
 * Safe wrapper — if Redis is down, operations fail silently
 * and the caller can fall back to Appwrite.
 */
export async function safeRedisOp<T>(
  op: (client: Redis) => Promise<T>,
  fallback: T
): Promise<T> {
  if (isOffline) {
    return fallback;
  }

  try {
    const client = getRedis();
    if (!client) {
      return fallback;
    }
    return await op(client);
  } catch (err) {
    const errMsg = (err as Error).message;
    if (
      errMsg.includes("closed") || 
      errMsg.includes("connect") || 
      errMsg.includes("Connection") || 
      errMsg.includes("Timeout")
    ) {
      isOffline = true;
      triggerOfflineCooldown();
    } else {
      console.warn("[Redis] Operation failed, using fallback:", errMsg);
    }
    return fallback;
  }
}
