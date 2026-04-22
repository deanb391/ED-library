"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchLibrary } from "@/lib/api/library";
import { fetchCourse, Course } from "@/lib/api/courses";
import Image from "next/image";

type Tab = "subscription" | "one-time";
const BRAND_BLUE = "#1C64F2";

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<Tab>("subscription");

  const [subscriptionCourses, setSubscriptionCourses] = useState<Course[]>([]);
  const [oneTimeCourses, setOneTimeCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;

    const loadLibrary = async () => {
      try {
        setLoading(true);

        const lib = (await fetchLibrary(user.$id)).wallet;

        if (!lib) {
          setSubscriptionCourses([]);
          setOneTimeCourses([]);
          return;
        }

        // ---- Parse safely (your JSON can betray you anytime)
        let subIds: string[] = [];
        let oneIds: string[] = [];

        try {
          subIds = lib.subscription ? JSON.parse(lib.subscription) : [];
          if (!Array.isArray(subIds)) subIds = [];
        } catch {
          subIds = [];
        }

        try {
          oneIds = lib.oneTime ? JSON.parse(lib.oneTime) : [];
          if (!Array.isArray(oneIds)) oneIds = [];
        } catch {
          oneIds = [];
        }

        // ---- Fetch in parallel (don’t be slow for no reason)
        const subCourses = await Promise.all(
          subIds.map(id => fetchCourse(id).catch(() => null))
        );

        const oneCourses = await Promise.all(
          oneIds.map(id => fetchCourse(id).catch(() => null))
        );

        setSubscriptionCourses(subCourses.filter(Boolean));
        setOneTimeCourses(oneCourses.filter(Boolean));

      } catch (err) {
        console.error("LIBRARY LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [user?.$id]);

    if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  const courses =
    activeTab === "subscription" ? subscriptionCourses : oneTimeCourses;

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
    padding: "1.5rem 1rem",
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <div
    style={{
      width: "100%",
      maxWidth: "672px", // Limits width on desktop for a better reading experience
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box"
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "1.5rem"
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "#111827"
        }}
      >
        <ArrowLeft size={24} />
      </button>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#111827",
          margin: 0
        }}
      >
        Your Library
      </h1>
    </div>

    {/* TABS */}
    <div
      style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}
    >
      <button
        onClick={() => setActiveTab("subscription")}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          border: "none",
          transition: "all 0.2s ease-in-out",
          backgroundColor: activeTab === "subscription" ? BRAND_BLUE : "#f3f4f6",
          color: activeTab === "subscription" ? "#ffffff" : "#4b5563",
        }}
      >
        Subscriptions
      </button>

      <button
        onClick={() => setActiveTab("one-time")}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "600",
          cursor: "pointer",
          border: "none",
          transition: "all 0.2s ease-in-out",
          backgroundColor: activeTab === "one-time" ? BRAND_BLUE : "#f3f4f6",
          color: activeTab === "one-time" ? "#ffffff" : "#4b5563",
        }}
      >
        Bought
      </button>
    </div>

    {/* CONTENT */}
    {courses.length === 0 ? (
      <div
        style={{
          textAlign: "center",
          fontSize: "0.875rem",
          color: "#6b7280",
          marginTop: "5rem"
        }}
      >
        No courses here yet.
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {courses.map((course) => (
    <Link
      key={course.id}
      href={`/courses/${course.id}`}
      className="group bg-white rounded-2xl border border-gray-200
                 hover:border-gray-300 overflow-hidden
                 flex flex-col transition
                 active:scale-[0.98]
                 hover:shadow-md"
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

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>{course.code}</span>
          <span className="text-gray-300">•</span>
          <span>{course.session}</span>
        </div>

        <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
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
    )}
  </div>
</div>
  );
}