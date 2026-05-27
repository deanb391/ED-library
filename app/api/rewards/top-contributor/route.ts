// app/api/rewards/top-contributor/route.ts — Weekly cron + read current

import { NextRequest, NextResponse } from "next/server";
import {
  calculateTopContributor,
  getCurrentTopContributor,
} from "@/lib/services/weekly-awards.service";

/**
 * POST — Protected cron endpoint to calculate top contributor.
 * Call this every Saturday via external scheduler.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const award = await calculateTopContributor();
    return NextResponse.json({ success: true, award });
  } catch (err) {
    console.error("[TopContributor Cron] error:", err);
    return NextResponse.json(
      { error: "Failed to calculate top contributor" },
      { status: 500 }
    );
  }
}

/**
 * GET — Get the current top contributor for display.
 */
export async function GET() {
  try {
    const award = await getCurrentTopContributor();
    return NextResponse.json({ award });
  } catch (err) {
    console.error("[TopContributor API] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
