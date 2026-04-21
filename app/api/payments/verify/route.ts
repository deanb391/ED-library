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

// ✅ update payment
await updatePaymentStatus(paymentId, "successful");

// ✅ revenue
const rev = 0.15 * payment.amount;

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
await creditWalletService(contributor.user, rev);

return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}