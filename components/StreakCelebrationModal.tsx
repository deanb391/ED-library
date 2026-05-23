"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  dayName: string;
}

export default function StreakCelebrationModal({
  isOpen,
  onClose,
  currentStreak,
  dayName,
}: StreakCelebrationModalProps) {
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

  // Days of the week for the progress row
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIndex = new Date().getDay(); // 0=Sun
  const dayMap: Record<number, number> = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
  const todayWeekIndex = dayMap[todayIndex];

  const getMessage = () => {
    if (currentStreak === 1) return "You just started your upload streak!";
    if (currentStreak < 5) return "Great start! Keep it going!";
    if (currentStreak < 10) return "You're on fire! Don't stop now!";
    if (currentStreak < 30) return "Incredible dedication! You're unstoppable!";
    return "Legendary streak! You're a true champion!";
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden"
        style={{
          transform: animateIn ? "scale(1)" : "scale(0.8)",
          opacity: animateIn ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          paddingTop: 60,
          paddingBottom: 30,
          maxWidth: 500
        }}
      >
        {/* Close */}
        <button
          style={{ marginTop: -40 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 transition"
        >
          <X size={18} style={{ color: "black" }} />
        </button>

        {/* Gradient top */}
        <div
          className="relative pt-10 pb-8 text-center"
          style={{
            background: "linear-gradient(135deg, #FF6B35 0%, #FF4500 50%, #FF8C00 100%)",
          }}
        >
          {/* Confetti particles */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: i % 2 === 0 ? 8 : 6,
                  height: i % 2 === 0 ? 8 : 6,
                  borderRadius: i % 3 === 0 ? "50%" : "2px",
                  backgroundColor: ["#FFD700", "#FF69B4", "#00CED1", "#7FFF00", "#FF6347", "#BA55D3"][i % 6],
                  left: `${8 + (i * 8)}%`,
                  top: `${10 + (i % 4) * 20}%`,
                  animation: `confettiFall ${2 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>

          {/* Fire icon with bounce */}
          <div
            style={{
              fontSize: 64,
              lineHeight: 1,
              animation: "streakBounce 1s ease-in-out infinite",
              filter: "drop-shadow(0 4px 12px rgba(255, 69, 0, 0.4))",
            }}
          >
            🔥
          </div>

          {/* Streak count */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              marginTop: 8,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            Day {currentStreak}!
          </div>

          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            {dayName}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-2 text-center mt-6">
          <p className="text-gray-700 font-semibold text-base mb-1">
            {getMessage()}
          </p>
          <p className="text-gray-400 text-xs">
            Upload notes every day to build your streak
          </p>
        </div>

        {/* Week progress dots */}
        <div className="flex justify-center gap-3 px-6 py-4">
          {weekDays.map((day, i) => {
            const isToday = i === todayWeekIndex;
            const isPast = i < todayWeekIndex;
            const isFilled = isToday || (isPast && currentStreak > (todayWeekIndex - i));

            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    backgroundColor: isFilled
                      ? isToday ? "#FF4500" : "#FF8C00"
                      : "#F3F4F6",
                    color: isFilled ? "white" : "#9CA3AF",
                    border: isToday ? "2px solid #FF4500" : "2px solid transparent",
                    transition: "all 0.3s",
                    transform: isToday ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {isFilled ? "✓" : ""}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: isToday ? "#FF4500" : "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #FF4500)",
              boxShadow: "0 4px 14px rgba(255, 69, 0, 0.3)",
            }}
          >
            Keep Going! 🚀
          </button>
        </div>

        <style jsx>{`
          @keyframes streakBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-12px) scale(1.1); }
          }
          @keyframes confettiFall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            20% { opacity: 0.9; }
            100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
