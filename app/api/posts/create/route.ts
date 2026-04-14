// app/api/posts/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  createPostService,
  updateCourseService,
} from "@/lib/services/course.service";

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

  return NextResponse.json(post);
}