import { NextResponse } from "next/server";
import { fetchAllContestPerformancesService } from "@/lib/services/contest_performance.service";

export async function GET() {
  try {
    const performances = await fetchAllContestPerformancesService();
    return NextResponse.json({ performances });
  } catch (err: any) {
    console.error("API error fetching contest performances:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
