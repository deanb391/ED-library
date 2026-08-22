import { NextResponse } from "next/server";
import { fetchSubscriptionService } from "@/lib/services/subscriptions.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  if (!userId || !courseId) {
    return NextResponse.json(
      { error: "userId and courseId are required" },
      { status: 400 }
    );
  }

  try {
    const subscription = await fetchSubscriptionService(userId, courseId);
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Fetch subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
