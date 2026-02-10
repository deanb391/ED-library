"use client";

import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { createAd, uploadAdImage, uploadAdVideo } from "@/lib/ads";

// TODO: replace with real implementations
// import { uploadAdMedia, createAd } from "@/lib/ads";

export default function CreateAdPage() {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [squareImages, setSquareImages] = useState<File[]>([]);
  const [smallImage, setSmallImage] = useState<File[]>([]);
  const [mediumImage, setMediumImage] = useState<File[]>([]);
  const [LargeImage, setLargeImage] = useState<File[]>([]);
  const [rectImages, setRectImages] =useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [link, setLink] = useState('')

  const DURATION_OPTIONS = [
  { label: "Daily", value: "daily", days: 1 },
  { label: "2-Daily", value: "2-daily", days: 2 },
  { label: "Weekly", value: "weekly", days: 7 },
  { label: "2-Weekly", value: "2-weekly", days: 14 },
  { label: "Monthly", value: "monthly", days: 30 },
];


  useEffect(() => {
    if (user?.isAdmin) setIsAdmin(true);
    setLoading(false);
  }, [user]);

  const handleSmallImageAdd = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    const next = [...smallImage, ...incoming].slice(0, 3);
    setSmallImage(next);
  };

  const handleMediumImageAdd = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    const next = [...mediumImage, ...incoming].slice(0, 3);
    setMediumImage(next);
  };

  const handleLargeImageAdd = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    const next = [...LargeImage, ...incoming].slice(0, 3);
    setLargeImage(next);
  };

  const handleVideoAdd = (files: FileList | null) => {
    if (!files) return;

    const incoming = Array.from(files);
    const next = [...videos, ...incoming].slice(0, 2);
    setVideos(next);
  };

  const removeSmallImage = (index: number) => {
    setSmallImage(squareImages.filter((_, i) => i !== index));
  };

  const removeMediumImage = (index: number) => {
    setMediumImage(rectImages.filter((_, i) => i !== index));
  };

  const removeLargeImage = (index: number) => {
    setLargeImage(rectImages.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const calculateEndTime = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
};


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name || !endTime) return;

  setIsSubmitting(true);

  try {
    // Upload images
    const uploadedSmallImages: string[] = [];
    for (const image of smallImage) {
      const url = await uploadAdImage(image);
      uploadedSmallImages.push(url);
    }

    const uploadedMediumImages: string[] = [];
    for (const image of mediumImage) {
      const url = await uploadAdImage(image);
      uploadedMediumImages.push(url);
    }

    const uploadedLargeImages: string[] = [];
    for (const image of LargeImage) {
      const url = await uploadAdImage(image);
      uploadedLargeImages.push(url);
    }

    // Upload videos
    const uploadedVideos: string[] = [];
    for (const video of videos) {
      const url = await uploadAdVideo(video);
      uploadedVideos.push(url);
    }

    const ad = await createAd({
      name,
      smallImages: uploadedSmallImages,
      mediumImages: uploadedMediumImages,
      largeImages: uploadedLargeImages,
      videos: uploadedVideos,
      endTime,
      user: user?.$id,
      type: duration,
      link: link
    });

    alert("Ad created successfully");
    router.push(`/admin/ads/ad/${ad?.$id}`);
  } catch (err) {
    console.error("Failed to create ad", err);
    alert("Failed to create ad");
  } finally {
    setIsSubmitting(false);
  }
};


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-blue-600 mb-4" />
        <p className="text-sm text-gray-600">Loading, please wait…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-4">
          You do not have permission to create ads.
        </p>
        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-gray-200 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-3xl" />

        <div className="p-8 sm:p-10">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <Plus size={26} strokeWidth={2.5} />
          </div>

          <h1 className="text-xl font-semibold text-center text-gray-900">
            Create new ad
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1 mb-8">
            Add a new advertisement to the platform
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Homepage Banner – February"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none
                           focus:ring-2 focus:ring-blue-500 transition text-blue-600"
                           style={{color: 'black'}}
              />
            </div>

            <div className="space-y-1.5">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Ad duration
  </label>

  <select
    required
    value={duration}
    onChange={(e) => {
      const selected = DURATION_OPTIONS.find(
        (opt) => opt.value === e.target.value
      );

      setDuration(e.target.value);

      if (selected) {
        setEndTime(calculateEndTime(selected.days));
      }
    }}
    className="w-full px-4 py-3 rounded-xl border border-gray-300
               bg-white text-sm focus:outline-none
               focus:ring-2 focus:ring-blue-500 transition text-blue-600"
               style={{color: 'black'}}
  >
    <option value="" disabled>
      Select duration
    </option>

    {DURATION_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>

  {endTime && (
    <p className="text-xs text-gray-500 mt-1">
      Ends on {new Date(endTime).toLocaleString()}
    </p>
  )}
</div>

<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Link
              </label>
              <input
                required
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://www.examplelink.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none
                           focus:ring-2 focus:ring-blue-500 transition text-blue-600"
                style={{fontStyle: 'italic', color: "black"}}
              />
            </div>


            {/* Images */}
           <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    2.5 x 1 Images (max 3)
  </label>

  {/* Styled file picker */}
  <label
    className={`inline-flex items-center gap-2 px-2 py-1 rounded-xl
      border border-gray-300 text-sm font-medium cursor-pointer
      hover:bg-gray-50 transition bg-blue-600
      ${smallImage.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    Choose images
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => handleSmallImageAdd(e.target.files)}
      disabled={smallImage.length >= 3}
      className="hidden"
    />
  </label>

  {/* Image previews */}
  {smallImage.length > 0 && (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {smallImage.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="relative flex-shrink-0
                       w-0.5 h-0.5 rounded-lg
                       border border-gray-200 overflow-hidden bg-gray-50"
          >
            <img
              src={previewUrl}
              alt={`Selected image ${index + 1}`}
              className="w-full h-full object-cover"
              style={{height: 100, width: 250}}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeSmallImage(index)}
              className="absolute -top-2 -right-2 bottom-10
                         w-6 h-6 rounded-full
                         bg-red-600 text-white
                         flex items-center justify-center
                         shadow-md hover:bg-red-500 transition"
              title="Remove image"
            >
              <X size={30} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>

           <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    1.5 x 1 Images (max 3)
  </label>

  {/* Styled file picker */}
  <label
    className={`inline-flex items-center gap-2 px-2 py-1 rounded-xl
      border border-gray-300 text-sm font-medium cursor-pointer
      hover:bg-gray-50 transition bg-blue-600
      ${mediumImage.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    Choose images
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => handleMediumImageAdd(e.target.files)}
      disabled={mediumImage.length >= 3}
      className="hidden"
    />
  </label>

  {/* Image previews */}
  {mediumImage.length > 0 && (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {mediumImage.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="relative flex-shrink-0
                       w-0.5 h-0.5 rounded-lg
                       border border-gray-200 overflow-hidden bg-gray-50"
          >
            <img
              src={previewUrl}
              alt={`Selected image ${index + 1}`}
              className="w-full h-full object-cover"
              style={{height: 150, width: 225}}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeMediumImage(index)}
              className="absolute -top-2 -right-2 bottom-10
                         w-6 h-6 rounded-full
                         bg-red-600 text-white
                         flex items-center justify-center
                         shadow-md hover:bg-red-500 transition"
              title="Remove image"
            >
              <X size={30} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>

           <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Banner Images (max 3)
  </label>

  {/* Styled file picker */}
  <label
    className={`inline-flex items-center gap-2 px-2 py-1 rounded-xl
      border border-gray-300 text-sm font-medium cursor-pointer
      hover:bg-gray-50 transition bg-blue-600
      ${LargeImage.length >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    Choose images
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={(e) => handleLargeImageAdd(e.target.files)}
      disabled={LargeImage.length >= 3}
      className="hidden"
    />
  </label>

  {/* Image previews */}
  {LargeImage.length > 0 && (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {LargeImage.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="relative flex-shrink-0
                       w-0.5 h-0.5 rounded-lg
                       border border-gray-200 overflow-hidden bg-gray-50"
          >
            <img
              src={previewUrl}
              alt={`Selected image ${index + 1}`}
              className="w-80 h-60 object-cover"
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeLargeImage(index)}
              className="absolute -top-2 -right-2 bottom-10
                         w-6 h-6 rounded-full
                         bg-red-600 text-white
                         flex items-center justify-center
                         shadow-md hover:bg-red-500 transition"
              title="Remove image"
            >
              <X size={30} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>



            {/* Videos */}
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Videos (max 2)
  </label>

  {/* Styled video picker */}
  <label
    className={`inline-flex items-center gap-2 px-2 py-1 rounded-xl
      border border-gray-300 text-sm font-medium cursor-pointer
      bg-blue-600 hover:bg-gray-50 transition
      ${videos.length >= 2 ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    Choose videos
    <input
      type="file"
      accept="video/*"
      multiple
      onChange={(e) => handleVideoAdd(e.target.files)}
      disabled={videos.length >= 2}
      className="hidden"
    />
  </label>

  {/* Video previews */}
  {videos.length > 0 && (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
      {videos.map((file, index) => {
        const previewUrl = URL.createObjectURL(file);

        return (
          <div
            key={index}
            className="relative flex-shrink-0
                       w-60 h-80 rounded-lg
                       border border-gray-200 overflow-hidden bg-black"
          >
            <video
              src={previewUrl}
              muted
              className="w-60 h-80 object-cover"
            />

            {/* Play hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-black/50
                              flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeVideo(index)}
              className="absolute -top-2 -right-2
                         w-6 h-6 rounded-full
                         bg-red-600 text-white
                         flex items-center justify-center
                         shadow-md hover:bg-red-500 transition"
              title="Remove video"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>


            {/* Submit */}
            <button
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium
                         hover:bg-blue-500 disabled:opacity-60 transition"
            >
              {isSubmitting ? "Creating…" : "Create ad"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
