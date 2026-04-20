// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { creditWalletService } from "@/lib/services/wallet.service"; // adjust import
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service"; // adjust import
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service"; // adjust import

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const transactionId = searchParams.get("transaction_id"); // Flutterwave often appends this

  if (!paymentId) {
    return NextResponse.json({ success: false, error: "Missing paymentId" }, { status: 400 });
  }

  try {
    // 1. Fetch the payment record from your database
    const payment = await getPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");

    // 2. CRITICAL: Prevent double-crediting!
    // If the payment is already successful, the wallet was already credited.
    if (payment.status === "successful" || payment.status === "completed") {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    // 3. Verify the actual transaction with Flutterwave
    // (Ensure the amount paid matches the amount in your database)
    const isVerified = await verifyFlutterwaveTransaction(paymentId);
    
    if (isVerified) {
      // 4. Mark payment as successful in the database
      await updatePaymentStatus(paymentId, "successful");

      // 5. Actually top up the user's wallet!
      await creditWalletService(payment.user, payment.amount);

      return NextResponse.json({ success: true });
    } else {
      // Handle failed Flutterwave verification
      await updatePaymentStatus(paymentId, "failed");
      return NextResponse.json({ success: false, error: "Payment verification failed at provider" });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}