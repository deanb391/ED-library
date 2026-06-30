import { NextResponse } from "next/server";
import { getContestPerformanceByContributorService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";

export async function POST(req: Request) {
  try {
    const { contributorId } = await req.json();

    if (!contributorId) {
      return NextResponse.json({ error: "Contributor ID is required" }, { status: 400 });
    }

    const startDate = new Date("2026-06-29T12:00:00Z");
    if (new Date() < startDate) {
      return NextResponse.json({ success: true, message: "Contest not started yet" });
    }

    const performance = await getContestPerformanceByContributorService(contributorId);
    if (!performance) {
      return NextResponse.json({ error: "Performance not found" }, { status: 404 });
    }

    const startDateCal = new Date("2026-06-29T00:00:00Z");
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffTime = Math.max(0, today.getTime() - startDateCal.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const dayKey = `day ${dayNumber}`;

    const referralClicks = JSON.parse(performance.referralClicks || "{}");
    referralClicks[dayKey] = (referralClicks[dayKey] || 0) + 1;

    await updateContestPerformanceService(performance.$id!, {
      referralClicks: JSON.stringify(referralClicks)
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking referral click:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
