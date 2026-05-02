"use client"

import React from 'react';
import deskImg from "@/assets/images/desk.webp";
import {
  Bell,
  BookOpen,
  Banknote,
  Wallet,
  ShieldCheck,
  Lock,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BecomeContributorPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-gray-900 flex flex-col py-5">

      {/* --- Main Content --- */}
      <main
        className="flex-grow max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20 w-full space-y-20"
        style={{ marginTop: 20 }}
      >

        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6" style={{ marginBottom: 20 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Become a Contributor
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
            Share your knowledge, create structured courses, and earn from your notes.
            Join a community of elite scholars and monetize your academic expertise.
          </p>
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-start text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Structured Courses</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Organize your materials into professional modules. Upload PDFs, lecture notes, and interactive guides with ease.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-start text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Banknote size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Monetization</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Choose your model: set courses as free to build your brand, or offer paid access via one-time purchases and subscriptions.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-start text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Fees</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Keep the lion's share. ED-Library takes a flat 15% platform fee from money earned on your courses and a nominal 5% transaction fee per withdrawal.
            </p>
          </div>
        </div>

        {/* Approval Roadmap Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 40,
            paddingTop: 32
          }}
        >

          {/* Left: Image */}
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              flex: "0 0 auto",
              borderRadius: 24,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              marginTop: 20,
              marginBottom: 50
            }}
          >
            <img
              src={deskImg.src}
              alt="Desk lamp illuminating a study area"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.9,
                transition: "transform 0.7s ease",
              }}
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-8">
              <h4 className="text-white text-2xl font-bold mb-2">Knowledge is Value</h4>
              <p className="text-gray-300 text-sm font-medium">Start your journey today.</p>
            </div>
          </div>

          {/* Right: Roadmap */}
          <div
            style={{
              flex: 1,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: 40,
              paddingLeft: 20
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                The Road to Approval
              </h2>
              <p className="text-gray-500 text-base leading-relaxed">
                We maintain the highest academic standards to ensure student success and contributor reputation.
              </p>
            </div>

            <div className="space-y-8" style={{ marginBottom: 40 }}>
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 text-blue-600">
                  <ShieldCheck size={24} fill="currentColor" className="text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Content Quality Review</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Every course undergoes a rigorous check for clarity, accuracy, and formatting before going live.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 text-blue-600">
                  <Lock size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Approval Requirement</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Verify your credentials and submit a sample module to get started on the platform.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="mt-1 text-blue-600">
                  <TrendingUp size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">Earnings Model</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Withdraw your earnings monthly. Track every sale and subscription through your contributor dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calls to Action */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-12 pb-8">
          <button
            style={{
              width: "100%",
              maxWidth: 620,
              padding: "14px 18px",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              transition: "transform 120ms ease, box-shadow 10ms ease",
              willChange: "transform"
            }}
            onClick={() =>
              router.push("/onboarding/step-1")
            }
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onTouchStart={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
            }}
            onTouchEnd={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            Start Application
          </button>

          <button
            style={{
              width: "100%",
              maxWidth: 620,
              padding: "14px 18px",
              background: "#f3f4f6",
              color: "#111827",
              fontWeight: 700,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              marginTop: 25,
              marginBottom: 10,
              transition: "transform 120ms ease",
              willChange: "transform"
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            onTouchStart={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.90)";
            }}
            onTouchEnd={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            Learn how earnings work
          </button>

          <span
            className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mt-4"
            style={{ marginBottom: 20 }}
          >
            No upfront costs to join
          </span>
        </div>

      </main>
    </div>
  );
}