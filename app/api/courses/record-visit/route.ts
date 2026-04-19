import { NextRequest, NextResponse } from "next/server";
import { recordCourseVisitService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { courseId, userId } = await req.json();

  if (!courseId || !userId) {
    return NextResponse.json(
      { error: "courseId and userId are required" },
      { status: 400 }
    );
  }

  try {
    await recordCourseVisitService(courseId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RECORD COURSE VISIT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to record course visit" },
      { status: 500 }
    );
  }
}