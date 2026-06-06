"use client";

import React, { useState } from "react";
import { useRouter } from "@/components/useRouter";
import { createWallet } from "@/lib/api/wallet";
import { useUser } from "@/context/UserContext";

const BRAND_BLUE = "#2563EB";

export default function CreateWalletPage() {
  const [loading, setLoading] = useState(false);
  const {user} = useUser()
  const router = useRouter();

  const handleCreate = async () => {
    try {
      setLoading(true);
      if(!user ) return;

      const res = await createWallet(user?.$id);

      if (!res) {
        throw new Error("Wallet creation failed");
        return;
      }

      router.push("/wallet");
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FB",
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
        color: "#111827",
        margin: 0
      }}
    >
      Create your Wallet
    </h1>

    <p
      style={{
        fontSize: "0.875rem",
        color: "#6b7280",
        margin: 0,
        lineHeight: 1.5
      }}
    >
      You need a wallet to receive earnings and make payments.
    </p>

    <button
      onClick={handleCreate}
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
      {loading ? "Creating..." : "Create Wallet"}
    </button>
  </div>
</div>
  );
}