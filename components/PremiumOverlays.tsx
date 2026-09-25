"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Home, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PremiumSuccessOverlay({ isOpen, onClose }: OverlayProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl relative border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-500 delay-100">
        
        {/* Confetti effect simulation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={clsx(
                  "absolute w-2 h-2 rounded-full animate-bounce",
                  ["bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-pink-500"][i % 4]
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 relative">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 relative z-10" />
          <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome to Premium!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
          You have successfully upgraded. Enjoy your ad-free experience and unlimited offline downloads.
        </p>

        <button
          onClick={() => {
            onClose();
            router.push("/");
          }}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Home size={20} />
          Go Home
        </button>
      </div>
    </div>
  );
}

export function PremiumFailOverlay({ isOpen, onClose }: OverlayProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-black w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Upgrade Failed</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
          We couldn't process your payment. Please check your payment details and try again.
        </p>

        <button
          onClick={() => {
            onClose();
            router.push("/premium");
          }}
          className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw size={20} />
          Try Again
        </button>
      </div>
    </div>
  );
}
