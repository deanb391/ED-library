"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { rating: number; comment: string }) => void;
  isSaving?: boolean;
  initialRating?: number;
  initialComment?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  isSaving = false,
  initialRating = 0,
  initialComment = "",
}: ReviewModalProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) return; // you can harden this later if needed

    onSubmit({
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Leave a review
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Rate this course and share your experience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Stars */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating
              </label>

              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starValue = index + 1;
                  const filled = starValue <= rating;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRating(starValue)}
                      className="p-1"
                    >
                      <Star
                        size={28}
                        className={
                          filled
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }
                        style={{ color: filled ? "gold" : "#d1d5dc"}}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {rating > 0 ? `${rating}/5 selected` : "No rating selected"}
              </p>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comment
              </label>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think about this course?"
                className="w-full min-h-[110px] resize-none rounded-xl border border-gray-300 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || rating === 0}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {isSaving ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}