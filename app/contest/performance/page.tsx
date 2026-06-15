"use client";

import React, { useState } from "react";
import { ChevronLeft, BarChart2, Star, Users, Calendar, Coins, TrendingUp, BookOpen, Calculator, Info, Trophy } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";

export default function ContributorPerformancePage() {
  const { user, contributor, loading: userLoading, contributorLoading } = useUser();

  // Interactive Projected Reward Calculator State
  const [estimatedShare, setEstimatedShare] = useState(10); // Percentage share (10%)
  const [estimatedPool, setEstimatedPool] = useState(150000); // Pool amount (₦150,000)

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-slate-100 px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 border-solid mb-4" />
        <p className="text-xs text-slate-400">Loading performance data...</p>
      </div>
    );
  }

  // Auth walls
  if (!user) return <AccessWall type="user" />;
  if (!contributor) return <AccessWall type="contributor" />;
  
  // Guard access if they haven't joined yet
  if (!contributor.joinedContest) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Trophy size={28} />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2">Arena Access Locked</h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            You must join the Contributor Challenge first before you can view your personal performance dashboard.
          </p>
          <Link
            href="/contest"
            className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-bold py-3.5 px-6 rounded-2xl transition shadow-md shadow-amber-500/10 no-underline text-sm uppercase tracking-wider"
          >
            Go Join Contest
          </Link>
        </div>
      </div>
    );
  }

  // Calculate projected earnings
  const projectedEarnings = (estimatedShare / 100) * estimatedPool;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-20 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* --- Top Navigation --- */}
        <div className="mb-8">
          <Link
            href="/contest/leaderboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-100 transition no-underline"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Back to Leaderboard
          </Link>
        </div>

        {/* --- Header / Title --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BarChart2 className="text-indigo-400" size={28} />
              My Challenge Performance
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your daily stats, progress points, and estimated cash share in the Contributor Challenge.
            </p>
          </div>

          {/* Quick stats badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl py-2.5 px-5 flex items-center gap-3 shrink-0 self-start md:self-center">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <div className="text-xs">
              <span className="text-slate-400">Contest Status:</span>{" "}
              <span className="text-emerald-400 font-bold uppercase">Enrolled</span>
            </div>
          </div>
        </div>

        {/* --- PERFORMANCE SUMMARY GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Uploads</div>
            <div className="text-2xl font-black text-white">{contributor.uploadCount || 0}</div>
            <div className="text-[10px] text-slate-500 mt-2">Courses/documents uploaded.</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Followers</div>
            <div className="text-2xl font-black text-indigo-450 text-indigo-400">{contributor.followers || 0}</div>
            <div className="text-[10px] text-slate-500 mt-2">Active student audience size.</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Contest Points</div>
            <div className="text-2xl font-black text-amber-300">0 pts</div>
            <div className="text-[10px] text-slate-500 mt-2">Points are currently frozen at 0.</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Points Share</div>
            <div className="text-2xl font-black text-slate-300">0.00%</div>
            <div className="text-[10px] text-slate-500 mt-2">Your contribution to overall scores.</div>
          </div>

        </div>

        {/* --- ANALYTICS CATEGORY BREAKDOWN --- */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 mb-8">
          <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
            <Star className="text-amber-400" size={18} /> Daily Points Analytics
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Your points are assessed every midnight across five parameters. Upload content regularly to drive user engagement.
          </p>

          <div className="space-y-4">
            
            {[
              { title: "New Users Generated", value: "0 Referrals", maxVal: "30 pts", desc: "Signups driven by your unique referral code.", formula: "(Your referrals ÷ Highest referrals) × 30" },
              { title: "Unique Students Reached", value: "0 Views", maxVal: "30 pts", desc: "Distinct student sessions reviewing your assets.", formula: "(Your views ÷ Highest reach) × 30" },
              { title: "Returning Students", value: "0 Return Views", maxVal: "20 pts", desc: "Students consulting your courses repeatedly.", formula: "(Your return count ÷ Highest return count) × 20" },
              { title: "Quality Content Uploads", value: "Pending evaluation", maxVal: "15 pts", desc: "Score awarded by our editorial board.", formula: "Assessed quality index (0 to 15)" },
              { title: "Courses Created", value: "0 Courses", maxVal: "5 pts", desc: "Full structured unit courses completed.", formula: "(Your course count ÷ Highest courses) × 5" }
            ].map((metric, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-950/45 border border-slate-850 rounded-2xl gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-3 mb-1">
                    <h4 className="text-sm font-extrabold text-white">{metric.title}</h4>
                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">{metric.maxVal} max</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-2 sm:mb-0">{metric.desc}</p>
                  <code className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 inline-block mt-1">
                    {metric.formula}
                  </code>
                </div>
                <div className="text-left sm:text-right shrink-0 border-t border-slate-850 pt-2 sm:pt-0 sm:border-0">
                  <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Current Value</div>
                  <div className="text-sm font-black text-amber-300">{metric.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">0.0 pts</div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* --- INTERACTIVE PROJECTED REWARDS ESTIMATOR --- */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6">
          <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
            <Calculator className="text-indigo-400" size={18} /> Projected Rewards Estimator
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Proportional share estimator. Drag the sliders to project cash payouts from the prize pool.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Slider Inputs */}
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-350">Estimated Points Share</label>
                  <span className="text-sm font-black text-indigo-400">{estimatedShare}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={estimatedShare}
                  onChange={(e) => setEstimatedShare(parseInt(e.target.value))}
                  className="w-full bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-550 mt-1">
                  <span>1% share</span>
                  <span>100% share</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-350">Contest Final Prize Pool</label>
                  <span className="text-sm font-black text-emerald-450 text-emerald-400">₦{estimatedPool.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="200000"
                  step="10000"
                  value={estimatedPool}
                  onChange={(e) => setEstimatedPool(parseInt(e.target.value))}
                  className="w-full bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500 outline-none"
                />
                <div className="flex justify-between text-[10px] text-slate-550 mt-1">
                  <span>₦100,000</span>
                  <span>₦200,000</span>
                </div>
              </div>

            </div>

            {/* Payout Display Card */}
            <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Projected Wallet Deposit
                </span>
                <h4 className="text-3xl font-black text-emerald-400 leading-none">
                  ₦{projectedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>

              <div className="flex items-start gap-2.5 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl mt-4">
                <Info size={14} className="text-indigo-450 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-450 leading-relaxed margin-0">
                  This calculation utilizes the contest proportional reward payout formula: <br />
                  <code className="text-amber-300 font-mono text-[9px]">Earnings = (Your Pts ÷ Total Pts) × Pool</code>. Payouts transfer on Day 35.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
