// lib/services/weekly-awards.service.ts — Top Contributor of the Week logic

import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { safeRedisOp } from "@/lib/redis";

const DATABASE_ID = "69617e75000c6c010a75";
const CONTRIBUTORS_COLLECTION = "contributors";
const WEEKLY_AWARDS_COLLECTION = "weekly_awards";

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

/**
 * Get the ISO week string (e.g. "2026-W21") for a date.
 */
function getWeekString(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Get Monday & Sunday of the current week.
 */
function getCurrentWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // go back to Monday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: monday.toISOString().slice(0, 10),
    weekEnd: sunday.toISOString().slice(0, 10),
  };
}

/**
 * Calculate and award the top contributor for this week.
 * Called by the Saturday cron job.
 */
export async function calculateTopContributor(): Promise<WeeklyAward | null> {
  const { weekStart, weekEnd } = getCurrentWeekBounds();
  const weekString = getWeekString(new Date());

  // Check if already awarded this week
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      WEEKLY_AWARDS_COLLECTION,
      [Query.equal("weekStart", weekStart), Query.limit(1)]
    );
    if (existing.documents.length > 0) {
      console.log("[WeeklyAwards] Already awarded for this week:", weekStart);
      return mapAward(existing.documents[0]);
    }
  } catch (err) {
    console.error("[WeeklyAwards] Error checking existing award:", err);
  }

  // Find the contributor with highest weeklyUploadCount
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      [
        Query.orderDesc("weeklyUploadCount"),
        Query.greaterThan("weeklyUploadCount", 0),
        Query.limit(1),
      ]
    );

    if (res.documents.length === 0) {
      console.log("[WeeklyAwards] No uploads this week, no award.");
      return null;
    }

    const winner = res.documents[0];

    // Clear previous top contributor flag
    try {
      const previousTop = await databases.listDocuments(
        DATABASE_ID,
        CONTRIBUTORS_COLLECTION,
        [Query.equal("isTopContributor", true), Query.limit(5)]
      );
      for (const prev of previousTop.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          CONTRIBUTORS_COLLECTION,
          prev.$id,
          { isTopContributor: false }
        );
      }
    } catch {
      // Non-critical
    }

    // Mark the winner
    await databases.updateDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      winner.$id,
      {
        isTopContributor: true,
        topContributorWeek: weekString,
      }
    );

    // Create award document
    const awardData = {
      contributors: winner.$id,
      contributorName: winner.username || "Unknown",
      contributorImage: winner.profileImage || "",
      weekStart,
      weekEnd,
      weeklyUploads: winner.weeklyUploadCount || 0,
      totalUploads: winner.uploadCount || 0,
      awardedAt: new Date().toISOString(),
    };

    const awardDoc = await databases.createDocument(
      DATABASE_ID,
      WEEKLY_AWARDS_COLLECTION,
      ID.unique(),
      awardData
    );

    // Reset ALL contributors' weeklyUploadCount to 0
    await resetWeeklyUploads();

    // Cache in Redis
    const award = mapAward(awardDoc);
    await cacheTopContributor(award);

    return award;
  } catch (err) {
    console.error("[WeeklyAwards] Failed to calculate top contributor:", err);
    return null;
  }
}

/**
 * Get the current top contributor (for display).
 */
export async function getCurrentTopContributor(): Promise<WeeklyAward | null> {
  // Try Redis
  const cached = await safeRedisOp(async (client) => {
    const data = await client.get("top_contributor:current");
    return data ? JSON.parse(data) : null;
  }, null);

  if (cached) return cached;

  // Fallback to Appwrite — get the most recent award
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      WEEKLY_AWARDS_COLLECTION,
      [Query.orderDesc("awardedAt"), Query.limit(1)]
    );

    if (res.documents.length > 0) {
      const award = mapAward(res.documents[0]);
      await cacheTopContributor(award);
      return award;
    }
  } catch (err) {
    console.error("[WeeklyAwards] Failed to get current top contributor:", err);
  }

  return null;
}

// --- Helpers ---

function mapAward(doc: any): WeeklyAward {
  return {
    id: doc.$id,
    contributorId: doc.contributors?.$id || doc.contributors || "",
    contributorName: doc.contributorName || "Unknown",
    contributorImage: doc.contributorImage || "",
    weekStart: doc.weekStart,
    weekEnd: doc.weekEnd,
    weeklyUploads: doc.weeklyUploads || 0,
    totalUploads: doc.totalUploads || 0,
    awardedAt: doc.awardedAt,
  };
}

async function cacheTopContributor(award: WeeklyAward) {
  await safeRedisOp(async (client) => {
    await client.set(
      "top_contributor:current",
      JSON.stringify(award),
      "EX",
      604800 // 7 days
    );
  }, undefined);
}

async function resetWeeklyUploads() {
  try {
    let offset = 0;
    const batchSize = 100;

    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        CONTRIBUTORS_COLLECTION,
        [
          Query.greaterThan("weeklyUploadCount", 0),
          Query.limit(batchSize),
          Query.offset(offset),
        ]
      );

      for (const doc of res.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          CONTRIBUTORS_COLLECTION,
          doc.$id,
          { weeklyUploadCount: 0 }
        );
      }

      if (res.documents.length < batchSize) break;
      offset += batchSize;
    }
  } catch (err) {
    console.error("[WeeklyAwards] Failed to reset weekly uploads:", err);
  }
}
