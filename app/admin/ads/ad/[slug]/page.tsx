"use client";

import React, { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import { editAd, fetchAdById, uploadAdImage, uploadAdVideo } from "@/lib/ads";

// replace with real calls
// import { updateAd } from "@/lib/ads";

interface Ad {
  id: string;
  name: string;
  squareImages: string[];
  rectImages: string[];
  videos: string[];
  views: number;
  uniqueUsers: string[];
  isExpired: boolean;
  endTime: string;
  type: string;
  link?: string
}

export default function AdDetailsPage() {
   const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();

  // mock data for now
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const AD_TYPE_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "2-Daily", value: "2-daily" },
  { label: "Weekly", value: "weekly" },
  { label: "2-Weekly", value: "2-weekly" },
  { label: "Monthly", value: "monthly" },
];


  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const data = await fetchAdById(slug);
        setAd(data);
      } catch (e) {
        console.error(e);
        alert("Failed to load ad");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  if (loading) {
    return ( <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>)
  }

  if (!ad) {
    return <p className="text-center py-20">Ad not found</p>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900" style={{textTransform: 'capitalize'}}>
                {ad.name}
              </h1>
              <p className="text-sm text-gray-500 mt-1 mb-10">
                Ad details and performance
              </p>
              <p
  className="
    flex-none items-center
    px-4 py-1.5
    rounded-full
    text-sm font-medium
    bg-amber-50 text-blue-700
    border border-amber-200
    mb-1 mt-3
  "
  style={{textTransform: "capitalize"}}
>
  {ad.type}
</p>

            </div>

            {user?.isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm
                           bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Stat label="Views" value={ad.views} valueClass="text-blue-600"/>
            <Stat
              label="Unique users"
              value={ad.uniqueUsers.length}
              valueClass="text-blue-600"
            />
            <Stat
              label="Status"
              value={ad.isExpired ? "Expired" : "Active"}
              valueClass={
                ad.isExpired ? "text-red-600" : "text-blue-600"
              }
            />
            <Stat
              label="End time"
              value={new Date(ad.endTime).toLocaleString()}
              valueClass="text-blue-600"
            />
          </div>

          {/* Images */}
          <Section title="Square Images">
            {ad.squareImages?.length === 0 ? (
              <Empty text="No Square images attached" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ad.squareImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Ad image ${i + 1}`}
                    className="rounded-xl border object-cover aspect-square"
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Images */}
          <Section title="Rectangular Images">
            {ad.rectImages?.length === 0 ? (
              <Empty text="No Rectangular images attached" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ad.rectImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Ad image ${i + 1}`}
                    className="rounded-xl border object-cover aspect-auto"
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Videos */}
          <Section title="Videos">
            {ad.videos.length === 0 ? (
              <Empty text="No videos attached" />
            ) : (
              <div className="space-y-3">
                {ad.videos.map((url, i) => (
                  <video
                    key={i}
                    controls
                    className="w-80 h-80 rounded-xl border h-max-60"
                    src={url}
                  />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {isEditing && (
        <EditAdModal
          ad={ad}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => setAd(updated)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EditAdModal({
  ad,
  onClose,
  onSave,
}: {
  ad: Ad;
  onClose: () => void;
  onSave: (ad: Ad) => void;
}) {
  const [name, setName] = useState(ad.name);
  const [endTime, setEndTime] = useState(ad.endTime);
  const [isExpired, setIsExpired] = useState(ad.isExpired);
  const [link, setLink] = useState(ad.link)

  const [existingSquareImages, setExistingSquareImages] = useState<string[]>(ad.squareImages);
  const [existingRectImages, setExistingRectImages] = useState<string[]>(ad.rectImages);
  const [existingVideos, setExistingVideos] = useState<string[]>(ad.videos);

  const [newSquareImages, setNewSquareImages] = useState<File[]>([]);
  const [newRectImages, setNewRectImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [type, setType] = useState(ad.type);

  const [saving, setSaving] = useState(false);

  const AD_TYPE_OPTIONS = [
  { label: "Daily", value: "daily", days: 1 },
  { label: "2-Daily", value: "2-daily", days: 2 },
  { label: "Weekly", value: "weekly", days: 7 },
  { label: "2-Weekly", value: "2-weekly", days: 14 },
  { label: "Monthly", value: "monthly", days: 30 },
];

  const calculateEndTime = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now.toISOString();
};

  const handleSave = async () => {
    setSaving(true);

    try {
      const uploadedSquareImages = await Promise.all(
        newSquareImages.map((f) => uploadAdImage(f))
      );

      const uploadedRectImages = await Promise.all(
        newRectImages.map((f) => uploadAdImage(f))
      );

      const uploadedVideos = await Promise.all(
        newVideos.map((f) => uploadAdVideo(f))
      );

      const updatedSquareImages = [...existingSquareImages, ...uploadedSquareImages];
      const updatedRectImages = [...existingRectImages, ...uploadedRectImages];
      const updatedVideos = [...existingVideos, ...uploadedVideos];

      await editAd(ad.id, {
        name,
        endTime,
        isExpired,
        squareImages: updatedSquareImages,
        rectImages: updatedRectImages,
        videos: updatedVideos,
        type,
        link,
      });

      onSave({
        ...ad,
        name,
        endTime,
        isExpired,
        squareImages: updatedSquareImages,
        rectImages: updatedRectImages,
        videos: updatedVideos,
        type,
        link
      });

      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update ad");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className=" inset-0 absolute mt-10 top-0  px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 relative mx-auto max-h-vh] overflow-y-auto mt-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Edit ad
        </h2>

        <div className="space-y-5" >
          <Field label="Ad name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 transition text-blue-600"
                         style={{color: "black", textTransform: 'capitalize'}}
            />
          </Field>

          <Field label="Ad type">
  <select
    value={type}
    onChange={(e) => {
      const selected = AD_TYPE_OPTIONS.find(
        (opt) => opt.value === e.target.value
      );

      setType(e.target.value);

      if (selected) {
        setEndTime(calculateEndTime(selected.days));
      }
    }}
    className="w-full px-4 py-3 rounded-xl border border-gray-300
               focus:ring-2 focus:ring-blue-500 transition text-blue-600"
               style={{color: "black"}}
  >
    {AD_TYPE_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
</Field>

<Field label="Link">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 transition text-blue-600"
                         style={{color: "black"}}
            />
          </Field>

          <Field label="End time">
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300
                         focus:ring-2 focus:ring-blue-500 transition text-blue-600"
                         style={{color: "black"}}
            />
          </Field>

          <Field label="Square Images">
  <div className="flex gap-2 flex-wrap">
    {existingSquareImages.map((url, i) => (
      <div key={i} className="relative w-20 h-20">
        <img
          src={url}
          className="w-full h-full object-cover rounded-lg border"
        />
        <button
          type="button"
          onClick={() =>
            setExistingSquareImages(existingSquareImages.filter((_, x) => x !== i))
          }
          className="w-full mt-1 text-sm text-red-500 hover:underline "
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) =>
      setNewSquareImages((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
    className=" text-sm text-blue-600 mt-10"
  />
</Field>

         <Field label="Rectangular Images">
  <div className="flex gap-2 flex-wrap">
    {existingRectImages.map((url, i) => (
      <div key={i} className="relative w-80 h-20">
        <img
          src={url}
          className="w-full h-full object-cover rounded-lg aspect-auto"
        />
        <button
          type="button"
          onClick={() =>
            setExistingRectImages(existingRectImages.filter((_, x) => x !== i))
          }
          className="w-full mt-1 text-sm text-red-500 hover:underline "
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) =>
      setNewRectImages((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
    className=" text-sm text-blue-600 mt-10"
  />
</Field>


<Field label="Videos">
  <div className="space-y-2">
    {existingVideos.map((url, i) => (
      <div key={i} className="relative">
        <video src={url} controls className="w-80 h-50 rounded-lg border" />
        <button
          type="button"
          onClick={() =>
            setExistingVideos(existingVideos.filter((_, x) => x !== i))
          }
          className="w-full mt-1 text-sm text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  <input
    type="file"
    accept="video/*"
    multiple
    onChange={(e) =>
      setNewVideos((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
    className="mt-2 text-sm text-blue-600"
  />
</Field>




          <label className="flex items-center gap-3 text-sm text-blue-600">
            <input
              type="checkbox"
              checked={isExpired}
              onChange={(e) => setIsExpired(e.target.checked)}
            />
            Mark as expired
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl
                       hover:bg-blue-500 disabled:opacity-60 transition"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-sm text-gray-400 italic">{text}</p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
