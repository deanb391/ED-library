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
  Hexagon,
  Share2
} from 'lucide-react';
import NoteViewerModal from '@/components/NoteViewerModal';
import { useParams } from 'next/navigation';
import { Course, deleteCourse, deleteFileFromPost, deletePost, editCourse, editPost, fetchAllPosts, fetchCourseById, fetchPosts, fetchPostsAsc, recordCourseVisit } from '@/lib/api/courses';
import Image from 'next/image';
import { getCurrentUser, updateUser } from '@/lib/appwrite';
import ConfirmCourseDelete from '@/components/ConfirmCourseDelete';
import { useRouter } from 'next/navigation';
import ConfirmFileDelete from '@/components/ConfirmFileDelete';
import ImageMessages from '@/components/ImageMessage';
import { useUser } from '@/context/UserContext';
import EditPostModal from '@/components/EditPostModal';
import PostActionModal from '@/components/PostActionModal';
import ConfirmPostDelete from '@/components/ConfirmPostDelete';
import EditCourseModal from '@/components/EditCourseModal';
import PdfImageList from "@/components/PdfImageList"
import NativeBanner from '@/components/ads/NativeBanner';
import RectangularAd from '@/components/RectangularAd';
import { fetchSmallAds } from '@/lib/ads';
import BannerAd from '@/components/BannerAd';
import NoUserModal from '@/components/NoUserModal';
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
import { fetchLibrary } from '@/lib/api/library';

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
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
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
      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" >
        <img
          src={user?.image || user?.avatar}
          alt={user?.username}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{user.username}</p>
          <span className="text-xs text-gray-500">{createdAt}</span>
        </div>

        {/* Rating */}
        <div className="text-sm text-yellow-500 mt-1" style={{ color: "gold" }}>{stars}</div>

        {/* Comment */}
        <p className="text-sm text-gray-600 mt-1">{review.review}</p>
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
  const [bannerAdOpen, setBannerAdOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<AdItem | null>(null);
  const [showNoUserModal, setShowNoUserModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewCursor, setReviewCursor] = useState<string | undefined>(undefined);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  type Tab = "lecture" | "information" | "review";
  const [activeTab, setActiveTab] = useState<Tab>('lecture')
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [visitsPerDay, setVisitsPerDay] = useState({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
  const [totalReach, setTotalReach] = useState(0);
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [follow, setFollow] = useState(false);
  const [following, setFollowing] = useState(false);

  const [hasAccess, setHasAccess] = useState<boolean>(true);
  const [accessTag, setAccessTag] = useState<"free" | "paid" | "owned" | "subscribed" | null>(null);
  const [priceMeta, setPriceMeta] = useState<any>(null);

  function pickRandom<T>(arr: T[]): T | null {
    if (!arr.length) return null;
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }




  const router = useRouter();
  const { user, loading, showAdCourse, courseBannerAds } = useUser()

  const fetchTimeLine = async () => {
    const { posts: firstPosts, lastId } = await fetchPosts(courseId);
    setPosts(firstPosts);
    setCursor(lastId);
    setHasMore(firstPosts.length === 5);
  }

  const fetchPDf = async () => {
    const { posts, lastId } = await fetchPostsAsc(courseId, "10");
    setPdfImages(posts.flatMap(p => p.images));
    setPdfCursor(lastId);
    setHasMorePdf(posts.length === 10);
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
    if (user && course && user.$id !== course.user) {
      // Record visit only once
      recordCourseVisit(courseId, user.$id).catch(console.error);
    }
  }, [courseId, user, course]);

  useEffect(() => {
    if (loading) return;

    const init = async () => {
      if (user?.isAdmin) setIsAdmin(true);

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


      const courseDoc = await fetchCourseById(courseId);
      setCourse(courseDoc);

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

      if (courseDoc.user === user?.$id) setActiveTab("information");

      // ===== COURSE LOCKING LOGIC =====
      try {
        let library: any = null;

        if (user) {
          const res = (await fetchLibrary(user.$id)).wallet;
          library = res;

          // TEMP fallback (so app doesn’t crash if not implemented yet)
          if (!library) {
            library = null;
          }

        }

        let localHasAccess = true;
        let localTag: "free" | "paid" | "owned" | "subscribed" | null = null;


        let parsedPrice: any = null;

        try {
          parsedPrice = JSON.parse(courseDoc.price || "{}");
        } catch {
          parsedPrice = null;
        }

        setPriceMeta(parsedPrice);

        const isFree = parsedPrice?.isFree === true;
        const isOwner = courseDoc.user === user?.$id;

        if (isOwner) {
          localHasAccess = true;
          localTag = "owned";
        } else if (isFree) {
          localHasAccess = true;
          localTag = "free";
        } else {
          const oneTime = library?.oneTime ? JSON.parse(library.oneTime) : [];
          const subscription = library?.subscription ? JSON.parse(library.subscription) : [];

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
        const c_response = await getMyContributor(courseDoc?.user)
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
  }, [courseId, courseBannerAds.length, user, loading]);

  const isOwner = course?.user === user?.$id;

  const effectiveTabs: Tab[] = React.useMemo(() => {
    if (isOwner) return ["information", "lecture"];
    return ["lecture", "review"];
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

  const loadMorePdf = async () => {
    if (!hasMorePdf || loadingPdf) return;

    setLoadingPdf(true);

    const { posts, lastId } = await fetchPostsAsc(
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
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
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

            <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-gray-600 ml-0 mt-3">
              <span className="px-2 py-0.5 rounded-full bg-gray-100">
                {course?.department}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100">
                {course?.university || "University unavailable"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Level {String(course?.level)}
              </span>
            </div>

            {accessTag && (
              <div className="flex gap-2 mt-3 text-xs font-medium">
                {accessTag === "free" && (
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700" style={{ backgroundColor: "green", paddingTop: 5, paddingBottom: 5, color: 'white' }}>
                    Free
                  </span>
                )}

                {accessTag === "paid" && (
                  <>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700" style={{ backgroundColor: "#fb2c36", paddingTop: 5, paddingBottom: 5, color: 'white' }}>
                      Paid ({priceMeta?.type})
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100" style={{ backgroundColor: "#f3f4f6", paddingTop: 5, paddingBottom: 5, }}>
                      {priceMeta?.currency} {(priceMeta.type === "one-time" ? (Number(course?.pageCount) * priceMeta?.amount) : priceMeta.amount)}
                    </span>

                  </>
                )}

                {accessTag === "owned" && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700" style={{ backgroundColor: "green", paddingTop: 5, paddingBottom: 5, color: 'white' }}>
                    Owned
                  </span>
                )}

                {accessTag === "subscribed" && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700" style={{ backgroundColor: "green", paddingTop: 5, paddingBottom: 5, color: 'white' }}>
                    Subscribed
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200 flex items-center justify-center">
              <Share2 size={18} />
            </button>
            {isOwner && (
              <>
                <button
                  onClick={() => setShowEditCourse(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Pencil size={16} />
                  Edit Course
                </button>
                <button
                  onClick={(e) => { setIsCourseDeleteOpen(true) }}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors border border-red-100">
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {
          !isOwner && (
            <div className="flex items-center gap-3 mb-3">

              {/* Avatar */}
              <button className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden" onClick={() => router.push(`/contributor/account/${contributor?.$id}`)}>
                <img
                  src={contributor?.profileImage}
                  alt={contributor?.username}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Username + Follow */}
              <div className="flex items-center gap-2 text-sm">

                <Link className="font-semibold text-gray-900" href={`/contributor/account/${contributor?.$id}`}>
                  {contributor?.username || "unknown"}
                </Link>

                <span className="text-gray-300">•</span>

                <button
                  className={`font-semibold flex items-center gap-2 ${following
                    ? "text-gray-500"
                    : "text-blue-600 hover:underline"
                    }`}
                  onClick={handleFollow}
                  disabled={follow}
                >
                  {follow ? (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid currentColor",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : null}

                  {following ? "Following" : "Follow"}
                </button>

              </div>
            </div>
          )
        }

        {/* Meta row */}
        {/*

        <NativeBanner />
*/}


        {/* Tabs */}
        <div className=" mb-2 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {
              isOwner && (
                <button
                  onClick={() => setActiveTab("information")}
                  className="pb-2 font-semibold text-sm" style={{ borderBottomWidth: activeTab === "information" ? 4 : 0, borderBottomColor: activeTab === "information" ? "#155dfc" : "", color: activeTab === "information" ? "#155dfc" : "#6a7282" }}>
                  Information
                </button>
              )
            }

            <button
              onClick={() => setActiveTab('lecture')}
              className="pb-2 font-semibold text-sm" style={{ borderBottomWidth: activeTab === "lecture" ? 4 : 0, borderBottomColor: activeTab === "lecture" ? "#155dfc" : "", color: activeTab === "lecture" ? "#155dfc" : "#6a7282" }}>
              Lecture Notes
            </button>

            {
              !isOwner && (
                <button
                  onClick={() => setActiveTab('review')}
                  className="pb-2   font-semibold text-sm" style={{ borderBottomWidth: activeTab === "review" ? 4 : 0, borderBottomColor: activeTab === "review" ? "#155dfc" : "", color: activeTab === "review" ? "#155dfc" : "#6a7282" }}>
                  Reviews
                </button>
              )
            }

          </div>
        </div>

        {
          activeTab === "information" && isOwner && (
            <div className="max-w-6xl mx-auto px-0 py-6 space-y-6">

              {/* 1. REVIEW STATUS */}
              {/* <section className="bg-yellow-50 border border-yellow-200 rounded-xl p-4" style={{borderWidth: 0.1}}>
    <h2 className="text-sm font-semibold text-yellow-800">
      Course Under Review
    </h2>
    <p className="text-sm text-yellow-700 mt-1">
      This course is currently under review. Reviews typically take between 24 to 72 hours.
      You will be notified once the course becomes active.
    </p>
  </section> */}

              {/* 2. COURSE META */}
              <section className="bg-white rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition mb-6 relative">

                {/* EDIT BUTTON */}
                <button className="absolute top-4 right-4 text-xs md:text-sm px-3 py-1.5 rounded-md bg-blue-600 hover:bg-gray-200 transition text-white">
                  Edit
                </button>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">

                  {/* Thumbnail */}
                  <div className="w-full md:w-40 h-48 md:h-40 rounded-lg overflow-hidden bg-gray-100 shrink-0" style={{ width: 200 }}>
                    <img
                      src={course?.thumbnailUrl}
                      alt={course?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">

                    {/* Top */}
                    <div>
                      <h1 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug pr-16">
                        {course?.title}
                      </h1>

                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {course?.code} • {course?.department} • Level {course?.level.toString()}
                      </p>

                      <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                        {course?.description}
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                      {/* Meta tags */}
                      <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-600">
                        {course?.lecturer && (
                          <span className="bg-gray-100 px-2 py-1 rounded-md">
                            {course.lecturer}
                          </span>
                        )}
                        {course?.university && (
                          <span className="bg-gray-100 px-2 py-1 rounded-md">
                            {course.university}
                          </span>
                        )}
                        <span className="bg-gray-100 px-2 py-1 rounded-md">
                          {course?.session}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded-md">
                          {course?.isOnGoing ? "Ongoing" : "Past"}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Pricing:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {JSON.parse(course?.price || "")?.isFree || `${JSON.parse(course?.price || "")?.currency} ${JSON.parse(course?.price || "")?.amount}`} {JSON.parse(course?.price || "")?.type === "one-time" ? "per page" : "per month"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({JSON.parse(course?.price || "")?.type})
                        </span>
                      </div>

                    </div>

                  </div>
                </div>
              </section>

              {/* 3. ANALYTICS */}
              <section className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md" style={{}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Analytics
                  </h2>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Stat label="Avg Rating" value={`${avgRating.toFixed(1)} ⭐`} />
                  <Stat label="Reviews" value={totalReviews.toString()} />
                  <Stat label="Avg Daily Visits" value={Math.round(
                    Object.values(visitsPerDay).reduce((a, b) => a + b, 0) / 7
                  ).toString()} />
                  <Stat label="Total Reach" value={totalReach.toString()} />
                </div>
                <div style={{ marginTop: 50 }}>
                  <AnalyticsChart visitsPerDay={visitsPerDay} />
                </div>

              </section>

              {/* 4. REVIEWS */}
              <section className="bg-white rounded-xl " style={{ marginTop: 40 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Reviews
                  </h2>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    See all
                  </a>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 && !loadingReviews ? (
                    <p className="text-sm text-gray-500">No reviews yet.</p>
                  ) : (
                    reviews.map((review) => (
                      <ReviewItem key={review.$id} review={review} />
                    ))
                  )}
                </div>

                {loadingReviews && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                )}

                {hasMoreReviews && !loadingReviews && reviews.length > 0 && (
                  <div className="flex justify-center mt-3">
                    <button
                      onClick={loadMoreReviews}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      See more
                    </button>
                  </div>
                )}
              </section>

            </div>
          )}

        {activeTab === "lecture" && (
          <>
            <div className="flex items-center gap-2 mt-3 border-b border-gray-200 mb-8 pb-3 overflow-x-auto">
              <button
                onClick={() => {
                  if (!hasAccess) return;
                  setViewMode("timeline");
                  posts.length === 0 && fetchTimeLine()
                }}
                className={`p-2 rounded-lg border transition ${viewMode === "timeline"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                title="Timeline view"
              >
                <Hexagon size={18} />
              </button>

              <button
                onClick={() => {
                  setViewMode("pdf");
                  pdfImages.length === 0 && fetchPDf()
                }}
                className={`p-2 rounded-lg border transition ${viewMode === "pdf"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                title="PDF view"
              >
                <FileText size={18} />
              </button>
            </div>



            <RectangularAd
              ads={topAds}
              className='mb-5'
              height={130}
            />



            {viewMode === "timeline" ? (
              (hasAccess ? posts : posts.slice(0, 1)).map(post => (
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

                  {(course?.user === user?.$id || user?.isAdmin) && (


                    <button
                      onClick={() => {
                        if (!user?.isAdmin) return;

                        const found = posts.find(p => p.id === post.id);
                        if (!found) return;

                        setActivePost(found);
                        setShowActions(true);
                        setPostId(post.id);
                      }}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
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
              ))
            ) : (
              <>
                <PdfImageList
                  images={hasAccess ? pdfImages : pdfImages.slice(0, 3)}
                  onPress={(index) => {
                    if (user) {
                      setSelectedNoteIndex(index);
                      setModalImages(hasAccess ? pdfImages : pdfImages.slice(0, 3));
                      setIsViewerOpen(true);
                    } else {
                      router.push("/signup")
                    }
                  }}
                  topAds={topAds}
                />

                {loadingPdf && (
                  <div className="flex justify-center py-6">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  </div>
                )}
              </>
            )}

            {!hasAccess && course?.id && priceMeta && (
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
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
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




          </>
        )}

        {activeTab === "review" && !isOwner && (
          <div>
            {/* 4. REVIEWS */}
            <section className="bg-white rounded-xl " style={{ marginTop: 40 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reviews
                </h2>
                <button onClick={() => setReviewModalOpen(true)} className="text-sm text-blue-600 hover:underline">
                  Leave a review
                </button>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 && !loadingReviews ? (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <ReviewItem key={review.$id} review={review} />
                  ))
                )}
              </div>

              {loadingReviews && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                </div>
              )}

              {hasMoreReviews && !loadingReviews && reviews.length > 0 && (
                <div className="flex justify-center mt-3">
                  <button
                    onClick={loadMoreReviews}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    See more
                  </button>
                </div>
              )}
            </section>

            <ReviewModal
              isOpen={reviewModalOpen}
              isSaving={isReviewSaving}
              onClose={() => setReviewModalOpen(false)}
              onSubmit={({ rating, comment }) => handleCreateReview({ rating, comment })}
            />
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

      </main>
    </div>
  );
}