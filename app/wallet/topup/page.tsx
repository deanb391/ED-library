"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { topUpWallet } from "@/lib/api/wallet";

const BRAND_BLUE = "#2563EB";

const MIN_AMOUNT = 100;

const getFeePercent = (amount: number): number => {
  if (amount >= 100 && amount <= 1000) return 0.0575;  // 5.75%
  if (amount >= 1001 && amount <= 5000) return 0.0475; // 4.75%
  return 0.0375;                                        // 3.75% for 5001+
};


export default function TopUpPage() {
  const [amount, setAmount] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [showPaymentTransferModal, setShowPaymentTransferModal] = useState(false);

  const router = useRouter();
  const { user } = useUser();

  const isValidAmount = !!amount && amount >= MIN_AMOUNT;

  const feePercent = isValidAmount ? getFeePercent(amount!) : 0;
  const fee = isValidAmount ? amount! * feePercent : 0;
  const totalAmount = isValidAmount ? amount! + fee : 0;

  const handleTopUp = async () => {
    if (!isValidAmount || !user?.$id) return;

    try {
      setLoading(true);
      setShowPaymentTransferModal(false);

      const res = await topUpWallet(
        user.$id,
        totalAmount,
        user?.email
      );

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
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#111827",
            margin: 0,
          }}
        >
          Top Up Wallet
        </h1>

        <input
          type="number"
          value={amount ?? ""}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Minimum deposit is NGN 100"
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
          }}
        />

        {/* Fee breakdown */}
        {isValidAmount && (
          <div
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              fontSize: "0.85rem",
              color: "#374151",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div>
              Transaction fee ({(feePercent * 100).toFixed(0)}%):{" "}
              <strong>NGN {fee.toFixed(2)}</strong>
            </div>

            <div>
              Total to be charged:{" "}
              <strong>NGN {totalAmount.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {showPaymentTransferModal && (
          <div
            onClick={() => setShowPaymentTransferModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 400,
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Information
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                You will be redirected to complete your payment.
                If you are paying via bank transfer, the account name may appear as:
              </p>

              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  Blessed Okori (ED-Library)
                </p>
              </div>

              <p className="text-xs text-gray-500 mb-5">
                This is the official payment account for ED-Library.
                Please proceed only if the details match.
              </p>

              <button
                onClick={handleTopUp}
                className="w-full py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowPaymentTransferModal(true)}
          disabled={!isValidAmount || loading}
          style={{
            width: "100%",
            padding: "0.85rem 1.5rem",
            borderRadius: "12px",
            backgroundColor: BRAND_BLUE,
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "1rem",
            border: "none",
            cursor:
              !isValidAmount || loading ? "not-allowed" : "pointer",
            opacity: !isValidAmount || loading ? 0.6 : 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>
    </div>
  );
}