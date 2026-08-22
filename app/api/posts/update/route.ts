import { NextRequest, NextResponse } from "next/server";
import { updatePostService } from "@/lib/services/course.service";

export async function POST(req: NextRequest) {
  const { postId, data } = await req.json();

  if (!postId || !data) {
    return NextResponse.json({ error: "postId and data are required" }, { status: 400 });
  }

  const updated = await updatePostService(postId, data);

  return NextResponse.json(updated);
}
