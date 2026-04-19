import { NextRequest, NextResponse } from "next/server";
import { fetchReviewsService } from "@/lib/services/review.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const courseId = searchParams.get("courseId");
  const limit = Number(searchParams.get("limit") ?? 5);
  const cursor = searchParams.get("cursor") || undefined;

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  const safeLimit = Number.isNaN(limit) || limit <= 0 ? 5 : limit;

  try {
    const response = await fetchReviewsService(courseId, safeLimit, cursor);
    return NextResponse.json(response);
  } catch (error) {
    console.error("FETCH REVIEWS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
