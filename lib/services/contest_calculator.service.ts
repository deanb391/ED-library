import prisma from "@/lib/prisma";
import { fetchAllContestPerformancesService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";

export async function runContestCalculate(performanceId?: string) {
  try {
    let performances: any[] = [];
    if (performanceId) {
      try {
        const doc = await prisma.contestPerformance.findUnique({ where: { id: performanceId } });
        if (doc) performances = [doc];
      } catch (err) {
        console.error("Failed to fetch specific performance", err);
        return;
      }
    } else {
      performances = await fetchAllContestPerformancesService();
    }

    if (!performances || performances.length === 0) {
      return;
    }

    // Determine current dayKey
    const CONTEST_DURATION_DAYS = 15;
    const startDate = new Date("2026-06-29T00:00:00Z");
    const endDate = new Date(startDate.getTime() + CONTEST_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // If the contest has ended, do nothing.
    if (today >= endDate) {
      console.log("Contest has ended. Skipping score calculation.");
      return true;
    }

    const diffTime = Math.max(0, today.getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    // 1. Calculate and assign points for each contributor
    for (const perf of performances) {
      const contributorId = perf.contributorId || perf.contributors;

      if (!contributorId) {
        console.log("No valid contributorId found for performance", perf.id || perf.$id);
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
      const engagementScore = Math.min(40, Math.floor(totalActiveMins / 3));
      const previousEngagementScore = Math.min(40, Math.floor(previousActiveMins / 3));
      const todaysEngagementScore = engagementScore - previousEngagementScore;

      // -- C (Content Quality) --
      let contentScore = 0;
      let totalRatingSum = 0;
      let ratedCoursesCount = 0;
      try {
        const contDoc = await prisma.contributor.findUnique({ where: { id: contributorId } });
        if (contDoc) {
          const userId = contDoc.userId || (contDoc as any).user;
          const courses = userId ? await prisma.course.findMany({
            where: { userId },
          }) : [];

          for (const course of courses) {
            const reviews = await prisma.courseReviewAndRating.findMany({
              where: { courseId: course.id },
            });

            if (reviews.length > 0) {
              const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
              const avg = sum / reviews.length;
              totalRatingSum += avg;
              ratedCoursesCount++;
            }
          }
        }
      } catch (err) {
        console.error("Error calculating content score:", err);
      }

      if (ratedCoursesCount > 0) {
        const overallAverage = totalRatingSum / ratedCoursesCount;
        contentScore = Math.min(10, overallAverage * 2);
      }

      const todaysPoints = todaysAcquisitionScore + todaysEngagementScore + contentScore;

      const dailyPoints = JSON.parse(perf.dailyPoints || "{}");
      dailyPoints[dayKey] = todaysPoints;

      const totalPoints = Object.values(dailyPoints).reduce((acc: number, curr: any) => acc + curr, 0) as number;

      await updateContestPerformanceService(perf.id || perf.$id!, {
        dailyPoints: JSON.stringify(dailyPoints),
        totalPoints: totalPoints,
        acquisitionScore: acquisitionScore,
        engagementScore: engagementScore,
        contentScore: contentScore,
      });
    }

    return true;
  } catch (err: any) {
    console.error("Cron error calculating contest points:", err);
    return false;
  }
}
