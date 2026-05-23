"use client";

import React, { useEffect, useState } from 'react';
import {
  Search,
  Bell,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Info,
  CheckCircle2,
  Trash2,
  Lightbulb,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { appendFilesToCourse, createPost, fetchCourses, fetchCoursesByAdmin, uploadImage } from '@/lib/api/courses';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/appwrite';
import { useUser } from '@/context/UserContext';
import NativeBanner from '@/components/ads/NativeBanner';
import StreakCelebrationModal from '@/components/StreakCelebrationModal';

// --- Dummy Data ---
const PENDING_FILES = [
  {
    id: 1,
    name: 'Calculus_W1_L1.pdf',
    size: '2.4 MB',
    type: 'pdf',
    preview: '/api/placeholder/150/200', // Represents PDF thumbnail
  },
  {
    id: 2,
    name: 'Intro_Physics_Notes.jpg',
    size: '4.1 MB',
    type: 'image',
    preview: '/api/placeholder/150/200',
  },
  {
    id: 3,
    name: 'Midterm_Review_CS.pdf',
    size: '1.2 MB',
    type: 'pdf',
    preview: null, // No preview available case
  },
  {
    id: 4,
    name: 'Chem_Lab_Exp3.png',
    size: '8.5 MB',
    type: 'image',
    preview: '/api/placeholder/150/200',
  },
];

export type Course = {
  id: string;
  title: string;
  code: string;
  description: string;
  lecturer?: string;
  thumbnailId: string;
  thumbnailUrl: string;
  files?: string[];
};

export type QueuedFile = {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  url?: string;
  progress: number;
  error?: string;
};

import AccessWall from '@/components/AccessWall';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [semester, setSemester] = useState('Fall 2023');
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const MAX_FILES = 10;
  const router = useRouter();
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('');
  const { user, loading: userLoading, contributor, contributorLoading } = useUser();

  // Streak celebration state
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakData, setStreakData] = useState<{ currentStreak: number; dayName: string } | null>(null);

  useEffect(() => {
    if (userLoading || contributorLoading) return;
    if (!user || !contributor) {
      setLoading(false);
      return;
    }

    fetchCoursesByAdmin(user.$id).then(setCourses);
    setLoading(false);
  }, [user, userLoading, contributor, contributorLoading]);

  if (userLoading || contributorLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (!contributor) {
    return <AccessWall type="contributor" />;
  }

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Uploading, please wait...</p>
      </div>
    );
  }

  const handleUpload = async () => {
    if (!selectedCourse || queuedFiles.length === 0) return;

    const hasFailed = queuedFiles.some((f) => f.status === 'failed');
    if (hasFailed) {
      alert("Some files failed to upload. Please remove them or try again.");
      return;
    }

    setIsUploading(true);

    try {
      // Function to wait for all currently active files in the queue to finish
      const waitForUploads = async (): Promise<string[]> => {
        return new Promise((resolve, reject) => {
          const checkStatus = () => {
            // We need to use the functional update pattern or a ref to see the absolute latest state
            setQueuedFiles((current) => {
              const allFinished = current.every((f) => f.status === 'completed' || f.status === 'failed');
              const anyFailed = current.some((f) => f.status === 'failed');

              if (allFinished) {
                if (anyFailed) {
                  reject(new Error("One or more files failed to upload."));
                } else {
                  resolve(current.map((f) => f.url!).filter(Boolean));
                }
                return current;
              }
              
              // If not finished, check again in 500ms
              setTimeout(checkStatus, 500);
              return current;
            });
          };
          checkStatus();
        });
      };

      const urls = await waitForUploads();

      if (urls.length === 0) {
        throw new Error("No files were uploaded successfully.");
      }

      const res = await createPost(selectedCourse, urls, description);
      
      if (res) {
        setQueuedFiles([]);
        
        // Check if we hit a streak today
        if (res.streakData && res.streakData.isFirstToday) {
          setStreakData({
            currentStreak: res.streakData.currentStreak,
            dayName: res.streakData.dayName,
          });
          setShowStreakModal(true);
        } else {
          alert("Upload successful");
          router.replace(`/courses/${selectedCourse}`);
        }
      } else {
        alert("Upload Failed. Try Again");
      }

    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err?.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };


  const uploadSingleFile = async (id: string, file: File) => {
    setQueuedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading' } : f))
    );

    try {
      const url = await uploadImage(file);
      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'completed', url } : f
        )
      );
    } catch (error) {
      setQueuedFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'failed', error: String(error) } : f
        )
      );
    }
  };


  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const incomingFiles = Array.from(incoming);

    if (incomingFiles.length + queuedFiles.length > MAX_FILES) {
      alert(`Maximum of ${MAX_FILES} images per upload.`);
      return;
    }

    const newQueuedFiles: QueuedFile[] = incomingFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    setQueuedFiles((prev) => [...prev, ...newQueuedFiles]);

    // Start background uploads
    newQueuedFiles.forEach((qf) => uploadSingleFile(qf.id, qf.file));
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans text-gray-900 pb-12">


      {/* --- Content Body --- */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Breadcrumbs & Header */}
        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Course Notes</h1>
              <p className="text-gray-500 mt-1">Contribute to the community by sharing your academic materials.</p>
            </div>


          </div>
        </div>

        {/* Batch Upload Info Section */}
        {showInfo && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-500"
            style={{ paddingBottom: 35 }}
          >
            <div className="flex items-start gap-4 pr-10">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Important: Batch Uploading</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                  To ensure the highest quality and fastest processing for your students, ED-Library uses
                  <strong> batch uploading</strong>. This means you should upload your course materials in
                  logical batches of a <strong>maximum of {MAX_FILES} images</strong> per upload.
                </p>
                <div className="flex gap-4 mt-4 text-xs font-semibold text-blue-700">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Better image quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Faster student access</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className=" absolute top-4 right-4 p-2 hover:bg-blue-100 rounded-full text-blue-400 transition-colors"
              style={{ paddingBottom: 30 }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* --- Ad Banner --- */}
        {/*
<div className="mb-6">
  <NativeBanner />
</div>
*/}

        {/* --- Main Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Upload Zone & List */}
          <div className="lg:col-span-2 space-y-8">

            {/* Drag & Drop Zone */}
            <div
              className={`bg-white border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrag}
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Drag and drop your notes here</h3>
              <p className="text-gray-500 text-sm mb-4">Or browse from your computer</p>
              <p className="text-xs text-gray-400 mb-6">Supported: PDF, JPG, PNG, DOCX (Max 20MB per file)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                id="fileInput"
                onChange={(e) => handleFiles(e.target.files)}
              />

              <button
                onClick={() => document.getElementById("fileInput")?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold shadow-sm
                transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer"
              >
                Select Files
              </button>
            </div>

          </div>
          {/* --- Ad Banner --- */}
          {/*
  <div className="my-6">
    <NativeBanner />
  </div>
*/}

          {queuedFiles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
              <div className="flex gap-4">
                {queuedFiles.map((qf, index) => (
                  <div
                    key={qf.id}
                    className="relative w-28 h-36 flex-shrink-0 rounded-lg overflow-hidden border"
                  >
                    <p className="absolute top-1 left-1 bg-black/40 text-white text-[10px] px-1 rounded z-10">
                      {index + 1}
                    </p>
                    <img
                      src={URL.createObjectURL(qf.file)}
                      alt={qf.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setQueuedFiles((prev) => prev.filter((f) => f.id !== qf.id))
                      }
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1
                      transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer z-10"
                    >
                      <X size={12} />
                    </button>
                    
                    {/* Upload Status Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      {qf.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      )}
                      {qf.status === 'completed' && (
                        <div className="bg-green-500 rounded-full p-1 shadow-lg">
                          <CheckCircle2 size={16} className="text-white" />
                        </div>
                      )}
                      {qf.status === 'failed' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            uploadSingleFile(qf.id, qf.file);
                          }}
                          className="bg-red-500 rounded-full p-1 shadow-lg pointer-events-auto cursor-pointer hover:bg-red-600 transition-colors"
                        >
                          <RotateCcw size={16} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Right Column: Metadata Sidebar */}
          <div className="space-y-6">

            {/* Metadata Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={18} className="text-gray-900" />
                <h3 className="font-bold text-gray-900">Common Metadata</h3>
              </div>

              <div className="space-y-5">
                {/* Course Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>

                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-400 resize-none"
                  />
                </div>

                {/* Doc Type Dropdown */}
                {/* <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Document Type</label>
                  <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                    <option>Lecture Notes</option>
                    <option>Exam Prep</option>
                    <option>Assignment</option>
                  </select>
                </div> */}

                {/* Semester Toggle */}
                {/* <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Semester</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setSemester('Fall 2023')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${semester === 'Fall 2023' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Fall 2023
                    </button>
                    <button 
                      onClick={() => setSemester('Spring 2024')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${semester === 'Spring 2024' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Spring 2024
                    </button>
                  </div>
                </div> */}

                <hr className="border-gray-100" />

                {/* Summary Stats */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Files</span>
                  <span className="font-bold">{queuedFiles.length}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Size</span>
                  <span className="font-bold">
                    {(queuedFiles.reduce((a, f) => a + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>


                {/* Upload Button */}
                <button
                  disabled={isUploading || !selectedCourse || queuedFiles.length === 0}
                  onClick={handleUpload}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50
                  transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer"
                >
                  {isUploading ? "Processing..." : "Upload All Files"}
                </button>

                {/* --- Ad Banner --- */}
                {/*
  <div className="mt-6">
    <NativeBanner />
  </div>
*/}
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  By uploading, you agree to our Terms of Service and Honor Code.
                </p>
              </div>
            </div>

            {/* Pro Tip Card */}
            {/* <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 flex items-start gap-3">
               <div className="mt-0.5 text-sky-600">
                 <Lightbulb size={18} fill="currentColor" className="text-sky-600" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-sky-900 mb-1">Pro Tip</h4>
                 <p className="text-xs text-sky-800 leading-relaxed">
                   Combine multiple pages into a single PDF for easier reading and higher approval rates. High-quality scans get 2x more downloads!
                 </p>
               </div>
            </div> */}

          </div>
        </div>
      </main>

      {/* Streak Celebration Modal */}
      {streakData && (
        <StreakCelebrationModal
          isOpen={showStreakModal}
          onClose={() => {
            setShowStreakModal(false);
            router.replace(`/courses/${selectedCourse}`);
          }}
          currentStreak={streakData.currentStreak}
          dayName={streakData.dayName}
        />
      )}
    </div>
  );
}