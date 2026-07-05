import { NextRequest, NextResponse } from "next/server";
import { deleteFileFromPostService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { postId, fileUrl } = await req.json();

  if (!postId || !fileUrl) {
    return NextResponse.json({ error: "postId and fileUrl are required" }, { status: 400 });
  }

  const result = await deleteFileFromPostService(postId, fileUrl);

  return NextResponse.json({ success: result });
}
