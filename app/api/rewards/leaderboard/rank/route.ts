// app/api/rewards/leaderboard/rank/route.ts — Contributor rank lookup

import { NextRequest, NextResponse } from "next/server";
import { getContributorRank } from "@/lib/services/leaderboard.service";

export async function GET(req: NextRequest) {
  const contributorId = req.nextUrl.searchParams.get("contributorId");

  if (!contributorId) {
    return NextResponse.json({ error: "Missing contributorId" }, { status: 400 });
  }

  try {
    const rankData = await getContributorRank(contributorId);
    return NextResponse.json(rankData || { rank: null, uploadCount: 0 });
  } catch (err) {
    console.error("[Rank API] error:", err);
    return NextResponse.json({ error: "Failed to get rank" }, { status: 500 });
  }
}
