import { NextRequest, NextResponse } from "next/server";
import { fetchAllPostsService } from "@/lib/services/course.service";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const res = await fetchAllPostsService(courseId);

  return NextResponse.json(res);
}