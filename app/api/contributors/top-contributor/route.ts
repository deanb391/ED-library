import { NextResponse } from "next/server";
import { fetchTopContributorsCoursesService } from "@/lib/services/contributors.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get("limit") || 10);
    const offset = Number(searchParams.get("offset") || 0);

    const contributor = await fetchTopContributorsCoursesService(limit, offset);

    return NextResponse.json(Array.isArray(contributor) ? contributor : []);
  } catch (err) {
    console.error("GET /api/contributors/top-contributor error:", err);
    return NextResponse.json([]);
  }
}