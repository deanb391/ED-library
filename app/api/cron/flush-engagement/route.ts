import { NextResponse } from "next/server";
import { safeRedisOp } from "@/lib/redis";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { getContestPerformanceByContributorService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";
import { runContestCalculate } from "@/lib/services/contest_calculator.service";

export async function GET() {
  try {
    // 1. Pop all events from Redis
    const eventsStr = await safeRedisOp(async (client) => {
      // Use pipeline to get all elements and clear the list atomically
      const items = await client.lrange("engagement_events", 0, -1);
      if (items.length > 0) {
        await client.del("engagement_events");
      }
      return items;
    }, []);

    if (!eventsStr || eventsStr.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No events to flush" });
    }

    const events = eventsStr.map(e => JSON.parse(e));

    // 2. Group events by contributorId (which is the course author's userId)
    const grouped = events.reduce((acc, event) => {
      if (!acc[event.contributorId]) {
        acc[event.contributorId] = {
          activeTimeMs: 0,
          userIds: new Set<string>()
        };
      }
      acc[event.contributorId].activeTimeMs += event.activeTimeMs;
      acc[event.contributorId].userIds.add(event.userId);
      return acc;
    }, {} as Record<string, { activeTimeMs: number; userIds: Set<string> }>);

    // 3. Process each contributor
    const CONTEST_DURATION_DAYS = 30;
    const startDate = new Date("2026-06-29T00:00:00Z");
    const endDate = new Date(startDate.getTime() + CONTEST_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // If the contest has ended, stop processing engagement.
    if (today >= endDate) {
      return NextResponse.json({ success: true, processed: 0, message: "Contest has ended. No engagement recorded." });
    }

    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    for (const [contributorId, dataTyped] of Object.entries(grouped)) {
      const data = dataTyped as { activeTimeMs: number; userIds: Set<string> };
      const contributor = await getContributorByUserIdService(contributorId);
      if (!contributor) continue;

      const performance = await getContestPerformanceByContributorService(contributor.$id);
      if (!performance) continue;

      const engagementActivity = JSON.parse(performance.engagementActivity || "{}");
      if (!engagementActivity[dayKey]) {
        engagementActivity[dayKey] = {
          activeMinutes: 0,
          visitors: []
        };
      }

      // Add minutes
      const minutes = data.activeTimeMs / (1000 * 60);
      engagementActivity[dayKey].activeMinutes += minutes;

      // Add unique visitors
      data.userIds.forEach(userId => {
        if (!engagementActivity[dayKey].visitors.includes(userId)) {
          engagementActivity[dayKey].visitors.push(userId);
        }
      });

      // Recalculate score
      let totalActiveMinutes = 0;
      for (const key in engagementActivity) {
        totalActiveMinutes += engagementActivity[key].activeMinutes;
      }

      const calculatedEngagementScore = Math.floor(totalActiveMinutes / 3);
      const cappedEngagementScore = Math.min(calculatedEngagementScore, 40);

      // Update DB
      await updateContestPerformanceService(performance.$id!, {
        engagementActivity: JSON.stringify(engagementActivity),
        engagementScore: cappedEngagementScore,
      });

      // Run contest calculator
      try {
        await runContestCalculate(performance.$id!);
      } catch (e) {
        console.error(`Failed to trigger cron for ${performance.$id}:`, e);
      }
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    console.error("Error flushing engagement:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
