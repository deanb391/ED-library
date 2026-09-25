"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Bell,
  Link2,
  Star,
  Compass,
  Book,
  Users,
  User,
  Share2,
  X,
  Crown,
  ArrowLeft,
} from "lucide-react";
import deskImg from "@/assets/images/desk.webp";
import Link from "next/link";
import { Course } from "@/lib/api/courses";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "@/components/useRouter";

import { getContributor, toggleFollowContributor, checkFollowContributor } from "@/lib/api/contributors";
import { fetchCoursesByAdmin } from "@/lib/api/courses";
import { useUser } from "@/context/UserContext";
import BannerAd from "@/components/BannerAd";

const BRAND_BLUE = "#2962FF";
const BRAND_BLUE_LIGHT = "#EAF0FF";

function CourseSection({
  title,
  courses,
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

        <a
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
        >
          See all
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {courses.map((course) => {
          const priceData = course.price
            ? JSON.parse(course.price)
            : null;

          const isFree = priceData?.isFree;
          const amount = priceData?.type === "subscription" ? priceData?.amount : (priceData?.amount * (course?.pageCount as any));
          const currency = priceData?.currency || "₦";

          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
                         hover:border-gray-300 dark:border-gray-700 overflow-hidden
                         flex flex-col transition
                         active:scale-[0.98]
                         hover:shadow-sm"
            >
              <div className="relative h-32 sm:h-36 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />

                {/* Status Tag */}
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "4px 8px",
                    borderRadius: 6,
                    textTransform: "uppercase",
                    backgroundColor: course.isOnGoing
                      ? "#fb2c36"
                      : "#e5e7eb",
                    color: course.isOnGoing ? "#fff" : "#374151",
                    zIndex: 2,
                  }}
                >
                  {course.isOnGoing ? "Ongoing" : "Past"}
                </div>

                {/* Price Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    padding: "8px 12px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {isFree ? "Free" : `${currency} ${amount}`}
                  </div>

                  {!isFree && (
                    <div style={{ fontSize: 10, opacity: 0.8 }}>
                      {course.isOnGoing ? "per month" : "one-time"}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2 grow">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <span>{course.code}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{course.session}</span>
                </div>

                {course.university && (
                  <span
                    className="truncate max-w-30 text-[10px] text-gray-500 dark:text-gray-400"
                  >
                    {course.university}
                  </span>
                )}

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug">
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
          );
        })}
      </div>
    </section>
  );
}

export default function CreatorProfilePage({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useParams();


  const [contributor, setContributor] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser()
  const [follow, setFollow] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showExpandedImage, setShowExpandedImage] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${contributor?.username || "Contributor"}'s Profile`,
      text: `Check out ${contributor?.username || "Contributor"}'s courses on ED-Library!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // ── One-time S3 ACL migration ────────────────────────────────────────────
  // Runs on the very first page-load ever. Sets every existing contributor
  // profile image to public-read so share-preview crawlers can fetch it.
  // The localStorage flag ensures it never fires again after succeeding.
  useEffect(() => {
    const MIGRATION_KEY = "ed_img_migration_v2";
    if (localStorage.getItem(MIGRATION_KEY)) return; // already done

    fetch("/api/contributors/migrate-images", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          localStorage.setItem(MIGRATION_KEY, "done");
          console.log("[migrate-images] complete:", data.results);
        } else {
          console.warn("[migrate-images] failed:", data.error);
        }
      })
      .catch((err) => console.error("[migrate-images] network error:", err));
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {

        setLoading(true);
        setFollow(true)

        const contributorRes = await getContributor(slug);
        setContributor(contributorRes);

        if (!contributorRes) {
          return;
        }

        if (user?.$id) {
          const isFollowing = await checkFollowContributor(user.$id, contributorRes.$id);
          setFollowing(isFollowing);
        } else {
          setFollowing(false);
        }

        const courseRes = await fetchCoursesByAdmin(contributorRes.user);
        setCourses(courseRes || []);

        console.log(contributorRes, courseRes)
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
        setFollow(false)
      }
    }

    if (slug) load();
  }, [slug, user]);

  const handleFollow = async () => {
    if (!contributor) return;


    try {
      setFollow(true);

      if (!user) {
        router.push("/signin")
        setFollow(false);
        return;
      }

      const res = await toggleFollowContributor(
        user.$id,
        contributor.$id
      );

      if (!res) return;

      // optimistic UI toggle
      setFollowing((prev) => !prev);

      setContributor((prev: any) => {
        if (!prev) return prev;

        const current = prev.followers || 0;

        return {
          ...prev,
          followers: following ? current - 1 : current + 1,
        };
      });
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
    } finally {
      setFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-gray-900 dark:text-white flex flex-col w-full">
        <main className="flex-1 w-full pb-20">
          {/* Skeleton Banner */}
          <div className="w-full h-32 md:h-56 bg-gray-200 dark:bg-gray-800 animate-pulse relative" />
          
          <div className="max-w-6xl mx-auto px-4 md:px-6 w-full -mt-10 md:-mt-16">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 w-full">
              {/* Skeleton Avatar */}
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-700 animate-pulse z-10 shrink-0" />
              
              {/* Skeleton Header Info */}
              <div className="flex flex-col gap-2 flex-1 pb-2">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            </div>

            {/* Skeleton Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            </div>

            {/* Skeleton Tabs */}
            <div className="flex gap-6 mt-8 border-b border-gray-200 dark:border-gray-800">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
            </div>

            {/* Skeleton Courses */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<any>(null);
  const { allScreenBannerAds, showAdAll } = useUser();

  useEffect(() => {
    if (allScreenBannerAds.length > 0) {
      const value = showAdAll();
      setBannerAdOpen(value);
      setCurrentBanner(allScreenBannerAds[Math.floor(Math.random() * allScreenBannerAds.length)]);
    }
  }, [allScreenBannerAds]);

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white flex flex-col w-full overflow-x-hidden">
      <main className="flex-1 w-full pb-20">
        
        {currentBanner && (
          <BannerAd
            ad={currentBanner}
            isOpen={bannerAdOpen}
            onClose={() => setBannerAdOpen(false)}
          />
        )}

        {/* Responsive Banner */}
        <div className="relative w-full h-32 md:h-56 lg:h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {/* Desktop Image Banner (hidden on mobile) */}
          <div className="hidden md:block absolute inset-0">
            <img 
              src="https://picsum.photos/id/1050/1920/400" 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Mobile Gradient Banner (hidden on desktop) */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-400 to-blue-400" />
          
          {/* Mobile Back Button (on banner) */}
          <button 
            className="md:hidden absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full text-white transition-colors z-10"
            onClick={() => router.back()}
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 w-full -mt-10 md:-mt-16">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 relative w-full">
            
            {/* Avatar */}
            <div
              className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 cursor-pointer z-10 shrink-0"
              onClick={() => setShowExpandedImage(true)}
            >
              <img
                src={contributor?.profileImage || deskImg.src}
                className="w-full h-full object-cover"
                alt={contributor?.username || "Contributor"}
              />
            </div>

            {/* Profile Info (Name, Handle, Stats) */}
            <div className="flex flex-col gap-1 md:pb-2 pt-2 md:pt-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {contributor?.username || "Contributor"}
                </h1>
                {contributor?.isTopContributor && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-600 border border-yellow-200">
                    <Crown size={14} />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span>@{contributor?.username?.toLowerCase().replace(/\s+/g, '') || "user"}</span>
                <span className="hidden md:inline">•</span>
                <span>{contributor?.followers || 0} followers</span>
                <span className="hidden md:inline">•</span>
                <span>{courses.length} courses</span>
              </div>
            </div>
          </div>

          {/* Bio and Links */}
          <div className="mt-4 md:mt-5 max-w-2xl w-full">
            <p className="text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
              {contributor?.bio || "Contributor on ED-Library platform sharing quality educational resources and guides."} 
              <span className="font-bold cursor-pointer hover:underline text-gray-900 dark:text-white ml-1">...more</span>
            </p>
            
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm md:text-[15px] font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline">
              <Link2 size={16} className="text-gray-700 dark:text-gray-300" />
              <span>Rivers State University</span>
              <span className="text-gray-500 font-normal">and 1 more links</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleFollow}
              disabled={follow}
              className={`px-6 py-2 rounded-full font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm md:text-[15px] ${
                following 
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" 
                  : "bg-black dark:bg-white text-white dark:text-black"
              }`}
              style={{ cursor: follow ? "not-allowed" : "pointer" }}
            >
              {follow && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {following ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Unfollow
                </>
              ) : "Follow"}
            </button>
            
            <button className="px-6 py-2 rounded-full font-semibold transition flex items-center justify-center gap-2 text-sm md:text-[15px] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
              <Users size={18} />
              Community
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 md:gap-8 mt-8 border-b border-gray-200 dark:border-gray-800">
            <button className="pb-3 text-sm md:text-[15px] font-bold border-b-2 text-gray-900 dark:text-white border-gray-900 dark:border-white">
              Courses
            </button>
            <button className="pb-3 text-sm md:text-[15px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            <CourseSection title="" courses={courses} />
          </div>
        </div>
      </main>

      {/* Expanded Image Modal */}
      {showExpandedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowExpandedImage(false)}
        >
          <button
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition"
            onClick={() => setShowExpandedImage(false)}
          >
            <X size={28} />
          </button>
          <img
            src={contributor?.profileImage || deskImg.src}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            alt={contributor?.username || "Contributor"}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}