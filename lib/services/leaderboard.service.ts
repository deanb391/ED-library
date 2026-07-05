// lib/services/leaderboard.service.ts — Upload leaderboard with Redis sorted set

import { Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { getRedis, safeRedisOp } from "@/lib/redis";
import { getLfuCache, setLfuCache, invalidateLfuCache } from "@/lib/lfu-cache";
const DATABASE_ID = "69617e75000c6c010a75";
const CONTRIBUTORS_COLLECTION = "contributors";
const LEADERBOARD_KEY = "leaderboard:uploads";

export type LeaderboardEntry = {
  rank: number;
  contributorId: string;
  username: string;
  profileImage: string;
  institution: string;
  uploadCount: number;
  isTopContributor: boolean;
};

/**
 * Increment a contributor's upload count in both Appwrite and Redis.
 */
export async function incrementUploadCount(
  contributorId: string,
  amount: number = 1
): Promise<void> {
  // 1. Update Appwrite
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId
    );

    const currentTotal = doc.uploadCount || 0;
    const currentWeekly = doc.weeklyUploadCount || 0;

    await databases.updateDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId,
      {
        uploadCount: currentTotal + amount,
        weeklyUploadCount: currentWeekly + amount,
      }
    );
  } catch (err) {
    console.error("[Leaderboard] Appwrite update failed:", err);
  }

  // 2. Update Redis sorted set
  await safeRedisOp(async (client) => {
    const exists = await client.exists(LEADERBOARD_KEY);
    if (!exists) {
      console.log("[Leaderboard] Redis key not found during increment. Syncing from Appwrite...");
      await syncLeaderboardToRedis();
    } else {
      await client.zincrby(LEADERBOARD_KEY, amount, contributorId);
    }
  }, undefined);

  // Invalidate the first page of the leaderboard since it changed
  await invalidateLfuCache("leaderboard:hydrated_lists", "list:50:0");
}

/**
 * Get the leaderboard — ranked contributors by upload count.
 */
export async function getLeaderboard(
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  const cacheKey = `list:${limit}:${offset}`;
  const cached = await getLfuCache<LeaderboardEntry[]>("leaderboard:hydrated_lists", cacheKey);
  if (cached) return cached;

  // Try Redis first
  const redisEntries = await safeRedisOp(async (client) => {
    const exists = await client.exists(LEADERBOARD_KEY);
    if (!exists) {
      console.log("[Leaderboard] Redis key not found during fetch. Syncing from Appwrite...");
      await syncLeaderboardToRedis();
    }

    // ZREVRANGE returns members sorted highest-to-lowest
    const results = await client.zrevrange(
      LEADERBOARD_KEY,
      offset,
      offset + limit - 1,
      "WITHSCORES"
    );

    if (!results || results.length === 0) return null;
    console.log("Results: ", results)

    // Results come as [member, score, member, score, ...]
    const entries: { contributorId: string; score: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        contributorId: results[i],
        score: parseFloat(results[i + 1]),
      });
    }
    return entries;
  }, null);

  if (redisEntries && redisEntries.length > 0) {
    // Hydrate with contributor details from Appwrite
    console.log("redisEntries: ", redisEntries)
    const values = await hydrateLeaderboard(redisEntries, offset);
    console.log("Values: ", values)
    await setLfuCache("leaderboard:hydrated_lists", cacheKey, values, 20);
    return values
  }

  // Fallback: read from Appwrite directly
  const appwriteValues = await getLeaderboardFromAppwrite(limit, offset);
  await setLfuCache("leaderboard:hydrated_lists", cacheKey, appwriteValues, 20);
  return appwriteValues;
}

/**
 * Get a specific contributor's rank.
 */
export async function getContributorRank(
  contributorId: string
): Promise<{ rank: number; uploadCount: number } | null> {
  // Try Redis
  const redisRank = await safeRedisOp(async (client) => {
    const exists = await client.exists(LEADERBOARD_KEY);
    if (!exists) {
      console.log("[Leaderboard] Redis key not found during rank lookup. Syncing...");
      await syncLeaderboardToRedis();
    }

    const rank = await client.zrevrank(LEADERBOARD_KEY, contributorId);
    const score = await client.zscore(LEADERBOARD_KEY, contributorId);

    if (rank === null) return null;

    return {
      rank: rank + 1, // 0-indexed → 1-indexed
      uploadCount: parseFloat(score || "0"),
    };
  }, null);

  if (redisRank) return redisRank;

  // Fallback to Appwrite
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId
    );

    // Count how many contributors have more uploads
    const higherCount = await databases.listDocuments(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      [
        Query.greaterThan("uploadCount", doc.uploadCount || 0),
        Query.limit(1),
      ]
    );

    return {
      rank: higherCount.total + 1,
      uploadCount: doc.uploadCount || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Sync leaderboard from Appwrite to Redis (for cold starts).
 */
export async function syncLeaderboardToRedis(): Promise<number> {
  try {
    const redis = getRedis();
    if (!redis) return 0;

    // Fetch all contributors with uploads
    let allContributors: any[] = [];
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        CONTRIBUTORS_COLLECTION,
        [
          Query.greaterThan("uploadCount", 0),
          Query.limit(batchSize),
          Query.offset(offset),
        ]
      );

      allContributors = [...allContributors, ...res.documents];

      if (res.documents.length < batchSize) break;
      offset += batchSize;
    }

    if (allContributors.length === 0) return 0;

    // Clear existing leaderboard and rebuild
    await redis.del(LEADERBOARD_KEY);

    const pipeline = redis.pipeline();
    for (const contributor of allContributors) {
      pipeline.zadd(
        LEADERBOARD_KEY,
        contributor.uploadCount || 0,
        contributor.$id
      );
    }
    await pipeline.exec();

    return allContributors.length;
  } catch (err) {
    console.error("[Leaderboard] Sync to Redis failed:", err);
    return 0;
  }
}

// --- Internal helpers ---

async function hydrateLeaderboard(
  entries: { contributorId: string; score: number }[],
  offset: number
): Promise<LeaderboardEntry[]> {
  const hydrated: LeaderboardEntry[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { contributorId, score } = entries[i];

    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        CONTRIBUTORS_COLLECTION,
        contributorId
      );

      hydrated.push({
        rank: offset + i + 1,
        contributorId,
        username: doc.username || "Unknown",
        profileImage: doc.profileImage || "",
        institution: doc.institution || "",
        uploadCount: score,
        isTopContributor: doc.isTopContributor || false,
      });
    } catch {
      // Contributor may have been deleted — skip
      continue;
    }
  }
  console.log("Hydated: ", hydrated);

  return hydrated;
}

async function getLeaderboardFromAppwrite(
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      [
        Query.orderDesc("uploadCount"),
        Query.greaterThan("uploadCount", 0),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return res.documents.map((doc: any, i: number) => ({
      rank: offset + i + 1,
      contributorId: doc.$id,
      username: doc.username || "Unknown",
      profileImage: doc.profileImage || "",
      institution: doc.institution || "",
      uploadCount: doc.uploadCount || 0,
      isTopContributor: doc.isTopContributor || false,
    }));
  } catch (err) {
    console.error("[Leaderboard] Appwrite fallback failed:", err);
    return [];
  }
}
