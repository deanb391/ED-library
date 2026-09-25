import { NextResponse } from "next/server";
import { subscribeToPremiumService } from "@/lib/services/payments.service";

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await subscribeToPremiumService(userId, email);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Premium subscribe error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
