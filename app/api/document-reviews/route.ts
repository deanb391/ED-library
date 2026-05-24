import { NextResponse } from "next/server";
import { fetchDocumentReviewRequestsService } from "@/lib/services/document-reviews.service";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const reviewRequests = await fetchDocumentReviewRequestsService();
    return NextResponse.json({ success: true, reviewRequests });
  } catch (error: any) {
    console.error("Fetch document review requests error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
