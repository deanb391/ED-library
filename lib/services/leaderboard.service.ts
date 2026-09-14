// lib/services/leaderboard.service.ts — Upload leaderboard with Redis sorted set

import prisma from "@/lib/prisma";
import { getRedis, safeRedisOp } from "@/lib/redis";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";

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
 * Increment a contributor's upload count in both DB and Redis.
 */
export async function incrementUploadCount(
  contributorId: string,
  amount: number = 1
): Promise<void> {
  // 1. Update DB
  try {
    const doc = await prisma.contributor.findUnique({
      where: { id: contributorId },
    });

    if (doc) {
      const currentTotal = doc.uploadCount || 0;
      const currentWeekly = doc.weeklyUploadCount || 0;

      await prisma.contributor.update({
        where: { id: contributorId },
        data: {
          uploadCount: currentTotal + amount,
          weeklyUploadCount: currentWeekly + amount,
        },
      });
    }
  } catch (err) {
    console.error("[Leaderboard] DB update failed:", err);
  }

  // 2. Update Redis sorted set
  await safeRedisOp(async (client) => {
    const exists = await client.exists(LEADERBOARD_KEY);
    if (!exists) {
      console.log("[Leaderboard] Redis key not found during increment. Syncing from DB...");
      await syncLeaderboardToRedis();
    } else {
      await client.zincrby(LEADERBOARD_KEY, amount, contributorId);
    }
  }, undefined);

  // Invalidate cache
  await invalidateLfuCache("leaderboard:hydrated_lists", "list:50:0");
  await invalidateLfuCache("contributor:details", contributorId);
  await clearLfuCacheNamespace("contributor:lists");
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
      console.log("[Leaderboard] Redis key not found during fetch. Syncing from DB...");
      await syncLeaderboardToRedis();
    }

    const results = await client.zrevrange(
      LEADERBOARD_KEY,
      offset,
      offset + limit - 1,
      "WITHSCORES"
    );

    if (!results || results.length === 0) return null;

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
    const values = await hydrateLeaderboard(redisEntries, offset);
    await setLfuCache("leaderboard:hydrated_lists", cacheKey, values, 20);
    return values;
  }

  // Fallback: read from DB directly
  const dbValues = await getLeaderboardFromDB(limit, offset);
  await setLfuCache("leaderboard:hydrated_lists", cacheKey, dbValues, 20);
  return dbValues;
}

/**
 * Get a specific contributor's rank.
 */
export async function getContributorRank(
  contributorId: string
): Promise<{ rank: number; uploadCount: number } | null> {
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
      rank: rank + 1,
      uploadCount: parseFloat(score || "0"),
    };
  }, null);

  if (redisRank) return redisRank;

  try {
    const doc = await prisma.contributor.findUnique({
      where: { id: contributorId },
    });

    if (!doc) return null;

    const higherCount = await prisma.contributor.count({
      where: {
        uploadCount: { gt: doc.uploadCount || 0 },
      },
    });

    return {
      rank: higherCount + 1,
      uploadCount: doc.uploadCount || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Sync leaderboard from DB to Redis (for cold starts).
 */
export async function syncLeaderboardToRedis(): Promise<number> {
  try {
    const redis = getRedis();
    if (!redis) return 0;

    const allContributors = await prisma.contributor.findMany({
      where: { uploadCount: { gt: 0 } },
    });

    if (allContributors.length === 0) return 0;

    await redis.del(LEADERBOARD_KEY);

    const pipeline = redis.pipeline();
    for (const contributor of allContributors) {
      pipeline.zadd(
        LEADERBOARD_KEY,
        contributor.uploadCount || 0,
        contributor.id
      );
    }
    await pipeline.exec();

    return allContributors.length;
  } catch (err) {
    console.error("[Leaderboard] Sync to Redis failed:", err);
    return 0;
  }
}

async function hydrateLeaderboard(
  entries: { contributorId: string; score: number }[],
  offset: number
): Promise<LeaderboardEntry[]> {
  const ids = entries.map((e) => e.contributorId);
  const docs = await prisma.contributor.findMany({
    where: { id: { in: ids } },
  });

  const docMap = new Map(docs.map((d) => [d.id, d]));

  const hydrated: LeaderboardEntry[] = [];
  for (let i = 0; i < entries.length; i++) {
    const { contributorId, score } = entries[i];
    const doc = docMap.get(contributorId);
    if (!doc) continue;

    hydrated.push({
      rank: offset + i + 1,
      contributorId,
      username: doc.username || "Unknown",
      profileImage: doc.profileImage || "",
      institution: doc.institution || "",
      uploadCount: score,
      isTopContributor: Boolean(doc.isTopContributor),
    });
  }

  return hydrated;
}

async function getLeaderboardFromDB(
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  try {
    const docs = await prisma.contributor.findMany({
      where: { uploadCount: { gt: 0 } },
      orderBy: { uploadCount: 'desc' },
      take: limit,
      skip: offset,
    });

    return docs.map((doc: any, i: number) => ({
      rank: offset + i + 1,
      contributorId: doc.id,
      username: doc.username || "Unknown",
      profileImage: doc.profileImage || "",
      institution: doc.institution || "",
      uploadCount: doc.uploadCount || 0,
      isTopContributor: Boolean(doc.isTopContributor),
    }));
  } catch (err) {
    console.error("[Leaderboard] DB fallback failed:", err);
    return [];
  }
}
