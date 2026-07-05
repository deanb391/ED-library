import { NextResponse } from "next/server";
import { handleSubscriptionService } from "@/lib/services/subscriptions.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "userId and courseId are required" },
        { status: 400 }
      );
    }

    const subscription = await handleSubscriptionService(userId, courseId);
    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error("Handle subscription error:", error);
    return NextResponse.json(
      { error: "Failed to handle subscription" },
      { status: 500 }
    );
  }
}
