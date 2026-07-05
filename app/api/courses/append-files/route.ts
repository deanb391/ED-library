// app/api/courses/append-files/route.ts

import { NextRequest, NextResponse } from "next/server";
import { appendFilesToCourseService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { courseId, urls } = await req.json();

  const res = await appendFilesToCourseService(courseId, urls);

  return NextResponse.json(res);
}