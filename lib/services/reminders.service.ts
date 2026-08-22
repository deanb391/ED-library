import { databases } from "@/lib/appwrite/server";
import { Query } from "appwrite";
import { sendStreakReminderEmail } from "@/lib/email/events";

const DATABASE_ID = "69617e75000c6c010a75";
const CONTRIBUTORS_COLLECTION = "contributors";
const STREAKS_COLLECTION = "streaks";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function sendDailyStreakReminders(): Promise<{ success: boolean; count: number }> {
  try {
    const today = todayStr();
    let contributorsList: any[] = [];
    let offset = 0;
    const batchSize = 100;

    // 1. Fetch all live contributors
    while (true) {
      const res = await databases.listDocuments(
        DATABASE_ID,
        CONTRIBUTORS_COLLECTION,
        [
          Query.equal("status", "live"),
          Query.limit(batchSize),
          Query.offset(offset),
        ]
      );
      contributorsList = [...contributorsList, ...res.documents];
      if (res.documents.length < batchSize) break;
      offset += batchSize;
    }

    let emailsSent = 0;

    for (const contributor of contributorsList) {
      // 2. Fetch their streak record
      let lastUploadDate = "";
      let currentStreak = 0;
      
      try {
        const streakRes = await databases.listDocuments(
          DATABASE_ID,
          STREAKS_COLLECTION,
          [Query.equal("contributors", contributor.$id), Query.limit(1)]
        );

        if (streakRes.documents.length > 0) {
          const doc = streakRes.documents[0];
          lastUploadDate = doc.lastUploadDate || "";
          currentStreak = doc.currentStreak || 0;
        }
      } catch (err) {
        console.error(`[Reminders Service] Failed to fetch streak for contributor ${contributor.$id}:`, err);
      }

      // If they already uploaded today, skip reminder
      if (lastUploadDate === today) {
        continue;
      }

      // 3. Fetch their user account email
      try {
        const userId = contributor.user?.$id || contributor.user;
        if (!userId) continue;

        const userDoc = await databases.getDocument(DATABASE_ID, "user", userId);
        if (userDoc && userDoc.email) {
          const hasStreak = currentStreak > 0;
          sendStreakReminderEmail(
            userDoc.email,
            contributor.username || "Contributor",
            currentStreak,
            hasStreak
          );
          emailsSent++;
        }
      } catch (err) {
        console.error(`[Reminders Service] Failed to get user/send email for contributor ${contributor.$id}:`, err);
      }
    }

    return { success: true, count: emailsSent };
  } catch (error) {
    console.error("[Reminders Service] sendDailyStreakReminders failed:", error);
    return { success: false, count: 0 };
  }
}
