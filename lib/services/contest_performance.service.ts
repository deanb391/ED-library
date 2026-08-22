import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";
import { getLfuCache, setLfuCache, invalidateLfuCache, clearLfuCacheNamespace } from "@/lib/lfu-cache";

const DATABASE_ID = "69617e75000c6c010a75";
const CONTEST_PERFORMANCE_COLLECTION = "contest_performance";

export type ContestPerformance = {
  $id?: string;
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

export async function createContestPerformanceService(contributorId: string): Promise<ContestPerformance> {
  const payload = {
    contributors: contributorId,
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
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    CONTEST_PERFORMANCE_COLLECTION,
    ID.unique(),
    payload
  );

  return doc as unknown as ContestPerformance;
}

export async function getContestPerformanceByContributorService(contributorId: string): Promise<ContestPerformance | null> {
  const cached = await getLfuCache<ContestPerformance>("performance:details", contributorId);
  if (cached) return cached;

  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTEST_PERFORMANCE_COLLECTION,
      [Query.equal("contributors", contributorId)]
    );

    if (res.documents.length === 0) {
      // Create it if it doesn't exist
      const newPerformance = await createContestPerformanceService(contributorId);
      return newPerformance;
    }



    const performance = res.documents[0] as unknown as ContestPerformance;
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
  try {
    const current = await databases.getDocument(DATABASE_ID, CONTEST_PERFORMANCE_COLLECTION, performanceId);
    if (current.contributors) {
      updates.contributors = typeof current.contributors === 'object' 
        ? (Array.isArray(current.contributors) ? current.contributors[0]?.$id : current.contributors.$id)
        : current.contributors;
    }
  } catch(e) {}
  
  const doc = await databases.updateDocument(
    DATABASE_ID,
    CONTEST_PERFORMANCE_COLLECTION,
    performanceId,
    updates
  );

  const contributorId = typeof doc.contributors === 'object' 
        ? (Array.isArray(doc.contributors) ? doc.contributors[0]?.$id : doc.contributors.$id)
        : doc.contributors;

  if (contributorId) {
    await invalidateLfuCache("performance:details", contributorId as string);
  }
  
  await clearLfuCacheNamespace("performance:lists");
  await clearLfuCacheNamespace("leaderboard:hydrated_lists");

  return doc as unknown as ContestPerformance;
}

export async function fetchAllContestPerformancesService(): Promise<ContestPerformance[]> {
  const cached = await getLfuCache<ContestPerformance[]>("performance:lists", "all");
  if (cached) return cached;

  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTEST_PERFORMANCE_COLLECTION,
      [Query.limit(500)]
    );
    const performances = res.documents as unknown as ContestPerformance[];
    await setLfuCache("performance:lists", "all", performances, 20);
    return performances;
  } catch (err) {
    console.error("Error fetching all contest performances:", err);
    return [];
  }
}
