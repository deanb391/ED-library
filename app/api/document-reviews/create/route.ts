import { NextResponse } from "next/server";
import { createDocumentReviewRequestService } from "@/lib/services/document-reviews.service";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const reviewRequest = await createDocumentReviewRequestService(data);
    return NextResponse.json({ success: true, reviewRequest });
  } catch (error: any) {
    console.error("Create document review request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
