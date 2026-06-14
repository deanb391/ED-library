// app/api/businesses/get/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchBusinessByUserIdService } from "@/lib/services/business.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const business = await fetchBusinessByUserIdService(userId);
    return NextResponse.json(business);
  } catch (error) {
    console.error("Failed to fetch business by userId:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
