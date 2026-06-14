"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Trophy,
  Calendar,
  Users,
  CheckCircle2,
  Calculator,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck,
  Zap,
  Star,
  Coins
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";

export default function ContestLandingPage() {
  const { user, contributor, loading: userLoading, contributorLoading } = useUser();

  // Target contest start date
  const [targetDate, setTargetDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("contributor_contest_start_date");
      if (stored) return new Date(stored);
    }
    return new Date("2026-06-26T00:00:00");
  });

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  // Simulation controls state
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simDateInput, setSimDateInput] = useState("");

  // Tabs state
  const [activeTab, setActiveTab] = useState<"overview" | "scoring" | "rewards" | "eligibility">("overview");

  // Calculator inputs state
  const [calcInputs, setCalcInputs] = useState({
    userNew: "5",
    userNewHighest: "10",
    reach: "150",
    reachHighest: "300",
    returning: "40",
    returningHighest: "80",
    qualityRating: 12, // rating 0-15
    courses: "2",
    coursesHighest: "4",
  });

  // Calculate countdown
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Handle preset date configurations
  const applyPreset = (secondsOffset: number) => {
    const newDate = new Date(Date.now() + secondsOffset * 1000);
    setTargetDate(newDate);
    localStorage.setItem("contributor_contest_start_date", newDate.toISOString());
    window.dispatchEvent(new Event("storage"));
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simDateInput) return;
    const newDate = new Date(simDateInput);
    if (isNaN(newDate.getTime())) {
      alert("Invalid date format. Please use a valid date.");
      return;
    }
    setTargetDate(newDate);
    localStorage.setItem("contributor_contest_start_date", newDate.toISOString());
    window.dispatchEvent(new Event("storage"));
  };

  const resetPreset = () => {
    const defaultDate = new Date("2026-06-26T00:00:00");
    setTargetDate(defaultDate);
    localStorage.removeItem("contributor_contest_start_date");
    window.dispatchEvent(new Event("storage"));
  };

  // Point scoring calculator logic
  const parseNum = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const calcNewUsersPoints = () => {
    const myVal = parseNum(calcInputs.userNew);
    const highestVal = parseNum(calcInputs.userNewHighest);
    if (highestVal === 0) return 0;
    return Math.min(30, Math.round((myVal / highestVal) * 30 * 10) / 10);
  };

  const calcReachPoints = () => {
    const myVal = parseNum(calcInputs.reach);
    const highestVal = parseNum(calcInputs.reachHighest);
    if (highestVal === 0) return 0;
    return Math.min(30, Math.round((myVal / highestVal) * 30 * 10) / 10);
  };

  const calcReturningPoints = () => {
    const myVal = parseNum(calcInputs.returning);
    const highestVal = parseNum(calcInputs.returningHighest);
    if (highestVal === 0) return 0;
    return Math.min(20, Math.round((myVal / highestVal) * 20 * 10) / 10);
  };

  const calcCoursesPoints = () => {
    const myVal = parseNum(calcInputs.courses);
    const highestVal = parseNum(calcInputs.coursesHighest);
    if (highestVal === 0) return 0;
    return Math.min(5, Math.round((myVal / highestVal) * 5 * 10) / 10);
  };

  const totalCalculatedPoints =
    calcNewUsersPoints() +
    calcReachPoints() +
    calcReturningPoints() +
    calcInputs.qualityRating +
    calcCoursesPoints();

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-solid mb-4" />
        <p className="text-gray-400 text-sm">Loading challenge details...</p>
      </div>
    );
  }

  if (!user) return <AccessWall type="user" />;
  if (!contributor) return <AccessWall type="contributor" />;

  const dashboardHref = `/contributor/dashboard/${user.$id}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#030712", // Deeper, richer black/blue background
        backgroundImage: "radial-gradient(circle at top right, rgba(79, 70, 229, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.05), transparent 40%)",
        color: "#f8fafc",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingBottom: "5rem",
        boxSizing: "border-box"
      }}
    >
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* --- HEADER BAR --- */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "3rem" }}>
          <Link
            href={dashboardHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#94a3b8",
              textDecoration: "none",
              transition: "color 0.2s ease"
            }}
            onPointerEnter={(e) => (e.currentTarget.style.color = "#f8fafc")}
            onPointerLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            Back to Dashboard
          </Link>

          <button
            onClick={() => setShowSimPanel(!showSimPanel)}
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              color: "#818cf8",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.2)")}
            onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)")}
          >
            {showSimPanel ? "Hide Simulation Tools" : "Developer Simulation Panel 🛠️"}
          </button>
        </div>

        {/* --- SIMULATION PANEL --- */}
        {showSimPanel && (
          <div
            style={{
              marginBottom: "3rem",
              padding: "1.5rem",
              borderRadius: "1rem",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              backgroundColor: "rgba(245, 158, 11, 0.05)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px -10px rgba(245, 158, 11, 0.1)"
            }}
          >
            <h3 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#fcd34d", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={16} /> Contributor Challenge Start Date Simulator
            </h3>
            <p style={{ fontSize: "0.75rem", color: "rgba(253, 230, 138, 0.7)", marginBottom: "1.5rem" }}>
              Simulate start date updates to see countdowns, flags, and states change live across pages.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button type="button" onClick={() => applyPreset(10)} style={simButtonStyle("#fcd34d", "rgba(245, 158, 11, 0.2)")}>Starts in 10s</button>
                <button type="button" onClick={() => applyPreset(3600)} style={simButtonStyle("#fcd34d", "rgba(245, 158, 11, 0.2)")}>Starts in 1 hour</button>
                <button type="button" onClick={() => applyPreset(86400 * 5)} style={simButtonStyle("#fcd34d", "rgba(245, 158, 11, 0.2)")}>Starts in 5 days</button>
                <button type="button" onClick={() => applyPreset(-86400 * 12)} style={simButtonStyle("#86efac", "rgba(34, 197, 94, 0.2)")}>Started 12 days ago (Live)</button>
              </div>

              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b", margin: "0 0.5rem" }}>OR</span>

              <form onSubmit={handleCustomDateSubmit} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="datetime-local"
                  value={simDateInput}
                  onChange={(e) => setSimDateInput(e.target.value)}
                  style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid #334155", borderRadius: "0.5rem", padding: "0.375rem 0.75rem", fontSize: "0.75rem", color: "#f8fafc", outline: "none", colorScheme: "dark" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#334155")}
                />
                <button type="submit" style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "#ffffff", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: "700", border: "none", cursor: "pointer" }}>
                  Apply Date
                </button>
              </form>

              <button
                type="button"
                onClick={resetPreset}
                style={{ fontSize: "0.75rem", color: "#94a3b8", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
              >
                Reset Default
              </button>
            </div>
          </div>
        )}

        {/* --- HERO SECTION --- */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 4rem auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", backgroundColor: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#818cf8", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
            <Trophy size={14} color="#fbbf24" />
            Official Contributor Challenge
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "800", letterSpacing: "-0.025em", margin: "0 0 1rem 0", background: "linear-gradient(to right, #ffffff, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ED-Library Contributor Challenge
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", lineHeight: "1.6", margin: 0, fontWeight: "400" }}>
            Create high-quality course materials, share knowledge, and attract unique students. Win cash rewards and help shape the next generation of academic success.
          </p>
        </div>

        {/* --- LIVE COUNTDOWN CLOCK --- */}
        <div style={{ maxWidth: "600px", margin: "0 auto 4rem auto" }}>
          <div
            style={{
              padding: "2rem",
              borderRadius: "1.5rem",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Glowing orb effect behind countdown */}
            <div style={{ position: "absolute", top: "-50%", right: "-50%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />

            <div style={{ textAlign: "center", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", color: "#818cf8" }}>
                {timeLeft.isPast ? "Event Status" : "Contest Countdown"}
              </span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: "0.25rem 0 0 0" }}>
                {timeLeft.isPast ? (
                  <span style={{ color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Zap size={18} /> The Challenge is Currently Live!
                  </span>
                ) : (
                  `Starts: ${targetDate.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}`
                )}
              </h2>
            </div>

            {timeLeft.isPast ? (
              <div style={{ textAlign: "center", padding: "1.5rem", backgroundColor: "rgba(74, 222, 128, 0.05)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: "1rem", position: "relative", zIndex: 10 }}>
                <p style={{ fontSize: "0.875rem", color: "#86efac", lineHeight: "1.6", fontWeight: "600", margin: "0 0 1rem 0" }}>
                  Scoreboards have frozen and points are tracking live! Upload assets, courses, and refer students daily to build your scoring tally.
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#818cf8", fontWeight: "800" }}>
                  View Scoring guidelines below <ArrowRight size={14} />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", position: "relative", zIndex: 10 }}>
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Minutes" },
                  { value: timeLeft.seconds, label: "Seconds" }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: "1rem 0.5rem", backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: "900", color: "#fcd34d", letterSpacing: "0.05em", lineHeight: 1 }}>
                      {String(item.value).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: "0.6rem", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.5rem" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- STATS OVERVIEW --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
          <StatHighlight icon={<Calendar size={22} color="#818cf8" />} bg="rgba(99,102,241,0.1)" border="rgba(99,102,241,0.2)" label="Duration" value="30 Days Campaign" />
          <StatHighlight icon={<Coins size={22} color="#34d399" />} bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.2)" label="Cash Prize Pool" value="₦100,000" valueColor="#34d399" />
          <StatHighlight icon={<Users size={22} color="#f472b6" />} bg="rgba(236,72,153,0.1)" border="rgba(236,72,153,0.2)" label="Top Reward Share" value="Proportional Payout" />
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "1px", scrollbarWidth: "none" }}>
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "scoring", label: "Scoring System", icon: Calculator },
            { id: "rewards", label: "Rewards & Payout", icon: Award },
            { id: "eligibility", label: "Eligibility", icon: ShieldCheck }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 1.5rem",
                  border: "none",
                  borderBottom: isActive ? "2px solid #6366f1" : "2px solid transparent",
                  backgroundColor: isActive ? "rgba(99,102,241,0.05)" : "transparent",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
                onPointerEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#e2e8f0"; }}
                onPointerLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#94a3b8"; }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT PANELS --- */}
        <div style={{ minHeight: "300px" }}>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 0.75rem 0" }}>About the Contributor Challenge</h2>
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
                    The challenge is a month-long academic engagement event. Contributors earn points daily by uploading high-quality study notes, creating syllabus-aligned courses, attracting unique students, and growing the community.
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#818cf8", margin: "0 0 1rem 0" }}>Why Participate?</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      "Gain visibility and build a loyal follower base of students on ED-Library.",
                      "Earn direct, cash payments into your wallet based on your exact point percentage contribution.",
                      "Establish a sustainable passive income portfolio through paid assets post-competition."
                    ].map((text, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.5" }}>
                        <span style={{ color: "#818cf8", marginTop: "2px" }}>•</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem" }}>
                <h3 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 1.5rem 0" }}>How Rewards Work</h3>

                <div style={{ padding: "1rem", backgroundColor: "rgba(30,27,75,0.4)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.65rem", color: "#818cf8", fontWeight: "800", marginBottom: "0.25rem" }}>PROPORTIONAL FORMULA</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.875rem", fontWeight: "800", color: "#fcd34d", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                    Your Cash = (Your Total Points ÷ Combined Points of All) × Prize Pool
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
                    This rewards every point generated. If you contribute 15% of the total points, you claim exactly 15% of the cash prize pool!
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>Example 1 (John brings 2,000 pts, Sarah brings 1,000 pts)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "600" }}>John (20% share)</div>
                      <div style={{ fontSize: "1rem", fontWeight: "800", color: "#4ade80" }}>₦20,000</div>
                    </div>
                    <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "600" }}>Sarah (10% share)</div>
                      <div style={{ fontSize: "1rem", fontWeight: "800", color: "#4ade80" }}>₦10,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCORING TAB */}
          {activeTab === "scoring" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>

              {/* Point Categories Grid */}
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Star size={20} color="#fbbf24" /> Daily Points Breakdown (Max 100 Points/Day)
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {[
                    { title: "New Users Generated", weight: "30 Points Max", formula: "(Your New Users ÷ Highest Generated That Day) × 30", desc: "Measures new registration counts driven by your referral link or content shares." },
                    { title: "Unique Students Reached", weight: "30 Points Max", formula: "(Your Views ÷ Highest Reach That Day) × 30", desc: "Measures distinct students opening and reading your courses or study materials." },
                    { title: "Returning Students", weight: "20 Points Max", formula: "(Your Return Count ÷ Highest Return Count That Day) × 20", desc: "Rewards high-utility documents that students return to consult repeatedly." },
                    { title: "Quality Content Uploads", weight: "15 Points Max", formula: "Assessed by editorial board (0 to 15)", desc: "Score awarded based on clear titles, categorization, visual layout, and academic value." },
                    { title: "Courses Created", weight: "5 Points Max", formula: "(Your Course Count ÷ Highest Created That Day) × 5", desc: "Rewards building comprehensive, multi-unit courses structured logically." }
                  ].map((cat, idx) => (
                    <div key={idx} style={{ padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1.5rem" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                          <h3 style={{ fontSize: "0.9375rem", fontWeight: "800", color: "#e2e8f0", margin: 0 }}>{cat.title}</h3>
                          <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "#818cf8", backgroundColor: "rgba(99,102,241,0.1)", padding: "0.25rem 0.5rem", borderRadius: "0.375rem", whiteSpace: "nowrap" }}>{cat.weight}</span>
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>{cat.desc}</p>
                      </div>
                      <div style={{ padding: "0.75rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.25rem" }}>Points Formula:</span>
                        <code style={{ fontSize: "0.75rem", color: "#fcd34d", wordBreak: "break-word" }}>{cat.formula}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Point Calculator Simulator */}
              <div style={{ padding: "2rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.5rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Calculator size={18} color="#818cf8" /> Interactive Daily Points Simulator
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: "0 0 2rem 0" }}>Input mock daily stats to test calculations and see how weight ratios map to point scores.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

                  {/* Inputs Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <InputPair labelMe="New Users (You)" valMe={calcInputs.userNew} onChangeMe={(val) => setCalcInputs({ ...calcInputs, userNew: val })} labelHigh="New Users (Highest)" valHigh={calcInputs.userNewHighest} onChangeHigh={(val) => setCalcInputs({ ...calcInputs, userNewHighest: val })} />
                    <InputPair labelMe="Student Reach (You)" valMe={calcInputs.reach} onChangeMe={(val) => setCalcInputs({ ...calcInputs, reach: val })} labelHigh="Student Reach (Highest)" valHigh={calcInputs.reachHighest} onChangeHigh={(val) => setCalcInputs({ ...calcInputs, reachHighest: val })} />
                    <InputPair labelMe="Returning Students (You)" valMe={calcInputs.returning} onChangeMe={(val) => setCalcInputs({ ...calcInputs, returning: val })} labelHigh="Returning (Highest)" valHigh={calcInputs.returningHighest} onChangeHigh={(val) => setCalcInputs({ ...calcInputs, returningHighest: val })} />
                    <InputPair labelMe="Courses Created (You)" valMe={calcInputs.courses} onChangeMe={(val) => setCalcInputs({ ...calcInputs, courses: val })} labelHigh="Courses Created (Highest)" valHigh={calcInputs.coursesHighest} onChangeHigh={(val) => setCalcInputs({ ...calcInputs, coursesHighest: val })} />

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>Assessed Content Quality Score</label>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#818cf8" }}>{calcInputs.qualityRating} / 15 pts</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        value={calcInputs.qualityRating}
                        onChange={(e) => setCalcInputs({ ...calcInputs, qualityRating: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#6366f1", height: "4px", backgroundColor: "#1e293b", borderRadius: "2px", outline: "none", cursor: "pointer" }}
                      />
                    </div>
                  </div>

                  {/* Output Column */}
                  <div style={{ padding: "1.5rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#e2e8f0", margin: "0 0 1rem 0" }}>Calculated Daily Score Sheet</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <ScoreRow label="1. Referral Users points" score={calcNewUsersPoints()} max="30" />
                        <ScoreRow label="2. Student Reach points" score={calcReachPoints()} max="30" />
                        <ScoreRow label="3. Returning Users points" score={calcReturningPoints()} max="20" />
                        <ScoreRow label="4. Editorial Quality points" score={calcInputs.qualityRating} max="15" />
                        <ScoreRow label="5. Course Creation points" score={calcCoursesPoints()} max="5" />
                      </div>
                    </div>

                    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                      <div>
                        <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Estimated Score</div>
                        <div style={{ fontSize: "2rem", fontWeight: "900", color: "#fcd34d", lineHeight: 1 }}>{totalCalculatedPoints} <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/ 100</span></div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Daily Max limit</div>
                        <div style={{ fontSize: "0.875rem", color: "#94a3b8", fontWeight: "600" }}>100 Points</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* REWARDS TAB */}
          {activeTab === "rewards" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", alignItems: "start" }}>

              {/* Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock size={20} color="#818cf8" /> Milestone Timeline
                </h2>

                <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "2rem", marginLeft: "0.5rem" }}>
                  <TimelineItem num="1" color="#6366f1" title="Day 1 to 30: Active Campaign" desc="Contributors compete and points accumulate continuously. Performance metrics update daily on the dashboard." />
                  <TimelineItem num="2" color="#ec4899" title="Day 30: Frozen Standings" desc="At midnight of Day 30, the competition closes and all scores are frozen. No new uploads or actions count toward the final scoreboard." />
                  <TimelineItem num="3" color="#f59e0b" title="Day 31 to 35: Quality Review & Audit" desc="Our academic editorial board audits activity logs to verify referrals, flag spam downloads, and finalize quality evaluations." />
                  <TimelineItem num="4" color="#10b981" title="Day 35: Wallet Payouts" desc="Finalized rewards are directly paid out and deposited into contributor wallets. Withdrawals can be requested immediately." />
                </div>
              </div>

              {/* Long-Term Goal */}
              <div style={{ padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 1rem 0" }}>Sustainable Contributor Economy</h3>
                <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 1.5rem 0" }}>
                  The 30-Day challenge serves as a jump-start to build a dedicated student audience. Post-competition, contributors can keep earning via:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <EconomyCard color="#fcd34d" title="Paid Course Options" desc="Offer advanced units as paid premium courses for student purchases." />
                  <EconomyCard color="#818cf8" title="Ad Revenue Share" desc="Earn a percentage share of ad clicks generated on your content pages." />
                  <EconomyCard color="#f472b6" title="Featured Opportunities" desc="Top-rated resources get primary homepage slots to accelerate reach." />
                </div>
              </div>
            </div>
          )}

          {/* ELIGIBILITY TAB */}
          {activeTab === "eligibility" && (
            <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 0.5rem 0" }}>Participant Requirements</h2>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
                  To keep the competition fair and maintain top academic standard, all participating accounts must qualify against the following guidelines:
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { title: "Active Contributor Status", desc: "Must hold an approved ED-Library contributor profile." },
                  { title: "Guidelines Compliance", desc: "All submitted files must comply with ED-Library academic guidelines (no plagiarism, correct tagging)." },
                  { title: "Zero Initial upload Limits", desc: "Anyone can join regardless of initial upload tallies. Points accumlate strictly from challenge launch date." }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "1rem", padding: "1.25rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", alignItems: "flex-start" }}>
                    <div style={{ width: "24px", height: "24px", backgroundColor: "rgba(99,102,241,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8", flexShrink: 0, border: "1px solid rgba(99,102,241,0.2)" }}>
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#e2e8f0", margin: "0 0 0.25rem 0" }}>{item.title}</h3>
                      <p style={{ fontSize: "0.8125rem", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- REUSABLE INLINE STYLES & MINI COMPONENTS ---

const simButtonStyle = (color: string, bg: string): React.CSSProperties => ({
  padding: "0.375rem 0.75rem",
  backgroundColor: bg,
  color: color,
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s ease"
});

interface StatHighlightProps {
  icon: React.ReactNode;
  bg: string;
  border: string;
  label: string;
  value: string;
  valueColor?: string;
}

function StatHighlight({ icon, bg, border, label, value, valueColor = "#f8fafc" }: StatHighlightProps) {
  return (
    <div style={{ padding: "1.5rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", transition: "border-color 0.2s ease" }} onPointerEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")} onPointerLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}>
      <div style={{ width: "48px", height: "48px", backgroundColor: bg, border: `1px solid ${border}`, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as React.CSSProperties}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{label}</div>
        <div style={{ fontSize: "1.125rem", fontWeight: "800", color: valueColor }}>{value}</div>
      </div>
    </div>
  );
}

interface InputPairProps {
  labelMe: string;
  valMe: string;
  onChangeMe: (val: string) => void;
  labelHigh: string;
  valHigh: string;
  onChangeHigh: (val: string) => void;
}

function InputPair({ labelMe, valMe, onChangeMe, labelHigh, valHigh, onChangeHigh }: InputPairProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{labelMe}</label>
        <input type="number" value={valMe} onChange={(e) => onChangeMe(e.target.value)} style={darkInputStyle} onFocus={handleDarkFocus} onBlur={handleDarkBlur} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{labelHigh}</label>
        <input type="number" value={valHigh} onChange={(e) => onChangeHigh(e.target.value)} style={darkInputStyle} onFocus={handleDarkFocus} onBlur={handleDarkBlur} />
      </div>
    </div>
  );
}

const darkInputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  border: "1px solid #334155",
  borderRadius: "0.75rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  color: "#f8fafc",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box"
};

const handleDarkFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "#6366f1");
const handleDarkBlur = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = "#334155");

interface ScoreRowProps {
  label: string;
  score: number;
  max: string;
}

function ScoreRow({ label, score, max }: ScoreRowProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" } as React.CSSProperties}>
      <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#e2e8f0" }}>{score} <span style={{ color: "#64748b" }}>/ {max} pts</span></span>
    </div>
  );
}

interface TimelineItemProps {
  num: string;
  color: string;
  title: string;
  desc: string;
}

function TimelineItem({ num, color, title, desc }: TimelineItemProps) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "-1.5rem", top: 0, transform: "translateX(-50%)", width: "1.25rem", height: "1.25rem", borderRadius: "50%", backgroundColor: color, border: "2px solid #030712", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "800", color: "#000000", fontFamily: "monospace" } as React.CSSProperties}>
        {num}
      </span>
      <h3 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#e2e8f0", margin: "0 0 0.25rem 0" }}>{title}</h3>
      <p style={{ fontSize: "0.8125rem", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>{desc}</p>
    </div>
  );
}

interface EconomyCardProps {
  color: string;
  title: string;
  desc: string;
}

function EconomyCard({ color, title, desc }: EconomyCardProps) {
  return (
    <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontSize: "0.75rem", color: color, fontWeight: "800", marginBottom: "0.25rem" }}>{title}</div>
      <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: "1.5" }}>{desc}</p>
    </div>
  );
}
