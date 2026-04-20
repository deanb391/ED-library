"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { verifyPayment } from "@/lib/api/payments";

export default function VerifyTopUpPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.slug as string;

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyPayment(paymentId);

        if (res.success) {
          router.push("/wallet/topup/success");
        } else {
          router.push("/wallet/topup/failed");
        }
      } catch (err) {
        console.error("Verification failed:", err);
        router.push("/wallet/topup/failed");
      }
    };

    if (paymentId) verify();
  }, [paymentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="text-center space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto" />
        <p className="text-sm text-gray-500">Verifying payment...</p>
      </div>
    </div>
  );
}