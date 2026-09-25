"use client"
import React, { useEffect, useState, useRef } from 'react';
import {
  CreditCard,
  Search,
  Bell,
  User,
  ChevronDown,
  Pencil,
  Trash2,
  Download,
  MoreVertical,
  FileText,
  Hexagon,
  Share2,
  BookOpen,
  Lock,
  Tag,
  Star,
  Activity,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  X,
  Check
} from 'lucide-react';
import NoteViewerModal from '@/components/NoteViewerModal';
import { useParams } from 'next/navigation';
import { Course, deleteCourse, deleteFileFromPost, deletePost, editCourse, editPost, fetchAllPosts, fetchCourseById, fetchPosts, fetchPostsAsc, recordCourseVisit, fetchRelatedCourse } from '@/lib/api/courses';
import CourseCard from '@/components/CourseCard';
import Image from 'next/image';
import { getCurrentUser, updateUser } from '@/lib/services/auth.service';
import ConfirmCourseDelete from '@/components/ConfirmCourseDelete';
import { useRouter } from "@/components/useRouter";
import ConfirmFileDelete from '@/components/ConfirmFileDelete';
import ImageMessages from '@/components/ImageMessage';
import { useUser } from '@/context/UserContext';
import EditPostModal from '@/components/EditPostModal';
import PostActionModal from '@/components/PostActionModal';
import ConfirmPostDelete from '@/components/ConfirmPostDelete';
import EditCourseModal from '@/components/EditCourseModal';
import PdfImageList from "@/components/PdfImageList"
import FloatingActionButton from '@/components/FloatingActionButton';
import NativeBanner from '@/components/ads/NativeBanner';
import RectangularAd from '@/components/RectangularAd';
import { fetchSmallAds } from '@/lib/api/ads';
import BannerAd from '@/components/BannerAd';
import NoUserModal from '@/components/NoUserModal';
import FollowSuggestionModal from '@/components/FollowSuggestionModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AnalyticsChart from '@/components/AnalyticsChart';
import ReviewModal from '@/components/ReviewModal';
import { createReview, fetchReviews, Review, calculateCourseAverageRating } from '@/lib/api/reviews';
import { getMyContributor, toggleFollowContributor } from '@/lib/api/contributors';
import { Contributor } from '@/lib/services/contributors.service';
import Link from 'next/link';
import { fetchLibrary, addCourseToLibrary } from '@/lib/api/library';
import { useLibrary } from '@/hooks/useLibrary';
import { CourseDocument, fetchDocuments, deleteDocument, createDocumentReviewRequest } from '@/lib/api/documents';
import dynamic from 'next/dynamic';
const DocumentViewerModal = dynamic(() => import('@/components/DocumentViewerModal'), { ssr: false });
import DocumentReviewModal from '@/components/DocumentReviewModal';

function SwipeableDocumentItem({
  doc,
  isOwner,
  onOpen,
  onDelete,
  onRequestReview
}: {
  doc: CourseDocument,
  isOwner: boolean,
  onOpen: (doc: CourseDocument) => void,
  onDelete: (id: string) => void,
  onRequestReview?: (id: string) => void
}) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isOwner) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isOwner) return;
    const diff = e.touches[0].clientX - startX.current;
    // Slide right to reveal delete icon on the left
    if (diff > 0) setOffset(Math.min(diff, 80));
    else setOffset(Math.max(diff, 0));
  };

  const handleTouchEnd = () => {
    if (!isOwner) return;
    if (offset > 40) setOffset(80);
    else setOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-red-500 mb-6 group select-none">
      <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center text-white">
        <button onClick={() => onDelete(doc.$id!)} className="p-2 w-full h-full flex justify-center items-center hover:bg-red-600 transition-colors">
          <Trash2 size={24} />
        </button>
      </div>

      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-transform duration-200 ease-out z-10 relative group-hover:translate-x-20"
        style={{ transform: offset > 0 ? `translateX(${offset}px)` : undefined }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{doc.fileName}</h3>
            {doc.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{doc.description}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{doc.fileType}</span>
              {isOwner && (
                <>
                  <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                    {doc.status}
                  </span>
                </>
              )}
            </div>
            {isOwner && doc.status === 'rejected' && doc.reviewReason && (
              <div className="mt-3 text-xs bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col gap-2">
                <span className="text-red-700 font-medium"><strong>Reason:</strong> {doc.reviewReason}</span>
                {onRequestReview && (
                  <button onClick={() => onRequestReview(doc.$id!)} className="text-gray-900 dark:text-white font-semibold self-start hover:underline active:opacity-70 transition-opacity">
                    Request Human Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => onOpen(doc)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-300 transition-colors shrink-0 w-full md:w-auto shadow-sm"
        >
          <BookOpen size={18} /> Open
        </button>
      </div>
    </div>
  );
}


const data = [
  { day: "Mon", visits: 120 },
  { day: "Tue", visits: 150 },
  { day: "Wed", visits: 130 },
  { day: "Thu", visits: 170 },
  { day: "Fri", visits: 200 },
  { day: "Sat", visits: 180 },
  { day: "Sun", visits: 220 },
];

interface Post {
  id: string;
  images: string[];
  description?: string;
}

// Course type is now imported from @/lib/api/courses


function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3" style={{ borderWidth: 0.1 }}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}


interface ReviewUser {
  username: string;
  image?: string;
  avatar?: string;
}

function ReviewItem({ review }: { review: Review }) {
  const rating = Math.max(0, Math.min(5, Math.round(review.rating ?? 0)));
  const stars = `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
  const user = review.user as ReviewUser || "Anonymous";

  const createdAt = review.$createdAt
    ? new Date(review.$createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "";

  return (
    <div className="flex gap-3 mb-5">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" >
        <img
          src={user?.image || user?.avatar}
          alt={user?.username}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{createdAt}</span>
        </div>

        {/* Rating */}
        <div className="text-sm text-yellow-500 mt-1" style={{ color: "gold" }}>{stars}</div>

        {/* Comment */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.review}</p>
      </div>
    </div>
  );
}


export type AdItem = {
  id: string;
  fileUrl: string;
  fileType: "image" | "video";
  link?: string;
};

export default function CourseDetailsClient({ courseId }: { courseId: string }) {

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(0);

  const handleShare = async () => {
    const shareData = {
      title: course?.title || "Course Details",
      text: `Check out this course: ${course?.title} on ED-Library!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const [isCourseDeleteOpen, setIsCourseDeleteOpen] = useState(false);
  const [isPostDeleteOpen, setIsPostDeleteOpen] = useState(false);
  const [isFileDeleteOpen, setIsFileDeleteOpen] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState('')
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [postId, setPostId] = useState("")

  const [course, setCourse] = useState<Course | null>(null);
  const [lloading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalImages, setModalImages] = useState<string[]>([])
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [pdfCursor, setPdfCursor] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [hasMorePdf, setHasMorePdf] = useState(true);
  const [topAds, setTopAds] = useState<AdItem[]>([])
  type ViewMode = "timeline" | "pdf";
  const [viewMode, setViewMode] = useState<ViewMode>("pdf");

  type SortOrder = "asc" | "desc";
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSortChange = async (newOrder: SortOrder) => {
    if (newOrder === sortOrder) return;
    setSortOrder(newOrder);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    const fetchFunc = newOrder === "asc" ? fetchPostsAsc : fetchPosts;
    const { posts: firstPosts, lastId } = await fetchFunc(courseId, 5);
    setPosts(firstPosts);
    setCursor(lastId);
    setHasMore(firstPosts.length === 5);
  };


  const [showTimelineText, setShowTimelineText] = useState(false);
  const [showPdfText, setShowPdfText] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
      if (!navigator.onLine) setActiveTab("content");
    }
  }, []);
  const [bounceTimeline, setBounceTimeline] = useState(false);
  const [bouncePdf, setBouncePdf] = useState(false);

  useEffect(() => {
    setShowTimelineText(false);
    setShowPdfText(false);
    setBounceTimeline(false);
    setBouncePdf(false);

    let expandTimeout: NodeJS.Timeout;
    let collapseTimeout: NodeJS.Timeout;
    let bounceInterval: NodeJS.Timeout;
    let bounceTimeout: NodeJS.Timeout;

    if (viewMode === 'timeline') {
      expandTimeout = setTimeout(() => {
        setShowPdfText(true);
        collapseTimeout = setTimeout(() => {
          setShowPdfText(false);
          bounceInterval = setInterval(() => {
            setBouncePdf(true);
            bounceTimeout = setTimeout(() => setBouncePdf(false), 1000);
          }, 3000);
        }, 6000);
      }, 1000);
    } else if (viewMode === 'pdf') {
      expandTimeout = setTimeout(() => {
        setShowTimelineText(true);
        collapseTimeout = setTimeout(() => {
          setShowTimelineText(false);
          bounceInterval = setInterval(() => {
            setBounceTimeline(true);
            bounceTimeout = setTimeout(() => setBounceTimeline(false), 1000);
          }, 3000);
        }, 6000);
      }, 1000);
    }

    return () => {
      clearTimeout(expandTimeout);
      clearTimeout(collapseTimeout);
      clearTimeout(bounceTimeout);
      clearInterval(bounceInterval);
    };
  }, [viewMode]);

  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);
  const [showNoUserModal, setShowNoUserModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewCursor, setReviewCursor] = useState<string | undefined>(undefined);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  type Tab = "controls" | "content" | "review";
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [showOverlay, setShowOverlay] = useState<"timeline" | "pdf" | null>(null);
  const [documents, setDocuments] = useState<CourseDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CourseDocument | null>(null);
  const [documentDeleteOpen, setDocumentDeleteOpen] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [reviewRequestDocumentId, setReviewRequestDocumentId] = useState<string | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [visitsPerDay, setVisitsPerDay] = useState({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
  const [totalReach, setTotalReach] = useState(0);
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [follow, setFollow] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showFollowSuggestion, setShowFollowSuggestion] = useState(false);
  const hasIncrementedVisits = useRef(false);
  /** True when the page was loaded from localStorage cache (offline). Triggers full refetch on reconnect. */
  const loadedOffline = useRef(false);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);

  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [accessTag, setAccessTag] = useState<"free" | "paid" | "owned" | "subscribed" | null>(null);
  const [priceMeta, setPriceMeta] = useState<any>(null);

  // ===== Payment & Library State =====
  const router = useRouter();
  const { user, loading, showAdCourse, courseBannerAds } = useUser();
  const { isInLibrary, addToLibraryCache } = useLibrary(user?.$id);
  const isSaved = course ? isInLibrary(course.id) : false;

  let priceAmount = 0;
  try {
    if (course?.price && typeof course.price === 'string' && course.price.includes('{')) {
      const parsed = JSON.parse(course.price);
      priceAmount = parsed.isFree ? 0 : (parsed.amount || 0);
    } else if (course?.price) {
      priceAmount = Number(course.price) || 0;
    }
  } catch (e) {}

  const isFree = priceAmount === 0;
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);

  const handlePay = () => {
    if (!user) { router.push('/signin'); return; }
    if (!course) return;
    const type = (priceMeta && typeof priceMeta === 'object' && priceMeta.type) ? priceMeta.type : 'one-time';
    router.push(`/subscribe/usbscribe-to-contributor/checkout?courses=${encodeURIComponent(course.id)}&type=${encodeURIComponent(type)}`);
  };

  const handleAddToLibrary = async () => {
    if (!user) { router.push('/signin'); return; }
    if (!course) return;
    setIsAddingToLibrary(true);
    try {
      await addCourseToLibrary(user.$id, [course.id], 'one-time');
      addToLibraryCache(course.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingToLibrary(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    if (course) {
      const downloaded = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
      if (downloaded.includes(course.id)) {
        setIsDownloaded(true);
      }
    }
  }, [course]);

  const handleDownload = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }
    if (!(user as any).isPremium) {
      router.push('/premium');
      return;
    }
    if (!isFree && !hasAccess && !isOwner) {
      alert("Please pay for this course first before downloading.");
      return;
    }
    if (!course) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const { posts } = await fetchAllPosts(course.id);
      const docs = await fetchDocuments(course.id);
      
      localStorage.setItem(`downloaded_course_${course.id}`, JSON.stringify(course));
      localStorage.setItem(`downloaded_posts_${course.id}`, JSON.stringify(posts));
      localStorage.setItem(`downloaded_docs_${course.id}`, JSON.stringify(docs));

      const imagesToCache = posts.flatMap((p: any) => p.images).filter(Boolean);
      if (imagesToCache.length === 0) {
        setIsDownloaded(true);
        const downloadedCourses = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
        if (!downloadedCourses.includes(course.id)) {
          downloadedCourses.push(course.id);
          localStorage.setItem('downloaded_courses', JSON.stringify(downloadedCourses));
        }
        return;
      }
      
      const cache = await caches.open('course-downloads');
      let downloadedCount = 0;
      for (const url of imagesToCache) {
        if (url) {
          try {
            const hasCache = await cache.match(url);
            if (!hasCache) {
               await cache.add(url);
            }
          } catch(e) {}
        }
        downloadedCount++;
        setDownloadProgress(Math.round((downloadedCount / imagesToCache.length) * 100));
      }
      setIsDownloaded(true);
      const downloadedCourses = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
      if (!downloadedCourses.includes(course.id)) {
        downloadedCourses.push(course.id);
        localStorage.setItem('downloaded_courses', JSON.stringify(downloadedCourses));
      }
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(0), 1000);
    }
  };

  const handleRemoveDownload = async () => {
    if (!course) return;
    // Remove from downloaded_courses list
    const downloaded = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
    const updated = downloaded.filter((id: string) => id !== course.id);
    localStorage.setItem('downloaded_courses', JSON.stringify(updated));

    // Remove cached JSON data
    localStorage.removeItem(`downloaded_course_${course.id}`);
    localStorage.removeItem(`downloaded_posts_${course.id}`);
    localStorage.removeItem(`downloaded_docs_${course.id}`);

    // Remove cached images from CacheStorage
    try {
      const cache = await caches.open('course-downloads');
      const keys = await cache.keys();
      // We can't know exactly which URLs belong to this course without re-fetching,
      // so we mark as not downloaded — the cache entries will be overwritten on next download.
    } catch (e) {}

    setIsDownloaded(false);
  };


  function pickRandom<T>(arr: T[]): T | null {
    if (!arr.length) return null;
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }


  const isActiveRef = useRef(false);

  // Engagement Tracker
  useEffect(() => {
    if (!user || !course || !course.user) return;

    const interval = setInterval(() => {
      if (isActiveRef.current) {
        fetch("/api/engagement/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId: course.id,
            contributorId: typeof course.user === 'object' ? (course.user?.$id || course.user?.id) : course.user,
            userId: user.$id,
            activeTimeMs: 90000
          })
        }).catch(console.error);
        isActiveRef.current = false;
      }
    }, 90000);

    const activityListener = () => { isActiveRef.current = true; };
    window.addEventListener("scroll", activityListener, { passive: true });
    window.addEventListener("click", activityListener, { passive: true });
    window.addEventListener("keydown", activityListener, { passive: true });
    window.addEventListener("mousemove", activityListener, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", activityListener);
      window.removeEventListener("click", activityListener);
      window.removeEventListener("keydown", activityListener);
      window.removeEventListener("mousemove", activityListener);
    };
  }, [user, course]);

  // 2-Minute Review Modal Tracker
  useEffect(() => {
    if (!user || !course) return;

    const storageKey = `asked_review_${course.id}_${user.$id}_okay`;
    if (localStorage.getItem(storageKey)) return;

    const timer = setTimeout(() => {
      setReviewModalOpen(true);
      localStorage.setItem(storageKey, "true");
    }, 80000);

    return () => clearTimeout(timer);
  }, [user, course]);


  const fetchTimeLine = async () => {
    try {
      const fetchFunc = sortOrder === "asc" ? fetchPostsAsc : fetchPosts;
      const { posts: firstPosts, lastId } = await fetchFunc(courseId, 5);
      setPosts(firstPosts);
      setCursor(lastId);
      setHasMore(firstPosts.length === 5);
    } catch (e) {
      if (isOffline) {
        const cached = localStorage.getItem(`downloaded_posts_${courseId}`);
        if (cached) {
          let parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            parsed.sort((a: any, b: any) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
            if (sortOrder === "desc") parsed.reverse();
          }
          setPosts(parsed);
        }
        setHasMore(false);
      }
    }
  }

  const fetchPDf = async () => {
    try {
      const fetchFunc = fetchPostsAsc;
      const { posts, lastId } = await fetchFunc(courseId, 10);
      setPdfImages(posts.flatMap(p => p.images).filter(Boolean));
      setPdfCursor(lastId);
      setHasMorePdf(posts.length === 10);
    } catch (e) {
      if (isOffline) {
        const cached = localStorage.getItem(`downloaded_posts_${courseId}`);
        if (cached) {
          let parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            parsed.sort((a: any, b: any) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
          }
          setPdfImages(parsed.flatMap((p: any) => p.images).filter(Boolean));
        }
        setHasMorePdf(false);
      }
    }
  }

  const loadMoreReviews = async () => {
    if (!hasMoreReviews || loadingReviews) return;

    setLoadingReviews(true);

    try {
      const res = await fetchReviews(courseId, 5, reviewCursor);

      setReviews((prev) => [...prev, ...res.reviews]);
      setReviewCursor(res.nextCursor);
      setHasMoreReviews(res.hasMore);
    } catch (error) {
      console.error("LOAD REVIEWS ERROR:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    // Reviews are not cached locally, so skip this fetch when offline
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const loadInitialReviews = async () => {
      setLoadingReviews(true);

      try {
        const res = await fetchReviews(courseId, 5);
        setReviews(res.reviews);
        setReviewCursor(res.nextCursor);
        setHasMoreReviews(res.hasMore);
      } catch (error) {
        console.error("FETCH REVIEWS ERROR:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadInitialReviews();
  }, [courseId]);


  useEffect(() => {
    if (!courseId) return;

    // Don't attempt to fetch documents while offline — load from cache instead
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const cached = localStorage.getItem(`downloaded_docs_${courseId}`);
      if (cached) {
        try { setDocuments(JSON.parse(cached)); } catch {}
      }
      setLoadingDocs(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchLoop = async (showLoading: boolean) => {
      if (showLoading && isMounted) setLoadingDocs(true);
      try {
        const docs = await fetchDocuments(courseId);
        if (isMounted) {
          setDocuments(docs);
          // If any document is pending, we poll quickly. Otherwise, slow poll to keep list fresh.
          const hasPending = docs.some(d => d.status === 'pending');
          timeoutId = setTimeout(() => fetchLoop(false), hasPending ? 3000 : 15000);
        }
      } catch (err) {
        console.error(err);
        if (typeof window !== "undefined" && !navigator.onLine) {
           const cached = localStorage.getItem(`downloaded_docs_${courseId}`);
           if (cached && isMounted) {
             setDocuments(JSON.parse(cached));
           }
        } else if (isMounted) {
          timeoutId = setTimeout(() => fetchLoop(false), 15000);
        }
      } finally {
        if (showLoading && isMounted) setLoadingDocs(false);
      }
    };

    fetchLoop(true);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [courseId]);

  useEffect(() => {
    // Only record a visit when online
    if (user && course && user.$id !== course.user && navigator.onLine) {
      recordCourseVisit(courseId, user.$id).catch(console.error);
    }
  }, [courseId, user, course]);

  useEffect(() => {
    if (loading) return;

    const init = async () => {
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;

      if (user?.isAdmin) setIsAdmin(true);

      // ─── OFFLINE PATH: load everything from localStorage cache ──────────────
      if (!online) {
        loadedOffline.current = true;
        const cachedCourse = localStorage.getItem(`downloaded_course_${courseId}`);
        if (cachedCourse) {
          const courseDoc = JSON.parse(cachedCourse);
          setCourse(courseDoc);

          if (courseDoc.analytics) {
            const data = courseDoc.analytics;
            setVisitsPerDay(data.visits_per_day || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
            setTotalReach(data.reached?.length || 0);
          }

          // Grant access via downloads list
          const downloadedCourses = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
          if (downloadedCourses.includes(courseDoc.id)) {
            setHasAccess(true);
            setAccessTag("owned");
          }

          // Load cached posts for timeline/pdf
          const cachedPosts = localStorage.getItem(`downloaded_posts_${courseId}`);
          if (cachedPosts) {
            let posts = JSON.parse(cachedPosts);
            if (posts && posts.length > 0) {
              posts.sort((a: any, b: any) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
            }
            setPosts(posts);
            setPdfImages(posts.flatMap((p: any) => p.images).filter(Boolean));
          }

          const defaultView: ViewMode = courseDoc.isOnGoing ? "timeline" : "pdf";
          setViewMode(defaultView);
        }

        setLoading(false);
        return;
      }

      // ─── ONLINE PATH: normal full fetch ─────────────────────────────────────
      if (courseBannerAds.length > 0) {
        const value = showAdCourse()
        setBannerAdOpen(value)
        setCurrentBanner(pickRandom(courseBannerAds))
      }

      const { searchAds, topAds, middleAds } = await fetchSmallAds()

      setTopAds(topAds);

      if (user) {
        updateUser({
          userId: user.$id,
          lastTime: new Date()
        })
      }


      let courseDoc: any = null;
      try {
        courseDoc = await fetchCourseById(courseId);
      } catch (err) {
        const cached = localStorage.getItem(`downloaded_course_${courseId}`);
        if (cached) courseDoc = JSON.parse(cached);
      }
      if (!courseDoc) return;
      setCourse(courseDoc);

      if (user) {
        fetchRelatedCourse(user).then((courses) => {
          setSuggestedCourses(courses);
        }).catch((err) => {
          console.error("Failed to fetch suggested courses:", err);
        });
      }

      // TEMP: Sync pageCount logic (to be removed later)
      try {
        const { posts } = await fetchAllPosts(courseId);
        const totalImages = posts.reduce((acc, p) => acc + (p.images?.length || 0), 0);
        if (totalImages !== courseDoc.pageCount) {
          await editCourse(courseId, { pageCount: totalImages });
          setCourse(prev => prev ? { ...prev, pageCount: totalImages } : null);
        }
      } catch (err) {
        console.error("PAGE COUNT SYNC ERROR:", err);
      }

      if (courseDoc.user === user?.$id) setActiveTab("controls");

      // ===== COURSE LOCKING LOGIC =====
      try {
        let library: any = null;

        if (user) {
          try {
            const res = (await fetchLibrary(user.$id)).wallet;
            library = res;
          } catch (e) {
            // Ignore offline errors for library fetch
          }

          // TEMP fallback (so app doesn't crash if not implemented yet)
          if (!library) {
            library = null;
          }

        }

        let localHasAccess = true;
        let localTag: "free" | "paid" | "owned" | "subscribed" | null = null;


        let parsedPrice: any = null;
        let isFree = false;

        if (!courseDoc.price) {
          isFree = true;
          parsedPrice = "Free";
        } else if (typeof courseDoc.price === 'string') {
          try {
            parsedPrice = JSON.parse(courseDoc.price);
            isFree = parsedPrice.isFree === true || parsedPrice.amount === 0 || !parsedPrice.amount;
          } catch (e) {
            const num = Number(courseDoc.price);
            isFree = isNaN(num) || num === 0;
            parsedPrice = courseDoc.price;
          }
        } else if (typeof courseDoc.price === 'number') {
          isFree = courseDoc.price === 0;
          parsedPrice = String(courseDoc.price);
        }

        setPriceMeta(parsedPrice);

        const courseUserId = typeof courseDoc.user === 'object' ? (courseDoc.user?.$id || courseDoc.user?.id) : courseDoc.user;
        const isOwner = courseUserId === user?.$id;

        if (isOwner) {
          localHasAccess = true;
          localTag = "owned";
        } else if (isFree) {
          localHasAccess = true;
          localTag = "free";
        } else {
          const oneTime = library?.oneTime ? (typeof library.oneTime === 'string' ? JSON.parse(library.oneTime) : library.oneTime) : [];
          const subscription = library?.subscription ? (typeof library.subscription === 'string' ? JSON.parse(library.subscription) : library.subscription) : [];

          const isOwned = oneTime.includes(courseDoc.id);
          const isInSubscriptionLibrary = subscription.includes(courseDoc.id);

          if (isOwned) {
            localHasAccess = true;
            localTag = "owned";
          } else if (isInSubscriptionLibrary) {
            // For subscription courses, dynamically validate the subscription doc
            const { checkSubscriptionAccess } = await import("@/lib/api/subscriptions");
            const isActiveSubscription = user
              ? await checkSubscriptionAccess(user.$id, courseDoc.id).catch(() => false)
              : false;

            if (isActiveSubscription) {
              localHasAccess = true;
              localTag = "subscribed";
            } else {
              // Subscription exists in library but is expired/invalid
              localHasAccess = false;
              localTag = "paid";
            }
          } else {
            localHasAccess = false;
            localTag = "paid";

          }
        }

        // Also grant access if downloaded (belt-and-suspenders for edge cases)
        const downloadedCourses = JSON.parse(localStorage.getItem('downloaded_courses') || '[]');
        if (downloadedCourses.includes(courseDoc.id)) {
          localHasAccess = true;
          localTag = "owned";
        }

        setHasAccess(localHasAccess);
        setAccessTag(localTag);
        setPriceMeta(parsedPrice);

        // ===== NOW safe to decide view =====
        const defaultView: ViewMode = courseDoc.isOnGoing ? "timeline" : "pdf";
        setViewMode(localHasAccess ? defaultView : "pdf");

        if (localHasAccess) {
          if (courseDoc.isOnGoing) {
            fetchTimeLine();
          } else {
            fetchPDf();
          }
        } else {
          // locked users always get preview via PDF mode
          fetchPDf();
        }
      } catch (err) {
        console.error("COURSE LOCK ERROR:", err);
      }

      try {
        const courseUserId = typeof courseDoc.user === 'object' ? (courseDoc.user?.$id || courseDoc.user?.id) : courseDoc.user;
        const c_response = await getMyContributor(courseUserId)
        setContributor(c_response);
        const raw = c_response?.followersIds;

        let followersIds: string[] = [];

        if (raw) {
          try {
            followersIds = JSON.parse(raw);
            if (!Array.isArray(followersIds)) followersIds = [];
          } catch {
            followersIds = [];
          }
        }

        if (user?.$id && followersIds.includes(user.$id)) {
          setFollowing(true);
        } else {
          setFollowing(false);
        }
      } catch (error) {
        setContributor(null)
      }

      // Fetch average rating
      try {
        const ratingData = await calculateCourseAverageRating(courseId);
        setAvgRating(ratingData.avgRating);
        setTotalReviews(ratingData.totalReviews);
      } catch (error) {
        console.error("Failed to fetch average rating", error);
      }

      // Set analytics data
      if (courseDoc.analytics) {
        const data = courseDoc.analytics;
        setVisitsPerDay(data.visits_per_day || { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
        setTotalReach(data.reached?.length || 0);
      }

      setLoading(false);
    };

    init();

    // When the user comes back online after loading from cache, re-run the full fetch
    const handleOnline = () => {
      if (loadedOffline.current) {
        loadedOffline.current = false;
        init();
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [courseId, courseBannerAds.length, user, loading]);

  const courseUserIdTop = typeof course?.user === 'object' ? (course.user?.$id || course.user?.id) : course?.user;
  const isOwner = user && courseUserIdTop && (courseUserIdTop === user.$id);
  useEffect(() => {
    hasIncrementedVisits.current = false;
  }, [courseId]);

  useEffect(() => {
    if (loading || lloading) return;
    if (!user?.$id || !contributor?.$id) return;
    if (isOwner || following) return;

    const hasDismissed = localStorage.getItem(`hide_follow_modal_course_${courseId}`);
    if (hasDismissed === "true") return;

    if (!hasIncrementedVisits.current) {
      hasIncrementedVisits.current = true;

      const visitsKey = `follow_modal_visits_course_${courseId}`;
      const rawVisits = localStorage.getItem(visitsKey);
      const visits = rawVisits ? parseInt(rawVisits, 10) : 0;
      const nextVisits = visits + 1;
      localStorage.setItem(visitsKey, nextVisits.toString());

      if (nextVisits % 3 === 1) {
        const timer = setTimeout(() => {
          setShowFollowSuggestion(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.$id, contributor?.$id, isOwner, following, loading, lloading, courseId]);

  const displayedDocuments = documents.filter(d => isOwner || d.status === "approved");

  const effectiveTabs: Tab[] = React.useMemo(() => {
    const tabs: Tab[] = [];
    if (isOwner) tabs.push("controls");
    tabs.push("content");
    if (!isOwner) tabs.push("review");
    return tabs;
  }, [isOwner]);


  useEffect(() => {
    if (!effectiveTabs.includes(activeTab)) {
      setActiveTab(effectiveTabs[0]);
    }
  }, [effectiveTabs]);

  const handleCreateReview = async ({
    rating,
    comment,
  }: {
    rating: number;
    comment: string;
  }) => {
    // Guard: both user and course must be present before submitting
    if (!user?.$id || !course?.id) {
      console.error("CREATE REVIEW: missing user or course ID");
      return;
    }

    try {
      setIsReviewSaving(true);
      const newReview = await createReview({
        user: user.$id,
        courses: course.id,
        rating,
        review: comment,
      });

      setReviews((prev) => [newReview, ...prev]);
      setReviewModalOpen(false);
    } catch (error) {
      console.error("CREATE REVIEW ERROR:", error);
    } finally {
      setIsReviewSaving(false);
    }
  }


  const loadMorePosts = async () => {
    if (!hasMore || loadingPosts) return;
    // Don't attempt network fetch offline
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    setLoadingPosts(true);
    const fetchFunc = sortOrder === "asc" ? fetchPostsAsc : fetchPosts;

    const { posts: newPosts, lastId } = await fetchFunc(
      courseId,
      5,
      cursor || undefined
    );

    setPosts(prev => [...prev, ...newPosts]);
    setCursor(lastId);
    setHasMore(newPosts.length === 5);

    setLoadingPosts(false);
  };

  const loadMorePdf = async () => {
    if (!hasMorePdf || loadingPdf) return;
    // Don't attempt network fetch offline
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    setLoadingPdf(true);
    const fetchFunc = fetchPostsAsc;

    const { posts, lastId } = await fetchFunc(
      courseId,
      10,
      pdfCursor || undefined
    );

    setPdfImages(prev => [
      ...prev,
      ...posts.flatMap(p => p.images),
    ]);

    setPdfCursor(lastId);
    setHasMorePdf(posts.length === 10);
    setLoadingPdf(false);
  };


  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {

        if (loading) return;


        if (viewMode === "timeline") {
          if (!user) {
            setShowNoUserModal(true)

            setTimeout(() => {
              setShowNoUserModal(false);
              router.push("/signup")
            }, 5000)
          } else {
            loadMorePosts();
          }

        } else {
          if (!user) {
            setShowNoUserModal(true)

            setTimeout(() => {
              setShowNoUserModal(false)
              router.push("/signup")
            }, 5000)
          } else {
            loadMorePdf();
          }
        }
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [course, cursor, pdfCursor, loadingPosts, loadingPdf, loading]);

  const handleFollow = async () => {
    if (!contributor) return;


    try {
      setFollow(true);

      if (!user) {
        router.push("/signin")
        setFollow(false);
        return;
      }

      const res = await toggleFollowContributor(
        user.$id,
        contributor.$id
      );

      if (!res) return;

      // optimistic UI toggle
      setFollowing((prev) => !prev);

      setContributor((prev: any) => {
        if (!prev) return prev;

        const current = prev.followers || 0;

        return {
          ...prev,
          followers: following ? current - 1 : current + 1,
        };
      });
    } catch (error) {
      console.error("FOLLOW ERROR:", error);
    } finally {
      setFollow(false);
    }
  };

  const handleSaveEdit = async (data: { description: string; images: string[] }) => {
    if (!activePost) return;

    try {
      setSavingEdit(true);

      await editPost(activePost.id, {
        description: data.description,
        images: data.images,
      });

      const diff = (data.images || []).length - (activePost.images || []).length;

      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePost.id
            ? { ...p, description: data.description, images: data.images }
            : p
        )
      );

      if (diff !== 0) {
        setCourse((prev) =>
          prev ? { ...prev, pageCount: Math.max(0, (prev.pageCount || 0) + diff) } : null
        );
      }

      setShowEdit(false);
    } finally {
      setSavingEdit(false);
    }
  };

  if (lloading || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black animate-pulse">
        {/* Banner Skeleton */}
        <div className="w-full h-64 md:h-80 bg-gray-200 dark:bg-gray-900"></div>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 w-full">
              {/* Title & Meta Skeleton */}
              <div className="h-4 bg-gray-200 dark:bg-gray-900 rounded w-32 mb-4"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-900 rounded w-3/4 mb-4"></div>
              <div className="flex gap-2 mb-8">
                <div className="h-8 bg-gray-200 dark:bg-gray-900 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-900 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-900 rounded-full w-20"></div>
              </div>

              {/* Contributor Skeleton */}
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-900"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-900 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-900 rounded w-32"></div>
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="flex gap-6 border-b border-gray-200 dark:border-gray-900 pb-2 mb-6">
                <div className="h-5 bg-gray-200 dark:bg-gray-900 rounded w-20"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-900 rounded w-20"></div>
              </div>

              {/* Content Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 bg-gray-200 dark:bg-gray-900 rounded-3xl"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-900 rounded-3xl"></div>
              </div>
            </div>

            {/* Desktop Reviews Skeleton */}
            <div className="hidden lg:block w-[350px] shrink-0">
              <div className="h-[400px] bg-gray-200 dark:bg-gray-900 rounded-3xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white font-sans pb-10">

      {/* Full-bleed Thumbnail Banner */}
      <div className="relative w-full h-48 md:h-64 bg-gray-100 dark:bg-gray-900">
        <img
          src={course?.thumbnailUrl}
          alt={course?.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay blending into background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black to-transparent"></div>

        {/* Floating Action Buttons over Image */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
          <button
            onClick={handleShare}
            className="p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <Share2 size={20} />
          </button>
          {isOwner && (
            <button
              onClick={() => setIsCourseDeleteOpen(true)}
              className="p-2.5 bg-black/40 hover:bg-black/60 text-red-400 rounded-full transition-colors backdrop-blur-md"
              title="Delete Course"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-2">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 w-full max-w-full overflow-hidden">


            {/* Header Section */}
            <div className="mb-8 mt-4 md:mt-6">
              <div className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">
                <span className="text-gray-900 dark:text-white dark:text-gray-900 dark:text-white">{course?.code}</span> • {course?.session || "2023/2024"}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                {course?.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300">
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  {course?.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  Level {String(course?.level)}
                </span>

                {/* Price Badge */}
                {!isFree && !isOwner && !isSaved && !accessTag?.includes("subscribed") ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                    NGN {priceAmount.toLocaleString()}
                  </span>
                ) : null}

                {isFree && (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                    Free
                  </span>
                )}
                {isSaved && !isOwner && (
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs">
                    Saved
                  </span>
                )}
                {isOwner && (
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-xs">
                    Owned
                  </span>
                )}
                {accessTag === "subscribed" && (
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white dark:bg-gray-900/40 dark:text-gray-700 dark:text-gray-300">
                    Subscribed
                  </span>
                )}

                {(isOwner || isSaved || accessTag === "subscribed") && (
                  isDownloaded ? (
                    <button
                      onClick={handleRemoveDownload}
                      className="ml-auto px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                    >
                      <Trash2 className="text-red-500 w-4 h-4" />
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">Remove from Downloads</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="ml-auto px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                      {isDownloading ? (
                        <>
                          <div className="relative w-4 h-4">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                className="text-gray-300 dark:text-gray-600"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="text-blue-500"
                                strokeDasharray={`${downloadProgress}, 100`}
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            Saving... {downloadProgress}%
                          </span>
                        </>
                      ) : (
                        <>
                          <Download className="text-gray-500 w-4 h-4" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Save for Offline</span>
                        </>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {!isOwner && (
              <div className="flex items-center gap-4 mb-8">
                {/* Avatar */}
                <button className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0" onClick={() => router.push(`/contributor/account/${contributor?.$id}`)}>
                  <img
                    src={contributor?.profileImage}
                    alt={contributor?.username}
                    className="w-full h-full object-cover"
                  />
                </button>

                {/* Info + Follow */}
                <div className="flex items-start justify-start flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <Link className="font-bold text-gray-900 dark:text-white text-sm md:text-base" href={`/contributor/account/${contributor?.$id}`}>
                      {contributor?.username || "unknown"}
                    </Link>
                    <button
                      className={`text-sm font-bold ${following
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white"
                        }`}
                      onClick={handleFollow}
                      disabled={follow}
                    >
                      {follow ? "..." : following ? "Following" : "Follow"}
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {course?.university || "University unavailable"}
                  </span>
                </div>
              </div>
            )}

            {/* Meta row */}
            {/*

        <NativeBanner />
*/}


            {/* Tabs */}
            <div className="mb-2 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
              <div className="flex gap-8 min-w-max">
                {isOwner && !isOffline && (
                  <button
                    onClick={() => setActiveTab("controls")}
                    className={`pb-3 font-semibold text-sm transition-colors border-b-4 ${activeTab === "controls"
                        ? "border-black dark:border-white text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                  >
                    Controls
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("content")}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-4 ${activeTab === "content"
                      ? "border-black dark:border-white text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                >
                  Content
                </button>

                {!isOwner && !isOffline && (
                  <button
                    onClick={() => setActiveTab("review")}
                    className={`lg:hidden pb-3 font-semibold text-sm transition-colors border-b-4 ${activeTab === "review"
                        ? "border-black dark:border-white text-gray-900 dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                  >
                    Reviews ({totalReviews})
                  </button>
                )}
              </div>
            </div>

            {activeTab === "controls" && isOwner && (
              <div className="max-w-6xl mx-auto px-0 py-6 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Controls</h2>
                  <button
                    onClick={() => setShowEditCourse(true)}
                    className="flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-gray-200 dark:border-gray-800"
                  >
                    <Pencil size={16} />
                    Edit Course
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2.5 rounded-xl">
                      <Tag size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                          {isFree ? "Free" : `NGN ${priceAmount.toLocaleString()}`}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Price</span>
                      </div>
                    </div>
                  </div>

                  {/* Pages */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-gray-200 dark:bg-gray-700 dark:bg-gray-700/30 text-gray-900 dark:text-white dark:text-gray-700 dark:text-gray-300 p-2.5 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{course?.pageCount || 0}</span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Pages</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2.5 rounded-xl">
                      <Star size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{avgRating ? avgRating.toFixed(1) : "—"}</span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2.5 rounded-xl">
                      <Activity size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">{course?.isOnGoing ? "Live" : "Past"}</span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Status</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reach Analytics */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-6 text-purple-600 dark:text-purple-400">
                    <TrendingUp size={20} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Reach Analytics</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-bold text-gray-900 dark:text-white text-xl">—</span>
                      <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">Today</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-l border-r border-gray-200 dark:border-gray-800">
                      <span className="font-bold text-gray-900 dark:text-white text-xl">—</span>
                      <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">This Week</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-bold text-gray-900 dark:text-white text-xl">—</span>
                      <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mt-1">All Time</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <AnalyticsChart visitsPerDay={visitsPerDay} />
                  </div>
                </div>

                {/* Reviews Link */}
                <button
                  onClick={() => setActiveTab("review")}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-gray-900 dark:text-white" size={20} />
                    <span className="font-bold text-gray-900 dark:text-white">{totalReviews} Reviews</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </button>
              </div>
            )}

            {activeTab === "content" && (
              <div className="max-w-6xl mx-auto px-0 py-6 space-y-8">

                {(!isFree && !isSaved && !isOwner) ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => { setViewMode("pdf"); setShowOverlay("pdf"); if(pdfImages.length === 0) fetchPDf(); }}
                      className="bg-white dark:bg-black rounded-3xl p-4 md:p-6 text-left relative overflow-hidden h-28 md:h-32 flex flex-col justify-end transition hover:scale-[1.02] shadow-sm border border-gray-200 dark:border-gray-800"
                    >
                      <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-gray-100 dark:bg-gray-900 p-2 md:p-3 rounded-full">
                        <FileText className="text-gray-900 dark:text-white" size={20} />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">View Preview</h3>
                    </button>
                    <button
                      onClick={handlePay}
                      className="bg-black dark:bg-white rounded-3xl p-4 md:p-6 text-left relative overflow-hidden h-28 md:h-32 flex flex-col justify-end transition hover:scale-[1.02] shadow-sm border border-gray-800"
                    >
                      <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-white/20 dark:bg-black/20 p-2 md:p-3 rounded-full backdrop-blur-md">
                        <CreditCard className="text-white dark:text-black" size={20} />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-white dark:text-black mb-1 md:mb-2">Proceed to Payment</h3>
                      <p className="text-gray-300 dark:text-gray-600 text-xs md:text-sm font-medium">NGN {priceAmount.toLocaleString()}</p>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { setViewMode("pdf"); setShowOverlay("pdf"); if(pdfImages.length === 0) fetchPDf(); }} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-4 md:p-6 text-left relative overflow-hidden h-32 md:h-40 flex flex-col justify-end transition hover:scale-[1.02] shadow-sm">
                        <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-white dark:bg-black p-2 md:p-3 rounded-full shadow-sm">
                          <FileText className="text-gray-900 dark:text-white" size={20} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">File View</h3>
                        <p className="text-gray-500 text-xs md:text-sm font-medium hidden md:block">View structured notes</p>
                      </button>

                      <button onClick={() => { setViewMode("timeline"); setShowOverlay("timeline"); posts.length === 0 && fetchTimeLine(); }} className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-4 md:p-6 text-left relative overflow-hidden h-32 md:h-40 flex flex-col justify-end transition hover:scale-[1.02] shadow-sm">
                        <div className="absolute top-3 right-3 md:top-6 md:right-6 bg-gray-100 dark:bg-gray-900 p-2 md:p-3 rounded-full">
                          <Hexagon className="text-gray-900 dark:text-white" size={20} />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">Timeline</h3>
                        <p className="text-gray-500 text-xs md:text-sm font-medium hidden md:block">Interactive posts</p>
                      </button>
                    </div>

                    {isFree && !isSaved && !isOwner && !isDownloaded && (
                      <button
                        onClick={handleAddToLibrary}
                        disabled={isAddingToLibrary}
                        className="w-full py-4 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2 mt-2"
                      >
                        {isAddingToLibrary ? "Adding..." : "Add to Library (Free)"}
                      </button>
                    )}
                  </div>
                )}


                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About this course</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{course?.description || "No description provided."}</p>
                </div>

                {suggestedCourses.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Suggested Courses</h3>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                      {suggestedCourses.slice(0, 5).map((suggested) => (
                        <div key={suggested.id} className="min-w-[280px] max-w-[280px] snap-start shrink-0">
                          <CourseCard course={suggested} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OVERLAYS */}
            {showOverlay === "timeline" && (
              <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowOverlay(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <ChevronDown className="rotate-90" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{course?.code} - Timeline</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => handleSortChange(e.target.value as any)}
                      className="text-xs font-medium border border-gray-200 dark:border-gray-800 rounded-md p-1.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>
                <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24">

                  {(hasAccess ? posts : posts.slice(0, 1)).map(post => (
                    <div key={post.id} className="mb-5">
                      <ImageMessages
                        id={post.id}
                        images={hasAccess ? post.images : post.images.slice(0, 3)}
                        message={post.description}
                        onPress={(index) => {
                          if (user) {
                            setSelectedNoteIndex(index);
                            setModalImages(hasAccess ? post.images : post.images.slice(0, 3));
                            setIsViewerOpen(true);
                            setPostId(post.id)
                          } else {
                            router.push("/signup")
                          }
                        }}
                        onLongPress={(id) => {
                          if (!user?.isAdmin) return;
                          const found = posts.find(p => p.id === id);
                          if (!found) return;
                          setActivePost(found);
                          setShowActions(true);
                          setPostId(post.id);
                        }}
                        course_user={course?.user}
                      />

                      {(isOwner || user?.isAdmin) && (


                        <button
                          onClick={() => {
                            if (!isOwner && !user?.isAdmin) return;

                            const found = posts.find(p => p.id === post.id);
                            if (!found) return;

                            setActivePost(found);
                            setShowActions(true);
                            setPostId(post.id);
                          }}
                          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>


                      )}
                      {!hasAccess && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs bg-black/40 text-white px-2 py-1 rounded">
                            Preview
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {!hasAccess && course?.id && priceMeta && !isDownloaded && (
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          if (!user) {
                            router.push("/signup");
                            return;
                          }
                          const type = priceMeta?.type ?? "one-time";
                          router.push(
                            `/subscribe/usbscribe-to-contributor/checkout?courses=${encodeURIComponent(course.id)}&type=${encodeURIComponent(type)}`
                          );
                        }}
                        className="w-full py-3 rounded-xl text-white font-semibold"
                        style={{ backgroundColor: "#155dfc" }}
                      >
                        {priceMeta?.type === "subscription" ? "Subscribe to Course" : "Pay for Course"}
                      </button>
                    </div>
                  )}





                  {loadingPosts && (
                    <div className="flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {showOverlay === "pdf" && (
              <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowOverlay(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <ChevronDown className="rotate-90" size={24} />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{course?.code} - File View</h2>
                  </div>
                </div>
                <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lecture Notes</h3>
                    <PdfImageList
                      images={(isFree || isSaved || isOwner) ? pdfImages : pdfImages.slice(0, 3)}
                      onPress={(index) => {
                        if (user) {
                          setSelectedNoteIndex(index);
                          setModalImages((isFree || isSaved || isOwner) ? pdfImages : pdfImages.slice(0, 3) as any);
                          setIsViewerOpen(true);
                        } else {
                          router.push("/signup")
                        }
                      }}
                      topAds={topAds}
                    />
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Documents</h3>
                    <div className="relative">
                      <div className={`space-y-6 ${!(isFree || isSaved || isOwner) ? "blur-md pointer-events-none opacity-50 select-none" : ""}`}>
                        {((isFree || isSaved || isOwner) ? displayedDocuments : displayedDocuments.slice(0, 2)).map((doc) => (
                          <SwipeableDocumentItem
                            key={doc.$id}
                            doc={doc}
                            isOwner={isOwner}
                            onOpen={(d) => {
                              setSelectedDocument(d);
                              setDocumentViewerOpen(true);
                            }}
                            onDelete={(id) => {
                              setDeletingDocumentId(id);
                              setDocumentDeleteOpen(true);
                            }}
                            onRequestReview={(id) => setReviewRequestDocumentId(id)}
                          />
                        ))}
                      </div>
                      {!(isFree || isSaved || isOwner) && (
                        <div className="absolute inset-0 flex flex-col items-start justify-start pt-10 pointer-events-auto px-4 z-20">
                          <div className="bg-white dark:bg-gray-900/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-sm text-center border border-gray-200 dark:border-gray-800 mx-auto w-full">
                            <Lock className="w-12 h-12 text-gray-900 dark:text-white mx-auto mb-3 opacity-80" />
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Premium Documents</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Pay for this course to unlock full access to all structured notes and documents.</p>
                            <button
                              onClick={() => {
                                if (!user) {
                                  router.push("/signup");
                                  return;
                                }
                                const type = (priceMeta && typeof priceMeta === 'object' && priceMeta.type) ? priceMeta.type : "one-time";
                                router.push(
                                  `/subscribe/usbscribe-to-contributor/checkout?courses=${encodeURIComponent(course?.id || "")}&type=${encodeURIComponent(type)}`
                                );
                              }}
                              className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                              Pay to get full access
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {currentBanner && (
              <BannerAd
                ad={currentBanner}
                isOpen={bannerAdOpen}
                onClose={() => setBannerAdOpen(false)}
              />
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
              course_user={course?.user}
              viewMode={viewMode}
            />



            <NoUserModal
              isOpen={showNoUserModal}
              onClose={() => setShowNoUserModal(false)}
              onConfirm={() => router.push("/signup")}
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
              initialImages={activePost?.images}
              loading={savingEdit}
              onClose={() => setShowEdit(false)}
              onSave={handleSaveEdit}
            />




            {activeTab === "review" && !isOwner && (
              <div>
                {/* 4. REVIEWS */}
                <section className="bg-white dark:bg-gray-900 rounded-xl " style={{ marginTop: 40 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Reviews
                    </h2>
                    <button onClick={() => setReviewModalOpen(true)} className="text-sm text-gray-900 dark:text-white hover:underline">
                      Leave a review
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.length === 0 && !loadingReviews ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                    ) : (
                      reviews.map((review) => (
                        <ReviewItem key={review.$id} review={review} />
                      ))
                    )}
                  </div>

                  {loadingReviews && (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-blue-600" />
                    </div>
                  )}

                  {hasMoreReviews && !loadingReviews && reviews.length > 0 && (
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={loadMoreReviews}
                        className="text-sm text-gray-900 dark:text-white hover:underline"
                      >
                        See more
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )

            }

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

            {selectedDocument && (
              <DocumentViewerModal
                isOpen={documentViewerOpen}
                onClose={() => setDocumentViewerOpen(false)}
                fileUrl={selectedDocument.fileUrl}
                fileType={selectedDocument.fileType}
                fileName={selectedDocument.fileName}
              />
            )}

            <ConfirmFileDelete
              isOpen={documentDeleteOpen}
              onClose={() => setDocumentDeleteOpen(false)}
              onConfirm={async () => {
                if (deletingDocumentId) {
                  await deleteDocument(deletingDocumentId);
                  setDocuments(docs => docs.filter(d => d.$id !== deletingDocumentId));
                }
                setDocumentDeleteOpen(false);
              }}
              fileName="this document"
            />

            <DocumentReviewModal
              isOpen={!!reviewRequestDocumentId}
              onClose={() => setReviewRequestDocumentId(null)}
              onSubmit={async (complaint) => {
                if (!reviewRequestDocumentId || !course?.id || !user?.$id) return;
                await createDocumentReviewRequest({
                  documents: reviewRequestDocumentId,
                  courses: course.id,
                  contributors: user.$id,
                  complaint
                });
                alert("Review request submitted successfully!");
              }}
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
                  university: course.university,
                  lecturer: course.lecturer,
                  thumbnailId: course.thumbnailId,
                  thumbnailUrl: course.thumbnailUrl,
                  isOngoing: course.isOnGoing,
                  price: course.price,
                }}
                onUpdated={(updated) =>
                  setCourse((prev) => prev ? { ...prev, ...updated } as Course : null)
                }
              />
            )}

            <ReviewModal
              isOpen={reviewModalOpen}
              isSaving={isReviewSaving}
              onClose={() => setReviewModalOpen(false)}
              onSubmit={({ rating, comment }) => handleCreateReview({ rating, comment })}
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

            <FollowSuggestionModal
              open={showFollowSuggestion}
              onClose={(dontShowAgain) => {
                setShowFollowSuggestion(false);
                if (dontShowAgain) {
                  localStorage.setItem(`hide_follow_modal_course_${courseId}`, "true");
                }
              }}
              contributorName={contributor?.username || "Contributor"}
              onFollow={handleFollow}
              loading={follow}
            />

            {isOwner && (
              <FloatingActionButton />
            )}
          </div>

          {/* Right Column for Desktop: Reviews */}
          {!isOwner && (
            <div className="hidden lg:block w-[350px] shrink-0">
              <div className="sticky top-24">
                <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Reviews
                    </h2>
                    <button onClick={() => setReviewModalOpen(true)} className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">
                      Leave a review
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.length === 0 && !loadingReviews ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No reviews yet.</p>
                    ) : (
                      reviews.map((review) => (
                        <ReviewItem key={review.$id} review={review} />
                      ))
                    )}
                  </div>

                  {loadingReviews && (
                    <div className="flex justify-center py-4">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-blue-600" />
                    </div>
                  )}

                  {hasMoreReviews && !loadingReviews && reviews.length > 0 && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={loadMoreReviews}
                        className="text-sm font-semibold text-gray-900 dark:text-white hover:underline"
                      >
                        See more
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>


    </div>
  );
}
