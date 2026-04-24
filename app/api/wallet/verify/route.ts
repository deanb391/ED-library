// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { creditWalletService } from "@/lib/services/wallet.service"; // adjust import
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service"; // adjust import
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service"; // adjust import
import { createTransactionService } from "@/lib/services/transactions.service";

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

      const flutter_fee = 0.02 * payment.amount
      const ed_fee = 0.03 * payment.amount

      const balance = payment.amount - (0.05 * payment.amount)

      await  createTransactionService({user: payment.user, type: 'deposit', direction: "credit", amount: payment.amount, reference: payment.description})
      
      await  createTransactionService({user: "admin", type: "deposit_fee", direction: "debit", amount: ed_fee, reference: payment.description})
      
      await  createTransactionService({user: "admin", type: "payment_processing_fee", direction: "debit", amount: flutter_fee, reference: payment.description})

      // 5. Actually top up the user's wallet!
      await creditWalletService(payment.user, balance);

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