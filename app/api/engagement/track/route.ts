import { NextRequest, NextResponse } from "next/server";
import { getContestPerformanceByContributorService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { runContestCalculate } from "@/lib/services/contest_calculator.service";

export async function POST(req: NextRequest) {
  try {
    const { contributorId, activeTimeMs, userId } = await req.json();

    if (!contributorId || !activeTimeMs || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // contributorId passed from client is actually the user ID of the course creator
    const contributor = await getContributorByUserIdService(contributorId);
    if (!contributor) {
      return NextResponse.json({ error: "Course creator is not a contributor" }, { status: 404 });
    }

    const performance = await getContestPerformanceByContributorService(contributor.$id);
    if (!performance) {
      return NextResponse.json({ error: "Contest performance not found" }, { status: 404 });
    }

    // Get current date key, e.g., "day 1" based on contest start
    const CONTEST_DURATION_DAYS = 30;
    const startDate = new Date("2026-06-29T00:00:00Z");
    const endDate = new Date(startDate.getTime() + CONTEST_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // If the contest has ended, do not record engagement.
    if (today >= endDate) {
      return NextResponse.json({ success: false, message: "Contest has ended. Engagement not recorded." }, { status: 200 });
    }

    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    // Parse existing engagement activity
    const engagementActivity = JSON.parse(performance.engagementActivity || "{}");
    if (!engagementActivity[dayKey]) {
      engagementActivity[dayKey] = {
        activeMinutes: 0,
        visitors: []
      };
    }

    // Add active minutes (convert ms to minutes)
    const minutes = activeTimeMs / (1000 * 60);
    engagementActivity[dayKey].activeMinutes += minutes;

    // Add unique visitor
    if (!engagementActivity[dayKey].visitors.includes(userId)) {
      engagementActivity[dayKey].visitors.push(userId);
    }

    // Calculate Engagement Score (Max 40 points)
    // 1 point per 5 minutes of active users
    // This is aggregated across all days? Or daily? The score is daily points or total points?
    // Based on the user's instructions: "Let is be 1 point per 10 minutes of active users"
    // Wait, the score `engagementScore` is cumulative or daily? In contest performance, we have `engagementScore`
    // Let's calculate total engagement score across all days.
    let totalActiveMinutes = 0;
    for (const key in engagementActivity) {
      totalActiveMinutes += engagementActivity[key].activeMinutes;
    }

    // 1 point per 3 minutes
    const calculatedEngagementScore = Math.floor(totalActiveMinutes / 3);
    const cappedEngagementScore = Math.min(calculatedEngagementScore, 40);

    // Update in DB
    await updateContestPerformanceService(performance.$id!, {
      engagementActivity: JSON.stringify(engagementActivity),
      engagementScore: cappedEngagementScore,
    });

    // Trigger cron calculation synchronously via direct function call
    try {
      await runContestCalculate(performance.$id!);
    } catch (e) {
      console.error("Failed to trigger cron:", e);
    }

    return NextResponse.json({ success: true, engagementScore: cappedEngagementScore });
  } catch (error) {
    console.error("Error tracking engagement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
