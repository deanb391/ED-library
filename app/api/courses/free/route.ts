import { NextResponse } from "next/server";
import { fetchFreeCoursesService } from "@/lib/services/course.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 10);
  const offset = Number(searchParams.get("offset") || 0);

  const courses = await fetchFreeCoursesService(limit, offset);

  return NextResponse.json(courses);
}