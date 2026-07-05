"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareProfileButton({ contributorId }: { contributorId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/contributor/account/${contributorId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out my profile on ED-Library",
          text: "Here is my contributor profile with all my courses and notes!",
          url: url,
        });
        return;
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:bg-gray-800 transition-colors shrink-0"
    >
      <Share2 size={16} />
      {copied ? "Copied Link!" : "Share Profile"}
    </button>
  );
}
