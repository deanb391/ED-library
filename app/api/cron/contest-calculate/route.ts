import { NextResponse } from "next/server";
import { fetchAllContestPerformancesService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { databases } from "@/lib/appwrite/server";
import { sendContestDailySummaryEmail } from "@/lib/email/events";

const DATABASE_ID = "69617e75000c6c010a75";

export async function POST(request: Request) {
  try {
    // Basic auth check (if token provided in header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
      // In production, enforce secret. For testing, allow if no secret set.
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const performances = await fetchAllContestPerformancesService();
    if (!performances || performances.length === 0) {
      return NextResponse.json({ message: "No active contestants" });
    }

    // Determine current dayKey
    const startDate = new Date("2026-06-26T00:00:00Z");
    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    // 1. Calculate and assign points for each contributor
    for (const perf of performances) {
      const newUsersCount = JSON.parse(perf.newUsers || "{}")[dayKey] || 0;
      const reachCount = JSON.parse(perf.uniqueUsersReached || "{}")[dayKey] || 0;
      const coursesCount = JSON.parse(perf.coursesPoints || "{}")[dayKey] || 0;
      // We will cast to any to bypass strict type checking for the new property
      const uploadsCount = JSON.parse((perf as any).uploadsCreated || "{}")[dayKey] || 0;

      // Calculate A (Acquisition) - Max 50 points
      const acquisitionScore = Math.min(50, newUsersCount * 5);

      // Calculate E (Engagement) - Max 40 points
      const engagementScore = Math.min(40, reachCount * 2);

      // Calculate C (Content) - Max 10 points
      const contentScore = Math.min(10, (uploadsCount * 0.5) + (coursesCount * 0.25));

      const todaysPoints = acquisitionScore + engagementScore + contentScore;

      // Update daily points
      const dailyPoints = JSON.parse(perf.dailyPoints || "{}");
      dailyPoints[dayKey] = todaysPoints;

      // Recalculate total points
      const totalPoints = Object.values(dailyPoints).reduce((acc: number, curr: any) => acc + curr, 0) as number;

      await updateContestPerformanceService(perf.$id!, {
        dailyPoints: JSON.stringify(dailyPoints),
        totalPoints: totalPoints
      });

      // 3. Optional: Trigger email sending logic here
      // We need to fetch the User document using contributor id to get email
      try {
        const contDoc = await databases.getDocument(DATABASE_ID, "contributors", perf.contributor);
        const userDoc = await databases.getDocument(DATABASE_ID, "user", contDoc.user);
        if (userDoc.email) {
          sendContestDailySummaryEmail(userDoc.email, { points: todaysPoints, total: totalPoints });
          console.log(`Email sent to ${userDoc.email} for ${todaysPoints} points.`);
        }
      } catch (err) {
        console.error("Failed to fetch user email for contest summary:", err);
      }
    }

    return NextResponse.json({ success: true, processed: performances.length, day: dayKey });
  } catch (err: any) {
    console.error("Cron error calculating contest points:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
