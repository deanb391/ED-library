"use client";

import React from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

// --- Custom Brand Blue extracted from the uploaded image ---
const BRAND_BLUE = "#1C64F2"; 

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-3 font-sans">
      
      {/* Main Success Card */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 p-5 w-full max-w-[360px] flex flex-col items-center text-center">
        
        {/* Icon Container */}
        <div 
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${BRAND_BLUE}25` }} // 25% opacity of the brand blue
        >
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            <Check size={32} className="text-white" strokeWidth={3.5} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
          Subscription<br />Successful
        </h1>
        <p className="text-base text-gray-500 font-medium leading-relaxed px-2 mb-8">
          Your payment has been processed. You now have full access to your curated academic library.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link href="/library" className="w-full">
            <button 
              className="w-full text-white font-bold text-lg py-4 px-4 rounded-xl shadow-sm transition-transform active:scale-[0.98] leading-tight"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              See Subscribed Courses
            </button>
          </Link>

          <Link href="/home" className="w-full">
            <button className="w-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-gray-900 font-extrabold text-lg py-4 rounded-xl transition-colors active:scale-[0.98]">
              Return Home
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}