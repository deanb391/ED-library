import { NextRequest, NextResponse } from "next/server";
import { fetchForYouCoursesService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { user } = await req.json();

  if (!user) {
    return NextResponse.json({ error: "user is required" }, { status: 400 });
  }

  const result = await fetchForYouCoursesService(user);

  return NextResponse.json(result);
}