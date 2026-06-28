import { ID, Query } from "appwrite";
import { databases } from "@/lib/appwrite/server";

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



    return res.documents[0] as unknown as ContestPerformance;
  } catch (err) {
    console.error("Error fetching contest performance:", err);
    return null;
  }
}

export async function updateContestPerformanceService(
  performanceId: string,
  updates: Partial<ContestPerformance>
): Promise<ContestPerformance> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    CONTEST_PERFORMANCE_COLLECTION,
    performanceId,
    updates
  );

  return doc as unknown as ContestPerformance;
}

export async function fetchAllContestPerformancesService(): Promise<ContestPerformance[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      CONTEST_PERFORMANCE_COLLECTION,
      [Query.limit(500)]
    );
    return res.documents as unknown as ContestPerformance[];
  } catch (err) {
    console.error("Error fetching all contest performances:", err);
    return [];
  }
}
