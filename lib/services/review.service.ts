import { ID, Query } from "appwrite";
import { databases, getUserById } from "@/lib/appwrite/server";
import { safeRedisOp } from "@/lib/redis";

const DATABASE_ID = "69617e75000c6c010a75";
const REVIEW_COLLECTION = "course_review_and_rating";



export type ReviewDraft = {
  courses: {};
  user: string | {};
  rating: number;
  review: string;
};

export type Review = ReviewDraft & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

function mapReview(doc: any): Review {
  return {
    $id: doc.$id,
    courses: doc.courses,
    rating: doc.rating,
    review: doc.review,
    user: doc.user,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createReviewService(
  draft: ReviewDraft,
): Promise<Review> {
  const now = new Date().toISOString();

  const payload = {
    ...draft,
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    REVIEW_COLLECTION,
    ID.unique(),
    payload
  );

  if (draft.courses && typeof draft.courses === "string") {
    const courseId = draft.courses;
    await safeRedisOp(async (client) => {
      await client.del(`reviews:${courseId}:first_page:5`);
    }, null);
  }

  return mapReview(doc);
}

export async function fetchReviewsService(
  courseId: string,
  limit = 5,
  cursor?: string
): Promise<{
  reviews: Review[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const cacheKey = `reviews:${courseId}:first_page:${limit}`;

  if (!cursor) {
    const cached = await safeRedisOp(async (client) => {
      const data = await client.get(cacheKey);
      return data ? JSON.parse(data) : null;
    }, null);

    if (cached) return cached;
  }

  const queries: any[] = [
    Query.equal("courses", courseId),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const res = await databases.listDocuments(
    DATABASE_ID,
    REVIEW_COLLECTION,
    queries
  );

  const reviews = res.documents.map(mapReview);
  const nextCursor =
    res.documents.length === limit
      ? res.documents[res.documents.length - 1].$id
      : undefined;

  // Hydrate user data — only for reviews that have a valid string user ID
  const validUserIds = [
    ...new Set(
      reviews
        .map((review) => review.user)
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    ),
  ];
  const userPromises = validUserIds.map((userId) => getUserById(userId));
  const users = await Promise.all(userPromises);
  const userMap = new Map(validUserIds.map((id, index) => [id, users[index]]));

  reviews.forEach((review) => {
    if (typeof review.user !== "string") return; // skip object/invalid stored values
    const userDoc = userMap.get(review.user);
    if (userDoc) {
      review.user = userDoc;
    }
  });

  const result = {
    reviews,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };

  if (!cursor) {
    await safeRedisOp(async (client) => {
      await client.setex(cacheKey, 3600, JSON.stringify(result));
    }, null);
  }

  return result;
}

export async function calculateCourseAverageRatingService(courseId: string): Promise<{
  avgRating: number;
  totalReviews: number;
}> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    REVIEW_COLLECTION,
    [
      Query.equal("courses", courseId),
      Query.limit(1000), // Assuming not too many reviews, adjust if needed
    ]
  );

  const reviews = res.documents.map(mapReview);
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return { avgRating: 0, totalReviews: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  const avgRating = sum / totalReviews;

  return { avgRating, totalReviews };
}
