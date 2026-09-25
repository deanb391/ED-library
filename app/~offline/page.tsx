"use client";

import React, { useEffect, useState } from "react";
import LibraryPage from "../library/page";
import CourseDetailsClient from "../courses/[slug]/CourseDetailsClient";

export default function OfflineFallbackPage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isCourseRoute, setIsCourseRoute] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    
    if (path.startsWith("/courses/")) {
      setIsCourseRoute(true);
      const pathParts = path.split('/');
      const id = pathParts[pathParts.length - 1];
      if (id && id !== "courses") {
        setCourseId(id);
      }
    }
    
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-500">
        Loading offline content...
      </div>
    );
  }

  if (isCourseRoute && courseId) {
    return <CourseDetailsClient courseId={courseId} />;
  }

  return <LibraryPage />;
}
