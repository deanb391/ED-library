"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";
import { ChevronLeft, Trophy, Search, Save, Check } from "lucide-react";
import Link from "next/link";
import { Contributor } from "@/lib/services/contributors.service";
import { ContestPerformance } from "@/lib/services/contest_performance.service";

export default function ContestScoringAdminPage() {
  const { user, loading: userLoading } = useUser();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [performances, setPerformances] = useState<ContestPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute current day key
  const [dayKey, setDayKey] = useState("day 1");
  useEffect(() => {
    const startDate = new Date("2026-06-27T00:00:00Z");
    const diffTime = Math.max(0, new Date().getTime() - startDate.getTime());
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setDayKey(`day ${dayNumber}`);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contRes, perfRes] = await Promise.all([
        fetch("/api/contest/contributors"),
        fetch("/api/admin/contest-performance")
      ]);
      const contData = await contRes.json();
      const perfData = await perfRes.json();

      if (contRes.ok) setContributors(contData.contributors || []);
      if (perfRes.ok) setPerformances(perfData.performances || []);
    } catch (err) {
      console.error("Failed to fetch scoring data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const handleScoreSubmit = async (contributorId: string, score: number) => {
    try {
      const res = await fetch("/api/admin/contest-scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contributorId, dayKey, score })
      });
      if (res.ok) {
        // Refresh local data
        await fetchData();
      } else {
        alert("Failed to submit score");
      }
    } catch (err) {
      console.error("Score submit error:", err);
      alert("Error submitting score");
    }
  };

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) return <AccessWall type="admin" />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Navigation */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-6"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Back to Admin Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Trophy className="text-amber-500" size={28} /> Contest Scoring
              </h1>
              <p className="text-gray-600">Review content and score contributors manually for {dayKey}. Max 15 points.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Day</span>
              <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{dayKey.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Scoring Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search contributors..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Contributor</th>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4 text-center">Score ({dayKey})</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading data...</td>
                  </tr>
                ) : contributors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No contributors enrolled yet.</td>
                  </tr>
                ) : (
                  contributors.map((contributor) => {
                    const perf = performances.find(p => p?.contributors === contributor.$id);
                    const uploadQuality = JSON.parse(perf?.uploadQuality || "{}");
                    const currentScore = uploadQuality[dayKey];
                    const isScored = currentScore !== undefined;

                    return (
                      <ScoringRow
                        key={contributor.$id}
                        contributor={contributor}
                        currentScore={currentScore}
                        isScored={isScored}
                        onSubmit={(score) => handleScoreSubmit(contributor.$id, score)}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function ScoringRow({
  contributor,
  currentScore,
  isScored,
  onSubmit
}: {
  contributor: Contributor,
  currentScore: number | undefined,
  isScored: boolean,
  onSubmit: (score: number) => void
}) {
  const [score, setScore] = useState<number | string>(isScored ? currentScore! : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 15) {
      alert("Please enter a valid score between 0 and 15");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(numScore);
    setIsSubmitting(false);
  };

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 font-medium text-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
            {contributor.username?.substring(0, 2) || "CO"}
          </div>
          <div>
            <div>{contributor.username || "Unknown"}</div>
            <div className="text-xs text-gray-400 font-normal">{contributor.category}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-500">
        {contributor.institution || "-"}
      </td>
      <td className="px-6 py-4 text-center">
        <input
          type="number"
          min="0"
          max="15"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="0-15"
          className="w-20 px-2 py-1.5 text-center border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium text-gray-900"
        />
      </td>
      <td className="px-6 py-4 text-right">
        {isScored && score === currentScore ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
            <Check size={14} /> Scored
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || score === ""}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
          >
            <Save size={14} /> {isSubmitting ? "Saving..." : "Save"}
          </button>
        )}
      </td>
    </tr>
  );
}
