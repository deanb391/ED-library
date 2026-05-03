"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { fetchLibrary } from "@/lib/api/library";
import { fetchCourse, Course } from "@/lib/api/courses";
import { fetchUserSubscriptions, Subscription } from "@/lib/api/subscriptions";
import Image from "next/image";

type Tab = "subscription" | "one-time";
const BRAND_BLUE = "#1C64F2";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpired(endDate: string) {
  return new Date(endDate).toISOString() <= new Date().toISOString();
}

export default function LibraryPage() {
  const router = useRouter();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<Tab>("subscription");
  const [subscriptionCourses, setSubscriptionCourses] = useState<Course[]>([]);
  const [oneTimeCourses, setOneTimeCourses] = useState<Course[]>([]);
  const [subscriptionMap, setSubscriptionMap] = useState<Record<string, Subscription>>({});
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

        // Fetch courses and subscriptions in parallel
        const [subCourses, oneCourses, userSubs] = await Promise.all([
          Promise.all(subIds.map((id) => fetchCourse(id).catch(() => null))),
          Promise.all(oneIds.map((id) => fetchCourse(id).catch(() => null))),
          fetchUserSubscriptions(user.$id).catch(() => [] as Subscription[]),
        ]);
        console.log("userSubs: ", userSubs);

        // Build a quick lookup: courseId → Subscription
        const subLookup: Record<string, Subscription> = {};
        for (const sub of userSubs) {
          subLookup[sub.courseId] = sub;
        }

        setSubscriptionMap(subLookup);
        console.log(subLookup);
        setSubscriptionCourses(subCourses.filter(Boolean) as Course[]);
        setOneTimeCourses(oneCourses.filter(Boolean) as Course[]);
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
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "672px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
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
              color: "#111827",
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}
          >
            Your Library
          </h1>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
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
              backgroundColor:
                activeTab === "subscription" ? BRAND_BLUE : "#f3f4f6",
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
              backgroundColor:
                activeTab === "one-time" ? BRAND_BLUE : "#f3f4f6",
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
              marginTop: "5rem",
            }}
          >
            No courses here yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courses.map((course) => {
              const sub =
                activeTab === "subscription"
                  ? subscriptionMap[course.id]
                  : undefined;
              const expired = sub ? isExpired(sub.endDate) : false;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col transition hover:shadow-md"
                >
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex gap-4 p-4"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-20 w-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        width={96}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-1 justify-center">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <span>{course.code}</span>
                        <span className="text-gray-300">•</span>
                        <span>{course.session}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                        {course.title}
                      </h3>
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

                  {/* Subscription metadata row */}
                  {activeTab === "subscription" && sub && (
                    <div
                      className="flex items-center justify-between px-4 pb-4 gap-3 flex-wrap"
                      style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}
                    >
                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            Start: {formatDate(sub.startDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>
                            Ends: {formatDate(sub.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: expired ? "#fee2e2" : "#dcfce7",
                            color: expired ? "#991b1b" : "#166534",
                          }}
                        >
                          {expired ? "Expired" : "Active"}
                        </span>

                        {expired && (
                          <button
                            onClick={() =>
                              router.push(
                                `/subscribe/usbscribe-to-contributor/checkout?courses=${course.id}&type=subscription`
                              )
                            }
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                            style={{ backgroundColor: BRAND_BLUE }}
                          >
                            <RefreshCw size={12} />
                            Resubscribe
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}