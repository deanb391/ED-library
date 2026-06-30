import { NextResponse } from "next/server";
import { fetchAllContestPerformancesService } from "@/lib/services/contest_performance.service";

export async function GET() {
  try {
    const performances = await fetchAllContestPerformancesService();
    
    let totalContributors = 0;
    let totalPoints = 0;
    let qualifiedPoints = 0;

    if (performances && performances.length > 0) {
      totalContributors = performances.length;
      performances.forEach((perf) => {
        const points = perf.totalPoints || 0;
        totalPoints += points;
        // Check qualification (minimum 100 points)
        if (points >= 100) {
          qualifiedPoints += points;
        }
      });
    }

    const maxPossiblePoints = totalContributors * 1500;
    
    // Unlocked pool formula: (Total Points Earned / Maximum Possible Points) * 100,000
    let unlockedPool = 0;
    if (maxPossiblePoints > 0) {
      const unlockRatio = Math.min(1, totalPoints / maxPossiblePoints);
      unlockedPool = unlockRatio * 100000;
    }

    return NextResponse.json({
      totalContributors,
      totalPoints,
      qualifiedPoints,
      maxPossiblePoints,
      unlockedPool,
    });
  } catch (err: any) {
    console.error("API error fetching contest stats:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
