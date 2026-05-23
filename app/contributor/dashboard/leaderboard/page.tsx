"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Medal, ChevronLeft, Crown, Flame } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { fetchLeaderboard, fetchContributorRank, type LeaderboardEntry } from "@/lib/api/rewards";
import AccessWall from "@/components/AccessWall";


const BRAND_BLUE = "#2563EB";

export default function LeaderboardPage() {
  const { user, contributor, loading: userLoading, contributorLoading } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number | null; uploadCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [leaderboardData, rankData] = await Promise.all([
          fetchLeaderboard(50, 0),
          contributor?.$id ? fetchContributorRank(contributor.$id) : Promise.resolve(null),
        ]);
        setEntries(leaderboardData);
        setMyRank(rankData);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading && !contributorLoading) {
      load();
    }
  }, [userLoading, contributorLoading, contributor?.$id]);

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4" />
        <p className="text-gray-700 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <AccessWall type="user" />;
  if (!contributor) return <AccessWall type="contributor" />;

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumColors = [
    { bg: "linear-gradient(135deg, #FFD700, #FFA000)", border: "#FFD700", shadow: "rgba(255, 215, 0, 0.3)" },
    { bg: "linear-gradient(135deg, #C0C0C0, #A0A0A0)", border: "#C0C0C0", shadow: "rgba(192, 192, 192, 0.3)" },
    { bg: "linear-gradient(135deg, #CD7F32, #A0522D)", border: "#CD7F32", shadow: "rgba(205, 127, 50, 0.3)" },
  ];

  const podiumIcons = [
    <Crown key="1" size={18} color="#FFD700" />,
    <Medal key="2" size={18} color="#C0C0C0" />,
    <Medal key="3" size={18} color="#CD7F32" />,
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
      }}
    >
      {/* Header / Hero Section */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
          padding: "2rem 1.5rem 3rem 1.5rem",
          overflow: "hidden",
          boxSizing: "border-box",
          borderBottomLeftRadius: "2rem",
          borderBottomRightRadius: "2rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Subtle glowing orb effect in the background */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-50px", left: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(234,179,8,0.15) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />

        {/* Top Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
          <Link
            href={`/contributor/dashboard/${contributor.$id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(4px)",
              color: "#ffffff",
              textDecoration: "none",
              transition: "background-color 0.2s ease"
            }}
          >
            <ChevronLeft size={20} />
          </Link>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Trophy size={24} color="#facc15" />
              Leaderboard
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", margin: 0, fontWeight: "500" }}>
              Ranked by total uploads
            </p>
          </div>
        </div>

        {/* My Rank Highlight Card */}
        {myRank && myRank.rank && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              position: "relative",
              zIndex: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "2px solid #facc15",
                  overflow: "hidden",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 10px rgba(250, 204, 21, 0.3)"
                }}
              >
                {contributor.profileImage ? (
                  <img src={contributor.profileImage} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#facc15" }}>
                    {contributor.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#ffffff", letterSpacing: "0.025em" }}>Your Rank</span>
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#d1d5db" }}>{myRank.uploadCount} uploads</span>
              </div>
            </div>

            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#facc15", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              #{myRank.rank}
            </div>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%", padding: "0 1rem" }}>

        {/* Top 3 Podium (Overlaps the header slightly) */}
        {top3.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "-2rem",
              marginBottom: "2.5rem",
              position: "relative",
              zIndex: 20
            }}
          >
            {/* Reorder array so visually it sits: 2nd, 1st, 3rd */}
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, visualIndex) => {
              const actualIndex = visualIndex === 0 ? 1 : visualIndex === 1 ? 0 : 2;
              const isFirst = actualIndex === 0;

              // Refined Podium Colors (Gold, Silver, Bronze)
              const podiumColors = [
                { border: "#facc15", bg: "linear-gradient(to bottom, #fef08a, #eab308)", shadow: "rgba(234, 179, 8, 0.4)", text: "#854d0e" }, // 1st Gold
                { border: "#cbd5e1", bg: "linear-gradient(to bottom, #f1f5f9, #94a3b8)", shadow: "rgba(148, 163, 184, 0.4)", text: "#334155" }, // 2nd Silver
                { border: "#fca5a5", bg: "linear-gradient(to bottom, #ffedd5, #f97316)", shadow: "rgba(249, 115, 22, 0.4)", text: "#9a3412" }  // 3rd Bronze
              ];
              const colors = podiumColors[actualIndex];

              return (
                <Link
                  key={entry.contributorId}
                  href={`/contributor/account/${entry.contributorId}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    width: "30%", // Ensures equal spacing
                    position: "relative",
                    transform: isFirst ? "translateY(-10px)" : "translateY(0)", // Pops 1st place up
                    transition: "transform 0.2s ease"
                  }}
                >
                  {/* Crown for 1st */}
                  {isFirst && (
                    <div style={{ position: "absolute", top: "-24px", zIndex: 10 }}>
                      <Crown size={24} color="#facc15" fill="#fef08a" />
                    </div>
                  )}

                  <div style={{ position: "relative" }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: isFirst ? "84px" : "64px",
                        height: isFirst ? "84px" : "64px",
                        borderRadius: "50%",
                        border: `4px solid ${colors.border}`,
                        backgroundColor: "#ffffff",
                        boxShadow: `0 8px 16px ${colors.shadow}`,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {entry.profileImage ? (
                        <img src={entry.profileImage} alt={entry.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: isFirst ? "2rem" : "1.5rem", fontWeight: "800", color: "#9ca3af" }}>
                          {entry.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Position Badge */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-8px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: colors.bg,
                        color: colors.text,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.875rem",
                        fontWeight: "800",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        border: "2px solid #ffffff"
                      }}
                    >
                      {actualIndex + 1}
                    </div>
                  </div>

                  {/* Name & Score Container */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "0.75rem",
                      padding: "1.25rem 0.5rem 0.5rem 0.5rem", // Extra top padding to clear badge
                      marginTop: "-0.75rem", // Tucks under the avatar
                      width: "100%",
                      textAlign: "center",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      border: "1px solid #f3f4f6",
                      zIndex: -1 // Sits behind the avatar
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.username}
                    </div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "600", color: BRAND_BLUE || "#2563eb", marginTop: "2px" }}>
                      {entry.uploadCount} pts
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Rest of Leaderboard List */}
        <div style={{ paddingBottom: "3rem" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem 0" }}>
              <div style={{ width: "32px", height: "32px", border: "4px solid #e5e7eb", borderTopColor: BRAND_BLUE || "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#6b7280", fontWeight: "500" }}>Loading ranks...</p>
            </div>
          ) : rest.length === 0 && top3.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "1.5rem", padding: "3rem 1.5rem", textAlign: "center", border: "1px solid #f3f4f6", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#111827", margin: "0 0 0.5rem 0" }}>No uploads yet</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>Be the first to upload and claim the #1 spot!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {rest.map((entry) => {
                const isMe = entry.contributorId === contributor.$id;

                return (
                  <Link
                    key={entry.contributorId}
                    href={`/contributor/account/${entry.contributorId}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      backgroundColor: isMe ? "#eff6ff" : "#ffffff", // Subtle blue for current user
                      padding: "1rem",
                      borderRadius: "1rem",
                      textDecoration: "none",
                      border: isMe ? "1px solid #bfdbfe" : "1px solid transparent",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      transition: "transform 0.1s ease, box-shadow 0.1s ease"
                    }}
                  >
                    {/* Rank Number */}
                    <div style={{ width: "24px", textAlign: "center", fontSize: "1rem", fontWeight: "700", color: "#6b7280" }}>
                      {entry.rank}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {entry.profileImage ? (
                        <img src={entry.profileImage} alt={entry.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1rem", fontWeight: "700", color: "#9ca3af" }}>
                          {entry.username?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.username}
                        </span>
                        {isMe && (
                          <span style={{ backgroundColor: "#3b82f6", color: "#ffffff", fontSize: "0.6rem", fontWeight: "800", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            You
                          </span>
                        )}
                        {entry.isTopContributor && <Crown size={14} color="#f59e0b" />}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: "500", marginTop: "2px" }}>
                        {entry.institution || "Contributor"}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontSize: "1.125rem", fontWeight: "800", color: "#111827" }}>
                        {entry.uploadCount}
                      </span>
                      <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        pts
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Required for standard CSS animations if not using Tailwind */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
