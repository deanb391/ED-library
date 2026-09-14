import prisma from "@/lib/prisma";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";
import { randomUUID } from "crypto";

export type ContestPerformance = {
  $id?: string;
  id?: string;
  contributors: string;
  totalPoints: number;
  dailyPoints: string;
  uniqueUsersReached: string;
  newUsers: string;
  usersReachedIds: string;
  returningUsers: string;
  acquisitionScore: number;
  engagementScore: number;
  contentScore: number;
  engagementActivity: string;
  dailyCourseRatings: string;
  coursesPoints?: string;
  uploadQuality?: string;
  referralClicks?: string;
  uploadsCreated?: string;
  Prize?: number;
  isTop3Contributor?: boolean;
};

export function mapContestPerformance(doc: any): ContestPerformance {
  if (!doc) return null as any;
  return {
    ...doc,
    $id: doc.id || doc.$id,
    id: doc.id || doc.$id,
    contributors: doc.contributorId || doc.contributors || "",
    totalPoints: Number(doc.totalPoints) || 0,
    acquisitionScore: Number(doc.acquisitionScore) || 0,
    engagementScore: Number(doc.engagementScore) || 0,
    contentScore: Number(doc.contentScore) || 0,
    Prize: doc.Prize ? Number(doc.Prize) : 0,
    isTop3Contributor: Boolean(doc.isTop3Contributor),
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createContestPerformanceService(contributorId: string): Promise<ContestPerformance> {
  const id = randomUUID();
  const doc = await prisma.contestPerformance.create({
    data: {
      id,
      contributorId,
      totalPoints: 0,
      dailyPoints: "{}",
      uniqueUsersReached: "{}",
      newUsers: "{}",
      usersReachedIds: "{}",
      returningUsers: "{}",
      acquisitionScore: 0,
      engagementScore: 0,
      contentScore: 0,
      engagementActivity: "{}",
      dailyCourseRatings: "{}",
    },
  });

  return mapContestPerformance(doc);
}

export async function getContestPerformanceByContributorService(contributorId: string): Promise<ContestPerformance | null> {
  const cached = await getLfuCache<ContestPerformance>("performance:details", contributorId);
  if (cached) return cached;

  try {
    const doc = await prisma.contestPerformance.findFirst({
      where: { contributorId },
    });

    if (!doc) {
      const newPerformance = await createContestPerformanceService(contributorId);
      return newPerformance;
    }

    const performance = mapContestPerformance(doc);
    await setLfuCache("performance:details", contributorId, performance, 100);
    return performance;
  } catch (err) {
    console.error("Error fetching contest performance:", err);
    return null;
  }
}

export async function updateContestPerformanceService(
  performanceId: string,
  updates: Partial<ContestPerformance>
): Promise<ContestPerformance> {
  const dataToUpdate: any = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && key !== "id" && key !== "$id" && key !== "$createdAt" && key !== "$updatedAt") {
      if (key === "contributors") {
        dataToUpdate.contributorId = value;
      } else {
        dataToUpdate[key] = value;
      }
    }
  }

  const doc = await prisma.contestPerformance.update({
    where: { id: performanceId },
    data: dataToUpdate,
  });

  const contributorId = doc.contributorId;

  if (contributorId) {
    await invalidateLfuCache("performance:details", contributorId as string);
  }
  
  await clearLfuCacheNamespace("performance:lists");
  await clearLfuCacheNamespace("leaderboard:hydrated_lists");

  return mapContestPerformance(doc);
}

export async function fetchAllContestPerformancesService(): Promise<ContestPerformance[]> {
  const cached = await getLfuCache<ContestPerformance[]>("performance:lists", "all");
  if (cached) return cached;

  try {
    const docs = await prisma.contestPerformance.findMany({
      take: 500,
    });
    const performances = docs.map(mapContestPerformance);
    await setLfuCache("performance:lists", "all", performances, 20);
    return performances;
  } catch (err) {
    console.error("Error fetching all contest performances:", err);
    return [];
  }
}
