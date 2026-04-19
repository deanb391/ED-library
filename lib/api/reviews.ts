export type {
  ReviewDraft,
  Review,
} from "@/lib/services/review.service";

import type {
  ReviewDraft,
  Review,
} from "@/lib/services/review.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createReview(
  draft: ReviewDraft,
): Promise<Review> {
  const res = await fetch("/api/review/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft }),
  });

  if (!res.ok) {
    throw new Error("Failed to create review");
  }

  const data = await res.json();
  return data.data;
}

export async function fetchReviews(
  courseId: string,
  limit = 5,
  cursor?: string
): Promise<{
  reviews: Review[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const query = new URLSearchParams({ courseId, limit: String(limit) });

  if (cursor) {
    query.append("cursor", cursor);
  }

  const res = await fetch(`/api/review/fetch?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return res.json();
}

export async function calculateCourseAverageRating(
  courseId: string
): Promise<{
  avgRating: number;
  totalReviews: number;
}> {
  const res = await fetch(`/api/review/calculate-average?courseId=${courseId}`);

  if (!res.ok) {
    throw new Error("Failed to calculate average rating");
  }

  return res.json();
}




