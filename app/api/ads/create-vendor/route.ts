// app/api/ads/create-vendor/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAdService } from "@/lib/services/ad.service";
import { createPaymentService } from "@/lib/services/payments.service";
import { initFlutterwavePayment } from "@/lib/services/flutterwave.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, smallImages, mediumImages, largeImages, videos, link, user, email } = body;

    if (!name || !user || !email) {
      return NextResponse.json(
        { error: "Missing required fields: name, user, or email" },
        { status: 400 }
      );
    }

    const price = 3500;
    const type = "weekly";

    const adPayload = {
      name,
      smallImages: smallImages || [],
      mediumImages: mediumImages || [],
      largeImages: largeImages || [],
      videos: videos || [],
      link: link || "",
      user,
      type,
    };

    const charge = 0.015 * price; // 1.5% Flutterwave processing fee
    const finalAmount = price + charge;

    // Create a pending payment tracking document storing the ad details payload
    const payment = await createPaymentService({
      type: "one-time",
      amount: price,
      status: "pending",
      user,
      description: `Weekly Ad Campaign: ${name}`,
      courses: JSON.stringify(adPayload),
      provider: "flutterwave",
    });

    // Initialize Flutterwave payment transaction redirecting to verification page without adId
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/advertise/payment/verify?paymentId=${payment.$id}`;
    const flutterResponse = await initFlutterwavePayment({
      amount: finalAmount,
      email,
      tx_ref: payment.$id,
      description: payment.description || `Weekly Ad Campaign: ${name}`,
      redirect_url: redirectUrl,
    });

    if (!flutterResponse?.data?.link) {
      return NextResponse.json(
        { error: "Failed to initialize Flutterwave payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: flutterResponse.data.link,
      paymentId: payment.$id,
    });
  } catch (error: any) {
    console.error("CREATE VENDOR AD ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create vendor ad campaign" },
      { status: 500 }
    );
  }
}
