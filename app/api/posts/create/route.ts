// app/api/posts/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  createPostService,
  updateCourseService,
  fetchCourseByIdService,
} from "@/lib/services/course.service";
import { trackAnalyticsEvent } from "@/lib/analytics/services/analytics.service";
import { recordUploadStreak } from "@/lib/services/streak.service";
import { incrementUploadCount } from "@/lib/services/leaderboard.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";

export async function POST(req: NextRequest) {
  const { courseId, images, description } = await req.json();

  const post = await createPostService({
    courses: courseId,
    images,
    description,
  });

  await updateCourseService(courseId, {
    lastOperation: "Now",
  });

  let streakData = null;

  try {
    const course = await fetchCourseByIdService(courseId);
    const userId = course.user ?? "unknown";

    // Analytics tracking (fire-and-forget)
    trackAnalyticsEvent(
      {
        eventName: "COURSE_ASSET_UPLOADED",
        distinctId: userId,
        userId: userId !== "unknown" ? userId : undefined,
        metadata: {
          postId: post.$id,
          courseId,
          imageCount: Array.isArray(images) ? images.length : 1,
        },
      },
      [
        { metric: "DAILY_UPLOADS", amount: Array.isArray(images) ? images.length : 1 },
        { metric: "TOTAL_UPLOADS",  amount: Array.isArray(images) ? images.length : 1 },
      ]
    ).catch(err => console.error("[Analytics] upload tracking failed:", err));

    // Streak & Leaderboard tracking
    if (userId !== "unknown") {
      const contributor = await getContributorByUserIdService(userId);
      if (contributor) {
        const uploadAmount = Array.isArray(images) ? images.length : 1;

        // Record streak (await this so we can return it)
        streakData = await recordUploadStreak(
          contributor.$id,
          userId,
          contributor.$createdAt?.slice(0, 10) || ""
        );

        // Increment leaderboard count (fire-and-forget)
        incrementUploadCount(contributor.$id, uploadAmount)
          .catch((err) => console.error("[Leaderboard] tracking failed:", err));
      }
    }
  } catch (err) {
    console.error("[Rewards/Analytics] processing failed:", err);
  }

  return NextResponse.json({ ...post, streakData });
}