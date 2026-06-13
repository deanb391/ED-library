// app/api/ads/unique-count/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchAdByIdRawService } from "@/lib/services/ad.service";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const ad = await fetchAdByIdRawService(id);
    const count = ad.uniqueUsers?.length || 0;

    return NextResponse.json({ count });
  } catch (err) {
    console.error("Failed to fetch unique users count:", err);
    return NextResponse.json({ error: "Failed to fetch unique users count" }, { status: 500 });
  }
}
