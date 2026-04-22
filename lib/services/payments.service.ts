import { databases } from "@/lib/appwrite/server";
import { ID } from "appwrite";
import { fetchCourseByIdService } from "@/lib/services/course.service";
import {  creditWalletService, debitWalletService } from "@/lib/services/wallet.service";
import { initFlutterwavePayment } from "./flutterwave.service";
import { verifyFlutterwaveTransaction } from "./flutterwave.service";
import { createEarningService } from "./earnings.service";
import { addCourseToLibraryService } from "./library.service";
import { fetchContributorService } from "./contributors.service";

const DATABASE_ID = "69617e75000c6c010a75";
const PAYMENTS_COLLECTION = "payments";

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

export async function createPaymentService(payload: PaymentPayload) {
  const now = new Date().toISOString();

  const doc = await databases.createDocument(
    DATABASE_ID,
    PAYMENTS_COLLECTION,
    ID.unique(),
    {
      ...payload,
      $createdAt: now,
      $updatedAt: now,
    }
  );

  return doc;
}

export async function updatePaymentService(
  paymentId: string,
  updates: Partial<PaymentPayload & { status: PaymentStatus }>
) {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    PAYMENTS_COLLECTION,
    paymentId,
    {
      ...updates,
      $updatedAt: new Date().toISOString(),
    }
  );

  return doc;
}

export async function getPaymentById(paymentId: string) {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      PAYMENTS_COLLECTION,
      paymentId
    );
    return doc;
  } catch (error) {
    console.error(`Failed to fetch payment with ID ${paymentId}:`, error);
    return null; // Return null so the calling function can handle the "not found" state cleanly
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
    const amount = priceData?.isFree ? 0 : priceData?.amount || 0;

    total += amount;

    courses.push({
      id: course.id,
      title: course.title,
      amount,
    });
  }

  // ⚠️ Create payment FIRST
  const payment = await createPaymentService({
    type: params.type,
    amount: total,
    status: "pending",
    user: params.userId,
    description: `Payment for ${courses.length} course(s)`,
    courses: JSON.stringify(params.courseIds),
    provider: params?.paymentMethod as "wallet" || "flutterwave",
  });

  // =========================
  // WALLET FLOW
  // =========================
  if (params.paymentMethod === "wallet") {
    await debitWalletService(params.userId, total, "updated");

    await updatePaymentService( payment?.$id, {
      type: params.type,
      amount: total,
      status: "successful",
      user: params.userId,
      description: "Wallet payment",
      transactionId: "WALLET_" + payment.$id,
    });

    const rev = 0.85 * payment.amount;

    await createEarningService({amount: rev, description: payment.description, courses: payment.courses, type: payment.type, contributorId: params.contributorId});
    

    const courseIds = JSON.parse(payment.courses)
    for (const course of courseIds) {
      await addCourseToLibraryService(course, payment.user.$id, payment.type)
    }

    const Contributor = await fetchContributorService(params.contributorId)

    
    await creditWalletService(Contributor.user, rev)

    return {
      type: "wallet",
      success: true,
    };
  }

  // =========================
  // FLUTTERWAVE FLOW
  // =========================

  const charge = 0.015 * total; // 1.5% charge (adjust later)
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

  return { success: true };
}