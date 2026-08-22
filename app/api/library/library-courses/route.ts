import { NextResponse } from "next/server";
import { fetchLibraryCoursesService } from "@/lib/services/library.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  const courses = await fetchLibraryCoursesService(user_id);

  return NextResponse.json({ courses: courses ?? [] });
}