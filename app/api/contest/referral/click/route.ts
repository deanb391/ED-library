import { NextResponse } from "next/server";
import { getContestPerformanceByContributorService, updateContestPerformanceService } from "@/lib/services/contest_performance.service";

export async function POST(req: Request) {
  try {
    const { contributorId } = await req.json();

    if (!contributorId) {
      return NextResponse.json({ error: "Contributor ID is required" }, { status: 400 });
    }

    const startDate = new Date("2026-06-26T00:00:00Z");
    if (new Date() < startDate) {
      return NextResponse.json({ success: true, message: "Contest not started yet" });
    }

    const performance = await getContestPerformanceByContributorService(contributorId);
    if (!performance) {
      return NextResponse.json({ error: "Performance not found" }, { status: 404 });
    }

    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
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
