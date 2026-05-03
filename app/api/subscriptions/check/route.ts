import { NextResponse } from "next/server";
import { checkSubscriptionAccessService } from "@/lib/services/subscriptions.service";

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
    const hasAccess = await checkSubscriptionAccessService(userId, courseId);
    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error("Check subscription access error:", error);
    return NextResponse.json(
      { error: "Failed to check subscription access" },
      { status: 500 }
    );
  }
}
