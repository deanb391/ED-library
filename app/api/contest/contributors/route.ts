import { NextRequest, NextResponse } from "next/server";
import { fetchContestContributorsService } from "@/lib/services/contributors.service";

export async function GET(req: NextRequest) {
  try {
    const response = await fetchContestContributorsService();
    return NextResponse.json({ success: true, contributors: response });
  } catch (error) {
    console.error("FETCH CONTEST CONTRIBUTORS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch contest contributors" },
      { status: 500 }
    );
  }
}
