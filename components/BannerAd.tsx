"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Volume, VolumeX, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { recordAdView } from "@/lib/ads";

export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};

interface BannerAdProps {
  ad: AdItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function BannerAd({ ad, isOpen, onClose }: BannerAdProps) {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useUser();
  const [viewRecorded, setViewRecorded] = useState(false);

  useEffect(() => {
    if (ad.fileType === "video" && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {
          // Ignore errors (like user interaction required)
        });
      }, 1000); // play 1s after loaded

      return () => clearTimeout(timer);
    }
  }, [ad]);

  if (!isOpen) return null;

    const handleAdLoaded = () => {
    setLoading(false);

    // record view once
    if (!viewRecorded) {
      recordAdView(ad.id, user?.$id);
      setViewRecorded(true);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleClick = () => {
    if (ad.link) window.open(ad.link, "_blank");
    onClose();
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative w-full max-w-3xl mx-4 rounded-xl overflow-hidden shadow-lg" style={{marginRight: 5, marginLeft: 5}}>
       
<div className="absolute inset-0 z-10  pointer-events-none" />


        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-20 p-2 rounded-full hover:bg-white transition"
        >
          <X size={22} color="red" />
        </button>

          {/* Mute toggle */}
        {ad.fileType === "video" && (
          <button
            onClick={toggleMute}
            className="absolute top-3 right-3 z-20 p-5 rounded-full  hover:bg-white transition"
          >
            {isMuted ? <VolumeX size={22} color="blue"/> : <Volume size={22} color="blue"/>}
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{height: 130, alignItems: 'center', flex: 1, }}> 
            <div className="h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Ad media */}
        {ad.fileType === "image" ? (
          <img
            src={ad.fileUrl}
            alt="Banner Ad"
            className=" max-h-[400px] cursor-pointer object-contain relative z-0"
            style={{maxHeight: 1000, width: 500,}}
            onClick={handleClick}
            onLoad={handleAdLoaded}
          />
        ) : (
          <video
            ref={videoRef}
            src={ad.fileUrl}
            className="w-full max-h-[400px] cursor-pointer object-contain relative z-0"
            style={{maxHeight: 1000}}
            autoPlay
            muted
            loop
            playsInline
            onClick={handleClick}
            onLoadedData={handleAdLoaded}
          />
        )}
      </div>
    </div>
  );
}
