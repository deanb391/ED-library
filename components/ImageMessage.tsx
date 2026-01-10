"use client";
import React from "react";
import Image from "next/image";

interface ImageMessage {
  id: string | number;
  url: string;
  onPress: (index) => void
}

interface ImageMessagesProps {
  images: ImageMessage[];
  message?: string;
  onPress: (index) => void
}

export default function ImageMessages({ images, message, onPress }: ImageMessagesProps) {
  const previewImages = images.slice(0, 4);
  const extraCount = images.length - 4;

  const gridClass =
    previewImages.length === 1
      ? "grid-cols-1"
      : previewImages.length === 2
      ? "grid-cols-2"
      : "grid-cols-2 grid-rows-2";

  return (
    <div className="max-w-[360px] rounded-2xl bg-blue-500 p-1">
      {/* Images */}
      <div className={`grid ${gridClass} gap-1 overflow-hidden rounded-xl`}>
        {previewImages.map((img, i) => (
          <div 
            onClick={() => onPress(i)}
            key={img.id} className="relative aspect-square overflow-hidden
            transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer
            ">
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover"
            />

            {i === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-semibold">
                +{extraCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption */}
      {message && (
        <p className="px-2 py-1 text-sm text-white">
          {message}
        </p>
      )}
    </div>
  );
}
