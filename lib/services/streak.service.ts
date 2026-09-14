// lib/services/streak.service.ts — Upload streak tracking

import prisma from "@/lib/prisma";
import { safeRedisOp } from "@/lib/redis";
import { randomUUID } from "crypto";

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

export function mapStreak(doc: any): StreakData {
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
    contributors: doc.contributorId || doc.contributors || "",
    user: doc.userId || doc.user || "",
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

  let streakDoc: any = null;
  try {
    streakDoc = await prisma.streak.findFirst({
      where: { contributorId },
    });
  } catch (err) {
    console.error("[Streak] Failed to fetch streak doc:", err);
  }

  if (!streakDoc) {
    const id = randomUUID();
    try {
      await prisma.streak.create({
        data: {
          id,
          contributorId,
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastUploadDate: today,
          streakHistory: JSON.stringify([today]),
          joinedDate: joinedDate || today,
        },
      });
    } catch (err) {
      console.error("[Streak] Failed to create streak doc:", err);
    }

    await cacheStreakInRedis(contributorId, 1, 1, today);

    return { isFirstToday: true, currentStreak: 1, dayName };
  }

  const streak = mapStreak(streakDoc);

  if (streak.lastUploadDate === today) {
    return { isFirstToday: false, currentStreak: streak.currentStreak, dayName };
  }

  let newCurrentStreak: number;
  if (streak.lastUploadDate === yesterday) {
    newCurrentStreak = streak.currentStreak + 1;
  } else {
    newCurrentStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newCurrentStreak);
  const history = [...streak.streakHistory, today];

  try {
    await prisma.streak.update({
      where: { id: streakDoc.id },
      data: {
        currentStreak: newCurrentStreak,
        longestStreak: newLongest,
        lastUploadDate: today,
        streakHistory: JSON.stringify(history),
      },
    });
  } catch (err) {
    console.error("[Streak] Failed to update streak doc:", err);
  }

  await cacheStreakInRedis(contributorId, newCurrentStreak, newLongest, today);

  return { isFirstToday: true, currentStreak: newCurrentStreak, dayName };
}

/**
 * Get streak data for a contributor.
 * Tries Redis first, falls back to Prisma.
 */
export async function getStreakData(
  contributorId: string
): Promise<StreakData | null> {
  const cached = await safeRedisOp(async (client) => {
    const data = await client.hgetall(`streak:${contributorId}`);
    if (data && data.currentStreak) {
      return data;
    }
    return null;
  }, null);

  if (cached) {
    try {
      const doc = await prisma.streak.findFirst({
        where: { contributorId },
      });
      if (doc) {
        return mapStreak(doc);
      }
    } catch {
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

  try {
    const doc = await prisma.streak.findFirst({
      where: { contributorId },
    });
    if (doc) {
      const streak = mapStreak(doc);
      await cacheStreakInRedis(
        contributorId,
        streak.currentStreak,
        streak.longestStreak,
        streak.lastUploadDate
      );
      return streak;
    }
  } catch (err) {
    console.error("[Streak] Failed to fetch from DB:", err);
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
    await client.expire(`streak:${contributorId}`, 172800);
  }, undefined);
}
