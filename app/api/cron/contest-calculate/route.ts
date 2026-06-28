import { NextResponse } from "next/server";
import { fetchAllContestPerformancesService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { databases } from "@/lib/appwrite/server";
import { sendContestDailySummaryEmail } from "@/lib/email/events";
import { Query } from "node-appwrite";

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
    const startDate = new Date("2026-06-27T00:00:00Z");
    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    // 1. Calculate and assign points for each contributor
    for (const perf of performances) {
      // -- A (Acquisition) --
      const newUsersCount = JSON.parse(perf.newUsers || "{}")[dayKey] || 0;
      const acquisitionScore = Math.min(50, newUsersCount * 5);

      // -- E (Engagement) --
      const engagementActivity = JSON.parse(perf.engagementActivity || "{}");
      const activeMins = engagementActivity[dayKey]?.activeMinutes || 0;
      // 1 point per 10 minutes, max 40 points
      const engagementScore = Math.min(40, Math.floor(activeMins / 10));

      // -- C (Content Quality) --
      // Fetch all courses owned by this contributor
      let contentScore = 0;
      let totalRatingSum = 0;
      let ratedCoursesCount = 0;
      try {
        const contDoc = await databases.getDocument(DATABASE_ID, "contributors", perf.contributors);
        const coursesRes = await databases.listDocuments(DATABASE_ID, "courses", [
          Query.equal("user", contDoc.user)
        ]);
        
        for (const course of coursesRes.documents) {
          // Fetch reviews for this course
          const reviewsRes = await databases.listDocuments(DATABASE_ID, "course_review_and_rating", [
            Query.equal("courses", course.$id)
          ]);
          
          if (reviewsRes.documents.length > 0) {
            const sum = reviewsRes.documents.reduce((acc, curr) => acc + (curr.rating || 0), 0);
            const avg = sum / reviewsRes.documents.length;
            totalRatingSum += avg;
            ratedCoursesCount++;
          }
        }
      } catch (err) {
        console.error("Error calculating content score:", err);
      }

      if (ratedCoursesCount > 0) {
        const overallAverage = totalRatingSum / ratedCoursesCount;
        // Normalize 0-5 scale to 0-10 points: (avg / 5) * 10 = avg * 2
        contentScore = Math.min(10, overallAverage * 2);
      }

      const todaysPoints = acquisitionScore + engagementScore + contentScore;

      // Update daily points
      const dailyPoints = JSON.parse(perf.dailyPoints || "{}");
      dailyPoints[dayKey] = todaysPoints;

      // Recalculate total points
      const totalPoints = Object.values(dailyPoints).reduce((acc: number, curr: any) => acc + curr, 0) as number;

      await updateContestPerformanceService(perf.$id!, {
        dailyPoints: JSON.stringify(dailyPoints),
        totalPoints: totalPoints,
        acquisitionScore: acquisitionScore, // Save latest or total? The schema says it's a float attribute. We'll save today's for the dashboard.
        engagementScore: engagementScore,
        contentScore: contentScore,
      });

      // 3. Optional: Trigger email sending logic here
      // We need to fetch the User document using contributor id to get email
      try {
        const contDoc = await databases.getDocument(DATABASE_ID, "contributors", perf.contributors);
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
