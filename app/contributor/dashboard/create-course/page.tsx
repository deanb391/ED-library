"use client";

import React, { useEffect, useState, useRef } from "react";
import { Plus, Camera, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { uploadThumbnail, createCourse } from "@/lib/api/courses";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import CoursePriceModalPast from "@/components/CoursePriceModalPast";

import AccessWall from "@/components/AccessWall";

export default function CreateCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [university, setUniversity] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading, contributor, contributorLoading } = useUser()
  const [level, setLevel] = useState("");
  const [session, setSession] = useState("")
  const [department, setDepartment] = useState("");

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black dark:border-white border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (!contributor) {
    return <AccessWall type="contributor" />;
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const uploaded = await uploadThumbnail(file);
      setThumbnailUrl(uploaded.url);
      setThumbnailId(uploaded.fileId);
    } catch (err) {
      console.error(err);
      alert("Failed to upload thumbnail.");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.$id) {
      alert("Unable to create course without a signed-in user.");
      return;
    }

    if (!thumbnailUrl) {
      alert("Please upload a course thumbnail first.");
      return;
    }

    if (!university.trim()) {
      alert("Please enter the university.");
      return;
    }

    setShowPriceModal(true);
  };

  const handleCreateCourse = async ({ price, isFree }: { price: number; isFree: boolean }) => {
    if (!thumbnailUrl) return;
    if (!user?.$id) {
      alert("Unable to create course without a signed-in user.");
      return;
    }

    const userId = user.$id;
    const lvl = Number(level);

    // If price is 0 the course is always free
    const effectiveIsFree = price === 0 ? true : isFree;
    const finalPrice = effectiveIsFree ? "0" : String(price);

    setIsLoading(true);
    setShowPriceModal(false);

    try {
      const response = await createCourse({
        title,
        code,
        description,
        lecturer: lecturer || undefined,
        university,
        thumbnailId: thumbnailId,
        thumbnailUrl: thumbnailUrl,
        user: userId,
        department: department,
        level: lvl,
        session: session,
        isOnGoing: false, // Defaulting to false since course type was removed
        price: finalPrice,
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-black dark:border-white border-solid mb-4"></div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">Loading, please wait...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">

        {/* Top Accent */}
        <div className="h-1 w-full bg-gray-900 dark:bg-gray-100" />

        <div className="p-8 sm:p-10 bg-white dark:bg-black">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10 bg-white dark:bg-black relative">
            <button onClick={() => router.back()} className="absolute left-0 top-0 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
              <ArrowLeft size={16} /> Back
            </button>
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl flex items-center justify-center mb-4">
              <Plus size={24} strokeWidth={2.5} />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Create course
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Engineering Mechanics"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Course Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course code
              </label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MECH 311"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* University */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                University
              </label>
              <input
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="University of Lagos"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Lecturer */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lecturer <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                placeholder="Dr. A. Smith"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Session
              </label>
              <select
                required
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Level
              </label>
              <select
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <input
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Brief description of the course content"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course thumbnail
              </label>
              
              <div 
                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-[#111] dark:hover:bg-[#1a1a1a] transition overflow-hidden relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Click to upload image</span>
                  </div>
                )}

                {isUploadingThumbnail && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white mb-2" size={32} />
                    <span className="text-white text-sm font-medium">Uploading...</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* Submit */}
            <button
              disabled={isLoading || isUploadingThumbnail}
              className="md:col-span-2 w-full mt-2 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl font-medium
                       hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-[0.98]
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Creating…" : "Proceed"}
            </button>
          </form>

          {/* Cancel */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 transition cursor-pointer"
            onClick={() => {
              router.back()
            }}
          >

            Cancel

          </div>
        </div>
      </div>

      <CoursePriceModalPast
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        onConfirm={handleCreateCourse}
        isSaving={isLoading}
        initialPrice={price}
        initialFree={isFree}
      />
    </div>
  );

}
