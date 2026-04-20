"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchWallet } from "@/lib/api/wallet";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const BRAND_BLUE = "#2563EB";

export default function WalletPage() {
  const { user } = useUser();
  const router = useRouter();

  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const walletRes = await fetchWallet(user.$id);
        setWallet(walletRes);
      } catch (err) {
        console.error("Wallet load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.$id) load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
    padding: "1.5rem 1rem",
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "576px", // max-w-xl equivalent
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    }}
  >
    {/* HEADER */}
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        boxSizing: "border-box"
      }}
    >
      <p
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: 0,
          fontWeight: "500"
        }}
      >
        Wallet Balance
      </p>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#111827",
          margin: "0 0 0.5rem 0"
        }}
      >
        ₦{(wallet?.balance || 0).toLocaleString()}
      </h1>

      <button
        onClick={() => router.push("/wallet/topup")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.85rem 1rem",
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
        <Plus size={16} />
        Top Up Wallet
      </button>
    </div>
  </div>
</div>
  );
}