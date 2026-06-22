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
  Coins,
  Check,
  Lock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";
import TermsModal from "@/components/TermsModal";
import { editContributor } from "@/lib/api/contributors";

export default function ContestLandingPage() {
  const { user, contributor, loading: userLoading, contributorLoading, refetchContributor } = useUser();
  const router = useRouter();

  // Target contest start date (defaults to June 26, 2026)
  const [startDate, setStartDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("contributor_contest_start_date");
      if (stored) return new Date(stored);
    }
    return new Date("2026-06-26T00:00:00");
  });

  // Calculate endDate: 30 days after startDate
  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date(startDate.getTime());
    end.setDate(end.getDate() + 30);
    return end;
  });

  // Re-sync end date whenever start date changes
  useEffect(() => {
    const end = new Date(startDate.getTime());
    end.setDate(end.getDate() + 30);
    setEndDate(end);
  }, [startDate]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPastStart: false,
    isPastEnd: false,
  });

  // Simulation controls state
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simDateInput, setSimDateInput] = useState("");

  // Tabs state
  const [activeTab, setActiveTab] = useState<"overview" | "scoring" | "rewards" | "eligibility">("overview");

  // Calculator inputs state
  const [calcInputs, setCalcInputs] = useState({
    userNew: "5",
    engagedUsers: "10",
    uploads: "10",
    courses: "2",
  });

  // Onboarding Modal States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Enrollment process states
  const [checklistAnim, setChecklistAnim] = useState({ step1: false, step2: false, step3: false });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Calculate countdown
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();

      const pastStart = now.getTime() >= startDate.getTime();
      const pastEnd = now.getTime() >= endDate.getTime();

      let targetTime = startDate.getTime();
      if (pastStart && !pastEnd) {
        targetTime = endDate.getTime();
      }

      const difference = targetTime - now.getTime();

      if (difference <= 0 || pastEnd) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPastStart: pastStart,
          isPastEnd: pastEnd
        });
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days: d,
        hours: h,
        minutes: m,
        seconds: s,
        isPastStart: pastStart,
        isPastEnd: pastEnd
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  // Sync state with local storage updates (Simulator preset clicks on dashboard trigger this)
  useEffect(() => {
    const syncTime = () => {
      const storedDate = localStorage.getItem("contributor_contest_start_date");
      if (storedDate) {
        setStartDate(new Date(storedDate));
      } else {
        setStartDate(new Date("2026-06-26T00:00:00"));
      }
    };
    window.addEventListener("storage", syncTime);
    return () => window.removeEventListener("storage", syncTime);
  }, []);

  // Run sequential check animations when Enrollment Modal opens
  useEffect(() => {
    if (showEnrollmentModal) {
      setChecklistAnim({ step1: false, step2: false, step3: false });
      const timer1 = setTimeout(() => setChecklistAnim(prev => ({ ...prev, step1: true })), 400);
      const timer2 = setTimeout(() => setChecklistAnim(prev => ({ ...prev, step2: true })), 1000);
      const timer3 = setTimeout(() => setChecklistAnim(prev => ({ ...prev, step3: true })), 1600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showEnrollmentModal]);

  // Handle Preset configurations
  const applyPreset = (secondsOffset: number) => {
    const newDate = new Date(Date.now() + secondsOffset * 1000);
    setStartDate(newDate);
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
    setStartDate(newDate);
    localStorage.setItem("contributor_contest_start_date", newDate.toISOString());
    window.dispatchEvent(new Event("storage"));
  };

  const resetPreset = () => {
    const defaultDate = new Date("2026-06-26T00:00:00");
    setStartDate(defaultDate);
    localStorage.removeItem("contributor_contest_start_date");
    window.dispatchEvent(new Event("storage"));
  };

  const handleJoinContestTap = () => {
    if (!user) {
      setShowSignUpModal(true);
      return;
    }

    const hasApprovedContributor = contributor && contributor.status === 'live';

    if (!hasApprovedContributor) {
      setShowWarningModal(true);
    } else {
      setShowEnrollmentModal(true);
    }
  };

  const handleEnrollConfirm = async () => {
    if (!contributor || isEnrolling) return;
    setIsEnrolling(true);
    try {
      await editContributor(contributor.$id, {
        joinedContest: true,
        joinedContestAt: new Date().toISOString()
      });
      await refetchContributor();
      setShowEnrollmentModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to enroll contributor in contest:", err);
      alert("Something went wrong while joining the contest. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  // Point scoring calculator logic
  const parseNum = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const calcAcquisitionPoints = () => {
    const users = parseNum(calcInputs.userNew);
    return Math.min(50, users * 5);
  };

  const calcEngagementPoints = () => {
    const engaged = parseNum(calcInputs.engagedUsers);
    return Math.min(40, engaged * 2);
  };

  const calcContentPoints = () => {
    const uploads = parseNum(calcInputs.uploads);
    const courses = parseNum(calcInputs.courses);
    return Math.min(10, (uploads * 0.5) + (courses * 0.25));
  };

  const totalCalculatedPoints = calcAcquisitionPoints() + calcEngagementPoints() + calcContentPoints();

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-solid mb-4" />
        <p className="text-gray-400 text-sm">Loading challenge details...</p>
      </div>
    );
  }

  // Base Dashboard href
  const dashboardHref = user ? `/contributor/dashboard/${user.$id}` : "/";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#030712",
        backgroundImage: "radial-gradient(circle at top right, rgba(79, 70, 229, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.08), transparent 40%)",
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


        </div>



        {/* --- HERO SECTION --- */}
        <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3.5rem auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem 0.75rem", borderRadius: "9999px", backgroundColor: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", color: "#818cf8", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
            <Trophy size={14} color="#fbbf24" />
            Official Contributor Challenge
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "800", letterSpacing: "-0.025em", margin: "0 0 1rem 0", background: "linear-gradient(to right, #ffffff, #e2e8f0, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ED-Library Contributor Challenge
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#94a3b8", lineHeight: "1.6", margin: "0 0 2rem 0", fontWeight: "400" }}>
            Create high-quality course materials, share knowledge, and attract unique students. Win cash rewards and help shape the next generation of academic success.
          </p>

          {/* Core Join CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {contributor?.joinedContest ? (
              <Link
                href="/contest/leaderboard"
                className="w-full sm:w-auto text-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-wider text-decoration-none"
              >
                📊 View Contest Leaderboard
              </Link>
            ) : (
              <button
                onClick={handleJoinContestTap}
                className="w-full sm:w-auto text-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 text-sm font-black py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.98] uppercase tracking-wider cursor-pointer border border-amber-300/30"
              >
                🚀 Join Contest Arena
              </button>
            )}
            {/* <Link
              href="/contest/leaderboard"
              className="w-full sm:w-auto text-center bg-slate-900/60 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold py-4 px-8 rounded-2xl transition-all duration-300 text-decoration-none"
            >
              Check Leaderboard
            </Link> */}
          </div>
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
                {timeLeft.isPastEnd ? "Event Ended" : timeLeft.isPastStart ? "Contest Countdown (Ending)" : "Contest Countdown (Starting)"}
              </span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#f8fafc", margin: "0.25rem 0 0 0" }}>
                {timeLeft.isPastEnd ? (
                  <span style={{ color: "#ef4444" }}>The Challenge has Ended!</span>
                ) : timeLeft.isPastStart ? (
                  <span style={{ color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <Zap size={18} /> Contest is LIVE! Ends: {endDate.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                ) : (
                  `Starts: ${startDate.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`
                )}
              </h2>
            </div>

            {timeLeft.isPastEnd ? (
              <div style={{ textAlign: "center", padding: "1.5rem", backgroundColor: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "1rem", position: "relative", zIndex: 10 }}>
                <p style={{ fontSize: "0.875rem", color: "#fca5a5", lineHeight: "1.6", fontWeight: "600", margin: 0 }}>
                  Standings are frozen and final quality audits are underway. Payout logs will update shortly.
                </p>
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
                    <span style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: "900", color: timeLeft.isPastStart ? "#10b981" : "#fcd34d", letterSpacing: "0.05em", lineHeight: 1 }}>
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
          <StatHighlight icon={<Coins size={22} color="#34d399" />} bg="rgba(16,185,129,0.1)" border="rgba(16,185,129,0.2)" label="Cash Prize Pool" value="₦100,000 - ₦200,000" valueColor="#34d399" />
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
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "500" }}>Example (John brings 2,000 pts, Sarah brings 1,000 pts with ₦100,000 pool)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "600" }}>John (66.6% share)</div>
                      <div style={{ fontSize: "1rem", fontWeight: "800", color: "#4ade80" }}>₦66,666</div>
                    </div>
                    <div style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem", fontWeight: "600" }}>Sarah (33.3% share)</div>
                      <div style={{ fontSize: "1rem", fontWeight: "800", color: "#4ade80" }}>₦33,333</div>
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
                    { title: "Acquisition (New Users)", weight: "50 Points Max", formula: "New Users × 5", desc: "Measures the number of new users brought into the platform. Must be a first-time user properly attributed to you." },
                    { title: "Engagement (User Activity)", weight: "40 Points Max", formula: "Engaged Users × 2", desc: "Measures real learning activity. Counts unique engaged users per day (viewing ≥ 2 mins, reading, downloading, returning)." },
                    { title: "Content (Uploads & Courses)", weight: "10 Points Max", formula: "(Uploads × 0.5) + (Courses × 0.25)", desc: "Measures quality and quantity of academic content created. Valid approved content only." }
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
                    <InputSingle labelMe="New Users (You)" valMe={calcInputs.userNew} onChangeMe={(val) => setCalcInputs({ ...calcInputs, userNew: val })} />
                    <InputSingle labelMe="Engaged Users (You)" valMe={calcInputs.engagedUsers} onChangeMe={(val) => setCalcInputs({ ...calcInputs, engagedUsers: val })} />
                    <InputSingle labelMe="Uploads (You)" valMe={calcInputs.uploads} onChangeMe={(val) => setCalcInputs({ ...calcInputs, uploads: val })} />
                    <InputSingle labelMe="Courses Created (You)" valMe={calcInputs.courses} onChangeMe={(val) => setCalcInputs({ ...calcInputs, courses: val })} />
                  </div>

                  {/* Output Column */}
                  <div style={{ padding: "1.5rem", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "1.25rem", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#e2e8f0", margin: "0 0 1rem 0" }}>Calculated Daily Score Sheet</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <ScoreRow label="1. Acquisition points" score={calcAcquisitionPoints()} max="50" />
                        <ScoreRow label="2. Engagement points" score={calcEngagementPoints()} max="40" />
                        <ScoreRow label="3. Content points" score={calcContentPoints()} max="10" />
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

      {/* --- WARNING MODAL: NO CONTRIBUTOR ACTION --- */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-red-500 rounded-full" />

            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <Lock size={28} />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Contributor Account Required</h3>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              you do not have a contributor action
            </p>

            <button
              onClick={() => {
                setShowWarningModal(false);
                router.push("/onboarding/step-1");
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-red-600/10 cursor-pointer"
            >
              Start Contributor Onboarding
            </button>
          </div>
        </div>
      )}

      {/* --- WARNING MODAL: NO SIGNED IN USER --- */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500 rounded-full" />

            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Lock size={28} />
            </div>

            <h3 className="text-xl font-black text-white mb-2">Account Required</h3>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              You must create an account and become a contributor before joining the contest arena.
            </p>

            <button
              onClick={() => {
                setShowSignUpModal(false);
                router.push("/signup");
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => setShowSignUpModal(false)}
              className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- ENROLLMENT MODAL (APPROVED CONTRIBUTORS) --- */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <h3 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
              <Trophy size={22} className="text-amber-400 animate-pulse" />
              Contest Enrollment Checklist
            </h3>

            {/* Verification checklist with animations */}
            <div className="space-y-4 mb-6">
              <div className={`flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 transition-all duration-500 ${checklistAnim.step1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1</div>
                  <div className="text-sm font-semibold text-white">Approved Contributor Account</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 transition-all duration-500 ${checklistAnim.step2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2</div>
                  <div className="text-sm font-semibold text-white">Active Account Standing</div>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 transition-all duration-500 ${checklistAnim.step3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 3</div>
                  <div className="text-sm font-semibold text-white">Platform Guidelines Checked</div>
                </div>
              </div>
            </div>

            {/* Terms Agreement Checkbox (matching ads creation flow) */}
            <div className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-2xl border border-slate-850 mb-6">
              <input
                id="agree-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs sm:text-sm text-slate-355 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                >
                  terms and conditions
                </button>{" "}
                governing the ED-Library Contributor Challenge policies.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEnrollmentModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                disabled={!termsAccepted || isEnrolling}
                onClick={handleEnrollConfirm}
                className={`flex-1 font-bold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${termsAccepted
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 shadow-amber-500/10"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                  }`}
              >
                {isEnrolling ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  "Join Challenge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS ENROLLMENT MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Trophy size={28} />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">Welcome to the Arena!</h3>

            {/* Conditional text based on whether contest is live or future */}
            {!timeLeft.isPastStart ? (
              <div className="mb-6">
                <p className="text-sm text-slate-300 mb-4">
                  You have successfully enrolled in the Contributor Challenge!
                </p>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    The contest starts in
                  </div>
                  <div className="font-mono text-xl font-black text-amber-300 tracking-wider">
                    {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m : {timeLeft.seconds}s
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-350 mb-6 leading-relaxed">
                You're officially registered! The contest is active. Head over to your dashboard, upload study courses, and claim your share of the prize pool.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/contest/leaderboard");
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl transition cursor-pointer"
              >
                Go to Leaderboard
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-6 rounded-2xl transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STANDALONE TERMS AND CONDITIONS TEXT MODAL --- */}
      <TermsModal
        open={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onSubmit={() => {
          setTermsAccepted(true);
          setShowTermsModal(false);
        }}
      />
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
        <div style={{ margin: "auto" }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{label}</div>
        <div style={{ fontSize: "1.125rem", fontWeight: "800", color: valueColor }}>{value}</div>
      </div>
    </div>
  );
}

interface InputSingleProps {
  labelMe: string;
  valMe: string;
  onChangeMe: (val: string) => void;
}

function InputSingle({ labelMe, valMe, onChangeMe }: InputSingleProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{labelMe}</label>
        <input type="number" value={valMe} onChange={(e) => onChangeMe(e.target.value)} style={darkInputStyle} onFocus={handleDarkFocus} onBlur={handleDarkBlur} />
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
        <span style={{ margin: "auto" }}>{num}</span>
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
