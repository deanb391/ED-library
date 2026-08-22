import { NextResponse } from "next/server";
import { fetchUserSubscriptionsService } from "@/lib/services/subscriptions.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const subscriptions = await fetchUserSubscriptionsService(userId);
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("List subscriptions error:", error);
    return NextResponse.json(
      { error: "Failed to list subscriptions" },
      { status: 500 }
    );
  }
}
