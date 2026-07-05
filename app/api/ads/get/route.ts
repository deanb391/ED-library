// app/api/ads/get/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchAdByIdService } from "@/lib/services/ad.service";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ad = await fetchAdByIdService(id);

  return NextResponse.json(ad);
}