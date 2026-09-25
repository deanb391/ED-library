"use client";

import React, { useEffect, useState } from "react";
import CourseDetailsClient from "../courses/[slug]/CourseDetailsClient";

export default function OfflineCourseFallback() {
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    // Extract the course ID from the URL: /courses/[id]
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id && id !== "courses") {
      setCourseId(id);
    }
  }, []);

  if (!courseId) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-500">
        Loading offline course...
      </div>
    );
  }

  return <CourseDetailsClient courseId={courseId} />;
}
