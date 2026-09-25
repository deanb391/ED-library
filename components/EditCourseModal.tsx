"use client";

import { useEffect, useState } from "react";
import { uploadThumbnail } from "@/lib/api/courses";
import { editCourse } from "@/lib/api/courses";
import { bool } from "aws-sdk/clients/signer";
import { Currency, ImageIcon, Loader2 } from "lucide-react";
import { useRef } from "react";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    university?: string;
    lecturer?: string;
    thumbnailId?: string;
    thumbnailUrl?: string;
    isOngoing?: boolean;
    price?: string;
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
  const [university, setUniversity] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const [price, setPrice] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isOpen) return;

    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description);
    setUniversity(course.university || "");
    setLecturer(course.lecturer || "");
    setThumbnailUrl(course.thumbnailUrl || "");

    try {
      const parsed = JSON.parse((course as any).price || "{}");
      if (parsed?.amount !== undefined) {
        setPrice(String(parsed.amount));
      } else {
        setPrice(course.price || "");
      }
    } catch {
      setPrice(course.price || "");
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title,
        code,
        description,
        university,
        lecturer: lecturer || undefined,
        price: price,
        thumbnailUrl: thumbnailUrl,
      };

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


  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const result = await uploadThumbnail(file);
      setThumbnailUrl(result.url);
      setThumbnail(file);
    } catch (error) {
      console.error("Failed to upload thumbnail", error);
      alert("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: "16px",
      }}
    >
      <div className="w-full max-w-[520px] h-[80vh] bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit course
          </h2>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            minHeight: 0,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition mt-1.5"
              />
            </div>

            {/* Code */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition mt-1.5"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition mt-1.5 resize-none"
              />
            </div>

            {/* University */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                University
              </label>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition mt-1.5"
              />
            </div>

            {/* Lecturer */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lecturer
              </label>
              <input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition mt-1.5"
              />
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Course thumbnail
              </label>
              
              <div 
                className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 transition overflow-hidden relative"
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
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (Optional)
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 5000"
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:bg-white dark:focus:bg-[#111] focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition"
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: 500,
                  fontSize: "14px",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>
  );
}
