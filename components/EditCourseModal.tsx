"use client";

import { useEffect, useState } from "react";
import { uploadThumbnail } from "@/lib/courses";
import { editCourse } from "@/lib/courses";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    lecturer?: string;
    thumbnailId?: string;
    thumbnailUrl?: string;
  };
  onUpdated?: (updated: Partial<any>) => void;
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onUpdated,
}: EditCourseModalProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description);
    setLecturer(course.lecturer || "");
    setThumbnail(null);
  }, [isOpen, course]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title,
        code,
        description,
        lecturer: lecturer || undefined,
      };

      if (thumbnail) {
        const uploaded = await uploadThumbnail(thumbnail);
        payload.thumbnailId = uploaded.fileId;
        payload.thumbnailUrl = uploaded.url;
      }

      await editCourse(course.id, payload);

      onUpdated?.(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-200 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-3xl" />

        <div className="p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center">
            Edit course
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1 mb-6">
            Update course details
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course code
              </label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 resize-none
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change thumbnail <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files ? e.target.files[0] : null)
                }
                className="block w-full text-sm text-gray-600
                           file:mr-4 file:py-2.5 file:px-4
                           file:rounded-xl file:border-0
                           file:bg-blue-50 file:text-blue-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                disabled={isLoading}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm
                           disabled:opacity-60"
              >
                {isLoading ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
