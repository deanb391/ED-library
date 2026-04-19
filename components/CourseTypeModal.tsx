"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface CourseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: "ongoing" | "past") => void;
  isSaving?: boolean;
}

export default function CourseTypeModal({
  isOpen,
  onClose,
  onConfirm,
  isSaving = false,
}: CourseTypeModalProps) {
  const [selected, setSelected] = useState<"ongoing" | "past" | null>(null);
  const [showInfo, setShowInfo] = useState<"ongoing" | "past" | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onConfirm(selected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course type
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Tell us about the state of this course.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Ongoing */}
            <div className="border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-3" style={{marginBottom: 20}}>
              <label className="flex items-start gap-3 cursor-pointer w-full">
                <input
                  type="radio"
                  name="courseType"
                  checked={selected === "ongoing"}
                  onChange={() => setSelected("ongoing")}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    On Going
                  </p>
                  <p className="text-xs text-gray-500">
                    Course is currently being taught
                  </p>
                </div>
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowInfo((prev) =>
                    prev === "ongoing" ? null : "ongoing"
                  )
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <Info size={18} />
              </button>
            </div>

            {showInfo === "ongoing" && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800" style={{marginBottom: 20}}>
                This means the course is still ongoing. Notes are uploaded per
                lecture as the course progresses. Access is typically through
                subscription since the content is not yet complete.
              </div>
            )}

            {/* Past */}
            <div className="border border-gray-200 rounded-2xl p-4 flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer w-full">
                <input
                  type="radio"
                  name="courseType"
                  checked={selected === "past"}
                  onChange={() => setSelected("past")}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Past Course
                  </p>
                  <p className="text-xs text-gray-500">
                    Course has been completed
                  </p>
                </div>
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowInfo((prev) =>
                    prev === "past" ? null : "past"
                  )
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <Info size={18} />
              </button>
            </div>

            {showInfo === "past" && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800" style={{marginTop: 20}}>
                This means the course has ended and all notes are complete. The
                number of pages is fixed, and users will typically pay a one-time
                fee based on price per page.
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!selected || isSaving}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}