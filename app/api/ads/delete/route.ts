// app/api/ads/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { deleteAdService } from "@/lib/services/ad.service";

export async function DELETE(req: NextRequest) {
  try {
    const { adId } = await req.json();

    if (!adId) {
      return NextResponse.json(
        { error: "Missing adId" },
        { status: 400 }
      );
    }

    await deleteAdService(adId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE AD ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete ad" },
      { status: 500 }
    );
  }
}