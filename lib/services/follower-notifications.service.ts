import prisma from "@/lib/prisma";
import { 
  sendNewPostFollowersEmail, 
  sendNewCourseFollowersEmail 
} from "@/lib/email/events";

export async function notifyFollowersOfPost(
  contributorId: string,
  courseTitle: string,
  noteDescription: string
): Promise<void> {
  try {
    const contributor = await prisma.contributor.findUnique({
      where: { id: contributorId },
    });

    if (!contributor) return;

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

    const followers = await prisma.user.findMany({
      where: { id: { in: followersIds } },
    });

    for (const userDoc of followers) {
      if (userDoc?.email) {
        sendNewPostFollowersEmail(
          userDoc.email,
          contributor.username || "Contributor",
          courseTitle,
          noteDescription
        );
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
    const contributor = await prisma.contributor.findUnique({
      where: { id: contributorId },
    });

    if (!contributor) return;

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

    const followers = await prisma.user.findMany({
      where: { id: { in: followersIds } },
    });

    for (const userDoc of followers) {
      if (userDoc?.email) {
        sendNewCourseFollowersEmail(
          userDoc.email,
          contributor.username || "Contributor",
          courseTitle,
          courseDescription
        );
      }
    }
  } catch (error) {
    console.error("[Follower Notification] notifyFollowersOfCourse failed:", error);
  }
}
