import { NextRequest, NextResponse } from "next/server";
import { createCourseService } from "@/lib/services/course.service";
import { trackAnalyticsEvent } from "@/lib/analytics/services/analytics.service";
import { getContributorByUserIdService } from "@/lib/services/contributors.service";
import { notifyFollowersOfCourse } from "@/lib/services/follower-notifications.service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.title || !body.code || !body.university) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payload = {
    ...body
  };

  const course = await createCourseService(payload);

  // Track course creation — fire-and-forget so it never blocks the response
  trackAnalyticsEvent(
    {
      eventName: "COURSE_CREATED",
      distinctId: body.user ?? "unknown",
      userId: body.user ?? undefined,
      metadata: {
        courseId: course.$id,
        title: body.title,
        department: body.department ?? null,
        university: body.university,
      },
    },
    [
      { metric: "DAILY_COURSES_CREATED" },
      { metric: "TOTAL_COURSES" },
      ...(body.department
        ? [{ metric: "DAILY_COURSES_BY_DEPT", dimension: body.department }]
        : []),
    ]
  ).catch((err) => console.error("[Analytics] course creation tracking failed:", err));

  // Notify followers of new course creation (fire-and-forget)
  if (body.user) {
    getContributorByUserIdService(body.user)
      .then((contributor) => {
        if (contributor) {
          notifyFollowersOfCourse(contributor.$id, course.title || "Course", course.description || "")
            .catch((err) => console.error("[Followers Notification] failed for course:", err));
        }
      })
      .catch((err) => console.error("[Followers Notification] failed to fetch contributor:", err));
  }

  return NextResponse.json(course);
}