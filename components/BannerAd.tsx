"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Volume, VolumeX, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { recordAdView, recordAdClick } from "@/lib/api/ads";

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
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (ad.fileType === "video" && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {
          // Ignore errors
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ad]);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen || user?.isPremium) return null;

  const handleAdLoaded = () => {
    setLoading(false);
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
    recordAdClick(ad.id);
    if (ad.link) window.open(ad.link, "_blank");
    // Do not close on click, they have to wait or press X when it appears.
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[999] flex items-center justify-center bg-black transition-opacity",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Countdown / Close Button */}
        <div className="absolute top-6 right-6 z-20">
          {countdown > 0 ? (
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm border border-white/30">
              {countdown}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition border border-white/30 group"
            >
              <X size={24} className="text-white group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Mute toggle */}
        {ad.fileType === "video" && (
          <button
            onClick={toggleMute}
            className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition border border-white/30"
          >
            {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume size={24} className="text-white" />}
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="h-12 w-12 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Ad media */}
        {ad.fileType === "image" ? (
          <img
            src={ad.fileUrl}
            alt="Advertisement"
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleClick}
            onLoad={handleAdLoaded}
          />
        ) : (
          <video
            ref={videoRef}
            src={ad.fileUrl}
            className="w-full h-full object-contain cursor-pointer"
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
