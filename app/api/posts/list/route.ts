import { NextRequest, NextResponse } from "next/server";
import { fetchPostsService } from "@/lib/services/course.service";
import { Query } from "appwrite";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const courseId = searchParams.get("courseId");
  const cursor = searchParams.get("cursor");
  const limitStr = searchParams.get("limit");

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const order = searchParams.get("order") || "desc";
  const limit = limitStr ? parseInt(limitStr, 10) : (order === "asc" ? 10 : 5);

  const queries: any[] = [
    Query.equal("courses", courseId),
    order === "asc" ? Query.orderAsc("$createdAt") : Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) queries.push(Query.cursorAfter(cursor));

  const res = await fetchPostsService(courseId, queries);

  return NextResponse.json(res);
}