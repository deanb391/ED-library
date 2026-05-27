"use client";

import React, { useEffect, useState } from "react";
import { X, Flame, Calendar } from "lucide-react";

interface StreakCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  longestStreak: number;
  streakHistory: string[]; // Array of "YYYY-MM-DD"
  joinedDate: string; // "YYYY-MM-DD"
}

export default function StreakCalendarModal({
  isOpen,
  onClose,
  currentStreak,
  longestStreak,
  streakHistory,
  joinedDate,
}: StreakCalendarModalProps) {
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

  const historySet = new Set(streakHistory);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Calculate stats
  const joined = joinedDate ? new Date(joinedDate) : new Date();
  const daysSinceJoined = Math.max(
    1,
    Math.floor((today.getTime() - joined.getTime()) / 86400000) + 1
  );
  const activeDays = streakHistory.length;
  const missedDays = Math.max(0, daysSinceJoined - activeDays);

  // Generate the calendar for the current month
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0
  const daysInMonth = lastDay.getDate();

  const monthName = today.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Build grid cells
  const cells: { day: number | null; dateStr: string }[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    cells.push({ day: null, dateStr: "" });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateStr });
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(17, 24, 39, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 100,
        overflowY: "auto",
        boxSizing: "border-box",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "1.5rem", // 24px
          width: "100%",
          maxWidth: "400px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          transform: animateIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          opacity: animateIn ? 1 : 0,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", // Smooth spring-like curve
          boxSizing: "border-box"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 10,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#f3f4f6",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6b7280",
            transition: "background-color 0.2s ease",
            WebkitTapHighlightColor: "transparent"
          }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header Section */}
        <div style={{ padding: "1.5rem 1.5rem 1rem 1.5rem", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#111827", margin: "0 0 0.25rem 0", letterSpacing: "-0.025em" }}>
            Your Upload Journey
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0 0 1.5rem 0" }}>
            {activeDays} days active • {missedDays} missed • {daysSinceJoined} total
          </p>

          {/* Unified Streak Dashboard */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "1rem",
              padding: "1rem",
              border: "1px solid #e5e7eb"
            }}
          >
            {/* Current Streak */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <div style={{ backgroundColor: "#ffedd5", padding: "0.5rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Flame size={24} color="#ea580c" style={{ animation: "streakPulse 2s ease-in-out infinite" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#ea580c", lineHeight: 1 }}>
                  {currentStreak}
                </div>
                <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem" }}>
                  Current
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "2.5rem", backgroundColor: "#d1d5db" }} />

            {/* Longest Streak */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <div style={{ backgroundColor: "#dcfce7", padding: "0.5rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🏆</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#166534", lineHeight: 1 }}>
                  {longestStreak}
                </div>
                <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "#14532d", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.25rem" }}>
                  Longest
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Calendar size={18} color="#9ca3af" />
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {monthName}
            </span>
          </div>

          {/* Day Labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem", marginBottom: "0.5rem" }}>
            {weekDayLabels.map((label, i) => (
              <div
                key={i}
                style={{ textAlign: "center", fontSize: "0.6rem", fontWeight: "700", color: "#9ca3af" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem" }}>
            {cells.map((cell, i) => {
              if (cell.day === null) {
                return <div key={`empty-${i}`} />;
              }

              const isActive = historySet.has(cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isFuture = cell.dateStr > todayStr;
              const isBeforeJoined = joinedDate && cell.dateStr < joinedDate;

              // Default styles (Missed/Inactive)
              let bg = "#f3f4f6";
              let color = "#9ca3af";
              let border = "2px solid transparent";

              if (isActive) {
                bg = "#f97316"; // Brand Orange
                color = "#ffffff";
              } else if (isToday) {
                bg = "#fff7ed"; // Light Orange Tint
                color = "#ea580c";
                border = "2px solid #f97316";
              } else if (isFuture || isBeforeJoined) {
                bg = "transparent";
                color = "#d1d5db";
              }

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    aspectRatio: "1", // Keeps them perfectly square/circular
                    borderRadius: "50%", // Circular cells look much more premium
                    backgroundColor: bg,
                    color: color,
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    border: border,
                    boxSizing: "border-box"
                  }}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f97316" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280" }}>Uploaded</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#f3f4f6" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280" }}>Missed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", border: "2px solid #f97316", boxSizing: "border-box" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280" }}>Today</span>
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "1rem",
              fontWeight: "700",
              fontSize: "0.9rem",
              color: "#ffffff",
              backgroundColor: "#111827", // Sleek dark button instead of a gradient
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "transform 0.1s ease",
              WebkitTapHighlightColor: "transparent"
            }}
            onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Got it
          </button>
        </div>

        {/* Retained animation for the flame */}
        <style jsx>{`
          @keyframes streakPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
      </div>
    </div>
  );
}
