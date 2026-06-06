import { NextRequest, NextResponse } from "next/server";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const contributor = await getContributorByUserIdService(userId);
    
    // Return empty object or null if not found
    return NextResponse.json(contributor || null);
  } catch (error) {
    console.error("Failed to fetch contributor by userId:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
