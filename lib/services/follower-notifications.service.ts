import { databases } from "@/lib/appwrite/server";
import { 
  sendNewPostFollowersEmail, 
  sendNewCourseFollowersEmail 
} from "@/lib/email/events";

const DATABASE_ID = "69617e75000c6c010a75";
const CONTRIBUTORS_COLLECTION = "contributors";

export async function notifyFollowersOfPost(
  contributorId: string,
  courseTitle: string,
  noteDescription: string
): Promise<void> {
  try {
    const contributor = await databases.getDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId
    );

    const raw = contributor.followersIds;
    if (!raw) return;

    let followersIds: string[] = [];
    try {
      followersIds = JSON.parse(raw);
      if (!Array.isArray(followersIds)) return;
    } catch {
      return;
    }

    if (followersIds.length === 0) return;

    // Send email to each follower
    for (const userId of followersIds) {
      try {
        const userDoc = await databases.getDocument(DATABASE_ID, "user", userId);
        if (userDoc?.email) {
          sendNewPostFollowersEmail(
            userDoc.email,
            contributor.username || "Contributor",
            courseTitle,
            noteDescription
          );
        }
      } catch (err) {
        console.error(`[Follower Notification] Failed to notify user ${userId} of new post:`, err);
      }
    }
  } catch (error) {
    console.error("[Follower Notification] notifyFollowersOfPost failed:", error);
  }
}

export async function notifyFollowersOfCourse(
  contributorId: string,
  courseTitle: string,
  courseDescription: string
): Promise<void> {
  try {
    const contributor = await databases.getDocument(
      DATABASE_ID,
      CONTRIBUTORS_COLLECTION,
      contributorId
    );

    const raw = contributor.followersIds;
    if (!raw) return;

    let followersIds: string[] = [];
    try {
      followersIds = JSON.parse(raw);
      if (!Array.isArray(followersIds)) return;
    } catch {
      return;
    }

    if (followersIds.length === 0) return;

    // Send email to each follower
    for (const userId of followersIds) {
      try {
        const userDoc = await databases.getDocument(DATABASE_ID, "user", userId);
        if (userDoc?.email) {
          sendNewCourseFollowersEmail(
            userDoc.email,
            contributor.username || "Contributor",
            courseTitle,
            courseDescription
          );
        }
      } catch (err) {
        console.error(`[Follower Notification] Failed to notify user ${userId} of new course:`, err);
      }
    }
  } catch (error) {
    console.error("[Follower Notification] notifyFollowersOfCourse failed:", error);
  }
}
