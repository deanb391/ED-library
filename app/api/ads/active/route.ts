// app/api/ads/active/route.ts

import { NextResponse } from "next/server";
import { fetchActiveAdsService } from "@/lib/services/ad.service";

export async function GET() {
  try {
    const ads = await fetchActiveAdsService();
    return NextResponse.json(Array.isArray(ads) ? ads : []);
  } catch (err) {
    console.error("GET /api/ads/active error:", err);
    return NextResponse.json([]);
  }
}