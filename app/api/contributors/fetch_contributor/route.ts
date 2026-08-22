import { NextRequest, NextResponse } from "next/server";
import { fetchContributorService } from "@/lib/services/contributors.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contributorId = searchParams.get("contributorId");

    if (!contributorId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const contributor = await fetchContributorService(contributorId);

    return NextResponse.json({ contributor });
  } catch (err) {
    console.error("GET /api/contributors/me ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch contributor status" },
      { status: 500 }
    );
  }
}
