"use client";
import { useRouter } from "next/navigation";
import { WifiOff, Download } from "lucide-react";

/**
 * Shown to PREMIUM users when they lose connection mid-session.
 * Non-premium users get the hard redirect to library instead.
 */
export default function OfflineModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const goToDownloads = () => {
    onClose();
    router.push("/library");
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-center px-4 pb-8 sm:pb-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4 text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <WifiOff size={28} className="text-gray-500 dark:text-gray-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">You're offline</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your internet connection is unavailable. You can still access your downloaded courses.
          </p>
        </div>

        <button
          onClick={goToDownloads}
          className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
        >
          <Download size={16} />
          Go to Downloads
        </button>

        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
