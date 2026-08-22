import { NextRequest, NextResponse } from "next/server";
import { updateCourseService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { courseId, data } = await req.json();

  if (!courseId || !data) {
    return NextResponse.json({ error: "courseId and data are required" }, { status: 400 });
  }

  const updated = await updateCourseService(courseId, data);

  return NextResponse.json(updated);
}
