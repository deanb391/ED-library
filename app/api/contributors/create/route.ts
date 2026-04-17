import { NextRequest, NextResponse } from "next/server";
import {
  createContributorService,
  ContributorDraft,
} from "@/lib/services/contributors.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { draft, userId } = body;

    // Validate required fields
    if (!draft || !userId) {
      return NextResponse.json(
        { error: "Missing draft or userId" },
        { status: 400 }
      );
    }

    if (
      !draft.username ||
      !draft.institution ||
      !draft.country ||
      !draft.bio ||
      !Array.isArray(draft.category) ||
      !Array.isArray(draft.reviewImages) ||
      !draft.profileImage
    ) {
      return NextResponse.json(
        { error: "Invalid or missing required fields in draft" },
        { status: 400 }
      );
    }

    const contributor = await createContributorService(draft as ContributorDraft, userId);

    return NextResponse.json(
      { success: true, data: contributor },
      { status: 201 }
    );
  } catch (err) {
    console.error("CREATE CONTRIBUTOR ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create contributor" },
      { status: 500 }
    );
  }
}
