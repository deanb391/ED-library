"use client";

import React, { useEffect, useState } from "react";
import { X, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { WeeklyAward } from "@/lib/api/rewards";

interface TopContributorAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  award: WeeklyAward;
}

export default function TopContributorAnnouncementModal({
  isOpen,
  onClose,
  award,
}: TopContributorAnnouncementModalProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setAnimateIn(true));
      document.body.style.overflow = "hidden";
    } else {
      setAnimateIn(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden"
        style={{
          transform: animateIn ? "scale(1)" : "scale(0.85)",
          opacity: animateIn ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-900/80 hover:bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition"
        >
          <X size={18} />
        </button>

        {/* Trophy header */}
        <div
          className="relative pt-10 pb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FF8F00 100%)",
          }}
        >
          {/* Sparkles */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  left: `${10 + (i * 12)}%`,
                  top: `${15 + (i % 3) * 25}%`,
                  animation: `sparkle ${1.5 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <div style={{ fontSize: 52, lineHeight: 1, animation: "trophyBounce 2s ease-in-out infinite" }}>
            🏆
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "white",
              marginTop: 12,
              textShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            Top Contributor of the Week
          </h2>
        </div>

        {/* Winner info */}
        <div className="px-6 py-5 text-center">
          {/* Profile image */}
          <div className="flex justify-center mb-3">
            <div
              className="rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg"
              style={{ width: 72, height: 72 }}
            >
              {award.contributorImage ? (
                <img
                  src={award.contributorImage}
                  alt={award.contributorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yellow-100 flex items-center justify-center text-2xl font-bold text-yellow-600">
                  {award.contributorName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {award.contributorName}
          </h3>

          {/* Stats */}
          <div className="flex justify-center gap-4 mt-3">
            <div className="text-center">
              <div style={{ fontSize: 20, fontWeight: 800, color: "#FF8F00" }}>
                {award.weeklyUploads}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>
                This Week
              </div>
            </div>
            <div
              style={{
                width: 1,
                height: 36,
                backgroundColor: "#E5E7EB",
                alignSelf: "center",
              }}
            />
            <div className="text-center">
              <div style={{ fontSize: 20, fontWeight: 800, color: "#6B7280" }}>
                {award.totalUploads}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>
                Total
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2.5">
          <Link
            href={`/contributor/account/${award.contributorId}`}
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white text-center transition active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #FFB300, #FF8F00)",
              boxShadow: "0 4px 14px rgba(255, 143, 0, 0.3)",
            }}
          >
            Check Out Their Courses
            <ArrowRight size={16} />
          </Link>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold text-gray-400 hover:text-gray-600 dark:text-gray-400 transition"
          >
            Dismiss
          </button>
        </div>

        <style jsx>{`
          @keyframes trophyBounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-6px) rotate(-3deg); }
            75% { transform: translateY(-3px) rotate(3deg); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.8); }
          }
        `}</style>
      </div>
    </div>
  );
}
