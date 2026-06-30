"use client";

import React, { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { X, Share2, Download, CheckCircle, Loader2 } from "lucide-react";
import templateBg from "@/assets/images/template.png";

export interface ContributorCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contributorName: string;
  profileImage: string;
}

export default function ContributorCelebrationModal({
  isOpen,
  onClose,
  contributorName,
  profileImage,
}: ContributorCelebrationModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset states when the modal is opened/closed
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isOpen) {
      setIsGenerating(false);
      setImageLoaded(false);
      // If there's no profile image, don't wait for it to load
      console.log(profileImage, "profileImage");
      if (!profileImage) {
        setImageLoaded(true);
      } else {
        // Safari/iOS Failsafe: Cached images often completely skip the onLoad event.
        // We force-unlock the share button after 1 second just in case.
        timeout = setTimeout(() => {
          setImageLoaded(true);
        }, 1000);
      }
      // Lock background scrolling
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
      // 1. The "Dummy" Render: Warms up the browser cache silently (very fast)
      // This solves the iOS/Safari bug where the first render has missing/blank images.
      await toPng(cardRef.current, { pixelRatio: 0.1 });

      // 2. The Real Render: Guaranteed to have fully cached assets
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 3,
      });

      // 2. Convert DataURL to File Object for sharing
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "ed-library-contributorr.png", {
        type: "image/png",
      });

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "ED-Library Contributor",
            text: "I’m now an official ED-Library Contributor!",
          });
        } catch (shareErr: any) {
          // If the browser blocks it because toPng took too long (NotAllowedError),
          // fallback to downloading it directly instead.
          if (shareErr.name === "NotAllowedError") {
            const link = document.createElement("a");
            link.download = "ed-library-contributor.png";
            link.href = dataUrl;
            link.click();
          } else if (shareErr.name !== "AbortError") {
            // Ignore AbortError (user cancelled share), throw others
            throw shareErr;
          }
        }
      } else {
        // 4. Fallback to Download
        const link = document.createElement("a");
        link.download = "ed-library-contributor.png";
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Error generating or sharing image:", err);
      alert("Something went wrong while preparing the image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto">
      {/* 
        This wrapper guarantees reliable scrolling behavior across all browsers (especially iOS Safari).
        The outer fixed container handles scrolling, while this flex container handles positioning. 
      */}
      <div className="flex min-h-full items-start justify-center p-4 sm:p-6 pt-[100px] pb-[100px]">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-300 flex flex-col mb-auto shrink-0">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-900/80 hover:bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="p-6 text-center border-b border-gray-100 dark:border-gray-800" style={{ paddingBottom: 12 }}>
            {/* <div className="flex justify-center mb-4">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle size={20} />
              </div>
            </div> */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white ">
              Congratulations!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: 10 }}>
              Share your achievement with your friends and family.
            </p>
          </div>

          {/* Contributor Card Preview Container */}
          <div className="bg-gray-50 dark:bg-gray-900 flex justify-center items-center" style={{ padding: '1px 10px' }}>
            {/* 
            The node that gets converted to PNG.
            Using strict dimensions and shrink-0 ensures flexbox doesn't compress it.
          */}
            <div className="relative rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shrink-0"
              style={{ height: 400, width: 300 }}
            >
              <div
                ref={cardRef}
                className="absolute inset-0 w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden"

              >
                {/* Background Template */}
                <img
                  src={typeof window !== 'undefined' ? `${window.location.origin}${templateBg.src}` : templateBg.src}
                  alt="Contributor Template Background"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  style={{ height: "100%" }}
                />

                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[45%] rounded-full overflow-hidden border-[6px] border-white shadow-md z-10 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"

                  style={{ height: 130, width: 130, top: "39%" }}>
                  {profileImage ? (
                    <img
                      src={
                        typeof window !== "undefined"
                          ? profileImage.startsWith("http")
                            ? `${window.location.origin}/_next/image?url=${encodeURIComponent(profileImage)}&w=640&q=75`
                            : profileImage.startsWith("/")
                              ? `${window.location.origin}${profileImage}`
                              : profileImage
                          : profileImage
                      }
                      alt={contributorName}
                      className="w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)} // Prevents locking modal if image fetch fails
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-800 text-sm font-medium">
                      No Image
                    </div>
                  )}
                </div>

                {/* Contributor Name Section */}
                <div className="absolute top-[72%] left-0 w-full px-6 text-center z-10 flex flex-col items-center"
                  style={{ top: "84%" }}
                >
                  <h1 className="text-2xl md:text-2xl font-extrabold text-gray-900 dark:text-white truncate w-full" style={{ fontSize: 13 }}>
                    {contributorName}
                  </h1>
                  <div className="mt-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-100"
                    style={{ fontSize: 7 }}>
                    Official Contributor
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
            <p className="text-xs text-gray-400 text-center px-4 mb-2">
              Note: If your image appears blank when sharing, just close the share menu and try clicking the button again.
            </p>
            <button
              onClick={handleShare}
              disabled={!imageLoaded || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : !imageLoaded ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Loading Assets...
                </>
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

            {/* <button
            onClick={onClose}
            className="w-full py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:text-gray-300 transition"
          >
            Maybe later
          </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
