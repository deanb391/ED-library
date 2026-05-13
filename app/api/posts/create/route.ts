// app/api/posts/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  createPostService,
  updateCourseService,
  fetchCourseByIdService,
} from "@/lib/services/course.service";
import { trackAnalyticsEvent } from "@/lib/analytics/services/analytics.service";

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

  // Resolve the course owner so we have a proper userId for the tracker
  fetchCourseByIdService(courseId)
    .then((course) => {
      trackAnalyticsEvent(
        {
          eventName: "COURSE_ASSET_UPLOADED",
          distinctId: course.user ?? "unknown",
          userId: course.user ?? undefined,
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
      );
    })
    .catch((err) => console.error("[Analytics] upload tracking failed:", err));

  return NextResponse.json(post);
}