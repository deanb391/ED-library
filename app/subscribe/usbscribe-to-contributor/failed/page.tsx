"use client";

import React from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "@/components/useRouter";

const BRAND_BLUE = "#1C64F2";

export default function SubscriptionFailedPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-3 font-sans">

      {/* Main Failed Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800 p-5 w-full max-w-[360px] flex flex-col items-center text-center">

        {/* Icon Container */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: "#FEE2E2" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "#EF4444" }}
          >
            <X size={32} className="text-white" strokeWidth={3.5} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
          Payment<br />Failed
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed px-2 mb-8">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">

            <button
              className="w-full text-white font-bold text-lg py-4 px-4 rounded-xl shadow-sm transition-transform active:scale-[0.98] leading-tight"
              style={{ backgroundColor: BRAND_BLUE }}
              onClick={() => router.back()}
            >
              Try Again
            </button>


          <Link href="/home" className="w-full">
            <button className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-900 dark:text-white font-extrabold text-lg py-4 rounded-xl transition-colors active:scale-[0.98]">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}