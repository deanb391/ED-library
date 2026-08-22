// app/api/ads/active/route.ts

import { NextResponse } from "next/server";
import { fetchActiveAdsService } from "@/lib/services/ad.service";

export async function GET() {
  const ads = await fetchActiveAdsService();
  return NextResponse.json(ads);
}