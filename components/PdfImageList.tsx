"use client";

import Image from "next/image";
import { useState } from "react";

export default function PdfImageList({
  images,
  onPress,
}: {
  images: string[];
  onPress: (index: number) => void;
}) {
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {images.map((img, i) => (
        <div
          key={i}
          onClick={() => onPress(i)}
          className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm cursor-pointer"
        >
          {/* Loading overlay */}
          {!loaded[i] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            </div>
          )}

          <Image
            src={img}
            alt=""
            fill
            className={`object-contain bg-white transition-opacity duration-300 ${
              loaded[i] ? "opacity-100" : "opacity-0"
            }`}
            onLoadingComplete={() =>
              setLoaded(prev => ({ ...prev, [i]: true }))
            }
          />
        </div>
      ))}
    </div>
  );
}
