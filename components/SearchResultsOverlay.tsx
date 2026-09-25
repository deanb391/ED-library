"use client";

import React from "react";
import { useHome } from "@/context/HomeContext";
import CourseCard from "@/components/CourseCard";
import ContributorCard from "@/components/ContributorCard";
import { ArrowLeft } from "lucide-react";

export default function SearchResultsOverlay() {
  const { isSearchOverlayOpen, searchOverlayQuery, searchOverlayResults, isSearchOverlayLoading, closeSearch } = useHome();

  if (!isSearchOverlayOpen) return null;

  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-black z-30 overflow-y-auto w-full">
      <main className="max-w-7xl mx-auto px-5 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-6">
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Search results for &quot;{searchOverlayQuery}&quot;
          </h1>
        </div>

        {isSearchOverlayLoading ? (
          <div className="flex flex-col animate-pulse">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-64" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Courses Section */}
            {searchOverlayResults.courses.length > 0 && (
              <section className="mb-10 w-full">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Courses
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {searchOverlayResults.courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {/* Contributors Section */}
            {searchOverlayResults.contributors.length > 0 && (
              <section className="mb-10 w-full">
                <div className="mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Contributors
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {searchOverlayResults.contributors.map((contributor) => (
                    <ContributorCard
                      key={contributor.$id}
                      id={contributor.$id}
                      contributorId={contributor.$id}
                      name={contributor.username}
                      institution={contributor.institution || ""}
                      category={contributor.category}
                      followers={contributor.followers || 0}
                      imageUrl={contributor.profileImage || ""}
                      initialIsFollowing={false} // Would need to map proper following state if required
                    />
                  ))}
                </div>
              </section>
            )}

            {searchOverlayResults.courses.length === 0 && searchOverlayResults.contributors.length === 0 && (
              <div className="text-center text-gray-500 py-12 text-lg">
                No results found for &quot;{searchOverlayQuery}&quot;
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
