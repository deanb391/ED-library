"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";

const BRAND_BLUE = "#2563EB";

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("paymentId");
  const contributorId = searchParams.get("contributorId");
  const status = searchParams.get("status")

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        router.replace("/subscribe/usbscribe-to-contributor/failed");
        return;
      }
      if (!contributorId) return;

      if (status === "cancelled" || status === "failed") {
        router.push("/subscribe/usbscribe-to-contributor/failed");
      }

      try {
        const res = await fetch(
          `/api/payments/verify?paymentId=${encodeURIComponent(paymentId)}&contributorId=${encodeURIComponent(contributorId)}`,
          {
            method: "GET",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Verification failed");
        }

        if (!data.success) {
          throw new Error(data?.error || "Payment not successful");
        }

        if (data?.success) {
          setMessage("Payment verified. Redirecting...");
          setTimeout(() => {
            router.replace(
              "/subscribe/usbscribe-to-contributor/success"
            );
          }, 1500);
        } else {
          throw new Error("Payment not successful");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setMessage("Payment verification failed. Redirecting...");
        setTimeout(() => {
          router.replace(
            "/subscribe/usbscribe-to-contributor/failed"
          );
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      <div
        className="rounded-full h-12 w-12 border-t-4 border-solid mb-4 animate-spin"
        style={{ borderColor: BRAND_BLUE, borderTopColor: "transparent" }}
      />

      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Processing Payment
      </h2>

      <p className="text-sm text-gray-500 max-w-sm">
        {message}
      </p>
    </div>
  );
}