// app/api/ads/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAdService } from "@/lib/services/ad.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, user, type } = body;

    if (!name || !user || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ad = await createAdService(body);

    return NextResponse.json(ad);
  } catch (err) {
    console.error("CREATE AD ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create ad" },
      { status: 500 }
    );
  }
}