// app/api/courses/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { addCourseToLibraryService } from "@/lib/services/library.service";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.userId || !body.courseIds || !body.type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  try {
    const list = body.courseIds
    for (const course of list) {
        await addCourseToLibraryService(
            course,
            body.userId,
            body.type
        );
    }

    return NextResponse.json({
        success: true,
        code: 201
    });
  } catch (error) {
    return NextResponse.json({
        success: false,
        code: 500
    });
  }
}