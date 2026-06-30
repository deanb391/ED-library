"use client";

import React from "react";
import { useRouter } from "@/components/useRouter";

const BRAND_BLUE = "#2563EB";

export default function TopUpSuccessPage() {
  const router = useRouter();

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
      width: "100%",
      maxWidth: "448px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "16px",
      padding: "2rem 1.5rem",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      boxSizing: "border-box"
    }}
  >
    <h1
      style={{
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#16a34a", // text-green-600
        margin: 0
      }}
    >
      Payment Successful
    </h1>

    <p
      style={{
        fontSize: "0.875rem",
        color: "#6b7280",
        margin: 0,
        lineHeight: 1.5
      }}
    >
      Your wallet has been topped up successfully.
    </p>

    <button
      onClick={() => router.push("/wallet")}
      style={{
        width: "100%",
        padding: "0.85rem 1.5rem",
        borderRadius: "12px",
        backgroundColor: BRAND_BLUE,
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "1rem",
        border: "none",
        cursor: "pointer",
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      View Wallet
    </button>
  </div>
</div>
  );
}