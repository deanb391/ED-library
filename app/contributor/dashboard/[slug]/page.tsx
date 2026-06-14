"use client"

import React, { useEffect, useState } from 'react';
import {
  Bell,
  LayoutGrid,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Info,
  MapPin,
  Atom,
  PlusCircle,
  UploadCloud,
  LineChart,
  CheckCircle2,
  Circle,
  GraduationCap,
  Flame,
  Trophy,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import deskImg from "@/assets/images/desk.webp";
import { Course } from '@/lib/api/courses';
import { useUser } from '@/context/UserContext';
import { fetchCoursesByAdmin } from '@/lib/api/courses';
import Message from '@/components/Message';
import ContributorCelebrationModal from '@/components/ContributorCelebrationModal';
import TermsModal from '@/components/TermsModal';
import { editContributor } from '@/lib/api/contributors';
import StreakCelebrationModal from '@/components/StreakCelebrationModal';
import StreakCalendarModal from '@/components/StreakCalendarModal';
import StreakReminderModal from '@/components/StreakReminderModal';
import TopContributorAnnouncementModal from '@/components/TopContributorAnnouncementModal';
import TopContributorAwardModal from '@/components/TopContributorAwardModal';
import { fetchStreak, fetchTopContributor, type StreakData, type WeeklyAward } from '@/lib/api/rewards';
import ShareProfileButton from '@/components/ShareProfileButton';

function CourseSection({
  title,
  courses
}: {
  title: string;
  courses: Course[];
}) {
  if (!courses.length) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {title}
        </h2>

        <Link
          href="/contributor/courses"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="group bg-white rounded-2xl border border-gray-200
                       hover:border-gray-300 overflow-hidden
                       flex flex-col transition
                       active:scale-[0.98]
                       hover:shadow-sm"
          >
            {/* Thumbnail */}
            <div className="relative h-32 sm:h-36 bg-gray-100 overflow-hidden">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                width={400}
                height={240}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 grow">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500" style={{ fontSize: 12 }}>
                <span>{course.code}</span>
                <span className="text-gray-300">•</span>
                <span>{course.session}</span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug" style={{ fontSize: 10 }}>
                {course.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600">
                <span className="px-2 py-0.5 rounded-full bg-gray-100">
                  {course.department}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Level {String(course.level)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import AccessWall from '@/components/AccessWall';

export default function DashboardUnderReviewPage() {
  const {
    user,
    loading: userLoading,
    contributor,
    contributorLoading,
    refetchContributor,
    hasWallet,
  } = useUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmittingTerms, setIsSubmittingTerms] = useState(false);

  // Rewards state
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakCelebrationData, setStreakCelebrationData] = useState<{ streak: number; dayName: string }>({ streak: 0, dayName: '' });
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [showStreakReminder, setShowStreakReminder] = useState(false);
  const [topContributor, setTopContributor] = useState<WeeklyAward | null>(null);
  const [showTopContributorAnnouncement, setShowTopContributorAnnouncement] = useState(false);
  const [showTopContributorAward, setShowTopContributorAward] = useState(false);

  // Contest timer states
  const [targetDate, setTargetDate] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("contributor_contest_start_date");
      if (stored) return new Date(stored);
    }
    return new Date("2026-06-26T00:00:00");
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setDashboardLoading(false);
        return;
      }

      if (!contributor && !contributorLoading) {
        await refetchContributor();
      }

      try {
        const adminCourses = await fetchCoursesByAdmin(user.$id);
        setCourses(adminCourses.slice(0, 8));
      } catch (err) {
        console.error("Failed to load contributor dashboard data", err);
        setCourses([]);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [user?.$id, contributor, contributorLoading, refetchContributor]);

  // Check if we should show the celebration modal
  useEffect(() => {
    if (contributor && contributor.status === 'live' && contributor.hasSeenCelebration !== true) {
      setIsModalOpen(true);
      // Immediately mark it as seen in the database so it won't show again on reload
      editContributor(contributor.$id, { hasSeenCelebration: true })
        .then(() => {
          // Refetch to ensure the local context is updated
          refetchContributor();
        })
        .catch(console.error);
    }
  }, [contributor, refetchContributor]);

  // Check if we should show the terms modal
  useEffect(() => {
    if (contributor && contributor.agreed !== true) {
      setIsTermsModalOpen(true);
    }
  }, [contributor]);

  // Load streak data + rewards
  useEffect(() => {
    if (!contributor?.$id) return;

    // Fetch streak data
    fetchStreak(contributor.$id)
      .then((data) => {
        if (data) setStreakData(data);
      })
      .catch(console.error);

    // Fetch top contributor
    fetchTopContributor()
      .then((award) => {
        if (award) {
          setTopContributor(award);

          // If this contributor IS the top contributor, show award modal
          if (award.contributorId === contributor.$id) {
            const awardKey = `topContributor_award_${award.weekStart}`;
            if (!localStorage.getItem(awardKey)) {
              setShowTopContributorAward(true);
              localStorage.setItem(awardKey, 'seen');
            }
          }

          // Show announcement modal on Sundays (once per week)
          const today = new Date();
          if (today.getDay() === 0) {
            const announceKey = `topContributor_seen_${award.weekStart}`;
            if (!localStorage.getItem(announceKey)) {
              setShowTopContributorAnnouncement(true);
              localStorage.setItem(announceKey, 'seen');
            }
          }
        }
      })
      .catch(console.error);
  }, [contributor?.$id]);

  // Streak reminder logic
  useEffect(() => {
    if (!contributor?.$id || !streakData) return;
    // Only show if contributor is active and hasn't uploaded today
    if (contributor.status !== 'live') return;

    const today = new Date().toISOString().slice(0, 10);
    const hasUploadedToday = streakData.lastUploadDate === today;

    if (!hasUploadedToday) {
      const reminderCount = parseInt(sessionStorage.getItem('streakReminderCount') || '0');
      if (reminderCount < 2) {
        // Delay slightly so it doesn't fight other modals
        const timer = setTimeout(() => {
          setShowStreakReminder(true);
          sessionStorage.setItem('streakReminderCount', String(reminderCount + 1));
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [contributor?.$id, contributor?.status, streakData]);

  // Contest countdown logic
  useEffect(() => {
    const getTarget = () => {
      const storedDate = localStorage.getItem("contributor_contest_start_date");
      return storedDate ? new Date(storedDate) : new Date("2026-06-26T00:00:00");
    };

    const calculateTime = () => {
      const currentTarget = getTarget();
      setTargetDate(currentTarget);

      const now = new Date();
      const difference = currentTarget.getTime() - now.getTime();

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

    // Sync from localStorage changes
    const syncTime = () => {
      calculateTime();
    };
    window.addEventListener("storage", syncTime);
    const pollInterval = setInterval(syncTime, 2000); // Poll local changes on the same tab

    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
      window.removeEventListener("storage", syncTime);
    };
  }, []);

  const handleAgreeTerms = async () => {
    if (!contributor) return;
    setIsSubmittingTerms(true);
    try {
      await editContributor(contributor.$id, { agreed: true });
      setIsTermsModalOpen(false);
      await refetchContributor();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTerms(false);
    }
  };

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (!contributor) {
    return <AccessWall type="contributor" />;
  }

  const isContributorActive = contributor?.status === "live";
  const followerCount = contributor?.followers ?? 0;
  const profileName = contributor?.username ?? user?.username ?? "Contributor";
  const profileInstitution = contributor?.institution ?? "Institution unavailable";
  const profileCountry = contributor?.country ?? "Country unavailable";
  const profileBio = contributor?.bio ?? "No bio available yet.";
  const profileStatus = contributor?.status ?? "pending";

  if (dashboardLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans text-gray-900">


      {/* --- Page Layout (Sidebar + Main) --- */}
      <div className="flex flex-1 overflow-hidden">


        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-white">
          <div style={{ marginBottom: 20, fontSize: 20, fontWeight: "bold" }}>
            My Dashboard
          </div>
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Screaming Contest Banner */}
            <div
              className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-500/30 text-white"
              style={{
                background: "linear-gradient(135deg, #312e81 0%, #4c1d95 50%, #831843 100%)",
                boxShadow: "0 10px 30px -5px rgba(76, 29, 149, 0.5), 0 0 20px rgba(131, 24, 67, 0.25)",
              }}
            >
              {/* Decorative backgrounds */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-12 translate-x-12 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-xl translate-y-12 -translate-x-12 pointer-events-none" />
              
              <div className="flex items-start gap-4 relative z-10">
                <div
                  className="mt-1 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shrink-0 border border-white/20"
                  style={{
                    animation: "dashboardFireBounce 1.5s ease-in-out infinite"
                  }}
                >
                  🏆
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                    🔥 30-Day Contributor Challenge
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
                    Win up to <span className="text-amber-300">₦100,000</span> in cash!
                  </h3>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-xl font-medium">
                    Upload courses, reach unique students, generate new users, and climb the leaderboard to secure your share of the prize pool.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end gap-3 shrink-0 relative z-10 w-full md:w-auto">
                <div className="text-center md:text-right bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 w-full md:w-auto">
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">
                    {timeLeft.isPast ? "Status: Challenge Active!" : "Count Down to Kickoff"}
                  </div>
                  <div className="font-mono text-lg font-black text-amber-300 tracking-wider">
                    {timeLeft.isPast ? (
                      <span className="text-green-400 animate-pulse">LIVE & ACTIVE</span>
                    ) : (
                      `${timeLeft.days}d : ${timeLeft.hours}h : ${timeLeft.minutes}m : ${timeLeft.seconds}s`
                    )}
                  </div>
                </div>
                
                <Link
                  href="/contributor/dashboard/contest"
                  className="w-full md:w-auto text-center bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 text-xs md:text-sm font-black py-3 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-amber-500/20 hover:scale-[1.03] active:scale-[0.98] border border-amber-300/30 uppercase tracking-wider text-decoration-none"
                >
                  {timeLeft.isPast ? "Enter Contest Arena" : "Join & View Rules"}
                </Link>
              </div>
            </div>

            {/* Missing Wallet Banner */}
            {
              !hasWallet && (
                <div className="bg-[#FFF8E6] border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Info size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">You don't have a Wallet</h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        Create a wallet to manage your earnings, track payments, and get paid for your contributions.
                      </p>
                    </div>
                  </div>
                  <Link href="/wallet/create" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md">
                    Create Wallet
                  </Link>
                </div>
              )
            }

            {/* Alert Banner */}
            {
              contributor?.status === "pending" && (
                <div className="bg-[#EBF3FF] border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                      <Info size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">Your application is currently Under Review</h3>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                        Full access to features will be granted once our academic board approves your credentials.
                      </p>
                    </div>
                  </div>
                  <button className="bg-white hover:bg-black text-black text-sm font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md" style={{ backgroundColor: "white" }}>
                    Application Status: Pending
                  </button>
                </div>
              )
            }

            {/* Profile & Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT SIDE - PROFILE */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl  border-slate-200 p-6 shadow-sm hover:shadow-md transition"
                  style={{ backgroundImage: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderWidth: 0 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Profile
                    </div>
                    <div className="flex items-center gap-2">
                      <ShareProfileButton contributorId={contributor?.$id || ""} />
                      <Link
                        href="/account"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex items-center gap-6">

                    {/* IMAGE */}
                    <div className="shrink-0">
                      <div
                        className="rounded-full overflow-hidden border-2 border-white shadow-md"
                        style={{ width: 90, height: 90 }}
                      >
                        <img
                          src={contributor?.profileImage || deskImg.src}
                          alt="profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 mb-1" style={{ fontSize: 16 }}>
                        {profileName}
                      </h2>

                      <div className="text-sm text-slate-500 mb-2" style={{ fontSize: 10 }}>
                        {profileInstitution} • {profileCountry}
                      </div>

                      <p className="text-sm text-slate-600 mb-3 line-clamp-2" style={{ fontSize: 10 }}>
                        {profileBio}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500 uppercase" style={{ fontSize: 10 }}>
                          Status:
                        </span>
                        <span
                          className={clsx(
                            "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                            profileStatus === "live"
                              ? "bg-green-100 text-green-700"
                              : profileStatus === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-700"
                          )}
                          style={{ backgroundColor: profileStatus === "live" ? " #90EE90" : "yellow", fontSize: 10 }}
                        >
                          {profileStatus}
                        </span>
                        {contributor?.isTopContributor && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1"
                            style={{ backgroundColor: '#FFF8E1', color: '#FF8F00', fontSize: 10, border: '1px solid #FFE082' }}
                          >
                            <Crown size={10} /> Top Contributor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* STATS */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900" style={{ fontSize: 12 }}>
                        {followerCount.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500" style={{ fontSize: 10 }}>Followers</div>

                      <div className="mt-3 text-xs text-slate-500" style={{ fontSize: 9 }}>
                        Member since
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {contributor?.$createdAt
                          ? new Date(contributor.$createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                          })
                          : "Recently"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak & Leaderboard Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Streak Card */}
                <button
                  onClick={() => setShowStreakCalendar(true)}
                  className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.98] text-left"
                  style={{
                    background: streakData && streakData.currentStreak > 0
                      ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)'
                      : 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                    border: streakData && streakData.currentStreak > 0
                      ? '1px solid #FFE0B2'
                      : '1px solid #E5E7EB',
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      lineHeight: 1,
                      animation: streakData && streakData.currentStreak > 0
                        ? 'dashboardFireBounce 1.2s ease-in-out infinite'
                        : 'none',
                      filter: streakData && streakData.currentStreak > 0
                        ? 'drop-shadow(0 2px 6px rgba(255, 69, 0, 0.3))'
                        : 'grayscale(0.5)',
                      opacity: streakData && streakData.currentStreak > 0 ? 1 : 0.5,
                    }}
                  >
                    🔥
                  </div>
                  <div>
                    <div style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: streakData && streakData.currentStreak > 0 ? '#FF4500' : '#9CA3AF',
                      lineHeight: 1,
                    }}>
                      {streakData?.currentStreak ?? 0}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: streakData && streakData.currentStreak > 0 ? '#E65100' : '#9CA3AF',
                      marginTop: 2,
                    }}>
                      Day Upload Streak
                    </div>
                  </div>
                </button>

                {/* Leaderboard Card */}
                <Link
                  href="/contributor/dashboard/leaderboard"
                  className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)',
                    border: '1px solid #D1C4E9',
                  }}
                >
                  <div style={{ fontSize: 36, lineHeight: 1 }}>🏆</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4A148C' }}>
                      Leaderboard
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#7B1FA2', marginTop: 2 }}>
                      See where you rank among contributors
                    </div>
                  </div>
                </Link>
              </div>


              {/* RIGHT SIDE - FIRST ACTION */}
              <ActionCard
                icon={<PlusCircle size={20} />}
                title="Create Course"
                desc="Launch a new course and publish learning materials."
                enabled={isContributorActive}
                link="/contributor/dashboard/create-course"
                index={0}
              />

              {/* SECOND ROW */}
              <ActionCard
                icon={<UploadCloud size={20} />}
                title="Upload Assets"
                desc="Batch upload notes and course assets for published classes."
                enabled={isContributorActive}
                link="/contributor/dashboard/upload"
                index={1}
              />

              <ActionCard
                icon={<LineChart size={20} />}
                title="Deep Analytics"
                desc="Track student engagement, visits, and content performance."
                enabled={false}
                link={`/contributor/dashboard/deep-analytics`}
                index={2}
              />

              {/* THIRD ROW */}
              <ActionCard
                icon={<PlusCircle size={20} />}
                title="Subscriptions & Payments"
                desc="Monitor paid subscribers and payouts across your work."
                enabled={isContributorActive}
                link={`/contributor/dashboard/subscriptions-and-earnings`}
                index={3}
              />

            </div>



            <style jsx>{`
              @keyframes dashboardFireBounce {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-6px) scale(1.08); }
              }
            `}</style>

            <CourseSection title='My Courses' courses={courses} />

          </div>
          {/* 
            <Message
  type="success"
  title="Payment Successful"
  message="Your course has been added to your library."
/>

<Message
  type="error"
  title="Payment Failed"
  message="Something went wrong. Try again."
/>

<Message
  message="This is just an informational message."
/> */}
        </main>

        <ContributorCelebrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contributorName={contributor.username}
          profileImage={contributor.profileImage}
        />

        <TermsModal
          open={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          onSubmit={handleAgreeTerms}
          loading={isSubmittingTerms}
        />

        {/* Streak Celebration Modal */}
        <StreakCelebrationModal
          isOpen={showStreakCelebration}
          onClose={() => setShowStreakCelebration(false)}
          currentStreak={streakCelebrationData.streak}
          dayName={streakCelebrationData.dayName}
        />

        {/* Streak Calendar Modal */}
        <StreakCalendarModal
          isOpen={showStreakCalendar}
          onClose={() => setShowStreakCalendar(false)}
          currentStreak={streakData?.currentStreak ?? 0}
          longestStreak={streakData?.longestStreak ?? 0}
          streakHistory={streakData?.streakHistory ?? []}
          joinedDate={streakData?.joinedDate ?? contributor.$createdAt?.slice(0, 10) ?? ''}
        />

        {/* Streak Reminder Modal */}
        <StreakReminderModal
          isOpen={showStreakReminder}
          onClose={() => setShowStreakReminder(false)}
          hasStreak={(streakData?.currentStreak ?? 0) > 0}
          currentStreak={streakData?.currentStreak ?? 0}
        />

        {/* Top Contributor Announcement (for all users on Sunday) */}
        {topContributor && (
          <TopContributorAnnouncementModal
            isOpen={showTopContributorAnnouncement}
            onClose={() => setShowTopContributorAnnouncement(false)}
            award={topContributor}
          />
        )}

        {/* Top Contributor Award (shareable, for the winner only) */}
        {topContributor && topContributor.contributorId === contributor.$id && (
          <TopContributorAwardModal
            isOpen={showTopContributorAward}
            onClose={() => setShowTopContributorAward(false)}
            contributorName={contributor.username}
            profileImage={contributor.profileImage}
            weeklyUploads={topContributor.weeklyUploads}
            totalUploads={topContributor.totalUploads}
          />
        )}

        {/* <TopContributorAwardModal
          isOpen={true}
          onClose={() => setShowTopContributorAward(false)}
          contributorName={contributor.username}
          profileImage={contributor.profileImage}
          weeklyUploads={42}
          totalUploads={100}
        /> */}

      </div>
    </div>
  );
}

// --- Helper Components ---


function ActionCard({
  icon,
  title,
  desc,
  enabled = false,
  link = "/",
  index = 0,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  enabled?: boolean;
  link?: string;
  index?: number;
}) {
  const gradientConfigs = [
    { from: "#3b82f6", to: "#06b6d4" }, // Blue → Violet (clean, modern default)
    { from: "#3b82f6", to: "#8b5cf6" }, // Blue → Cyan (fresh, techy)
    { from: "#3b82f6", to: "#10b981" }, // Blue → Emerald (calm, trustworthy)
    { from: "#3b82f6", to: "#f97316" }, // Blue → Orange (balanced contrast)
    { from: "#3b82f6", to: "#ec4899" }, // Blue → Pink (vibrant but controlled)
  ];

  const gradient = gradientConfigs[index % 4];

  const cardContent = (
    <div
      style={enabled ? { backgroundImage: `linear-gradient(170deg, ${gradient.from}, ${gradient.to})` } : undefined}
      className={clsx(
        "rounded-2xl border p-6 flex flex-col transition-all duration-500",
        enabled
          ? "shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer text-white"
          : "bg-[#F8F9FB] border-gray-100 opacity-70 pointer-events-none"
      )}
    >
      <div className={clsx(
        "w-10 h-10 rounded-full flex items-center justify-center mb-4",
        enabled ? "bg-white/20 text-white" : "bg-gray-200/50 text-gray-400"
      )}>
        {icon}
      </div>
      <h4 className={clsx("text-sm font-bold mb-2", enabled ? "text-white" : "text-gray-600")}>
        {title}
      </h4>
      <p className={clsx("text-xs leading-relaxed", enabled ? "text-white/90" : "text-gray-400")}>{desc}</p>
      <div className="mt-4 text-[11px] uppercase tracking-[0.12em] font-semibold">
        {!enabled && <span className="text-gray-500">Your Account Is Under Review</span>}
        {enabled && <span className="text-white/80">Click to explore</span>}
      </div>
    </div>
  );

  if (enabled && link) {
    return (
      <Link href={link} className="group active:scale-95 transition-transform">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}