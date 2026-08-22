import { NextResponse } from "next/server";
import { fetchNewContributorsCoursesService } from "@/lib/services/contributors.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") || 10);
  const offset = Number(searchParams.get("offset") || 0);

  const contributor = await fetchNewContributorsCoursesService(limit, offset);

  return NextResponse.json(contributor);
}
