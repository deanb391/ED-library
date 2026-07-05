// app/api/posts/list/route.ts

import { NextRequest, NextResponse } from "next/server";
import { fetchPostsService } from "@/lib/services/course.service";
import { Query } from "appwrite";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const courseId = searchParams.get("courseId");
  const cursor = searchParams.get("cursor");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const order = searchParams.get("order") || "desc";

  const queries: any[] = [
    Query.equal("courses", courseId),
    order === "asc" ? Query.orderAsc("$createdAt") : Query.orderDesc("$createdAt"),
    Query.limit(order === "asc" ? 10 : 5),
  ];

  if (cursor) queries.push(Query.cursorAfter(cursor));

  const res = await fetchPostsService(queries);

  return NextResponse.json(res);
}