import { NextRequest, NextResponse } from "next/server";
import {
  fetchAdByIdRawService,
  updateAdService,
} from "@/lib/services/ad.service";

export async function POST(req: NextRequest) {
  try {
    const { adId } = await req.json();

    const ad = await fetchAdByIdRawService(adId);

    await updateAdService(adId, {
      clicks: ad.clicks + 1,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to record click:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
