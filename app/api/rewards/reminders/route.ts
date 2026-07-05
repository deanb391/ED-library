// app/api/rewards/reminders/route.ts — Daily reminder cron
import { NextRequest, NextResponse } from "next/server";
import { sendDailyStreakReminders } from "@/lib/services/reminders.service";

/**
 * POST — Protected cron endpoint to send streak reminders.
 * Call this once daily via external scheduler.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendDailyStreakReminders();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[StreakReminders Cron] error:", err);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
