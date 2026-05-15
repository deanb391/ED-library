"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { uploadThumbnail, createCourse } from "@/lib/api/courses";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import NativeBanner from "@/components/ads/NativeBanner";
import CoursePriceModalPast from "@/components/CoursePriceModalPast";
import CourseTypeModal from "@/components/CourseTypeModal";
import CoursePriceModalOngoing from "@/components/CoursePriceModalOngoing";


import AccessWall from "@/components/AccessWall";

export default function CreateCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [university, setUniversity] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
  const [showPriceModalPast, setShowPriceModalPast] = useState(false);
  const [showPriceModalOngoing, setShowPriceModalOngoing] = useState(false);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading, contributor, contributorLoading } = useUser()
  const [level, setLevel] = useState("");
  const [session, setSession] = useState("")
  const [department, setDepartment] = useState("");
  const [courseType, setCourseType] = useState("");

  const LEVELS = [100, 200, 300, 400, 500, 600];

  const sessions = [
    "2023/2024",
    "2024/2025",
    "2025/2026"
  ]

  useEffect(() => {
    if (userLoading || contributorLoading) return;
    setLoading(false);
  }, [user, userLoading, contributor, contributorLoading]);

  if (userLoading || contributorLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (!contributor) {
    return <AccessWall type="contributor" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.$id) {
      alert("Unable to create course without a signed-in user.");
      return;
    }

    if (!thumbnail) {
      alert("Please upload a course thumbnail.");
      return;
    }

    if (!university.trim()) {
      alert("Please enter the university.");
      return;
    }

    setShowCourseTypeModal(true);
  };

  const handleCreateCourse = async ({ price, isFree }: { price: number; isFree: boolean }) => {
    if (!thumbnail) return;
    if (!user?.$id) {
      alert("Unable to create course without a signed-in user.");
      return;
    }

    const userId = user.$id;
    const lvl = Number(level);

    // If price is 0 the course is always free, regardless of what the modal sent
    const effectiveIsFree = price === 0 ? true : isFree;
    setIsLoading(true);
    if (courseType === "ongoing") {
      setShowPriceModalOngoing(false);
    } else if (courseType === "past") {
      setShowPriceModalPast(false);
    }

    try {
      const uploaded = await uploadThumbnail(thumbnail);

      const response = await createCourse({
        title,
        code,
        description,
        lecturer: lecturer || undefined,
        university,
        thumbnailId: uploaded.fileId,
        thumbnailUrl: uploaded.url,
        user: userId,
        department: department,
        level: lvl,
        session: session,
        isOnGoing: courseType === "ongoing" ? true : false,
        price: JSON.stringify({
          type: courseType === "ongoing" ? "subscription" : "one-time",
          amount: price,
          currency: "NGN",
          isFree: effectiveIsFree
        }),
        analytics: JSON.stringify({
          avg_rating: 0.0,
          avg_time: 0.0,
          reached: [],
          visits_per_day: {
            mon: 0,
            tue: 0,
            wed: 0,
            thu: 0,
            fri: 0,
            sat: 0,
            sun: 0
          }
        }),
        pageCount: 0,
      });


      alert("Course created successfully");
      router.push(`/courses/${response.$id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create course");
    } finally {
      setIsLoading(false);
      setCourseType("")
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">

        {/* Top Accent */}
        <div className="h-1 w-full bg-blue-600" />

        <div className="p-8 sm:p-10 bg-white">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10 bg-white">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Plus size={24} strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Create course
            </h1>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Add a new course to your library. Keep it clear and structured.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            style={{ marginTop: 30 }}
          >
            {/* Course Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Course title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Engineering Mechanics"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Course Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Course code
              </label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MECH 311"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                University
              </label>
              <input
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="University of Lagos"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Lecturer */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lecturer <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Dr. A. Smith"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Session
              </label>
              <select
                required
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="" disabled>
                  Select session
                </option>
                {sessions.map((ses) => (
                  <option key={ses} value={ses}>
                    {ses}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Level
              </label>
              <select
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="" disabled>
                  Select level
                </option>
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <input
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Brief description of the course content"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 resize-none
                         focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Course thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) =>
                  setThumbnail(e.target.files ? e.target.files[0] : null)
                }
                className="block w-full text-sm text-gray-600
                         file:mr-4 file:py-2.5 file:px-4
                         file:rounded-xl file:border-0
                         file:bg-blue-50 file:text-blue-600 file:font-medium
                         hover:file:bg-blue-100 transition"
              />
            </div>

            {/* Submit */}
            <button
              disabled={isLoading}
              className="md:col-span-2 w-full mt-2 bg-blue-600 text-white py-3.5 rounded-xl font-medium
                       hover:bg-blue-500 active:bg-blue-700
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Creating…" : "Proceed"}
            </button>
          </form>

          {/* Cancel */}
          <div className="mt-6 text-center text-sm text-gray-500 hover:text-gray-700 transition"
            onClick={() => {
              router.back()
            }}
          >

            Cancel

          </div>
        </div>
      </div>

      <CourseTypeModal
        isOpen={showCourseTypeModal}
        onClose={() => setShowCourseTypeModal(false)}
        onConfirm={(selected) => {
          setCourseType(selected)
          setShowCourseTypeModal(false);
          selected === "ongoing" ? setShowPriceModalOngoing(true) : setShowPriceModalPast(true)
        }}
        isSaving={false}
      />

      <CoursePriceModalPast
        isOpen={showPriceModalPast}
        onClose={() => setShowPriceModalPast(false)}
        onConfirm={handleCreateCourse}
        isSaving={isLoading}
        initialPrice={price}
        initialFree={isFree}
      />

      <CoursePriceModalOngoing
        isOpen={showPriceModalOngoing}
        onClose={() => setShowPriceModalOngoing(false)}
        onConfirm={handleCreateCourse}
        isSaving={isLoading}
        initialPrice={price}
        initialFree={isFree}
      />
    </div>
  );

}
