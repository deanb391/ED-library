import { NextRequest, NextResponse } from "next/server";
import { deletePostService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const result = await deletePostService(postId);

  return NextResponse.json(result);
}
