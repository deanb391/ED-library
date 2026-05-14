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
} from "lucide-react";
import deskImg from "@/assets/images/desk.webp";
import Link from "next/link";
import { Course } from "@/lib/api/courses";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

// ✅ REAL API IMPORTS
import { getContributor, toggleFollowContributor } from "@/lib/api/contributors";
import { fetchCoursesByAdmin } from "@/lib/api/courses";
import { useUser } from "@/context/UserContext";

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
              className="group bg-white rounded-2xl border border-gray-200
                         hover:border-gray-300 overflow-hidden
                         flex flex-col transition
                         active:scale-[0.98]
                         hover:shadow-sm"
            >
              <div className="relative h-32 sm:h-36 bg-gray-100 overflow-hidden">
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
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <span>{course.code}</span>
                  <span className="text-gray-300">•</span>
                  <span>{course.session}</span>
                </div>

                {course.university && (
                  <span
                    className="truncate max-w-30 text-[10px] text-gray-500"
                  >
                    {course.university}
                  </span>
                )}

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

        const raw = contributorRes?.followersIds;

        let followersIds: string[] = [];

        if (raw) {
          try {
            followersIds = JSON.parse(raw);
            if (!Array.isArray(followersIds)) followersIds = [];
          } catch {
            followersIds = [];
          }
        }
        console.log("FOllowers ID: ", followersIds, user?.$id)

        if (user?.$id && followersIds.includes(user.$id)) {
          setFollowing(true);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 flex flex-col">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4">

          {/* Profile */}
          <section className="py-8 flex flex-col items-center text-center">

            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow border-2 border-white mb-4 cursor-pointer"
              style={{ height: 190, width: 190 }}
              onClick={() => setShowExpandedImage(true)}
            >
              <img
                src={contributor?.profileImage || deskImg.src}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold">
              {contributor?.username || "Contributor"}
            </h1>

            {/* Buttons */}
            <div className="mt-5 w-full flex flex-col items-center gap-3">
              <button
                onClick={handleFollow}
                disabled={follow}
                className="max-w-xs py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70"
                style={{
                  backgroundColor: following ? "#16a34a" : BRAND_BLUE,
                  paddingRight: 20,
                  paddingLeft: 20,
                  marginTop: 10,
                  cursor: follow ? "not-allowed" : "pointer",
                }}
              >
                {follow ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}

                {following ? "Following" : "Follow"}
              </button>

              <div className="flex gap-2 max-w-xs w-full">
                <button
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 font-semibold"
                  onClick={() =>
                    router.push(
                      `/subscribe/usbscribe-to-contributor/${slug}`
                    )
                  }
                  style={{ paddingRight: 20, paddingLeft: 20 }}
                >
                  Subscribe
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="w-full max-w-sm mt-6 bg-white border border-gray-100 rounded-xl overflow-hidden flex">
              <div className="flex-1 flex flex-col items-center py-4">
                <span className="text-xl font-bold"> {courses.length}</span>
                <span className="text-[11px] text-gray-500">
                  Courses
                </span>
              </div>

              <div className="w-px bg-gray-200" />

              <div className="flex-1 flex flex-col items-center py-4">
                <span className="text-xl font-bold">
                  {contributor?.followers || 0}
                </span>
                <span className="text-[11px] text-gray-500">
                  Followers
                </span>
              </div>

              <div className="w-px bg-gray-200" />

              <div className="flex-1 flex flex-col items-center py-4">
                <span className="text-xl font-bold">---</span>
                <span className="text-[11px] text-gray-500">
                  Rating
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="max-w-md mt-6">
              <p className="text-sm text-gray-600">
                {contributor?.bio ||
                  "Contributor on ED-Library platform."}
              </p>
            </div>
          </section>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              <button
                className="pb-3 text-sm font-semibold border-b-2"
                style={{
                  color: BRAND_BLUE,
                  borderColor: BRAND_BLUE,
                }}
              >
                Courses
              </button>
              <button className="pb-3 text-sm text-gray-500">
                About
              </button>
            </div>
          </div>

          <CourseSection title="courses" courses={courses} />
        </div>
      </main>

      {/* Expanded Image Modal */}
      {showExpandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowExpandedImage(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2"
            onClick={() => setShowExpandedImage(false)}
          >
            <X size={24} color="red" />
          </button>
          <img
            src={contributor?.profileImage || deskImg.src}
            className="max-w-full max-h-full object-contain rounded-lg"
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}