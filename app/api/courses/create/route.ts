// app/api/courses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createCourseService } from "@/lib/services/course.service";
import { trackAnalyticsEvent } from "@/lib/analytics/services/analytics.service";

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

  return NextResponse.json(course);
}