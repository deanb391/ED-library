import { NextRequest, NextResponse } from "next/server";
import {
  editContributorService,
  ContributorDraft,
} from "@/lib/services/contributors.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { contributorId, updates } = body;

    if (!contributorId || !updates) {
      return NextResponse.json(
        { error: "Missing contributorId or updates" },
        { status: 400 }
      );
    }

    const contributor = await editContributorService(
      contributorId,
      updates as Partial<ContributorDraft>
    );

    return NextResponse.json({ success: true, data: contributor });
  } catch (err) {
    console.error("EDIT CONTRIBUTOR ERROR:", err);
    return NextResponse.json(
      { error: "Failed to edit contributor" },
      { status: 500 }
    );
  }
}
