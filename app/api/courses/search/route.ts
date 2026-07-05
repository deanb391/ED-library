// app/api/courses/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { searchCoursesService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q) return NextResponse.json([]);

  const res = await searchCoursesService(q);

  return NextResponse.json(res);
}