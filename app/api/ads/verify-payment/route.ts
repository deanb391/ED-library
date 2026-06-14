// app/api/ads/verify-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveTransaction } from "@/lib/services/flutterwave.service";
import { getPaymentById, updatePaymentStatus, updatePaymentService } from "@/lib/services/payments.service";
import { createAdService, updateAdService } from "@/lib/services/ad.service";
import { createTransactionService } from "@/lib/services/transactions.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId");
    const adId = searchParams.get("adId");

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "Missing paymentId" },
        { status: 400 }
      );
    }

    // 1. Fetch payment record
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 }
      );
    }

    // If already successful, return success
    if (payment.status === "successful") {
      let adIdToReturn = adId || "";
      if (!adIdToReturn && payment.courses) {
        try {
          const parsed = JSON.parse(payment.courses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            adIdToReturn = parsed[0];
          }
        } catch (e) {}
      }
      return NextResponse.json({ success: true, message: "Payment already verified", adId: adIdToReturn });
    }

    // 2. Verify payment status on Flutterwave
    const verification = await verifyFlutterwaveTransaction(paymentId);

    if (verification.status !== "success" || verification.data?.status !== "successful") {
      await updatePaymentStatus(paymentId, "failed");
      return NextResponse.json(
        { success: false, error: "Payment verification failed at provider" },
        { status: 400 }
      );
    }

    // 3. Update payment status to successful
    await updatePaymentStatus(paymentId, "successful");

    // Extract user ID safely
    const userId = typeof payment.user === "string" ? payment.user : payment.user?.$id;

    // Log transaction
    try {
      if (userId) {
        await createTransactionService({
          user: userId,
          type: "deposit",
          direction: "credit",
          amount: payment.amount,
          reference: payment.description || `Ad payment: ${paymentId}`,
        });
      }
    } catch (txError) {
      console.error("Failed to create transaction log:", txError);
    }

    // 4. Activate or create the ad campaign (Weekly = +7 days)
    let adIdToReturn = adId || "";

    if (adIdToReturn) {
      // Backward compatibility: activate existing ad campaign
      const now = new Date();
      now.setDate(now.getDate() + 7);
      const endTime = now.toISOString();

      await updateAdService(adIdToReturn, {
        isExpired: false,
        endTime,
      });
    } else {
      // New flow: create the ad campaign now that payment is verified
      if (payment.courses) {
        try {
          const parsed = JSON.parse(payment.courses);
          if (Array.isArray(parsed)) {
            if (parsed.length > 0) {
              adIdToReturn = parsed[0];
            } else {
              return NextResponse.json(
                { success: false, error: "Empty courses list in successful payment" },
                { status: 400 }
              );
            }
          } else if (typeof parsed === "object" && parsed !== null) {
            // It's the ad payload. We need to create the ad.
            const now = new Date();
            now.setDate(now.getDate() + 7);
            const endTime = now.toISOString();

            const newAd = await createAdService({
              name: parsed.name,
              smallImages: parsed.smallImages || [],
              mediumImages: parsed.mediumImages || [],
              largeImages: parsed.largeImages || [],
              videos: parsed.videos || [],
              link: parsed.link || "",
              user: parsed.user,
              type: parsed.type || "weekly",
              price: 2500,
              isExpired: false,
              endTime,
            });

            adIdToReturn = newAd.$id;

            // Update payment document to save the created ad ID to prevent recreating on reload
            await updatePaymentService(paymentId, {
              courses: JSON.stringify([newAd.$id]),
            });
          }
        } catch (e: any) {
          console.error("Failed to parse courses field in payment verification:", e);
          return NextResponse.json(
            { success: false, error: "Invalid ad details payload stored in payment" },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "No ad details payload stored in payment" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Campaign activated successfully", adId: adIdToReturn });
  } catch (error: any) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify ad payment" },
      { status: 500 }
    );
  }
}

