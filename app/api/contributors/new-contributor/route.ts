import { NextResponse } from "next/server";
import { fetchNewContributorsCoursesService } from "@/lib/services/contributors.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get("limit") || 10);
    const offset = Number(searchParams.get("offset") || 0);

    const contributor = await fetchNewContributorsCoursesService(limit, offset);

    return NextResponse.json(Array.isArray(contributor) ? contributor : []);
  } catch (err) {
    console.error("GET /api/contributors/new-contributor error:", err);
    return NextResponse.json([]);
  }
}
