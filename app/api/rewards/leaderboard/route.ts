// app/api/rewards/leaderboard/route.ts — Leaderboard API

import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/services/leaderboard.service";

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");

  try {
    const entries = await getLeaderboard(limit, offset);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[Leaderboard API] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
