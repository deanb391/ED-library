"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { uploadThumbnail, createCourse } from "@/lib/courses";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite";
import { useUser } from "@/context/UserContext";


export default function CreateCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true);
  const {user} = useUser()

  useEffect(() => {
        const getUser = async () => {
          if (user?.isAdmin) setIsAdmin(true);
          setLoading(false);
        }
      getUser();
      }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!thumbnail) return;

  setIsLoading(true);

  try {
    const uploaded = await uploadThumbnail(thumbnail);

    await createCourse({
      title,
      code,
      description,
      lecturer: lecturer || undefined,
      thumbnailId: uploaded.fileId,
      thumbnailUrl: uploaded.url,
    });

    alert("Course created successfully");
    router.push("/")
  } catch (err) {
    console.error(err);
    alert("Failed to create course");
  } finally {
    setIsLoading(false);
  }
};

    if (loading) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
);}

  if (!isAdmin) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-white">
    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
    <p className="text-gray-500 mb-4">You must be logged in to view this page.</p>
    <Link href="/">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Home
      </button>
    </Link>
  </div>
);
  }


  return (
  <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-200 relative">
      
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-3xl" />

      <div className="p-8 sm:p-10">
        {/* Icon */}
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
          <Plus size={26} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-center text-gray-900">
          Create new course
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-8">
          Add a course to your library
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Engineering Mechanics"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Course Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course code
            </label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MECH 311"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Brief description of the course content"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Lecturer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecturer <span className="text-gray-400">(optional)</span>
            </label>
            <input
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              placeholder="Dr. A. Smith"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-medium
                       hover:bg-blue-500 active:bg-blue-700
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Creating…" : "Create course"}
          </button>
        </form>

        {/* Cancel */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  </div>
);

}
