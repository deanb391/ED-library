// lib/services/streak.service.ts — Upload streak tracking

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { getRedis, safeRedisOp } from "@/lib/redis";

const DATABASE_ID = "69617e75000c6c010a75";
const STREAKS_COLLECTION = "streaks";

export type StreakData = {
  contributors: string;
  user: string;
  currentStreak: number;
  longestStreak: number;
  lastUploadDate: string; // YYYY-MM-DD
  streakHistory: string[]; // Array of YYYY-MM-DD dates
  joinedDate: string; // YYYY-MM-DD
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getDayName(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function mapStreak(doc: any): StreakData {
  let history: string[] = [];
  try {
    history = doc.streakHistory
      ? typeof doc.streakHistory === "string"
        ? JSON.parse(doc.streakHistory)
        : doc.streakHistory
      : [];
  } catch {
    history = [];
  }

  return {
    contributors: doc.contributors?.$id || doc.contributors || "",
    user: doc.user || "",
    currentStreak: doc.currentStreak || 0,
    longestStreak: doc.longestStreak || 0,
    lastUploadDate: doc.lastUploadDate || "",
    streakHistory: Array.isArray(history) ? history : [],
    joinedDate: doc.joinedDate || "",
  };
}

/**
 * Record an upload for streak purposes.
 * Returns whether this was the first upload of the day + current streak.
 */
export async function recordUploadStreak(
  contributorId: string,
  userId: string,
  joinedDate: string
): Promise<{
  isFirstToday: boolean;
  currentStreak: number;
  dayName: string;
}> {
  const today = todayStr();
  const yesterday = yesterdayStr();
  const dayName = getDayName();

  // Try to get existing streak document
  let streakDoc: any = null;
  try {
    const res = await databases.listDocuments(DATABASE_ID, STREAKS_COLLECTION, [
      Query.equal("contributors", contributorId),
      Query.limit(1),
    ]);
    if (res.documents.length > 0) {
      streakDoc = res.documents[0];
    }
  } catch (err) {
    console.error("[Streak] Failed to fetch streak doc:", err);
  }

  if (!streakDoc) {
    // First ever upload — create streak document
    const newStreak = {
      contributors: contributorId,
      user: userId,
      currentStreak: 1,
      longestStreak: 1,
      lastUploadDate: today,
      streakHistory: JSON.stringify([today]),
      joinedDate: joinedDate || today,
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        STREAKS_COLLECTION,
        ID.unique(),
        newStreak
      );
    } catch (err) {
      console.error("[Streak] Failed to create streak doc:", err);
    }

    // Cache in Redis
    await cacheStreakInRedis(contributorId, 1, 1, today);

    return { isFirstToday: true, currentStreak: 1, dayName };
  }

  const streak = mapStreak(streakDoc);

  // Already uploaded today
  if (streak.lastUploadDate === today) {
    return { isFirstToday: false, currentStreak: streak.currentStreak, dayName };
  }

  // Calculate new streak
  let newCurrentStreak: number;
  if (streak.lastUploadDate === yesterday) {
    // Consecutive day — extend streak
    newCurrentStreak = streak.currentStreak + 1;
  } else {
    // Streak broken — restart at 1
    newCurrentStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newCurrentStreak);
  const history = [...streak.streakHistory, today];

  try {
    await databases.updateDocument(
      DATABASE_ID,
      STREAKS_COLLECTION,
      streakDoc.$id,
      {
        currentStreak: newCurrentStreak,
        longestStreak: newLongest,
        lastUploadDate: today,
        streakHistory: JSON.stringify(history),
      }
    );
  } catch (err) {
    console.error("[Streak] Failed to update streak doc:", err);
  }

  // Update Redis cache
  await cacheStreakInRedis(contributorId, newCurrentStreak, newLongest, today);

  return { isFirstToday: true, currentStreak: newCurrentStreak, dayName };
}

/**
 * Get streak data for a contributor.
 * Tries Redis first, falls back to Appwrite.
 */
export async function getStreakData(
  contributorId: string
): Promise<StreakData | null> {
  // Try Redis cache first
  const cached = await safeRedisOp(async (client) => {
    const data = await client.hgetall(`streak:${contributorId}`);
    if (data && data.currentStreak) {
      return data;
    }
    return null;
  }, null);

  if (cached) {
    // We still need the full history from Appwrite for the calendar
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        STREAKS_COLLECTION,
        [Query.equal("contributors", contributorId), Query.limit(1)]
      );
      if (res.documents.length > 0) {
        return mapStreak(res.documents[0]);
      }
    } catch {
      // Return partial data from Redis
      return {
        contributors: contributorId,
        user: "",
        currentStreak: parseInt(cached.currentStreak) || 0,
        longestStreak: parseInt(cached.longestStreak) || 0,
        lastUploadDate: cached.lastDate || "",
        streakHistory: [],
        joinedDate: "",
      };
    }
  }

  // Fallback to Appwrite
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      STREAKS_COLLECTION,
      [Query.equal("contributors", contributorId), Query.limit(1)]
    );
    if (res.documents.length > 0) {
      const streak = mapStreak(res.documents[0]);
      // Populate Redis cache for next time
      await cacheStreakInRedis(
        contributorId,
        streak.currentStreak,
        streak.longestStreak,
        streak.lastUploadDate
      );
      return streak;
    }
  } catch (err) {
    console.error("[Streak] Failed to fetch from Appwrite:", err);
  }

  return null;
}

async function cacheStreakInRedis(
  contributorId: string,
  current: number,
  longest: number,
  lastDate: string
) {
  await safeRedisOp(async (client) => {
    await client.hset(`streak:${contributorId}`, {
      currentStreak: String(current),
      longestStreak: String(longest),
      lastDate,
    });
    // Expire after 48 hours — will be refreshed on next upload/read
    await client.expire(`streak:${contributorId}`, 172800);
  }, undefined);
}
