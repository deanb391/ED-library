"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";

import {
  Course,
  fetchCoursesForUser,
  fetchFreeCourses,
  fetchNewCourses,
  fetchPopularCourses,
  fetchRelatedCourse,
  searchCourses
} from '@/lib/api/courses';

import { useUser } from '@/context/UserContext';
import { fetchLibraryCourse } from '@/lib/api/library';
import { getTopContributors, searchContributors, toggleFollowContributor } from '@/lib/api/contributors';
import { Contributor } from '@/lib/services/contributors.service';
import { fetchSmallAds } from '@/lib/ads';
import { fetchMediumAds } from '@/lib/api/ads';
import RectangularAd from '@/components/RectangularAd';
import { useRouter } from 'next/navigation';


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
            : c
        )
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
              : c
          )
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
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
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
            className="min-w-[220px] max-w-[220px] bg-white rounded-2xl border border-gray-200
                       flex-shrink-0 p-4 flex flex-col items-center text-center
                       hover:shadow-md transition"
            style={{
              minWidth: 200, maxWidth: 200
            }}
          >
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-3">
              <Image
                src={contributor.profileImage}
                alt={contributor.username}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Username */}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
              {contributor.username}
            </h3>

            {/* Institution + Country */}
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
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
            <p className="text-[11px] text-gray-500 mb-3">
              {contributor.followers || 0} followers
            </p>

            {/* Action */}
            <button
              onClick={(e) => {
                e.preventDefault();   // stops navigation
                e.stopPropagation();  // stops bubbling to Link
                handleFollow(contributor.$id);
              }}
              disabled={loadingId === contributor.$id}
              className="w-full text-xs font-medium py-2 rounded-lg transition active:scale-[0.97] disabled:opacity-70 flex items-center justify-center"
              style={{
                backgroundColor: contributor.isFollowing ? "#16a34a" : "#2563eb",
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
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
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
              className="bg-white rounded-2xl border border-gray-200 shrink-0 flex flex-col"
              style={{ minWidth: 200, maxWidth: 200 }}
            >
              <div className="relative h-32 bg-gray-100 overflow-hidden rounded-4xl">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  width={400}
                  height={240}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="p-3 flex flex-col gap-2 flex-grow">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>{course.code}</span>
                  <span>•</span>
                  <span>{course.session}</span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {course.description}
                </p>
              </div>
            </Link>
          </React.Fragment>
        ))}

        {isLoading && (
          <div className="flex items-center justify-center min-w-15">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
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
      const res1 = await searchContributors(query)
      onCourseResults(res);
      onContributorResults(res1)
      console.log("Results: Contributors", res1)
      onLoading(false);
    }, 1500);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="text-center w-full max-w-4xl mb-12">
      <h1 className="text-4xl font-semibold mb-3" style={{ color: 'black', marginBottom: 30 }}>
        What are you learning today?
      </h1>

      <div className="relative w-full max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200"
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
  const { user, loading: userLoading, homeBannerAds, showAdHome } = useUser();

  const [popular, setPopular] = useState<Course[]>([]);
  const [newCourses, setNewCourses] = useState<Course[]>([]);
  const [free, setFree] = useState<Course[]>([]);

  const [forYou, setForYou] = useState<Course[]>([]);
  const [library, setLibrary] = useState<Course[]>([]);
  const [related, setRelated] = useState<Course[]>([]);
  const [contributors, setContributors] = useState<HomeContributor[]>([]);

  const [smallSearchAds, setSmallSearchAds] = useState<AdItem[]>([])
  const [smallTopAds, setSmallTopAds] = useState<AdItem[]>([])
  const [smallMiddleAds, setSmallMiddleAds] = useState<AdItem[]>([])
  const [largeSearchAds, setLargeSearchAds] = useState<AdItem[]>([])
  const [largeTopAds, setLargeTopAds] = useState<AdItem[]>([])
  const [largeMiddleAds, setLargeMiddleAds] = useState<AdItem[]>([])
  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);



  const [offsets, setOffsets] = useState({
    popular: 0,
    new: 0,
    free: 0,
  });

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Course[] | null>(null);
  const [contributorResults, setContributorResults] = useState<HomeContributor[]>([]);
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

      const value = showAdHome()
      setBannerAdOpen(value)
      setCurrentBanner(pickRandom(homeBannerAds))
      const { searchAds, topAds, middleAds } = await fetchSmallAds()
      setSmallSearchAds(searchAds);
      setSmallTopAds(topAds);
      setSmallMiddleAds(middleAds);

      const { oneAds, twoAds, threeAds } = await fetchMediumAds()
      setLargeSearchAds(oneAds);
      setLargeTopAds(twoAds);
      setLargeMiddleAds(threeAds);

      const [p, n, f, t] = await Promise.all([
        fetchPopularCourses(10, 0),
        fetchNewCourses(10, 0),
        fetchFreeCourses(10, 0),
        getTopContributors()
      ]);

      setPopular(p);
      setNewCourses(n);
      setFree(f);

      if (user) {
        const [fy, lib, rel] = await Promise.all([
          fetchCoursesForUser(user),
          fetchLibraryCourse(user.$id),
          fetchRelatedCourse(user)
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
    return (<div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans"> <main className="max-w-7xl mx-auto px-5 py-12 md:py-16 flex flex-col items-center"> {/* --- Hero Skeleton --- */} <div className="text-center w-full max-w-3xl mb-14"> <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" /> <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse" /> {/* Search Skeleton */} <div className="relative w-full max-w-xl mx-auto animate-pulse"> <div className="absolute inset-y-0 left-4 flex items-center"> <Search className="text-gray-300" size={20} /> </div> <div className="w-full h-14 rounded-xl bg-gray-200" /> </div> </div> {/* --- Grid Skeleton --- */} <div className="w-full"> <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" /> <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse flex flex-col" > {/* Thumbnail */} <div className="h-32 sm:h-36 bg-gray-200" /> {/* Content */} <div className="p-4 flex flex-col gap-2"> <div className="h-3 bg-gray-200 rounded w-1/3" /> <div className="h-4 bg-gray-200 rounded w-3/4" /> <div className="h-3 bg-gray-200 rounded w-full" /> </div> </div>))} </div> </div> </main> </div>);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <main className="max-w-7xl mx-auto px-5 py-10">

        <CourseSearch
          onCourseResults={setResults}
          onContributorResults={setContributorResults}
          onLoading={setSearchLoading}
          onCancelAll={() => {
            setResults(null);
            setContributorResults([])
            setSearchLoading(false);
          }}
        />

        {searchLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4" />
            <p className="text-sm text-gray-600">
              Searching courses…
            </p>
          </div>
        ) : (results || contributorResults.length !== 0) && !searchLoading ? (
          <>
            {
              !results && (contributorResults.length === 0) ? (
                <div>Not Found</div>
              ) : (
                <>
                  <CourseSection title="Search results" courses={results || []} />
                  <ContributorSection title="Contributors" contributors={contributorResults || []} setContributors={setContributorResults} />
                </>
              )
            }
          </>
        ) : user ? (
          <>
            <CourseSection title="For You" courses={forYou} />
            <CourseSection title="Your Library" courses={library} />

            <RectangularAd
              ads={smallSearchAds || []}   // or whichever ad array you want
              className="my-6"
            />

            <CourseSection title="Popular" courses={popular} onLoadMore={() => loadMore("popular")} isLoading={loadingMore.popular} />
            <CourseSection title="New" courses={newCourses} onLoadMore={() => loadMore("new")} isLoading={loadingMore.new} />

            <RectangularAd
              ads={smallMiddleAds || []}   // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <CourseSection title="Free" courses={free} onLoadMore={() => loadMore("free")} isLoading={loadingMore.free} />
            <ContributorSection title="Top Contributors" contributors={contributors} setContributors={setContributors} />


            <RectangularAd
              ads={smallTopAds || []}   // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <CourseSection title="Related Courses" courses={related} />
          </>
        ) : (
          <>
            <CourseSection title="Popular" courses={popular} onLoadMore={() => loadMore("popular")} />
            <CourseSection title="New" courses={newCourses} onLoadMore={() => loadMore("new")} />

            <RectangularAd
              ads={smallMiddleAds || []}   // or whichever ad array you want
              className="my-6"
              height={130}
            />

            <CourseSection title="Free" courses={free} onLoadMore={() => loadMore("free")} />
            <ContributorSection title="Top Contributors" contributors={contributors} setContributors={setContributorResults} />
          </>
        )}

      </main>
    </div>
  );
}