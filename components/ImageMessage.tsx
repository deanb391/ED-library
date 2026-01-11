"use client";
import React, { useState } from "react";
import Image from "next/image";

interface ImageMessagesProps {
  images: string[];
  message?: string;
  onPress: (index: number) => void;
}

export default function ImageMessages({
  images,
  message,
  onPress,
}: ImageMessagesProps) {
  const previewImages = images.slice(0, 4);
  const extraCount = images.length - 4;

  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const gridClass =
    previewImages.length === 1
      ? "grid-cols-1"
      : previewImages.length === 2
      ? "grid-cols-2"
      : "grid-cols-2 grid-rows-2";

  return (
    <div className="max-w-[360px] rounded-2xl bg-blue-500 p-1">
      <div className={`grid ${gridClass} gap-1 overflow-hidden rounded-xl`}>
        {previewImages.map((img, i) => (
          <div
            key={i}
            onClick={() => onPress(i)}
            className="relative aspect-square overflow-hidden bg-blue-400"
          >
            {/* Loading overlay */}
            {!loaded[i] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}

            <Image
              src={img}
              alt=""
              fill
              className={`object-cover transition-opacity duration-300 ${
                loaded[i] ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() =>
                setLoaded((prev) => ({ ...prev, [i]: true }))
              }
            />

            {i === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-semibold">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {message && (
        <p className="px-2 py-1 text-sm text-white">{message}</p>
      )}
    </div>
  );
}
