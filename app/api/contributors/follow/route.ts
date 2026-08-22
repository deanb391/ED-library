import { NextResponse } from "next/server";
import { toggleFollowContributorService } from "@/lib/services/contributors.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, contributorId } = body;

    if (!userId || !contributorId) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const result = await toggleFollowContributorService(
      userId,
      contributorId
    );

    return NextResponse.json({ success: result });
  } catch (err) {
    console.error("FOLLOW ROUTE ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}