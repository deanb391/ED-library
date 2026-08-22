// app/api/courses/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { searchContributorsService } from "@/lib/services/contributors.service";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q) return NextResponse.json([]);

  const res = await searchContributorsService(q);

  return NextResponse.json(res);
}