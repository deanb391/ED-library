import { NextRequest, NextResponse } from "next/server";
import { fetchCoursesByAdminService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const courses = await fetchCoursesByAdminService(userId);

  return NextResponse.json(courses);
}
