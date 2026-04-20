"use client";

import React from "react";
import { TrendingUp, Star, UserPlus, ArrowLeft } from "lucide-react";
import AnalyticsChart from "@/components/AnalyticsChart2";
import deskImg from "@/assets/images/desk.webp";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  // Dummy data (replace later with real backend)

  const router = useRouter()
  const visitsData = {
    mon: 120,
    tue: 210,
    wed: 180,
    thu: 260,
    fri: 300,
    sat: 220,
    sun: 340,
  };

  const followersData = {
    mon: 1000,
    tue: 1050,
    wed: 1100,
    thu: 1150,
    fri: 1180,
    sat: 1220,
    sun: 1240,
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col text-gray-900">


      {/* Main */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4">
        <div className="max-w-7xl mx-auto pb-3 flex items-center justify-between">
  
  {/* Left: Back Button + Title */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => router.back()}
      className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
    >
      <ArrowLeft size={20} />
    </button>

    <h1 className="text-xl font-bold tracking-tight font-serif">
      Deep Analytics
    </h1>
  </div>

  {/* Right placeholder (keeps balance if you add actions later) */}
  <div className="w-8" />
</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">

          {/* Daily Reach */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Daily Reach & Visits</h2>
                <p className="text-sm text-gray-500">Past 7 days</p>
              </div>

              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                <TrendingUp size={12} />
                <span>+12%</span>
              </div>
            </div>

            <AnalyticsChart visitsPerDay={visitsData} />
          </div>

          {/* Followers Growth */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col">
            <div className="mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase">
                Followers Growth
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold">1,240</span>
                <span className="text-xs text-emerald-500">+45</span>
              </div>
            </div>

            <AnalyticsChart visitsPerDay={followersData} />
          </div>

          {/* Top Course */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
  
  {/* Thumbnail */}
  <div className="relative h-36 w-full">
    <img
      src={deskImg.src}
      alt="Course thumbnail"
      className="w-full h-full object-cover"
    />

    {/* Overlay gradient for readability */}
    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

    {/* Top badges */}
    <div className="absolute top-3 left-3 right-3 flex justify-between items-start" style={{marginTop: 10}}>
      <span className="text-[10px] font-semibold text-white uppercase tracking-wide bg-black/40 backdrop-blur px-3 py-1 rounded" style={{marginRight: 10}}>
        Top Rated
      </span>

      <span className="bg-white text-gray-900 text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-sm" style={{paddingRight: 10, paddingLeft: 10}}>
        4.8 <Star size={12} />
      </span>
    </div>
  </div>

  {/* Content */}
  <div className="p-5">
    <h2 className="text-base font-semibold text-gray-900 mb-1 leading-snug">
      Advanced Macroeconomics
    </h2>

    <p className="text-sm text-gray-500 leading-relaxed">
      High engagement and strong ratings across multiple modules.
    </p>
  </div>
</div>

          {/* Earnings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 md:col-span-2 xl:col-span-1">
  
  {/* Header */}
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-lg font-semibold">Earnings</h2>
      <p className="text-sm text-gray-500">Recent activity</p>
    </div>

    <Link className="text-sm font-medium text-blue-600 hover:underline" href="/contributor/dashboard/subscriptions-and-earnings">
      See all
    </Link>
  </div>

  {/* Total */}
  <div className="text-right mb-6">
    <p className="text-xs text-gray-500 uppercase">Total</p>
    <p className="text-3xl font-bold tracking-tight">₦4,850</p>
  </div>

  {/* Transactions */}
  <div className="space-y-4">

    {/* Transaction 1 */}
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <UserPlus size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Solomon subscribed
          </p>
          <p className="text-xs text-gray-500">Today</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-emerald-600">
        +₦450
      </span>
    </div>

    {/* Transaction 2 */}
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center">
        <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <UserPlus size={16} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Emma purchased course
          </p>
          <p className="text-xs text-gray-500">Yesterday</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-emerald-600">
        +₦120
      </span>
    </div>

  </div>
</div>

        </div>
      </main>
    </div>
  );
}