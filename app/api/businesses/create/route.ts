// app/api/businesses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createBusinessService } from "@/lib/services/business.service";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    if (!data.name || !data.phone || !data.user) {
      return NextResponse.json({ error: "name, phone, and user ID are required" }, { status: 400 });
    }

    const business = await createBusinessService(data);
    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error("Failed to create business profile:", error);
    return NextResponse.json({ error: "Failed to create business profile" }, { status: 500 });
  }
}
