import { NextRequest, NextResponse } from "next/server";
import { fetchCourseByIdService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await fetchCourseByIdService(courseId);

  return NextResponse.json(course);
}
