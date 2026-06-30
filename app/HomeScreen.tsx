"use client";
import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Course,
  fetchCoursesForUser,
  fetchFreeCourses,
  fetchNewCourses,
  fetchPopularCourses,
  fetchRelatedCourse,
  searchCourses,
} from "@/lib/api/courses";

import { useUser } from "@/context/UserContext";
import { fetchLibraryCourse } from "@/lib/api/library";
import {
  getTopContributors,
  searchContributors,
  toggleFollowContributor,
  getContributorByUserId,
} from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import { fetchSmallAds } from "@/lib/ads";
import { fetchMediumAds } from "@/lib/api/ads";
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
  setContributors,
}: {
  title: string;
  contributors: HomeContributor[];
  setContributors: React.Dispatch<React.SetStateAction<HomeContributor[]>>;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [follow, setFollow] = useState(false);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleFollow = async (contributorId: string) => {
    if (!user) {
      router.push("/signin");
      return;
    }

    try {
      setLoadingId(contributorId);

      // optimistic update
      setContributors((prev) =>
        prev.map((c) =>
          c.$id === contributorId
            ? {
                ...c,
                isFollowing: !c.isFollowing,
                followers: c.isFollowing
                  ? (c.followers || 0) - 1
                  : (c.followers || 0) + 1,
              }
            : c,
        ),
      );

      const res = await toggleFollowContributor(user.$id, contributorId);

      if (!res) {
        // rollback if API fails
        setContributors((prev) =>
          prev.map((c) =>
            c.$id === contributorId
              ? {
                  ...c,
                  isFollowing: !c.isFollowing,
                  followers: c.isFollowing
                    ? (c.followers || 0) - 1
                    : (c.followers || 0) + 1,
                }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!contributors.length) return null;

  return (
    <section className="mb-12">
      <div className="mb-4 px-1">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {contributors.map((contributor) => (
          <Link
            href={`/contributor/account/${contributor.$id}`}
            key={contributor.$id}
            className="min-w-[220px] max-w-[220px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
                       shrink-0 p-4 flex flex-col items-center text-center
                       hover:shadow-md transition"
            style={{
              minWidth: 200,
              maxWidth: 200,
            }}
          >
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3">
              <Image
                src={contributor.profileImage}
                alt={contributor.username}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Username */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
              {contributor.username}
            </h3>

            {/* Institution + Country */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
              {contributor.institution} • {contributor.country}
            </p>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-1 mb-3">
              {contributor.category?.slice(0, 2).map((cat, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Followers */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
              {contributor.followers || 0} followers
            </p>

            {/* Action */}
            <button
              onClick={(e) => {
                e.preventDefault(); // stops navigation
                e.stopPropagation(); // stops bubbling to Link
                handleFollow(contributor.$id);
              }}
              disabled={loadingId === contributor.$id}
              className="w-full text-xs font-medium py-2 rounded-lg transition active:scale-[0.97] disabled:opacity-70 flex items-center justify-center"
              style={{
                backgroundColor: contributor.isFollowing
                  ? "#16a34a"
                  : "#2563eb",
                color: "#fff",
              }}
            >
              {loadingId === contributor.$id ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : contributor.isFollowing ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>
          </Link>
        ))}
      </div>
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
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !onLoadMore) return;

    const handleScroll = () => {
      if (!container) return;

      const { scrollLeft, clientWidth, scrollWidth } = container;

      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5;

      if (isAtEnd) {
        onLoadMore();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [courses, onLoadMore]);

  if (!courses.length) return null;

  return (
    <section className="mb-10" style={{ marginBottom: 30 }}>
      <div className="mb-4 px-1">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ paddingTop: 20 }}
      >
        {courses.map((course) => (
          <React.Fragment key={course.id}>
            <Link
              href={`/courses/${course.id}`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0 flex flex-col"
              style={{ minWidth: 200, maxWidth: 200 }}
            >
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-4xl">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  width={400}
                  height={240}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="p-3 flex flex-col gap-2 grow justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>{course.code}</span>
                    <span>•</span>
                    <span>{course.session}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <CourseContributor userId={course.user} />
              </div>
            </Link>
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="flex items-center justify-center min-w-15">
            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </section>
  );
}

function CourseSearch({
  onCourseResults,
  onContributorResults,
  onLoading,
  onCancelAll,
}: any) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      onCourseResults(null);
      return;
    }

    const t = setTimeout(async () => {
      onLoading(true);
      const res = await searchCourses(query);
      const res1 = await searchContributors(query);
      onCourseResults(res);
      onContributorResults(res1);
      console.log("Results: Contributors", res1);
      onLoading(false);
    }, 1500);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="text-center w-full max-w-4xl mx-auto mb-12">
      <h1
        className="text-4xl font-semibold mb-3 text-gray-900 dark:text-white"
        style={{ marginBottom: 30 }}
      >
        What are you learning today?
      </h1>

      <div className="relative w-full max-w-xl mx-auto">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800"
          style={{ color: "#6b7280" }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              onCancelAll();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <X size={18} />
          </button>
        )}
      </div>
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
  const {
    user,
    loading: userLoading,
    contributor,
    homeBannerAds,
    showAdHome,
  } = useUser();

  const [popular, setPopular] = useState<Course[]>([]);
  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [free, setFree] = useState<Course[]>([]);

  const [forYou, setForYou] = useState<Course[]>([]);
  const [library, setLibrary] = useState<Course[]>([]);
  const [related, setRelated] = useState<Course[]>([]);
  const [contributors, setContributors] = useState<HomeContributor[]>([]);

  const [smallSearchAds, setSmallSearchAds] = useState<AdItem[]>([]);
  const [smallTopAds, setSmallTopAds] = useState<AdItem[]>([]);
  const [smallMiddleAds, setSmallMiddleAds] = useState<AdItem[]>([]);
  const [largeSearchAds, setLargeSearchAds] = useState<AdItem[]>([]);
  const [largeTopAds, setLargeTopAds] = useState<AdItem[]>([]);
  const [largeMiddleAds, setLargeMiddleAds] = useState<AdItem[]>([]);
  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);

  const [offsets, setOffsets] = useState({
    popular: 0,
    new: 0,
    free: 0,
  });

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Course[] | null>(null);
  const [contributorResults, setContributorResults] = useState<
    HomeContributor[]
  >([]);
  const [courseResults, setCourseResults] = useState<Course[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [loadingMore, setLoadingMore] = useState({
    popular: false,
    new: false,
    free: false,
  });

  useEffect(() => {
    if (userLoading) return;

    async function load() {
      setLoading(true);

      const value = showAdHome();
      setBannerAdOpen(value);
      setCurrentBanner(pickRandom(homeBannerAds));
      const { searchAds, topAds, middleAds } = await fetchSmallAds();
      setSmallSearchAds(searchAds);
      setSmallTopAds(topAds);
      setSmallMiddleAds(middleAds);

      const { oneAds, twoAds, threeAds } = await fetchMediumAds();
      setLargeSearchAds(oneAds);
      setLargeTopAds(twoAds);
      setLargeMiddleAds(threeAds);

      const [p, n, f, t] = await Promise.all([
        fetchPopularCourses(10, 0),
        fetchNewCourses(10, 0),
        fetchFreeCourses(10, 0),
        getTopContributors(),
      ]);

      setPopular(p);
      setNewCourses(n);
      setFree(f);

      if (user) {
        const [fy, lib, rel] = await Promise.all([
          fetchCoursesForUser(user),
          fetchLibraryCourse(user.$id),
          fetchRelatedCourse(user),
        ]);

        setForYou(fy);
        setLibrary(lib);
        setRelated(rel);
      }
      const mapped = t.map((c: Contributor) => {
        let ids: string[] = [];

        try {
          ids = JSON.parse(c.followersIds || "[]");
          if (!Array.isArray(ids)) ids = [];
        } catch {
          ids = [];
        }

        return {
          ...c,
          isFollowing: user?.$id ? ids.includes(user.$id) : false,
        };
      });

      setContributors(mapped);
      setLoading(false);
    }

    load();
  }, [userLoading, user]);

  const loadMore = async (type: "popular" | "new" | "free") => {
    if (loadingMore[type]) return;

    setLoadingMore((l) => ({ ...l, [type]: true }));
    const nextOffset = offsets[type] + 10;

    let data: Course[] = [];

    if (type === "popular") data = await fetchPopularCourses(10, nextOffset);
    if (type === "new") data = await fetchNewCourses(10, nextOffset);
    if (type === "free") data = await fetchFreeCourses(10, nextOffset);

    if (!data.length) return;

    if (type === "popular") setPopular((p) => [...p, ...data]);
    if (type === "new") setNewCourses((p) => [...p, ...data]);
    if (type === "free") setFree((p) => [...p, ...data]);

    setOffsets((o) => ({ ...o, [type]: nextOffset }));

    setLoadingMore((l) => ({ ...l, [type]: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-gray-900 dark:text-white font-sans">
        {" "}
        <main className="max-w-7xl mx-auto px-5 py-12 md:py-16 flex flex-col items-center">
          {" "}
          {/* --- Hero Skeleton --- */}{" "}
          <div className="text-center w-full max-w-3xl mb-14">
            {" "}
            <div className="h-10 md:h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />{" "}
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto mb-8 animate-pulse" />{" "}
            {/* Search Skeleton */}{" "}
            <div className="relative w-full max-w-xl mx-auto animate-pulse">
              {" "}
              <div className="absolute inset-y-0 left-4 flex items-center">
                {" "}
                <Search
                  className="text-gray-300 dark:text-gray-600"
                  size={20}
                />{" "}
              </div>{" "}
              <div className="w-full h-14 rounded-xl bg-gray-200 dark:bg-gray-800" />{" "}
            </div>{" "}
          </div>{" "}
          {/* --- Grid Skeleton --- */}{" "}
          <div className="w-full">
            {" "}
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-6 animate-pulse" />{" "}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {" "}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse flex flex-col"
                >
                  {" "}
                  {/* Thumbnail */}{" "}
                  <div className="h-32 sm:h-36 bg-gray-200 dark:bg-gray-800" />{" "}
                  {/* Content */}{" "}
                  <div className="p-4 flex flex-col gap-2">
                    {" "}
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />{" "}
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />{" "}
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </main>{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto px-5 py-10">
        {/* Contest Banner */}
        <div
          onClick={() => router.push("/contest")}
          className="w-full max-w-4xl mx-auto mb-8 bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] flex flex-col md:flex-row items-center justify-between shadow-md"
        >
          <div>
            <h3 className="text-xl font-bold mb-1">
              🎉 Join The 15 days Contributor Challenge!
            </h3>
            <p className="text-blue-100 text-sm">
              Win exciting prizes by sharing your knowledge and growing the
              community.
            </p>
          </div>
          <button className="mt-4 md:mt-0 bg-white dark:bg-gray-900 text-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shrink-0 shadow-sm">
            View Contest
          </button>
        </div>

        <CourseSearch
          onCourseResults={setResults}
          onContributorResults={setContributorResults}
          onLoading={setSearchLoading}
          onCancelAll={() => {
            setResults(null);
            setContributorResults([]);
            setSearchLoading(false);
          }}
        />

        {searchLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Searching courses…
            </p>
          </div>
        ) : (results || contributorResults.length !== 0) && !searchLoading ? (
          <>
            {!results && contributorResults.length === 0 ? (
              <div>Not Found</div>
            ) : (
              <>
                <CourseSection title="Search results" courses={results || []} />
                <ContributorSection
                  title="Contributors"
                  contributors={contributorResults || []}
                  setContributors={setContributorResults}
                />
              </>
            )}
          </>
        ) : user ? (
          <>
            <CourseSection title="For You" courses={forYou} />
            <CourseSection title="Your Library" courses={library} />

            <RectangularAd
              ads={largeSearchAds || []} // or whichever ad array you want
              className="my-6"
            />

            <CourseSection
              title="Popular"
              courses={popular}
              onLoadMore={() => loadMore("popular")}
              isLoading={loadingMore.popular}
            />
            <CourseSection
              title="New"
              courses={newCourses}
              onLoadMore={() => loadMore("new")}
              isLoading={loadingMore.new}
            />

            <RectangularAd
              ads={smallMiddleAds || []} // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <CourseSection
              title="Free"
              courses={free}
              onLoadMore={() => loadMore("free")}
              isLoading={loadingMore.free}
            />
            <ContributorSection
              title="Top Contributors"
              contributors={contributors}
              setContributors={setContributors}
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

            <CourseSection
              title="Free"
              courses={free}
              onLoadMore={() => loadMore("free")}
            />
            <ContributorSection
              title="Top Contributors"
              contributors={contributors}
              setContributors={setContributorResults}
            />
          </>
        )}
      </main>

      {/* Floating Action Button for Approved Contributors */}
      {user && contributor?.status === "live" && <FloatingActionButton />}
    </div>
  );
}
