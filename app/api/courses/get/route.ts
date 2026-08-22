import { NextRequest, NextResponse } from "next/server";
import { fetchCourseByIdService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  try {
    const course = await fetchCourseByIdService(courseId);
    return NextResponse.json(course);
  } catch (error: any) {
    console.error("GET COURSE API ERROR:", error);
    // If Appwrite returns a 404, we should return a 404
    if (error?.code === 404) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
