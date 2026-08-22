// app/api/ads/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { updateAdService } from "@/lib/services/ad.service";

export async function PATCH(req: NextRequest) {
  const { adId, data } = await req.json();

  if (!adId) {
    return NextResponse.json({ error: "Missing adId" }, { status: 400 });
  }

  const updated = await updateAdService(adId, data);

  return NextResponse.json(updated);
}