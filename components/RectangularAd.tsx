"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useUser } from "@/context/UserContext";
import { recordAdView } from "@/lib/ads";

type AdFileType = "image" | "video";

interface AdItem {
  id: string;
  fileUrl: string;
  fileType: AdFileType;
  duration?: number; // image only (ms)
  link?: string;
}

interface RectangularAdProps {
  ads: AdItem[];
  width?: number;
  height?: number;
  className?: string;
}

export default function RectangularAd({
  ads,
  width = 0,
  height = 250,
  className,
}: RectangularAdProps) {
  const { user } = useUser();
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const observedRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const recordedAds = useRef<Set<string>>(new Set());

  const activeAd = ads[activeIndex];

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % ads.length);
  };

  useEffect(() => {
    if (!activeAd) return;

    if (activeAd.fileType === "image") {
      timeoutRef.current = setTimeout(goNext, activeAd.duration ?? 4000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeIndex, activeAd]);

  // Intersection Observer to track ad views
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const adId = entry.target.getAttribute("data-ad-id");
          if (adId && entry.isIntersecting && !recordedAds.current.has(adId)) {
            // record view
            recordAdView(adId, user?.$id);
            recordedAds.current.add(adId);
          }
        });
      },
      {
        threshold: 0.5, // 50% of the ad must be visible
      }
    );

    // observe each ad container
    observedRefs.current.forEach((el) => observer.observe(el));

    return () => {
      observedRefs.current.forEach((el) => observer.unobserve(el));
    };
  }, [user, ads]);

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50",
        className
      )}
      style={{
        width: width ? `${width}px` : "100%",
        height: `${height}px`,
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
        }}
      >
        {ads.map((ad, index) => (
          <div
            key={`${ad.id}-${index}`}
            ref={(el) => {
              if (el) observedRefs.current.set(`${ad.id}-${index}`, el);
            }}
            data-ad-id={ad.id}
            className="h-full w-full flex-shrink-0"
          >
            {ad.fileType === "image" && (
              <img
                src={ad.fileUrl}
                alt="Sponsored content"
                className="h-full w-full object-cover"
                loading="lazy"
                onClick={() => ad.link && window.open(ad.link, "_blank")}
              />
            )}

            {ad.fileType === "video" && (
              <video
                ref={index === activeIndex ? videoRef : null}
                src={ad.fileUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={goNext}
                onClick={() => ad.link && window.open(ad.link, "_blank")}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {ads.map((_, index) => (
          <span
            key={index}
            className={clsx(
              "h-2 w-2 rounded-full transition-colors",
              index === activeIndex ? "bg-neutral-800" : "bg-blue-600"
            )}
          />
        ))}
      </div>

      <span className="absolute bottom-2 right-2 text-[10px] text-neutral-500 bg-white/70 px-2 py-0.5 rounded">
        Sponsored
      </span>
    </div>
  );
}
