import { NextRequest, NextResponse } from "next/server";
import { fetchRecentCoursesService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const courses = await fetchRecentCoursesService();

  return NextResponse.json(courses);
}