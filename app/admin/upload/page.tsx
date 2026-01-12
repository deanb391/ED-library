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
  GraduationCap 
} from 'lucide-react';
import { appendFilesToCourse, createPost, fetchCourses, uploadImage } from '@/lib/courses';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/appwrite';
import { useUser } from '@/context/UserContext';

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

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [semester, setSemester] = useState('Fall 2023');
  const [files, setFiles] = useState<File[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const MAX_FILES = 15;
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('');
  const {user} = useUser();

  useEffect(() => {
      fetchCourses().then(setCourses);
      const getUser = async () => {
        if (user?.isAdmin) setIsAdmin(true);
        setLoading(false)
      }
    getUser();
    }, []);

  const handleUpload = async () => {
  if (!selectedCourse || files.length === 0) return;

  setIsUploading(true);

  try {
    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadImage(file);
      urls.push(url);
    }
    const res = await createPost(selectedCourse, urls, description)
    if (res) {
      alert("Upload successful");
      setFiles([]);
      router.replace(`/courses/${selectedCourse}`)
    } else {
      alert("Upload Failed. Try Again");
      router.replace(`/courses/${selectedCourse}`)
    }
    
  } catch (err) {
    console.error(err);
    alert(`Upload failed ${err}`);
  } finally {
    setIsUploading(false);
  }
};


const handleFiles = (incoming: FileList | null) => {
  if (!incoming) return;

  const incomingFiles = Array.from(incoming);

  if (incomingFiles.length + files.length > MAX_FILES) {
    alert("Maximum of 15 images per upload.");
    return;
  }

  const normalizedIncoming = [...incomingFiles].reverse();
  // const nomr = [...normalizedIncoming].reverse()

  setFiles((prev) => [...prev, ...normalizedIncoming]);
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

  if (loading) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
);}

    if (isUploading
    ) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Uploading, please wait...</p>
  </div>
);}

  

    if (!isAdmin) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-white">
    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
    <p className="text-gray-500 mb-4">You must be logged in to view this page.</p>
    <Link href="/">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer">
        Home
      </button>
    </Link>
  </div>
);
  }

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

          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
              <div className="flex gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-28 h-36 flex-shrink-0 rounded-lg overflow-hidden border"
                  >
                    <p>
                      {index}
                    </p>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1
                      transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer"
                    >
                      <X size={12} />
                    </button>
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
                  <span className="font-bold">{files.length}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Size</span>
                  <span className="font-bold">
                    {(files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>


                {/* Upload Button */}
                <button
                  disabled={isUploading || !selectedCourse || files.length === 0}
                  onClick={handleUpload}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50
                  transition
    active:scale-[0.98]
    active:bg-gray-50
    hover:shadow-md
    cursor-pointer"
                >
                  {isUploading ? "Uploading..." : "Upload All Files"}
                </button>

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
    </div>
  );
}