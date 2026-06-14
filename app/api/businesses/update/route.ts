// app/api/businesses/update/route.ts

import { NextRequest, NextResponse } from "next/server";
import { updateBusinessService } from "@/lib/services/business.service";

export async function POST(req: NextRequest) {
  try {
    const { businessId, updates } = await req.json();

    if (!businessId || !updates) {
      return NextResponse.json({ error: "businessId and updates are required" }, { status: 400 });
    }

    const business = await updateBusinessService(businessId, updates);
    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error("Failed to update business profile:", error);
    return NextResponse.json({ error: "Failed to update business profile" }, { status: 500 });
  }
}
