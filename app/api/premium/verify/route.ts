import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service";
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service";
import { createTransactionService } from "@/lib/services/transactions.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.json({ success: false, error: "Missing paymentId" }, { status: 400 });
  }

  try {
    const payment = await getPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");

    if (payment.status === "successful" || payment.status === "completed") {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    const isVerified = await verifyFlutterwaveTransaction(paymentId);

    if (!isVerified) {
      await updatePaymentStatus(paymentId, "failed");
      return NextResponse.json(
        { success: false, error: "Payment verification failed at provider" },
        { status: 400 }
      );
    }

    const userId = typeof payment.user === "string" ? payment.user : payment.user?.$id;
    if (!userId) throw new Error("Invalid user on payment");

    await updatePaymentStatus(paymentId, "successful");

    // Ensure 'admin' user exists before logging admin transactions
    await prisma.user.upsert({
      where: { id: "admin" },
      update: {},
      create: { id: "admin", email: "admin@ed-library.com", name: "Admin" }
    });

    const flutter_fee = 0.015 * payment.amount;
    const ed_revenue = payment.amount - flutter_fee;

    // Log transactions
    await createTransactionService({ user: userId, type: "premium_subscription", direction: "debit", amount: payment.amount, reference: payment.description });
    await createTransactionService({ user: "admin", type: "premium_revenue", direction: "credit", amount: ed_revenue, reference: payment.description });
    await createTransactionService({ user: "admin", type: "payment_processing_fee", direction: "debit", amount: flutter_fee, reference: payment.description });

    // Update user to premium
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + 1));

    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
      },
    });

    trackEvent("PREMIUM_SUBSCRIBED", {
      distinctId: userId,
      metadata: { paymentId, amount: payment.amount }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Premium verification error:", error);
    trackEvent("API_ERROR", {
      distinctId: paymentId || "unknown",
      metadata: { route: "/api/premium/verify", error: error.message }
    });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
