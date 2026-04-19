// app/api/courses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createCourseService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.title || !body.code || !body.university) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payload = {
    ...body
  };

  const course = await createCourseService(payload);

  return NextResponse.json(course);
}