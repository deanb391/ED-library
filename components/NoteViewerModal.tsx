"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCw, 
  Download, 
  FileText, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { getCurrentUser, storage } from '@/lib/appwrite';
import { buildDownloadUrlFromView } from '@/lib/courses';
import { useUser } from '@/context/UserContext';


// --- Dummy Data for the Viewer ---
// Represents pages within a document or a list of images to swipe through
const VIEWER_DATA = [
  { id: 1, url: '/api/placeholder/600/800', title: 'Page 1' },
  { id: 2, url: '/api/placeholder/600/800', title: 'Page 2' },
  { id: 3, url: '/api/placeholder/600/800', title: 'Page 3' }, // The one from screenshot
  { id: 4, url: '/api/placeholder/600/800', title: 'Page 4' },
  { id: 5, url: '/api/placeholder/600/800', title: 'Page 5' },
];

interface NoteViewerProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
  initialIndex?: number;
  title?: string;
  uploader?: string;
  date?: string;
  onDelete: (url: string) => void;
  course_user: string;
}


export default function NoteViewerModal({
  isOpen,
  onClose,
  files,
  initialIndex = 0,
  title = "Course Notes",
  uploader = "Unknown",
  date = "",
  onDelete,
  course_user,
}: NoteViewerProps) {

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(0.5);
  const [rotation, setRotation] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false)
  const [imageLoading, setImageLoading] = useState(true);
  const {user} = useUser();
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);

  

  
  // Swipe State
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
    }
    const getUser = async () => {
      if (user?.isAdmin) setIsAdmin(true)
    }
    getUser()
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setImageLoading(true);
  }, [currentIndex]);


  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen || files.length === 0) return null;


const nextImage = () => {
  if (currentIndex < files.length - 1) {
    setCurrentIndex(i => i + 1);
    resetView();
  }
};

const prevImage = () => {
  if (currentIndex > 0) {
    setCurrentIndex(i => i - 1);
    resetView();
  }
};


  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  // --- Swipe Logic ---
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const toggleFullScreen = () => {
    const el = document.getElementById("note-viewer-image");
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

// example import

// const downloadImage = async () => {
//   const file = files[currentIndex];
//   try {
//     const url = await storage.getFileDownload(file.id); // generates a signed URL
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = `note-page-${currentIndex + 1}.png`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   } catch (err) {
//     console.error(err);
//   }
// };




  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#15171B] text-white overflow-hidden animate-in fade-in duration-200">
      
      {/* --- Top Header --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#15171B] border-b border-gray-800 relative z-50">
        <div className="flex items-center gap-4"> 
           <div className="bg-blue-600 p-2 rounded-lg">
            <FileText size={20} fill="white" className="text-white" />
          </div>
          {
            !isAdmin &&(
              <div>
            <h2 className="font-bold text-sm md:text-base leading-tight"></h2>
            <p className="text-xs text-gray-400 mt-0.5">Uploaded By Emmanuel</p>
          </div>
            )
          }
        </div>

        <div className="flex items-center gap-3">
          { isAdmin && course_user === user?.$id && (
            <button 
              onClick={() => { onDelete(files[currentIndex])}}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold border border-red-500/20 transition-colors">
              <Trash2 size={14} />
              Delete Note
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div 
        className="flex-1 relative flex items-center justify-center bg-[#0F1115] overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Floating Page Counter */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
           <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-gray-300 text-xs font-medium rounded-full border border-white/10 shadow-lg">
             Page {currentIndex + 1} of {files.length}
           </span>
        </div>

        {/* Navigation Arrows (Desktop) */}
        <button 
           onClick={prevImage}
           disabled={currentIndex === 0}
           className="absolute left-4 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all disabled:opacity-0 hidden md:block z-40"
        >
          <ChevronLeft size={32} />
        </button>

        <button 
           onClick={nextImage}
           disabled={currentIndex === files.length - 1}
           className="absolute right-4 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all disabled:opacity-0 hidden md:block z-40"
        >
          <ChevronRight size={32} />
        </button>

        {/* Mobile tap zones */}
<div className="absolute inset-0 z-30 flex md:hidden">
  <div
    className="w-1/2 h-full"
    onClick={prevImage}
  />
  <div
    className="w-1/2 h-full"
    onClick={nextImage}
  />
</div>


        {/* Image Display */}
        <div className="relative flex justify-center items-center w-full h-full overflow-auto">
          {/* Loading Indicator */}
          {imageLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0F1115]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" />
            </div>
          )}

          {files[currentIndex] ? (
            <Image
              src={files[currentIndex]}
              alt={`Page ${currentIndex + 1}`}
              width={600}
              height={800}
              className={`object-contain shadow-2xl transition-transform duration-200 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              draggable={false}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
              onLoadingComplete={() => setImageLoading(false)}
              priority
            />
          ) : (
            <p className="text-white">Image not available</p>
          )}
        </div>






      </div>

      {/* --- Bottom Toolbar --- */}
      {/* Action Panel */}
<div
  className={`
    fixed bottom-6 left-6 z-50
    origin-bottom-left
    transition-all duration-300 ease-out
    ${showActions
      ? "scale-100 opacity-100 translate-y-0"
      : "scale-75 opacity-0 pointer-events-none translate-y-4"}
  `}
>
  <div className="
    relative
    bg-[#1E2126]/90 backdrop-blur-xl
    border border-gray-700/50
    rounded-2xl
    p-3
    shadow-2xl shadow-black/60
    flex items-center gap-1
  ">

    {/* Collapse Button */}
    <button
      onClick={() => setShowActions(false)}
      className="
        absolute -top-2 -right-2
        h-6 w-6 rounded-full
        bg-gray-800 hover:bg-gray-700
        flex items-center justify-center
        text-gray-400 hover:text-white
      "
    >
      <X size={12} />
    </button>

    <TooltipButton
      icon={<ZoomOut size={18} />}
      onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
    />

    <TooltipButton
      icon={<ZoomIn size={18} />}
      onClick={() => setZoom(z => Math.min(3, z + 0.25))}
    />

    <div className="w-px h-6 bg-gray-700 mx-1" />

    <TooltipButton
      icon={<RotateCw size={18} />}
      onClick={() => setRotation(r => r + 90)}
    />

    <TooltipButton
      icon={<Maximize size={18} />}
      onClick={() => setZoom(1)}
    />

    <div className="w-px h-6 bg-gray-700 mx-1" />

    <button
      onClick={() => {
        if (user) {
          const url = buildDownloadUrlFromView(files[currentIndex]);
          window.open(url, "_blank");
        } else {
          router.push("/signup");
        }
      }}
      className="
        flex items-center gap-2
        bg-blue-600 hover:bg-blue-500
        text-white px-3 py-2
        rounded-lg text-sm font-semibold
        transition-colors
      "
    >
      <Download size={16} />
      <span className="hidden sm:inline">Download</span>
    </button>

  </div>
</div>


      <TooltipButton icon={<Maximize size={18} />} onClick={toggleFullScreen} />

      {/* Floating Action Toggle */}
{!showActions && (
  <button
    onClick={() => setShowActions(true)}
    className="
      fixed bottom-6 left-6 z-50
      h-14 w-14 rounded-full
      bg-blue-600 hover:bg-blue-500
      flex items-center justify-center
      shadow-2xl shadow-black/40
      transition-transform active:scale-95
    "
  >
    <Maximize size={22} className="text-white" />
  </button>
)}


    </div>
  );
}

// Helper Component for Toolbar Buttons
function TooltipButton({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
    >
      {icon}
    </button>
  );
}