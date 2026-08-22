// app/api/posts/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchAllPostsService } from "@/lib/services/course.service";
import { Query } from "appwrite";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const queries: any[] = [
    Query.equal("courses", courseId),
    Query.orderDesc("$createdAt"),
    Query.limit(500),
  ];


  const res = await fetchAllPostsService(courseId, queries);

  return NextResponse.json(res);
}