import prisma from "@/lib/prisma";
import { fetchCourseByIdService } from "@/lib/services/course.service";
import { creditWalletService, debitWalletService } from "@/lib/services/wallet.service";
import { initFlutterwavePayment, verifyFlutterwaveTransaction } from "./flutterwave.service";
import { createEarningService } from "./earnings.service";
import { addCourseToLibraryService } from "./library.service";
import { fetchContributorService } from "./contributors.service";
import { createTransactionService } from "./transactions.service";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { trackCoursePayment } from "@/lib/analytics/trackers";
import { randomUUID } from "crypto";

export type PaymentStatus = "pending" | "successful" | "failed";
export type PaymentType = "subscription" | "one-time" | "wallet_topup" | "withdrawal" | "debit";

export interface PaymentPayload {
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  user: string;
  description?: string;
  transactionId?: string;
  courses?: string;
  provider?: "flutterwave" | "wallet";
}

export function mapPayment(doc: any) {
  if (!doc) return null;
  return {
    $id: doc.id || doc.$id,
    id: doc.id || doc.$id,
    type: doc.type,
    amount: doc.amount,
    status: doc.status,
    user: doc.userId || (typeof doc.user === 'string' ? doc.user : doc.user?.id) || "",
    userId: doc.userId,
    description: doc.description,
    transactionId: doc.transactionId,
    courses: doc.courses,
    provider: doc.provider,
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createPaymentService(payload: PaymentPayload) {
  const id = randomUUID();
  const doc = await prisma.payment.create({
    data: {
      id,
      type: payload.type,
      amount: payload.amount,
      status: payload.status,
      userId: payload.user,
      description: payload.description || "",
      transactionId: payload.transactionId || "",
      courses: payload.courses || "",
      provider: payload.provider || "flutterwave",
    },
  });

  return mapPayment(doc)!;
}

export async function updatePaymentService(
  paymentId: string,
  updates: Partial<PaymentPayload & { status: PaymentStatus }>
) {
  const doc = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(updates.type !== undefined && { type: updates.type }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.user !== undefined && { userId: updates.user }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.transactionId !== undefined && { transactionId: updates.transactionId }),
      ...(updates.courses !== undefined && { courses: updates.courses }),
      ...(updates.provider !== undefined && { provider: updates.provider }),
    },
  });

  return mapPayment(doc);
}

export async function getPaymentById(paymentId: string) {
  try {
    const doc = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    return mapPayment(doc);
  } catch (error) {
    console.error(`Failed to fetch payment with ID ${paymentId}:`, error);
    return null;
  }
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
  return await updatePaymentService(paymentId, { status });
}

export async function payForCourseService(params: {
  userId: string;
  email: string;
  paymentMethod: "wallet" | "flutter";
  courseIds: string[];
  type: "subscription" | "one-time";
  walletBalance?: number;
  contributorId: string;
}) {
  let total = 0;
  const courses: any[] = [];

  for (const id of params.courseIds) {
    const course = await fetchCourseByIdService(id);
    const priceData = course?.price ? JSON.parse(course.price) : null;
    let amount = priceData?.isFree ? 0 : priceData?.amount || 0;

    if (priceData?.type === "one-time") {
      amount = amount * (course.pageCount || 1);
    }

    total += amount;

    courses.push({
      id: course.id,
      title: course.title,
      amount,
    });
  }

  // Create payment FIRST
  const payment = await createPaymentService({
    type: params.type,
    amount: total,
    status: "pending",
    user: params.userId,
    description: `Payment for ${courses.length} course(s)`,
    courses: JSON.stringify(params.courseIds),
    provider: (params?.paymentMethod as "wallet") || "flutterwave",
  });

  trackEvent("PAYMENT_INITIATED", {
    distinctId: params.userId,
    userId: params.userId,
    metadata: {
      paymentId: payment.$id,
      amount: total,
      type: params.type,
      method: params.paymentMethod,
      courseCount: params.courseIds.length
    }
  });

  // =========================
  // WALLET FLOW
  // =========================
  if (params.paymentMethod === "wallet") {
    await debitWalletService(params.userId, total, "updated");

    await updatePaymentService(payment.$id, {
      type: params.type,
      amount: total,
      status: "successful",
      user: params.userId,
      description: "Wallet payment",
      transactionId: "WALLET_" + payment.$id,
    });

    const rev = 0.85 * payment.amount;
    const cut = 0.15 * payment.amount;

    const Contributor = await fetchContributorService(params.contributorId);

    await creditWalletService(Contributor.user, rev);

    await createEarningService({
      amount: rev,
      description: payment.description,
      courses: payment.courses,
      type: payment.type,
      contributorId: params.contributorId,
    });

    await createTransactionService({
      user: params.userId,
      type: "debit",
      direction: "debit",
      amount: payment.amount,
      reference: payment.description,
    });

    await createTransactionService({
      user: "admin",
      type: "platform_cut",
      direction: "debit",
      amount: cut,
      reference: payment.description,
    });

    await createTransactionService({
      user: params.contributorId,
      type: "earning",
      direction: "credit",
      amount: rev,
      reference: payment.description,
    });

    const courseIds = JSON.parse(payment.courses);

    // Fetch email prerequisites
    let contributorUserDoc: any = null;
    let studentName = "A student";
    let sendPurchaseNotificationEmail: any, sendSubscriptionNotificationEmail: any;

    try {
      const userDoc = await prisma.user.findUnique({ where: { id: Contributor.user } });
      contributorUserDoc = userDoc;

      if (contributorUserDoc?.email) {
        const events = await import("@/lib/email/events");
        sendPurchaseNotificationEmail = events.sendPurchaseNotificationEmail;
        sendSubscriptionNotificationEmail = events.sendSubscriptionNotificationEmail;

        const studentDoc = await prisma.user.findUnique({ where: { id: params.userId } }).catch(() => null);
        if (studentDoc?.username || studentDoc?.name) studentName = studentDoc.username || studentDoc.name || "A student";
      }
    } catch (err) {
      console.error("[Wallet] Failed to fetch email prerequisites:", err);
    }

    for (const courseId of courseIds) {
      // Add to library
      await addCourseToLibraryService(courseId, params.userId, payment.type as "subscription" | "one-time");

      // If subscription-based, create/renew subscription document
      if (payment.type === "subscription") {
        try {
          const { handleSubscriptionService } = await import("@/lib/services/subscriptions.service");
          await handleSubscriptionService(params.userId, courseId);
        } catch (err) {
          console.error("[Wallet] Failed to handle subscription for course:", courseId, err);
        }
      }

      // Send email notification
      if (contributorUserDoc?.email && sendPurchaseNotificationEmail) {
        try {
          const courseDoc = await prisma.course.findUnique({ where: { id: courseId } }).catch(() => null);
          const courseTitle = courseDoc?.title || "A course";

          if (payment.type === "subscription") {
            sendSubscriptionNotificationEmail(
              contributorUserDoc.email,
              Contributor.username || "Contributor",
              studentName,
              courseTitle
            );
          } else {
            const parsedPrice = JSON.parse(courseDoc?.price || "{}");
            sendPurchaseNotificationEmail(
              contributorUserDoc.email,
              Contributor.username || "Contributor",
              courseTitle,
              parsedPrice.amount
            );
          }
        } catch (e) {
          console.error("[Wallet] Failed to send email for course:", courseId, e);
        }
      }
    }

    trackCoursePayment(params.userId, total, { method: "wallet", type: params.type });

    return {
      type: "wallet",
      success: true,
    };
  }

  // =========================
  // FLUTTERWAVE FLOW
  // =========================
  const charge = 0.015 * total;
  const finalAmount = total + charge;

  const flutter = await initFlutterwavePayment({
    amount: finalAmount,
    email: params.email,
    tx_ref: payment.$id,
    description: payment.description || "",
    redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe/usbscribe-to-contributor/verify?paymentId=${payment.$id}&contributorId=${params.contributorId}`,
  });

  if (!flutter?.data?.link) {
    throw new Error("Failed to initialize payment");
  }

  return {
    type: "flutter",
    checkoutUrl: flutter.data.link,
    paymentId: payment.$id,
  };
}

export async function verifyPaymentService(paymentId: string) {
  const verification = await verifyFlutterwaveTransaction(paymentId);

  if (verification.status !== "success") {
    await updatePaymentService(paymentId, {
      status: "failed",
    });

    return { success: false };
  }

  const tx = verification.data;
  const isValid = tx.status === "successful";

  if (!isValid) {
    await updatePaymentService(paymentId, {
      status: "failed",
    });

    return { success: false };
  }

  await updatePaymentService(paymentId, {
    status: "successful",
    transactionId: tx.id?.toString(),
  });

  trackEvent("PAYMENT_SUCCESS", {
    distinctId: tx.customer?.email || paymentId,
    metadata: {
      paymentId,
      amount: tx.amount,
      currency: tx.currency,
      method: "flutterwave"
    }
  });

  return { success: true };
}