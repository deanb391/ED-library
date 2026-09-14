// lib/services/weekly-awards.service.ts — Top Contributor of the Week logic

import prisma from "@/lib/prisma";
import { safeRedisOp } from "@/lib/redis";
import { invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

export type WeeklyAward = {
  id: string;
  contributorId: string;
  contributorName: string;
  contributorImage: string;
  weekStart: string;
  weekEnd: string;
  weeklyUploads: number;
  totalUploads: number;
  awardedAt: string;
};

function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getCurrentWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}

export async function calculateTopContributor(): Promise<WeeklyAward | null> {
  const { weekStart, weekEnd } = getCurrentWeekBounds();
  const weekString = getWeekString(new Date());

  try {
    const existing = await prisma.weeklyAward.findFirst({
      where: { weekStart },
    });
    if (existing) {
      return mapAward(existing);
    }
  } catch (err) {
    console.error("[WeeklyAwards] Error checking existing award:", err);
  }

  try {
    const winner = await prisma.contributor.findFirst({
      where: { weeklyUploadCount: { gt: 0 } },
      orderBy: { weeklyUploadCount: 'desc' },
    });

    if (!winner) {
      return null;
    }

    try {
      await prisma.contributor.updateMany({
        where: { isTopContributor: true },
        data: { isTopContributor: false },
      });
    } catch {
      // Non-critical
    }

    await prisma.contributor.update({
      where: { id: winner.id },
      data: {
        isTopContributor: true,
        topContributorWeek: weekString,
      },
    });

    await invalidateLfuCache("contributor:details", winner.id);

    const id = randomUUID();
    const awardDoc = await prisma.weeklyAward.create({
      data: {
        id,
        contributorId: winner.id,
        contributorName: winner.username || "Unknown",
        contributorImage: winner.profileImage || "",
        weekStart,
        weekEnd,
        weeklyUploads: winner.weeklyUploadCount || 0,
        totalUploads: winner.uploadCount || 0,
        awardedAt: new Date().toISOString(),
      },
    });

    await resetWeeklyUploads();
    await clearLfuCacheNamespace("contributor:lists");

    const award = mapAward(awardDoc);
    await cacheTopContributor(award);

    return award;
  } catch (err) {
    console.error("[WeeklyAwards] Failed to calculate top contributor:", err);
    return null;
  }
}

export async function getCurrentTopContributor(): Promise<WeeklyAward | null> {
  const cached = await safeRedisOp(async (client) => {
    const data = await client.get("top_contributor:current");
    return data ? JSON.parse(data) : null;
  }, null);

  if (cached) return cached;

  try {
    const doc = await prisma.weeklyAward.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (doc) {
      const award = mapAward(doc);
      await cacheTopContributor(award);
      return award;
    }
  } catch (err) {
    console.error("[WeeklyAwards] Failed to get current top contributor:", err);
  }

  return null;
}

function mapAward(doc: any): WeeklyAward {
  return {
    id: doc.id || doc.$id,
    contributorId: doc.contributorId || "",
    contributorName: doc.contributorName || "Unknown",
    contributorImage: doc.contributorImage || "",
    weekStart: doc.weekStart || "",
    weekEnd: doc.weekEnd || "",
    weeklyUploads: doc.weeklyUploads || 0,
    totalUploads: doc.totalUploads || 0,
    awardedAt: doc.awardedAt || (doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString()),
  };
}

async function cacheTopContributor(award: WeeklyAward) {
  await safeRedisOp(async (client) => {
    await client.set(
      "top_contributor:current",
      JSON.stringify(award),
      "EX",
      604800
    );
  }, undefined);
}

async function resetWeeklyUploads() {
  try {
    await prisma.contributor.updateMany({
      where: { weeklyUploadCount: { gt: 0 } },
      data: { weeklyUploadCount: 0 },
    });
  } catch (err) {
    console.error("[WeeklyAwards] Failed to reset weekly uploads:", err);
  }
}
