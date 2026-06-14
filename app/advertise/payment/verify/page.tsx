"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyAdPayment } from "@/lib/api/ads";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Home, RefreshCw } from "lucide-react";

export default function AdvertisePaymentVerifyPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const adId = searchParams.get("adId");

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const verificationInitiated = useRef(false);

  const performVerification = async (payId: string, advertisementId?: string) => {
    try {
      setStatus("verifying");
      setErrorMessage("");
      
      const result = await verifyAdPayment(payId, advertisementId);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("failed");
        setErrorMessage(result.message || "We could not verify your payment with the provider.");
      }
    } catch (err: any) {
      console.error("Verification endpoint failure:", err);
      setStatus("failed");
      setErrorMessage(err?.message || "An unexpected error occurred during verification.");
    }
  };

  useEffect(() => {
    if (verificationInitiated.current) return;

    if (!paymentId) {
      setStatus("failed");
      setErrorMessage("Missing payment reference in redirect parameters.");
      return;
    }

    verificationInitiated.current = true;
    performVerification(paymentId, adId || undefined);
  }, [paymentId, adId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        {status === "verifying" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse" />
        )}
        {status === "success" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        )}
        {status === "failed" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
        )}

        <div className="p-8 sm:p-10 text-center">
          
          {/* 1. Verifying State */}
          {status === "verifying" && (
            <div className="space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Verifying Payment</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Checking transaction reference on Flutterwave. Please do not close or reload this page...
                </p>
              </div>
            </div>
          )}

          {/* 2. Success State */}
          {status === "success" && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Campaign Activated!</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Thank you! Your payment was verified successfully. Your campaign is now live on ED-Library.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/advertise/dashboard"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl transition shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 text-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* 3. Failed State */}
          {status === "failed" && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                <XCircle size={36} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Verification Failed</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {errorMessage || "We were unable to complete verification for your campaign payment."}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {paymentId && (
                  <button
                    onClick={() => performVerification(paymentId, adId || undefined)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Try Again</span>
                  </button>
                )}
                <Link
                  href="/advertise/dashboard"
                  className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-sm flex items-center justify-center gap-1.5"
                >
                  <Home size={14} />
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
