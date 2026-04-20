import { NextResponse } from "next/server";
import { verifyPaymentService } from "@/lib/services/payments.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing paymentId" },
        { status: 400 }
      );
    }

    const result = await verifyPaymentService(paymentId);

    return NextResponse.json({
      success: result.success,
    });
  } catch (error) {
    console.error("Verify API error:", error);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}