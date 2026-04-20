"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { topUpWallet } from "@/lib/api/wallet";

const BRAND_BLUE = "#2563EB";

export default function TopUpPage() {
  const [amount, setAmount] = useState<number>();
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  const handleTopUp = async () => {
    if (!amount || amount <= 0 || !user?.$id) return;

    try {
      setLoading(true);

      const res = await topUpWallet(user.$id, amount, user?.email);

      if (!res?.checkoutUrl) {
        throw new Error("Failed to initialize top up");
      }

      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
      boxSizing: "border-box"
    }}
  >
    <h1
      style={{
        fontSize: "1.125rem",
        fontWeight: "600",
        color: "#111827",
        margin: 0
      }}
    >
      Top Up Wallet
    </h1>

    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(Number(e.target.value))}
      placeholder="Enter amount"
      style={{
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "0.75rem 1rem",
        fontSize: "0.875rem",
        color: "#111827",
        outline: "none",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease-in-out"
      }}
      // Optional: Since pure inline styles lack pseudo-classes like :focus, 
      // ensuring the outline is 'none' but giving it a clean default border works best here.
    />

    <button
      onClick={handleTopUp}
      disabled={loading}
      style={{
        width: "100%",
        padding: "0.85rem 1.5rem",
        borderRadius: "12px",
        backgroundColor: BRAND_BLUE,
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "1rem",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      {loading ? "Processing..." : "Continue"}
    </button>
  </div>
</div>
  );
}