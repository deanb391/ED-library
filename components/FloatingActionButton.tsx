"use client";

import React, { useState } from "react";
import { Plus, X, BookOpen, UploadCloud } from "lucide-react";
import Link from "next/link";

interface FloatingActionButtonProps {
  className?: string;
}

export default function FloatingActionButton({ className = "" }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4 ${className}`}>
      {/* Action Buttons */}
      <div className={`flex flex-col gap-3 transition-all duration-300 transform ${
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
      }`}>
        <Link
          href="/contributor/dashboard/create-course"
          className="flex items-center gap-3 bg-white text-gray-700 px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
        >
          <span className="text-sm font-semibold">Create Course</span>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen size={20} />
          </div>
        </Link>

        <Link
          href="/contributor/dashboard/upload"
          className="flex items-center gap-3 bg-white text-gray-700 px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
        >
          <span className="text-sm font-semibold">Upload Resource</span>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <UploadCloud size={20} />
          </div>
        </Link>
      </div>

      {/* Main FAB */}
      <button
        onClick={toggleOpen}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isOpen ? (
          <X className="text-white" size={32} />
        ) : (
          <Plus className="text-white" size={32} />
        )}
      </button>
    </div>
  );
}
