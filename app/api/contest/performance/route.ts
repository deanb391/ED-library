import { NextResponse } from "next/server";
import { getContestPerformanceByContributorService } from "@/lib/services/contest_performance.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contributorId = searchParams.get("contributorId");

    if (!contributorId) {
      return NextResponse.json({ error: "Missing contributorId" }, { status: 400 });
    }

    const performance = await getContestPerformanceByContributorService(contributorId);
    
    if (!performance) {
      return NextResponse.json({ performance: null });
    }

    return NextResponse.json({ performance });
  } catch (err: any) {
    console.error("API error fetching contest performance:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
