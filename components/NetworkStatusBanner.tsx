"use client";
import { useEffect, useState } from "react";

type BannerState = "offline" | "online" | null;

export default function NetworkStatusBanner() {
  const [banner, setBanner] = useState<BannerState>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const showBanner = (state: BannerState) => {
      setBanner(state);
      clearTimeout(timer);
      timer = setTimeout(() => setBanner(null), 3000);
    };

    // Show immediately if already offline on mount
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showBanner("offline");
    }

    const handleOffline = () => showBanner("offline");
    const handleOnline = () => showBanner("online");

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!banner) return null;

  const isOffline = banner === "offline";

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center py-2 px-4 text-sm font-semibold transition-all duration-300 ${
        isOffline
          ? "bg-gray-500 text-white"
          : "bg-green-500 text-white"
      }`}
      style={{ animation: "slideDown 0.3s ease" }}
    >
      <span className="inline-block w-2 h-2 rounded-full mr-2 bg-white opacity-80" />
      {isOffline ? "No internet connection" : "Back online"}

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
