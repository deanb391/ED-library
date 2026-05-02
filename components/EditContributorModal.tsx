"use client";

import { useState, useRef } from "react";
import { Contributor, ContributorDraft } from "@/lib/services/contributors.service";
import { editContributor } from "@/lib/api/contributors";
import { uploadToServer } from "@/lib/upload";
import { Camera, X } from "lucide-react";
import Image from "next/image";

export default function EditContributorModal({
  contributor,
  onClose,
  onSuccess,
}: {
  contributor: Contributor;
  onClose: () => void;
  onSuccess: (updated: Contributor) => void;
}) {
  const [draft, setDraft] = useState<Partial<ContributorDraft>>({
    username: contributor.username,
    institution: contributor.institution,
    country: contributor.country,
    bio: contributor.bio,
    category: contributor.category,
    profileImage: contributor.profileImage,
  });

  const [categoriesInput, setCategoriesInput] = useState(
    contributor.category?.join(", ") || ""
  );

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProfile(true);
      setError("");
      const url = await uploadToServer(file, "contributors", "image");
      setDraft((prev) => ({ ...prev, profileImage: url }));
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setError("Failed to upload profile image. Please try again.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSubmitting(true);

      const parsedCategories = categoriesInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        ...draft,
        category: parsedCategories,
      };

      const updated = await editContributor(contributor.$id, payload);
      onSuccess(updated);
    } catch (err) {
      console.error("Failed to edit contributor:", err);
      setError("An error occurred while saving. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center bg-white shrink-0">
          <h2 className="font-semibold text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => !uploadingProfile && fileRef.current?.click()}
              style={{ width: 100, height: 100 }}
              className="relative w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-200 transition-colors group"
            >
              {uploadingProfile ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
              ) : draft.profileImage ? (
                <>
                  <Image
                    src={draft.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <Camera size={24} className="text-gray-500" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
              disabled={uploadingProfile}
            />
            <span className="text-xs text-gray-500 mt-2">Tap to change</span>
          </div>

          <div className="space-y-4">
            <div style={{ marginBottom: 10, }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                placeholder="Display name"
                value={draft.username || ""}
                onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: 10, }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  placeholder="Institution"
                  value={draft.institution || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, institution: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  placeholder="Country"
                  value={draft.country || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div style={{ marginBottom: 10, }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                placeholder="Tell us about yourself"
                value={draft.bio || ""}
                onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none resize-none min-h-[100px] focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
              <input
                placeholder="e.g. computer science, math, physics"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white shrink-0 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting || uploadingProfile}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
