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
  Crown,
  Share2
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
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>

        <Link
          href="/contributor/courses"
          className="text-sm font-medium text-black dark:text-white underline hover:opacity-70 transition"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="group bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800
                       hover:border-gray-300 dark:border-gray-700 overflow-hidden
                       flex flex-col transition
                       active:scale-[0.98]
                       hover:shadow-sm"
          >
            {/* Thumbnail */}
            <div className="relative h-32 sm:h-36 bg-gray-100 dark:bg-gray-800 overflow-hidden">
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
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400" style={{ fontSize: 12 }}>
                <span>{course.code}</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span>{course.session}</span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug" style={{ fontSize: 10 }}>
                {course.title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
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
    return new Date("2026-06-29T12:00:00");
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isPastStart: boolean;
    isPastEnd: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isPastStart: false, isPastEnd: false });

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      if (!user) {
        if (isMounted) setDashboardLoading(false);
        return;
      }

      try {
        const adminCourses = await fetchCoursesByAdmin(user.$id);
        if (isMounted) setCourses(adminCourses.slice(0, 8));
      } catch (err) {
        console.error("Failed to load contributor dashboard data", err);
        if (isMounted) setCourses([]);
      } finally {
        if (isMounted) setDashboardLoading(false);
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, [user?.$id]);

  // Check if we should show the celebration modal
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = useState(false);
  useEffect(() => {
    if (contributor && contributor.status === 'live' && contributor.hasSeenCelebration !== true && !hasTriggeredCelebration) {
      setIsModalOpen(true);
      setHasTriggeredCelebration(true);
      // Immediately mark it as seen in the database so it won't show again on reload
      editContributor(contributor.$id, { hasSeenCelebration: true })
        .then(() => {
          // Refetch to ensure the local context is updated
          refetchContributor();
        })
        .catch(console.error);
    }
  }, [contributor, refetchContributor, hasTriggeredCelebration]);

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
      return storedDate ? new Date(storedDate) : new Date("2026-06-29T12:00:00");
    };

    const calculateTime = () => {
      const currentTarget = getTarget();
      setTargetDate(currentTarget);

      const now = new Date();
      const end = new Date(currentTarget.getTime());
      end.setDate(end.getDate() + 15);

      const pastStart = now.getTime() >= currentTarget.getTime();
      const pastEnd = now.getTime() >= end.getTime();

      let targetTime = currentTarget.getTime();
      if (pastStart && !pastEnd) {
        targetTime = end.getTime();
      }

      const difference = targetTime - now.getTime();

      if (difference <= 0 || pastEnd) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: pastStart,
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
        isPast: pastStart,
        isPastStart: pastStart,
        isPastEnd: pastEnd
      });
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
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

  const profileBio = contributor?.bio ?? "No bio available yet.";
  const profileStatus = contributor?.status ?? "pending";

    if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black px-4 py-8 md:py-12 animate-pulse flex flex-col font-sans">
        <main className="flex-1 max-w-5xl mx-auto w-full space-y-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-transparent flex flex-col font-sans text-gray-900 dark:text-white">


      {/* --- Page Layout (Sidebar + Main) --- */}
      <div className="flex flex-1 overflow-hidden">


        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-white dark:bg-transparent">
          <div style={{ marginBottom: 20, fontSize: 20, fontWeight: "bold" }}>
            My Dashboard
          </div>
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Contest banners disabled */}
            {/* Missing Wallet Banner */}
            {
              !hasWallet && (
                <div className="bg-[#FFF8E6] border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                      <Info size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">You don't have a Wallet</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
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
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Your application is currently Under Review</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                        Full access to features will be granted once our academic board approves your credentials.
                      </p>
                    </div>
                  </div>
                  <button className="bg-white dark:bg-gray-900 hover:bg-black text-black text-sm font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md" style={{ backgroundColor: "white" }}>
                    Application Status: Pending
                  </button>
                </div>
              )
            }

            {/* --- Bento Grid Hero --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Profile Card (Col Span 2) */}
              <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-3xl relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 p-32 bg-gray-50 dark:bg-[#0a0a0a] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-50 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col gap-8 h-full justify-between">
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 w-full">
                    <ShareProfileButton contributorId={contributor?.$id || ""} />
                    <Link
                      href="/account"
                      className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:opacity-80 transition-opacity"
                    >
                      Edit Profile
                    </Link>
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
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontSize: 16 }}>
                        {profileName}
                      </h2>

                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2" style={{ fontSize: 10 }}>
                        {profileInstitution}
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2" style={{ fontSize: 10 }}>
                        {profileBio}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase" style={{ fontSize: 10 }}>
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

                  </div>
                </div>
              </div>

              {/* Stats Stack (Col Span 1) */}
              <div className="lg:col-span-1 flex flex-row lg:flex-col gap-4 lg:gap-6">
                <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-3xl p-4 lg:p-6 flex flex-col justify-center">
                  <div className="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Followers</div>
                  <div className="text-2xl lg:text-4xl font-black text-black dark:text-white tracking-tighter">
                    {followerCount.toLocaleString()}
                  </div>
                </div>
                <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-3xl p-4 lg:p-6 flex flex-col justify-center">
                  <div className="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Member Since</div>
                  <div className="text-lg lg:text-2xl font-black text-black dark:text-white tracking-tighter">
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

            {/* --- Workspace --- */}
            <div className="mb-12">
              <div className="flex flex-col gap-4">
                <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 dark:text-gray-500 mb-2 pl-2">Creator Workspace</h3>
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">


              {/* RIGHT SIDE - FIRST ACTION */}
              <ActionCard
                icon={<PlusCircle size={20} />}
                iconColor="text-blue-500"
                title="Create Course"
                desc="Launch a new course and publish learning materials."
                enabled={isContributorActive}
                link="/contributor/dashboard/create-course"
                index={0}
              />

              {/* SECOND ROW */}
              <ActionCard
                icon={<UploadCloud size={20} />}
                iconColor="text-emerald-500"
                title="Upload Assets"
                desc="Batch upload notes and course assets for published classes."
                enabled={isContributorActive}
                link="/contributor/dashboard/upload"
                index={1}
              />

              {/* THIRD ROW */}
              <ActionCard
                icon={<PlusCircle size={20} />}
                iconColor="text-purple-500"
                title="Subscriptions & Payments"
                desc="Monitor paid subscribers and payouts across your work."
                enabled={isContributorActive}
                link={`/contributor/dashboard/subscriptions-and-earnings`}
                index={3}
              />

              <ActionCard
                icon={<Share2 size={20} />}
                iconColor="text-orange-500"
                title="Referrals & Contests"
                desc="Track referral clicks, sign-ups, and get your custom link."
                enabled={isContributorActive}
                link={`/contributor/dashboard/referrals`}
                index={4}
              />

                </div>
              </div>
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
  iconColor = "text-black dark:text-white",
  title,
  desc,
  enabled = false,
  link = "/",
  index = 0,
}: {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  desc: string;
  enabled?: boolean;
  link?: string;
  index?: number;
}) {
  const cardContent = (
    <div
      className={clsx(
        "group/card relative flex items-center justify-between p-5 transition-all duration-300 border-b border-gray-100 dark:border-[#222] last:border-0",
        enabled
          ? "bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#111] cursor-pointer"
          : "bg-gray-50 dark:bg-black opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-5">
        <div className={clsx(
          "w-12 h-12 rounded-xl flex items-center justify-center border",
          enabled 
            ? `bg-white dark:bg-black ${iconColor} border-gray-200 dark:border-[#333] shadow-sm` 
            : "bg-gray-100 dark:bg-[#111] text-gray-400 border-transparent"
        )}>
          {icon}
        </div>
        <div className="flex flex-col">
          <h4 className={clsx("text-[15px] font-bold tracking-tight", enabled ? "text-black dark:text-white" : "text-gray-600 dark:text-gray-400")}>
            {title}
          </h4>
          <p className={clsx("text-[13px] font-medium mt-0.5", enabled ? "text-gray-500 dark:text-gray-400" : "text-gray-400")}>
            {desc}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {!enabled && <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border border-gray-200 dark:border-[#333] px-2 py-1 rounded-md">Under Review</span>}
        {enabled && (
           <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#333] flex items-center justify-center text-gray-400 group-hover/card:text-black dark:group-hover/card:text-white group-hover/card:border-black dark:group-hover/card:border-white transition-colors">
             <span className="text-sm leading-none transform group-hover/card:translate-x-0.5 transition-transform">→</span>
           </div>
        )}
      </div>
    </div>
  );

  if (enabled && link) {
    return (
      <Link href={link} className="block active:scale-[0.99] transition-transform">
        {cardContent}
      </Link>
    );
  }
  return cardContent;
}
