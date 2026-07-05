import { NextRequest, NextResponse } from "next/server";
import { advancedSearchCoursesService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const { department, level, session } = Object.fromEntries(req.nextUrl.searchParams.entries());

  const courses = await advancedSearchCoursesService({
    department,
    level,
    session,
  });

  return NextResponse.json(courses);
}
