// app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service";
import { getPaymentById, updatePaymentStatus } from "@/lib/services/payments.service";
import { createEarningService } from "@/lib/services/earnings.service";
import { addCourseToLibraryService } from "@/lib/services/library.service";
import { creditWalletService } from "@/lib/services/wallet.service";
import { fetchContributorService } from "@/lib/services/contributors.service";
import { createTransactionService } from "@/lib/services/transactions.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import prisma from "@/lib/prisma";

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
    // 1. Fetch the payment record from database
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

    let courseIds: string[] = [];
    try {
      courseIds = JSON.parse(payment.courses || "[]");
    } catch {
      courseIds = [];
    }

    let contributor = null;
    try {
      contributor = await fetchContributorService(contributorId);
    } catch (e) {
      const { getContributorByUserIdService } = await import("@/lib/services/contributors.service");
      contributor = await getContributorByUserIdService(contributorId);
    }
    if (!contributor) throw new Error("Contributor not found");

    const flutter_fee = 0.02 * payment.amount;
    const ed_fee = 0.03 * payment.amount;
    const balance = payment.amount - (0.05 * payment.amount);
    const rev = 0.85 * balance;
    const cut = 0.15 * balance;

    await updatePaymentStatus(paymentId, "successful");
    await creditWalletService(contributor.user, rev);

    // Ensure 'admin' user exists before logging admin transactions
    await prisma.user.upsert({
      where: { id: "admin" },
      update: {},
      create: { id: "admin", email: "admin@ed-library.com", name: "Admin" }
    });

    await createTransactionService({ user: userId, type: 'deposit', direction: "credit", amount: payment.amount, reference: payment.description });
    await createTransactionService({ user: "admin", type: "deposit_fee", direction: "debit", amount: ed_fee, reference: payment.description });
    await createTransactionService({ user: "admin", type: "payment_processing_fee", direction: "debit", amount: flutter_fee, reference: payment.description });
    await createTransactionService({ user: "admin", type: 'platform_cut', direction: "debit", amount: cut, reference: payment.description });
    await createTransactionService({ user: contributor.user, type: 'earning', direction: "credit", amount: rev, reference: payment.description });

    await createEarningService({
      amount: rev,
      description: payment.description,
      courses: payment.courses,
      type: payment.type,
      contributorId,
    });

    let contributorUserDoc: any = null;
    let studentName = "A student";
    let sendPurchaseNotificationEmail: any, sendSubscriptionNotificationEmail: any;

    try {
      const contributorUserId = contributor.user;
      contributorUserDoc = await prisma.user.findUnique({ where: { id: contributorUserId } });

      if (contributorUserDoc?.email) {
        const events = await import("@/lib/email/events");
        sendPurchaseNotificationEmail = events.sendPurchaseNotificationEmail;
        sendSubscriptionNotificationEmail = events.sendSubscriptionNotificationEmail;

        const studentDoc = await prisma.user.findUnique({ where: { id: userId } }).catch(() => null);
        if (studentDoc?.username || studentDoc?.name) studentName = studentDoc.username || studentDoc.name || "A student";
      }
    } catch (err) {
      console.error("Failed to fetch email prerequisites:", err);
    }

    for (const courseId of courseIds) {
      await addCourseToLibraryService(courseId, userId, payment.type);

      if (payment.type === "subscription") {
        try {
          const { handleSubscriptionService } = await import("@/lib/services/subscriptions.service");
          await handleSubscriptionService(userId, courseId);
        } catch (err) {
          console.error("Failed to handle subscription for course:", courseId, err);
        }
      }

      if (contributorUserDoc?.email && sendPurchaseNotificationEmail) {
        try {
          const courseDoc = await prisma.course.findUnique({ where: { id: courseId } });
          const courseTitle = courseDoc?.title || "A course";

          if (payment.type === "subscription") {
            sendSubscriptionNotificationEmail(
              contributorUserDoc.email,
              contributor.username || "Contributor",
              studentName,
              courseTitle
            );
          } else {
            const parsedPrice = JSON.parse(courseDoc?.price || "{}");
            const coursePrice = parsedPrice.amount || 0;
            sendPurchaseNotificationEmail(
              contributorUserDoc.email,
              contributor.username || "Contributor",
              courseTitle,
              coursePrice
            );
          }
        } catch (e) {
          console.error("Failed to send email for course:", courseId, e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    trackEvent("API_ERROR", {
      distinctId: paymentId || "unknown",
      metadata: { route: "/api/payments/verify", error: error.message }
    });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}