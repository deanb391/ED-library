"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
}

export default function SimpleImageViewer({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setLoading(true);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const next = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <span className="text-sm text-white/70">
          {currentIndex + 1} / {images.length}
        </span>

        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center relative">

        {/* LEFT */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="absolute left-4 z-40 p-3 bg-black/40 rounded-full text-white disabled:opacity-20"
        >
          <ChevronLeft size={28} />
        </button>

        {/* RIGHT */}
        <button
          onClick={next}
          disabled={currentIndex === images.length - 1}
          className="absolute right-4 z-40 p-3 bg-black/40 rounded-full text-white disabled:opacity-20"
        >
          <ChevronRight size={28} />
        </button>

        {/* IMAGE */}
        <div className="relative w-full h-full flex items-center justify-center">
          {loading && (
            <div className="absolute flex items-center justify-center">
              <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          <Image
            src={images[currentIndex]}
            alt="preview"
            width={800}
            height={1000}
            className={`object-contain max-h-full max-w-full transition-opacity duration-200 ${
              loading ? "opacity-0" : "opacity-100"
            }`}
            onLoadingComplete={() => setLoading(false)}
            priority
          />
        </div>
      </div>
    </div>
  );
}