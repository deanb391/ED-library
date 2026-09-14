import prisma from "@/lib/prisma";
import { sendStreakReminderEmail } from "@/lib/email/events";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function sendDailyStreakReminders(): Promise<{ success: boolean; count: number }> {
  try {
    const today = todayStr();

    const contributorsList = await prisma.contributor.findMany({
      where: { status: "live" },
    });

    let emailsSent = 0;

    for (const contributor of contributorsList) {
      let lastUploadDate = "";
      let currentStreak = 0;
      
      try {
        const streakDoc = await prisma.streak.findFirst({
          where: { contributorId: contributor.id },
        });

        if (streakDoc) {
          lastUploadDate = streakDoc.lastUploadDate ? String(streakDoc.lastUploadDate).slice(0, 10) : "";
          currentStreak = streakDoc.currentStreak || 0;
        }
      } catch (err) {
        console.error(`[Reminders Service] Failed to fetch streak for contributor ${contributor.id}:`, err);
      }

      if (lastUploadDate === today) {
        continue;
      }

      try {
        const userId = contributor.userId;
        if (!userId) continue;

        const userDoc = await prisma.user.findUnique({ where: { id: userId } });
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
        console.error(`[Reminders Service] Failed to get user/send email for contributor ${contributor.id}:`, err);
      }
    }

    return { success: true, count: emailsSent };
  } catch (error) {
    console.error("[Reminders Service] sendDailyStreakReminders failed:", error);
    return { success: false, count: 0 };
  }
}
