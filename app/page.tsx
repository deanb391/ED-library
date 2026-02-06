"use client"
import React, { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, BookOpen, Atom, Globe, FlaskConical, Calculator, Terminal, TrendingUp, Users, X } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";

import { getCurrentUser } from '@/lib/appwrite';
import { advancedSearchCourses, Course, fetchCourses, fetchCoursesForUser, fetchRecentCourses, searchCourses } from '@/lib/courses';
import { useUser } from '@/context/UserContext';
import NativeBanner from '@/components/ads/NativeBanner';
import { useRouter } from 'next/navigation';

// --- Dummy Data Configuration ---
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
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {courses.map(course => (
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
      <div className="p-4 flex flex-col gap-2 flex-grow">

        {/* Course code + session */}
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

                {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600 ml-0">
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

function CourseSearch({
  user,
  onResults,
   onLoading,
  onCancelAll,
}: {
  user: any;
  onResults: (results: Course[] | null) => void;
  onLoading: (v: boolean) => void;
  onCancelAll: () => void;

}) {
          const LEVELS = [100, 200, 300, 400, 500, 600];

const DEPARTMENTS = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Agricultural Engineering",
  "Marine Engineering",
];

const sessions = [
  "2023/2024",
  "2024/2025",
  "2025/2026"
]
  const [query, setQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    department: "",
    level: "",
    session: "",
  });

    const cancelEverything = () => {
    setQuery("");
    setShowAdvanced(false);
    setFilters({ department: "", level: "", session: "" });
    onCancelAll();
  };

  // Debounced text search
  useEffect(() => {
    if (!query.trim()) {
      onResults(null);
      return;
    }
    

    const t = setTimeout(async () => {
      onLoading(true);
      const res = await searchCourses(query, user);
      onResults(res);
      onLoading(false);
    }, 1500);

    return () => clearTimeout(t);
  }, [query, user]);

  return (
    <div className="text-center w-full max-w-3xl mb-12">
      <h1 className="text-4xl md:text-5xl font-semibold mb-3">
        What are you learning today?
      </h1>

      <div className="relative w-full max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search courses or codes..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200"
        />

        {query && (
          <button
            onClick={cancelEverything}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <button
        onClick={() => setShowAdvanced(v => !v)}
        className="mt-3 text-sm font-medium text-gray-600 flex items-center gap-1 mx-auto"
      >
        Advanced search
        <ChevronDown
          size={16}
          className={`transition ${showAdvanced ? "rotate-180" : ""}`}
        />
      </button>

      {showAdvanced && (
  <div className="mt-4 bg-white rounded-xl p-4 grid sm:grid-cols-3 gap-3">
    {/* Department */}
    <select
      value={filters.department}
      onChange={(e) =>
        setFilters((f) => ({ ...f, department: e.target.value }))
      }
      className="border border-blue-400 rounded-lg px-3 py-2 text-sm"
    >
      <option value="">Department</option>
      {DEPARTMENTS.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>

    {/* Level */}
    <select
      value={filters.level}
      onChange={(e) =>
        setFilters((f) => ({ ...f, level: e.target.value }))
      }
      className="border border-blue-400 rounded-lg px-3 py-2 text-sm"
    >
      <option value="">Level</option>
      {LEVELS.map((level) => (
        <option key={level} value={level}>
          {level}
        </option>
      ))}
    </select>

    {/* Session */}
    <select
      value={filters.session}
      onChange={(e) =>
        setFilters((f) => ({ ...f, session: e.target.value }))
      }
      className="border border-blue-400 rounded-lg px-3 py-2 text-sm"
    >
      <option value="">Session</option>
      {sessions.map((session) => (
        <option key={session} value={session}>
          {session}
        </option>
      ))}
    </select>

    {/* Search */}
    <button
      className="sm:col-span-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all
          active:scale-[0.98]"
      onClick={async () => {
        onLoading(true)
        const res = await advancedSearchCourses(filters);
        onResults(res);
        onLoading(false)
      }}
    >
      Search
    </button>

    <button
            className="bg-gray-100 text-gray-700 py-2 rounded-lg transition-all
          active:scale-[0.98]"
            onClick={cancelEverything}
          >
            Cancel
          </button>
  </div>
)}




    </div>
  );
}



export default function EDLibraryHome() {
  
  const [forYouCourses, setForYouCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Course[] | null>(null);
const [otherCourses, setOtherCourses] = useState<Course[]>([]);
const [recentCourses, setRecentCourses] = useState<Course[]>([]);
const [showAdvanced, setShowAdvanced] = useState(false);
const [searchLoading, setSearchLoading] = useState(false);
const [filters, setFilters] = useState({
  department: "",
  level: "",
  session: "",
});


  const [lloading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const {user, loading: userLoading} = useUser()
  const router = useRouter()

useEffect(() => {
  if (userLoading) return;

  async function load() {
    setLoading(true);

    if (!user) {
      const recent = await fetchRecentCourses();
      setRecentCourses(recent);
      setLoading(false);
      return;
    }

    const { forYou, others } = await fetchCoursesForUser(user);
    setForYouCourses(forYou);
    setOtherCourses(others);
    setLoading(false);
  }

  load();
}, [userLoading, user]);



// useEffect(() => {
//   if (loading) return;

//   const timeout = setTimeout(async () => {
//     if (!query.trim()) {
//       const [ongoing, past] = await Promise.all([
//         fetchCourses(user, true),
//         fetchCourses(user, false),
//       ]);

//       setOngoingCourses(ongoing);
//       setPastCourses(past);
//       return;
//     }

//     setLoading(true);

//     const results = await searchCourses(query, user);

//     setOngoingCourses(results.filter(c => c.isOnGoing));
//     setPastCourses(results.filter(c => !c.isOnGoing));

//     setLoading(false);
//   }, 1000); // 1500ms is slow and annoying

//   return () => clearTimeout(timeout);
// }, [query, user, loading]);



  if (lloading) {
 return (
    <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
      <main className="max-w-7xl mx-auto px-5 py-12 md:py-16 flex flex-col items-center">

        {/* --- Hero Skeleton --- */}
        <div className="text-center w-full max-w-3xl mb-14">
          <div className="h-10 md:h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8 animate-pulse" />

          {/* Search Skeleton */}
          <div className="relative w-full max-w-xl mx-auto animate-pulse">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <Search className="text-gray-300" size={20} />
            </div>
            <div className="w-full h-14 rounded-xl bg-gray-200" />
          </div>
        </div>

        {/* --- Grid Skeleton --- */}
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse flex flex-col"
              >
                {/* Thumbnail */}
                <div className="h-32 sm:h-36 bg-gray-200" />

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
 )
}


  return (
  <div className="min-h-screen bg-[#F8F9FB] text-gray-900 font-sans">
    <main className="max-w-7xl mx-auto px-5 py-10 md:py-16 flex flex-col items-center">

      {/* --- Hero Section --- */}

          <CourseSearch
            user={user}
            onResults={setResults}
            onLoading={setSearchLoading}
            onCancelAll={() => {
              setResults(null);
              setSearchLoading(false);
            }}
          />



      {/* --- Content Section --- */}
      <div className="w-full">


<div className="w-full">
  {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4" />
              <p className="text-sm text-gray-600">
                Searching courses…
              </p>
            </div>
          ) : results ? (
            <CourseSection title="Search results" courses={results} />
          ) : user ? (
            <>
              <CourseSection title="For you" courses={forYouCourses} />
              <CourseSection title="Others" courses={otherCourses} />
            </>
          ) : (
            <CourseSection title="Recently updated" courses={recentCourses} />
          )}
</div>


{/*
<NativeBanner />
*/}





        {/* Show More */}
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white
                             border border-gray-200 hover:bg-gray-50
                             rounded-full text-sm font-medium text-gray-700
                             transition-all
          active:scale-[0.98]"
                             onClick={(e) => {
                              router.push("/all_courses")
                             }}
                             >
            Show more courses
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </main>
  </div>
);

}