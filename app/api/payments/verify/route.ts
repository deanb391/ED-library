// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service"; // adjust import
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service"; // adjust import
import { createEarningService } from "@/lib/services/earnings.service";
import { addCourseToLibraryService } from "@/lib/services/library.service";
import { creditWalletService } from "@/lib/services/wallet.service";
import { fetchContributorService } from "@/lib/services/contributors.service";
import { createTransactionService } from "@/lib/services/transactions.service";

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

// ✅ safe user extraction
const userId =
  typeof payment.user === "string"
    ? payment.user
    : payment.user?.$id;

if (!userId) throw new Error("Invalid user on payment");

// ✅ safe courses parsing
let courseIds: string[] = [];
try {
  courseIds = JSON.parse(payment.courses || "[]");
} catch {
  courseIds = [];
}

// ✅ contributor
const contributor = await fetchContributorService(contributorId);
if (!contributor) throw new Error("Contributor not found");

const flutter_fee = 0.02 * payment.amount
const ed_fee = 0.03 * payment.amount

const balance = payment.amount - (0.05 * payment.amount)

const rev = 0.85 * balance;
const cut = 0.15 * balance;

// ✅ update payment
await updatePaymentStatus(paymentId, "successful");

await creditWalletService(contributor.user, rev);

await  createTransactionService({user: payment.user, type: 'deposit', direction: "credit", amount: payment.amount, reference: payment.description})

await  createTransactionService({user: "admin", type: "deposit_fee", direction: "debit", amount: ed_fee, reference: payment.description})

await  createTransactionService({user: "admin", type: "payment_processing_fee", direction: "debit", amount: flutter_fee, reference: payment.description})

await  createTransactionService({user: "admin", type: 'platform_cut', direction: "debit", amount: cut, reference: payment.description})

await  createTransactionService({user: contributor.$id, type: 'earning', direction: "credit", amount: rev, reference: payment.description})


// ✅ earning record
await createEarningService({
  amount: rev,
  description: payment.description,
  courses: payment.courses,
  type: payment.type,
  contributorId,
});

// ✅ library
for (const courseId of courseIds) {
  await addCourseToLibraryService(courseId, userId, payment.type);
}

// ✅ wallet credit


return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}