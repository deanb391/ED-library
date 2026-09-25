"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Calendar, Clock, WifiOff, Download, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { fetchLibrary } from "@/lib/api/library";
import { fetchCourseById, Course } from "@/lib/api/courses";
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

import AccessWall from "@/components/AccessWall";
import CourseCard from "@/components/CourseCard";
import BannerAd from "@/components/BannerAd";

export default function LibraryPage() {
  const router = useRouter();
  const { user, loading: userLoading, allScreenBannerAds, showAdAll, isOfflineMode } = useUser();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("subscription");
  const [subscriptionCourses, setSubscriptionCourses] = useState<Course[]>([]);
  const [oneTimeCourses, setOneTimeCourses] = useState<Course[]>([]);
  const [subscriptionMap, setSubscriptionMap] = useState<Record<string, Subscription>>({});

  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<any>(null);

  useEffect(() => {
    if (allScreenBannerAds.length > 0) {
      const value = showAdAll();
      setBannerAdOpen(value);
      setCurrentBanner(allScreenBannerAds[Math.floor(Math.random() * allScreenBannerAds.length)]);
    }
  }, [allScreenBannerAds]);


  useEffect(() => {
    if (!user?.$id) return;

    const loadLibrary = async () => {
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;

      setLoading(true);

      // ─── OFFLINE: load from localStorage immediately, no network calls ───
      if (!online) {
        try {
          const cachedSubMap = localStorage.getItem("cached_library_sub_map");
          const cachedSubCourses = localStorage.getItem("cached_library_sub_courses");
          const cachedOneCourses = localStorage.getItem("cached_library_one_courses");
          const downloaded = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');

          if (cachedSubMap) setSubscriptionMap(JSON.parse(cachedSubMap));
          if (cachedSubCourses) {
            const parsed = JSON.parse(cachedSubCourses);
            setSubscriptionCourses(parsed.filter((c: Course) => downloaded.includes(c.id)));
          }
          if (cachedOneCourses) {
            const parsed = JSON.parse(cachedOneCourses);
            setOneTimeCourses(parsed.filter((c: Course) => downloaded.includes(c.id)));
          }
        } catch (e) {
          // ignore parse errors
        } finally {
          setLoading(false);
        }
        return;
      }

      // ─── ONLINE: full network fetch ────────────────────────────────
      try {
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
          Promise.all(subIds.map((id) => fetchCourseById(id).catch(() => null))),
          Promise.all(oneIds.map((id) => fetchCourseById(id).catch(() => null))),
          fetchUserSubscriptions(user.$id).catch(() => [] as Subscription[]),
        ]);

        // Build a quick lookup: courseId → Subscription
        const subLookup: Record<string, Subscription> = {};
        for (const sub of userSubs) {
          subLookup[sub.courseId] = sub;
        }

        setSubscriptionMap(subLookup);
        const validSubCourses = subCourses.filter(Boolean) as Course[];
        const validOneTimeCourses = oneCourses.filter(Boolean) as Course[];

        setSubscriptionCourses(validSubCourses);
        setOneTimeCourses(validOneTimeCourses);

        if (typeof window !== "undefined") {
          localStorage.setItem("cached_library_sub_map", JSON.stringify(subLookup));
          localStorage.setItem("cached_library_sub_courses", JSON.stringify(validSubCourses));
          localStorage.setItem("cached_library_one_courses", JSON.stringify(validOneTimeCourses));
        }
      } catch (err) {
        console.error("LIBRARY LOAD ERROR:", err);
        // fallback to cache on unexpected error
        try {
          const cachedSubMap = localStorage.getItem("cached_library_sub_map");
          const cachedSubCourses = localStorage.getItem("cached_library_sub_courses");
          const cachedOneCourses = localStorage.getItem("cached_library_one_courses");
          const downloaded = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');

          if (cachedSubMap) setSubscriptionMap(JSON.parse(cachedSubMap));
          if (cachedSubCourses) {
            const parsed = JSON.parse(cachedSubCourses);
            setSubscriptionCourses(parsed.filter((c: Course) => downloaded.includes(c.id)));
          }
          if (cachedOneCourses) {
            const parsed = JSON.parse(cachedOneCourses);
            setOneTimeCourses(parsed.filter((c: Course) => downloaded.includes(c.id)));
          }
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();

    // When connection restores, re-fetch the full library
    const handleOnline = () => loadLibrary();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [user?.$id]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-blue-600" />
      </div>
    );
  }

  const allCourses = [...subscriptionCourses, ...oneTimeCourses].filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

  // ─── Offline non-premium wall ──────────────────────────────────────────────
  if (isOfflineMode && !user?.isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-white dark:bg-gray-950 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <WifiOff size={32} className="text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">You're offline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Offline access requires an <strong>ED-Library Premium</strong> subscription.
            Download courses in advance to read them without internet.
          </p>
        </div>
        <Link
          href="/premium"
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          <Lock size={14} />
          Get ED-Library Premium
        </Link>
      </div>
    );
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "transparent",
        padding: "1.5rem 1rem",
        boxSizing: "border-box",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {currentBanner && (
          <BannerAd
            ad={currentBanner}
            isOpen={bannerAdOpen}
            onClose={() => setBannerAdOpen(false)}
          />
        )}

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

        {/* CONTENT */}
        {allCourses.length === 0 ? (
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}