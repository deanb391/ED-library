import { NextRequest, NextResponse } from "next/server";
import {
  createReviewService,
  ReviewDraft,
} from "@/lib/services/review.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { draft } = body;

    // Validate required fields
    if (!draft ) {
      return NextResponse.json(
        { error: "Missing draft" },
        { status: 400 }
      );
    }

    if (
      !draft.user ||
      !draft.courses ||
      !draft.rating ||
      !draft.review 
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields in draft" },
        { status: 400 }
      );
    }

    const review = await createReviewService(draft as ReviewDraft);

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
