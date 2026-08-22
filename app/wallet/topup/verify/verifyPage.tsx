"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/components/useRouter";
import { verifyPayment } from "@/lib/api/wallet";

export default function VerifyTopUpPage() {

  const BRAND_BLUE = "#2563EB";
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const status = searchParams.get("status")

  useEffect(() => {
    const verify = async () => {
      try {

        if (status === "cancelled" || status === "failed") {
          router.push("/wallet/topup/failed");
        }
        const res = await verifyPayment(paymentId!);

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        padding: "1rem",
        boxSizing: "border-box",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem"
        }}
      >
        <svg
          style={{
            width: "40px",
            height: "40px",
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#e5e7eb"
            strokeWidth="4"
          ></circle>
          <path
            fill={BRAND_BLUE || "#2563eb"} // Fallback color just in case
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>

        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            margin: 0
          }}
        >
          Verifying payment...
        </p>
      </div>
    </div>
  );
}