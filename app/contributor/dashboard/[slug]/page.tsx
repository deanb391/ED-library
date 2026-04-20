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
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import deskImg from "@/assets/images/desk.webp";
import { Course } from '@/lib/api/courses';
import { useUser } from '@/context/UserContext';
import { fetchCoursesByAdmin } from '@/lib/api/courses';

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

        <a
          href="/all_courses"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          See all
        </a>
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
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500" style={{fontSize: 12}}>
                <span>{course.code}</span>
                <span className="text-gray-300">•</span>
                <span>{course.session}</span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug" style={{fontSize: 10}}>
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

export default function DashboardUnderReviewPage() {
  const {
    user,
    loading: userLoading,
    contributor,
    contributorLoading,
    refetchContributor,
  } = useUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const isContributorActive = contributor?.status === "live";
  const followerCount = contributor?.followers ?? 0;
  const profileName = contributor?.username ?? user?.username ?? "Contributor";
  const profileInstitution = contributor?.institution ?? "Institution unavailable";
  const profileCountry = contributor?.country ?? "Country unavailable";
  const profileBio = contributor?.bio ?? "No bio available yet.";
  const profileStatus = contributor?.status ?? "pending";

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

  const isPageLoading = userLoading || contributorLoading || dashboardLoading;

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] flex flex-col font-sans text-gray-900">
      

      {/* --- Page Layout (Sidebar + Main) --- */}
      <div className="flex flex-1 overflow-hidden">


        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 bg-white">
          <div style={{ marginBottom: 20, fontSize: 20, fontWeight: "bold"}}>
            My Dashboard
          </div>
          <div className="max-w-5xl mx-auto space-y-8">
            
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
              <button className="bg-[#0B1528] hover:bg-black text-black text-sm font-bold py-3 px-6 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-md">
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
        <Link
          href="/account"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
        >
          Edit
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
          <h2 className="text-xl font-bold text-slate-900 mb-1" style={{fontSize: 16}}>
            {profileName}
          </h2>

          <div className="text-sm text-slate-500 mb-2" style={{fontSize: 10}}> 
            {profileInstitution} • {profileCountry}
          </div>

          <p className="text-sm text-slate-600 mb-3 line-clamp-2" style={{fontSize: 10}}>
            {profileBio}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase" style={{fontSize: 10}}>
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
              style={{backgroundColor: profileStatus === "live" ? " #90EE90" : "yellow", fontSize: 10}}
            >
              {profileStatus}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900" style={{fontSize: 12}}>
            {followerCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500" style={{fontSize: 10}}>Followers</div>

          <div className="mt-3 text-xs text-slate-500" style={{fontSize: 9}}>
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
    link="/admin/upload"
    index={1}
  />

  <ActionCard 
    icon={<LineChart size={20} />} 
    title="Deep Analytics" 
    desc="Track student engagement, visits, and content performance." 
    enabled={isContributorActive}
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

            {/* Disabled Action Cards
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <DisabledActionCard 
                icon={<PlusCircle size={20} />} 
                title="Create Course" 
                desc="Design and launch interactive curriculums for students worldwide." 
              />
              <DisabledActionCard 
                icon={<UploadCloud size={20} />} 
                title="Upload Assets" 
                desc="Batch upload research papers, slide decks, and lecture recordings." 
              />
              <DisabledActionCard 
                icon={<LineChart size={20} />} 
                title="Deep Analytics" 
                desc="Track student engagement, completion rates, and feedback loops." 
              />
              <DisabledActionCard 
                icon={<PlusCircle size={20} />} 
                title="Create Course" 
                desc="Design and launch interactive curriculums for students worldwide." 
              />
            </div>
 */}

              <CourseSection title='My Courses' courses={courses} />

          </div>
        </main>

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