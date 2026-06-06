"use client";

import React, { useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/components/useRouter";

export default function ApplicationUnderReviewPage() {
  const { user, contributor, refetchContributor } = useUser();

  const dashboardHref = contributor ? `/contributor/dashboard/${contributor.$id}` : "/";

  useEffect(() => {
    const refetch = async () => {
      await refetchContributor();
    };

    refetch();
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col text-gray-900">
      <main className="grow flex flex-col items-center justify-center px-4 w-full max-w-3xl mx-auto" style={{ paddingTop: 40 }}>


        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 mb-3">
            Application Under Review
          </h1>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-md mx-auto">
            We are reviewing your submission to ensure it meets quality and academic standards.
          </p>
        </div>

        {/* CARD */}
        <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm" style={{ marginTop: 25 }}>

          {/* STATUS HEADER */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
              Verification Status
            </span>
            <div style={{ backgroundColor: 'yellow', paddingRight: 10, paddingLeft: 10, paddingTop: 1, paddingBottom: 2, borderRadius: 20 }}>
              <span className="text-sm font-medium text-gray-600">
                pending
              </span>
            </div>

          </div>

          {/* PROGRESS BAR */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: "45%" }}
            />
          </div>

          {/* INFO BOX */}
          <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <Clock size={18} className="text-gray-400 mt-0.5" />

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-900">
                Review Timeline
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Reviews typically take <span className="text-gray-900 font-medium">24–72 hours</span>.
                You’ll be notified once your application is approved.
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="w-full flex flex-col items-center gap-4 mt-10">

          <Link href={dashboardHref} className="w-full max-w-[260px]">
            <button className="w-full bg-blue-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-blue-700 active:scale-[0.90] transition-all">
              Return to Dashboard
            </button>
          </Link>

          <button className="text-sm text-gray-500 hover:text-gray-900 transition">
            Contact support
          </button>
        </div>
      </main>
    </div>
  );
}
