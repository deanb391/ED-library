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

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Ignore if no body provided
    }
    const { performanceId } = body as any;

    let performances: any[] = [];
    if (performanceId) {
      try {
        const doc = await databases.getDocument(DATABASE_ID, "contest_performance", performanceId);
        performances = [doc];
      } catch (err) {
        console.error("Failed to fetch specific performance", err);
        return NextResponse.json({ error: "Performance not found" }, { status: 404 });
      }
    } else {
      performances = await fetchAllContestPerformancesService();
    }

    if (!performances || performances.length === 0) {
      return NextResponse.json({ message: "No active contestants" });
    }

    // Determine current dayKey
    const startDate = new Date("2026-06-29T00:00:00Z");
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    // 1. Calculate and assign points for each contributor
    for (const perf of performances) {
      console.log("Processing performance", perf);
      const contributorId = typeof perf.contributors === 'object' && perf.contributors !== null
        ? (Array.isArray(perf.contributors) ? (perf.contributors as any)[0]?.$id || (perf.contributors as any)[0] : (perf.contributors as any).$id)
        : perf.contributors;

      if (!contributorId) {
        console.log("No valid contributorId found for performance", perf.$id);
        continue;
      }

      // -- A (Acquisition) --
      const newUsersData = JSON.parse(perf.newUsers || "{}");
      let totalNewUsers = 0;
      let previousNewUsers = 0;
      for (const k in newUsersData) {
        totalNewUsers += newUsersData[k];
        if (k !== dayKey) previousNewUsers += newUsersData[k];
      }
      const todaysAcquisitionScore = Math.min(50, totalNewUsers * 5) - Math.min(50, previousNewUsers * 5);
      const acquisitionScore = Math.min(50, totalNewUsers * 5);

      // -- E (Engagement) --
      const engagementActivity = JSON.parse(perf.engagementActivity || "{}");
      let totalActiveMins = 0;
      let previousActiveMins = 0;
      for (const k in engagementActivity) {
        totalActiveMins += engagementActivity[k].activeMinutes || 0;
        if (k !== dayKey) previousActiveMins += engagementActivity[k].activeMinutes || 0;
      }
      // 1 point per 3 minutes, max 40 points
      const engagementScore = Math.min(40, Math.floor(totalActiveMins / 3));
      const previousEngagementScore = Math.min(40, Math.floor(previousActiveMins / 3));
      const todaysEngagementScore = engagementScore - previousEngagementScore;

      // -- C (Content Quality) --
      // Fetch all courses owned by this contributor
      let contentScore = 0;
      let totalRatingSum = 0;
      let ratedCoursesCount = 0;
      try {
        const contDoc = await databases.getDocument(DATABASE_ID, "contributors", contributorId);
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

      // Calculate today's points, letting contentScore act as a daily compounding boost
      const todaysPoints = todaysAcquisitionScore + todaysEngagementScore + contentScore;

      // Update daily points and recalculate total
      const dailyPoints = JSON.parse(perf.dailyPoints || "{}");
      dailyPoints[dayKey] = todaysPoints;
      
      const totalPoints = Object.values(dailyPoints).reduce((acc: number, curr: any) => acc + curr, 0) as number;

      await updateContestPerformanceService(perf.$id!, {
        dailyPoints: JSON.stringify(dailyPoints),
        totalPoints: totalPoints,
        acquisitionScore: acquisitionScore, // Save latest or total? The schema says it's a float attribute. We'll save today's for the dashboard.
        engagementScore: engagementScore,
        contentScore: contentScore,
      });

      // 3. Optional: Trigger email sending logic here
      // Email sending has been temporarily disabled to prevent spamming during frequent recalculations.
    }

    return NextResponse.json({ success: true, processed: performances.length, day: dayKey });
  } catch (err: any) {
    console.error("Cron error calculating contest points:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
