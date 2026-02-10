"use client";

import Image from "next/image";
import { useState } from "react";
import RectangularAd from "@/components/RectangularAd";

export default function PdfImageList({
  images,
  onPress,
  topAds,
}: {
  images: string[];
  onPress: (index: number) => void;
  topAds: any[];
}) {
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6">
      {images.map((img, i) => (
        <div key={`img-${i}`}>
          {/* Image */}
          <div
            onClick={() => onPress(i)}
            className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm cursor-pointer"
          >
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

          {/* Ad after every 10 images */}
          {(i + 1) % 10 === 0 && (
            <RectangularAd
              ads={topAds}
              height={130}
              className="mt-6"
            />
          )}
        </div>
      ))}
    </div>
  );
}
