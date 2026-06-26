"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, Trophy, Clock, ArrowRight, UserCheck, BarChart2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

interface ContributorInfo {
  $id: string;
  username: string;
  institution: string;
  profileImage?: string;
  joinedContestAt?: string;
}

export default function ContestLeaderboardPage() {
  const { user, contributor, loading: userLoading } = useUser();
  const [contestants, setContestants] = useState<ContributorInfo[]>([]);
  const [loadingContestants, setLoadingContestants] = useState(true);

  // Time tracking states
  const [startDate, setStartDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("contributor_contest_start_date");
      if (stored) return new Date(stored);
    }
    return new Date("2026-06-29T00:00:00");
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPastStart: false,
  });

  // Calculate timer
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = startDate.getTime() - now.getTime();
      const pastStart = difference <= 0;

      if (pastStart) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPastStart: true });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, isPastStart: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Sync with localStorage modifications (Simulator updates)
  useEffect(() => {
    const syncTime = () => {
      const storedDate = localStorage.getItem("contributor_contest_start_date");
      if (storedDate) {
        setStartDate(new Date(storedDate));
      } else {
        setStartDate(new Date("2026-06-29T00:00:00"));
      }
    };
    window.addEventListener("storage", syncTime);
    return () => window.removeEventListener("storage", syncTime);
  }, []);

  // Fetch joined contestants
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const res = await fetch("/api/contest/contributors");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.contributors)) {
            setContestants(data.contributors);
          }
        }
      } catch (err) {
        console.error("Failed to load contest contributors:", err);
      } finally {
        setLoadingContestants(false);
      }
    };

    fetchContestants();
  }, []);

  const dashboardHref = user ? `/contributor/dashboard/${user.$id}` : "/";

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Leaderboard Screen Inner Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

        {/* --- Top Navigation & Header --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-100 transition no-underline"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Dashboard
          </Link>

          {/* Conditional View Performance Button */}
          {contributor && contributor.joinedContest && (
            <Link
              href="/contest/performance"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:scale-[1.02] no-underline text-xs md:text-sm"
            >
              <BarChart2 size={16} />
              View Performance
            </Link>
          )}
        </div>

        {/* --- Hero / Contest Branding --- */}
        <div className="text-center sm:text-left mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            🏆 Contributor Challenge Leaderboard
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Contest Arena Standing
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Meet the active academic contributors enrolled in the 30-Day challenge. All participants start on equal footing.
          </p>
        </div>

        {/* --- LEADERBOARD TABLE CONTAINER --- */}
        <div className={`relative bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl ${!timeLeft.isPastStart ? 'min-h-[480px]' : ''}`}>

          {/* Table Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base">Participating Contributors</h3>
            <span className="text-xs bg-slate-800 text-slate-400 py-1 px-3 rounded-full font-semibold">
              {contestants.length} Enrolled
            </span>
          </div>

          {/* Table Content */}
          {loadingContestants ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-solid mb-3" />
              <p className="text-xs text-slate-400">Loading scoreboard...</p>
            </div>
          ) : contestants.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-400">No contributors have enrolled yet.</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to join the arena!</p>
              <Link href="/contest" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold mt-4">
                Join Contest Landing Page <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-500 text-xs uppercase tracking-wider font-extrabold">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Contributor</th>
                    <th className="px-6 py-4">Institution</th>
                    <th className="px-6 py-4 text-right">Contest Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm">
                  {contestants.map((contestantItem, index) => {
                    const rank = index + 1;
                    return (
                      <tr key={contestantItem.$id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${rank === 1 ? 'bg-amber-400 text-slate-950 font-black' :
                              rank === 2 ? 'bg-slate-300 text-slate-900' :
                                rank === 3 ? 'bg-amber-600 text-white' : 'text-slate-400 bg-slate-800/50'
                            }`}>
                            {rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex shrink-0">
                              {contestantItem.profileImage ? (
                                <img src={contestantItem.profileImage} alt={contestantItem.username} className="w-full h-full object-cover" />
                              ) : (
                                <div className="m-auto text-xs font-bold text-indigo-400">
                                  {contestantItem.username.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-white">{contestantItem.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">
                          {contestantItem.institution || "Other"}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-slate-305">
                          0 pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* --- Pre-Start State Inactive Overlay --- */}
          {!timeLeft.isPastStart && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-full max-w-md bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Visual indicator */}
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                
                <h4 className="text-lg sm:text-xl font-black text-white mb-2">The Contest has not started yet</h4>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  The leaderboard dashboard is currently frozen. Rankings and scorecards will unlock once the challenge officially launches.
                </p>

                {/* Floating Ticking Timer */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl py-3 px-6 mb-4 max-w-xs mx-auto">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    Contest Starts In
                  </div>
                  <div className="font-mono text-base sm:text-lg font-extrabold text-amber-300 tracking-wider">
                    {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/contest"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold underline transition"
                  >
                    View Challenge Details <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
