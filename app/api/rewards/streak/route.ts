// app/api/rewards/streak/route.ts — Streak API

import { NextRequest, NextResponse } from "next/server";
import { recordUploadStreak, getStreakData } from "@/lib/services/streak.service";

export async function GET(req: NextRequest) {
  const contributorId = req.nextUrl.searchParams.get("contributorId");

  if (!contributorId) {
    return NextResponse.json({ error: "Missing contributorId" }, { status: 400 });
  }

  try {
    const streak = await getStreakData(contributorId);
    return NextResponse.json({ streak });
  } catch (err) {
    console.error("[Streak API] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { contributorId, userId, joinedDate } = await req.json();

  if (!contributorId || !userId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await recordUploadStreak(contributorId, userId, joinedDate || "");
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Streak API] POST error:", err);
    return NextResponse.json({ error: "Failed to record streak" }, { status: 500 });
  }
}
