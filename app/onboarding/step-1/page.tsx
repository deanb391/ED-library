"use client";

import {  useEffect, useMemo, useRef } from "react";
import {  Search, X, Plus, Check, Camera } from "lucide-react";

import React, { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Settings,
  TerminalSquare,
  Sigma,
  FileUp,
  Send,
} from "lucide-react";
import TermsModal from "@/components/TermsModal";
import { useRouter } from "next/navigation";
import { uploadToServer } from "@/lib/upload";

type ContributorDraft = {
  username: string;
  institution: string;
  country: string;
  bio: string;
  category: string[];
  reviewImages: string[];
  profileImage: string;
  status: string;
};

/* ------------------ STEP CONTENT ONLY ------------------ */



function Step1({
  next,
  draft,
  updateDraft,
  uploadingProfile,
  onProfileImageChange,
}: {
  next: () => void;
  draft: ContributorDraft;
  updateDraft: (updates: Partial<ContributorDraft>) => void;
  uploadingProfile: boolean;
  onProfileImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePickImage = () => {
    fileRef.current?.click();
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-5">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm border border-gray-100">
        <div style={{ fontSize: 20, marginBottom: 15, color: "black" }}>
          Profile Information
        </div>

        {/* Profile Image Picker */}
        <div className="flex justify-center">
          <div
            onClick={handlePickImage}
            className=" rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-200 transition-all active:scale-[0.90]"
            style={{
              width: 150,
              height: 150
            }}
          >
            {uploadingProfile ? (
              <>
              <div
  style={{
    width: "32px",
    height: "32px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  }}
/>

<style jsx>{`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`}</style></>
            ) : draft.profileImage ? (
              <img
                src={draft.profileImage}
                alt="profile"
                className=" object-cover"
                style={{width: "100%", height: "100%"}}
              />
            ) : (
              <Camera size={22} className="text-gray-500" />
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onProfileImageChange}
            disabled={uploadingProfile}
          />
        </div>

        <div className="space-y-1">
          <input
            placeholder="Display name"
            value={draft.username}
            onChange={(e) => updateDraft({ username: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            style={{ color: "black" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            placeholder="Institution (optional)"
            value={draft.institution}
            onChange={(e) => updateDraft({ institution: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            style={{ color: "black" }}
          />
          <select
            value={draft.country}
            onChange={(e) => updateDraft({ country: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            style={{ color: "grey" }}
          >
            <option value="">Country</option>
            <option value="Nigeria">Nigeria</option>
          </select>
        </div>

        <textarea
          placeholder="Bio"
          value={draft.bio}
          onChange={(e) => updateDraft({ bio: e.target.value })}
          className="w-full min-h-[120px] px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none resize-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
          style={{ color: "black" }}
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={next}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}


// function TermsModal({
//   open,
//   onClose,
//   onSubmit,
//   loading,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: () => void;
//   loading: boolean;
// }) {
//   const [agreed, setAgreed] = useState(false);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
//       <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden">
//         <div className="px-5 py-4 border-b font-semibold">
//           Terms & Conditions
//         </div>

//         <div className="p-5 text-sm text-gray-600 space-y-3 max-h-[55vh] overflow-y-auto">
//           <p>You agree to upload only original or permitted content.</p>
//           <p>You accept responsibility for what you publish.</p>
//           <p>We may moderate or remove content without notice.</p>
//         </div>

//         <div className="border-t px-5 py-4 space-y-4">
//           <label className="flex items-center gap-2 text-sm">
//             <input
//               type="checkbox"
//               checked={agreed}
//               onChange={() => setAgreed((p) => !p)}
//             />
//             I agree
//           </label>

//           <button
//             disabled={!agreed || loading}
//             onClick={onSubmit}
//             className={`w-full py-3 rounded-xl text-sm font-medium transition ${
//               agreed && !loading
//                 ? "bg-blue-600 text-white"
//                 : "bg-gray-200 text-gray-500"
//             }`}
//           >
//             {loading ? "Submitting..." : "Submit"}
//           </button>
//         </div>

//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-500"
//         >
//           <X size={18} />
//         </button>
//       </div>
//     </div>
//   );
// }


const SUBJECTS = [
  { id: "mech", title: "Mechanical" },
  { id: "cs", title: "Computer Science" },
  { id: "math", title: "Math" },
];

function Step2({
  next,
  back,
  draft,
  updateDraft,
}: {
  next: () => void;
  back: () => void;
  draft: ContributorDraft;
  updateDraft: (updates: Partial<ContributorDraft>) => void;
}) {
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const selected = draft.category;

  const allOptions = useMemo(
    () => [
      ...SUBJECTS.map((s) => ({ id: s.id, title: s.title })),
      ...custom.map((c) => ({ id: c.toLowerCase(), title: c })),
    ],
    [custom]
  );

  const filtered = useMemo(() => {
    if (!query) return allOptions;
    return allOptions.filter((o) =>
      o.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allOptions]);

  const toggleSelect = (id: string) => {
    updateDraft({
      category: selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    });
  };

  const addCustom = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (
      !allOptions.find(
        (o) => o.title.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setCustom((p) => [...p, trimmed]);
      updateDraft({
        category: [...selected, trimmed.toLowerCase()],
      });
    }

    setQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-3xl space-y-4">
        <div style={{ fontSize: 20, marginBottom: 15, color: "black" }}>
          Select Category
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsOpen((p) => !p)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer flex flex-wrap gap-2 min-h-[48px] items-center"
          >
            {selected.length === 0 && (
              <span className="text-sm text-gray-400">
                Select categories
              </span>
            )}

            {selected.map((id) => {
              const item = allOptions.find((o) => o.id === id);
              if (!item) return null;

              return (
                <span
                  key={id}
                  className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-lg"
                  style={{ paddingRight: 10, paddingLeft: 10 }}
                >
                  {item.title}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(id);
                    }}
                  />
                </span>
              );
            })}
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                <Search size={16} className="text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search or add category"
                  className="w-full text-sm outline-none"
                />
                {query && (
                  <button
                    onClick={addCustom}
                    className="text-blue-600 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filtered.map((o) => {
                  const active = selected.includes(o.id);
                  return (
                    <div
                      key={o.id}
                      onClick={() => toggleSelect(o.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {active && <Check size={14} />}
                      <span>{o.title}</span>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex justify-between pt-6"
          style={{ marginTop: 30 }}
        >
          <button onClick={back} className="flex items-center gap-2" style={{ color: "black"}}>
            <ArrowLeft size={16} /> Back
          </button>

          <button
            onClick={next}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 500,
              padding: "10px 20px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}




function Step3({
  back,
  onSubmit,
  draft,
  updateDraft,
  uploadingImages,
  onReviewImageChange,
}: {
  back: () => void;
  onSubmit: () => void;
  draft: ContributorDraft;
  updateDraft: (updates: Partial<ContributorDraft>) => void;
  uploadingImages: boolean[];
  onReviewImageChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}) {
  const fileRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handlePick = (index: number) => {
    fileRefs[index].current?.click();
  };

  const removeImage = (index: number) => {
    const updated = [...draft.reviewImages];
    updated[index] = "";
    updateDraft({ reviewImages: updated });
  };

  const allImagesSelected = draft.reviewImages.every(img => img && img.trim() !== "");

  return (
    <div className="w-full flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-5xl space-y-6">

        {/* Info Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          Upload 3 images. Each image should be a page from a different course. Keep it clean and readable.
        </div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="relative bg-white border border-gray-200 rounded-xl p-4 h-48 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition overflow-hidden"
              onClick={() => handlePick(index)}
            >
              {uploadingImages[index] ? (
                <>
                <div
  style={{
    width: "32px",
    height: "32px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  }}
/>

<style jsx>{`
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`}</style></>
              ) : draft.reviewImages[index] ? (
                <>
                  <img
                    src={draft.reviewImages[index]}
                    alt={`upload-${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white p-4 rounded-full hover:bg-black"
                  >
                    <X size={25} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <FileUp size={22} />
                  <span className="text-sm">Upload Page {index + 1}</span>
                </div>
              )}

              <input
                ref={fileRefs[index]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onReviewImageChange(index, e)}
                disabled={uploadingImages[index]}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <button onClick={back} className="flex items-center gap-2" style={{color: 'black'}}>
          <ArrowLeft size={16} /> Back
        </button>

        <button 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={onSubmit}
          disabled={!allImagesSelected}
        >
          Submit <Send size={16} />
        </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ MAIN FLOW ------------------ */

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([false, false, false]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [draft, setDraft] = useState<ContributorDraft>({
    username: "",
    institution: "",
    country: "",
    bio: "",
    category: [],
    reviewImages: ["", "", ""],
    profileImage: "",
    status: "pending",
  });

  const updateDraft = (updates: Partial<ContributorDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProfile(true);
      const url = await uploadToServer(file, "contributors", "image");
      updateDraft({ profileImage: url });
    } catch (err) {
      console.error("Profile image upload failed:", err);
      setError("Failed to upload profile image");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleReviewImageChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImages((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });

      const url = await uploadToServer(file, "contributors", "image");
      setDraft((prev) => {
        const updated = { ...prev };
        updated.reviewImages[index] = url;
        return updated;
      });
    } catch (err) {
      console.error("Review image upload failed:", err);
      setError("Failed to upload review image");
    } finally {
      setUploadingImages((prev) => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    }
  };

  const handleSubmitContributor = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Import the createContributor function
      const { createContributor } = await import("@/lib/api/contributors");
      const { account } = await import("@/lib/appwrite");

      // Get the current user ID from Appwrite account
      const user = await account.get();
      const userId = user.$id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await createContributor(draft, userId);

      // On success, navigate to review page
      router.push("/onboarding/review");
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Submitting Your Application, please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center px-4 py-10 overflow-hidden">
      
      {/* STEP HEADER */}
      <div className="w-full max-w-3xl mb-8"
      style={{paddingLeft: 20, paddingRight: 20}}>
        <div className="text-xs font-bold text-gray-500 uppercase mb-2 ml-2">
          Step {step + 1} of 3
        </div>

        {/* Progress Bar */}
        <div
    style={{
      width: "100%",
      height: 6,
      background: "#e5e7eb", // gray-200
      borderRadius: 999,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${((step + 1) / 3) * 100}%`,
        background: "#2563eb",
        borderRadius: 999,
        transition: "width 0.5s ease",
      }}
    />
  </div>
      </div>

      {/* SLIDER */}
      <div className="w-full max-w-5xl overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: "300%",
            transform: `translateX(-${step * 33.333333333}%)`,
          }}
        >
          <div className="w-1/3 shrink-0 flex justify-center">
            <Step1
              next={() => setStep(1)}
              draft={draft}
              updateDraft={updateDraft}
              uploadingProfile={uploadingProfile}
              onProfileImageChange={handleProfileImageChange}
            />
          </div>

          <div className="w-1/3 shrink-0 flex justify-center">
            <Step2
              next={() => setStep(2)}
              back={() => setStep(0)}
              draft={draft}
              updateDraft={updateDraft}
            />
          </div>

          <div className="w-1/3 shrink-0 flex justify-center">
            <Step3
              back={() => setStep(1)}
              onSubmit={() => setIsOpen(true)}
              draft={draft}
              updateDraft={updateDraft}
              uploadingImages={uploadingImages}
              onReviewImageChange={handleReviewImageChange}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 max-w-2xl w-full bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <TermsModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onSubmit={handleSubmitContributor}
        loading={submitting}
      />
    </div>
  );
}