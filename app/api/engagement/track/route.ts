import { NextRequest, NextResponse } from "next/server";
import { getContestPerformanceByContributorService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";


export async function POST(req: NextRequest) {
  try {
    const { contributorId, activeTimeMs, userId } = await req.json();

    if (!contributorId || !activeTimeMs || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const performance = await getContestPerformanceByContributorService(contributorId);
    if (!performance) {
      return NextResponse.json({ error: "Contest performance not found" }, { status: 404 });
    }

    // Get current date key, e.g., "day 1" based on contest start
    const startDate = new Date("2026-06-27T00:00:00Z");
    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
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
    // 1 point per 10 minutes of active users
    // This is aggregated across all days? Or daily? The score is daily points or total points?
    // Based on the user's instructions: "Let is be 1 point per 10 minutes of active users"
    // Wait, the score `engagementScore` is cumulative or daily? In contest performance, we have `engagementScore`
    // Let's calculate total engagement score across all days.
    let totalActiveMinutes = 0;
    for (const key in engagementActivity) {
      totalActiveMinutes += engagementActivity[key].activeMinutes;
    }

    // 1 point per 10 minutes
    const calculatedEngagementScore = Math.floor(totalActiveMinutes / 10);
    const cappedEngagementScore = Math.min(calculatedEngagementScore, 40);

    // Update in DB
    await updateContestPerformanceService(performance.$id!, {
      engagementActivity: JSON.stringify(engagementActivity),
      engagementScore: cappedEngagementScore,
    });

    return NextResponse.json({ success: true, engagementScore: cappedEngagementScore });
  } catch (error) {
    console.error("Error tracking engagement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
