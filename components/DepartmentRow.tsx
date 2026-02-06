"use client";

import { useEffect, useRef, useState } from "react";
import { fetchCoursesByDepartment } from "@/lib/courses";
import Link from "next/link";
import Image from "next/image";


const PAGE_SIZE = 5;

export default function DepartmentRow({ department }: { department: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

 const hasFetchedRef = useRef(false);

useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  loadMore();
}, []);

 async function loadMore() {
  if (loading || !hasMore) return;

  setLoading(true);

  const res = await fetchCoursesByDepartment({
    department,
    limit: PAGE_SIZE,
    offset,
  });

  setCourses(prev => {
    const next = [...prev, ...res.courses];

    if (next.length >= res.total) {
      setHasMore(false);
    }

    return next;
  });

  setOffset(prev => prev + PAGE_SIZE);
  setLoading(false);
}


  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;

    const nearEnd =
      el.scrollLeft + el.clientWidth >= el.scrollWidth - 50;

    if (nearEnd) {
      loadMore();
    }
  }

  const margin = courses.length > 0 ? "mb-8 bg-[#F8F9FB]" : "mb-1 bg-[#F8F9FB]"
  const padding = courses.length > 0 ? "5" : "0"

  return (
    <section className={`${margin} bg-[#F8F9FB]`}>
      {
        courses.length > 0 && (
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
        {department}
      </h2>
        )
      }

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`flex gap-4 overflow-x-auto pb-${padding} pt-${padding} `}
      >
        {courses.map(course => (
          <div key={course.$id} className="sm:grid-cols-2">
            <Link
      href={`/courses/${course.$id}`}
      key={course.$id}
      className="group
    flex-none
    w-45 h-80
    sm:w-70 sm:h-70
    bg-white rounded-2xl
    border border-gray-200
    hover:border-gray-300
    overflow-hidden
    flex flex-col
    transition
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
          </div>
        ))}

        {loading && hasMore && courses.length > 0 && (
  <div className="min-w-[260px] flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
  </div>
)}


        {loading && courses.length === 0  && (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="
          bg-white rounded-2xl border border-gray-200
          overflow-hidden animate-pulse
          flex flex-col
          min-w-45
        "
      >
        {/* Thumbnail */}
        <div className="h-50 sm:h-36 bg-gray-200" />

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
      </div>
    ))}
  </div>
)}

      </div>
    </section>
  );
}
