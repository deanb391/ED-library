import { NextRequest, NextResponse } from "next/server";
import {
  createContributorService,
  ContributorDraft,
} from "@/lib/services/contributors.service";
import { updateUserServer } from "@/lib/appwrite/server";

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

    const missingFields = [];
    if (!draft.username) missingFields.push("Display name");
    if (!draft.phone) missingFields.push("Phone");
    if (!draft.bio) missingFields.push("Bio");
    if (!Array.isArray(draft.category) || draft.category.length === 0) missingFields.push("Category");
    if (!draft.profileImage) missingFields.push("Profile Image");
    if (!Array.isArray(draft.reviewImages) || draft.reviewImages.some((img: string) => !img || img.trim() === "")) missingFields.push("Review Images");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields: " + missingFields.join(", ") },
        { status: 400 }
      );
    }

    const contributor = await createContributorService(draft as ContributorDraft, userId);

    // Update user document to mark as contributor
    await updateUserServer(userId, { isContributor: true });

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
