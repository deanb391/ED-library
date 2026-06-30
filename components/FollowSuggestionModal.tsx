"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";

type Props = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
  contributorName: string;
  onFollow: () => Promise<void>;
  loading?: boolean;
};

export default function FollowSuggestionModal({
  open,
  onClose,
  contributorName,
  onFollow,
  loading = false,
}: Props) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const handleFollowClick = async () => {
    await onFollow();
    onClose(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 relative flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:text-gray-400 transition"
        >
          <X size={18} />
        </button>

        {/* Brand Icon Badge */}
        <div className="bg-blue-50 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center shadow-inner">
          <Bell size={32} className="animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Never Miss an Update!
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Follow <span className="font-semibold text-gray-900 dark:text-white">{contributorName}</span> to receive instant email notifications when they add more notes or launch new courses.
          </p>
        </div>

        {/* Checkbox Preference */}
        <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
          />
          Don't show this suggestion again for this course
        </label>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-2">
          <button
            onClick={handleFollowClick}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-[0.98] shadow-md hover:shadow-lg disabled:bg-gray-200 dark:bg-gray-800 disabled:text-gray-500 dark:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid currentColor",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Following...
              </>
            ) : (
              `Follow ${contributorName}`
            )}
          </button>
          
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition active:scale-[0.98]"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
