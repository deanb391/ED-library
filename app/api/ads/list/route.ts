// app/api/ads/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchAdsService } from "@/lib/services/ad.service";
import { Query } from "appwrite";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const limit = Number(searchParams.get("limit") || 10);
    const cursor = searchParams.get("cursor");
    const type = searchParams.get("type");
    const isExpired = searchParams.get("isExpired");

    const queries: any[] = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) queries.push(Query.cursorAfter(cursor));
    if (type) queries.push(Query.equal("type", type));
    if (isExpired !== null)
      queries.push(Query.equal("isExpired", isExpired === "true"));

    const res = await fetchAdsService(queries);

    return NextResponse.json(res);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}