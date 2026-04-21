// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service"; // adjust import
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service"; // adjust import
import { createEarningService } from "@/lib/services/earnings.service";
import { addCourseToLibraryService } from "@/lib/services/library.service";
import { creditWalletService } from "@/lib/services/wallet.service";
import { fetchContributorService } from "@/lib/services/contributors.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  const contributorId = searchParams.get("contributorId");

  if (!paymentId) {
    return NextResponse.json({ success: false, error: "Missing paymentId" }, { status: 400 });
  }

  if (!contributorId) {
    return NextResponse.json({ success: false, error: "Missing contributorId" }, { status: 400 });
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


      const rev = 0.15 * payment.amount;

      // 5. Actually top up the user's wallet!
      await createEarningService({amount: rev, description: payment.description, courses: payment.courses, type: payment.type, contributorId: contributorId});

      const courseIds = JSON.parse(payment.courses)
    for (const course of courseIds) {
      await addCourseToLibraryService(course, payment.user.$id, payment.type)
    }

      const Contributor = await fetchContributorService(contributorId)
      
          
      await creditWalletService(Contributor.user, rev)
      

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