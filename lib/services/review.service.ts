import prisma from "@/lib/prisma";
import { safeRedisOp } from "@/lib/redis";
import { randomUUID } from "crypto";

export type ReviewDraft = {
  courses: string;
  user: string | any;
  rating: number;
  review: string;
};

export type Review = ReviewDraft & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

export function mapReview(doc: any): Review {
  if (!doc) return null as any;
  return {
    $id: doc.id || doc.$id,
    courses: doc.courseId || doc.courses || "",
    rating: Number(doc.rating) || 0,
    review: doc.review || "",
    user: doc.userId || (typeof doc.user === 'string' ? doc.user : doc.user?.id) || "",
    $createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.$createdAt || new Date().toISOString()),
    $updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.$updatedAt || new Date().toISOString()),
  };
}

export async function createReviewService(
  draft: ReviewDraft,
): Promise<Review> {
  const id = randomUUID();
  const userId = typeof draft.user === "object" ? (draft.user?.id || draft.user?.$id) : draft.user;
  const courseId = typeof draft.courses === "object" ? (draft.courses as any)?.id || (draft.courses as any)?.$id : draft.courses;

  const doc = await prisma.courseReviewAndRating.create({
    data: {
      id,
      courseId: courseId,
      userId: userId,
      rating: draft.rating,
      review: draft.review,
    },
  });

  if (courseId && typeof courseId === "string") {
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

  const findOptions: any = {
    where: { courseId: courseId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  };

  if (cursor) {
    findOptions.cursor = { id: cursor };
    findOptions.skip = 1;
  }

  const docs = await prisma.courseReviewAndRating.findMany(findOptions);
  const reviews = docs.map(mapReview);
  const nextCursor =
    docs.length === limit
      ? docs[docs.length - 1].id
      : undefined;

  const validUserIds = [
    ...new Set(
      reviews
        .map((review) => review.user)
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    ),
  ];

  if (validUserIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: validUserIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, {
      $id: u.id,
      id: u.id,
      username: u.name,
      avatar: u.avatar || '',
      email: u.email,
    }]));

    reviews.forEach((review) => {
      if (typeof review.user !== "string") return;
      const userDoc = userMap.get(review.user);
      if (userDoc) {
        review.user = userDoc;
      }
    });
  }

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
  const docs = await prisma.courseReviewAndRating.findMany({
    where: { courseId: courseId },
  });

  const totalReviews = docs.length;
  if (totalReviews === 0) {
    return { avgRating: 0, totalReviews: 0 };
  }

  const sum = docs.reduce((acc, review) => acc + (review.rating || 0), 0);
  const avgRating = sum / totalReviews;

  return { avgRating, totalReviews };
}
