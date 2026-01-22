"use client"
import React, { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, BookOpen, Atom, Globe, FlaskConical, Calculator, Terminal, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";

import { getCurrentUser } from '@/lib/appwrite';
import { Course, fetchCourses, searchCourses } from '@/lib/courses';
import { useUser } from '@/context/UserContext';
import NativeBanner from '@/components/ads/NativeBanner';

// --- Dummy Data Configuration ---
const DUMMY_COURSES = [
  {
    id: 1,
    code: 'MATH501',
    title: 'Advanced Mathematics',
    description: 'Calculus, Linear Algebra, and complex numbers deep dive.',
    image: '/api/placeholder/400/250', // Replace with actual asset
    color: 'text-blue-600',
    icon: <Calculator size={16} />
  },
  {
    id: 2,
    code: 'CS301',
    title: 'Computer Science',
    description: 'Foundations of algorithms and data structures.',
    image: '/api/placeholder/400/250',
    color: 'text-purple-600',
    icon: <Terminal size={16} />
  },
  {
    id: 3,
    code: 'HIST202',
    title: 'World History',
    description: 'From the industrial revolution to modern geopolitics.',
    image: '/api/placeholder/400/250',
    color: 'text-orange-600',
    icon: <Globe size={16} />
  },
  {
    id: 4,
    code: 'CHEM401',
    title: 'Organic Chemistry',
    description: 'Molecular structures and chemical reactions.',
    image: '/api/placeholder/400/250',
    color: 'text-teal-600',
    icon: <FlaskConical size={16} />
  },
  {
    id: 5,
    code: 'ENG105',
    title: 'English Literature',
    description: 'Classic and contemporary works analysis.',
    image: '/api/placeholder/400/250',
    color: 'text-indigo-600',
    icon: <BookOpen size={16} />
  },
  {
    id: 6,
    code: 'ECON201',
    title: 'Macroeconomics',
    description: 'Analysis of global markets and fiscal policies.',
    image: '/api/placeholder/400/250',
    color: 'text-green-600',
    icon: <TrendingUp size={16} />
  },
  {
    id: 7,
    code: 'PHYS202',
    title: 'Physics II',
    description: 'Electromagnetism and quantum mechanics basics.',
    image: '/api/placeholder/400/250',
    color: 'text-sky-600',
    icon: <Atom size={16} />
  },
  {
    id: 8,
    code: 'SOC101',
    title: 'Sociology',
    description: 'The study of social life, change, and causes.',
    image: '/api/placeholder/400/250',
    color: 'text-pink-600',
    icon: <Users size={16} />
  },
];

export default function EDLibraryHome() {
  
  const [ongoingCourses, setOngoingCourses] = useState<Course[]>([]);
const [pastCourses, setPastCourses] = useState<Course[]>([]);

  const [lloading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const {user, loading} = useUser()

  useEffect(() => {
  if (loading) return;

  async function loadCourses() {
    setLoading(true);

    const [ongoing, past] = await Promise.all([
      fetchCourses(user, true),
      fetchCourses(user, false),
    ]);

    setOngoingCourses(ongoing);
    setPastCourses(past);
    setLoading(false);
  }

  loadCourses();
}, [loading, user]);


useEffect(() => {
  if (loading) return;

  const timeout = setTimeout(async () => {
    if (!query.trim()) {
      const [ongoing, past] = await Promise.all([
        fetchCourses(user, true),
        fetchCourses(user, false),
      ]);

      setOngoingCourses(ongoing);
      setPastCourses(past);
      return;
    }

    setLoading(true);

    const results = await searchCourses(query, user);

    setOngoingCourses(results.filter(c => c.isOnGoing));
    setPastCourses(results.filter(c => !c.isOnGoing));

    setLoading(false);
  }, 1000); // 1500ms is slow and annoying

  return () => clearTimeout(timeout);
}, [query, user, loading]);



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
    <main className="max-w-7xl mx-auto px-5 py-12 md:py-16 flex flex-col items-center">

      {/* --- Hero Section --- */}
      <div className="text-center w-full max-w-3xl mb-14">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
          What are you learning today?
        </h1>
        <p className="text-gray-500 text-base md:text-lg mb-8 max-w-xl mx-auto">
          Made by students, for students.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search courses or codes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="w-full">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
            Ongoing Courses
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            View all
          </a>
        </div>

        {/* Grid */}
       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {ongoingCourses.map((course) => (
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

{/*
<NativeBanner />
*/}

  <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mt-16 mb-6">
  Past Courses
</h2>

<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 opacity-90">
  {pastCourses.map((course) => (
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



        {/* Show More */}
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white
                             border border-gray-200 hover:bg-gray-50
                             rounded-full text-sm font-medium text-gray-700
                             transition">
            Show more courses
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </main>
  </div>
);

}