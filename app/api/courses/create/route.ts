// app/api/courses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createCourseService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.title || !body.code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const course = await createCourseService(body);

  return NextResponse.json(course);
}