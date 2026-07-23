"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Users, MousePointerClick, Trophy, Gift, Info } from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { getContestPerformance } from "@/lib/api/contest_performance";
import { getMyContributor } from "@/lib/api/contributors";

export default function ContestReportPage() {
  const router = useRouter();
  const { user } = useUser();
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [finalPrize, setFinalPrize] = useState(0);
  const [isTop3, setIsTop3] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!user?.$id) return;

    const loadData = async () => {
      try {
        const contributor = await getMyContributor(user.$id);

        if (contributor) {
          const cid = contributor.$id;
          const perf = await getContestPerformance(cid!);

          if (perf) {
            const clicksData = JSON.parse(perf.referralClicks || "{}");
            const signupsData = JSON.parse(perf.newUsers || "{}");

            const clicks = Object.values(clicksData).reduce((a: any, b: any) => a + b, 0) as number;
            const signups = Object.values(signupsData).reduce((a: any, b: any) => a + b, 0) as number;

            setTotalClicks(clicks);
            setTotalSignups(signups);
            setTotalPoints(perf.totalPoints || 0);
            setFinalPrize(perf.Prize || 0);
            setIsTop3(perf.isTop3Contributor || false);
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

  const prizeShare = finalPrize - 2500 - (isTop3 ? 5000 : 0);

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
          <h1 className="text-2xl font-bold tracking-tight font-serif flex items-center gap-2">
            <Trophy className="text-amber-500" size={24} /> Contest Report
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Loading your contest report...</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Reward Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Gift className="text-amber-500" size={24} /> Contest Reward
                  </h2>
                </div>

                {totalPoints < 100 ? (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800 mt-4">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      No reward as you didn't cross the 100-point bar.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Keep contributing and participating in future contests to earn rewards!
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Congratulations! Your reward has been credited to your wallet.
                    </p>

                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                      <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Final Prize</p>
                        <p className="text-4xl sm:text-5xl font-black text-green-600 dark:text-green-500 tracking-tight">
                          NGN {finalPrize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="relative inline-block text-left mb-2 md:mb-1">
                        <button
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          onClick={() => setShowTooltip(!showTooltip)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <Info size={14} /> Reward Breakdown
                        </button>

                        {showTooltip && (
                          <div className="absolute bottom-full mt-16 left-0 md:left-auto md:right-0 mb-2 w-72 p-4 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-50 animate-fade-in">
                            <p className="font-semibold mb-2 text-sm border-b border-gray-700 pb-2">Calculation</p>
                            <ul className="space-y-2">
                              <li className="flex justify-between">
                                <span className="text-gray-300">Total Points:</span>
                                <span className="font-mono font-medium">{totalPoints.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-300">Prize Share:</span>
                                <span className="font-mono font-medium">NGN {prizeShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </li>
                              <li className="flex justify-between text-amber-300">
                                <span>Contest Bonus:</span>
                                <span className="font-mono font-medium">+ NGN 2,500.00</span>
                              </li>
                              {isTop3 && (
                                <li className="flex justify-between text-indigo-400">
                                  <span>Top Contributor Bonus:</span>
                                  <span className="font-mono font-medium">+ NGN 5,000.00</span>
                                </li>
                              )}
                              <li className="flex justify-between font-bold pt-2 border-t border-gray-700 mt-2 text-sm text-green-400">
                                <span>Total Prize:</span>
                                <span className="font-mono">NGN {finalPrize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </li>
                            </ul>
                            {/* Little triangle for tooltip */}
                            <div className="absolute top-full left-6 md:left-auto md:right-6 -mt-1 w-3 h-3 bg-gray-900 rotate-45" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">Performance Metrics</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col justify-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0 mb-1">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Points</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {totalPoints.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col justify-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 mb-1">
                  <MousePointerClick size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Link Clicks</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{totalClicks}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col justify-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mb-1">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Successful Sign-ups</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{totalSignups}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
