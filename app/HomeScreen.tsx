"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import ContributorCard from "@/components/ContributorCard";

import {
  Course,
  fetchCoursesForUser,
  fetchNewCourses,
  fetchPopularCourses,
  fetchRelatedCourse,
} from "@/lib/api/courses";
import clsx from "clsx";

import { useUser } from "@/context/UserContext";
import { useHome } from "@/context/HomeContext";
import { fetchLibraryCourse } from "@/lib/api/library";
import {
  getTopContributors,
  getNewContributors,
  searchContributors,
  toggleFollowContributor,
  getContributorByUserId,
} from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import { fetchSmallAds, fetchMediumAds } from "@/lib/api/ads";
import RectangularAd from "@/components/RectangularAd";
import { useRouter } from "@/components/useRouter";
import FloatingActionButton from "@/components/FloatingActionButton";

export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};

export type HomeContributor = Contributor & {
  isFollowing: boolean;
};

function ContributorSection({
  title,
  contributors,
}: {
  title: string;
  contributors: HomeContributor[];
}) {
  const [showAll, setShowAll] = useState(false);
  
  if (!contributors.length) return null;

  const displayContributors = showAll ? contributors : contributors.slice(0, 4);

  return (
    <section className="mb-10 w-full">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayContributors.map((contributor) => (
          <div key={contributor.$id} className="min-w-[280px] max-w-[280px] snap-start shrink-0 md:min-w-0 md:max-w-none md:shrink">
            <ContributorCard
              id={contributor.$id}
              contributorId={contributor.$id}
              name={contributor.username}
              institution={contributor.institution || ""}
              category={contributor.category}
              followers={contributor.followers || 0}
              imageUrl={contributor.profileImage || ""}
              initialIsFollowing={contributor.isFollowing}
            />
          </div>
        ))}
      </div>
      
      {contributors.length > 4 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center justify-center gap-1.5 w-full md:w-auto md:px-8 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mx-auto"
        >
          {showAll ? "Show less" : "Show more"}
          <ChevronDown size={16} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
        </button>
      )}
    </section>
  );
}

const globalContributorCache: Record<string, Contributor | null | undefined> =
  {};
const globalContributorPromises: Record<string, Promise<any> | undefined> = {};

function CourseContributor({ userId }: { userId: string }) {
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      setContributor(null);
      setLoading(false);
      return;
    }

    const cached = globalContributorCache[userId];
    if (cached !== undefined) {
      setContributor(cached);
      setLoading(false);
      return;
    }

    const pendingPromise = globalContributorPromises[userId];
    if (pendingPromise) {
      setLoading(true);
      pendingPromise.then((data) => {
        setContributor(data);
        setLoading(false);
      });
      return;
    }

    let isMounted = true;
    setLoading(true);

    globalContributorPromises[userId] = getContributorByUserId(userId)
      .then((data) => {
        if (data) {
          globalContributorCache[userId] = data;
        } else {
          globalContributorCache[userId] = null;
        }
        return data;
      })
      .catch((err) => {
        console.error("Error loading contributor for card:", err);
        globalContributorCache[userId] = null;
        return null;
      });

    globalContributorPromises[userId].then((data) => {
      if (isMounted) {
        setContributor(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 animate-pulse mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16 animate-pulse" />
      </div>
    );
  }

  if (!contributor) {
    return null;
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/contributor/account/${contributor.$id}`);
      }}
      className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 hover:opacity-80 transition-opacity"
    >
      <img
        src={contributor.profileImage || "/assets/avatar-placeholder.png"}
        alt={contributor.username}
        className="w-5 h-5 rounded-full object-cover border border-gray-100 dark:border-gray-800"
      />
      <span
        className="text-[3px] font-medium text-gray-600 dark:text-gray-400 truncate hover:text-blue-600 transition-colors"
        style={{ fontSize: 11, marginLeft: 10 }}
      >
        {contributor.username}
      </span>
    </div>
  );
}

function CourseSection({
  title,
  courses,
  onLoadMore,
  isLoading,
}: {
  title: string;
  courses: Course[];
  onLoadMore?: () => void;
  isLoading?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);

  if (!courses.length) return null;
  
  const displayCourses = showAll ? courses : courses.slice(0, 8);

  return (
    <section className="mb-10 w-full">
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayCourses.map((course) => (
          <div key={course.id} className="min-w-[280px] max-w-[280px] snap-start shrink-0 md:min-w-0 md:max-w-none md:shrink">
            <CourseCard course={course} />
          </div>
        ))}
      </div>

      {(courses.length > 8 || onLoadMore) && (
        <button 
          onClick={() => {
            if (showAll && onLoadMore && courses.length === displayCourses.length) {
               onLoadMore();
            } else {
               setShowAll(!showAll);
            }
          }}
          disabled={isLoading}
          className="mt-4 flex items-center justify-center gap-1.5 w-full md:w-auto md:px-8 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors mx-auto disabled:opacity-50"
        >
          {isLoading ? "Loading..." : showAll && courses.length === displayCourses.length && onLoadMore ? "Load more" : showAll ? "Show less" : "Show more"}
          {!isLoading && <ChevronDown size={16} className={`transition-transform ${showAll && courses.length > 8 && !onLoadMore ? "rotate-180" : ""}`} />}
        </button>
      )}
    </section>
  );
}

function CategoryPills() {
  const categories = [
    "All",
    "DaVinci Resolve",
    "Podcasts",
    "Music",
    "Graphic design",
    "Startup company",
    "Apple",
    "AI",
    "Adobe After Effects",
    "Mixes",
    "Live",
    "Wealth"
  ];
  
  return (
    <div 
      className="flex gap-3 overflow-x-auto mb-8 pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {categories.map((cat, i) => (
        <button
          key={i}
          className={clsx(
            "whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
            i === 0
              ? "bg-gray-900 text-white dark:bg-white dark:text-black"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export default function EDLibraryHome() {
  const router = useRouter();
  const { user, contributor } = useUser();

  const {
    popular,
    newCourses,
    newContributors,
    setNewContributors,
    forYou,
    library,
    related,
    contributors,
    setContributors,
    smallMiddleAds,
    largeSearchAds,
    smallTopAds,
    loading,
    loadingMore,
    loadMore,
  } = useHome();

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <main className="max-w-7xl mx-auto px-5 py-6 flex flex-col">
          
          {/* Pills Skeleton */}
          <div className="flex gap-3 overflow-hidden mb-8 pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0 animate-pulse" />
            ))}
          </div>

          {/* Course Section Skeleton */}
          <div className="w-full mb-10">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse flex flex-col h-64"
                >
                  <div className="h-32 bg-gray-200 dark:bg-gray-800" />
                  <div className="p-3 flex flex-col gap-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mt-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mt-1" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contributor Section Skeleton */}
          <div className="w-full mb-10">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-md mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse flex flex-col items-center p-4 h-56"
                >
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-full mt-auto" />
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto px-5 py-6">

        <CategoryPills />

        {user ? (
          <>
            <CourseSection title="Recommended For You" courses={forYou} />
            
            <ContributorSection
              title="Top Contributors"
              contributors={contributors}
            />

            <RectangularAd
              ads={largeSearchAds || []}
              className="my-6"
            />

            <CourseSection
              title="Popular"
              courses={popular}
              onLoadMore={() => loadMore("popular")}
              isLoading={loadingMore.popular}
            />

            <RectangularAd
              ads={smallMiddleAds || []}
              className="my-6"
              height={130}
            />

            <CourseSection
              title="New Courses"
              courses={newCourses}
              onLoadMore={() => loadMore("new")}
              isLoading={loadingMore.new}
            />

            <ContributorSection
              title="New Contributors"
              contributors={newContributors}
            />

            <RectangularAd
              ads={smallTopAds || []} // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <CourseSection title="Related Courses" courses={related} />
          </>
        ) : (
          <>
            <CourseSection
              title="Popular"
              courses={popular}
              onLoadMore={() => loadMore("popular")}
            />
            <CourseSection
              title="New"
              courses={newCourses}
              onLoadMore={() => loadMore("new")}
            />

            <RectangularAd
              ads={smallMiddleAds || []} // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <ContributorSection
              title="New Contributors"
              contributors={newContributors}
            />
            <ContributorSection
              title="Top Contributors"
              contributors={contributors}
            />
          </>
        )}
      </main>

      {/* Floating Action Button for Approved Contributors */}
      {user && contributor?.status === "live" && <FloatingActionButton />}
    </div>
  );
}
