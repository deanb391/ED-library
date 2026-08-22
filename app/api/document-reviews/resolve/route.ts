import { NextResponse } from "next/server";
import { resolveDocumentReviewRequestService } from "@/lib/services/document-reviews.service";

export async function POST(req: Request) {
  try {
    const { requestId, status, adminReason, documentId } = await req.json();
    
    if (!requestId || !status || !adminReason || !documentId) {
       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reviewRequest = await resolveDocumentReviewRequestService(requestId, status, adminReason, documentId);
    return NextResponse.json({ success: true, reviewRequest });
  } catch (error: any) {
    console.error("Resolve document review request error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
