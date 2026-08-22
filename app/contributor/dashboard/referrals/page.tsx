"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Copy, CheckCircle, Users, MousePointerClick } from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { getContestPerformance } from "@/lib/api/contest_performance";
import { getMyContributor } from "@/lib/api/contributors";



export default function ReferralsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [contributorId, setContributorId] = useState("");
  const [copied, setCopied] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;

    const loadData = async () => {
      try {
        const contributor = await getMyContributor(user.$id);

        if (contributor) {
          const cid = contributor.$id;
          setContributorId(cid!);

          const perf = await getContestPerformance(cid!);

          if (perf) {
            
            const clicksData = JSON.parse(perf.referralClicks || "{}");
            const signupsData = JSON.parse(perf.newUsers || "{}");

            const clicks = Object.values(clicksData).reduce((a: any, b: any) => a + b, 0) as number;
            const signups = Object.values(signupsData).reduce((a: any, b: any) => a + b, 0) as number;

            setTotalClicks(clicks);
            setTotalSignups(signups);
          }
        }
      } catch (err) {
        console.error("Error loading referral data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.$id]);

  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${contributorId}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col text-gray-900 dark:text-white">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="pb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:bg-gray-800 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight font-serif">
            Referrals & Contest Links
          </h1>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading your referral data...</p>
        ) : (
          <div className="space-y-6">
            {/* Referral Link Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-300">Your Unique Referral Link</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Share this link with students. When they create an account, they'll be counted towards your contest referrals.
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400 truncate">
                  {referralUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm shrink-0"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center gap-5 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                  <MousePointerClick size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Link Clicks</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{totalClicks}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex items-center gap-5 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Successful Sign-ups</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{totalSignups}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
