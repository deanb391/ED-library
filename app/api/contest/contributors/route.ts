import { NextRequest, NextResponse } from "next/server";
import { fetchContestContributorsService } from "@/lib/services/contributors.service";
import { fetchAllContestPerformancesService } from "@/lib/services/contest_performance.service";

export async function GET(req: NextRequest) {
  try {
    const contributors = await fetchContestContributorsService();
    const performances = await fetchAllContestPerformancesService();

    const leaderboard = contributors.map(contributor => {
      const perf = performances.find(p => {
        const pContId = typeof p.contributors === 'object' && p.contributors !== null
          ? (Array.isArray(p.contributors) ? p.contributors[0]?.$id || p.contributors[0] : (p.contributors as any).$id)
          : p.contributors;
        return pContId === contributor.$id;
      });
      return {
        ...contributor,
        totalPoints: perf?.totalPoints || 0
      };
    });

    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({ success: true, contributors: leaderboard });
  } catch (error) {
    console.error("FETCH CONTEST CONTRIBUTORS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch contest contributors" },
      { status: 500 }
    );
  }
}
