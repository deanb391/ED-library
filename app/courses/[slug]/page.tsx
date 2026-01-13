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
import { deleteCourse, deleteFileFromPost, deletePost, editPost, fetchCourseById, fetchPosts } from '@/lib/courses';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/appwrite';
import ConfirmCourseDelete from '@/components/ConfirmCourseDelete';
import { useRouter } from 'next/navigation';
import ConfirmFileDelete from '@/components/ConfirmFileDelete';
import ImageMessages from '@/components/ImageMessage';
import { useUser } from '@/context/UserContext';
import EditPostModal from '@/components/EditPostModal';
import PostActionModal from '@/components/PostActionModal';
import ConfirmPostDelete from '@/components/ConfirmPostDelete';
import EditCourseModal from '@/components/EditCourseModal';

interface Post {
  id: string;
  images: string [];
  description?: string;
}

export type Course = {
  id: string;
  title: string;
  code: string;
  description: string;
  lecturer?: string;
  thumbnailId: string;
  thumbnailUrl: string;
  files?: string[];
  user?: any
};


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
  const [isPostDeleteOpen, setIsPostDeleteOpen] = useState(false);
  const [isFileDeleteOpen, setIsFileDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('')
  const [posts, setPosts] = useState<Post[]>([]);
const [cursor, setCursor] = useState<string | null>(null);
const [loadingPosts, setLoadingPosts] = useState(false);
const [hasMore, setHasMore] = useState(true);
  const [postId, setPostId] = useState("")

  const [course, setCourse] = useState<Course| null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalImages, setModalImages] = useState<string []>([])
  const [activePost, setActivePost] = useState<Post | null>(null);
const [showActions, setShowActions] = useState(false);
const [showEdit, setShowEdit] = useState(false);
const [savingEdit, setSavingEdit] = useState(false);
const [showEditCourse, setShowEditCourse] = useState(false);


  const router = useRouter();
  const {user} = useUser()

  useEffect(() => {
    const init = async () => {

      if (user?.isAdmin) setIsAdmin(true);

      const courseDoc = await fetchCourseById(courseId);
      setCourse(courseDoc);

      const { posts: firstPosts, lastId } = await fetchPosts(courseId);
      setPosts(firstPosts);
      setCursor(lastId);
      setHasMore(firstPosts.length === 5);

      setLoading(false);
    };

    init();
  }, [courseId]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingPosts) return;

    setLoadingPosts(true);

    const { posts: newPosts, lastId } = await fetchPosts(
      courseId,
      5,
      cursor || undefined
    );

    setPosts(prev => [...prev, ...newPosts]);
    setCursor(lastId);
    setHasMore(newPosts.length === 5);

    setLoadingPosts(false);
  };

  useEffect(() => {
  const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [cursor, hasMore, loadingPosts]);


  const handleSaveEdit = async (value: string) => {
    if (!activePost) return;

    try {
      setSavingEdit(true);
      await editPost(activePost.id, { description: value });

      setPosts(prev =>
        prev.map(p =>
          p.id === activePost.id ? { ...p, description: value } : p
        )
      );

      setShowEdit(false);
    } finally {
      setSavingEdit(false);
    }
  };


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
              {course?.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <User size={16} />
              <span>{course?.lecturer}</span>
              <span className="mx-1">•</span>
              <span>{course?.code}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {
            (isAdmin && course?.user === user?.$id) && (
              <div className="flex items-center gap-3">
            <button 
            onClick={() => setShowEditCourse(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
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

        {posts.map((post, key) => (
          <div key={post.id} className="mb-5">
            <ImageMessages
              id={post.id}
              images={post.images}
              message={post.description}
              onPress={(index) => {
                setSelectedNoteIndex(index);
                setModalImages(post.images);
                setIsViewerOpen(true);
                setPostId(post.id)
              }}
              onLongPress={(id) => {
                if (!user?.isAdmin) return;
                const found = posts.find(p => p.id === id);
                if (!found) return;
                setActivePost(found);
                setShowActions(true);
                setPostId(post.id)
              }}
            />
          </div>
        ))}


        {loadingPosts && (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        )}

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
            await deleteFileFromPost(postId, deleteUrl);
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
          courseTitle={course?.title}
        />

          <ConfirmPostDelete 
            isOpen={isPostDeleteOpen} 
            onClose={() => setIsPostDeleteOpen(false)}
            onConfirm={async () => {
              await deletePost(postId);
              setIsPostDeleteOpen(false);
              router.replace("/")
            }}
            courseTitle={course?.title}
          />

        <PostActionModal
  isOpen={showActions}
  onClose={() => setShowActions(false)}
  onEdit={() => {
    setShowActions(false);
    setShowEdit(true);
  }}
  onDelete={() => {
    setShowActions(false);
    setIsPostDeleteOpen(true);
  }}
/>

<EditPostModal
  isOpen={showEdit}
  initialValue={activePost?.description}
  loading={savingEdit}
  onClose={() => setShowEdit(false)}
  onSave={handleSaveEdit}
/>

{course && (
  <EditCourseModal
    isOpen={showEditCourse}
    onClose={() => setShowEditCourse(false)}
    course={{
      id: course.id,
      title: course.title,
      code: course.code,
      description: course.description,
      lecturer: course.lecturer,
      thumbnailId: course.thumbnailId,
      thumbnailUrl: course.thumbnailUrl,
    }}
    onUpdated={(updated) =>
      setCourse((prev) => prev ? { ...prev, ...updated } as Course : null)
    }
  />
)}



      </main>
    </div>
  );
}