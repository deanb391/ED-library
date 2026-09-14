// app/api/ads/view/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  fetchAdByIdRawService,
  updateAdService,
} from "@/lib/services/ad.service";

export async function POST(req: NextRequest) {
  try {
    const { adId, userId } = await req.json();

    const ad = await fetchAdByIdRawService(adId);
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const uniqueUsers = new Set(ad.uniqueUsers || []);

    if (userId) uniqueUsers.add(userId);

    await updateAdService(adId, {
      views: (ad.views || 0) + 1,
      uniqueUsers: Array.from(uniqueUsers),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}