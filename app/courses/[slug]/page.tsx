"use client"
import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  ChevronDown, 
  Pencil, 
  Trash2, 
  Download, 
  MoreVertical, 
  FileText,
  Hexagon
} from 'lucide-react';
import NoteViewerModal from '@/components/NoteViewerModal';
import { useParams } from 'next/navigation';
import { deleteCourse, deleteFileFromCourse, fetchCourseById, fetchPosts } from '@/lib/courses';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/appwrite';
import ConfirmCourseDelete from '@/components/ConfirmCourseDelete';
import { useRouter } from 'next/navigation';
import ConfirmFileDelete from '@/components/ConfirmFileDelete';
import ImageMessages from '@/components/ImageMessage';

interface Post {
  id: string;
  images: { id: string; url: string }[];
  description?: string;
}


// --- Dummy Data ---
const NOTES_DATA = [
  {
    id: 1,
    title: 'Lecture 01: Introduction & GDP',
    meta: 'Uploaded Sep 12, 2023 • 5 pages',
    image: '/api/placeholder/400/500', // Vertical aspect ratio
  },
  {
    id: 2,
    title: 'Lecture 02: Aggregate Demand',
    meta: 'Uploaded Sep 15, 2023 • 8 pages',
    image: '/api/placeholder/400/500',
  },
  {
    id: 3,
    title: 'Lecture 03: Fiscal Policy',
    meta: 'Uploaded Sep 19, 2023 • 12 pages',
    image: '/api/placeholder/400/500',
  },
  {
    id: 4,
    title: 'Lecture 04: The Solow Growth Model',
    meta: 'Uploaded Sep 22, 2023 • 15 pages',
    image: '/api/placeholder/400/500',
  },
];

export default function CourseDetailsPage() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);
  const params = useParams();
  const courseId = params.slug as string;
  const [isCourseDeleteOpen, setIsCourseDeleteOpen] = useState(false);
  const [isFileDeleteOpen, setIsFileDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('')
  const [posts, setPosts] = useState<any>()

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalImages, setModalImages] = useState<{ id: string; url: string }[]>([])
  const router = useRouter()

  useEffect(() => {

    const getUser = async () => {
      const doc = await getCurrentUser()
      if (doc) setIsAdmin(true)

      const [course_doc, posts_doc] = await Promise.all([
        fetchCourseById(courseId),
        fetchPosts(courseId)
      ])
      setCourse(course_doc);
      setPosts(posts_doc);
      setLoading(false)
    }
    getUser()
  }, [courseId]);

   if (loading) {
    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
);
   }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans">
      


      {/* --- Main Content --- */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <User size={16} />
              <span>{course.lecturer}</span>
              <span className="mx-1">•</span>
              <span>{course.code}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {
            isAdmin && (
              <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Pencil size={16} />
              Edit Course
            </button>
            <button 
              onClick={(e) => {setIsCourseDeleteOpen(true)}}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100">
              <Trash2 size={18} />
            </button>
          </div>
            )
          }
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            <button className="pb-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm">
              Lecture Notes
            </button>

          </div>
        </div>

        {/* Notes Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          {course.files.map((file: any, index: number) => (
  <div key={file.id} className="group cursor-pointer">
    <div
      className="bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 aspect-[4/5] relative mb-4"
      onClick={() => {
        setSelectedNoteIndex(index);
        setIsViewerOpen(true);
      }}
    >
      <Image
        src={file.previewUrl}
        alt={`Note ${index + 1}`}
        fill
        className="object-cover"
      />
    </div>

  </div>
))}

        </div> */}

        {
          posts.map((post: Post, key: number) => {
            return (
              <div className='mb-5'>
                <ImageMessages
                images={post.images.map((f, key) => ({ id: key, url: f.url }))}
                message={post.description}
                onPress={(index) =>{
                  setSelectedNoteIndex(index)
                  setModalImages(post.images)
                  setIsViewerOpen(true)
                }}
              />
              </div>
              
            )
          })
        }

        {/* Pagination Button */}
        <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-bold text-gray-800 shadow-sm transition-all">
              Show more notes
              <ChevronDown size={16} />
            </button>
        </div>

        <NoteViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false)
            setModalImages([])
          }}
          initialIndex={selectedNoteIndex}
          files={modalImages as any}
          onDelete={(url: string) => {
            setIsViewerOpen(false)
            setIsFileDeleteOpen(true)
            setDeleteUrl(url)
          }}
        />

        <ConfirmFileDelete
          isOpen={isFileDeleteOpen}
          onClose={() => setIsFileDeleteOpen(false)}
          onConfirm={async () => {
            await deleteFileFromCourse(courseId, deleteUrl);
            setIsFileDeleteOpen(false);
            router.replace(`/`)
          }}
          fileName={""}
        />

        <ConfirmCourseDelete 
          isOpen={isCourseDeleteOpen} 
          onClose={() => setIsCourseDeleteOpen(false)}
          onConfirm={async () => {
            await deleteCourse(courseId);
            setIsCourseDeleteOpen(false);
            router.replace("/")
          }}
          courseTitle={course.title}
        />

      </main>
    </div>
  );
}