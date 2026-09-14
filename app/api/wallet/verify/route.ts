// app/api/wallet/verify/route.ts
import { NextResponse } from "next/server";
import { creditWalletService, walletDepositSuccess } from "@/lib/services/wallet.service";
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
    
    if (isVerified) {
      await updatePaymentStatus(paymentId, "successful");

      const flutter_fee = 0.02 * payment.amount;
      const ed_fee = 0.03 * payment.amount;
      const balance = payment.amount - (0.05 * payment.amount);

      const userId = typeof payment.user === "string" ? payment.user : payment.user?.$id;

      await createTransactionService({ user: userId, type: 'deposit', direction: "credit", amount: payment.amount, reference: payment.description });
      await createTransactionService({ user: "admin", type: "deposit_fee", direction: "debit", amount: ed_fee, reference: payment.description });
      await createTransactionService({ user: "admin", type: "payment_processing_fee", direction: "debit", amount: flutter_fee, reference: payment.description });

      await creditWalletService(userId, balance);
      await walletDepositSuccess(userId, balance, paymentId);

      try {
        const userDoc = await prisma.user.findUnique({ where: { id: userId } });
        if (userDoc?.email) {
          const { sendDepositSuccessEmail } = await import("@/lib/email/events");
          sendDepositSuccessEmail(userDoc.email, userDoc.name || "User", balance);
        }
      } catch (err) {
        console.error("Failed to send deposit email:", err);
      }

      return NextResponse.json({ success: true });
    } else {
      await updatePaymentStatus(paymentId, "failed");
      return NextResponse.json({ success: false, error: "Payment verification failed at provider" });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    trackEvent("API_ERROR", {
      distinctId: paymentId || "unknown",
      metadata: { route: "/api/wallet/verify", error: error.message }
    });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}