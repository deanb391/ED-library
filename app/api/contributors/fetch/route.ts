import { NextRequest, NextResponse } from "next/server";
import { fetchContributorsService } from "@/lib/services/contributors.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("status");
  const limit = Number(searchParams.get("limit") ?? 5);
  const cursor = searchParams.get("cursor") || undefined;
  const search = searchParams.get("search") || undefined;


  const safeLimit = Number.isNaN(limit) || limit <= 0 ? 5 : limit;

  try {
    const response = await fetchContributorsService( type ? type : "", safeLimit, cursor, search);
    return NextResponse.json(response);
  } catch (error) {
    console.error("FETCH REVIEWS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
