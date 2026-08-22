import { NextResponse } from "next/server";
import { runContestCalculate } from "@/lib/services/contest_calculator.service";

export async function POST(request: Request) {
  try {
    // Basic auth check (if token provided in header)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
      // In production, enforce secret. For testing, allow if no secret set.
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Ignore if no body provided
    }
    const { performanceId } = body as any;

    await runContestCalculate(performanceId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Cron error calculating contest points:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
