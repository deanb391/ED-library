"use client"

import React, { useEffect, useState } from 'react';
import { ChevronLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Course, fetchCoursesByAdmin } from '@/lib/api/courses';
import { useUser } from '@/context/UserContext';
import AccessWall from '@/components/AccessWall';

export default function ContributorCoursesPage() {
  const { user, loading: userLoading, contributor, contributorLoading } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user?.$id) return;
      try {
        const adminCourses = await fetchCoursesByAdmin(user.$id);
        setCourses(adminCourses);
      } catch (err) {
        console.error("Failed to load contributor courses", err);
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      loadCourses();
    }
  }, [user?.$id, userLoading]);

  if (userLoading || contributorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading courses...</p>
      </div>
    );
  }

  if (!user) return <AccessWall type="user" />;
  if (!contributor) return <AccessWall type="contributor" />;

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-6 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/contributor/dashboard/${contributor.$id || 'me'}`}
            className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-900 transition"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All My Courses</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view all your educational content</p>
          </div>
        </div>

        {loading ? (

          <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
          </div>

        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't created any courses yet.</p>
            <Link
              href="/contributor/dashboard/create-course"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800
                           hover:border-gray-300 dark:border-gray-700 overflow-hidden
                           flex flex-col transition
                           active:scale-[0.98]
                           hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative h-32 sm:h-36 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    width={400}
                    height={240}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 grow">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <span>{course.code}</span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span>{course.session}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-1">
                    {course.title}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600 dark:text-gray-400 mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
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
        )}
      </div>
    </div>
  );
}
