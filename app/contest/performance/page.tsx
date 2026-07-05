"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, BarChart2, Star, Users, Calendar, Coins, TrendingUp, BookOpen, Calculator, Info, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";
import { ContestPerformance } from "@/lib/services/contest_performance.service";

export default function ContributorPerformancePage() {
  const { user, contributor, loading: userLoading, contributorLoading } = useUser();

  // Interactive Projected Reward Calculator State
  const [estimatedShare, setEstimatedShare] = useState(10); // Percentage share (10%)
  const [estimatedPool, setEstimatedPool] = useState(150000); // Pool amount (₦150,000)

  // Real performance data state
  const [performance, setPerformance] = useState<ContestPerformance | null>(null);
  const [perfLoading, setPerfLoading] = useState(true);

  // Compute current day key
  const [dayKey, setDayKey] = useState("day 1");
  useEffect(() => {
    const startDate = new Date("2026-06-29T12:00:00Z");
    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setDayKey(`day ${dayNumber}`);
  }, []);

  // Calendar accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dailyPoints: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calendarMetrics = [
    { id: 'dailyPoints', title: 'Total Daily Points', dataKey: 'dailyPoints', maxVal: 100 },
    { id: 'newUsers', title: 'Acquisition (New Users)', dataKey: 'newUsers', maxVal: 10 },
    { id: 'uniqueUsersReached', title: 'Engagement (Active Users)', dataKey: 'uniqueUsersReached', maxVal: 20 },
    { id: 'uploadsCreated', title: 'Uploads Created', dataKey: 'uploadsCreated', maxVal: 20 },
    { id: 'coursesPoints', title: 'Courses Created', dataKey: 'coursesPoints', maxVal: 40 },
  ];

  useEffect(() => {
    if (contributor && contributor.joinedContest) {
      const fetchPerf = async () => {
        try {
          const res = await fetch(`/api/contest/performance?contributorId=${contributor.$id}`);
          if (res.ok) {
            const data = await res.json();
            setPerformance(data.performance);
          }
        } catch (err) {
          console.error("Failed to fetch performance:", err);
        } finally {
          setPerfLoading(false);
        }
      };
      fetchPerf();
    } else {
      setPerfLoading(false);
    }
  }, [contributor]);

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
            <div className="text-2xl font-black text-indigo-400">{contributor.followers || 0}</div>
            <div className="text-[10px] text-slate-500 mt-2">Active student audience size.</div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Contest Points</div>
            <div className="text-2xl font-black text-amber-300">{perfLoading ? "..." : (performance?.totalPoints || 0)} pts</div>
            <div className="text-[10px] text-slate-500 mt-2">Your total verified points.</div>
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
              { 
                title: "Acquisition (New Users)", 
                value: perfLoading ? "..." : `${JSON.parse(performance?.newUsers || "{}")[dayKey] || 0} Users`, 
                maxVal: "50 pts", 
                desc: "New users brought into the platform.", 
                formula: "New Users × 5",
                calculated: Math.min(50, (JSON.parse(performance?.newUsers || "{}")[dayKey] || 0) * 5)
              },
              { 
                title: "Engagement (Active Learning)", 
                value: perfLoading ? "..." : `${JSON.parse(performance?.uniqueUsersReached || "{}")[dayKey] || 0} Users`, 
                maxVal: "40 pts", 
                desc: "Unique engaged users per day.", 
                formula: "Engaged Users × 2",
                calculated: Math.min(40, (JSON.parse(performance?.uniqueUsersReached || "{}")[dayKey] || 0) * 2)
              },
              { 
                title: "Content (Uploads & Courses)", 
                value: perfLoading ? "..." : `${JSON.parse((performance as any)?.uploadsCreated || "{}")[dayKey] || 0} U, ${JSON.parse((performance as any)?.coursesPoints || "{}")[dayKey] || 0} C`, 
                maxVal: "10 pts", 
                desc: "Quality and quantity of academic content created.", 
                formula: "(Uploads × 0.5) + (Courses × 0.25)",
                calculated: Math.min(10, ((JSON.parse((performance as any)?.uploadsCreated || "{}")[dayKey] || 0) * 0.5) + ((JSON.parse((performance as any)?.coursesPoints || "{}")[dayKey] || 0) * 0.25))
              }
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
                  <div className="text-xs text-slate-400 mt-0.5">
                    {perfLoading ? "0.0" : metric.calculated.toFixed(1)} pts
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* --- 30-DAY CALENDAR VIEW --- */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 mb-8">
          <h3 className="font-extrabold text-white text-base mb-2 flex items-center gap-2">
            <Calendar className="text-pink-400" size={18} /> 15-Day Performance Calendar
          </h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Visualize your daily progress across all parameters throughout the duration of the contest.
          </p>

          <div className="space-y-4">
            {calendarMetrics.map((metric) => {
              const isExpanded = expandedSections[metric.id];
              const parsedData = perfLoading ? {} : JSON.parse((performance as any)?.[metric.dataKey] || "{}");

              return (
                <div key={metric.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => toggleSection(metric.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-900/50 transition outline-none"
                  >
                    <div className="font-bold text-sm text-slate-200">{metric.title}</div>
                    <div className="text-slate-500">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-850/50">
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const dayNum = i + 1;
                          const dKey = `day ${dayNum}`;
                          const val = parsedData[dKey] || 0;
                          
                          const intensity = Math.min(100, Math.max(0, (val / (metric.maxVal || 1)) * 100));
                          
                          return (
                            <div 
                              key={dayNum} 
                              className="aspect-square flex flex-col items-center justify-center rounded-xl border border-slate-800/80 transition-colors duration-300"
                              style={{ 
                                backgroundColor: val > 0 ? `rgba(99, 102, 241, ${0.1 + (intensity * 0.7 / 100)})` : 'transparent',
                                borderColor: val > 0 ? 'rgba(99, 102, 241, 0.3)' : ''
                              }}
                            >
                              <span className="text-[10px] text-slate-500 mb-0.5">D{dayNum}</span>
                              <span className="text-xs font-bold text-slate-300">
                                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>



      </div>
    </div>
  );
}
