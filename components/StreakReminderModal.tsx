"use client";

import React, { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";
import Link from "next/link";

interface StreakReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasStreak: boolean;
  currentStreak: number;
}

export default function StreakReminderModal({
  isOpen,
  onClose,
  hasStreak,
  currentStreak,
}: StreakReminderModalProps) {
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
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden"
        style={{
          transform: animateIn ? "scale(1) translateY(0)" : "scale(0.95) translateY(10px)",
          opacity: animateIn ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          paddingTop: 40,
          paddingBottom: 20,
          maxWidth: 600
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 transition"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="px-6 pt-8 pb-2 text-center">
          {/* Animated icon */}
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              marginBottom: 16,
              animation: hasStreak
                ? "reminderShake 0.8s ease-in-out infinite"
                : "reminderPulse 1.5s ease-in-out infinite",
            }}
          >
            {hasStreak ? "🔥" : "🚀"}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {hasStreak
              ? `Don't lose your ${currentStreak}-day streak!`
              : "Start your upload streak!"}
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed mb-1">
            {hasStreak
              ? "You haven't uploaded today yet. Upload a note to keep your streak alive!"
              : "Upload your first note today and begin building your streak. Consistency is key!"}
          </p>
        </div>

        {/* Streak visual */}
        {hasStreak && (
          <div className="flex justify-center items-center gap-2 px-6 py-3">
            <div
              className="flex items-center gap-1.5 px-4 py-2 rounded-full"
              style={{
                background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
                border: "1px solid #FFE0B2",
              }}
            >
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#FF4500" }}>
                {currentStreak}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#E65100" }}>
                days
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 pt-3 flex flex-col gap-2.5">
          <Link
            href="/contributor/dashboard/upload"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white text-center transition active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              background: hasStreak
                ? "linear-gradient(135deg, #FF6B35, #FF4500)"
                : "linear-gradient(135deg, #3B82F6, #2563EB)",
              boxShadow: hasStreak
                ? "0 4px 14px rgba(255, 69, 0, 0.25)"
                : "0 4px 14px rgba(59, 130, 246, 0.25)",
            }}
          >
            <Upload size={16} />
            Upload Now
          </Link>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Maybe Later
          </button>
        </div>

        <style jsx>{`
          @keyframes reminderShake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-8deg); }
            75% { transform: rotate(8deg); }
          }
          @keyframes reminderPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
      </div>
    </div>
  );
}
