import { NextRequest, NextResponse } from "next/server";
import { deleteCourseService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { courseId } = await req.json();

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const result = await deleteCourseService(courseId);

  return NextResponse.json(result);
}
