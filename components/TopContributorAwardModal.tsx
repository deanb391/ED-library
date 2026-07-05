"use client";

import React, { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { X, Share2, Download, Loader2 } from "lucide-react";

interface TopContributorAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributorName: string;
  profileImage: string;
  weeklyUploads: number;
  totalUploads: number;
}

export default function TopContributorAwardModal({
  isOpen,
  onClose,
  contributorName,
  profileImage,
  weeklyUploads,
  totalUploads,
}: TopContributorAwardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      setIsGenerating(false);
      setImageLoaded(false);
      if (!profileImage) {
        setImageLoaded(true);
      } else {
        timeout = setTimeout(() => setImageLoaded(true), 1000);
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      if (timeout) clearTimeout(timeout);
    };
  }, [isOpen, profileImage]);

  const handleShare = async () => {
    if (!cardRef.current || !imageLoaded) return;
    setIsGenerating(true);

    try {
      await toPng(cardRef.current, { pixelRatio: 0.1 });
      const dataUrl = await toPng(cardRef.current, { quality: 1.0, pixelRatio: 3 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "ed-library-top-contributor.png", { type: "image/png" });

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "ED-Library Top Contributor",
            text: `I'm the Top Contributor of the Week on ED-Library! 🏆`,
          });
        } catch (shareErr: any) {
          if (shareErr.name === "NotAllowedError") {
            const link = document.createElement("a");
            link.download = "ed-library-top-contributor.png";
            link.href = dataUrl;
            link.click();
          } else if (shareErr.name !== "AbortError") {
            throw shareErr;
          }
        }
      } else {
        const link = document.createElement("a");
        link.download = "ed-library-top-contributor.png";
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Error generating or sharing image:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto" style={{ marginTop: "70px" }}>
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 pt-[100px] pb-[100px]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md relative flex flex-col mb-auto shrink-0"
          style={{ animation: "awardSlideIn 0.4s ease-out" }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-900/80 hover:bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800" style={{ paddingBottom: 12 }}>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              🏆 You're the Top Contributor!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: 10 }}>
              Share this achievement with your network.
            </p>
          </div>

          {/* Award Card Preview */}
          <div className="bg-gray-50 dark:bg-gray-900 flex justify-center items-center" style={{ padding: "12px 10px" }}>
            <div
              className="relative rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0"
              style={{ height: 400, width: 300 }}
            >
              <div
                ref={cardRef}
                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #0096f4ff 0%, #0096f4ff 40%, #0096f4ff 100%)",
                }}
              >
                {/* Gold border decoration */}
                <div style={{
                  position: "absolute", inset: 8,
                  border: "2px solid rgba(255, 215, 0, 0.3)",
                  borderRadius: 12,
                  pointerEvents: "none",
                }} />

                {/* Stars decoration */}
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      width: 2 + (i % 3),
                      height: 2 + (i % 3),
                      borderRadius: "50%",
                      backgroundColor: `rgba(255, 215, 0, ${0.15 + (i % 4) * 0.1})`,
                      left: `${5 + (i * 4.5)}%`,
                      top: `${5 + (i * 4.2) % 90}%`,
                    }} />
                  ))}
                </div>

                {/* Trophy */}
                <div style={{ fontSize: 40, marginBottom: 4 }}>🏆</div>

                {/* Title */}
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#FFD700",
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16,
                }}>
                  Top Contributor of the Week
                </div>

                {/* Profile Image */}
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  border: "4px solid #FFD700", overflow: "hidden",
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
                  marginBottom: 16, backgroundColor: "#2a2a4a",
                }}>
                  {profileImage ? (
                    <img
                      src={
                        typeof window !== "undefined" && profileImage.startsWith("http")
                          ? `${window.location.origin}/_next/image?url=${encodeURIComponent(profileImage)}&w=640&q=75`
                          : profileImage
                      }
                      alt={contributorName}
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-yellow-400">
                      {contributorName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 18, fontWeight: 800, color: "#FFFFFF",
                  marginBottom: 4, textAlign: "center", padding: "0 20px",
                }}>
                  {contributorName}
                </div>

                {/* Stats */}
                <div style={{
                  display: "flex", gap: 24, marginTop: 12,
                  padding: "8px 16px", borderRadius: 8,
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD700" }}>{weeklyUploads}</div>
                    <div style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>This Week</div>
                  </div>
                  <div style={{ width: 1, backgroundColor: "rgba(255,215,0,0.2)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#FFD700" }}>{totalUploads}</div>
                    <div style={{ fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Total</div>
                  </div>
                </div>

                {/* ED-Library branding */}
                <div style={{
                  position: "absolute", bottom: 16,
                  fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em",
                }}>
                  ED-LIBRARY
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            <p className="text-xs text-gray-400 text-center px-4 mb-2">
              Note: If your image appears blank when sharing, close the share menu and try again.
            </p>
            <button
              onClick={handleShare}
              disabled={!imageLoaded || isGenerating}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #FFB300, #FF8F00)",
                boxShadow: "0 4px 14px rgba(255, 143, 0, 0.3)",
              }}
            >
              {isGenerating ? (
                <><Loader2 size={20} className="animate-spin" /> Processing...</>
              ) : !imageLoaded ? (
                <><Loader2 size={20} className="animate-spin" /> Loading Assets...</>
              ) : (
                <>
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
                    <Share2 size={20} />
                  ) : (
                    <Download size={20} />
                  )}
                  {typeof navigator !== "undefined" && typeof navigator.share === "function"
                    ? "Share Achievement"
                    : "Download Image"}
                </>
              )}
            </button>
          </div>

          <style jsx>{`
            @keyframes awardSlideIn {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
