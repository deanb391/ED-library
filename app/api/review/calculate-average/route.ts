import { NextRequest, NextResponse } from "next/server";
import { calculateCourseAverageRatingService } from "@/lib/services/review.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  try {
    const response = await calculateCourseAverageRatingService(courseId);
    return NextResponse.json(response);
  } catch (error) {
    console.error("CALCULATE AVERAGE RATING ERROR:", error);
    return NextResponse.json(
      { error: "Failed to calculate average rating" },
      { status: 500 }
    );
  }
}