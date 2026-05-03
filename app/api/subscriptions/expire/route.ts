import { NextResponse } from "next/server";
import { expireSubscriptionsCronService } from "@/lib/services/subscriptions.service";

export async function POST(request: Request) {
  // Protect with a secret so only internal/scheduler can call this
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredCount = await expireSubscriptionsCronService();
    return NextResponse.json({ success: true, expired: expiredCount });
  } catch (error) {
    console.error("Subscription expiry cron error:", error);
    return NextResponse.json(
      { error: "Failed to expire subscriptions" },
      { status: 500 }
    );
  }
}
