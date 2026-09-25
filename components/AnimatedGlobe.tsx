"use client";

import React from "react";
import { Book } from "lucide-react";

export default function AnimatedGlobe() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); opacity: 0; }
        }
        @keyframes orbit-2 {
          0% { transform: rotate(120deg) translateX(160px) rotate(-120deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(480deg) translateX(160px) rotate(-480deg); opacity: 0; }
        }
        @keyframes orbit-3 {
          0% { transform: rotate(240deg) translateX(140px) rotate(-240deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(600deg) translateX(140px) rotate(-600deg); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .orbit-book-1 {
          animation: orbit-1 6s linear infinite;
        }
        .orbit-book-2 {
          animation: orbit-2 8s linear infinite;
        }
        .orbit-book-3 {
          animation: orbit-3 7s linear infinite;
        }
      `}} />

      {/* The Globe */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-blue-200 dark:border-blue-900 flex items-center justify-center animate-spin-slow shadow-[0_0_60px_rgba(37,99,235,0.1)]">
        {/* Latitude lines */}
        <div className="absolute w-full h-[30%] border-t-2 border-b-2 border-blue-100 dark:border-blue-900/50 rounded-[50%]" />
        <div className="absolute w-full h-[70%] border-t-2 border-b-2 border-blue-100 dark:border-blue-900/50 rounded-[50%]" />
        
        {/* Longitude lines */}
        <div className="absolute w-[30%] h-full border-l-2 border-r-2 border-blue-100 dark:border-blue-900/50 rounded-[50%]" />
        <div className="absolute w-[70%] h-full border-l-2 border-r-2 border-blue-100 dark:border-blue-900/50 rounded-[50%]" />
        
        {/* Central static globe icon for flavor */}
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-200 dark:border-blue-800">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* Orbiting Books */}
      <div className="absolute top-1/2 left-1/2 -mt-4 -ml-4 w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-400 orbit-book-1">
        <Book size={24} className="drop-shadow-md bg-white dark:bg-gray-900 rounded-sm" />
      </div>
      <div className="absolute top-1/2 left-1/2 -mt-3 -ml-3 w-6 h-6 flex items-center justify-center text-indigo-500 dark:text-indigo-400 orbit-book-2">
        <Book size={20} className="drop-shadow-md bg-white dark:bg-gray-900 rounded-sm" />
      </div>
      <div className="absolute top-1/2 left-1/2 -mt-5 -ml-5 w-10 h-10 flex items-center justify-center text-purple-500 dark:text-purple-400 orbit-book-3">
        <Book size={28} className="drop-shadow-md bg-white dark:bg-gray-900 rounded-sm" />
      </div>
    </div>
  );
}
