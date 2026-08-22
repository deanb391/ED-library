import { NextResponse } from "next/server";
import { fetchPopularCoursesService } from "@/lib/services/course.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 10);
  const offset = Number(searchParams.get("offset") || 0);

  const courses = await fetchPopularCoursesService(limit, offset);

  return NextResponse.json(courses);
}