"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, User } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useLibrary } from "@/hooks/useLibrary";
import { addCourseToLibrary } from "@/lib/api/library";
import { Loader2 } from "lucide-react";
import { Course } from "@/lib/api/courses";
import { getContributorByUserId } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import { useRouter } from "next/navigation";

// Global cache to avoid redundant fetches across cards
const globalContributorCache: Record<string, Contributor | null> = {};
const globalContributorPromises: Record<string, Promise<Contributor | null>> = {};

export default function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const [contributor, setContributor] = useState<Contributor | null>(null);

  const { user } = useUser();
  const { isInLibrary, addToLibraryCache } = useLibrary(user?.$id);
  const isSaved = isInLibrary(course.id);
  const [isAdding, setIsAdding] = useState(false);

  let priceAmount = 0;
  try {
    if (course.price && course.price.includes('{')) {
      const parsed = JSON.parse(course.price);
      priceAmount = parsed.isFree ? 0 : (parsed.amount || 0);
    } else if (course.price) {
      priceAmount = Number(course.price);
    }
  } catch (e) {}

  const isFree = priceAmount === 0;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/signin');
      return;
    }
    
    if (isSaved || !isFree) {
      router.push(`/courses/${course.id}`);
      return;
    }

    if (isFree && !isSaved) {
      setIsAdding(true);
      try {
        await addCourseToLibrary(user.$id, [course.id], 'one-time');
        addToLibraryCache(course.id);
      } catch (err) {
        console.error('Failed to add to library', err);
      } finally {
        setIsAdding(false);
      }
    }
  };


  useEffect(() => {
    const userId = course.user;
    if (!userId) return;

    if (globalContributorCache[userId] !== undefined) {
      setContributor(globalContributorCache[userId]);
      return;
    }

    if (userId in globalContributorPromises) {
      globalContributorPromises[userId].then((data) => {
        setContributor(data);
      });
      return;
    }

    globalContributorPromises[userId] = getContributorByUserId(userId)
      .then((data) => {
        if (data) {
          globalContributorCache[userId] = data;
        } else {
          globalContributorCache[userId] = null;
        }
        setContributor(data);
        return data;
      })
      .catch((err) => {
        console.error("Failed to fetch contributor for CourseCard", err);
        globalContributorCache[userId] = null;
        return null;
      });
  }, [course.user]);

  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const downloadedCourses = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
      if (downloadedCourses.includes(course.id)) {
        setIsDownloaded(true);
      }
    }
  }, [course.id]);

  return (
    <Link
      href={`/courses/${course.id}`}
      className="flex flex-col w-full h-[310px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-black group hover:shadow-md transition-shadow duration-200"
    >
      <div className="w-full h-[120px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
             <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {isDownloaded && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase z-10 flex items-center gap-1">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
             Downloaded
          </div>
        )}
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center mb-1 gap-1">
            <span className="text-[12px] font-bold text-blue-600 dark:text-blue-500 truncate max-w-[60%]">
              {course.code}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
              • {course.session}
            </span>
          </div>
          
          <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-tight mb-1.5 line-clamp-2">
            {course.title}
          </h3>

          <div className="flex items-center mb-2">
            {contributor?.profileImage ? (
              <Image
                src={contributor.profileImage}
                alt={contributor.username}
                width={16}
                height={16}
                className="w-4 h-4 rounded-full mr-1.5 object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mr-1.5">
                <User size={10} className="text-gray-500 dark:text-gray-400" />
              </div>
            )}
            <span className="text-[12px] text-gray-600 dark:text-gray-400 truncate">
              {contributor?.username || (typeof course.user === 'object' ? (course.user?.username || course.user?.name || course.user?.id) : course.user) || "Unknown"}
            </span>
          </div>

          <div className="flex flex-row items-center flex-wrap gap-1.5 mb-2">
            {course.department && (
              <div className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-full shrink max-w-full">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 truncate block">
                  {course.department}
                </span>
              </div>
            )}
            {course.level && (
              <div className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full shrink-0">
                <span className="text-[10px] font-semibold text-gray-900 dark:text-white block">
                  Level {course.level}
                </span>
              </div>
            )}
          </div>
        </div>

        <button 
          className="flex flex-row items-center justify-center py-2.5 rounded-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors gap-1.5 w-full mt-auto"
          onClick={handleActionClick}
          disabled={isAdding}
        >
          {isAdding ? (
            <Loader2 size={14} className="text-gray-900 dark:text-white animate-spin" />
          ) : !isSaved && isFree ? (
            <Plus size={14} className="text-gray-900 dark:text-white" />
          ) : null}
          <span className="text-[14px] font-bold text-gray-900 dark:text-white">
            {isAdding 
              ? "Adding..." 
              : isSaved 
                ? "View in library" 
                : isFree 
                  ? "Add to Library" 
                  : `Paid (NGN ${priceAmount.toLocaleString()})`}
          </span>
        </button>
      </div>
    </Link>
  );
}
