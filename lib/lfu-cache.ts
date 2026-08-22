import { safeRedisOp } from "./redis";

/**
 * Retrieves a value from the LFU cache and increments its access frequency.
 * @param namespace The namespace of the cache (e.g., "course:details").
 * @param key The specific cache key within the namespace (e.g., courseId).
 * @returns The cached value or null if not found.
 */
export async function getLfuCache<T>(namespace: string, key: string): Promise<T | null> {
  return safeRedisOp(async (client) => {
    const dataKey = `lfu_data:${namespace}`;
    const freqKey = `lfu_freq:${namespace}`;

    // Get the cached value
    const data = await client.hget(dataKey, key);
    
    if (data) {
      console.log(`[LFU Cache] Hit: ${namespace} -> ${key}`);
      // Increment frequency if the item exists
      await client.zincrby(freqKey, 1, key);
      try {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed === 'object' && parsed.__lfu_wrapped) {
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            console.log(`[LFU Cache] Expired: ${namespace} -> ${key}`);
            return null; // Expired, return null so it gets re-fetched
          }
          return parsed.data as T;
        }
        return parsed as T;
      } catch (err) {
        console.error(`[LFU Cache] Failed to parse cached data for ${namespace}:${key}`, err);
        return null;
      }
    }
    
    console.log(`[LFU Cache] Miss: ${namespace} -> ${key}`);
    return null;
  }, null);
}

/**
 * Sets a value in the LFU cache, initializes/increments its frequency,
 * and evicts the least frequently used items if the namespace exceeds maxSize.
 * @param namespace The namespace of the cache.
 * @param key The specific cache key.
 * @param value The value to cache (will be JSON stringified).
 * @param maxSize The maximum number of items allowed in this namespace.
 */
export async function setLfuCache<T>(namespace: string, key: string, value: T, maxSize: number, ttlInSeconds?: number): Promise<void> {
  await safeRedisOp(async (client) => {
    const dataKey = `lfu_data:${namespace}`;
    const freqKey = `lfu_freq:${namespace}`;

    console.log(`[LFU Cache] DB Hit & Setting Cache: ${namespace} -> ${key}`);

    const payload = ttlInSeconds 
      ? { __lfu_wrapped: true, data: value, expiresAt: Date.now() + ttlInSeconds * 1000 }
      : value;

    // Set the actual data
    await client.hset(dataKey, key, JSON.stringify(payload));

    // Initialize or increment frequency
    const exists = await client.zscore(freqKey, key);
    if (exists === null) {
      // New item, set initial frequency to 1
      await client.zadd(freqKey, 1, key);
    } else {
      // If it exists, incrementing might be useful to show recent activity on set,
      // but typically we increment on GET. We'll just increment here too to ensure it stays hot.
      await client.zincrby(freqKey, 1, key);
    }

    // Check size and evict if necessary
    const size = await client.zcard(freqKey);
    if (size > maxSize) {
      const excess = size - maxSize;
      // Pop the lowest scoring items
      const popped = await client.zpopmin(freqKey, excess);
      
      if (popped && popped.length > 0) {
        const keysToDelete: string[] = [];
        // zpopmin returns [key1, score1, key2, score2, ...]
        for (let i = 0; i < popped.length; i += 2) {
          keysToDelete.push(popped[i]);
        }
        
        if (keysToDelete.length > 0) {
          await client.hdel(dataKey, ...keysToDelete);
        }
      }
    }
  }, undefined);
}

/**
 * Invalidates a specific item in the LFU cache.
 * @param namespace The namespace of the cache.
 * @param key The specific cache key.
 */
export async function invalidateLfuCache(namespace: string, key: string): Promise<void> {
  await safeRedisOp(async (client) => {
    const dataKey = `lfu_data:${namespace}`;
    const freqKey = `lfu_freq:${namespace}`;

    await client.hdel(dataKey, key);
    await client.zrem(freqKey, key);
  }, undefined);
}

/**
 * Invalidates an entire namespace in the LFU cache.
 * Useful for clearing paginated lists when a new item is created or deleted.
 * @param namespace The namespace of the cache.
 */
export async function clearLfuCacheNamespace(namespace: string): Promise<void> {
  await safeRedisOp(async (client) => {
    const dataKey = `lfu_data:${namespace}`;
    const freqKey = `lfu_freq:${namespace}`;

    await client.del(dataKey);
    await client.del(freqKey);
  }, undefined);
}
